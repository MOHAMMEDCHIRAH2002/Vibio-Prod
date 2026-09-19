'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { t } = useTranslation();
  const { cart, updateItem, removeItem } = useCart();
  const cartData: any = cart;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#1E2519]/26 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 210 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-lg p-4 sm:p-5"
          >
            <div className="surface-shell flex h-full flex-col overflow-hidden px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between border-b border-[#ECE5D8] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#78805F]">
                      {t('cart.yourSelection')}
                    </p>
                    <h2 className="font-heading text-[1.8rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                      {t('cart.title')}
                    </h2>
                  </div>
                  {cartData?.items?.length ? (
                    <span className="rounded-full bg-[#273E1C] px-2.5 py-1 text-[11px] font-semibold text-white">
                      {cartData.items.length}
                    </span>
                  ) : null}
                </div>
                <button onClick={onClose} className="nav-icon-btn">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="scrollbar-hide flex-1 overflow-y-auto py-5">
                {!cartData?.items?.length ? (
                  <div className="surface-olive flex h-full min-h-[320px] flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-[#273E1C]">
                      <ShoppingBag className="h-7 w-7" />
                    </div>
                    <h3 className="mt-6 font-heading text-[2rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                      {t('cart.empty')}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-7 text-[#566055]">
                      {t('cart.emptyDesc')}
                    </p>
                    <Link href="/shop" onClick={onClose} className="btn-gold mt-6">
                      {t('cart.exploreCollection')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartData.items.map((item: any) => (
                      <motion.div
                        key={item.variantId}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="card-luxury flex gap-4 p-4"
                      >
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-[22px] bg-[#F7F4EC]">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#78805F]">
                            {item.variantName}
                          </p>
                          <h4 className="mt-2 font-heading text-[1.45rem] leading-none tracking-[-0.04em] text-[#1E2519]">
                            {item.name}
                          </h4>
                          <p className="mt-3 text-sm font-semibold text-[#273E1C] ltr-nums">
                            {formatPrice(item.price * item.quantity)}
                          </p>

                          <div className="mt-4 flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateItem.mutate({
                                  variantId: item.variantId,
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DEDACC] bg-white text-[#273E1C] transition-colors duration-200 hover:bg-[#EFF5E7]"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-[#1E2519]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateItem.mutate({
                                  variantId: item.variantId,
                                  quantity: item.quantity + 1,
                                })
                              }
                              disabled={item.quantity >= item.stock}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DEDACC] bg-white text-[#273E1C] transition-colors duration-200 hover:bg-[#EFF5E7] disabled:opacity-40"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => removeItem.mutate(item.variantId)}
                              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#FCE9E2] text-[#C9571A] transition-colors duration-200 hover:bg-[#f3ddd3]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {cartData?.items?.length ? (
                <div className="border-t border-[#ECE5D8] pt-4">
                  <div className="surface-olive p-5">
                    <div className="flex items-center justify-between text-sm text-[#52604C]">
                      <span>{t('cart.subtotal')}</span>
                      <span className="font-semibold text-[#1E2519] ltr-nums">
                        {formatPrice(cartData.subtotal)}
                      </span>
                    </div>
                    {cartData.discount ? (
                      <div className="mt-3 flex items-center justify-between text-sm text-[#273E1C]">
                        <span>{t('cart.discount', { code: cartData.promoCode })}</span>
                        <span className="ltr-nums">-{formatPrice(cartData.discount)}</span>
                      </div>
                    ) : null}
                    <p className="mt-3 text-xs leading-6 text-[#566055]">
                      {t('cart.shippingNote')}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <Link href="/checkout" onClick={onClose} className="btn-gold justify-between">
                      {t('cart.checkout')}
                      <ArrowRight className="h-4 w-4 rtl-flip" />
                    </Link>
                    <Link
                      href="/cart"
                      onClick={onClose}
                      className="btn-outline-gold justify-center"
                    >
                      {t('cart.viewFull')}
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
