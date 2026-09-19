import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsAppService } from './whatsapp/whatsapp.service';
import { EmailService } from './email/email.service';

/**
 * Result of one email attempt.
 *  • `sent`    — the provider accepted it
 *  • `failed`  — the provider rejected it, or the transport errored
 *  • `skipped` — nothing was attempted (no provider configured, or no recipient)
 */
export type EmailOutcome = 'sent' | 'failed' | 'skipped';

/** Everything the store owner needs to see about a newly placed order. */
export interface AdminOrderNotification {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: any;
  items: { name: string; variantName?: string | null; quantity: number; price: number }[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  loyaltyDiscount: number;
  total: number;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  /** True for the "new pending-payment order" variant (online payment not yet settled). */
  pendingPayment?: boolean;
}

/** Kinds of customer requests the store owner gets notified about. */
export type AdminRequestType =
  | 'order'
  | 'order_modification'
  | 'contact'
  | 'callback'
  | 'product_inquiry'
  | 'newsletter'
  | 'support';

/**
 * Channel-agnostic description of any customer request. This is the single shape
 * every handler funnels into `notifyAdmin`, so notification logic lives in one
 * place instead of being duplicated per form.
 */
export interface AdminRequestNotification {
  type: AdminRequestType;
  /** Human title, e.g. "Contact form" / "New order". */
  title: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  /** Free-text message/details from the customer. */
  message?: string | null;
  /** Bullet lines (e.g. order items). */
  lines?: string[];
  /** Key/value summary rows (e.g. Total, Payment, Status). */
  summary?: { label: string; value: string }[];
  /** Short label for a related entity, e.g. "Order #ORD-123" or "Product: Green Tea". */
  related?: string | null;
  /** Absolute admin deep link. */
  adminUrl?: string | null;
  createdAt?: Date;
  /** Order-only: pending-payment variant. */
  pendingPayment?: boolean;
}

const TYPE_META: Record<AdminRequestType, { emoji: string; badge: string }> = {
  order: { emoji: '🛍️', badge: 'NEW ORDER' },
  order_modification: { emoji: '✏️', badge: 'ORDER CHANGE REQUEST' },
  contact: { emoji: '✉️', badge: 'CONTACT FORM' },
  callback: { emoji: '📞', badge: 'CALLBACK REQUEST' },
  product_inquiry: { emoji: '❓', badge: 'PRODUCT INQUIRY' },
  newsletter: { emoji: '📰', badge: 'NEWSLETTER SIGNUP' },
  support: { emoji: '🛟', badge: 'SUPPORT REQUEST' },
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private config: ConfigService,
    private whatsapp: WhatsAppService,
    private email: EmailService,
  ) {}

  /**
   * THE single place an email leaves this service. Transport-agnostic: the
   * configured provider (Resend HTTP API or SMTP) is chosen inside EmailService,
   * so templates and flows below never know or care which one is active.
   *
   * Every outcome is logged truthfully. Neither transport reports a rejected send
   * by throwing — Resend resolves to `{ error }` and SMTP can resolve with a
   * `rejected` recipient list — so a bare `await send(); log('sent')` would
   * report success for mail that never arrived. EmailService normalizes both into
   * an `ok` flag, and this method never throws: a notification problem must never
   * break the request that triggered it.
   *
   * @param context short label for the logs, e.g. `order: Order #ORD-123`.
   */
  private async sendEmail(opts: {
    to: string;
    subject: string;
    html: string;
    context: string;
  }): Promise<EmailOutcome> {
    const result = await this.email.send({
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    if (result.skipped) {
      this.logger.warn(
        `Email skipped (${opts.context}) — ${result.error || 'provider not configured'}`,
      );
      return 'skipped';
    }
    if (!result.ok) {
      this.logger.error(
        `Email REJECTED via ${result.provider} (${opts.context}) → ${opts.to}: ${result.error}`,
      );
      return 'failed';
    }

    this.logger.log(
      `Email sent via ${result.provider} (${opts.context}) → ${opts.to} [id: ${result.id ?? 'n/a'}]`,
    );
    return 'sent';
  }

  /** Absolute admin URL for a given path (e.g. `/admin/orders/123`). */
  private adminUrl(path: string): string {
    const base =
      this.config.get<string>('ADMIN_SITE_URL') ||
      this.config.get<string>('NEXT_PUBLIC_SITE_URL') ||
      'http://localhost:3000';
    return `${base.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  async sendWelcome(email: string, name: string): Promise<EmailOutcome> {
    return this.sendEmail({
      to: email,
      subject: `Welcome to Vibio, ${name}! ✨`,
      html: this.welcomeTemplate(name),
      context: `welcome: ${name}`,
    });
  }

  async sendOrderConfirmation(email: string, data: {
    orderNumber: string;
    name: string;
    total: number;
    itemCount: number;
    items: any[];
    shippingAddress: any;
  }): Promise<EmailOutcome> {
    return this.sendEmail({
      to: email,
      subject: `Your order #${data.orderNumber} is confirmed ✨`,
      html: this.orderConfirmationTemplate(data),
      context: `order confirmation: Order #${data.orderNumber}`,
    });
  }

