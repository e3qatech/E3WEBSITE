import React from 'react'
import { db } from "@/lib/db"
import { getMergedCMSPageContent } from "@/lib/cms-default-pages"
import { CaseStudiesIndexClient } from '@/components/b2b/CaseStudiesIndexClient'
import { Metadata } from 'next'
import { getPublicCaseStudies, enrichCaseStudyWithDefaults } from '@/lib/case-studies'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const pageData = await db.pages.findUnique({ where: { slug: 'b2b-cases' } }).catch(() => null);
  const cms = getMergedCMSPageContent('b2b-cases', pageData?.content);

  const title = isAr 
    ? (cms.seo?.metaTitleAr || cms.hero?.titleAr || "سجل الإنجازات والمشاريع — E3")
    : (cms.seo?.metaTitleEn || cms.hero?.titleEn || "Case Studies & Landmark Projects — E3 Enterprise");
    
  const description = isAr 
    ? (cms.seo?.metaDescriptionAr || cms.hero?.subtitleAr || "")
    : (cms.seo?.metaDescriptionEn || cms.hero?.subtitleEn || "");

  const canonicalUrl = `https://e3.qa/${locale}/b2b/case-studies`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: isAr ? (cms.seo?.ogTitleAr || title) : (cms.seo?.ogTitleEn || title),
      description: isAr ? (cms.seo?.ogDescriptionAr || description) : (cms.seo?.ogDescriptionEn || description),
      url: canonicalUrl,
      images: cms.seo?.ogImage ? [{ url: cms.seo.ogImage }] : [],
    }
  };
}

export default async function CaseStudiesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  let caseStudies: any[] = []
  let services: any[] = []
  let employeeProfiles: any[] = []
  let pageData: any = null
  
  try {
    const [pageRes, servicesRes, teamRes] = await Promise.allSettled([
      db.pages.findUnique({
        where: { slug: 'b2b-cases' }
      }),
      db.service.findMany({
        orderBy: { titleEn: 'asc' },
        select: { id: true, slug: true, titleEn: true, titleAr: true, thumbnail: true }
      }),
      db.employeeProfile.findMany({
        orderBy: { firstName: 'asc' },
        select: { id: true, firstName: true, lastName: true, designation: true, profileImage: true, department: true }
      })
    ])

    if (pageRes.status === 'fulfilled') {
      pageData = pageRes.value || null
    }
    if (servicesRes.status === 'fulfilled') {
      services = servicesRes.value || []
    }
    if (teamRes.status === 'fulfilled') {
      employeeProfiles = teamRes.value || []
    }
  } catch (error) {
    console.error("Error fetching b2b case studies page data:", error)
  }

  const cmsContent = getMergedCMSPageContent('b2b-cases', pageData?.content)
  const selectedIds = Array.isArray(cmsContent?.featuredCases?.selectedCaseStudyIds)
    ? cmsContent.featuredCases.selectedCaseStudyIds.map(String)
    : []

  // Fetch all case studies using unified canonical resolver
  try {
    caseStudies = await getPublicCaseStudies({
      includeTeam: true,
      includeAttraction: true,
      featuredFirst: true,
    });
  } catch (err) {
    console.error("Error loading case studies:", err);
    caseStudies = [];
  }

  const selectedSet = new Set(selectedIds)

  const mappedCaseStudies = (caseStudies || []).map((cs: any) => {
    const isSelected = selectedSet.has(String(cs.id)) || selectedSet.has(String(cs.slug))
    return {
      id: String(cs.id),
      slug: String(cs.slug),
      titleEn: cs.titleEn || '',
      titleAr: cs.titleAr || cs.titleEn || '',
      clientName: cs.clientName || '',
      year: typeof cs.year === 'number' ? cs.year : (cs.year ? Number(cs.year) : undefined),
      category: cs.category || '',
      isFeatured: isSelected || Boolean(cs.isFeatured),
      isPublished: true,
      isVisible: true,
      isHidden: false,
      status: 'PUBLISHED',
      heroImageUrl: cs.heroImageUrl || '',
      thumbnailUrl: cs.thumbnailUrl || '',
      heroMediaType: cs.heroMediaType || 'IMAGE',
      thumbnailMediaType: cs.thumbnailMediaType || 'IMAGE',
      clientLogoUrl: cs.clientLogoUrl || '',
      challengeEn: cs.challengeEn || '',
      challengeAr: cs.challengeAr || '',
      solutionEn: cs.solutionEn || '',
      solutionAr: cs.solutionAr || '',
      resultEn: cs.resultEn || '',
      resultAr: cs.resultAr || '',
      metrics: cs.metrics || [],
      gallery: cs.gallery || [],
      beforeAfter: cs.beforeAfter || null,
      testimonials: cs.testimonials || [],
      seo: cs.seo || null,
      technicalSpecs: cs.technicalSpecs || [],
      servicesUsed: cs.servicesUsed || [],
      teamMembers: cs.teamMembers || [],
      attraction: cs.attraction || null,
    }
  })

  return (
    <CaseStudiesIndexClient 
      caseStudies={mappedCaseStudies}
      services={services}
      employeeProfiles={employeeProfiles}
      cmsContent={cmsContent}
      locale={locale}
    />
  )
}
