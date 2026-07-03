import React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { db } from "@/lib/db"

export default async function ServiceMicrosite({ params }: { params: Promise<{ slug: string }> }) {
  
  const { slug } = await params

  const service = await db.service.findUnique({
    where: { slug },
    include: {
      projects: true,
      gallery: { orderBy: { orderIndex: 'asc' } }
    }
  })

  if (!service || !service.isVisible) {
    notFound()
  }

  const processList = Array.isArray(service.process) ? service.process : []

  return (
    <div className="flex flex-col w-full bg-zinc-950 min-h-screen">
      
      {/* 1. Immersive Header */}
      <section className="relative min-h-[60vh] flex items-center pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {service.heroMediaUrl ? (
            <UniversalMediaRenderer 
              type={service.heroMediaType as any || "IMAGE"} 
              src={service.heroMediaUrl}
              alt={service.titleEn}
            />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-zinc-950/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <Link href="/b2b/services" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-emerald-400 uppercase tracking-wider mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Services
          </Link>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-zinc-100 tracking-tight mb-6 max-w-4xl">
            {service.titleEn}
          </h1>
          {service.taglineEn && (
            <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl font-medium">
              {service.taglineEn}
            </p>
          )}
        </div>
      </section>

      {/* 2. Deep Dive Narrative & Specs */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <h2 className="text-3xl font-black text-zinc-100 mb-6 tracking-tight">The Discipline</h2>
              <div className="text-lg text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {service.contentEn}
              </div>
            </div>
            
            {processList.length > 0 && (
              <div className="p-8 rounded-xl bg-zinc-900 border border-zinc-800">
                <h3 className="text-xl font-bold text-zinc-100 mb-6">Core Deliverables & Process</h3>
                <ul className="space-y-6">
                  {processList.map((step: any, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                      <div>
                        <div className="text-zinc-100 font-bold mb-1">{step.titleEn}</div>
                        <div className="text-zinc-400 text-sm">{step.descEn}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Related Projects Showcase */}
      {service.projects && service.projects.length > 0 && (
        <section className="py-24 bg-zinc-900 border-t border-zinc-800">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-zinc-100 tracking-tight">Showcase Work</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {service.projects.map((proj: any, i) => (
                <div key={i} className="group block relative aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800">
                  <div className="absolute inset-0 z-0">
                    {proj.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={proj.imageUrl} alt={proj.titleEn} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600 font-medium">[Project Image]</div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-90 z-10" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                    <h3 className="text-2xl font-bold text-zinc-100 transition-colors">
                      {proj.titleEn}
                    </h3>
                    {proj.descriptionEn && (
                      <p className="text-zinc-300 mt-2 line-clamp-2">{proj.descriptionEn}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Gallery */}
      {service.gallery && service.gallery.length > 0 && (
        <section className="py-24 border-t border-zinc-800">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-black text-zinc-100 tracking-tight mb-12">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {service.gallery.map((img: any, i) => (
                <div key={i} className="aspect-square bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.captionEn || "Gallery Image"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
