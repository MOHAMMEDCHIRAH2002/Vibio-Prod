import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('stats')
@Controller('admin/stats')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(private stats: StatsService) {}

  @Get('overview')
  getOverview() {
    return this.stats.getOverview();
  }

  @Get('revenue')
  getRevenue(@Query('period') period: '7d' | '30d' | '90d' = '30d') {
    return this.stats.getRevenue(period);
  }

  @Get('top-products')
  getTopProducts() {
    return this.stats.getTopProducts();
  }

  @Get('orders-by-status')
  getOrdersByStatus() {
    return this.stats.getOrdersByStatus();
  }
}
