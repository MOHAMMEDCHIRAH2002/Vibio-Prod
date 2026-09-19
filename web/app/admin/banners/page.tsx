'use client';

import { useState } from 'react';
import Image from '@/components/common/OptimizedImage';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { bannersApi } from '@/lib/api';
import { toast } from 'sonner';

function SortableRow({ banner, onEdit, onDelete, onToggle }: any) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: banner.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="admin-panel flex items-center gap-4 p-4"
    >
      <button
        {...attributes}
        {...listeners}
        className="admin-action-icon cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-[1rem] bg-[#F1ECE4]">
        {banner.imageDesktop && (
          <Image src={banner.imageDesktop} alt={banner.title} fill className="object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#171C14]">{banner.title}</p>
        {banner.subtitle && <p className="mt-1 truncate text-xs text-[#7A776F]">{banner.subtitle}</p>}
        {banner.ctaLink && <p className="mt-1 truncate text-xs text-[#6C8349]">{banner.ctaLink}</p>}
      </div>

      <span className={banner.isActive ? 'admin-badge bg-[#E0EEE6] text-[#2A6A45]' : 'admin-badge bg-[#ECE7E1] text-[#665E55]'}>
        {banner.isActive ? t('admin.bannersPage.active') : t('admin.bannersPage.hidden')}
      </span>

      <div className="flex items-center gap-2">
        <button onClick={() => onToggle(banner)} className="admin-action-icon">
          {banner.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <button onClick={() => onEdit(banner)} className="admin-action-icon">
          <Edit className="h-4 w-4" />
        </button>
        <button onClick={() => onDelete(banner.id)} className="admin-action-icon hover:!text-[#C9571A]">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const emptyForm = {
  title: '',
  subtitle: '',
  imageDesktop: '',
  ctaText: '',
  ctaLink: '',
  isActive: true,
  sortOrder: 0,
};

export default function AdminBannersPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [localOrder, setLocalOrder] = useState<any[] | null>(null);

  const { data: bannersData, isLoading } = useQuery({
    queryKey: ['banners-admin'],
    queryFn: bannersApi.adminList,
  });

  const banners: any[] = localOrder ?? (bannersData as any) ?? [];
  const sensors = useSensors(useSensor(PointerSensor));

  const createMutation = useMutation({
    mutationFn: () => bannersApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners-admin'] });
      setShowForm(false);
      setForm(emptyForm);
      toast.success(t('admin.bannersPage.created'));
    },
    onError: () => toast.error(t('admin.bannersPage.createFailed')),
  });

  const updateMutation = useMutation({
    mutationFn: () => bannersApi.update(editId!, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners-admin'] });
      setEditId(null);
      setShowForm(false);
      setForm(emptyForm);
      toast.success(t('admin.bannersPage.updated'));
    },
    onError: () => toast.error(t('admin.bannersPage.updateFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners-admin'] });
      toast.success(t('admin.bannersPage.removed'));
    },
    onError: () => toast.error(t('admin.bannersPage.removeFailed')),
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => bannersApi.reorder(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners-admin'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: (banner: any) => bannersApi.update(banner.id, { isActive: !banner.isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners-admin'] }),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = banners.findIndex((b) => b.id === active.id);
    const newIndex = banners.findIndex((b) => b.id === over.id);
    const newOrder = arrayMove(banners, oldIndex, newIndex);
    setLocalOrder(newOrder);
    reorderMutation.mutate(newOrder.map((b) => b.id));
  }

  const startEdit = (banner: any) => {
    setEditId(banner.id);
    setForm({
      title: banner.title ?? '',
      subtitle: banner.subtitle ?? '',
      imageDesktop: banner.imageDesktop ?? '',
      ctaText: banner.ctaText ?? '',
      ctaLink: banner.ctaLink ?? '',
      isActive: banner.isActive ?? true,
      sortOrder: banner.sortOrder ?? 0,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('admin.bannersPage.confirmDelete'))) deleteMutation.mutate(id);
  };

  const handleSubmit = () => {
    if (editId) { updateMutation.mutate(); return; }
    createMutation.mutate();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="admin-page">
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-eyebrow">{t('admin.bannersPage.eyebrow')}</p>
            <h1 className="mt-4 font-heading text-[clamp(2.2rem,4.5vw,4rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              {t('admin.banners')}
            </h1>
            <p className="admin-subcopy mt-4 max-w-2xl">
              {t('admin.bannersPage.subcopy')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="admin-chip">{t('admin.bannersPage.count', { count: banners.length })}</div>
            <button
              onClick={() => {
                setShowForm((v) => !v);
                setEditId(null);
                setForm(emptyForm);
              }}
              className="admin-btn-primary"
            >
              <Plus className="h-4 w-4" />
              {t('admin.bannersPage.newBanner')}
            </button>
          </div>
        </div>
      </section>

      {showForm && (
        <section className="admin-panel p-6 sm:p-7">
          <p className="admin-eyebrow">{editId ? t('admin.bannersPage.updateBannerEyebrow') : t('admin.bannersPage.newBanner')}</p>
          <h2 className="mt-3 font-heading text-[2rem] leading-none tracking-[-0.05em] text-[#171C14]">
            {editId ? t('admin.bannersPage.editBanner') : t('admin.bannersPage.createBanner')}
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { key: 'title', label: t('admin.bannersPage.fieldTitle'), placeholder: t('admin.bannersPage.phTitle') },
              { key: 'subtitle', label: t('admin.bannersPage.fieldSubtitle'), placeholder: t('admin.bannersPage.phSubtitle') },
              { key: 'imageDesktop', label: t('admin.bannersPage.fieldImage'), placeholder: 'https://res.cloudinary.com/...' },
              { key: 'ctaText', label: t('admin.bannersPage.fieldCtaText'), placeholder: t('admin.bannersPage.phCtaText') },
              { key: 'ctaLink', label: t('admin.bannersPage.fieldCtaLink'), placeholder: t('admin.bannersPage.phCtaLink') },
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

          <label className="mt-5 inline-flex items-center gap-3 text-sm text-[#454B45]">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded accent-[#273E1C]"
            />
            {t('admin.bannersPage.activeOnStore')}
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleSubmit}
              disabled={!form.title || !form.imageDesktop || isPending}
              className="admin-btn-primary disabled:opacity-50"
            >
              {isPending ? t('admin.bannersPage.saving') : editId ? t('admin.bannersPage.update') : t('admin.bannersPage.create')}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); }}
              className="admin-btn-secondary"
            >
              {t('admin.bannersPage.cancel')}
            </button>
          </div>
        </section>
      )}

      <section className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="admin-panel h-24 animate-pulse" />
          ))
        ) : banners.length === 0 ? (
          <div className="admin-panel admin-empty p-6">
            <p className="text-sm">{t('admin.bannersPage.empty')}</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={banners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {banners.map((banner) => (
                <SortableRow
                  key={banner.id}
                  banner={banner}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                  onToggle={(item: any) => toggleMutation.mutate(item)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </section>
    </div>
  );
}
