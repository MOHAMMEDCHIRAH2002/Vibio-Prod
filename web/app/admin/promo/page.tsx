'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Tag, Trash2, X } from 'lucide-react';
import { promoApi } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

type PromoType = 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';

const emptyForm = {
  code: '',
  type: 'PERCENTAGE' as PromoType,
  value: '',
  minOrder: '',
  maxDiscount: '',
  maxUses: '',
  startsAt: '',
  expiresAt: '',
  isActive: true,
};

function toLocalInput(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  // to yyyy-MM-ddThh:mm for datetime-local
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

function formatValue(p: any) {
  if (p.type === 'PERCENTAGE') return `${Number(p.value)}%`;
  if (p.type === 'FIXED') return `${Number(p.value)} MAD`;
  return '—';
}

export default function AdminPromoPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: promos, isLoading } = useQuery({
    queryKey: ['admin-promo'],
    queryFn: promoApi.adminList,
  });

  const list: any[] = (promos as any) || [];
  const isEditing = Boolean(editId);

  // A datetime-local value ("2026-07-22T14:30") has no timezone. Interpret it in
  // the admin's browser timezone and send a full ISO instant, so the server
  // (which may run in UTC) stores the exact moment the admin intended.
  const toISO = (localValue: string) =>
    localValue ? new Date(localValue).toISOString() : '';

  const buildPayload = () => ({
    code: form.code,
    type: form.type,
    value: form.type === 'FREE_SHIPPING' ? 0 : form.value,
    minOrder: form.minOrder,
    maxDiscount: form.type === 'PERCENTAGE' ? form.maxDiscount : '',
    maxUses: form.maxUses,
    startsAt: toISO(form.startsAt),
    expiresAt: toISO(form.expiresAt),
    isActive: form.isActive,
  });

  const createMutation = useMutation({
    mutationFn: () => promoApi.adminCreate(buildPayload()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-promo'] });
      resetForm();
      toast.success(t('promo.created'));
    },
    onError: (e: any) => toast.error(e?.message || t('promo.createFailed')),
  });

  const updateMutation = useMutation({
    mutationFn: () => promoApi.adminUpdate(editId!, buildPayload()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-promo'] });
      resetForm();
      toast.success(t('promo.updated'));
    },
    onError: (e: any) => toast.error(e?.message || t('promo.updateFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promoApi.adminDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-promo'] });
      toast.success(t('promo.removed'));
    },
    onError: () => toast.error(t('promo.removeFailed')),
  });

  function resetForm() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  }

  function startEdit(p: any) {
    setEditId(p.id);
    setForm({
      code: p.code ?? '',
      type: p.type,
      value: p.value != null ? String(Number(p.value)) : '',
      minOrder: p.minOrder != null ? String(Number(p.minOrder)) : '',
      maxDiscount: p.maxDiscount != null ? String(Number(p.maxDiscount)) : '',
      maxUses: p.maxUses != null ? String(p.maxUses) : '',
      startsAt: toLocalInput(p.startsAt),
      expiresAt: toLocalInput(p.expiresAt),
      isActive: p.isActive ?? true,
    });
    setShowForm(true);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const canSubmit =
    form.code.trim() && (form.type === 'FREE_SHIPPING' || Number(form.value) > 0);

  return (
    <div className="admin-page">
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-eyebrow">{t('promo.eyebrow')}</p>
            <h1 className="mt-4 font-heading text-[clamp(2.2rem,4.5vw,4rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              {t('promo.title')}
            </h1>
            <p className="admin-subcopy mt-4 max-w-2xl">
              {t('promo.description')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="admin-chip">{t('promo.codes', { count: list.length })}</div>
            <button
              onClick={() => { setShowForm((v) => !v); setEditId(null); setForm(emptyForm); }}
              className="admin-btn-primary"
            >
              <Plus className="h-4 w-4" />
              {t('promo.new')}
            </button>
          </div>
        </div>
      </section>

      {showForm && (
        <section className="admin-panel p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="admin-eyebrow">{isEditing ? t('promo.edit') : t('promo.createEntry')}</p>
              <h2 className="mt-3 font-heading text-[2rem] leading-none tracking-[-0.05em] text-[#171C14]">
                {isEditing ? t('promo.update') : t('promo.create')}
              </h2>
            </div>
            <button onClick={resetForm} aria-label={t('promo.close')} className="admin-action-icon">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-label">{t('promo.code')}</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER20"
                className="admin-input mt-1 uppercase"
              />
            </div>
            <div>
              <label className="admin-label">{t('promo.type')}</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as PromoType })}
                className="admin-input mt-1"
              >
                <option value="PERCENTAGE">{t('promo.percentage')}</option>
                <option value="FIXED">{t('promo.fixed')}</option>
                <option value="FREE_SHIPPING">{t('promo.freeShipping')}</option>
              </select>
            </div>

            {form.type !== 'FREE_SHIPPING' && (
              <div>
                <label className="admin-label">
                  {form.type === 'PERCENTAGE' ? t('promo.percentageValue') : t('promo.amountValue')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder={form.type === 'PERCENTAGE' ? '20' : '50'}
                  className="admin-input mt-1"
                />
              </div>
            )}

            {form.type === 'PERCENTAGE' && (
              <div>
                <label className="admin-label">{t('promo.maxDiscount')}</label>
                <input
                  type="number"
                  min="0"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  placeholder={t('promo.optionalCap')}
                  className="admin-input mt-1"
                />
              </div>
            )}

            <div>
              <label className="admin-label">{t('promo.minimumOrder')}</label>
              <input
                type="number"
                min="0"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                placeholder={t('promo.optional')}
                className="admin-input mt-1"
              />
            </div>
            <div>
              <label className="admin-label">{t('promo.usageLimit')}</label>
              <input
                type="number"
                min="0"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder={t('promo.optionalUnlimited')}
                className="admin-input mt-1"
              />
            </div>
            <div>
              <label className="admin-label">{t('promo.startsAt')}</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="admin-input mt-1"
              />
            </div>
            <div>
              <label className="admin-label">{t('promo.expiresAt')}</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="admin-input mt-1"
              />
            </div>
          </div>

          <label className="mt-5 inline-flex items-center gap-3 text-sm text-[#454B45]">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded accent-[#273E1C]"
            />
            {t('promo.active')}
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => (isEditing ? updateMutation.mutate() : createMutation.mutate())}
              disabled={!canSubmit || isPending}
              className="admin-btn-primary disabled:opacity-50"
            >
              {isPending ? t('promo.saving') : isEditing ? t('promo.update') : t('promo.create')}
            </button>
            <button onClick={resetForm} className="admin-btn-secondary">{t('promo.cancel')}</button>
          </div>
        </section>
      )}

      <section className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[760px]">
            <thead>
              <tr>
                <th>{t('promo.code')}</th>
                <th>{t('promo.type')}</th>
                <th>{t('promo.amountValue')}</th>
                <th className="hidden md:table-cell">{t('promo.usageLimit')}</th>
                <th className="hidden lg:table-cell">{t('promo.expiresAt')}</th>
                <th>{t('promo.active')}</th>
                <th className="text-right">{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                      <td key={c}><div className="skeleton h-4 rounded-full" /></td>
                    ))}
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#9E9B93]">
                    <Tag className="mx-auto mb-3 h-8 w-8 text-[#D1C7BA]" />
                    {t('promo.empty')}
                  </td>
                </tr>
              ) : (
                list.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-sm font-semibold text-[#171C14]">{p.code}</td>
                    <td className="text-sm text-[#6B6A63]">{t(`promo.${p.type === 'PERCENTAGE' ? 'percentage' : p.type === 'FIXED' ? 'fixed' : 'freeShipping'}`)}</td>
                    <td className="text-sm font-semibold text-[#171C14]">{formatValue(p)}</td>
                    <td className="hidden md:table-cell text-sm text-[#6B6A63]">
                      {p.usedCount}{p.maxUses != null ? ` / ${p.maxUses}` : ''}
                    </td>
                    <td className="hidden lg:table-cell text-sm text-[#6B6A63]">
                      {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <span className={p.isActive ? 'admin-badge bg-[#E0EEE6] text-[#2A6A45]' : 'admin-badge bg-[#ECE7E1] text-[#665E55]'}>
                        {p.isActive ? t('promo.activeStatus') : t('promo.inactiveStatus')}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(p)} aria-label={t('promo.editAction')} className="admin-action-icon">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          aria-label={t('promo.deleteAction')}
                          onClick={() => { if (confirm(t('promo.deleteConfirm'))) deleteMutation.mutate(p.id); }}
                          className="admin-action-icon hover:!text-[#C9571A]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
