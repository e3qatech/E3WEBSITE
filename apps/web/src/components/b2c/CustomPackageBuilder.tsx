"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Wand2, ArrowRight, ArrowLeft, Check, Sparkles, 
  Users, Building, Utensils, Camera, Music, ShieldCheck, Clock
} from "lucide-react"
import { Button } from "@/components/ui/Button"

interface CustomPackageBuilderProps {
  isOpen: boolean
  onClose: () => void
  locale: string
}

export function CustomPackageBuilder({
  isOpen,
  onClose,
  locale
}: CustomPackageBuilderProps) {
  const isAr = locale === "ar"

  const [step, setStep] = useState(1)
  const totalSteps = 5
  const [submitting, setSubmitting] = useState(false)
  const [submittedResult, setSubmittedResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Custom Form State
  const [formData, setFormData] = useState({
    occasion: "CORPORATE",
    selectedAttractions: ["INFLATARUN"],
    guestCount: 30,
    durationHours: 3,
    selectedAddOns: ["CATERING", "PHOTOGRAPHER"],
    targetDate: "",
    budgetRange: "15,000 - 30,000 QAR",
    customerName: "",
    companyOrOrg: "",
    email: "",
    phone: "",
    whatsApp: "",
    specialRequests: "",
    honeypot: ""
  })

  if (!isOpen) return null

  const toggleAttraction = (id: string) => {
    setFormData(prev => {
      const exists = prev.selectedAttractions.includes(id)
      const next = exists 
        ? prev.selectedAttractions.filter(a => a !== id)
        : [...prev.selectedAttractions, id]
      return { ...prev, selectedAttractions: next.length > 0 ? next : [id] }
    })
  }

  const toggleAddOn = (id: string) => {
    setFormData(prev => {
      const exists = prev.selectedAddOns.includes(id)
      const next = exists
        ? prev.selectedAddOns.filter(a => a !== id)
        : [...prev.selectedAddOns, id]
      return { ...prev, selectedAddOns: next }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/b2c/package-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName,
          companyOrOrg: formData.companyOrOrg,
          email: formData.email,
          phone: formData.phone,
          whatsApp: formData.whatsApp || formData.phone,
          expectedGuests: formData.guestCount,
          preferredDate: formData.targetDate || undefined,
          budgetRange: formData.budgetRange,
          specialRequests: formData.specialRequests,
          leadType: "CUSTOM",
          customSelections: {
            occasion: formData.occasion,
            attractions: formData.selectedAttractions,
            durationHours: formData.durationHours,
            addOns: formData.selectedAddOns
          },
          sourcePage: "/b2c/packages/custom-builder",
          locale,
          website_hp: formData.honeypot
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Submission failed")

      setSubmittedResult(data)
      setStep(totalSteps + 1)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to submit custom package request")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-[var(--surface-default)] rounded-3xl border border-slate-800 shadow-2xl p-6 md:p-8 text-white my-8 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 rtl:right-auto rtl:left-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Wand2 className="w-3.5 h-3.5" />
              {isAr ? "مصمم الباقات المخصصة" : "Custom Package Architect"}
            </span>
            <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-[var(--text-primary)]">
              {step <= totalSteps 
                ? (isAr ? "صمّم باقتك وفعاليتك الخاصة" : "Build Your Custom E3 Experience")
                : (isAr ? "تم استلام طلب باقتك المخصصة بنجاح!" : "Custom Proposal Request Received!")
              }
            </h2>
            {step <= totalSteps && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-1.5 bg-[var(--surface-active)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">{step} / {totalSteps}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Step 1: Occasion */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-[var(--text-secondary)]">
                {isAr ? "١. ما هو نوع الفعالية أو الهدف من التجربة؟" : "1. What is the scope of your custom event?"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "CORPORATE", labelEn: "Corporate Team Outing", labelAr: "فعالية شركات وبناء فرق" },
                  { id: "BIRTHDAY", labelEn: "VIP Private Celebration", labelAr: "حفل خاص ومناسبات VIP" },
                  { id: "SCHOOL", labelEn: "Large School / Youth Group", labelAr: "مجموعات مدرسية كبرى" },
                  { id: "BUYOUT", labelEn: "Full Venue Buyout", labelAr: "حجز حصري كامل للوجهة" },
                  { id: "POPUP", labelEn: "Off-Site Pop-Up Event", labelAr: "فعالية خارجية متنقلة" },
                  { id: "COMMUNITY", labelEn: "Festival & Carnival", labelAr: "مهرجانات وفعاليات مجتمعية" }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, occasion: item.id })}
                    className={`p-4 rounded-2xl border text-start transition-all cursor-pointer shadow-sm ${
                      formData.occasion === item.id
                        ? "bg-purple-500/15 border-purple-500/50 text-[var(--text-primary)] shadow ring-1 ring-purple-500/30"
                        : "bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <div className="text-sm font-bold">{isAr ? item.labelAr : item.labelEn}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Attractions */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-[var(--text-secondary)]">
                {isAr ? "٢. اختر الوجهات الترفيهية المراد تضمينها (يمكن اختيار أكثر من وجهة):" : "2. Select target E3 destinations & attractions:"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "INFLATARUN", labelEn: "InflataRUN Giant Inflatables", labelAr: "إنفلاتا ران الدوحة للألعاب المطاطية" },
                  { id: "URBAN_ARENA", labelEn: "Urban Arena Tactical & Esports", labelAr: "أوربان أرينا المعارك التكتيكية والليزر" },
                  { id: "KIDS_CITY", labelEn: "Kids City Driving Academy", labelAr: "مدينة قيادة الأطفال وقواعد المرور" },
                  { id: "POPUP_INFLATABLES", labelEn: "Mobile Inflatables at Client Venue", labelAr: "مطاطيات متنقلة في موقع العميل" }
                ].map(item => {
                  const selected = formData.selectedAttractions.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleAttraction(item.id)}
                      className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 shadow-sm ${
                        selected
                          ? "bg-purple-500/15 border-purple-500/50 text-[var(--text-primary)] shadow ring-1 ring-purple-500/30"
                          : "bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span className="text-sm font-bold">{isAr ? item.labelAr : item.labelEn}</span>
                      {selected && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Sizing & Timing */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  <span>{isAr ? "عدد الضيوف المتوقع:" : "3. Expected Guest Count:"}</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-base">{formData.guestCount} {isAr ? "ضيوف" : "Guests"}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={250}
                  step={5}
                  value={formData.guestCount}
                  onChange={e => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                  {isAr ? "مدة الفعالية المقترحة:" : "Proposed Event Duration:"}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { hours: 2, labelEn: "2 Hours", labelAr: "ساعتان" },
                    { hours: 3, labelEn: "3 Hours", labelAr: "٣ ساعات" },
                    { hours: 4, labelEn: "4 Hours", labelAr: "٤ ساعات" },
                    { hours: 6, labelEn: "Full Day", labelAr: "يوم كامل" }
                  ].map(item => (
                    <button
                      key={item.hours}
                      onClick={() => setFormData({ ...formData, durationHours: item.hours })}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer shadow-sm ${
                        formData.durationHours === item.hours
                          ? "bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-300"
                          : "bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      {isAr ? item.labelAr : item.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Add-Ons */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-[var(--text-secondary)]">
                {isAr ? "٤. حدد الخدمات والإضافات المطلوبة للفعالية:" : "4. Select desired entertainment & production add-ons:"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "CATERING", icon: Utensils, labelEn: "Buffet / Catering Services", labelAr: "خدمات الضيافة والبوفيه" },
                  { id: "CAKE", icon: Sparkles, labelEn: "Custom Branded Cake", labelAr: "كعكة احتفالية مخصصة" },
                  { id: "PHOTOGRAPHER", icon: Camera, labelEn: "Pro Photography & Video", labelAr: "تصوير فوتوغرافي وفيديو احترافي" },
                  { id: "HOST", icon: Users, labelEn: "Dedicated Event Emcee / Host", labelAr: "مقدم فعاليات ومدرب معتمد" },
                  { id: "AV_SOUND", icon: Music, labelEn: "AV, Stage Lighting & Sound", labelAr: "صوتيات وإضاءة مسرح وشاشات" },
                  { id: "BRANDING", icon: ShieldCheck, labelEn: "Custom Corporate Branding", labelAr: "طباعة وتخصيص هوية الفعالية" }
                ].map(item => {
                  const Icon = item.icon
                  const selected = formData.selectedAddOns.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleAddOn(item.id)}
                      className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 shadow-sm ${
                        selected
                          ? "bg-purple-500/15 border-purple-500/50 text-[var(--text-primary)] shadow ring-1 ring-purple-500/30"
                          : "bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        <span className="text-xs font-bold">{isAr ? item.labelAr : item.labelEn}</span>
                      </div>
                      {selected && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 5: Contact Info */}
          {step === 5 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="website_hp"
                value={formData.honeypot}
                onChange={e => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <p className="text-sm font-semibold text-[var(--text-secondary)]">
                {isAr ? "٥. بيانات الاتصال وتفاصيل المقترح:" : "5. Contact & Proposal Delivery Details:"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "الاسم الكامل *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500"
                    placeholder="e.g. Nasser Al-Kuwari"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "الشركة / الجهة (اختياري)" : "Company / Organization"}
                  </label>
                  <input
                    type="text"
                    value={formData.companyOrOrg}
                    onChange={e => setFormData({ ...formData, companyOrOrg: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500"
                    placeholder="e.g. Qatar Airways"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500"
                    placeholder="nasser@example.com"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "رقم الهاتف / الجوال *" : "Phone / Mobile *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500"
                    placeholder="+974 5500 0000"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "الميزانية التقريبية" : "Target Budget Range"}
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={e => setFormData({ ...formData, budgetRange: e.target.value })}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500"
                >
                  <option value="Under 10,000 QAR">Under 10,000 QAR</option>
                  <option value="10,000 - 25,000 QAR">10,000 - 25,000 QAR</option>
                  <option value="25,000 - 50,000 QAR">25,000 - 50,000 QAR</option>
                  <option value="50,000+ QAR">50,000+ QAR</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "متطلبات أو ملاحظات إضافية" : "Special Requirements / Objectives"}
                </label>
                <textarea
                  rows={2}
                  value={formData.specialRequests}
                  onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500 resize-none"
                  placeholder={isAr ? "اذكر أي تفاصيل إضافية مثل أهداف الفعالية أو التواريخ المفضلة..." : "Tell us any specific requirements or event objectives..."}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-95 text-white h-10 shadow-lg"
                >
                  {submitting 
                    ? (isAr ? "جارٍ الإرسال..." : "Generating Proposal Request...")
                    : (isAr ? "إرسال طلب الباقة المخصصة" : "Submit Custom Proposal Request")
                  }
                </Button>
              </div>
            </form>
          )}

          {/* Step 6: Confirmation Screen */}
          {step > totalSteps && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                {isAr ? "تم استلام طلب المقترح المخصص بنجاح!" : "Custom Proposal Brief Received!"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                {isAr 
                  ? "يقوم مهندسو الفعاليات في E3 حالياً بمراجعة خياراتك وإعداد عرض أسعار مفصل يلبي أهداف مناسبتك بدقة."
                  : "Our E3 experience architects are now reviewing your tailored configuration to craft a personalized proposal."
                }
              </p>

              {submittedResult?.referenceNumber && (
                <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] inline-block font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  {isAr ? "رقم المرجع:" : "Inquiry Reference:"} {submittedResult.referenceNumber}
                </div>
              )}

              <div className="pt-4">
                <Button onClick={onClose} className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white">
                  {isAr ? "إغلاق" : "Close"}
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          {step <= totalSteps && step < 5 && (
            <div className="mt-6 pt-4 border-t border-[var(--border-level-2)] flex items-center justify-between">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(prev => prev - 1)}
                  className="gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                  {isAr ? "السابق" : "Back"}
                </Button>
              ) : <div />}

              <Button
                size="sm"
                onClick={() => setStep(prev => prev + 1)}
                className="gap-1.5 text-xs font-bold bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isAr ? "التالي" : "Next"}
                <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
