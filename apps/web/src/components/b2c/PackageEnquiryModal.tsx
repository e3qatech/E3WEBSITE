"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Send, AlertCircle, Tag, Sparkles } from "lucide-react"
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
}

export function PackageEnquiryModal({
  isOpen,
  onClose,
  locale,
  selectedPackage,
  selectedTier,
  selectedAddOns = [],
  estimatedTotal = 0
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
  const [expectedGuests, setExpectedGuests] = useState(selectedPackage?.minGuests || 15)
  const [specialRequests, setSpecialRequests] = useState("")
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(true)

  // Promotional & Referral inputs
  const [couponCodeInput, setCouponCodeInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [referralCodeInput, setReferralCodeInput] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState<string>("")
  const [errorMsg, setErrorMsg] = useState("")
  const [honeypot, setHoneypot] = useState("")

  if (!isOpen) return null

  const handleApplyCoupon = async () => {
    if (!couponCodeInput) return
    setValidatingCoupon(true)
    setCouponError(null)
    try {
      const res = await fetch("/api/b2c/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCodeInput,
          packageId: selectedPackage?.id,
          subtotal: estimatedTotal || selectedPackage?.startingPrice || 0,
          customerEmail: email
        })
      })
      const json = await res.json()
      if (json.valid) {
        setAppliedCoupon(json)
      } else {
        setCouponError(json.message || "Invalid coupon code")
      }
    } catch {
      setCouponError(isAr ? "فشل التحقق من الكوبون" : "Failed to validate coupon")
    } finally {
      setValidatingCoupon(false)
    }
  }

  const finalEstimatedTotal = Math.max(
    0,
    (estimatedTotal || selectedPackage?.startingPrice || 0) - (appliedCoupon?.discountAmount || 0)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || (!email && !phone && !whatsApp)) {
      setErrorMsg(isAr ? "يرجى كتابة الاسم ورقم التواصل" : "Please provide your name and contact information")
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
        selectedTierId: selectedTier?.id || null,
        selectedTierName: selectedTier?.nameEn || null,
        selectedAddOns: selectedAddOns.map(a => ({ id: a.id, name: a.titleEn, qty: a.qty || 1, price: a.price })),
        celebrationName,
        ageGroup,
        preferredDate: preferredDate || null,
        alternativeDate: alternativeDate || null,
        expectedGuests,
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
          className="relative w-full max-w-xl bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-2xl p-6 md:p-8 text-[var(--text-primary)] my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 rtl:right-auto rtl:left-5 p-2 rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                {isAr ? "تم إرسال طلب الحجز بنجاح!" : "Enquiry Received Successfully!"}
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
                {selectedTier && (
                  <p className="text-xs text-[var(--e3-royal-blue)] font-bold mt-0.5">
                    {isAr ? "الفئة المختارة:" : "Selected Tier:"} {isAr ? (selectedTier.nameAr || selectedTier.nameEn) : selectedTier.nameEn}
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

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "عدد الحضور المتوقع" : "Expected Guest Count"}
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    value={expectedGuests}
                    onChange={e => setExpectedGuests(parseInt(e.target.value) || 10)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)] font-mono"
                  />
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
                        ✓ {appliedCoupon.description} (-{appliedCoupon.discountAmount} QAR)
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

                <div className="col-span-1 sm:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "ملاحظات أو طلبات خاصة" : "Special Requests or Catering Requirements"}
                  </label>
                  <textarea
                    rows={3}
                    value={specialRequests}
                    onChange={e => setSpecialRequests(e.target.value)}
                    placeholder={isAr ? "اذكر أي تفاصيل إضافية أو ثيم مخصص..." : "Any custom theme, food allergies, or timing notes..."}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)] resize-none"
                  />
                </div>
              </div>

              {/* Estimate Summary if Total Available */}
              {finalEstimatedTotal > 0 && (
                <div className="p-4 bg-[var(--e3-royal-blue)]/10 border border-[var(--e3-royal-blue)]/30 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-secondary)]">
                    {isAr ? "إجمالي الباقة التقديري:" : "Estimated Package Total:"}
                  </span>
                  <div className="text-end">
                    {appliedCoupon && (
                      <span className="text-xs text-slate-500 line-through block font-mono">
                        {(estimatedTotal || selectedPackage?.startingPrice).toLocaleString()} QAR
                      </span>
                    )}
                    <span className="text-lg font-black font-mono text-[var(--e3-royal-blue)]">
                      {finalEstimatedTotal.toLocaleString()} QAR
                    </span>
                  </div>
                </div>
              )}

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
                <Button type="submit" size="sm" disabled={submitting} className="gap-2">
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
