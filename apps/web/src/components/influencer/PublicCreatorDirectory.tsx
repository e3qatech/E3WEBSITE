"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  ArrowRight,
  ArrowLeft,
  MapPin,
  ExternalLink,
  Users,
  CheckCircle2,
  Filter,
  Share2,
} from "lucide-react";

export interface PublicCreator {
  id: string;
  displayName: string;
  slug: string;
  profileImage: string | null;
  bioEn: string | null;
  bioAr: string | null;
  categories: string[];
  languages: string[];
  isQatarBased: boolean;
  creatorTier: string;
  platforms: {
    platform: string;
    handle: string;
    profileUrl: string;
    followerCount: number;
  }[];
}

export function PublicCreatorDirectory({
  creators,
  locale,
}: {
  creators: PublicCreator[];
  locale: string;
}) {
  const isAr = locale === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [qatarOnly, setQatarOnly] = useState(false);

  const categories = [
    { value: "ALL", labelEn: "All Creators", labelAr: "جميع المؤثرين" },
    { value: "LIFESTYLE", labelEn: "Lifestyle", labelAr: "أسلوب حياة" },
    { value: "ENTERTAINMENT", labelEn: "Entertainment", labelAr: "ترفيه وفعاليات" },
    { value: "FAMILY", labelEn: "Family & Kids", labelAr: "عائلة وأطفال" },
    { value: "FOOD_DINING", labelEn: "Food & Dining", labelAr: "مطاعم وضيافة" },
    { value: "TRAVEL_TOURISM", labelEn: "Travel & Culture", labelAr: "سياحة وثقافة" },
    { value: "GAMING_ESPORTS", labelEn: "Gaming & Esports", labelAr: "ألعاب ورياضات إلكترونية" },
  ];

  const filteredCreators = useMemo(() => {
    return creators.filter((c) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (c.displayName || "").toLowerCase().includes(q);
        const matchBio =
          (c.bioEn || "").toLowerCase().includes(q) || (c.bioAr || "").toLowerCase().includes(q);
        const matchHandle = c.platforms.some((p) => p.handle.toLowerCase().includes(q));
        if (!matchName && !matchBio && !matchHandle) return false;
      }

      // Category filter
      if (selectedCategory !== "ALL") {
        if (!c.categories.includes(selectedCategory)) return false;
      }

      // Qatar based filter
      if (qatarOnly && !c.isQatarBased) {
        return false;
      }

      return true;
    });
  }, [creators, searchQuery, selectedCategory, qatarOnly]);

  const formatFollowers = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-10">
      {/* Search & Filter Control Hub */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Live Search Input */}
          <div className="relative w-full flex-1">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? "ابحث بالاسم، المعرّف، أو الاهتمام..."
                  : "Search creators by name, handle, or category..."
              }
              className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)] transition placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* Qatar Based Filter Toggle */}
          <button
            type="button"
            onClick={() => setQatarOnly(!qatarOnly)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 border ${
              qatarOnly
                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-md shadow-[var(--color-accent)]/20"
                : "bg-[var(--bg-level-1)] text-[var(--text-muted)] border-[var(--border-level-2)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span>🇶🇦</span>
            <span>{isAr ? "صناع محتوى قطر فقط" : "Qatar-Based Only"}</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 ${
                  isSelected
                    ? "bg-[var(--color-accent)] text-white shadow-sm"
                    : "bg-[var(--bg-level-1)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-level-2)]"
                }`}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-[var(--text-muted)]">
        <span>
          {isAr
            ? `عرض ${filteredCreators.length} من صناع المحتوى المعتمدين`
            : `Showing ${filteredCreators.length} verified creators`}
        </span>

        <Link
          href={`/${locale}/creators/apply`}
          className="text-[var(--color-accent)] hover:underline flex items-center gap-1 font-bold"
        >
          <span>{isAr ? "انضم كصانع محتوى" : "Join the Collective"}</span>
          {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
        </Link>
      </div>

      {/* Featured Creators Grid */}
      {filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] flex flex-col justify-between space-y-5 hover:border-[var(--color-accent)]/50 transition-all duration-200 group shadow-sm hover:shadow-xl hover:shadow-[var(--color-accent)]/5"
            >
              <div>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/20 via-[var(--color-accent)]/5 to-[var(--bg-level-3)] border border-[var(--color-accent)]/20 flex items-center justify-center text-lg font-black text-[var(--color-accent)] overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition">
                    {c.profileImage ? (
                      <img
                        src={c.profileImage}
                        alt={c.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      c.displayName.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--color-accent)] transition">
                        {c.displayName}
                      </h3>
                      {c.isQatarBased && (
                        <span className="text-xs shrink-0" title="Based in Qatar">
                          🇶🇦
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] font-mono text-[10px] font-bold text-[var(--color-accent)]">
                        {c.creatorTier || "CREATOR"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-[var(--text-secondary)] mt-4 line-clamp-3 leading-relaxed">
                  {isAr ? c.bioAr || c.bioEn : c.bioEn || "E3 Official Creative Ambassador"}
                </p>
              </div>

              {/* Categories & Social Channels */}
              <div className="space-y-4 pt-4 border-t border-[var(--border-level-1)]">
                {/* Category Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {c.categories?.slice(0, 3).map((cat) => (
                    <span
                      key={cat}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[10px] font-semibold text-[var(--text-muted)]"
                    >
                      {cat.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>

                {/* Platforms & Follower Counts */}
                {c.platforms?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {c.platforms.map((p) => (
                      <a
                        key={p.platform}
                        href={p.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-level-1)] hover:bg-[var(--color-accent)]/10 border border-[var(--border-level-2)] text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--color-accent)] transition"
                      >
                        <span className="font-bold">@{p.handle}</span>
                        {p.followerCount > 0 && (
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            ({formatFollowers(p.followerCount)})
                          </span>
                        )}
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] max-w-lg mx-auto space-y-4">
          <Filter className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {isAr ? "لم نجد صناع محتوى يطابقون خيارات البحث" : "No Creators Match Your Filters"}
          </h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {isAr
              ? "جرب إزالة بعض الفلاتر أو تغيير كلمة البحث للاطلاع على صناع المحتوى المتاحين."
              : "Try clearing your search query or selecting another category."}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setQatarOnly(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 transition shadow-md"
            >
              {isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