  async sendShippingUpdate(email: string, data: {
    orderNumber: string;
    name: string;
    trackingNumber: string;
    items: any[];
  }): Promise<EmailOutcome> {
    return this.sendEmail({
      to: email,
      subject: `Your order is on its way! 🚚`,
      html: this.shippingUpdateTemplate(data),
      context: `shipping update: Order #${data.orderNumber}`,
    });
  }

  async sendWhatsAppOrderConfirmation(phone: string, data: {
    name: string;
    orderNumber: string;
    total: number;
    itemCount: number;
  }) {
    const body = `Hello ${data.name}! 🌿\n\nYour order *#${data.orderNumber}* has been confirmed.\n\nTotal: ${data.total} MAD\nItems: ${data.itemCount} products\n\nWe'll notify you when it ships. Thank you for choosing Vibio! ✨`;
    const result = await this.whatsapp.send(phone, body);
    if (result.ok && !result.skipped) {
      this.logger.log(`Customer WhatsApp sent for #${data.orderNumber} via ${result.provider}`);
    } else if (!result.ok) {
      this.logger.error(`Customer WhatsApp failed for #${data.orderNumber}: ${result.error}`);
    }
  }

  /**
   * Notify the store owner/admin about a newly placed order over BOTH email and
   * WhatsApp. Recipients come entirely from configuration (never hardcoded):
   *   STORE_NOTIFICATION_EMAIL, STORE_NOTIFICATION_PHONE.
   * Each channel is sent and logged independently; a failure in one never throws
   * or blocks the other (or the order). Returns a per-channel outcome for tests.
   */
  /**
   * THE centralized admin notifier. Every customer request (orders + all form
   * submissions) funnels through here, so email/WhatsApp logic exists in exactly
   * one place. Sends both channels independently, logs each result, and never
   * throws — a failure is reported, never propagated to the caller's request.
   *
   * Destinations come only from configuration:
   *   STORE_NOTIFICATION_EMAIL  → email
   *   STORE_WHATSAPP_NUMBER || STORE_NOTIFICATION_PHONE → WhatsApp/phone
   */
  async notifyAdmin(req: AdminRequestNotification): Promise<{
    email: EmailOutcome;
    whatsapp: 'sent' | 'failed' | 'skipped';
  }> {
    const adminEmail = this.config.get<string>('STORE_NOTIFICATION_EMAIL');
    const adminWhatsApp =
      this.config.get<string>('STORE_WHATSAPP_NUMBER') ||
      this.config.get<string>('STORE_NOTIFICATION_PHONE');
    const meta = TYPE_META[req.type];
    const ref = req.related || meta.badge;
    let email: EmailOutcome = 'skipped';
    let whatsapp: 'sent' | 'failed' | 'skipped' = 'skipped';

    // ── Email ────────────────────────────────────────────────────────────
    if (!adminEmail) {
      this.logger.warn(`STORE_NOTIFICATION_EMAIL not set — skipping admin email (${req.type}: ${ref})`);
    } else {
      email = await this.sendEmail({
        to: adminEmail,
        subject: `${meta.emoji} ${req.title}${req.related ? ` — ${req.related}` : ''}`,
        html: this.adminRequestTemplate(req),
        context: `admin ${req.type}: ${ref}`,
      });
    }

    // ── WhatsApp / phone ─────────────────────────────────────────────────
    if (!adminWhatsApp) {
      this.logger.warn(`No STORE_WHATSAPP_NUMBER/STORE_NOTIFICATION_PHONE — skipping admin WhatsApp (${req.type}: ${ref})`);
    } else {
      const result = await this.whatsapp.send(adminWhatsApp, this.adminRequestWhatsApp(req));
      if (result.ok && !result.skipped) {
        whatsapp = 'sent';
        this.logger.log(`Admin notification WhatsApp sent to ${adminWhatsApp} (${req.type}: ${ref}) via ${result.provider}`);
      } else if (result.skipped) {
        this.logger.warn(`Admin WhatsApp skipped (${req.type}: ${ref}) — ${result.error || 'provider not configured'}`);
      } else {
        whatsapp = 'failed';
        this.logger.error(`Admin WhatsApp failed (${req.type}: ${ref}): ${result.error}`);
      }
    }

    return { email, whatsapp };
  }

