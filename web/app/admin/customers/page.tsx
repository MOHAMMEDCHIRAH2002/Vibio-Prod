'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Eye, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AdminCustomersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search, page],
    queryFn: () =>
      api.get('/admin/customers', {
        params: { search: search || undefined, page, limit: 15 },
      }),
  });

  const customers = (data as any)?.users || [];
  const total = (data as any)?.total || 0;
  const pages = (data as any)?.pages || 1;

  return (
    <div className="admin-page">
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-eyebrow">{t('admin.customersPage.eyebrow')}</p>
            <h1 className="mt-4 font-heading text-[clamp(2.2rem,4.5vw,4rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              {t('admin.customers')}
            </h1>
            <p className="admin-subcopy mt-4 max-w-2xl">
              {t('admin.customersPage.subcopy')}
            </p>
          </div>

          <div className="admin-chip">{t('admin.customersPage.totalCustomers', { count: total })}</div>
        </div>

        <div className="mt-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A776F]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t('admin.customersPage.searchPlaceholder')}
              className="admin-input pl-11"
            />
          </div>
        </div>
      </section>

      <section className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[760px]">
            <thead>
              <tr>
                <th>{t('admin.customersPage.customer')}</th>
                <th>{t('admin.customersPage.email')}</th>
                <th>{t('admin.customersPage.orders')}</th>
                <th>{t('admin.customersPage.joined')}</th>
                <th className="text-right">{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index}>
                      {[1, 2, 3, 4, 5].map((cell) => (
                        <td key={cell}>
                          <div className="skeleton h-4 rounded-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : customers.map((customer: any) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0E7DA] text-sm font-semibold text-[#8A6430]">
                            {customer.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm font-semibold text-[#171C14]">
                            {customer.name || t('admin.customersPage.unknown')}
                          </span>
                        </div>
                      </td>
                      <td className="text-sm text-[#6B6A63]">{customer.email}</td>
                      <td className="text-sm font-semibold text-[#171C14]">
                        {customer._count?.orders || 0}
                      </td>
                      <td className="text-sm text-[#6B6A63]">{formatDate(customer.createdAt)}</td>
                      <td>
                        <div className="flex justify-end">
                          <Link href={`/admin/customers/${customer.id}`} className="admin-action-icon">
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
