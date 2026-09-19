'use client';

import { useState } from 'react';
import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   BOTTOM-LEFT CAROUSEL DATA
   Users scroll through featured products with ← → arrows
───────────────────────────────────────────────────────────── */
const carouselProducts = [
  {
    id: 0,
    tags: ['Sale', 'Best'],
    name: 'Jasmine Haze',
    subtitle: 'Premium loose-leaf blend',
    price: '8.99€',
    oldPrice: '11.99€',
    image: '/Thes/jasmine-haze.jpg',
  },
  {
    id: 1,
    tags: ['New'],
    name: 'Organic Matcha',
    subtitle: 'Ceremonial grade reserve',
    price: '12.99€',
    oldPrice: null,
    image: '/Thes/organic-matcha(1).jpg',
  },
  {
    id: 2,
    tags: ['Top'],
    name: 'Super Datte',
    subtitle: 'Premium Medjool dates',
    price: '9.99€',
    oldPrice: null,
    image: '/coffe/-super-datte-nature.jpg',
  },
];

/* ─────────────────────────────────────────────────────────────
   RIGHT PANEL CATEGORY DATA
   Tab selection switches the displayed product + images
───────────────────────────────────────────────────────────── */
const categoryData = [
  {
    id: 'tea',
    label: 'Tea',
    tag: 'new season',
    name: 'Organic Matcha\nCeremonial',
    price: '12.99€',
    images: ['/Thes/organic-matcha(1).jpg', '/Thes/gunpowder(1).png'],
    href: '/shop/coffee-tea',
  },
  {
    id: 'dates',
    label: 'Dates',
    tag: 'best seller',
    name: 'Super Datte\nGingembre',
    price: '11.99€',
    images: ['/coffe/super-datte-gingembre.jpg', '/coffe/-super-datte-nature.jpg'],
    href: '/shop/dates-sweets',
  },
  {
    id: 'choc',
    label: 'Choc.',
    tag: 'sale -10%',
    name: 'Tablette Caramel\nChocolat',
    price: '6.99€',
    images: [
      '/chocolat/tablette-chocolat-caramel.jpg',
      '/chocolat/tablette-chocolat-blanc-au-matcha.jpg',
    ],
    href: '/shop/chocolates',
  },
];

