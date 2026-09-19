import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categories: CategoriesService) {}

  @Get()
  findAll() {
    return this.categories.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categories.findBySlug(slug);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  create(@Body() data: any) {
    return this.categories.create(data);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() data: any) {
    return this.categories.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.categories.remove(id);
  }
}
