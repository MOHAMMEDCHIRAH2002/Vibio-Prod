import { HeroSkeleton, GridSkeleton } from '@/components/common/PageSkeleton';

export default function StorefrontLoading() {
  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px] space-y-6">
        <HeroSkeleton />
        <GridSkeleton count={4} />
      </div>
    </div>
  );
}
