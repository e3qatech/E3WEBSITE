import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  ArrowUpRight, 
  CheckCircle2,
  Workflow,
  Building2,
  Trophy
} from 'lucide-react'
import { db } from "@/lib/db"
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { LivingHeroHeadline } from '@/components/b2b/shared/LivingHeroHeadline'
import { getMergedCMSPageContent } from '@/lib/cms-default-pages'
import { cn } from '@/lib/utils'
import { getPublicCaseStudies, isCaseStudyEligible } from '@/lib/case-studies'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isAr = locale === 'ar'
  
  let page: any = null
  try {
    page = await db.pages.findUnique({
      where: { slug: 'b2b-services' }
    })
  } catch (e) {
    console.error("Error fetching b2b-services page metadata:", e)
  }

  const cms = getMergedCMSPageContent('b2b-services', page?.content)
  const seo = cms.seo || {}

  const title = isAr 
    ? (seo.metaTitleAr || 'الخدمات والقدرات — إي ثري لقطاع الأعمال') 
    : (seo.metaTitleEn || 'Services & Capabilities — E3 Enterprise Atelier')
    
  const description = isAr 
    ? (seo.metaDescriptionAr || 'خدمات التصميم الفضائي، هندسة الفعاليات، الأنظمة الصوتية والضوئية، والإنتاج الحي في قطر.') 
    : (seo.metaDescriptionEn || 'Turnkey spatial design, event engineering, kinetic AV, live production, and landmark attraction operations in Qatar.')

  return {
    title,
    description,
    openGraph: {
      title: isAr ? (seo.ogTitleAr || title) : (seo.ogTitleEn || title),
      description: isAr ? (seo.ogDescriptionAr || description) : (seo.ogDescriptionEn || description),
      images: seo.ogImage ? [{ url: seo.ogImage }] : []
    },
    alternates: {
      canonical: seo.canonicalUrl || 'https://e3.qa/b2b/services'
    }
  }
}

