import React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'

export default function ProjectMicrositePage({ params }: { params: { slug: string } }) {
  
  // Mock data for initial rendering
  const project = {
    title: 'Riyadh World Cup Arena',
    slug: 'riyadh-world-cup',
    summary: 'A massive 50,000 capacity temporary arena engineered and built in just 60 days.',
    client: 'Ministry of Sport KSA',
    venue: 'Riyadh',
    year: '2024',
    category: 'Mega Event',
    media: '/mock/stadium.jpg',
    challenge: 'The client required a FIFA-compliant temporary stadium with VIP boxes, broadcast facilities, and safe crowd flow for 50,000 daily attendees—all built from scratch in the desert within a rigid 60-day window.',
    solution: 'E3 deployed a 24/7 dual-shift engineering team. We utilized our proprietary modular scaffolding and staging systems to erect the core structure in 28 days. The remaining time was dedicated to high-end fit-outs for the VIP areas, broadcast cabling, and rigorous safety stress-testing.',
    result: 'The venue opened 2 days ahead of schedule. Over 1.2 million fans passed through safely over the month-long tournament, with zero structural or operational incidents. The project set a new benchmark for temporary stadium builds in the region.',
    metrics: [
      { value: '50,000', label: 'Seat Capacity' },
      { value: '60', label: 'Days to Build' },
      { value: '1.2M', label: 'Total Attendees' },
      { value: '0', label: 'Safety Incidents' }
    ]
  }

  return (
    <div className="flex flex-col w-full bg-zinc-950 min-h-screen">
      
      {/* 1. Immersive Hero */}
      <section className="relative min-h-[70vh] flex flex-col justify-end pb-12 pt-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <UniversalMediaRenderer 
            type="IMAGE" 
            src={project.media}
            alt={project.title}
          />
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
              <span className="inline-block px-3 py-1.5 rounded-sm bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 border border-emerald-500/20">
                {project.category}
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-zinc-100 tracking-tight mb-4">
                {project.title}
              </h1>
              <p className="text-xl md:text-2xl text-zinc-300 font-medium">
                {project.summary}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Details Bar */}
      <section className="border-b border-zinc-900 bg-zinc-900/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 py-8 gap-6">
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Client</div>
              <div className="text-zinc-100 font-bold">{project.client}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Venue</div>
              <div className="text-zinc-100 font-bold">{project.venue}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Year</div>
              <div className="text-zinc-100 font-bold">{project.year}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Discipline</div>
              <div className="text-zinc-100 font-bold">Mega Events</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Challenge / Solution / Result */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-20">
            
            {/* Challenge */}
            <div className="grid md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <h3 className="text-3xl font-black text-zinc-100 tracking-tight sticky top-32">The Challenge</h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-xl text-zinc-400 leading-relaxed">
                  {project.challenge}
                </p>
              </div>
            </div>
            
            {/* Solution */}
            <div className="grid md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <h3 className="text-3xl font-black text-emerald-400 tracking-tight sticky top-32">The Solution</h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-xl text-zinc-300 leading-relaxed font-medium">
                  {project.solution}
                </p>
              </div>
            </div>
            
            {/* Result */}
            <div className="grid md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <h3 className="text-3xl font-black text-zinc-100 tracking-tight sticky top-32">The Result</h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-xl text-zinc-400 leading-relaxed">
                  {project.result}
                </p>
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-6 mt-12 pt-12 border-t border-zinc-800">
                  {project.metrics.map(m => (
                    <div key={m.label}>
                      <div className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight mb-2">{m.value}</div>
                      <div className="text-sm text-zinc-500 font-bold uppercase tracking-widest">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 4. Gallery & Media */}
      <section className="py-24 bg-zinc-900 border-t border-zinc-800">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-black text-zinc-100 tracking-tight mb-12">Project Gallery</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="aspect-[4/3] bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-700 font-bold">
              [Image 1]
            </div>
            <div className="aspect-[4/3] bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-700 font-bold">
              [Image 2]
            </div>
            <div className="aspect-[4/3] bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-700 font-bold">
              [Image 3]
            </div>
            <div className="aspect-[4/3] bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-700 font-bold">
              [Image 4]
            </div>
          </div>
        </div>
      </section>

      {/* 5. Next Project */}
      <section className="py-32 bg-emerald-500 text-zinc-950 text-center">
        <div className="container mx-auto px-4">
          <div className="text-sm font-bold uppercase tracking-widest mb-6 opacity-80">Next Project</div>
          <Link href="/b2b/case-studies/doha-balloon-parade" className="group inline-flex items-center gap-4 text-4xl md:text-6xl font-black tracking-tight">
            <span className="group-hover:mr-4 transition-all">Doha Balloon Parade</span>
            <ArrowRight className="w-10 h-10 md:w-12 md:h-12 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
          </Link>
        </div>
      </section>

    </div>
  )
}
