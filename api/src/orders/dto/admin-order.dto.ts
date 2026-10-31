import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class AdminOrderItemDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  variantId?: string;

  @IsOptional()
  @IsString()
  itemId?: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class AdminOrderAddressDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

export class AdminOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminOrderItemDto)
  items: AdminOrderItemDto[];

  @ValidateNested()
  @Type(() => AdminOrderAddressDto)
  shippingAddress: AdminOrderAddressDto;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