/* ─────────────────────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────────────────────── */
export default function HeroSection() {
  const { t } = useTranslation();
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeCat, setActiveCat] = useState('tea');

  const product = carouselProducts[slideIndex];
  const category = categoryData.find((c) => c.id === activeCat)!;

  const prev = () =>
    setSlideIndex((i) => (i - 1 + carouselProducts.length) % carouselProducts.length);
  const next = () =>
    setSlideIndex((i) => (i + 1) % carouselProducts.length);

  return (
    <section
      className="relative w-full pt-[68px] overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at top left, rgba(123, 160, 85, 0.11), transparent 38%), radial-gradient(ellipse at bottom right, rgba(201, 163, 107, 0.13), transparent 42%), linear-gradient(180deg, #FEFDF8 0%, #FAF4EA 52%, #F2EAD8 100%)',
      }}
    >
      {/* Decorative botanical corners */}
      {/* <BotanicalCorner position="top-left" />
      <BotanicalCorner position="bottom-right" /> */}

      {/* Subtle warm-grain texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          mixBlendMode: 'multiply',
        }}
      />

      <div className="relative z-[3] max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="lg:hidden py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="surface-shell relative overflow-hidden px-5 py-6 sm:px-7 sm:py-8"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/70 to-transparent" />

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border border-[#DCE8D0] bg-white/72 px-4 py-2"
              >
                <span className="h-2 w-2 rounded-full bg-[#2d5016]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#65795A]">
                  {t('hero.eyebrow')}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.06 }}
                className="mt-6 max-w-[10ch] font-heading text-[clamp(2.8rem,10vw,4.4rem)] leading-[0.94] tracking-[-0.08em] text-[#1A2017]"
              >
                {t('hero.titleSimpleA')}
                <span className="block text-[#2d5016]">{t('hero.titleSimpleAccent')}</span>
                {t('hero.titleSimpleB')}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
                className="mt-5 max-w-[28rem] text-sm leading-8 text-[#697266] sm:text-[0.98rem]"
              >
                {t('hero.description')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.18 }}
                className="mt-6"
              >
                <Link href="/shop" className="btn-gold !min-h-[3.1rem] !px-6">
                  {t('common.shopNow')}
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.22 }}
                className="relative mt-8 overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(239,244,235,0.78))] p-4 shadow-[0_24px_70px_rgba(33,47,32,0.08)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(214,232,204,0.85),transparent_28%),radial-gradient(circle_at_50%_88%,rgba(255,255,255,0.72),transparent_28%)]" />
                <div className="pointer-events-none absolute left-[8%] top-[16%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(172,201,158,0.72)_0%,rgba(172,201,158,0.24)_42%,transparent_76%)]" />
                <div className="pointer-events-none absolute right-[8%] top-[14%] h-20 w-20 rounded-full border border-white/65 bg-white/20 backdrop-blur-[6px]" />
                <div className="pointer-events-none absolute inset-x-[16%] bottom-[11%] h-12 rounded-full bg-[#203423]/14 blur-[20px]" />

                <div className="relative h-[22rem] sm:h-[26rem]">
                  <Image
                    src="/HeroImg.png"
                    alt="Vibio editorial portrait holding product"
                    fill
                    priority
                    sizes="(min-width: 640px) 420px, 92vw"
                    className="object-contain object-bottom scale-[1.18]"
                    style={{
                      filter:
                        'brightness(1.02) saturate(1.04) drop-shadow(0 32px 70px rgba(28,50,22,0.18)) drop-shadow(0 14px 28px rgba(0,0,0,0.08))',
                    }}
                  />
                </div>

                <div className="relative mt-2 flex items-center justify-between gap-3 rounded bg-white/95 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#798874]">
                      {t('hero.signatureReserve')}
                    </p>
                    <p className="mt-1 font-heading text-[1.45rem] leading-[1] tracking-[-0.05em] text-[#1A2017]">
                      Organic Matcha
                    </p>
                  </div>
                  <Link
                    href={category.href}
                    aria-label={`View ${category.name}`}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#2d5016] text-white shadow-[0_14px_28px_rgba(227,60,20,0.2)] transition-colors duration-200 hover:bg-[#273E1C]"
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="hidden lg:grid lg:grid-cols-[1fr_1.1fr_0.9fr] lg:min-h-[85vh]">

          {/* ═══════════════════════════════════════════
              LEFT COLUMN
              Top: eyebrow · headline · description · CTA
              Bottom: product carousel card with ← → arrows
          ═══════════════════════════════════════════ */}
          <div className="flex flex-col justify-between pt-10 pb-8 lg:py-14 lg:pr-10">

            {/* ── Text block ── */}
            <div>
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="flex items-center gap-2.5 mb-6 "
              >
                <span
                  style={{
                    display: 'block',
                    width: 20,
                    height: 1.5,
                    background: '#2d5016',
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
                <p
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.26em',
                    textTransform: 'uppercase',
                    color: '#5B6455',
                    margin: 0,
                  }}
                >
                  Natural · Premium · Artisanal
                </p>
              </motion.div>

              {/* Headline — mixed weight like reference */}
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                style={{
                  fontFamily: 'var(--font-serif), Georgia, serif',
                  fontSize: 'clamp(2.2rem, 3.4vw, 52px)',
                  fontWeight: 400,
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  color: '#1a1a17',
                  margin: '0 0 1rem',
                }}
              >
                {t('hero.titleSimpleA')}{' '}
                <em style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 500, color: '#2d5016' }}>{t('hero.titleSimpleAccent')}</em>
                <br />
                {t('hero.titleSimpleB')}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16 }}
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 13,
                  lineHeight: 1.82,
                  color: '#7A887B',
                  maxWidth: 295,
                  margin: '0 0 1.75rem',
                }}
              >
                {t('hero.descriptionShort')}
              </motion.p>

              {/* CTA — pill button like reference */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.24 }}
              >
                <Link href="/shop" className="btn-gold">
                  {t('common.shopNow')}
                </Link>
              </motion.div>
            </div>

            {/* ── Bottom: Featured product carousel card ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.38 }}
              className="mt-8 lg:mt-0"
              style={{
                background: 'rgba(255, 253, 249, 0.92)',
                border: '1px solid rgba(218, 206, 182, 0.55)',
                borderRadius: 24,
                padding: '16px',
                boxShadow: '0 8px 40px rgba(28, 44, 24, 0.10), 0 2px 12px rgba(201, 163, 107, 0.10)',
                backdropFilter: 'blur(14px)',
              }}
            >
              {/* Product row: image + info */}
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: 'rgba(236, 244, 232, 0.80)',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ position: 'absolute', inset: 0 }}
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="88px"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Product details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex gap-1.5 mb-1.5">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          background: '#EEF5EC',
                          color: '#273E1C',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p
                        style={{
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                          fontSize: 15,
                          fontWeight: 700,
                          color: '#1C1C1C',
                          margin: '0 0 2px',
                          lineHeight: 1.25,
                        }}
                      >
                        {product.name}
                      </p>
                      <p
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: 11,
                          color: '#9EB39F',
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {product.subtitle}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(210, 198, 176, 0.40)', margin: '12px 0' }} />

              {/* Price + Navigation arrows */}
              <div className="flex items-center justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-baseline gap-2"
                  >
                    <span
                      style={{
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#273E1C',
                      }}
                    >
                      {product.price}
                    </span>
                    {product.oldPrice && (
                      <span
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: 12,
                          color: '#B8C4B9',
                          textDecoration: 'line-through',
                        }}
                      >
                        {product.oldPrice}
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    aria-label="Previous product"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      border: '1.5px solid #E4EDE2',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#5B6455',
                    }}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next product"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      border: 'none',
                      background: '#2d5016',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ═══════════════════════════════════════════
              CENTER COLUMN (desktop only)
              Large hero product floating with glow
          ═══════════════════════════════════════════ */}
          <div className="relative hidden lg:flex items-center justify-center overflow-hidden px-4 py-10">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 30%, rgba(214,233,207,0.72) 0%, rgba(214,233,207,0.36) 24%, transparent 56%), radial-gradient(circle at 52% 80%, rgba(180,212,171,0.24) 0%, transparent 36%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: '12% 10% 13%',
                borderRadius: 44,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(245,248,242,0.12) 100%)',
                border: '1px solid rgba(255,255,255,0.42)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.78), 0 28px 70px rgba(44,70,36,0.06)',
                backdropFilter: 'blur(2px)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: [1, 1.04, 1], y: [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.8, delay: 0.4 },
                scale: { delay: 0.9, duration: 6, repeat: Infinity, ease: 'easeInOut' },
                y: { delay: 0.9, duration: 6, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="absolute left-[14%] top-[21%] h-28 w-28 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(173,204,156,0.78) 0%, rgba(173,204,156,0.3) 34%, transparent 74%)',
                filter: 'blur(2px)',
              }}
            />
            <div
              className="absolute right-[16%] top-[18%] h-24 w-24 rounded-full border border-white/55"
              style={{
                background: 'rgba(255,255,255,0.16)',
                boxShadow: '0 12px 32px rgba(37,61,45,0.08)',
                backdropFilter: 'blur(7px)',
              }}
            />
            <div
              className="absolute bottom-[12%] left-1/2 h-16 w-[58%] -translate-x-1/2 rounded-[999px]"
              style={{
                background: 'rgba(25,45,32,0.14)',
                filter: 'blur(26px)',
              }}
            />

            {/* Oversized watermark */}
            {/* <span
              style={{
                position: 'absolute',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: 'clamp(80px,14vw,190px)',
                fontWeight: 800,
                color: 'rgba(56,156,73,0.04)',
                letterSpacing: '-0.06em',
                userSelect: 'none',
                pointerEvents: 'none',
                lineHeight: 1,
              }}
            >
              Vibio
            </span> */}

            {/* Hero product — organic matcha */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
              transition={{
                opacity: { duration: 0.9, delay: 0.3 },
                scale: { duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
                y: { delay: 1.2, duration: 5.2, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{
                position: 'relative',
                width: '92%',
                maxWidth: 560,
                aspectRatio: '0.88 / 1',
                zIndex: 3,
              }}
            >
              <div
                className="absolute inset-x-[17%] bottom-[14%] h-[24%] rounded-full"
                style={{
                  background: 'rgba(231,241,227,0.94)',
                  filter: 'blur(44px)',
                }}
              />
              <div
                className="absolute inset-x-[7%] bottom-[4%] h-[12%] rounded-full"
                style={{
                  background: 'rgba(18,42,28,0.16)',
                  filter: 'blur(20px)',
                }}
              />
              <div
                className="absolute inset-0 rounded-[42px]"
                style={{
                  background:
                    'radial-gradient(circle at 50% 24%, rgba(255,255,255,0.62) 0%, transparent 58%)',
                }}
              />
              <Image
                src="/HeroImg.png"
                alt="Organic Matcha — Vibio Premium Collection"
                fill
                className="object-contain object-bottom scale-[1.22]"
                priority
                sizes="(min-width: 1280px) 560px, 46vw"
                style={{
                  filter:
                    'brightness(1.02) saturate(1.04) drop-shadow(0 44px 84px rgba(28,50,22,0.24)) drop-shadow(0 16px 34px rgba(0,0,0,0.12))',
                  mixBlendMode: 'multiply',
                }}
              />
            </motion.div>

            {/* Vertical brand label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              style={{
                position: 'absolute',
                fontFamily: 'Manrope, sans-serif',
                fontSize: 8,
                fontWeight: 600,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: 'rgba(56,156,73,0.3)',
                writingMode: 'vertical-rl',
                bottom: '10%',
                right: '6%',
              }}
            >
              Est. 2024 · Vibio
            </motion.p>
          </div>

          {/* ═══════════════════════════════════════════
              RIGHT COLUMN
              Top: category tabs (Tea | Dates | Choc.)
              Below: tag · product name + arrow · price · two product images
          ═══════════════════════════════════════════ */}
          <div
            className="flex flex-col justify-end pb-8 lg:py-14 lg:pl-8 "
            style={{ borderLeft: '1px solid rgba(56,156,73,0.1)' }}
          >
            <div>
              {/* Category tab bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="flex gap-2 mb-7"
              >
                {categoryData.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCat(cat.id)}
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      padding: '6px 16px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      background: activeCat === cat.id ? '#2d5016' : 'rgba(255, 253, 249, 0.88)',
                      border: activeCat === cat.id ? 'none' : '1px solid rgba(218, 206, 182, 0.55)',
                      color: activeCat === cat.id ? '#fff' : '#5B6455',
                      transition: 'background 0.18s, color 0.18s',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </motion.div>

              {/* Animated product detail on tab change */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCat}
                  className="rounded-xl p-6"
                  style={{
                    background: 'rgba(255, 253, 249, 0.90)',
                    border: '1px solid rgba(218, 206, 182, 0.50)',
                    boxShadow: '0 8px 36px rgba(28, 44, 24, 0.09), 0 2px 10px rgba(201, 163, 107, 0.08)',
                    backdropFilter: 'blur(14px)',
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Bracket tag — like reference "[sale -10]" */}
                  <span
                    style={{
                      display: 'inline-block',
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#7A887B',
                      border: '1px solid rgba(56,156,73,0.2)',
                      padding: '3px 10px',
                      borderRadius: 4,
                      marginBottom: 12,
                    }}
                  >
                    [ {category.tag} ]
                  </span>

                  {/* Product name + arrow button — like reference */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3
                      style={{
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontSize: 'clamp(17px, 2vw, 22px)',
                        fontWeight: 700,
                        color: '#1C1C1C',
                        lineHeight: 1.28,
                        letterSpacing: '-0.02em',
                        whiteSpace: 'pre-line',
                        margin: 0,
                      }}
                    >
                      {category.name}
                    </h3>
                    <Link
                      href={category.href}
                      aria-label={`View ${category.name}`}
                      className="transition-colors duration-200 hover:bg-[#273E1C]"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 38,
                        height: 38,
                        borderRadius: 999,
                        background: '#2d5016',
                        color: '#fff',
                        flexShrink: 0,
                        textDecoration: 'none',
                      }}
                    >
                      <ArrowUpRight size={17} />
                    </Link>
                  </div>

                  {/* Price */}
                  <p
                    style={{
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: 22,
                      fontWeight: 700,
                      color: '#273E1C',
                      margin: '0 0 1.25rem',
                    }}
                  >
                    {category.price}
                  </p>

                  {/* Two product images side by side */}
                  <div className="flex gap-2.5">
                    {category.images.map((img, idx) => (
                      <div
                        key={img}
                        style={{
                          flex: idx === 0 ? '0 0 54%' : '1',
                          aspectRatio: '1 / 1',
                          borderRadius: 18,
                          overflow: 'hidden',
                          background: 'rgba(240, 248, 236, 0.85)',
                          position: 'relative',
                          boxShadow: '0 4px 20px rgba(39,62,28,0.08)',
                        }}
                      >
                        <Image
                          src={img}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
