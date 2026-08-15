import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { localizeHref } from "@/lib/url-helper"

// Component Imports
import { HeroViewer } from "@/components/attractions/detail/HeroViewer"
import { WhatsInside } from "@/components/attractions/detail/WhatsInside"
import { BrandPlacementShowcase } from "@/components/attractions/detail/BrandPlacementShowcase"
import { PricingCards } from "@/components/attractions/detail/PricingCards"
import { GalleryLightbox } from "@/components/attractions/detail/GalleryLightbox"
import { LiveBookingCard } from "@/components/attractions/detail/LiveBookingCard"
import { FaqAccordion } from "@/components/attractions/detail/FaqAccordion"
import { PartnersSection } from "@/components/attractions/detail/PartnersSection"
import { SocialNewsSection } from "@/components/attractions/detail/SocialNewsSection"
import { RelatedProjects } from "@/components/attractions/detail/RelatedProjects"
import { AttractionFeedbackContactSection } from "@/components/attractions/detail/AttractionFeedbackContactSection"

import { db } from "@/lib/db"
import { toZonedTime, format } from "date-fns-tz"
import { getDay, isWithinInterval } from "date-fns"

import { formatLocalizedText } from "@/lib/utils"
import { resolveBookingUrl } from "@/lib/cms-attractions"
import { getPublicCaseStudies } from "@/lib/case-studies"

async function getAttractionData(slug: string) {
  const baseSlugKey = (slug || "").split('-')[0] || slug;
  const attraction = await db.attraction.findFirst({
    where: {
      OR: [
        { slug: slug },
        { slug: { startsWith: slug } },
        { slug: { contains: baseSlugKey, mode: 'insensitive' } }
      ]
    },
    include: {
      pricing: true,
      offers: true,
      faqs: { orderBy: { orderIndex: "asc" } },
      gallery: { orderBy: { orderIndex: "asc" } },
      temporalRules: true,
      brandPlacements: {
        include: {
          brand: true
        }
      },
      attractionLocations: {
        include: {
          location: true
        }
      }
    }
  })

  if (!attraction) return null

  // Calculate live operations status
  const now = new Date()
  const QATAR_TZ = "Asia/Qatar"
  const qatarNow = toZonedTime(now, QATAR_TZ)
  const currentDay = getDay(qatarNow)
  const currentTimeStr = format(qatarNow, "HH:mm")

  let isOpen = false
  const rules = attraction.temporalRules || []

  // 1. RECURRING
  const recurring = rules.filter((r: any) => r.ruleType === "RECURRING")
  for (const rule of recurring) {
    if (rule.daysOfWeek && Array.isArray(rule.daysOfWeek) && (rule.daysOfWeek as any).includes(currentDay)) {
      if (rule.openTime && rule.closeTime && currentTimeStr >= rule.openTime && currentTimeStr <= rule.closeTime) {
        isOpen = true
      }
    }
  }

  // 2. OVERRIDE
  const overrides = rules.filter((r: any) => r.ruleType === "OVERRIDE")
  for (const rule of overrides) {
    if (rule.startDate && rule.endDate) {
      const start = toZonedTime(rule.startDate, QATAR_TZ)
      const end = toZonedTime(rule.endDate, QATAR_TZ)
      if (isWithinInterval(qatarNow, { start, end })) {
        if (rule.openTime && rule.closeTime && currentTimeStr >= rule.openTime && currentTimeStr <= rule.closeTime) {
          isOpen = true
        } else {
          isOpen = false
        }
      }
    }
  }

  // 3. CLOSURE
  const closures = rules.filter((r: any) => r.ruleType === "CLOSURE")
  for (const rule of closures) {
    if (rule.startDate && rule.endDate) {
      const start = toZonedTime(rule.startDate, QATAR_TZ)
      const end = toZonedTime(rule.endDate, QATAR_TZ)
      if (isWithinInterval(qatarNow, { start, end })) {
        isOpen = false
      }
    }
  }

  // Latest telemetry for live occupancy
  const telemetry = await db.telemetryLog.findFirst({
    where: { attractionId: attraction.id },
    orderBy: { timestamp: "desc" }
  })

  const schedule = await db.eventSchedule.findFirst({
    where: { attractionId: attraction.id, startTime: { lte: now }, endTime: { gte: now } }
  })

  let currentOccupancy = 0
  if (telemetry?.payload && typeof telemetry.payload === "object" && "count" in telemetry.payload) {
    currentOccupancy = (telemetry.payload as any).count
  } else {
    currentOccupancy = schedule?.currentCount || 0
  }

  const operations = {
    isOpen,
    currentOccupancy,
    maxCapacity: schedule?.capacityGate || 1000,
    averageVisitDuration: 90,
    ...((attraction.operations as any) || {})
  }

  const projects = await getPublicCaseStudies({
    attractionId: attraction.id,
    select: {
      id: true,
      slug: true,
      titleEn: true,
      titleAr: true,
      challengeEn: true,
      challengeAr: true,
      thumbnailUrl: true,
      heroImageUrl: true
    }
  })

  // Extract Coordinates
  let lat = 25.2854
  let lng = 51.5310
  const rawCoords = attraction.coordinates as any
  if (rawCoords && typeof rawCoords === "object") {
    if (rawCoords.lat && rawCoords.lng) {
      lat = Number(rawCoords.lat)
      lng = Number(rawCoords.lng)
    } else if (Array.isArray(rawCoords) && rawCoords.length >= 2) {
      lng = Number(rawCoords[0])
      lat = Number(rawCoords[1])
    }
  } else if (attraction.attractionLocations?.[0]?.location) {
    const loc = attraction.attractionLocations[0].location as any
    if (loc.latitude && loc.longitude) {
      lat = Number(loc.latitude)
      lng = Number(loc.longitude)
    }
  }

  return { 
    attraction, 
    pricing: attraction.pricing, 
    gallery: attraction.gallery, 
    faq: attraction.faqs, 
    schedule: null, 
    operations,
    projects,
    brandPlacements: attraction.brandPlacements || [],
    coordinates: { lat, lng }
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string, locale: string }> }): Promise<Metadata> {
  const params = await props.params
  const baseSlugKey = (params.slug || "").split('-')[0] || params.slug;
  const attraction = await db.attraction.findFirst({
    where: {
      OR: [
        { slug: params.slug },
        { slug: { startsWith: params.slug } },
        { slug: { contains: baseSlugKey, mode: 'insensitive' } }
      ]
    },
    select: { nameEn: true, nameAr: true, descriptionEn: true, descriptionAr: true }
  })
  
  if (!attraction) return { title: "Attraction Not Found" }

  const displayName = params.locale === "ar" ? (attraction.nameAr || attraction.nameEn) : (attraction.nameEn || attraction.nameAr)
  const displayDesc = params.locale === "ar" ? (attraction.descriptionAr || attraction.descriptionEn) : (attraction.descriptionEn || attraction.descriptionAr)

  return {
    title: `${displayName || "Attraction"} | E3 Qatar`,
    description: displayDesc || "",
  }
}

