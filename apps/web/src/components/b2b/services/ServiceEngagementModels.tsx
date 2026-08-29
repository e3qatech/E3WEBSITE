"use client";

import React from "react";
import { Handshake, Clock, ShieldCheck } from "lucide-react";
import { EngagementModel } from "@/lib/services/canonical-services";
import { getServiceFrameworkLabels } from "@/lib/services/service-labels";

interface ServiceEngagementModelsProps {
  models: EngagementModel[];
  locale: string;
  onSelectModel?: (model: EngagementModel) => void;
}

export function ServiceEngagementModels({ models, locale, onSelectModel }: ServiceEngagementModelsProps) {
  const isAr = locale === "ar";
  const labels = getServiceFrameworkLabels(locale);

  if (!models || models.length === 0) return null;

  return (
    <section id="engagement-section" className="py-24 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Handshake className="w-3.5 h-3.5" />
            <span>{isAr ? "نماذج الشراكة والتعاقد" : "Procurement & Engagement"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-3">
            {isAr ? labels.engagementHeading : labels.engagementHeading}
          </h2>
          <p className="text-base text-[var(--text-secondary)] font-medium">
            {isAr ? labels.engagementSubheading : labels.engagementSubheading}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {models.map((model) => (
            <div
              key={model.id}
              className="p-8 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                    {isAr ? model.subtitleAr : model.subtitleEn}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-tertiary)]">
                    <Clock className="w-3.5 h-3.5" />
                    {isAr ? model.typicalDurationAr : model.typicalDurationEn}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {isAr ? model.titleAr : model.titleEn}
                </h3>

                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-6 font-medium">
                  {isAr ? model.descriptionAr : model.descriptionEn}
                </p>
              </div>

              <div className="pt-6 border-t border-[var(--border-level-2)]/60">
                <div className="flex items-start gap-2 text-xs sm:text-sm text-[var(--text-secondary)] mb-6">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[var(--text-primary)] block">
                      {isAr ? "الأنسب لـ:" : "Best For:"}
                    </span>
                    <span>{isAr ? model.bestForAr : model.bestForEn}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectModel && onSelectModel(model)}
                  className="w-full py-3.5 rounded-2xl bg-[var(--surface-raised)] hover:bg-emerald-500 hover:text-zinc-950 text-[var(--text-primary)] font-bold text-xs sm:text-sm transition-all border border-[var(--border-level-2)] hover:border-emerald-500 cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                >
                  {labels.requestModelScope}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
