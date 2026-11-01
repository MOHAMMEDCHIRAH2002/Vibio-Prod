import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PromoService } from '../promo/promo.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { StatsService } from '../stats/stats.service';
import { OrderStatus, Prisma } from '@prisma/client';
import { AdminOrderDto } from './dto/admin-order.dto';
import { pointsForAmount } from '../loyalty/loyalty.config';

type ResolvedAdminOrderItem = {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  image?: string;
};

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
    private stats: StatsService,
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
      const currentVariants = await tx.variant.findMany({
        where: { id: { in: cartData.items.map((item) => item.variantId) } },
        include: {
          product: {
            select: {
              name: true,
              name_ar: true,
              images: true,
              isActive: true,
            },
          },
        },
      });
      const variantsById = new Map(currentVariants.map((variant) => [variant.id, variant]));
      const orderItems = cartData.items.map((item) => {
        const variant = variantsById.get(item.variantId);
        if (!variant || !variant.product.isActive) {
          throw new BadRequestException('A cart item is no longer available');
        }
        if (Number(variant.price) !== item.price) {
          throw new BadRequestException('A product price changed. Please review your cart.');
        }
        if (variant.stock < item.quantity) {
          throw new BadRequestException('A cart item no longer has enough stock');
        }
        return {
          productId: variant.productId,
          variantId: variant.id,
          name: variant.product.name,
          name_ar: variant.product.name_ar,
          variantName: `${variant.name}: ${variant.value}`,
          variantName_ar: `${variant.name_ar || variant.name}: ${variant.value_ar || variant.value}`,
          price: Number(variant.price),
          quantity: item.quantity,
          image: variant.product.images[0],
        };
      });

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
            create: orderItems,
          },
        },
        include: { items: true },
      });

      for (const item of orderItems) {
        const stockClaim = await tx.variant.updateMany({
          where: {
            id: item.variantId,
            price: item.price,
            stock: { gte: item.quantity },
            product: { is: { isActive: true } },
          },
          data: { stock: { decrement: item.quantity } },
        });
        if (stockClaim.count !== 1) {
          throw new BadRequestException('A cart item changed. Please review your cart.');
        }
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

    await this.stats.invalidate();
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
          include: { product: { select: { name: true, name_ar: true, slug: true, images: true } } },
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

  async createAdminOrder(data: AdminOrderDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: data.userId, role: 'CUSTOMER' },
      select: { id: true, email: true, name: true, phone: true },
    });
    if (!user) throw new NotFoundException('Customer not found');

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const createdOrderId = await this.prisma.$transaction(async (tx) => {
      const items = await this.resolveAdminOrderItems(tx, data.items);
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shippingCost = subtotal > 500 ? 0 : 50;

      await this.claimAdminOrderStock(tx, items);
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: 'cod',
          shippingAddress: { ...data.shippingAddress },
          subtotal,
          shippingCost,
          discount: 0,
          loyaltyDiscount: 0,
          total: subtotal + shippingCost,
          notes: data.notes,
          items: { create: items },
        },
      });
      return created.id;
    });

    const order = await this.prisma.order.findUnique({
      where: { id: createdOrderId },
      include: { items: true, user: { select: { name: true, email: true, phone: true } } },
    });
    if (!order) throw new NotFoundException('Created order not found');

    await this.stats.invalidate();
    try {
      await this.notifications.sendOrderConfirmation(user.email, {
        orderNumber,
        name: user.name || 'Customer',
        total: Number(order.total),
        itemCount: order.items.length,
        items: order.items,
        shippingAddress: order.shippingAddress,
      });
    } catch (error: any) {
      this.logger.error(`Admin-created order email failed for ${orderNumber}: ${error?.name || 'UnknownError'}`);
    }
    await this.notifyAdminOnce(order.id);
    return order;
  }

  async updateAdminOrder(id: string, data: AdminOrderDto) {
    const order = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!existing) throw new NotFoundException('Order not found');

      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: { id: true, role: true },
      });
      if (!user || (user.role === 'ADMIN' && user.id !== existing.userId)) {
        throw new NotFoundException('Customer not found');
      }

      const items = await this.resolveAdminOrderItems(tx, data.items, existing.items);
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shippingCost = subtotal > 500 ? 0 : 50;
      const previousQuantities = this.sumOrderItemQuantities(existing.items);
      const nextQuantities = this.sumOrderItemQuantities(items);

      await this.applyAdminOrderStockDelta(tx, previousQuantities, nextQuantities);

      const loyaltyEligible =
        (existing.status === 'DELIVERED' || existing.paymentStatus === 'PAID') &&
        existing.status !== 'CANCELLED' &&
        existing.status !== 'REFUNDED' &&
        existing.paymentStatus !== 'REFUNDED' &&
        existing.paymentStatus !== 'FAILED';
      if (loyaltyEligible) {
        const [earnedEntries, oldCustomer] = await Promise.all([
          tx.loyaltyTransaction.findMany({
            where: { orderId: id, type: 'EARN' },
            select: { points: true },
          }),
          tx.user.findUnique({
            where: { id: existing.userId },
            select: { loyaltyPoints: true },
          }),
        ]);
        const previousEarned = earnedEntries.reduce((sum, entry) => sum + entry.points, 0);
        const eligibleSubtotal = Math.max(
          0,
          subtotal - Number(existing.discount) - Number(existing.loyaltyDiscount),
        );
        const adjustedEarned = pointsForAmount(eligibleSubtotal);
        const earnDelta = adjustedEarned - previousEarned;
        if (earnDelta < 0 && (!oldCustomer || oldCustomer.loyaltyPoints < -earnDelta)) {
          throw new BadRequestException('The order total cannot be reduced because the earned loyalty points have already been spent');
        }
        if (earnDelta !== 0) {
          await tx.user.update({
            where: { id: existing.userId },
            data: { loyaltyPoints: { increment: earnDelta } },
          });
          await tx.loyaltyTransaction.create({
            data: {
              userId: existing.userId,
              orderId: id,
              type: earnDelta > 0 ? 'EARN' : 'REVERSE',
              points: earnDelta,
              reason: `Admin adjustment for order ${existing.orderNumber}`,
            },
          });
          await tx.order.update({ where: { id }, data: { pointsEarned: adjustedEarned } });
        }
      }

      if (existing.userId !== user.id) {
        const loyaltyEntries = await tx.loyaltyTransaction.findMany({
          where: { orderId: id },
          select: { id: true, userId: true, points: true },
        });
        const pointsTransfer = loyaltyEntries.reduce((sum, entry) => sum + entry.points, 0);
        if (pointsTransfer !== 0) {
          const [oldCustomer, newCustomer] = await Promise.all([
            tx.user.findUnique({ where: { id: existing.userId }, select: { loyaltyPoints: true } }),
            tx.user.findUnique({ where: { id: user.id }, select: { loyaltyPoints: true } }),
          ]);
          if (
            !oldCustomer ||
            !newCustomer ||
            oldCustomer.loyaltyPoints - pointsTransfer < 0 ||
            newCustomer.loyaltyPoints + pointsTransfer < 0
          ) {
            throw new BadRequestException('Customer cannot be changed because the loyalty balance cannot be transferred safely');
          }
          await tx.user.update({
            where: { id: existing.userId },
            data: { loyaltyPoints: { decrement: pointsTransfer } },
          });
          await tx.user.update({
            where: { id: user.id },
            data: { loyaltyPoints: { increment: pointsTransfer } },
          });
        }
        await tx.loyaltyTransaction.updateMany({
          where: { orderId: id },
          data: { userId: user.id },
        });
      }

      await tx.orderItem.deleteMany({ where: { orderId: id } });
      return tx.order.update({
        where: { id },
        data: {
          userId: user.id,
          shippingAddress: { ...data.shippingAddress },
          notes: data.notes,
          subtotal,
          shippingCost,
          total: Math.max(0, subtotal - Number(existing.discount) - Number(existing.loyaltyDiscount)) + shippingCost,
          items: { create: items },
        },
        include: {
          items: true,
          user: { select: { name: true, email: true, phone: true } },
        },
      });
    });

    await this.stats.invalidate();
    return order;
  }

  private async resolveAdminOrderItems(
    tx: Prisma.TransactionClient,
    requestedItems: AdminOrderDto['items'],
    existingItems: Array<{
      id: string;
      variantId: string | null;
      quantity: number;
      productId: string;
      name: string;
      variantName: string | null;
      price: Prisma.Decimal;
      image: string | null;
    }> = [],
  ): Promise<ResolvedAdminOrderItem[]> {
    const quantities = new Map<string, number>();
    const legacyItems = new Map(
      existingItems.map((item) => [item.id, item]),
    );
    for (const item of requestedItems) {
      if ((!item.variantId && !item.itemId) || !Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new BadRequestException('Each order item must have a variant and a positive quantity');
      }
      if (item.itemId && !item.variantId) {
        const legacyItem = legacyItems.get(item.itemId);
        if (!legacyItem || legacyItem.variantId) {
          throw new BadRequestException('The selected order item is no longer available');
        }
        continue;
      }
      quantities.set(item.variantId!, (quantities.get(item.variantId!) || 0) + item.quantity);
    }

    const variants = await tx.variant.findMany({
      where: { id: { in: [...quantities.keys()] } },
      include: {
        product: {
          select: { id: true, name: true, images: true, isActive: true, deletedAt: true },
        },
      },
    });
    if (variants.length !== quantities.size) {
      throw new BadRequestException('One or more selected variants no longer exist');
    }

    const oldQuantities = this.sumOrderItemQuantities(existingItems);
    const oldItemsByVariant = new Map(
      existingItems.filter((item) => item.variantId).map((item) => [item.variantId!, item]),
    );
    const resolvedItems = variants.map((variant) => {
      const quantity = quantities.get(variant.id)!;
      const unchanged = oldQuantities.get(variant.id) === quantity;
      if ((!variant.product.isActive || variant.product.deletedAt) && !unchanged) {
        throw new BadRequestException('Selected products must be active to add or change their quantity');
      }
      const existingItem = unchanged ? oldItemsByVariant.get(variant.id) : undefined;
      return {
        productId: existingItem?.productId || variant.productId,
        variantId: variant.id,
        name: existingItem?.name || variant.product.name,
        variantName: existingItem?.variantName || `${variant.name}: ${variant.value}`,
        price: existingItem ? Number(existingItem.price) : Number(variant.price),
        quantity,
        image: existingItem?.image || variant.product.images[0],
      };
    });

    for (const item of requestedItems) {
      if (!item.itemId || item.variantId) continue;
      const legacyItem = legacyItems.get(item.itemId);
      if (!legacyItem) continue;
      resolvedItems.push({
        productId: legacyItem.productId,
        variantId: legacyItem.variantId || '',
        name: legacyItem.name,
        variantName: legacyItem.variantName || '',
        price: Number(legacyItem.price),
        quantity: item.quantity,
        image: legacyItem.image || undefined,
      });
    }

    return resolvedItems;
  }

  private sumOrderItemQuantities(
    items: Array<{ variantId?: string | null; quantity: number }>,
  ) {
    const quantities = new Map<string, number>();
    for (const item of items) {
      if (item.variantId) {
        quantities.set(item.variantId, (quantities.get(item.variantId) || 0) + item.quantity);
      }
    }
    return quantities;
  }

  private async claimAdminOrderStock(
    tx: Prisma.TransactionClient,
    items: ResolvedAdminOrderItem[],
  ) {
    for (const item of items) {
      const claim = await tx.variant.updateMany({
        where: {
          id: item.variantId,
          price: item.price,
          stock: { gte: item.quantity },
          product: { is: { isActive: true, deletedAt: null } },
        },
        data: { stock: { decrement: item.quantity } },
      });
      if (claim.count !== 1) {
        throw new BadRequestException('A selected item is unavailable or does not have enough stock');
      }
    }
  }

  private async applyAdminOrderStockDelta(
    tx: Prisma.TransactionClient,
    previous: Map<string, number>,
    next: Map<string, number>,
  ) {
    const variantIds = new Set([...previous.keys(), ...next.keys()]);
    for (const variantId of variantIds) {
      const delta = (next.get(variantId) || 0) - (previous.get(variantId) || 0);
      if (delta > 0) {
        const variant = await tx.variant.findUnique({ where: { id: variantId }, select: { price: true } });
        if (!variant) throw new BadRequestException('An order variant no longer exists');
        const claim = await tx.variant.updateMany({
          where: {
            id: variantId,
            price: variant.price,
            stock: { gte: delta },
            product: { is: { isActive: true, deletedAt: null } },
          },
          data: { stock: { decrement: delta } },
        });
        if (claim.count !== 1) {
          throw new BadRequestException('Not enough stock to increase this order quantity');
        }
      } else if (delta < 0) {
        const released = await tx.variant.updateMany({
          where: { id: variantId },
          data: { stock: { increment: -delta } },
        });
        if (released.count !== 1) {
          throw new BadRequestException('Unable to release stock for a removed order item');
        }
      }
    }
  }

  async updateStatus(id: string, status: OrderStatus, trackingNumber?: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status,
        trackingNumber,
        paymentStatus:
          status === 'DELIVERED' ? 'PAID' : status === 'REFUNDED' ? 'REFUNDED' : undefined,
      },
      include: { user: { select: { email: true, name: true, phone: true } } },
    });
    await this.stats.invalidate();

    // Loyalty side effects (idempotent, self-guarding):
    //  • paid/delivered → award points for the order
    //  • canceled/refunded → claw back earned points & refund redeemed points
    if (status === 'DELIVERED') {
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
