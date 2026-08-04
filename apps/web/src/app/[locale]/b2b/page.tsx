import React from 'react'
import Link from 'next/link'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import db from '@/lib/db'

export default async function B2BHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  // Fetch real data from the CMS safely
  let page: any = null
  try {
    page = await db.pages.findUnique({
      where: { slug: 'b2b-home' }
    })
  } catch (error) {
    console.error("Error loading b2b-home page:", error)
  }
  
  const content = (page?.content as any) || {}
  const hero = {
    title: isAr 
      ? (content.hero?.titleAr || content.hero?.title || "تحويل الأفكار إلى واقع") 
      : (content.hero?.titleEn || content.hero?.title || "Ideas to Life"),
    subtitle: isAr 
      ? (content.hero?.subtitleAr || content.hero?.subtitle || "نحن نصمم ونبني ونشغل ونوسع تجارب الترفيه الغامرة في جميع أنحاء قطر.") 
      : (content.hero?.subtitleEn || content.hero?.subtitle || "We design, build, operate, and scale immersive entertainment experiences across Qatar."),
    description: isAr 
      ? (content.hero?.descriptionAr || content.hero?.description || "من المفاهيم الإبداعية إلى تدفق الجماهير والتصنيع وإصدار التذاكر والتوظيف والعمليات المباشرة.") 
      : (content.hero?.descriptionEn || content.hero?.description || "From creative concepts to crowd flow, fabrication, ticketing, staffing, and live operations."),
    primaryCta: isAr 
      ? (content.hero?.primaryCtaAr || content.hero?.primaryCta || "استكشف الخدمات") 
      : (content.hero?.primaryCtaEn || content.hero?.primaryCta || "Explore Services"),
    primaryLink: content.hero?.primaryLink || `/${locale}/b2b/services`,
    secondaryCta: isAr 
      ? (content.hero?.secondaryCtaAr || content.hero?.secondaryCta || "ابدأ مشروعاً") 
      : (content.hero?.secondaryCtaEn || content.hero?.secondaryCta || "Start a Project"),
    secondaryLink: content.hero?.secondaryLink || `/${locale}/b2b/contact`,
    mediaType: content.hero?.mediaType || "IMAGE",
    mediaUrl: content.hero?.mediaUrl || ""
  }

  const stats = (content?.stats && content.stats.length > 0) 
    ? content.stats.map((s: any) => ({
        value: isAr ? (s.valueAr || s.value) : s.value,
        label: isAr ? (s.labelAr || s.label) : s.label
      }))
    : [
        { value: '50+', label: isAr ? 'سنوات من الخبرة المشتركة' : 'Years Combined Experience' },
        { value: '9+', label: isAr ? 'التخصصات الأساسية' : 'Core Specializations' },
        { value: '100%', label: isAr ? 'ملكية قطرية 100%' : 'Qatari Owned' },
        { value: '3+', label: isAr ? 'أسواق إقليمية' : 'Regional Markets' },
      ]

  const wowAndHow = {
    title: isAr 
      ? (content.wowAndHow?.titleAr || content.wowAndHow?.title || "الإبهاار والتنفيذ الاحترافي") 
      : (content.wowAndHow?.titleEn || content.wowAndHow?.title || "The WOW & The HOW"),
    description: isAr 
      ? (content.wowAndHow?.descriptionAr || content.wowAndHow?.description || "الأفكار الإبداعية تتطلب هندسة تشغيلية. نحن لا نصمم التجارب فحسب — بل نبنيها ونوظف طواقمها ونشغلها ونراقبها.") 
      : (content.wowAndHow?.descriptionEn || content.wowAndHow?.description || "Creative ideas need operational engineering. We don't just design experiences—we build, staff, operate, and monitor them."),
    wowBullets: isAr 
      ? (content.wowAndHow?.wowBulletsAr?.length > 0 ? content.wowAndHow.wowBulletsAr : ['المفاهيم الإبداعية', 'الترفيه الغامر', 'البيئات المنسقة', 'سرد القصص'])
      : (content.wowAndHow?.wowBullets || ['Creative concepts', 'Immersive entertainment', 'Themed environments', 'Storytelling']),
    howBullets: isAr 
      ? (content.wowAndHow?.howBulletsAr?.length > 0 ? content.wowAndHow.howBulletsAr : ['جدوى وسلامة المشاريع', 'التصنيع والإخراج المنصي', 'تدفق الجماهير والتوظيف', 'العمليات المباشرة والتذاكر'])
      : (content.wowAndHow?.howBullets || ['Feasibility & Safety', 'Fabrication & Staging', 'Crowd flow & Staffing', 'Live Operations & Ticketing'])
  }

  // Determine which Services to show
  const featuredServiceIds = content?.featuredServiceIds || []
  let dbServices: any[] = []
  try {
    if (featuredServiceIds.length > 0) {
      dbServices = await db.service.findMany({
        where: { id: { in: featuredServiceIds }, isVisible: true }
      })
      dbServices.sort((a, b) => featuredServiceIds.indexOf(a.id) - featuredServiceIds.indexOf(b.id))
    } else {
      dbServices = await db.service.findMany({
        where: { isVisible: true, isFeatured: true },
        orderBy: { createdAt: 'desc' },
        take: 4
      })
    }
  } catch (error) {
    console.error("Error loading services for B2B home:", error)
  }

  // Determine which Case Studies to show
  const featuredCaseStudyIds = content?.featuredCaseStudyIds || []
  let dbProjects: any[] = []
  try {
    if (featuredCaseStudyIds.length > 0) {
      dbProjects = await db.caseStudy.findMany({
        where: { id: { in: featuredCaseStudyIds }, isPublished: true }
      })
      dbProjects.sort((a, b) => featuredCaseStudyIds.indexOf(a.id) - featuredCaseStudyIds.indexOf(b.id))
    } else {
      dbProjects = await db.caseStudy.findMany({
        where: { isPublished: true },
        orderBy: { year: 'desc' },
        take: 3
      })
    }
  } catch (error) {
    console.error("Error loading case studies for B2B home:", error)
  }

  // Fetch Partners safely from DB
  let dbPartners: any[] = []
  try {
    dbPartners = await db.partner.findMany({
      where: { isVisible: true },
      orderBy: [
        { orderIndex: 'asc' },
        { createdAt: 'desc' }
      ]
    })
  } catch (error) {
    console.error("Error loading partners for B2B home:", error)
  }

  const partnersList = dbPartners.length > 0 ? dbPartners : [
    { id: '1', name: 'Visit Qatar', logoUrl: '' },
    { id: '2', name: 'Qatar Tourism', logoUrl: '' },
    { id: '3', name: 'Qatar Calendar', logoUrl: '' },
    { id: '4', name: 'UDC', logoUrl: '' },
    { id: '5', name: 'QNCC', logoUrl: '' },
    { id: '6', name: 'Doha Festival City', logoUrl: '' }
  ]

  return (
    <div className="flex flex-col w-full" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. Hero: Ideas to Life */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <UniversalMediaRenderer 
            type={hero.mediaType || "IMAGE"} 
            src={hero.mediaUrl || (hero as any).backgroundImage || "/hero-b2b.jpg"}
            alt="Hero Background"
          />
          {/* Gradients to ensure text readability without purple/blue */}
          <div className="absolute inset-0 bg-zinc-950/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-transparent to-zinc-950" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8 pt-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-zinc-100 tracking-tighter leading-[1.1] mb-6">
              {hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 font-medium max-w-2xl mb-4">
              {hero.subtitle}
            </p>
            <p className="text-lg text-zinc-400 max-w-2xl mb-10">
              {hero.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              {hero.primaryCta && (
                <Link 
                  href={hero.primaryLink || `/${locale}/b2b/services`} 
                  className="px-8 py-4 bg-emerald-500 text-zinc-950 font-bold text-lg rounded-sm hover:bg-emerald-400 transition-colors"
                >
                  {hero.primaryCta}
                </Link>
              )}
              {hero.secondaryCta && (
                <Link 
                  href={hero.secondaryLink || `/${locale}/b2b/contact`} 
                  className="px-8 py-4 bg-transparent border-2 border-zinc-700 text-zinc-100 font-bold text-lg rounded-sm hover:border-zinc-500 hover:bg-zinc-800 transition-all"
                >
                  {hero.secondaryCta}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Credibility Board */}
      <section className="py-20 bg-zinc-950 border-b border-zinc-900">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat: any, i: number) => (
              <div key={i} className="flex flex-col border-s border-emerald-500/30 ps-6">
                <span className="text-4xl md:text-5xl font-black tracking-tight text-zinc-100 mb-2">
                  {isAr ? (stat.valueAr || stat.value) : stat.value}
                </span>
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-wide">
                  {isAr ? (stat.labelAr || stat.label) : stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Wow & How Split */}
      <section className="py-24 md:py-32 bg-zinc-950 relative">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight mb-6">
              {wowAndHow.title}
            </h2>
            <p className="text-lg text-zinc-400">
              {wowAndHow.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* WOW */}
            <div className="p-10 rounded-lg bg-zinc-900 border border-zinc-800">
              <h3 className="text-3xl font-black text-emerald-400 tracking-tight mb-8">
                {isAr ? "الإبهار (The WOW)" : "The WOW"}
              </h3>
              <ul className="space-y-6">
                {(wowAndHow.wowBullets || []).map((item: string) => (
                  <li key={item} className="flex items-center gap-4 text-xl font-medium text-zinc-300">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* HOW */}
            <div className="p-10 rounded-lg bg-zinc-900 border border-zinc-800">
              <h3 className="text-3xl font-black text-amber-500 tracking-tight mb-8">
                {isAr ? "التنفيذ (The HOW)" : "The HOW"}
              </h3>
              <ul className="space-y-6">
                {(wowAndHow.howBullets || []).map((item: string) => (
                  <li key={item} className="flex items-center gap-4 text-xl font-medium text-zinc-300">
                    <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Capabilities Preview */}
      <section className="py-24 bg-zinc-900 border-y border-zinc-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight mb-4">{isAr ? "القدرات الأساسية" : "Core Capabilities"}</h2>
              <p className="text-lg text-zinc-400">{isAr ? "كل ما يلزم لتقديم تجارب استثنائية." : "Everything required to deliver landmark experiences."}</p>
            </div>
            <Link href="/b2b/services" className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
              {isAr ? "عرض جميع الخدمات" : "View All Services"} <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dbServices.length > 0 ? (
              dbServices.map((service, i) => {
                const name = isAr ? (service.titleAr || service.titleEn || service.slug) : (service.titleEn || service.slug)
                const desc = isAr ? (service.taglineAr || service.contentAr?.substring(0, 150) || service.taglineEn || service.contentEn?.substring(0, 150) || "Premium entertainment service") : (service.taglineEn || service.contentEn?.substring(0, 150) || "Premium entertainment service")
                return (
                  <Link 
                    key={i} 
                    href={`/b2b/services/${service.slug}`}
                    className={cn(
                      "group relative rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-all overflow-hidden flex flex-col justify-between",
                      i === 0 ? "md:col-span-2 md:row-span-2 min-h-[400px]" : "min-h-[250px]"
                    )}
                  >
                    {/* Thumbnail Background */}
                    <div className="absolute inset-0 z-0">
                      {service.thumbnail ? (
                        <UniversalMediaRenderer 
                          type="IMAGE"
                          src={service.thumbnail}
                          alt={name}
                          className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                    </div>

                    <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                      <div className="mb-4">
                        {service.category && (
                          <div className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full backdrop-blur-sm">
                            {service.category}
                          </div>
                        )}
                        <h3 className={cn("font-black text-zinc-100 tracking-tight mb-2 group-hover:text-emerald-400 transition-colors", i === 0 ? "text-3xl" : "text-xl")}>
                          {name}
                        </h3>
                        <p className={cn("text-zinc-400 font-medium line-clamp-2", i === 0 ? "text-lg" : "text-sm")}>
                          {desc}
                        </p>
                      </div>
                      
                      {/* CTA */}
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-all duration-300">
                        {service.ctaPrimary || (isAr ? "استكشف القدرات" : "Explore Capability")} <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                      </div>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-4 text-center py-12 border border-zinc-800 rounded-lg text-zinc-500">
                No featured services yet. Add them in the Dashboard!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Featured Case Studies */}
      <section className="py-24 bg-zinc-950">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight mb-4">{isAr ? "أعمالنا المميزة" : "Featured Work"}</h2>
              <p className="text-lg text-zinc-400">{isAr ? "مشاريع استثنائية تم تسليمها في جميع أنحاء المنطقة." : "Landmark projects delivered across the region."}</p>
            </div>
            <Link href="/b2b/case-studies" className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
              {isAr ? "عرض جميع دراسات الحالة" : "View All Case Studies"} <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {dbProjects.length > 0 ? (
              dbProjects.map((project, i) => {
                const title = isAr ? (project.titleAr || project.titleEn || project.slug) : (project.titleEn || project.slug)
                return (
                  <Link key={i} href={`/b2b/case-studies/${project.slug}`} className="group block">
                    <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-zinc-900 mb-6">
                      {(project.thumbnailUrl || project.heroImageUrl) ? (
                        <UniversalMediaRenderer 
                          type={project.thumbnailMediaType || project.heroMediaType || "IMAGE"}
                          src={project.thumbnailUrl || project.heroImageUrl}
                          alt={title}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-600 font-medium">
                          [Cover: {title}]
                        </div>
                      )}
                      <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-100 mb-2">{title}</h3>
                    <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
                      <span>{project.clientName}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="text-emerald-400">{project.year}</span>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-3 text-center py-12 border border-zinc-800 rounded-lg text-zinc-500">
                No featured case studies yet. Publish some from the Dashboard!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. Delivery Process */}
      <section className="py-24 bg-zinc-900 border-y border-zinc-800">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-4xl font-black text-zinc-100 tracking-tight mb-16 text-center">{isAr ? "عملية التسليم" : "Delivery Process"}</h2>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 start-0 end-0 h-0.5 bg-zinc-800 -z-10" />
            
            {(isAr ? ['اكتشاف', 'تصميم', 'بناء', 'تشغيل', 'تقرير'] : ['Discover', 'Design', 'Build', 'Operate', 'Report']).map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center w-full md:w-auto">
                <div className="w-24 h-24 rounded-full bg-zinc-950 border-4 border-zinc-900 flex items-center justify-center font-black text-2xl text-emerald-500 mb-6">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-zinc-100">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Partner Ribbon */}
      <section className="py-16 bg-zinc-950 overflow-hidden border-b border-zinc-900">
        <div className="container mx-auto px-4 md:px-8 mb-8 text-center">
          <span className="text-sm font-bold text-zinc-500 uppercase tracking-wide">
            {isAr ? "شركاء النجاح" : "Trusted by Industry Leaders"}
          </span>
        </div>
        
        <div className="flex w-[200%] animate-marquee">
          <div className="flex flex-1 justify-around items-center gap-8 px-4">
            {partnersList.map((p, idx) => (
              <div key={p.id || idx} className="flex items-center justify-center shrink-0 mx-6">
                {p.logoUrl ? (
                  <img 
                    src={p.logoUrl} 
                    alt={p.name} 
                    className="h-10 md:h-14 max-w-[160px] md:max-w-[200px] object-contain filter grayscale brightness-200 opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                  />
                ) : (
                  <span className="text-2xl font-bold text-zinc-700 whitespace-nowrap hover:text-zinc-300 transition-colors">
                    {p.name}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-1 justify-around items-center gap-8 px-4">
            {partnersList.map((p, idx) => (
              <div key={`clone-${p.id || idx}`} className="flex items-center justify-center shrink-0 mx-6">
                {p.logoUrl ? (
                  <img 
                    src={p.logoUrl} 
                    alt={p.name} 
                    className="h-10 md:h-14 max-w-[160px] md:max-w-[200px] object-contain filter grayscale brightness-200 opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                  />
                ) : (
                  <span className="text-2xl font-bold text-zinc-700 whitespace-nowrap hover:text-zinc-300 transition-colors">
                    {p.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
