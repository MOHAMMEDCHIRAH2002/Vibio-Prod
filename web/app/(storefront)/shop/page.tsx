'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Grid3X3,
  LayoutList,
  PackageCheck,
  Search,
  SlidersHorizontal,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';

import { categoriesApi, productsApi } from '@/lib/api';
import ProductGrid from '@/components/shop/ProductGrid';
import FilterSidebar from '@/components/shop/FilterSidebar';

const sortOptions = [
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A-Z' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filterOpen, setFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<4 | 3>(4);

  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = Number(searchParams.get('page') || 1);
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice')
    ? Number(searchParams.get('minPrice'))
    : undefined;
  const maxPrice = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['products', { category, search, page, sort, minPrice, maxPrice }],
    queryFn: () =>
      productsApi.list({
        category,
        search,
        page,
        limit: 12,
        sort,
        minPrice,
        maxPrice,
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
    staleTime: 600000,
  });

  const products = (data as any)?.products || [];
  const total = (data as any)?.total || 0;
  const pages = (data as any)?.pages || 1;
  const categories = (categoriesData as any) || [];

  const selectedCategoryName = useMemo(() => {
    if (!category) return undefined;
    return categories.find((item: any) => item.slug === category)?.name || category;
  }, [categories, category]);

  const setParams = (
    updates: Record<string, string | undefined>,
    resetPage = true,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    if (resetPage) params.set('page', '1');

    const query = params.toString();
    router.push(query ? `/shop?${query}` : '/shop');
  };

  const clearAllFilters = () => {
    router.push('/shop');
  };

  const activeFilters = [
    category && {
      key: 'category',
      label: selectedCategoryName || category,
      value: category,
    },
    search && {
      key: 'search',
      label: `"${search}"`,
      value: search,
    },
    minPrice && {
      key: 'minPrice',
      label: `From ${minPrice} MAD`,
      value: String(minPrice),
    },
    maxPrice && {
      key: 'maxPrice',
      label: `To ${maxPrice} MAD`,
      value: String(maxPrice),
    },
  ].filter(Boolean) as { key: string; label: string; value: string }[];

  return (
    <div className="min-h-screen overflow-hidden bg-primary-bg pt-28">
      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px] space-y-8">
          {/* SHOP HERO */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="surface-shell relative overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-12"
          >
            <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-[#EFF5E7]/80 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-[52%] bg-[radial-gradient(circle_at_58%_22%,rgba(39,62,28,0.10),transparent_34%),linear-gradient(135deg,transparent,rgba(232,216,184,0.34))]" />
            <div className="pointer-events-none absolute -right-10 bottom-[-2rem] font-heading text-[clamp(7rem,18vw,19rem)] leading-none tracking-[-0.1em] text-[#273E1C]/[0.035]">
              Boutique
            </div>

            <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <div className="lux-pill w-fit px-4 py-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Curated storefront
                </div>

                <h1 className="mt-7 max-w-[10.5ch] font-heading text-[clamp(3.5rem,6.9vw,6.8rem)] leading-[0.86] tracking-[-0.075em] text-[#1E2519]">
                  Discover the full Vibio collection.
                </h1>

                <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#5B6455] sm:text-[16px]">
                  Browse tea, coffee, gourmet chocolates, natural care, gifting edits,
                  and artisanal tabletop pieces through a calm, curated luxury retail
                  experience.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button onClick={() => setFilterOpen(true)} className="btn-gold">
                    Explore filters
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setParams({ sort: 'newest' })}
                    className="btn-outline-gold"
                  >
                    New arrivals
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:self-end">
                {[
                  {
                    value: total ? `${total}+` : '12+',
                    label: 'Pieces available',
                    icon: PackageCheck,
                  },
                  {
                    value: `${categories.length || 6}`,
                    label: 'Collection worlds',
                    icon: Sparkles,
                  },
                  {
                    value: '24-48h',
                    label: 'Usual dispatch',
                    icon: Truck,
                  },
                ].map((stat, index) => {
                  const Icon = stat.icon;

                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.45,
                        delay: 0.12 + index * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="group relative overflow-hidden rounded-[30px] border border-[#E5D8BE] bg-white/74 px-5 py-5 shadow-[0_22px_70px_rgba(39,62,28,0.075)] backdrop-blur-xl"
                    >
                      <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C] opacity-90 transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-3.5 w-3.5" />
                      </div>

                      <p className="font-heading text-[2rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                        {stat.value}
                      </p>
                      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#78805F]">
                        {stat.label}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* CATALOGUE */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="surface-shell relative overflow-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7"
          >
            <div className="pointer-events-none absolute -left-24 bottom-8 h-72 w-72 rounded-full bg-[#EFF5E7]/55 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 top-24 h-80 w-80 rounded-full bg-[#F2E6CD]/45 blur-3xl" />

            {/* Editorial top bar */}
            <div className="relative flex flex-col gap-6 border-b border-[#ECE6D9] pb-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9A7B42]">
                  Current view
                </p>

                <h2 className="mt-2 font-heading text-[clamp(2.3rem,4vw,4.3rem)] leading-[0.9] tracking-[-0.065em] text-[#1E2519]">
                  {selectedCategoryName || 'All curated pieces'}
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#5B6455]">
                  {total > 0 ? `${total} products available` : 'No products yet'}
                  {search ? ` matching ${search}` : ''}. Selected for natural rituals,
                  elevated gifting, and a refined everyday table.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[520px]">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78805F]" />
                    <input
                      defaultValue={search || ''}
                      placeholder="Search rituals..."
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          const value = (event.target as HTMLInputElement).value.trim();
                          setParams({ search: value || undefined });
                        }
                      }}
                      className="h-12 w-full rounded-full border border-[#DED6C8] bg-white/82 pl-11 pr-4 text-sm text-[#1E2519] outline-none transition-all placeholder:text-[#9A9D8C] focus:border-[#C89A4B] focus:bg-white focus:shadow-[0_0_0_4px_rgba(200,154,75,0.12)]"
                    />
                  </div>

                  <select
                    value={sort}
                    onChange={(event) => setParams({ sort: event.target.value })}
                    className="h-12 rounded-full border border-[#DED6C8] bg-white/82 px-5 text-sm text-[#1E2519] outline-none transition-all focus:border-[#C89A4B] focus:bg-white focus:shadow-[0_0_0_4px_rgba(200,154,75,0.12)] sm:min-w-[220px]"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <button
                    onClick={() => setFilterOpen(true)}
                    className="btn-outline-gold"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilters.length > 0 && (
                      <span className="rounded-full bg-[#273E1C] px-2 py-0.5 text-[10px] font-bold text-white">
                        {activeFilters.length}
                      </span>
                    )}
                  </button>

                  <div className="hidden items-center gap-1 rounded-full border border-[#DEDACE] bg-white/80 p-1 md:flex">
                    <button
                      onClick={() => setGridCols(4)}
                      className={`rounded-full px-3 py-2 transition-all ${
                        gridCols === 4
                          ? 'bg-[#273E1C] text-white shadow-[0_12px_30px_rgba(39,62,28,0.18)]'
                          : 'text-[#68725F] hover:bg-[#EFF5E7] hover:text-[#1E2519]'
                      }`}
                      aria-label="Four column grid"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setGridCols(3)}
                      className={`rounded-full px-3 py-2 transition-all ${
                        gridCols === 3
                          ? 'bg-[#273E1C] text-white shadow-[0_12px_30px_rgba(39,62,28,0.18)]'
                          : 'text-[#68725F] hover:bg-[#EFF5E7] hover:text-[#1E2519]'
                      }`}
                      aria-label="Three column grid"
                    >
                      <LayoutList className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Category chips */}
            <div className="relative mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setParams({ category: undefined })}
                  className={`rounded-full px-4 py-2 text-sm transition-all ${
                    !category
                      ? 'bg-[#273E1C] text-white shadow-[0_14px_35px_rgba(39,62,28,0.18)]'
                      : 'bg-white/80 text-[#273E1C] ring-1 ring-[#E5D8BE] hover:bg-[#EFF5E7]'
                  }`}
                >
                  All
                </button>

                {categories.slice(0, 7).map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => setParams({ category: item.slug })}
                    className={`rounded-full px-4 py-2 text-sm transition-all ${
                      category === item.slug
                        ? 'bg-[#273E1C] text-white shadow-[0_14px_35px_rgba(39,62,28,0.18)]'
                        : 'bg-[#EFF5E7] text-[#273E1C] hover:bg-[#E3EBDC]'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {activeFilters.map((filter) => (
                    <span
                      key={filter.key}
                      className="inline-flex items-center gap-2 rounded-full border border-[#E5D8BE] bg-[#FBFAF6] px-4 py-2 text-sm text-[#4E5948]"
                    >
                      {filter.label}
                      <button
                        onClick={() => setParams({ [filter.key]: undefined })}
                        className="text-[#7A8162] transition-colors hover:text-[#C9571A]"
                        aria-label={`Remove ${filter.label}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}

                  <button
                    onClick={clearAllFilters}
                    className="rounded-full border border-[#E5D8BE] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7B6A45] transition-all hover:border-[#C89A4B] hover:text-[#273E1C]"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Product grid */}
            <motion.div
              key={`${category}-${search}-${page}-${sort}-${minPrice ?? ''}-${maxPrice ?? ''}-${gridCols}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-8"
            >
              <ProductGrid
                products={products}
                isLoading={isLoading}
                count={12}
                cols={gridCols}
              />
            </motion.div>

            {/* Empty luxury hint */}
            {!isLoading && products.length === 0 && (
              <div className="relative my-14 rounded-[32px] border border-[#E5D8BE] bg-[#FBFAF6] px-6 py-12 text-center">
                <p className="section-eyebrow">No pieces found</p>
                <h3 className="mt-3 font-heading text-[2.4rem] leading-none tracking-[-0.06em] text-[#1E2519]">
                  Try a calmer filter combination.
                </h3>
                <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#5B6455]">
                  Remove one filter or explore all curated pieces from the Vibio ritual
                  wardrobe.
                </p>
                <button onClick={clearAllFilters} className="btn-gold mx-auto mt-6">
                  View all pieces
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="relative mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-[#ECE6D9] pt-6">
                {Array.from({ length: pages }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => setParams({ page: String(pageNumber) }, false)}
                      className={`min-w-[44px] rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        pageNumber === page
                          ? 'bg-[#273E1C] text-white shadow-[0_14px_35px_rgba(39,62,28,0.18)]'
                          : 'bg-white text-[#5B6455] ring-1 ring-[#E5D8BE] hover:bg-[#EFF5E7] hover:text-[#1E2519]'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <FilterSidebar
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={categories}
        currentCategory={category}
        onCategoryChange={(nextCategory) => setParams({ category: nextCategory })}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceChange={(min, max) =>
          setParams({
            minPrice: min ? String(min) : undefined,
            maxPrice: max ? String(max) : undefined,
          })
        }
      />
    </div>
  );
}