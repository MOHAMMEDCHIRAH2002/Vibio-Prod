'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Eye, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ordersApi } from '@/lib/api';
import { formatDate, formatPrice, getOrderStatusColor } from '@/lib/utils';

const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', status, page, search],
    queryFn: () =>
      ordersApi.adminList({
        status: status === 'ALL' ? undefined : status,
        page,
        limit: 15,
        search: search || undefined,
      }),
  });

  const orders = (data as any)?.orders || [];
  const total = (data as any)?.total || 0;
  const pages = (data as any)?.pages || 1;

  return (
    <div className="admin-page">
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-eyebrow">{t('admin.ordersPage.eyebrow')}</p>
            <h1 className="mt-4 font-heading text-[clamp(2.2rem,4.5vw,4rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              {t('admin.orders')}
            </h1>
            <p className="admin-subcopy mt-4 max-w-2xl">
              {t('admin.ordersPage.subcopy')}
            </p>
          </div>
          <div className="admin-chip">{t('admin.ordersPage.totalOrders', { count: total })}</div>
        </div>

        <div className="mt-6 relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9B93]" />
          <input
            type="text"
            placeholder={t('admin.ordersPage.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-[#E5DDD3] bg-[#FDFAF5] py-2.5 pl-10 pr-9 text-sm text-[#31312D] placeholder:text-[#9E9B93] focus:border-[#315824] focus:outline-none focus:ring-1 focus:ring-[#315824]"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9B93] hover:text-[#31312D]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {statuses.map((item) => (
            <button
              key={item}
              onClick={() => {
                setStatus(item);
                setPage(1);
              }}
              className={
                status === item
                  ? 'admin-chip !border-[#315824] !bg-[#273E1C] !text-white'
                  : 'admin-chip'
              }
            >
              {item === 'ALL' ? t('admin.ordersPage.allOrders') : t(`admin.ordersPage.statuses.${item.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </section>

      <section className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[760px]">
            <thead>
              <tr>
                <th>{t('admin.ordersPage.order')}</th>
                <th className="hidden sm:table-cell">{t('admin.ordersPage.customer')}</th>
                <th>{t('admin.table.status')}</th>
                <th className="hidden md:table-cell">{t('admin.ordersPage.date')}</th>
                <th>{t('admin.ordersPage.total')}</th>
                <th className="text-right">{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index}>
                      {[1, 2, 3, 4, 5, 6].map((cell) => (
                        <td key={cell}>
                          <div className="skeleton h-4 rounded-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.length === 0
                ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-[#9E9B93]">
                        {search ? t('admin.ordersPage.noOrdersFor', { search }) : t('admin.ordersPage.noOrders')}
                      </td>
                    </tr>
                  )
                : orders.map((order: any) => (
                    <tr key={order.id}>
                      <td>
                        <p className="text-sm font-semibold text-[#171C14]">#{order.orderNumber}</p>
                        <p className="mt-1 text-xs text-[#7A776F]">
                          {t('admin.ordersPage.items', { count: order._count?.items || order.items?.length || 0 })}
                        </p>
                      </td>
                      <td className="hidden sm:table-cell">
                        <p className="text-sm font-medium text-[#31312D]">{order.user?.name || '-'}</p>
                        <p className="mt-1 text-xs text-[#7A776F]">{order.user?.email}</p>
                      </td>
                      <td>
                        <span className={`admin-badge ${getOrderStatusColor(order.status)}`}>
                          {t(`admin.ordersPage.statuses.${String(order.status).toLowerCase()}`, { defaultValue: String(order.status) })}
                        </span>
                      </td>
                      <td className="hidden md:table-cell text-sm text-[#6B6A63]">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="text-sm font-semibold text-[#171C14]">
                        {formatPrice(order.total)}
                      </td>
                      <td>
                        <div className="flex justify-end">
                          <Link href={`/admin/orders/${order.id}`} className="admin-action-icon">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-[#EEE6DB] px-5 py-4">
            <span className="text-sm text-[#6B6A63]">
              {t('admin.table.pageOf', { page, pages })}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="admin-btn-secondary !min-h-[2.7rem] !px-4 disabled:opacity-40"
              >
                {t('admin.table.prev')}
              </button>
              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="admin-btn-secondary !min-h-[2.7rem] !px-4 disabled:opacity-40"
              >
                {t('admin.table.next')}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
