'use client';

import Link from 'next/link';
import { MapPin, Clock, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { storeConfig } from '@/lib/storeConfig';
import VisitStoreCTA from '@/components/store/VisitStoreCTA';

export default function VisitStoreSection() {
  const { t } = useTranslation();
  const s = storeConfig;

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="relative overflow-hidden rounded-[38px] border border-[#2C4A1E] bg-[#1E3514] px-6 py-12 shadow-[0_30px_80px_rgba(23,42,15,0.35)] sm:px-10 lg:px-14 lg:py-16">
          {/* Botanical light */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full bg-[#D8B36A]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-8 h-96 w-96 rounded-full bg-[#3D8B45]/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(216,179,106,0.12),transparent_45%)]" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D8B36A]">
                {t('store.eyebrow')}
              </p>
              <h2 className="mt-4 font-heading text-[clamp(2.3rem,4.5vw,3.8rem)] leading-[0.98] tracking-[-0.05em] text-[#FBF7EE]">
                {t('store.homeTitle')}
              </h2>
              <p className="mt-5 max-w-lg text-[15px] leading-8 text-[#CBD6BE]">
                {t('store.homeSubtitle')}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <VisitStoreCTA
                  variant="outline"
                  showArrow
                  className="border-transparent bg-[#FBF7EE] text-[#1E3514] hover:bg-white"
                />
                <Link
                  href="/store"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-[#FBF7EE] backdrop-blur-sm transition-all duration-300 hover:border-white/45 hover:bg-white/10"
                >
                  <Navigation className="h-4 w-4" />
                  {t('store.getDirections')}
                </Link>
              </div>
            </div>

            {/* Detail cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[26px] border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
                <MapPin className="h-6 w-6 text-[#D8B36A]" />
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9FB08C]">
                  {t('store.addressLabel')}
                </p>
                <p className="mt-2 text-sm leading-7 text-[#EDEFE6]">
                  {s.addressLines.join(', ')}
                </p>
              </div>
              <div className="rounded-[26px] border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
                <Clock className="h-6 w-6 text-[#D8B36A]" />
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9FB08C]">
                  {t('store.hoursLabel')}
                </p>
                <p className="ltr-nums mt-2 text-sm leading-7 text-[#EDEFE6]">
                  {t('store.days.monToFri')}: 09:00 – 19:00
                  <br />
                  {t('store.days.saturday')}: 10:00 – 18:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
