import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-[#F5F1E7] px-4 py-10">
      <div className="surface-shell w-full max-w-[640px] p-8 text-center sm:p-10">
        <p className="section-eyebrow">Error 404</p>
        <h1 className="mt-3 font-heading text-[clamp(2.4rem,5vw,3.6rem)] leading-[1] tracking-[-0.05em] text-[#1E2519]">
          The page you are looking for has been moved.
        </h1>
        <p className="mt-4 text-[15px] leading-8 text-[#5B6455]">
          It might have been renamed, retired, or never existed. Let us help you find
          your way back to the curated edit.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-gold">
            Return home
          </Link>
          <Link href="/shop" className="btn-outline-gold">
            Browse the shop
          </Link>
        </div>
      </div>
    </section>
  );
}
