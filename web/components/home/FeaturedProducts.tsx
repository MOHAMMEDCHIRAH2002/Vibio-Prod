'use client';

import { useQuery } from '@tanstack/react-query';
import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.60, ease: [0.22, 1, 0.36, 1], delay: i * 0.10 },
  }),
};

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products', 'featured'],
    queryFn: productsApi.featured,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px]">
          <div className="surface-shell p-6 sm:p-7 lg:p-8">
            <div className="mb-8 h-24 rounded-[24px] skeleton" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[450px] rounded-[32px] skeleton" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!products?.length) return null;

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="surface-shell overflow-hidden p-6 sm:p-7 lg:p-8">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-2xl">
              <p className="section-eyebrow">{t('featured.eyebrow')}</p>
              <h2 className="font-heading text-[clamp(2.4rem,4.8vw,4rem)] leading-[0.96] tracking-[-0.055em] text-[#1E2519]">
                {t('featured.title')}
              </h2>
            </div>

            <div className="max-w-xl">
              <p className="text-[15px] leading-8 text-[#5B6455]">
                {t('featured.description')}
              </p>
              <Link
                href="/shop"
                className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#273E1C] transition-colors hover:text-[#4F6F2D]"
              >
                {t('featured.browseAll')}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl-flip" />
              </Link>
            </div>
          </motion.div>

          {/* ── Product grid ── */}
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((product, index) => {
              const lowestVariant = product.variants?.[0];
              const price = lowestVariant?.price ?? product.basePrice;
              const image = product.images?.[0];

              return (
                <motion.div
                  key={product.id}
                  custom={index}
                  variants={cardVariant}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-40px' }}
                  className="h-full"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="group relative flex h-full min-h-[450px] flex-col overflow-hidden rounded-[32px] border border-[#E6DDCF] bg-[#FFFEFA] p-4 shadow-[0_18px_50px_rgba(30,37,25,0.045)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#D4C2A5] hover:shadow-[0_30px_72px_rgba(30,37,25,0.10)]"
                  >
                    {/* Ambient light overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(216,179,106,0.12),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(250,247,241,0.45))]" />

                    {/* Card header */}
                    <div className="relative z-10 flex min-h-[6.6rem] items-start justify-between gap-3">
                      <div className="flex flex-1 flex-col">
                        <p className="line-clamp-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7A8162]">
                          {product.category?.name ?? t('featured.signatureEdit')}
                        </p>
                        <h3 className="mt-3 line-clamp-2 font-heading text-[clamp(1.45rem,2vw,1.8rem)] leading-[1] tracking-[-0.05em] text-[#182017]">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DED5C7] bg-white/85 text-[#273E1C] shadow-[0_10px_24px_rgba(30,37,25,0.06)] backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#CDB68B] group-hover:shadow-[0_16px_32px_rgba(30,37,25,0.10)]">
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    {/* Product image */}
                    <div className="relative z-10 mt-6 overflow-hidden rounded-[26px] border border-[#EEE7DC] bg-[#F4F0E8] p-2 shadow-inner">
                      <div className="relative aspect-[4/3.15] overflow-hidden rounded-[21px] bg-[#F3F0EA]">
                        {image ? (
                          <Image
                            src={image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#EFF5E7]" />
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(30,37,25,0.08))]" />
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.2),transparent)]" />
                      </div>
                    </div>

                    {/* Price + CTA footer */}
                    <div className="relative z-10 mt-auto pt-5">
                      <div className="flex items-center justify-between border-t border-[#E8E0D3] pt-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A806F]">
                            {t('common.from')}
                          </p>
                          <span className="mt-1 block text-sm font-semibold text-[#161A14] ltr-nums">
                            {price ? formatPrice(Number(price)) : '—'}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#273E1C]">
                          {t('common.view')}
                          <ArrowRight className="h-4 w-4 text-[#6B6B63] transition-transform duration-300 group-hover:translate-x-1 rtl-flip" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
