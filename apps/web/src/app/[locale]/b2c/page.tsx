import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Calendar, Ticket, MapPin } from "lucide-react"
import { Button } from "@/components/ui/Button"

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  return {
    title: params.locale === 'ar' ? 'التجارب العامة | E3 Qatar' : 'Public Experiences | E3 Qatar',
    description: params.locale === 'ar' ? 'اكتشف فعاليات ومهرجانات قطر الحية.' : 'Discover live events, festivals, and attractions in Qatar.',
  }
}

export default async function B2CPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const isRTL = locale === 'ar'
  
  let attractions = []
  
  try {
    const baseUrl = getBaseUrl()
    const res = await fetch(`${baseUrl}/api/attractions?isVisible=true&limit=3`, { next: { revalidate: 60 } })
    if (res.ok) {
      const { data } = await res.json()
      attractions = data || []
    }
  } catch (error) {
    console.error("Failed to fetch featured attractions", error)
    // Fallback data for showcase
    attractions = [
      { id: '1', slug: 'winter-wonderland', name: { en: 'Winter Wonderland', ar: 'ونتر وندرلاند' }, image: '/hero/hero-1.webp' },
      { id: '2', slug: 'desert-safari', name: { en: 'Desert Safari', ar: 'سفاري الصحراء' }, image: '/hero/hero-2.webp' },
      { id: '3', slug: 'music-festival', name: { en: 'Summer Music Fest', ar: 'مهرجان الصيف الموسيقي' }, image: '/hero/hero-3.webp' },
    ]
  }

  return (
    <main className="bg-[#fafafa] min-h-screen text-[#09090b] selection:bg-amber-500/30 selection:text-amber-900">
      
      {/* 1. HERO BENTO GRID (Pristine Snow Aesthetic) */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
          
          {/* Main Hero Card (Spans 2 cols, 2 rows) */}
          <div className="md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden relative group bg-zinc-100 border border-zinc-200">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img 
              src={attractions[0]?.image || "https://images.unsplash.com/photo-1540839045646-19f7381eb6c7"} 
              alt={attractions[0]?.name?.[locale as 'en'|'ar']}
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
          <div className="rounded-3xl p-8 bg-white border border-zinc-200 flex flex-col justify-between hover:shadow-xl transition-shadow duration-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors" />
            <div>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-2">
                {locale === 'ar' ? 'فعاليات نشطة' : 'Active Events'}
              </p>
              <h2 className="text-6xl font-black text-amber-500">12<span className="text-3xl text-zinc-300">+</span></h2>
            </div>
            <p className="text-zinc-600 font-medium">
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
      </section>

      {/* 2. LIVE ATTRACTIONS SCROLLER */}
      <section className="py-24 bg-white border-t border-zinc-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black text-zinc-900 tracking-tight">
              {locale === 'ar' ? 'الوجهات الحالية' : 'Current Attractions'}
            </h2>
            <p className="text-zinc-500 mt-2 text-lg">
              {locale === 'ar' ? 'تجارب لا تفوت هذا الموسم.' : 'Unmissable experiences this season.'}
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex rounded-full border-zinc-300 text-zinc-700 hover:bg-zinc-100">
            <Link href={`/${locale}/b2c/attractions`}>
              {locale === 'ar' ? 'عرض الكل' : 'View All'}
            </Link>
          </Button>
        </div>

        {/* Horizontal Scroll Layout */}
        <div className="flex overflow-x-auto gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto snap-x snap-mandatory pb-8 scrollbar-hide">
          {attractions.slice(1).map((attr: any) => (
            <Link 
              key={attr.id} 
              href={`/${locale}/b2c/attractions/${attr.slug}`}
              className="min-w-[300px] md:min-w-[400px] snap-center group"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden relative mb-6">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img 
                  src={attr.image || "https://images.unsplash.com/photo-1540839045646-19f7381eb6c7"} 
                  alt={attr.name?.[locale as 'en'|'ar']} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <ArrowRight className="w-5 h-5 text-amber-600 rtl:-scale-x-100" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-2">{attr.name?.[locale as 'en'|'ar']}</h3>
              <div className="flex items-center text-zinc-500 text-sm gap-2">
                <MapPin className="w-4 h-4" />
                <span>{locale === 'ar' ? 'مواقع متعددة في قطر' : 'Multiple Locations, Qatar'}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. QUICK TICKETING CTA */}
      <section className="py-24 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Ticket className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 mb-6">
            {locale === 'ar' ? 'جاهز للحجز؟' : 'Ready to Book?'}
          </h2>
          <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto">
            {locale === 'ar' 
              ? 'احصل على تذاكرك لجميع الفعاليات والوجهات الكبرى في مكان واحد.' 
              : 'Secure your tickets for all major events and attractions in one place.'}
          </p>
          <Button asChild size="xl" className="bg-amber-500 hover:bg-amber-600 text-black text-lg px-12 rounded-full border-none shadow-xl shadow-amber-500/20">
            <Link href={`/${locale}/b2c/tickets`}>
              {locale === 'ar' ? 'شراء التذاكر' : 'Buy Tickets'}
            </Link>
          </Button>
        </div>
      </section>

    </main>
  )
}
