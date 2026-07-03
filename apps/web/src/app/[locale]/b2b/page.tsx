import React from 'react'
import Link from 'next/link'
import { E3Image as Image } from '@/lib/images'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { ArrowRight, CheckCircle2, ChevronRight, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import db from '@/lib/db'

export default async function B2BHomePage() {
  // Fetch real data from the CMS
  const page = await db.pages.findUnique({
    where: { slug: 'b2b-home' }
  })
  
  const content = (page?.content as any) || {}
  const hero = content?.hero || {
    title: "Ideas to Life",
    subtitle: "We design, build, operate, and scale immersive entertainment experiences across Qatar.",
    description: "From creative concepts to crowd flow, fabrication, ticketing, staffing, and live operations.",
    primaryCta: "Explore Services",
    primaryLink: "/b2b/services",
    secondaryCta: "Start a Project",
    secondaryLink: "/b2b/contact"
  }
  const stats = content?.stats || [
    { value: '50+', label: 'Years Combined Experience' },
    { value: '9+', label: 'Core Specializations' },
    { value: '100%', label: 'Qatari Owned' },
    { value: '3+', label: 'Regional Markets' },
  ]
  const wowAndHow = content?.wowAndHow || {
    title: "The WOW & The HOW",
    description: "Creative ideas need operational engineering. We don't just design experiences—we build, staff, operate, and monitor them.",
    wowBullets: ['Creative concepts', 'Immersive entertainment', 'Themed environments', 'Storytelling'],
    howBullets: ['Feasibility & Safety', 'Fabrication & Staging', 'Crowd flow & Staffing', 'Live Operations & Ticketing']
  }

  // Fetch Featured Services
  const dbServices = await db.service.findMany({
    where: { isVisible: true, isFeatured: true },
    orderBy: { createdAt: 'desc' },
    take: 4
  })

  // Fetch Featured Projects (Case Studies)
  const dbProjects = await db.caseStudy.findMany({
    where: { isPublished: true, isFeatured: true },
    orderBy: { year: 'desc' },
    take: 3
  })

  const partners = ['Visit Qatar', 'Qatar Tourism', 'Qatar Calendar', 'UDC', 'QNCC', 'Doha Festival City']

  return (
    <div className="flex flex-col w-full">
      
      {/* 1. Hero: Ideas to Life */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <UniversalMediaRenderer 
            type="IMAGE" 
            src="/hero-b2b.jpg" // Placeholder for hero image
            alt="Hero Background"
          />
          {/* Gradients to ensure text readability without purple/blue */}
          <div className="absolute inset-0 bg-zinc-950/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-transparent to-zinc-950" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8 pt-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-zinc-100 tracking-tighter leading-[1.1] mb-6">
              {hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 font-medium max-w-2xl mb-4">
              {hero.subtitle}
            </p>
            <p className="text-lg text-zinc-400 max-w-2xl mb-10">
              {hero.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              {hero.primaryCta && (
                <Link 
                  href={hero.primaryLink || "#"} 
                  className="px-8 py-4 bg-emerald-500 text-zinc-950 font-bold text-lg rounded-sm hover:bg-emerald-400 transition-colors"
                >
                  {hero.primaryCta}
                </Link>
              )}
              {hero.secondaryCta && (
                <Link 
                  href={hero.secondaryLink || "#"} 
                  className="px-8 py-4 bg-transparent border-2 border-zinc-700 text-zinc-100 font-bold text-lg rounded-sm hover:border-zinc-500 hover:bg-zinc-800 transition-all"
                >
                  {hero.secondaryCta}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Credibility Board */}
      <section className="py-20 bg-zinc-950 border-b border-zinc-900">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat: any, i: number) => (
              <div key={i} className="flex flex-col border-l border-emerald-500/30 pl-6">
                <span className="text-4xl md:text-5xl font-black tracking-tight text-zinc-100 mb-2">
                  {stat.value}
                </span>
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Wow & How Split */}
      <section className="py-24 md:py-32 bg-zinc-950 relative">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight mb-6">
              {wowAndHow.title}
            </h2>
            <p className="text-lg text-zinc-400">
              {wowAndHow.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* WOW */}
            <div className="p-10 rounded-lg bg-zinc-900 border border-zinc-800">
              <h3 className="text-3xl font-black text-emerald-400 tracking-tight mb-8">The WOW</h3>
              <ul className="space-y-6">
                {(wowAndHow.wowBullets || []).map((item: string) => (
                  <li key={item} className="flex items-center gap-4 text-xl font-medium text-zinc-300">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* HOW */}
            <div className="p-10 rounded-lg bg-zinc-900 border border-zinc-800">
              <h3 className="text-3xl font-black text-amber-500 tracking-tight mb-8">The HOW</h3>
              <ul className="space-y-6">
                {(wowAndHow.howBullets || []).map((item: string) => (
                  <li key={item} className="flex items-center gap-4 text-xl font-medium text-zinc-300">
                    <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Capabilities Preview */}
      <section className="py-24 bg-zinc-900 border-y border-zinc-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight mb-4">Core Capabilities</h2>
              <p className="text-lg text-zinc-400">Everything required to deliver landmark experiences.</p>
            </div>
            <Link href="/b2b/services" className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
              View All Services <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dbServices.length > 0 ? (
              dbServices.map((service, i) => {
                const name = service.titleEn || service.slug
                const desc = service.contentEn || "Premium entertainment service"
                return (
                  <Link 
                    key={i} 
                    href={`/b2b/services/${service.slug}`}
                    className={cn(
                      "group relative p-8 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-all overflow-hidden flex flex-col justify-between",
                      i === 0 ? "md:col-span-2 md:row-span-2 min-h-[400px]" : "min-h-[200px]"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 mb-8">
                      <h3 className={cn("font-black text-zinc-100 tracking-tight mb-3", i === 0 ? "text-3xl" : "text-xl")}>
                        {name}
                      </h3>
                      <p className="text-zinc-400 font-medium line-clamp-3">
                        {desc}
                      </p>
                    </div>
                    <div className="relative z-10 flex justify-end">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-zinc-950 transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-4 text-center py-12 border border-zinc-800 rounded-lg text-zinc-500">
                No featured services yet. Add them in the Dashboard!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Featured Case Studies */}
      <section className="py-24 bg-zinc-950">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight mb-4">Featured Work</h2>
              <p className="text-lg text-zinc-400">Landmark projects delivered across the region.</p>
            </div>
            <Link href="/b2b/case-studies" className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
              View All Case Studies <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {dbProjects.length > 0 ? (
              dbProjects.map((project, i) => {
                const title = project.titleEn || project.slug
                return (
                  <Link key={i} href={`/b2b/case-studies/${project.slug}`} className="group block">
                    <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-zinc-900 mb-6">
                      {/* Placeholder for project hero image */}
                      <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-600 font-medium">
                        [Cover: {title}]
                      </div>
                      <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-100 mb-2">{title}</h3>
                    <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
                      <span>{project.clientName}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="text-emerald-400">{project.year}</span>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-3 text-center py-12 border border-zinc-800 rounded-lg text-zinc-500">
                No featured case studies yet. Publish some from the Dashboard!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. Delivery Process */}
      <section className="py-24 bg-zinc-900 border-y border-zinc-800">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-4xl font-black text-zinc-100 tracking-tight mb-16 text-center">Delivery Process</h2>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-zinc-800 -z-10" />
            
            {['Discover', 'Design', 'Build', 'Operate', 'Report'].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center w-full md:w-auto">
                <div className="w-24 h-24 rounded-full bg-zinc-950 border-4 border-zinc-900 flex items-center justify-center font-black text-2xl text-emerald-500 mb-6">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-zinc-100">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Partner Ribbon */}
      <section className="py-16 bg-zinc-950 overflow-hidden border-b border-zinc-900">
        <div className="container mx-auto px-4 md:px-8 mb-8 text-center">
          <span className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Trusted by</span>
        </div>
        
        {/* Simple marquee placeholder */}
        <div className="flex w-[200%] animate-marquee">
          <div className="flex flex-1 justify-around items-center">
            {partners.map(p => (
              <div key={p} className="text-2xl font-bold text-zinc-700 mx-8 whitespace-nowrap">{p}</div>
            ))}
          </div>
          <div className="flex flex-1 justify-around items-center">
            {partners.map(p => (
              <div key={`${p}-clone`} className="text-2xl font-bold text-zinc-700 mx-8 whitespace-nowrap">{p}</div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
