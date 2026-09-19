import AccountSidebar from '@/components/account/AccountSidebar';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-primary-bg pt-28">
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px] space-y-6">
          <div className="surface-shell p-6 sm:p-7 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <p className="section-eyebrow">Client account</p>
                <h1 className="max-w-[9ch] font-heading text-[clamp(3rem,6vw,5rem)] leading-[0.92] tracking-[-0.06em] text-[#1E2519]">
                  Your Vibio member space.
                </h1>
                <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#5B6455] sm:text-[16px]">
                  Orders, addresses, profile settings, and saved selections are now
                  organized inside the same premium visual system as the storefront.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: 'Secure', label: 'account area' },
                  { value: 'Tracked', label: 'orders' },
                  { value: 'Saved', label: 'preferences' },
                ].map((item) => (
                  <div key={item.label} className="surface-panel px-5 py-5">
                    <p className="font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[#68725F]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
            <AccountSidebar />
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
