"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Plus, Check } from "lucide-react";
import { getCanonicalService } from "@/lib/services/canonical-services";
import { localizeHref } from "@/lib/url-helper";

interface ServiceRelatedSolutionsProps {
  relatedSlugs: string[];
  locale: string;
  onOpenBriefWithService?: (slug: string) => void;
}

export function ServiceRelatedSolutions({
  relatedSlugs,
  locale,
  onOpenBriefWithService
}: ServiceRelatedSolutionsProps) {
  const isAr = locale === "ar";

  if (!relatedSlugs || relatedSlugs.length === 0) return null;

  const services = relatedSlugs
    .map((s) => getCanonicalService(s))
    .filter(Boolean);

  if (services.length === 0) return null;

  return (
    <section className="py-20 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Plus className="w-3.5 h-3.5" />
            {isAr ? "باقات وحلول متكاملة" : "Integrated Solutions"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-3">
            {isAr ? "خدمات متكاملة تعمل بتناغم تام" : "Better Together: Connected Service Bundles"}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {isAr
              ? "تحقق مشاريع إي ثري أعلى كفاءة عندما تتكامل هذه التخصصات تحت إدارة موحدة."
              : "Combine complementary disciplines under one contract for synchronized delivery, streamlined accountability, and optimized costs."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((rel: any) => (
            <div
              key={rel.slug}
              className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-2">
                  {isAr ? rel.categoryAr : rel.categoryEn}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {isAr ? rel.titleAr : rel.titleEn}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2 mb-4">
                  {isAr ? rel.taglineAr : rel.taglineEn}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-level-2)]/60 flex items-center justify-between">
                <Link
                  href={localizeHref(`/b2b/services/${rel.slug}`, locale)}
                  className="text-xs font-bold text-[var(--text-primary)] hover:text-emerald-500 inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>{isAr ? "تفاصيل الخدمة" : "Explore"}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>

                {onOpenBriefWithService && (
                  <button
                    onClick={() => onOpenBriefWithService(rel.slug)}
                    className="p-1.5 rounded-lg bg-[var(--surface-raised)] hover:bg-emerald-700 hover:text-white text-[var(--text-secondary)] transition-all cursor-pointer"
                    title={isAr ? "إضافة للموجز" : "Add to Project Brief"}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