  /** Order → centralized notification. Kept as a named helper for the orders flow. */
  async sendAdminNewOrder(data: AdminOrderNotification) {
    const a = data.shippingAddress || {};
    const address = [a.fullName, a.line1, a.line2, [a.postalCode, a.city].filter(Boolean).join(' '), a.country]
      .filter(Boolean)
      .join(', ');
    const summary: { label: string; value: string }[] = [
      { label: 'Subtotal', value: `${data.subtotal.toFixed(2)} MAD` },
    ];
    if (data.discount > 0) summary.push({ label: 'Promo discount', value: `-${data.discount.toFixed(2)} MAD` });
    if (data.loyaltyDiscount > 0) summary.push({ label: 'Loyalty discount', value: `-${data.loyaltyDiscount.toFixed(2)} MAD` });
    summary.push({ label: 'Shipping', value: `${data.shippingCost.toFixed(2)} MAD` });
    summary.push({ label: 'Total', value: `${data.total.toFixed(2)} MAD` });
    summary.push({ label: 'Payment', value: `${data.paymentMethod} (${data.paymentStatus})` });
    summary.push({ label: 'Order status', value: data.status });
    summary.push({ label: 'Delivery address', value: address || '—' });

    return this.notifyAdmin({
      type: 'order',
      title: data.pendingPayment ? 'Pending-payment order' : 'New order',
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      lines: data.items.map(
        (i) => `${i.name}${i.variantName ? ` (${i.variantName})` : ''} ×${i.quantity} — ${(i.price * i.quantity).toFixed(2)} MAD`,
      ),
      summary,
      related: `Order #${data.orderNumber}`,
      adminUrl: this.adminUrl(`/admin/orders/${data.orderId}`),
      pendingPayment: data.pendingPayment,
    });
  }

  private adminRequestWhatsApp(r: AdminRequestNotification): string {
    const meta = TYPE_META[r.type];
    const parts: string[] = [`${meta.emoji} *${r.title}*${r.related ? ` — ${r.related}` : ''}`, ''];
    if (r.customerName) parts.push(`👤 ${r.customerName}`);
    if (r.customerPhone) parts.push(`📞 ${r.customerPhone}`);
    if (r.customerEmail) parts.push(`✉️ ${r.customerEmail}`);
    if (r.message) parts.push('', `💬 ${r.message}`);
    if (r.lines?.length) parts.push('', ...r.lines.map((l) => `• ${l}`));
    if (r.summary?.length) parts.push('', ...r.summary.map((s) => `${s.label}: ${s.value}`));
    parts.push('', `🕒 ${(r.createdAt || new Date()).toLocaleString()}`);
    if (r.adminUrl) parts.push(`🔗 ${r.adminUrl}`);
    return parts.join('\n');
  }

  async sendPasswordReset(email: string, name: string, resetUrl: string): Promise<EmailOutcome> {
    return this.sendEmail({
      to: email,
      subject: 'Reset your Vibio password',
      html: this.passwordResetTemplate(name, resetUrl),
      context: `password reset: ${email}`,
    });
  }

