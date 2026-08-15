"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react"

interface BrandItem {
  id: string
  nameEn: string
  nameAr: string
  taglineEn?: string | null
  taglineAr?: string | null
  brandType?: string | null
  logoUrl?: string | null
  websiteUrl?: string | null
  slug?: string | null
}

interface BrandPlacementShowcaseProps {
  brandPlacements?: any[] | null
  locale?: string
}

export function BrandPlacementShowcase({ brandPlacements, locale = "en" }: BrandPlacementShowcaseProps) {
  if (!Array.isArray(brandPlacements) || brandPlacements.length === 0) return null

  const isAr = locale === "ar"

  return (
    <section className="py-24 bg-[var(--bg-level-1)] text-[var(--text-primary)] relative overflow-hidden border-t border-[var(--border-level-2)]" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-mono font-bold uppercase tracking-widest mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "العلامات التجارية والتجارب المعتمدة" : "POWERED BY E3 BRANDS & IP"}</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)] uppercase">
              {isAr ? "العلامات التجارية الشريكة" : "Featured Brands & IP Concepts"}
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] max-w-md font-normal">
            {isAr
              ? "مفهوم ترفيهي مرخص ومصمم عالمياً بلمسة هندسية فريدة لتقديم تجارب لا تُنسى."
              : "World-class engineered entertainment concepts operating under exclusive E3 Qatar licensing."}
          </p>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brandPlacements.map((bp: any, idx: number) => {
            const b: BrandItem = bp.brand || bp
            if (!b) return null

            const name = isAr ? (b.nameAr || b.nameEn) : (b.nameEn || b.nameAr)
            const tagline = isAr ? (b.taglineAr || b.taglineEn) : (b.taglineEn || b.taglineAr)

            return (
              <motion.div
                key={b.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] border border-[var(--border-level-2)] hover:border-purple-500/40 rounded-3xl p-8 backdrop-blur-xl transition-all duration-500 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Brand Header & Logo */}
                  <div className="flex items-center justify-between gap-4">
                    {b.logoUrl ? (
                      <div className="w-16 h-16 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] p-2.5 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                        <img src={b.logoUrl} alt={name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-2xl shrink-0">
                        {name.charAt(0)}
                      </div>
                    )}

                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-emerald-600 dark:text-emerald-400 shadow-sm">
                      {b.brandType || "OFFICIAL IP"}
                    </span>
                  </div>

                  {/* Brand Title & Tagline */}
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                      {name}
                    </h3>
                    {tagline && (
                      <p className="text-xs text-[var(--text-secondary)] mt-2 font-normal leading-relaxed line-clamp-2">
                        {tagline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Badge */}
                <div className="pt-6 mt-6 border-t border-[var(--border-level-2)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-secondary)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isAr ? "علامة تجارية معتمدة" : "E3 Verified IP"}</span>
                  </span>
                  {b.slug && (
                    <Link
                      href={`/${locale}/b2c/brands/${b.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors"
                    >
                      <span>{isAr ? "التفاصيل" : "Explore IP"}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
                    </Link>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
