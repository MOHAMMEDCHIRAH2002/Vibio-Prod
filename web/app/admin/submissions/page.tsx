'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Phone, Check, Inbox } from 'lucide-react';
import { submissionsApi, type Submission } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const TYPES = ['', 'CONTACT', 'CALLBACK', 'PRODUCT_INQUIRY', 'NEWSLETTER', 'ORDER_MODIFICATION', 'SUPPORT'] as const;

const TYPE_LABEL: Record<string, string> = {
  CONTACT: 'Contact',
  CALLBACK: 'Callback',
  PRODUCT_INQUIRY: 'Product inquiry',
  NEWSLETTER: 'Newsletter',
  ORDER_MODIFICATION: 'Order change',
  SUPPORT: 'Support',
};

const TYPE_BADGE: Record<string, string> = {
  CONTACT: 'bg-[#EAF0F4] text-[#3C5A72]',
  CALLBACK: 'bg-[#F6E9D8] text-[#A46A1F]',
  PRODUCT_INQUIRY: 'bg-[#EFF5E7] text-[#2F6A37]',
  NEWSLETTER: 'bg-[#F0ECE2] text-[#5B6455]',
  ORDER_MODIFICATION: 'bg-[#FCE9E2] text-[#C9571A]',
  SUPPORT: 'bg-[#E8F0E5] text-[#273E1C]',
};

export default function AdminSubmissionsPage() {
  const qc = useQueryClient();
  const [type, setType] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'submissions', type],
    queryFn: () => submissionsApi.adminList({ type: type || undefined, limit: 100 }),
  });

  const toggle = useMutation({
    mutationFn: ({ id, handled }: { id: string; handled: boolean }) =>
      submissionsApi.setHandled(id, handled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'submissions'] }),
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="surface-shell p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
            <Inbox className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-[2rem] leading-none tracking-[-0.05em] text-[#1E2519]">
              Customer requests
            </h1>
            <p className="mt-1 text-sm text-[#5B6455]">
              Every contact, callback, inquiry, newsletter signup and order-change request.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {TYPES.map((tp) => (
            <button
              key={tp || 'all'}
              onClick={() => setType(tp)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                type === tp ? 'bg-[#273E1C] text-white' : 'bg-[#F7F4EC] text-[#5B6455] hover:bg-[#EFF5E7]'
              }`}
            >
              {tp ? TYPE_LABEL[tp] : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="surface-shell p-4 sm:p-5">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-[20px] skeleton" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-[#5B6455]">No requests yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((s: Submission) => (
              <div
                key={s.id}
                className={`rounded-[22px] border p-5 transition-colors ${
                  s.handled ? 'border-[#E4E9DD] bg-[#F7F9F4]' : 'border-[#ECE6D9] bg-white/70'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${TYPE_BADGE[s.type]}`}>
                        {TYPE_LABEL[s.type] || s.type}
                      </span>
                      {s.name && <span className="text-sm font-semibold text-[#1E2519]">{s.name}</span>}
                      {s.handled && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F6A37]">
                          <Check className="h-3 w-3" /> Handled
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#5B6455]">
                      {s.email && (
                        <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 hover:text-[#273E1C]">
                          <Mail className="h-3.5 w-3.5" /> {s.email}
                        </a>
                      )}
                      {s.phone && (
                        <a href={`tel:${s.phone}`} className="inline-flex items-center gap-1.5 hover:text-[#273E1C]">
                          <Phone className="h-3.5 w-3.5" /> {s.phone}
                        </a>
                      )}
                      <span>{formatDate(s.createdAt)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggle.mutate({ id: s.id, handled: !s.handled })}
                    disabled={toggle.isPending}
                    className="rounded-full border border-[#D8C7AD] bg-white px-4 py-2 text-xs font-semibold text-[#273E1C] transition-colors hover:border-[#C9A96E] hover:bg-[#FBF7EE] disabled:opacity-50"
                  >
                    {s.handled ? 'Mark open' : 'Mark handled'}
                  </button>
                </div>

                {(s.subject || s.message) && (
                  <div className="mt-3 rounded-[16px] bg-[#FAF7F0] px-4 py-3 text-sm leading-7 text-[#4B463F]">
                    {s.subject && <p className="font-semibold text-[#1E2519]">{s.subject}</p>}
                    {s.message && <p className="whitespace-pre-wrap">{s.message}</p>}
                  </div>
                )}

                {(s.orderId || s.meta?.productName || s.meta?.orderNumber || s.meta?.preferredTime) && (
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#78805F]">
                    {s.meta?.orderNumber && <span>Order #{s.meta.orderNumber}</span>}
                    {s.meta?.productName && <span>Product: {s.meta.productName}</span>}
                    {s.meta?.preferredTime && <span>Preferred time: {s.meta.preferredTime}</span>}
                    {s.orderId && (
                      <a href={`/admin/orders/${s.orderId}`} className="font-semibold text-[#273E1C] underline">
                        Open order →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
