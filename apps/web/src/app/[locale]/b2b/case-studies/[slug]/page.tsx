import { redirect, RedirectType } from 'next/navigation';

export default async function LegacyCaseStudyDetailRedirect({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  redirect(`/${locale}/b2b/cases/${slug}`, RedirectType.replace);
}
