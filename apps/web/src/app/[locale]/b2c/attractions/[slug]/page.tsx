import { notFound, redirect } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { localizeHref } from "@/lib/url-helper"
import { repairUrbanArenaCanonicalSlug } from "@/lib/canonical-urban-arena-repair"

// Component Imports
import { HeroViewer } from "@/components/attractions/detail/HeroViewer"
import { AttractionStickyNav } from "@/components/attractions/detail/AttractionStickyNav"
import { WhatsInside } from "@/components/attractions/detail/WhatsInside"
import { BrandPlacementShowcase } from "@/components/attractions/detail/BrandPlacementShowcase"
import { PricingCards } from "@/components/attractions/detail/PricingCards"
import { GalleryLightbox } from "@/components/attractions/detail/GalleryLightbox"
import { LiveBookingCard } from "@/components/attractions/detail/LiveBookingCard"
import { FaqAccordion } from "@/components/attractions/detail/FaqAccordion"
import { PartnersSection } from "@/components/attractions/detail/PartnersSection"
import { SocialNewsSection } from "@/components/attractions/detail/SocialNewsSection"
import { ExploreAttractionsSection } from "@/components/attractions/detail/ExploreAttractionsSection"
import { AttractionFeedbackContactSection } from "@/components/attractions/detail/AttractionFeedbackContactSection"

import { db } from "@/lib/db"
import { toZonedTime, format } from "date-fns-tz"
import { getDay, isWithinInterval } from "date-fns"

import { formatLocalizedText } from "@/lib/utils"
import { resolveBookingUrl } from "@/lib/cms-attractions"
import { getPublicCaseStudies } from "@/lib/case-studies"
import { normalizeServerPartnerData } from "@/lib/partners/partner-resolver"
import { getCuratedAttractionDetails } from "@/lib/attraction-curated-defaults"

