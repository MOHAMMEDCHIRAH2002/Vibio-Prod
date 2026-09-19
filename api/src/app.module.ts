import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ReviewsModule } from './reviews/reviews.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { SubmissionsModule } from './submissions/submissions.module';

import { BannersModule } from './banners/banners.module';
import { BlogModule } from './blog/blog.module';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StatsModule } from './stats/stats.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        const store = new KeyvRedis(redisUrl);
        // Prevent unhandled 'error' event from crashing the process on transient Redis failures
        store.on('error', (err: Error) => {
          console.warn('[cache] Redis connection error (cache unavailable):', err.message);
        });
        return { stores: [store], ttl: 60_000 };
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CartModule,
    WishlistModule,
    ReviewsModule,
    LoyaltyModule,
    SubmissionsModule,

    BannersModule,
    BlogModule,
    UploadModule,
    NotificationsModule,
    StatsModule,
  ],
})
export class AppModule {}
