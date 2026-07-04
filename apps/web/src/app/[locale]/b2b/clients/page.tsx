import React from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { db } from "@/lib/db"
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'

export const metadata = {
  title: 'Clients & Partners - E3 Corporate',
  description: 'Organisations, brands, and government entities that trust E3 to deliver their most important experiences.',
}

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  
  const isAr = locale === 'ar'
  
  const [dbPartners, pageData] = await Promise.all([
    db.partner.findMany({
      where: { isVisible: true },
      orderBy: [
        { orderIndex: 'asc' },
        { name: 'asc' }
      ]
    }),
    db.pages.findUnique({
      where: { slug: 'b2b-partners' }
    })
  ])

  const content = pageData?.content as any || {}
  const hero = content?.hero || {
    titleEn: "Trusted by the Best.",
    titleAr: "يحظى بثقة الأفضل.",
    subtitleEn: "We partner with ambitious government entities, global brands, and premier destinations to deliver experiences that matter.",
    subtitleAr: "نحن نتشارك مع هيئات حكومية طموحة، وعلامات تجارية عالمية، ووجهات رائدة لتقديم تجارب تهم.",
    mediaType: "IMAGE",
    mediaUrl: ""
  }

  const heroTitle = isAr ? hero.titleAr : hero.titleEn;
  const heroSubtitle = isAr ? hero.subtitleAr : hero.subtitleEn;

  // Group by category
  const categoriesMap = {
    'GOVERNMENT': { nameEn: 'Government & Tourism', nameAr: 'الجهات الحكومية والسياحة', clients: [] as any[] },
    'CORPORATE': { nameEn: 'Corporate & Brands', nameAr: 'الشركات والعلامات التجارية', clients: [] as any[] },
    'VENUE': { nameEn: 'Venues & Destinations', nameAr: 'الوجهات والمواقع', clients: [] as any[] },
    'AGENCY': { nameEn: 'Agencies', nameAr: 'الوكالات', clients: [] as any[] },
    'TECHNOLOGY': { nameEn: 'Technology', nameAr: 'التكنولوجيا', clients: [] as any[] },
    'OTHER': { nameEn: 'Other', nameAr: 'أخرى', clients: [] as any[] },
  }

  dbPartners.forEach(p => {
    if (categoriesMap[p.category as keyof typeof categoriesMap]) {
      categoriesMap[p.category as keyof typeof categoriesMap].clients.push(p)
    }
  })

  const categories = Object.values(categoriesMap).filter(c => c.clients.length > 0)

  const testimonials = [
    {
      quote: isAr ? "لقد أوفت E3 بوعدها في وقت زمني قياسي. قدرتهم على حشد الموارد، وهندسة الهياكل الآمنة، والعمل بسلاسة على نطاق واسع لا مثيل لها في المنطقة." : "E3 delivered on an impossible timeline. Their ability to marshal resources, engineer safe structures, and operate smoothly at scale is unmatched in the region.",
      author: isAr ? "حسن الإبراهيم" : "Hassan Al Ibrahim",
      title: isAr ? "مدير الفعاليات" : "Director of Events",
      company: isAr ? "قطر للسياحة" : "Qatar Tourism"
    },
    {
      quote: isAr ? "كانت قبة XR درسًا متقدمًا في سرد القصص الغامرة. تنفيذ لا تشوبه شائبة من الفكرة إلى التسليم النهائي." : "The XR Dome was a masterclass in immersive storytelling. Flawless execution from concept to final delivery.",
      author: isAr ? "سارة آل ثاني" : "Sarah Al-Thani",
      title: isAr ? "المدير الإبداعي" : "Creative Director",
      company: isAr ? "مشيرب العقارية" : "Msheireb Properties"
    }
  ]

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <section className="relative min-h-[60vh] flex items-center py-20 md:py-32 border-b border-zinc-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {hero.mediaUrl ? (
            <UniversalMediaRenderer 
              type={hero.mediaType || "IMAGE"} 
              src={hero.mediaUrl}
              alt="Clients Hero Background"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          )}
          {hero.mediaUrl && <div className="absolute inset-0 bg-zinc-950/80" />}
          {hero.mediaUrl && <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />}
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-zinc-100 tracking-tight mb-6 max-w-4xl">
            {heroTitle.split(' ').map((word: string, i: number, arr: string[]) => 
              i === arr.length - 1 ? <span key={i} className="text-emerald-400">{word}</span> : <span key={i}>{word} </span>
            )}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl font-medium">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Clients Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8 space-y-24">
          
          {categories.length === 0 ? (
            <div className="text-center py-12 border border-zinc-800 rounded-xl bg-zinc-900/20">
              <p className="text-zinc-500 font-medium">Partners list is being updated.</p>
            </div>
          ) : categories.map((category, i) => (
            <div key={i}>
              <h2 className="text-2xl font-black text-zinc-100 tracking-tight mb-8 flex items-center gap-4">
                {isAr ? category.nameAr : category.nameEn}
                <div className="h-px flex-1 bg-zinc-900" />
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {category.clients.map((client, j) => (
                  <div 
                    key={client.id || j}
                    className="aspect-[3/2] rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-8 hover:bg-zinc-800 hover:border-emerald-500/50 transition-colors group cursor-default relative overflow-hidden"
                  >
                    {client.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={client.logoUrl} 
                        alt={client.name} 
                        className="max-w-[80%] max-h-[80%] object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 relative z-10" 
                      />
                    ) : (
                      <div className="text-zinc-500 font-bold text-center group-hover:text-zinc-300 transition-colors relative z-10">
                        {client.name}
                      </div>
                    )}
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
