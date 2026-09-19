'use client';

import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  applyDocumentDirection,
  scopeFromPath,
  storageKeyForScope,
  type Language,
} from '@/lib/i18n/config';

const OPTIONS: { code: Language; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'عربي' },
];

interface Props {
  /** 'dark' for use over dark backgrounds (hero), 'light' otherwise */
  variant?: 'light' | 'dark';
  className?: string;
}

export default function LanguageSwitcher({ variant = 'light', className }: Props) {
  const { i18n } = useTranslation();
  const pathname = usePathname();
  const current = (i18n.language?.startsWith('ar') ? 'ar' : 'fr') as Language;

  const change = (lang: Language) => {
    if (lang === current) return;
    i18n.changeLanguage(lang);
    applyDocumentDirection(lang);
    if (typeof window !== 'undefined') {
      // Persist to the active scope only — admin and storefront stay independent.
      window.localStorage.setItem(storageKeyForScope(scopeFromPath(pathname)), lang);
    }
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border p-0.5',
        variant === 'dark'
          ? 'border-white/20 bg-white/8 backdrop-blur-sm'
          : 'border-[#E0D6C4] bg-white/70',
        className,
      )}
    >
      {OPTIONS.map((opt) => {
        const active = current === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => change(opt.code)}
            aria-pressed={active}
            lang={opt.code}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] transition-all duration-200',
              active
                ? 'bg-[#C9A85D] text-[#1E2519] shadow-[0_2px_8px_rgba(201,168,93,0.3)]'
                : variant === 'dark'
                  ? 'text-white/55 hover:text-white/85'
                  : 'text-[#8A8F7C] hover:text-[#1E2519]',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
