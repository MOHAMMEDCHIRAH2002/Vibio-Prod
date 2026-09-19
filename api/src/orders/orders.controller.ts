import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@Controller()
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  findMyOrders(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.orders.findByUser(userId, +page, +limit);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  findMyOrder(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.orders.findOne(id, userId);
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser('id') userId: string,
    @Req() req: Request & { user?: any },
    @Body() body: { shippingAddress: any; paymentMethod: string; notes?: string; promoCode?: string; redeemPoints?: number; idempotencyKey?: string },
  ) {
    const sessionId = userId || (req.headers['x-session-id'] as string);
    // Prefer the standard Idempotency-Key header; fall back to the body field.
    const idempotencyKey =
      (req.headers['idempotency-key'] as string) || body.idempotencyKey || undefined;
    return this.orders.createFromCart(userId, sessionId, { ...body, idempotencyKey });
  }

  @Get('admin/orders')
  @UseGuards(AdminGuard)
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.orders.findAll(+page, +limit, status, search);
  }

  @Get('admin/orders/:id')
  @UseGuards(AdminGuard)
  findOne(@Param('id') id: string) {
    return this.orders.findOne(id);
  }

  @Patch('admin/orders/:id/status')
  @UseGuards(AdminGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; trackingNumber?: string },
  ) {
    return this.orders.updateStatus(id, body.status, body.trackingNumber);
  }
}
