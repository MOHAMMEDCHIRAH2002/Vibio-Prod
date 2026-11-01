'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Mail, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { accountApi, ordersApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-[#F4E5C6] text-[#8A631D]',
  PROCESSING: 'bg-[#E4ECF4] text-[#44637C]',
  SHIPPED: 'bg-[#ECE4F3] text-[#6A4B88]',
  DELIVERED: 'bg-[#E0EEE6] text-[#2A6A45]',
  CANCELLED: 'bg-[#F7E3DE] text-[#C9571A]',
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => accountApi.getCustomer(id),
    enabled: !!id,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['customer-orders', id],
    queryFn: () => ordersApi.listByCustomer(id),
    enabled: !!id,
  });

  const currentCustomer = customer as any;
  const orders = Array.isArray(ordersData)
    ? ordersData
    : Array.isArray((ordersData as any)?.orders)
      ? (ordersData as any).orders
      : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="admin-panel h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!currentCustomer) {
    return (
      <div className="admin-panel admin-empty p-6">
        <p className="text-sm">{t('admin.customerDetail.notFound')}</p>
        <Link href="/admin/customers" className="mt-3 admin-btn-secondary">
          {t('admin.customerDetail.back')}
        </Link>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

  return (
    <div className="admin-page" dir={i18n.resolvedLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-wrap items-start gap-4">
          <Link href="/admin/customers" className="admin-action-icon">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="admin-eyebrow">{t('admin.customerDetail.detail')}</p>
            <h1 className="mt-3 font-heading text-[clamp(2.1rem,4vw,3.6rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              {currentCustomer.name || t('admin.customerDetail.unnamed')}
            </h1>
            <p className="mt-3 text-sm text-[#6B6A63]">
              {t('admin.customerDetail.joined')} {new Date(currentCustomer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-5">
          <div className="admin-panel p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F0E7DA] text-2xl font-bold text-[#8A6430]">
                {currentCustomer.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <h2 className="mt-4 font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#171C14]">
                {currentCustomer.name || t('admin.customerDetail.unnamed')}
              </h2>
              <span
                className={
                  currentCustomer.role === 'ADMIN'
                    ? 'admin-badge mt-3 bg-[#ECE4F3] text-[#6A4B88]'
                    : 'admin-badge mt-3 bg-[#ECE7E1] text-[#665E55]'
                }
              >
                {currentCustomer.role}
              </span>
            </div>

            <div className="mt-6 space-y-3 text-sm text-[#5E5C54]">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[#7A776F]" />
                <span className="truncate">{currentCustomer.email}</span>
              </div>
              {currentCustomer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[#7A776F]" />
                  <span>{currentCustomer.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[#7A776F]" />
                <span>{t('admin.customerDetail.joined')} {new Date(currentCustomer.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="admin-panel p-6">
            <p className="admin-eyebrow">{t('admin.customerDetail.clientValue')}</p>
            <h3 className="mt-3 font-heading text-[1.75rem] leading-none tracking-[-0.05em] text-[#171C14]">
              {t('admin.customerDetail.snapshot')}
            </h3>
            <div className="mt-5 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-[#6B6A63]">{t('admin.customerDetail.totalOrders')}</span>
                <span className="font-semibold text-[#171C14]">{orders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B6A63]">{t('admin.customerDetail.totalSpent')}</span>
                <span className="font-semibold text-[#2E6049]">{formatPrice(totalSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B6A63]">{t('admin.customerDetail.averageOrder')}</span>
                <span className="font-semibold text-[#171C14]">
                  {orders.length ? formatPrice(totalSpent / orders.length) : '-'}
                </span>
              </div>
            </div>
          </div>

          {currentCustomer.addresses?.length > 0 && (
            <div className="admin-panel p-6">
              <p className="admin-eyebrow">{t('admin.customerDetail.addresses')}</p>
              <h3 className="mt-3 font-heading text-[1.75rem] leading-none tracking-[-0.05em] text-[#171C14]">
                {t('admin.customerDetail.savedLocations')}
              </h3>
              <div className="mt-5 space-y-4">
                {currentCustomer.addresses.map((address: any) => (
                  <div key={address.id} className="flex gap-3 text-sm text-[#5E5C54]">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#7A776F]" />
                    <div>
                      <p className="font-semibold text-[#171C14]">
                        {address.firstName} {address.lastName}
                      </p>
                      <p>
                        {address.address1}
                        {address.address2 ? `, ${address.address2}` : ''}
                      </p>
                      <p>
                        {address.city}, {address.country}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="admin-panel p-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-[#6C8349]" />
            <div>
              <p className="admin-eyebrow">{t('admin.customerDetail.purchaseHistory')}</p>
              <h2 className="mt-2 font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#171C14]">
                {t('admin.customerDetail.orders')}
              </h2>
            </div>
            <span className="ml-auto admin-chip">{t('admin.customerDetail.orderCount', { count: orders.length })}</span>
          </div>

          {orders.length === 0 ? (
            <div className="admin-empty p-6">
              <p className="text-sm">{t('admin.customerDetail.noOrders')}</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {orders.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block rounded-[1.35rem] border border-[#EFE8DE] bg-white/55 p-4 transition-colors hover:bg-white/85"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#171C14]">
                          #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <span className={`admin-badge ${STATUS_COLORS[order.status] || 'bg-[#ECE7E1] text-[#665E55]'}`}>
                          {t(`orderStatus.${order.status}`, { defaultValue: order.status })}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[#7A776F]">
                        {new Date(order.createdAt).toLocaleDateString()} - {order.items?.length ?? 0} {t('admin.customerDetail.items')}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[#171C14]">{formatPrice(order.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
