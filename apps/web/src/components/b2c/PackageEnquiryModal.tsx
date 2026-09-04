"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Send, AlertCircle, Tag, Sparkles, Plus, Minus, Users } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

interface PackageEnquiryModalProps {
  isOpen: boolean
  onClose: () => void
  locale: string
  selectedPackage?: any
  selectedTier?: any
  selectedAddOns?: any[]
  estimatedTotal?: number
  guestCount?: number
  appliedCoupon?: any
}

export function PackageEnquiryModal({
  isOpen,
  onClose,
  locale,
  selectedPackage,
  selectedTier,
  selectedAddOns = [],
  estimatedTotal = 0,
  guestCount,
  appliedCoupon: initialAppliedCoupon = null
}: PackageEnquiryModalProps) {
  const isAr = locale === "ar"

  const [leadType, setLeadType] = useState<string>(
    selectedPackage?.category === "CORPORATE" ? "CORPORATE" :
    selectedPackage?.category === "SCHOOL" ? "GROUP_SCHOOL" : "BIRTHDAY"
  )

  const [customerName, setCustomerName] = useState("")
  const [companyOrOrg, setCompanyOrOrg] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsApp, setWhatsApp] = useState("")
  const [contactMethod, setContactMethod] = useState("WHATSAPP")
  
  const [celebrationName, setCelebrationName] = useState("")
  const [ageGroup, setAgeGroup] = useState("")
  const [preferredDate, setPreferredDate] = useState("")
  const [alternativeDate, setAlternativeDate] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(true)

  // Modular Tiers
  const availableTiers: any[] = useMemo(() => {
    return Array.isArray(selectedPackage?.tiers) ? selectedPackage.tiers : []
  }, [selectedPackage])

  const [activeTier, setActiveTier] = useState<any>(null)

  // Venue Capacity Constraints
  const packageMinGuests = Math.max(1, selectedPackage?.minGuests || activeTier?.minGuests || 1)
  const packageMaxGuests = Math.max(packageMinGuests, selectedPackage?.maxGuests || activeTier?.maxGuests || 100)

  // Guest Count State
  const [expectedGuests, setExpectedGuests] = useState<number>(packageMinGuests)

  // Add-ons State
  const availableAddOns: any[] = useMemo(() => {
    return Array.isArray(selectedPackage?.addOns) ? selectedPackage.addOns : []
  }, [selectedPackage])

  const [modalAddOnQty, setModalAddOnQty] = useState<{ [id: string]: number }>({})

  // Promotional & Referral inputs
  const [couponCodeInput, setCouponCodeInput] = useState(initialAppliedCoupon?.code || "")
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(initialAppliedCoupon)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [referralCodeInput, setReferralCodeInput] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState<string>("")
  const [errorMsg, setErrorMsg] = useState("")
  const [honeypot, setHoneypot] = useState("")

  // Synchronize state whenever modal opens or package/tier props change
  useEffect(() => {
    if (isOpen) {
      const tierToUse = selectedTier || availableTiers[0] || null
      setActiveTier(tierToUse)

      const minCap = Math.max(1, selectedPackage?.minGuests || tierToUse?.minGuests || 1)
      const maxCap = Math.max(minCap, selectedPackage?.maxGuests || tierToUse?.maxGuests || 100)

      const initialGuests = guestCount || tierToUse?.guestCount || tierToUse?.includedGuests || minCap || 10
      setExpectedGuests(Math.max(minCap, Math.min(maxCap, initialGuests)))

      // Populate add-on quantities
      const initialMap: { [id: string]: number } = {}
      if (Array.isArray(selectedAddOns)) {
        selectedAddOns.forEach(a => {
          if (a.id) initialMap[a.id] = a.qty || a.quantity || 1
        })
      }
      setModalAddOnQty(initialMap)

      if (initialAppliedCoupon) {
        setAppliedCoupon(initialAppliedCoupon)
        setCouponCodeInput(initialAppliedCoupon.code || "")
      }
      setErrorMsg("")
    }
  }, [isOpen, selectedPackage, selectedTier, selectedAddOns, guestCount, initialAppliedCoupon, availableTiers])

  if (!isOpen) return null

  // Capacity validation status
  const isBelowMin = expectedGuests < packageMinGuests
  const isAboveMax = expectedGuests > packageMaxGuests

  // Real-time Pricing Calculations
  const tierPrice = activeTier ? (activeTier.price || 0) : (selectedPackage?.startingPrice || 0)
  const includedGuestsInTier = activeTier?.includedGuests || activeTier?.guestCount || packageMinGuests || 10
  const extraPricePerGuest = activeTier?.extraGuestPrice ?? selectedPackage?.extraGuestPrice ?? 0

  // Safe guest count for financial calculation
  const safeGuests = Math.max(packageMinGuests, Math.min(packageMaxGuests, expectedGuests || packageMinGuests))
  const extraGuestsCount = Math.max(0, safeGuests - includedGuestsInTier)
  const extraGuestsTotal = extraGuestsCount * extraPricePerGuest

  let modalAddOnsTotal = 0
  const calculatedAddOnsList: any[] = []

  availableAddOns.forEach(addon => {
    const qty = modalAddOnQty[addon.id] || 0
    if (qty > 0) {
      const isPerGuest = addon.priceType === "PER_GUEST"
      const unit = addon.price || 0
      const lineTotal = isPerGuest ? unit * safeGuests * qty : unit * qty
      modalAddOnsTotal += lineTotal
      calculatedAddOnsList.push({
        id: addon.id,
        name: addon.titleEn,
        nameAr: addon.titleAr,
        titleEn: addon.titleEn,
        titleAr: addon.titleAr,
        qty,
        unitPrice: unit,
        lineTotal,
        priceType: addon.priceType
      })
    }
  })

  const grossSubtotal = tierPrice + extraGuestsTotal + modalAddOnsTotal
  const couponDiscount = appliedCoupon ? Math.min(grossSubtotal, (appliedCoupon.discountAmount || 0)) : 0
  const finalEstimatedTotal = Math.max(0, grossSubtotal - couponDiscount)

  const handleAddOnQtyChange = (addonId: string, delta: number) => {
    setModalAddOnQty(prev => {
      const cur = prev[addonId] || 0
      const next = Math.max(0, cur + delta)
      return { ...prev, [addonId]: next }
    })
  }

  const handleApplyCoupon = async () => {
    if (!couponCodeInput) return
    setValidatingCoupon(true)
    setCouponError(null)
    try {
      const res = await fetch("/api/b2c/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCodeInput.trim(),
          packageId: selectedPackage?.id,
          subtotal: grossSubtotal,
          customerEmail: email
        })
      })
      const json = await res.json()
      if (json.valid) {
        setAppliedCoupon(json)
      } else {
        setCouponError(json.message || (isAr ? "رمز الكوبون غير صالح" : "Invalid coupon code"))
      }
    } catch {
      setCouponError(isAr ? "فشل التحقق من الكوبون" : "Failed to validate coupon")
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || (!email && !phone && !whatsApp)) {
      setErrorMsg(isAr ? "يرجى كتابة الاسم ورقم التواصل" : "Please provide your name and contact information")
      return
    }

    if (expectedGuests < packageMinGuests) {
      setErrorMsg(
        isAr
          ? `الحد الأدنى لعدد الحضور في هذه الباقة هو ${packageMinGuests} ضيوف.`
          : `Minimum booking requirement is ${packageMinGuests} guests.`
      )
      return
    }

    if (expectedGuests > packageMaxGuests) {
      setErrorMsg(
        isAr
          ? `سعة المكان القصوى هي ${packageMaxGuests} ضيفاً. لا يمكن حجز هذا العدد في هذه المساحة.`
          : `Venue maximum capacity is ${packageMaxGuests} guests. Cannot exceed capacity limit.`
      )
      return
    }

    setSubmitting(true)
    setErrorMsg("")

    try {
      const payload = {
        customerName,
        companyOrOrg,
        email,
        phone,
        whatsApp: whatsApp || phone,
        contactMethod,
        leadType,
        packageId: selectedPackage?.id || null,
        selectedTierId: activeTier?.id || null,
        selectedTierName: activeTier?.nameEn || null,
        selectedAddOns: calculatedAddOnsList.map(a => ({
          id: a.id,
          name: a.name,
          titleEn: a.titleEn,
          titleAr: a.titleAr,
          qty: a.qty,
          price: a.unitPrice,
          priceType: a.priceType,
          total: a.lineTotal
        })),
        celebrationName,
        ageGroup,
        preferredDate: preferredDate || null,
        alternativeDate: alternativeDate || null,
        expectedGuests: safeGuests,
        estimatedValue: finalEstimatedTotal,
        specialRequests,
        marketingConsent,
        termsAccepted,
        locale,
        couponCode: appliedCoupon?.code || couponCodeInput || undefined,
        referralCode: referralCodeInput || undefined,
        website_hp: honeypot
      }

      const res = await fetch("/api/b2c/package-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to submit enquiry")
      }

      const data = await res.json()
      setReferenceNumber(data.referenceNumber || `E3-LEAD-${Date.now().toString().slice(-6)}`)
      setSuccess(true)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || "Failed to submit enquiry. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-2xl p-6 md:p-8 text-[var(--text-primary)] my-8 max-h-[90vh] overflow-y-auto font-poppins"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 rtl:right-auto rtl:left-5 w-8 h-8 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                {isAr ? "تم استلام طلبك بنجاح!" : "Enquiry Received Successfully!"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                {isAr 
                  ? "شكراً لك! سيقوم فريق تنسيق الفعاليات في إي ثري بمراجعة التوافر والتواصل معك خلال ٢٤ ساعة لتأكيد التفاصيل."
                  : "Thank you! Our E3 event concierge team is reviewing your requested dates and will contact you within 24 hours to confirm."
                }
              </p>

              {referenceNumber && (
                <div className="p-3 bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl inline-block font-mono text-xs text-emerald-400 font-bold">
                  {isAr ? "رقم المرجع:" : "Reference ID:"} {referenceNumber}
                </div>
              )}

              <div className="pt-4">
                <Button onClick={onClose} className="text-xs font-bold">
                  {isAr ? "إغلاق النافذة" : "Close Window"}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="website_hp"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Header */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAr ? "طلب حجز واستفسار رسمي" : "Official Package Enquiry"}
                </span>
                <h3 className="text-xl md:text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                  {selectedPackage 
                    ? (isAr ? (selectedPackage.titleAr || selectedPackage.titleEn) : selectedPackage.titleEn)
                    : (isAr ? "استفسار عن باقات إي ثري" : "E3 Package Booking Request")
                  }
                </h3>

                {/* Modular Tier Selector */}
                {availableTiers.length > 1 && (
                  <div className="mt-2.5">
                    <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)] block mb-1.5 font-bold">
                      {isAr ? "اختر فئة الباقة:" : "Choose Package Tier:"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableTiers.map((tier: any) => {
                        const isTierActive = activeTier?.id === tier.id
                        return (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => {
                              setActiveTier(tier)
                              if (expectedGuests < (tier.guestCount || tier.includedGuests || packageMinGuests)) {
                                setExpectedGuests(tier.guestCount || tier.includedGuests || packageMinGuests)
                              }
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2",
                              isTierActive
                                ? "bg-[var(--e3-royal-blue)] text-white border-[var(--e3-royal-blue)] shadow-md"
                                : "bg-[var(--surface-hover)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-white"
                            )}
                          >
                            <span>{isAr ? tier.nameAr || tier.nameEn : tier.nameEn}</span>
                            <span className="font-mono text-[10px] opacity-80">{tier.price} QAR</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                {availableTiers.length === 1 && activeTier && (
                  <p className="text-xs text-[var(--e3-royal-blue)] font-bold mt-0.5">
                    {isAr ? "الفئة المختارة:" : "Selected Tier:"} {isAr ? (activeTier.nameAr || activeTier.nameEn) : activeTier.nameEn} ({activeTier.price} QAR)
                  </p>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Lead Type Radio */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { id: "BIRTHDAY", labelEn: "Birthday Party", labelAr: "حفل عيد ميلاد" },
                  { id: "GROUP_SCHOOL", labelEn: "School / Nursery", labelAr: "مدرسة / حضانة" },
                  { id: "CORPORATE", labelEn: "Corporate Outing", labelAr: "فعالية شركات" },
                  { id: "GENERAL", labelEn: "Group Booking", labelAr: "حجز جماعي" }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setLeadType(type.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer",
                      leadType === type.id
                        ? "bg-[var(--e3-royal-blue)]/20 border-[var(--e3-royal-blue)] text-[var(--text-primary)] shadow-sm"
                        : "bg-[var(--surface-hover)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {isAr ? type.labelAr : type.labelEn}
                  </button>
                ))}
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "الاسم الكامل *" : "Contact Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder={isAr ? "الاسم الكريم" : "Your Name"}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {leadType === "CORPORATE" 
                      ? (isAr ? "اسم الشركة *" : "Company Name *")
                      : (isAr ? "الجهة أو المدرسة (اختياري)" : "Organization / School")
                    }
                  </label>
                  <input
                    type="text"
                    value={companyOrOrg}
                    onChange={e => setCompanyOrOrg(e.target.value)}
                    placeholder={leadType === "CORPORATE" ? "Company name" : "School / Group"}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)] font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "رقم الهاتف / الواتساب *" : "Phone / WhatsApp Number *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsApp}
                    onChange={e => {
                      setWhatsApp(e.target.value)
                      setPhone(e.target.value)
                    }}
                    placeholder="+974 XXXX XXXX"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)] font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "التاريخ المفضل" : "Preferred Event Date"}
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={e => setPreferredDate(e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)] font-mono"
                  />
                </div>

                {/* Expected Guest Count with Stepper & Capacity Guard */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">
                      {isAr ? "عدد الحضور المتوقع *" : "Expected Guest Count *"}
                    </label>
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                      {packageMinGuests} - {packageMaxGuests} {isAr ? "ضيوف" : "guests"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpectedGuests(prev => Math.max(packageMinGuests, prev - 1))}
                      disabled={expectedGuests <= packageMinGuests}
                      className="w-8 h-8 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:border-[var(--e3-royal-blue)] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={packageMinGuests}
                      max={packageMaxGuests}
                      value={expectedGuests || ""}
                      onChange={e => setExpectedGuests(parseInt(e.target.value) || 0)}
                      onBlur={() => {
                        if (expectedGuests < packageMinGuests) setExpectedGuests(packageMinGuests)
                        if (expectedGuests > packageMaxGuests) setExpectedGuests(packageMaxGuests)
                      }}
                      className={cn(
                        "w-full text-center bg-[var(--surface-hover)] border rounded-xl px-2 py-1.5 text-xs font-mono font-bold focus:outline-none",
                        isBelowMin || isAboveMax
                          ? "border-rose-500 text-rose-400"
                          : "border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--e3-royal-blue)]"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setExpectedGuests(prev => Math.min(packageMaxGuests, prev + 1))}
                      disabled={expectedGuests >= packageMaxGuests}
                      className="w-8 h-8 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:border-[var(--e3-royal-blue)] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isBelowMin && (
                    <p className="text-[11px] text-amber-400 font-bold mt-1">
                      {isAr
                        ? `⚠️ الحد الأدنى لعدد الحضور في هذه الباقة هو ${packageMinGuests} ضيوف.`
                        : `⚠️ Minimum guest requirement for this package is ${packageMinGuests} guests.`}
                    </p>
                  )}
                  {isAboveMax && (
                    <p className="text-[11px] text-rose-400 font-bold mt-1">
                      {isAr
                        ? `⛔ سعة المكان القصوى هي ${packageMaxGuests} ضيفاً. لا يمكن حجز هذا العدد.`
                        : `⛔ Venue maximum capacity is ${packageMaxGuests} guests. Cannot exceed capacity limit.`}
                    </p>
                  )}
                  {!isBelowMin && !isAboveMax && extraGuestsCount > 0 && (
                    <p className="text-[10px] text-[var(--text-tertiary)] font-mono mt-1">
                      {isAr
                        ? `تشمل الباقة ${includedGuestsInTier} ضيوف. (+${extraGuestsCount} ضيوف إضافيين × ${extraPricePerGuest} ر.ق).`
                        : `Includes ${includedGuestsInTier} guests. +${extraGuestsCount} extra guests calculated (+${extraGuestsTotal.toLocaleString()} QAR).`}
                    </p>
                  )}
                </div>

                {leadType === "BIRTHDAY" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                        {isAr ? "اسم صاحب / صاحبة العيد" : "Birthday Child / Celebrant Name"}
                      </label>
                      <input
                        type="text"
                        value={celebrationName}
                        onChange={e => setCelebrationName(e.target.value)}
                        placeholder="e.g. Tariq"
                        className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                        {isAr ? "العمر المحتفى به" : "Turning Age"}
                      </label>
                      <input
                        type="text"
                        value={ageGroup}
                        onChange={e => setAgeGroup(e.target.value)}
                        placeholder="e.g. 7 years old"
                        className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)]"
                      />
                    </div>
                  </>
                )}

                {/* Coupon & Referral Code Row */}
                <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                      {isAr ? "رمز الكوبون الترويجي" : "Promo / Coupon Code"}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={e => setCouponCodeInput(e.target.value)}
                        placeholder="e.g. E3-SUMMER"
                        className="flex-1 bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-[var(--e3-royal-blue)]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={validatingCoupon || !couponCodeInput}
                        onClick={handleApplyCoupon}
                        className="h-8 text-xs font-bold px-3 shrink-0"
                      >
                        {validatingCoupon ? "..." : (isAr ? "تطبيق" : "Apply")}
                      </Button>
                    </div>
                    {couponError && <p className="text-[10px] text-rose-400 mt-1">{couponError}</p>}
                    {appliedCoupon && (
                      <p className="text-[10px] text-emerald-400 mt-1 font-bold">
                        ✓ {appliedCoupon.code || appliedCoupon.description} (-{appliedCoupon.discountAmount} QAR)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                      {isAr ? "كود الإحالة (اختياري)" : "Referral Code (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={referralCodeInput}
                      onChange={e => setReferralCodeInput(e.target.value)}
                      placeholder="e.g. REF-12345"
                      className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-[var(--e3-royal-blue)]"
                    />
                  </div>
                </div>

                {/* MODAL ADD-ONS SELECTOR */}
                {availableAddOns.length > 0 && (
                  <div className="col-span-1 sm:col-span-2 pt-3 border-t border-[var(--border-level-2)] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-primary)] tracking-wider">
                          {isAr ? "تخصيص الخدمات والإضافات (اختياري)" : "Customize Add-Ons & Experiences"}
                        </h4>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          {isAr ? "اختر الخدمات الإضافية لاحتفالك وسنقوم بإضافتها لعرض السعر." : "Select optional party add-ons, cakes, or hosts with instant price calculation."}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {availableAddOns.map((addon: any) => {
                        const qty = modalAddOnQty[addon.id] || 0
                        const isPerGuest = addon.priceType === "PER_GUEST"
                        const lineTotal = isPerGuest ? (addon.price || 0) * safeGuests * qty : (addon.price || 0) * qty

                        return (
                          <div
                            key={addon.id}
                            className={cn(
                              "p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2",
                              qty > 0
                                ? "bg-[var(--surface-hover)] border-[var(--e3-royal-blue)]/60 shadow-sm"
                                : "bg-[var(--surface-subtle)]/40 border-[var(--border-level-2)]"
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-xs text-[var(--text-primary)] truncate">
                                {isAr ? addon.titleAr || addon.titleEn : addon.titleEn}
                              </h5>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-mono font-bold text-[var(--e3-royal-blue)]">
                                  +{addon.price} QAR {isPerGuest ? (isAr ? "/ ضيف" : "/ guest") : ""}
                                </span>
                                {isPerGuest && qty > 0 && (
                                  <span className="text-[9px] font-mono bg-[var(--e3-royal-blue)]/10 text-[var(--e3-royal-blue)] px-1.5 py-0.5 rounded">
                                    {addon.price} × {safeGuests} = {lineTotal.toLocaleString()} QAR
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleAddOnQtyChange(addon.id, -1)}
                                disabled={qty <= 0}
                                className="w-6 h-6 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:border-[var(--e3-royal-blue)] cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-4 text-center font-mono font-bold text-xs">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleAddOnQtyChange(addon.id, 1)}
                                disabled={addon.maxQty && qty >= addon.maxQty}
                                className="w-6 h-6 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] flex items-center justify-center text-xs font-bold hover:border-[var(--e3-royal-blue)] cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="col-span-1 sm:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "ملاحظات أو طلبات خاصة" : "Special Requests or Catering Requirements"}
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={e => setSpecialRequests(e.target.value)}
                    placeholder={isAr ? "اذكر أي تفاصيل إضافية أو ثيم مخصص..." : "Any custom theme, food allergies, or timing notes..."}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)] resize-none"
                  />
                </div>
              </div>

              {/* REAL-TIME DYNAMIC PRICE BREAKDOWN */}
              <div className="p-4 bg-gradient-to-br from-[var(--surface-hover)] to-[var(--surface-subtle)] border border-[var(--border-level-2)] rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                  <span>{isAr ? "الفئة الأساسية" : "Base Tier"}:</span>
                  <span className="font-bold text-[var(--text-primary)]">{tierPrice.toLocaleString()} QAR</span>
                </div>

                {extraGuestsTotal > 0 && (
                  <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                    <span>+{extraGuestsCount} {isAr ? "ضيوف إضافيين:" : "extra guests:"}</span>
                    <span className="font-bold">+{extraGuestsTotal.toLocaleString()} QAR</span>
                  </div>
                )}

                {modalAddOnsTotal > 0 && (
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                    <span>{isAr ? "الإضافات المختارة:" : "Selected Add-Ons:"}</span>
                    <span className="font-bold text-[var(--text-primary)]">+{modalAddOnsTotal.toLocaleString()} QAR</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                    <span>{isAr ? "خصم الكوبون:" : "Coupon Discount:"}</span>
                    <span className="font-bold">-{couponDiscount.toLocaleString()} QAR</span>
                  </div>
                )}

                <div className="pt-2 border-t border-[var(--border-level-2)] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block">
                      {isAr ? "إجمالي الباقة التقديري:" : "Estimated Package Total:"}
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                      ({safeGuests} {isAr ? "ضيوف" : "guests"}
                      {activeTier ? ` • ${isAr ? activeTier.nameAr || activeTier.nameEn : activeTier.nameEn}` : ""})
                    </span>
                  </div>
                  <div className="text-end">
                    <span className="text-xl font-black font-mono text-[var(--e3-royal-blue)]">
                      {finalEstimatedTotal.toLocaleString()} QAR
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms Consent (Preserving required Arabic PDPL string) */}
              <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    required
                    className="rounded text-[var(--e3-royal-blue)]"
                  />
                  <span>
                    {isAr 
                      ? "أوافق على شروط باقات إي ثري، قواعد الفعاليات، وسياسة حماية البيانات الشخصية في قطر (PDPL)" 
                      : "I agree to E3 Package terms, venue rules, and Qatar PDPL privacy policies"}
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || isBelowMin || isAboveMax}
                  className="gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? (isAr ? "جاري الإرسال..." : "Submitting...") : (isAr ? "إرسال الطلب الآن" : "Submit Enquiry")}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
