'use client';

import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type Variant = 'solid' | 'outline' | 'pill' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  solid:
    'bg-[#214915] text-white shadow-[0_16px_38px_rgba(33,73,21,0.22)] hover:-translate-y-0.5 hover:bg-[#18370F]',
  outline:
    'border border-[#D8C7AD] bg-white/80 text-[#273E1C] hover:border-[#C9A96E] hover:bg-[#FBF7EE]',
  pill: 'border border-[#ddd8cf] bg-white/72 text-[#273E1C] hover:border-[#c9b99a] hover:bg-[#f7f5f0]',
  ghost:
    'text-[#273E1C] underline decoration-transparent underline-offset-4 hover:decoration-[#D1B987]',
};

export default function VisitStoreCTA({
  variant = 'solid',
  className,
  withIcon = true,
  showArrow = false,
}: {
  variant?: Variant;
  className?: string;
  withIcon?: boolean;
  showArrow?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Link
      href="/store"
      className={cn(
        'group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] focus-visible:ring-offset-2 active:scale-[0.98]',
        VARIANTS[variant],
        className,
      )}
    >
      {withIcon && <MapPin className="h-4 w-4 shrink-0" />}
      <span>{t('common.visitStore')}</span>
      {showArrow && (
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl-flip" />
      )}
    </Link>
  );
}
