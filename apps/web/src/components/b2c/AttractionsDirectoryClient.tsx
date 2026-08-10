"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, MapPin, Calendar, ArrowRight, Check, X, Shield, Compass, Sparkles, Map } from 'lucide-react'
import { resolveAvailabilityStatus, resolveBookingUrl, filterAttractionsByUrlParams } from '@/lib/cms-attractions'
import { DynamicSpatialHub } from '@/components/shared/DynamicWrappers'

interface AttractionsDirectoryClientProps {
  locale: string
  initialAttractions: any[]
}

const CATEGORY_OPTIONS = [
  { id: 'ALL', labelEn: 'All Categories', labelAr: 'جميع الفئات' },
  { id: 'THEME_PARK', labelEn: 'Theme Parks', labelAr: 'مدن الملاهي' },
  { id: 'INFLATABLE', labelEn: 'Inflatables & Parks', labelAr: 'مدن الألعاب الهوائية' },
  { id: 'FAMILY', labelEn: 'Family & Edutainment', labelAr: 'الترفيه العائلي والتعليمي' },
  { id: 'WATER', labelEn: 'Aqua & Beach', labelAr: 'الألعاب المائية والشاطئية' },
  { id: 'ARENA', labelEn: 'Laser & Esports', labelAr: 'حلبات الليزر والرياضات' },
]

const STORY_OPTIONS = [
  { id: 'ALL', labelEn: 'All Stories', labelAr: 'جميع الحكايات' },
  { id: 'drive', labelEn: 'Drive', labelAr: 'قيادة' },
  { id: 'bounce', labelEn: 'Bounce', labelAr: 'قفز' },
  { id: 'compete', labelEn: 'Compete', labelAr: 'منافسة' },
  { id: 'explore', labelEn: 'Explore', labelAr: 'استكشاف' },
  { id: 'create', labelEn: 'Create', labelAr: 'إبداع' },
  { id: 'learn', labelEn: 'Learn', labelAr: 'تعلم' },
]

