'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Package } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';

const statusClasses: Record<string, string> = {
  PENDING: 'bg-[#F6E9D8] text-[#A46A1F]',
  CONFIRMED: 'bg-[#E8F0E5] text-[#273E1C]',
  PROCESSING: 'bg-[#EFF5E7] text-[#273E1C]',
  SHIPPED: 'bg-[#EAF0F4] text-[#3C5A72]',
  DELIVERED: 'bg-[#E3F0E3] text-[#2F6A37]',
  CANCELLED: 'bg-[#FCE9E2] text-[#C9571A]',
  REFUNDED: 'bg-[#F0ECE2] text-[#5B6455]',
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  if (status === 'unauthenticated') redirect('/login');

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list({ limit: 20 }),
    enabled: !!session,
  });

  const orders = (data as any)?.orders || [];

  return (
    <div className="surface-shell p-6 sm:p-7">
      <div className="mb-6 border-b border-[#ECE6D9] pb-5">
        <p className="section-eyebrow">Orders</p>
        <h2 className="font-heading text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
          Track every purchase in one place.
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 rounded-[28px] skeleton" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="surface-panel py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
            <Package className="h-7 w-7" />
          </div>
          <h3 className="mt-6 font-heading text-[2.2rem] leading-none tracking-[-0.05em] text-[#1E2519]">
            No orders yet.
          </h3>
          <p className="mt-4 text-sm text-[#5B6455]">
            When you place your first order, it will appear here with full status tracking.
          </p>
          <Link href="/shop" className="btn-gold mt-6">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="card-luxury block p-5 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
                      #{order.orderNumber}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                        statusClasses[order.status] || statusClasses.PENDING
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[#5B6455]">{formatDate(order.createdAt)}</p>
                  <p className="mt-1 text-sm text-[#5B6455]">
                    {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <p className="font-heading text-[1.7rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                    {formatPrice(order.total)}
                  </p>
                  <ChevronRight className="h-4 w-4 text-[#273E1C]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
