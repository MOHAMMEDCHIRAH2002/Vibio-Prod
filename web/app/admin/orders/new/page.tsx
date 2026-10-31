'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ordersApi } from '@/lib/api';
import OrderEditor from '@/components/admin/OrderEditor';

export default function AdminCreateOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: ordersApi.adminCreate,
    onSuccess: async (order) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stock'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
      ]);
      toast.success('Order created');
      router.push('/admin/orders');
    },
    onError: () => toast.error('Unable to create order. Check customer, item availability, and stock.'),
  });

  return (
    <div className="admin-page">
      <section className="admin-panel p-6 sm:p-7">
        <Link href="/admin/orders" className="admin-action-icon">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="admin-eyebrow mt-5">Admin order</p>
        <h1 className="mt-3 font-heading text-[clamp(2rem,4vw,3.4rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
          Create an order
        </h1>
        <p className="admin-subcopy mt-3 max-w-2xl">
          Place an order for an existing customer. Current catalog prices and inventory are checked when saved.
        </p>
      </section>
      <OrderEditor saving={createMutation.isPending} onSubmit={(data) => createMutation.mutate(data)} />
    </div>
  );
}
