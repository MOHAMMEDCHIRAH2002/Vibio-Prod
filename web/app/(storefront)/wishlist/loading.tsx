import { GridSkeleton } from '@/components/common/PageSkeleton';

export default function WishlistLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="surface-shell p-6 sm:p-7 lg:p-8">
          <div className="mb-6 h-8 w-36 rounded-full skeleton" />
          <GridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}
