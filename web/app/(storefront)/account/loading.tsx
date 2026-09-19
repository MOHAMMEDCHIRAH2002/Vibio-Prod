import { RowSkeleton } from '@/components/common/PageSkeleton';

export default function AccountLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="surface-shell p-6 sm:p-7 lg:p-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full skeleton" />
            <div className="space-y-2">
              <div className="h-5 w-36 rounded-full skeleton" />
              <div className="h-3 w-48 rounded-full skeleton" />
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-luxury p-6">
                <div className="h-4 w-24 rounded-full skeleton" />
                <RowSkeleton rows={3} className="mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
