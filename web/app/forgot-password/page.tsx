'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { authApi } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
            {sent ? (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF5E7]">
                  <CheckCircle2 className="h-8 w-8 text-[#389C49]" />
                </div>
                <h1 className="mt-6 font-heading text-[clamp(2rem,4vw,3rem)] leading-[0.96] tracking-[-0.06em] text-[#1A2017]">
                  Check your inbox.
                </h1>
                <p className="mx-auto mt-4 max-w-[26rem] text-sm leading-8 text-[#63695F]">
                  If an account exists for that email, you&apos;ll receive a password reset link within a few minutes. Check your spam folder if you don&apos;t see it.
                </p>
                <Link
                  href="/login"
                  className="btn-gold mt-8 inline-flex w-full justify-center"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#DDE8D3] bg-white/72 px-4 py-2">
                    <span className="h-2 w-2 rounded-full bg-[#389C49]" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#69785B]">
                      Password reset
                    </span>
                  </div>

                  <h1 className="mt-6 font-heading text-[clamp(2.5rem,5vw,3.8rem)] leading-[0.96] tracking-[-0.07em] text-[#1A2017]">
                    Forgot your password?
                  </h1>
                  <p className="mx-auto mt-4 max-w-[28rem] text-sm leading-8 text-[#63695F]">
                    Enter the email associated with your account and we&ll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                  <div>
                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A8466]">
                      Email address
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="hello@example.com"
                      className="input-luxury !bg-white/86"
                      autoFocus
                    />
                    {errors.email && (
                      <p className="mt-2 text-xs text-[#C9571A]">{errors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gold mt-1 w-full justify-center disabled:opacity-60"
                  >
                    {loading ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>

                <div className="mt-8 border-t border-[#E7E1D6] pt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#5B7A4A] transition-colors hover:text-[#273E1C]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
