import { AdminTableSkeleton } from '@/components/common/PageSkeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-shell rounded-2xl p-5">
            <div className="h-3 w-20 rounded-full skeleton" />
            <div className="mt-3 h-8 w-32 rounded-full skeleton" />
            <div className="mt-2 h-3 w-24 rounded-full skeleton" />
          </div>
        ))}
      </div>
      <AdminTableSkeleton rows={8} />
    </div>
  );
}
