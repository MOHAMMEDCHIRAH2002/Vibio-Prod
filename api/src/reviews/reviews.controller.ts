import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Get('reviews/recent')
  findRecent(@Query('limit') limit = 4) {
    return this.reviews.findRecent(+limit);
  }

  @Get('products/:id/reviews')
  findByProduct(@Param('id') id: string) {
    return this.reviews.findByProduct(id);
  }

  @Post('products/:id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Param('id') productId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { rating: number; title?: string; body?: string },
  ) {
    return this.reviews.create(userId, productId, body);
  }

  @Get('admin/reviews')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.reviews.findAllAdmin(+page, +limit, status);
  }

  @Post('admin/reviews')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  adminCreate(
    @CurrentUser('id') adminId: string,
    @Body() body: { productId: string; rating: number; title?: string; body?: string; reviewerName?: string },
  ) {
    return this.reviews.adminCreate(adminId, body);
  }

  @Patch('admin/reviews/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  moderate(@Param('id') id: string, @Body() body: { action: 'approve' | 'reject' }) {
    return this.reviews.moderate(id, body.action);
  }

  @Delete('admin/reviews/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.reviews.remove(id);
  }
}
