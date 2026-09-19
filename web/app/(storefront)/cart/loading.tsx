export default function CartLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="surface-shell p-6 sm:p-7 lg:p-8">
          <div className="h-8 w-32 rounded-full skeleton" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-luxury flex gap-4 p-4">
                  <div className="h-24 w-24 rounded-2xl skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded-full skeleton" />
                    <div className="h-3 w-1/2 rounded-full skeleton" />
                    <div className="h-5 w-20 rounded-full skeleton" />
                  </div>
                </div>
              ))}
            </div>
            <div className="card-luxury space-y-4 p-6">
              <div className="h-5 w-32 rounded-full skeleton" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-24 rounded-full skeleton" />
                    <div className="h-4 w-16 rounded-full skeleton" />
                  </div>
                ))}
              </div>
              <div className="h-12 w-full rounded-full skeleton" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
