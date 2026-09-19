import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async findAll() {
    const cacheKey = 'categories:all';
    try { const cached = await this.cache.get(cacheKey); if (cached) return cached; } catch {}

    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: { _count: { select: { products: true } } },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    try { await this.cache.set(cacheKey, categories, 600000); } catch {}
    return categories;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        products: {
          where: { isActive: true },
          include: { variants: { take: 1, orderBy: { price: 'asc' }, select: { id: true, price: true, stock: true } } },
          take: 24,
        },
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: { slug: string; name: string; description?: string; image?: string; parentId?: string; sortOrder?: number }) {
    const category = await this.prisma.category.create({ data });
    try { await this.cache.del('categories:all'); } catch {}
    return category;
  }

  async update(id: string, data: Partial<{ slug: string; name: string; description: string; image: string; sortOrder: number }>) {
    const category = await this.prisma.category.update({ where: { id }, data });
    try { await this.cache.del('categories:all'); } catch {}
    return category;
  }

  async remove(id: string) {
    await this.prisma.category.delete({ where: { id } });
    try { await this.cache.del('categories:all'); } catch {}
  }
}
