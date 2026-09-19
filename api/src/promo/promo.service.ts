import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { PromoCode } from '@prisma/client';

export interface PromoDiscount {
  discount: number; // amount subtracted from the subtotal (never negative, never > subtotal)
  freeShipping: boolean; // true for FREE_SHIPPING codes → shipping is waived
}

export interface PromoPreview extends PromoDiscount {
  code: string;
  type: PromoCode['type'];
  value: number;
  message: string;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.promoCode.findMany({ orderBy: { code: 'asc' } });
  }

  /**
   * Validate a promo code against a subtotal. Throws BadRequestException with a
   * user-facing message when the code cannot be applied. Returns the promo row.
   * This is the single source of truth used by BOTH the public validate
   * endpoint and order creation, so the rules can never diverge.
   */
  async validate(code: string, subtotal: number): Promise<PromoCode> {
    const trimmed = (code || '').trim();
    if (!trimmed) throw new BadRequestException('Enter a promo code');

    const promo = await this.prisma.promoCode.findFirst({
      where: { code: { equals: trimmed, mode: 'insensitive' } },
    });
    if (!promo) throw new BadRequestException('This promo code is not valid');
    if (!promo.isActive) throw new BadRequestException('This promo code is no longer active');

    const now = new Date();
    if (promo.startsAt && promo.startsAt > now) {
      throw new BadRequestException('This promo code is not active yet');
    }
    if (promo.expiresAt && promo.expiresAt < now) {
      throw new BadRequestException('This promo code has expired');
    }
    if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('This promo code has reached its usage limit');
    }
    if (promo.minOrder != null && subtotal < Number(promo.minOrder)) {
      throw new BadRequestException(
        `Add ${Number(promo.minOrder)} MAD worth of items to use this code`,
      );
    }
    return promo;
  }

  /**
   * Compute the discount for an already-validated promo against a subtotal.
   * Discount is clamped so it can never exceed the subtotal (order total stays >= 0).
   */
  computeDiscount(promo: PromoCode, subtotal: number): PromoDiscount {
    if (promo.type === 'FREE_SHIPPING') {
      return { discount: 0, freeShipping: true };
    }

    let discount = 0;
    if (promo.type === 'PERCENTAGE') {
      discount = subtotal * (Number(promo.value) / 100);
      if (promo.maxDiscount != null) {
        discount = Math.min(discount, Number(promo.maxDiscount));
      }
    } else if (promo.type === 'FIXED') {
      discount = Number(promo.value);
    }

    discount = Math.min(discount, subtotal); // never below zero total
    return { discount: round2(Math.max(0, discount)), freeShipping: false };
  }

  /** Public preview used by the checkout page. */
  async preview(code: string, subtotal: number): Promise<PromoPreview> {
    const promo = await this.validate(code, subtotal);
    const { discount, freeShipping } = this.computeDiscount(promo, subtotal);
    const message = freeShipping
      ? 'Free shipping applied'
      : `${discount} MAD discount applied`;
    return {
      code: promo.code,
      type: promo.type,
      value: Number(promo.value),
      discount,
      freeShipping,
      message,
    };
  }

  create(data: any) {
    return this.prisma.promoCode.create({ data: this.normalize(data) });
  }

  update(id: string, data: any) {
    return this.prisma.promoCode.update({ where: { id }, data: this.normalize(data) });
  }

  async remove(id: string) {
    await this.prisma.promoCode.delete({ where: { id } });
  }

  /** Coerce admin form payloads into the correct types for Prisma. */
  private normalize(data: any) {
    const out: any = {};
    if (data.code !== undefined) out.code = String(data.code).trim().toUpperCase();
    if (data.type !== undefined) out.type = data.type;
    if (data.value !== undefined) out.value = Number(data.value);
    if (data.minOrder !== undefined) out.minOrder = data.minOrder === '' || data.minOrder === null ? null : Number(data.minOrder);
    if (data.maxDiscount !== undefined) out.maxDiscount = data.maxDiscount === '' || data.maxDiscount === null ? null : Number(data.maxDiscount);
    if (data.maxUses !== undefined) out.maxUses = data.maxUses === '' || data.maxUses === null ? null : Number(data.maxUses);
    if (data.startsAt !== undefined) out.startsAt = data.startsAt ? new Date(data.startsAt) : null;
    if (data.expiresAt !== undefined) out.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    if (data.isActive !== undefined) out.isActive = Boolean(data.isActive);
    return out;
  }
}
