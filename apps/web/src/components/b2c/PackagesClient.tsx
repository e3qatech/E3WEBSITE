"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Sparkles, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Check, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Grid
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { InteractiveCard } from "@/components/ui/InteractiveCard"
import { PackageEnquiryModal } from "@/components/b2c/PackageEnquiryModal"
import { Footer } from "@/components/layout/Footer"
import { SmartPackageFinderModal } from "@/components/b2c/SmartPackageFinderModal"
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer"
import { cn } from "@/lib/utils"

export function PackagesClient({
  locale,
  initialSettings,
  packages: initialPackages = []
}: {
  locale: string
  initialSettings?: any
  packages?: any[]
}) {
  const isAr = locale === "ar"
  const router = useRouter()
  const searchParams = useSearchParams()

  const [packagesList, setPackagesList] = useState<any[]>(initialPackages)
  const [loading, setLoading] = useState(false)

  // Filters State synced with URL searchParams
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.get("category") || "ALL")
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("search") || "")
  const [selectedGuestRange, setSelectedGuestRange] = useState<string>(searchParams.get("guests") || "ALL")

  // Modals & Comparison State
  const [isFinderOpen, setIsFinderOpen] = useState(false)
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false)
  const [selectedPackageForEnquiry, setSelectedPackageForEnquiry] = useState<any | null>(null)
  const [comparedPackages, setComparedPackages] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/b2c/packages")
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json.data)) setPackagesList(json.data)
      })
      .catch(console.error)
  }, [])

  // Sync category filter to URL params without page reload
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat)
    const params = new URLSearchParams(searchParams.toString())
    if (cat === "ALL") params.delete("category")
    else params.set("category", cat)
    router.replace(`/${locale}/b2c/packages?${params.toString()}`, { scroll: false })
  }

  // Filter logic
  const filteredPackages = packagesList.filter(pkg => {
    const matchesCategory = activeCategory === "ALL" || pkg.category === activeCategory
    const matchesSearch = 
      !searchQuery ||
      (pkg.titleEn || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.titleAr || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleCompare = (pkg: any) => {
    if (comparedPackages.some(p => p.id === pkg.id)) {
      setComparedPackages(comparedPackages.filter(p => p.id !== pkg.id))
    } else {
      if (comparedPackages.length >= 3) {
        alert(isAr ? "يمكنك مقارنة 3 باقات كحد أقصى" : "You can compare up to 3 packages max")
        return
      }
      setComparedPackages([...comparedPackages, pkg])
    }
  }

  const categoryTabs = [
    { id: "ALL", labelEn: "All Packages", labelAr: "جميع الباقات" },
    { id: "BIRTHDAY", labelEn: "Birthdays", labelAr: "أعيد الميلاد" },
    { id: "GROUP", labelEn: "Groups", labelAr: "المجموعات" },
    { id: "SCHOOL", labelEn: "Schools & Nurseries", labelAr: "المدارس والحضانات" },
    { id: "CORPORATE", labelEn: "Corporate & Team Building", labelAr: "الشركات وبناء الفرق" },
    { id: "PRIVATE_EVENT", labelEn: "Private Events", labelAr: "الفعاليات الخاصة" },
    { id: "CUSTOM", labelEn: "Custom Experiences", labelAr: "تجارب حسب الطلب" }
  ]

  const heroEyebrow = isAr
    ? (initialSettings?.eyebrowAr || initialSettings?.hero?.badgeAr || "باقات الفعاليات والمناسبات الاستثنائية")
    : (initialSettings?.eyebrowEn || initialSettings?.hero?.badgeEn || "E3 Celebration & Group Packages")

  const heroTitle = isAr
    ? (initialSettings?.titleAr || initialSettings?.hero?.titleAr || "لحظاتكم الكبيرة تستحق تجارب استثنائية")
    : (initialSettings?.titleEn || initialSettings?.hero?.titleEn || "Big Moments Deserve Bigger Experiences")

  const heroDesc = isAr
    ? (initialSettings?.descAr || initialSettings?.hero?.subtitleAr || "اكتشفوا باقات أعياد الميلاد والمجموعات والمدارس والشركات في وجهات E3 الترفيهية بقطر.")
    : (initialSettings?.descEn || initialSettings?.hero?.subtitleEn || "Discover birthday celebrations, group adventures, school experiences and corporate packages across E3's entertainment destinations.")

  const primaryCta = isAr
    ? (initialSettings?.primaryCtaAr || "اختر باقتك")
    : (initialSettings?.primaryCtaEn || "Find Your Package")

  const secondaryCta = isAr
    ? (initialSettings?.secondaryCtaAr || "خطط لفعاليتك الخاصة")
    : (initialSettings?.secondaryCtaEn || "Plan a Custom Event")

  const heroMedia = initialSettings?.heroMedia

  return (
    <div className="min-h-screen text-[var(--text-primary)] font-poppins pb-24" dir={isAr ? "rtl" : "ltr"}>
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 px-4 md:px-8 border-b border-[var(--border-level-2)] bg-gradient-to-b from-[var(--surface-default)] to-[var(--bg-level-1)] text-center overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--e3-royal-blue)]/10 text-[var(--e3-royal-blue)] border border-[var(--e3-royal-blue)]/20 text-xs font-mono font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            {heroEyebrow}
          </span>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-display uppercase leading-[1.05]">
            {heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-medium max-w-2xl mx-auto">
            {heroDesc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button onClick={() => setIsFinderOpen(true)} className="gap-2 shadow-lg">
              <Sparkles className="w-4 h-4" />
              {primaryCta}
            </Button>
            <Button variant="outline" onClick={() => { setSelectedPackageForEnquiry(null); setIsEnquiryOpen(true); }} className="gap-2">
              {secondaryCta}
            </Button>
          </div>

          {heroMedia?.mediaUrl && (
            <div className="mt-8 rounded-3xl overflow-hidden border border-[var(--border-level-2)] shadow-2xl max-w-3xl mx-auto max-h-[350px]">
              <UniversalMediaRenderer
                src={heroMedia.mediaUrl}
                type={(heroMedia.mediaType as any) || "IMAGE"}
                alt={heroTitle}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* 2. CATEGORY TABS & FILTER BAR */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--border-level-2)]">
          {categoryTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleCategoryChange(tab.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeCategory === tab.id
                  ? "bg-[var(--e3-royal-blue)] text-white shadow-md"
                  : "bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Filter Bar Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-level-2)] shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder={isAr ? "ابحث عن اسم الباقة أو الفعالية..." : "Search packages by title or keyword..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl focus:outline-none focus:border-[var(--e3-royal-blue)]"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {comparedPackages.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold">
                {comparedPackages.length} {isAr ? "محددة للمقارنة" : "Selected to Compare"}
              </span>
            )}
          </div>
        </div>

        {/* 3. PACKAGE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map(pkg => {
            const isComparing = comparedPackages.some(p => p.id === pkg.id)
            const title = isAr ? (pkg.titleAr || pkg.titleEn) : pkg.titleEn
            const desc = isAr ? (pkg.shortDescriptionAr || pkg.shortDescriptionEn) : pkg.shortDescriptionEn
            const inclusions = Array.isArray(pkg.inclusions) ? pkg.inclusions.slice(0, 3) : []

            return (
              <InteractiveCard key={pkg.id} className="p-0 overflow-hidden flex flex-col justify-between" glowColor="rgba(26, 31, 214, 0.3)">
                <div>
                  {/* Cover Media */}
                  <div className="relative h-52 bg-zinc-900 overflow-hidden">
                    <img
                      src={pkg.coverMediaUrl || "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80"}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {pkg.badgeTextEn && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[var(--e3-royal-blue)] text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                        {isAr ? pkg.badgeTextAr || pkg.badgeTextEn : pkg.badgeTextEn}
                      </span>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold font-mono">
                      <span>{pkg.minGuests}-{pkg.maxGuests} Guests</span>
                      <span>{pkg.durationMinutes ? `${pkg.durationMinutes} Mins` : ""}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-extrabold uppercase text-[var(--e3-royal-blue)] tracking-wider">
                        {pkg.category}
                      </span>
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isComparing}
                          onChange={() => toggleCompare(pkg)}
                          className="rounded text-[var(--e3-royal-blue)]"
                        />
                        <span>{isAr ? "مقارنة" : "Compare"}</span>
                      </label>
                    </div>

                    <h3 className="font-extrabold text-lg text-[var(--text-primary)] font-display uppercase line-clamp-1">
                      {title}
                    </h3>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                      {desc}
                    </p>

                    {/* Key Inclusions Bullet Points */}
                    {inclusions.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-[var(--border-level-2)]">
                        {inclusions.map((inc: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="line-clamp-1">{isAr ? inc.titleAr || inc.titleEn : inc.titleEn}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer CTAs */}
                <div className="p-6 pt-0 space-y-3">
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-level-2)]">
                    <span className="text-xs text-[var(--text-secondary)] font-mono">Starting From</span>
                    <span className="text-lg font-black font-mono text-[var(--e3-royal-blue)]">
                      {pkg.startingPrice ? `${pkg.startingPrice} ${pkg.currency || 'QAR'}` : 'On Request'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/${locale}/b2c/packages/${pkg.slug}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full text-[11px] font-bold uppercase">
                        {isAr ? "عرض التفاصيل" : "View Package"}
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      onClick={() => { setSelectedPackageForEnquiry(pkg); setIsEnquiryOpen(true); }}
                      className="w-full text-[11px] font-bold uppercase"
                    >
                      {isAr ? "طلب حجز" : "Quick Enquiry"}
                    </Button>
                  </div>
                </div>
              </InteractiveCard>
            )
          })}
        </div>
      </section>

      {/* MODALS */}
      <SmartPackageFinderModal
        isOpen={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
        locale={locale}
        packages={packagesList}
        onSelectPackage={pkg => { setSelectedPackageForEnquiry(pkg); setIsEnquiryOpen(true); }}
      />

      <PackageEnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => { setIsEnquiryOpen(false); setSelectedPackageForEnquiry(null); }}
        locale={locale}
        selectedPackage={selectedPackageForEnquiry}
      />

      {/* Page-Specific B2C Footer with Background Media (Image, Video, Iframe, 3D) */}
      <Footer 
        portal="b2c" 
        settings={{ 
          footerMediaUrl: initialSettings?.footerMedia?.mediaUrl || initialSettings?.footerMediaUrl, 
          footerMediaType: initialSettings?.footerMedia?.mediaType || initialSettings?.footerMediaType, 
          footerPosterUrl: initialSettings?.footerMedia?.posterMediaUrl || initialSettings?.footerPosterUrl 
        }} 
      />
    </div>
  )
}
