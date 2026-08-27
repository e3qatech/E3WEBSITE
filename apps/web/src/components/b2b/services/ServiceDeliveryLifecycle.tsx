"use client";

import React from "react";
import { GitCommit, ArrowRight, Check } from "lucide-react";
import { LifecycleStage } from "@/lib/services/canonical-services";

interface ServiceDeliveryLifecycleProps {
  stages: LifecycleStage[];
  locale: string;
}

export function ServiceDeliveryLifecycle({ stages, locale }: ServiceDeliveryLifecycleProps) {
  const isAr = locale === "ar";

  if (!stages || stages.length === 0) return null;

  return (
    <section className="py-20 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <GitCommit className="w-3.5 h-3.5" />
            {isAr ? "منهجية وسير العمل" : "Lifecycle Methodology"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-3">
            {isAr ? "دورة حياة المشروع ومراحل التنفيذ" : "How We Deliver: Structured Project Lifecycle"}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {isAr
              ? "مراحل عمل منضبطة تضمن التنسيق الكامل من الفكرة الأولية حتى التشغيل والتقييم النهائي."
              : "A transparent stage-gate methodology tailored specifically to this discipline from initial briefing to final handover."}
          </p>
        </div>

        {/* Stepper Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {stages.map((stage, idx) => {
            const outputs = isAr ? stage.outputsAr : stage.outputsEn;
            return (
              <div
                key={stage.id || idx}
                className="relative p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-emerald-500 font-mono">
                      {stage.stageNumber}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                    {isAr ? stage.titleAr : stage.titleEn}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                    {isAr ? stage.descriptionAr : stage.descriptionEn}
                  </p>
                </div>

                {outputs && outputs.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border-level-2)]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-1.5">
                      {isAr ? "المخرجات الرئيسية:" : "Key Outputs:"}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {outputs.map((out, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-raised)] text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
                        >
                          <Check className="w-3 h-3" />
                          {out}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
