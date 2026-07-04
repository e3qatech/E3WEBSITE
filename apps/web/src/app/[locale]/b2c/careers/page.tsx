import React from 'react'
import { db } from "@/lib/db"
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { CareerListings } from '@/components/careers/CareerListings'

export const dynamic = 'force-dynamic'

export default async function B2CCareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar'

  // Fetching from the same shared careers payload
  const pageData = await db.pages.findUnique({
    where: { slug: 'b2b-careers' }
  })

  const content = pageData?.content as any || {}

  const heroTitle = isAr ? (content?.hero?.titleAr || "انضم لفريقنا") : (content?.hero?.titleEn || "Join Our Team");
  const heroSubtitle = isAr ? (content?.hero?.subtitleAr || "اصنع مستقبل الترفيه معنا.") : (content?.hero?.subtitleEn || "Build the future of entertainment with us.");
  const mediaType = content?.hero?.mediaType || "IMAGE";
  const mediaUrl = content?.hero?.mediaUrl || "";

  const jobs = Array.isArray(content.jobs) && content.jobs.length > 0 ? content.jobs : []

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {mediaUrl && (
          <div className="absolute inset-0 z-0">
            <UniversalMediaRenderer src={mediaUrl} type={mediaType} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20" />
          </div>
        )}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 drop-shadow-lg">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto drop-shadow-md">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Open Roles Grid */}
      <section className="py-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-12 flex items-center justify-between border-b border-zinc-800 pb-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {isAr ? "استكشف الفرص المتاحة" : "Explore Opportunities"}
          </h2>
          <span className="text-zinc-500 font-medium">{jobs.length} {isAr ? "وظيفة" : "Positions"}</span>
        </div>

        <CareerListings jobs={jobs} isAr={isAr} portal="B2C" />
      </section>
      
    </div>
  )
}
