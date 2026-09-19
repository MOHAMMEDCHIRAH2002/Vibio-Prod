'use client';

import { useState } from 'react';
import { Phone, Copy, Check, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/** Configurable store contact — baked from NEXT_PUBLIC_* at build time. */
const STORE_PHONE = process.env.NEXT_PUBLIC_STORE_PHONE_NUMBER || '';
const STORE_WHATSAPP = process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER || '';

export type PhoneOrderContext =
  | { kind: 'product'; name: string; url?: string }
  | { kind: 'cart' | 'checkout'; itemCount: number; total: string }
  | undefined;

interface Props {
  context?: PhoneOrderContext;
  className?: string;
  /** 'panel' = bordered card (default). 'inline' = compact, no card chrome. */
  variant?: 'panel' | 'inline';
}

export default function PhoneOrder({ context, className, variant = 'panel' }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Render nothing if the store hasn't configured any contact number.
  if (!STORE_PHONE && !STORE_WHATSAPP) return null;

  const telHref = `tel:${STORE_PHONE.replace(/\s+/g, '')}`;

  const waMessage = (() => {
    if (context?.kind === 'product') {
      return t('phoneOrder.waProduct', { name: context.name, url: context.url || '' });
    }
    if (context?.kind === 'cart' || context?.kind === 'checkout') {
      return t('phoneOrder.waCart', { count: context.itemCount, total: context.total });
    }
    return t('phoneOrder.waGeneric');
  })();

  const waHref = `https://wa.me/${STORE_WHATSAPP.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMessage)}`;

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(STORE_PHONE);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the number is still visible */
    }
  };

  return (
    <div
      className={cn(
        variant === 'panel' &&
          'rounded-[22px] border border-[#E1D6C2] bg-[#FBF8F1] p-5',
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8A7A57]">
        {t('phoneOrder.title')}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#5B6455]">{t('phoneOrder.subtitle')}</p>

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        {STORE_PHONE && (
          <a
            href={telHref}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#2d5016] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:bg-[#3a6b1e]"
          >
            <Phone className="h-4 w-4" />
            {t('phoneOrder.orderByPhone')}
          </a>
        )}

        {STORE_WHATSAPP && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-[#25D366] bg-[#25D366]/10 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#128C3E] transition-colors duration-200 hover:bg-[#25D366]/20"
          >
            <MessageCircle className="h-4 w-4" />
            {t('phoneOrder.whatsapp')}
          </a>
        )}
      </div>

      {/* Number shown clearly (desktop) with copy — the tel: link handles mobile dialing. */}
      {STORE_PHONE && (
        <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-[#E4DAC8] bg-white px-4 py-2">
          <a href={telHref} dir="ltr" className="text-sm font-semibold tracking-[0.02em] text-[#1E2519]">
            {STORE_PHONE}
          </a>
          <button
            onClick={copyNumber}
            aria-label={copied ? t('phoneOrder.copied') : t('phoneOrder.copy')}
            title={copied ? t('phoneOrder.copied') : t('phoneOrder.copy')}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b6b63] transition-colors hover:bg-[#F0EDE5] hover:text-[#2d5016]"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#2d5016]" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}
