import { GridSkeleton } from '@/components/common/PageSkeleton';

export default function ShopLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="surface-shell p-6 sm:p-7 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="h-8 w-48 rounded-full skeleton" />
            <div className="h-10 w-36 rounded-full skeleton" />
          </div>
          <GridSkeleton count={12} />
        </div>
      </div>
    </div>
  );
}
