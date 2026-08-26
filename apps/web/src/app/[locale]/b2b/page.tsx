import React from 'react'
import Link from 'next/link'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { ArrowRight, CheckCircle2, Sparkles, Layers, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import db from '@/lib/db'
import { B2BBrandPortfolio } from '@/components/b2b/brands/B2BBrandPortfolio'
import { DEFAULT_B2B_HOME_CONTENT } from '@/lib/cms-default-pages'
import { localizeHref } from '@/lib/url-helper'
import { Reveal } from '@/components/motion/Reveal'
import { SplitHeadline } from '@/components/motion/SplitHeadline'
import { B2BBlueprintDepthSection } from '@/components/b2b/home/B2BBlueprintDepthSection'
import { B2BInteractiveCta } from '@/components/b2b/home/B2BInteractiveCta'
import { LivingHeroHeadline } from '@/components/b2b/shared/LivingHeroHeadline'
import { getPublicCaseStudies } from '@/lib/case-studies'
import { filterAndResolvePublicPartners } from '@/lib/partners/partner-resolver'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  
  const rawContent = (page?.content as any) || {}
  
  // Deep merge rawContent with DEFAULT_B2B_HOME_CONTENT so no section is ever empty or hardcoded
  const content = {
    ...DEFAULT_B2B_HOME_CONTENT,
    ...rawContent,
    hero: { ...DEFAULT_B2B_HOME_CONTENT.hero, ...(rawContent.hero || {}) },
    stats: (rawContent.stats && rawContent.stats.length > 0) ? rawContent.stats : DEFAULT_B2B_HOME_CONTENT.stats,
    wowAndHow: { ...DEFAULT_B2B_HOME_CONTENT.wowAndHow, ...(rawContent.wowAndHow || {}) },
    capabilities: { ...DEFAULT_B2B_HOME_CONTENT.capabilities, ...(rawContent.capabilities || {}) },
    caseStudies: { ...DEFAULT_B2B_HOME_CONTENT.caseStudies, ...(rawContent.caseStudies || {}) },
    deliveryProcess: { 
      ...DEFAULT_B2B_HOME_CONTENT.deliveryProcess, 
      ...(rawContent.deliveryProcess || {}),
      steps: (rawContent.deliveryProcess?.steps && rawContent.deliveryProcess.steps.length > 0) 
        ? rawContent.deliveryProcess.steps 
        : DEFAULT_B2B_HOME_CONTENT.deliveryProcess.steps
    },
    partnerRibbon: { ...DEFAULT_B2B_HOME_CONTENT.partnerRibbon, ...(rawContent.partnerRibbon || {}) }
  }

  // 1. Hero Data
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
    primaryLink: localizeHref('/b2b/services', locale),
    secondaryCta: isAr 
      ? (content.hero?.secondaryCtaAr || content.hero?.secondaryCta || "ابدأ مشروعاً") 
      : (content.hero?.secondaryCtaEn || content.hero?.secondaryCta || "Start a Project"),
    secondaryLink: localizeHref('/b2b/contact', locale),
    media: content.hero?.media,
    mediaType: content.hero?.media?.mediaType || content.hero?.mediaType || "IMAGE",
    mediaUrl: content.hero?.media?.mediaUrl || content.hero?.mediaUrl || (content.hero as any)?.backgroundImage || "",
    backgroundImage: (content.hero as any)?.backgroundImage || "",
    posterImage: content.hero?.media?.posterUrl || (content.hero as any)?.posterImage || ""
  }

  // 2. Stats Data
  const stats = (content?.stats || []).map((s: any) => ({
    value: isAr ? (s.valueAr || s.value) : s.value,
    label: isAr ? (s.labelAr || s.label) : s.label
  }))

  // 3. WOW & HOW Data
  const wowAndHow = {
    title: isAr 
      ? (content.wowAndHow?.titleAr || content.wowAndHow?.title || "الإبهار والتنفيذ الاحترافي") 
      : (content.wowAndHow?.titleEn || content.wowAndHow?.title || "The WOW & The HOW"),
    description: isAr 
      ? (content.wowAndHow?.descriptionAr || content.wowAndHow?.description || "الأفكار الإبداعية تتطلب هندسة تشغيلية. نحن لا نصمم التجارب فحسب — بل نبنيها ونوظف طواقمها ونشغلها ونراقبها.") 
      : (content.wowAndHow?.descriptionEn || content.wowAndHow?.description || "Creative ideas need operational engineering. We don't just design experiences—we build, staff, operate, and monitor them."),
    wowBullets: isAr 
      ? (content.wowAndHow?.wowBulletsAr?.length > 0 ? content.wowAndHow.wowBulletsAr : ['المفاهيم الإبداعية', 'الترفيه الغامر', 'البيئات المنسقة', 'سرد القصص'])
      : (content.wowAndHow?.wowBulletsEn?.length > 0 ? content.wowAndHow.wowBulletsEn : ['Creative concepts', 'Immersive entertainment', 'Themed environments', 'Storytelling']),
    howBullets: isAr 
      ? (content.wowAndHow?.howBulletsAr?.length > 0 ? content.wowAndHow.howBulletsAr : ['جدوى وسلامة المشاريع', 'التصنيع والإخراج المنصي', 'تدفق الجماهير والتوظيف', 'العمليات المباشرة والتذاكر'])
      : (content.wowAndHow?.howBulletsEn?.length > 0 ? content.wowAndHow.howBulletsEn : ['Feasibility & Safety', 'Fabrication & Staging', 'Crowd flow & Staffing', 'Live Operations & Ticketing'])
  }

  // 4. Capabilities Header Data
  const capabilities = {
    title: isAr 
      ? (content.capabilities?.titleAr || "القدرات الأساسية") 
      : (content.capabilities?.titleEn || content.capabilities?.title || "Core Capabilities"),
    description: isAr 
      ? (content.capabilities?.descriptionAr || "كل ما يلزم لتقديم تجارب استثنائية.") 
      : (content.capabilities?.descriptionEn || content.capabilities?.description || "Everything required to deliver landmark experiences."),
    cta: isAr 
      ? (content.capabilities?.ctaAr || "عرض جميع الخدمات") 
      : (content.capabilities?.ctaEn || content.capabilities?.cta || "View All Services")
  }

  // 5. Featured Case Studies Header Data
  const caseStudiesHeader = {
    title: isAr 
      ? (content.caseStudies?.titleAr || "أعمالنا المميزة") 
      : (content.caseStudies?.titleEn || content.caseStudies?.title || "Featured Work"),
    description: isAr 
      ? (content.caseStudies?.descriptionAr || "مشاريع استثنائية تم تسليمها في جميع أنحاء المنطقة.") 
      : (content.caseStudies?.descriptionEn || content.caseStudies?.description || "Landmark projects delivered across the region."),
    cta: isAr 
      ? (content.caseStudies?.ctaAr || "عرض جميع دراسات الحالة") 
      : (content.caseStudies?.ctaEn || content.caseStudies?.cta || "View All Case Studies")
  }

  // 6. Delivery Process Data
  const deliveryProcess = {
    title: isAr 
      ? (content.deliveryProcess?.titleAr || "منظومة مرحلية للتسليم التشغيلي") 
      : (content.deliveryProcess?.titleEn || content.deliveryProcess?.title || "Delivery Process"),
    steps: (content.deliveryProcess?.steps || []).map((step: any, idx: number) => ({
      stepNumber: step.stepNumber || String(idx + 1).padStart(2, '0'),
      name: isAr ? (step.nameAr || step.name) : (step.nameEn || step.name),
      desc: isAr ? (step.descAr || step.desc) : (step.descEn || step.desc)
    }))
  }

  // 7. Partner Ribbon Data
  const partnerRibbon = {
    title: isAr 
      ? (content.partnerRibbon?.titleAr || "شركاء النجاح") 
      : (content.partnerRibbon?.titleEn || content.partnerRibbon?.title || "Trusted by Industry Leaders")
  }

  // Fetch Services from Database
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

  // Fetch Case Studies using shared canonical helper (QF-05)
  const featuredCaseStudyIds = content?.featuredCaseStudyIds || []
  let dbProjects: any[] = []
  try {
    dbProjects = await getPublicCaseStudies({
      ids: featuredCaseStudyIds.length > 0 ? featuredCaseStudyIds : undefined,
      limit: 3,
      featuredFirst: true
    })
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

  const resolvedPartners = filterAndResolvePublicPartners(dbPartners);
  const partnersList = resolvedPartners.length > 0 ? resolvedPartners : [
    { id: '1', name: 'Visit Qatar', logoUrl: '' },
    { id: '2', name: 'Qatar Tourism', logoUrl: '' },
    { id: '3', name: 'Qatar Calendar', logoUrl: '' },
    { id: '4', name: 'UDC', logoUrl: '' },
    { id: '5', name: 'QNCC', logoUrl: '' },
    { id: '6', name: 'Doha Festival City', logoUrl: '' }
  ]

  // Fetch Brands for IP Portfolio
  let dbBrands: any[] = []
  try {
    dbBrands = await db.brandIP.findMany({
      where: { isActive: true, showOnB2B: true },
      include: { category: true },
      orderBy: { b2bDisplayOrder: 'asc' }
    })
  } catch (error) {
    console.error("Error loading brands for B2B home:", error)
  }

  // Inject dynamic brands into CMS data if not hardcoded
  if (content && dbBrands.length > 0) {
    if (!content.ourBrands) content.ourBrands = {};
    content.ourBrands.brands = dbBrands.map((b: any) => ({
      ...b,
      id: b.id,
      nameEn: b.b2bTitleOverrideEn || b.nameEn,
      nameAr: b.b2bTitleOverrideAr || b.nameAr,
      logoPrimary: b.primaryLogoUrl || b.lightLogoUrl || b.darkLogoUrl || b.compactLogoUrl,
      logoLight: b.lightLogoUrl,
      logoDark: b.darkLogoUrl,
      logoCompact: b.compactLogoUrl || b.primaryLogoUrl,
      brandColor: b.brandColor || "#10b981",
      relationship: b.primaryRelationshipId || "OWNED",
      shortDescEn: b.b2bShortDescOverrideEn || b.shortDescriptionEn || b.taglineEn,
      shortDescAr: b.b2bShortDescOverrideAr || b.shortDescriptionAr || b.taglineAr,
      detailCopyEn: b.b2bDetailCopyEn || b.fullStoryEn,
      detailCopyAr: b.b2bDetailCopyAr || b.fullStoryAr,
      b2bBusinessOverviewEn: b.b2bBusinessOverviewEn || b.shortDescriptionEn || b.taglineEn || b.fullStoryEn,
      b2bBusinessOverviewAr: b.b2bBusinessOverviewAr || b.shortDescriptionAr || b.taglineAr || b.fullStoryAr,
      b2bBusinessValueEn: b.b2bBusinessValueEn || b.b2bDetailCopyEn || b.fullStoryEn || b.shortDescriptionEn,
      b2bBusinessValueAr: b.b2bBusinessValueAr || b.b2bDetailCopyAr || b.fullStoryAr || b.shortDescriptionAr,
      b2bCapabilitiesEn: b.b2bCapabilitiesEn,
      b2bCapabilitiesAr: b.b2bCapabilitiesAr,
      b2bCtaLabelEn: b.b2bCtaLabelEn || "Inquire for Partnership",
      b2bCtaLabelAr: b.b2bCtaLabelAr || "طلب شراكة واستثمار",
      b2bInquiryUrl: b.b2bInquiryUrl || b.b2bCtaUrl || "/b2b/contact",
      primaryMediaUrl: b.primaryMediaUrl || b.coverMediaUrl || b.thumbnailUrl,
      coverMediaUrl: b.coverMediaUrl || b.primaryMediaUrl || b.thumbnailUrl,
      ctaUrl: localizeHref(b.b2bInquiryUrl || b.b2bCtaUrl || '/b2b/contact', locale)
    }));
  }

  return (
    <div className="flex flex-col w-full bg-[var(--bg-level-1)] text-[var(--text-primary)] font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-[var(--border-level-1)]">
        <div className="absolute inset-0 z-0">
          <UniversalMediaRenderer 
            type={hero.media?.mediaType || hero.mediaType || "IMAGE"} 
            src={(hero.media?.mediaUrl || hero.mediaUrl || (hero as any).backgroundImage || "/hero-bg.png").replace("/hero-b2b.jpg", "/hero-bg.png")}
            poster={(hero.media?.posterUrl || (hero as any).posterImage || "").replace("/hero-b2b.jpg", "/hero-bg.png") || undefined}
            alt="E3 Enterprise Hero"
            className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.1]"
          />
          {/* OLED / Light Adaptive Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-[var(--bg-level-1)]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-level-1)]/90 via-[var(--bg-level-1)]/50 to-transparent rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-15 mix-blend-overlay pointer-events-none" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8 pt-24 pb-16">
          <div className="max-w-5xl">
            {/* Indicator Eyebrow */}
            <Reveal direction="fade">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs uppercase tracking-widest mb-6 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{isAr ? "منظومة إي ثري لقطاع الأعمال" : "E3 ENTERPRISE ATELIER"}</span>
              </div>
            </Reveal>

            {/* Two-Line Living Kinetic Headline */}
            <Reveal direction="fade" delay={0.05}>
              <div className="mb-6">
                <LivingHeroHeadline
                  headlineTemplateEn={content.hero?.headlineTemplateEn || content.hero?.fixedHeadlineEn || content.hero?.titleEn || content.hero?.title || "Ideas to {{animated}}"}
                  headlineTemplateAr={content.hero?.headlineTemplateAr || content.hero?.fixedHeadlineAr || content.hero?.titleAr || content.hero?.title || "تحويل الأفكار إلى {{animated}}"}
                  rotatingWordsEn={content.hero?.rotatingWordsEn}
                  rotatingWordsAr={content.hero?.rotatingWordsAr}
                  enableRotatingWords={content.hero?.enableRotatingWords !== false}
                  animationSpeed={content.hero?.animationSpeed || 2800}
                  locale={locale}
                  align={isAr ? "start" : "start"}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.75rem] font-black font-syne text-[var(--text-primary)] tracking-tight leading-[1.08] drop-shadow-md"
                  gradientClass="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"
                />
              </div>
            </Reveal>

            {/* Subtitle */}
            <Reveal direction="slide-up" delay={0.15}>
              <p className="text-xl md:text-2xl text-[var(--text-primary)]/90 font-medium max-w-3xl mb-4 leading-relaxed">
                {hero.subtitle}
              </p>
            </Reveal>

            {/* Description */}
            <Reveal direction="slide-up" delay={0.25}>
              <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mb-10 leading-relaxed">
                {hero.description}
              </p>
            </Reveal>
            
            {/* CTA Group */}
            <Reveal direction="slide-up" delay={0.35}>
              <div className="flex flex-wrap items-center gap-4">
                {hero.primaryCta && (
                  <B2BInteractiveCta
                    href={hero.primaryLink || `/${locale}/b2b/services`}
                    label={hero.primaryCta}
                    variant="primary"
                    iconType="arrow-right"
                  />
                )}
                {hero.secondaryCta && (
                  <B2BInteractiveCta
                    href={hero.secondaryLink || `/${locale}/b2b/contact`}
                    label={hero.secondaryCta}
                    variant="secondary"
                    iconType="arrow-up-right"
                  />
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2. CREDIBILITY STATS BOARD */}
      <section className="py-16 bg-[var(--surface-default)] border-b border-[var(--border-level-1)] relative z-10 transition-colors">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat: any, i: number) => (
              <div 
                key={i} 
                className="group p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-2)] hover:border-emerald-500/40 transition-all duration-300 shadow-xs"
              >
                <div className="flex flex-col border-s-2 border-emerald-500/50 ps-4">
                  <span className="text-4xl md:text-5xl font-black font-syne tracking-tight text-[var(--text-primary)] mb-1 group-hover:text-emerald-500 transition-colors">
                    {stat.value}
                  </span>
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE WOW & THE HOW PILLAR SPLIT */}
      <section className="py-24 md:py-32 bg-[var(--bg-level-1)] relative overflow-hidden transition-colors">
        <div className="absolute top-1/2 start-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 end-0 w-[500px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-secondary)] font-mono text-xs uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isAr ? "منهجية إي ثري" : "E3 METHODOLOGY"}</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-6">
              {wowAndHow.title}
            </h2>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              {wowAndHow.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* The WOW */}
            <div className="group p-8 md:p-12 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-emerald-500/50 backdrop-blur-md transition-all duration-500 shadow-sm hover:shadow-[0_0_50px_rgba(16,185,129,0.1)]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">{isAr ? "الرؤية الإبداعية" : "CREATIVE VISION"}</span>
                  <h3 className="text-3xl font-black font-syne text-emerald-500 tracking-tight">
                    {isAr ? "الإبهار (The WOW)" : "The WOW"}
                  </h3>
                </div>
              </div>
              <ul className="space-y-5">
                {(wowAndHow.wowBullets || []).map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-4 text-lg font-medium text-[var(--text-primary)]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The HOW */}
            <div className="group p-8 md:p-12 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-amber-500/50 backdrop-blur-md transition-all duration-500 shadow-sm hover:shadow-[0_0_50px_rgba(245,158,11,0.1)]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono text-amber-500 uppercase tracking-widest">{isAr ? "الهندسة التشغيلية" : "OPERATIONAL ENGINEERING"}</span>
                  <h3 className="text-3xl font-black font-syne text-amber-500 tracking-tight">
                    {isAr ? "التنفيذ (The HOW)" : "The HOW"}
                  </h3>
                </div>
              </div>
              <ul className="space-y-5">
                {(wowAndHow.howBullets || []).map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-4 text-lg font-medium text-[var(--text-primary)]">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 BLUEPRINT-TO-LIVE DEPTH TRANSITION PILOT */}
      <B2BBlueprintDepthSection locale={locale} />

      {/* 4. CORE CAPABILITIES BENTO GRID */}
      <section className="py-24 bg-[var(--bg-level-2)] border-y border-[var(--border-level-1)] transition-colors">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-xs uppercase tracking-widest mb-3">
                <Cpu className="w-3.5 h-3.5" />
                <span>{isAr ? "الخدمات والحلول" : "SOLUTIONS & SERVICES"}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-4">
                {capabilities.title}
              </h2>
              <p className="text-lg text-[var(--text-secondary)] max-w-xl">
                {capabilities.description}
              </p>
            </div>
            <Link 
              href={`/${locale}/b2b/services`} 
              className="inline-flex items-center gap-2 text-emerald-500 font-bold text-base hover:text-emerald-600 transition-colors group"
            >
              <span>{capabilities.cta}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dbServices.length > 0 ? (
              dbServices.map((service, i) => {
                const name = isAr ? (service.titleAr || service.titleEn || service.slug) : (service.titleEn || service.slug)
                const desc = isAr ? (service.taglineAr || service.contentAr?.substring(0, 150) || service.taglineEn || service.contentEn?.substring(0, 150) || "خدمات إنتاج ترفيهي متكاملة") : (service.taglineEn || service.contentEn?.substring(0, 150) || "Turnkey entertainment production service")
                return (
                  <Link 
                    key={i} 
                    href={`/${locale}/b2b/services/${service.slug}`}
                    className={cn(
                      "group relative rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-emerald-500/60 transition-all duration-500 overflow-hidden flex flex-col justify-between p-8 shadow-xs hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]",
                      i === 0 ? "md:col-span-2 md:row-span-2 min-h-[440px]" : "min-h-[280px]"
                    )}
                  >
                    {/* Media Thumbnail Background */}
                    <div className="absolute inset-0 z-0">
                      {service.thumbnail ? (
                        <UniversalMediaRenderer 
                          type="IMAGE"
                          src={service.thumbnail}
                          alt={name}
                          className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-all duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--bg-level-1)] to-[var(--bg-level-2)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-[var(--surface-default)]/80 to-transparent" />
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        {service.category && (
                          <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full backdrop-blur-md">
                            {service.category}
                          </span>
                        )}
                        <ArrowUpRight className="w-6 h-6 text-[var(--text-tertiary)] group-hover:text-emerald-500 transition-colors" />
                      </div>

                      <div className="mt-auto pt-8">
                        <h3 className={cn("font-black font-syne text-[var(--text-primary)] tracking-tight mb-2 group-hover:text-emerald-500 transition-colors", i === 0 ? "text-3xl" : "text-xl")}>
                          {name}
                        </h3>
                        <p className={cn("text-[var(--text-secondary)] font-medium line-clamp-2 leading-relaxed", i === 0 ? "text-base" : "text-xs")}>
                          {desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-4 text-center py-16 border border-[var(--border-level-2)] rounded-3xl text-[var(--text-tertiary)]">
                {isAr ? "لم يتم إضافة خدمات مميزة بعد. قم بإضافتها عبر لوحة التحكم!" : "No featured services configured yet. Add them in the Dashboard!"}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. FEATURED CASE STUDIES */}
      <section className="py-24 bg-[var(--bg-level-1)] transition-colors">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-secondary)] font-mono text-xs uppercase tracking-widest mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isAr ? "دراسات الحالة والنتائج" : "PROVEN PORTFOLIO"}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-4">
                {caseStudiesHeader.title}
              </h2>
              <p className="text-lg text-[var(--text-secondary)] max-w-xl">
                {caseStudiesHeader.description}
              </p>
            </div>
            <Link 
              href={localizeHref('/b2b/cases', locale)} 
              className="inline-flex items-center gap-2 text-emerald-500 font-bold text-base hover:text-emerald-600 transition-colors group"
            >
              <span>{caseStudiesHeader.cta}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {dbProjects.length > 0 ? (
              dbProjects.map((project, i) => {
                const title = isAr ? (project.titleAr || project.titleEn || project.slug) : (project.titleEn || project.slug)
                return (
                  <Link key={i} href={localizeHref(`/b2b/cases/${project.slug}`, locale)} className="group block">
                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[var(--surface-default)] mb-6 border border-[var(--border-level-2)] group-hover:border-emerald-500/50 transition-all duration-500 shadow-sm">
                      {(project.thumbnailUrl || project.heroImageUrl) ? (
                        <UniversalMediaRenderer 
                          type={project.thumbnailMediaType || project.heroMediaType || "IMAGE"}
                          src={project.thumbnailUrl || project.heroImageUrl}
                          alt={title}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-default)] text-[var(--text-tertiary)] font-medium">
                          [Case Study Cover: {title}]
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-transparent to-transparent" />
                      
                      <div className="absolute top-4 end-4">
                        <span className="px-3 py-1 text-xs font-mono font-bold bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] text-emerald-500 rounded-full backdrop-blur-md shadow-xs">
                          {project.year || '2026'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold font-syne text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors mb-2">{title}</h3>
                    <div className="flex items-center gap-3 text-sm font-mono text-[var(--text-secondary)]">
                      <span>{project.clientName || 'E3 Project'}</span>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-3 text-center py-16 border border-[var(--border-level-2)] rounded-3xl text-[var(--text-tertiary)]">
                {isAr ? "لم يتم إضافة دراسات حالة بعد." : "No featured case studies yet. Publish some from the Dashboard!"}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. BRANDS & IP PORTFOLIO */}
      {content?.ourBrands?.brands?.length > 0 && (
        <B2BBrandPortfolio content={content} locale={locale} />
      )}

      {/* 7. INTERACTIVE 5-STEP DELIVERY PIPELINE */}
      <section className="py-24 md:py-32 bg-[var(--bg-level-2)] border-y border-[var(--border-level-1)] transition-colors">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest block mb-2">{isAr ? "خطوات العمل والتشغيل" : "OPERATIONAL PIPELINE"}</span>
            <h2 className="text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-4">
              {deliveryProcess.title}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {deliveryProcess.steps.map((step: any, i: number) => (
              <div key={i} className="group relative p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <span className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-xl text-emerald-500">
                    {step.stepNumber}
                  </span>
                  <span className="text-xs font-mono text-[var(--text-tertiary)]">STAGE 0{i + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-syne text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors mb-2">{step.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PARTNER MARQUEE RIBBON */}
      <section className="py-16 bg-[var(--bg-level-1)] overflow-hidden border-b border-[var(--border-level-1)] transition-colors">
        <div className="container mx-auto px-4 md:px-8 mb-10 text-center">
          <span className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">
            {partnerRibbon.title}
          </span>
        </div>
        
        <div className="flex w-[200%] animate-marquee">
          <div className="flex flex-1 justify-around items-center gap-12 px-4">
            {partnersList.map((p: any, idx: number) => (
              <div key={p.id || idx} className="flex items-center justify-center shrink-0 mx-6">
                {p.logoUrl ? (
                  <img 
                    src={p.logoUrl} 
                    alt={p.name} 
                    className="h-10 md:h-14 max-w-[160px] md:max-w-[200px] object-contain opacity-75 hover:opacity-100 transition-all duration-300"
                  />
                ) : (
                  <span className="text-xl md:text-2xl font-mono font-bold text-[var(--text-secondary)] whitespace-nowrap hover:text-[var(--text-primary)] transition-colors">
                    {p.name}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-1 justify-around items-center gap-12 px-4">
            {partnersList.map((p: any, idx: number) => (
              <div key={`clone-${p.id || idx}`} className="flex items-center justify-center shrink-0 mx-6">
                {p.logoUrl ? (
                  <img 
                    src={p.logoUrl} 
                    alt={p.name} 
                    className="h-10 md:h-14 max-w-[160px] md:max-w-[200px] object-contain opacity-75 hover:opacity-100 transition-all duration-300"
                  />
                ) : (
                  <span className="text-xl md:text-2xl font-mono font-bold text-[var(--text-secondary)] whitespace-nowrap hover:text-[var(--text-primary)] transition-colors">
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
