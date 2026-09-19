'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReviewCardsClient from './ReviewCardsClient';

interface Props {
  reviews: any[];
}

export default function ReviewsSectionClient({ reviews }: Props) {
  const { t } = useTranslation();

  const stats = [
    { value: '4.9/5', label: t('reviews.stats.rating') },
    { value: '92%', label: t('reviews.stats.repeat') },
    { value: '48h', label: t('reviews.stats.dispatch') },
  ];

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="surface-shell overflow-hidden rounded-[36px] p-6 sm:p-7 lg:p-8">
          <div className="relative">
            {/* Decorative luxury dots */}
            <div className="pointer-events-none absolute left-[30%] top-0 h-3 w-3 rounded-full bg-[#C9A85D] ring-8 ring-[#EEF2E7]" />
            <div className="pointer-events-none absolute right-[38%] top-16 h-8 w-8 rounded-full border border-[#D8BC81] bg-white/70 shadow-[0_14px_34px_rgba(30,37,25,0.06)]" />

            {/* ── Header ── */}
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <p className="section-eyebrow">{t('reviews.eyebrow')}</p>
                <h2 className="font-heading text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.94] tracking-[-0.06em] text-[#1E2519]">
                  {t('reviews.title')}
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[28px] border border-[#E4D9C8] bg-[#FFFEFA] px-7 py-6 text-center shadow-[0_16px_42px_rgba(30,37,25,0.045)]"
                  >
                    <p className="font-heading text-[2rem] leading-none tracking-[-0.05em] text-[#1E2519] ltr-nums">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-[#68725F]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Animated review cards ── */}
            <ReviewCardsClient reviews={reviews} />

            {/* ── Bottom CTA ── */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#ECE4D8] pt-6">
              <p className="text-sm leading-7 text-[#5B6455]">{t('reviews.bottomText')}</p>
              <Link
                href="/reviews"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#273E1C] transition-colors hover:text-[#4D6631]"
              >
                {t('reviews.readMore')}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl-flip" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
