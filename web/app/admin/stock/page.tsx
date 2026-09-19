'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { productsApi } from '@/lib/api';

export default function AdminStockPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stock', search],
    queryFn: () => productsApi.list({ search: search || undefined, limit: 100, admin: true }),
  });

  const products = (data as any)?.products || [];
  const allVariants = products.flatMap((product: any) =>
    (product.variants || []).map((variant: any) => ({
      ...variant,
      productName: product.name,
      productId: product.id,
      productSlug: product.slug,
    })),
  );

  const filtered = allVariants.filter((variant: any) => {
    if (filter === 'out') return variant.stock === 0;
    if (filter === 'low') return variant.stock > 0 && variant.stock < 10;
    return true;
  });

  const outCount = allVariants.filter((variant: any) => variant.stock === 0).length;
  const lowCount = allVariants.filter((variant: any) => variant.stock > 0 && variant.stock < 10).length;

  return (
    <div className="admin-page">
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-eyebrow">{t('admin.stockPage.eyebrow')}</p>
            <h1 className="mt-4 font-heading text-[clamp(2.2rem,4.5vw,4rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              {t('admin.inventory')}
            </h1>
            <p className="admin-subcopy mt-4 max-w-2xl">
              {t('admin.stockPage.subcopy')}
            </p>
          </div>
          <div className="admin-chip">{t('admin.stockPage.variantsTracked', { count: allVariants.length })}</div>
        </div>

        {(outCount > 0 || lowCount > 0) && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {outCount > 0 && (
              <div className="admin-panel-soft flex items-center gap-3 p-4">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-[#C9571A]" />
                <div>
                  <p className="text-sm font-semibold text-[#6E2C18]">{t('admin.stockPage.outOfStockAlert', { count: outCount })}</p>
                  <p className="text-xs text-[#9C624E]">{t('admin.stockPage.restockRequired')}</p>
                </div>
              </div>
            )}
            {lowCount > 0 && (
              <div className="admin-panel-soft flex items-center gap-3 p-4">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-[#8A631D]" />
                <div>
                  <p className="text-sm font-semibold text-[#785115]">{t('admin.stockPage.lowAlert', { count: lowCount })}</p>
                  <p className="text-xs text-[#9C7E49]">{t('admin.stockPage.lessThan10')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {[
            { key: 'all', label: t('admin.stockPage.allVariants') },
            { key: 'low', label: t('admin.stockPage.lowStock', { count: lowCount }) },
            { key: 'out', label: t('admin.stockPage.outOfStock', { count: outCount }) },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as 'all' | 'low' | 'out')}
              className={
                filter === key
                  ? 'admin-chip !border-[#315824] !bg-[#273E1C] !text-white'
                  : 'admin-chip'
              }
            >
              {label}
            </button>
          ))}

          <div className="relative ml-auto min-w-[18rem] max-w-sm flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A776F]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.stockPage.searchPlaceholder')}
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
                <th>{t('admin.table.product')}</th>
                <th>{t('admin.stockPage.variant')}</th>
                <th>{t('admin.stockPage.sku')}</th>
                <th>{t('admin.table.stock')}</th>
                <th>{t('admin.table.status')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, index) => (
                    <tr key={index}>
                      {[1, 2, 3, 4, 5].map((cell) => (
                        <td key={cell}>
                          <div className="skeleton h-4 rounded-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((variant: any) => (
                    <tr key={variant.id}>
                      <td className="text-sm font-semibold text-[#171C14]">{variant.productName}</td>
                      <td className="text-sm text-[#6B6A63]">
                        {variant.name}: {variant.value}
                      </td>
                      <td className="font-mono text-xs text-[#8A867E]">{variant.sku || '-'}</td>
                      <td>
                        <span
                          className={
                            variant.stock === 0
                              ? 'text-sm font-semibold text-[#C9571A]'
                              : variant.stock < 10
                                ? 'text-sm font-semibold text-[#8A631D]'
                                : 'text-sm font-semibold text-[#171C14]'
                          }
                        >
                          {variant.stock}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            variant.stock === 0
                              ? 'admin-badge bg-[#F7E3DE] text-[#C9571A]'
                              : variant.stock < 10
                                ? 'admin-badge bg-[#F4E5C6] text-[#8A631D]'
                                : 'admin-badge bg-[#E0EEE6] text-[#2A6A45]'
                          }
                        >
                          {variant.stock === 0
                            ? t('admin.stockPage.statusOut')
                            : variant.stock < 10
                              ? t('admin.stockPage.statusLow')
                              : t('admin.stockPage.statusIn')}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="admin-empty p-6">
            <p className="text-sm">{t('admin.stockPage.noMatch')}</p>
          </div>
        )}
      </section>
    </div>
  );
}
