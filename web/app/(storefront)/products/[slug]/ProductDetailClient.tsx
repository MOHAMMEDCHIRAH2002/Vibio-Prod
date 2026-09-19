'use client';

import { useState } from 'react';
import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Shield,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Product, Variant } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import PhoneOrder from '@/components/common/PhoneOrder';
import ProductInquiry from '@/components/common/ProductInquiry';

interface Props {
  initialProduct: Product;
}

const benefitCards = [
  { icon: Truck, label: 'Fast dispatch', text: 'Orders typically leave within 24 to 48 hours.' },
  { icon: RotateCcw, label: 'Easy returns', text: '30-day return support for eligible purchases.' },
  { icon: Shield, label: 'Curated quality', text: 'Every product is selected to meet Vibio standards.' },
];

export default function ProductDetailClient({ initialProduct: product }: Props) {
  const { data: session } = useSession();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(product.variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedState, setAddedState] = useState<'idle' | 'added'>('idle');
  const [descOpen, setDescOpen] = useState(true);
  const [wishHeartbeat, setWishHeartbeat] = useState(false);

  const price = selectedVariant?.price || product.basePrice;
  const stock = selectedVariant?.stock ?? 0;
  const wishlisted = isWishlisted(product.id);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const isOnSale = comparePrice && comparePrice > Number(price);
  const variantLabel = product.variants[0]?.name || 'Option';

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    if (stock < quantity) {
      toast.error('Not enough stock');
      return;
    }

    addItem.mutate({ variantId: selectedVariant.id, quantity });
    setAddedState('added');
    setTimeout(() => setAddedState('idle'), 1600);
  };

  const handleWishlist = () => {
    if (!session) {
      toast.error('Sign in to save favourites');
      return;
    }

    setWishHeartbeat(true);
    toggle.mutate(product.id);
    setTimeout(() => setWishHeartbeat(false), 800);
  };

  const activeImageSrc = product.images[activeImage] || product.images[0];

  return (
    <div className="min-h-screen bg-primary-bg pt-28">
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px] space-y-6">
          <div className="flex flex-wrap items-center gap-2 px-1 text-xs uppercase tracking-[0.16em] text-[#78805F]">
            <Link href="/" className="transition-colors hover:text-[#1E2519]">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/shop" className="transition-colors hover:text-[#1E2519]">
              Shop
            </Link>
            {product.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href={`/shop/${product.category.slug}`} className="transition-colors hover:text-[#1E2519]">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#1E2519]">{product.name}</span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="surface-shell p-5 sm:p-6">
              <div className="relative overflow-hidden rounded-[32px] bg-[#F7F4EC] p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,156,73,0.16),transparent_54%)]" />
                <div className="relative aspect-[1.02] overflow-hidden rounded-[28px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.28 }}
                      className="absolute inset-0"
                    >
                      {activeImageSrc ? (
                        <Image
                          src={activeImageSrc}
                          alt={product.name}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 55vw"
                          className="object-cover"
                        />
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="absolute left-7 top-7 flex flex-wrap gap-2">
                  {product.category && (
                    <span className="rounded-full bg-white/88 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#273E1C] shadow-[0_12px_24px_rgba(30,37,25,0.08)]">
                      {product.category.name}
                    </span>
                  )}
                  {isOnSale && (
                    <span className="rounded-full bg-[#273E1C] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_24px_rgba(30,37,25,0.12)]">
                      Sale
                    </span>
                  )}
                </div>
              </div>

              {product.images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setActiveImage(index)}
                      className={cn(
                        'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[22px] border transition-all duration-300',
                        activeImage === index
                          ? 'border-[#273E1C] shadow-[0_16px_28px_rgba(30,37,25,0.12)]'
                          : 'border-[#DEDACE] opacity-70 hover:opacity-100',
                      )}
                    >
                      <Image src={image} alt={`${product.name} view ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="surface-shell p-6 sm:p-7">
                {product.category && (
                  <Link
                    href={`/shop/${product.category.slug}`}
                    className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#389C49] transition-opacity hover:opacity-70"
                  >
                    {product.category.name}
                  </Link>
                )}

                <h1 className="mt-4 font-heading text-[clamp(2.8rem,4.8vw,4.8rem)] leading-[0.92] tracking-[-0.06em] text-[#1E2519]">
                  {product.name}
                </h1>

                {product._count && product._count.reviews > 0 && (
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex gap-0.5 text-[#389C49]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-[#5B6455]">
                      {product._count.reviews} review{product._count.reviews !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-end gap-3">
                  <span className="font-heading text-[2.6rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                    {formatPrice(price)}
                  </span>
                  {isOnSale && (
                    <span className="pb-1 text-lg text-[#78805F] line-through">
                      {formatPrice(comparePrice!)}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {stock === 0 && (
                    <span className="rounded-full bg-[#FCE9E2] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9571A]">
                      Out of stock
                    </span>
                  )}
                  {stock > 0 && stock < 5 && (
                    <span className="rounded-full bg-[#F6E9D8] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A46A1F]">
                      Only {stock} left
                    </span>
                  )}
                  {stock >= 5 && (
                    <span className="rounded-full bg-[#EFF5E7] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#273E1C]">
                      In stock
                    </span>
                  )}
                </div>

                <p className="mt-6 text-[15px] leading-8 text-[#5B6455] sm:text-[16px]">
                  {product.shortDesc || product.description?.slice(0, 220)}
                </p>

                {product.variants.length > 1 && (
                  <div className="mt-7">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#78805F]">
                      {variantLabel}: {selectedVariant?.value}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          disabled={variant.stock === 0}
                          className={cn(
                            'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                            selectedVariant?.id === variant.id
                              ? 'border-[#273E1C] bg-[#273E1C] text-white'
                              : 'border-[#DEDACE] bg-white/80 text-[#5B6455] hover:text-[#1E2519]',
                            variant.stock === 0 && 'cursor-not-allowed opacity-40',
                          )}
                        >
                          {variant.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-7 flex flex-col gap-4 sm:flex-row">
                  <div className="inline-flex items-center rounded-full border border-[#DEDACE] bg-white/80 p-1">
                    <button
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="rounded-full px-4 py-3 text-[#5B6455] transition-colors hover:text-[#1E2519]"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[48px] text-center text-sm font-semibold text-[#1E2519]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((current) => Math.min(stock || 1, current + 1))}
                      disabled={quantity >= stock}
                      className="rounded-full px-4 py-3 text-[#5B6455] transition-colors hover:text-[#1E2519] disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <motion.button
                    onClick={handleAddToCart}
                    disabled={stock === 0 || addItem.isPending}
                    whileTap={{ scale: 0.98 }}
                    className="btn-gold flex-1 justify-center disabled:opacity-40"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {stock === 0
                      ? 'Out of stock'
                      : addedState === 'added'
                        ? 'Added'
                        : addItem.isPending
                          ? 'Adding...'
                          : 'Add to cart'}
                  </motion.button>

                  <button
                    onClick={handleWishlist}
                    className="inline-flex items-center justify-center rounded-full border border-[#DEDACE] bg-white/80 px-4 py-3 text-[#5B6455] transition-colors hover:text-[#C9571A]"
                    aria-label="Save to wishlist"
                  >
                    <motion.div
                      animate={wishHeartbeat ? { scale: [1, 1.3, 1, 1.16, 1] } : { scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Heart className={cn('h-[18px] w-[18px]', wishlisted && 'fill-current text-[#C9571A]')} />
                    </motion.div>
                  </button>
                </div>
              </div>

              {/* Alternative: order by phone / WhatsApp (does not replace add-to-cart) */}
              <PhoneOrder
                className="mt-2"
                context={{
                  kind: 'product',
                  name: product.name,
                  url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/products/${product.slug}`,
                }}
              />

              {/* Ask a question about this product (notifies the store owner) */}
              <ProductInquiry productId={product.id} productName={product.name} className="mt-2" />

              <div className="grid gap-4 sm:grid-cols-3">
                {benefitCards.map(({ icon: Icon, label, text }) => (
                  <div key={label} className="surface-panel p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
                      {label}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#5B6455]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
            <div className="surface-shell p-6 sm:p-7">
              <button
                onClick={() => setDescOpen((current) => !current)}
                className="accordion-trigger"
              >
                About this product
                <ChevronDown
                  className="h-4 w-4 text-[#273E1C] transition-transform"
                  style={{ transform: descOpen ? 'rotate(180deg)' : 'none' }}
                />
              </button>

              <AnimatePresence initial={false}>
                {descOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="overflow-hidden"
                  >
                    <div className="py-6 whitespace-pre-line text-[15px] leading-8 text-[#5B6455] sm:text-[16px]">
                      {product.description}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="surface-olive p-6 sm:p-7">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#6C8349]">Curated note</p>
              <h2 className="mt-3 font-heading text-[2rem] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
                Presented with the same premium restraint as the rest of the storefront.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#4E5948]">
                The goal is a more immersive product story: cleaner hierarchy, stronger
                imagery, better spacing, and a more considered path into purchase.
              </p>
              <Link href="/gifts" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#273E1C]">
                Explore gift pairings
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="surface-shell p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#ECE6D9] pb-6">
              <div>
                <p className="section-eyebrow">Customer reviews</p>
                <h2 className="mt-3 font-heading text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
                  What customers are saying.
                </h2>
              </div>

              {product.reviews && product.reviews.length > 0 && (
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="font-heading text-[3.2rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                      {(
                        product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
                        product.reviews.length
                      ).toFixed(1)}
                    </span>
                    <span className="text-sm text-[#78805F]">/ 5</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const reviews = product.reviews ?? [];
                      const avg = reviews.length
                        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
                          reviews.length
                        : 0;
                      return (
                        <Star
                          key={star}
                          className={
                            star <= Math.round(avg)
                              ? 'h-4 w-4 fill-[#389C49] text-[#389C49]'
                              : 'h-4 w-4 text-[#D8D3C8]'
                          }
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#78805F]">
                    {product.reviews.length} verified review{product.reviews.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {product.reviews.map((review: any) => (
                  <div key={review.id} className="surface-panel p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF5E7] text-sm font-semibold uppercase text-[#273E1C]">
                        {(review.reviewerName || review.user?.name || 'A')[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
                          {review.reviewerName || review.user?.name || 'Anonymous'}
                        </p>
                        <div className="mt-1.5 flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'h-3.5 w-3.5',
                                star <= review.rating
                                  ? 'fill-[#389C49] text-[#389C49]'
                                  : 'text-[#D8D3C8]',
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {review.title && (
                      <p className="mt-4 font-heading text-[1.45rem] leading-[1.02] tracking-[-0.04em] text-[#1E2519]">
                        {review.title}
                      </p>
                    )}
                    {review.body && (
                      <p className="mt-3 text-sm leading-7 text-[#5B6455]">&quot;{review.body}&quot;</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center gap-4 py-8 text-center">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-7 w-7 text-[#D8D3C8]" />
                  ))}
                </div>
                <p className="font-heading text-[1.8rem] leading-none tracking-[-0.04em] text-[#1E2519]">
                  No reviews yet.
                </p>
                <p className="max-w-sm text-sm leading-7 text-[#78805F]">
                  Be the first to share your experience with {product.name}.
                </p>
                {session ? (
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#6C8349]">
                    Purchase this product to leave a review.
                  </p>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="mt-2 rounded-full border border-[#273E1C] px-6 py-2.5 text-sm font-semibold text-[#273E1C] transition-colors hover:bg-[#273E1C] hover:text-white"
                  >
                    Sign in to review
                  </Link>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#EFF5E7] px-5 py-4">
              <Package className="h-5 w-5 flex-shrink-0 text-[#273E1C]" />
              <p className="text-sm text-[#273E1C]">
                All reviews are from verified buyers and approved by our team.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
