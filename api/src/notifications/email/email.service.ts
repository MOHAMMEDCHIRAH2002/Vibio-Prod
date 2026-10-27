import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Adapter interface so the email transport can be swapped without touching any
 * calling code or a single template. Implementations must never throw — they
 * resolve to a result the caller can log.
 *
 * Mirrors the WhatsApp adapter in ../whatsapp/whatsapp.service.ts on purpose.
 */
export interface EmailProvider {
  readonly name: string;
  /** True when the provider has the credentials it needs to actually send. */
  readonly configured: boolean;
  send(msg: EmailMessage): Promise<EmailResult>;
}

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface EmailResult {
  ok: boolean;
  provider: string;
  id?: string;
  error?: string;
  errorType?: string;
  statusCode?: number;
  skipped?: boolean;
}

/**
 * Resend HTTP API provider. Needs RESEND_API_KEY.
 *
 * NOTE: the Resend SDK does NOT throw on API errors — it resolves to
 * `{ data: null, error }`. The `error` field is what actually reports a rejected
 * send (invalid key, unverified domain, blocked recipient), so it is inspected
 * here rather than relying on a try/catch.
 */
class ResendProvider implements EmailProvider {
  readonly name = 'resend';
  private client: Resend | undefined;

  constructor(apiKey: string) {
    if (apiKey) this.client = new Resend(apiKey);
  }

  get configured() {
    return Boolean(this.client);
  }

  async send(msg: EmailMessage): Promise<EmailResult> {
    const { data, error } = await this.client!.emails.send({
      from: msg.from,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
    });

    if (error) {
      const e = error as any;
      const message = String(e.message ?? '');
      const errorType = /only send testing emails|verify (your )?(sending )?domain|domain .*not verified/i.test(
        message,
      )
        ? 'sender_or_recipient_not_verified'
        : e.name || 'ProviderError';
      return {
        ok: false,
        provider: this.name,
        error: message || JSON.stringify(error),
        errorType,
        statusCode: typeof e.statusCode === 'number' ? e.statusCode : undefined,
      };
    }
    return { ok: true, provider: this.name, id: data?.id };
  }
}

/**
 * SMTP provider (cPanel / any mailbox). Needs SMTP_HOST + SMTP_USER + SMTP_PASS.
 *
 * Use this when the production domain cannot host the TXT records an HTTP API
 * provider requires: authentication is the mailbox login, so no DNS changes are
 * needed. Deliverability still benefits from SPF/DKIM where they can be added.
 *
 * The transport is created lazily and reused, so the TCP/TLS connection pool
 * survives across sends instead of being rebuilt per email.
 */
class SmtpProvider implements EmailProvider {
  readonly name = 'smtp';
  private transporter: Transporter | undefined;

  constructor(
    private host: string,
    private port: number,
    private secure: boolean,
    private user: string,
    private pass: string,
  ) {}

  get configured() {
    return Boolean(this.host && this.user && this.pass);
  }

  private transport(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.host,
        port: this.port,
        // true for implicit TLS on 465; false for 587, which upgrades via STARTTLS.
        secure: this.secure,
        auth: { user: this.user, pass: this.pass },
        pool: true,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      });
    }
    return this.transporter;
  }

  async send(msg: EmailMessage): Promise<EmailResult> {
    const info = await this.transport().sendMail({
      from: msg.from,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
    });

    // A recipient the server explicitly refused is a failure even though
    // sendMail resolved — it accepted the others in the same transaction.
    if (info.rejected?.length) {
      return {
        ok: false,
        provider: this.name,
        error: `server rejected recipient(s): ${info.rejected.join(', ')}`,
        errorType: 'RecipientRejected',
      };
    }
    return { ok: true, provider: this.name, id: info.messageId };
  }

  /** Optional connectivity/credential probe — never called during boot. */
  async verify(): Promise<void> {
    await this.transport().verify();
  }
}

/** Fallback that only logs — used when nothing is configured. */
class LogProvider implements EmailProvider {
  readonly name = 'log';
  readonly configured = false;

