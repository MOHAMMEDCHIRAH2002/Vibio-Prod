import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
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
    const cacheKey = `products:${JSON.stringify({ ...query, admin: !!admin })}`;
    try { const cached = await this.cache.get(cacheKey); if (cached) return cached; } catch {}

    const where: any = { isActive: true };

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

    try { await this.cache.set(cacheKey, result, 60000); } catch {}
    return result;
  }

  async findFeatured() {
    const cacheKey = 'products:featured';
    try { const cached = await this.cache.get(cacheKey); if (cached) return cached; } catch {}

    const products = await this.prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: 8,
      include: {
        category: { select: { name: true, slug: true } },
        variants: { orderBy: { price: 'asc' } },
      },
    });

    try { await this.cache.set(cacheKey, products, 300000); } catch {}
    return products;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
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
    const cacheKey = `products:slug:${slug}`;
    try { const cached = await this.cache.get(cacheKey); if (cached) return cached; } catch {}

    const product = await this.prisma.product.findUnique({
      where: { slug },
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

    try { await this.cache.set(cacheKey, product, 60_000); } catch {}
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

    // Targeted cache invalidation to avoid wiping unrelated cached data.
    await Promise.all([
      this.cache.del('products:featured'),
      this.cache.del(`products:slug:${product.slug}`),
    ]).catch(() => {});
    return product;
  }

  async update(id: string, dto: Partial<CreateProductDto>) {
    const { variants, tags, ...data } = dto;

    const product = await this.prisma.product.update({
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
      include: { variants: true, category: true, tags: true },
    });

    // Invalidate featured list and the slug key for the updated product.
    try {
      const slug = (product as any).slug;
      await Promise.all([this.cache.del('products:featured'), this.cache.del(`products:slug:${slug}`)]);
    } catch {}
    return product;
  }

  async remove(id: string) {
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    try {
      const p = await this.prisma.product.findUnique({ where: { id }, select: { slug: true } });
      if (p?.slug) await this.cache.del(`products:slug:${p.slug}`);
      await this.cache.del('products:featured');
    } catch {}
  }

  async addImages(id: string, imageUrls: string[]) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const images = [...product.images, ...imageUrls];
    return this.prisma.product.update({ where: { id }, data: { images } });
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
