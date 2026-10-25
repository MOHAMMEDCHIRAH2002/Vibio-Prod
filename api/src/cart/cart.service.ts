import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PrismaService } from '../common/prisma/prisma.service';

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  slug?: string;
  price: number;
  quantity: number;
  image?: string;
  stock: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total?: number;
}

@Injectable()
export class CartService {
  private redis: Redis;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const redisUrl: string = this.config.get('REDIS_URL') || 'redis://localhost:6379';
    this.redis = new Redis(redisUrl);
  }

  private getCartKey(id: string): string {
    return `cart:${id}`;
  }

  async getCart(sessionId: string): Promise<Cart> {
    const key = this.getCartKey(sessionId);
    const data = await this.redis.get(key);
    if (!data) return { items: [], subtotal: 0 };

    const cart: Cart = JSON.parse(data);
    if (!cart.items.length) return this.saveCart(sessionId, cart);

    const variants = await this.prisma.variant.findMany({
      where: { id: { in: cart.items.map((item) => item.variantId) } },
      include: {
        product: {
          select: { id: true, name: true, slug: true, images: true, isActive: true },
        },
      },
    });
    const currentVariants = new Map(variants.map((variant) => [variant.id, variant]));

    cart.items = cart.items.flatMap((item) => {
      const variant = currentVariants.get(item.variantId);
      if (!variant || !variant.product.isActive || variant.stock <= 0) return [];

      return [{
        ...item,
        productId: variant.productId,
        name: variant.product.name,
        variantName: `${variant.name}: ${variant.value}`,
        slug: variant.product.slug,
        price: Number(variant.price),
        quantity: Math.min(item.quantity, variant.stock),
        image: variant.product.images[0],
        stock: variant.stock,
      }];
    });

    return this.saveCart(sessionId, cart);
  }

  async addItem(sessionId: string, variantId: string, quantity = 1): Promise<Cart> {
    const variant = await this.prisma.variant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: { name: true, slug: true, images: true, isActive: true },
        },
      },
    });
    if (!variant || !variant.product.isActive) {
      throw new BadRequestException('Product not available');
    }
    if (variant.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const cart = await this.getCart(sessionId);
    const existingIdx = cart.items.findIndex((i) => i.variantId === variantId);

    if (existingIdx > -1) {
      const newQty = cart.items[existingIdx].quantity + quantity;
      if (newQty > variant.stock) {
        throw new BadRequestException('Insufficient stock');
      }
      cart.items[existingIdx].quantity = newQty;
    } else {
      cart.items.push({
        variantId,
        productId: variant.productId,
        name: variant.product.name,
        variantName: `${variant.name}: ${variant.value}`,
        slug: variant.product.slug,
        price: Number(variant.price),
        quantity,
        image: variant.product.images[0],
        stock: variant.stock,
      });
    }

    return this.saveCart(sessionId, cart);
  }

  async updateItem(sessionId: string, variantId: string, quantity: number): Promise<Cart> {
    if (quantity <= 0) return this.removeItem(sessionId, variantId);

    const variant = await this.prisma.variant.findUnique({ where: { id: variantId } });
    if (!variant) throw new BadRequestException('Variant not found');
    if (variant.stock < quantity) throw new BadRequestException('Insufficient stock');

    const cart = await this.getCart(sessionId);
    const idx = cart.items.findIndex((i) => i.variantId === variantId);
    if (idx > -1) cart.items[idx].quantity = quantity;

    return this.saveCart(sessionId, cart);
  }

  async removeItem(sessionId: string, variantId: string): Promise<Cart> {
    const cart = await this.getCart(sessionId);
    cart.items = cart.items.filter((i) => i.variantId !== variantId);
    return this.saveCart(sessionId, cart);
  }

  async clearCart(sessionId: string): Promise<void> {
    await this.redis.del(this.getCartKey(sessionId));
  }

  async mergeGuestCart(userId: string, guestSessionId: string): Promise<Cart> {
    if (!guestSessionId || guestSessionId === userId || guestSessionId === 'guest') {
      return this.getCart(userId);
    }

    const guestKey = this.getCartKey(guestSessionId);
    const guest = await this.getCart(guestSessionId);
    if (!guest.items.length) return this.getCart(userId);
    const user = await this.getCart(userId);

    for (const item of guest.items) {
      const existingIdx = user.items.findIndex((i) => i.variantId === item.variantId);
      if (existingIdx > -1) {
        const newQty = Math.min(
          user.items[existingIdx].quantity + item.quantity,
          item.stock,
        );
        user.items[existingIdx].quantity = newQty;
      } else {
        user.items.push(item);
      }
    }

    await this.redis.del(guestKey);
    return this.saveCart(userId, user);
  }

  private calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  private async saveCart(sessionId: string, cart: Cart): Promise<Cart> {
    cart.subtotal = this.calculateSubtotal(cart.items);
    cart.total = cart.subtotal;

    const key = this.getCartKey(sessionId);
    await this.redis.set(key, JSON.stringify(cart), 'EX', 86400 * 7);
    return cart;
  }
}
