'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import {
  BookOpen,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Star,
  Tag,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import BrandLogo from '@/components/common/BrandLogo';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

const navGroups = [
  {
    titleKey: 'admin.groupCommerce',
    items: [
      { href: '/admin', icon: LayoutDashboard, labelKey: 'admin.overview' },
      { href: '/admin/products', icon: Package, labelKey: 'admin.products' },
      { href: '/admin/categories', icon: Tag, labelKey: 'admin.categories' },
      { href: '/admin/stock', icon: Boxes, labelKey: 'admin.inventory' },
      { href: '/admin/orders', icon: ShoppingCart, labelKey: 'admin.orders' },
      { href: '/admin/submissions', icon: Inbox, labelKey: 'admin.submissions' },
      { href: '/admin/customers', icon: Users, labelKey: 'admin.customers' },
      { href: '/admin/promo', icon: Ticket, labelKey: 'admin.promo' },
    ],
  },
  {
    titleKey: 'admin.groupBrand',
    items: [
      { href: '/admin/banners', icon: ImageIcon, labelKey: 'admin.banners' },
      { href: '/admin/reviews', icon: Star, labelKey: 'admin.reviews' },
      { href: '/admin/blog', icon: BookOpen, labelKey: 'admin.blog' },
    ],
  },
];

const SIDEBAR_STORAGE_KEY = 'vibio-admin-sidebar-collapsed';

