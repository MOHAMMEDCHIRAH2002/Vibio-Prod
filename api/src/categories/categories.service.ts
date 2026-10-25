import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

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
          include: {
            _count: {
              select: {
                products: { where: { isActive: true, deletedAt: null } },
              },
            },
          },
        },
        _count: {
          select: {
            products: { where: { isActive: true, deletedAt: null } },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    try { await this.cache.set(cacheKey, categories, 600000); } catch {}
    return categories;
  }

  async findBySlug(slug: string) {
    const include = {
      children: true,
      products: {
        where: { isActive: true, deletedAt: null },
        include: {
          variants: {
            take: 1,
            orderBy: { price: 'asc' as const },
            select: { id: true, price: true, stock: true },
          },
        },
        take: 24,
      },
      _count: {
        select: {
          products: { where: { isActive: true, deletedAt: null } },
        },
      },
    } as const;
    let category = await this.prisma.category.findUnique({
      where: { slug },
      include,
    });
    if (!category) {
      const alias = await this.prisma.categorySlugAlias.findUnique({
        where: { slug },
        select: { categoryId: true },
      });
      if (alias) {
        category = await this.prisma.category.findUnique({
          where: { id: alias.categoryId },
          include,
        });
      }
    }
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: { slug: string; name: string; description?: string; image?: string; parentId?: string | null; sortOrder?: number }) {
    const alias = await this.prisma.categorySlugAlias.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (alias) throw new ConflictException('This category slug is reserved by an older category URL');

    const category = await this.prisma.category.create({ data });
    await this.invalidateListCache();
    return category;
  }

  async update(id: string, data: Partial<{ slug: string; name: string; description: string; image: string; parentId: string | null; sortOrder: number }>) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!existing) throw new NotFoundException('Category not found');

    const category = await this.prisma.$transaction(async (tx) => {
      if (data.slug && data.slug !== existing.slug) {
        const alias = await tx.categorySlugAlias.findUnique({
          where: { slug: data.slug },
          select: { id: true, categoryId: true },
        });
        if (alias && alias.categoryId !== id) {
          throw new ConflictException('This category slug is reserved by another category URL');
        }
        if (alias) {
          await tx.categorySlugAlias.delete({ where: { id: alias.id } });
        }
        await tx.categorySlugAlias.upsert({
          where: { slug: existing.slug },
          update: { categoryId: id },
          create: { slug: existing.slug, categoryId: id },
        });
      }
      return tx.category.update({ where: { id }, data });
    });
    await this.invalidateListCache();
    return category;
  }

  async remove(id: string) {
    await this.prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id },
        select: {
          _count: {
            select: {
              products: { where: { deletedAt: null } },
              children: true,
            },
          },
        },
      });
      if (!category) throw new NotFoundException('Category not found');
      if (category._count.products || category._count.children) {
        throw new BadRequestException(
          'This category still contains products or subcategories. Reassign or remove them before deleting it.',
        );
      }

      await tx.category.delete({ where: { id } });
    });
    await this.invalidateListCache();
  }

  private async invalidateListCache() {
    try {
      await this.cache.del('categories:all');
    } catch (error) {
      this.logger.warn(
        `Category cache invalidation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
