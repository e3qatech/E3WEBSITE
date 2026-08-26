"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, MapPin, Compass, Ticket } from "lucide-react";
import { formatLocalizedText, cn } from "@/lib/utils";
import { localizeHref } from "@/lib/url-helper";

export interface SisterAttractionItem {
  id: string;
  slug: string;
  nameEn: string;
  nameAr?: string | null;
  taglineEn?: string | null;
  taglineAr?: string | null;
  heroThumbnailUrl?: string | null;
  heroMediaUrl?: string | null;
  heroFallbackUrl?: string | null;
  experienceFormat?: string | null;
  entityType?: string | null;
  isFeatured?: boolean;
}

interface ExploreAttractionsSectionProps {
  currentSlug: string;
  attractions: SisterAttractionItem[];
  titleEn?: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
  locale?: string;
}

export function ExploreAttractionsSection({
  currentSlug,
  attractions,
  titleEn = "Explore Other E3 Entertainment Worlds",
  titleAr = "استكشف المزيد من وجهات إي ثري الترفيهية",
  subtitleEn = "Discover our sister theme parks, kinetic adventure arenas, and immersive family attractions across Qatar.",
  subtitleAr = "استكشف مدن الألعاب الترفيهية الأخرى، ومناطق المغامرة الحركية، والفعاليات العائلية في قطر.",
  locale = "en",
}: ExploreAttractionsSectionProps) {
  const isAr = locale === "ar";

  // Filter out the current attraction
  const sisterAttractions = React.useMemo(() => {
    if (!Array.isArray(attractions)) return [];
    return attractions.filter((a) => a && a.slug !== currentSlug && a.slug !== `${currentSlug}-doha`);
  }, [attractions, currentSlug]);

  if (sisterAttractions.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-[var(--surface-default)] border-t border-[var(--border-level-2)] relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Accent Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
              <Compass className="w-3.5 h-3.5" />
              <span>{isAr ? "اكتشف المزيد من الوجهات" : "MORE E3 ATTRACTIONS"}</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight uppercase">
              {isAr ? titleAr : titleEn}
            </h2>
            <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
              {isAr ? subtitleAr : subtitleEn}
            </p>
          </div>

          <Link
            href={localizeHref("/b2c/attractions", locale)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--surface-hover)] hover:bg-[var(--border-level-2)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer self-start md:self-end"
          >
            <span>{isAr ? "عرض كافة الوجهات" : "View All Attractions"}</span>
            <ArrowRight className={cn("w-4 h-4 text-emerald-500", isAr && "rotate-180")} />
          </Link>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sisterAttractions.slice(0, 3).map((item, idx) => {
            const name = isAr ? item.nameAr || item.nameEn : item.nameEn || item.nameAr;
            const tagline = isAr ? item.taglineAr || item.taglineEn : item.taglineEn || item.taglineAr;
            const image = item.heroThumbnailUrl || item.heroMediaUrl || item.heroFallbackUrl || "/hero-bg.png";
            const targetUrl = localizeHref(`/b2c/attractions/${item.slug}`, locale);

            return (
              <motion.div
                key={item.id || item.slug || idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Link
                  href={targetUrl}
                  className="group relative block aspect-[16/11] rounded-[2rem] overflow-hidden bg-[var(--surface-hover)] border border-[var(--border-level-2)] hover:border-emerald-500/50 transition-all duration-500 shadow-xl"
                >
                  {/* Background Image with Hover Zoom */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={image}
                      alt={name || "Attraction"}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-black/20 z-10" />
                  </div>

                  {/* Top Badge Pill */}
                  <div className="absolute top-5 start-5 z-20 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 shadow-sm">
                      {item.experienceFormat ? item.experienceFormat.replace("_", " ") : "ENTERTAINMENT"}
                    </span>
                    {item.isFeatured && (
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/40 backdrop-blur-md border border-purple-400/30 text-[9px] font-mono font-bold uppercase tracking-wider text-purple-200">
                        ⭐ {isAr ? "مميز" : "FEATURED"}
                      </span>
                    )}
                  </div>

                  {/* Bottom Content Area */}
                  <div className="absolute bottom-0 inset-x-0 p-6 z-20 flex items-end justify-between gap-4">
                    <div className="space-y-1.5 max-w-[80%]">
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors leading-tight">
                        {name}
                      </h3>
                      {tagline && (
                        <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                          {tagline}
                        </p>
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0">
                      <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
