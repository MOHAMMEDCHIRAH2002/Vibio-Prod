import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../common/prisma/prisma.service';

const ACTIVE_KEY = 'banners:active';
const ALL_KEY = 'banners:all';
const TTL = 300_000;

@Injectable()
export class BannersService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async findActive() {
    try {
      const cached = await this.cache.get(ACTIVE_KEY);
      if (cached) return cached;
    } catch {}

    const now = new Date();
    const result = await this.prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: { sortOrder: 'asc' },
    });

    try { await this.cache.set(ACTIVE_KEY, result, TTL); } catch {}
    return result;
  }

  async findAll() {
    try {
      const cached = await this.cache.get(ALL_KEY);
      if (cached) return cached;
    } catch {}

    const result = await this.prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
    try { await this.cache.set(ALL_KEY, result, TTL); } catch {}
    return result;
  }

  async create(data: any) {
    const result = await this.prisma.banner.create({ data });
    await this.invalidate();
    return result;
  }

  async update(id: string, data: any) {
    const result = await this.prisma.banner.update({ where: { id }, data });
    await this.invalidate();
    return result;
  }

  async remove(id: string) {
    await this.prisma.banner.delete({ where: { id } });
    await this.invalidate();
  }

  async reorder(ids: string[]) {
    await Promise.all(
      ids.map((id, index) =>
        this.prisma.banner.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );
    await this.invalidate();
  }

  private async invalidate() {
    try {
      await Promise.all([this.cache.del(ACTIVE_KEY), this.cache.del(ALL_KEY)]);
    } catch {}
  }
}
