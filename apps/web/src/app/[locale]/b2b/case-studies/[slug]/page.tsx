import React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { db } from "@/lib/db"

export default async function ProjectMicrositePage({ params }: { params: Promise<{ slug: string }> }) {
  
  const { slug } = await params

  const project = await db.caseStudy.findUnique({
    where: { slug }
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

  return (
    <div className="flex flex-col w-full bg-zinc-950 min-h-screen">
      
      {/* 1. Immersive Hero */}
      <section className="relative min-h-[70vh] flex flex-col justify-end pb-12 pt-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {project.heroImageUrl ? (
            <UniversalMediaRenderer 
              type={"IMAGE"} 
              src={project.heroImageUrl}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-zinc-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <div className="mb-8">
            <Link href="/b2b/case-studies" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-emerald-400 uppercase tracking-wider">
              <ArrowRight className="w-4 h-4 rotate-180" /> All Case Studies
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-zinc-100 tracking-tight mb-4">
                {project.titleEn}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Details Bar */}
      <section className="border-b border-zinc-900 bg-zinc-900/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 py-8 gap-6">
            {project.clientName && (
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Client</div>
                <div className="text-zinc-100 font-bold">{project.clientName}</div>
              </div>
            )}
            {project.category && (
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Category</div>
                <div className="text-zinc-100 font-bold">{project.category}</div>
              </div>
            )}
            {project.year && (
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Year</div>
                <div className="text-zinc-100 font-bold">{project.year}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. The Challenge / Solution / Result */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-20">
            
            {/* Challenge */}
            {project.challengeEn && (
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-4">
                  <h3 className="text-3xl font-black text-zinc-100 tracking-tight sticky top-32">The Challenge</h3>
                </div>
                <div className="md:col-span-8">
                  <div className="text-xl text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {project.challengeEn}
                  </div>
                </div>
              </div>
            )}
            
            {/* Solution */}
            {project.solutionEn && (
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-4">
                  <h3 className="text-3xl font-black text-emerald-400 tracking-tight sticky top-32">The Solution</h3>
                </div>
                <div className="md:col-span-8">
                  <div className="text-xl text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                    {project.solutionEn}
                  </div>
                </div>
              </div>
            )}
            
            {/* Result */}
            {(Array.isArray(project.metrics) && project.metrics.length > 0) && (
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-4">
                  <h3 className="text-3xl font-black text-zinc-100 tracking-tight sticky top-32">The Result</h3>
                </div>
                <div className="md:col-span-8">
                  
                  {/* Metrics Grid */}
                  {Array.isArray(project.metrics) && project.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-6 mt-12 pt-12 border-t border-zinc-800">
                      {project.metrics.map((m: any, i: number) => (
                        <div key={i}>
                          <div className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight mb-2">{(m as any).value}</div>
                          <div className="text-sm text-zinc-500 font-bold uppercase tracking-widest">{(m as any).label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </section>

      {/* 4. Gallery & Media */}
      {Array.isArray(project.gallery) && project.gallery.length > 0 && (
        <section className="py-24 bg-zinc-900 border-t border-zinc-800">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-black text-zinc-100 tracking-tight mb-12">Project Gallery</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.gallery.map((img: any, i: number) => (
                <div key={i} className="aspect-[4/3] bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.captionEn || "Gallery Image"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Next Project */}
      {nextProject && (
        <section className="py-32 bg-emerald-500 text-zinc-950 text-center">
          <div className="container mx-auto px-4">
            <div className="text-sm font-bold uppercase tracking-widest mb-6 opacity-80">Next Project</div>
            <Link href={`/b2b/case-studies/${nextProject.slug}`} className="group inline-flex items-center gap-4 text-4xl md:text-6xl font-black tracking-tight">
              <span className="group-hover:mr-4 transition-all">{nextProject.titleEn}</span>
              <ArrowRight className="w-10 h-10 md:w-12 md:h-12 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
            </Link>
          </div>
        </section>
      )}

    </div>
  )
}
