'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ordersApi } from '@/lib/api';
import OrderEditor from '@/components/admin/OrderEditor';
import { useTranslation } from 'react-i18next';

export default function AdminCreateOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const createMutation = useMutation({
    mutationFn: ordersApi.adminCreate,
    onSuccess: async (order) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stock'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
      ]);
      toast.success(t('adminOrderForm.created'));
      router.push('/admin/orders');
    },
    onError: () => toast.error(t('adminOrderForm.createFailed')),
  });

  return (
    <div className="admin-page" dir={i18n.resolvedLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <section className="admin-panel p-6 sm:p-7">
        <Link href="/admin/orders" className="admin-action-icon">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="admin-eyebrow mt-5">{t('adminOrderForm.adminOrder')}</p>
        <h1 className="mt-3 font-heading text-[clamp(2rem,4vw,3.4rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
          {t('adminOrderForm.createTitle')}
        </h1>
        <p className="admin-subcopy mt-3 max-w-2xl">
          {t('adminOrderForm.createDescription')}
        </p>
      </section>
      <OrderEditor saving={createMutation.isPending} onSubmit={(data) => createMutation.mutate(data)} />
    </div>
  );
}
