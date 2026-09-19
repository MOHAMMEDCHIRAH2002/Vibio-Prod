'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Check, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';
import { submissionsApi } from '@/lib/api';

type Form = { name: string; phone: string; preferredTime?: string; website?: string };

export default function CallbackForm({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>();

  const onSubmit = async (data: Form) => {
    setSending(true);
    try {
      await submissionsApi.callback(data);
      setSent(true);
    } catch (e: any) {
      toast.error(e?.message || t('contact.errSend'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`surface-panel p-6 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
          <PhoneCall className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
            {t('callback.title')}
          </p>
          <p className="mt-1 text-sm text-[#66655D]">{t('callback.subtitle')}</p>
        </div>
      </div>

      {sent ? (
        <div className="mt-5 flex items-center gap-3 rounded-[18px] border border-[#CBE0C3] bg-[#EFF5E7] px-4 py-4 text-sm text-[#2F6A37]">
          <Check className="h-4 w-4 flex-shrink-0" />
          {t('callback.success')}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <input
                {...register('name', { required: true, minLength: 2 })}
                placeholder={t('callback.name')}
                className="field-luxury !py-3"
              />
              {errors.name && <p className="mt-1 text-xs text-[#C9571A]">{t('callback.errName')}</p>}
            </div>
            <div>
              <input
                {...register('phone', { required: true, minLength: 6 })}
                placeholder={t('callback.phone')}
                className="field-luxury !py-3"
              />
              {errors.phone && <p className="mt-1 text-xs text-[#C9571A]">{t('callback.errPhone')}</p>}
            </div>
          </div>
          <input
            {...register('preferredTime')}
            placeholder={t('callback.preferredTime')}
            className="field-luxury !py-3"
          />
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
            {sending ? t('common.loading') : t('callback.submit')}
          </button>
        </form>
      )}
    </div>
  );
}
