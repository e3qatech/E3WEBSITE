"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Search, Check, Sparkles, Scale, Filter, ChevronDown, 
  ArrowRight, ShieldCheck, Users, Clock, Building, Heart,
  PartyPopper, GraduationCap, Briefcase, CalendarRange, Wand2,
  Calendar, Phone, HelpCircle, X
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { InteractiveCard } from "@/components/ui/InteractiveCard"
import { PackageEnquiryModal } from "@/components/b2c/PackageEnquiryModal"
import { SmartPackageFinderModal } from "@/components/b2c/SmartPackageFinderModal"
import { CustomPackageBuilder } from "@/components/b2c/CustomPackageBuilder"
import { PackageCompareDrawer } from "@/components/b2c/PackageCompareDrawer"
import { E3LivingHero } from "@/components/b2c/hero/E3LivingHero"
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
  const [categoriesList, setCategoriesList] = useState<any[]>([])

  // Filters State synced with URL searchParams
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.get("category") || "ALL")
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("search") || "")
  const [audienceFilter, setAudienceFilter] = useState<string>(searchParams.get("audience") || "ALL")
  const [venueFilter, setVenueFilter] = useState<string>(searchParams.get("venue") || "ALL")
  const [priceSort, setPriceSort] = useState<string>(searchParams.get("sort") || "recommended")
  const [guestCountFilter, setGuestCountFilter] = useState<string>("ALL")

  // Modals & Comparison State
  const [isFinderOpen, setIsFinderOpen] = useState(false)
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState(false)
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false)
  const [selectedPackageForEnquiry, setSelectedPackageForEnquiry] = useState<any | null>(null)
  const [comparedPackages, setComparedPackages] = useState<any[]>([])
  const [savedPackages, setSavedPackages] = useState<string[]>([])
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)

  // Fetch live packages & categories
  useEffect(() => {
    fetch("/api/b2c/packages")
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json.data)) setPackagesList(json.data)
      })
      .catch(console.error)

    fetch("/api/b2c/package-categories")
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json.data)) setCategoriesList(json.data)
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

  // Filter and Sort Logic
  const filteredPackages = useMemo(() => {
    return packagesList.filter(pkg => {
      // 1. Category filter: support category string or categoryRel slug
      const matchesCategory = 
        activeCategory === "ALL" || 
        pkg.category === activeCategory ||
        pkg.categoryRel?.slug === activeCategory.toLowerCase() ||
        (activeCategory === "CELEBRATE" && pkg.category === "BIRTHDAY") ||
        (activeCategory === "LEARN_EXPLORE" && pkg.category === "SCHOOL") ||
        (activeCategory === "PLAY_TOGETHER" && pkg.category === "GROUP") ||
        (activeCategory === "EVENTS" && pkg.category === "PRIVATE_EVENT")

      // 2. Search query filter
      const matchesSearch = 
        !searchQuery ||
        (pkg.titleEn || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pkg.titleAr || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pkg.shortDescriptionEn || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pkg.shortDescriptionAr || "").toLowerCase().includes(searchQuery.toLowerCase())

      // 3. Audience filter
      const matchesAudience = 
        audienceFilter === "ALL" ||
        pkg.audienceType === audienceFilter ||
        (Array.isArray(pkg.audienceTypes) && pkg.audienceTypes.includes(audienceFilter))

      // 4. Venue filter
      const matchesVenue = 
        venueFilter === "ALL" ||
        pkg.locationId === venueFilter ||
        pkg.attractionId === venueFilter ||
        pkg.attraction?.slug === venueFilter ||
        pkg.location?.slug === venueFilter

      // 5. Guest count filter
      let matchesGuests = true
      if (guestCountFilter === "UNDER_15") matchesGuests = pkg.minGuests <= 15
      else if (guestCountFilter === "15_30") matchesGuests = pkg.minGuests <= 30 && pkg.maxGuests >= 15
      else if (guestCountFilter === "30_75") matchesGuests = pkg.maxGuests >= 30
      else if (guestCountFilter === "75_PLUS") matchesGuests = pkg.maxGuests >= 75

      return matchesCategory && matchesSearch && matchesAudience && matchesVenue && matchesGuests
    }).sort((a, b) => {
      if (priceSort === "price-asc") return (a.startingPrice || 0) - (b.startingPrice || 0)
      if (priceSort === "price-desc") return (b.startingPrice || 0) - (a.startingPrice || 0)
      if (priceSort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (priceSort === "popularity") return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0)
      // Recommended: Featured first, then sortOrder
      if (a.isFeatured !== b.isFeatured) return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      return (a.sortOrder || 0) - (b.sortOrder || 0)
    })
  }, [packagesList, activeCategory, searchQuery, audienceFilter, venueFilter, guestCountFilter, priceSort])

  const toggleCompare = (pkg: any) => {
    if (comparedPackages.some(p => p.id === pkg.id)) {
      setComparedPackages(comparedPackages.filter(p => p.id !== pkg.id))
    } else {
      if (comparedPackages.length >= 3) {
        alert(isAr ? "يمكنك مقارنة ٣ باقات كحد أقصى" : "You can compare up to 3 packages max")
        return
      }
      setComparedPackages([...comparedPackages, pkg])
    }
  }

  const toggleSave = (pkgId: string) => {
    setSavedPackages(prev => 
      prev.includes(pkgId) ? prev.filter(id => id !== pkgId) : [...prev, pkgId]
    )
  }

  const clearAllFilters = () => {
    setActiveCategory("ALL")
    setSearchQuery("")
    setAudienceFilter("ALL")
    setVenueFilter("ALL")
    setGuestCountFilter("ALL")
    setPriceSort("recommended")
    router.replace(`/${locale}/b2c/packages`, { scroll: false })
  }

  // Canonical Category Tabs
  const categoryTabs = [
    { id: "ALL", labelEn: "All Experiences", labelAr: "جميع الباقات", icon: Sparkles },
    { id: "CELEBRATE", labelEn: "Celebrate", labelAr: "أعياد الميلاد", icon: PartyPopper },
    { id: "LEARN_EXPLORE", labelEn: "Learn & Explore", labelAr: "التعليم والاستكشاف", icon: GraduationCap },
    { id: "PLAY_TOGETHER", labelEn: "Play Together", labelAr: "المجموعات والأصدقاء", icon: Users },
    { id: "CORPORATE", labelEn: "Corporate", labelAr: "الشركات وبناء الفرق", icon: Briefcase },
    { id: "EVENTS", labelEn: "Events & Buyouts", labelAr: "الفعاليات الكبرى", icon: Building },
    { id: "SEASONAL", labelEn: "Seasonal Camps", labelAr: "الباقات الموسمية", icon: CalendarRange },
    { id: "CUSTOM", labelEn: "Custom", labelAr: "تجارب حسب الطلب", icon: Wand2 }
  ]

  // FAQs Data (Bilingual)
  const faqs = [
    {
      id: "faq-1",
      questionEn: "How far in advance should we book an E3 experience package?",
      questionAr: "كم من الوقت قبل الموعد ينبغي حجز باقات إي ثري؟",
      answerEn: "We recommend booking at least 7 to 14 days in advance for birthday parties and small groups, and 3 to 6 weeks in advance for corporate team-building events, school trips, and full venue buyouts.",
      answerAr: "نوصي بالحجز قبل ٧ إلى ١٤ يوماً لحفلات أعياد الميلاد والمجموعات الصغيرة، وقبل ٣ إلى ٦ أسابيع لفعاليات الشركات والرحلات المدرسية والحجوزات الحصرية."
    },
    {
      id: "faq-2",
      questionEn: "Can we customize catering, decorations, and add-on services?",
      questionAr: "هل يمكننا تخصيص الضيافة، الديكورات، والخدمات الإضافية؟",
      answerEn: "Yes! Every E3 package supports modular add-ons including custom theme decorations, gourmet catering, professional photography, party hosts, and mascot appearances.",
      answerAr: "نعم بكل تأكيد! تتيح جميع باقات إي ثري إضافة خدمات مخصصة تشمل الديكورات والثيمات، بوفيه الضيافة، التصوير الفوتوغرافي والفيديو، ومقدمي الفعاليات."
    },
    {
      id: "faq-3",
      questionEn: "Are supervisors and safety marshals provided for school trips?",
      questionAr: "هل يتم توفير مشرفين سلامة معتمدين للرحلات المدرسية؟",
      answerEn: "Yes, all educational and group packages include certified safety marshals, first-aid trained personnel, and complimentary access for teachers and school supervisors.",
      answerAr: "نعم، تتضمن جميع باقات المدارس والرحلات مشرفين سلامة معتمدين ومدربين على الإسعافات الأولية، بالإضافة إلى دخول مجاني للمعلمين والمشرفين."
    },
    {
      id: "faq-4",
      questionEn: "What is the deposit and payment policy for group and corporate bookings?",
      questionAr: "ما هي شروط الدفعة المقدمة والدفع لحجوزات المجموعات والشركات؟",
      answerEn: "A 50% deposit secures your preferred date and venue slot, with the remaining balance due 48 hours before the event date.",
      answerAr: "يتم دفع ٥٠٪ كدفعة مقدمة لتأكيد تاريخ الفعالية وحجز الساحة، ويُستحق المتبقي قبل ٤٨ ساعة من موعد الفعالية."
    }
  ]

  // Hero copy resolution with initialSettings fallbacks
  const heroEyebrowEn = initialSettings?.eyebrowEn || "E3 Experiences & Packages"
  const heroEyebrowAr = initialSettings?.eyebrowAr || "تجارب وباقات إي ثري"

  const heroTitleEn = initialSettings?.titleEn || "Plans for Every Kind of Moment"
  const heroTitleAr = initialSettings?.titleAr || "باقات لكل لحظة تستحق أن تُعاش"

  const heroDescEn = initialSettings?.descEn || "From birthdays and school adventures to corporate events and group experiences, discover flexible E3 packages designed around your people, place and purpose."
  const heroDescAr = initialSettings?.descAr || "من حفلات أعياد الميلاد والرحلات المدرسية إلى فعاليات الشركات والتجارب الجماعية، اكتشف باقات إي ثري المرنة والمصممة لتناسب ضيوفك ومكانك وهدفك."

  const primaryCtaEn = initialSettings?.primaryCtaEn || "Find My Package"
  const primaryCtaAr = initialSettings?.primaryCtaAr || "اعثر على باقتي"

  const secondaryCtaEn = initialSettings?.secondaryCtaEn || "Build a Custom Package"
  const secondaryCtaAr = initialSettings?.secondaryCtaAr || "صمّم باقتك الخاصة"

  return (
    <div className="min-h-screen text-[var(--text-primary)] font-poppins pb-24" dir={isAr ? "rtl" : "ltr"}>
      {/* 1. CINEMATIC LIVING HERO */}
      <E3LivingHero
        eyebrowEn={heroEyebrowEn}
        eyebrowAr={heroEyebrowAr}
        fixedHeadlineEn={heroTitleEn}
        fixedHeadlineAr={heroTitleAr}
        descriptionEn={heroDescEn}
        descriptionAr={heroDescAr}
        primaryCta={{
          labelEn: primaryCtaEn,
          labelAr: primaryCtaAr,
          onClick: () => setIsFinderOpen(true)
        }}
        secondaryCta={{
          labelEn: secondaryCtaEn,
          labelAr: secondaryCtaAr,
          onClick: () => setIsCustomBuilderOpen(true)
        }}
        media={initialSettings?.heroMedia}
        locale={locale}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* 2. CATEGORY TAXONOMY TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoryTabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeCategory === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleCategoryChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border select-none",
                  isActive
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-lg scale-[1.02]"
                    : "bg-[var(--surface-default)] text-[var(--text-secondary)] border-[var(--border-level-2)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            )
          })}
        </div>

        {/* 3. SEARCH & ADVANCED FILTER BAR */}
        <div className="p-4 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-sm backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* Search Input */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute top-1/2 -translate-y-1/2 left-3.5 rtl:left-auto rtl:right-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث بالاسم أو الميزات أو الوجهة..." : "Search packages, inclusions or venues..."}
              className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-2xl pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Audience Filter */}
          <div className="relative">
            <select
              value={audienceFilter}
              onChange={e => setAudienceFilter(e.target.value)}
              className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="ALL">{isAr ? "جميع الفئات المستهدفة" : "All Audiences"}</option>
              <option value="KIDS">{isAr ? "الأطفال (٤-١٢ سنة)" : "Kids (Ages 4-12)"}</option>
              <option value="TEENS">{isAr ? "الناشئين والشباب" : "Teens (Ages 13-17)"}</option>
              <option value="ADULTS">{isAr ? "الكبار والبالغين" : "Adults"}</option>
              <option value="FAMILIES">{isAr ? "العائلات (كافة الأعمار)" : "Families (All Ages)"}</option>
              <option value="CORPORATE">{isAr ? "فرق الشركات والمؤسسات" : "Corporate Teams"}</option>
              <option value="SCHOOLS">{isAr ? "المدارس والحضانات" : "Schools & Nurseries"}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 pointer-events-none" />
          </div>

          {/* Guest Count Selector */}
          <div className="relative">
            <select
              value={guestCountFilter}
              onChange={e => setGuestCountFilter(e.target.value)}
              className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="ALL">{isAr ? "طاقة استيعابية مرنة" : "Any Guest Count"}</option>
              <option value="UNDER_15">{isAr ? "حتى ١٥ ضيفاً" : "Up to 15 Guests"}</option>
              <option value="15_30">{isAr ? "١٥ إلى ٣٠ ضيفاً" : "15 - 30 Guests"}</option>
              <option value="30_75">{isAr ? "٣٠ إلى ٧٥ ضيفاً" : "30 - 75 Guests"}</option>
              <option value="75_PLUS">{isAr ? "٧٥+ / حجز كامل" : "75+ / Full Buyout"}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={priceSort}
              onChange={e => setPriceSort(e.target.value)}
              className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="recommended">{isAr ? "الترتيب: الموصى به" : "Sort: Recommended"}</option>
              <option value="price-asc">{isAr ? "السعر: من الأقل للأعلى" : "Price: Low to High"}</option>
              <option value="price-desc">{isAr ? "السعر: من الأعلى للأقل" : "Price: High to Low"}</option>
              <option value="popularity">{isAr ? "الأكثر طلباً وشهرة" : "Most Popular"}</option>
              <option value="newest">{isAr ? "الأحدث أولاً" : "Newest First"}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 pointer-events-none" />
          </div>
        </div>

        {/* Active Filter Chips & Counter */}
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {isAr ? `${filteredPackages.length} باقة متاحة` : `${filteredPackages.length} packages found`}
            </span>
            {(activeCategory !== "ALL" || searchQuery || audienceFilter !== "ALL" || guestCountFilter !== "ALL") && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] underline cursor-pointer"
              >
                {isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}
              </button>
            )}
          </div>

          {/* Quick Trigger for Package Finder */}
          <button
            onClick={() => setIsFinderOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "جرب مستكشف الباقات الذكي" : "Need help choosing? Try Package Finder"}</span>
          </button>
        </div>

        {/* 4. PACKAGE CARDS CATALOGUE */}
        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map(pkg => {
              const isCompared = comparedPackages.some(p => p.id === pkg.id)
              const isSaved = savedPackages.includes(pkg.id)
              const inclusions = Array.isArray(pkg.inclusions) ? pkg.inclusions : []

              return (
                <InteractiveCard
                  key={pkg.id}
                  className="rounded-3xl border border-[var(--border-level-2)] bg-[var(--surface-default)] overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-xl transition-all group"
                >
                  {/* Card Media Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                    <img
                      src={pkg.coverMediaUrl || pkg.heroMediaUrl || "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80"}
                      alt={pkg.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-transparent to-transparent opacity-90" />

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-[var(--surface-default)]/90 backdrop-blur-md text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
                        {pkg.categoryRel ? (isAr ? pkg.categoryRel.nameAr : pkg.categoryRel.nameEn) : pkg.category}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {pkg.badgeTextEn && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-sm">
                            {isAr ? (pkg.badgeTextAr || pkg.badgeTextEn) : pkg.badgeTextEn}
                          </span>
                        )}
                        <button
                          onClick={() => toggleSave(pkg.id)}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer border shadow-sm",
                            isSaved 
                              ? "bg-rose-500/20 text-rose-500 border-rose-500/30" 
                              : "bg-[var(--surface-default)]/80 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-level-2)]"
                          )}
                          title={isAr ? "حفظ الباقة" : "Save package"}
                        >
                          <Heart className={cn("w-4 h-4", isSaved && "fill-rose-500 text-rose-500")} />
                        </button>
                      </div>
                    </div>

                    {/* Venue / Attraction Link Badge */}
                    {pkg.attraction && (
                      <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-secondary)] bg-[var(--surface-default)]/90 px-2.5 py-1 rounded-full backdrop-blur-md border border-[var(--border-level-2)] shadow-sm">
                        <Building className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{isAr ? (pkg.attraction.nameAr || pkg.attraction.nameEn) : pkg.attraction.nameEn}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {isAr ? (pkg.titleAr || pkg.titleEn) : pkg.titleEn}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1.5 leading-relaxed">
                        {isAr ? (pkg.shortDescriptionAr || pkg.shortDescriptionEn) : pkg.shortDescriptionEn}
                      </p>

                      {/* Specs Row */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[var(--border-level-1)] text-[11px] text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          <span>{pkg.minGuests}–{pkg.maxGuests} {isAr ? "ضيوف" : "Guests"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          <span>{pkg.durationMinutes} {isAr ? "دقيقة" : "Mins"}</span>
                        </div>
                      </div>

                      {/* Inclusions preview */}
                      {inclusions.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {inclusions.slice(0, 3).map((inc: any, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="truncate">{isAr ? (inc.titleAr || inc.titleEn) : inc.titleEn}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price & Actions Row */}
                    <div className="pt-4 border-t border-[var(--border-level-2)] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono">
                          {pkg.priceDisplayMode === "PER_GUEST"
                            ? (isAr ? "لكل ضيف" : "Per Guest Rate")
                            : (isAr ? "يبدأ من" : "Starting Rate")
                          }
                        </div>
                        <div className="text-base font-black font-mono text-[var(--text-primary)]">
                          {pkg.startingPrice > 0 
                            ? (isAr ? `${pkg.startingPrice.toLocaleString()} ر.ق` : `QAR ${pkg.startingPrice.toLocaleString()}`)
                            : (isAr ? "حسب المتطلبات" : "Custom Quote")
                          }
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Compare button */}
                        <button
                          type="button"
                          onClick={() => toggleCompare(pkg)}
                          className={cn(
                            "p-2 rounded-xl border text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-sm",
                            isCompared 
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                              : "bg-[var(--surface-hover)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          )}
                          title={isAr ? "مقارنة" : "Compare"}
                        >
                          <Scale className="w-4 h-4" />
                          <span className="sr-only">{isAr ? "مقارنة" : "Compare"}</span>
                        </button>

                        {/* Quick enquiry trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPackageForEnquiry(pkg)
                            setIsEnquiryOpen(true)
                          }}
                          className="sr-only"
                        >
                          {isAr ? "طلب حجز" : "Book Package"}
                        </button>

                        <Link
                          href={`/${locale}/b2c/packages/${pkg.slug}`}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md"
                        >
                          {isAr ? "عرض التفاصيل" : "View Details"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-hover)] text-[var(--text-tertiary)] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {isAr ? "لم نجد باقات تطابق الفلاتر المحددة" : "No packages found matching your criteria"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
              {isAr 
                ? "يمكنك إعادة ضبط خيارات البحث أو استخدام مصمم الباقات المخصصة للحصول على عرض سعر فوري مخصص لفعاليتك."
                : "Try resetting your search filters, or use our Custom Package Architect to build a tailored proposal."
              }
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button size="sm" variant="outline" onClick={clearAllFilters} className="text-xs">
                {isAr ? "مسح كافة الفلاتر" : "Clear All Filters"}
              </Button>
              <Button size="sm" onClick={() => setIsCustomBuilderOpen(true)} className="text-xs font-bold bg-emerald-500 text-white">
                {isAr ? "صمّم باقة خاصة الآن" : "Build Custom Package"}
              </Button>
            </div>
          </div>
        )}

        {/* 5. SEASONAL CAMPAIGN & HIGHLIGHT BANNER */}
        <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 text-white p-8 md:p-12 shadow-2xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {isAr ? "عروض الموسم الحصرية" : "Seasonal Special & Group Offers"}
            </span>
            <h3 className="text-2xl md:text-4xl font-black font-display tracking-tight text-white">
              {isAr ? "خطط لعطلتكم القادمة مع باقات إي ثري التوفيرية" : "Book Early & Save on Group & Holiday Packages"}
            </h3>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              {isAr 
                ? "احصل على خصومات حصرية للمجموعات الكبرى وحجوزات المدارس المبكرة مع مزايا مجانية تشمل مضيفي الحفل، الضيافة، والتصوير الرقمي."
                : "Enjoy exclusive benefits for corporate team building and school excursions, with complimentary event facilitators, digital photo packages, and catering upgrades."
              }
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => setIsFinderOpen(true)}
                className="text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
              >
                {isAr ? "استكشف العروض المتاحة" : "Explore Matching Packages"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCustomBuilderOpen(true)}
                className="text-xs font-bold border-white/20 text-white hover:bg-white/10"
              >
                {isAr ? "طلب عرض سعر خاص" : "Request Custom Quote"}
              </Button>
            </div>
          </div>
        </div>

        {/* 6. TRUST, SAFETY & SUPPORT PILLARS */}
        <div className="pt-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tight text-[var(--text-primary)] uppercase">
              {isAr ? "لماذا تختار باقات وفعاليات إي ثري؟" : "Why Choose E3 Experience Packages?"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr 
                ? "معايير هندسة فعاليات احترافية تضمن الأمان، السلاسة، والذكريات الاستثنائية لضيوفكم."
                : "Engineered event excellence combining top safety standards, dedicated event concierges, and flexible venue spaces."
              }
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: ShieldCheck,
                titleEn: "Safety-First Operations",
                titleAr: "أعلى معايير السلامة",
                descEn: "Certified marshals, trained first-aiders, and continuous safety audits across all destinations.",
                descAr: "مشرفين سلامة معتمدين وتدريب إسعافات أولية وفحص أمان دوري لكافة الألعاب."
              },
              {
                icon: Sparkles,
                titleEn: "Flexible & Modular Planning",
                titleAr: "مرونة كاملة في التخصيص",
                descEn: "Tailor guest counts, session duration, catering menus, and bespoke thematic decorations.",
                descAr: "إمكانية تعديل عدد الضيوف، مدة الفعالية، قوائم الضيافة، والثيمات الخاصة."
              },
              {
                icon: Users,
                titleEn: "Dedicated Event Concierge",
                titleAr: "منسق فعاليات مخصص",
                descEn: "A dedicated E3 coordinator manages your timeline, vendor setup, and guest arrival seamlessly.",
                descAr: "فريق متخصص يتابع الجدول الزمني، التجهيزات، واستقبال الضيوف من البداية للنهاية."
              },
              {
                icon: Building,
                titleEn: "Multiple Premier Venues",
                titleAr: "وجهات ترفيهية رائدة",
                descEn: "Host at InflataRUN, Urban Arena, Kids City, or choose on-site pop-ups at your venue.",
                descAr: "إمكانية إقامة الفعالية في وجهاتنا أو تجهيز فعاليات متنقلة في موقع العميل."
              },
              {
                icon: Briefcase,
                titleEn: "Corporate & School Expertise",
                titleAr: "خبرة معتمدة للشركات والمدارس",
                descEn: "Proven delivery of government celebrations, corporate family days, and school STEM visits.",
                descAr: "سجل حافل في تنظيم الفعاليات الحكومية، أيام الشركات، والرحلات المدرسية."
              },
              {
                icon: Heart,
                titleEn: "Memorable Experiences",
                titleAr: "ذكريات استثنائية دائمة",
                descEn: "Every moment is engineered to create joy, teamwork, and unforgettable shared memories.",
                descAr: "تجارب تفاعلية مصممة لصناعة البهجة وتعزيز روح الفريق ولحظات لا تُنسى."
              }
            ].map((pillar, idx) => {
              const Icon = pillar.icon
              return (
                <div key={idx} className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] space-y-2 shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{isAr ? pillar.titleAr : pillar.titleEn}</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{isAr ? pillar.descAr : pillar.descEn}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 7. BILINGUAL FAQ ACCORDION */}
        <div className="pt-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tight text-[var(--text-primary)] uppercase">
              {isAr ? "الأسئلة الشائعة حول الباقات" : "Frequently Asked Questions"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr ? "كل ما تحتاج لمعرفته قبل حجز وتنسيق باقتك الترفيهية" : "Everything you need to know about booking and hosting with E3 Qatar"}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map(faq => {
              const isOpen = openFaqId === faq.id
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)] overflow-hidden transition-colors shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full p-4 text-start flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {isAr ? faq.questionAr : faq.questionEn}
                    </span>
                    <ChevronDown className={cn("w-4 h-4 text-[var(--text-tertiary)] transition-transform shrink-0", isOpen && "rotate-180 text-emerald-600 dark:text-emerald-400")} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-level-1)] pt-3">
                      {isAr ? faq.answerAr : faq.answerEn}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 8. FINAL CLOSING CONVERSION CTA */}
        <div className="rounded-3xl border border-[var(--border-level-2)] bg-[var(--surface-default)] shadow-xl p-8 md:p-12 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-3">
            <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight text-[var(--text-primary)]">
              {isAr ? "جاهز لتحويل مناسبتك القادمة إلى تجربة لا تُنسى؟" : "Ready to Engineer Your Next Unforgettable Event?"}
            </h3>
            <p className="text-xs md:text-sm text-[var(--text-secondary)]">
              {isAr 
                ? "تواصل مع فريق حجز الفعاليات في إي ثري أو صمّم باقتك الخاصة فوراً."
                : "Speak with our dedicated event architects or build your custom package proposal in minutes."
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => setIsFinderOpen(true)}
              className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-6 shadow-md"
            >
              {isAr ? "اعثر على باقتي" : "Find My Package"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCustomBuilderOpen(true)}
              className="text-xs font-bold border-[var(--border-level-2)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] h-10 px-6"
            >
              {isAr ? "صمّم باقة مخصصة" : "Build Custom Proposal"}
            </Button>
          </div>
        </div>
      </div>

      {/* MODALS & DRAWERS */}
      <SmartPackageFinderModal
        isOpen={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
        locale={locale}
        packages={packagesList}
        onSelectPackage={(pkg) => {
          setSelectedPackageForEnquiry(pkg)
          setIsEnquiryOpen(true)
        }}
        onOpenCustomBuilder={() => setIsCustomBuilderOpen(true)}
      />

      <CustomPackageBuilder
        isOpen={isCustomBuilderOpen}
        onClose={() => setIsCustomBuilderOpen(false)}
        locale={locale}
      />

      <PackageEnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => {
          setIsEnquiryOpen(false)
          setSelectedPackageForEnquiry(null)
        }}
        locale={locale}
        selectedPackage={selectedPackageForEnquiry}
      />

      <PackageCompareDrawer
        comparedPackages={comparedPackages}
        onRemove={(id) => setComparedPackages(prev => prev.filter(p => p.id !== id))}
        onClear={() => setComparedPackages([])}
        onSelectForEnquiry={(pkg) => {
          setSelectedPackageForEnquiry(pkg)
          setIsEnquiryOpen(true)
        }}
        locale={locale}
      />
    </div>
  )
}
