'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { formatDate, getOrderStatusColor } from '@/lib/utils';
import { toast } from 'sonner';
import OrderEditor from '@/components/admin/OrderEditor';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => ordersApi.adminById(id),
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const updateMutation = useMutation({
    mutationFn: () =>
      ordersApi.updateStatus(id, {
        status: newStatus || (order as any)?.status,
        trackingNumber: trackingNumber || undefined,
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin-order', id], refetchType: 'all' }),
        qc.invalidateQueries({ queryKey: ['admin-orders'], refetchType: 'all' }),
        qc.invalidateQueries({ queryKey: ['orders'], refetchType: 'all' }),
        qc.invalidateQueries({ queryKey: ['order', id], refetchType: 'all' }),
        qc.invalidateQueries({ queryKey: ['customer-orders'], refetchType: 'all' }),
        qc.invalidateQueries({ queryKey: ['stats'], refetchType: 'all' }),
      ]);
      toast.success('Order updated');
      router.push('/admin/orders');
    },
    onError: () => toast.error('Failed to update order'),
  });

  const editOrderMutation = useMutation({
    mutationFn: (data: Parameters<typeof ordersApi.adminUpdate>[1]) => ordersApi.adminUpdate(id, data),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin-order', id], refetchType: 'all' }),
        qc.invalidateQueries({ queryKey: ['admin-orders'], refetchType: 'all' }),
        qc.invalidateQueries({ queryKey: ['orders'], refetchType: 'all' }),
        qc.invalidateQueries({ queryKey: ['order', id], refetchType: 'all' }),
        qc.invalidateQueries({ queryKey: ['customer-orders'], refetchType: 'all' }),
        qc.invalidateQueries({ queryKey: ['admin-stock'], refetchType: 'all' }),
        qc.invalidateQueries({ queryKey: ['stats'], refetchType: 'all' }),
      ]);
      toast.success('Order details updated');
      router.push('/admin/orders');
    },
    onError: () => toast.error('Unable to update order. Check item availability and stock.'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="admin-panel h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!order) return null;

  const currentOrder = order as any;

  return (
    <div className="admin-page">
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-wrap items-start gap-4">
          <Link href="/admin/orders" className="admin-action-icon">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="admin-eyebrow">Order detail</p>
            <h1 className="mt-3 font-heading text-[clamp(2.1rem,4vw,3.6rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              #{currentOrder.orderNumber}
            </h1>
            <p className="mt-3 text-sm text-[#6B6A63]">{formatDate(currentOrder.createdAt)}</p>
          </div>
          <span className={`ml-auto admin-badge ${getOrderStatusColor(currentOrder.status)}`}>
            {currentOrder.status}
          </span>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <div className="space-y-5">
          <OrderEditor
            initial={{
              userId: currentOrder.userId,
              customerLabel: `${currentOrder.user?.name || 'Customer'} — ${currentOrder.user?.email || ''}`,
              items: currentOrder.items || [],
              shippingAddress: currentOrder.shippingAddress,
              notes: currentOrder.notes,
              discount: Number(currentOrder.discount),
              loyaltyDiscount: Number(currentOrder.loyaltyDiscount),
            }}
            saving={editOrderMutation.isPending}
            onSubmit={(data) => editOrderMutation.mutate(data)}
          />

          <div className="admin-panel p-5 sm:p-6">
            <p className="admin-eyebrow">Status management</p>
            <h2 className="mt-3 font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#171C14]">
              Update order
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">Status</label>
                <select
                  value={newStatus || currentOrder.status}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="admin-select"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">Tracking Number</label>
                <input
                  value={trackingNumber || currentOrder.trackingNumber || ''}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TRK-123456"
                  className="admin-input"
                />
              </div>
              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="admin-btn-primary disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="admin-panel p-5 sm:p-6">
            <p className="admin-eyebrow">Customer</p>
            <h2 className="mt-3 font-heading text-[1.7rem] leading-none tracking-[-0.05em] text-[#171C14]">
              Order owner
            </h2>
            <div className="mt-5 space-y-2 text-sm text-[#5E5C54]">
              <p className="font-semibold text-[#171C14]">{currentOrder.user?.name || 'Guest'}</p>
              <p>{currentOrder.user?.email}</p>
              {currentOrder.user?.phone && <p>{currentOrder.user.phone}</p>}
            </div>
          </div>

          <div className="admin-panel p-5 sm:p-6">
            <p className="admin-eyebrow">Shipping</p>
            <h2 className="mt-3 font-heading text-[1.7rem] leading-none tracking-[-0.05em] text-[#171C14]">
              Delivery address
            </h2>
            {currentOrder.shippingAddress && (
              <div className="mt-5 space-y-1 text-sm text-[#5E5C54]">
                <p className="font-semibold text-[#171C14]">
                  {currentOrder.shippingAddress.fullName}
                </p>
                <p>{currentOrder.shippingAddress.line1}</p>
                {currentOrder.shippingAddress.line2 && <p>{currentOrder.shippingAddress.line2}</p>}
                <p>
                  {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.country}
                </p>
                <p>{currentOrder.shippingAddress.phone}</p>
              </div>
            )}
          </div>

          <div className="admin-panel p-5 sm:p-6">
            <p className="admin-eyebrow">Payment</p>
            <h2 className="mt-3 font-heading text-[1.7rem] leading-none tracking-[-0.05em] text-[#171C14]">
              Transaction state
            </h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B6A63]">Method</span>
                <span className="capitalize text-[#171C14]">{currentOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6A63]">Status</span>
                <span
                  className={
                    currentOrder.paymentStatus === 'PAID'
                      ? 'font-semibold text-[#2A6A45]'
                      : currentOrder.paymentStatus === 'FAILED'
                        ? 'font-semibold text-[#C9571A]'
                        : 'font-semibold text-[#8A631D]'
                  }
                >
                  {currentOrder.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
