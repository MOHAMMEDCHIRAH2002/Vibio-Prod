'use client';

import { useState } from 'react';
import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, ShoppingBag, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { Product } from '@/types';
import { cn, formatPrice, getDiscountPercent, getMinVariantPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
}

export default function ProductCard({
  product,
  priority = false,
  index = 0,
}: ProductCardProps) {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hoverImage, setHoverImage] = useState(false);

  const minPrice = getMinVariantPrice(product.variants);
  const displayPrice = minPrice || product.basePrice;
  const isOnSale = !!product.comparePrice && product.comparePrice > displayPrice;
  const discountPercent = isOnSale
    ? getDiscountPercent(displayPrice, product.comparePrice!)
    : 0;
  const wishlisted = isWishlisted(product.id);
  const defaultVariant = product.variants?.[0];

  const handleQuickAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!defaultVariant) return;
    if (product.variants.length > 1) {
      router.push(`/products/${product.slug}`);
      return;
    }
    addItem.mutate({ variantId: defaultVariant.id, quantity: 1 });
  };

  const handleWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!session) {
      toast.error(t('shop.signInToSave'));
      return;
    }
    toggle.mutate(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      className="group"
    >
      <Link href={`/products/${product.slug}`} className="card-luxury flex h-full flex-col overflow-hidden p-4">
        <div className="flex items-start justify-between gap-2">
          {isOnSale ? (
            <span className="pt-0.5 text-[11px] leading-none text-[#6b6b63]">–{discountPercent}%</span>
          ) : (
            <div />
          )}
          <button
            onClick={handleWishlist}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#e8e2d9] bg-white text-[#6b6b63] transition-[border-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#c9b99a] hover:text-[#2d5016]"
          >
            <Heart
              className={cn('h-4 w-4 transition-colors', wishlisted && 'fill-[#2d5016] text-[#2d5016]')}
            />
          </button>
        </div>

        <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl bg-[#f3f0ea]">
          {!imageLoaded && <div className="absolute inset-0 skeleton" />}
          <Image
            src={hoverImage && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            priority={priority}
            className={cn(
              'object-cover transition-transform duration-700 group-hover:scale-[1.04]',
              !imageLoaded && 'opacity-0',
            )}
            onLoad={() => setImageLoaded(true)}
            onMouseEnter={() => setHoverImage(true)}
            onMouseLeave={() => setHoverImage(false)}
          />

          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded border border-[#e8e2d9] bg-white/95 px-3 py-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={handleQuickAdd}
              disabled={addItem.isPending}
              className="inline-flex items-center gap-2 rounded-[12px] bg-[#2d5016] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-[#3a6b1e]"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {product.variants.length > 1 ? t('shop.choose') : addItem.isPending ? t('shop.adding') : t('shop.add')}
            </button>

            <div className="flex items-center gap-1 text-[#273E1C]">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col pt-5">
          <h3 className="font-heading text-[1.6rem] leading-[1.02] tracking-[-0.045em] text-[#1E2519] transition-colors duration-200 group-hover:text-[#273E1C]">
            {product.name}
          </h3>

          <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#5B6455]">
            {product.shortDesc || product.description}
          </p>

          {product._count?.reviews ? (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex gap-0.5 text-[#389C49]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-3 w-3 fill-current" />
                ))}
              </div>
              <span className="text-xs text-[#78805F]">({product._count.reviews})</span>
            </div>
          ) : null}

          <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#E9E4DA] pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#7A8162]">
                {t('shop.startingFrom')}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg font-semibold text-[#1E2519] ltr-nums">
                  {formatPrice(displayPrice)}
                </span>
                {isOnSale && (
                  <span className="text-sm text-[#9A958A] line-through">
                    {formatPrice(product.comparePrice!)}
                  </span>
                )}
              </div>
            </div>
            {product.variants.length > 1 && (
              <span className="rounded-full bg-[#F7F4EC] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5B6455]">
                {t('shop.options', { count: product.variants.length })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
