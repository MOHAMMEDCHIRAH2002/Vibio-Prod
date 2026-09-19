'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await authApi.register({ name: data.name, email: data.email, password: data.password });
      const res = await signIn('credentials', { email: data.email, password: data.password, redirect: false });
      if (res?.ok) {
        router.push('/');
        toast.success('Welcome to Vibio!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-heading text-3xl text-accent-gold tracking-widest">VIBIO</Link>
          <h1 className="font-heading text-2xl text-text-dark mt-6 mb-2">Create Account</h1>
          <p className="text-text-muted text-sm">Join the Vibio luxury circle</p>
        </div>

        <div className="bg-white rounded-xl shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-text-dark mb-1.5 block">Full Name</label>
              <input {...register('name')} placeholder="Sophie Laurent" className="w-full border border-[#E8DFD0] rounded-sm px-4 py-3 focus:outline-none focus:border-accent-gold transition-colors" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-text-dark mb-1.5 block">Email</label>
              <input {...register('email')} type="email" placeholder="hello@example.com" className="w-full border border-[#E8DFD0] rounded-sm px-4 py-3 focus:outline-none focus:border-accent-gold transition-colors" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-text-dark mb-1.5 block">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" className="w-full border border-[#E8DFD0] rounded-sm px-4 py-3 pr-11 focus:outline-none focus:border-accent-gold transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-text-dark mb-1.5 block">Confirm Password</label>
              <input {...register('confirmPassword')} type="password" placeholder="Repeat password" className="w-full border border-[#E8DFD0] rounded-sm px-4 py-3 focus:outline-none focus:border-accent-gold transition-colors" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full btn-gold disabled:opacity-60">
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-gold hover:text-[#b8904d] font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
