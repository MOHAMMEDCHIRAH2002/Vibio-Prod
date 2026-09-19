'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { Check, HelpCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { submissionsApi } from '@/lib/api';

type Form = { name: string; email?: string; phone?: string; message: string; website?: string };

export default function ProductInquiry({
  productId,
  productName,
  className = '',
}: {
  productId: string;
  productName: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    defaultValues: { name: session?.user?.name || '', email: session?.user?.email || '' },
  });

  const onSubmit = async (data: Form) => {
    setSending(true);
    try {
      await submissionsApi.inquiry({ ...data, productId, productName });
      setSent(true);
    } catch (e: any) {
      toast.error(e?.message || t('contact.errSend'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`surface-panel overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
            <HelpCircle className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
            {t('inquiry.title')}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-[#5B6455] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-[#ECE6D9] px-5 py-5">
          {sent ? (
            <div className="flex items-center gap-3 rounded-[18px] border border-[#CBE0C3] bg-[#EFF5E7] px-4 py-4 text-sm text-[#2F6A37]">
              <Check className="h-4 w-4 flex-shrink-0" />
              {t('inquiry.success')}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <p className="text-sm leading-6 text-[#66655D]">{t('inquiry.about', { name: productName })}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input {...register('name', { required: true, minLength: 2 })} placeholder={t('inquiry.name')} className="field-luxury !py-3" />
                <input {...register('phone')} placeholder={t('inquiry.phone')} className="field-luxury !py-3" />
              </div>
              <input {...register('email')} placeholder={t('inquiry.email')} className="field-luxury !py-3" />
              <textarea
                {...register('message', { required: true, minLength: 5 })}
                rows={3}
                placeholder={t('inquiry.message')}
                className="field-luxury resize-none"
              />
              {(errors.name || errors.message) && (
                <p className="text-xs text-[#C9571A]">{t('inquiry.errRequired')}</p>
              )}
              {/* Honeypot */}
              <input
                {...register('website')}
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />
              <button type="submit" disabled={sending} className="btn-outline-gold w-full justify-center disabled:opacity-60">
                {sending ? t('common.loading') : t('inquiry.submit')}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
