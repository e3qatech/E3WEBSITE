import React from 'react'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'

import prisma from '@/lib/db'

export const metadata = {
  title: 'About Us - E3 Corporate',
  description: 'Learn about E3, our leadership, values, and our mission to engineer landmark experiences across the MENA region.',
}

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const employeeProfiles = await prisma.employeeProfile.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    take: 3
  })

  const leadership = employeeProfiles.map((emp) => ({
    name: `${emp.firstName} ${emp.lastName}`,
    title: emp.designation,
    image: emp.profileImage || '/mock/team-1.jpg'
  }))

  const values = [
    { title: 'Engineering Precision', desc: 'We treat creativity with the rigor of structural engineering. No detail is too small, no safety margin too tight.' },
    { title: 'Operational Excellence', desc: 'Beautiful designs mean nothing if the execution fails. We take extreme ownership of the live operation.' },
    { title: 'Cultural Resonance', desc: 'Rooted in Qatar, built for the world. Our experiences respect local context while setting global benchmarks.' },
  ]

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20">
      
      {/* Header */}
      <section className="py-20 border-b border-zinc-900 bg-zinc-900/50">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-5xl md:text-7xl font-black text-zinc-100 tracking-tight mb-6">
            We are <span className="text-emerald-400">E3.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl font-medium">
            Event Engineering Experts. We turn ambitious creative visions into flawless operational reality.
          </p>
        </div>
      </section>

      {/* The Story */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-black text-zinc-100 mb-6 tracking-tight">Our Story</h2>
              <div className="space-y-6 text-lg text-zinc-400 leading-relaxed">
                <p>
                  E3 was founded in Doha with a simple premise: the region's rapidly growing events sector needed a partner that understood both the creative ambition of mega-events and the hard engineering required to deliver them.
                </p>
                <p>
                  Over the past decade, we have grown from a boutique staging company into a comprehensive ecosystem of event engineering, immersive technology, and venue operations. 
                </p>
                <p>
                  Today, we employ over 120 full-time specialists and maintain one of the largest inventories of staging, rigging, and XR hardware in the Middle East.
                </p>
              </div>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
               <UniversalMediaRenderer 
                type="IMAGE"
                src="/mock/about-office.jpg"
                alt="E3 Headquarters"
               />
               <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-bold mix-blend-difference">
                 [Office Image]
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-zinc-900 border-y border-zinc-800">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-black text-zinc-100 mb-12 tracking-tight text-center">Our Core Values</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((val, i) => (
              <div key={i} className="p-8 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="w-12 h-12 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-black text-xl mb-6">
                  0{i + 1}
                </div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-4">{val.title}</h3>
                <p className="text-zinc-400">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-black text-zinc-100 mb-12 tracking-tight">Leadership</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadership.map((leader, i) => (
              <div key={i} className="group">
                <div className="aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 mb-6 relative">
                  <UniversalMediaRenderer 
                    type="IMAGE"
                    src={leader.image}
                    alt={leader.name}
                  />
                  <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-transparent transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-1 group-hover:text-emerald-400 transition-colors">
                  {leader.name}
                </h3>
                <div className="text-emerald-500 font-bold uppercase tracking-widest text-sm">
                  {leader.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
