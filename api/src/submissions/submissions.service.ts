import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Submission, SubmissionType } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  NotificationsService,
  AdminRequestType,
} from '../notifications/notifications.service';
import {
  CallbackDto,
  ContactDto,
  InquiryDto,
  NewsletterDto,
  OrderModificationDto,
} from './dto/submission.dto';

const TYPE_TO_REQUEST: Record<SubmissionType, AdminRequestType> = {
  CONTACT: 'contact',
  CALLBACK: 'callback',
  PRODUCT_INQUIRY: 'product_inquiry',
  NEWSLETTER: 'newsletter',
  ORDER_MODIFICATION: 'order_modification',
  SUPPORT: 'support',
};

const TITLE: Record<SubmissionType, string> = {
  CONTACT: 'New contact form submission',
  CALLBACK: 'New callback request',
  PRODUCT_INQUIRY: 'New product inquiry',
  NEWSLETTER: 'New newsletter signup',
  ORDER_MODIFICATION: 'Order modification request',
  SUPPORT: 'New support request',
};

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private config: ConfigService,
  ) {}

  private isSpam(honeypot?: string): boolean {
    return Boolean(honeypot && honeypot.trim());
  }

  private adminUrl(path: string): string {
    const base =
      this.config.get<string>('ADMIN_SITE_URL') ||
      this.config.get<string>('NEXT_PUBLIC_SITE_URL') ||
      'http://localhost:3000';
    return `${base.replace(/\/$/, '')}${path}`;
  }

  // ── Public entry points (one per form) ───────────────────────────────────

  contact(dto: ContactDto, userId?: string) {
    return this.persistAndNotify('CONTACT', {
      name: dto.name,
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
      userId,
    }, dto.website);
  }

  callback(dto: CallbackDto, userId?: string) {
    return this.persistAndNotify('CALLBACK', {
      name: dto.name,
      phone: dto.phone,
      message: dto.message,
      meta: dto.preferredTime ? { preferredTime: dto.preferredTime } : undefined,
      userId,
    }, dto.website);
  }

  inquiry(dto: InquiryDto, userId?: string) {
    return this.persistAndNotify('PRODUCT_INQUIRY', {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      message: dto.message,
      productId: dto.productId,
      meta: dto.productName ? { productName: dto.productName } : undefined,
      userId,
    }, dto.website);
  }

  async newsletter(dto: NewsletterDto, userId?: string) {
    if (this.isSpam(dto.website)) {
      this.logger.warn('Spam newsletter signup blocked (honeypot)');
      return { ok: true, id: null };
    }
    // De-dupe: an email already subscribed must not create a second record or
    // re-notify the owner.
    const existing = await this.prisma.submission.findFirst({
      where: { type: 'NEWSLETTER', email: dto.email.toLowerCase() },
    });
    if (existing) {
      this.logger.log(`Newsletter signup already exists for ${dto.email} — skipping duplicate`);
      return { ok: true, id: existing.id, duplicate: true };
    }
    return this.persistAndNotify('NEWSLETTER', {
      email: dto.email.toLowerCase(),
      userId,
    });
  }

  async orderModification(dto: OrderModificationDto, userId: string) {
    // The customer must own the order; also gives us the order number for the alert.
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, userId },
      select: { id: true, orderNumber: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true },
    });

    return this.persistAndNotify('ORDER_MODIFICATION', {
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      message: dto.message,
      orderId: order.id,
      userId,
      meta: { orderNumber: order.orderNumber },
    });
  }

  // ── Core: persist first, then notify (never let notify break the request) ─

  private async persistAndNotify(
    type: SubmissionType,
    data: {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      subject?: string | null;
      message?: string | null;
      orderId?: string | null;
      productId?: string | null;
      userId?: string | null;
      meta?: Prisma.InputJsonValue;
    },
    honeypot?: string,
  ): Promise<{ ok: true; id: string | null; duplicate?: boolean }> {
    if (this.isSpam(honeypot)) {
      this.logger.warn(`Spam submission blocked (${type}, honeypot filled)`);
      return { ok: true, id: null }; // pretend success — don't tip off bots
    }

    // 1) Persist BEFORE notifying so nothing is ever lost.
    const submission = await this.prisma.submission.create({
      data: {
        type,
        name: data.name ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        subject: data.subject ?? null,
        message: data.message ?? null,
        orderId: data.orderId ?? null,
        productId: data.productId ?? null,
        userId: data.userId ?? null,
        meta: data.meta ?? Prisma.DbNull,
      },
    });
    this.logger.log(`Submission saved: ${type} (${submission.id})`);

    // 2) Notify the store owner. notifyAdmin never throws, but wrap defensively
    // anyway so a notification problem can never fail the customer's request.
    try {
      const result = await this.notifications.notifyAdmin(this.toNotification(submission));
      this.logger.log(
        `Admin notified for ${type} (${submission.id}) — email:${result.email} whatsapp:${result.whatsapp}`,
      );
    } catch (e: any) {
      this.logger.error(`Admin notification error for ${type} (${submission.id}): ${e?.message || e}`);
    }

    return { ok: true, id: submission.id };
  }

  private toNotification(s: Submission) {
    const meta = (s.meta as any) || {};
    const orderNumber = meta.orderNumber as string | undefined;
    const productName = meta.productName as string | undefined;
    const related = orderNumber
      ? `Order #${orderNumber}`
      : productName
        ? `Product: ${productName}`
        : null;
    const adminUrl = s.orderId
      ? this.adminUrl(`/admin/orders/${s.orderId}`)
      : this.adminUrl('/admin/submissions');

    const lines: string[] = [];
    if (s.subject) lines.push(`Subject: ${s.subject}`);
    if (meta.preferredTime) lines.push(`Preferred time: ${meta.preferredTime}`);
    if (productName) lines.push(`Product: ${productName}`);

    return {
      type: TYPE_TO_REQUEST[s.type],
      title: TITLE[s.type],
      customerName: s.name,
      customerEmail: s.email,
      customerPhone: s.phone,
      message: s.message,
      lines: lines.length ? lines : undefined,
      related,
      adminUrl,
      createdAt: s.createdAt,
    };
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  async findAll(params: { page?: number; limit?: number; type?: string } = {}) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 25));
    const where: Prisma.SubmissionWhereInput = {};
    if (params.type) where.type = params.type as SubmissionType;

    const [items, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.submission.count({ where }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async setHandled(id: string, handled: boolean) {
    return this.prisma.submission.update({ where: { id }, data: { handled } });
  }
}
