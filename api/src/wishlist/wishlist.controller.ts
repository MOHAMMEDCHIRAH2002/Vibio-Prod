import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('wishlist')
@ApiBearerAuth()
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private wishlist: WishlistService) {}

  @Get()
  get(@CurrentUser('id') userId: string) {
    return this.wishlist.get(userId);
  }

  @Post(':productId')
  toggle(@Param('productId') productId: string, @CurrentUser('id') userId: string) {
    return this.wishlist.toggle(userId, productId);
  }

  @Delete(':productId')
  remove(@Param('productId') productId: string, @CurrentUser('id') userId: string) {
    return this.wishlist.remove(userId, productId);
  }
}
