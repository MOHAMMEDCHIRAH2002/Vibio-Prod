'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, PencilLine } from 'lucide-react';
import { toast } from 'sonner';
import { submissionsApi } from '@/lib/api';

export default function OrderModificationForm({ orderId }: { orderId: string }) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      toast.error(t('orderMod.errShort'));
      return;
    }
    setSending(true);
    try {
      await submissionsApi.orderModification({ orderId, message: message.trim() });
      setSent(true);
    } catch (e: any) {
      toast.error(e?.message || t('contact.errSend'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="surface-panel p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
          <PencilLine className="h-4 w-4" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
          {t('orderMod.title')}
        </p>
      </div>

      {sent ? (
        <div className="mt-5 flex items-center gap-3 rounded-[18px] border border-[#CBE0C3] bg-[#EFF5E7] px-4 py-4 text-sm text-[#2F6A37]">
          <Check className="h-4 w-4 flex-shrink-0" />
          {t('orderMod.success')}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <p className="text-sm leading-6 text-[#66655D]">{t('orderMod.subtitle')}</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder={t('orderMod.placeholder')}
            className="field-luxury resize-none"
          />
          <button type="submit" disabled={sending} className="btn-outline-gold w-full justify-center disabled:opacity-60">
            {sending ? t('common.loading') : t('orderMod.submit')}
          </button>
        </form>
      )}
    </div>
  );
}
