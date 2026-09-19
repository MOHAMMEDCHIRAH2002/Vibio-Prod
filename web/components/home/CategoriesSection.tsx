'use client';

import { useQuery } from '@tanstack/react-query';
import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { categoriesApi } from '@/lib/api';
import type { Category } from '@/types';

/**
 * Card proportions keyed by the column span the card occupies. Wider cards give
 * their image more room; narrower ones give the text more. The `sm:`/`lg:` text
 * widths preserve the original desktop proportions — only the sub-640px base is
 * roomier, so a category name and its CTA aren't squeezed into ~180px on a phone.
 */
const CARD_STYLES: Record<number, { minHeight: string; mediaWrap: string; content: string }> = {
  4: {
    minHeight: 'lg:min-h-[280px]',
    mediaWrap: 'w-[43%] lg:w-[42%]',
    content: 'max-w-[64%] sm:max-w-[54%] lg:max-w-[56%]',
  },
  5: {
    minHeight: 'lg:min-h-[520px]',
    mediaWrap: 'w-[56%] lg:w-[58%]',
    content: 'max-w-[62%] sm:max-w-[48%] lg:max-w-[44%]',
  },
  6: {
    minHeight: 'lg:min-h-[280px]',
    mediaWrap: 'w-[43%] lg:w-[44%]',
    content: 'max-w-[64%] sm:max-w-[54%] lg:max-w-[50%]',
  },
  7: {
    minHeight: 'lg:min-h-[520px]',
    mediaWrap: 'w-[55%] lg:w-[56%]',
    content: 'max-w-[62%] sm:max-w-[46%] lg:max-w-[42%]',
  },
  12: {
    minHeight: 'lg:min-h-[280px]',
    mediaWrap: 'w-[43%] lg:w-[46%]',
    content: 'max-w-[64%] sm:max-w-[54%] lg:max-w-[48%]',
  },
};

/** Tailwind needs literal class names, so the spans map to a static lookup. */
const COL_SPAN_CLASS: Record<number, string> = {
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  12: 'lg:col-span-12',
};

/**
 * Column spans for the 12-column mosaic, for any number of categories.
 *
 * The first two cards stay large (5 + 7) exactly as before; the remainder tile
 * evenly — trios at 4 columns, otherwise pairs at 6 — and a card that would be
 * left alone on its row is widened to fill it instead of leaving a gap.
 *
 * With four categories this returns [5, 7, 6, 6]: the original layout, unchanged.
 */
function columnSpans(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [12];
  if (count === 2) return [5, 7];

  const spans = [5, 7];
  const rest = count - 2;
  const span = rest % 3 === 0 ? 4 : 6;
  for (let i = 0; i < rest; i += 1) spans.push(span);

  // Widen a lone trailing card so it doesn't sit next to empty space.
  if (rest % (12 / span) === 1) spans[spans.length - 1] = 12;

  return spans;
}

export default function CategoriesSection() {
  const { t } = useTranslation();
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px]">
          <div className="surface-shell p-6 sm:p-7 lg:p-8">
            <div className="mb-7 h-28 rounded-[24px] skeleton" />
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="h-[520px] rounded-[34px] skeleton lg:col-span-5" />
              <div className="h-[520px] rounded-[34px] skeleton lg:col-span-7" />
              <div className="h-[280px] rounded-[34px] skeleton lg:col-span-6" />
              <div className="h-[280px] rounded-[34px] skeleton lg:col-span-6" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!categories?.length) return null;

  // Every category is shown — the homepage is where customers orient themselves,
  // so silently dropping one hides a whole part of the catalogue.
  const spans = columnSpans(categories.length);

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="surface-shell p-6 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5 border-b border-[#E7DDCC] pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="section-eyebrow">{t('categories.eyebrow')}</p>
              <h2 className="font-heading text-[clamp(2.55rem,5vw,4.35rem)] leading-[0.95] tracking-[-0.06em] text-[#1E2519]">
                {t('categories.title')}
              </h2>
            </div>

            <div className="max-w-xl">
              <p className="text-[15px] leading-8 text-[#5B6455]">
                {t('categories.description')}
              </p>

              <Link
                href="/shop"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#273E1C] transition-colors hover:text-[#4F6F2D]"
              >
                {t('categories.viewFull')}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl-flip" />
              </Link>
            </div>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-12">
            {categories.map((category, index) => {
              const span = spans[index];
              const style = CARD_STYLES[span];
              const image = category.image;
              const productCount = category._count?.products ?? 0;

              return (
                <div key={category.id} className={`${COL_SPAN_CLASS[span]} ${style.minHeight}`}>
                  <Link
                    href={`/shop/${category.slug}`}
                    className="group card-luxury relative flex h-full min-h-[280px] overflow-hidden rounded-[34px] border border-[#E7DDCC] bg-[#FFFEFA] p-5 shadow-[0_18px_55px_rgba(30,37,25,0.045)] transition-all duration-500 hover:-translate-y-1 hover:border-[#D8C7AD] hover:shadow-[0_26px_70px_rgba(30,37,25,0.09)] sm:p-6"
                  >
                    {/* Premium base light */}
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.92),rgba(255,255,255,0)_42%),linear-gradient(135deg,rgba(250,246,238,0.75),rgba(255,255,255,0.2))]" />

                    {/* Image — or a branded monogram tile when the category has none,
                        so a missing image never leaves a blank half-card. */}
                    <div
                      className={`absolute right-0 bottom-0 h-full ${style.mediaWrap} overflow-hidden rounded-l-[28px]`}
                    >
                      {image ? (
                        <Image
                          src={image}
                          alt={category.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 42vw"
                          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#F4EFE3_0%,#E8E0CE_100%)]"
                        >
                          <span className="font-heading text-[clamp(3.5rem,7vw,6rem)] leading-none tracking-[-0.06em] text-[#273E1C]/[0.12]">
                            {category.name.trim().charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Image soft fade */}
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,254,250,0.92)_0%,rgba(255,254,250,0.42)_28%,rgba(255,254,250,0.02)_70%)]" />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(30,37,25,0.08))]" />
                    </div>

                    {/* Text readability layer */}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,254,250,0.98)_0%,rgba(255,254,250,0.9)_34%,rgba(255,254,250,0.34)_62%,rgba(255,254,250,0)_100%)]" />

                    {/* Small luxury highlight */}
                    <div className="pointer-events-none absolute left-6 top-6 h-16 w-16 rounded-full bg-[#D8B36A]/10 blur-2xl" />

                    <div
                      className={`relative z-10 flex h-full ${style.content} flex-col justify-between gap-8`}
                    >
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#3D8B45]">
                          {t('categories.collection')}
                        </p>

                        <h3 className="mt-3 font-heading text-[clamp(1.55rem,2.35vw,2.28rem)] leading-[0.98] tracking-[-0.05em] text-[#182017]">
                          {category.name}
                        </h3>

                        {productCount > 0 && (
                          <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A8470]">
                            {productCount} {t('categories.pieces')}
                          </p>
                        )}
                      </div>

                      <div>
                        {category.description && (
                          <p className="max-w-[19rem] text-sm leading-7 text-[#5B6455]">
                            {category.description}
                          </p>
                        )}

                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#E9DFD1] bg-white/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#273E1C] shadow-[0_12px_24px_rgba(30,37,25,0.07)] backdrop-blur-sm transition-all duration-300 group-hover:border-[#D1B987] group-hover:bg-[#FFF9EE] group-hover:shadow-[0_16px_30px_rgba(30,37,25,0.1)]">
                          {t('common.discover')}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl-flip" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}