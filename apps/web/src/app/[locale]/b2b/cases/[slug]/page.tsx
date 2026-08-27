import { redirect, RedirectType } from 'next/navigation';

export default async function LegacyCaseDetailRedirect({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  redirect(`/${locale}/b2b/case-studies/${slug}`, RedirectType.replace);
}
