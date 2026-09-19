export default function CheckoutLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="surface-shell p-6 sm:p-7 lg:p-8">
          <div className="h-8 w-40 rounded-full skeleton" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <div className="card-luxury space-y-4 p-6">
                <div className="h-5 w-36 rounded-full skeleton" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 w-full rounded-2xl skeleton" />
                ))}
              </div>
              <div className="card-luxury space-y-4 p-6">
                <div className="h-5 w-36 rounded-full skeleton" />
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-10 w-full rounded-2xl skeleton" />
                ))}
              </div>
            </div>
            <div className="card-luxury space-y-4 p-6">
              <div className="h-5 w-28 rounded-full skeleton" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-14 w-14 rounded-xl skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded-full skeleton" />
                    <div className="h-3 w-1/2 rounded-full skeleton" />
                  </div>
                </div>
              ))}
              <div className="h-12 w-full rounded-full skeleton" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
