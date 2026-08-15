"use client";

import React from "react";
import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransformationNarrativeProps {
  locale?: string;
  challengeText?: string | null;
  solutionText?: string | null;
  resultText?: string | null;
}

export function TransformationNarrative({
  locale = "en",
  challengeText,
  solutionText,
  resultText,
}: TransformationNarrativeProps) {
  const isAr = locale === "ar";

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
      borderColor: "border-amber-500/30",
      bgGradient: "from-amber-500/5 via-transparent to-transparent",
      icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
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
      borderColor: "border-emerald-500/30",
      bgGradient: "from-emerald-500/5 via-transparent to-transparent",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
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
      borderColor: "border-cyan-500/30",
      bgGradient: "from-cyan-500/5 via-transparent to-transparent",
      icon: <TrendingUp className="w-5 h-5 text-cyan-400" />,
    },
  ].filter((act) => Boolean(act.text));

  return (
    <section
      data-testid="transformation-narrative-section"
      aria-label={isAr ? "سرد تحول المشروع والمراحل الثلاث" : "Transformation Narrative"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28"
    >
      {/* Narrative Section Header */}
      <div className="max-w-3xl mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-3 border border-cyan-500/20">
          <span>{isAr ? "السرد التنفيذي للمشروع" : "TRANSFORMATION NARRATIVE"}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-syne">
          {isAr ? "من الفكرة والتحدي إلى التسليم الاستثنائي" : "Three Connected Acts of Engineering"}
        </h2>
      </div>

      {/* 3 Connected Acts Timeline / Editorial Cards */}
      <div className="space-y-12 sm:space-y-16">
        {acts.map((act) => (
          <article
            key={act.id}
            id={act.id}
            data-testid={`narrative-act-${act.id}`}
            className={cn(
              "group relative rounded-3xl bg-[#0b101d] border p-6 sm:p-10 lg:p-12 transition-all duration-300 shadow-xl overflow-hidden",
              act.borderColor
            )}
          >
            {/* Ambient Background Scrim */}
            <div
              className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none opacity-50", act.bgGradient)}
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
              {/* Left Column: Number & Act Header */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between lg:justify-start gap-4">
                  <span className={cn("font-mono text-4xl sm:text-6xl font-black opacity-85", act.accentColor)}>
                    {act.number}
                  </span>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                    {act.icon}
                  </div>
                </div>

                <div className={cn("text-[11px] font-mono font-bold tracking-widest uppercase", act.accentColor)}>
                  {isAr ? act.badgeAr : act.badgeEn}
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight font-syne">
                  {isAr ? act.titleAr : act.titleEn}
                </h3>
              </div>

              {/* Right Column: Narrative Content Body */}
              <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <div className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                  {act.text}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
