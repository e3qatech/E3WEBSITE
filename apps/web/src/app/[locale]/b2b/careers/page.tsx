import React from 'react'
import Link from 'next/link'
import { db } from "@/lib/db"
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { Card } from '@/components/ui/Card'
import { ArrowRight, ArrowUpRight, MapPin, Briefcase } from 'lucide-react'

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
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {mediaUrl && (
          <div className="absolute inset-0 z-0">
            <UniversalMediaRenderer src={mediaUrl} type={mediaType} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
          </div>
        )}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job: any, idx: number) => (
            <Card 
              key={idx} 
              className="group relative bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 hover:border-zinc-700/80 hover:bg-zinc-800/40 transition-all duration-300 overflow-hidden flex flex-col p-6 h-full"
            >
              {/* Subtle gradient background effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/0 via-zinc-800/0 to-zinc-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex-grow space-y-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-950/50 px-3 py-1 rounded-full">
                    {job.department}
                  </span>
                  <span className="text-xs font-medium text-zinc-500">
                    {job.type}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white group-hover:text-zinc-100 transition-colors">
                  {isAr ? job.titleAr : job.titleEn}
                </h3>
                
                <div className="flex items-center text-zinc-400 text-sm mt-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  {job.location}
                </div>
              </div>
              
              <div className="relative z-10 mt-8 pt-6 border-t border-zinc-800/50 flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                  {isAr ? "تقديم الطلب" : "Apply Now"}
                </span>
                <Link 
                  href={job.applicationLink || "#"} 
                  target={job.applicationLink?.startsWith('http') ? "_blank" : "_self"}
                  className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                >
                  {isAr ? <ArrowUpRight className="w-5 h-5 rtl:-scale-x-100" /> : <ArrowUpRight className="w-5 h-5" />}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
      
    </div>
  )
}
