'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import BrandLogo from '@/components/common/BrandLogo';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type Form = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    const res = await signIn('credentials', { ...data, redirect: false });
    setLoading(false);

    if (res?.ok) {
      router.push(redirect);
      toast.success('Welcome back to Vibio.');
      return;
    }

    toast.error('Invalid email or password');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F1E7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-[-5rem] top-[-4rem] h-[14rem] w-[14rem] rounded-full bg-[#E5EFD8] blur-[90px]" />
      <div className="pointer-events-none absolute bottom-[-6rem] right-[-4rem] h-[16rem] w-[16rem] rounded-full bg-[#EEE4D7] blur-[100px]" />

      <div className="mx-auto flex max-w-[1540px] justify-center">
        <div className="w-full max-w-[31rem]">
          <div className="mb-6 flex justify-center">
            <Link href="/" className="surface-shell flex items-center px-5 py-4">
              <BrandLogo className="h-10 w-36" sizes="144px" priority />
            </Link>
          </div>

          <div className="surface-shell px-6 py-8 sm:px-8 sm:py-10">
            <div className="text-center">
              <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#DDE8D3] bg-white/72 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#389C49]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#69785B]">
                  Sign in
                </span>
              </div>

              <h1 className="mt-6 font-heading text-[clamp(2.5rem,5vw,4rem)] leading-[0.96] tracking-[-0.07em] text-[#1A2017]">
                Welcome back.
              </h1>
              <p className="mx-auto mt-4 max-w-[28rem] text-sm leading-8 text-[#63695F] sm:text-[0.95rem]">
                Access your Vibio account with the same calm, premium experience as the storefront.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A8466]">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="hello@example.com"
                  className="input-luxury !bg-white/86"
                />
                {errors.email && <p className="mt-2 text-xs text-[#C9571A]">{errors.email.message}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A8466]">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[11px] font-semibold text-[#5B7A4A] transition-colors hover:text-[#273E1C]">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-luxury !bg-white/86 !pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A8077] transition-colors hover:text-[#273E1C]"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-xs text-[#C9571A]">{errors.password.message}</p>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-gold mt-1 w-full justify-center disabled:opacity-60">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#DDD9CC]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9B978E]">
                or
              </span>
              <div className="h-px flex-1 bg-[#DDD9CC]" />
            </div>

            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: redirect })}
              className="btn-outline-gold w-full justify-center !bg-white/82"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="mt-8 border-t border-[#E7E1D6] pt-6 text-center text-sm text-[#757A71]">
              <p>
                New to Vibio?{' '}
                <Link href="/register" className="font-semibold text-[#273E1C] transition-colors hover:text-[#389C49]">
                  Create an account
                </Link>
              </p>
              <p className="mt-3">
                <Link href="/" className="text-[#7A8468] transition-colors hover:text-[#273E1C]">
                  Return to store
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F1E7]" />}>
      <LoginForm />
    </Suspense>
  );
}
