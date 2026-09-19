import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private banners: BannersService) {}

  @Get()
  findActive() {
    return this.banners.findActive();
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  findAll() {
    return this.banners.findAll();
  }

  @Post('admin')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  create(@Body() data: any) {
    return this.banners.create(data);
  }

  @Patch('admin/reorder')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  reorder(@Body() body: { ids: string[] }) {
    return this.banners.reorder(body.ids);
  }

  @Patch('admin/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() data: any) {
    return this.banners.update(id, data);
  }

  @Delete('admin/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.banners.remove(id);
  }
}
