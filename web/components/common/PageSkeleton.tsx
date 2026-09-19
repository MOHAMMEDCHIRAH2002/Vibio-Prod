export function RowSkeleton({ rows = 3, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 rounded-full skeleton" style={{ width: `${75 - i * 10}%` }} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card-luxury overflow-hidden p-4">
      <div className="aspect-[0.95] rounded-[28px] skeleton" />
      <div className="mt-5 space-y-3">
        <div className="h-3 w-20 rounded-full skeleton" />
        <div className="h-6 w-3/4 rounded-full skeleton" />
        <div className="h-4 w-full rounded-full skeleton" />
        <div className="mt-4 flex items-center justify-between">
          <div className="h-5 w-20 rounded-full skeleton" />
          <div className="h-9 w-24 rounded-full skeleton" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="h-[55vh] min-h-[400px] w-full rounded-[2rem] skeleton" />
  );
}

export function AdminTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="surface-shell overflow-hidden rounded-2xl">
      <div className="border-b border-[#EEE8DC] p-5">
        <div className="h-5 w-40 rounded-full skeleton" />
      </div>
      <div className="divide-y divide-[#EEE8DC]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="h-4 w-8 rounded-full skeleton" />
            <div className="h-4 flex-1 rounded-full skeleton" />
            <div className="h-4 w-24 rounded-full skeleton" />
            <div className="h-4 w-20 rounded-full skeleton" />
            <div className="h-8 w-16 rounded-full skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
