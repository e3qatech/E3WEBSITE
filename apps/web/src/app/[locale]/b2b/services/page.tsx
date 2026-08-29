import React from 'react';
import { Metadata } from 'next';
import { db } from "@/lib/db";
import { getMergedCMSPageContent } from '@/lib/cms-default-pages';
import { getPublicCaseStudies } from '@/lib/case-studies';
import {
  CANONICAL_SERVICE_SLUGS,
  CANONICAL_SERVICES_METADATA,
} from '@/lib/services/canonical-services';
import { ServicesDirectoryClient } from '@/components/b2b/services/ServicesDirectoryClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  
  let page: any = null;
  try {
    page = await db.pages.findUnique({
      where: { slug: 'b2b-services' }
    });
  } catch (e) {
    console.error("Error fetching b2b-services page metadata:", e);
  }

  const cms = getMergedCMSPageContent('b2b-services', page?.content);
  const seo = cms.seo || {};

  const title = isAr 
    ? (seo.metaTitleAr || 'الخدمات والقدرات — إي ثري لقطاع الأعمال') 
    : (seo.metaTitleEn || 'Services & Capabilities — E3 Enterprise Atelier');
    
  const description = isAr 
    ? (seo.metaDescriptionAr || 'خدمات التصميم الفضائي، هندسة الفعاليات، الأنظمة الصوتية والضوئية، والإنتاج الحي في قطر.') 
    : (seo.metaDescriptionEn || 'Turnkey spatial design, event engineering, kinetic AV, live production, and landmark attraction operations in Qatar.');

  return {
    title,
    description,
    openGraph: {
      title: isAr ? (seo.ogTitleAr || title) : (seo.ogTitleEn || title),
      description: isAr ? (seo.ogDescriptionAr || description) : (seo.ogDescriptionEn || description),
      images: seo.ogImage ? [{ url: seo.ogImage }] : []
    },
    alternates: {
      canonical: seo.canonicalUrl || 'https://e3.qa/b2b/services'
    }
  };
}

export default async function ServicesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  let page: any = null;
  let allServices: any[] = [];
  let allCaseStudies: any[] = [];
  
  try {
    const results = await Promise.all([
      db.pages.findUnique({
        where: { slug: 'b2b-services' }
      }).catch(() => null),
      db.service.findMany({
        where: {
          isVisible: true,
          isPublished: true,
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ]
      }).catch(() => []),
      getPublicCaseStudies({
        featuredFirst: true
      }).catch(() => [])
    ]);
    page = results[0];
    allServices = results[1] || [];
    allCaseStudies = results[2] || [];
  } catch (error) {
    console.error("Error fetching b2b services public page data:", error);
  }

  // Ensure all 10 canonical services are present and sorted strictly by canonical sequence
  const canonicalOrder = CANONICAL_SERVICE_SLUGS as readonly string[];
  const canonicalMap = new Map<string, any>();

  // Initialize with canonical service templates
  CANONICAL_SERVICE_SLUGS.forEach((s) => {
    canonicalMap.set(s, {
      id: s,
      slug: s,
      titleEn: CANONICAL_SERVICES_METADATA[s]?.titleEn || s,
      titleAr: CANONICAL_SERVICES_METADATA[s]?.titleAr || s,
      isVisible: true,
      isPublished: true,
    });
  });

  // Deep-merge with database records
  allServices.forEach((dbSvc) => {
    if (canonicalMap.has(dbSvc.slug)) {
      canonicalMap.set(dbSvc.slug, {
        ...canonicalMap.get(dbSvc.slug),
        ...dbSvc,
      });
    }
  });

  const sortedServices = Array.from(canonicalMap.values()).sort((a, b) => {
    const idxA = canonicalOrder.indexOf(a.slug);
    const idxB = canonicalOrder.indexOf(b.slug);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  // Get deep-merged CMS content
  const cms = getMergedCMSPageContent('b2b-services', page?.content);

  return (
    <ServicesDirectoryClient
      services={sortedServices}
      caseStudies={allCaseStudies}
      cmsPage={cms}
      locale={locale}
    />
  );
}
