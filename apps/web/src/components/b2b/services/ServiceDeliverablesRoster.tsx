"use client";

import React from "react";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { DeliverableCategory } from "@/lib/services/canonical-services";

interface ServiceDeliverablesRosterProps {
  categories: DeliverableCategory[];
  locale: string;
}

export function ServiceDeliverablesRoster({ categories, locale }: ServiceDeliverablesRosterProps) {
  const isAr = locale === "ar";

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-20 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <ClipboardList className="w-3.5 h-3.5" />
            {isAr ? "المخرجات والوثائق الرسمية" : "Procurement Clarity"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-3">
            {isAr ? "ما الذي ستحصل عليه: قائمة المخرجات" : "What You Receive: Clear Deliverables Roster"}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {isAr
              ? "مخرجات واضحة وقابلة للتدقيق في كل مرحلة من مراحل المشروع لدعم لجان المناقصات وإدارة المشاريع."
              : "Structured, tangible project artifacts and documentation ready for procurement committees, project management, and authority audits."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const items = isAr ? cat.itemsAr : cat.itemsEn;
            return (
              <div
                key={cat.id}
                className="p-6 sm:p-8 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-6 pb-3 border-b border-[var(--border-level-2)]">
                    {isAr ? cat.titleAr : cat.titleEn}
                  </h3>

                  <ul className="space-y-3.5">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                        <span className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-snug">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
