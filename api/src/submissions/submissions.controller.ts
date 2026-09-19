import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { SubmissionsService } from './submissions.service';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  CallbackDto,
  ContactDto,
  InquiryDto,
  NewsletterDto,
  OrderModificationDto,
} from './dto/submission.dto';

/**
 * Public customer-request endpoints. Rate-limited (spam protection) and
 * validated (class-validator DTOs + honeypot). OptionalJwtGuard attaches the
 * user id when the submitter happens to be signed in, so submissions are
 * enriched without requiring auth.
 */
@ApiTags('submissions')
@Controller('submissions')
@UseGuards(ThrottlerGuard, OptionalJwtGuard)
@Throttle({ default: { limit: 20, ttl: 60_000 } }) // max 20 submissions/min per IP (spam protection)
export class SubmissionsController {
  constructor(private submissions: SubmissionsService) {}

  @Post('contact')
  contact(@Body() dto: ContactDto, @Req() req: Request & { user?: any }) {
    return this.submissions.contact(dto, req.user?.id);
  }

  @Post('callback')
  callback(@Body() dto: CallbackDto, @Req() req: Request & { user?: any }) {
    return this.submissions.callback(dto, req.user?.id);
  }

  @Post('inquiry')
  inquiry(@Body() dto: InquiryDto, @Req() req: Request & { user?: any }) {
    return this.submissions.inquiry(dto, req.user?.id);
  }

  @Post('newsletter')
  newsletter(@Body() dto: NewsletterDto, @Req() req: Request & { user?: any }) {
    return this.submissions.newsletter(dto, req.user?.id);
  }

  // Modifying/cancelling an existing order requires authentication (own order only).
  @Post('order-modification')
  @UseGuards(JwtAuthGuard)
  orderModification(
    @Body() dto: OrderModificationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.submissions.orderModification(dto, userId);
  }
}
