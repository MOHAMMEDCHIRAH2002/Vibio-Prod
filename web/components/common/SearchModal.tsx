'use client';

import { useEffect, useRef, useState } from 'react';
import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => productsApi.list({ search: query, limit: 6 }),
    enabled: query.length > 2,
  });

  const products = (data as any)?.products || [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-[#1E2519]/26 px-4 pt-[11vh] backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.97 }}
            transition={{ duration: 0.24 }}
            className="surface-shell w-full max-w-3xl overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-[#ECE5D8] px-5 py-5 sm:px-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                <Search className="h-4 w-4" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('search.placeholder')}
                className="flex-1 bg-transparent rounded-md text-lg text-[#1E2519] placeholder:text-[#78805F] focus:outline-none"
              />
              <button onClick={onClose} className="nav-icon-btn">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-5 py-5 sm:px-6">
              {query.length <= 2 && (
                <div className="surface-olive flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                  <p className="section-eyebrow">{t('search.eyebrow')}</p>
                  <h3 className="font-heading text-[2rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                    {t('search.title')}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-[#566055]">
                    {t('search.desc')}
                  </p>
                </div>
              )}

              {isLoading && query.length > 2 && (
                <div className="grid gap-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="card-luxury flex items-center gap-4 p-4">
                      <div className="skeleton h-16 w-16 rounded-[20px]" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-1/2 rounded-full" />
                        <div className="skeleton h-3 w-1/3 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && products.length > 0 && (
                <div className="grid gap-3">
                  {products.map((product: any) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={onClose}
                      className="card-luxury flex items-center gap-4 p-4"
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-[20px] bg-[#F7F4EC]">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#78805F]">
                          {product.category?.name || t('search.collection')}
                        </p>
                        <p className="mt-1 font-heading text-[1.35rem] leading-none tracking-[-0.04em] text-[#1E2519]">
                          {product.name}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[#273E1C] ltr-nums">
                        {formatPrice(product.basePrice)}
                      </span>
                    </Link>
                  ))}

                  <Link
                    href={`/shop?search=${query}`}
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EFF5E7] px-5 py-3 text-sm font-semibold text-[#273E1C] transition-colors duration-200 hover:bg-[#e2eadc]"
                  >
                    {t('search.viewAllResults')}
                    <ArrowRight className="h-4 w-4 rtl-flip" />
                  </Link>
                </div>
              )}

              {!isLoading && query.length > 2 && products.length === 0 && (
                <div className="surface-panel py-16 text-center">
                  <p className="font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                    {t('search.noProducts')}
                  </p>
                  <p className="mt-3 text-sm text-[#5B6455]">
                    {t('search.tryBroader')}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