export function AttractionsDirectoryClient({ locale, initialAttractions }: AttractionsDirectoryClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAr = locale === 'ar'

  const [search, setSearch] = useState(() => searchParams.get('search') || '')
  const [selectedStory, setSelectedStory] = useState(() => searchParams.get('story') || 'ALL')
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'ALL')
  const [openNowFilter, setOpenNowFilter] = useState(() => searchParams.get('openNow') === 'true')
  const [bookingOnlyFilter, setBookingOnlyFilter] = useState(() => searchParams.get('booking') === 'true')
  const [viewMode, setViewMode] = useState<'GRID' | 'MAP'>('GRID')

  // Filter attractions canonically
  const filteredAttractions = useMemo(() => {
    return filterAttractionsByUrlParams(initialAttractions, {
      search,
      story: selectedStory !== 'ALL' ? selectedStory : undefined,
      category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      openNow: openNowFilter,
      bookingAvailable: bookingOnlyFilter,
    })
  }, [initialAttractions, search, selectedStory, selectedCategory, openNowFilter, bookingOnlyFilter])

  const updateUrlParams = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams.toString())
    if (value && value !== 'ALL' && value !== 'false') {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    router.replace(`/${locale}/b2c/attractions?${newParams.toString()}`, { scroll: false })
  }

  const clearAllFilters = () => {
    setSearch('')
    setSelectedStory('ALL')
    setSelectedCategory('ALL')
    setOpenNowFilter(false)
    setBookingOnlyFilter(false)
    router.replace(`/${locale}/b2c/attractions`, { scroll: false })
  }

  const publishedCount = initialAttractions.length

  return (
    <div className="space-y-12 pb-24 text-white">
      {/* 1. Compact Discovery Hero */}
      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 text-center md:text-start">
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? `وجهات إي ثري الترفيهية (${publishedCount})` : `E3 Experiences Directory (${publishedCount})`}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
              {isAr ? "اكتشف تجربتك القادمة" : "Find Your Next Experience"}
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl font-medium mt-2">
              {isAr
                ? "استكشف التجارب حسب النشاط والفئة العمرية والموقع والتوفر في قطر."
                : "Explore attractions by activity, category, location, and verified availability across Qatar."}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setViewMode('GRID')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'GRID' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isAr ? "قائمة الوجهات" : "Directory Grid"}</span>
            </button>

            <button
              onClick={() => setViewMode('MAP')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'MAP' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>{isAr ? "الخريطة التفاعلية" : "Interactive Map"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Search & Filter Bar */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isAr ? "ابحث عن تجربة أو وجهة…" : "Search experiences or venues…"}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  updateUrlParams('search', e.target.value || null)
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl ps-11 pe-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Category Select */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  updateUrlParams('category', e.target.value)
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isAr ? c.labelAr : c.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Story Filter Select */}
            <div>
              <select
                value={selectedStory}
                onChange={(e) => {
                  setSelectedStory(e.target.value)
                  updateUrlParams('story', e.target.value)
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
              >
                {STORY_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isAr ? s.labelAr : s.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Toggles & Active Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const val = !openNowFilter
                  setOpenNowFilter(val)
                  updateUrlParams('openNow', val ? 'true' : null)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  openNowFilter
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {isAr ? "مفتوح الآن" : "Open Today"}
              </button>

              <button
                onClick={() => {
                  const val = !bookingOnlyFilter
                  setBookingOnlyFilter(val)
                  updateUrlParams('booking', val ? 'true' : null)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  bookingOnlyFilter
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {isAr ? "حجز التذاكر متاح" : "Booking Available"}
              </button>

              {(search || selectedStory !== 'ALL' || selectedCategory !== 'ALL' || openNowFilter || bookingOnlyFilter) && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isAr ? "إعادة ضبط الفلاتر" : "Clear Filters"}</span>
                </button>
              )}
            </div>

            <span className="text-xs font-mono text-slate-400 font-bold">
              {isAr ? `تم العثور على ${filteredAttractions.length} تجربة` : `Found ${filteredAttractions.length} experiences`}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Main Results Display Mode */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {viewMode === 'MAP' ? (
          <div className="rounded-3xl border border-slate-800 overflow-hidden bg-slate-950 h-[650px] shadow-2xl relative">
            <DynamicSpatialHub attractions={filteredAttractions} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttractions.map((attr) => {
              const avail = resolveAvailabilityStatus(attr)
              const bookingUrl = resolveBookingUrl(attr, locale)
              const name = isAr ? attr.nameAr || attr.name?.ar || attr.nameEn : attr.nameEn || attr.name?.en
              const desc = isAr ? attr.descriptionAr || attr.description?.ar || attr.descriptionEn : attr.descriptionEn || attr.description?.en
              const image = attr.heroMediaUrl || attr.heroThumbnailUrl || attr.gallery?.[0]?.url || 'https://images.unsplash.com/photo-1540839045646-19f7381eb6c7'

              return (
                <div
                  key={attr.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-4 start-4 flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                        avail.isOpen ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}>
                        {isAr ? avail.statusTagAr : avail.statusTagEn}
                      </span>
                    </div>

                    <div className="absolute bottom-4 start-4 end-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{attr.venue?.nameEn || attr.tagline || (isAr ? 'قطر' : 'Qatar')}</span>
                      </div>
                      <h2 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {name}
                      </h2>
                    </div>
                  </div>

                  <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-300 font-light leading-relaxed line-clamp-3">
                      {desc}
                    </p>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block uppercase">
                          {isAr ? "الحالة" : "Availability"}
                        </span>
                        <span className="text-xs font-extrabold text-white">
                          {isAr ? avail.displayLabelAr : avail.displayLabelEn}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${locale}/b2c/attractions/${attr.slug}`}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                        >
                          {isAr ? "تفاصيل" : "Explore"}
                        </Link>
                        <a
                          href={bookingUrl}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md"
                        >
                          {isAr ? "حجز" : "Book"}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredAttractions.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-4 rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
                <Compass className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">
                  {isAr ? "لم نجد تجربة تطابق الفلاتر" : "No experiences match your filters"}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {isAr ? "يرجى تغيير كلمة البحث أو إعادة ضبط الفلاتر للاطلاع على كافة الوجهات." : "Try resetting filters to view all available experiences."}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold transition-all shadow-md cursor-pointer"
                >
                  {isAr ? "عرض كل التجارب" : "Show All Experiences"}
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
