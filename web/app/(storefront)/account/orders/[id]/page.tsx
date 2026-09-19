'use client';

import Link from 'next/link';
import Image from '@/components/common/OptimizedImage';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check, CheckCircle } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import OrderModificationForm from '@/components/common/OrderModificationForm';

// A customer can request a change while the order is still open (not delivered,
// cancelled, or refunded).
const MODIFIABLE = ['PENDING', 'CONFIRMED', 'PROCESSING'];

const statusClasses: Record<string, string> = {
  PENDING: 'bg-[#F6E9D8] text-[#A46A1F]',
  CONFIRMED: 'bg-[#E8F0E5] text-[#273E1C]',
  PROCESSING: 'bg-[#EFF5E7] text-[#273E1C]',
  SHIPPED: 'bg-[#EAF0F4] text-[#3C5A72]',
  DELIVERED: 'bg-[#E3F0E3] text-[#2F6A37]',
  CANCELLED: 'bg-[#FCE9E2] text-[#C9571A]',
  REFUNDED: 'bg-[#F0ECE2] text-[#5B6455]',
};

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === '1';

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.byId(id),
  });

  if (isLoading) {
    return (
      <div className="surface-shell p-6 sm:p-7">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 rounded-[28px] skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (!order) return null;
  const currentOrder = order as any;
  const stepIndex = STATUS_STEPS.indexOf(currentOrder.status);

  return (
    <div className="space-y-6">
      {isSuccess && (
        <div className="surface-shell p-5">
          <div className="flex items-start gap-4 rounded-[24px] bg-[#E3F0E3] px-5 py-5 text-[#2F6A37]">
            <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em]">Order placed successfully</p>
              <p className="mt-2 text-sm leading-7">
                Thank you for your order. You will receive a confirmation email shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="surface-shell p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-4 border-b border-[#ECE6D9] pb-5">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5B6455] transition-colors hover:text-[#1E2519]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>

          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
              #{currentOrder.orderNumber}
            </p>
            <p className="mt-1 text-sm text-[#5B6455]">{formatDate(currentOrder.createdAt)}</p>
          </div>

          <span
            className={`ml-auto rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
              statusClasses[currentOrder.status] || statusClasses.PENDING
            }`}
          >
            {currentOrder.status}
          </span>
        </div>

        {currentOrder.status !== 'CANCELLED' && currentOrder.status !== 'REFUNDED' && (
          <div className="mt-6 surface-panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
              Order progress
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 lg:flex-nowrap">
              {STATUS_STEPS.map((step, index) => (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${
                        index <= stepIndex ? 'bg-[#273E1C] text-white' : 'bg-[#F0ECE2] text-[#78805F]'
                      }`}
                    >
                      {index < stepIndex ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <span className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#78805F]">
                      {step.toLowerCase()}
                    </span>
                  </div>

                  {index < STATUS_STEPS.length - 1 && (
                    <div className={`mx-2 h-px flex-1 ${index < stepIndex ? 'bg-[#273E1C]' : 'bg-[#DEDACE]'}`} />
                  )}
                </div>
              ))}
            </div>

            {currentOrder.trackingNumber && (
              <p className="mt-5 border-t border-[#ECE6D9] pt-4 text-sm text-[#5B6455]">
                Tracking number: <span className="font-semibold text-[#1E2519]">{currentOrder.trackingNumber}</span>
              </p>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="surface-panel p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">Items</p>
              <div className="mt-5 space-y-4">
                {currentOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 rounded-[22px] bg-white/70 px-4 py-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[18px] bg-[#F7F4EC]">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1E2519]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-[#5B6455]">
                        {item.variantName} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-heading text-[1.2rem] leading-none tracking-[-0.04em] text-[#1E2519]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-panel p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
                Shipping address
              </p>
              {currentOrder.shippingAddress && (
                <div className="mt-4 text-sm leading-7 text-[#5B6455]">
                  <p className="font-semibold uppercase tracking-[0.12em] text-[#1E2519]">
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
          </div>

          <div className="surface-panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">Order total</p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#5B6455]">Subtotal</span>
                <span className="text-[#1E2519]">{formatPrice(currentOrder.subtotal)}</span>
              </div>
              {currentOrder.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#5B6455]">Discount</span>
                  <span className="text-[#2F6A37]">-{formatPrice(currentOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#5B6455]">Shipping</span>
                <span className="text-[#1E2519]">
                  {currentOrder.shippingCost === 0 ? 'Free' : formatPrice(currentOrder.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#ECE6D9] pt-4">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">Total</span>
                <span className="font-heading text-[1.7rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                  {formatPrice(currentOrder.total)}
                </span>
              </div>
            </div>

            {MODIFIABLE.includes(currentOrder.status) && (
              <OrderModificationForm orderId={currentOrder.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
