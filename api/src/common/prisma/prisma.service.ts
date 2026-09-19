import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();

    // Prisma query timing middleware: logs queries exceeding threshold (ms)
    const slowMs = Number(process.env.PRISMA_SLOW_QUERY_MS || '120');
    this.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const duration = Date.now() - start;
      try {
        if (duration >= slowMs) {
          // eslint-disable-next-line no-console
          console.warn(
            `Prisma slow query (${duration}ms): ${params.model || 'Unknown'}.${params.action}`,
            { params },
          );
        }
      } catch {}
      return result;
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
