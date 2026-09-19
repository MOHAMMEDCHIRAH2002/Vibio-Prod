'use client';

import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Gift, ArrowUpRight, ArrowDownLeft, RotateCcw } from 'lucide-react';
import { loyaltyApi, type LoyaltyTransaction } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

const TYPE_META: Record<
  LoyaltyTransaction['type'],
  { icon: typeof Gift; tone: string; badge: string }
> = {
  EARN: { icon: ArrowUpRight, tone: 'text-[#2F6A37]', badge: 'bg-[#EFF5E7] text-[#2F6A37]' },
  REDEEM: { icon: ArrowDownLeft, tone: 'text-[#B9894B]', badge: 'bg-[#F6EEDD] text-[#8A6420]' },
  REVERSE: { icon: RotateCcw, tone: 'text-[#C9571A]', badge: 'bg-[#FCE9E2] text-[#C9571A]' },
};

export default function LoyaltyPage() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const { data: loyalty, isLoading } = useQuery({
    queryKey: ['loyalty', 'me'],
    queryFn: loyaltyApi.me,
    enabled: !!session,
    staleTime: 60 * 1000,
  });
  if (status === 'unauthenticated') redirect('/login');

  const cfg = loyalty?.config;

  return (
    <div className="space-y-6">
      {/* Balance */}
      <div className="relative overflow-hidden rounded-[28px] border border-[#2C4A1E] bg-[#1E3514] p-6 shadow-[0_22px_60px_rgba(23,42,15,0.28)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-[#D8B36A]/20 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#D8B36A]">
              <Gift className="h-3.5 w-3.5" />
              {t('loyalty.balanceLabel')}
            </div>
            <p className="mt-3 font-heading text-[clamp(2.8rem,6vw,4.2rem)] leading-none tracking-[-0.05em] text-[#FBF7EE]">
              {(loyalty?.points ?? 0).toLocaleString()}
              <span className="ml-2 text-lg font-normal text-[#9FB08C]">{t('loyalty.pointsWord')}</span>
            </p>
            <p className="mt-2 text-sm text-[#CBD6BE]">
              {t('loyalty.worth', { amount: formatPrice(loyalty?.value ?? 0) })}
            </p>
          </div>
          {cfg && (
            <div className="rounded-[22px] border border-white/12 bg-white/[0.06] p-5 text-sm text-[#EDEFE6] backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#9FB08C]">
                {t('loyalty.howLabel')}
              </p>
              <p className="mt-2 leading-7">
                {t('loyalty.ruleEarn', { points: cfg.pointsPerMad })}
                <br />
                {t('loyalty.ruleRedeem', { points: cfg.redeemStep, amount: cfg.redeemStepValue })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="surface-shell p-6 sm:p-7">
        <p className="section-eyebrow">{t('loyalty.historyEyebrow')}</p>
        <h2 className="font-heading text-[2rem] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
          {t('loyalty.historyTitle')}
        </h2>

        {isLoading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-[20px] skeleton" />
            ))}
          </div>
        ) : !loyalty?.transactions?.length ? (
          <p className="mt-6 text-sm leading-7 text-[#5B6455]">{t('loyalty.historyEmpty')}</p>
        ) : (
          <div className="mt-6 divide-y divide-[#ECE6D9]">
            {loyalty.transactions.map((txn) => {
              const meta = TYPE_META[txn.type];
              const Icon = meta.icon;
              const positive = txn.points > 0;
              return (
                <div key={txn.id} className="flex items-center gap-4 py-4">
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${meta.badge}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1E2519]">{txn.reason}</p>
                    <p className="mt-0.5 text-xs text-[#8A8577]">
                      {new Date(txn.createdAt).toLocaleDateString()}
                      {txn.orderNumber ? ` · ${txn.orderNumber}` : ''}
                    </p>
                  </div>
                  <p className={`ltr-nums text-sm font-semibold ${meta.tone}`}>
                    {positive ? '+' : ''}
                    {txn.points.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