  private welcomeTemplate(name: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: 'Inter', sans-serif; background: #FAF7F2; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; background: #fff; }
      .header { background: #1C1C1C; padding: 40px; text-align: center; }
      .header h1 { color: #C9A96E; font-family: Georgia, serif; margin: 0; }
      .body { padding: 40px; }
      .body h2 { color: #1C1C1C; }
      .body p { color: #6B6560; line-height: 1.6; }
      .btn { display: inline-block; background: #C9A96E; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; }
      .footer { background: #FAF7F2; padding: 24px; text-align: center; color: #6B6560; font-size: 12px; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h1>VIBIO</h1></div>
        <div class="body">
          <h2>Welcome, ${name}! ✨</h2>
          <p>Thank you for joining Vibio. Discover our curated selection of premium natural products, crafted to bring luxury into your everyday life.</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}" class="btn">Shop Now</a></p>
        </div>
        <div class="footer">© 2024 Vibio. Nature's Finest, Crafted for You.</div>
      </div>
    </body>
    </html>`;
  }

  private orderConfirmationTemplate(data: any): string {
    const itemsHtml = data.items
      .map((item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #FAF7F2;">
            <img src="${item.image || ''}" width="60" style="border-radius: 8px;" alt="${item.name}">
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #FAF7F2;">${item.name}<br><small style="color:#6B6560;">${item.variantName || ''}</small></td>
          <td style="padding: 12px; border-bottom: 1px solid #FAF7F2; text-align:right;">×${item.quantity}<br>${(item.price * item.quantity).toFixed(2)} MAD</td>
        </tr>`
      ).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: 'Inter', sans-serif; background: #FAF7F2; }
      .container { max-width: 600px; margin: 0 auto; background: #fff; }
      .header { background: #1C1C1C; padding: 40px; text-align: center; }
      .header h1 { color: #C9A96E; font-family: Georgia, serif; margin: 0; }
      .body { padding: 40px; }
      .order-number { background: #FAF7F2; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; }
      .order-number span { font-size: 20px; font-weight: 700; color: #C9A96E; }
      table { width: 100%; border-collapse: collapse; }
      .total-row { font-weight: 700; font-size: 18px; color: #1C1C1C; }
      .footer { background: #FAF7F2; padding: 24px; text-align: center; color: #6B6560; font-size: 12px; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h1>VIBIO</h1></div>
        <div class="body">
          <h2 style="color:#1C1C1C;">Order Confirmed! ✨</h2>
          <p style="color:#6B6560;">Hi ${data.name}, your order has been received.</p>
          <div class="order-number">Order <span>#${data.orderNumber}</span></div>
          <table>
            ${itemsHtml}
            <tr class="total-row">
              <td colspan="2" style="padding: 16px;">Total</td>
              <td style="padding: 16px; text-align:right;">${data.total.toFixed(2)} MAD</td>
            </tr>
          </table>
          <h3 style="color:#1C1C1C; margin-top: 32px;">Shipping to:</h3>
          <p style="color:#6B6560;">${data.shippingAddress?.fullName}<br>${data.shippingAddress?.line1}<br>${data.shippingAddress?.city}, ${data.shippingAddress?.country}</p>
        </div>
        <div class="footer">© 2024 Vibio. Nature's Finest, Crafted for You.</div>
      </div>
    </body>
    </html>`;
  }

  private esc(v: string): string {
    return String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
  }

  /** Unified admin email for ANY customer request. */
  private adminRequestTemplate(r: AdminRequestNotification): string {
    const meta = TYPE_META[r.type];
    const when = (r.createdAt || new Date()).toLocaleString();
    const contact = [
      r.customerName ? `<b>${this.esc(r.customerName)}</b>` : '',
      r.customerPhone ? `📞 ${this.esc(r.customerPhone)}` : '',
      r.customerEmail ? `✉️ ${this.esc(r.customerEmail)}` : '',
    ]
      .filter(Boolean)
      .join('<br>');
    const linesHtml = r.lines?.length
      ? `<table>${r.lines
          .map((l) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #F0ECE3;color:#4B463F;">${this.esc(l)}</td></tr>`)
          .join('')}</table>`
      : '';
    const summaryHtml = r.summary?.length
      ? `<table style="margin-top:8px;border-top:2px solid #F0ECE3;">${r.summary
          .map(
            (s) =>
              `<tr><td style="padding:6px 12px;color:#6B6560;">${this.esc(s.label)}</td><td style="padding:6px 12px;text-align:right;color:#1C1C1C;">${this.esc(s.value)}</td></tr>`,
          )
          .join('')}</table>`
      : '';

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: 'Inter', sans-serif; background: #FAF7F2; margin:0; }
      .container { max-width: 640px; margin: 0 auto; background: #fff; }
      .header { background: #1C1C1C; padding: 28px 40px; }
      .header h1 { color: #C9A96E; font-family: Georgia, serif; margin: 0; font-size: 22px; }
      .header p { color:#9B978E; margin:6px 0 0; font-size:13px; }
      .body { padding: 32px 40px; }
      .pill { display:inline-block; background:#EFF5E7; color:#2F6A37; padding:6px 14px; border-radius:999px; font-size:12px; font-weight:700; letter-spacing:.5px; }
      .title { font-size:22px;font-weight:700;color:#1C1C1C;margin:12px 0 6px; }
      .ref { color:#9B978E;font-size:13px;margin:0 0 22px; }
      table { width:100%; border-collapse:collapse; }
      .card { background:#FAF7F2; border-radius:10px; padding:16px 18px; margin:8px 0 20px; color:#4B463F; font-size:14px; line-height:1.7; }
      .card b { color:#1C1C1C; }
      .label { font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#9B978E;margin:0 0 6px; }
      .btn { display:inline-block;background:#273E1C;color:#fff !important;padding:14px 30px;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px; }
      .footer { background:#FAF7F2; padding: 20px; text-align:center; color:#9B978E; font-size:12px; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h1>VIBIO · ADMIN</h1><p>Store notification</p></div>
        <div class="body">
          <span class="pill">${meta.emoji} ${meta.badge}</span>
          <div class="title">${this.esc(r.title)}</div>
          ${r.related ? `<p class="ref">${this.esc(r.related)}</p>` : '<div style="height:10px"></div>'}

          ${contact ? `<p class="label">Customer</p><div class="card">${contact}</div>` : ''}
          ${r.message ? `<p class="label">Message</p><div class="card">${this.esc(r.message).replace(/\n/g, '<br>')}</div>` : ''}
          ${linesHtml ? `<p class="label">Details</p>${linesHtml}` : ''}
          ${summaryHtml}

          <p class="label" style="margin-top:22px;">Received</p>
          <div class="card">🕒 ${this.esc(when)}</div>

          ${r.adminUrl ? `<p style="text-align:center;margin:26px 0 8px;"><a href="${r.adminUrl}" class="btn">Open in admin →</a></p>` : ''}
        </div>
        <div class="footer">Vibio store notifications · automated message</div>
      </div>
    </body>
    </html>`;
  }

  private passwordResetTemplate(name: string, resetUrl: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: 'Inter', sans-serif; background: #FAF7F2; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; background: #fff; }
      .header { background: #1C1C1C; padding: 40px; text-align: center; }
      .header h1 { color: #C9A96E; font-family: Georgia, serif; margin: 0; font-size: 28px; }
      .body { padding: 40px; }
      .body h2 { color: #1C1C1C; margin-top: 0; }
      .body p { color: #6B6560; line-height: 1.7; }
      .btn { display: inline-block; background: #273E1C; color: #fff !important; padding: 14px 32px; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 14px; margin: 8px 0; }
      .notice { background: #FAF7F2; border-radius: 8px; padding: 16px; font-size: 13px; color: #9B978E; margin-top: 24px; }
      .footer { background: #FAF7F2; padding: 24px; text-align: center; color: #9B978E; font-size: 12px; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h1>VIBIO</h1></div>
        <div class="body">
          <h2>Reset your password</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset the password for your Vibio account. Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
          <p style="text-align:center; margin: 32px 0;">
            <a href="${resetUrl}" class="btn">Reset password</a>
          </p>
          <div class="notice">
            If you didn't request a password reset, you can safely ignore this email — your account is still secure and your password has not been changed.
          </div>
        </div>
        <div class="footer">© 2024 Vibio. Nature's Finest, Crafted for You.</div>
      </div>
    </body>
    </html>`;
  }

  private shippingUpdateTemplate(data: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: 'Inter', sans-serif; background: #FAF7F2; }
      .container { max-width: 600px; margin: 0 auto; background: #fff; }
      .header { background: #1C1C1C; padding: 40px; text-align: center; }
      .header h1 { color: #C9A96E; font-family: Georgia, serif; margin: 0; }
      .body { padding: 40px; }
      .tracking { background: #FAF7F2; border-radius: 8px; padding: 24px; text-align: center; }
      .tracking h3 { margin: 0 0 8px; color: #1C1C1C; }
      .tracking code { font-size: 20px; color: #C9A96E; font-weight: 700; }
      .footer { background: #FAF7F2; padding: 24px; text-align: center; color: #6B6560; font-size: 12px; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h1>VIBIO</h1></div>
        <div class="body">
          <h2 style="color:#1C1C1C;">Your Order is on its Way! 🚚</h2>
          <p style="color:#6B6560;">Hi ${data.name}, order <strong>#${data.orderNumber}</strong> has been shipped.</p>
          <div class="tracking">
            <h3>Tracking Number</h3>
            <code>${data.trackingNumber}</code>
          </div>
        </div>
        <div class="footer">© 2024 Vibio. Nature's Finest, Crafted for You.</div>
      </div>
    </body>
    </html>`;
  }
}
