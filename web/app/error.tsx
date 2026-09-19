'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-[#F5F1E7] px-4 py-10">
      <div className="surface-shell w-full max-w-[640px] p-8 text-center sm:p-10">
        <p className="section-eyebrow">Something unexpected</p>
        <h1 className="mt-3 font-heading text-[clamp(2.2rem,4.6vw,3.2rem)] leading-[1] tracking-[-0.05em] text-[#1E2519]">
          We could not load this page.
        </h1>
        <p className="mt-4 text-[15px] leading-8 text-[#5B6455]">
          A brief issue prevented the content from rendering. Try again, or return
          home to continue browsing.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-gold">
            Try again
          </button>
          <Link href="/" className="btn-outline-gold">
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
