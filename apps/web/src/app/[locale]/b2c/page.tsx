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
  } catch (error) {
    console.error("[B2C_PAGE_ATTRACTIONS_FETCH_ERROR]", error);
    attractions = [];
  }

  let dbBrands: any[] = [];
  try {
    dbBrands = await db.brandIP.findMany({
      where: { isActive: true, showOnB2C: true, showInWorldsCreated: true },
      orderBy: { b2cDisplayOrder: 'asc' }
    });
  } catch (error) {
    console.error("[B2C_PAGE_BRANDS_FETCH_ERROR]", error);
  }

  // Inject dynamic brands into CMS data if not hardcoded
  if (cmsData) {
    if (!cmsData.ourBrands) cmsData.ourBrands = {};
    if (dbBrands.length > 0) {
      cmsData.ourBrands.brands = dbBrands.map(b => ({
        id: b.id,
        nameEn: b.b2cTitleOverrideEn || b.nameEn,
        nameAr: b.b2cTitleOverrideAr || b.nameAr,
        logoPrimary: b.primaryLogoUrl,
        logoLight: b.lightLogoUrl,
        logoDark: b.darkLogoUrl,
        logoCompact: b.compactLogoUrl,
        brandColor: "#7e22ce", // Placeholder, add to schema later if needed
        relationship: "OWNED", // Map appropriately
        shortDescEn: b.b2cShortDescOverrideEn || b.shortDescriptionEn,
        shortDescAr: b.b2cShortDescOverrideAr || b.shortDescriptionAr,
        detailCopyEn: b.b2cDetailCopyEn || b.fullStoryEn,
        detailCopyAr: b.b2cDetailCopyAr || b.fullStoryAr,
        primaryMediaUrl: b.primaryMediaUrl,
        ctaUrl: b.b2cCtaUrl || `/b2c/brands/${b.slug}`
      }));
    }
  }

  return (
    <AttractionsClient 
      locale={locale} 
      cmsData={cmsData} 
      initialAttractions={attractions as any}
    />
  );
}
