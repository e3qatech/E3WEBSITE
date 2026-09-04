"use client"

import { useState } from "react"
import { 
  Check, 
  Download, 
  Send, 
  ShieldCheck, 
  ChevronDown, 
  ExternalLink,
  Plus,
  Minus,
  Users,
  Calculator,
  Tag,
  Sparkles,
  X,
  RotateCcw
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { InteractiveCard } from "@/components/ui/InteractiveCard"
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer"
import { PackageEnquiryModal } from "@/components/b2c/PackageEnquiryModal"
import { E3LivingHero } from "@/components/b2c/hero/E3LivingHero"
import { PackageGalleryShowcase } from "@/components/b2c/packages/PackageGalleryShowcase"
import { cn } from "@/lib/utils"

export function PackageMicrositeClient({
  locale,
  pkg,
  _relatedPackages = []
}: {
  locale: string
  pkg: any
  _relatedPackages?: any[]
  relatedPackages?: any[]
}) {
  const isAr = locale === "ar"

  const title = isAr ? (pkg.titleAr || pkg.titleEn) : pkg.titleEn
  const tagline = isAr ? (pkg.taglineAr || pkg.taglineEn) : pkg.taglineEn
  const summary = isAr ? (pkg.shortDescriptionAr || pkg.shortDescriptionEn) : pkg.shortDescriptionEn

  // Tiers, Inclusions, Add-Ons from DB JSON
  const tiers: any[] = Array.isArray(pkg.tiers) ? pkg.tiers : []
  const inclusions: any[] = Array.isArray(pkg.inclusions) ? pkg.inclusions : []
  const addOns: any[] = Array.isArray(pkg.addOns) ? pkg.addOns : []
  const faqs: any[] = Array.isArray(pkg.faqs) ? pkg.faqs : []

  // Interactive Calculator State
  const minGuests = Math.max(1, pkg.minGuests || 1)
  const maxGuests = Math.max(minGuests, pkg.maxGuests || 200)

  const [selectedTier, setSelectedTier] = useState<any>(tiers[0] || null)
  const [guestCount, setGuestCount] = useState<number>(() => {
    return selectedTier?.guestCount || selectedTier?.includedGuests || minGuests || 15
  })
  const [selectedAddOnQty, setSelectedAddOnQty] = useState<{ [id: string]: number }>({})
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false)

  // Dynamic Price Breakdown
  const tierPrice = selectedTier ? (selectedTier.price || 0) : (pkg.startingPrice || 0)
  const includedGuests = selectedTier?.includedGuests || selectedTier?.guestCount || minGuests || 10
  const extraGuestPrice = selectedTier?.extraGuestPrice ?? pkg.extraGuestPrice ?? 0
  const extraGuestsCount = Math.max(0, guestCount - includedGuests)
  const extraGuestsTotal = extraGuestsCount * extraGuestPrice

  const addOnsTotal = addOns.reduce((sum, addon) => {
    const qty = selectedAddOnQty[addon.id] || 0
    if (qty <= 0) return sum
    if (addon.priceType === "PER_GUEST") {
      return sum + (addon.price || 0) * guestCount * qty
    }
    return sum + (addon.price || 0) * qty
  }, 0)

  const grossSubtotal = tierPrice + extraGuestsTotal + addOnsTotal
  const couponDiscount = appliedCoupon ? Math.min(grossSubtotal, (appliedCoupon.discountAmount || 0)) : 0
  const estimatedTotal = Math.max(0, grossSubtotal - couponDiscount)

  const handleAddOnQtyChange = (addonId: string, delta: number) => {
    setSelectedAddOnQty(prev => {
      const cur = prev[addonId] || 0
      const next = Math.max(0, cur + delta)
      return { ...prev, [addonId]: next }
    })
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError(null)
    try {
      const res = await fetch("/api/b2c/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          packageId: pkg.id,
          subtotal: grossSubtotal
        })
      })
      const data = await res.json()
      if (data.valid) {
        setAppliedCoupon(data)
      } else {
        setCouponError(data.message || (isAr ? "رمز الكوبون غير صالح" : "Invalid coupon code"))
      }
    } catch {
      setCouponError(isAr ? "فشل التحقق من الكوبون" : "Failed to validate coupon")
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    setCouponError(null)
  }

  const rotatingWordsEn = Array.isArray(pkg.rotatingWordsEn) && pkg.rotatingWordsEn.length > 0
    ? pkg.rotatingWordsEn
    : (Array.isArray(pkg.rotatingPhrasesEn) && pkg.rotatingPhrasesEn.length > 0 ? pkg.rotatingPhrasesEn : []);
  const rotatingWordsAr = Array.isArray(pkg.rotatingWordsAr) && pkg.rotatingWordsAr.length > 0
    ? pkg.rotatingWordsAr
    : (Array.isArray(pkg.rotatingPhrasesAr) && pkg.rotatingPhrasesAr.length > 0 ? pkg.rotatingPhrasesAr : []);

  const hasRecordRotatingWords = isAr ? rotatingWordsAr.length > 0 : rotatingWordsEn.length > 0;

  return (
    <div className="min-h-screen text-[var(--text-primary)] font-poppins pb-24" dir={isAr ? "rtl" : "ltr"}>
      {/* 1. MICROSITE HERO */}
      {hasRecordRotatingWords ? (
        <E3LivingHero
          eyebrowEn={pkg.category || "VIP PACKAGES & EVENTS"}
          eyebrowAr={
            pkg.category === "BIRTHDAY" ? "أعياد الميلاد" :
            pkg.category === "CORPORATE" ? "الشركات" :
            pkg.category === "SCHOOL" ? "المدارس" :
            pkg.category === "GROUP" ? "المجموعات" :
            pkg.category === "PRIVATE_EVENT" ? "الفعاليات الخاصة" : pkg.category
          }
          fixedHeadlineEn={title}
          fixedHeadlineAr={title}
          rotatingWordsEn={rotatingWordsEn}
          rotatingWordsAr={rotatingWordsAr}
          descriptionEn={tagline || summary}
          descriptionAr={tagline || summary}
          primaryCta={{
            labelEn: "Enquire Now",
            labelAr: "طلب حجز واستفسار",
            onClick: () => setIsEnquiryOpen(true)
          }}
          media={{
            mediaType: (pkg.heroMediaType || "IMAGE").toUpperCase(),
            mediaUrl: pkg.heroMediaUrl || pkg.coverMediaUrl || "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80"
          }}
          preset="record-accent"
          accentColor={pkg.accentColor || "#f59e0b"}
          locale={locale}
        />
      ) : (
        <section className="relative pt-12 pb-16 px-4 md:px-8 border-b border-[var(--border-level-2)] bg-gradient-to-b from-[var(--surface-default)] to-[var(--bg-level-1)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[var(--e3-royal-blue)]/10 text-[var(--e3-royal-blue)] border border-[var(--e3-royal-blue)]/20 text-xs font-mono font-extrabold uppercase tracking-widest">
                {isAr ? (
                  pkg.category === "BIRTHDAY" ? "أعياد الميلاد" :
                  pkg.category === "CORPORATE" ? "الشركات" :
                  pkg.category === "SCHOOL" ? "المدارس" :
                  pkg.category === "GROUP" ? "المجموعات" :
                  pkg.category === "PRIVATE_EVENT" ? "الفعاليات الخاصة" : pkg.category
                ) : pkg.category}
              </span>
              {pkg.badgeTextEn && (
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase">
                  {isAr ? pkg.badgeTextAr || pkg.badgeTextEn : pkg.badgeTextEn}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tight leading-[1.05]">
              {title}
            </h1>

            {tagline && (
              <p className="text-base font-semibold text-[var(--e3-royal-blue)]">
                {tagline}
              </p>
            )}

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
              {summary}
            </p>

            {/* Quick Spec Badges */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-level-2)] text-center text-xs font-mono font-bold">
              <div>
                <span className="text-[10px] text-[var(--text-tertiary)] block uppercase">
                  {isAr ? "السعة" : "Capacity"}
                </span>
                <span className="text-[var(--text-primary)]">
                  {pkg.minGuests}-{pkg.maxGuests} {isAr ? "ضيوف" : "Guests"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-tertiary)] block uppercase">
                  {isAr ? "المدة" : "Duration"}
                </span>
                <span className="text-[var(--text-primary)]">
                  {pkg.durationMinutes ? `${pkg.durationMinutes} ${isAr ? "دقيقة" : "Mins"}` : (isAr ? "حسب الطلب" : "Custom")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-tertiary)] block uppercase">
                  {isAr ? "يبدأ من" : "Starting Price"}
                </span>
                <span className="text-[var(--e3-royal-blue)]">
                  {pkg.startingPrice ? `${pkg.startingPrice} QAR` : (isAr ? "عند الطلب" : "On Request")}
                </span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button size="lg" onClick={() => setIsEnquiryOpen(true)} className="gap-2 shadow-lg">
                <Send className="w-4 h-4" />
                {isAr ? "طلب حجز واستفسار" : "Enquire Now"}
              </Button>
              {pkg.bookingQubeUrl && (
                <a href={pkg.bookingQubeUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {isAr ? "حجز فوري عبر بوكينج كيوب" : "Book Instant Ticket"}
                  </Button>
                </a>
              )}
              {pkg.brochureUrl && (
                <a href={pkg.brochureUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1">
                  <Download className="w-4 h-4" /> {isAr ? "تحميل كتيب PDF" : "PDF Brochure"}
                </a>
              )}
            </div>
          </div>

          {/* Hero Media */}
          <div className="rounded-3xl overflow-hidden border border-[var(--border-level-2)] shadow-2xl bg-zinc-950 max-h-[450px]">
            <UniversalMediaRenderer
              src={pkg.heroMediaUrl || pkg.coverMediaUrl || "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80"}
              type={(pkg.heroMediaType as any) || "IMAGE"}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
      )}

      {/* 2. OVERVIEW & WHAT IS INCLUDED */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-16">
        <div>
          <h2 className="text-2xl md:text-4xl font-black font-display uppercase tracking-tight mb-4">
            {isAr ? "ماذا تشمل هذه الباقة؟" : "What Is Included"}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-2xl">
            {isAr ? "جميع الخدمات والتسهيلات المضمنة لجعل احتفالك مكملاً دون عناء." : "All features and amenities included to make your celebration seamless."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {inclusions.map((inc: any, i: number) => (
              <InteractiveCard key={inc.id || i} className="p-6" glowColor="rgba(26, 31, 214, 0.3)">
                <ShieldCheck className="w-8 h-8 text-[var(--e3-royal-blue)] mb-3" />
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1 font-display uppercase">
                  {isAr ? inc.titleAr || inc.titleEn : inc.titleEn}
                </h3>
                {inc.descriptionEn && (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {isAr ? inc.descriptionAr || inc.descriptionEn : inc.descriptionEn}
                  </p>
                )}
              </InteractiveCard>
            ))}
          </div>
        </div>

        {/* 3. PACKAGE TIERS COMPARISON */}
        {tiers.length > 0 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-4xl font-black font-display uppercase tracking-tight mb-2">
                {isAr ? "اختر المستوى المناسب" : "Choose Your Package Tier"}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {isAr ? "قارن بين المستويات واختر ما يناسب عدد ضيوفك وميزانيتك." : "Compare package tiers and select the ideal experience for your group."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tiers.map(t => {
                const isSelected = selectedTier?.id === t.id
                return (
                  <InteractiveCard
                    key={t.id}
                    className={cn(
                      "p-8 flex flex-col justify-between relative",
                      t.recommended && "border-2 border-[var(--e3-royal-blue)] shadow-xl"
                    )}
                    glowColor="rgba(26, 31, 214, 0.4)"
                  >
                    {t.recommended && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--e3-royal-blue)] text-white text-[10px] font-extrabold uppercase tracking-widest shadow">
                        {isAr ? "المستوى الموصى به" : "Recommended"}
                      </span>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold font-display uppercase text-[var(--text-primary)]">
                          {isAr ? t.nameAr || t.nameEn : t.nameEn}
                        </h3>
                        <div className="mt-2 text-3xl font-black font-mono text-[var(--e3-royal-blue)]">
                          {t.price} QAR
                        </div>
                        <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                          {isAr ? `يشمل حتى ${t.guestCount} ضيفاً` : `Includes up to ${t.guestCount} guests`}
                          {t.durationMinutes ? ` • ${t.durationMinutes} ${isAr ? "دقيقة" : "Mins"}` : ''}
                        </span>
                      </div>

                      <div className="space-y-2 border-t border-[var(--border-level-2)] pt-4">
                        {(() => {
                          if (isAr) {
                            // 1. Use existing Arabic tier-benefit fields if available
                            const arabicTierItems = t.includedItemsAr || t.benefitsAr
                            if (Array.isArray(arabicTierItems) && arabicTierItems.length > 0) {
                              return arabicTierItems.map((item: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>{item}</span>
                                </div>
                              ))
                            }

                            // 2. Arabic-safe presentation fallback based on package's existing Arabic inclusions
                            const fallbackInclusions = inclusions
                              .map((inc: any) => inc.titleAr || inc.titleEn)
                              .filter(Boolean)

                            const displayItems = fallbackInclusions.length > 0
                              ? fallbackInclusions
                              : ["دخول الفعالية والأنشطة الترفيهية المعتمدة", "خدمات الضيافة والتنسيق المعتمدة"]

                            return displayItems.map((item: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))
                          }

                          // English mode: display English tier benefits
                          const englishTierItems = t.includedItems || t.includedItemsEn || t.benefits || []
                          return englishTierItems.map((item: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedTier(t);
                        if (guestCount < (t.guestCount || t.includedGuests || minGuests)) {
                          setGuestCount(t.guestCount || t.includedGuests || minGuests);
                        }
                      }}
                      variant={isSelected ? "primary" : "outline"}
                      className="w-full mt-6 text-xs font-bold uppercase"
                    >
                      {isSelected ? (isAr ? "✓ الفئة المختارة" : "✓ Selected Tier") : (isAr ? "اختيار هذه الفئة" : "Select Tier")}
                    </Button>
                  </InteractiveCard>
                )
              })}
            </div>
          </div>
        )}

        {/* 4. INTERACTIVE PRICE CALCULATOR & CUSTOMIZER */}
        <div className="p-6 md:p-8 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-level-2)] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-4 h-4 text-[var(--e3-royal-blue)]" />
                <span className="text-xs font-mono font-bold uppercase text-[var(--e3-royal-blue)] tracking-wider">
                  {isAr ? "حاسبة الأسعار التفاعلية" : "Interactive Price Calculator"}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-display uppercase tracking-tight">
                {isAr ? "خصص تجربتك واحسب التكلفة الفورية" : "Customize & Calculate Instant Total"}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--e3-royal-blue)]/10 border border-[var(--e3-royal-blue)]/30 text-right rtl:text-left">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">
                {isAr ? "الإجمالي التقديري" : "Estimated Total"}
              </span>
              <span className="text-3xl font-black font-mono text-[var(--e3-royal-blue)]">
                {estimatedTotal.toLocaleString()} QAR
              </span>
            </div>
          </div>

          {/* GUEST CAPACITY SELECTOR */}
          <div className="p-6 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--e3-royal-blue)]/10 flex items-center justify-center text-[var(--e3-royal-blue)]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {isAr ? "عدد الضيوف المتوقع" : "Expected Guest Count"}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isAr
                      ? `تشمل الفئة ${includedGuests} ضيوف. الضيف الإضافي: ${extraGuestPrice} ر.ق`
                      : `Tier includes ${includedGuests} guests. Extra guests: ${extraGuestPrice} QAR each`}
                  </p>
                </div>
              </div>

              {/* Stepper Controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuestCount(prev => Math.max(minGuests, prev - 1))}
                  disabled={guestCount <= minGuests}
                  className="w-9 h-9 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:border-[var(--e3-royal-blue)] transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="px-4 py-1.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-center min-w-[70px]">
                  <span className="font-mono font-black text-base text-[var(--text-primary)]">{guestCount}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGuestCount(prev => Math.min(maxGuests, prev + 1))}
                  disabled={guestCount >= maxGuests}
                  className="w-9 h-9 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:border-[var(--e3-royal-blue)] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min={minGuests}
                max={maxGuests}
                value={guestCount}
                onChange={e => setGuestCount(parseInt(e.target.value) || minGuests)}
                className="w-full accent-[var(--e3-royal-blue)] cursor-pointer h-2 bg-[var(--surface-default)] rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                <span>{minGuests} {isAr ? "حد أدنى" : "Min"}</span>
                <span className={extraGuestsCount > 0 ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                  {extraGuestsCount > 0
                    ? `+${extraGuestsCount} ${isAr ? "ضيوف إضافيين" : "extra guests"} (+${extraGuestsTotal.toLocaleString()} QAR)`
                    : (isAr ? "مشمل بالكامل ضمن سعر الفئة" : "Fully covered by tier base")}
                </span>
                <span>{maxGuests} {isAr ? "سعة قصوى" : "Max"}</span>
              </div>
            </div>
          </div>

          {/* ADD-ONS SECTION */}
          {addOns.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {isAr ? "الخدمات والإضافات الاختيارية" : "Optional Add-On Experiences"}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isAr ? "أضف كعكة مخصصة، مصور، أو أنشطة إضافية لاحتفالك." : "Add birthday cakes, professional photography, extra play credits, or dedicated hosts."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addOns.map(addon => {
                  const qty = selectedAddOnQty[addon.id] || 0
                  const isPerGuest = addon.priceType === "PER_GUEST"
                  const itemTotal = isPerGuest ? (addon.price || 0) * guestCount * qty : (addon.price || 0) * qty

                  return (
                    <div
                      key={addon.id}
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3",
                        qty > 0
                          ? "bg-[var(--surface-hover)] border-[var(--e3-royal-blue)]/50 shadow-sm"
                          : "bg-[var(--surface-hover)]/50 border-[var(--border-level-2)]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                            {isAr ? addon.titleAr || addon.titleEn : addon.titleEn}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs font-mono font-bold text-[var(--e3-royal-blue)]">
                              +{addon.price} QAR {isPerGuest ? (isAr ? "/ لكل ضيف" : "/ guest") : ""}
                            </span>
                            {isPerGuest && qty > 0 && (
                              <span className="text-[10px] font-mono bg-[var(--e3-royal-blue)]/10 text-[var(--e3-royal-blue)] px-2 py-0.5 rounded-full">
                                {addon.price} × {guestCount} = {itemTotal.toLocaleString()} QAR
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAddOnQtyChange(addon.id, -1)}
                            disabled={qty <= 0}
                            className="w-8 h-8 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:border-[var(--e3-royal-blue)] transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-sm">{qty}</span>
                          <button
                            type="button"
                            onClick={() => handleAddOnQtyChange(addon.id, 1)}
                            disabled={addon.maxQty && qty >= addon.maxQty}
                            className="w-8 h-8 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] flex items-center justify-center text-xs font-bold hover:border-[var(--e3-royal-blue)] transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* PROMOTIONAL COUPON VALIDATOR */}
          <div className="p-5 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[var(--e3-royal-blue)]" />
              <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-primary)] tracking-wider">
                {isAr ? "كوبون الخصم أو الرمز الترويجي" : "Promo Code & Discounts"}
              </h4>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span className="font-mono font-bold uppercase">{appliedCoupon.code}</span>
                  <span>— {isAr ? "تم خصم" : "Discount Applied:"} {appliedCoupon.discountAmount} QAR</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="p-1 hover:bg-emerald-500/20 rounded-md transition-colors cursor-pointer text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder={isAr ? "أدخل رمز الكوبون (مثال: E3VIP20)" : "Enter coupon code (e.g. E3VIP20)"}
                  className="flex-1 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs font-mono uppercase text-[var(--text-primary)] focus:outline-none focus:border-[var(--e3-royal-blue)]"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="text-xs"
                >
                  {couponLoading ? "..." : (isAr ? "تطبيق" : "Apply")}
                </Button>
              </div>
            )}

            {couponError && (
              <p className="text-xs text-rose-500 font-medium">{couponError}</p>
            )}
          </div>

          {/* REAL-TIME COST BREAKDOWN SUMMARY */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--surface-subtle)] to-[var(--surface-hover)] border border-[var(--border-level-2)] space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-secondary)] tracking-wider">
              {isAr ? "تفاصيل التكلفة التقديرية" : "Live Price Breakdown"}
            </h4>

            <div className="space-y-2 text-xs border-b border-[var(--border-level-2)] pb-4 font-mono">
              <div className="flex justify-between items-center text-[var(--text-secondary)]">
                <span>{selectedTier ? (isAr ? selectedTier.nameAr || selectedTier.nameEn : selectedTier.nameEn) : (isAr ? "السعر الأساسي" : "Base Package")} ({includedGuests} {isAr ? "ضيوف مشمولين" : "guests included"}):</span>
                <span className="font-bold text-[var(--text-primary)]">{tierPrice.toLocaleString()} QAR</span>
              </div>

              {extraGuestsTotal > 0 && (
                <div className="flex justify-between items-center text-amber-500">
                  <span>+{extraGuestsCount} {isAr ? "ضيوف إضافيين" : "extra guests"} ({extraGuestPrice} QAR {isAr ? "لكل ضيف" : "each"}):</span>
                  <span className="font-bold">+{extraGuestsTotal.toLocaleString()} QAR</span>
                </div>
              )}

              {addOnsTotal > 0 && (
                <div className="flex justify-between items-center text-[var(--text-secondary)]">
                  <span>{isAr ? "الإضافات والخدمات المخصصة" : "Selected Add-Ons Subtotal"}:</span>
                  <span className="font-bold text-[var(--text-primary)]">+{addOnsTotal.toLocaleString()} QAR</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-500">
                  <span>{isAr ? "خصم الكوبون الترويجي" : "Promotional Discount"}:</span>
                  <span className="font-bold">-{couponDiscount.toLocaleString()} QAR</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase block">
                  {isAr ? "الإجمالي النهائي المقدر" : "Estimated Grand Total"}
                </span>
                <span className="text-3xl font-black font-mono text-[var(--e3-royal-blue)]">
                  {estimatedTotal.toLocaleString()} QAR
                </span>
              </div>

              <Button
                onClick={() => setIsEnquiryOpen(true)}
                className="gap-2 shadow-lg px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                <Send className="w-4 h-4" />
                {isAr ? "طلب حجز واستفسار بهذا التخصيص" : "Enquire With This Setup"}
              </Button>
            </div>
          </div>
        </div>

        {/* 5. MEDIA & VIDEO GALLERY SHOWCASE */}
        <PackageGalleryShowcase
          gallery={Array.isArray(pkg.gallery) ? pkg.gallery : []}
          coverMediaUrl={pkg.coverMediaUrl}
          heroMediaUrl={pkg.heroMediaUrl}
          heroMediaType={pkg.heroMediaType}
          packageName={title}
          locale={locale}
          venueName={pkg.attraction ? (isAr ? (pkg.attraction.nameAr || pkg.attraction.nameEn) : pkg.attraction.nameEn) : undefined}
        />

        {/* 6. FAQS ACCORDION */}
        {faqs.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-3xl font-black font-display uppercase tracking-tight text-center">
              {isAr ? "الأسئلة الشائعة عن هذه الباقة" : "Package FAQs"}
            </h2>

            <div className="space-y-3">
              {faqs.map(f => {
                const isOpen = openFaqId === f.id
                return (
                  <div key={f.id} className="rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] overflow-hidden">
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : f.id)}
                      className="w-full p-5 text-left rtl:text-right flex justify-between items-center gap-4 text-sm font-bold hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                    >
                      <span>{isAr ? f.questionAr : f.questionEn}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                    </button>
                    {isOpen && (
                      <div className="p-5 pt-0 text-xs text-[var(--text-secondary)] leading-relaxed font-medium border-t border-[var(--border-level-2)]/50 pt-4">
                        {isAr ? f.answerAr : f.answerEn}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 7. TERMS & CONDITIONS MODAL TRIGGER */}
        <div className="text-center pt-8 border-t border-[var(--border-level-2)]">
          <button
            onClick={() => setIsTermsOpen(true)}
            className="text-xs font-bold uppercase text-[var(--text-secondary)] hover:text-[var(--e3-royal-blue)] underline transition-colors cursor-pointer"
          >
            {isAr ? "عرض الشروط والأحكام الكاملة وسياسة الإلغاء للوجهة" : "View Full Venue Terms & Cancellation Policy"}
          </button>
        </div>

        {/* VENUE-SPECIFIC TERMS & CONDITIONS MODAL */}
        {isTermsOpen && (
          <div
            onClick={() => setIsTermsOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto text-[var(--text-primary)] shadow-2xl custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-level-2)] pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[var(--e3-royal-blue)] font-bold uppercase block">
                    {isAr ? "شروط وقواعد الوجهة" : "Venue-Specific Policies"}
                  </span>
                  <h3 className="text-xl font-bold">
                    {isAr ? `الشروط والأحكام - ${title}` : `Terms & Conditions — ${title}`}
                  </h3>
                </div>
                <button
                  onClick={() => setIsTermsOpen(false)}
                  className="w-8 h-8 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Venue Rules */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{isAr ? "قواعد الوجهة وإرشادات السلامة" : "Venue & Safety Regulations"}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed p-4 rounded-2xl bg-[var(--surface-hover)]/40 border border-[var(--border-level-2)]">
                  {pkg?.termsConditions?.venueRulesEn || (isAr
                    ? "يجب على جميع المشاركين الالتزام بإرشادات السلامة العامة في الوجهة. يُشترط ارتداء الجوارب المانعة للانزلاق لجميع أنشطة الترامبولين والمغامرة الحركية. يمنع إدخال المأكولات والمشروبات من خارج الوجهة ما عدا كعكة الاحتفال المنسق لها مسبقاً. يجب مرافقة الأطفال دون سن السابعة من قبل شخص بالغ."
                    : "All participants must adhere to venue safety protocols. Anti-slip grip socks are strictly required for active jumping and adventure arenas. Outside catering is not permitted with the exception of pre-coordinated celebration cakes. Children under 7 must be accompanied by an adult guardian.")
                  }
                </p>
              </div>

              {/* Cancellation Policy */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                  <RotateCcw className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? "سياسة الإلغاء وتعديل الموعد" : "Cancellation & Rescheduling Policy"}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed p-4 rounded-2xl bg-[var(--surface-hover)]/40 border border-[var(--border-level-2)]">
                  {pkg?.termsConditions?.cancellationPolicyEn || (isAr
                    ? "تخضع الحجوزات لسياسة الإلغاء المرنة: استرداد كامل للدفعة المقدمة عند الإشعار قبل ٧ أيام تقويمية على الأقل من موعد الفعالية. في حال الإلغاء قبل ٤٨ إلى ٧٢ ساعة، يمكن إعادة جدولة الفعالية خلال ٦ أشهر دون رسوم إضافية. الإلغاء قبل أقل من ٤٨ ساعة غير قابل للاسترداد."
                    : "Bookings are subject to our venue policy: 100% deposit refund for cancellations received 7+ calendar days in advance. Cancellations made 48-72 hours prior permit date rescheduling valid for up to 6 months at no fee. Cancellations with less than 48 hours notice forfeit the deposit.")
                  }
                </p>
              </div>

              {/* Custom Clauses */}
              {Array.isArray(pkg?.termsConditions?.customClauses) && pkg.termsConditions.customClauses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">
                    {isAr ? "بنود إضافية خاصة بهذه الوجهة:" : "Specific Venue Clauses:"}
                  </span>
                  <div className="space-y-2">
                    {pkg.termsConditions.customClauses.map((clause: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[var(--surface-hover)]/40 border border-[var(--border-level-2)] text-xs text-[var(--text-secondary)]">
                        <strong className="text-[var(--text-primary)] block mb-1">
                          {isAr ? (clause.titleAr || clause.titleEn) : clause.titleEn}
                        </strong>
                        <span>{isAr ? (clause.ruleAr || clause.ruleEn) : clause.ruleEn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PDPL Qatar Compliance */}
              <div className="p-4 rounded-2xl bg-[var(--surface-hover)]/30 border border-[var(--border-level-2)] text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                <strong>{isAr ? "حماية البيانات الشخصية (PDPL):" : "Qatar PDPL Compliance:"}</strong>{" "}
                {isAr
                  ? "أوافق على شروط باقات إي ثري، قواعد الفعاليات، وسياسة حماية البيانات الشخصية في قطر (PDPL). يتم حفظ واستخدام البيانات حصرياً لإتمام وتنسيق الحجز."
                  : "All booking details are maintained under Qatar Personal Data Privacy Law (PDPL) solely for reservation coordination and event execution."}
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setIsTermsOpen(false)} className="text-xs font-bold px-6">
                  {isAr ? "فهمت وموافق" : "Understood & Close"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* STICKY BOTTOM ENQUIRY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-default)]/90 backdrop-blur-md border-t border-[var(--border-level-2)] p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] block uppercase">
                {isAr ? "الإجمالي التقديري" : "Estimated Total"}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                ({guestCount} {isAr ? "ضيوف" : "guests"})
              </span>
            </div>
            <span className="text-lg md:text-xl font-black font-mono text-[var(--e3-royal-blue)]">
              {estimatedTotal.toLocaleString()} QAR
            </span>
          </div>

          <Button onClick={() => setIsEnquiryOpen(true)} className="gap-2 shadow">
            <Send className="w-4 h-4" />
            {isAr ? "استفسر عن هذه الباقة" : "Enquire For Date"}
          </Button>
        </div>
      </div>

      {/* ENQUIRY MODAL */}
      <PackageEnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        locale={locale}
        selectedPackage={pkg}
        selectedTier={selectedTier}
        selectedAddOns={addOns.filter(a => (selectedAddOnQty[a.id] || 0) > 0).map(a => ({
          ...a,
          qty: selectedAddOnQty[a.id],
          calculatedPrice: a.priceType === "PER_GUEST"
            ? (a.price || 0) * guestCount * selectedAddOnQty[a.id]
            : (a.price || 0) * selectedAddOnQty[a.id]
        }))}
        estimatedTotal={estimatedTotal}
        guestCount={guestCount}
        appliedCoupon={appliedCoupon}
      />
    </div>
  )
}
