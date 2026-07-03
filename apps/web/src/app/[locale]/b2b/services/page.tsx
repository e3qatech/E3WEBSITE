import React from 'react'
import Link from 'next/link'
import { ArrowRight, Settings2, Hammer, Video, Ticket } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Services & Capabilities - E3 Corporate',
  description: 'Comprehensive event engineering, live production, immersive tech, and attractions management by E3.',
}

export default function ServicesIndexPage() {
  
  // Mock data for initial rendering
  const services = [
    {
      title: 'Mega Events & Live Production',
      slug: 'mega-events',
      desc: 'End-to-end design, staging, and technical production for large-scale ceremonies and festivals.',
      icon: <Settings2 className="w-8 h-8" />,
      features: ['Stage Engineering', 'Rigging & Lighting', 'Audio Visual Systems', 'Broadcast Coordination']
    },
    {
      title: 'Immersive Tech & XR',
      slug: 'immersive-tech',
      desc: 'Spatial computing, AR/VR activations, and interactive digital environments that bridge physical and virtual.',
      icon: <Video className="w-8 h-8" />,
      features: ['AR / VR Development', 'Projection Mapping', 'Interactive Installations', 'Gamified Environments']
    },
    {
      title: 'Attractions & Theming',
      slug: 'attractions-theming',
      desc: 'Design and fabrication of permanent and pop-up family entertainment centers and themed lands.',
      icon: <Hammer className="w-8 h-8" />,
      features: ['Concept & Masterplanning', 'Scenic Fabrication', 'Ride Integration', 'Safety & Feasibility']
    },
    {
      title: 'Operations & Ticketing',
      slug: 'operations-ticketing',
      desc: 'Complete venue management, from crowd control to access systems and guest experience staffing.',
      icon: <Ticket className="w-8 h-8" />,
      features: ['Ticketing Architecture', 'Crowd Flow Management', 'Staffing & Protocol', 'Live Data Analytics']
    },
  ]

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
            {services.map((service, i) => (
              <div key={i} className="group relative p-8 md:p-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 transition-all flex flex-col h-full">
                <div className="mb-8 p-4 bg-zinc-950 inline-flex rounded-lg border border-zinc-800 text-emerald-400">
                  {service.icon}
                </div>
                
                <h2 className="text-3xl font-black text-zinc-100 mb-4 tracking-tight group-hover:text-emerald-400 transition-colors">
                  {service.title}
                </h2>
                
                <p className="text-lg text-zinc-400 mb-8 max-w-md">
                  {service.desc}
                </p>
                
                <div className="mt-auto">
                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wide mb-4">Core Capabilities</h4>
                  <ul className="space-y-3 mb-10">
                    {service.features.map(feature => (
                      <li key={feature} className="flex items-center gap-3 text-zinc-300 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href={`/b2b/services/${service.slug}`}
                    className="inline-flex items-center gap-2 text-zinc-100 font-bold hover:text-emerald-400 transition-colors"
                  >
                    Explore Discipline <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  )
}
