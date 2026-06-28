import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Calendar, Ticket, MapPin } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { SEO } from "@/components/shared/SEO"
import { Suspense, cache } from "react"
import { E3Image } from "@/lib/images"

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const baseUrl = getBaseUrl()
  
  return {
    title: params.locale === 'ar' ? 'التجارب العامة | E3 Qatar' : 'Public Experiences & Attractions | E3 Qatar',
    description: params.locale === 'ar' ? 'اكتشف فعاليات ومهرجانات قطر الحية.' : 'Discover world-class live events, festivals, and immersive family entertainment centers in Qatar.',
    alternates: {
      canonical: `${baseUrl}/b2c`,
      languages: {
        'en': `${baseUrl}/en/b2c`,
        'ar': `${baseUrl}/ar/b2c`,
      },
    },
    openGraph: {
      title: params.locale === 'ar' ? 'التجارب العامة | E3 Qatar' : 'Public Experiences & Attractions | E3 Qatar',
      description: params.locale === 'ar' ? 'اكتشف فعاليات ومهرجانات قطر الحية.' : 'Discover world-class live events, festivals, and immersive family entertainment centers in Qatar.',
      url: `${baseUrl}/b2c`,
    }
  }
}

const getFeaturedAttractions = cache(async (baseUrl: string) => {
  const fallbacks = [
    { id: 'mock-1', slug: 'winter-wonderland', name: { en: 'Winter Wonderland', ar: 'ونتر وندرلاند' }, image: 'https://images.unsplash.com/photo-1540839045646-19f7381eb6c7' },
    { id: 'mock-2', slug: 'desert-safari', name: { en: 'Desert Safari', ar: 'سفاري الصحراء' }, image: 'https://images.unsplash.com/photo-1540839045646-19f7381eb6c7' },
    { id: 'mock-3', slug: 'music-festival', name: { en: 'Summer Music Fest', ar: 'مهرجان الصيف الموسيقي' }, image: 'https://images.unsplash.com/photo-1540839045646-19f7381eb6c7' },
  ];

  try {
    const res = await fetch(`${baseUrl}/api/attractions?isPublished=true&limit=3`, { next: { revalidate: 60 } })
    if (res.ok) {
      const { data } = await res.json()
      if (data && data.length > 0) {
        const dbItems = data.map((a: any) => ({
          id: a.id,
          slug: a.slug,
          name: { en: a.nameEn, ar: a.nameAr },
          heroImage: a.heroMediaUrl || a.heroFallbackUrl || a.gallery?.[0]?.url || fallbacks[0].image,
          thumbnailImage: a.heroThumbnailUrl || a.heroFallbackUrl || a.gallery?.[0]?.url || fallbacks[0].image
        }))
        // Ensure we always have 3 items by appending fallbacks if needed
        return [...dbItems, ...fallbacks].slice(0, Math.max(3, dbItems.length));
      }
    }
    return fallbacks;
  } catch (error) {
    console.error("Failed to fetch featured attractions", error)
    return fallbacks;
  }
})

function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
      <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-zinc-200 animate-pulse border border-zinc-200" />
      <div className="rounded-3xl bg-zinc-200 animate-pulse border border-zinc-200" />
      <div className="rounded-3xl bg-zinc-200 animate-pulse border border-zinc-200" />
    </div>
  )
}

function AttractionsSkeleton() {
  return (
    <div className="flex overflow-x-auto gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto snap-x snap-mandatory pb-8 scrollbar-hide">
      {[1, 2, 3].map((i) => (
        <div key={i} className="min-w-[300px] md:min-w-[400px] snap-center group">
          <div className="aspect-[4/5] rounded-3xl bg-zinc-200 animate-pulse mb-6" />
          <div className="h-6 w-3/4 bg-zinc-200 animate-pulse mb-2 rounded" />
          <div className="h-4 w-1/2 bg-zinc-200 animate-pulse rounded" />
        </div>
      ))}
    </div>
  )
}

async function FeaturedAttractionsHero({ locale, baseUrl }: { locale: string, baseUrl: string }) {
  const attractions = await getFeaturedAttractions(baseUrl)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
      {/* Main Hero Card (Spans 2 cols, 2 rows) */}
      <div className="md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden relative group bg-zinc-900 border border-zinc-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
        <E3Image 
          src={attractions[0]?.heroImage || "https://images.unsplash.com/photo-1540839045646-19f7381eb6c7"} 
          alt={attractions[0]?.name?.[locale as 'en'|'ar'] || "Featured Attraction"}
          priority={true}
          fill
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500 text-black text-xs font-bold uppercase tracking-wider mb-4">
            {locale === 'ar' ? 'فعالية مميزة' : 'Featured Event'}
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
            {attractions[0]?.name?.[locale as 'en'|'ar'] || (locale === 'ar' ? 'اكتشف الروعة' : 'Experience the Wonder')}
          </h1>
          <Button asChild variant="primary" className="bg-amber-500 hover:bg-amber-600 text-black border-none">
            <Link href={`/${locale}/b2c/attractions/${attractions[0]?.slug || '1'}`}>
              {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Card 1 */}
      <div className="rounded-3xl p-8 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 flex flex-col justify-between hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-500 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors" />
        <div className="relative z-10">
          <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">
            {locale === 'ar' ? 'فعاليات نشطة' : 'Active Events'}
          </p>
          <h2 className="text-6xl font-black text-amber-500">12<span className="text-3xl text-zinc-700">+</span></h2>
        </div>
        <p className="text-zinc-400 font-medium relative z-10">
          {locale === 'ar' ? 'تجارب حية تقام حالياً في قطر.' : 'Live experiences happening right now across Qatar.'}
        </p>
      </div>

      {/* Metric Card 2 / Monthly Scroller Link */}
      <Link href={`/${locale}/b2c/calendar`} className="rounded-3xl p-8 bg-zinc-900 text-white border border-zinc-800 flex flex-col justify-between group hover:bg-zinc-800 transition-colors duration-500 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 group-hover:opacity-20 transition-opacity" />
        <div className="relative z-10">
          <Calendar className="w-10 h-10 text-amber-500 mb-4" />
          <h3 className="text-2xl font-bold mb-2">
            {locale === 'ar' ? 'استكشف التقويم' : 'Explore Calendar'}
          </h3>
          <p className="text-zinc-400">
            {locale === 'ar' ? 'شاهد الجدول الزمني الشهري الكامل للفعاليات.' : 'View the complete monthly schedule of events.'}
          </p>
        </div>
        <div className="relative z-10 flex justify-end">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors">
            <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
          </div>
        </div>
      </Link>
    </div>
  )
}