export default async function AttractionDetailPage(props: { params: Promise<{ slug: string, locale: string }> }) {
  const params = await props.params
  const { slug, locale } = params

  const data = await getAttractionData(slug)

  if (!data) {
    notFound()
  }

  const { attraction, pricing, gallery, faq, schedule, projects, brandPlacements, coordinates, operations } = data
  const displayName = formatLocalizedText(locale === "ar" ? (attraction.nameAr || attraction.nameEn) : (attraction.nameEn || attraction.nameAr), locale)
  const displayDesc = formatLocalizedText(locale === "ar" ? (attraction.descriptionAr || attraction.descriptionEn) : (attraction.descriptionEn || attraction.descriptionAr), locale)

  // Generate JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: displayName,
    description: displayDesc,
    image: attraction.heroMediaUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: (operations as any)?.venueName || "Doha, Qatar",
      addressCountry: "QA"
    }
  }

  const faqJsonLd = faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f: any) => ({
      "@type": "Question",
      name: f.questionEn,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answerEn
      }
    }))
  } : null

  return (
    <main className="min-h-screen bg-[var(--bg-level-1)] text-[var(--text-primary)] relative selection:bg-emerald-500 selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      {/* 1. Hero Viewer (100vh) */}
      <HeroViewer 
        title={displayName} 
        tagline={displayDesc?.substring(0, 120)}
        mediaType={attraction.heroMediaType || "IMAGE"}
        mediaUrl={attraction.heroMediaUrl}
        fallbackUrl={attraction.heroFallbackUrl}
        status={attraction.isFeatured ? (locale === 'ar' ? "تجربة متميزة" : "Featured Experience") : undefined}
        logoUrl={attraction.logoUrl}
        ctaText={locale === 'ar' ? "احجز التذاكر" : "Get Tickets"}
        ctaLink={resolveBookingUrl(attraction, locale)}
        motionPreset={(attraction as any).motionPreset || "MEDIA_CINEMATIC"}
        rotatingWordsEn={(attraction as any).rotatingWordsEn || (attraction as any).rotatingPhrasesEn || []}
        rotatingWordsAr={(attraction as any).rotatingWordsAr || (attraction as any).rotatingPhrasesAr || []}
        accentColor={(attraction as any).accentColor || (attraction as any).brandColor || "#10b981"}
        locale={locale}
      />

      {/* 2 & 3. Intro + What's Inside */}
      {displayDesc && (
        <WhatsInside 
          description={displayDesc} 
          features={(attraction.features as any) || []}
          imageUrl={attraction.heroThumbnailUrl || attraction.heroFallbackUrl}
          locale={locale}
        />
      )}

      {/* 4. Powered By E3 Brands & IP Showcase */}
      <BrandPlacementShowcase 
        brandPlacements={brandPlacements} 
        locale={locale} 
      />

      {/* Projects Section: Only rendered if published case studies exist */}
      {Array.isArray(projects) && projects.length > 0 && (
        <RelatedProjects projects={projects} locale={locale} />
      )}

      {/* 5. Pricing & Tickets */}
      <PricingCards 
        pricing={pricing}
        offers={attraction.offers || []}
        bookingUrl={attraction.ticketingUrl || `${process.env.NEXT_PUBLIC_BOOKING_QUBE_URL || 'https://booking.e3.qa'}/book?attraction=${attraction.id}`}
        pricingNoteEn={(operations as any)?.pricingNoteEn}
        pricingNoteAr={(operations as any)?.pricingNoteAr}
        locale={locale}
      />

      {/* 6. Partners */}
      <PartnersSection 
        partners={(attraction.partners as any) || []}
        locale={locale}
      />

      {/* 7. Social & What People Say ("Everyone is Talking") */}
      <SocialNewsSection 
        socialPreviews={(attraction.socialPreviews as any) || []}
        testimonials={(attraction.testimonials as any) || []}
        newsCoverage={(attraction.newsCoverage as any) || []}
        locale={locale}
      />

      {/* 8. Gallery Lightbox */}
      <GalleryLightbox 
        items={gallery}
        locale={locale}
      />

      {/* 9. Live GIS Location Map */}
      <LiveBookingCard 
        attractionId={attraction.id}
        name={displayName}
        latitude={coordinates.lat}
        longitude={coordinates.lng}
        locationAddress={(operations as any)?.venueName || (operations as any)?.venueAddressEn || "Doha, Qatar"}
        mapUrl={attraction.mapUrl}
        mapImageFallback={attraction.heroThumbnailUrl || attraction.heroFallbackUrl}
        schedule={schedule}
        operations={operations}
        bookingUrl={attraction.ticketingUrl || `${process.env.NEXT_PUBLIC_BOOKING_QUBE_URL || 'https://booking.e3.qa'}/book?attraction=${attraction.id}`}
        locale={locale}
      />

      {/* 10. Visitor Feedback & Contact Form */}
      <AttractionFeedbackContactSection
        attractionId={attraction.id}
        attractionName={displayName}
        locale={locale}
      />

      {/* 11. FAQ Accordion */}
      <FaqAccordion 
        faqs={faq}
      />

      {/* 12. Footer CTA */}
      <section className="relative w-full bg-[var(--surface-default)] py-32 text-center overflow-hidden border-t border-[var(--border-level-2)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--text-primary)] mb-10 tracking-tighter uppercase leading-[1.1] max-w-4xl mx-auto break-words">
            {locale === "ar" ? `هل أنت مستعد لتجربة ${displayName}؟` : `Ready to Experience ${displayName}?`}
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
            <a 
              href={attraction.ticketingUrl || `${process.env.NEXT_PUBLIC_BOOKING_QUBE_URL || 'https://booking.e3.qa'}/book?attraction=${attraction.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group px-10 py-5 bg-emerald-500 text-slate-950 font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-400 transition-all duration-300 overflow-hidden shadow-2xl"
            >
              <span className="relative z-10">{locale === "ar" ? "احجز الآن" : "Book Now"}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </a>
            <Link 
              href={localizeHref('/b2c/contact', locale)}
              className="px-10 py-5 bg-[var(--surface-hover)] backdrop-blur-md border border-[var(--border-level-2)] text-[var(--text-primary)] font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-[var(--border-level-2)] transition-colors duration-300 shadow-md"
            >
              {locale === "ar" ? "اتصل بنا" : "Contact Us"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
