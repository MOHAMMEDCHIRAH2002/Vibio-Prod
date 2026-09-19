import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UploadService } from '../upload/upload.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private products: ProductsService,
    private upload: UploadService,
  ) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 12,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('inStock') inStock?: boolean,
    @Query('admin') admin?: string,
    @Query('sort') sort = 'newest',
  ) {
    const isAdmin = admin === '1' || admin === 'true';
    return this.products.findAll({ page: +page, limit: +limit, category, search, minPrice: minPrice ? +minPrice : undefined, maxPrice: maxPrice ? +maxPrice : undefined, inStock, sort, admin: isAdmin });
  }

  @Get('featured')
  findFeatured() {
    return this.products.findFeatured();
  }

  @Get('by-id/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  findById(@Param('id') id: string) {
    return this.products.findById(id);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }

  @Post(':id/images')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const urls = await Promise.all(
      files.map((f) => this.upload.uploadFile(f)),
    );
    return this.products.addImages(id, urls);
  }
}
