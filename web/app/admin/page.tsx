'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, DollarSign, ShoppingCart, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { statsApi } from '@/lib/api';
import OrdersDonut from '@/components/admin/OrdersDonut';
import RevenueChart from '@/components/admin/RevenueChart';
import StatCard from '@/components/admin/StatCard';
import TopProductsBar from '@/components/admin/TopProductsBar';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { data: overview } = useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: statsApi.overview,
    refetchInterval: 60000,
  });

  const { data: revenue } = useQuery({
    queryKey: ['stats', 'revenue'],
    queryFn: () => statsApi.revenue('30d'),
  });

  const { data: topProducts } = useQuery({
    queryKey: ['stats', 'top-products'],
    queryFn: statsApi.topProducts,
  });

  const { data: ordersByStatus } = useQuery({
    queryKey: ['stats', 'orders-by-status'],
    queryFn: statsApi.ordersByStatus,
  });

  const ov = overview as any;

  return (
    <div className="admin-page">
      <section className="admin-panel p-6 sm:p-8 lg:p-10">
        <div className="absolute right-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-[#273E1C]/8 blur-[90px]" />
        <div className="absolute bottom-[-5rem] left-[22%] h-32 w-32 rounded-full bg-[#90C038]/10 blur-[80px]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="admin-eyebrow">{t('admin.controlRoom')}</p>
            <h1 className="admin-heading mt-5 max-w-[16ch]">
              {t('admin.heroTitle')}
            </h1>
            <p className="admin-subcopy mt-5 max-w-2xl">
              {t('admin.heroSubtitle')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="admin-panel-soft p-5">
              <div className="admin-chip w-fit">{t('admin.dailyCadence')}</div>
              <p className="mt-4 font-heading text-[2rem] leading-none tracking-[-0.06em] text-[#171C14]">
                {t('admin.monitor')}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#59574F]">
                {t('admin.monitorText')}
              </p>
            </div>
            <div className="admin-panel-soft p-5">
              <div className="flex items-center justify-between">
                <div className="admin-chip w-fit">{t('admin.brandPulse')}</div>
                <ArrowUpRight className="h-4 w-4 text-[#6C8349]" />
              </div>
              <p className="mt-4 font-heading text-[2rem] leading-none tracking-[-0.06em] text-[#171C14]">
                {t('admin.curate')}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#59574F]">
                {t('admin.curateText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t('admin.stats.totalRevenue')}
          value={ov ? `${Number(ov.revenue?.current || 0).toFixed(2)} MAD` : '-'}
          change={ov?.revenue?.change}
          icon={DollarSign}
          color="gold"
        />
        <StatCard
          title={t('admin.stats.orders')}
          value={ov?.orders?.current ?? '-'}
          change={ov?.orders?.change}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title={t('admin.stats.newCustomers')}
          value={ov?.customers?.current ?? '-'}
          change={ov?.customers?.change}
          icon={Users}
          color="green"
        />
        <StatCard
          title={t('admin.stats.avgOrder')}
          value={
            ov && ov.orders?.current > 0
              ? `${(ov.revenue?.current / ov.orders?.current).toFixed(2)} MAD`
              : '-'
          }
          icon={TrendingUp}
          color="purple"
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_0.82fr]">
        <div className="admin-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="admin-eyebrow">{t('admin.revenueRhythm')}</p>
              <h2 className="mt-3 font-heading text-[2.1rem] leading-none tracking-[-0.06em] text-[#171C14]">
                {t('admin.last30')}
              </h2>
            </div>
            <div className="admin-chip">
              <Sparkles className="h-3.5 w-3.5" />
              {t('admin.commercialOverview')}
            </div>
          </div>
          <div className="mt-6">
            <RevenueChart data={(revenue as any) || []} />
          </div>
        </div>

        <div className="admin-panel p-5 sm:p-6">
          <p className="admin-eyebrow">{t('admin.orderMix')}</p>
          <h2 className="mt-3 font-heading text-[2.1rem] leading-none tracking-[-0.06em] text-[#171C14]">
            {t('admin.statusDistribution')}
          </h2>
          <div className="mt-6">
            <OrdersDonut data={(ordersByStatus as any) || []} />
          </div>
        </div>
      </section>

      <section className="admin-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="admin-eyebrow">{t('admin.performanceEdit')}</p>
            <h2 className="mt-3 font-heading text-[2.1rem] leading-none tracking-[-0.06em] text-[#171C14]">
              {t('admin.topProducts')}
            </h2>
          </div>
          <div className="admin-chip">{t('admin.commercialLeaders')}</div>
        </div>
        <div className="mt-6">
          <TopProductsBar data={(topProducts as any) || []} />
        </div>
      </section>
    </div>
  );
}
