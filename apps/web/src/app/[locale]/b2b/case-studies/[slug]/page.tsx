import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { CaseStudyDetailClient } from '@/components/b2b/CaseStudyDetailClient';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  
  const caseStudy = await db.caseStudy.findUnique({
    where: { slug, isPublished: true },
    select: { titleEn: true, clientName: true, thumbnailUrl: true }
  });

  if (!caseStudy) {
    return { title: 'Not Found' };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${caseStudy.titleEn} | E3 Qatar Case Studies`,
    description: `A technical case study on how we delivered results for ${caseStudy.clientName}.`,
    openGraph: {
      images: caseStudy.thumbnailUrl ? [caseStudy.thumbnailUrl, ...previousImages] : previousImages,
    },
  };
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params;

  // Fetch case study details
  const caseStudy = await db.caseStudy.findUnique({
    where: { slug, isPublished: true },
  });

  if (!caseStudy) {
    notFound();
  }

  // Fetch related case studies (same category, excluding current)
  const relatedCaseStudies = await db.caseStudy.findMany({
    where: {
      isPublished: true,
      category: caseStudy.category,
      id: { not: caseStudy.id }
    },
    take: 3,
    orderBy: { year: 'desc' }
  });

  return (
    <main className="min-h-screen bg-[var(--surface-default)]">
      <CaseStudyDetailClient caseStudy={caseStudy} relatedCaseStudies={relatedCaseStudies} />
    </main>
  );
}
