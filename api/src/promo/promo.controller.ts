import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PromoService } from './promo.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('promo')
@Controller('admin/promo')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class PromoController {
  constructor(private promo: PromoService) {}

  @Get()
  findAll() {
    return this.promo.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.promo.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.promo.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promo.remove(id);
  }
}
