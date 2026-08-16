"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, TrendingUp, Sparkles, Layers } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { cn } from "@/lib/utils";

interface GalleryMediaItem {
  url: string;
  type?: string;
  captionEn?: string;
  captionAr?: string;
}

interface TransformationNarrativeProps {
  locale?: string;
  challengeText?: string | null;
  solutionText?: string | null;
  resultText?: string | null;
  heroImageUrl?: string | null;
  heroMediaType?: string | null;
  thumbnailUrl?: string | null;
  galleryMedia?: GalleryMediaItem[] | null;
}

export function TransformationNarrative({
  locale = "en",
  challengeText,
  solutionText,
  resultText,
  heroImageUrl,
  heroMediaType = "IMAGE",
  thumbnailUrl,
  galleryMedia = [],
}: TransformationNarrativeProps) {
  const isAr = locale === "ar";
  const [activeActIndex, setActiveActIndex] = useState<number>(0);

  if (!challengeText && !solutionText && !resultText) {
    return null;
  }

  const acts = [
    {
      id: "challenge",
      number: "01",
      badgeEn: "ACT 01 — THE OPERATIONAL CHALLENGE",
      badgeAr: "الفصل الأول — التحدي التشغيلي والمهمة",
      titleEn: "The Challenge & Scope",
      titleAr: "التحدي التشغيلي ونطاق العمل",
      text: challengeText,
      accentColor: "text-amber-400",
      accentBg: "bg-amber-400/10",
      borderColor: "border-amber-500/30",
      bgGradient: "from-amber-500/5 via-transparent to-transparent",
      icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
      moodLabelEn: "Diagnostic & Scoping",
      moodLabelAr: "التشخيص وتحديد النطاق",
      mediaUrl: galleryMedia?.[0]?.url || heroImageUrl || thumbnailUrl,
      mediaType: galleryMedia?.[0]?.type || heroMediaType || "IMAGE",
    },
    {
      id: "solution",
      number: "02",
      badgeEn: "ACT 02 — THE E3 TURNKEY SOLUTION",
      badgeAr: "الفصل الثاني — الحل والتنفيذ المتكامل",
      titleEn: "Engineering Execution",
      titleAr: "الحل الهندسي والتنفيذ الميداني",
      text: solutionText,
      accentColor: "text-emerald-400",
      accentBg: "bg-emerald-400/10",
      borderColor: "border-emerald-500/30",
      bgGradient: "from-emerald-500/5 via-transparent to-transparent",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      moodLabelEn: "Field Production & Rigging",
      moodLabelAr: "التنفيذ الهندسي الميداني",
      mediaUrl: galleryMedia?.[1]?.url || heroImageUrl || thumbnailUrl,
      mediaType: galleryMedia?.[1]?.type || heroMediaType || "IMAGE",
    },
    {
      id: "result",
      number: "03",
      badgeEn: "ACT 03 — MEASURABLE IMPACT & RESULTS",
      badgeAr: "الفصل الثالث — النتائج والأثر المحقق",
      titleEn: "The Delivered Result",
      titleAr: "النتائج والأثر المتحقق",
      text: resultText,
      accentColor: "text-cyan-400",
      accentBg: "bg-cyan-400/10",
      borderColor: "border-cyan-500/30",
      bgGradient: "from-cyan-500/5 via-transparent to-transparent",
      icon: <TrendingUp className="w-5 h-5 text-cyan-400" />,
      moodLabelEn: "Operational Delivery",
      moodLabelAr: "التسليم والتشغيل الكامل",
      mediaUrl: galleryMedia?.[2]?.url || heroImageUrl || thumbnailUrl,
      mediaType: galleryMedia?.[2]?.type || heroMediaType || "IMAGE",
    },
  ].filter((act) => Boolean(act.text));

  // Intersection observer to update pinned active act on desktop scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 350;
      for (let i = acts.length - 1; i >= 0; i--) {
        const act = acts[i];
        const el = document.getElementById(act.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveActIndex(i);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [acts]);

  const currentAct = acts[activeActIndex] || acts[0];

  return (
    <section
      id="story"
      data-testid="transformation-narrative-section"
      aria-label={isAr ? "سرد تحول المشروع والمراحل الثلاث" : "Transformation Narrative"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28"
    >
      {/* Narrative Section Header */}
      <div className="max-w-3xl mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-3 border border-cyan-500/20">
          <Layers className="w-3.5 h-3.5" />
          <span>{isAr ? "السرد التنفيذي للمشروع" : "THREE-ACT PROJECT STORY"}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-syne">
          {isAr ? "من الفكرة والتحدي إلى التسليم الاستثنائي" : "From Ambition to Flawless Execution"}
        </h2>
      </div>

      {/* Main Container: Desktop Side-by-Side with Pinned Visual Canvas, Mobile Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Desktop Pinned Visual Canvas (Hidden on Mobile) */}
        <div className="hidden lg:block lg:col-span-5 sticky top-36">
          <div
            className={cn(
              "relative rounded-3xl overflow-hidden bg-[#0a0f1d] border p-6 transition-all duration-500 shadow-2xl",
              currentAct?.borderColor || "border-white/10"
            )}
          >
            {/* Act Visual Canvas Media */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-white/10 mb-6">
              {currentAct?.mediaUrl ? (
                <UniversalMediaRenderer
                  type={(currentAct.mediaType as any) || "IMAGE"}
                  src={currentAct.mediaUrl}
                  className="w-full h-full object-cover filter brightness-95 transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0e1626] to-[#080d18] flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-slate-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Top Tag */}
              <div className="absolute top-3 start-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase backdrop-blur-md border",
                    currentAct?.accentBg,
                    currentAct?.accentColor,
                    currentAct?.borderColor
                  )}
                >
                  {isAr ? currentAct?.moodLabelAr : currentAct?.moodLabelEn}
                </span>
              </div>
            </div>

            {/* Act Progression Nav */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                {isAr ? "مراحل القصة الهندسية" : "NARRATIVE PROGRESSION"}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {acts.map((act, index) => {
                  const isActive = index === activeActIndex;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => {
                        setActiveActIndex(index);
                        const el = document.getElementById(act.id);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className={cn(
                        "p-2.5 rounded-xl border text-center transition-all",
                        isActive
                          ? `${act.accentBg} ${act.borderColor} shadow-md`
                          : "bg-white/[0.02] border-white/5 hover:border-white/20 opacity-60"
                      )}
                    >
                      <span className={cn("font-mono text-sm font-black block", act.accentColor)}>
                        {act.number}
                      </span>
                      <span className="text-[10px] font-mono text-slate-300 truncate block">
                        {isAr ? act.titleAr : act.titleEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Acts Body (Scrollable Column on Desktop, Stacked on Mobile) */}
        <div className="lg:col-span-7 space-y-8 sm:space-y-12">
          {acts.map((act, index) => (
            <article
              key={act.id}
              id={act.id}
              data-testid={`narrative-act-${act.id}`}
              className={cn(
                "group relative rounded-3xl bg-[#0b101d] border p-6 sm:p-8 lg:p-10 transition-all duration-300 shadow-xl overflow-hidden",
                act.borderColor
              )}
            >
              {/* Ambient Background Scrim */}
              <div
                className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none opacity-40", act.bgGradient)}
              />

              <div className="relative z-10 space-y-4 sm:space-y-6">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={cn("font-mono text-3xl sm:text-5xl font-black", act.accentColor)}>
                      {act.number}
                    </span>
                    <div className="space-y-0.5">
                      <div className={cn("text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase", act.accentColor)}>
                        {isAr ? act.badgeAr : act.badgeEn}
                      </div>
                      <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight font-syne">
                        {isAr ? act.titleAr : act.titleEn}
                      </h3>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                    {act.icon}
                  </div>
                </div>

                {/* Mobile-only In-Card Media Preview */}
                {act.mediaUrl && (
                  <div className="block lg:hidden aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                    <UniversalMediaRenderer
                      type={(act.mediaType as any) || "IMAGE"}
                      src={act.mediaUrl}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Narrative Text Body */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                  <div className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                    {act.text}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
