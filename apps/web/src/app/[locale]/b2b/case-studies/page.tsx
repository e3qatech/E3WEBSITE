import { redirect, RedirectType } from 'next/navigation';

export default async function LegacyCaseStudiesRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/b2b/cases`, RedirectType.replace);
}
