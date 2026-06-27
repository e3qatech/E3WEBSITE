import { Metadata } from 'next';
import db from '@/lib/db';
import { AttractionsClient } from './AttractionsClient';

export const metadata: Metadata = {
  title: 'Experiences | E3',
};

// Next.js App Router server component
export default async function AttractionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Fetch CMS settings
  const cmsSetting = await db.setting.findUnique({
    where: { key: "B2C_LANDING_PAGE" }
  });
  
  const cmsData = cmsSetting?.value || {};

  // Fetch published attractions to seed the client store (better SEO and initial load)
  // Include gallery and pricing for the cards
  const attractions = await db.attraction.findMany({
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

  return (
    <AttractionsClient 
      locale={locale} 
      cmsData={cmsData as any} 
      initialAttractions={attractions as any}
    />
  );
}
