export default function ProductCardSkeleton() {
  return (
    <div className="card-luxury overflow-hidden">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-7 w-20 rounded-full skeleton" />
          <div className="h-10 w-10 rounded-full skeleton" />
        </div>
        <div className="aspect-[0.95] rounded-[28px] skeleton" />
        <div className="mt-5 space-y-3">
          <div className="h-3 w-24 rounded-full skeleton" />
          <div className="h-6 w-3/4 rounded-full skeleton" />
          <div className="h-4 w-full rounded-full skeleton" />
          <div className="h-4 w-2/3 rounded-full skeleton" />
          <div className="flex items-center justify-between pt-2">
            <div className="h-5 w-24 rounded-full skeleton" />
            <div className="h-9 w-28 rounded-full skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}
