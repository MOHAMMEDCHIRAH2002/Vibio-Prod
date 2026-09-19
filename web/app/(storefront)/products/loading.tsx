export default function ProductLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="surface-shell p-6 sm:p-7 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square w-full rounded-[2rem] skeleton" />
            <div className="space-y-5">
              <div className="h-3 w-24 rounded-full skeleton" />
              <div className="h-10 w-3/4 rounded-full skeleton" />
              <div className="h-6 w-28 rounded-full skeleton" />
              <div className="space-y-2">
                {[100, 90, 80, 70, 60].map((w) => (
                  <div key={w} className="h-4 rounded-full skeleton" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="h-12 w-full rounded-full skeleton" />
              <div className="h-12 w-full rounded-full skeleton" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
