import { notFound } from "next/navigation"
import { Metadata } from "next"

// Component Imports
import { HeroViewer } from "@/components/attractions/detail/HeroViewer"
import { WhatsInside } from "@/components/attractions/detail/WhatsInside"
import { PricingCards } from "@/components/attractions/detail/PricingCards"
import { GalleryLightbox } from "@/components/attractions/detail/GalleryLightbox"
import { LiveBookingCard } from "@/components/attractions/detail/LiveBookingCard"
import { FaqAccordion } from "@/components/attractions/detail/FaqAccordion"
import { PartnersSection } from '@/components/attractions/detail/PartnersSection';
import { SocialNewsSection } from '@/components/attractions/detail/SocialNewsSection';

import { db } from "@/lib/db"
import { toZonedTime, format } from 'date-fns-tz';
import { getDay, isWithinInterval } from 'date-fns';

async function getAttractionData(slug: string) {
  const attraction = await db.attraction.findFirst({
    where: { slug },
    include: {
      pricing: true,
      offers: true,
      faqs: { orderBy: { orderIndex: 'asc' } },
      gallery: { orderBy: { orderIndex: 'asc' } },
      temporalRules: true,
    }
  });

  if (!attraction) return null;

  // Calculate live operations status
  const now = new Date();
  const QATAR_TZ = 'Asia/Qatar';
  const qatarNow = toZonedTime(now, QATAR_TZ);
  const currentDay = getDay(qatarNow);
  const currentTimeStr = format(qatarNow, 'HH:mm');

  let isOpen = false;
  const rules = attraction.temporalRules || [];

  // 1. RECURRING
  const recurring = rules.filter(r => r.ruleType === 'RECURRING');
  for (const rule of recurring) {
     if (rule.daysOfWeek && Array.isArray(rule.daysOfWeek) && rule.daysOfWeek.includes(currentDay)) {
       if (rule.openTime && rule.closeTime && currentTimeStr >= rule.openTime && currentTimeStr <= rule.closeTime) {
         isOpen = true;
       }
     }
  }

  // 2. OVERRIDE
  const overrides = rules.filter(r => r.ruleType === 'OVERRIDE');
  for (const rule of overrides) {
     if (rule.startDate && rule.endDate) {
        const start = toZonedTime(rule.startDate, QATAR_TZ);
        const end = toZonedTime(rule.endDate, QATAR_TZ);
        if (isWithinInterval(qatarNow, { start, end })) {
           if (rule.openTime && rule.closeTime && currentTimeStr >= rule.openTime && currentTimeStr <= rule.closeTime) {
             isOpen = true;
           } else {
             isOpen = false;
           }
        }
     }
  }

  // 3. CLOSURE
  const closures = rules.filter(r => r.ruleType === 'CLOSURE');
  for (const rule of closures) {
     if (rule.startDate && rule.endDate) {
        const start = toZonedTime(rule.startDate, QATAR_TZ);
        const end = toZonedTime(rule.endDate, QATAR_TZ);
        if (isWithinInterval(qatarNow, { start, end })) {
           isOpen = false;
        }
     }
  }

  // Latest telemetry for live occupancy
  const telemetry = await db.telemetryLog.findFirst({
    where: { attractionId: attraction.id },
    orderBy: { timestamp: 'desc' }
  });

  const schedule = await db.eventSchedule.findFirst({
     where: { attractionId: attraction.id, startTime: { lte: now }, endTime: { gte: now } }
  });

  let currentOccupancy = 0;
  if (telemetry?.payload && typeof telemetry.payload === 'object' && 'count' in telemetry.payload) {
    currentOccupancy = (telemetry.payload as any).count;
  } else {
    currentOccupancy = schedule?.currentCount || 0;
  }

  const operations = {
    isOpen,
    currentOccupancy,
    maxCapacity: schedule?.capacityGate || 1000,
    averageVisitDuration: 90,
  };

  return { 
    attraction, 
    pricing: attraction.pricing, 
    gallery: attraction.gallery, 
    faq: attraction.faqs, 
    schedule: null, 
    operations 
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string, locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const attraction = await db.attraction.findUnique({
    where: { slug: params.slug },
    select: { nameEn: true, descriptionEn: true }
  })
  
  if (!attraction) return { title: 'Attraction Not Found' }

  return {
    title: `${attraction.nameEn || 'Attraction'} | E3 Qatar`,
    description: attraction.descriptionEn || '',
  }
}

export default async function AttractionDetailPage(props: { params: Promise<{ slug: string, locale: string }> }) {
  const params = await props.params;
  const { slug, locale } = params;
  const isRTL = locale === 'ar'
  
  const data = await getAttractionData(slug)

  if (!data) {
    notFound()
  }

  const { attraction, pricing, gallery, faq, schedule, operations } = data
  const displayName = locale === 'ar' ? attraction.nameAr : attraction.nameEn
  const displayDesc = locale === 'ar' ? attraction.descriptionAr : attraction.descriptionEn

  // Generate JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: displayName,
    description: displayDesc,
    image: attraction.heroMediaUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: (attraction.operations as any)?.venueName || 'Doha, Qatar',
      addressCountry: 'QA'
    }
  }

  const faqJsonLd = faq?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f: any) => ({
      '@type': 'Question',
      name: f.questionEn,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answerEn
      }
    }))
  } : null

  return (
    <main className="min-h-screen bg-black relative selection:bg-emerald-500 selection:text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      {/* 1. Hero Viewer (100vh) */}
      <HeroViewer 
        title={displayName} 
        tagline={displayDesc?.substring(0, 100) + '...'}
        mediaType={attraction.heroMediaType || 'IMAGE'}
        mediaUrl={attraction.heroMediaUrl}
        status={attraction.isFeatured ? "Featured Experience" : undefined}
      />

      {/* 2 & 3. Intro + What's Inside */}
      {displayDesc && (
        <WhatsInside 
          description={displayDesc} 
          features={(attraction.features as any) || []}
        />
      )}

      {/* 4. Pricing & Tickets */}
      <PricingCards 
        pricing={pricing}
        offers={attraction.offers || []}
        bookingUrl={attraction.ticketingUrl || `${process.env.NEXT_PUBLIC_BOOKING_QUBE_URL || 'https://booking.e3.qa'}/book?attraction=${attraction.id}`}
      />

      {/* 5. Partners */}
      <PartnersSection 
        partners={(attraction.partners as any) || []}
        locale={locale}
      />

      {/* 6. Social & What People Say */}
      <SocialNewsSection 
        socialPreviews={(attraction.socialPreviews as any) || []}
        testimonials={(attraction.testimonials as any) || []}
        newsCoverage={(attraction.newsCoverage as any) || []}
        locale={locale}
      />

      {/* 7. Gallery Lightbox */}
      <GalleryLightbox 
        items={gallery}
      />

      {/* 8. Live Booking & Map */}
      <LiveBookingCard 
        attractionId={attraction.id}
        name={displayName}
        latitude={null}
        longitude={null}
        locationAddress={(attraction.operations as any)?.venueName || "Doha, Qatar"}
        mapUrl={attraction.mapUrl}
        schedule={schedule}
        operations={attraction.operations}
        bookingUrl={attraction.ticketingUrl || `${process.env.NEXT_PUBLIC_BOOKING_QUBE_URL || 'https://booking.e3.qa'}/book?attraction=${attraction.id}`}
      />

      {/* 9. FAQ */}
      <FaqAccordion 
        faqs={faq}
      />

      {/* 8. Footer CTA */}
      <section className="w-full bg-zinc-900 py-24 text-center border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter uppercase">
            {locale === 'ar' ? `هل أنت مستعد لتجربة ${displayName}؟` : `Ready to Experience ${displayName}?`}
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href={attraction.ticketingUrl || `${process.env.NEXT_PUBLIC_BOOKING_QUBE_URL || 'https://booking.e3.qa'}/book?attraction=${attraction.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors"
            >
              {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
            </a>
            <a 
              href={`/${locale}/contact`}
              className="px-8 py-4 bg-zinc-800 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-colors"
            >
              {locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
