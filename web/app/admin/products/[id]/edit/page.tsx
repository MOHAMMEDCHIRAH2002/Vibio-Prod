'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { categoriesApi, productsApi } from '@/lib/api';
import { toast } from 'sonner';

interface Variant {
  id?: string;
  name: string;
  value: string;
  sku: string;
  price: string;
  stock: string;
}

const toVariantForm = (variant: any): Variant => ({
  id: variant.id,
  name: variant.name || '',
  value: variant.value || '',
  sku: variant.sku || '',
  price: String(variant.price ?? ''),
  stock: String(variant.stock ?? ''),
});

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    isFeatured: false,
    tags: '',
    images: '',
  });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [ready, setReady] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product-admin', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });
  const categories = (categoriesData as any) || [];

  useEffect(() => {
    if (product && !ready) {
      const p = product as any;
      setForm({
        name: p.name || '',
        slug: p.slug || '',
        description: p.description || '',
        categoryId: p.categoryId || '',
        isFeatured: p.isFeatured ?? false,
        tags: (p.tags || []).map((t: any) => t.name || t).join(', '),
        images: (p.images || []).join('\n'),
      });
      setVariants((p.variants || []).map(toVariantForm));
      setReady(true);
    }
  }, [product, ready]);

  const updateMutation = useMutation({
    mutationFn: () => {
      const parsedVariants = variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        name: v.name,
        value: v.value,
        price: parseFloat(v.price) || 0,
        stock: parseInt(v.stock) || 0,
        ...(v.sku ? { sku: v.sku } : {}),
      }));

      const prices = parsedVariants.map((v) => v.price).filter((p) => p > 0);
      const basePrice = prices.length ? Math.min(...prices) : 0;

      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        categoryId: form.categoryId || undefined,
        isFeatured: form.isFeatured,
        basePrice,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        images: form.images.split('\n').map((u) => u.trim()).filter(Boolean),
        variants: parsedVariants,
      };

      return productsApi.update(id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated');
      router.push('/admin/products');
    },
    onError: (err: any) => {
      const messages: string[] = Array.isArray(err?.message)
        ? err.message
        : [err?.message || 'Failed to update product'];
      setFieldErrors(messages);
      toast.error('Please fix the errors below');
    },
  });

  const setField = (key: string, value: any) => {
    setFieldErrors([]);
    setForm((c) => ({ ...c, [key]: value }));
  };

  const setVariantField = (index: number, key: keyof Variant, value: string) => {
    setFieldErrors([]);
    setVariants((c) => c.map((v, i) => (i === index ? { ...v, [key]: value } : v)));
  };

  const addVariant = () =>
    setVariants((c) => [...c, { name: '', value: '', sku: '', price: '', stock: '' }]);
  const removeVariant = (index: number) =>
    setVariants((c) => c.filter((_, i) => i !== index));

  const canSubmit = form.name && form.slug && variants.some((v) => v.name && v.value && v.price);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="admin-panel h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="admin-page">
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-wrap items-start gap-4">
          <Link href="/admin/products" className="admin-action-icon">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="admin-eyebrow">Catalog refinement</p>
            <h1 className="mt-3 font-heading text-[clamp(2.1rem,4vw,3.6rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              Edit product
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5E5C54]">
              Adjust the product narrative, merchandising structure, and selling formats.
            </p>
          </div>
        </div>
      </section>

      {fieldErrors.length > 0 && (
        <section className="admin-panel border-[#C9571A]/30 bg-[#FEF4EE] p-5">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C9571A]" />
            <div>
              <p className="text-sm font-semibold text-[#C9571A]">
                {fieldErrors.length === 1 ? 'Fix this error before saving' : `Fix these ${fieldErrors.length} errors before saving`}
              </p>
              <ul className="mt-2 space-y-1">
                {fieldErrors.map((msg, i) => (
                  <li key={i} className="text-sm text-[#7A3A1A]">· {msg}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-[1.55fr_0.75fr]">
        <div className="space-y-5">
          <div className="admin-panel p-6">
            <p className="admin-eyebrow">Basic information</p>
            <h2 className="mt-3 font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#171C14]">
              Product identity
            </h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">
                  Product Name <span className="text-[#C9571A]">*</span>
                </label>
                <input value={form.name} onChange={(e) => setField('name', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">
                  Slug <span className="text-[#C9571A]">*</span>
                </label>
                <input value={form.slug} onChange={(e) => setField('slug', e.target.value)} className="admin-input font-mono" />
                <p className="mt-1.5 text-xs text-[#7A776F]">Used in the product URL. Changing this will break existing links.</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  rows={6}
                  className="admin-textarea resize-none"
                />
              </div>
            </div>
          </div>

          <div className="admin-panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="admin-eyebrow">Variants</p>
                <h2 className="mt-3 font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#171C14]">
                  Selling formats
                </h2>
                <p className="mt-1 text-xs text-[#7A776F]">
                  Each variant needs a <strong>Name</strong>, a <strong>Value</strong> (e.g. 500g, Red), a <strong>Price</strong>, and a <strong>Stock</strong> count.
                </p>
              </div>
              <button onClick={addVariant} className="admin-btn-secondary flex-shrink-0">
                <Plus className="h-4 w-4" />
                Add variant
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="rounded-[1.4rem] border border-[#EDE5DA] bg-white/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[#4D554E]">Variant {index + 1}</span>
                    {variants.length > 1 && (
                      <button onClick={() => removeVariant(index)} className="admin-action-icon hover:!text-[#C9571A]">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {([
                      { key: 'name' as keyof Variant, label: 'Name *', placeholder: '500g Box', hint: 'Label shown to customer' },
                      { key: 'value' as keyof Variant, label: 'Value *', placeholder: '500g', hint: 'Machine-readable value' },
                      { key: 'sku' as keyof Variant, label: 'SKU', placeholder: 'MDJ-500G', hint: 'Optional unique stock code' },
                      { key: 'price' as keyof Variant, label: 'Price (MAD) *', placeholder: '199', hint: 'Selling price' },
                      { key: 'stock' as keyof Variant, label: 'Stock *', placeholder: '100', hint: 'Units available' },
                    ]).map(({ key, label, placeholder, hint }) => (
                      <div key={key}>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-[#6B6A63]">
                          {label}
                        </label>
                        <input
                          value={variant[key] ?? ''}
                          onChange={(e) => setVariantField(index, key, e.target.value)}
                          placeholder={placeholder}
                          className="admin-input"
                        />
                        <p className="mt-1 text-[10px] text-[#9A9690]">{hint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel p-6">
            <p className="admin-eyebrow">Visuals</p>
            <h2 className="mt-3 font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#171C14]">
              Image sources
            </h2>
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#3E433E]">
                Image URLs <span className="text-xs font-normal text-[#7A776F]">(one per line)</span>
              </label>
              <textarea
                value={form.images}
                onChange={(e) => setField('images', e.target.value)}
                rows={5}
                className="admin-textarea resize-none font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="admin-panel p-6">
            <p className="admin-eyebrow">Organization</p>
            <h2 className="mt-3 font-heading text-[1.8rem] leading-none tracking-[-0.05em] text-[#171C14]">
              Product settings
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">Category</label>
                <select value={form.categoryId} onChange={(e) => setField('categoryId', e.target.value)} className="admin-select">
                  <option value="">No category</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">Tags</label>
                <input
                  value={form.tags}
                  onChange={(e) => setField('tags', e.target.value)}
                  placeholder="organic, premium, gift"
                  className="admin-input"
                />
                <p className="mt-1.5 text-xs text-[#7A776F]">Comma-separated.</p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#EDE5DA] bg-white/60 px-4 py-3 transition-colors hover:bg-[#EFF5E7]">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setField('isFeatured', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-[#273E1C]"
                />
                <div>
                  <p className="text-sm font-medium text-[#3E433E]">Featured product</p>
                  <p className="mt-0.5 text-xs text-[#7A776F]">Shown on the homepage featured section.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="admin-panel p-4">
            <p className="text-xs text-[#7A776F]">
              <strong className="text-[#3E433E]">Base price</strong> is derived automatically from the lowest variant price.
            </p>
          </div>

          <button
            onClick={() => updateMutation.mutate()}
            disabled={!canSubmit || updateMutation.isPending}
            className="admin-btn-primary w-full disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </button>

          {fieldErrors.length > 0 && (
            <p className="text-center text-xs text-[#C9571A]">Scroll up to see the errors</p>
          )}

          <Link href="/admin/products" className="admin-btn-secondary w-full text-center">
            Cancel
          </Link>
        </div>
      </section>
    </div>
  );
}
