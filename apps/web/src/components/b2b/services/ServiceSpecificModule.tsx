"use client";

import React, { useState } from "react";
import { Sliders, CheckCircle2 } from "lucide-react";
import { ServiceSpecificModuleConfig } from "@/lib/services/canonical-services";
import { cn } from "@/lib/utils";

interface ServiceSpecificModuleProps {
  moduleConfig: ServiceSpecificModuleConfig;
  locale: string;
}

export function ServiceSpecificModule({ moduleConfig, locale }: ServiceSpecificModuleProps) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!moduleConfig || !moduleConfig.data || !moduleConfig.type || moduleConfig.type === 'none') return null;

  const { type, data } = moduleConfig;

  return (
    <section className="py-20 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sliders className="w-3.5 h-3.5" />
            {isAr ? "وحدة تفاعلية متخصصة" : "Specialist Interactive Tool"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-3">
            {isAr ? moduleConfig.titleAr : moduleConfig.titleEn}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {isAr ? moduleConfig.subtitleAr : moduleConfig.subtitleEn}
          </p>
        </div>

        {/* 1. SCALE EXPLORER (Mega Events) */}
        {type === "scale-explorer" && data.scales && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {data.scales.map((scale: any, idx: number) => (
                <button
                  key={scale.id || idx}
                  onClick={() => setActiveTab(idx)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer",
                    activeTab === idx
                      ? "bg-emerald-700 text-white shadow-md"
                      : "bg-[var(--surface-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]"
                  )}
                >
                  {isAr ? scale.labelAr : scale.labelEn}
                </button>
              ))}
            </div>

            {data.scales[activeTab] && (
              <div className="p-8 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-level-2)]">
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    {isAr ? data.scales[activeTab].labelAr : data.scales[activeTab].labelEn}
                  </h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                    <span>{isAr ? "الجدول الزمني الموصى به:" : "Production Lead Time:"}</span>
                    <span>{isAr ? data.scales[activeTab].leadTimeAr : data.scales[activeTab].leadTimeEn}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {(isAr ? data.scales[activeTab].featuresAr : data.scales[activeTab].featuresEn).map(
                    (feat: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--surface-raised)] text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. FEC LIFECYCLE (FEC Development) */}
        {type === "fec-lifecycle" && data.milestones && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.milestones.map((m: any, i: number) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-2">
                    <span>{m.phase}</span>
                    <span className="text-[11px] text-[var(--text-tertiary)]">{isAr ? m.durationAr : m.durationEn}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                    {isAr ? m.titleAr : m.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {isAr ? m.descAr : m.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. KIDS AGE MATRIX (Kids' Concepts) */}
        {type === "kids-age-matrix" && data.brackets && (
          <div className="grid md:grid-cols-3 gap-6">
            {data.brackets.map((b: any, i: number) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                    {isAr ? b.ageAr : b.ageEn}
                  </h3>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mb-6">
                    {isAr ? b.focusAr : b.focusEn}
                  </span>
                  <ul className="space-y-2.5">
                    {(isAr ? b.itemsAr || b.itemsEn : b.itemsEn).map((it: string, j: number) => (
                      <li key={j} className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. ACTIVATION MAPPER (Experiential Activations) */}
        {type === "activation-mapper" && data.dimensions && (
          <div className="grid md:grid-cols-3 gap-6">
            {data.dimensions.map((dim: any, i: number) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-2">
                  {isAr ? "الهدف التسويقي:" : "Strategic Goal:"}
                </span>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                  {isAr ? dim.goalAr : dim.goalEn}
                </h3>
                <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)] block mb-1">
                    {isAr ? "التنفيذ المقترح:" : "Recommended Format:"}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                    {isAr ? dim.formatAr : dim.formatEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. PERFORMANCE CATALOGUE (Shows) */}
        {type === "performance-catalogue" && data.categories && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.categories.map((cat: any, i: number) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-2">
                    {isAr ? cat.nameAr : cat.nameEn}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    {isAr ? cat.descAr : cat.descEn}
                  </p>
                </div>
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  {isAr ? "متوفر للعروض الخاصة والفعاليات" : "Available for Live Booking"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. AV VENUE SELECTOR (AV & Stage) */}
        {type === "av-venue-selector" && data.venues && (
          <div className="grid md:grid-cols-3 gap-6">
            {data.venues.map((v: any, i: number) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--border-level-2)]">
                    {isAr ? v.typeAr : v.typeEn}
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block mb-0.5">{isAr ? "الصوتيات:" : "Audio:"}</span>
                      <span className="text-[var(--text-secondary)]">{v.audioEn}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block mb-0.5">{isAr ? "الإضاءة:" : "Lighting:"}</span>
                      <span className="text-[var(--text-secondary)]">{v.lightingEn}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block mb-0.5">{isAr ? "الشاشات:" : "Video:"}</span>
                      <span className="text-[var(--text-secondary)]">{v.videoEn}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 7. OPERATIONS SOP MODEL (Attraction Operations) */}
        {type === "operations-sop-model" && data.roles && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.roles.map((r: any, i: number) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs">
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-2">
                  {isAr ? r.titleAr : r.titleEn}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isAr ? r.dutiesAr || r.dutiesEn : r.dutiesEn}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 8. TICKETING FLOW (BookingQube) */}
        {type === "ticketing-flow" && data.steps && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.steps.map((st: any, i: number) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs">
                <span className="text-2xl font-black text-emerald-500 font-mono block mb-2">{st.step}</span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-2">
                  {isAr ? st.titleAr : st.titleEn}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isAr ? st.descAr : st.descEn}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 9. FABRICATION MATERIALS (Fabrication & Branding) */}
        {type === "fabrication-materials" && data.materials && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.materials.map((mat: any, i: number) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs">
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-2">
                  {isAr ? mat.nameAr : mat.nameEn}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isAr ? mat.descAr : mat.descEn}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 10. RESEARCH STUDY GATES (Feasibility & Research) */}
        {type === "research-study-gates" && data.gates && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.gates.map((g: any, i: number) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs">
                <span className="text-xs font-extrabold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider block mb-1">
                  {g.gate}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-2">
                  {isAr ? g.titleAr : g.titleEn}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isAr ? g.descAr : g.descEn}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