async function FeaturedAttractionsList({ locale, baseUrl }: { locale: string, baseUrl: string }) {
  const attractions = await getFeaturedAttractions(baseUrl)
  
  return (
    <div className="flex overflow-x-auto gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto snap-x snap-mandatory pb-8 scrollbar-hide">
      {attractions.slice(1).map((attr: any) => (
        <Link 
          key={attr.id} 
          href={`/${locale}/b2c/attractions/${attr.slug}`}
          className="min-w-[300px] md:min-w-[400px] snap-center group"
        >
          <div className="aspect-[4/5] rounded-3xl overflow-hidden relative mb-6">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
            <E3Image 
              src={attr.thumbnailImage || "https://images.unsplash.com/photo-1540839045646-19f7381eb6c7"} 
              alt={attr.name?.[locale as 'en'|'ar'] || "Attraction"} 
              fill
              isThumbnail={true}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <ArrowRight className="w-5 h-5 text-amber-600 rtl:-scale-x-100" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{attr.name?.[locale as 'en'|'ar']}</h3>
          <div className="flex items-center text-zinc-400 text-sm gap-2">
            <MapPin className="w-4 h-4" />
            <span>{locale === 'ar' ? 'مواقع متعددة في قطر' : 'Multiple Locations, Qatar'}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default async function B2CPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const isRTL = locale === 'ar'
  const baseUrl = getBaseUrl()

  return (
    <main className="bg-zinc-950 min-h-screen text-zinc-50 selection:bg-amber-500/30 selection:text-amber-900 relative overflow-hidden">
      {/* Industrial Grain Texture */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
      <SEO 
        type="Service"
        data={{
          name: "E3 B2C Public Experiences",
          provider: {
            "@type": "Organization",
            name: "Event Engineering Experts (E3)"
          },
          areaServed: ["Qatar"],
          description: "Discover world-class live events, festivals, and immersive family entertainment centers in Qatar.",
          url: `${baseUrl}/b2c`
        }}
      />
      
      {/* 1. HERO BENTO GRID (Pristine Snow Aesthetic) */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Suspense fallback={<HeroSkeleton />}>
            <FeaturedAttractionsHero locale={locale} baseUrl={baseUrl} />
          </Suspense>
      </section>

      {/* 2. LIVE ATTRACTIONS SCROLLER */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-900 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/5 via-zinc-950 to-zinc-950 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex justify-between items-end relative z-10">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">
              {locale === 'ar' ? 'الوجهات الحالية' : 'Current Attractions'}
            </h2>
            <p className="text-zinc-400 mt-2 text-lg">
              {locale === 'ar' ? 'تجارب لا تفوت هذا الموسم.' : 'Unmissable experiences this season.'}
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex rounded-full border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700">
            <Link href={`/${locale}/b2c/attractions`}>
              {locale === 'ar' ? 'عرض الكل' : 'View All'}
            </Link>
          </Button>
        </div>

        {/* Horizontal Scroll Layout */}
        <Suspense fallback={<AttractionsSkeleton />}>
          <FeaturedAttractionsList locale={locale} baseUrl={baseUrl} />
        </Suspense>
      </section>

      {/* 3. QUICK TICKETING CTA */}
      <section className="py-32 bg-zinc-950 border-t border-zinc-900 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <Ticket className="w-16 h-16 text-amber-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase drop-shadow-lg">
            {locale === 'ar' ? 'جاهز للحجز؟' : 'Ready to Book?'}
          </h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            {locale === 'ar' 
              ? 'احصل على تذاكرك لجميع الفعاليات والوجهات الكبرى في مكان واحد.' 
              : 'Secure your tickets for all major events and attractions in one place.'}
          </p>
          
          <Link href={`/${locale}/b2c/tickets`} className="inline-block relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-black border border-amber-500/30 hover:border-amber-500/80 px-12 py-5 rounded-full text-amber-500 hover:text-amber-400 font-black tracking-widest uppercase transition-all duration-300">
              {locale === 'ar' ? 'شراء التذاكر' : 'Buy Tickets'}
            </div>
          </Link>
        </div>
      </section>

    </main>
  )
}
