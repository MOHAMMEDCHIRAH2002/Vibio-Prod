import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CartModule } from '../cart/cart.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PromoModule } from '../promo/promo.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { StatsModule } from '../stats/stats.module';

@Module({
  imports: [CartModule, NotificationsModule, PromoModule, LoyaltyModule, StatsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
