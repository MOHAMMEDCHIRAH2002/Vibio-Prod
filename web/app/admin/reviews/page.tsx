'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronLeft, ChevronRight, Plus, Star, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { reviewsApi, productsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'all' | 'pending' | 'approved';

const emptyForm = { productId: '', rating: 5, title: '', body: '', reviewerName: '' };

export default function AdminReviewsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('all');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [productSearch, setProductSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', tab, page],
    queryFn: () =>
      reviewsApi.adminList({
        page,
        limit: 20,
        status: tab === 'all' ? undefined : tab,
      }),
  });

  const { data: productsData } = useQuery({
    queryKey: ['admin-products-search', productSearch],
    queryFn: () => productsApi.list({ search: productSearch, limit: 20 }),
    enabled: showForm,
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      reviewsApi.moderate(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success(t('admin.reviewsPage.reviewUpdated'));
    },
    onError: () => toast.error(t('admin.reviewsPage.updateFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success(t('admin.reviewsPage.reviewDeleted'));
    },
    onError: () => toast.error(t('admin.reviewsPage.deleteFailed')),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => reviewsApi.adminCreate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success(t('admin.reviewsPage.reviewCreated'));
      setShowForm(false);
      setForm(emptyForm);
      setProductSearch('');
    },
    onError: () => toast.error(t('admin.reviewsPage.createFailed')),
  });

  const reviews = (data as any)?.reviews || [];
  const total = (data as any)?.total || 0;
  const pages = (data as any)?.pages || 1;
  const products = (productsData as any)?.products || [];

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setPage(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId) return toast.error(t('admin.reviewsPage.selectProduct'));
    if (!form.reviewerName.trim()) return toast.error(t('admin.reviewsPage.enterClientName'));
    createMutation.mutate(form);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: t('admin.reviewsPage.tabAll') },
    { key: 'pending', label: t('admin.reviewsPage.tabPending') },
    { key: 'approved', label: t('admin.reviewsPage.tabApproved') },
  ];

  return (
    <div className="admin-page">
      {/* Header */}
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="admin-eyebrow">{t('admin.reviewsPage.eyebrow')}</p>
            <h1 className="mt-4 font-heading text-[clamp(2.2rem,4.5vw,4rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              {t('admin.reviews')}
            </h1>
            <p className="admin-subcopy mt-4 max-w-2xl">
              {t('admin.reviewsPage.subcopy')}
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="admin-btn-primary mt-1 flex shrink-0 items-center gap-2 self-start"
          >
            <Plus className="h-4 w-4" />
            {t('admin.reviewsPage.addReview')}
          </button>
        </div>
      </section>

      {/* Create form */}
      {showForm && (
        <section className="admin-panel p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-heading text-[1.6rem] leading-none tracking-[-0.04em] text-[#171C14]">
              {t('admin.reviewsPage.newReview')}
            </h2>
            <button
              onClick={() => { setShowForm(false); setForm(emptyForm); setProductSearch(''); }}
              className="admin-action-icon"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product search */}
            <div>
              <label className="admin-label">{t('admin.reviewsPage.productLabel')}</label>
              <input
                type="text"
                placeholder={t('admin.reviewsPage.productSearchPh')}
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setForm((f) => ({ ...f, productId: '' })); }}
                className="admin-input mt-1"
              />
              {productSearch && products.length > 0 && !form.productId && (
                <ul className="mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#E4DDD4] bg-white shadow-lg">
                  {products.map((p: any) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => { setForm((f) => ({ ...f, productId: p.id })); setProductSearch(p.name); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#171C14] hover:bg-[#F5F0E8] transition-colors"
                      >
                        {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {productSearch && products.length === 0 && !form.productId && (
                <p className="mt-1 text-xs text-[#9A948C]">{t('admin.reviewsPage.noProducts')}</p>
              )}
              {form.productId && (
                <p className="mt-1 text-xs text-[#6C8349]">{t('admin.reviewsPage.selected', { name: productSearch })}</p>
              )}
            </div>

            {/* Client name */}
            <div>
              <label className="admin-label">
                {t('admin.reviewsPage.clientName')} <span className="text-[#C9571A]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.reviewerName}
                onChange={(e) => setForm((f) => ({ ...f, reviewerName: e.target.value }))}
                placeholder={t('admin.reviewsPage.clientNamePh')}
                className="admin-input mt-1"
              />
              <p className="mt-1 text-[11px] text-[#9A948C]">
                {t('admin.reviewsPage.clientNameHint')}
              </p>
            </div>

            {/* Rating */}
            <div>
              <label className="admin-label">{t('admin.reviewsPage.rating')}</label>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rating: score }))}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={
                        score <= form.rating
                          ? 'h-7 w-7 fill-[#C89A4A] text-[#C89A4A]'
                          : 'h-7 w-7 text-[#DDD6CB]'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="admin-label">{t('admin.reviewsPage.titleOptional')}</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={t('admin.reviewsPage.titlePh')}
                className="admin-input mt-1"
              />
            </div>

            {/* Body */}
            <div>
              <label className="admin-label">{t('admin.reviewsPage.bodyOptional')}</label>
              <textarea
                rows={4}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder={t('admin.reviewsPage.bodyPh')}
                className="admin-input mt-1 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={createMutation.isPending || !form.productId}
                className="admin-btn-primary"
              >
                {createMutation.isPending ? t('admin.reviewsPage.creating') : t('admin.reviewsPage.createReview')}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); setProductSearch(''); }}
                className="admin-btn-secondary"
              >
                {t('admin.reviewsPage.cancel')}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E4DDD4]">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`px-5 py-3 text-sm font-medium transition-colors ${
              tab === key
                ? 'border-b-2 border-[#273E1C] text-[#171C14]'
                : 'text-[#7A776F] hover:text-[#171C14]'
            }`}
          >
            {label}
            {key === 'all' && total > 0 && (
              <span className="ml-2 rounded-full bg-[#EFF5E7] px-2 py-0.5 text-[10px] font-semibold text-[#273E1C]">
                {total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="admin-panel h-28 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="admin-panel admin-empty p-6">
          <Star className="h-12 w-12 text-[#D1C7BA]" />
          <p className="mt-4 text-sm">
            {tab === 'pending' ? t('admin.reviewsPage.emptyPending') : tab === 'approved' ? t('admin.reviewsPage.emptyApproved') : t('admin.reviewsPage.emptyAll')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <article key={review.id} className="admin-panel p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <Star
                          key={score}
                          className={
                            score <= review.rating
                              ? 'h-4 w-4 fill-[#C89A4A] text-[#C89A4A]'
                              : 'h-4 w-4 text-[#DDD6CB]'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-[#171C14]">
                      {review.reviewerName || review.user?.name || t('admin.reviewsPage.anonymous')}
                    </span>
                    {review.reviewerName && review.user?.name && review.reviewerName !== review.user.name && (
                      <span className="text-xs text-[#9A948C]">({review.user.name})</span>
                    )}
                    {review.user?.email && (
                      <span className="text-xs text-[#9A948C]">{review.user.email}</span>
                    )}
                    <span className="text-xs text-[#7A776F]">{formatDate(review.createdAt)}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                        review.isApproved
                          ? 'bg-[#EFF5E7] text-[#273E1C]'
                          : 'bg-[#FEF3E2] text-[#92540E]'
                      }`}
                    >
                      {review.isApproved ? t('admin.reviewsPage.approved') : t('admin.reviewsPage.pending')}
                    </span>
                  </div>

                  {review.product && (
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#6C8349]">
                      {t('admin.reviewsPage.on')} {review.product.name}
                    </p>
                  )}

                  {review.title && (
                    <p className="mt-3 text-sm font-semibold text-[#171C14]">{review.title}</p>
                  )}

                  {review.body && (
                    <p className="mt-2 text-sm leading-7 text-[#5E5C54]">{review.body}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  {!review.isApproved && (
                    <button
                      onClick={() => moderateMutation.mutate({ id: review.id, action: 'approve' })}
                      disabled={moderateMutation.isPending}
                      className="admin-action-icon hover:!text-[#2A6A45]"
                      title={t('admin.reviewsPage.approveTitle')}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {review.isApproved && (
                    <button
                      onClick={() => moderateMutation.mutate({ id: review.id, action: 'reject' })}
                      disabled={moderateMutation.isPending}
                      className="admin-action-icon hover:!text-[#C9571A]"
                      title={t('admin.reviewsPage.unapproveTitle')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(t('admin.reviewsPage.confirmDelete'))) deleteMutation.mutate(review.id);
                    }}
                    disabled={deleteMutation.isPending}
                    className="admin-action-icon hover:!text-[#C9571A]"
                    title={t('admin.reviewsPage.deleteTitle')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-[#E4DDD4] pt-4 text-sm text-[#7A776F]">
          <span>
            {t('admin.table.pageOf', { page, pages })}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="admin-action-icon disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="admin-action-icon disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
