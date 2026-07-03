import React from 'react'
import Link from 'next/link'
import { ArrowRight, Settings2 } from 'lucide-react'
import { db } from "@/lib/db"

export const metadata = {
  title: 'Services & Capabilities - E3 Corporate',
  description: 'Comprehensive event engineering, live production, immersive tech, and attractions management by E3.',
}

export const dynamic = 'force-dynamic'

export default async function ServicesIndexPage() {
  
  const services = await db.service.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20">
      
      {/* Hero */}
      <section className="py-20 md:py-32 border-b border-zinc-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-zinc-100 tracking-tight mb-6 max-w-4xl">
            Everything Required to Build the <span className="text-emerald-400">Extraordinary.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl font-medium">
            We don't outsource the hard parts. E3 retains in-house expertise across creative, engineering, fabrication, and operations to ensure flawless delivery.
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
                              {feature.title}
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
      
    </div>
  )
}
