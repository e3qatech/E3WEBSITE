import React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'

export default function ServiceMicrosite({ params }: { params: { slug: string } }) {
  
  // Mock data for initial rendering
  const service = {
    title: 'Mega Events & Live Production',
    slug: 'mega-events',
    desc: 'End-to-end design, staging, and technical production for large-scale ceremonies and festivals.',
    fullDesc: 'We architect temporary ecosystems for monumental live experiences. From national day ceremonies and sporting event inaugurations to sprawling music festivals, we handle the extreme logistics of staging, power, structural rigging, and audiovisual coordination at an unprecedented scale.',
    media: '/mock/stage-build.jpg',
    features: [
      'Custom Stage Engineering & Rigging',
      'Advanced Audio & Lighting Arrays',
      'High-Resolution Broadcast LED Screens',
      'Power Distribution & Redundancy',
      'Crowd Safety & Barrier Flow'
    ],
    projects: [
      { name: 'Riyadh World Cup Arena', slug: 'riyadh-world-cup' },
      { name: 'Doha Balloon Parade', slug: 'doha-balloon-parade' }
    ]
  }
  
  // In a real implementation we would fetch from DB:
  // const service = await db.b2BService.findUnique({ where: { slug: params.slug } })
  // if (!service) notFound()

  if (params.slug !== 'mega-events') {
    // For now just render the mock for everything, or return 404
    // We'll just show the mock to not break the build when testing
  }

  return (
    <div className="flex flex-col w-full bg-zinc-950 min-h-screen">
      
      {/* 1. Immersive Header */}
      <section className="relative min-h-[60vh] flex items-center pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <UniversalMediaRenderer 
            type="IMAGE" 
            src={service.media}
            alt={service.title}
          />
          <div className="absolute inset-0 bg-zinc-950/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <Link href="/b2b/services" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-emerald-400 uppercase tracking-wider mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Services
          </Link>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-zinc-100 tracking-tight mb-6 max-w-4xl">
            {service.title}
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl font-medium">
            {service.desc}
          </p>
        </div>
      </section>

      {/* 2. Deep Dive Narrative & Specs */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <h2 className="text-3xl font-black text-zinc-100 mb-6 tracking-tight">The Discipline</h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                {service.fullDesc}
              </p>
            </div>
            
            <div className="p-8 rounded-xl bg-zinc-900 border border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-100 mb-6">Core Deliverables</h3>
              <ul className="space-y-4">
                {service.features.map(feat => (
                  <li key={feat} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span className="text-zinc-300 font-medium">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Related Projects Showcase */}
      <section className="py-24 bg-zinc-900 border-t border-zinc-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-zinc-100 tracking-tight">Showcase Work</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {service.projects.map(proj => (
              <Link 
                key={proj.slug} 
                href={`/b2b/case-studies/${proj.slug}`}
                className="group block relative aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800"
              >
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-medium">
                  [Project Image]
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                    {proj.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
