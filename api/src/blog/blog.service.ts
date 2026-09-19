import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../common/prisma/prisma.service';

const TTL = 300_000;

@Injectable()
export class BlogService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  /**
   * Public visibility rule (no cron required): a post is visible when it is
   * PUBLISHED, OR it is SCHEDULED and its scheduledAt has already passed. This
   * guarantees a scheduled post appears the moment its time is reached, even if
   * the background promoter below hasn't run yet.
   */
  private publicWhere() {
    return {
      OR: [
        { status: 'PUBLISHED' as const },
        { status: 'SCHEDULED' as const, scheduledAt: { lte: new Date() } },
      ],
    };
  }

  /**
   * Best-effort promotion of due scheduled posts to PUBLISHED so the stored
   * status reflects reality (nice for the admin list and ordering). Correctness
   * never depends on this — publicWhere() already treats due posts as visible.
   */
  private async promoteScheduled(): Promise<number> {
    const now = new Date();
    const due = await this.prisma.blogPost.updateMany({
      where: { status: 'SCHEDULED', scheduledAt: { lte: now } },
      data: { status: 'PUBLISHED', publishedAt: now },
    });
    if (due.count > 0) await this.invalidateList();
    return due.count;
  }

  async findAll(page = 1, limit = 12) {
    await this.promoteScheduled();

    const key = `blog:list:${page}:${limit}`;
    try { const cached = await this.cache.get(key); if (cached) return cached; } catch {}

    const skip = (page - 1) * limit;
    const where = this.publicWhere();
    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true, slug: true, title: true, excerpt: true,
          coverImage: true, publishedAt: true, scheduledAt: true, tags: true,
        },
        orderBy: [{ publishedAt: 'desc' }, { scheduledAt: 'desc' }],
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    const result = { posts, total, page, pages: Math.ceil(total / limit) };
    try { await this.cache.set(key, result, TTL); } catch {}
    return result;
  }

  async findBySlug(slug: string) {
    await this.promoteScheduled();

    const key = `blog:slug:${slug}`;
    try { const cached = await this.cache.get(key); if (cached) return cached; } catch {}

    const post = await this.prisma.blogPost.findFirst({
      where: { slug, ...this.publicWhere() },
      include: { tags: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    try { await this.cache.set(key, post, TTL); } catch {}
    return post;
  }

  async findAllAdmin(page = 1, limit = 20) {
    await this.promoteScheduled();

    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        skip,
        take: limit,
        include: { tags: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blogPost.count(),
    ]);
    return { posts, total, page, pages: Math.ceil(total / limit) };
  }

  async create(data: any, authorId: string) {
    const { tags, ...rest } = data;
    const result = await this.prisma.blogPost.create({
      data: {
        ...rest,
        ...this.normalizeStatus(data),
        authorId,
        tags: this.buildTags(tags),
      },
      include: { tags: true },
    });
    await this.invalidateList();
    return result;
  }

  async update(id: string, data: any) {
    const { tags, ...rest } = data;
    const result = await this.prisma.blogPost.update({
      where: { id },
      data: {
        ...rest,
        ...this.normalizeStatus(data),
        tags: tags !== undefined
          ? { set: [], connectOrCreate: (this.buildTags(tags) as any)?.connectOrCreate }
          : undefined,
      },
      include: { tags: true },
    });
    await this.invalidateList();
    try { if (result.slug) await this.cache.del(`blog:slug:${result.slug}`); } catch {}
    return result;
  }

  async remove(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id }, select: { slug: true } });
    await this.prisma.blogPost.delete({ where: { id } });
    await this.invalidateList();
    try { if (post) await this.cache.del(`blog:slug:${post.slug}`); } catch {}
  }

  /**
   * Coerce the admin payload's scheduling fields into the correct shape:
   * - PUBLISHED  → set publishedAt (now if not provided), clear scheduledAt
   * - SCHEDULED  → keep scheduledAt (future), no publishedAt yet
   * - DRAFT/ARCHIVED → clear scheduledAt, leave publishedAt untouched
   */
  private normalizeStatus(data: any) {
    if (data.status === undefined) return {};
    const status = data.status;
    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;

    if (status === 'PUBLISHED') {
      return {
        status,
        scheduledAt: null,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
      };
    }
    if (status === 'SCHEDULED') {
      return { status, scheduledAt, publishedAt: null };
    }
    // DRAFT or ARCHIVED
    return { status, scheduledAt: null };
  }

  private buildTags(tags?: string[]) {
    if (!tags?.length) return undefined;
    return {
      connectOrCreate: tags.map((t) => ({
        where: { slug: t.toLowerCase().replace(/\s+/g, '-') },
        create: { name: t, slug: t.toLowerCase().replace(/\s+/g, '-') },
      })),
    };
  }

  private async invalidateList() {
    try {
      await Promise.all([
        this.cache.del('blog:list:1:12'),
        this.cache.del('blog:list:2:12'),
        this.cache.del('blog:list:1:20'),
      ]);
    } catch {}
  }
}
