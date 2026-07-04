import React from 'react'
import Link from 'next/link'
import { ArrowRight, Quote } from 'lucide-react'
import { notFound } from 'next/navigation'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { db } from "@/lib/db"

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const project = await db.caseStudy.findUnique({
    where: { slug },
    include: {
      teamMembers: {
        include: {
          teamMember: true
        }
      },
      attraction: true
    }
  })

  if (!project || !project.isPublished) {
    notFound()
  }

  // Get next project for the footer
  const nextProject = await db.caseStudy.findFirst({
    where: { 
      isPublished: true,
      year: { lte: project.year || new Date().getFullYear() },
      id: { not: project.id }
    },
    orderBy: { year: 'desc' }
  }) || await db.caseStudy.findFirst({
    where: { 
      isPublished: true,
      id: { not: project.id }
    },
    orderBy: { year: 'desc' }
  })

  const metrics = Array.isArray(project.metrics) ? project.metrics as any[] : []
  const gallery = Array.isArray(project.gallery) ? project.gallery as any[] : []
  const testimonials = Array.isArray(project.testimonials) ? (project.testimonials as any[]).filter(t => t.isVisible !== false) : []

  return (
    <div className="flex flex-col w-full bg-zinc-950 min-h-screen">
      
      {/* 1. Immersive Hero */}
      <section className="relative min-h-[85vh] flex flex-col justify-end pb-16 pt-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {project.heroImageUrl ? (
            <UniversalMediaRenderer 
              type={"IMAGE"} 
              src={project.heroImageUrl}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-zinc-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <div className="mb-8">
            <Link href="/b2b/case-studies" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-emerald-400 uppercase tracking-wider transition-colors">
              <ArrowRight className="w-4 h-4 rotate-180" /> All Case Studies
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-5xl">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-zinc-100 tracking-tight mb-6 leading-[1.1]">
                {project.titleEn}
              </h1>
              {project.attraction && (
                <div className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-full text-sm uppercase tracking-widest backdrop-blur-sm">
                  Powered by {project.attraction.nameEn}
                </div>
              )}
            </div>
            
            {project.clientLogoUrl && (
              <div className="shrink-0 bg-zinc-900/50 backdrop-blur-md p-6 rounded-2xl border border-zinc-800/50 hidden md:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.clientLogoUrl} alt={project.clientName || "Client Logo"} className="h-16 w-auto object-contain" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Key Details Bar */}
      <section className="border-y border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 py-8 gap-8">
            {project.clientName && (
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Client</div>
                <div className="text-zinc-100 font-bold text-lg">{project.clientName}</div>
              </div>
            )}
            {project.category && (
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Category</div>
                <div className="text-zinc-100 font-bold text-lg">{project.category}</div>
              </div>
            )}
            {project.year && (
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Year</div>
                <div className="text-zinc-100 font-bold text-lg">{project.year}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. The Challenge / Solution */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-5xl mx-auto space-y-24">
            
            {project.challengeEn && (
              <div className="grid md:grid-cols-12 gap-8 md:gap-16">
                <div className="md:col-span-5">
                  <h3 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight sticky top-32 leading-tight">The<br/>Challenge</h3>
                </div>
                <div className="md:col-span-7">
                  <div className="text-xl md:text-2xl text-zinc-400 leading-relaxed whitespace-pre-wrap font-medium">
                    {project.challengeEn}
                  </div>
                </div>
              </div>
            )}
            
            {project.solutionEn && (
              <div className="grid md:grid-cols-12 gap-8 md:gap-16">
                <div className="md:col-span-5">
                  <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight sticky top-32 leading-tight">The<br/>Solution</h3>
                </div>
                <div className="md:col-span-7">
                  <div className="text-xl md:text-2xl text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                    {project.solutionEn}
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </section>

      {/* 4. Bento Metrics */}
      {metrics.length > 0 && (
        <section className="py-24 bg-zinc-900/30 border-y border-zinc-800">
          <div className="container mx-auto px-4 md:px-8">
            <h3 className="text-3xl md:text-4xl font-black text-zinc-100 tracking-tight mb-12 text-center">Impact & Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {metrics.map((m: any, i: number) => {
                // Determine span based on index to create a bento look
                const isLarge = i === 0 && metrics.length % 2 !== 0;
                return (
                  <div key={i} className={`bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-12 flex flex-col justify-center items-center text-center group hover:border-emerald-500/50 transition-colors ${isLarge ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                    <div className={`font-black text-zinc-100 tracking-tight mb-4 ${isLarge ? 'text-6xl md:text-8xl' : 'text-5xl md:text-6xl'} group-hover:scale-105 transition-transform duration-500`}>
                      {m.valueEn}
                    </div>
                    <div className="text-sm md:text-base text-zinc-500 font-bold uppercase tracking-widest">{m.labelEn}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. Team & Testimonials Bento */}
      {(project.teamMembers.length > 0 || testimonials.length > 0) && (
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Testimonials */}
              {testimonials.length > 0 && (
                <div className={`flex flex-col gap-6 ${project.teamMembers.length === 0 ? 'lg:col-span-2' : ''}`}>
                  <h3 className="text-2xl font-black text-zinc-100 tracking-tight mb-4">Client Feedback</h3>
                  {testimonials.map((t, i) => (
                    <div key={i} className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden flex-1 flex flex-col">
                      <Quote className="w-12 h-12 text-zinc-800 absolute top-6 right-6 -rotate-6" />
                      <div className="text-lg md:text-xl text-zinc-300 italic mb-8 relative z-10 flex-1">
                        "{t.quoteEn}"
                      </div>
                      <div className="text-zinc-500 font-bold uppercase tracking-widest text-sm relative z-10">
                        {t.authorName}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Team Members */}
              {project.teamMembers.length > 0 && (
                <div className={`flex flex-col gap-6 ${testimonials.length === 0 ? 'lg:col-span-2' : ''}`}>
                  <h3 className="text-2xl font-black text-zinc-100 tracking-tight mb-4">Key Team</h3>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex-1">
                    <div className="flex flex-col gap-2">
                      {project.teamMembers.map((tm, i) => (
                        <div key={i} className="group relative py-4 border-b border-zinc-800/50 last:border-0 flex justify-between items-center cursor-default">
                          <div className="text-xl font-bold text-zinc-300 group-hover:text-zinc-100 transition-colors z-10 mix-blend-difference">
                            {tm.teamMember?.nameEn}
                          </div>
                          <div className="text-zinc-500 uppercase tracking-widest text-xs font-bold z-10">
                            {tm.roleEn || tm.teamMember?.roleTitleEn}
                          </div>
                          
                          {/* Hover Image Reveal */}
                          {tm.teamMember?.imageUrl && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full overflow-hidden opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none z-0 shadow-2xl">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={tm.teamMember.imageUrl} alt={tm.teamMember.nameEn} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </section>
      )}

      {/* 6. Gallery Bento */}
      {gallery.length > 0 && (
        <section className="py-24 bg-zinc-900/30 border-t border-zinc-800">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl md:text-4xl font-black text-zinc-100 tracking-tight mb-12 text-center">Project Gallery</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto auto-rows-[250px] md:auto-rows-[300px]">
              {gallery.map((img: any, i: number) => {
                // Determine bento size based on index pattern
                const isLarge = i % 5 === 0;
                const isTall = i % 5 === 2;
                const isWide = i % 5 === 3;
                
                let spanClasses = "col-span-2 md:col-span-1 row-span-1";
                if (isLarge) spanClasses = "col-span-2 md:col-span-2 row-span-1 md:row-span-2";
                else if (isTall) spanClasses = "col-span-2 md:col-span-1 row-span-1 md:row-span-2";
                else if (isWide) spanClasses = "col-span-2 md:col-span-2 row-span-1";

                return (
                  <div key={i} className={`bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden relative group ${spanClasses}`}>
                    <UniversalMediaRenderer 
                      type={"IMAGE"} 
                      src={img.url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {img.captionEn && (
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 md:p-8">
                        <div className="text-zinc-100 font-bold">{img.captionEn}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. Next Project */}
      {nextProject && (
        <section className="py-32 bg-emerald-500 text-zinc-950 text-center">
          <div className="container mx-auto px-4">
            <div className="text-sm font-bold uppercase tracking-widest mb-6 opacity-80">Next Project</div>
            <Link href={`/b2b/case-studies/${nextProject.slug}`} className="group inline-flex flex-col md:flex-row items-center gap-4 text-4xl md:text-7xl font-black tracking-tight">
              <span className="group-hover:mr-4 transition-all">{nextProject.titleEn}</span>
              <ArrowRight className="w-10 h-10 md:w-16 md:h-16 opacity-0 group-hover:opacity-100 transition-all -translate-x-8 group-hover:translate-x-0" />
            </Link>
          </div>
        </section>
      )}

    </div>
  )
}
