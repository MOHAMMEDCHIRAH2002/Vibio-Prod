import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async getOverview() {
    const key = 'stats:overview';
    try { const cached = await this.cache.get(key); if (cached) return cached; } catch {}

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalOrders, prevOrders,
      totalCustomers, prevCustomers,
      revenueData, prevRevenueData,
    ] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo }, paymentStatus: 'PAID' } }),
      this.prisma.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, paymentStatus: 'PAID' } }),
      this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo }, paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
    ]);

    const revenue = Number(revenueData._sum.total) || 0;
    const prevRevenue = Number(prevRevenueData._sum.total) || 0;

    const result = {
      revenue: {
        current: revenue,
        previous: prevRevenue,
        change: prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0,
      },
      orders: {
        current: totalOrders,
        previous: prevOrders,
        change: prevOrders ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0,
      },
      customers: {
        current: totalCustomers,
        previous: prevCustomers,
        change: prevCustomers ? ((totalCustomers - prevCustomers) / prevCustomers) * 100 : 0,
      },
    };

    try { await this.cache.set(key, result, 60_000); } catch {}
    return result;
  }

  async getRevenue(period: '7d' | '30d' | '90d' = '30d') {
    const key = `stats:revenue:${period}`;
    try { const cached = await this.cache.get(key); if (cached) return cached; } catch {}

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const start = new Date();
    start.setDate(start.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: start }, paymentStatus: 'PAID' },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      grouped[d.toISOString().slice(0, 10)] = 0;
    }
    for (const order of orders) {
      const k = order.createdAt.toISOString().slice(0, 10);
      if (k in grouped) grouped[k] += Number(order.total);
    }

    const result = Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
    try { await this.cache.set(key, result, 60_000); } catch {}
    return result;
  }

  async getTopProducts() {
    const key = 'stats:top-products';
    try { const cached = await this.cache.get(key); if (cached) return cached; } catch {}

    const items = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { price: true, quantity: true },
      orderBy: { _sum: { price: 'desc' } },
      take: 10,
    });

    const products = await this.prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
      select: { id: true, name: true, images: true },
    });

    const result = items.map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId),
      revenue: Number(item._sum.price) || 0,
      unitsSold: item._sum.quantity || 0,
    }));

    try { await this.cache.set(key, result, 300_000); } catch {}
    return result;
  }

  async getOrdersByStatus() {
    const key = 'stats:orders-by-status';
    try { const cached = await this.cache.get(key); if (cached) return cached; } catch {}

    const rows = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const statusMap = Object.fromEntries(rows.map((r) => [r.status, r._count._all]));
    const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const result = statuses.map((status) => ({ status, count: statusMap[status] ?? 0 }));

    try { await this.cache.set(key, result, 60_000); } catch {}
    return result;
  }

  async invalidate() {
    try {
      await Promise.all([
        this.cache.del('stats:overview'),
        this.cache.del('stats:top-products'),
        this.cache.del('stats:orders-by-status'),
        this.cache.del('stats:revenue:7d'),
        this.cache.del('stats:revenue:30d'),
        this.cache.del('stats:revenue:90d'),
      ]);
    } catch {}
  }
}
