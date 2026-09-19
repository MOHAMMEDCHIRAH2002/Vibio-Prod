import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('blog')
@Controller()
export class BlogController {
  constructor(private blog: BlogService) {}

  @Get('blog')
  findAll(@Query('page') page = 1, @Query('limit') limit = 12) {
    return this.blog.findAll(+page, +limit);
  }

  @Get('blog/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blog.findBySlug(slug);
  }

  @Get('admin/blog')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  findAllAdmin(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.blog.findAllAdmin(+page, +limit);
  }

  @Post('admin/blog')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  create(@Body() data: any, @CurrentUser('id') authorId: string) {
    return this.blog.create(data, authorId);
  }

  @Patch('admin/blog/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() data: any) {
    return this.blog.update(id, data);
  }

  @Delete('admin/blog/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.blog.remove(id);
  }
}
