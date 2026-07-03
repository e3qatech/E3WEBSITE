import React from 'react'
import Link from 'next/link'
import { ArrowRight, Filter } from 'lucide-react'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'

export const metadata = {
  title: 'Case Studies & Featured Work - E3 Corporate',
  description: 'Explore our portfolio of mega events, immersive installations, and entertainment destinations delivered across the Middle East.',
}

export default function CaseStudiesIndexPage() {
  
  const projects = [
    { 
      name: 'Riyadh World Cup Arena', 
      venue: 'Riyadh, KSA', 
      metric: '50,000 capacity', 
      category: 'Mega Event',
      slug: 'riyadh-world-cup', 
      image: '/mock/stadium.jpg' 
    },
    { 
      name: 'Doha Balloon Parade', 
      venue: 'Corniche, Qatar', 
      metric: '760,000+ attendees', 
      category: 'Live Production',
      slug: 'doha-balloon-parade', 
      image: '/mock/balloon.jpg' 
    },
    { 
      name: 'InflataCity', 
      venue: 'QNCC', 
      metric: '30,000 sqm', 
      category: 'Attractions',
      slug: 'inflatacity', 
      image: '/mock/inflata.jpg' 
    },
    { 
      name: 'LEGO Shows Qatar', 
      venue: 'QNCC', 
      metric: '95+ performances', 
      category: 'Family Entertainment',
      slug: 'lego-shows-qatar', 
      image: '/mock/lego.jpg' 
    },
    { 
      name: 'Lusail Winter Wonderland', 
      venue: 'Al Maha Island', 
      metric: 'End-to-End Operations', 
      category: 'Destination',
      slug: 'lusail-winter-wonderland', 
      image: '/mock/lww.jpg' 
    },
    { 
      name: 'XR Dome Experience', 
      venue: 'Msheireb', 
      metric: 'Immersive Tech', 
      category: 'Immersive',
      slug: 'xr-dome', 
      image: '/mock/xr-dome.jpg' 
    },
  ]

  const categories = ['All', 'Mega Event', 'Attractions', 'Live Production', 'Immersive', 'Destination', 'Family Entertainment']

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20">
      
      {/* Header */}
      <section className="py-20 border-b border-zinc-900 bg-zinc-900/50">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-5xl md:text-7xl font-black text-zinc-100 tracking-tight mb-6">
            Featured <span className="text-emerald-400">Work.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl font-medium">
            A selection of landmark projects demonstrating our capacity to engineer, build, and operate experiences at scale.
          </p>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-8">
          
          {/* Filters - Static for now, will connect to Zustand later */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase tracking-wider text-xs mr-4 shrink-0">
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
            {projects.map((project, i) => (
              <Link 
                key={i} 
                href={`/b2b/case-studies/${project.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-900 mb-6 border border-zinc-800 group-hover:border-emerald-500/50 transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-medium">
                    [Image: {project.name}]
                  </div>
                  <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-transparent transition-colors" />
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded-sm bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    {project.category}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-zinc-100 mb-2 group-hover:text-emerald-400 transition-colors">
                  {project.name}
                </h3>
                
                <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
                  <span>{project.venue}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span>{project.metric}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-20 text-center">
            <button className="px-8 py-4 rounded-sm border border-zinc-800 text-zinc-300 font-bold hover:bg-zinc-900 hover:text-zinc-100 transition-colors inline-flex items-center gap-2">
              Load More Projects <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

    </div>
  )
}
