'use client';

import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AboutPageClient() {
  const { t } = useTranslation();

  const storyPillars = [
    { number: '01', title: t('about.pillar1Title'), text: t('about.pillar1Text') },
    { number: '02', title: t('about.pillar2Title'), text: t('about.pillar2Text') },
    { number: '03', title: t('about.pillar3Title'), text: t('about.pillar3Text') },
  ];

  const values = [
    { label: t('about.valueProvLabel'), title: t('about.valueProvTitle'), text: t('about.valueProvText') },
    { label: t('about.valuePresLabel'), title: t('about.valuePresTitle'), text: t('about.valuePresText') },
    { label: t('about.valueGiftLabel'), title: t('about.valueGiftTitle'), text: t('about.valueGiftText') },
  ];

  const chips = [
    t('about.chipTeaCoffee'),
    t('about.chipDatesSweets'),
    t('about.chipChocolate'),
    t('about.chipGiftBoxes'),
  ];

  return (
    <div className="min-h-screen bg-primary-bg pt-28">
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px] space-y-6">
          {/* HERO */}
          <div className="surface-shell relative overflow-hidden p-5 sm:p-6 lg:p-8">
            <div className="pointer-events-none absolute -right-16 top-4 hidden select-none font-heading text-[15rem] leading-none tracking-[-0.1em] text-[#273E1C]/[0.035] lg:block">
              Maison
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
              {/* LEFT VISUAL */}
              <div className="relative min-h-[560px] overflow-hidden rounded-[34px] border border-[#DCCBAE] bg-[#F5F0E7] shadow-[0_28px_90px_rgba(30,37,25,0.09)]">
                <Image
                  src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1400&q=85"
                  alt="Premium tea ritual with natural ingredients"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,240,231,0.1)_0%,rgba(245,240,231,0.22)_42%,rgba(22,32,18,0.55)_100%)]" />

                <div className="absolute left-6 top-6 flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-[#C9A75C] shadow-[0_0_0_10px_rgba(201,167,92,0.16)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white">
                    {t('about.maison')}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 rounded-[30px] border border-white/35 bg-white/70 p-5 shadow-[0_20px_60px_rgba(20,28,16,0.16)] backdrop-blur-2xl sm:p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6C8349]">
                    {t('about.naturalRituals')}
                  </p>
                  <h2 className="mt-3 max-w-lg font-heading text-[clamp(2rem,3.4vw,3.2rem)] leading-[0.95] tracking-[-0.06em] text-[#1E2519]">
                    {t('about.heroCardTitle')}
                  </h2>
                </div>
              </div>

              {/* RIGHT CONTENT */}
              <div className="flex flex-col justify-between py-2">
                <div>
                  <p className="section-eyebrow">{t('about.eyebrow')}</p>

                  <h1 className="mt-4 max-w-[12ch] font-heading text-[clamp(3.5rem,6.6vw,7rem)] leading-[0.88] tracking-[-0.075em] text-[#1E2519]">
                    {t('about.title')}
                  </h1>

                  <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-start">
                    <p className="max-w-2xl text-[15px] leading-8 text-[#5B6455] sm:text-[16px]">
                      {t('about.intro')}
                    </p>

                    <div className="rounded-[28px] border border-[#DCCBAE] bg-white/70 p-5 shadow-[0_18px_55px_rgba(30,37,25,0.06)]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#A78244]">
                        {t('about.promiseLabel')}
                      </p>
                      <p className="mt-4 font-heading text-[1.65rem] italic leading-[1.08] tracking-[-0.04em] text-[#1E2519]">
                        “{t('about.promise')}”
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 overflow-hidden rounded-[32px] border border-[#DCCBAE] bg-white/70 shadow-[0_24px_70px_rgba(30,37,25,0.07)]">
                  {storyPillars.map((item, index) => (
                    <div
                      key={item.number}
                      className={`grid gap-4 px-5 py-5 sm:grid-cols-[70px_1fr] sm:px-6 ${
                        index !== storyPillars.length - 1 ? 'border-b border-[#E9DDCA]' : ''
                      }`}
                    >
                      <p className="font-heading text-[1.55rem] leading-none tracking-[-0.04em] text-[#B78A42] ltr-nums">
                        {item.number}
                      </p>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1E2519]">
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[#636B5B]">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/shop" className="btn-gold">
                    {t('about.shopCollection')}
                    <ArrowRight className="h-4 w-4 rtl-flip" />
                  </Link>

                  <Link href="/contact" className="lux-pill px-5 py-3">
                    {t('about.speakTeam')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* EDITORIAL GRID */}
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card-luxury relative min-h-[390px] overflow-hidden p-4 sm:col-span-2">
                <div className="relative h-full overflow-hidden rounded-[30px]">
                  <Image
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&q=85"
                    alt="Coffee and tea served as a refined ritual"
                    fill
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(24,31,19,0.56)_100%)]" />
                </div>

                <div className="absolute bottom-8 left-8 max-w-sm rounded-[26px] border border-white/25 bg-[#1E2519]/70 px-5 py-4 text-white shadow-[0_24px_70px_rgba(30,37,25,0.2)] backdrop-blur-xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D7C08C]">
                    {t('about.brandAtmosphere')}
                  </p>
                  <p className="mt-2 font-heading text-[1.8rem] leading-[1.02] tracking-[-0.05em]">
                    {t('about.warmNatural')}
                  </p>
                </div>
              </div>

              <div className="surface-panel relative min-h-[245px] overflow-hidden p-4">
                <div className="relative h-full overflow-hidden rounded-[28px] bg-[#F5F0E7]">
                  <Image
                    src="/accessoires/la-theiere-.jpg"
                    alt="Vibio artisanal tea accessory"
                    fill
                    sizes="360px"
                    className="object-contain p-7"
                  />
                </div>
              </div>

              <div className="surface-olive flex min-h-[245px] flex-col justify-between p-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7B8A5E]">
                    {t('about.designPrinciple')}
                  </p>
                  <p className="mt-4 font-heading text-[2rem] leading-[1] tracking-[-0.06em] text-[#1E2519]">
                    {t('about.premiumNotDistant')}
                  </p>
                </div>

                <p className="text-sm leading-7 text-[#4E5948]">
                  {t('about.premiumNotDistantText')}
                </p>
              </div>
            </div>

            {/* RIGHT STORY BLOCK */}
            <div className="surface-shell p-6 sm:p-7 lg:p-8">
              <p className="section-eyebrow">{t('about.guidesEyebrow')}</p>

              <h2 className="mt-4 max-w-3xl font-heading text-[clamp(2.8rem,5vw,5rem)] leading-[0.9] tracking-[-0.07em] text-[#1E2519]">
                {t('about.guidesTitle')}
              </h2>

              <p className="mt-6 max-w-3xl text-[15px] leading-8 text-[#5B6455] sm:text-[16px]">
                {t('about.guidesText')}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {values.map((item) => (
                  <div
                    key={item.title}
                    className="group rounded-[28px] border border-[#E2D4BE] bg-white/70 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#C9A75C] hover:shadow-[0_22px_60px_rgba(30,37,25,0.08)]"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#A78244]">
                      {item.label}
                    </p>
                    <h3 className="mt-5 font-heading text-[1.9rem] leading-[1] tracking-[-0.055em] text-[#1E2519]">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[#646B5E]">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-9 border-t border-[#E9DDCA] pt-7">
                <Link
                  href="/gifts"
                  className="inline-flex items-center gap-3 text-sm font-semibold text-[#273E1C] transition hover:gap-4"
                >
                  {t('about.exploreGifting')}
                  <ArrowRight className="h-4 w-4 rtl-flip" />
                </Link>
              </div>
            </div>
          </div>

          {/* FINAL SIGNATURE STRIP */}
          <div className="surface-shell overflow-hidden p-0">
            <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
              <div className="relative min-h-[360px] bg-[#F5F0E7]">
                <Image
                  src="https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=1400&q=85"
                  alt="Premium natural products and ingredients"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(30,37,25,0.55),rgba(30,37,25,0.12))]" />
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-12">
                <p className="section-eyebrow">{t('about.povEyebrow')}</p>
                <h2 className="mt-4 max-w-3xl font-heading text-[clamp(2.6rem,4.8vw,4.9rem)] leading-[0.9] tracking-[-0.07em] text-[#1E2519]">
                  {t('about.povTitle')}
                </h2>
                <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#5B6455]">
                  {t('about.povText')}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {chips.map((item) => (
                    <span key={item} className="lux-pill px-5 py-3">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
