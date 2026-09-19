'use client';

import { useState } from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bell, Lock, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { accountApi } from '@/lib/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  if (status === 'unauthenticated') redirect('/login');

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    whatsapp: false,
  });

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      phone: '',
    },
  });

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) => accountApi.updateProfile(data),
    onSuccess: async (_, data) => {
      await update({ name: data.name });
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordForm) => accountApi.changePassword(data),
    onSuccess: () => {
      resetPassword();
      toast.success('Password changed');
    },
    onError: () => toast.error('Current password is incorrect'),
  });

  const fieldClass = 'field-luxury';

  return (
    <div className="space-y-6">
      <div className="surface-shell p-6 sm:p-7">
        <div className="border-b border-[#ECE6D9] pb-5">
          <p className="section-eyebrow">Settings</p>
          <h2 className="font-heading text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
            Keep your account details aligned.
          </h2>
        </div>

        <div className="mt-6 space-y-6">
          <div className="surface-panel p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
                  Profile information
                </p>
              </div>
            </div>

            <form onSubmit={handleProfile((data) => profileMutation.mutate(data))} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                    Full name
                  </label>
                  <input {...regProfile('name')} className={fieldClass} />
                  {profileErrors.name && <p className="mt-2 text-xs text-[#C9571A]">{profileErrors.name.message}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                    Email
                  </label>
                  <input {...regProfile('email')} type="email" className={fieldClass} />
                  {profileErrors.email && <p className="mt-2 text-xs text-[#C9571A]">{profileErrors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                  Phone
                </label>
                <input {...regProfile('phone')} type="tel" placeholder="+212 6 00 00 00 00" className={fieldClass} />
              </div>

              <button type="submit" disabled={profileMutation.isPending} className="btn-gold disabled:opacity-50">
                {profileMutation.isPending ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>

          <div className="surface-panel p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                <Lock className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
                Password
              </p>
            </div>

            <form onSubmit={handlePassword((data) => passwordMutation.mutate(data))} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                  Current password
                </label>
                <input {...regPassword('currentPassword')} type="password" className={fieldClass} />
                {passwordErrors.currentPassword && (
                  <p className="mt-2 text-xs text-[#C9571A]">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                    New password
                  </label>
                  <input {...regPassword('newPassword')} type="password" className={fieldClass} />
                  {passwordErrors.newPassword && (
                    <p className="mt-2 text-xs text-[#C9571A]">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                    Confirm password
                  </label>
                  <input {...regPassword('confirmPassword')} type="password" className={fieldClass} />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-2 text-xs text-[#C9571A]">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <button type="submit" disabled={passwordMutation.isPending} className="btn-gold disabled:opacity-50">
                {passwordMutation.isPending ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </div>

          <div className="surface-panel p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                <Bell className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
                Notifications
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {[
                { key: 'orderUpdates', label: 'Order updates', desc: 'Shipping and delivery notifications' },
                { key: 'promotions', label: 'Promotions', desc: 'Exclusive deals and limited offers' },
                { key: 'newsletter', label: 'Newsletter', desc: 'New collections and brand stories' },
                { key: 'whatsapp', label: 'WhatsApp', desc: 'Receive updates via WhatsApp' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4 rounded-[22px] bg-white/70 px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1E2519]">
                      {label}
                    </p>
                    <p className="mt-1 text-sm text-[#5B6455]">{desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((current) => ({ ...current, [key]: !current[key as keyof typeof current] }))
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      notifications[key as keyof typeof notifications] ? 'bg-[#273E1C]' : 'bg-[#D9D4CA]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        notifications[key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E9D6CC] bg-[#FCE9E2] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[#C9571A]">
                <Shield className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#A6461A]">
                Danger zone
              </p>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#A6461A]">
              Deleting your account is permanent and removes orders, wishlist items, and
              saved personal data from the storefront.
            </p>

            <button
              onClick={() => toast.error('Please contact support to delete your account.')}
              className="mt-5 rounded-full border border-[#DAB9AA] px-5 py-2 text-sm font-semibold text-[#C9571A] transition-colors hover:bg-white/70"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