function formatBreadcrumb(segment: string) {
  return segment.replace(/-/g, ' ');
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarPreferenceReady, setSidebarPreferenceReady] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      setSidebarCollapsed(storedValue === 'true');
    } catch {
      setSidebarCollapsed(false);
    } finally {
      setSidebarPreferenceReady(true);
    }
  }, []);

  useEffect(() => {
    if (!sidebarPreferenceReady) {
      return;
    }

    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
    } catch {}
  }, [sidebarCollapsed, sidebarPreferenceReady]);

  useEffect(() => {
    if (status !== 'loading' && (status === 'unauthenticated' || session?.user.role !== 'ADMIN')) {
      router.replace('/login');
    }
  }, [router, session?.user.role, status]);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar' : 'fr-FR', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()),
    [i18n.language],
  );

  const breadcrumbSegments = pathname.split('/').filter(Boolean);
  const userInitial = session?.user?.name?.slice(0, 1).toUpperCase() || 'V';
  const pendingAuth =
    status === 'loading' || status === 'unauthenticated' || session?.user.role !== 'ADMIN';
  const desktopSidebarOffset = sidebarCollapsed ? 'lg:pl-[8rem]' : 'lg:pl-[21rem]';
  const desktopTopbarOffset = sidebarCollapsed ? 'lg:left-[8rem]' : 'lg:left-[21rem]';

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => {
    const compact = !mobile && sidebarCollapsed;

    return (
      <aside
        className={cn(
          'h-full transition-[width,padding] duration-300 ease-out',
          mobile
            ? 'w-[20rem] p-4'
            : compact
              ? 'hidden w-[7rem] p-3 lg:fixed lg:left-0 lg:top-0 lg:z-30 lg:block lg:h-[100dvh]'
              : 'hidden w-[20rem] p-4 lg:fixed lg:left-0 lg:top-0 lg:z-30 lg:block lg:h-[100dvh]',
        )}
      >
        <div
          className={cn(
            'admin-sidebar-shell flex h-full flex-col transition-[padding] duration-300 ease-out',
            compact ? 'p-3' : 'p-4',
          )}
        >
          <div
            className={cn(
              'transition-all duration-300',
              compact ? 'px-2 pb-4 pt-2' : 'px-3 pb-4 pt-2',
            )}
          >
            <div
              className={cn(
                'flex gap-3',
                compact ? 'flex-col items-center' : 'items-center justify-between',
              )}
            >
              <div className={cn('min-w-0 shrink-0', compact && 'flex flex-col items-center')}>
                <Link
                  href="/admin"
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-[1.35rem] border border-white/10 bg-white shadow-[0_18px_42px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5',
                    compact ? 'h-12 w-[4.75rem] min-w-[4.75rem]' : 'h-12 w-40 min-w-40',
                  )}
                  aria-label="Vibio admin"
                >
                  <BrandLogo
                    className={compact ? 'h-7 w-[3.5rem]' : 'h-8 w-28'}
                    sizes={compact ? '72px' : '112px'}
                  />
                </Link>
              </div>

              <button
                onClick={() => (mobile ? setSidebarOpen(false) : setSidebarCollapsed((value) => !value))}
                className={cn(
                  'admin-action-icon border-white/10 bg-white/5 text-white/70 hover:border-white/16 hover:bg-white/10 hover:text-white',
                  compact && 'self-center',
                )}
                aria-label={mobile ? t('admin.closeMenu') : sidebarCollapsed ? t('admin.expandSidebar') : t('admin.collapseSidebar')}
                title={mobile ? t('admin.closeMenu') : sidebarCollapsed ? t('admin.expandSidebar') : t('admin.collapseSidebar')}
              >
                {mobile ? (
                  <X className="h-4 w-4" />
                ) : compact ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div
            className={cn(
              'admin-sidebar-scroll flex-1 overflow-y-auto py-5',
              compact ? 'px-1.5 pr-1' : 'px-2 pr-1.5',
            )}
          >
            <div className={cn(compact ? 'space-y-3' : 'space-y-6')}>
              {navGroups.map((group) => (
                <div key={group.titleKey}>
                  {!compact && (
                    <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/35">
                      {t(group.titleKey)}
                    </p>
                  )}
                  <div className={cn('space-y-1.5', compact ? 'mt-0' : 'mt-3')}>
                    {group.items.map(({ href, icon: Icon, labelKey }) => {
                      const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
                      const label = t(labelKey);

                      return (
                        <Link
                          key={href}
                          href={href}
                          className={cn(
                            'admin-sidebar-link',
                            active && 'admin-sidebar-link-active',
                            compact && '!justify-center !gap-0 !px-0',
                          )}
                          aria-label={label}
                          title={compact ? label : undefined}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          {!compact && <span className="flex-1">{label}</span>}
                          {!compact && active && <ChevronRight className="h-4 w-4" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(compact ? 'px-2 pt-4' : 'px-3 pt-5')}>
            <div
              className={cn(
                'rounded-[1.4rem] bg-white/5 backdrop-blur-sm transition-all duration-300',
                compact ? 'px-2 py-3' : 'px-4 py-4',
              )}
            >
              <div className={cn('flex items-center gap-3', compact && 'justify-center')}>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F1E1] text-sm font-semibold text-[#22351A] shadow-[0_10px_24px_rgba(15,29,22,0.12)]">
                  {userInitial}
                </div>
                {!compact && (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {session?.user?.name || t('admin.adminFallback')}
                    </p>
                    <p className="truncate text-xs text-white/48">{session?.user?.email}</p>
                  </div>
                )}
              </div>

              <div className={cn('mt-4 flex flex-wrap gap-2', compact && 'mt-3 flex-col')}>
                <Link
                  href="/"
                  target="_blank"
                  className={cn(
                    'admin-btn-secondary !min-h-[2.65rem] !border-white/10 !bg-white/6 !text-[0.68rem] !text-white hover:!bg-white/10',
                    compact ? '!w-full !justify-center !px-0' : '!px-4',
                  )}
                  aria-label={t('admin.storefront')}
                  title={compact ? t('admin.storefront') : undefined}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {!compact && t('admin.storefront')}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className={cn(
                    'admin-btn-secondary !min-h-[2.65rem] !border-white/10 !bg-transparent !text-[0.68rem] !text-white/78 hover:!bg-white/8 hover:!text-white',
                    compact ? '!w-full !justify-center !px-0' : '!px-4',
                  )}
                  aria-label={t('admin.signOut')}
                  title={compact ? t('admin.signOut') : undefined}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {!compact && t('admin.signOut')}
                </button>
              </div>

              <div className={cn('mt-3 flex', compact ? 'justify-center' : 'justify-start')}>
                <LanguageSwitcher variant="dark" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  };

  if (pendingAuth) {
    return (
      <div className="admin-app flex min-h-screen">
        <Sidebar />
        <div className={cn('flex-1 p-4 sm:p-5 lg:pr-6 lg:py-6', desktopSidebarOffset)}>
          <div
            className={cn(
              'fixed left-4 right-4 top-4 z-20 transition-[left,right] duration-300 ease-out sm:left-5 sm:right-5 lg:right-6',
              desktopTopbarOffset,
            )}
          >
            <div className="mx-auto max-w-[1600px]">
              <div className="admin-topbar h-[5.5rem] animate-pulse" />
            </div>
          </div>

          <div className="mx-auto max-w-[1600px] space-y-5 pt-[6.75rem] sm:pt-[7rem]">
            <div className="admin-panel h-[18rem] animate-pulse" />
            <div className="grid gap-5 xl:grid-cols-3">
              <div className="admin-panel h-[16rem] animate-pulse xl:col-span-2" />
              <div className="admin-panel h-[16rem] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-app relative flex min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute left-[-10rem] top-[-8rem] h-[22rem] w-[22rem] rounded-full bg-[#273E1C]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] h-[20rem] w-[20rem] rounded-full bg-[#90C038]/10 blur-[120px]" />

      <Sidebar />

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-[#0D1711]/45 backdrop-blur-[2px] lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed left-0 top-0 z-50 h-full lg:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div
        className={cn(
          'relative flex min-w-0 flex-1 flex-col p-4 transition-[padding] duration-300 ease-out sm:p-5 lg:pr-6 lg:py-6',
          desktopSidebarOffset,
        )}
      >
        <div
          className={cn(
            'fixed left-4 right-4 top-4 z-20 transition-[left,right] duration-300 ease-out sm:left-5 sm:right-5 lg:right-6',
            desktopTopbarOffset,
          )}
        >
          <div className="mx-auto max-w-[1600px]">
            <header className="admin-topbar px-4 py-4 sm:px-5 lg:px-6">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="admin-action-icon lg:hidden"
                  aria-label={t('admin.openMenu')}
                >
                  <Menu className="h-4 w-4" />
                </button>

                <Link
                  href="/admin"
                  className="inline-flex rounded-full border border-[#ECE7DB] bg-white/82 px-3 py-2 shadow-[0_12px_32px_rgba(24,30,24,0.08)] lg:hidden"
                >
                  <BrandLogo className="h-7 w-24" sizes="96px" />
                </Link>

                <div className="min-w-0">
                  <p className="admin-eyebrow">{t('admin.administration')}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#6B7360]">
                    {breadcrumbSegments.map((segment, index) => (
                      <span key={`${segment}-${index}`} className="flex items-center gap-2">
                        {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#A59A8C]" />}
                        <span
                          className={cn(
                            'capitalize',
                            index === breadcrumbSegments.length - 1 && 'font-semibold text-[#171C14]',
                          )}
                        >
                          {formatBreadcrumb(segment)}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <LanguageSwitcher variant="light" />
                  <div className="admin-chip ltr-nums">{dateLabel}</div>
                  <Link href="/" target="_blank" className="admin-btn-secondary !min-h-[2.7rem] !px-4">
                    {t('admin.viewStore')}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </header>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-5 pt-[6.75rem] sm:pt-[7rem]">
          <main className="flex-1">
            <div className="mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
