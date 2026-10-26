import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProductDto, CreateVariantDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sort?: string;
    admin?: boolean;
  }) {
    const { page = 1, limit = 12, category, search, minPrice, maxPrice, inStock, sort = 'newest', admin = false } = query as any;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = admin
      ? { deletedAt: null }
      : { isActive: true, deletedAt: null };

    if (category) {
      where.category = { slug: category };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }
    if (inStock) {
      where.variants = { some: { stock: { gt: 0 } } };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDesc: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.getSortOrder(sort);

    // For storefront callers (admin=false) return a lightweight payload: one cheapest variant only.
    const listQuery = admin
      ? {
          where,
          skip,
          take: +limit,
          include: {
            category: { select: { name: true, slug: true } },
            variants: { orderBy: { price: 'asc' } },
            tags: { select: { name: true, slug: true } },
            _count: { select: { reviews: true } },
          },
          orderBy,
        }
      : {
          where,
          skip,
          take: +limit,
          include: {
            category: { select: { name: true, slug: true } },
            variants: { take: 1, orderBy: { price: 'asc' }, select: { id: true, price: true, stock: true } },
            tags: { select: { name: true, slug: true } },
            _count: { select: { reviews: true } },
          },
          orderBy,
        };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany(listQuery as any),
      this.prisma.product.count({ where }),
    ]);

    const result = {
      products,
      total,
      page: +page,
      limit: +limit,
      pages: Math.ceil(total / +limit),
    };

    return result;
  }

  async findFeatured() {
    return this.prisma.product.findMany({
      where: { isFeatured: true, isActive: true, deletedAt: null },
      take: 8,
      include: {
        category: { select: { name: true, slug: true } },
        variants: { orderBy: { price: 'asc' } },
      },
    });
  }

  async findById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
        tags: true,
        _count: { select: { reviews: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true, deletedAt: null },
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
        tags: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async create(dto: CreateProductDto) {
    const { variants, tags, ...data } = dto;

    const product = await this.prisma.product.create({
      data: {
        ...data,
        basePrice: data.basePrice,
        comparePrice: data.comparePrice,
        tags: tags?.length
          ? {
              connectOrCreate: tags.map((t) => ({
                where: { slug: t.toLowerCase().replace(/\s+/g, '-') },
                create: { name: t, slug: t.toLowerCase().replace(/\s+/g, '-') },
              })),
            }
          : undefined,
        variants: variants?.length
          ? { create: variants }
          : undefined,
      },
      include: { variants: true, category: true, tags: true },
    });

    await this.invalidateProductCaches(product.slug);
    return product;
  }

  async update(id: string, dto: Partial<CreateProductDto>) {
    const { variants, tags, ...data } = dto;
    const existing = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: { slug: true },
    });
    if (!existing) throw new NotFoundException('Product not found');

    if (variants !== undefined) {
      if (!variants.length) {
        throw new BadRequestException('A product must have at least one variant');
      }
      data.basePrice = Math.min(...variants.map((variant) => variant.price));
    }

    const product = await this.prisma.$transaction(async (tx) => {
      if (variants !== undefined) {
        await this.syncVariants(tx, id, variants);
      }

      return tx.product.update({
        where: { id },
        data: {
          ...data,
          tags: tags
            ? {
                set: [],
                connectOrCreate: tags.map((t) => ({
                  where: { slug: t.toLowerCase().replace(/\s+/g, '-') },
                  create: { name: t, slug: t.toLowerCase().replace(/\s+/g, '-') },
                })),
              }
            : undefined,
        },
        include: { variants: { orderBy: { price: 'asc' } }, category: true, tags: true },
      });
    });

    await this.invalidateProductCaches(existing.slug, product.slug);
    return product;
  }

  async remove(id: string) {
    const product = await this.prisma.$transaction(async (tx) => {
      const deleted = await tx.product.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
        select: { id: true, slug: true, deletedAt: true },
      });
      await tx.wishlist.deleteMany({ where: { productId: id } });
      return deleted;
    });
    await this.invalidateProductCaches(product.slug);
    return product;
  }

  async addImages(id: string, imageUrls: string[]) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    const images = [...product.images, ...imageUrls];
    const updated = await this.prisma.product.update({
      where: { id },
      data: { images },
      select: { slug: true },
    });
    await this.invalidateProductCaches(updated.slug);
    return this.findById(id);
  }

  private async syncVariants(
    tx: Prisma.TransactionClient,
    productId: string,
    variants: CreateVariantDto[],
  ) {
    const current = await tx.variant.findMany({
      where: { productId },
      select: { id: true },
    });
    const currentIds = new Set(current.map((variant) => variant.id));
    const submittedIds = variants.flatMap((variant) => (variant.id ? [variant.id] : []));

    if (
      new Set(submittedIds).size !== submittedIds.length ||
      submittedIds.some((variantId) => !currentIds.has(variantId))
    ) {
      throw new BadRequestException('One or more variants do not belong to this product');
    }

    const retainedIds = new Set(submittedIds);
    const removedIds = current
      .map((variant) => variant.id)
      .filter((variantId) => !retainedIds.has(variantId));

    if (removedIds.length) {
      await tx.orderItem.updateMany({
        where: { variantId: { in: removedIds } },
        data: { variantId: null },
      });
    }

    await tx.variant.deleteMany({
      where: {
        productId,
        ...(retainedIds.size ? { id: { notIn: [...retainedIds] } } : {}),
      },
    });

    for (const variant of variants) {
      const { id: variantId, ...fields } = variant;
      const variantData = { ...fields, sku: fields.sku || null };

      if (variantId) {
        await tx.variant.update({ where: { id: variantId }, data: variantData });
      } else {
        await tx.variant.create({ data: { ...variantData, productId } });
      }
    }
  }

  private async invalidateProductCaches(...slugs: string[]) {
    try {
      await Promise.all([
        this.cache.del('categories:all'),
        ...[...new Set(slugs.filter(Boolean))].map((slug) =>
          this.cache.del(`products:slug:${slug}`),
        ),
      ]);
    } catch (error) {
      this.logger.warn(
        `Product cache invalidation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private getSortOrder(sort: string) {
    switch (sort) {
      case 'price-asc': return { basePrice: 'asc' as const };
      case 'price-desc': return { basePrice: 'desc' as const };
      case 'name': return { name: 'asc' as const };
      case 'oldest': return { createdAt: 'asc' as const };
      default: return { createdAt: 'desc' as const };
    }
  }
}