export default async function ServicesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isAr = locale === 'ar'
  
  let page: any = null
  let allServices: any[] = []
  let allCaseStudies: any[] = []
  
  try {
    const results = await Promise.all([
      db.pages.findUnique({
        where: { slug: 'b2b-services' }
      }),
      db.service.findMany({
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      getPublicCaseStudies({
        featuredFirst: true
      })
    ])
    page = results[0]
    allServices = results[1]
    allCaseStudies = results[2]
  } catch (error) {
    console.error("Error fetching b2b services public page data:", error)
  }

  // Get deep-merged CMS content
  const cms = getMergedCMSPageContent('b2b-services', page?.content)

  // 1. HERO SECTION DATA
  const hero = cms.hero || {}
  const heroEyebrow = isAr ? (hero.eyebrowAr || hero.eyebrowEn) : hero.eyebrowEn
  const heroTitle = isAr ? (hero.titleAr || hero.titleEn) : hero.titleEn
  const heroSubtitle = isAr ? (hero.subtitleAr || hero.subtitleEn) : hero.subtitleEn
  const heroPrimaryCta = isAr ? (hero.primaryCtaAr || hero.primaryCtaEn) : hero.primaryCtaEn
  const heroSecondaryCta = isAr ? (hero.secondaryCtaAr || hero.secondaryCtaEn) : hero.secondaryCtaEn

  // 2. CAPABILITY COUNT STATEMENT DATA
  const capCountConfig = cms.capabilityCount || {}
  const countTemplate = isAr ? capCountConfig.templateAr : capCountConfig.templateEn
  const formattedCountStatement = countTemplate
    ? countTemplate.replace('{{count}}', String(allServices.length))
    : `${allServices.length} ${isAr ? 'قدرات تخصصية متكاملة. شريك واحد.' : 'Specialised Capabilities. One Integrated Partner.'}`

  // 3. PHILOSOPHY / WOW & HOW DATA
  const phil = cms.philosophy || {}
  const philTitle = isAr ? (phil.titleAr || phil.titleEn) : phil.titleEn
  const philSubtitle = isAr ? (phil.subtitleAr || phil.subtitleEn) : phil.subtitleEn
  const creativeTitle = isAr ? (phil.creativeTitleAr || phil.creativeTitleEn) : phil.creativeTitleEn
  const creativeSub = isAr ? (phil.creativeSubAr || phil.creativeSubEn) : phil.creativeSubEn
  const creativeBullets: any[] = phil.creativeBullets || []
  const engineeringTitle = isAr ? (phil.engineeringTitleAr || phil.engineeringTitleEn) : phil.engineeringTitleEn
  const engineeringSub = isAr ? (phil.engineeringSubAr || phil.engineeringSubEn) : phil.engineeringSubEn
  const engineeringBullets: any[] = phil.engineeringBullets || []

  // 4. BENTO NAVIGATOR DATA
  const nav = cms.navigator || {}
  const navEyebrow = isAr ? (nav.eyebrowAr || nav.eyebrowEn) : nav.eyebrowEn
  const navTitle = isAr ? (nav.titleAr || nav.titleEn) : nav.titleEn
  const navDesc = isAr ? (nav.descriptionAr || nav.descriptionEn) : nav.descriptionEn
  const navCardCta = isAr ? (nav.cardCtaAr || nav.cardCtaEn) : nav.cardCtaEn

  // Filter services based on CMS selection mode
  let navigatorServices = allServices
  if (nav.sourceMode === 'MANUAL' && Array.isArray(nav.selectedServiceIds) && nav.selectedServiceIds.length > 0) {
    const selected = nav.selectedServiceIds
      .map((id: string) => allServices.find(s => s.id === id))
      .filter(Boolean)
    if (selected.length > 0) {
      navigatorServices = selected
    }
  }

  // 5. FEATURED SPOTLIGHTS DATA
  const spotlightsConfig = cms.featuredSpotlights || {}
  const spotlightTitle = isAr ? (spotlightsConfig.titleAr || spotlightsConfig.titleEn) : spotlightsConfig.titleEn
  const spotlightCta = isAr ? (spotlightsConfig.spotlightCtaAr || spotlightsConfig.spotlightCtaEn) : spotlightsConfig.spotlightCtaEn
  const requestCta = isAr ? (spotlightsConfig.requestCtaAr || spotlightsConfig.requestCtaEn) : spotlightsConfig.requestCtaEn

  let spotlightServices = allServices.filter(s => s.isFeatured)
  if (spotlightsConfig.selectionMode === 'MANUAL' && Array.isArray(spotlightsConfig.selectedServiceIds) && spotlightsConfig.selectedServiceIds.length > 0) {
    const selected = spotlightsConfig.selectedServiceIds
      .map((id: string) => allServices.find(s => s.id === id))
      .filter(Boolean)
    if (selected.length > 0) {
      spotlightServices = selected
    }
  }

  // 6. DELIVERY METHODOLOGY DATA
  const methodology = cms.deliveryMethodology || {}
  const methEyebrow = isAr ? (methodology.eyebrowAr || methodology.eyebrowEn) : methodology.eyebrowEn
  const methTitle = isAr ? (methodology.titleAr || methodology.titleEn) : methodology.titleEn
  const pipelineSteps: any[] = methodology.steps || []

  // 7. CASE STUDIES / PROOF DATA
  const proofConfig = cms.caseStudies || {}
  const proofEyebrow = isAr ? (proofConfig.eyebrowAr || proofConfig.eyebrowEn) : proofConfig.eyebrowEn
  const proofTitle = isAr ? (proofConfig.titleAr || proofConfig.titleEn) : proofConfig.titleEn
  const viewAllCaseStudiesCta = isAr ? (proofConfig.viewAllCtaAr || proofConfig.viewAllCtaEn) : proofConfig.viewAllCtaEn

  let displayCaseStudies = (allCaseStudies || []).filter(isCaseStudyEligible)
  if (proofConfig.selectionMode === 'MANUAL' && Array.isArray(proofConfig.selectedCaseStudyIds) && proofConfig.selectedCaseStudyIds.length > 0) {
    displayCaseStudies = proofConfig.selectedCaseStudyIds
      .map((id: string) => allCaseStudies.find(cs => cs.id === id))
      .filter(isCaseStudyEligible)
  } else if (proofConfig.maxItems) {
    displayCaseStudies = displayCaseStudies.slice(0, proofConfig.maxItems)
  } else {
    displayCaseStudies = displayCaseStudies.slice(0, 3)
  }

  // 8. FINAL RFP CTA DATA
  const ctaConfig = cms.cta || {}
  const ctaEyebrow = isAr ? (ctaConfig.eyebrowAr || ctaConfig.eyebrowEn) : ctaConfig.eyebrowEn
  const ctaTitle = isAr ? (ctaConfig.titleAr || ctaConfig.titleEn) : ctaConfig.titleEn
  const ctaDesc = isAr ? (ctaConfig.descriptionAr || ctaConfig.descriptionEn) : ctaConfig.descriptionEn
  const ctaPrimaryBtn = isAr ? (ctaConfig.primaryCtaAr || ctaConfig.primaryCtaEn) : ctaConfig.primaryCtaEn

  return (
    <div className="flex flex-col w-full min-h-screen bg-[var(--bg-level-1)] text-[var(--text-primary)] font-sans selection:bg-emerald-500 selection:text-zinc-950 transition-colors" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. HERO SECTION */}
      {hero.enabled !== false && (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-[var(--border-level-1)] pt-24 pb-16">
          <div className="absolute inset-0 z-0">
            <UniversalMediaRenderer 
              type={(hero.media?.mediaType || hero.mediaType || "IMAGE") as any} 
              src={(hero.media?.mediaUrl || hero.mediaUrl || (hero as any).backgroundImage || "/hero-bg.png").replace("/hero-b2b.jpg", "/hero-bg.png")}
              poster={(hero.media?.posterUrl || (hero as any).posterImage || "").replace("/hero-b2b.jpg", "/hero-bg.png") || undefined}
              alt="E3 Capabilities Hero"
              className="w-full h-full object-cover filter brightness-[0.65] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-[var(--bg-level-1)]/70 to-[var(--bg-level-1)]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-level-1)]/90 via-[var(--bg-level-1)]/50 to-transparent rtl:bg-gradient-to-l" />
          </div>

          <div className="container relative z-10 mx-auto px-4 md:px-8">
            <div className="max-w-5xl">
              {heroEyebrow && (
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-widest mb-6 backdrop-blur-md">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{heroEyebrow}</span>
                </div>
              )}

              <div className="mb-6">
                <LivingHeroHeadline
                  headlineTemplateEn={hero.headlineTemplateEn || hero.fixedHeadlineEn || hero.titleEn || hero.title || "Specialised Capabilities for {{animated}}"}
                  headlineTemplateAr={hero.headlineTemplateAr || hero.fixedHeadlineAr || hero.titleAr || hero.title || "قدرات تخصصية لصناعة {{animated}}"}
                  rotatingWordsEn={hero.rotatingWordsEn}
                  rotatingWordsAr={hero.rotatingWordsAr}
                  enableRotatingWords={hero.enableRotatingWords !== false}
                  animationSpeed={hero.animationSpeed || 2800}
                  locale={locale}
                  align={isAr ? "start" : "start"}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.75rem] font-black font-syne text-[var(--text-primary)] tracking-tight leading-[1.08] drop-shadow-xl"
                  gradientClass="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500"
                />
              </div>

              {heroSubtitle && (
                <p className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] font-medium max-w-3xl mb-10 leading-relaxed">
                  {heroSubtitle}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                {heroPrimaryCta && (
                  <a 
                    href={hero.primaryLink || "#capability-navigator"} 
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-zinc-950 font-bold text-base rounded-full hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
                  >
                    <span>{heroPrimaryCta}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
                  </a>
                )}
                
                {heroSecondaryCta && (
                  <Link 
                    href={hero.secondaryLink || `/${locale}/b2b/contact`} 
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--surface-default)]/90 backdrop-blur-md border border-[var(--border-level-2)] text-[var(--text-primary)] font-bold text-base rounded-full hover:bg-[var(--surface-hover)] transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                  >
                    <span>{heroSecondaryCta}</span>
                    <ArrowUpRight className="w-5 h-5 text-[var(--text-secondary)]" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. DYNAMIC INTEGRATED CAPABILITY STATEMENT */}
      {capCountConfig.enabled !== false && (
        <section className="py-12 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)]">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <div className="inline-flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] backdrop-blur-md shadow-sm">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xl md:text-2xl font-black font-syne tracking-tight text-[var(--text-primary)]">
                {formattedCountStatement}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 3. SERVICE PHILOSOPHY SPLIT-SCREEN */}
      {phil.enabled !== false && (
        <section className="py-24 md:py-32 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] relative overflow-hidden transition-colors">
          <div className="container relative z-10 mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              {phil.eyebrowEn && (
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">
                  {isAr ? (phil.eyebrowAr || phil.eyebrowEn) : phil.eyebrowEn}
                </span>
              )}
              <h2 className="text-4xl md:text-6xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-6">
                {philTitle}
              </h2>
              {philSubtitle && (
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                  {philSubtitle}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Creative Pillar */}
              <div className="p-8 md:p-12 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-emerald-500/50 backdrop-blur-md transition-all duration-500 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{creativeSub}</span>
                    <h3 className="text-3xl font-black font-syne text-emerald-600 dark:text-emerald-400 tracking-tight">
                      {creativeTitle}
                    </h3>
                  </div>
                </div>
                <ul className="space-y-4">
                  {creativeBullets.map((bullet: any, i: number) => {
                    const text = isAr ? (bullet.textAr || bullet.textEn) : bullet.textEn
                    return (
                      <li key={bullet.id || i} className="flex items-center gap-3 text-base font-medium text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span>{text}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Operational Pillar */}
              <div className="p-8 md:p-12 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-amber-500/50 backdrop-blur-md transition-all duration-500 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-amber-600 dark:text-amber-400 uppercase tracking-widest">{engineeringSub}</span>
                    <h3 className="text-3xl font-black font-syne text-amber-600 dark:text-amber-400 tracking-tight">
                      {engineeringTitle}
                    </h3>
                  </div>
                </div>
                <ul className="space-y-4">
                  {engineeringBullets.map((bullet: any, i: number) => {
                    const text = isAr ? (bullet.textAr || bullet.textEn) : bullet.textEn
                    return (
                      <li key={bullet.id || i} className="flex items-center gap-3 text-base font-medium text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                        <span>{text}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. DYNAMIC CAPABILITY NAVIGATOR (BENTO GRID) */}
      {nav.enabled !== false && (
        <section id="capability-navigator" className="py-24 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] transition-colors">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                {navEyebrow && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-widest mb-3">
                    <Workflow className="w-3.5 h-3.5" />
                    <span>{navEyebrow}</span>
                  </div>
                )}
                <h2 className="text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-4">
                  {navTitle}
                </h2>
                {navDesc && (
                  <p className="text-lg text-[var(--text-secondary)] max-w-xl">
                    {navDesc}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {navigatorServices.length > 0 ? (
                navigatorServices.map((service, i) => {
                  const name = isAr ? (service.titleAr || service.titleEn || service.slug) : (service.titleEn || service.slug)
                  const tagline = isAr 
                    ? (service.taglineAr || service.contentAr?.substring(0, 140) || "خدمات إنتاج وتصنيع غامرة") 
                    : (service.taglineEn || service.contentEn?.substring(0, 140) || "Turnkey spatial engineering service")
                  
                  const isAnchorTile = service.isFeatured || i % 7 === 0

                  return (
                    <Link 
                      key={service.id} 
                      href={`/${locale}/b2b/services/${service.slug}`}
                      className={cn(
                        "group relative rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-emerald-500/60 transition-all duration-500 overflow-hidden flex flex-col justify-between p-6 sm:p-8 hover:shadow-xl shadow-sm",
                        isAnchorTile ? "md:col-span-2 md:row-span-2 min-h-[440px]" : "min-h-[290px]"
                      )}
                    >
                      <div className="absolute inset-0 z-0">
                        {service.thumbnail ? (
                          <UniversalMediaRenderer 
                            type="IMAGE"
                            src={service.thumbnail}
                            alt={name}
                            className="w-full h-full object-cover opacity-20 dark:opacity-30 group-hover:opacity-40 dark:group-hover:opacity-50 transition-all duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-[var(--surface-raised)]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-[var(--surface-default)]/85 to-transparent" />
                      </div>

                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="w-10 h-10 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] flex items-center justify-center font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 backdrop-blur-md shadow-xs">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          
                          {service.category && (
                            <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full backdrop-blur-md">
                              {service.category}
                            </span>
                          )}
                        </div>

                        <div className="mt-auto pt-8">
                          <h3 className={cn("font-black font-syne text-[var(--text-primary)] tracking-tight mb-2 group-hover:text-emerald-500 transition-colors", isAnchorTile ? "text-2xl sm:text-3xl" : "text-xl")}>
                            {name}
                          </h3>
                          <p className={cn("text-[var(--text-secondary)] font-medium line-clamp-2 leading-relaxed mb-4", isAnchorTile ? "text-base" : "text-xs")}>
                            {tagline}
                          </p>

                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest opacity-80 group-hover:opacity-100 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-all duration-300">
                            <span>{navCardCta || (isAr ? "عرض التفاصيل والخدمات" : "Explore Capability")}</span>
                            <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="col-span-4 text-center py-20 border border-[var(--border-level-2)] rounded-3xl text-[var(--text-tertiary)] bg-[var(--surface-default)]">
                  {isAr ? "جاري تحديث قائمة الخدمات والتخصصات." : "Services directory is currently being updated."}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. FEATURED SERVICE SPOTLIGHTS */}
      {spotlightsConfig.enabled !== false && spotlightServices.length > 0 && (
        <section className="py-24 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">
                {isAr ? (spotlightsConfig.eyebrowAr || spotlightsConfig.eyebrowEn) : spotlightsConfig.eyebrowEn}
              </span>
              <h2 className="text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight">
                {spotlightTitle}
              </h2>
            </div>

            <div className="space-y-16">
              {spotlightServices.map((fs, idx) => {
                const fsTitle = isAr ? (fs.titleAr || fs.titleEn) : fs.titleEn
                const fsTagline = isAr ? (fs.taglineAr || fs.contentAr?.substring(0, 200)) : (fs.taglineEn || fs.contentEn?.substring(0, 200))

                return (
                  <div key={fs.id} className="relative rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] p-6 sm:p-8 md:p-12 overflow-hidden flex flex-col lg:flex-row items-center gap-8 md:gap-12 backdrop-blur-md shadow-md">
                    <div className="w-full lg:w-1/2 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-widest">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>SPOTLIGHT 0{idx + 1}</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black font-syne text-[var(--text-primary)] tracking-tight">
                        {fsTitle}
                      </h3>
                      <p className="text-base text-[var(--text-secondary)] leading-relaxed font-medium">
                        {fsTagline}
                      </p>
                      
                      <div className="pt-4 flex flex-wrap gap-4">
                        <Link 
                          href={`/${locale}/b2b/services/${fs.slug}`}
                          className="px-6 py-3 bg-emerald-500 text-zinc-950 font-bold rounded-full hover:bg-emerald-400 transition-colors inline-flex items-center gap-2 text-sm shadow-sm"
                        >
                          <span>{spotlightCta || (isAr ? "عرض تفاصيل الخدمة" : "View Service Scope")}</span>
                          <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                        </Link>
                        <Link 
                          href={`/${locale}/b2b/contact`}
                          className="px-6 py-3 bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-level-2)] font-bold rounded-full hover:bg-[var(--surface-hover)] transition-colors text-sm"
                        >
                          {requestCta || (isAr ? "اطلب هذا التخصص" : "Request This Discipline")}
                        </Link>
                      </div>
                    </div>

                    <div className="w-full lg:w-1/2 aspect-video rounded-2xl overflow-hidden bg-[var(--surface-sunken)] border border-[var(--border-level-2)] relative">
                      {fs.heroMediaUrl || fs.thumbnail ? (
                        <UniversalMediaRenderer 
                          type={fs.heroMediaType as any || "IMAGE"}
                          src={fs.heroMediaUrl || fs.thumbnail}
                          alt={fsTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] font-mono">[Featured Media: {fsTitle}]</div>
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
      {methodology.enabled !== false && pipelineSteps.length > 0 && (
        <section className="py-24 md:py-32 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] transition-colors">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              {methEyebrow && (
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">{methEyebrow}</span>
              )}
              <h2 className="text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-4">
                {methTitle}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
              {pipelineSteps.map((step, i) => {
                const stepName = isAr ? (step.nameAr || step.nameEn) : step.nameEn
                const stepDesc = isAr ? (step.descAr || step.descEn) : step.descEn
                return (
                  <div key={step.id || i} className="group relative p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md">
                    <div className="flex items-center justify-between mb-6">
                      <span className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-xl text-emerald-600 dark:text-emerald-400">
                        {step.stepNumber || String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-mono text-[var(--text-tertiary)]">PHASE 0{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-syne text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors mb-2">{stepName}</h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">{stepDesc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. RELATED PROOF & CASE STUDIES */}
      {proofConfig.enabled !== false && displayCaseStudies.length > 0 && (
        <section className="py-24 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                {proofEyebrow && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-secondary)] font-mono text-xs uppercase tracking-widest mb-3 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{proofEyebrow}</span>
                  </div>
                )}
                <h2 className="text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-4">
                  {proofTitle}
                </h2>
              </div>
              <Link 
                href={proofConfig.viewAllLink || `/${locale}/b2b/case-studies`} 
                className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base hover:text-emerald-500 transition-colors group"
              >
                <span>{viewAllCaseStudiesCta || (isAr ? "عرض جميع المشاريع" : "View All Case Studies")}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {displayCaseStudies.map((cs) => {
                const title = isAr ? (cs.titleAr || cs.titleEn) : cs.titleEn
                return (
                  <Link key={cs.id} href={`/${locale}/b2b/case-studies/${cs.slug}`} className="group block">
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[var(--surface-default)] mb-6 border border-[var(--border-level-2)] group-hover:border-emerald-500/50 transition-all duration-500 shadow-sm">
                      {(cs.thumbnailUrl || cs.heroImageUrl) ? (
                        <UniversalMediaRenderer 
                          type={cs.thumbnailMediaType || cs.heroMediaType || "IMAGE"}
                          src={cs.thumbnailUrl || cs.heroImageUrl}
                          alt={title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-raised)] text-[var(--text-tertiary)] font-medium">
                          [Cover: {title}]
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-transparent to-transparent" />
                      <div className="absolute top-4 end-4">
                        <span className="px-3 py-1 text-xs font-mono font-bold bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] text-emerald-600 dark:text-emerald-400 rounded-full backdrop-blur-md shadow-sm">
                          {cs.year || '2026'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold font-syne text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors mb-2">{title}</h3>
                    <div className="flex items-center gap-3 text-sm font-mono text-[var(--text-secondary)]">
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
      {ctaConfig.enabled !== false && (
        <section className="py-24 border-t border-[var(--border-level-1)] bg-[var(--bg-level-1)] relative overflow-hidden transition-colors">
          <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl relative z-10">
            {ctaEyebrow && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-widest mb-6">
                <Building2 className="w-3.5 h-3.5" />
                <span>{ctaEyebrow}</span>
              </div>
            )}

            <h2 className="text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-6">
              {ctaTitle}
            </h2>
            {ctaDesc && (
              <p className="text-lg text-[var(--text-secondary)] mb-10 leading-relaxed">
                {ctaDesc}
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href={ctaConfig.primaryLink || `/${locale}/b2b/contact`}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 text-zinc-950 font-bold text-lg rounded-full hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
              >
                <span>{ctaPrimaryBtn}</span>
                <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
              </Link>
            </div>
          </div>
        </section>
      )}
      
    </div>
  )
}
