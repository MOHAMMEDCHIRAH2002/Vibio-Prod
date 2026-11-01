'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Gift, Home, LogOut, Package, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function AccountSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t, i18n } = useTranslation();
  const navItems = [
    { href: '/account', label: t('account.overview'), icon: Home, match: (path: string) => path === '/account' },
    {
      href: '/account/orders',
      label: t('account.orders'),
      icon: Package,
      match: (path: string) => path.startsWith('/account/orders'),
    },
    {
      href: '/account/loyalty',
      label: t('account.loyalty'),
      icon: Gift,
      match: (path: string) => path.startsWith('/account/loyalty'),
    },
    {
      href: '/account/settings',
      label: t('account.settings'),
      icon: Settings,
      match: (path: string) => path.startsWith('/account/settings'),
    },
  ];

  const source = session?.user?.name || session?.user?.email || t('account.member');
  const initials = source.slice(0, 1).toUpperCase();

  return (
    <aside
      dir={i18n.resolvedLanguage === 'ar' ? 'rtl' : 'ltr'}
      className="surface-shell sticky top-24 h-fit p-4 text-start sm:p-5"
    >
      <div className="surface-panel px-5 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF5E7] text-xl font-semibold text-[#273E1C]">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
              {session?.user?.name || t('account.member')}
            </p>
            <p className="truncate text-sm text-[#5B6455]">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="mt-4 space-y-2">
        {navItems.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-[24px] px-4 py-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-[#273E1C] text-white'
                  : 'bg-white/70 text-[#5B6455] hover:bg-[#EFF5E7] hover:text-[#1E2519]',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 surface-olive p-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#6C8349]">{t('account.memberNote')}</p>
        <p className="mt-3 text-sm leading-7 text-[#4E5948]">
          {t('account.memberNoteDescription')}
        </p>
      </div>

      <button onClick={() => signOut({ callbackUrl: '/' })} className="mt-4 btn-outline-gold w-full justify-center">
        <LogOut className="h-4 w-4" />
        {t('account.signOut')}
      </button>
    </aside>
  );
}
