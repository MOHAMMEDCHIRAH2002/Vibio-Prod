import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../common/prisma/prisma.service';

const TTL = 120_000;

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async findRecent(limit = 4) {
    const key = `reviews:recent:${limit}`;
    try { const cached = await this.cache.get(key); if (cached) return cached; } catch {}

    const result = await this.prisma.review.findMany({
      where: { isApproved: true, body: { not: null } },
      include: {
        user: { select: { name: true, image: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    try { await this.cache.set(key, result, TTL); } catch {}
    return result;
  }

  async findByProduct(productId: string) {
    const key = `reviews:product:${productId}`;
    try { const cached = await this.cache.get(key); if (cached) return cached; } catch {}

    const result = await this.prisma.review.findMany({
      where: { productId, isApproved: true },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
    });

    try { await this.cache.set(key, result, TTL); } catch {}
    return result;
  }

  async create(userId: string, productId: string, data: { rating: number; title?: string; body?: string }) {
    const result = await this.prisma.review.create({
      data: { ...data, userId, productId },
    });
    try { await Promise.all([
      this.cache.del(`reviews:product:${productId}`),
      this.cache.del('reviews:recent:4'),
    ]); } catch {}
    return result;
  }

  async findAllAdmin(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status === 'pending') where.isApproved = false;
    if (status === 'approved') where.isApproved = true;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);
    return { reviews, total, page, pages: Math.ceil(total / limit) };
  }

  async adminCreate(
    adminId: string,
    data: { productId: string; rating: number; title?: string; body?: string; reviewerName?: string },
  ) {
    const result = await (this.prisma.review as any).upsert({
      where: { userId_productId: { userId: adminId, productId: data.productId } },
      update: { rating: data.rating, title: data.title, body: data.body, reviewerName: data.reviewerName, isApproved: true },
      create: { ...data, userId: adminId, isApproved: true },
    });
    try { await Promise.all([
      this.cache.del(`reviews:product:${data.productId}`),
      this.cache.del('reviews:recent:4'),
    ]); } catch {}
    return result;
  }

  async moderate(id: string, action: 'approve' | 'reject') {
    let productId: string | undefined;

    if (action === 'approve') {
      const updated = await this.prisma.review.update({
        where: { id },
        data: { isApproved: true },
      });
      productId = updated.productId;
    } else {
      const deleted = await this.prisma.review.delete({ where: { id } });
      productId = deleted.productId;
    }

    if (productId) try { await Promise.all([
      this.cache.del(`reviews:product:${productId}`),
      this.cache.del('reviews:recent:4'),
    ]); } catch {}
  }

  async remove(id: string) {
    const deleted = await this.prisma.review.delete({ where: { id } });
    try { await Promise.all([
      this.cache.del(`reviews:product:${deleted.productId}`),
      this.cache.del('reviews:recent:4'),
    ]); } catch {}
  }
}
