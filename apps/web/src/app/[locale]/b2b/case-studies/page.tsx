import { db } from '@/lib/db';
import { CaseStudiesClient } from '@/components/b2b/CaseStudiesClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Studies & Track Record | E3 Qatar',
  description: 'Explore our portfolio of successful projects across corporate, government, and entertainment sectors.',
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CaseStudiesPage({ params }: Props) {
  // Fetch all published case studies directly from DB since it's a Server Component
  const caseStudies = await db.caseStudy.findMany({
    where: { isPublished: true },
    orderBy: [
      { isFeatured: 'desc' },
      { year: 'desc' },
      { createdAt: 'desc' }
    ],
    select: {
      id: true,
      slug: true,
      titleEn: true,
      clientName: true,
      year: true,
      category: true,
      thumbnailUrl: true,
      heroImageUrl: true,
      isFeatured: true,
      metrics: true,
    }
  });

  return (
    <main className="min-h-screen bg-[var(--surface-default)]">
      <CaseStudiesClient initialCaseStudies={caseStudies} />
    </main>
  );
}
