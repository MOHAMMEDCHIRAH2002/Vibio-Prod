import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

/**
 * Adapter interface so the WhatsApp provider can be swapped without touching any
 * calling code. Implementations must never throw — they resolve to a result the
 * caller can log.
 */
export interface WhatsAppProvider {
  readonly name: string;
  /** True when the provider has the credentials it needs to actually send. */
  readonly configured: boolean;
  send(to: string, body: string): Promise<WhatsAppResult>;
}

export interface WhatsAppResult {
  ok: boolean;
  provider: string;
  id?: string;
  error?: string;
  skipped?: boolean;
}

/** Normalize a phone number to bare digits with country code (no +, spaces). */
const digits = (v: string) => (v || '').replace(/[^0-9]/g, '');

/**
 * Meta WhatsApp Cloud API provider.
 * Needs WHATSAPP_API_TOKEN + WHATSAPP_PHONE_NUMBER_ID.
 */
class MetaCloudProvider implements WhatsAppProvider {
  readonly name = 'meta';
  constructor(
    private token: string,
    private phoneNumberId: string,
    private apiVersion = 'v21.0',
  ) {}
  get configured() {
    return Boolean(this.token && this.phoneNumberId);
  }
  async send(to: string, body: string): Promise<WhatsAppResult> {
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: digits(to),
        type: 'text',
        text: { preview_url: false, body },
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, provider: this.name, error: `HTTP ${res.status} ${text.slice(0, 200)}` };
    }
    const json: any = await res.json().catch(() => ({}));
    return { ok: true, provider: this.name, id: json?.messages?.[0]?.id };
  }
}

/**
 * Twilio WhatsApp provider.
 * Needs TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + a WhatsApp-enabled `from`.
 */
class TwilioProvider implements WhatsAppProvider {
  readonly name = 'twilio';
  private client: Twilio | undefined;
  constructor(
    sid: string,
    token: string,
    private from: string,
  ) {
    if (sid && token && sid.startsWith('AC')) this.client = new Twilio(sid, token);
  }
  get configured() {
    return Boolean(this.client && this.from);
  }
  async send(to: string, body: string): Promise<WhatsAppResult> {
    const dest = to.startsWith('whatsapp:') ? to : `whatsapp:+${digits(to)}`;
    const from = this.from.startsWith('whatsapp:') ? this.from : `whatsapp:${this.from}`;
    const msg = await this.client!.messages.create({ from, to: dest, body });
    return { ok: true, provider: this.name, id: msg.sid };
  }
}

/** Fallback that only logs — used when nothing is configured. */
class LogProvider implements WhatsAppProvider {
  readonly name = 'log';
  readonly configured = false;
  constructor(private logger: Logger) {}
  async send(to: string, body: string): Promise<WhatsAppResult> {
    this.logger.warn(
      `[whatsapp:log] no provider configured — would send to ${to}: ${body.replace(/\n/g, ' ⏎ ')}`,
    );
    return { ok: true, provider: this.name, skipped: true };
  }
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly provider: WhatsAppProvider;

  constructor(private config: ConfigService) {
    this.provider = this.selectProvider();
    this.logger.log(
      `WhatsApp provider: ${this.provider.name}` +
        (this.provider.configured ? '' : ' (not configured — messages will be logged only)'),
    );
  }

  /**
   * Choose the provider from WHATSAPP_PROVIDER ('meta' | 'twilio'). When unset or
   * 'auto', pick whichever has credentials. Falls back to a log-only provider so
   * calls never fail in environments without WhatsApp configured.
   */
  private selectProvider(): WhatsAppProvider {
    const requested = (this.config.get<string>('WHATSAPP_PROVIDER') || 'auto').toLowerCase();

    const meta = new MetaCloudProvider(
      this.config.get<string>('WHATSAPP_API_TOKEN') || '',
      this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '',
      this.config.get<string>('WHATSAPP_API_VERSION') || 'v21.0',
    );
    const twilio = new TwilioProvider(
      this.config.get<string>('TWILIO_ACCOUNT_SID') || '',
      this.config.get<string>('TWILIO_AUTH_TOKEN') || '',
      this.config.get<string>('TWILIO_WHATSAPP_FROM') || 'whatsapp:+14155238886',
    );

    if (requested === 'meta') return meta.configured ? meta : new LogProvider(this.logger);
    if (requested === 'twilio') return twilio.configured ? twilio : new LogProvider(this.logger);

    // auto
    if (meta.configured) return meta;
    if (twilio.configured) return twilio;
    return new LogProvider(this.logger);
  }

  get providerName() {
    return this.provider.name;
  }

  /**
   * Send a WhatsApp text message. Never throws — returns a result the caller can
   * log. A missing destination is treated as a skip, not an error.
   */
  async send(to: string | undefined | null, body: string): Promise<WhatsAppResult> {
    if (!to || !digits(to)) {
      return { ok: true, provider: this.provider.name, skipped: true, error: 'no destination' };
    }
    try {
      return await this.provider.send(to, body);
    } catch (e: any) {
      return { ok: false, provider: this.provider.name, error: e?.message || String(e) };
    }
  }
}
