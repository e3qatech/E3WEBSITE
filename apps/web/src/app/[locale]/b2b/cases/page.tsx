import React from 'react'
import { db } from "@/lib/db"
import { getMergedCMSPageContent } from "@/lib/cms-default-pages"
import { CaseStudiesIndexClient } from '@/components/b2b/CaseStudiesIndexClient'
import { Metadata } from 'next'

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

  const canonicalUrl = `https://e3.qa/${locale}/b2b/cases`;

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

export const dynamic = 'force-dynamic'

export default async function CaseStudiesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  let caseStudies: any[] = []
  let services: any[] = []
  let employeeProfiles: any[] = []
  let pageData: any = null
  
  try {
    const results = await Promise.all([
      db.caseStudy.findMany({
        where: { isPublished: true },
        orderBy: [
          { isFeatured: 'desc' },
          { year: 'desc' }
        ],
        include: {
          teamMembers: {
            include: {
              employeeProfile: true
            }
          },
          attraction: true
        }
      }),
      db.pages.findUnique({
        where: { slug: 'b2b-cases' }
      }),
      db.service.findMany({
        orderBy: { titleEn: 'asc' },
        select: { id: true, slug: true, titleEn: true, titleAr: true, icon: true }
      }),
      db.employeeProfile.findMany({
        orderBy: { firstName: 'asc' },
        select: { id: true, firstName: true, lastName: true, designation: true, profileImage: true, department: true }
      })
    ])
    caseStudies = results[0]
    pageData = results[1]
    services = results[2]
    employeeProfiles = results[3]
  } catch (error) {
    console.error("Error fetching b2b case studies page data:", error)
  }

  const cmsContent = getMergedCMSPageContent('b2b-cases', pageData?.content)

  return (
    <CaseStudiesIndexClient 
      caseStudies={caseStudies}
      services={services}
      employeeProfiles={employeeProfiles}
      cmsContent={cmsContent}
      locale={locale}
    />
  )
}
