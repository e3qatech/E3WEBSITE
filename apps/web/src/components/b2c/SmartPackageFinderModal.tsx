"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Sparkles, ArrowRight, ArrowLeft, Check, Compass, 
  Users, Calendar, DollarSign, MapPin, Smile, Award
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

interface SmartPackageFinderModalProps {
  isOpen: boolean
  onClose: () => void
  locale: string
  packages: any[]
  onSelectPackage: (pkg: any) => void
  onOpenCustomBuilder?: () => void
}

export function SmartPackageFinderModal({
  isOpen,
  onClose,
  locale,
  packages = [],
  onSelectPackage,
  onOpenCustomBuilder
}: SmartPackageFinderModalProps) {
  const isAr = locale === "ar"

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6

  // Answers State
  const [answers, setAnswers] = useState({
    occasion: "BIRTHDAY",
    audience: "KIDS",
    guests: "10-25",
    ageGroup: "KIDS",
    timing: "WEEKEND",
    venue: "ANY",
    budget: "MEDIUM"
  })

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    } else {
      setCurrentStep(totalSteps + 1) // Results view
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setAnswers({
      occasion: "BIRTHDAY",
      audience: "KIDS",
      guests: "10-25",
      ageGroup: "KIDS",
      timing: "WEEKEND",
      venue: "ANY",
      budget: "MEDIUM"
    })
  }

  // Scoring algorithm to rank packages based on answers
  const getRankedPackages = () => {
    const scored = packages.map(pkg => {
      let score = 0

      // Match occasion / category
      if (answers.occasion === "BIRTHDAY" && (pkg.category === "BIRTHDAY" || pkg.categoryRel?.slug === "celebrate")) score += 40
      if (answers.occasion === "CORPORATE" && (pkg.category === "CORPORATE" || pkg.categoryRel?.slug === "corporate")) score += 40
      if (answers.occasion === "SCHOOL" && (pkg.category === "SCHOOL" || pkg.categoryRel?.slug === "learn-explore")) score += 40
      if (answers.occasion === "GROUP" && (pkg.category === "GROUP" || pkg.categoryRel?.slug === "play-together")) score += 40
      if (answers.occasion === "SEASONAL" && (pkg.category === "SEASONAL" || pkg.categoryRel?.slug === "seasonal")) score += 40
      if (answers.occasion === "EVENTS" && (pkg.category === "PRIVATE_EVENT" || pkg.category === "EVENTS")) score += 40

      // Match audience
      if (Array.isArray(pkg.audienceTypes) && pkg.audienceTypes.includes(answers.audience)) score += 20
      if (pkg.audienceType === answers.audience) score += 20

      // Match guest range
      if (answers.guests === "UNDER_15" && pkg.minGuests <= 15) score += 15
      if (answers.guests === "10-25" && pkg.minGuests <= 25 && pkg.maxGuests >= 15) score += 15
      if (answers.guests === "25-50" && pkg.maxGuests >= 30) score += 15
      if (answers.guests === "50_PLUS" && pkg.maxGuests >= 50) score += 15

      // Match budget
      if (answers.budget === "LOW" && pkg.startingPrice < 1500) score += 15
      if (answers.budget === "MEDIUM" && pkg.startingPrice >= 1200 && pkg.startingPrice <= 4000) score += 15
      if (answers.budget === "HIGH" && pkg.startingPrice > 3000) score += 15

      // Featured / Popular boosts
      if (pkg.isFeatured) score += 5
      if (pkg.isPopular) score += 5

      return { pkg, score }
    })

    return scored.sort((a, b) => b.score - a.score).map(s => s.pkg)
  }

  const rankedPackages = getRankedPackages()
  const topRecommendations = rankedPackages.slice(0, 3)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir={isAr ? "rtl" : "ltr"}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-2xl p-6 md:p-8 text-[var(--text-primary)] max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 rtl:right-auto rtl:left-5 p-2 rounded-full bg-[var(--surface-active)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" />
              {isAr ? "المستكشف الذكي للباقات" : "Smart Package Finder"}
            </span>
            <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white">
              {currentStep <= totalSteps
                ? (isAr ? "اعثر على الباقة المثالية لفعاليتك" : "Find the Perfect Experience Package")
                : (isAr ? "أفضل الباقات الموصى بها لك" : "Top Recommended Packages for You")
              }
            </h2>
            {currentStep <= totalSteps && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300 rounded-full"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {currentStep} / {totalSteps}
                </span>
              </div>
            )}
          </div>

          {/* Step 1: Occasion */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-300">
                {isAr ? "ما هي المناسبة التي تخطط لها؟" : "1. What kind of event are you planning?"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "BIRTHDAY", icon: "🎂", labelEn: "Birthday Party", labelAr: "حفل عيد ميلاد", descEn: "Private party rooms, hosts & cakes", descAr: "غرف احتفال خاصة، ضيافة وكعكة" },
                  { id: "CORPORATE", icon: "💼", labelEn: "Corporate Team Outing", labelAr: "فعالية شركات وبناء فرق", descEn: "Tactical challenges, buyouts & catering", descAr: "تحديات تكتيكية، حجز حصري وبوفيه" },
                  { id: "SCHOOL", icon: "🎓", labelEn: "School & Nursery Field Trip", labelAr: "رحلة مدرسية أو حضانة", descEn: "STEM lessons & safety marshals", descAr: "تجارب تعليمية ومشرفين سلامة" },
                  { id: "GROUP", icon: "👥", labelEn: "Friends & Family Gathering", labelAr: "تجمع أصدقاء وعائلات", descEn: "Active group play & sports fun", descAr: "مغامرات جماعية وأنشطة حركية" },
                  { id: "SEASONAL", icon: "☀️", labelEn: "Seasonal Camp or Holiday", labelAr: "مخيم صيفي أو عطلة موسمية", descEn: "Weekly passes & skill development", descAr: "اشتراكات أسبوعية وتطوير مهارات" },
                  { id: "EVENTS", icon: "🎪", labelEn: "Large Scale Event / Buyout", labelAr: "فعالية كبرى أو حجز وجهة", descEn: "Mall activations, carnivals & staging", descAr: "تجهيز مهرجانات وإنتاج متكامل" }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setAnswers({ ...answers, occasion: item.id })}
                    className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-start gap-3 ${
                      answers.occasion === item.id
                        ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg ring-1 ring-emerald-500/30"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-white">{isAr ? item.labelAr : item.labelEn}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{isAr ? item.descAr : item.descEn}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Audience */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-300">
                {isAr ? "من هو الجمهور المستهدف للفعالية؟" : "2. Who is this experience for?"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: "KIDS", icon: Smile, labelEn: "Kids (4-12)", labelAr: "الأطفال (٤-١٢)" },
                  { id: "TEENS", icon: Sparkles, labelEn: "Teens (13-17)", labelAr: "الناشئين (١٣-١٧)" },
                  { id: "ADULTS", icon: Award, labelEn: "Adults", labelAr: "الكبار والشباب" },
                  { id: "FAMILIES", icon: Users, labelEn: "Families (All Ages)", labelAr: "العائلات (كافة الأعمار)" },
                  { id: "CORPORATE", icon: Users, labelEn: "Corporate Teams", labelAr: "فرق وموظفي الشركات" },
                  { id: "SCHOOLS", icon: Users, labelEn: "Students & Classes", labelAr: "طلاب المدارس" }
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAnswers({ ...answers, audience: item.id })}
                      className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                        answers.audience === item.id
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow ring-1 ring-emerald-500/30"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold">{isAr ? item.labelAr : item.labelEn}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Guest Count */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-300">
                {isAr ? "كم عدد الضيوف المتوقع حضورهم؟" : "3. How many guests are you expecting?"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "UNDER_15", labelEn: "Up to 15 Guests", labelAr: "حتى ١٥ ضيفاً", descEn: "Intimate party or small team" },
                  { id: "10-25", labelEn: "15 to 30 Guests", labelAr: "١٥ إلى ٣٠ ضيفاً", descEn: "Standard birthday or class outing" },
                  { id: "25-50", labelEn: "30 to 75 Guests", labelAr: "٣٠ إلى ٧٥ ضيفاً", descEn: "Large family or medium company" },
                  { id: "50_PLUS", labelEn: "75+ / Full Buyout", labelAr: "أكثر من ٧٥ / حجز كامل", descEn: "School grade or enterprise day" }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setAnswers({ ...answers, guests: item.id })}
                    className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                      answers.guests === item.id
                        ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow ring-1 ring-emerald-500/30"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="text-sm font-bold text-white">{isAr ? item.labelAr : item.labelEn}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.descEn}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Venue */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-300">
                {isAr ? "أي وجهة أو معلم ترفيهي تفضل؟" : "4. Which venue or attraction do you prefer?"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "ANY", labelEn: "✨ Any / Recommend Best", labelAr: "✨ أي وجهة / اقترح الأفضل", descEn: "Let our algorithm match the best experience" },
                  { id: "INFLATARUN", labelEn: "🏰 InflataRUN Doha", labelAr: "🏰 إنفلاتا ران الدوحة", descEn: "Giant inflatable obstacle dunes and bouncy play" },
                  { id: "URBAN_ARENA", labelEn: "🎯 Urban Arena (Doha Mall)", labelAr: "🎯 أوربان أرينا (الدوحة مول)", descEn: "Tactical laser tag, AR billiards & esports" },
                  { id: "KIDS_CITY", labelEn: "🚗 Kids City Driving", labelAr: "🚗 مدينة قيادة الأطفال", descEn: "Mini electric cars and road safety academy" },
                  { id: "OFFSITE", labelEn: "🎪 Client Venue / Off-Site", labelAr: "🎪 موقع خارجي / موقع العميل", descEn: "Pop-up setups at schools, parks or corporate offices" }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setAnswers({ ...answers, venue: item.id })}
                    className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                      answers.venue === item.id
                        ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow ring-1 ring-emerald-500/30"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="text-sm font-bold text-white">{isAr ? item.labelAr : item.labelEn}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.descEn}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Budget */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-300">
                {isAr ? "ما هي الميزانية التقريبية للفعالية؟" : "5. What is your approximate target budget?"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "LOW", labelEn: "Under 1,500 QAR", labelAr: "أقل من ١,٥٠٠ ر.ق", descEn: "Essential packages & small groups" },
                  { id: "MEDIUM", labelEn: "1,500 - 4,000 QAR", labelAr: "١,٥٠٠ - ٤,٠٠٠ ر.ق", descEn: "Premium party & team building" },
                  { id: "HIGH", labelEn: "4,000+ QAR", labelAr: "أكثر من ٤,٠٠٠ ر.ق", descEn: "VIP all-inclusive or large events" }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setAnswers({ ...answers, budget: item.id })}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      answers.budget === item.id
                        ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow ring-1 ring-emerald-500/30"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                    <div className="text-sm font-bold text-white">{isAr ? item.labelAr : item.labelEn}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.descEn}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Timing Preference */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-300">
                {isAr ? "متى تفضل إقامة الفعالية؟" : "6. When would you like to host this?"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "WEEKEND", labelEn: "Weekend (Fri / Sat)", labelAr: "عطلة نهاية الأسبوع (الجمعة / السبت)" },
                  { id: "WEEKDAY", labelEn: "Weekday (Sun - Thu)", labelAr: "أيام الأسبوع (الأحد - الخميس)" },
                  { id: "HOLIDAY", labelEn: "School Holiday / Eid", labelAr: "الإجازات المدرسية والأعياد" },
                  { id: "FLEXIBLE", labelEn: "Flexible / Planning Ahead", labelAr: "تاريخ مرن / تخطيط مسبق" }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setAnswers({ ...answers, timing: item.id })}
                    className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                      answers.timing === item.id
                        ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow ring-1 ring-emerald-500/30"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-emerald-400 mb-2" />
                    <div className="text-sm font-bold text-white">{isAr ? item.labelAr : item.labelEn}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Results View */}
          {currentStep > totalSteps && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topRecommendations.map((pkg, idx) => (
                  <div
                    key={pkg.id}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
                  >
                    <div>
                      {idx === 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-2">
                          <Check className="w-3 h-3" />
                          {isAr ? "أعلى تطابق ٩٨٪" : "Top Match 98%"}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {isAr ? (pkg.titleAr || pkg.titleEn) : pkg.titleEn}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {isAr ? (pkg.shortDescriptionAr || pkg.shortDescriptionEn) : pkg.shortDescriptionEn}
                      </p>
                      <div className="mt-3 text-xs font-mono font-bold text-slate-300">
                        {isAr ? `يبدأ من ${pkg.startingPrice} ر.ق` : `From QAR ${pkg.startingPrice}`}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          onClose()
                          onSelectPackage(pkg)
                        }}
                        className="w-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      >
                        {isAr ? "طلب حجز واستفسار" : "Request This Package"}
                      </Button>
                      <Link
                        href={`/${locale}/b2c/packages/${pkg.slug}`}
                        onClick={onClose}
                        className="text-center text-[11px] font-semibold text-slate-400 hover:text-white transition-colors"
                      >
                        {isAr ? "عرض التفاصيل الكاملة ←" : "View Full Details →"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Proposal Fallback Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white">
                    {isAr ? "تبحث عن تجربة مخصصة تجمع عدة وجهات؟" : "Looking for a custom multi-attraction package?"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {isAr ? "صمّم باقتك مع فريق تخطيط الفعاليات في إي ثري" : "Our event engineering team can build a custom proposal tailored to your needs."}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose()
                    if (onOpenCustomBuilder) onOpenCustomBuilder()
                  }}
                  className="shrink-0 text-xs font-bold border-purple-500/40 text-purple-300 hover:bg-purple-500/20"
                >
                  {isAr ? "صمّم باقة خاصة" : "Build Custom Proposal"}
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            {currentStep > 1 && currentStep <= totalSteps ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                {isAr ? "السابق" : "Back"}
              </Button>
            ) : currentStep > totalSteps ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-white"
              >
                {isAr ? "إعادة الاستكشاف" : "Start Over"}
              </Button>
            ) : (
              <div />
            )}

            {currentStep <= totalSteps && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {isAr ? "تخطي" : "Skip"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-95 text-slate-950"
                >
                  {currentStep === totalSteps ? (isAr ? "عرض النتائج" : "Show Matches") : (isAr ? "التالي" : "Next")}
                  <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
