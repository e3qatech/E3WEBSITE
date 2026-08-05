import React from 'react';
import { LoginShell } from '@/components/auth/LoginShell';

export default async function StaffLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === 'ar' ? 'ar' : 'en';

  return <LoginShell portalKey="staff" locale={validLocale} />;
}
