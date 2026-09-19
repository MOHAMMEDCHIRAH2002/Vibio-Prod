'use client';

import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { ArrowRight, Sparkles, Package, Truck, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProductGrid from '@/components/shop/ProductGrid';

interface Props {
  category: any;
}

export default function CategoryPageClient({ category }: Props) {
  const { t } = useTranslation();

  const products = category.products || [];
  const productCount = category._count?.products || products.length || 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-primary-bg pt-28">
      {/* Ambient luxury background */}
      <div className="pointer-events-none absolute left-[-10%] top-20 h-[520px] w-[520px] rounded-full bg-[#D8E8C8]/35 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-12%] top-40 h-[600px] w-[600px] rounded-full bg-[#F2E4C7]/45 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-40 left-[35%] h-[420px] w-[420px] rounded-full bg-[#D6C28D]/15 blur-[110px]" />

      <section className="relative px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px] space-y-7">
          {/* HERO */}
          <div className="surface-shell relative overflow-hidden px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
            <div className="pointer-events-none absolute -right-10 top-8 hidden select-none font-heading text-[clamp(7rem,18vw,16rem)] leading-none tracking-[-0.1em] text-[#1E2519]/[0.035] lg:block">
              {category.name?.split(' ')?.[0] || 'Ritual'}
            </div>

            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[47%] bg-[linear-gradient(90deg,transparent,rgba(244,238,226,0.72))] lg:block" />

            <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
              {/* Left editorial content */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#DED2BD] bg-white/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6F7E55] shadow-[0_12px_40px_rgba(39,62,28,0.06)] backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t('category.collectionFocus')}
                  </div>

                  <h1 className="mt-7 max-w-[9.5ch] font-heading text-[clamp(3.4rem,7vw,6.6rem)] leading-[0.88] tracking-[-0.075em] text-[#1E2519]">
                    {category.name}
                  </h1>

                  {category.description && (
                    <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#566153] sm:text-[16px]">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link href="/shop" className="btn-gold group">
                    {t('category.viewAllCollections')}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl-flip" />
                  </Link>

                  <div className="lux-pill px-5 py-3">
                    <span className="ltr-nums">{productCount}</span>{' '}
                    {productCount === 1 ? t('category.product') : t('category.products')}
                  </div>
                </div>
              </div>

              {/* Right visual composition */}
              <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-[#E1D5C2] bg-[#F5F0E7] shadow-[0_30px_90px_rgba(49,37,20,0.08)] lg:min-h-[430px]">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_70%_35%,rgba(56,156,73,0.18),transparent_35%),linear-gradient(135deg,#F8F5ED,#EFE7D6)]" />
                )}

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.18)_45%,rgba(255,255,255,0.35)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.88),transparent_28%),radial-gradient(circle_at_18%_80%,rgba(39,62,28,0.16),transparent_30%)]" />

                <div className="absolute bottom-6 left-6 right-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/60 bg-white/72 p-5 shadow-[0_20px_55px_rgba(39,62,28,0.12)] backdrop-blur-xl">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8A7A57]">
                      {t('category.curatedSelectionLabel')}
                    </p>
                    <p className="mt-2 font-heading text-[1.7rem] leading-[1] tracking-[-0.05em] text-[#1E2519]">
                      {t('category.curatedSelectionTitle')}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/60 bg-white/72 p-5 shadow-[0_20px_55px_rgba(39,62,28,0.12)] backdrop-blur-xl">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8A7A57]">
                      {t('category.premiumLabel')}
                    </p>
                    <p className="mt-2 font-heading text-[1.7rem] leading-[1] tracking-[-0.05em] text-[#1E2519]">
                      {t('category.premiumTitle')}
                    </p>
                  </div>
                </div>

                <div className="absolute left-7 top-7 h-4 w-4 rounded-full border-[6px] border-[#D5B76E]/70 bg-white shadow-[0_10px_30px_rgba(213,183,110,0.22)]" />
                <div className="absolute right-9 top-9 h-16 w-16 rounded-full border border-white/80 bg-white/25 shadow-[0_20px_60px_rgba(255,255,255,0.35)] backdrop-blur-md" />
              </div>
            </div>

            {/* Bottom stats */}
            <div className="relative mt-8 grid gap-4 border-t border-[#E8E0D2] pt-6 sm:grid-cols-3">
              {[
                { icon: Package, value: `${productCount}+`, label: t('category.piecesAvailable') },
                { icon: Leaf, value: '6', label: t('category.collectionWorlds') },
                { icon: Truck, value: '24-48h', label: t('category.usualDispatch') },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="group rounded-[1.4rem] border border-[#E1D5C2] bg-white/72 px-5 py-5 shadow-[0_18px_55px_rgba(49,37,20,0.045)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(49,37,20,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-heading text-[2rem] leading-none tracking-[-0.06em] text-[#1E2519] ltr-nums">
                          {stat.value}
                        </p>
                        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#777F6A]">
                          {stat.label}
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFF5E7] text-[#214D18] transition duration-300 group-hover:bg-[#214D18] group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRODUCTS SECTION */}
          <div className="surface-shell relative overflow-hidden p-5 sm:p-6 lg:p-7">
            <div className="pointer-events-none absolute -bottom-32 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#D8E8C8]/25 blur-[90px]" />

            <div className="relative mb-7 flex flex-col gap-5 border-b border-[#E8E0D2] pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="section-eyebrow">{t('category.productsEyebrow')}</p>
                <h2 className="mt-3 font-heading text-[clamp(2.3rem,4vw,4rem)] leading-[0.95] tracking-[-0.06em] text-[#1E2519]">
                  {t('category.curatedTitle')}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#66705F]">
                  {t('category.curatedSubtitle')}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="lux-pill px-4 py-3">
                  {t('category.available', { count: productCount })}
                </div>

                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full border border-[#D8CCB8] bg-white/70 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1E2519] transition duration-300 hover:border-[#214D18] hover:text-[#214D18]"
                >
                  {t('category.backToShop')}
                  <ArrowRight className="h-3.5 w-3.5 rtl-flip" />
                </Link>
              </div>
            </div>

            <div className="relative">
              {products.length > 0 ? (
                <ProductGrid products={products} />
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-[#D8CCB8] bg-[#FAF8F2]/70 p-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF5E7] text-[#214D18]">
                    <Package className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 font-heading text-[2.2rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                    {t('category.emptyTitle')}
                  </h3>

                  <p className="mt-3 max-w-md text-sm leading-7 text-[#66705F]">
                    {t('category.emptyBody')}
                  </p>

                  <Link href="/shop" className="btn-gold mt-6">
                    {t('category.exploreAll')}
                    <ArrowRight className="h-4 w-4 rtl-flip" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
