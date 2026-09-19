'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { wishlistApi } from '@/lib/api';
import ProductGrid from '@/components/shop/ProductGrid';

export default function WishlistPage() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/wishlist');
    }
  }, [status, router]);

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.get,
    enabled: status === 'authenticated' && !!session?.accessToken,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const products = Array.isArray(wishlist) ? wishlist.map((item: any) => item.product) : [];

  return (
    <div className="min-h-screen bg-primary-bg pt-28">
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px] space-y-6">
          <div className="surface-shell p-6 sm:p-7 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <div className="lux-pill w-fit px-4 py-2">
                  <Heart className="h-3.5 w-3.5" />
                  {t('wishlist.savedSelections')}
                </div>
                <h1 className="mt-7 max-w-[10ch] font-heading text-[clamp(3rem,6vw,5rem)] leading-[0.92] tracking-[-0.06em] text-[#1E2519]">
                  {t('wishlist.title')}
                </h1>
                <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#5B6455] sm:text-[16px]">
                  {t('wishlist.subtitle')}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: `${products.length}`, label: products.length === 1 ? t('wishlist.savedProduct') : t('wishlist.savedProducts') },
                  { value: t('wishlist.easy'), label: t('wishlist.revisitFlow') },
                  { value: t('wishlist.curated'), label: t('wishlist.shortlist') },
                ].map((item) => (
                  <div key={item.label} className="surface-panel px-5 py-5">
                    <p className="font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#1E2519] ltr-nums">
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

          <div className="surface-shell p-6 sm:p-7 lg:p-8">
            {isLoading ? (
              <ProductGrid isLoading count={8} />
            ) : products.length === 0 ? (
              <div className="surface-panel py-24 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                  <Heart className="h-7 w-7" />
                </div>
                <h2 className="mt-6 font-heading text-[2.3rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                  {t('wishlist.empty')}
                </h2>
                <p className="mt-4 text-sm text-[#5B6455]">
                  {t('wishlist.emptyDesc')}
                </p>
                <Link href="/shop" className="btn-gold mt-6">
                  {t('wishlist.exploreCollection')}
                </Link>
              </div>
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
