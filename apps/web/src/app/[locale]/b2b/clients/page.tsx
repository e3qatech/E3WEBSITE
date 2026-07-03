import React from 'react'

export const metadata = {
  title: 'Clients & Partners - E3 Corporate',
  description: 'Organisations, brands, and government entities that trust E3 to deliver their most important experiences.',
}

export default function ClientsPage() {
  
  // Mock Data
  const categories = [
    {
      name: 'Government & Tourism',
      clients: [
        { name: 'Ministry of Sport KSA', logo: '/mock/logo-ksa.png' },
        { name: 'Qatar Tourism', logo: '/mock/logo-qt.png' },
        { name: 'Qatar Calendar', logo: '/mock/logo-qc.png' },
        { name: 'Qatar Museums', logo: '/mock/logo-qm.png' },
      ]
    },
    {
      name: 'Corporate & Brands',
      clients: [
        { name: 'Ooredoo', logo: '/mock/logo-ooredoo.png' },
        { name: 'QNB', logo: '/mock/logo-qnb.png' },
        { name: 'Qatar Airways', logo: '/mock/logo-qa.png' },
        { name: 'LEGO', logo: '/mock/logo-lego.png' },
      ]
    },
    {
      name: 'Venues & Destinations',
      clients: [
        { name: 'QNCC', logo: '/mock/logo-qncc.png' },
        { name: 'UDC', logo: '/mock/logo-udc.png' },
        { name: 'Al Maha Island', logo: '/mock/logo-al-maha.png' },
        { name: 'Doha Festival City', logo: '/mock/logo-dfc.png' },
      ]
    }
  ]

  const testimonials = [
    {
      quote: "E3 delivered on an impossible timeline. Their ability to marshal resources, engineer safe structures, and operate smoothly at scale is unmatched in the region.",
      author: "Hassan Al Ibrahim",
      title: "Director of Events",
      company: "Qatar Tourism"
    },
    {
      quote: "The XR Dome was a masterclass in immersive storytelling. Flawless execution from concept to final delivery.",
      author: "Sarah Al-Thani",
      title: "Creative Director",
      company: "Msheireb Properties"
    }
  ]

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20">
      
      {/* Header */}
      <section className="py-20 border-b border-zinc-900 bg-zinc-900/50">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-5xl md:text-7xl font-black text-zinc-100 tracking-tight mb-6">
            Trusted by the <span className="text-emerald-400">Best.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl font-medium">
            We partner with ambitious government entities, global brands, and premier destinations to deliver experiences that matter.
          </p>
        </div>
      </section>

      {/* Clients Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8 space-y-24">
          
          {categories.map((category, i) => (
            <div key={i}>
              <h2 className="text-2xl font-black text-zinc-100 tracking-tight mb-8 flex items-center gap-4">
                {category.name}
                <div className="h-px flex-1 bg-zinc-900" />
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {category.clients.map((client, j) => (
                  <div 
                    key={j}
                    className="aspect-[3/2] rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-8 hover:bg-zinc-800 hover:border-emerald-500/50 transition-colors group cursor-default"
                  >
                    <div className="text-zinc-500 font-bold text-center group-hover:text-zinc-300 transition-colors">
                      {client.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-zinc-900 border-t border-zinc-800">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-4xl font-black text-zinc-100 tracking-tight mb-16 text-center">What They Say</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((test, i) => (
              <div key={i} className="p-10 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                <div className="mb-8">
                  <svg className="w-8 h-8 text-emerald-500 mb-6 opacity-50" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="text-xl text-zinc-300 font-medium leading-relaxed">
                    "{test.quote}"
                  </p>
                </div>
                <div>
                  <div className="font-bold text-zinc-100">{test.author}</div>
                  <div className="text-sm text-zinc-500 font-medium">{test.title}, <span className="text-emerald-400">{test.company}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
