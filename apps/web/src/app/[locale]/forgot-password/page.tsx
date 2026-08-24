import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'استعادة كلمة المرور | إي ثري قطر' : 'Forgot Password | E3 Qatar',
    description: isAr
      ? 'استعادة وتعيين كلمة المرور لحسابك في إي ثري قطر'
      : 'Recover and reset your account password for E3 Qatar portals',
  };
}

export default async function ForgotPasswordPage({
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
      <ForgotPasswordForm locale={validLocale} />
    </Suspense>
  );
}
