"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowRight, Sparkles, Building2, Calendar, Layers, Trophy } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { cn } from "@/lib/utils";

export interface CaseStudyCardItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  clientName?: string;
  year?: number;
  category?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  heroImageUrl?: string;
  thumbnailUrl?: string;
  heroMediaType?: string;
  thumbnailMediaType?: string;
  clientLogoUrl?: string;
  metrics?: any;
  servicesUsed?: any;
}

export interface CaseStudyArchiveGridProps {
  config: {
    enabled?: boolean;
    titleEn?: string;
    titleAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
  };
  caseStudies: CaseStudyCardItem[];
  locale: string;
}

export function CaseStudyArchiveGrid({
  config,
  caseStudies,
  locale,
}: CaseStudyArchiveGridProps) {
  const isAr = locale === "ar";

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Categories derived dynamically from case studies
  const categories = useMemo(() => {
    const set = new Set<string>();
    caseStudies.forEach((cs) => {
      if (cs.category) set.add(cs.category.trim());
    });
    return Array.from(set).filter(Boolean);
  }, [caseStudies]);

  // Years derived dynamically
  const years = useMemo(() => {
    const set = new Set<number>();
    caseStudies.forEach((cs) => {
      if (cs.year) set.add(Number(cs.year));
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [caseStudies]);

  // Filtered case studies
  const filteredCases = useMemo(() => {
    return caseStudies.filter((cs) => {
      const title = isAr ? cs.titleAr || cs.titleEn : cs.titleEn;
      const matchesSearch =
        !searchQuery ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cs.clientName &&
          cs.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (cs.category &&
          cs.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === "ALL" || cs.category === selectedCategory;
      const matchesYr =
        selectedYear === "ALL" || (cs.year && cs.year.toString() === selectedYear);

      return matchesSearch && matchesCat && matchesYr;
    });
  }, [caseStudies, selectedCategory, selectedYear, searchQuery, isAr]);

  if (config?.enabled === false) return null;

  return (
    <section id="archive" className="relative bg-zinc-950">
      {/* Sticky Interactive Filter Bar */}
      <div className="py-6 bg-zinc-950/85 sticky top-16 z-30 backdrop-blur-xl border-y border-zinc-900 shadow-xl">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Tabs Container */}
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[var(--surface-default)]/90 backdrop-blur-md border border-[var(--border-level-2)] shadow-md overflow-x-auto max-w-full no-scrollbar py-1.5">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0",
                  selectedCategory === "ALL"
                    ? "font-black bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                )}
              >
                {isAr ? "جميع المشاريع" : "All Projects"} ({caseStudies.length})
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0",
                    selectedCategory === cat
                      ? "font-black bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search & Year Select */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {years.length > 0 && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-zinc-900/90 border border-zinc-800 rounded-full px-4 py-2 text-xs font-mono text-zinc-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
                  aria-label="Filter by Year"
                >
                  <option value="ALL">
                    {isAr ? "كافة السنوات" : "All Years"}
                  </option>
                  {years.map((y) => (
                    <option key={y} value={y.toString()}>
                      {y}
                    </option>
                  ))}
                </select>
              )}

              <div className="relative flex-1 lg:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isAr
                      ? "ابحث باسم المشروع أو العميل..."
                      : "Search project or client..."
                  }
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-full ps-10 pe-4 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Result Counter */}
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-3 border-t border-zinc-900/60 mt-3">
            <span>
              {isAr
                ? `عرض ${filteredCases.length} من أصل ${caseStudies.length} مشروعاً موثقاً`
                : `Showing ${filteredCases.length} of ${caseStudies.length} Landmark Projects`}
            </span>
            {(selectedCategory !== "ALL" || selectedYear !== "ALL" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedYear("ALL");
                  setSearchQuery("");
                }}
                className="text-emerald-400 hover:underline cursor-pointer"
              >
                {isAr ? "إعادة ضبط التصفية" : "Reset Filters"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Display */}
      <div className="py-16 md:py-24 border-b border-zinc-900">
        <div className="container mx-auto px-4 md:px-8">
          {filteredCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCases.map((cs) => {
                const title = isAr ? cs.titleAr || cs.titleEn : cs.titleEn;
                const mediaUrl = cs.heroImageUrl || cs.thumbnailUrl || "";
                const mediaType =
                  cs.thumbnailMediaType || cs.heroMediaType || "IMAGE";
                const firstMetric =
                  Array.isArray(cs.metrics) && cs.metrics.length > 0
                    ? cs.metrics[0]
                    : null;

                return (
                  <Link
                    key={cs.id}
                    href={`/${locale}/b2b/cases/${cs.slug}`}
                    className="group relative rounded-3xl bg-zinc-900/50 border border-zinc-800/80 hover:border-emerald-500/60 transition-all duration-500 overflow-hidden flex flex-col justify-between p-7 backdrop-blur-md min-h-[420px] hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]"
                  >
                    {/* Media Thumbnail with hover zoom */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      {mediaUrl ? (
                        <UniversalMediaRenderer
                          type={mediaType as any}
                          src={mediaUrl}
                          alt={title}
                          className="w-full h-full object-cover filter brightness-[0.65] group-hover:brightness-[0.8] group-hover:scale-105 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center">
                          <Trophy className="w-12 h-12 text-zinc-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 via-transparent to-transparent" />
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {cs.category && (
                            <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-zinc-950/80 text-emerald-400 border border-emerald-500/30 rounded-full backdrop-blur-md flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              <span>{cs.category}</span>
                            </span>
                          )}
                          {cs.isFeatured && (
                            <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full backdrop-blur-md flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>FEATURED</span>
                            </span>
                          )}
                        </div>

                        {cs.year && (
                          <span className="px-3 py-1 text-xs font-mono font-bold text-zinc-300 bg-zinc-950/80 border border-zinc-800 rounded-full backdrop-blur-md flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-emerald-400" />
                            <span>{cs.year}</span>
                          </span>
                        )}
                      </div>

                      {/* Bottom Info */}
                      <div className="mt-auto pt-10">
                        {cs.clientName && (
                          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{cs.clientName}</span>
                          </div>
                        )}

                        <h3 className="text-2xl font-black font-syne text-zinc-100 tracking-tight mb-3 group-hover:text-emerald-400 transition-colors leading-snug">
                          {title}
                        </h3>

                        {firstMetric && (
                          <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold mb-4">
                            <span>
                              {firstMetric.valueEn || firstMetric.value}
                            </span>
                            <span>•</span>
                            <span>
                              {isAr
                                ? firstMetric.labelAr ||
                                  firstMetric.labelEn ||
                                  firstMetric.label
                                : firstMetric.labelEn || firstMetric.label}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest opacity-80 group-hover:opacity-100 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-all duration-300 pt-3 border-t border-zinc-800/80">
                          <span>
                            {isAr
                              ? "عرض دراسة الحالة كاملة"
                              : "Read Full Case Study"}
                          </span>
                          <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Localized Empty State */
            <div className="text-center py-24 border border-zinc-800/80 rounded-3xl bg-zinc-900/20 max-w-2xl mx-auto p-8">
              <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold font-syne text-zinc-200 mb-2">
                {isAr
                  ? "لم يتم العثور على مشاريع تطابق البحث"
                  : "No Projects Found"}
              </h4>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                {isAr
                  ? "جرّب تغيير فئة العرض أو تعديل كلمات البحث لاستكشاف مشاريع إي ثري الأخرى."
                  : "Try clearing your filters or changing your search terms to explore other E3 landmark projects."}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedYear("ALL");
                  setSearchQuery("");
                }}
                className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {isAr ? "مسح التصفية" : "Clear All Filters"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
