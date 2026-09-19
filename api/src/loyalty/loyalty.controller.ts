import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('loyalty')
@ApiBearerAuth()
@Controller('loyalty')
export class LoyaltyController {
  constructor(private loyalty: LoyaltyService) {}

  /** Signed-in customer's balance, program rules, and recent ledger. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser('id') userId: string) {
    return this.loyalty.getSummary(userId);
  }
}
