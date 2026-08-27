"use client";

import React, { useState } from "react";
import { Sparkles, Cog, CheckCircle2, ArrowRight } from "lucide-react";
import { WowHowItem } from "@/lib/services/canonical-services";
import { cn } from "@/lib/utils";

interface ServiceWowHowSectionProps {
  items: WowHowItem[];
  locale: string;
}

export function ServiceWowHowSection({ items, locale }: ServiceWowHowSectionProps) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!items || items.length === 0) return null;

  return (
    <section className="py-20 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {isAr ? "فلسفة إي ثري للتنفيذ" : "The E3 Execution Formula"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-4">
            {isAr ? "الإبهار الحسي والتنفيذ الهندسي (WOW & HOW)" : "The WOW & HOW: Creative Magic Meets Operational Rigor."}
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            {isAr
              ? "نحن لا نكتفي برسم الأفكار الإبداعية، بل نهندس أدق التفاصيل التشغيلية وراء الكواليس لضمان تجارب استثنائية."
              : "Great experiences require two synchronized dimensions: the emotional wonder felt by the guest, and the uncompromising engineering that powers it from behind the scenes."}
          </p>
        </div>

        {/* Tab Selection for Multiple WOW & HOW Pillars */}
        {items.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border-level-2)] pb-4">
            {items.map((item, idx) => (
              <button
                key={item.id || idx}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer",
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

        {/* Active WOW & HOW Dual Comparison Container */}
        {items[activeTab] && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* The WOW Card (The Guest Experience & Emotional Impact) */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-[var(--surface-default)] to-[var(--surface-default)] border-2 border-emerald-500/30 shadow-md flex flex-col justify-between overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block">
                      {isAr ? "التجربة الظاهرة للجمهور" : "What The Guest Experiences"}
                    </span>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                      {isAr ? "الإبهار واللحظات الاستثنائية (THE WOW)" : "The Emotional Wonder (WOW)"}
                    </h3>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-[var(--text-primary)] font-medium leading-relaxed mb-6">
                  {isAr ? items[activeTab].wowAr : items[activeTab].wowEn}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-level-2)]/60 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                {isAr ? "تصميم يعزز الارتباط العاطفي والمشاركة الرقمية" : "Engineered for maximum audience engagement & shareability"}
              </div>
            </div>

            {/* The HOW Card (The Technical Delivery, Staffing & Safety) */}
            <div className="relative p-8 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-md flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center font-black text-lg shadow-sm">
                    <Cog className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                      {isAr ? "الهندسة والتشغيل وراء الكواليس" : "Behind The Scenes Delivery"}
                    </span>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                      {isAr ? "الهندسة والانضباط التشغيلي (THE HOW)" : "The Operational Engine (HOW)"}
                    </h3>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                  {isAr ? items[activeTab].howAr : items[activeTab].howEn}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-level-2)]/60 flex items-center gap-2 text-xs font-semibold text-[var(--text-tertiary)]">
                <CheckCircle2 className="w-4 h-4 text-slate-500" />
                {isAr ? "معايير سلامة، كوادر مدربة، وأنظمة تحكم دقيقة" : "Strict safety protocols, redundancy systems & SOP execution"}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
