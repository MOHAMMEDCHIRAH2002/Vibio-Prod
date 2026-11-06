'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { signOut, useSession } from 'next-auth/react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';
import CartDrawer from '@/components/shop/CartDrawer';
import SearchModal from '@/components/common/SearchModal';
import BrandLogo from '@/components/common/BrandLogo';
import VisitStoreCTA from '@/components/store/VisitStoreCTA';
import { categoriesApi } from '@/lib/api';

const staticNavLinks = [
  { href: '/shop', key: 'nav.shop' },
  // { href: '/gifts', key: 'nav.giftBoxes' },
  { href: '/blog', key: 'nav.journal' },
  { href: '/about', key: 'nav.about' },
  { href: '/contact', key: 'nav.contact' },
  { href: '/store', key: 'common.visitStore' },
];

export default function Navbar() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });
  const { t, i18n } = useTranslation();
  const isArabic = i18n.resolvedLanguage === 'ar';
  const pathname = usePathname();
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const initials = useMemo(() => {
    const source = session?.user?.name || session?.user?.email || 'V';
    return source.slice(0, 1).toUpperCase();
  }, [session?.user?.email, session?.user?.name]);

  return (
    <>
      <nav
        className={cn(
          'fixed inset-x-0 top-0 z-50 px-4 sm:px-6 lg:px-8 transition-[padding-top] duration-300',
          scrolled ? 'pt-3' : 'pt-4',
        )}
      >
        <div className="mx-auto max-w-[1540px]">
          <div
            className={cn(
              'surface-shell relative overflow-visible transition-[border-color,box-shadow] duration-300',
              scrolled
                ? 'shadow-[0_22px_50px_rgba(30,37,25,0.12)]'
                : 'shadow-[0_18px_42px_rgba(30,37,25,0.08)]',
            )}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
            <div className="relative flex items-center px-3 py-3 sm:px-5 lg:px-6">
              <div className="flex flex-1 min-w-0 items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setMobileOpen((value) => !value)}
                  className="lux-pill px-4 py-3"
                >
                  {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  <span className="hidden sm:inline">{t('nav.menu')}</span>
                </button>

                <button
                  onClick={() => setSearchOpen(true)}
                  className="hidden min-w-[220px] items-center justify-between rounded-full border border-[#ddd8cf] bg-white/72 px-4 py-3 text-sm text-[#6d6a63] transition-[border-color,background-color] duration-200 hover:border-[#c9b99a] hover:bg-[#f7f5f0] lg:flex"
                >
                  <span>{t('nav.searchPlaceholder')}</span>
                  <Search className="h-4 w-4 text-[#273E1C]" />
                </button>

                <button
                  onClick={() => setSearchOpen(true)}
                  className="nav-icon-btn !h-10 !w-10 shrink-0 lg:hidden"
                  aria-label={t('nav.openSearch')}
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              <Link
                href="/"
                className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center"
              >
                <BrandLogo
                  className="h-9 w-28 sm:h-14 sm:w-[11.5rem]"
                  sizes="(min-width: 640px) 184px, 144px"
                  priority
                  trimPadding
                />
              </Link>

              <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
                <VisitStoreCTA variant="pill" className="hidden px-4 py-2.5 lg:inline-flex" />

                <LanguageSwitcher className="hidden sm:inline-flex" />

                <Link href="/wishlist" aria-label={t('nav.wishlist')} className="nav-icon-btn relative hidden sm:inline-flex">
                  <Heart className="h-4 w-4" />
                  {wishlistCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#C9571A] px-1 text-[10px] font-bold text-white">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => setCartOpen(true)}
                  className="nav-icon-btn relative !h-10 !w-10 sm:!h-[2.7rem] sm:!w-[2.7rem]"
                  aria-label={t('nav.openCart')}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#2d5016] px-1 text-[10px] font-bold text-white">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </button>

                {session ? (
                  <div className="relative z-20 block">
                    <button
                      onClick={() => setUserMenuOpen((value) => !value)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd8cf] bg-white/76 p-0 transition-[border-color,background-color] duration-200 hover:border-[#c9b99a] hover:bg-[#f7f5f0] lg:h-auto lg:w-auto lg:justify-start lg:gap-3 lg:px-2 lg:py-1.5"
                    >
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#F3F8E8] text-sm font-semibold text-[#273E1C] lg:h-9 lg:w-9">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || 'Profile'}
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="hidden text-left lg:block">
                        <p className="text-sm font-semibold text-[#1E2519]">
                          {session.user.name || t('nav.member')}
                        </p>
                        <p className="text-xs text-[#5B6455]">{t('nav.viewProfile')}</p>
                      </div>
                      <ChevronDown className="hidden h-4 w-4 text-[#5B6455] lg:block" />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.18 }}
                          dir={isArabic ? 'rtl' : 'ltr'}
                          className={cn(
                            'surface-panel fixed top-[4.75rem] z-30 mt-0 w-[min(18rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] p-2',
                            'text-start',
                            'lg:absolute lg:right-0 lg:top-auto lg:mt-3 lg:w-[min(18rem,calc(100vw-2rem))] lg:max-w-none',
                            isArabic ? 'left-2 right-auto' : 'left-auto right-2',
                            isArabic ? 'text-right' : 'text-left',
                          )}
                        >
                          <div className="rounded-[22px] bg-[#F7F4EC] px-4 py-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-[#7A8162]">
                              {t('nav.signedIn')}
                            </p>
                            <p className="mt-2 truncate text-sm font-semibold text-[#1E2519]" dir="ltr">
                              {session.user.email}
                            </p>
                          </div>

                          <div className="mt-2 space-y-1">
                            {[
                              { href: '/account', icon: User, label: t('nav.account') },
                              { href: '/account/orders', icon: Package, label: t('nav.orders') },
                            ].map(({ href, icon: Icon, label }) => (
                              <Link
                                key={href}
                                href={href}
                                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[#4F5A48] transition-colors duration-200 hover:bg-[#EFF5E7] hover:text-[#273E1C]"
                              >
                                <Icon className="h-4 w-4" />
                                {label}
                              </Link>
                            ))}

                            {session.user.role === 'ADMIN' && (
                              <Link
                                href="/admin"
                                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[#4F5A48] transition-colors duration-200 hover:bg-[#EFF5E7] hover:text-[#273E1C]"
                              >
                                <Settings className="h-4 w-4" />
                                {t('nav.adminDashboard')}
                              </Link>
                            )}

                            <button
                              onClick={() => signOut({ callbackUrl: '/' })}
                              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[#C9571A] transition-colors duration-200 hover:bg-[#FCE9E2]"
                            >
                              <LogOut className="h-4 w-4" />
                              {t('nav.signOut')}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link href="/login" className="btn-outline-gold hidden sm:inline-flex">
                    {t('common.signIn')}
                  </Link>
                )}
              </div>
            </div>

            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.24 }}
                  dir={isArabic ? 'rtl' : 'ltr'}
                  className="overflow-hidden border-t border-[#EEE8DC] lg:hidden"
                >
                  <div className="max-h-[min(72vh,38rem)] overflow-y-auto overscroll-contain px-3 pb-4 pt-3 sm:px-5 sm:pb-6">
                    <div className="flex items-center justify-between border-b border-[#EEE8DC] px-1 pb-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7A8162]">
                        {t('nav.menu')}
                      </p>
                      <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="nav-icon-btn !h-9 !w-9"
                        aria-label={t('nav.closeMenu')}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <section className="pt-4">
                      <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B9894B]">
                        {t('nav.shop')}
                      </p>
                      <div className="mt-2 grid gap-1.5">
                        {staticNavLinks.map((link) => {
                          const active = pathname === link.href;
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                'flex min-h-12 items-center rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-200',
                                active
                                  ? 'bg-[#F3F8E8] text-[#273E1C]'
                                  : 'text-[#4F594B] hover:bg-[#F7F4EC] hover:text-[#1E2519]',
                              )}
                            >
                              {t(link.key)}
                            </Link>
                          );
                        })}
                      </div>
                    </section>

                    {categories && categories.length > 0 && (
                      <section className="mt-6 border-t border-[#EEE8DC] pt-5">
                        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B9894B]">
                          {t('common.exploreCollections')}
                        </p>
                        <div className="mt-2 space-y-1.5">
                          {categories.map((category) => {
                            const children = category.children ?? [];
                            const expanded = expandedCategoryIds.includes(category.id);
                            const categoryHref = `/shop/${encodeURIComponent(category.slug)}`;
                            const active = pathname === categoryHref;

                            return (
                              <div key={category.id} className="overflow-hidden rounded-2xl border border-[#EEE8DC] bg-white/55">
                                <div className="flex min-h-12 items-center">
                                  <Link
                                    href={categoryHref}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                      'min-w-0 flex-1 truncate px-4 py-3 text-sm font-medium',
                                      active ? 'text-[#273E1C]' : 'text-[#4F594B]',
                                    )}
                                  >
                                    {category.name}
                                  </Link>
                                  {children.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedCategoryIds((current) =>
                                          current.includes(category.id)
                                            ? current.filter((id) => id !== category.id)
                                            : [...current, category.id],
                                        )
                                      }
                                      className="flex h-11 w-12 shrink-0 items-center justify-center text-[#6C8349]"
                                      aria-expanded={expanded}
                                      aria-label={category.name}
                                    >
                                      <ChevronDown
                                        className={cn('h-4 w-4 transition-transform duration-200', expanded && 'rotate-180')}
                                      />
                                    </button>
                                  )}
                                </div>
                                {expanded && (
                                  <div className="border-t border-[#EEE8DC] bg-[#FAF8F2] px-3 py-2">
                                    {children.map((child) => (
                                      <Link
                                        key={child.id}
                                        href={`/shop/${encodeURIComponent(child.slug)}`}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex min-h-11 items-center rounded-xl px-3 py-2 text-sm text-[#68725F] transition-colors hover:bg-white hover:text-[#273E1C]"
                                      >
                                        {child.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    <div className="surface-olive mt-6 p-5">
                      <p className="text-[10px] uppercase tracking-[0.26em] text-[#6C8349]">
                        {t('nav.brandNoteLabel')}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#43503E]">
                        {t('nav.brandNote')}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-2.5">
                        <VisitStoreCTA variant="solid" showArrow />
                        <button onClick={() => setSearchOpen(true)} className="btn-gold">
                          {t('common.search')}
                        </button>
                        {!session && (
                          <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-outline-gold">
                            {t('common.signIn')}
                          </Link>
                        )}
                        <LanguageSwitcher />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
