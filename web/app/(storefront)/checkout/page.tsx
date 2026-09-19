'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from '@/components/common/OptimizedImage';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Check, ChevronRight, Gift, Lock, Minus, Plus, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import { ordersApi, promoApi, loyaltyApi, getClientSessionId, type PromoPreview } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import PhoneOrder from '@/components/common/PhoneOrder';

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(2),
});

type AddressForm = z.infer<typeof addressSchema>;

const steps = ['Address', 'Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const qc = useQueryClient();
  const { cart, isLoading: cartLoading } = useCart();
  const cartData: any = cart;
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<AddressForm | null>(null);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoPreview | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [redeemPoints, setRedeemPoints] = useState(0);
  // Stable per-checkout key so an accidental double-submit / network retry can't
  // create a duplicate order (or a duplicate admin notification).
  const [idempotencyKey] = useState(() =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `ord-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  // Loyalty balance — only relevant for signed-in customers (guests can't redeem).
  const { data: loyalty } = useQuery({
    queryKey: ['loyalty', 'me'],
    queryFn: loyaltyApi.me,
    enabled: !!session,
    staleTime: 60 * 1000,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

  // Only redirect to cart on initial entry if the cart is confirmed empty — never during checkout or after order placement.
  useEffect(() => {
    if (!session || cartLoading || orderPlaced) return;
    if (!cartData?.items?.length) {
      router.push('/cart');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartLoading]);

  if (!session) {
    return (
      <div className="min-h-screen bg-primary-bg pt-28">
        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[960px]">
            <div className="surface-shell py-24 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                <Lock className="h-7 w-7" />
              </div>
              <h1 className="mt-6 font-heading text-[clamp(2.6rem,5vw,4rem)] leading-[0.96] tracking-[-0.05em] text-[#1E2519]">
                Sign in to continue.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-[#5B6455]">
                Checkout is available for signed-in customers so we can keep your order
                details secure and connected to your account.
              </p>
              <Link href="/login?redirect=/checkout" className="btn-gold mt-6">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!cartData?.items?.length) {
    return null;
  }

  const baseShipping = shippingMethod === 'express' ? 99 : cartData.subtotal > 500 ? 0 : 50;
  const discount = appliedPromo?.discount || 0;
  const freeShipping = appliedPromo?.freeShipping || false;
  const shippingCost = freeShipping ? 0 : baseShipping;

  // ── Loyalty redemption (mirrors the server-side quote so the preview matches
  // exactly what the backend will re-compute and enforce) ────────────────────
  const lp = loyalty?.config;
  const balance = loyalty?.points ?? 0;
  const redeemStep = lp?.redeemStep ?? 100;
  const redeemStepValue = lp?.redeemStepValue ?? 10;
  const minRedeem = lp?.minRedeem ?? 100;
  const merchandiseAfterPromo = Math.max(0, cartData.subtotal - discount);
  // Max points redeemable = limited by balance AND by the order's merchandise value.
  const maxByBalance = Math.floor(balance / redeemStep) * redeemStep;
  const maxByOrder = Math.floor(merchandiseAfterPromo / redeemStepValue) * redeemStep;
  const maxRedeemable = Math.max(0, Math.min(maxByBalance, maxByOrder));
  const canRedeem = balance >= minRedeem && maxRedeemable >= redeemStep;
  // Always keep the applied amount valid even if the promo/cart changed.
  const appliedPoints = Math.min(Math.max(0, redeemPoints), maxRedeemable);
  const loyaltyDiscount = (appliedPoints / redeemStep) * redeemStepValue;

  const total = Math.max(0, cartData.subtotal - discount - loyaltyDiscount) + shippingCost;

  const handleApplyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const preview = await promoApi.validate({ code, subtotal: cartData.subtotal });
      setAppliedPromo(preview);
      toast.success(preview.message);
    } catch (error: any) {
      setAppliedPromo(null);
      setPromoError(error?.message || 'This promo code is not valid');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  const handlePlaceOrder = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const order = (await ordersApi.create(
        {
          shippingAddress: address,
          paymentMethod,
          notes: '',
          promoCode: appliedPromo?.code,
          redeemPoints: appliedPoints,
        },
        idempotencyKey,
      )) as any;

      // Mark order as placed before clearing the cache so the empty-cart guard never fires.
      setOrderPlaced(true);
      const cartOwner = session?.user?.id ?? getClientSessionId();
      qc.setQueryData(['cart', cartOwner], { items: [], subtotal: 0, discount: 0, total: 0 });
      // Redeemed points changed the balance — refetch it.
      qc.invalidateQueries({ queryKey: ['loyalty', 'me'] });

      router.push(`/account/orders/${order.id}?success=1`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg pt-28">
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px] space-y-6">
          <div className="surface-shell p-6 sm:p-7 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <p className="section-eyebrow">Checkout</p>
                <h1 className="max-w-[10ch] font-heading text-[clamp(3rem,6vw,5rem)] leading-[0.92] tracking-[-0.06em] text-[#1E2519]">
                  Finish with clarity and calm.
                </h1>
                <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#5B6455] sm:text-[16px]">
                  The flow is now cleaner, more structured, and visually aligned with the
                  new premium storefront direction.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {steps.map((label, index) => {
                  const active = index === step;
                  const complete = index < step;

                  return (
                    <div
                      key={label}
                      className={`inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium ${
                        active || complete
                          ? 'bg-[#273E1C] text-white'
                          : 'bg-[#F7F4EC] text-[#5B6455]'
                      }`}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
                        {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                      </span>
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="surface-shell p-6 sm:p-7">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="address"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="section-eyebrow">Step 1</p>
                    <h2 className="font-heading text-[2rem] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
                      Shipping address
                    </h2>

                    <form
                      onSubmit={handleSubmit((data) => {
                        setAddress(data);
                        setStep(1);
                      })}
                      className="mt-6 space-y-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                            Full name
                          </label>
                          <input {...register('fullName')} className="field-luxury" />
                          {errors.fullName && <p className="mt-2 text-xs text-[#C9571A]">{errors.fullName.message}</p>}
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                            Phone
                          </label>
                          <input {...register('phone')} className="field-luxury" />
                          {errors.phone && <p className="mt-2 text-xs text-[#C9571A]">{errors.phone.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                          Address line 1
                        </label>
                        <input {...register('line1')} className="field-luxury" />
                        {errors.line1 && <p className="mt-2 text-xs text-[#C9571A]">{errors.line1.message}</p>}
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                          Address line 2
                        </label>
                        <input {...register('line2')} className="field-luxury" />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                            City
                          </label>
                          <input {...register('city')} className="field-luxury" />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                            Postal code
                          </label>
                          <input {...register('postalCode')} className="field-luxury" />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                            Country
                          </label>
                          <input {...register('country')} defaultValue="Morocco" className="field-luxury" />
                        </div>
                      </div>

                      <button type="submit" className="btn-gold">
                        Continue to shipping
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </form>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="section-eyebrow">Step 2</p>
                    <h2 className="font-heading text-[2rem] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
                      Shipping method
                    </h2>

                    <div className="mt-6 space-y-4">
                      {[
                        {
                          id: 'standard',
                          label: 'Standard delivery',
                          desc: '3 to 5 business days',
                          price: cartData.subtotal > 500 ? 'Free' : '50 MAD',
                        },
                        {
                          id: 'express',
                          label: 'Express delivery',
                          desc: '1 to 2 business days',
                          price: '99 MAD',
                        },
                      ].map((method) => (
                        <label
                          key={method.id}
                          className={`block rounded-[28px] border px-5 py-5 transition-colors ${
                            shippingMethod === method.id
                              ? 'border-[#273E1C] bg-[#EFF5E7]'
                              : 'border-[#DEDACE] bg-white/70'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
                                {method.label}
                              </p>
                              <p className="mt-2 text-sm text-[#5B6455]">{method.desc}</p>
                            </div>
                            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#273E1C]">
                              {method.price}
                            </span>
                          </div>
                          <input
                            type="radio"
                            name="shipping"
                            value={method.id}
                            checked={shippingMethod === method.id}
                            onChange={(event) => setShippingMethod(event.target.value)}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button onClick={() => setStep(0)} className="btn-outline-gold">
                        Back
                      </button>
                      <button onClick={() => setStep(2)} className="btn-gold">
                        Continue
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="section-eyebrow">Step 3</p>
                    <h2 className="font-heading text-[2rem] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
                      Payment method
                    </h2>

                    <div className="mt-6 space-y-4">
                      {[
                        {
                          id: 'cod',
                          label: 'Cash on delivery',
                          desc: 'Pay when your order arrives',
                          disabled: false,
                        },
                        {
                          id: 'card',
                          label: 'Credit / debit card',
                          desc: 'Online payment is coming soon',
                          disabled: true,
                        },
                      ].map((method) => (
                        <label
                          key={method.id}
                          className={`block rounded-[28px] border px-5 py-5 transition-colors ${
                            paymentMethod === method.id
                              ? 'border-[#273E1C] bg-[#EFF5E7]'
                              : 'border-[#DEDACE] bg-white/70'
                          } ${method.disabled ? 'opacity-40' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
                                {method.label}
                              </p>
                              <p className="mt-2 text-sm text-[#5B6455]">{method.desc}</p>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(event) => !method.disabled && setPaymentMethod(event.target.value)}
                            disabled={method.disabled}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button onClick={() => setStep(1)} className="btn-outline-gold">
                        Back
                      </button>
                      <button onClick={() => setStep(3)} className="btn-gold">
                        Review order
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="section-eyebrow">Step 4</p>
                    <h2 className="font-heading text-[2rem] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
                      Review and place order
                    </h2>

                    <div className="mt-6 space-y-4">
                      {cartData.items.map((item: any) => (
                        <div key={item.variantId} className="surface-panel flex gap-4 p-4">
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[18px] bg-[#F7F4EC]">
                            {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1E2519]">
                              {item.name}
                            </p>
                            <p className="mt-1 text-sm text-[#5B6455]">
                              {item.variantName} x {item.quantity}
                            </p>
                          </div>
                          <p className="font-heading text-[1.2rem] leading-none tracking-[-0.04em] text-[#1E2519]">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {address && (
                      <div className="mt-6 rounded-[28px] bg-[#EFF5E7] px-5 py-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#273E1C]">
                          Shipping to
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#273E1C]">
                          {address.fullName}, {address.line1}, {address.city}, {address.country}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button onClick={() => setStep(2)} className="btn-outline-gold">
                        Back
                      </button>
                      <button onClick={handlePlaceOrder} disabled={loading} className="btn-gold disabled:opacity-50">
                        {loading ? 'Placing order...' : `Place order - ${formatPrice(total)}`}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="surface-shell h-fit p-5 sm:p-6 lg:sticky lg:top-24">
              <p className="section-eyebrow">Summary</p>
              <h2 className="font-heading text-[2rem] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
                Order overview
              </h2>

              <div className="mt-6 space-y-4">
                {cartData.items.map((item: any) => (
                  <div key={item.variantId} className="flex gap-3">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[18px] bg-[#F7F4EC]">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1E2519]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-[#5B6455]">x {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#1E2519]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="mt-6 border-t border-[#ECE6D9] pt-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                  Promo code
                </label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#CBE0C3] bg-[#EFF5E7] px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className="h-4 w-4 flex-shrink-0 text-[#2F6A37]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#273E1C]">{appliedPromo.code}</p>
                        <p className="truncate text-xs text-[#4F663F]">{appliedPromo.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[#4F663F] transition-colors hover:bg-white/70"
                      aria-label="Remove promo code"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value); setPromoError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromo(); } }}
                        placeholder="Enter code"
                        className="field-luxury flex-1 !py-2.5 uppercase"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoInput.trim()}
                        className="btn-outline-gold !min-h-0 !px-5 !py-2.5 disabled:opacity-50"
                      >
                        {promoLoading ? '…' : 'Apply'}
                      </button>
                    </div>
                    {promoError && <p className="mt-2 text-xs text-[#C9571A]">{promoError}</p>}
                  </>
                )}
              </div>

              {/* Loyalty points */}
              {balance > 0 && (
                <div className="mt-6 border-t border-[#ECE6D9] pt-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                      {t('loyalty.useTitle')}
                    </label>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B9894B]">
                      <Gift className="h-3.5 w-3.5" />
                      {t('loyalty.pointsAvailable', { points: balance })}
                    </span>
                  </div>

                  {!canRedeem ? (
                    <p className="mt-2 text-xs leading-6 text-[#8A8577]">
                      {t('loyalty.notEnough', { min: minRedeem })}
                    </p>
                  ) : appliedPoints > 0 ? (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-[18px] border border-[#CBE0C3] bg-[#EFF5E7] px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#273E1C]">
                          {t('loyalty.pointsApplied', { points: appliedPoints })}
                        </p>
                        <p className="truncate text-xs text-[#4F663F]">
                          −{formatPrice(loyaltyDiscount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRedeemPoints(Math.max(0, appliedPoints - redeemStep))}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#273E1C] transition-colors hover:bg-white"
                          aria-label={t('loyalty.decrease')}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRedeemPoints(Math.min(maxRedeemable, appliedPoints + redeemStep))}
                          disabled={appliedPoints >= maxRedeemable}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#273E1C] transition-colors hover:bg-white disabled:opacity-40"
                          aria-label={t('loyalty.increase')}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRedeemPoints(0)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#4F663F] transition-colors hover:bg-white/70"
                          aria-label={t('loyalty.remove')}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRedeemPoints(maxRedeemable)}
                      className="mt-3 flex w-full items-center justify-between gap-3 rounded-[18px] border border-[#D8C7AD] bg-white/70 px-4 py-3 text-left transition-colors hover:border-[#C9A96E] hover:bg-[#FBF7EE]"
                    >
                      <span className="text-sm font-semibold text-[#273E1C]">
                        {t('loyalty.useUpTo', {
                          points: maxRedeemable,
                          amount: formatPrice((maxRedeemable / redeemStep) * redeemStepValue),
                        })}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B9894B]">
                        {t('loyalty.apply')}
                      </span>
                    </button>
                  )}
                </div>
              )}

              <div className="mt-5 border-t border-[#ECE6D9] pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5B6455]">Subtotal</span>
                  <span className="text-[#1E2519]">{formatPrice(cartData.subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#5B6455]">Discount</span>
                    <span className="text-[#2F6A37]">-{formatPrice(discount)}</span>
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#5B6455]">{t('loyalty.pointsLabel', { points: appliedPoints })}</span>
                    <span className="text-[#2F6A37]">-{formatPrice(loyaltyDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#5B6455]">Shipping</span>
                  <span className="text-[#1E2519]">
                    {shippingCost === 0 ? (
                      <>
                        {freeShipping && <span className="mr-2 text-xs text-[#2F6A37] uppercase tracking-[0.14em]">Promo</span>}
                        Free
                      </>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#ECE6D9] pt-4">
                  <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1E2519]">Total</span>
                  <span className="font-heading text-[1.8rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <PhoneOrder
                className="mt-5"
                context={{ kind: 'checkout', itemCount: cartData.items.length, total: formatPrice(total) }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
