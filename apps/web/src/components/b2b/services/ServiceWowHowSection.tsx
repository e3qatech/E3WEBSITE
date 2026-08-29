"use client";

import React, { useState } from "react";
import { Sparkles, Cog, CheckCircle2 } from "lucide-react";
import { WowHowItem } from "@/lib/services/canonical-services";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { cn } from "@/lib/utils";

interface ServiceWowHowSectionProps {
  items: WowHowItem[];
  locale: string;
}

export function ServiceWowHowSection({ items, locale }: ServiceWowHowSectionProps) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"SPLIT" | "WOW_ONLY" | "HOW_ONLY">("SPLIT");

  if (!items || items.length === 0) return null;

  const activePillar = items[activeTab] || items[0];

  return (
    <section id="wow-how-section" className="py-24 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "فلسفة إي ثري للتنفيذ" : "The E3 Execution Formula"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-4">
              {isAr ? "الإبهار الحسي والتنفيذ الهندسي (WOW & HOW)" : "The WOW & HOW: Creative Magic Meets Operational Rigor."}
            </h2>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              {isAr
                ? "نحن لا نكتفي برسم الأفكار الإبداعية، بل نهندس أدق التفاصيل التشغيلية وراء الكواليس لضمان تجارب استثنائية."
                : "Great experiences require two synchronized dimensions: the emotional wonder felt by the guest, and the uncompromising engineering that powers it from behind the scenes."}
            </p>
          </div>

          {/* Interactive View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs shrink-0">
            <button
              onClick={() => setViewMode("SPLIT")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                viewMode === "SPLIT"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {isAr ? "مقارنة متوازية" : "Split Comparison"}
            </button>
            <button
              onClick={() => setViewMode("WOW_ONLY")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                viewMode === "WOW_ONLY"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {isAr ? "الإبهار (WOW)" : "WOW Focus"}
            </button>
            <button
              onClick={() => setViewMode("HOW_ONLY")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                viewMode === "HOW_ONLY"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {isAr ? "الهندسة (HOW)" : "HOW Focus"}
            </button>
          </div>
        </div>

        {/* Pillar Selection Tabs */}
        {items.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border-level-2)] pb-4">
            {items.map((item, idx) => (
              <button
                key={item.id || idx}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer",
                  activeTab === idx
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-[var(--surface-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]"
                )}
              >
                {isAr ? item.titleAr : item.titleEn}
              </button>
            ))}
          </div>
        )}

        {/* Dual Comparison Container */}
        {activePillar && (
          <div className={cn(
            "grid gap-8 transition-all duration-500",
            viewMode === "SPLIT" ? "md:grid-cols-2" : "grid-cols-1"
          )}>
            {/* The WOW Card */}
            {(viewMode === "SPLIT" || viewMode === "WOW_ONLY") && (
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-emerald-950/20 via-[var(--surface-default)] to-[var(--surface-default)] border-2 border-emerald-500/30 shadow-md flex flex-col justify-between overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block">
                        {isAr ? "التجربة الظاهرة للجمهور" : "What The Guest Experiences"}
                      </span>
                      <h3 className="text-2xl font-black text-[var(--text-primary)]">
                        {isAr ? "الإبهار واللحظات الاستثنائية (THE WOW)" : "The Emotional Wonder (WOW)"}
                      </h3>
                    </div>
                  </div>

                  {activePillar.wowMediaUrl && (
                    <div className="mb-6 rounded-2xl overflow-hidden aspect-video bg-[var(--surface-raised)] border border-emerald-500/20">
                      <UniversalMediaRenderer
                        type={activePillar.wowMediaType || "IMAGE"}
                        src={activePillar.wowMediaUrl}
                        alt="WOW Experience"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}

                  <p className="text-base sm:text-lg text-[var(--text-primary)] font-medium leading-relaxed mb-6">
                    {isAr ? activePillar.wowAr : activePillar.wowEn}
                  </p>
                </div>

                <div className="pt-6 border-t border-[var(--border-level-2)]/60 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {isAr
                      ? activePillar.verifiedOutcomeAr || "تصميم يعزز الارتباط العاطفي والمشاركة الرقمية"
                      : activePillar.verifiedOutcomeEn || "Engineered for maximum audience engagement & shareability"}
                  </span>
                </div>
              </div>
            )}

            {/* The HOW Card */}
            {(viewMode === "SPLIT" || viewMode === "HOW_ONLY") && (
              <div className="relative p-8 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-md flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-200 flex items-center justify-center font-black text-lg shadow-sm">
                      <Cog className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                        {isAr ? "الهندسة والتشغيل وراء الكواليس" : "Behind The Scenes Delivery"}
                      </span>
                      <h3 className="text-2xl font-black text-[var(--text-primary)]">
                        {isAr ? "الهندسة والانضباط التشغيلي (THE HOW)" : "The Operational Engine (HOW)"}
                      </h3>
                    </div>
                  </div>

                  {activePillar.howMediaUrl && (
                    <div className="mb-6 rounded-2xl overflow-hidden aspect-video bg-[var(--surface-raised)] border border-[var(--border-level-2)]">
                      <UniversalMediaRenderer
                        type={activePillar.howMediaType || "IMAGE"}
                        src={activePillar.howMediaUrl}
                        alt="HOW Engineering"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-6 font-medium">
                    {isAr ? activePillar.howAr : activePillar.howEn}
                  </p>
                </div>

                <div className="pt-6 border-t border-[var(--border-level-2)]/60 flex items-center gap-2 text-xs font-semibold text-[var(--text-tertiary)]">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    {isAr
                      ? "معايير سلامة، كوادر مدربة، وأنظمة تحكم دقيقة"
                      : "Strict safety protocols, redundancy systems & SOP execution"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
