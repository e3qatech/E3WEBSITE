import { redirect } from 'next/navigation';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === 'ar' ? 'ar' : 'en';
  redirect(`/${validLocale}/login/admin`);
}
