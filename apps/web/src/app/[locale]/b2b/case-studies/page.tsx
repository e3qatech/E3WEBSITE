import React from 'react'
import Link from 'next/link'
import { Filter, ArrowRight, ArrowUpRight } from 'lucide-react'
import { db } from "@/lib/db"
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { MediaRenderer } from "@/components/ui/MediaRenderer"

export const metadata = {
  title: 'Case Studies & Featured Work - E3 Corporate',
  description: 'Explore our portfolio of mega events, immersive installations, and entertainment destinations delivered across the Middle East.',
}

export const dynamic = 'force-dynamic'

export default async function CaseStudiesIndexPage() {
  
  const [caseStudies, pageData] = await Promise.all([
    db.caseStudy.findMany({
      where: { isPublished: true },
      orderBy: { year: 'desc' }
    }),
    db.pages.findUnique({
      where: { slug: 'b2b-cases' }
    })
  ])

  const content = pageData?.content as any || {}
  
  const hero = content?.hero || {
    title: "Featured Work.",
    subtitle: "A selection of landmark projects demonstrating our capacity to engineer, build, and operate experiences at scale.",
    mediaType: "IMAGE",
    mediaUrl: ""
  }
  
  const cta = content?.cta

  const categories = ['All', 'Mega Event', 'Attractions', 'Live Production', 'Immersive', 'Destination', 'Family Entertainment']

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20">
      
      {/* Header */}
      <section className="relative min-h-[60vh] flex items-center py-20 md:py-32 border-b border-zinc-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {hero.mediaUrl ? (
            <UniversalMediaRenderer 
              type={hero.mediaType || "IMAGE"} 
              src={hero.mediaUrl}
              alt="Cases Hero Background"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          )}
          {hero.mediaUrl && <div className="absolute inset-0 bg-zinc-950/80" />}
          {hero.mediaUrl && <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />}
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-zinc-100 tracking-tight mb-6 max-w-4xl">
            {hero.title.split(' ').map((word: string, i: number, arr: string[]) => 
              i === arr.length - 1 ? <span key={i} className="text-emerald-400">{word}</span> : <span key={i}>{word} </span>
            )}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl font-medium">
            {hero.subtitle}
          </p>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-8">
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 opacity-50 pointer-events-none">
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase tracking-wider text-xs me-4 shrink-0">
                <Filter className="w-4 h-4" /> Filter by
              </div>
              {categories.map((cat, i) => (
                <button 
                  key={cat}
                  className={`px-4 py-2 rounded-full border whitespace-nowrap text-sm font-bold transition-colors ${
                    i === 0 
                      ? 'bg-zinc-100 text-zinc-900 border-zinc-100' 
                      : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((project, i) => (
              <Link 
                key={project.id} 
                href={`/b2b/case-studies/${project.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-900 mb-6 border border-zinc-800 group-hover:border-emerald-500/50 transition-colors">
                  {project.heroImageUrl || project.thumbnailUrl ? (
                    <MediaRenderer 
                      url={project.heroImageUrl || project.thumbnailUrl} 
                      type={project.heroMediaType || project.thumbnailMediaType} 
                      alt={project.titleEn} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-medium">
                      [Image: {project.titleEn}]
                    </div>
                  )}
                  <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-transparent transition-colors" />
                </div>
                
                <h3 className="text-2xl font-bold text-zinc-100 mb-2 group-hover:text-emerald-400 transition-colors">
                  {project.titleEn}
                </h3>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-zinc-400">
                  {project.category && <span>{project.category}</span>}
                  {project.category && project.clientName && <span className="w-1 h-1 rounded-full bg-zinc-700" />}
                  {project.clientName && <span>{project.clientName}</span>}
                  
                  {Array.isArray(project.metrics) && project.metrics.length > 0 && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-zinc-700 hidden md:block" />
                      <span className="text-emerald-400">{(project.metrics as any[])[0]?.value} {(project.metrics as any[])[0]?.label}</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {caseStudies.length === 0 && (
            <div className="text-center py-20 border border-zinc-800 rounded-xl bg-zinc-900/20">
              <p className="text-zinc-500 font-medium text-lg">Case studies list is being updated.</p>
            </div>
          )}

        </div>
      </section>

      {/* CTA */}
      {cta && cta.title && (
        <section className="py-24 border-t border-zinc-900 bg-zinc-950 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            {cta.mediaUrl ? (
              <UniversalMediaRenderer 
                type={cta.mediaType || "IMAGE"} 
                src={cta.mediaUrl}
                alt="CTA Background"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
            )}
            {cta.mediaUrl && <div className="absolute inset-0 bg-zinc-950/80" />}
          </div>

          <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-zinc-100 mb-6">{cta.title}</h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">{cta.description}</p>
            <Link 
              href={cta.primaryLink || '/b2b/contact'}
              className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-colors"
            >
              {cta.primaryCta || 'Contact Us'}
            </Link>
          </div>
        </section>
      )}

    </div>
  )
}
