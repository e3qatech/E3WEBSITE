import { redirect, RedirectType } from 'next/navigation';

export default async function LegacyCasesRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/b2b/case-studies`, RedirectType.replace);
}
