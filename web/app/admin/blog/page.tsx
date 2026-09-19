'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Eye, EyeOff, Plus, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { blogApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

type BlogStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  tags: '',
  status: 'DRAFT' as BlogStatus,
  scheduledAt: '',
  metaTitle: '',
  metaDesc: '',
};

// datetime-local has no timezone; send a full ISO instant in the admin's TZ.
const toISO = (localValue: string) => (localValue ? new Date(localValue).toISOString() : null);

const STATUS_BADGE: Record<BlogStatus, string> = {
  PUBLISHED: 'admin-badge bg-[#E0EEE6] text-[#2A6A45]',
  SCHEDULED: 'admin-badge bg-[#FBEBD0] text-[#8A631D]',
  DRAFT: 'admin-badge bg-[#ECE7E1] text-[#665E55]',
  ARCHIVED: 'admin-badge bg-[#EDE3E0] text-[#8A5A4E]',
};

export default function AdminBlogPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog', page],
    queryFn: () => blogApi.adminList({ page, limit: 20 }),
  });

  const posts: any[] = (data as any)?.posts ?? [];
  const pages: number = (data as any)?.pages ?? 1;
  const total: number = (data as any)?.total ?? 0;

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const buildPayload = () => ({
    title: form.title,
    slug: form.slug,
    excerpt: form.excerpt,
    content: form.content,
    coverImage: form.coverImage,
    metaTitle: form.metaTitle,
    metaDesc: form.metaDesc,
    tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    status: form.status,
    // Only relevant for SCHEDULED; the server clears it otherwise.
    scheduledAt: form.status === 'SCHEDULED' ? toISO(form.scheduledAt) : null,
  });

  const createMutation = useMutation({
    mutationFn: () => blogApi.create(buildPayload()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog'] });
      setShowForm(false);
      setForm(emptyForm);
      toast.success(t('admin.blogPage.created'));
    },
    onError: (e: any) => toast.error(e?.message || t('admin.blogPage.createFailed')),
  });

  const updateMutation = useMutation({
    mutationFn: () => blogApi.update(editId!, buildPayload()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog'] });
      setEditId(null);
      setShowForm(false);
      setForm(emptyForm);
      toast.success(t('admin.blogPage.updated'));
    },
    onError: (e: any) => toast.error(e?.message || t('admin.blogPage.updateFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog'] });
      toast.success(t('admin.blogPage.deleted'));
    },
    onError: () => toast.error(t('admin.blogPage.deleteFailed')),
  });

  // Quick publish/unpublish toggle: PUBLISHED ⇄ DRAFT.
  const toggleMutation = useMutation({
    mutationFn: (post: any) =>
      blogApi.update(post.id, {
        status: post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blog'] }),
    onError: () => toast.error(t('admin.blogPage.toggleFailed')),
  });

  const startEdit = (post: any) => {
    setEditId(post.id);
    setForm({
      title: post.title ?? '',
      slug: post.slug ?? '',
      excerpt: post.excerpt ?? '',
      content: post.content ?? '',
      coverImage: post.coverImage ?? '',
      tags: post.tags?.map((t: any) => t.name).join(', ') ?? '',
      status: (post.status as BlogStatus) ?? 'DRAFT',
      // datetime-local expects local wall-clock: convert the stored UTC instant.
      scheduledAt: post.scheduledAt
        ? new Date(new Date(post.scheduledAt).getTime() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        : '',
      metaTitle: post.metaTitle ?? '',
      metaDesc: post.metaDesc ?? '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm(t('admin.blogPage.confirmDelete'))) deleteMutation.mutate(id);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="admin-page">
      {/* Header */}
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-eyebrow">{t('admin.blogPage.eyebrow')}</p>
            <h1 className="mt-4 font-heading text-[clamp(2.2rem,4.5vw,4rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              {t('admin.blogPage.title')}
            </h1>
            <p className="admin-subcopy mt-4 max-w-2xl">
              {t('admin.blogPage.subcopy')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="admin-chip">{t('admin.blogPage.count', { count: total })}</div>
            <button
              onClick={() => { setShowForm((v) => !v); setEditId(null); setForm(emptyForm); }}
              className="admin-btn-primary"
            >
              <Plus className="h-4 w-4" />
              {t('admin.blogPage.newPost')}
            </button>
          </div>
        </div>
      </section>

      {/* Form */}
      {showForm && (
        <section className="admin-panel p-6 sm:p-7">
          <p className="admin-eyebrow">{editId ? t('admin.blogPage.editPostEyebrow') : t('admin.blogPage.newPost')}</p>
          <h2 className="mt-3 font-heading text-[2rem] leading-none tracking-[-0.05em] text-[#171C14]">
            {editId ? t('admin.blogPage.updatePost') : t('admin.blogPage.createPost')}
          </h2>

          <div className="mt-6 space-y-5">
            {/* Title + slug row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('admin.blogPage.fieldTitle')}</label>
                <input
                  value={form.title}
                  onChange={(e) => {
                    set('title', e.target.value);
                    if (!editId) set('slug', slugify(e.target.value));
                  }}
                  placeholder={t('admin.blogPage.phTitle')}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('admin.blogPage.fieldSlug')}</label>
                <input
                  value={form.slug}
                  onChange={(e) => set('slug', slugify(e.target.value))}
                  placeholder={t('admin.blogPage.phSlug')}
                  className="admin-input font-mono text-sm"
                />
              </div>
            </div>

            {/* Cover + tags row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('admin.blogPage.fieldCover')}</label>
                <input
                  value={form.coverImage}
                  onChange={(e) => set('coverImage', e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="admin-input"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('admin.blogPage.fieldTags')}</label>
                <input
                  value={form.tags}
                  onChange={(e) => set('tags', e.target.value)}
                  placeholder={t('admin.blogPage.phTags')}
                  className="admin-input"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('admin.blogPage.fieldExcerpt')}</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                rows={2}
                placeholder={t('admin.blogPage.phExcerpt')}
                className="admin-textarea resize-none"
              />
            </div>

            {/* Content */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('admin.blogPage.fieldContent')}</label>
              <textarea
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                rows={14}
                placeholder={t('admin.blogPage.phContent')}
                className="admin-textarea"
              />
            </div>

            {/* SEO + publish row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('admin.blogPage.fieldMetaTitle')}</label>
                <input value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('admin.blogPage.fieldMetaDesc')}</label>
                <input value={form.metaDesc} onChange={(e) => set('metaDesc', e.target.value)} className="admin-input" />
              </div>
            </div>

            {/* Status + scheduling */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('admin.blogPage.statusLabel')}</label>
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as BlogStatus)}
                  className="admin-input"
                >
                  <option value="DRAFT">{t('admin.blogPage.statusDraft')}</option>
                  <option value="SCHEDULED">{t('admin.blogPage.statusScheduled')}</option>
                  <option value="PUBLISHED">{t('admin.blogPage.statusPublished')}</option>
                  <option value="ARCHIVED">{t('admin.blogPage.statusArchived')}</option>
                </select>
              </div>
              {form.status === 'SCHEDULED' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('admin.blogPage.scheduledAt')}</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => set('scheduledAt', e.target.value)}
                    className="admin-input"
                  />
                  <p className="mt-1 text-[11px] text-[#9A948C]">{t('admin.blogPage.scheduledHint')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => editId ? updateMutation.mutate() : createMutation.mutate()}
              disabled={
                !form.title || !form.slug || !form.content || isPending ||
                (form.status === 'SCHEDULED' && !form.scheduledAt)
              }
              className="admin-btn-primary disabled:opacity-50"
            >
              {isPending ? t('admin.blogPage.saving') : editId ? t('admin.blogPage.updatePost') : t('admin.blogPage.createPost')}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); }}
              className="admin-btn-secondary"
            >
              {t('admin.blogPage.cancel')}
            </button>
          </div>
        </section>
      )}

      {/* Post list */}
      <section className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[640px]">
            <thead>
              <tr>
                <th>{t('admin.blogPage.thTitle')}</th>
                <th className="hidden sm:table-cell">{t('admin.blogPage.thTags')}</th>
                <th>{t('admin.table.status')}</th>
                <th className="hidden md:table-cell">{t('admin.blogPage.thDate')}</th>
                <th className="text-right">{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5].map((c) => (
                        <td key={c}><div className="skeleton h-4 rounded-full" /></td>
                      ))}
                    </tr>
                  ))
                : posts.length === 0
                ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-[#9E9B93]">
                        {t('admin.blogPage.empty')}
                      </td>
                    </tr>
                  )
                : posts.map((post: any) => (
                    <tr key={post.id}>
                      <td>
                        <p className="text-sm font-semibold text-[#171C14] line-clamp-1">{post.title}</p>
                        <p className="mt-0.5 text-xs text-[#7A776F] font-mono">{post.slug}</p>
                      </td>
                      <td className="hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.slice(0, 3).map((t: any) => (
                            <span key={t.id} className="rounded-full bg-[#EFF5E7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#273E1C]">
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={STATUS_BADGE[post.status as BlogStatus] || STATUS_BADGE.DRAFT}>
                          {t(`admin.blogPage.status${(post.status || 'DRAFT').charAt(0) + (post.status || 'DRAFT').slice(1).toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="hidden md:table-cell text-sm text-[#6B6A63]">
                        {post.status === 'SCHEDULED' && post.scheduledAt
                          ? `${t('admin.blogPage.scheduledFor')} ${formatDate(post.scheduledAt)}`
                          : post.publishedAt
                            ? formatDate(post.publishedAt)
                            : '—'}
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          {post.status === 'PUBLISHED' && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="admin-action-icon"
                              title={t('admin.blogPage.viewOnSite')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => toggleMutation.mutate(post)}
                            className="admin-action-icon"
                            title={post.status === 'PUBLISHED' ? t('admin.blogPage.unpublish') : t('admin.blogPage.publish')}
                          >
                            {post.status === 'PUBLISHED'
                              ? <EyeOff className="h-4 w-4" />
                              : <Eye className="h-4 w-4" />
                            }
                          </button>
                          <button onClick={() => startEdit(post)} className="admin-action-icon">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="admin-action-icon hover:!text-[#C9571A]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-[#EEE6DB] px-5 py-4">
            <span className="text-sm text-[#6B6A63]">{t('admin.table.pageOf', { page, pages })}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="admin-btn-secondary !min-h-[2.7rem] !px-4 disabled:opacity-40"
              >{t('admin.table.prev')}</button>
              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="admin-btn-secondary !min-h-[2.7rem] !px-4 disabled:opacity-40"
              >{t('admin.table.next')}</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
