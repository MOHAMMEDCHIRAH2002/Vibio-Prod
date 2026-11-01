'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { categoriesApi, productsApi } from '@/lib/api';
import { toast } from 'sonner';
import { localizedText } from '@/lib/i18n/localized';
import { useTranslation } from 'react-i18next';

interface Variant {
  name: string;
  name_ar: string;
  value: string;
  value_ar: string;
  sku: string;
  price: string;
  stock: string;
}

const emptyVariant = (): Variant => ({
  name: '',
  name_ar: '',
  value: '',
  value_ar: '',
  sku: '',
  price: '',
  stock: '',
});

export default function NewProductPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    name_ar: '',
    slug: '',
    description: '',
    description_ar: '',
    categoryId: '',
    isFeatured: false,
    tags: '',
    tags_ar: '',
    images: '',
  });
  const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const categories = (categoriesData as any) || [];

  const createMutation = useMutation({
    mutationFn: () => {
      const parsedVariants = variants.map((v) => ({
        name: v.name,
        name_ar: v.name_ar || undefined,
        value: v.value,
        value_ar: v.value_ar || undefined,
        price: parseFloat(v.price) || 0,
        stock: parseInt(v.stock) || 0,
        ...(v.sku ? { sku: v.sku } : {}),
      }));

      // basePrice = lowest variant price so the storefront listing price is always accurate
      const prices = parsedVariants.map((v) => v.price).filter((p) => p > 0);
      const basePrice = prices.length ? Math.min(...prices) : 0;

      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        name_ar: form.name_ar || undefined,
        description_ar: form.description_ar || undefined,
        categoryId: form.categoryId || undefined,
        isFeatured: form.isFeatured,
        basePrice,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        tags_ar: form.tags_ar.split(',').map((t) => t.trim()).filter(Boolean),
        images: form.images.split('\n').map((u) => u.trim()).filter(Boolean),
        variants: parsedVariants,
      };

      return productsApi.create(payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-products'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['admin-stock'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['products', 'featured'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'all' }),
      ]);
      toast.success(t('adminProductForm.created'));
      router.replace('/admin/products');
    },
    onError: (err: any) => {
      const messages: string[] = Array.isArray(err?.message)
        ? err.message
        : [err?.message || t('adminProductForm.fixErrors')];
      setFieldErrors(messages);
      toast.error(t('adminProductForm.fixErrors'));
    },
  });

  const setField = (key: string, value: any) => {
    setFieldErrors([]);
    setForm((c) => ({ ...c, [key]: value }));
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (value: string) => {
    setField('name', value);
    if (!form.slug || form.slug === autoSlug(form.name)) setField('slug', autoSlug(value));
  };

  const setVariantField = (index: number, key: keyof Variant, value: string) => {
    setFieldErrors([]);
    setVariants((c) => c.map((v, i) => (i === index ? { ...v, [key]: value } : v)));
  };

  const addVariant = () => setVariants((c) => [...c, emptyVariant()]);
  const removeVariant = (index: number) => setVariants((c) => c.filter((_, i) => i !== index));

  const canSubmit =
    form.name &&
    form.slug &&
    form.categoryId &&
    variants.some((v) => v.name && v.value && Number(v.price) > 0);

  return (
    <div className="admin-page" dir={i18n.resolvedLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-wrap items-start gap-4">
          <Link href="/admin/products" className="admin-action-icon">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="admin-eyebrow">{t('adminProductForm.catalogCreation')}</p>
            <h1 className="mt-3 font-heading text-[clamp(2.1rem,4vw,3.6rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              {t('adminProductForm.newProduct')}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5E5C54]">
              {t('adminProductForm.createDescription')}
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
                {fieldErrors.length === 1 ? t('adminProductForm.fixOne') : t('adminProductForm.fixMany', { count: fieldErrors.length })}
              </p>
              <ul className="mt-2 space-y-1">
                {fieldErrors.map((msg, i) => (
                  <li key={i} className="text-sm text-[#7A3A1A]">
                    · {msg}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-[1.55fr_0.75fr]">
        <div className="space-y-5">
          {/* Basic info */}
          <div className="admin-panel p-6">
            <p className="admin-eyebrow">{t('adminProductForm.basicInfo')}</p>
            <h2 className="mt-3 font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#171C14]">
              {t('adminProductForm.productIdentity')}
            </h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">
                  {t('adminProductForm.productName')} <span className="text-[#C9571A]">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Dattes Medjool Gold"
                  className="admin-input"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('adminProductForm.productNameArabic')}</label>
                <input value={form.name_ar} onChange={(e) => setField('name_ar', e.target.value)} dir="rtl" className="admin-input" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">
                  {t('adminProductForm.slug')} <span className="text-[#C9571A]">*</span>
                </label>
                <input
                  value={form.slug}
                  onChange={(e) => setField('slug', e.target.value)}
                  placeholder="medjool-gold-dates"
                  className="admin-input font-mono"
                />
                <p className="mt-1.5 text-xs text-[#7A776F]">{t('adminProductForm.slugHint')}</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('adminProductForm.description')}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  rows={6}
                  placeholder={t('adminProductForm.descriptionPlaceholder')}
                  className="admin-textarea resize-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('adminProductForm.descriptionArabic')}</label>
                <textarea value={form.description_ar} onChange={(e) => setField('description_ar', e.target.value)} rows={6} dir="rtl" className="admin-textarea resize-none" />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="admin-panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="admin-eyebrow">{t('adminProductForm.variants')}</p>
                <h2 className="mt-3 font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#171C14]">
                  {t('adminProductForm.sellingFormats')}
                </h2>
                <p className="mt-1 text-xs text-[#7A776F]">
                  {t('adminProductForm.variantHint')}
                </p>
              </div>
              <button onClick={addVariant} className="admin-btn-secondary flex-shrink-0">
                <Plus className="h-4 w-4" />
                {t('adminProductForm.addVariant')}
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="rounded-[1.4rem] border border-[#EDE5DA] bg-white/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[#4D554E]">{t('adminProductForm.variant', { number: index + 1 })}</span>
                    {variants.length > 1 && (
                      <button
                        onClick={() => removeVariant(index)}
                        className="admin-action-icon hover:!text-[#C9571A]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {([
                      { key: 'name' as keyof Variant, label: `${t('adminProductForm.name')} *`, placeholder: 'Boîte 500 g', hint: t('adminProductForm.optionalArabic') },
                      { key: 'name_ar' as keyof Variant, label: t('adminProductForm.nameArabic'), placeholder: 'الاسم', hint: t('adminProductForm.optionalArabic') },
                      { key: 'value' as keyof Variant, label: `${t('adminProductForm.value')} *`, placeholder: '500 g', hint: t('adminProductForm.optionalValue') },
                      { key: 'value_ar' as keyof Variant, label: t('adminProductForm.valueArabic'), placeholder: 'القيمة', hint: t('adminProductForm.optionalValue') },
                      { key: 'sku' as keyof Variant, label: t('adminProductForm.sku'), placeholder: 'MDJ-500G', hint: t('adminProductForm.optionalArabic') },
                      { key: 'price' as keyof Variant, label: `${t('adminProductForm.price')} *`, placeholder: '199', hint: t('adminProductForm.sellingPrice') },
                      { key: 'stock' as keyof Variant, label: `${t('adminProductForm.stock')} *`, placeholder: '100', hint: t('adminProductForm.unitsAvailable') },
                    ] as { key: keyof Variant; label: string; placeholder: string; hint: string }[]).map(({ key, label, placeholder, hint }) => (
                      <div key={key}>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-[#6B6A63]">
                          {label}
                        </label>
                        <input
                          value={variant[key]}
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

          {/* Images */}
          <div className="admin-panel p-6">
            <p className="admin-eyebrow">{t('adminProductForm.visuals')}</p>
            <h2 className="mt-3 font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#171C14]">
              {t('adminProductForm.imageSources')}
            </h2>
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#3E433E]">
                {t('adminProductForm.imageUrls')} <span className="text-xs font-normal text-[#7A776F]">{t('adminProductForm.onePerLine')}</span>
              </label>
              <textarea
                value={form.images}
                onChange={(e) => setField('images', e.target.value)}
                rows={5}
                placeholder={`https://res.cloudinary.com/vibio/image/upload/v1/product-1.jpg\nhttps://res.cloudinary.com/vibio/image/upload/v1/product-1-2.jpg`}
                className="admin-textarea resize-none font-mono text-xs"
              />
              <p className="mt-1.5 text-xs text-[#7A776F]">{t('adminProductForm.imageHint')}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="admin-panel p-6">
            <p className="admin-eyebrow">{t('adminProductForm.organization')}</p>
            <h2 className="mt-3 font-heading text-[1.8rem] leading-none tracking-[-0.05em] text-[#171C14]">
              {t('adminProductForm.productSettings')}
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('adminProductForm.category')}</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setField('categoryId', e.target.value)}
                  className="admin-select"
                >
                  <option value="">{t('adminProductForm.selectCategory')}</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {localizedText(category.name, category.name_ar, i18n.language)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('adminProductForm.tags')}</label>
                <input
                  value={form.tags}
                  onChange={(e) => setField('tags', e.target.value)}
                  placeholder="organic, premium, gift"
                  className="admin-input"
                />
                <p className="mt-1.5 text-xs text-[#7A776F]">{t('adminProductForm.tagsHint')}</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E433E]">{t('adminProductForm.tagsArabic')}</label>
                <input
                  value={form.tags_ar}
                  onChange={(e) => setField('tags_ar', e.target.value)}
                  placeholder="عضوي، فاخر، هدية"
                  dir="rtl"
                  className="admin-input"
                />
                <p className="mt-1.5 text-xs text-[#7A776F]">{t('adminProductForm.tagsArabicHint')}</p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#EDE5DA] bg-white/60 px-4 py-3 transition-colors hover:bg-[#EFF5E7]">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setField('isFeatured', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-[#273E1C]"
                />
                <div>
                  <p className="text-sm font-medium text-[#3E433E]">{t('adminProductForm.featured')}</p>
                  <p className="mt-0.5 text-xs text-[#7A776F]">{t('adminProductForm.featuredHint')}</p>
                </div>
              </label>
            </div>
          </div>

          <div className="admin-panel p-4">
            <p className="text-xs text-[#7A776F]">
              <strong className="text-[#3E433E]">{t('adminProductForm.basePrice')}</strong> {t('adminProductForm.basePriceHint')}
            </p>
          </div>

          <button
            onClick={() => createMutation.mutate()}
            disabled={!canSubmit || createMutation.isPending}
            className="admin-btn-primary w-full disabled:opacity-50"
          >
            {createMutation.isPending ? t('adminProductForm.creating') : t('adminProductForm.create')}
          </button>

          {fieldErrors.length > 0 && (
            <p className="text-center text-xs text-[#C9571A]">
              {t('adminProductForm.scrollErrors')}
            </p>
          )}

          <Link href="/admin/products" className="admin-btn-secondary w-full text-center">
            {t('adminProductForm.cancel')}
          </Link>
        </div>
      </section>
    </div>
  );
}
