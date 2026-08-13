import React from 'react'
import { db } from "@/lib/db"
import { CaseStudiesIndexClient } from '@/components/b2b/CaseStudiesIndexClient'

export const metadata = {
  title: 'Case Studies & Featured Work — E3 Enterprise',
  description: 'Explore our portfolio of mega events, immersive installations, and landmark entertainment destinations delivered across Qatar and the Middle East.',
}

export const dynamic = 'force-dynamic'

export default async function CaseStudiesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  
  let caseStudies: any[] = []
  let pageData: any = null
  
  try {
    const results = await Promise.all([
      db.caseStudy.findMany({
        where: { isPublished: true },
        orderBy: [
          { isFeatured: 'desc' },
          { year: 'desc' }
        ]
      }),
      db.pages.findUnique({
        where: { slug: 'b2b-cases' }
      })
    ])
    caseStudies = results[0]
    pageData = results[1]
  } catch (error) {
    console.error("Error fetching b2b case studies:", error)
  }

  const content = pageData?.content as any || {}
  
  const hero = {
    title: isAr 
      ? (content.hero?.titleAr || content.hero?.title || 'أعمال ومشاريع استثنائية تم تنفيذها') 
      : (content.hero?.titleEn || content.hero?.title || "Featured Landmark Case Studies."),
    subtitle: isAr 
      ? (content.hero?.subtitleAr || content.hero?.subtitle || 'مجموعة مختارة من المشاريع الوطنية والترفيهية البارزة التي توضح قدرة إي ثري على الهندسة والتصنيع والتشغيل الشامل.') 
      : (content.hero?.subtitleEn || content.hero?.subtitle || "A selection of landmark national ceremonies, summits, and mega entertainment builds demonstrating E3 turnkey execution."),
    mediaType: content.hero?.mediaType || "IMAGE",
    mediaUrl: content.hero?.mediaUrl || ""
  }
  
  const cta = content?.cta ? {
    title: isAr ? (content.cta.titleAr || content.cta.title || 'هل لديك مشروع في قطر؟') : (content.cta.titleEn || content.cta.title || 'Ready to Engineer Your Next Landmark?'),
    description: isAr ? (content.cta.descriptionAr || content.cta.description || 'تواصل مع فريق الأعمال لتحديد حزمة الخدمات المناسبة.') : (content.cta.descriptionEn || content.cta.description || 'Tell us about your project vision. Our team will engineer the ideal solution.'),
    primaryCta: isAr ? (content.cta.primaryCtaAr || content.cta.primaryCta || 'اتصل بنا الان') : (content.cta.primaryCtaEn || content.cta.primaryCta || 'Request a Proposal'),
    primaryLink: content.cta.primaryLink || `/${locale}/b2b/contact`,
    mediaType: content.cta.mediaType || "IMAGE",
    mediaUrl: content.cta.mediaUrl || ""
  } : null;

  return (
    <CaseStudiesIndexClient 
      caseStudies={caseStudies}
      heroData={hero}
      ctaData={cta}
      locale={locale}
    />
  )
}
