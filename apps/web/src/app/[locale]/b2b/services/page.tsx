import React from 'react'
import Link from 'next/link'
import { ArrowRight, Settings2, Sparkles } from 'lucide-react'
import { db } from "@/lib/db"
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'

export const metadata = {
  title: 'Services & Capabilities - E3 Corporate',
  description: 'Comprehensive event engineering, live production, immersive tech, and attractions management by E3.',
}

export const dynamic = 'force-dynamic'

export default async function ServicesIndexPage() {
  
  const page = await db.pages.findUnique({
    where: { slug: 'b2b-services' }
  })
  
  const content = (page?.content as any) || {}
  
  const hero = content.hero || {
    title: "Everything Required to Build the Extraordinary.",
    subtitle: "We don't outsource the hard parts. E3 retains in-house expertise across creative, engineering, fabrication, and operations to ensure flawless delivery.",
    mediaType: "IMAGE",
    mediaUrl: ""
  }
  
  const cta = content.cta || {
    title: "Ready to start a project?",
    description: "Let's build something extraordinary together.",
    primaryCta: "Contact Us",
    primaryLink: "/b2b/contact"
  }

  const services = await db.service.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20">
      
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center py-20 md:py-32 border-b border-zinc-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {hero.mediaUrl ? (
            <UniversalMediaRenderer 
              type={hero.mediaType || "IMAGE"} 
              src={hero.mediaUrl}
              alt="Services Hero Background"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          )}
          {hero.mediaUrl && <div className="absolute inset-0 bg-zinc-950/80" />}
          {hero.mediaUrl && <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />}
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-zinc-100 tracking-tight mb-6 max-w-4xl">
            {hero.title}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl font-medium">
            {hero.subtitle}
          </p>
        </div>
      </section>

      {/* Services Bento Grid */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[350px]">
            {services.map((service, i) => {
              // Bento layout pattern for 3 columns
              const getBentoClasses = (index: number) => {
                const j = index % 7;
                switch (j) {
                  case 0: return "md:col-span-2 md:row-span-2"; // Large square
                  case 1: return "md:col-span-1 md:row-span-1"; // Small square
                  case 2: return "md:col-span-1 md:row-span-1"; // Small square
                  case 3: return "md:col-span-2 md:row-span-1"; // Wide rectangle
                  case 4: return "md:col-span-1 md:row-span-2"; // Tall rectangle
                  case 5: return "md:col-span-1 md:row-span-1"; // Small square
                  case 6: return "md:col-span-1 md:row-span-1"; // Small square
                  default: return "md:col-span-1 md:row-span-1";
                }
              }

              return (
                <Link 
                  key={service.id} 
                  href={`/b2b/services/${service.slug}`}
                  className={`group relative flex flex-col rounded-3xl bg-zinc-900 border border-zinc-800/50 overflow-hidden shadow-sm hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-500 ${getBentoClasses(i)}`}
                >
                  {/* Media Background */}
                  <div className="absolute inset-0 z-0">
                    {/* Default Media (Thumbnail) */}
                    <div className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-0">
                      {service.thumbnail ? (
                        <UniversalMediaRenderer 
                          type="IMAGE" 
                          src={service.thumbnail}
                          alt={service.titleEn}
                          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-700">
                          <Sparkles className="w-12 h-12" />
                        </div>
                      )}
                    </div>

                    {/* Hover Media (Video/3D/Iframe/Image) */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      {(service.heroMediaType && service.heroMediaUrl) ? (
                        <UniversalMediaRenderer 
                          type={service.heroMediaType as any}
                          src={service.heroMediaUrl}
                          alt={service.titleEn}
                          className="w-full h-full object-cover"
                        />
                      ) : service.thumbnail ? (
                        <UniversalMediaRenderer 
                          type="IMAGE" 
                          src={service.thumbnail}
                          alt={service.titleEn}
                          className="w-full h-full object-cover opacity-90 scale-105 transition-transform duration-1000"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-emerald-900/50 text-indigo-400">
                          <Sparkles className="w-12 h-12 animate-pulse" />
                        </div>
                      )}
                    </div>
                    
                    {/* Gradient Overlays for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 to-transparent z-10" />
                  </div>
                  
                  {/* Content overlay */}
                  <div className="relative z-20 p-6 md:p-8 flex flex-col justify-end h-full w-full">
                    
                    {/* Status / Category */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-indigo-400 bg-zinc-950/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-zinc-800">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{service.category || 'Core Capability'}</span>
                      </div>
                      
                      <div className="w-10 h-10 rounded-full bg-zinc-950/50 backdrop-blur-sm text-indigo-400 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 border border-zinc-800">
                        <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 tracking-tight group-hover:text-indigo-300 transition-colors">
                      {service.titleEn}
                    </h2>
                    <p className="text-zinc-300 mb-6 max-w-xl line-clamp-2 text-sm md:text-base font-medium">
                      {service.taglineEn || service.contentEn?.slice(0, 150) + "..."}
                    </p>

                    {/* Footer / Metrics */}
                    <div className="mt-auto pt-5 border-t border-zinc-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                          {service.successMetricLabel || 'Key Success Metric'}
                        </p>
                        <p className="text-base font-bold text-zinc-200">
                          {service.successMetricValue || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          
          {services.length === 0 && (
            <div className="text-center py-20 border border-zinc-800 rounded-xl bg-zinc-900/20">
              <p className="text-zinc-500 font-medium text-lg">Services list is being updated.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 border-t border-zinc-900 bg-zinc-950 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight mb-6">
            {cta.title}
          </h2>
          <p className="text-lg text-zinc-400 mb-10">
            {cta.description}
          </p>
          <Link 
            href={cta.primaryLink || "/b2b/contact"}
            className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 text-zinc-950 font-bold text-lg rounded-sm hover:bg-emerald-400 transition-colors"
          >
            {cta.primaryCta}
          </Link>
        </div>
      </section>
      
    </div>
  )
}
