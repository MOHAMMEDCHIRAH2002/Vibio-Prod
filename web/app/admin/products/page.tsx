'use client';

import { useState } from 'react';
import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => productsApi.list({ search: search || undefined, page, limit: 15, admin: true }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(t('admin.productsPage.removed'));
    },
    onError: () => toast.error(t('admin.productsPage.removeFailed')),
  });

  const products = (data as any)?.products || [];
  const total = (data as any)?.total || 0;
  const pages = (data as any)?.pages || 1;

  return (
    <div className="admin-page">
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-eyebrow">{t('admin.productsPage.eyebrow')}</p>
            <h1 className="mt-4 font-heading text-[clamp(2.2rem,4.5vw,4rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              {t('admin.products')}
            </h1>
            <p className="admin-subcopy mt-4 max-w-2xl">
              {t('admin.productsPage.subcopy')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="admin-chip">{t('admin.productsPage.totalProducts', { count: total })}</div>
            <Link href="/admin/products/new" className="admin-btn-primary">
              <Plus className="h-4 w-4" />
              {t('admin.productsPage.addProduct')}
            </Link>
          </div>
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
              placeholder={t('admin.productsPage.searchPlaceholder')}
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
                <th className="hidden sm:table-cell">{t('admin.table.category')}</th>
                <th>{t('admin.table.price')}</th>
                <th className="hidden md:table-cell">{t('admin.table.stock')}</th>
                <th className="hidden lg:table-cell">{t('admin.table.status')}</th>
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
                : products.map((product: any) => {
                    const totalStock =
                      product.variants?.reduce((sum: number, variant: any) => sum + variant.stock, 0) ?? 0;

                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-[1rem] bg-[#F1ECE4]">
                              {product.images?.[0] && (
                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#171C14]">{product.name}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {product.isFeatured && (
                                  <span className="admin-badge bg-[#F4E9D8] text-[#8A6430]">{t('admin.table.featured')}</span>
                                )}
                                <span className="text-xs text-[#7A776F]">
                                  {t('admin.productsPage.variants', { count: product.variants?.length || 0 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell text-sm text-[#6B6A63]">
                          {product.category?.name || '-'}
                        </td>
                        <td className="text-sm font-semibold text-[#171C14]">
                          {formatPrice(product.basePrice)}
                        </td>
                        <td className="hidden md:table-cell">
                          <span
                            className={
                              totalStock === 0
                                ? 'text-sm font-semibold text-[#C9571A]'
                                : totalStock < 10
                                  ? 'text-sm font-semibold text-[#8A631D]'
                                  : 'text-sm font-semibold text-[#171C14]'
                            }
                          >
                            {totalStock}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell">
                          <span
                            className={
                              product.isActive
                                ? 'admin-badge bg-[#E0EEE6] text-[#2A6A45]'
                                : 'admin-badge bg-[#ECE7E1] text-[#665E55]'
                            }
                          >
                            {product.isActive ? t('admin.table.active') : t('admin.table.inactive')}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/products/${product.slug}`} target="_blank" className="admin-action-icon">
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="admin-action-icon hover:!text-[#44637C]"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => {
                                if (confirm(t('admin.productsPage.confirmRemove'))) {
                                  deleteMutation.mutate(product.id);
                                }
                              }}
                              className="admin-action-icon hover:!text-[#C9571A]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
