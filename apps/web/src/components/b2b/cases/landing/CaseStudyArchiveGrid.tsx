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
  challengeEn?: string;
  challengeAr?: string;
  solutionEn?: string;
  solutionAr?: string;
  resultEn?: string;
  resultAr?: string;
  metrics?: any;
  servicesUsed?: any;
  [key: string]: any;
}

export interface CaseStudyArchiveGridProps {
  config?: {
    enabled?: boolean;
    titleEn?: string;
    titleAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    displayOrder?: string;
    selectedCaseStudyIds?: string[];
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

  // Filtered and sorted case studies
  const filteredCases = useMemo(() => {
    let list = caseStudies.filter((cs) => {
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

    if (
      config?.displayOrder === "MANUAL" &&
      Array.isArray(config?.selectedCaseStudyIds) &&
      config.selectedCaseStudyIds.length > 0
    ) {
      const idOrder = new Map(config.selectedCaseStudyIds.map((id, idx) => [String(id), idx]));
      list = [...list].sort((a, b) => {
        const orderA = idOrder.has(String(a.id)) ? (idOrder.get(String(a.id)) as number) : 999;
        const orderB = idOrder.has(String(b.id)) ? (idOrder.get(String(b.id)) as number) : 999;
        return orderA - orderB;
      });
    } else if (config?.displayOrder === "NEWEST_FIRST") {
      list = [...list].sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
    } else {
      // FEATURED_FIRST default
      list = [...list].sort((a, b) => {
        if (Boolean(b.isFeatured) !== Boolean(a.isFeatured)) {
          return b.isFeatured ? 1 : -1;
        }
        return (Number(b.year) || 0) - (Number(a.year) || 0);
      });
    }

    return list;
  }, [caseStudies, selectedCategory, selectedYear, searchQuery, isAr, config?.displayOrder, config?.selectedCaseStudyIds]);

  if (config?.enabled === false) return null;

  return (
    <section id="archive" className="relative bg-[var(--bg-level-1)] transition-colors">
      {/* Sticky Interactive Filter Bar */}
      <div className="py-6 bg-[var(--bg-level-1)]/90 sticky top-16 z-30 backdrop-blur-xl border-y border-[var(--border-level-1)] shadow-sm">
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
                  className="bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-full px-4 py-2 text-xs font-mono text-[var(--text-primary)] focus:border-emerald-500 focus:outline-none cursor-pointer shadow-xs"
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

              <div className="relative flex-1 lg:w-64">
                <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute top-1/2 start-3.5 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    isAr ? "ابحث بالاسم أو العميل..." : "Search project, client..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-full py-2 ps-9 pe-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-emerald-500 focus:outline-none transition-colors shadow-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="container mx-auto px-4 md:px-8 py-20">
        {filteredCases.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-[var(--border-level-2)] rounded-3xl p-8 bg-[var(--surface-default)]/50">
            <Trophy className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-xl font-bold font-syne text-[var(--text-primary)] mb-2">
              {isAr ? "لم نجد نتائج مطابقة" : "No Case Studies Found"}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
              {isAr
                ? "جرب إعادة تعيين الفلاتر أو استخدام كلمات بحث أخرى."
                : "Try resetting your filters or search for different keywords."}
            </p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSelectedYear("ALL");
                setSearchQuery("");
              }}
              className="px-6 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors"
            >
              {isAr ? "إعادة تعيين الفلاتر" : "Reset All Filters"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-xs font-mono font-medium text-[var(--text-tertiary)] flex items-center justify-between">
              <span>
                {isAr
                  ? `عرض ${filteredCases.length} من أصل ${caseStudies.length} مشروعاً موثقاً`
                  : `Showing ${filteredCases.length} of ${caseStudies.length} Landmark Projects`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCases.map((cs) => {
              const title = isAr
                ? cs.titleAr || cs.titleEn || cs.slug
                : cs.titleEn || cs.slug;
              const mediaUrl =
                cs.thumbnailUrl || cs.heroImageUrl;
              const mediaType =
                cs.thumbnailMediaType || cs.heroMediaType || "IMAGE";
              const firstMetric =
                Array.isArray(cs.metrics) && cs.metrics.length > 0
                  ? cs.metrics[0]
                  : cs.metrics && typeof cs.metrics === "object"
                  ? Object.entries(cs.metrics).map(([k, v]) => ({
                      labelEn: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
                      labelAr: k,
                      valueEn: String(v),
                      valueAr: String(v),
                    }))[0]
                  : null;

              return (
                <Link
                  key={cs.id}
                  href={`/${locale}/b2b/case-studies/${cs.slug}`}
                  className="group relative rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-emerald-500/60 transition-all duration-500 overflow-hidden flex flex-col justify-between p-7 backdrop-blur-md min-h-[420px] shadow-xs hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]"
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
                      <div className="w-full h-full bg-gradient-to-br from-[var(--bg-level-1)] to-[var(--bg-level-2)] flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-[var(--text-tertiary)]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-[var(--surface-default)]/75 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--surface-default)]/40 via-transparent to-transparent" />
                  </div>

                  {/* Content Overlay */}
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {cs.category && (
                          <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-[var(--surface-default)]/90 text-emerald-500 border border-emerald-500/30 rounded-full backdrop-blur-md flex items-center gap-1 shadow-xs">
                            <Layers className="w-3 h-3" />
                            <span>{cs.category}</span>
                          </span>
                        )}
                        {cs.isFeatured && (
                          <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-full backdrop-blur-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>FEATURED</span>
                          </span>
                        )}
                      </div>

                      {cs.year && (
                        <span className="px-3 py-1 text-xs font-mono font-bold text-[var(--text-primary)] bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-xs">
                          <Calendar className="w-3 h-3 text-emerald-500" />
                          <span>{cs.year}</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Info */}
                    <div className="mt-auto pt-10">
                      {cs.clientName && (
                        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] mb-2">
                          <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{cs.clientName}</span>
                        </div>
                      )}

                      <h3 className="text-2xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-3 group-hover:text-emerald-500 transition-colors leading-snug">
                        {title}
                      </h3>

                      {firstMetric && (
                        <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono font-bold mb-4">
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

                      <div className="inline-flex items-center gap-2 text-xs font-syne font-bold uppercase tracking-wider text-emerald-500 group-hover:text-emerald-600 transition-colors">
                        <span>
                          {isAr
                            ? "استكشف تفاصيل المشروع"
                            : "Explore Case Study"}
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
