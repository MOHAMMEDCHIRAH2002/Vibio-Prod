import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PromoService } from './promo.service';

/**
 * Public, unauthenticated endpoint customers call during checkout to validate
 * a promo code and preview the discount. All validation is enforced here on the
 * server — the frontend result is only a hint. The order is re-validated again
 * at creation time (OrdersService) so a stale/tampered preview cannot be trusted.
 */
@ApiTags('promo')
@Controller('promo')
export class PromoPublicController {
  constructor(private promo: PromoService) {}

  @Post('validate')
  validate(@Body() body: { code: string; subtotal: number }) {
    return this.promo.preview(body?.code, Number(body?.subtotal) || 0);
  }
}
