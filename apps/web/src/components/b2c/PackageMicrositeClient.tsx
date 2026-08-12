"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  Sparkles, 
  Users, 
  Clock, 
  Calendar, 
  Check, 
  X, 
  Download, 
  Send, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Utensils, 
  Camera, 
  Gift, 
  HelpCircle, 
  ChevronDown, 
  ExternalLink,
  Plus,
  Minus
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { InteractiveCard } from "@/components/ui/InteractiveCard"
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer"
import { PackageEnquiryModal } from "@/components/b2c/PackageEnquiryModal"
import { cn } from "@/lib/utils"

export function PackageMicrositeClient({
  locale,
  pkg,
  relatedPackages = []
}: {
  locale: string
  pkg: any
  relatedPackages?: any[]
}) {
  const isAr = locale === "ar"

  const title = isAr ? (pkg.titleAr || pkg.titleEn) : pkg.titleEn
  const tagline = isAr ? (pkg.taglineAr || pkg.taglineEn) : pkg.taglineEn
  const summary = isAr ? (pkg.shortDescriptionAr || pkg.shortDescriptionEn) : pkg.shortDescriptionEn
  const fullDesc = isAr ? (pkg.fullDescriptionAr || pkg.fullDescriptionEn) : pkg.fullDescriptionEn

  // Tiers, Inclusions, Add-Ons from DB JSON
  const tiers: any[] = Array.isArray(pkg.tiers) ? pkg.tiers : []
  const inclusions: any[] = Array.isArray(pkg.inclusions) ? pkg.inclusions : []
  const addOns: any[] = Array.isArray(pkg.addOns) ? pkg.addOns : []
  const journeySteps: any[] = Array.isArray(pkg.journeySteps) ? pkg.journeySteps : []
  const faqs: any[] = Array.isArray(pkg.faqs) ? pkg.faqs : []

  // Interactive Add-On Builder State
  const [selectedTier, setSelectedTier] = useState<any>(tiers[0] || null)
  const [selectedAddOnQty, setSelectedAddOnQty] = useState<{ [id: string]: number }>({})
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false)

  // Calculate dynamic estimated total
  const basePrice = selectedTier ? selectedTier.price : pkg.startingPrice || 0
  const addOnsTotal = addOns.reduce((sum, addon) => {
    const qty = selectedAddOnQty[addon.id] || 0
    return sum + (addon.price || 0) * qty
  }, 0)
  const estimatedTotal = basePrice + addOnsTotal

  const handleAddOnQtyChange = (addonId: string, delta: number) => {
    setSelectedAddOnQty(prev => {
      const cur = prev[addonId] || 0
      const next = Math.max(0, cur + delta)
      return { ...prev, [addonId]: next }
    })
  }

  return (
    <div className="min-h-screen text-[var(--text-primary)] font-poppins pb-24" dir={isAr ? "rtl" : "ltr"}>
      {/* 1. MICROSITE HERO */}
      <section className="relative pt-12 pb-16 px-4 md:px-8 border-b border-[var(--border-level-2)] bg-gradient-to-b from-[var(--surface-default)] to-[var(--bg-level-1)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[var(--e3-royal-blue)]/10 text-[var(--e3-royal-blue)] border border-[var(--e3-royal-blue)]/20 text-xs font-mono font-extrabold uppercase tracking-widest">
                {pkg.category}
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
                <span className="text-[10px] text-[var(--text-tertiary)] block uppercase">Capacity</span>
                <span className="text-[var(--text-primary)]">{pkg.minGuests}-{pkg.maxGuests} Guests</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-tertiary)] block uppercase">Duration</span>
                <span className="text-[var(--text-primary)]">{pkg.durationMinutes ? `${pkg.durationMinutes} Mins` : "Custom"}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-tertiary)] block uppercase">Starting Price</span>
                <span className="text-[var(--e3-royal-blue)]">{pkg.startingPrice ? `${pkg.startingPrice} QAR` : "On Request"}</span>
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
                  <Download className="w-4 h-4" /> PDF Brochure
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
                        <span className="text-[10px] text-[var(--text-tertiary)] font-mono">Includes up to {t.guestCount} guests</span>
                      </div>

                      <div className="space-y-2 border-t border-[var(--border-level-2)] pt-4">
                        {(t.includedItems || []).map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => { setSelectedTier(t); setIsEnquiryOpen(true); }}
                      variant={isSelected ? "primary" : "outline"}
                      className="w-full mt-6 text-xs font-bold uppercase"
                    >
                      {isAr ? "اختيار هذا المستوى" : "Select Tier"}
                    </Button>
                  </InteractiveCard>
                )
              })}
            </div>
          </div>
        )}

        {/* 4. INTERACTIVE ADD-ON BUILDER */}
        {addOns.length > 0 && (
          <div className="p-8 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[var(--e3-royal-blue)] tracking-wider block mb-1">
                  {isAr ? "صمم احتفالك الخاص" : "Build Your Celebration"}
                </span>
                <h2 className="text-2xl md:text-3xl font-black font-display uppercase tracking-tight">
                  {isAr ? "إضافات مخصصة" : "Customize Add-Ons"}
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--e3-royal-blue)]/10 border border-[var(--e3-royal-blue)]/30 text-right">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Estimated Total</span>
                <span className="text-2xl font-black font-mono text-[var(--e3-royal-blue)]">
                  {estimatedTotal.toLocaleString()} QAR
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addOns.map(addon => {
                const qty = selectedAddOnQty[addon.id] || 0
                return (
                  <div key={addon.id} className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                        {isAr ? addon.titleAr || addon.titleEn : addon.titleEn}
                      </h4>
                      <span className="text-xs font-mono font-bold text-[var(--e3-royal-blue)]">
                        +{addon.price} QAR {addon.priceType === "PER_GUEST" ? "/ guest" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAddOnQtyChange(addon.id, -1)}
                        disabled={qty <= 0}
                        className="w-8 h-8 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] flex items-center justify-center text-xs font-bold disabled:opacity-30 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-sm">{qty}</span>
                      <button
                        onClick={() => handleAddOnQtyChange(addon.id, 1)}
                        className="w-8 h-8 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] flex items-center justify-center text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 5. FAQS ACCORDION */}
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
                      className="w-full p-5 text-left flex justify-between items-center gap-4 text-sm font-bold hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
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

        {/* 6. TERMS & CONDITIONS MODAL TRIGGER */}
        <div className="text-center pt-8 border-t border-[var(--border-level-2)]">
          <button
            onClick={() => setIsTermsOpen(true)}
            className="text-xs font-bold uppercase text-[var(--text-secondary)] hover:text-[var(--e3-royal-blue)] underline transition-colors cursor-pointer"
          >
            {isAr ? "عرض الشروط والأحكام الكاملة وسياسة الإلغاء" : "View Full Package Terms & Cancellation Policy"}
          </button>
        </div>
      </section>

      {/* STICKY BOTTOM ENQUIRY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-default)]/90 backdrop-blur-md border-t border-[var(--border-level-2)] p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] block uppercase">Estimated Total</span>
            <span className="text-lg font-black font-mono text-[var(--e3-royal-blue)]">
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
        selectedAddOns={addOns.filter(a => (selectedAddOnQty[a.id] || 0) > 0).map(a => ({ ...a, qty: selectedAddOnQty[a.id] }))}
        estimatedTotal={estimatedTotal}
      />
    </div>
  )
}
