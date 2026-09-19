'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Gift, Heart, Home, LogOut, MapPin, Package, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/account', label: 'Overview', icon: Home, match: (pathname: string) => pathname === '/account' },
  {
    href: '/account/orders',
    label: 'Orders',
    icon: Package,
    match: (pathname: string) => pathname.startsWith('/account/orders'),
  },
  {
    href: '/account/loyalty',
    label: 'Loyalty',
    icon: Gift,
    match: (pathname: string) => pathname.startsWith('/account/loyalty'),
  },
  { href: '/wishlist', label: 'Wishlist', icon: Heart, match: (pathname: string) => pathname === '/wishlist' },
  {
    href: '/account/addresses',
    label: 'Addresses',
    icon: MapPin,
    match: (pathname: string) => pathname.startsWith('/account/addresses'),
  },
  {
    href: '/account/settings',
    label: 'Settings',
    icon: Settings,
    match: (pathname: string) => pathname.startsWith('/account/settings'),
  },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const source = session?.user?.name || session?.user?.email || 'Vibio';
  const initials = source.slice(0, 1).toUpperCase();

  return (
    <aside className="surface-shell sticky top-24 h-fit p-4 sm:p-5">
      <div className="surface-panel px-5 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF5E7] text-xl font-semibold text-[#273E1C]">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
              {session?.user?.name || 'Vibio member'}
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
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#6C8349]">Member note</p>
        <p className="mt-3 text-sm leading-7 text-[#4E5948]">
          Keep track of orders, addresses, saved products, and account details in one
          calm member area.
        </p>
      </div>

      <button onClick={() => signOut({ callbackUrl: '/' })} className="mt-4 btn-outline-gold w-full justify-center">
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </aside>
  );
}
