import React from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  ArrowUpRight, 
  CheckCircle2,
  Compass,
  Workflow,
  Building2,
  Trophy
} from 'lucide-react'
import { db } from "@/lib/db"
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Services & Capabilities — E3 Enterprise Atelier',
  description: 'Turnkey spatial design, event engineering, kinetic AV, live production, and landmark attraction operations in Qatar.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ServicesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  
  let page: any = null
  let services: any[] = []
  let caseStudies: any[] = []
  
  try {
    const results = await Promise.all([
      db.pages.findUnique({
        where: { slug: 'b2b-services' }
      }),
      db.service.findMany({
        where: { isVisible: true },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          projects: {
            take: 2,
            include: { attraction: true }
          }
        }
      }),
      db.caseStudy.findMany({
        where: { isPublished: true },
        orderBy: { year: 'desc' },
        take: 3
      })
    ])
    page = results[0]
    services = results[1]
    caseStudies = results[2]
  } catch (error) {
    console.error("Error fetching b2b services data:", error)
  }
  
  const content = (page?.content as any) || {}
  
  // Hero Data from CMS with default fallbacks
  const hero = {
    title: isAr 
      ? (content.hero?.titleAr || content.hero?.title || 'كل ما تحتاجه لبناء تجارب استثنائية') 
      : (content.hero?.titleEn || content.hero?.title || "Services That Build Living Experience Landmarks."),
    subtitle: isAr 
      ? (content.hero?.subtitleAr || content.hero?.subtitle || 'من الجدوى والتخطيط الاستراتيجي والتصميم الفضائي إلى التصنيع والتذاكر والإنتاج الحي والعمليات التشغيلية.') 
      : (content.hero?.subtitleEn || content.hero?.subtitle || "From feasibility, strategy and spatial design to fabrication, ticketing, technical production and live operations, E3 brings every layer of the experience together."),
    mediaType: content.hero?.mediaType || "IMAGE",
    mediaUrl: content.hero?.mediaUrl || "",
    primaryCta: isAr ? "استكشف القدرات" : "Explore Capabilities",
    secondaryCta: isAr ? "ابدأ مشروعاً" : "Start a Project"
  }
  
  // Philosophy Data from CMS with default fallbacks
  const philosophy = {
    title: isAr 
      ? (content.philosophy?.titleAr || "الأفكار الإبداعية تتطلب هندسة تشغيلية") 
      : (content.philosophy?.titleEn || "Creative Ideas Need Operational Engineering."),
    subtitle: isAr 
      ? (content.philosophy?.subtitleAr || "نحن لا نصمم التجارب فحسب — بل نخططها ونبنيها ونوظف طواقمها ونشغلها ونضمن أعلى مستويات السلامة.") 
      : (content.philosophy?.subtitleEn || "We don't just sketch concepts—we masterplan, fabricate, staff, operate, and continuously monitor physical assets."),
    creativeBullets: isAr 
      ? ['المفاهيم الفضائية المبتكرة', 'الهوية المرئية الغامرة', 'سرد القصص الترفيهية', 'التجارب التفاعلية'] 
      : ['Immersive Masterplanning', 'Spatial Concept Design', 'Entertainment Storytelling', 'Kinetic Environment Architecture'],
    engineeringBullets: isAr 
      ? ['دراسات الجدوى والسلامة', 'التصنيع والإخراج المنصي', 'التأجير والأنظمة الصوتية والضوئية', 'إدارة الحشود والعمليات المباشرة'] 
      : ['Structural Safety & Feasibility', 'Turnkey Fabrication & Rigging', 'Kinetic AV & Systems Integration', 'Crowd Analytics & Live Operations']
  }

  // Delivery Process Data
  const deliverySteps = isAr ? [
    { stepNumber: "01", name: "اكتشاف وتحديد", desc: "دراسات الجدوى الاستراتيجية وتحديد متطلبات السلامة والأهداف التجارية" },
    { stepNumber: "02", name: "بحث وتصميم", desc: "التخطيط الفضائي ثلاثي الأبعاد والخرائط المعمارية وأنظمة الإضاءة والصوت" },
    { stepNumber: "03", name: "هندسة وتخطيط", desc: "حسابات الأحمال، التراخيص الحكومية واعتمادات الهياكل القابلة للنفخ والتركيب" },
    { stepNumber: "04", name: "بناء وتفعيل", desc: "التصنيع الشامل، التركيبات المنصية، واختبار الأنظمة الذكية للتذاكر والبوابات" },
    { stepNumber: "05", name: "تشغيل وتحسين", desc: "التوظيف المباشر، إدارة تدفق الزوار، والتحليلات الفورية لتحسين العائد" }
  ] : [
    { stepNumber: "01", name: "Discover & Define", desc: "Strategic feasibility, safety compliance audit & commercial objective mapping" },
    { stepNumber: "02", name: "Research & Design", desc: "3D spatial masterplanning, kinetic AV integration & architectural blueprints" },
    { stepNumber: "03", name: "Engineer & Plan", desc: "Load calculations, structural engineering & regulatory safety certification" },
    { stepNumber: "04", name: "Build & Activate", desc: "Turnkey fabrication, stage rigging, gate turnstiles & system commissioning" },
    { stepNumber: "05", name: "Operate & Optimize", desc: "Live crowd flow, staffing, real-time ticketing telemetry & post-event scaling" }
  ]

  // CTA Section Data
  const cta = {
    title: isAr ? (content.cta?.titleAr || content.cta?.title || "مستعد لبناء تجربتك القادمة؟") : (content.cta?.titleEn || content.cta?.title || "Ready to Bring Your Experience to Life?"),
    description: isAr ? (content.cta?.descriptionAr || content.cta?.description || "تواصل مع فريق الأعمال لتحديد الحزمة المناسبة لمشروعك.") : (content.cta?.descriptionEn || content.cta?.description || "Tell us what you are planning. We will assemble the right combination of strategy, creativity, technology, production and operations."),
    primaryCta: isAr ? (content.cta?.primaryCtaAr || content.cta?.primaryCta || "طلب عرض سعر (RFP)") : (content.cta?.primaryCtaEn || content.cta?.primaryCta || "Request a Proposal"),
    primaryLink: content.cta?.primaryLink || `/${locale}/b2b/contact`
  }

  // Filter featured services for spotlight
  const featuredServices = services.filter(s => s.isFeatured);

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-zinc-900/80 pt-24 pb-16">
        <div className="absolute inset-0 z-0">
          {hero.mediaUrl ? (
            <UniversalMediaRenderer 
              type={hero.mediaType as any || "IMAGE"} 
              src={hero.mediaUrl}
              alt="E3 Capabilities Hero"
              className="w-full h-full object-cover filter brightness-[0.65] contrast-[1.1]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
          )}
          {/* OLED Dark Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-15 mix-blend-overlay pointer-events-none" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-6 backdrop-blur-md">
              <Cpu className="w-3.5 h-3.5" />
              <span>{isAr ? "قدرات إي ثري لقطاع الأعمال" : "E3 ENTERPRISE CAPABILITIES"}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-syne text-zinc-100 tracking-tight leading-[1.05] mb-6 drop-shadow-xl">
              {hero.title}
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-zinc-300 font-medium max-w-3xl mb-10 leading-relaxed">
              {hero.subtitle}
            </p>

            {/* CTA Group */}
            <div className="flex flex-wrap items-center gap-4">
              <a 
                href="#capability-navigator" 
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-zinc-950 font-bold text-base rounded-full hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
              >
                <span>{hero.primaryCta}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
              </a>
              
              <Link 
                href={`/${locale}/b2b/contact`} 
                className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/80 text-zinc-100 font-bold text-base rounded-full hover:border-zinc-500 hover:bg-zinc-800 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>{hero.secondaryCta}</span>
                <ArrowUpRight className="w-5 h-5 text-zinc-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC INTEGRATED CAPABILITY STATEMENT */}
      <section className="py-12 bg-zinc-950 border-b border-zinc-900">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xl md:text-2xl font-black font-syne tracking-tight text-zinc-100">
              {services.length} {isAr ? 'قدرات تخصصية متكاملة. شريك واحد.' : 'Specialised Capabilities. One Integrated Partner.'}
            </span>
          </div>
        </div>
      </section>

      {/* 3. SERVICE PHILOSOPHY SPLIT-SCREEN */}
      <section className="py-24 md:py-32 bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-1/2 start-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 end-0 w-[500px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">{isAr ? "فلسفة التنفيذ" : "OUR PHILOSOPHY"}</span>
            <h2 className="text-4xl md:text-6xl font-black font-syne text-zinc-100 tracking-tight mb-6">
              {philosophy.title}
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              {philosophy.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Creative Pillar */}
            <div className="p-8 md:p-12 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/50 backdrop-blur-md transition-all duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">{isAr ? "الابتكار الإبداعي" : "CREATIVE CONCEPTUALIZATION"}</span>
                  <h3 className="text-3xl font-black font-syne text-emerald-400 tracking-tight">
                    {isAr ? "التصميم وسرد القصص" : "Creative Vision"}
                  </h3>
                </div>
              </div>
              <ul className="space-y-4">
                {philosophy.creativeBullets.map((bullet, i) => (
                  <li key={i} className="flex items-center gap-3 text-base font-medium text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Operational Pillar */}
            <div className="p-8 md:p-12 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/50 backdrop-blur-md transition-all duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">{isAr ? "الهندسة والتشغيل" : "OPERATIONAL STAGING"}</span>
                  <h3 className="text-3xl font-black font-syne text-amber-400 tracking-tight">
                    {isAr ? "التصنيع والعمليات" : "Operational Engineering"}
                  </h3>
                </div>
              </div>
              <ul className="space-y-4">
                {philosophy.engineeringBullets.map((bullet, i) => (
                  <li key={i} className="flex items-center gap-3 text-base font-medium text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DYNAMIC CAPABILITY NAVIGATOR (BENTO GRID) */}
      <section id="capability-navigator" className="py-24 bg-zinc-900/40 border-y border-zinc-800/80">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-3">
                <Workflow className="w-3.5 h-3.5" />
                <span>{isAr ? "استكشف كافة الخدمات" : "CAPABILITY NAVIGATOR"}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight mb-4">
                {isAr ? "دليل القدرات التخصصية" : "Specialised Capabilities"}
              </h2>
              <p className="text-lg text-zinc-400 max-w-xl">
                {isAr ? "تصفح كافة حلول الإنتاج والتشغيل المصممة للمشاريع الكبرى في قطر والمنطقة." : "Explore turnkey event engineering, kinetic AV, spatial fabrication, and live crowd management."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.length > 0 ? (
              services.map((service, i) => {
                const name = isAr ? (service.titleAr || service.titleEn || service.slug) : (service.titleEn || service.slug)
                const tagline = isAr 
                  ? (service.taglineAr || service.contentAr?.substring(0, 140) || "خدمات إنتاج وتصنيع غامرة") 
                  : (service.taglineEn || service.contentEn?.substring(0, 140) || "Turnkey spatial engineering service")
                
                // Calculate bento span rules dynamically
                const isAnchorTile = service.isFeatured || i % 7 === 0;

                return (
                  <Link 
                    key={service.id} 
                    href={`/${locale}/b2b/services/${service.slug}`}
                    className={cn(
                      "group relative rounded-3xl bg-zinc-950 border border-zinc-800/80 hover:border-emerald-500/60 transition-all duration-500 overflow-hidden flex flex-col justify-between p-8 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]",
                      isAnchorTile ? "md:col-span-2 md:row-span-2 min-h-[440px]" : "min-h-[290px]"
                    )}
                  >
                    {/* Media Thumbnail Background */}
                    <div className="absolute inset-0 z-0">
                      {service.thumbnail ? (
                        <UniversalMediaRenderer 
                          type="IMAGE"
                          src={service.thumbnail}
                          alt={name}
                          className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <span className="w-10 h-10 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-emerald-400 backdrop-blur-md">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        
                        {service.category && (
                          <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full backdrop-blur-md">
                            {service.category}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="mt-auto pt-8">
                        <h3 className={cn("font-black font-syne text-zinc-100 tracking-tight mb-2 group-hover:text-emerald-400 transition-colors", isAnchorTile ? "text-3xl" : "text-xl")}>
                          {name}
                        </h3>
                        <p className={cn("text-zinc-400 font-medium line-clamp-2 leading-relaxed mb-4", isAnchorTile ? "text-base" : "text-xs")}>
                          {tagline}
                        </p>

                        {/* CTA Link Indicator */}
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest opacity-80 group-hover:opacity-100 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-all duration-300">
                          <span>{isAr ? "عرض التفاصيل والخدمات" : "Explore Capability"}</span>
                          <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-4 text-center py-20 border border-zinc-800/80 rounded-3xl text-zinc-500">
                {isAr ? "جاري تحديث قائمة الخدمات والتخصصات." : "Services directory is currently being updated."}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. FEATURED SERVICE SPOTLIGHTS */}
      {featuredServices.length > 0 && (
        <section className="py-24 bg-zinc-950 border-b border-zinc-900">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">{isAr ? "القدرات المميزة" : "FEATURED SPOTLIGHTS"}</span>
              <h2 className="text-4xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight">
                {isAr ? "تخصصات الاستجابة الفورية" : "Landmark Discipline Spotlights"}
              </h2>
            </div>

            <div className="space-y-16">
              {featuredServices.map((fs, idx) => {
                const fsTitle = isAr ? (fs.titleAr || fs.titleEn) : fs.titleEn;
                const fsTagline = isAr ? (fs.taglineAr || fs.contentAr?.substring(0, 200)) : (fs.taglineEn || fs.contentEn?.substring(0, 200));

                return (
                  <div key={fs.id} className="relative rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-8 md:p-12 overflow-hidden flex flex-col lg:flex-row items-center gap-12 backdrop-blur-md">
                    <div className="w-full lg:w-1/2 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-widest">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>FEATURED CAPABILITY 0{idx + 1}</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black font-syne text-zinc-100 tracking-tight">
                        {fsTitle}
                      </h3>
                      <p className="text-base text-zinc-300 leading-relaxed font-medium">
                        {fsTagline}
                      </p>
                      
                      <div className="pt-4 flex flex-wrap gap-4">
                        <Link 
                          href={`/${locale}/b2b/services/${fs.slug}`}
                          className="px-6 py-3 bg-emerald-500 text-zinc-950 font-bold rounded-full hover:bg-emerald-400 transition-colors inline-flex items-center gap-2 text-sm"
                        >
                          <span>{isAr ? "عرض تفاصيل الخدمة" : "View Service Scope"}</span>
                          <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                        </Link>
                        <Link 
                          href={`/${locale}/b2b/contact`}
                          className="px-6 py-3 bg-zinc-800 text-zinc-100 font-bold rounded-full hover:bg-zinc-700 transition-colors text-sm"
                        >
                          {isAr ? "اطلب هذا التخصص" : "Request This Discipline"}
                        </Link>
                      </div>
                    </div>

                    <div className="w-full lg:w-1/2 aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 relative">
                      {fs.heroMediaUrl || fs.thumbnail ? (
                        <UniversalMediaRenderer 
                          type={fs.heroMediaType as any || "IMAGE"}
                          src={fs.heroMediaUrl || fs.thumbnail}
                          alt={fsTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono">[Featured Media: {fsTitle}]</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 6. DELIVERY METHODOLOGY PIPELINE */}
      <section className="py-24 md:py-32 bg-zinc-900/40 border-b border-zinc-800/80">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">{isAr ? "منهجية التنفيذ" : "DELIVERY PIPELINE"}</span>
            <h2 className="text-4xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight mb-4">
              {isAr ? "خطوات التسليم التنفيذي" : "End-to-End Delivery Methodology"}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {deliverySteps.map((step, i) => (
              <div key={i} className="group relative p-6 rounded-3xl bg-zinc-950 border border-zinc-800/80 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                  <span className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-xl text-emerald-400">
                    {step.stepNumber}
                  </span>
                  <span className="text-xs font-mono text-zinc-600">PHASE 0{i + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-syne text-zinc-100 group-hover:text-emerald-400 transition-colors mb-2">{step.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. RELATED PROOF & CASE STUDIES */}
      {caseStudies.length > 0 && (
        <section className="py-24 bg-zinc-950 border-b border-zinc-900">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs uppercase tracking-widest mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? "نتائج تنفيذية موثقة" : "VERIFIED PROOF"}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight mb-4">
                  {isAr ? "مشاريع ودراسات حالة حية" : "Delivered Case Studies"}
                </h2>
              </div>
              <Link 
                href={`/${locale}/b2b/cases`} 
                className="inline-flex items-center gap-2 text-emerald-400 font-bold text-base hover:text-emerald-300 transition-colors group"
              >
                <span>{isAr ? "عرض جميع المشاريع" : "View All Case Studies"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {caseStudies.map((cs) => {
                const title = isAr ? (cs.titleAr || cs.titleEn) : cs.titleEn
                return (
                  <Link key={cs.id} href={`/${locale}/b2b/cases/${cs.slug}`} className="group block">
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-900 mb-6 border border-zinc-800/80 group-hover:border-emerald-500/50 transition-all duration-500">
                      {(cs.thumbnailUrl || cs.heroImageUrl) ? (
                        <UniversalMediaRenderer 
                          type={cs.thumbnailMediaType || cs.heroMediaType || "IMAGE"}
                          src={cs.thumbnailUrl || cs.heroImageUrl}
                          alt={title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-600 font-medium">
                          [Cover: {title}]
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                      <div className="absolute top-4 end-4">
                        <span className="px-3 py-1 text-xs font-mono font-bold bg-zinc-950/80 border border-zinc-800 text-emerald-400 rounded-full backdrop-blur-md">
                          {cs.year || '2026'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold font-syne text-zinc-100 group-hover:text-emerald-400 transition-colors mb-2">{title}</h3>
                    <div className="flex items-center gap-3 text-sm font-mono text-zinc-400">
                      <span>{cs.clientName || 'E3 Project'}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 8. FINAL INQUIRY & RFP SECTION */}
      <section className="py-24 border-t border-zinc-900 bg-zinc-950 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-6">
            <Building2 className="w-3.5 h-3.5" />
            <span>{isAr ? "تقديم طلبات المشاريع" : "COMMERCIAL PROPOSALS"}</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight mb-6">
            {cta.title}
          </h2>
          <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
            {cta.description}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href={cta.primaryLink}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 text-zinc-950 font-bold text-lg rounded-full hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
            >
              <span>{cta.primaryCta}</span>
              <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  )
}
