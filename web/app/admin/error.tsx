'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-[#F5F1E7] px-4 py-10">
      <div className="surface-shell w-full max-w-[560px] p-8 text-center sm:p-10">
        <p className="section-eyebrow">Admin console</p>
        <h1 className="mt-3 font-heading text-[2rem] leading-[1] tracking-[-0.05em] text-[#1E2519]">
          This panel failed to load.
        </h1>
        <p className="mt-4 text-[15px] leading-8 text-[#5B6455]">
          Check the console for details and try again. If the issue persists,
          reauthenticate from the dashboard.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-gold">
            Retry
          </button>
          <Link href="/admin" className="btn-outline-gold">
            Admin home
          </Link>
        </div>
      </div>
    </section>
  );
}
