import { Module } from '@nestjs/common';
import { PromoController } from './promo.controller';
import { PromoPublicController } from './promo-public.controller';
import { PromoService } from './promo.service';

@Module({
  controllers: [PromoController, PromoPublicController],
  providers: [PromoService],
  exports: [PromoService],
})
export class PromoModule {}