async function getAttractionData(slug: string) {
  const normalizedSlug = (slug || "").toLowerCase().trim()
  const cleanDashSlug = normalizedSlug.replace(/--+/g, '-')
  const altSlug1 = normalizedSlug.replace('inflata-park', 'inflatapark')
  const altSlug2 = normalizedSlug.replace('inflatapark', 'inflata-park')

  // Step 1: Exact unique match query first
  let attraction = await db.attraction.findUnique({
    where: { slug: normalizedSlug },
    include: {
      pricing: true,
      offers: true,
      faqs: { orderBy: { orderIndex: "asc" } },
      gallery: { orderBy: { orderIndex: "asc" } },
      featuresList: {
        include: {
          storyTypes: true,
          linkedBrand: true
        },
        orderBy: { orderIndex: "asc" }
      },
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

  // Step 2: Fallback query for slug variations, ordered by active/published with most recent updates
  if (!attraction) {
    attraction = await db.attraction.findFirst({
      where: {
        OR: [
          { slug: cleanDashSlug },
          { slug: altSlug1 },
          { slug: altSlug2 },
          { slug: slug }
        ]
      },
      orderBy: [
        { isPublished: "desc" },
        { updatedAt: "desc" }
      ],
      include: {
        pricing: true,
        offers: true,
        faqs: { orderBy: { orderIndex: "asc" } },
        gallery: { orderBy: { orderIndex: "asc" } },
        featuresList: {
          include: {
            storyTypes: true,
            linkedBrand: true
          },
          orderBy: { orderIndex: "asc" }
        },
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
  }

  // Step 3: Prefix fallback ONLY if still not found
  if (!attraction) {
    attraction = await db.attraction.findFirst({
      where: {
        OR: [
          { slug: { startsWith: normalizedSlug } },
          { slug: { startsWith: altSlug1 } },
          { slug: { startsWith: altSlug2 } }
        ]
      },
      orderBy: [
        { isPublished: "desc" },
        { updatedAt: "desc" }
      ],
      include: {
        pricing: true,
        offers: true,
        faqs: { orderBy: { orderIndex: "asc" } },
        gallery: { orderBy: { orderIndex: "asc" } },
        featuresList: {
          include: {
            storyTypes: true,
            linkedBrand: true
          },
          orderBy: { orderIndex: "asc" }
        },
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
  }

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

  // Query Sister Active Attractions for the Explore Section
  const sisterAttractions = await db.attraction.findMany({
    where: {
      isPublished: true,
      isHidden: false,
      NOT: {
        id: attraction.id,
      },
    },
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameAr: true,
      taglineEn: true,
      taglineAr: true,
      heroThumbnailUrl: true,
      heroMediaUrl: true,
      heroFallbackUrl: true,
      experienceFormat: true,
      entityType: true,
      isFeatured: true,
    },
    orderBy: [
      { isFeatured: "desc" },
      { updatedAt: "desc" },
    ],
    take: 6,
  })

  // 1. Linked Database Location (Stage 3 in Attraction Studio)
  let lat = 25.2810
  let lng = 51.5230
  let primaryLocation: any = null

  const primaryLink = attraction.attractionLocations?.find((al: any) => al.isPrimary) || attraction.attractionLocations?.[0]
  if (primaryLink?.location) {
    primaryLocation = primaryLink.location
    if (primaryLocation.latitude && primaryLocation.longitude) {
      lat = Number(primaryLocation.latitude)
      lng = Number(primaryLocation.longitude)
    }
  } else if (Array.isArray((attraction as any).locations) && (attraction as any).locations.length > 0) {
    const jsonLoc = (attraction as any).locations[0]
    primaryLocation = {
      nameEn: jsonLoc.nameEn || jsonLoc.name,
      nameAr: jsonLoc.nameAr,
      venueEn: jsonLoc.venueEn || jsonLoc.venue,
      venueAr: jsonLoc.venueAr,
      addressEn: jsonLoc.addressEn || jsonLoc.address,
      addressAr: jsonLoc.addressAr,
      latitude: jsonLoc.lat || jsonLoc.latitude,
      longitude: jsonLoc.lng || jsonLoc.longitude,
    }
    if (primaryLocation.latitude && primaryLocation.longitude) {
      lat = Number(primaryLocation.latitude)
      lng = Number(primaryLocation.longitude)
    }
  } else {
    const rawCoords = attraction.coordinates as any
    if (rawCoords && typeof rawCoords === "object") {
      if (rawCoords.lat && rawCoords.lng) {
        lat = Number(rawCoords.lat)
        lng = Number(rawCoords.lng)
      } else if (Array.isArray(rawCoords) && rawCoords.length >= 2) {
        lng = Number(rawCoords[0])
        lat = Number(rawCoords[1])
      }
    }
  }

  const curated = getCuratedAttractionDetails(attraction.slug || slug)

  const rawFeatures = (Array.isArray(attraction.featuresList) && attraction.featuresList.length > 0)
    ? attraction.featuresList
    : (Array.isArray(attraction.features) && attraction.features.length > 0)
      ? attraction.features
      : (curated?.features || [])

  // Defensive deduplication by unique ID or normalized title
  const seenFeatureKeys = new Set<string>();
  const resolvedFeatures = rawFeatures.filter((f: any) => {
    if (!f) return false;
    const titleKey = ((f.titleEn || f.nameEn || f.title || f.name || f.titleAr || f.id) || '').toLowerCase().trim();
    if (!titleKey) return false;
    if (seenFeatureKeys.has(titleKey)) return false;
    seenFeatureKeys.add(titleKey);
    return true;
  });

  const resolvedPricing = (Array.isArray(attraction.pricing) && attraction.pricing.length > 0)
    ? attraction.pricing
    : (curated?.pricing || [])

  const resolvedFaqs = (Array.isArray(attraction.faqs) && attraction.faqs.length > 0)
    ? attraction.faqs
    : (curated?.faqs || [])

  const resolvedTicketingUrl = attraction.ticketingUrl || (attraction as any).bookingUrl || curated?.ticketingUrl || ''

  const resolvedSocialPreviews = (Array.isArray((attraction as any).socialPreviews) && (attraction as any).socialPreviews.length > 0)
    ? (attraction as any).socialPreviews
    : (curated?.socialLinks?.map(s => ({ platform: s.platform, url: s.url, title: s.handle || s.platform })) || [])

  const resolvedLogoUrl = (attraction.logoUrl || '').trim() ||
    ((curated as any)?.logoUrl || '').trim() ||
    (attraction.heroThumbnailUrl || '').trim() ||
    ((attraction as any).primaryLogoUrl || '').trim();

  const sanitizedAttraction = normalizeServerPartnerData({
    ...attraction,
    logoUrl: resolvedLogoUrl,
    ticketingUrl: resolvedTicketingUrl,
    socialPreviews: resolvedSocialPreviews
  })
  const sanitizedOperations = normalizeServerPartnerData(operations)
  const sanitizedBrandPlacements = normalizeServerPartnerData(attraction.brandPlacements || [])

  return { 
    attraction: sanitizedAttraction, 
    features: resolvedFeatures,
    pricing: resolvedPricing, 
    gallery: attraction.gallery, 
    faq: resolvedFaqs, 
    schedule: null, 
    operations: sanitizedOperations,
    temporalStatus: (attraction as any).temporalStatus || null,
    sisterAttractions,
    brandPlacements: sanitizedBrandPlacements,
    coordinates: { lat, lng },
    primaryLocation,
    ticketingUrl: resolvedTicketingUrl,
    socialPreviews: resolvedSocialPreviews
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string, locale: string }> }): Promise<Metadata> {
  const params = await props.params
  const { slug, locale } = params
  const canonicalSlug = slug === "urban-arena-doha-mall" ? "urban-arena" : slug
  const normalizedSlug = (canonicalSlug || "").toLowerCase().trim()
  const altSlug1 = normalizedSlug.replace('inflata-park', 'inflatapark')
  const altSlug2 = normalizedSlug.replace('inflatapark', 'inflata-park')

  let attraction = await db.attraction.findUnique({
    where: { slug: normalizedSlug },
    select: { nameEn: true, nameAr: true, descriptionEn: true, descriptionAr: true, slug: true, heroMediaUrl: true }
  })

  if (!attraction) {
    attraction = await db.attraction.findFirst({
      where: {
        OR: [
          { slug: altSlug1 },
          { slug: altSlug2 },
          { slug: canonicalSlug },
          { slug: slug }
        ]
      },
      orderBy: [
        { isPublished: "desc" },
        { updatedAt: "desc" }
      ],
      select: { nameEn: true, nameAr: true, descriptionEn: true, descriptionAr: true, slug: true, heroMediaUrl: true }
    })
  }

  if (!attraction) {
    attraction = await db.attraction.findFirst({
      where: {
        OR: [
          { slug: { startsWith: normalizedSlug } },
          { slug: { startsWith: altSlug1 } },
          { slug: { startsWith: altSlug2 } }
        ]
      },
      select: { nameEn: true, nameAr: true, descriptionEn: true, descriptionAr: true, slug: true, heroMediaUrl: true }
    })
  }
  
  if (!attraction) return { title: "Attraction Not Found | E3 Qatar" }

  const trueSlug = attraction.slug === "urban-arena-doha-mall" ? "urban-arena" : (attraction.slug || canonicalSlug)
  const displayName = locale === "ar" ? (attraction.nameAr || attraction.nameEn) : (attraction.nameEn || attraction.nameAr)
  const displayDesc = locale === "ar" ? (attraction.descriptionAr || attraction.descriptionEn) : (attraction.descriptionEn || attraction.descriptionAr)

  const enCanonical = `https://e3.qa/en/b2c/attractions/${trueSlug}`
  const arCanonical = `https://e3.qa/ar/b2c/attractions/${trueSlug}`
  const currentCanonical = locale === "ar" ? arCanonical : enCanonical

  return {
    title: `${displayName || "Attraction"} | E3 Qatar`,
    description: displayDesc || "",
    alternates: {
      canonical: currentCanonical,
      languages: {
        en: enCanonical,
        ar: arCanonical,
        "x-default": enCanonical,
      },
    },
    openGraph: {
      title: `${displayName || "Attraction"} | E3 Qatar`,
      description: displayDesc || "",
      url: currentCanonical,
      siteName: "E3 Qatar",
      locale: locale === "ar" ? "ar_QA" : "en_US",
      type: "website",
      images: attraction.heroMediaUrl ? [{ url: attraction.heroMediaUrl }] : undefined
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName || "Attraction"} | E3 Qatar`,
      description: displayDesc || "",
      images: attraction.heroMediaUrl ? [attraction.heroMediaUrl] : undefined
    }
  }
}

export default async function AttractionDetailPage(props: { params: Promise<{ slug: string, locale: string }> }) {
  const params = await props.params
  const { slug, locale } = params

  const SLUG_ALIASES: Record<string, string> = {
    "urban-arena-doha-mall": "urban-arena",
    "rush-action-park": "urban-arena",
    "inflatarun-qatar": "inflatarun-2025",
    "inflatacity-city-center": "inflata-park-city-center-doha",
    "inflatapark-city-center-doha": "inflata-park-city-center-doha",
    "spongebob-squarepants-paw-patrol-activation-meryal": "winter-activation-place-vendome",
  };

  if (SLUG_ALIASES[slug]) {
    if (slug === "urban-arena-doha-mall") {
      await repairUrbanArenaCanonicalSlug()
    }
    redirect(`/${locale}/b2c/attractions/${SLUG_ALIASES[slug]}`)
  }

  const data = await getAttractionData(slug)

  if (!data) {
    notFound()
  }

  if (data.attraction?.slug === "urban-arena" && slug !== "urban-arena") {
    redirect(`/${locale}/b2c/attractions/urban-arena`)
  }

  const { attraction, features, pricing, gallery, faq, schedule, sisterAttractions, brandPlacements, coordinates, operations, primaryLocation } = data
  const displayName = formatLocalizedText(locale === "ar" ? (attraction.nameAr || attraction.nameEn) : (attraction.nameEn || attraction.nameAr), locale)
  const displayDesc = formatLocalizedText(locale === "ar" ? (attraction.descriptionAr || attraction.descriptionEn) : (attraction.descriptionEn || attraction.descriptionAr), locale)

  const resolvedLocationAddress = (locale === 'ar' 
    ? (primaryLocation?.venueAr || primaryLocation?.addressAr || primaryLocation?.nameAr)
    : (primaryLocation?.venueEn || primaryLocation?.addressEn || primaryLocation?.nameEn)
  ) || (operations as any)?.venueName || (operations as any)?.venueAddressEn || (locale === 'ar' ? "الدوحة، قطر" : "Doha, Qatar")

  // Generate JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: displayName,
    description: displayDesc,
    image: attraction.heroMediaUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: resolvedLocationAddress,
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
      <div id="overview">
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
      </div>

      {/* Sticky Experience Navigation Bar */}
      <AttractionStickyNav
        name={displayName}
        logoUrl={attraction.logoUrl}
        isOpen={operations?.isOpen !== false}
        bookingUrl={resolveBookingUrl(attraction, locale)}
        locale={locale}
      />

      {/* 2 & 3. Intro + What's Inside */}
      {displayDesc && (
        <div id="whats-inside">
          <WhatsInside 
            description={displayDesc} 
            features={features || []}
            imageUrl={attraction.heroThumbnailUrl || attraction.heroFallbackUrl}
            locale={locale}
          />
        </div>
      )}

      {/* 4. Powered By E3 Brands & IP Showcase */}
      <BrandPlacementShowcase 
        brandPlacements={brandPlacements} 
        locale={locale} 
      />

      {/* Explore Sister Attractions Section */}
      <ExploreAttractionsSection 
        currentSlug={attraction.slug || slug}
        attractions={sisterAttractions || []}
        locale={locale}
      />

      {/* 5. Pricing & Tickets */}
      <div id="pricing">
        <PricingCards 
          pricing={pricing}
          offers={attraction.offers || []}
          bookingUrl={resolveBookingUrl(attraction, locale)}
          pricingNoteEn={(operations as any)?.pricingNoteEn}
          pricingNoteAr={(operations as any)?.pricingNoteAr}
          locale={locale}
        />
      </div>

      {/* 6. Partners */}
      <PartnersSection 
        partners={(attraction.partners as any) || []}
        locale={locale}
      />

      {/* 7. Social & What People Say ("Everyone is Talking") */}
      <div id="social-reviews">
        <SocialNewsSection 
          socialPreviews={(attraction.socialPreviews as any) || []}
          testimonials={(attraction.testimonials as any) || []}
          newsCoverage={(attraction.newsCoverage as any) || []}
          locale={locale}
        />
      </div>

      {/* 8. Gallery Lightbox */}
      <GalleryLightbox 
        items={gallery}
        locale={locale}
      />

      {/* 9. Live GIS Location Map */}
      <div id="location">
        <LiveBookingCard 
          attractionId={attraction.id}
          name={displayName}
          latitude={coordinates.lat}
          longitude={coordinates.lng}
          locationAddress={resolvedLocationAddress}
          primaryLocation={primaryLocation}
          temporalStatus={(attraction as any).temporalStatus || null}
          mapUrl={attraction.mapUrl}
          mapImageFallback={attraction.heroThumbnailUrl || attraction.heroFallbackUrl}
          schedule={schedule}
          operations={operations}
          bookingUrl={resolveBookingUrl(attraction, locale)}
          locale={locale}
        />
      </div>

      {/* 10. Visitor Feedback & Contact Form */}
      <AttractionFeedbackContactSection
        attractionId={attraction.id}
        attractionName={displayName}
        locale={locale}
      />

      {/* 11. FAQ Accordion */}
      <div id="faq">
        <FaqAccordion 
          faqs={faq}
          locale={locale}
        />
      </div>

      {/* 12. Footer CTA */}
      <section className="relative w-full bg-[var(--surface-default)] py-32 text-center overflow-hidden border-t border-[var(--border-level-2)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--text-primary)] mb-10 tracking-tighter uppercase leading-[1.1] max-w-4xl mx-auto break-words">
            {locale === "ar" ? `هل أنت مستعد لتجربة ${displayName}؟` : `Ready to Experience ${displayName}?`}
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
            <a 
              href={resolveBookingUrl(attraction, locale)}
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