  constructor(private logger: Logger) {}

  async send(msg: EmailMessage): Promise<EmailResult> {
    this.logger.warn('[email:log] no provider configured; email skipped');
    return { ok: true, provider: this.name, skipped: true };
  }
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly provider: EmailProvider;

  constructor(private config: ConfigService) {
    this.provider = this.selectProvider();
  }

  /**
   * Choose the transport from EMAIL_PROVIDER ('resend' | 'smtp'). When unset or
   * 'auto', prefer Resend and fall back to SMTP — which keeps existing
   * deployments on exactly the behaviour they had before SMTP existed. Falls back
   * to a log-only provider so calls never fail where email isn't configured.
   */
  private selectProvider(): EmailProvider {
    const configuredProvider = (this.config.get<string>('EMAIL_PROVIDER') || 'auto').toLowerCase();
    const requested = ['auto', 'resend', 'smtp'].includes(configuredProvider)
      ? configuredProvider
      : 'auto';

    const resend = new ResendProvider(this.config.get<string>('RESEND_API_KEY') || '');
    const smtp = new SmtpProvider(
      this.config.get<string>('SMTP_HOST') || '',
      Number(this.config.get<string>('SMTP_PORT')) || 465,
      String(this.config.get<string>('SMTP_SECURE') ?? 'true').toLowerCase() !== 'false',
      this.config.get<string>('SMTP_USER') || '',
      this.config.get<string>('SMTP_PASS') || '',
    );

    let selected: EmailProvider;
    if (requested === 'resend') {
      selected = resend.configured ? resend : new LogProvider(this.logger);
      if (!resend.configured) this.logger.warn('EMAIL_PROVIDER=resend but RESEND_API_KEY is not set');
    } else if (requested === 'smtp') {
      selected = smtp.configured ? smtp : new LogProvider(this.logger);
      if (!smtp.configured) this.logger.warn('EMAIL_PROVIDER=smtp but SMTP_HOST/SMTP_USER/SMTP_PASS are incomplete');
    } else {
      // auto — preserves pre-SMTP behaviour by preferring Resend.
      selected = resend.configured
        ? resend
        : smtp.configured
          ? smtp
          : new LogProvider(this.logger);
    }

    const isVercel = this.config.get<string>('VERCEL') === '1';
    this.logger.log(
      `Email runtime config: platform=${isVercel ? 'vercel' : 'node'}, requestedProvider=${configuredProvider}, ` +
        `selectedProvider=${selected.name}, smtpConfigured=${smtp.configured}, ` +
        `resendConfigured=${resend.configured}, senderDomain=${this.senderDomain() || 'default'}`,
    );
    if (configuredProvider !== requested) {
      this.logger.warn('EMAIL_PROVIDER value is not recognized; using automatic provider selection.');
    }
    return selected;
  }

  get providerName() {
    return this.provider.name;
  }

  /** Default sender, shared by every template. */
  get from(): string {
    return this.config.get<string>('EMAIL_FROM') || 'noreply@vibio.com';
  }

  private senderDomain(): string | undefined {
    const address = this.from.match(/<([^>]+)>/)?.[1] || this.from;
    return address.match(/@([^>\s]+)/)?.[1];
  }

  /**
   * Send one email. Never throws — returns a result the caller can log, so a mail
   * problem can never break the request that triggered it. A missing recipient is
   * treated as a skip, not an error.
   */
  async send(msg: Omit<EmailMessage, 'from'> & { from?: string }): Promise<EmailResult> {
    if (!msg.to) {
      return { ok: true, provider: this.provider.name, skipped: true, error: 'no recipient' };
    }
    try {
      return await this.provider.send({ ...msg, from: msg.from || this.from });
    } catch (e: any) {
      return {
        ok: false,
        provider: this.provider.name,
        error: e?.message || String(e),
        errorType: e?.code || e?.name || 'UnknownError',
      };
    }
  }
}
