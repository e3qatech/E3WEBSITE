"use client";

import React from "react";
import { ShieldCheck, FileCheck, CheckCircle2 } from "lucide-react";
import { EnterpriseReadinessItem } from "@/lib/services/canonical-services";

interface ServiceEnterpriseReadinessProps {
  items: EnterpriseReadinessItem[];
  locale: string;
}

export function ServiceEnterpriseReadiness({ items, locale }: ServiceEnterpriseReadinessProps) {
  const isAr = locale === "ar";

  if (!items || items.length === 0) return null;

  return (
    <section className="py-20 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isAr ? "الجاهزية والامتثال المؤسسي" : "Enterprise Readiness"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-3">
            {isAr ? "السلامة، الجودة، وجاهزية المناقصات" : "Safety, Quality & Procurement Readiness"}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {isAr
              ? "نلتزم بأعلى معايير السلامة والصحة المهنية، وإجراءات العمل الآمن المعتمدة من الجهات المختصة في قطر."
              : "Documented working practices, formal HSE management, certified load testing, and direct authority coordination protocols."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-8 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  {isAr ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {isAr ? item.descriptionAr : item.descriptionEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
