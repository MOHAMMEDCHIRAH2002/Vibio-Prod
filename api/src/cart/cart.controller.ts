import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CartService } from './cart.service';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

function getSessionId(req: Request & { user?: any }): string {
  return req.user?.id || (req.headers['x-session-id'] as string) || 'guest';
}

@ApiTags('cart')
@Controller('cart')
@UseGuards(OptionalJwtGuard)
export class CartController {
  constructor(private cart: CartService) {}

  @Get()
  getCart(@Req() req: Request & { user?: any }) {
    return this.cart.getCart(getSessionId(req));
  }

  @Post('items')
  addItem(
    @Req() req: Request & { user?: any },
    @Body() body: { variantId: string; quantity?: number },
  ) {
    return this.cart.addItem(getSessionId(req), body.variantId, body.quantity);
  }

  @Patch('items/:variantId')
  updateItem(
    @Req() req: Request & { user?: any },
    @Param('variantId') variantId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cart.updateItem(getSessionId(req), variantId, body.quantity);
  }

  @Delete('items/:variantId')
  removeItem(
    @Req() req: Request & { user?: any },
    @Param('variantId') variantId: string,
  ) {
    return this.cart.removeItem(getSessionId(req), variantId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  clearCart(@Req() req: Request & { user?: any }) {
    return this.cart.clearCart(getSessionId(req));
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard)
  merge(
    @CurrentUser('id') userId: string,
    @Body() body: { sessionId: string },
  ) {
    return this.cart.mergeGuestCart(userId, body.sessionId);
  }
}
