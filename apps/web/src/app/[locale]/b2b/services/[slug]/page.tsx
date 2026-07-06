import React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { DynamicARViewer } from '@/components/shared/DynamicWrappers'
import { db } from "@/lib/db"

export default async function ServiceMicrosite({ params }: { params: Promise<{ slug: string }> }) {
  
  const { slug } = await params

  const service = await db.service.findUnique({
    where: { slug },
    include: {
      projects: {
        include: { attraction: true }
      },
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

      {/* 2.5 WebXR AR Viewer */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-900 relative">
        <div className="container mx-auto px-4 md:px-8 text-center mb-8">
          <h2 className="text-3xl font-black text-zinc-100 tracking-tight mb-2">Immersive Equipment Viewer</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Experience our stage fabrications and technical setups directly in your space using augmented reality. 
            Compatible with WebXR-enabled mobile devices or VR headsets.
          </p>
        </div>
        <div className="container mx-auto px-4 md:px-8">
          <div className="w-full h-[600px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 relative">
            <DynamicARViewer modelUrl="/models/mock-equipment.glb" modelName={service.titleEn} />
          </div>
        </div>
      </section>

      {/* 3. Related Projects */}
      {service.projects && service.projects.length > 0 && (
        <section className="py-24 bg-zinc-900 border-t border-zinc-800">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-zinc-100 tracking-tight">Projects</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {service.projects.map((proj: any, i) => {
                const isAttraction = !!proj.attraction;
                const linkHref = isAttraction ? `/b2c/attractions/${proj.attraction.slug}` : null;
                const targetName = isAttraction ? (proj.attraction.nameEn || proj.titleEn) : proj.titleEn;
                const targetDesc = isAttraction ? (proj.attraction.descriptionEn || proj.descriptionEn) : proj.descriptionEn;
                const targetImage = isAttraction ? (proj.attraction.heroThumbnailUrl || proj.attraction.heroFallbackUrl || proj.imageUrl) : proj.imageUrl;
                
                const cardContent = (
                  <div className="group block relative aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <div className="absolute inset-0 z-0">
                      {targetImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={targetImage} alt={targetName} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600 font-medium">[Project Image]</div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent opacity-90 z-10" />
                    <div className="absolute bottom-0 start-0 end-0 p-8 z-20">
                      <div className="flex justify-between items-end">
                        <div className="max-w-[85%]">
                          {isAttraction && (
                            <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Featured Attraction
                            </div>
                          )}
                          <h3 className="text-2xl font-bold text-zinc-100 transition-colors">
                            {targetName}
                          </h3>
                          {targetDesc && (
                            <p className="text-zinc-300 mt-2 line-clamp-2 text-sm">{targetDesc}</p>
                          )}
                        </div>
                        {isAttraction && (
                           <div className="w-10 h-10 rounded-full bg-zinc-800/80 backdrop-blur border border-zinc-700 flex items-center justify-center text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                             <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                );

                if (linkHref) {
                  return (
                    <Link key={proj.id || i} href={linkHref}>
                      {cardContent}
                    </Link>
                  )
                }

                return <div key={proj.id || i}>{cardContent}</div>;
              })}
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
