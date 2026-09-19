'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    // Legacy backend-driven Google redirect (kept for compatibility).
    // NextAuth's GoogleProvider is the canonical sign-in flow; if this page
    // is hit directly we send the user through it, which triggers the JWT
    // callback exchange and returns to home.
    signIn('google', { callbackUrl: '/' });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F1E7] px-4">
      <div className="surface-shell px-8 py-10 text-center">
        <p className="section-eyebrow">One moment</p>
        <h1 className="mt-3 font-heading text-[2rem] leading-[1] tracking-[-0.04em] text-[#1E2519]">
          Signing you in…
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-7 text-[#5B6455]">
          Finalising your Vibio session. You will be redirected shortly.
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackInner />
    </Suspense>
  );
}
