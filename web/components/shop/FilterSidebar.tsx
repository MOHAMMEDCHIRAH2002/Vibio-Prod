'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Category } from '@/types';

interface FilterSidebarProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  currentCategory?: string;
  onCategoryChange: (cat: string | undefined) => void;
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
}

export default function FilterSidebar({
  open,
  onClose,
  categories,
  currentCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
}: FilterSidebarProps) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#1E2519]/28 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed left-0 top-0 z-50 h-full w-full max-w-md p-4 sm:p-5"
          >
            <div className="surface-shell flex h-full flex-col overflow-hidden px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between border-b border-[#ECE5D8] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#78805F]">
                      {t('shop.refineBrowse')}
                    </p>
                    <h2 className="font-heading text-[1.8rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                      {t('shop.filters')}
                    </h2>
                  </div>
                </div>
                <button onClick={onClose} className="nav-icon-btn">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="scrollbar-hide flex-1 space-y-8 overflow-y-auto py-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#78805F]">
                    {t('shop.category')}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => onCategoryChange(undefined)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        !currentCategory
                          ? 'bg-[#273E1C] text-white'
                          : 'bg-[#F7F4EC] text-[#5B6455] hover:bg-[#EFF5E7] hover:text-[#273E1C]'
                      }`}
                    >
                      {t('shop.allProducts')}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => onCategoryChange(cat.slug)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          currentCategory === cat.slug
                            ? 'bg-[#273E1C] text-white'
                            : 'bg-[#F7F4EC] text-[#5B6455] hover:bg-[#EFF5E7] hover:text-[#273E1C]'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="surface-panel p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#78805F]">
                    {t('shop.priceRange')}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-xs text-[#68725F]">{t('shop.minMad')}</label>
                      <input
                        type="number"
                        value={minPrice || ''}
                        onChange={(event) =>
                          onPriceChange(
                            event.target.value ? Number(event.target.value) : undefined,
                            maxPrice,
                          )
                        }
                        placeholder="0"
                        className="field-luxury"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs text-[#68725F]">{t('shop.maxMad')}</label>
                      <input
                        type="number"
                        value={maxPrice || ''}
                        onChange={(event) =>
                          onPriceChange(
                            minPrice,
                            event.target.value ? Number(event.target.value) : undefined,
                          )
                        }
                        placeholder="9999"
                        className="field-luxury"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#ECE5D8] pt-4">
                <button
                  onClick={() => {
                    onCategoryChange(undefined);
                    onPriceChange(undefined, undefined);
                    onClose();
                  }}
                  className="btn-outline-gold w-full"
                >
                  {t('shop.clearFilters')}
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
