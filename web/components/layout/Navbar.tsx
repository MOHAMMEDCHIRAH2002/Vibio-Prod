'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

const navLinks = [
  { href: '/shop', key: 'nav.shop' },
  { href: '/shop/dates-sweets', key: 'nav.dates' },
  { href: '/shop/chocolates', key: 'nav.chocolates' },
  { href: '/shop/coffee-tea', key: 'nav.coffeeTea' },
  { href: '/gifts', key: 'nav.giftBoxes' },
  { href: '/blog', key: 'nav.journal' },
  { href: '/about', key: 'nav.about' },
  { href: '/contact', key: 'nav.contact' },
  { href: '/store', key: 'common.visitStore' },
];

export default function Navbar() {
  const { t } = useTranslation();
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
            <div className="flex items-center px-3 py-3 sm:px-5 lg:px-6">
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
                  className="nav-icon-btn lg:hidden"
                  aria-label={t('nav.openSearch')}
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              <Link href="/" className="flex items-center justify-center">
                <BrandLogo
                  className="h-11 w-36 sm:h-14 sm:w-[11.5rem]"
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
                  className="nav-icon-btn relative"
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
                  <div className="relative z-20 hidden sm:block">
                    <button
                      onClick={() => setUserMenuOpen((value) => !value)}
                      className="flex items-center gap-3 rounded-full border border-[#ddd8cf] bg-white/76 px-2 py-1.5 transition-[border-color,background-color] duration-200 hover:border-[#c9b99a] hover:bg-[#f7f5f0]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#F3F8E8] text-sm font-semibold text-[#273E1C]">
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
                      <ChevronDown className="h-4 w-4 text-[#5B6455]" />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.18 }}
                          className="surface-panel absolute right-0 z-30 mt-3 w-64 p-2"
                        >
                          <div className="rounded-[22px] bg-[#F7F4EC] px-4 py-3">
                            <p className="text-[10px] uppercase tracking-[0.26em] text-[#7A8162]">
                              {t('nav.signedIn')}
                            </p>
                            <p className="mt-2 truncate text-sm font-semibold text-[#1E2519]">
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
                  className="overflow-hidden border-t border-[#EEE8DC]"
                >
                  <div className="grid gap-8 px-4 pb-5 pt-5 lg:grid-cols-[1.15fr_0.85fr] lg:px-6">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {navLinks.map((link) => {
                        const active = pathname === link.href;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                              'rounded-[22px] px-4 py-3 text-sm font-medium transition-colors duration-200',
                              active
                                ? 'bg-[#F3F8E8] text-[#273E1C]'
                                : 'bg-white/64 text-[#5B6455] hover:bg-[#F7F4EC] hover:text-[#1E2519]',
                            )}
                          >
                            {t(link.key)}
                          </Link>
                        );
                      })}
                    </div>

                    <div className="surface-olive p-5">
                      <p className="text-[10px] uppercase tracking-[0.26em] text-[#6C8349]">
                        {t('nav.brandNoteLabel')}
                      </p>
                      <p className="mt-3 max-w-sm text-sm leading-7 text-[#43503E]">
                        {t('nav.brandNote')}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <VisitStoreCTA variant="solid" showArrow />
                        <button onClick={() => setSearchOpen(true)} className="btn-gold">
                          {t('common.search')}
                        </button>
                        {!session && (
                          <Link href="/login" className="btn-outline-gold">
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
