'use client';

import { useState } from 'react';
import Image from '@/components/common/OptimizedImage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { categoriesApi } from '@/lib/api';
import { toast } from 'sonner';

const emptyForm = { name: '', slug: '', description: '', image: '' };

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: () => categoriesApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setShowForm(false);
      setForm(emptyForm);
      toast.success(t('admin.categoriesPage.created'));
    },
    onError: () => toast.error(t('admin.categoriesPage.createFailed')),
  });

  const updateMutation = useMutation({
    mutationFn: () => categoriesApi.update(editId!, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setEditId(null);
      setShowForm(false);
      setForm(emptyForm);
      toast.success(t('admin.categoriesPage.updated'));
    },
    onError: () => toast.error(t('admin.categoriesPage.updateFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('admin.categoriesPage.removed'));
    },
    onError: () => toast.error(t('admin.categoriesPage.removeFailed')),
  });

  const cats = (categories as any) || [];
  const isEditing = Boolean(editId);

  const handleSubmit = () => {
    if (isEditing) {
      updateMutation.mutate();
      return;
    }
    createMutation.mutate();
  };

  const startEdit = (category: any) => {
    setEditId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
    });
    setShowForm(true);
  };

  return (
    <div className="admin-page">
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-eyebrow">{t('admin.categoriesPage.eyebrow')}</p>
            <h1 className="mt-4 font-heading text-[clamp(2.2rem,4.5vw,4rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              {t('admin.categories')}
            </h1>
            <p className="admin-subcopy mt-4 max-w-2xl">
              {t('admin.categoriesPage.subcopy')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="admin-chip">{t('admin.categoriesPage.collections', { count: cats.length })}</div>
            <button
              onClick={() => {
                setShowForm((value) => !value);
                setEditId(null);
                setForm(emptyForm);
              }}
              className="admin-btn-primary"
            >
              <Plus className="h-4 w-4" />
              {t('admin.categoriesPage.newCategory')}
            </button>
          </div>
        </div>
      </section>

      {showForm && (
        <section className="admin-panel p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="admin-eyebrow">{isEditing ? t('admin.categoriesPage.editEntry') : t('admin.categoriesPage.createEntry')}</p>
              <h2 className="mt-3 font-heading text-[2rem] leading-none tracking-[-0.05em] text-[#171C14]">
                {isEditing ? t('admin.categoriesPage.updateCategory') : t('admin.categoriesPage.createCategory')}
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { key: 'name', label: t('admin.categoriesPage.fieldName'), placeholder: t('admin.categoriesPage.phName') },
              { key: 'slug', label: t('admin.categoriesPage.fieldSlug'), placeholder: t('admin.categoriesPage.phSlug') },
              { key: 'description', label: t('admin.categoriesPage.fieldDescription'), placeholder: t('admin.categoriesPage.phDescription') },
              { key: 'image', label: t('admin.categoriesPage.fieldImage'), placeholder: 'https://...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{label}</label>
                <input
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="admin-input"
                />
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleSubmit}
              disabled={!form.name || !form.slug || createMutation.isPending || updateMutation.isPending}
              className="admin-btn-primary disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? t('admin.categoriesPage.saving')
                : isEditing
                  ? t('admin.categoriesPage.update')
                  : t('admin.categoriesPage.create')}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
                setForm(emptyForm);
              }}
              className="admin-btn-secondary"
            >
              {t('admin.categoriesPage.cancel')}
            </button>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="admin-panel h-56 animate-pulse" />
            ))
          : cats.map((category: any) => (
              <article key={category.id} className="admin-panel overflow-hidden">
                <div className="relative h-40 bg-[#F1ECE4]">
                  {category.image ? (
                    <Image src={category.image} alt={category.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#8A867E]">
                      {t('admin.categoriesPage.noVisual')}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-[1.8rem] leading-none tracking-[-0.05em] text-[#171C14]">
                        {category.name}
                      </h3>
                      <p className="mt-2 font-mono text-xs text-[#7A776F]">{category.slug}</p>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => startEdit(category)} className="admin-action-icon">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t('admin.categoriesPage.confirmRemove'))) {
                            deleteMutation.mutate(category.id);
                          }
                        }}
                        className="admin-action-icon hover:!text-[#C9571A]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#EEE6DB] pt-4">
                    <span className="text-sm text-[#6B6A63]">{t('admin.categoriesPage.products')}</span>
                    <span className="admin-badge bg-[#E3ECE6] text-[#2E6049]">
                      {category._count?.products || 0}
                    </span>
                  </div>
                </div>
              </article>
            ))}
      </section>
    </div>
  );
}
