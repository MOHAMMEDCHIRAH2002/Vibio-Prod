import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PromoService } from '../promo/promo.service';
import { LoyaltyService } from '../loyalty/loyalty.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private cart: CartService,
    private notifications: NotificationsService,
    private promo: PromoService,
    private loyalty: LoyaltyService,
    private config: ConfigService,
  ) {}

  async createFromCart(userId: string, sessionId: string, data: {
    shippingAddress: any;
    paymentMethod: string;
    notes?: string;
    promoCode?: string;
    redeemPoints?: number;
    idempotencyKey?: string;
  }) {
    // Idempotency: a retried request carrying the same key must not create a
    // second order (and therefore must not fire a second notification). Return
    // the already-created order instead.
    const idempotencyKey = data.idempotencyKey?.trim() || null;
    if (idempotencyKey) {
      const existing = await this.prisma.order.findUnique({
        where: { idempotencyKey },
        include: { items: true },
      });
      if (existing) return existing;
    }

    const cartData = await this.cart.getCart(sessionId);
    if (!cartData.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, phone: true, loyaltyPoints: true },
    });

    const subtotal = cartData.subtotal;
    let shippingCost = subtotal > 500 ? 0 : 50;
    let discount = 0;
    let promoCodeId: string | null = null;

    // Re-validate the promo server-side (never trust the client preview).
    if (data.promoCode && data.promoCode.trim()) {
      const promo = await this.promo.validate(data.promoCode, subtotal);
      const applied = this.promo.computeDiscount(promo, subtotal);
      discount = applied.discount;
      if (applied.freeShipping) shippingCost = 0;
      promoCodeId = promo.id;
    }

    // Re-quote loyalty redemption server-side. Only signed-in customers can
    // redeem (guests never reach here — the route requires auth). The quote is
    // clamped to the live balance and to the merchandise value after promo, so
    // points can never over-discount or push the total below zero.
    const merchandiseAfterPromo = Math.max(0, subtotal - discount);
    const redeem = this.loyalty.quote(
      user?.loyaltyPoints ?? 0,
      Number(data.redeemPoints) || 0,
      merchandiseAfterPromo,
    );
    const loyaltyDiscount = redeem.discount;
    const pointsRedeemed = redeem.points;

    // Clamp so the total can never be negative.
    const total = Math.max(0, subtotal - discount - loyaltyDiscount) + shippingCost;
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    let order;
    try {
      order = await this.prisma.$transaction(async (tx) => {
      // Atomically claim one use of the promo. The conditional guards against a
      // race where two orders push a limited code past its maxUses.
      if (promoCodeId) {
        const claim = await tx.promoCode.updateMany({
          where: {
            id: promoCodeId,
            isActive: true,
            OR: [{ maxUses: null }, { usedCount: { lt: tx.promoCode.fields.maxUses } }],
          },
          data: { usedCount: { increment: 1 } },
        });
        if (claim.count !== 1) {
          throw new BadRequestException('This promo code has reached its usage limit');
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: data.paymentMethod,
          shippingAddress: data.shippingAddress,
          subtotal,
          shippingCost,
          discount,
          loyaltyDiscount,
          pointsRedeemed,
          total,
          promoCodeId,
          idempotencyKey,
          notes: data.notes,
          items: {
            create: cartData.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.name,
              variantName: item.variantName,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of cartData.items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Spend the redeemed points inside the same transaction. The conditional
      // decrement guards against a concurrent order draining the balance.
      if (pointsRedeemed > 0) {
        await this.loyalty.redeemWithinTx(tx, userId, created.id, pointsRedeemed);
      }

        return created;
      });
    } catch (e) {
      // Concurrent retry with the same idempotency key lost the race — the whole
      // transaction rolled back (no stock/promo/points side effects). Return the
      // order the winning request created.
      if (idempotencyKey && (e as any)?.code === 'P2002') {
        const existing = await this.prisma.order.findUnique({
          where: { idempotencyKey },
          include: { items: true },
        });
        if (existing) return existing;
      }
      throw e;
    }

    await this.cart.clearCart(sessionId);

    if (user) {
      await this.notifications.sendOrderConfirmation(user.email, {
        orderNumber,
        name: user.name || 'Customer',
        total,
        itemCount: cartData.items.length,
        items: cartData.items,
        shippingAddress: data.shippingAddress,
      });
      if (user.phone) {
        await this.notifications.sendWhatsAppOrderConfirmation(user.phone, {
          name: user.name || 'Customer',
          orderNumber,
          total,
          itemCount: cartData.items.length,
        });
      }
    }

    // Notify the store owner about the new order (email + WhatsApp). Behavior is
    // configurable via ADMIN_ORDER_NOTIFY_ON: 'created' (default) notifies now;
    // 'paid' defers online-payment orders until payment settles (COD still fires
    // now since there is no payment step). Never blocks or breaks order creation.
    const notifyOn = (this.config.get<string>('ADMIN_ORDER_NOTIFY_ON') || 'created').toLowerCase();
    const isOnlinePayment = (data.paymentMethod || 'cod').toLowerCase() !== 'cod';
    const deferForPayment = notifyOn === 'paid' && isOnlinePayment;
    if (!deferForPayment) {
      await this.notifyAdminOnce(order.id, isOnlinePayment);
    }

    return order;
  }

  /**
   * Dispatch the store-owner "new order" notification exactly once per order.
   * The atomic flag-claim (`adminNotifiedAt: null → now`) guarantees at-most-once
   * delivery even if this is called again (retries, status changes). Failures are
   * logged and swallowed so they can never affect the order lifecycle.
   */
  private async notifyAdminOnce(orderId: string, pendingPayment = false) {
    try {
      const claim = await this.prisma.order.updateMany({
        where: { id: orderId, adminNotifiedAt: null },
        data: { adminNotifiedAt: new Date() },
      });
      if (claim.count !== 1) {
        this.logger.log(`Admin notification already sent for order ${orderId} — skipping duplicate`);
        return;
      }

      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          user: { select: { name: true, email: true, phone: true } },
        },
      });
      if (!order) return;

      const addr: any = order.shippingAddress || {};
      await this.notifications.sendAdminNewOrder({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || addr.fullName || 'Customer',
        customerEmail: order.user?.email || '',
        customerPhone: order.user?.phone || addr.phone || '',
        shippingAddress: order.shippingAddress,
        items: order.items.map((i) => ({
          name: i.name,
          variantName: i.variantName,
          quantity: i.quantity,
          price: Number(i.price),
        })),
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        discount: Number(order.discount),
        loyaltyDiscount: Number(order.loyaltyDiscount),
        total: Number(order.total),
        paymentMethod: order.paymentMethod || 'cod',
        status: order.status,
        paymentStatus: order.paymentStatus,
        pendingPayment,
      });
    } catch (e: any) {
      this.logger.error(`Admin notification error for order ${orderId}: ${e?.message || e}`);
    }
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        include: { items: { include: { product: { select: { slug: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        items: {
          include: { product: { select: { name: true, slug: true, images: true } } },
        },
        user: { select: { name: true, email: true, phone: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findAll(page = 1, limit = 20, status?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          items: true,
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, status: string, trackingNumber?: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: status as any,
        trackingNumber,
        paymentStatus:
          status === 'DELIVERED' ? 'PAID' : status === 'REFUNDED' ? 'REFUNDED' : undefined,
      },
      include: { user: { select: { email: true, name: true, phone: true } } },
    });

    // Loyalty side effects (idempotent, self-guarding):
    //  • paid/delivered → award points for the order
    //  • canceled/refunded → claw back earned points & refund redeemed points
    if (status === 'DELIVERED' || status === 'PAID') {
      await this.loyalty.awardForOrder(id);
      // Covers ADMIN_ORDER_NOTIFY_ON='paid': an online order deferred at creation
      // gets its store-owner notification now that payment has settled. Idempotent,
      // so COD orders already notified at creation are not notified again.
      await this.notifyAdminOnce(id, false);
    } else if (status === 'CANCELLED' || status === 'REFUNDED') {
      await this.loyalty.reverseForOrder(id);
    }

    if (status === 'SHIPPED' && order.user) {
      await this.notifications.sendShippingUpdate(order.user.email, {
        orderNumber: order.orderNumber,
        name: order.user.name || 'Customer',
        trackingNumber: trackingNumber || '',
        items: [],
      });
    }

    return order;
  }
}
