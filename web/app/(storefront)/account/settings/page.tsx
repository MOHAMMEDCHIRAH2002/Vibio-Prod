'use client';

import { useEffect, useMemo, useState } from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bell, Lock, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { accountApi } from '@/lib/api';
import { useTranslation } from 'react-i18next';

type ProfileForm = { name: string; phone?: string };
type PasswordForm = { currentPassword: string; newPassword: string; confirmPassword: string };

export default function SettingsPage() {
  const { t } = useTranslation();
  const profileSchema = useMemo(
    () => z.object({
      name: z.string().min(2, t('account.nameTooShort')),
      phone: z.string().optional(),
    }),
    [t],
  );
  const passwordSchema = useMemo(
    () => z.object({
      currentPassword: z.string().min(1, t('account.passwordRequired')),
      newPassword: z.string().min(8, t('account.passwordLength')),
      confirmPassword: z.string(),
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: t('account.passwordMismatch'),
      path: ['confirmPassword'],
    }),
    [t],
  );
  const { data: session, status, update } = useSession();
  if (status === 'unauthenticated') redirect('/login');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['account-profile'],
    queryFn: accountApi.getProfile,
    enabled: status === 'authenticated',
    staleTime: 0,
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    whatsapp: false,
  });

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || '',
      phone: '',
    },
  });

  useEffect(() => {
    if (!profile) return;
    resetProfile({
      name: profile.name || '',
      phone: profile.phone || '',
    });
  }, [profile, resetProfile]);

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) => accountApi.updateProfile(data),
    onSuccess: async (updatedProfile) => {
      resetProfile({
        name: updatedProfile.name || '',
        phone: updatedProfile.phone || '',
      });
      await update({
        name: updatedProfile.name,
        phone: updatedProfile.phone,
      });
      toast.success(t('account.profileUpdated'));
    },
    onError: () => toast.error(t('account.profileUpdateFailed')),
  });

  const passwordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: PasswordForm) =>
      accountApi.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      resetPassword();
      toast.success(t('account.passwordChanged'));
    },
    onError: (error: any) => {
      const message = Array.isArray(error?.message)
        ? error.message.join(', ')
        : error?.message || t('account.passwordChangeFailed');
      toast.error(message);
    },
  });

  const fieldClass = 'field-luxury';

  return (
    <div className="space-y-6">
      <div className="surface-shell p-6 sm:p-7">
        <div className="border-b border-[#ECE6D9] pb-5">
          <p className="section-eyebrow">{t('account.settings')}</p>
          <h2 className="font-heading text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
            {t('account.settingsTitle')}
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
                  {t('account.profileInformation')}
                </p>
              </div>
            </div>

            <form onSubmit={handleProfile((data) => profileMutation.mutate(data))} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                    {t('account.fullName')}
                  </label>
                  <input {...regProfile('name')} className={fieldClass} />
                  {profileErrors.name && <p className="mt-2 text-xs text-[#C9571A]">{profileErrors.name.message}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                    {t('account.email')}
                  </label>
                  <input value={session?.user?.email || profile?.email || ''} type="email" readOnly className={`${fieldClass} cursor-not-allowed opacity-70`} />
                  <p className="mt-2 text-xs text-[#78805F]">{t('account.emailReadonly')}</p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                  {t('account.phone')}
                </label>
                <input {...regProfile('phone')} type="tel" placeholder="+212 6 00 00 00 00" className={fieldClass} />
              </div>

              <button type="submit" disabled={profileLoading || profileMutation.isPending} className="btn-gold disabled:opacity-50">
                {profileMutation.isPending ? t('account.saving') : t('account.saveChanges')}
              </button>
            </form>
          </div>

          <div className="surface-panel p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
                <Lock className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
                {t('account.password')}
              </p>
            </div>

            <form onSubmit={handlePassword((data) => passwordMutation.mutate(data))} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                  {t('account.currentPassword')}
                </label>
                <input {...regPassword('currentPassword')} type="password" className={fieldClass} />
                {passwordErrors.currentPassword && (
                  <p className="mt-2 text-xs text-[#C9571A]">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                    {t('account.newPassword')}
                  </label>
                  <input {...regPassword('newPassword')} type="password" className={fieldClass} />
                  {passwordErrors.newPassword && (
                    <p className="mt-2 text-xs text-[#C9571A]">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                    {t('account.confirmPassword')}
                  </label>
                  <input {...regPassword('confirmPassword')} type="password" className={fieldClass} />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-2 text-xs text-[#C9571A]">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <button type="submit" disabled={passwordMutation.isPending} className="btn-gold disabled:opacity-50">
                {passwordMutation.isPending ? t('account.updating') : t('account.updatePassword')}
              </button>
            </form>
          </div>

          {/* <div className="surface-panel p-6">
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
          </div> */}

          <div className="rounded-[28px] border border-[#E9D6CC] bg-[#FCE9E2] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[#C9571A]">
                <Shield className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#A6461A]">
                {t('account.dangerZone')}
              </p>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#A6461A]">
              {t('account.deleteDescription')}
            </p>

            <button
              onClick={() => toast.error(t('account.deleteContact'))}
              className="mt-5 rounded-full border border-[#DAB9AA] px-5 py-2 text-sm font-semibold text-[#C9571A] transition-colors hover:bg-white/70"
            >
              {t('account.deleteAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
