'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { getConsent, saveConsent } from '@/lib/cookieConsent';

export default function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Only decide visibility on the client, after mount, to avoid hydration
  // mismatch and to never render the banner during SSR.
  useEffect(() => {
    if (!getConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (choice: { analytics: boolean; marketing: boolean }) => {
    saveConsent(choice);
    setVisible(false);
  };

  const acceptAll = () => decide({ analytics: true, marketing: true });
  const rejectAll = () => decide({ analytics: false, marketing: false });
  const savePreferences = () => decide({ analytics, marketing });

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t('cookies.aria')}
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-5"
    >
      <div className="mx-auto w-full max-w-[1100px] overflow-hidden rounded-[22px] border border-[#E7DDCC] bg-[#FFFEFA]/95 shadow-[0_22px_70px_rgba(30,37,25,0.16)] backdrop-blur-md">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#3D8B45]">
                {t('cookies.eyebrow')}
              </p>
              <h2 className="mt-1.5 font-heading text-[clamp(1.35rem,2.5vw,1.75rem)] leading-tight tracking-[-0.03em] text-[#1E2519]">
                {t('cookies.title')}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#5B6455]">
                {t('cookies.message')}{' '}
                <Link
                  href="/privacy"
                  className="font-semibold text-[#273E1C] underline decoration-[#D1B987] underline-offset-4 transition-colors hover:text-[#4F6F2D]"
                >
                  {t('cookies.privacyLink')}
                </Link>
                .
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row lg:flex-col xl:flex-row">
              <button
                type="button"
                onClick={rejectAll}
                className="order-2 rounded-full border border-[#D8C7AD] bg-white px-6 py-3 text-sm font-semibold text-[#273E1C] transition-all duration-300 hover:border-[#C9A96E] hover:bg-[#FBF7EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] focus-visible:ring-offset-2 active:scale-[0.98] sm:order-1"
              >
                {t('cookies.reject')}
              </button>
              <button
                type="button"
                onClick={() => setManaging((v) => !v)}
                aria-expanded={managing}
                className="order-3 rounded-full px-6 py-3 text-sm font-semibold text-[#5B6455] underline decoration-transparent underline-offset-4 transition-colors duration-300 hover:text-[#273E1C] hover:decoration-[#D1B987] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] focus-visible:ring-offset-2 sm:order-2"
              >
                {t('cookies.manage')}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="order-1 rounded-full bg-[#273E1C] px-7 py-3 text-sm font-semibold text-[#FBF7EE] shadow-[0_14px_30px_rgba(39,62,28,0.28)] transition-all duration-300 hover:bg-[#33501f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] focus-visible:ring-offset-2 active:scale-[0.98] sm:order-3"
              >
                {t('cookies.accept')}
              </button>
            </div>
          </div>

          {managing && (
            <div className="mt-5 grid gap-3 border-t border-[#E7DDCC] pt-5 sm:grid-cols-3">
              <PreferenceRow
                title={t('cookies.necessaryTitle')}
                desc={t('cookies.necessaryDesc')}
                checked
                disabled
                badge={t('cookies.alwaysOn')}
              />
              <PreferenceRow
                title={t('cookies.analyticsTitle')}
                desc={t('cookies.analyticsDesc')}
                checked={analytics}
                onChange={setAnalytics}
              />
              <PreferenceRow
                title={t('cookies.marketingTitle')}
                desc={t('cookies.marketingDesc')}
                checked={marketing}
                onChange={setMarketing}
              />
              <div className="sm:col-span-3">
                <button
                  type="button"
                  onClick={savePreferences}
                  className="w-full rounded-full border border-[#D8C7AD] bg-white px-6 py-3 text-sm font-semibold text-[#273E1C] transition-all duration-300 hover:border-[#C9A96E] hover:bg-[#FBF7EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] focus-visible:ring-offset-2 active:scale-[0.98] sm:w-auto"
                >
                  {t('cookies.savePreferences')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreferenceRow({
  title,
  desc,
  checked,
  onChange,
  disabled,
  badge,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <label
      className={`flex items-start justify-between gap-3 rounded-[16px] border border-[#E7DDCC] bg-[#FBF9F4] p-4 ${
        disabled ? 'opacity-90' : 'cursor-pointer'
      }`}
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="font-heading text-base tracking-[-0.02em] text-[#1E2519]">{title}</span>
          {badge && (
            <span className="rounded-full bg-[#EDE4D3] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#6B6250]">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-1 block text-xs leading-6 text-[#5B6455]">{desc}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-[#273E1C] disabled:cursor-not-allowed"
      />
    </label>
  );
}
