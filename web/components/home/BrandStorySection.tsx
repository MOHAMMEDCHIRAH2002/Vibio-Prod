'use client';

import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const pillars = [
  { index: '01', titleKey: 'brandStory.pillars.p1Title', textKey: 'brandStory.pillars.p1Text' },
  { index: '02', titleKey: 'brandStory.pillars.p2Title', textKey: 'brandStory.pillars.p2Text' },
  { index: '03', titleKey: 'brandStory.pillars.p3Title', textKey: 'brandStory.pillars.p3Text' },
];

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.60, ease: [0.22, 1, 0.36, 1], delay } },
});

export default function BrandStorySection() {
  const { t } = useTranslation();
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="surface-shell relative overflow-hidden rounded-[38px] p-5 sm:p-7 lg:p-8">

          {/* Ambient light blobs */}
          <div className="pointer-events-none absolute -left-28 top-10 h-80 w-80 rounded-full bg-[#E8D8B8]/35 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#DDE9D0]/45 blur-3xl" />

          {/* Watermark */}
          <div className="pointer-events-none absolute right-8 top-6 hidden select-none font-heading text-[clamp(6rem,13vw,13rem)] leading-none tracking-[-0.1em] text-[#273E1C]/[0.025] lg:block">
            Maison
          </div>

          <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

            {/* ── LEFT — editorial visual ── */}
            <motion.div
              variants={fadeUp(0)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-[36px] border border-[#D8C8AC] bg-[#F6F1E8] p-3 shadow-[0_30px_90px_rgba(30,37,25,0.08)]">
                <div className="relative h-[460px] overflow-hidden rounded-[30px] bg-[#EFE8DC] sm:h-[520px] lg:h-[560px]">
                  <Image
                    src="/HeroImg.png"
                    alt="Vibio ritual table"
                    fill
                    priority={false}
                    sizes="(max-width: 1024px) 100vw, 44vw"
                    className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.025]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,254,250,0.12)_45%,rgba(20,28,18,0.24)_100%)]" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(255,254,250,0.82))]" />
                  <div className="pointer-events-none absolute left-7 top-7 h-3 w-3 rounded-full bg-[#C9A85D] ring-8 ring-white/45" />
                  <div className="pointer-events-none absolute right-8 top-8 h-14 w-14 rounded-full border border-white/70 bg-white/25 shadow-[0_18px_45px_rgba(30,37,25,0.1)] backdrop-blur-md" />
                </div>

                {/* Inline caption */}
                <div className="absolute bottom-7 left-7 right-7 rounded-[26px] border border-white/75 bg-white/78 p-4 shadow-[0_20px_52px_rgba(30,37,25,0.11)] backdrop-blur-md sm:left-8 sm:right-auto sm:max-w-[320px]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6C8349]">
                    {t('brandStory.maisonLabel')}
                  </p>
                  <p className="mt-2 font-heading text-[clamp(1.35rem,1.75vw,1.75rem)] leading-[1.05] tracking-[-0.045em] text-[#1E2519]">
                    {t('brandStory.maisonTitle')}
                  </p>
                </div>
              </div>

              {/* Floating editorial note */}
              <div className="relative z-20 mx-auto -mt-8 max-w-[84%] rounded-[26px] border border-[#DCCCAF] bg-[#F8F1E4] p-4 shadow-[0_18px_46px_rgba(30,37,25,0.075)] sm:max-w-[70%] lg:absolute lg:-right-6 lg:bottom-9 lg:mt-0 lg:max-w-[285px]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8A754B]">
                  {t('brandStory.heritageLabel')}
                </p>
                <p className="mt-3 font-heading text-[1.45rem] leading-[1.08] tracking-[-0.045em] text-[#1E2519]">
                  {t('brandStory.heritageTitle')}
                </p>
                <p className="mt-4 text-sm leading-7 text-[#5D6658]">
                  {t('brandStory.heritageText')}
                </p>
              </div>
            </motion.div>

            {/* ── RIGHT — brand narrative ── */}
            <div className="relative lg:pl-8">

              <motion.div
                variants={fadeUp(0.08)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
              >
                <p className="section-eyebrow">{t('brandStory.eyebrow')}</p>
                <h2 className="mt-3 max-w-4xl font-heading text-[clamp(2.65rem,5.2vw,4.75rem)] leading-[0.91] tracking-[-0.075em] text-[#1E2519]">
                  {t('brandStory.title')}
                </h2>
              </motion.div>

              <motion.div
                variants={fadeUp(0.16)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-start"
              >
                <p className="max-w-2xl text-[15px] leading-8 text-[#596353]">
                  {t('brandStory.body')}
                </p>

                <div className="border-l border-[#C9A85D] pl-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7A8162]">
                    {t('brandStory.promiseLabel')}
                  </p>
                  <p className="mt-3 font-heading italic text-[1.35rem] leading-[1.2] tracking-[-0.035em] text-[#2A3125]">
                    “{t('brandStory.promise')}”
                  </p>
                </div>
              </motion.div>

              {/* Pillars with stagger */}
              <motion.div
                variants={fadeUp(0.22)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                className="mt-9 overflow-hidden rounded-[32px] border border-[#E1D6C5] bg-white/72 shadow-[0_24px_70px_rgba(30,37,25,0.055)] backdrop-blur-sm"
              >
                {pillars.map((pillar, i) => (
                  <motion.div
                    key={pillar.index}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1], delay: 0.28 + i * 0.08 }}
                    className="grid gap-4 border-b border-[#E8DECE] px-5 py-4 transition-colors duration-300 last:border-b-0 hover:bg-[#FFFBF3] sm:grid-cols-[3.75rem_1fr]"
                  >
                    <p className="font-heading text-[1.35rem] leading-none tracking-[-0.04em] text-[#C3A46D] ltr-nums">
                      {pillar.index}
                    </p>
                    <div>
                      <h3 className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#1E2519]">
                        {t(pillar.titleKey)}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-[#5B6455]">
                        {t(pillar.textKey)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA row */}
              <motion.div
                variants={fadeUp(0.38)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                className="mt-8 flex flex-col gap-5 border-t border-[#E8DECE] pt-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7A8162]">
                    {t('brandStory.footLabel')}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#6A7065]">
                    {t('brandStory.footText')}
                  </p>
                </div>

                <Link
                  href="/about"
                  className="group inline-flex w-fit items-center gap-3 rounded-[14px] bg-[#214915] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_18px_42px_rgba(33,73,21,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#18370F]"
                >
                  {t('brandStory.cta')}
                  <span
                    aria-hidden
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
