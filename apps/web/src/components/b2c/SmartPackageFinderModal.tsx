"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface SmartPackageFinderModalProps {
  isOpen: boolean
  onClose: () => void
  locale: string
  packages: any[]
  onSelectPackage: (pkg: any) => void
}

export function SmartPackageFinderModal({
  isOpen,
  onClose,
  locale,
  packages = [],
  onSelectPackage
}: SmartPackageFinderModalProps) {
  const isAr = locale === "ar"

  const [step, setStep] = useState(1)
  const [eventType, setEventType] = useState("BIRTHDAY")
  const [guestCount, setGuestCount] = useState("15-25")
  const [_ageBand] = useState("KIDS")
  const [_budgetRange] = useState("MEDIUM")

  if (!isOpen) return null

  // Calculate top 3 recommended packages
  const getRecommendations = () => {
    return packages
      .filter(p => {
        if (eventType !== "ALL" && p.category !== eventType) return false
        return true
      })
      .slice(0, 3)
  }

  const recommendations = getRecommendations()

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir={isAr ? "rtl" : "ltr"}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-2xl p-6 md:p-8 text-[var(--text-primary)]"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {isAr ? "مستكشف الباقات الذكي" : "Smart Package Finder"}
            </span>
            <h2 className="text-2xl md:text-3xl font-black font-display uppercase tracking-tight">
              {isAr ? "اعثر على الباقة المثالية في ٣ خطوات" : "Find Your Ideal Package in 3 Steps"}
            </h2>
          </div>

          {step === 1 && (
            <div className="space-y-6 mt-6">
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                {isAr ? "١. ما هي الفعالية التي تخطط لها؟" : "1. What are you planning?"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "BIRTHDAY", labelEn: "Birthday Party", labelAr: "حفل عيد ميلاد" },
                  { id: "CORPORATE", labelEn: "Corporate Team Outing", labelAr: "فعالية شركات وبناء فرق" },
                  { id: "SCHOOL", labelEn: "School / Nursery Field Trip", labelAr: "رحلة مدرسية / حضانة" },
                  { id: "GROUP", labelEn: "Group Celebration", labelAr: "تجمع عائلي أو مجموعات" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setEventType(t.id)}
                    className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      eventType === t.id
                        ? "bg-[var(--e3-royal-blue)]/20 border-[var(--e3-royal-blue)] text-[var(--text-primary)] shadow"
                        : "bg-[var(--surface-hover)] border-[var(--border-level-2)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {isAr ? t.labelAr : t.labelEn}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button size="sm" onClick={() => setStep(2)} className="gap-2">
                  {isAr ? "التالي" : "Next Step"}
                  <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 mt-6">
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                {isAr ? "٢. ما هو عدد الضيوف والفئة العمرية؟" : "2. Expected Guest Count & Audience?"}
              </p>

              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-2 uppercase">
                  {isAr ? "عدد الضيوف المتوقع" : "Guest Count"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["10-15", "15-30", "30-50", "50+"].map(gc => (
                    <button
                      key={gc}
                      onClick={() => setGuestCount(gc)}
                      className={`p-2.5 rounded-xl border text-xs font-mono font-bold cursor-pointer ${
                        guestCount === gc
                          ? "bg-[var(--e3-royal-blue)] text-white border-[var(--e3-royal-blue)]"
                          : "bg-[var(--surface-hover)] border-[var(--border-level-2)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {gc} {isAr ? "ضيوف" : "Guests"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                  {isAr ? "السابق" : "Back"}
                </Button>
                <Button size="sm" onClick={() => setStep(3)} className="gap-2">
                  {isAr ? "عرض التوصيات" : "See Recommendations"}
                  <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 mt-6">
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                {isAr ? "أفضل الباقات الموصى بها لك:" : "Top Recommended Packages For You:"}
              </p>

              <div className="space-y-3">
                {recommendations.length > 0 ? (
                  recommendations.map(pkg => (
                    <div key={pkg.id} className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono font-extrabold text-[var(--e3-royal-blue)] uppercase">
                          {isAr ? (
                            pkg.category === "BIRTHDAY" ? "أعياد الميلاد" :
                            pkg.category === "CORPORATE" ? "الشركات" :
                            pkg.category === "SCHOOL" ? "المدارس" :
                            pkg.category === "GROUP" ? "المجموعات" :
                            pkg.category === "PRIVATE_EVENT" ? "الفعاليات الخاصة" : pkg.category
                          ) : pkg.category}
                        </span>
                        <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                          {isAr ? pkg.titleAr || pkg.titleEn : pkg.titleEn}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                          {isAr ? pkg.shortDescriptionAr : pkg.shortDescriptionEn}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-black font-mono text-[var(--text-primary)]">
                          {pkg.startingPrice ? `${pkg.startingPrice} QAR` : (isAr ? "عند الطلب" : "On Request")}
                        </span>
                        <Button size="sm" onClick={() => { onSelectPackage(pkg); onClose(); }}>
                          {isAr ? "استفسر الآن" : "Enquire"}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--text-secondary)] text-center py-6">
                    {isAr ? "لم نجد باقات مطابقة، يرجى الاستفسار مباشرة." : "No exact matches. Submit a custom request below!"}
                  </p>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                  {isAr ? "تعديل البحث" : "Adjust Quiz"}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
