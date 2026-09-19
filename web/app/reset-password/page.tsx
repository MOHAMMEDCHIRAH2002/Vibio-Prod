'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { authApi } from '@/lib/api';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type Form = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FCE9E2]">
          <AlertCircle className="h-8 w-8 text-[#C9571A]" />
        </div>
        <h1 className="mt-6 font-heading text-[clamp(2rem,4vw,3rem)] leading-[0.96] tracking-[-0.06em] text-[#1A2017]">
          Invalid link
        </h1>
        <p className="mx-auto mt-4 max-w-[26rem] text-sm leading-8 text-[#63695F]">
          This password reset link is invalid or missing. Please request a new one.
        </p>
        <Link href="/forgot-password" className="btn-gold mt-8 inline-flex w-full justify-center">
          Request new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF5E7]">
          <CheckCircle2 className="h-8 w-8 text-[#389C49]" />
        </div>
        <h1 className="mt-6 font-heading text-[clamp(2rem,4vw,3rem)] leading-[0.96] tracking-[-0.06em] text-[#1A2017]">
          Password updated.
        </h1>
        <p className="mx-auto mt-4 max-w-[26rem] text-sm leading-8 text-[#63695F]">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
        <Link href="/login" className="btn-gold mt-8 inline-flex w-full justify-center">
          Sign in
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await authApi.resetPassword(token, data.password);
      setDone(true);
    } catch (err: any) {
      toast.error(err?.message || 'This link has expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#DDE8D3] bg-white/72 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-[#389C49]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#69785B]">
            New password
          </span>
        </div>

        <h1 className="mt-6 font-heading text-[clamp(2.5rem,5vw,3.8rem)] leading-[0.96] tracking-[-0.07em] text-[#1A2017]">
          Choose a new password.
        </h1>
        <p className="mx-auto mt-4 max-w-[28rem] text-sm leading-8 text-[#63695F]">
          Your new password must be at least 8 characters long.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A8466]">
            New password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              className="input-luxury !bg-white/86 !pr-12"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A8077] transition-colors hover:text-[#273E1C]"
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-xs text-[#C9571A]">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A8466]">
            Confirm new password
          </label>
          <input
            {...register('confirm')}
            type={showPw ? 'text' : 'password'}
            placeholder="Repeat password"
            className="input-luxury !bg-white/86"
          />
          {errors.confirm && (
            <p className="mt-2 text-xs text-[#C9571A]">{errors.confirm.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold mt-1 w-full justify-center disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Set new password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
            <Suspense fallback={<div className="h-64 animate-pulse rounded-[20px] bg-[#F0EDE5]" />}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
