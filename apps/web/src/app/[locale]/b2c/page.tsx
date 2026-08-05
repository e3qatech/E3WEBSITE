import { Metadata } from 'next';
import db from '@/lib/db';
import { AttractionsClient } from './AttractionsClient';

export const metadata: Metadata = {
  title: 'Experiences | E3',
};

export const dynamic = 'force-dynamic';

// Next.js App Router server component
export default async function AttractionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  let cmsPage: any = null;
  let attractions: any[] = [];

  try {
    // Fetch CMS settings
    cmsPage = await db.pages.findUnique({
      where: { slug: "b2c-landing" }
    });

    // Fetch published attractions to seed the client store (better SEO and initial load)
    // Include gallery and pricing for the cards
    attractions = await db.attraction.findMany({
      where: { isPublished: true },
      include: {
        gallery: {
          orderBy: { orderIndex: 'asc' },
          take: 1
        },
        pricing: {
          take: 1
        }
      },
      take: 50
    });
  } catch (error) {
    console.error("[DB ERROR] AttractionsPage query failed:", error);
  }

  const cmsData = cmsPage?.content || {};

  return (
    <AttractionsClient 
      locale={locale} 
      cmsData={cmsData as any} 
      initialAttractions={attractions as any}
    />
  );
}
