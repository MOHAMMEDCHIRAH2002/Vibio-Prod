'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from '@/components/common/OptimizedImage';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bannersApi } from '@/lib/api';

export default function PromoBanners() {
  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: bannersApi.list,
    staleTime: 5 * 60 * 1000,
  });

  const [index, setIndex] = useState(0);
  const list = (banners as any[]).filter((b) => b.isActive);

  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), 5000);
    return () => clearInterval(id);
  }, [list.length]);

  if (!list.length) return null;

  const banner = list[index];

  const prev = () => setIndex((i) => (i - 1 + list.length) % list.length);
  const next = () => setIndex((i) => (i + 1) % list.length);

  return (
    <section className="relative w-full overflow-hidden" style={{ aspectRatio: '21/7', minHeight: 180, maxHeight: 480 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          className="absolute inset-0"
        >
          {/* Background image */}
          {banner.imageDesktop ? (
            <Image
              src={banner.imageDesktop}
              alt={banner.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-[#273E1C]" />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-16">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-xl"
              >
                {banner.title && (
                  <h2 className="font-heading text-[clamp(1.6rem,4vw,3rem)] leading-[1.05] tracking-[-0.04em] text-white drop-shadow-md">
                    {banner.title}
                  </h2>
                )}
                {banner.subtitle && (
                  <p className="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">
                    {banner.subtitle}
                  </p>
                )}
                {banner.ctaLink && banner.ctaText && (
                  <Link
                    href={banner.ctaLink}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#C9A96E] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-[#B8944A]"
                  >
                    {banner.ctaText}
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows — only show when multiple banners */}
      {list.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
