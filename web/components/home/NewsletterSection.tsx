'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, MoveRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { submissionsApi } from '@/lib/api';

export default function NewsletterSection() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    try {
      await submissionsApi.newsletter({ email: email.trim(), website });
      setSubmitted(true);
    } catch (e: any) {
      toast.error(e?.message || t('contact.errSend'));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="surface-shell relative overflow-hidden rounded-[38px] p-5 sm:p-7 lg:p-8">
          {/* Soft background atmosphere */}
          <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#E8D8B8]/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#DDE9D0]/35 blur-3xl" />

          <div className="pointer-events-none absolute -right-10 bottom-0 hidden select-none font-heading text-[clamp(6rem,18vw,14rem)] leading-none tracking-[-0.1em] text-[#273E1C]/[0.035] lg:block">
            Ritual
          </div>

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
            {/* LEFT PANEL */}
            <div className="relative overflow-hidden rounded-[34px] border border-[#D7C5A5] bg-[#F4EFE3] p-7 shadow-[0_24px_70px_rgba(30,37,25,0.055)] sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/45 blur-3xl" />
              <div className="pointer-events-none absolute right-10 top-10 h-10 w-10 rounded-full border border-[#D8BC81] bg-white/55 shadow-[0_16px_42px_rgba(30,37,25,0.06)]" />
              <div className="pointer-events-none absolute left-[28%] top-4 h-3 w-3 rounded-full bg-[#C9A85D] ring-8 ring-[#EAF0E0]" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C8AA] bg-white/55 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6C8349]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t('newsletter.eyebrow')}
                </div>

                <h2 className="mt-7 max-w-4xl font-heading text-[clamp(2.35rem,4.2vw,3.85rem)] leading-[0.94] tracking-[-0.065em] text-[#1E2519]">
                  {t('newsletter.title')}
                </h2>

                <p className="mt-7 max-w-3xl text-[15px] leading-8 text-[#52604C]">
                  {t('newsletter.leftBody')}
                </p>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {[
                    t('newsletter.chipPrivate'),
                    t('newsletter.chipSeasonal'),
                    t('newsletter.chipNoNoise'),
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-full border border-[#D8C8AA] bg-white/40 px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2D3D26]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="relative overflow-hidden rounded-[34px] border border-[#E1D6C5] bg-[#FFFEFA] p-7 shadow-[0_24px_70px_rgba(30,37,25,0.045)] sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute right-[-90px] bottom-[-80px] font-heading text-[12rem] leading-none tracking-[-0.1em] text-[#273E1C]/[0.035]">
                R
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="relative z-10 flex min-h-[330px] flex-col items-center justify-center text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C] shadow-[0_18px_42px_rgba(30,37,25,0.08)]">
                    <Check className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 font-heading text-[2.3rem] leading-none tracking-[-0.055em] text-[#1E2519]">
                    {t('newsletter.successTitle')}
                  </h3>

                  <p className="mt-4 max-w-md text-sm leading-7 text-[#5B6455]">
                    {t('newsletter.successBody')}
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="relative z-10 flex min-h-[330px] flex-col justify-center"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#78805F]">
                    {t('newsletter.formEyebrow')}
                  </p>

                  <h3 className="mt-4 font-heading text-[clamp(2rem,2.7vw,2.7rem)] leading-[0.98] tracking-[-0.055em] text-[#1E2519]">
                    {t('newsletter.formTitle')}
                  </h3>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5B6455]">
                    {t('newsletter.formDescription')}
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={t('newsletter.emailPlaceholder')}
                      required
                      className="min-h-[56px] flex-1 rounded-[18px] border border-[#D8D0C4] bg-white/80 px-5 text-sm text-[#1E2519] outline-none transition-all duration-300 placeholder:text-[#9A968D] focus:border-[#B99B62] focus:bg-white focus:ring-4 focus:ring-[#D8B36A]/10"
                    />

                    <button
                      type="submit"
                      disabled={sending}
                      className="group inline-flex min-h-[56px] items-center justify-center gap-3 rounded-[18px] bg-[#214915] px-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_18px_42px_rgba(33,73,21,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#18370F] disabled:opacity-60"
                    >
                      {sending ? t('common.loading') : t('newsletter.subscribe')}
                      <MoveRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl-flip" />
                    </button>
                  </div>

                  {/* Honeypot */}
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                  />

                  <div className="mt-7 border-t border-[#E8DECE] pt-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#EFF5E7] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4F633F]">
                        {t('newsletter.noSpam')}
                      </span>

                      <p className="text-xs leading-6 text-[#78805F]">
                        {t('newsletter.note')}
                      </p>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}