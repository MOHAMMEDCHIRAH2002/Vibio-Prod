import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  loyaltyConfig,
  pointsForAmount,
  valueForPoints,
  snapToStep,
} from './loyalty.config';

type Tx = Prisma.TransactionClient;

export interface RedeemQuote {
  /** Points that will actually be spent (snapped to a valid step, clamped). */
  points: number;
  /** MAD discount those points fund. */
  discount: number;
}

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  // ── Read ────────────────────────────────────────────────────────────────

  /** Balance + program rules + recent ledger, for the account area. */
  async getSummary(userId: string) {
    const [user, transactions] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { loyaltyPoints: true },
      }),
      this.prisma.loyaltyTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { order: { select: { orderNumber: true } } },
      }),
    ]);

    const points = user?.loyaltyPoints ?? 0;
    return {
      points,
      value: valueForPoints(points),
      config: {
        pointsPerMad: loyaltyConfig.pointsPerMad,
        redeemStep: loyaltyConfig.redeemStep,
        redeemStepValue: loyaltyConfig.redeemStepValue,
        minRedeem: loyaltyConfig.minRedeem,
      },
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        points: t.points,
        reason: t.reason,
        orderNumber: t.order?.orderNumber ?? null,
        createdAt: t.createdAt,
      })),
    };
  }

  // ── Redemption (checkout) ────────────────────────────────────────────────

  /**
   * Resolve how many points a customer may actually redeem against a given
   * eligible merchandise amount. Pure/deterministic; used both to preview and
   * to enforce at order creation. Never trusts the requested amount blindly:
   * clamps to the customer's balance, snaps to the step, and caps the discount
   * so it can never exceed the merchandise value.
   */
  quote(balance: number, requestedPoints: number, merchandise: number): RedeemQuote {
    if (!requestedPoints || requestedPoints <= 0) return { points: 0, discount: 0 };

    // Cannot redeem more than the customer owns.
    let points = snapToStep(Math.min(requestedPoints, balance));
    if (points <= 0) return { points: 0, discount: 0 };

    // Cap the discount at the merchandise value (points can't pay shipping and
    // can never push the total below zero), then re-snap points to that cap.
    const maxDiscount = Math.max(0, merchandise);
    let discount = valueForPoints(points);
    if (discount > maxDiscount) {
      const affordableSteps = Math.floor(maxDiscount / loyaltyConfig.redeemStepValue);
      points = affordableSteps * loyaltyConfig.redeemStep;
      discount = valueForPoints(points);
    }
    return { points, discount };
  }

  /**
   * Spend points inside an existing transaction (called from order creation).
   * The conditional decrement is the race guard: it only succeeds when the
   * balance still covers the redemption at commit time.
   */
  async redeemWithinTx(tx: Tx, userId: string, orderId: string, points: number) {
    if (points <= 0) return;
    const claim = await tx.user.updateMany({
      where: { id: userId, loyaltyPoints: { gte: points } },
      data: { loyaltyPoints: { decrement: points } },
    });
    if (claim.count !== 1) {
      throw new BadRequestException('You do not have enough loyalty points');
    }
    await tx.loyaltyTransaction.create({
      data: {
        userId,
        orderId,
        type: 'REDEEM',
        points: -points,
        reason: 'Redeemed at checkout',
      },
    });
  }

  // ── Earn / reverse (order lifecycle) ─────────────────────────────────────

  /**
   * Award points for an order that has become paid/delivered. Idempotent: a
   * second call for an order that already earned is a no-op (guarded by the
   * ledger). Never awards for canceled/refunded/failed orders.
   */
  async awardForOrder(orderId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) return;

      const eligible =
        (order.status === 'DELIVERED' || order.paymentStatus === 'PAID') &&
        order.status !== 'CANCELLED' &&
        order.status !== 'REFUNDED' &&
        order.paymentStatus !== 'REFUNDED' &&
        order.paymentStatus !== 'FAILED';
      if (!eligible) return;

      // Already earned? (idempotency)
      const existing = await tx.loyaltyTransaction.findFirst({
        where: { orderId, type: 'EARN' },
      });
      if (existing) return;

      // Earn on money actually paid toward products — excludes shipping and the
      // portion already covered by redeemed points.
      const base = Math.max(
        0,
        Number(order.subtotal) - Number(order.discount) - Number(order.loyaltyDiscount),
      );
      const earned = pointsForAmount(base);
      if (earned <= 0) return;

      await tx.user.update({
        where: { id: order.userId },
        data: { loyaltyPoints: { increment: earned } },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { pointsEarned: earned },
      });
      await tx.loyaltyTransaction.create({
        data: {
          userId: order.userId,
          orderId,
          type: 'EARN',
          points: earned,
          reason: `Earned on order ${order.orderNumber}`,
        },
      });
    });
  }

  /**
   * Reverse loyalty movements when an order is canceled or refunded:
   *   • claw back any points that were EARNED for it, and
   *   • refund any points the customer REDEEMED on it (the order didn't complete).
   * Both are idempotent — guarded so a repeated cancel/refund can't double-apply.
   */
  async reverseForOrder(orderId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) return;

      const txns = await tx.loyaltyTransaction.findMany({ where: { orderId } });
      const earned = txns
        .filter((t) => t.type === 'EARN')
        .reduce((s, t) => s + t.points, 0);
      const redeemed = txns
        .filter((t) => t.type === 'REDEEM')
        .reduce((s, t) => s + t.points, 0); // negative
      const alreadyReversed = txns
        .filter((t) => t.type === 'REVERSE')
        .reduce((s, t) => s + t.points, 0);

      // Net effect still on the balance from this order that we want to undo:
      //   claw back earned (subtract) + return redeemed (add back).
      const target = -earned - redeemed; // = -(earned) + |redeemed|
      const delta = target - alreadyReversed;
      if (delta === 0) return;

      await tx.user.update({
        where: { id: order.userId },
        data: { loyaltyPoints: { increment: delta } },
      });

      if (earned > 0) {
        await tx.order.update({ where: { id: orderId }, data: { pointsEarned: 0 } });
      }

      await tx.loyaltyTransaction.create({
        data: {
          userId: order.userId,
          orderId,
          type: 'REVERSE',
          points: delta,
          reason: `Reversed — order ${order.orderNumber} ${order.status.toLowerCase()}`,
        },
      });
    });
  }
}
