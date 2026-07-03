import React from 'react'
import Link from 'next/link'
import { ArrowRight, Settings2 } from 'lucide-react'
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

      {/* Services List */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {services.map((service, i) => {
              const processList = Array.isArray(service.process) ? service.process : []
              return (
                <div key={service.id} className="group relative p-8 md:p-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 transition-all flex flex-col h-full">
                  <div className="mb-8 p-4 bg-zinc-950 inline-flex rounded-lg border border-zinc-800 text-emerald-400">
                    <Settings2 className="w-8 h-8" />
                  </div>
                  
                  <h2 className="text-3xl font-black text-zinc-100 mb-4 tracking-tight group-hover:text-emerald-400 transition-colors">
                    {service.titleEn}
                  </h2>
                  
                  <p className="text-lg text-zinc-400 mb-8 max-w-md">
                    {service.taglineEn || service.contentEn?.slice(0, 150) + "..."}
                  </p>
                  
                  <div className="mt-auto">
                    {processList.length > 0 && (
                      <>
                        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wide mb-4">Core Capabilities</h4>
                        <ul className="space-y-3 mb-10">
                          {processList.slice(0, 4).map((feature: any, j) => (
                            <li key={j} className="flex items-center gap-3 text-zinc-300 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {feature.titleEn || feature.title}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    
                    <Link 
                      href={`/b2b/services/${service.slug}`}
                      className="inline-flex items-center gap-2 text-zinc-100 font-bold hover:text-emerald-400 transition-colors"
                    >
                      Explore Discipline <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
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
