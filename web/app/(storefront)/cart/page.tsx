'use client';

import Link from 'next/link';
import Image from '@/components/common/OptimizedImage';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import PhoneOrder from '@/components/common/PhoneOrder';

export default function CartPage() {
  const { t } = useTranslation();
  const { cart, updateItem, removeItem, isLoading } = useCart();
  const cartData: any = cart;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg pt-28">
        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1540px] space-y-4">
            <div className="h-48 rounded-[32px] skeleton" />
            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-32 rounded-[28px] skeleton" />
                ))}
              </div>
              <div className="h-80 rounded-[28px] skeleton" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!cartData?.items?.length) {
    return (
      <div className="min-h-screen bg-primary-bg pt-28">
        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[960px]">
            <div className="surface-shell py-24 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h1 className="mt-6 font-heading text-[clamp(2.6rem,5vw,4rem)] leading-[0.96] tracking-[-0.05em] text-[#1E2519]">
                {t('cart.stillEmpty')}
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-[#5B6455]">
                {t('cart.stillEmptyDesc')}
              </p>
              <Link href="/shop" className="btn-gold mt-6">
                {t('cart.browseCollection')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const shipping = cartData.subtotal > 500 ? 0 : 50;
  const total = cartData.subtotal + shipping;

  return (
    <div className="min-h-screen bg-primary-bg pt-28">
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px] space-y-6">
          <div className="surface-shell p-6 sm:p-7 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <p className="section-eyebrow">{t('cart.reviewEyebrow')}</p>
                <h1 className="max-w-[10ch] font-heading text-[clamp(3rem,6vw,5rem)] leading-[0.92] tracking-[-0.06em] text-[#1E2519]">
                  {t('cart.reviewTitle')}
                </h1>
                <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#5B6455] sm:text-[16px]">
                  {t('cart.reviewDesc')}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: `${cartData.items.length}`, label: t('cart.itemsSelected') },
                  { value: shipping === 0 ? t('cart.free') : formatPrice(shipping), label: t('cart.shipping') },
                  { value: formatPrice(total), label: t('cart.currentTotal') },
                ].map((item) => (
                  <div key={item.label} className="surface-panel px-5 py-5">
                    <p className="font-heading text-[1.8rem] leading-none tracking-[-0.05em] text-[#1E2519] ltr-nums">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[#68725F]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="surface-shell p-5 sm:p-6">
              <div className="space-y-4">
                <AnimatePresence>
                  {cartData.items.map((item: any) => (
                    <motion.div
                      key={item.variantId}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      className="surface-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                    >
                      <Link
                        href={`/products/${item.slug || ''}`}
                        className="relative h-24 w-full overflow-hidden rounded-[22px] bg-[#F7F4EC] sm:w-24"
                      >
                        {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link href={`/products/${item.slug || ''}`}>
                              <h2 className="font-heading text-[1.5rem] leading-[1.02] tracking-[-0.04em] text-[#1E2519]">
                                {item.name}
                              </h2>
                            </Link>
                            {item.variantName && (
                              <p className="mt-2 text-sm text-[#5B6455]">{item.variantName}</p>
                            )}
                          </div>

                          <button
                            onClick={() => removeItem.mutate(item.variantId)}
                            className="rounded-full bg-[#FCE9E2] p-2 text-[#C9571A] transition-colors hover:bg-[#F2DDD4]"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="inline-flex items-center rounded-full border border-[#DEDACE] bg-white/80 p-1">
                            <button
                              onClick={() =>
                                updateItem.mutate({
                                  variantId: item.variantId,
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                              }
                              className="rounded-full px-3 py-2 text-[#5B6455] transition-colors hover:text-[#1E2519]"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[44px] text-center text-sm font-semibold text-[#1E2519]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateItem.mutate({
                                  variantId: item.variantId,
                                  quantity: Math.min(item.stock, item.quantity + 1),
                                })
                              }
                              disabled={item.quantity >= item.stock}
                              className="rounded-full px-3 py-2 text-[#5B6455] transition-colors hover:text-[#1E2519] disabled:opacity-30"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="font-heading text-[1.5rem] leading-none tracking-[-0.04em] text-[#1E2519] ltr-nums">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="mt-2 text-sm text-[#5B6455]">{t('cart.each', { price: formatPrice(item.price) })}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="surface-shell h-fit p-5 sm:p-6 lg:sticky lg:top-24">
              <p className="section-eyebrow">{t('cart.summary')}</p>
              <h2 className="font-heading text-[2rem] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
                {t('cart.orderOverview')}
              </h2>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5B6455]">{t('cart.subtotal')}</span>
                  <span className="text-[#1E2519] ltr-nums">{formatPrice(cartData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#5B6455]">{t('cart.shipping')}</span>
                  <span className="text-[#1E2519] ltr-nums">{shipping === 0 ? t('cart.free') : formatPrice(shipping)}</span>
                </div>
              </div>

              <div className="mt-5 border-t border-[#ECE6D9] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1E2519]">
                    {t('cart.total')}
                  </span>
                  <span className="font-heading text-[2rem] leading-none tracking-[-0.05em] text-[#1E2519] ltr-nums">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="btn-gold mt-6 w-full justify-center">
                {t('cart.proceedCheckout')}
              </Link>
              <Link href="/shop" className="btn-outline-gold mt-3 w-full justify-center">
                {t('cart.continueShopping')}
              </Link>

              <PhoneOrder
                className="mt-5"
                context={{ kind: 'cart', itemCount: cartData.items.length, total: formatPrice(total) }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
