import { CardSkeleton } from '@/components/common/PageSkeleton';

export default function BlogLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="surface-shell p-6 sm:p-7 lg:p-8">
          <div className="mb-8">
            <div className="h-3 w-20 rounded-full skeleton" />
            <div className="mt-3 h-10 w-64 rounded-full skeleton" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
