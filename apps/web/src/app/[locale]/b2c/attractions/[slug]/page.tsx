import { notFound } from "next/navigation"
import { Metadata } from "next"

// Component Imports
import { HeroViewer } from "@/components/attractions/detail/HeroViewer"
import { WhatsInside } from "@/components/attractions/detail/WhatsInside"
import { PricingCards } from "@/components/attractions/detail/PricingCards"
import { GalleryLightbox } from "@/components/attractions/detail/GalleryLightbox"
import { LiveBookingCard } from "@/components/attractions/detail/LiveBookingCard"
import { FaqAccordion } from "@/components/attractions/detail/FaqAccordion"

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

async function getAttractionData(slug: string) {
  const baseUrl = getBaseUrl()
  
  // 1. First fetch base attraction to get its ID
  const res = await fetch(`${baseUrl}/api/attractions/${slug}`, { next: { revalidate: 60 } })
  if (!res.ok) return null
  const { data: attraction } = await res.json()

  if (!attraction) return null

  const id = attraction.id

  // 2. Parallel Fetch related data
  const [pricingRes, galleryRes, faqRes, scheduleRes, operationsRes] = await Promise.all([
    fetch(`${baseUrl}/api/attractions/${id}/pricing`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}/api/attractions/${id}/gallery`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}/api/attractions/${id}/faq`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}/api/attractions/${id}/schedule?date=today`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}/api/attractions/${id}/operations`, { next: { revalidate: 0 } }), // Live, no cache
  ])

  const [pricing, gallery, faq, schedule, operations] = await Promise.all([
    pricingRes.ok ? pricingRes.json().then(r => r.data) : [],
    galleryRes.ok ? galleryRes.json().then(r => r.data) : [],
    faqRes.ok ? faqRes.json().then(r => r.data) : [],
    scheduleRes.ok ? scheduleRes.json().then(r => r.data) : [],
    operationsRes.ok ? operationsRes.json().then(r => r.data) : null,
  ])

  return { attraction, pricing, gallery, faq, schedule, operations }
}

export async function generateMetadata(props: { params: Promise<{ slug: string, locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const baseUrl = getBaseUrl()
  const res = await fetch(`${baseUrl}/api/attractions/${params.slug}`)
  if (!res.ok) return { title: 'Attraction Not Found' }
  const { data } = await res.json()

  return {
    title: `${data.nameEn} | E3 Qatar`,
    description: data.descriptionEn,
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
      streetAddress: operations?.venueName || 'Doha, Qatar',
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
          features={attraction.features || []}
        />
      )}

      {/* 4. Pricing & Tickets */}
      <PricingCards 
        pricing={pricing}
        offers={attraction.offers || []}
        bookingUrl={attraction.ticketingUrl || `${process.env.NEXT_PUBLIC_BOOKING_QUBE_URL || 'https://booking.e3.qa'}/book?attraction=${attraction.id}`}
      />

      {/* 5. Gallery Lightbox */}
      <GalleryLightbox 
        items={gallery}
      />

      {/* 6. Live Booking & Map */}
      <LiveBookingCard 
        attractionId={attraction.id}
        name={displayName}
        latitude={null}
        longitude={null}
        locationAddress={operations?.venueName || "Doha, Qatar"}
        mapUrl={attraction.mapUrl}
        schedule={schedule}
        bookingUrl={attraction.ticketingUrl || `${process.env.NEXT_PUBLIC_BOOKING_QUBE_URL || 'https://booking.e3.qa'}/book?attraction=${attraction.id}`}
      />

      {/* 7. FAQ */}
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
