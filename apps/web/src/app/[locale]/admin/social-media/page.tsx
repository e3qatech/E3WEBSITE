import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SocialMediaAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const targetLocale = locale === 'ar' ? 'ar' : 'en';
  redirect(`/${targetLocale}/dashboard/social-media`);
}
