import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color?: 'gold' | 'blue' | 'green' | 'purple';
}

const colorMap = {
  gold: {
    accent: 'bg-[#F4E9D8] text-[#8A6430]',
    ring: 'from-[#F4E9D8] to-transparent',
  },
  blue: {
    accent: 'bg-[#E2ECF5] text-[#44637C]',
    ring: 'from-[#E2ECF5] to-transparent',
  },
  green: {
    accent: 'bg-[#E3ECE6] text-[#2E6049]',
    ring: 'from-[#E3ECE6] to-transparent',
  },
  purple: {
    accent: 'bg-[#ECE4F3] text-[#6A4B88]',
    ring: 'from-[#ECE4F3] to-transparent',
  },
};

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'gold',
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="admin-panel p-5 sm:p-6">
      <div
        className={cn(
          'pointer-events-none absolute -right-10 top-[-1.5rem] h-28 w-28 rounded-full bg-gradient-to-b opacity-80 blur-2xl',
          colors.ring,
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-[1.15rem] border border-white/70 shadow-[0_12px_24px_rgba(17,17,17,0.06)]',
            colors.accent,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {change !== undefined && (
          <div
            className={cn(
              'admin-badge',
              change >= 0 ? 'bg-[#E0EEE6] text-[#2A6A45]' : 'bg-[#F7E3DE] text-[#C9571A]',
            )}
          >
            {change >= 0 ? <TrendingUp className="mr-1 h-3.5 w-3.5" /> : <TrendingDown className="mr-1 h-3.5 w-3.5" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="relative mt-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#6B6A63]">
          {title}
        </p>
        <p className="mt-3 font-heading text-[clamp(1.9rem,3vw,2.6rem)] leading-none tracking-[-0.06em] text-[#171C14]">
          {value}
        </p>
      </div>
    </div>
  );
}
