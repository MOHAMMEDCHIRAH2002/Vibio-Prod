'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Gift, Heart, MapPin, Package, Settings, Sparkles } from 'lucide-react';
import { loyaltyApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const { data: loyalty } = useQuery({
    queryKey: ['loyalty', 'me'],
    queryFn: loyaltyApi.me,
    enabled: !!session,
    staleTime: 60 * 1000,
  });
  if (status === 'unauthenticated') redirect('/login');

  const firstName = session?.user?.name?.split(' ')[0] || 'there';
  const quickLinks = [
    { href: '/account/orders', title: t('account.myOrders'), desc: t('account.trackPurchases'), icon: Package },
    { href: '/account/loyalty', title: t('loyalty.balanceLabel'), desc: t('loyalty.viewHistory'), icon: Gift },
    { href: '/wishlist', title: t('wishlist.title'), desc: t('wishlist.emptyDesc'), icon: Heart },
    { href: '/account/addresses', title: t('account.addresses'), desc: t('account.addressesDescription'), icon: MapPin },
    { href: '/account/settings', title: t('account.settings'), desc: t('account.settingsDescription'), icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="surface-shell p-6 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <div className="lux-pill w-fit px-4 py-2">
              <Sparkles className="h-3.5 w-3.5" />
              {t('account.welcomeBack')}
            </div>
            <h2 className="mt-7 font-heading text-[clamp(2.5rem,4vw,4rem)] leading-[0.96] tracking-[-0.05em] text-[#1E2519]">
              {t('account.welcome', { name: firstName })}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-8 text-[#5B6455]">
              {t('account.accountSubtitle')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { value: t('account.orders'), label: t('account.trackingReady') },
              { value: t('wishlist.title'), label: t('account.savedEdit') },
              { value: t('account.details'), label: t('account.upToDate') },
            ].map((item) => (
              <div key={item.label} className="surface-panel px-5 py-5">
                <p className="font-heading text-[1.75rem] leading-none tracking-[-0.05em] text-[#1E2519]">
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

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map(({ href, title, desc, icon: Icon }) => (
            <Link key={href} href={href} className="card-luxury p-5 transition-transform duration-300 hover:-translate-y-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="mt-5 font-heading text-[1.7rem] leading-[1.02] tracking-[-0.05em] text-[#1E2519]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#5B6455]">{desc}</p>
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          {/* Loyalty points balance */}
          <div className="relative overflow-hidden rounded-[28px] border border-[#2C4A1E] bg-[#1E3514] p-6 shadow-[0_22px_60px_rgba(23,42,15,0.28)]">
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#D8B36A]/20 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#D8B36A]">
                <Gift className="h-3.5 w-3.5" />
                {t('loyalty.balanceLabel')}
              </div>
              <p className="mt-3 font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-none tracking-[-0.05em] text-[#FBF7EE]">
                {(loyalty?.points ?? 0).toLocaleString()}
                <span className="ml-2 text-base font-normal text-[#9FB08C]">{t('loyalty.pointsWord')}</span>
              </p>
              <p className="mt-2 text-sm text-[#CBD6BE]">
                {t('loyalty.worth', { amount: formatPrice(loyalty?.value ?? 0) })}
              </p>
              <Link
                href="/account/loyalty"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FBF7EE] px-5 py-2.5 text-sm font-semibold text-[#1E3514] transition-colors hover:bg-white"
              >
                {t('loyalty.viewHistory')}
              </Link>
            </div>
          </div>

          <div className="surface-olive p-6">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#6C8349]">
              {t('account.note')}
            </p>
            <h3 className="mt-3 font-heading text-[2rem] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
              {t('account.nextOrder')}
            </h3>
            <p className="mt-4 text-sm leading-7 text-[#4E5948]">
              {t('account.noteDescription')}
            </p>
          </div>

          <div className="surface-panel p-6">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#78805F]">{t('account.profile')}</p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
              {session?.user?.name || t('account.member')}
            </p>
            <p className="mt-2 text-sm text-[#5B6455]">{session?.user?.email}</p>
            <Link href="/account/settings" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#273E1C]">
              {t('account.updateDetails')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
