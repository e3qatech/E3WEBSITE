"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Scale, ArrowRight, Check, Trash2, ShieldCheck, Clock, Users, Building } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

interface PackageCompareDrawerProps {
  comparedPackages: any[]
  onRemove: (packageId: string) => void
  onClear: () => void
  onSelectForEnquiry: (pkg: any) => void
  locale: string
}

export function PackageCompareDrawer({
  comparedPackages,
  onRemove,
  onClear,
  onSelectForEnquiry,
  locale
}: PackageCompareDrawerProps) {
  const isAr = locale === "ar"
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!comparedPackages || comparedPackages.length === 0) return null

  return (
    <>
      {/* Floating Bottom Bar */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 bg-[var(--surface-default)]/95 backdrop-blur-xl border border-[var(--border-level-2)] rounded-2xl shadow-2xl px-5 py-3.5 flex items-center justify-between gap-4 max-w-xl w-full"
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)]">
                {isAr ? `مقارنة الباقات (${comparedPackages.length}/٣)` : `Compare Packages (${comparedPackages.length}/3)`}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] truncate max-w-[200px] sm:max-w-[280px]">
                {comparedPackages.map(p => isAr ? (p.titleAr || p.titleEn) : p.titleEn).join(", ")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-xs text-[var(--text-tertiary)] hover:text-rose-500 px-2 h-8"
              title={isAr ? "مسح الكل" : "Clear all"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-8 px-4 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5 shadow"
            >
              {isAr ? "مقارنة الآن" : "Compare Now"}
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Full Comparison Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-2xl p-6 md:p-8 text-[var(--text-primary)] my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-6 border-b border-[var(--border-level-1)]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                      {isAr ? "مقارنة باقات E3 الترفيهية" : "E3 Package Comparison Matrix"}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {isAr ? "قارن بين الأسعار، الطاقة الاستيعابية، والميزات المشمولة" : "Compare pricing tiers, duration, guest capacities, and included perks side-by-side"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comparison Table Grid */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-start border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-level-1)]">
                      <th className="p-4 text-xs font-mono uppercase text-[var(--text-secondary)] w-1/4 text-start">
                        {isAr ? "المعيار" : "Feature / Attribute"}
                      </th>
                      {comparedPackages.map(pkg => (
                        <th key={pkg.id} className="p-4 text-start align-top">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-bold text-[var(--text-primary)]">
                                {isAr ? (pkg.titleAr || pkg.titleEn) : pkg.titleEn}
                              </div>
                              <span className="inline-block mt-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                {pkg.category || "PACKAGE"}
                              </span>
                            </div>
                            <button
                              onClick={() => onRemove(pkg.id)}
                              className="text-[var(--text-tertiary)] hover:text-rose-500 p-1 transition-colors"
                              title={isAr ? "إزالة" : "Remove"}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-level-1)] text-xs">
                    {/* Starting Price */}
                    <tr>
                      <td className="p-4 font-semibold text-[var(--text-secondary)]">
                        {isAr ? "السعر التقديري" : "Starting Price"}
                      </td>
                      {comparedPackages.map(pkg => (
                        <td key={pkg.id} className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          {isAr ? `${pkg.startingPrice} ر.ق` : `QAR ${pkg.startingPrice}`}
                          <span className="text-[10px] font-normal text-[var(--text-tertiary)] block">
                            {pkg.priceDisplayMode === "PER_GUEST" ? (isAr ? "لكل ضيف" : "Per guest") : (isAr ? "يبدأ من" : "Starting rate")}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Capacity */}
                    <tr>
                      <td className="p-4 font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        {isAr ? "عدد الضيوف" : "Guest Capacity"}
                      </td>
                      {comparedPackages.map(pkg => (
                        <td key={pkg.id} className="p-4 text-[var(--text-primary)]">
                          {pkg.minGuests} – {pkg.maxGuests} {isAr ? "ضيف" : "guests"}
                        </td>
                      ))}
                    </tr>

                    {/* Duration */}
                    <tr>
                      <td className="p-4 font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        {isAr ? "المدة الزمنية" : "Session Duration"}
                      </td>
                      {comparedPackages.map(pkg => (
                        <td key={pkg.id} className="p-4 text-[var(--text-primary)]">
                          {pkg.durationMinutes} {isAr ? "دقيقة" : "minutes"}
                        </td>
                      ))}
                    </tr>

                    {/* Venue & Location */}
                    <tr>
                      <td className="p-4 font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        {isAr ? "الوجهة الترفيهية" : "Venue / Attraction"}
                      </td>
                      {comparedPackages.map(pkg => (
                        <td key={pkg.id} className="p-4 text-[var(--text-primary)]">
                          {pkg.attraction ? (isAr ? pkg.attraction.nameAr : pkg.attraction.nameEn) : (isAr ? "وجهات E3 المتعددة" : "E3 Multi-Venue")}
                        </td>
                      ))}
                    </tr>

                    {/* Inclusions count & top perks */}
                    <tr>
                      <td className="p-4 font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        {isAr ? "الميزات المشمولة" : "Included Perks"}
                      </td>
                      {comparedPackages.map(pkg => {
                        const inclusions = Array.isArray(pkg.inclusions) ? pkg.inclusions : []
                        return (
                          <td key={pkg.id} className="p-4 space-y-1.5">
                            {inclusions.slice(0, 4).map((inc: any, i: number) => (
                              <div key={i} className="flex items-center gap-1.5 text-[var(--text-primary)]">
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="line-clamp-1">{isAr ? (inc.titleAr || inc.titleEn) : inc.titleEn}</span>
                              </div>
                            ))}
                            {inclusions.length > 4 && (
                              <div className="text-[10px] text-[var(--text-tertiary)] italic">
                                {isAr ? `+ ${inclusions.length - 4} ميزات إضافية` : `+ ${inclusions.length - 4} more perks`}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>

                    {/* Action Row */}
                    <tr>
                      <td className="p-4 font-semibold text-[var(--text-secondary)]">
                        {isAr ? "الإجراء" : "Actions"}
                      </td>
                      {comparedPackages.map(pkg => (
                        <td key={pkg.id} className="p-4 space-y-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setIsModalOpen(false)
                              onSelectForEnquiry(pkg)
                            }}
                            className="w-full text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            {isAr ? "طلب حجز" : "Book Package"}
                          </Button>
                          <Link
                            href={`/${locale}/b2c/packages/${pkg.slug}`}
                            onClick={() => setIsModalOpen(false)}
                            className="block text-center text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          >
                            {isAr ? "عرض التفاصيل ←" : "View Details →"}
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
