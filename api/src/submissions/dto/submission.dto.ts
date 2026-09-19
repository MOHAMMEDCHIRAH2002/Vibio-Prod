import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Honeypot: a hidden field real users never fill. Bots that auto-fill every
 * input will populate it, letting us silently drop the submission. Kept optional
 * and unvalidated (beyond a length cap) so legitimate empty values pass.
 */
class HoneypotDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}

export class ContactDto extends HoneypotDto {
  @IsString() @MinLength(2) @MaxLength(120)
  name!: string;

  @IsEmail() @MaxLength(200)
  email!: string;

  @IsOptional() @IsString() @MaxLength(200)
  subject?: string;

  @IsString() @MinLength(5) @MaxLength(4000)
  message!: string;
}

export class CallbackDto extends HoneypotDto {
  @IsString() @MinLength(2) @MaxLength(120)
  name!: string;

  @IsString() @MinLength(6) @MaxLength(30)
  phone!: string;

  @IsOptional() @IsString() @MaxLength(120)
  preferredTime?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  message?: string;
}

export class InquiryDto extends HoneypotDto {
  @IsString() @MinLength(2) @MaxLength(120)
  name!: string;

  @IsOptional() @IsEmail() @MaxLength(200)
  email?: string;

  @IsOptional() @IsString() @MaxLength(30)
  phone?: string;

  @IsOptional() @IsString() @MaxLength(60)
  productId?: string;

  @IsOptional() @IsString() @MaxLength(200)
  productName?: string;

  @IsString() @MinLength(5) @MaxLength(2000)
  message!: string;
}

export class NewsletterDto extends HoneypotDto {
  @IsEmail() @MaxLength(200)
  email!: string;
}

export class OrderModificationDto extends HoneypotDto {
  @IsString() @MaxLength(60)
  orderId!: string;

  @IsString() @MinLength(5) @MaxLength(2000)
  message!: string;
}
