import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'تعيين كلمة المرور الجديدة | إي ثري قطر' : 'Reset Password | E3 Qatar',
    description: isAr
      ? 'إنشاء وتعيين كلمة المرور الجديدة لحسابك في إي ثري قطر'
      : 'Set a new secure password for your E3 Qatar account',
  };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === 'ar' ? 'ar' : 'en';

  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 text-white">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm locale={validLocale} />
    </Suspense>
  );
}
