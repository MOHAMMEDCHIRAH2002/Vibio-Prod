'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import VisitStoreCTA from '@/components/store/VisitStoreCTA';
import CallbackForm from '@/components/common/CallbackForm';
import { submissionsApi } from '@/lib/api';

type Form = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string; // honeypot
};

export default function ContactPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const schema = z.object({
    name: z.string().min(2, { message: t('contact.errName') }),
    email: z.string().email({ message: t('contact.errEmail') }),
    subject: z.string().min(3, { message: t('contact.errSubject') }),
    message: z.string().min(10, { message: t('contact.errMessage') }),
    website: z.string().optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setSending(true);
    try {
      await submissionsApi.contact(data);
      setSubmitted(true);
    } catch (e: any) {
      toast.error(e?.message || t('contact.errSend'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg pt-28">
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px] space-y-6">
          <div className="surface-shell p-6 sm:p-7 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <p className="section-eyebrow">{t('contact.eyebrow')}</p>
                <h1 className="max-w-[10ch] font-heading text-[clamp(3rem,6vw,5.1rem)] leading-[0.92] tracking-[-0.06em] text-[#1E2519]">
                  {t('contact.title')}
                </h1>
                <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#5B6455] sm:text-[16px]">
                  {t('contact.subtitle')}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: t('contact.replyTime'), label: t('contact.replyTimeLabel') },
                  { value: t('contact.concierge'), label: t('contact.giftSupport') },
                  { value: t('contact.casablanca'), label: t('contact.basedMorocco') },
                ].map((item) => (
                  <div key={item.label} className="surface-panel px-5 py-5">
                    <p className="font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[#68725F]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="surface-shell p-6 sm:p-7">
              <p className="section-eyebrow">{t('contact.speakWithUs')}</p>
              <h2 className="font-heading text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
                {t('contact.conciergeTitle')}
              </h2>

              <div className="mt-8 space-y-4">
                {[
                  {
                    icon: Mail,
                    title: t('contact.emailUs'),
                    content: 'hello@vibio.com',
                    sub: t('contact.emailSub'),
                  },
                  {
                    icon: Phone,
                    title: t('contact.callUs'),
                    content: '+212 6 00 00 00 00',
                    sub: t('contact.callSub'),
                  },
                  {
                    icon: MapPin,
                    title: t('contact.visitTitle'),
                    content: 'Casablanca, Morocco',
                    sub: t('contact.visitSub'),
                  },
                ].map(({ icon: Icon, title, content, sub }) => (
                  <div key={title} className="surface-panel flex gap-4 px-5 py-5">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
                        {title}
                      </p>
                      <p className="mt-1 text-sm text-[#4E5948]">{content}</p>
                      <p className="mt-2 text-sm leading-7 text-[#66655D]">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://wa.me/212600000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-full bg-[#273E1C] px-6 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('contact.whatsapp')}
                </a>
                <VisitStoreCTA variant="outline" showArrow />
              </div>

              <CallbackForm className="mt-6" />
            </div>

            <div className="surface-shell p-6 sm:p-7">
              {submitted ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                    <Check className="h-7 w-7" />
                  </div>
                  <h2 className="mt-6 font-heading text-[2.3rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                    {t('contact.received')}
                  </h2>
                  <p className="mt-4 max-w-lg text-[15px] leading-8 text-[#5B6455]">
                    {t('contact.receivedDesc')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <p className="section-eyebrow">{t('contact.inquiryForm')}</p>
                    <h2 className="font-heading text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
                      {t('contact.tellUs')}
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                        {t('contact.name')}
                      </label>
                      <input {...register('name')} className="field-luxury" />
                      {errors.name && <p className="mt-2 text-xs text-[#C9571A]">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                        {t('contact.email')}
                      </label>
                      <input {...register('email')} type="email" className="field-luxury" />
                      {errors.email && <p className="mt-2 text-xs text-[#C9571A]">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                      {t('contact.subject')}
                    </label>
                    <input {...register('subject')} className="field-luxury" />
                    {errors.subject && <p className="mt-2 text-xs text-[#C9571A]">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                      {t('contact.message')}
                    </label>
                    <textarea {...register('message')} rows={6} className="field-luxury resize-none" />
                    {errors.message && <p className="mt-2 text-xs text-[#C9571A]">{errors.message.message}</p>}
                  </div>

                  {/* Honeypot — hidden from users, catches bots */}
                  <input
                    {...register('website')}
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                  />

                  <button type="submit" disabled={sending} className="btn-gold w-full justify-center disabled:opacity-60">
                    {sending ? t('common.loading') : t('contact.send')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
