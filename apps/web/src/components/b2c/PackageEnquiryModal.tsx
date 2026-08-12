"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Calendar, Users, Building2, Sparkles, ShieldCheck, Download, Send, AlertCircle } from "lucide-react"
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

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  if (!isOpen) return null

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
        preferredDate,
        alternativeDate,
        expectedGuests,
        estimatedValue: estimatedTotal || selectedPackage?.startingPrice || 0,
        specialRequests,
        marketingConsent,
        termsAccepted,
        locale
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

      setSuccess(true)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit enquiry")
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
          className="relative w-full max-w-2xl bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-2xl p-6 md:p-8 my-8 text-[var(--text-primary)]"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 md:top-6 md:right-6 p-2 rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black font-display uppercase tracking-tight">
                {isAr ? "تم استلام طلبك بنجاح!" : "Enquiry Submitted Successfully!"}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                {isAr 
                  ? "شكراً لك. سيقوم فريق إي ثري بالتواصل معك عبر الواتساب أو الهاتف لتأكيد التوافر والتفاصيل."
                  : "Thank you! Our E3 celebration manager will contact you via WhatsApp/phone to confirm venue availability and details."}
              </p>
              <Button onClick={onClose} className="mt-4">
                {isAr ? "إغلاق النافذة" : "Close Window"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--e3-royal-blue)] block mb-1">
                  {isAr ? "استفسار عن باقات إي ثري" : "E3 Package Enquiry Engine"}
                </span>
                <h2 className="text-2xl md:text-3xl font-black font-display uppercase tracking-tight">
                  {selectedPackage 
                    ? (isAr ? `حجز باقة: ${selectedPackage.titleAr || selectedPackage.titleEn}` : `Plan ${selectedPackage.titleEn}`)
                    : (isAr ? "خطط لفعاليتك مع إي ثري" : "Plan Your Event With E3")}
                </h2>
                {selectedTier && (
                  <p className="text-xs font-bold text-purple-400 mt-1">
                    {isAr ? `المستوى المحدد: ${selectedTier.nameAr || selectedTier.nameEn}` : `Selected Tier: ${selectedTier.nameEn}`}
                  </p>
                )}
              </div>

              {/* Lead Type Tabs */}
              {!selectedPackage && (
                <div className="flex gap-2 p-1 bg-[var(--surface-hover)] rounded-xl border border-[var(--border-level-2)]">
                  {[
                    { id: "BIRTHDAY", labelEn: "Birthday Party", labelAr: "حفل عيد ميلاد" },
                    { id: "GROUP_SCHOOL", labelEn: "School / Group", labelAr: "رحلة مدرسية / مجموعة" },
                    { id: "CORPORATE", labelEn: "Corporate Event", labelAr: "فعالية شركات" }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setLeadType(t.id)}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
                        leadType === t.id ? "bg-[var(--e3-royal-blue)] text-white shadow" : "text-[var(--text-secondary)]"
                      )}
                    >
                      {isAr ? t.labelAr : t.labelEn}
                    </button>
                  ))}
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "الاسم الكامل *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder={isAr ? "اسم ولي الأمر / المنظم" : "Parent / Organizer Name"}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)]"
                  />
                </div>

                {leadType === "CORPORATE" || leadType === "GROUP_SCHOOL" ? (
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                      {isAr ? "اسم الشركة / المدرسة" : "Company / School Name"}
                    </label>
                    <input
                      type="text"
                      value={companyOrOrg}
                      onChange={e => setCompanyOrOrg(e.target.value)}
                      placeholder={isAr ? "اسم المؤسسة" : "Organization Name"}
                      className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                      {isAr ? "اسم المحتفى به / المناسبة" : "Celebration / Child Name"}
                    </label>
                    <input
                      type="text"
                      value={celebrationName}
                      onChange={e => setCelebrationName(e.target.value)}
                      placeholder={isAr ? "مثال: عيد ميلاد آدم الـ٨" : "e.g. Adam's 8th Birthday"}
                      className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--e3-royal-blue)]"
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
                    onChange={e => setWhatsApp(e.target.value)}
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

                <div className="col-span-2">
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

              {/* Estimate Summary if Add-Ons Selected */}
              {estimatedTotal > 0 && (
                <div className="p-4 bg-[var(--e3-royal-blue)]/10 border border-[var(--e3-royal-blue)]/30 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-secondary)]">
                    {isAr ? "إجمالي الباقة التقديري:" : "Estimated Package Total:"}
                  </span>
                  <span className="text-lg font-black font-mono text-[var(--e3-royal-blue)]">
                    {estimatedTotal.toLocaleString()} QAR
                  </span>
                </div>
              )}

              {/* Terms Consent */}
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
                    {isAr ? "أوافق على الشروط والأحكام وسياسة الخصوصية الخاصة بـ إي ثري" : "I agree to E3 Package terms, venue rules, and cancellation policies"}
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
