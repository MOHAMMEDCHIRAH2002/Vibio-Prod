'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Quote, Star, ArrowRight } from 'lucide-react';

interface Review {
  id: string | number;
  rating: number;
  title?: string;
  body: string;
  reviewerName?: string;
  user?: { name?: string };
  product?: { slug: string; name: string };
}

interface Props {
  reviews: Review[];
}

function truncate(text: string, max: number) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

function getReviewerName(review: Review) {
  return review.reviewerName || review.user?.name || 'Customer';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={
            star <= rating
              ? 'h-3.5 w-3.5 fill-[#3E9B50] text-[#3E9B50]'
              : 'h-3.5 w-3.5 text-[#D9D3C7]'
          }
        />
      ))}
    </div>
  );
}

function getCardSpan(index: number, total: number) {
  if (index === 0) return 'lg:col-span-6';
  if (total === 2) return 'lg:col-span-6';
  return 'lg:col-span-3';
}

export default function ReviewCardsClient({ reviews }: Props) {
  const { t } = useTranslation();
  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-12">
      {reviews.map((review, index) => {
        const reviewerName = getReviewerName(review);
        const initials = getInitials(reviewerName);
        const isFeatured = index === 0;

        return (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1], delay: index * 0.09 }}
            className={getCardSpan(index, reviews.length)}
          >
            <article
              className={[
                'group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-[#E6DDCF] bg-[#FFFEFA]',
                'shadow-[0_18px_50px_rgba(30,37,25,0.045)] transition-all duration-500',
                'hover:-translate-y-1 hover:border-[#D5C3A6] hover:shadow-[0_28px_70px_rgba(30,37,25,0.085)]',
                isFeatured ? 'min-h-[360px] p-7' : 'min-h-[320px] p-6',
              ].join(' ')}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,179,106,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,247,241,0.55))]" />

              <Quote className="pointer-events-none absolute right-6 top-6 h-12 w-12 text-[#EAE2D3] transition-colors duration-300 group-hover:text-[#DDD0BF]" />

              <div className="relative z-10 flex items-center justify-between gap-4">
                {renderStars(review.rating)}
                <span className="rounded-full border border-[#E8DFD1] bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6D775E]">
                  {t('reviews.verified')}
                </span>
              </div>

              {review.title && (
                <h3
                  className={[
                    'relative z-10 mt-5 font-heading tracking-[-0.045em] text-[#1E2519]',
                    isFeatured
                      ? 'text-[clamp(1.55rem,1.9vw,2rem)] leading-[1.02]'
                      : 'text-[1.45rem] leading-[1.06]',
                  ].join(' ')}
                >
                  {truncate(review.title, isFeatured ? 56 : 38)}
                </h3>
              )}

              <p
                className={[
                  'relative z-10 mt-4 flex-1 text-[#576255]',
                  isFeatured ? 'max-w-[40rem] text-[15px] leading-8' : 'text-[14px] leading-7',
                ].join(' ')}
              >
                &ldquo;{truncate(review.body, isFeatured ? 240 : 120)}&rdquo;
              </p>

              <div className="relative z-10 mt-6 border-t border-[#ECE4D8] pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E2D8C8] bg-[#F3EFE6] text-[12px] font-semibold uppercase tracking-[0.12em] text-[#1E2519]">
                      {initials || 'CU'}
                    </div>

                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1E2519]">
                        {reviewerName}
                      </p>
                      {review.product ? (
                        <Link
                          href={`/products/${review.product.slug}`}
                          className="mt-1 inline-flex items-center gap-1 text-sm text-[#6C8349] transition-colors hover:text-[#4D6631]"
                        >
                          {t('reviews.on')} {truncate(review.product.name, 34)}
                        </Link>
                      ) : (
                        <p className="mt-1 text-sm text-[#7A7A72]">{t('reviews.verifiedCustomer')}</p>
                      )}
                    </div>
                  </div>

                  {isFeatured && review.product && (
                    <Link
                      href={`/products/${review.product.slug}`}
                      className="group/link hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#273E1C] transition-colors hover:text-[#4D6631] sm:inline-flex"
                    >
                      {t('reviews.viewProduct')}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1 rtl-flip" />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          </motion.div>
        );
      })}
    </div>
  );
}
