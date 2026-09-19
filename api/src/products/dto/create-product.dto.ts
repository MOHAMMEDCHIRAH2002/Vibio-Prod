import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantDto {
  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  sku?: string;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  shortDesc?: string;

  @IsString()
  categoryId: string;

  @IsNumber()
  @IsPositive()
  basePrice: number;

  @IsOptional()
  @IsNumber()
  comparePrice?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDesc?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];
}
