import { Metadata } from 'next';
import db from '@/lib/db';
import { getCMSPageContentServer } from '@/lib/cms-server';
import { AttractionsClient } from './AttractionsClient';

export const metadata: Metadata = {
  title: 'Experiences | E3',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Next.js App Router server component
export default async function AttractionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const cmsData = await getCMSPageContentServer("b2c-landing");

  // Fetch published attractions to seed the client store
  let attractions: any[] = [];
  try {
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
  } catch (_e) {
    attractions = [];
  }

  return (
    <AttractionsClient 
      locale={locale} 
      cmsData={cmsData} 
      initialAttractions={attractions as any}
    />
  );
}
