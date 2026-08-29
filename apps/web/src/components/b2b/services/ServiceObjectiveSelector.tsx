"use client";

import React, { useState } from "react";
import { Target, ArrowRight, CheckCircle2, Lightbulb } from "lucide-react";
import { ServiceObjective } from "@/lib/services/canonical-services";
import { cn } from "@/lib/utils";

interface ServiceObjectiveSelectorProps {
  objectives: ServiceObjective[];
  locale: string;
  onSelectObjective?: (obj: ServiceObjective) => void;
  onOpenBriefBuilder?: (obj: ServiceObjective) => void;
}

export function ServiceObjectiveSelector({
  objectives,
  locale,
  onSelectObjective,
  onOpenBriefBuilder
}: ServiceObjectiveSelectorProps) {
  const isAr = locale === "ar";
  const [selectedId, setSelectedId] = useState<string>(objectives[0]?.id || "");

  if (!objectives || objectives.length === 0) return null;

  const activeObj = objectives.find((o) => o.id === selectedId) || objectives[0];

  const handleIncludeInBrief = () => {
    if (onOpenBriefBuilder && activeObj) {
      onOpenBriefBuilder(activeObj);
    } else if (onSelectObjective && activeObj) {
      onSelectObjective(activeObj);
    }
  };

  return (
    <section className="py-20 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Target className="w-3.5 h-3.5" />
            {isAr ? "مواءمة أهداف مشروعك" : "Strategic Alignment"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-3">
            {isAr ? "ما الذي تسعى إلى تحقيقه؟" : "What Are You Trying to Achieve?"}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {isAr
              ? "حدد هدفك الاستراتيجي لنستعرض معاً حزم القدرات والمخرجات الأنسب لاحتياجاتك."
              : "Select your project objective to view tailored capability modules and recommended procurement deliverables."}
          </p>
        </div>

        {/* Objective Selection Pills */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {objectives.map((obj) => {
            const isSelected = obj.id === selectedId;
            return (
              <button
                key={obj.id}
                onClick={() => {
                  setSelectedId(obj.id);
                  if (onSelectObjective) onSelectObjective(obj);
                }}
                className={cn(
                  "flex items-start gap-3.5 p-5 rounded-2xl border text-start transition-all cursor-pointer",
                  isSelected
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30"
                    : "bg-[var(--surface-default)] border-[var(--border-level-2)] hover:border-emerald-500/30 hover:bg-[var(--surface-raised)]"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border transition-all",
                    isSelected
                      ? "border-emerald-500 bg-emerald-700 text-white"
                      : "border-[var(--border-level-2)] bg-[var(--surface-raised)]"
                  )}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)] leading-snug mb-1">
                    {isAr ? obj.labelAr : obj.labelEn}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                    {isAr ? obj.descriptionAr : obj.descriptionEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Objective Deep Dive Card */}
        {activeObj && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                  <Lightbulb className="w-4 h-4" />
                  {isAr ? "النهج الموصى به لهذا الهدف" : "Recommended Approach"}
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">
                  {isAr ? activeObj.labelAr : activeObj.labelEn}
                </h4>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  {isAr ? activeObj.descriptionAr : activeObj.descriptionEn}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleIncludeInBrief}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  {isAr ? "إدراج في موجز المشروع" : "Include in Brief"}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
