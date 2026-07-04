import React from 'react'
import Link from 'next/link'
import { db } from "@/lib/db"
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { CareerListings } from '@/components/careers/CareerListings'

export const dynamic = 'force-dynamic'

export default async function B2BCareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar'

  const pageData = await db.pages.findUnique({
    where: { slug: 'b2b-careers' }
  })

  const content = pageData?.content as any || {}

  const heroTitle = isAr ? (content?.hero?.titleAr || "انضم لفريقنا") : (content?.hero?.titleEn || "Join Our Team");
  const heroSubtitle = isAr ? (content?.hero?.subtitleAr || "اصنع مستقبل الترفيه معنا.") : (content?.hero?.subtitleEn || "Build the future of entertainment with us.");
  const mediaType = content?.hero?.mediaType || "IMAGE";
  const mediaUrl = content?.hero?.mediaUrl || "";

  const bgMediaType = content?.background?.mediaType || "IMAGE";
  const bgMediaUrl = content?.background?.mediaUrl || "";

  const footerMediaType = content?.footer?.mediaType || "IMAGE";
  const footerMediaUrl = content?.footer?.mediaUrl || "";

  const jobs = Array.isArray(content.jobs) && content.jobs.length > 0 ? content.jobs : [
    {
      titleEn: "Senior Full Stack Engineer",
      titleAr: "مهندس برمجيات أول",
      department: "Engineering",
      location: "Doha, Qatar",
      type: "Full-time",
      applicationLink: "mailto:careers@e3.qa"
    },
    {
      titleEn: "Event Operations Manager",
      titleAr: "مدير عمليات الفعاليات",
      department: "Operations",
      location: "Doha, Qatar",
      type: "Full-time",
      applicationLink: "mailto:careers@e3.qa"
    }
  ]

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20 relative" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Background Media */}
      {bgMediaUrl && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <UniversalMediaRenderer src={bgMediaUrl} type={bgMediaType} className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-zinc-950/50" />
        </div>
      )}

      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden z-10">
        {mediaUrl && (
          <div className="absolute inset-0 z-0">
            <UniversalMediaRenderer src={mediaUrl} type={mediaType} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
          </div>
        )}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight uppercase mb-6 drop-shadow-lg">
            {heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto drop-shadow-md font-light">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Open Roles Grid */}
      <section className="py-24 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-12 flex items-center justify-between border-b border-zinc-800 pb-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {isAr ? "الوظائف المتاحة" : "Open Roles"}
          </h2>
          <span className="text-zinc-500 font-medium">{jobs.length} {isAr ? "وظيفة" : "Positions"}</span>
        </div>

        <CareerListings jobs={jobs} isAr={isAr} portal="B2B" />
      </section>

      {/* Footer Media */}
      {footerMediaUrl && (
        <section className="relative w-full h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden z-10 mt-12">
          <UniversalMediaRenderer src={footerMediaUrl} type={footerMediaType} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        </section>
      )}
      
    </div>
  )
}
