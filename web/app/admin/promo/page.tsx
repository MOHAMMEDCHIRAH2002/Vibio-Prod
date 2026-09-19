'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Tag, Trash2, X } from 'lucide-react';
import { promoApi } from '@/lib/api';
import { toast } from 'sonner';

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

const TYPE_LABEL: Record<PromoType, string> = {
  PERCENTAGE: 'Percentage',
  FIXED: 'Fixed amount',
  FREE_SHIPPING: 'Free shipping',
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
      toast.success('Promo code created');
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to create promo code'),
  });

  const updateMutation = useMutation({
    mutationFn: () => promoApi.adminUpdate(editId!, buildPayload()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-promo'] });
      resetForm();
      toast.success('Promo code updated');
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to update promo code'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promoApi.adminDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-promo'] });
      toast.success('Promo code removed');
    },
    onError: () => toast.error('Failed to remove promo code'),
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
            <p className="admin-eyebrow">Promotions</p>
            <h1 className="mt-4 font-heading text-[clamp(2.2rem,4.5vw,4rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              Promo codes
            </h1>
            <p className="admin-subcopy mt-4 max-w-2xl">
              Create percentage, fixed-amount, or free-shipping codes. Validation
              (dates, usage limits, minimum order) is enforced on the server at checkout.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="admin-chip">{list.length} codes</div>
            <button
              onClick={() => { setShowForm((v) => !v); setEditId(null); setForm(emptyForm); }}
              className="admin-btn-primary"
            >
              <Plus className="h-4 w-4" />
              New code
            </button>
          </div>
        </div>
      </section>

      {showForm && (
        <section className="admin-panel p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="admin-eyebrow">{isEditing ? 'Edit entry' : 'Create entry'}</p>
              <h2 className="mt-3 font-heading text-[2rem] leading-none tracking-[-0.05em] text-[#171C14]">
                {isEditing ? 'Update promo code' : 'Create promo code'}
              </h2>
            </div>
            <button onClick={resetForm} className="admin-action-icon">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-label">Code *</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER20"
                className="admin-input mt-1 uppercase"
              />
            </div>
            <div>
              <label className="admin-label">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as PromoType })}
                className="admin-input mt-1"
              >
                <option value="PERCENTAGE">Percentage discount</option>
                <option value="FIXED">Fixed amount discount</option>
                <option value="FREE_SHIPPING">Free shipping</option>
              </select>
            </div>

            {form.type !== 'FREE_SHIPPING' && (
              <div>
                <label className="admin-label">
                  {form.type === 'PERCENTAGE' ? 'Percentage (%) *' : 'Amount (MAD) *'}
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
                <label className="admin-label">Max discount (MAD)</label>
                <input
                  type="number"
                  min="0"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  placeholder="Optional cap"
                  className="admin-input mt-1"
                />
              </div>
            )}

            <div>
              <label className="admin-label">Minimum order (MAD)</label>
              <input
                type="number"
                min="0"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                placeholder="Optional"
                className="admin-input mt-1"
              />
            </div>
            <div>
              <label className="admin-label">Usage limit</label>
              <input
                type="number"
                min="0"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="Optional (unlimited)"
                className="admin-input mt-1"
              />
            </div>
            <div>
              <label className="admin-label">Starts at</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="admin-input mt-1"
              />
            </div>
            <div>
              <label className="admin-label">Expires at</label>
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
            Active
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => (isEditing ? updateMutation.mutate() : createMutation.mutate())}
              disabled={!canSubmit || isPending}
              className="admin-btn-primary disabled:opacity-50"
            >
              {isPending ? 'Saving…' : isEditing ? 'Update' : 'Create'}
            </button>
            <button onClick={resetForm} className="admin-btn-secondary">Cancel</button>
          </div>
        </section>
      )}

      <section className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[760px]">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th className="hidden md:table-cell">Uses</th>
                <th className="hidden lg:table-cell">Expires</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
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
                    No promo codes yet — create your first above.
                  </td>
                </tr>
              ) : (
                list.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-sm font-semibold text-[#171C14]">{p.code}</td>
                    <td className="text-sm text-[#6B6A63]">{TYPE_LABEL[p.type as PromoType]}</td>
                    <td className="text-sm font-semibold text-[#171C14]">{formatValue(p)}</td>
                    <td className="hidden md:table-cell text-sm text-[#6B6A63]">
                      {p.usedCount}{p.maxUses != null ? ` / ${p.maxUses}` : ''}
                    </td>
                    <td className="hidden lg:table-cell text-sm text-[#6B6A63]">
                      {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <span className={p.isActive ? 'admin-badge bg-[#E0EEE6] text-[#2A6A45]' : 'admin-badge bg-[#ECE7E1] text-[#665E55]'}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(p)} className="admin-action-icon">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this promo code?')) deleteMutation.mutate(p.id); }}
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
