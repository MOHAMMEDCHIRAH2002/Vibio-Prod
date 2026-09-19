import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { WhatsAppService } from './whatsapp/whatsapp.service';
import { EmailService } from './email/email.service';

@Module({
  providers: [NotificationsService, WhatsAppService, EmailService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
