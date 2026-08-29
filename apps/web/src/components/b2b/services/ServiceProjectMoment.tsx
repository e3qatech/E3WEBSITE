"use client";

import React from "react";
import { Trophy } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { ServiceProjectMoment as ServiceProjectMomentType } from "@/lib/services/canonical-services";

interface ServiceProjectMomentProps {
  moment?: ServiceProjectMomentType;
  fallbackMediaUrl?: string;
  fallbackTitleEn?: string;
  fallbackTitleAr?: string;
  locale: string;
}

export function ServiceProjectMoment({
  moment,
  fallbackMediaUrl,
  fallbackTitleEn,
  fallbackTitleAr,
  locale,
}: ServiceProjectMomentProps) {
  const isAr = locale === "ar";

  // Use strictly this service's media or fallbackMediaUrl (from this same service's record)
  const mediaUrl = moment?.mediaUrl || fallbackMediaUrl || undefined;
  const mediaType = moment?.mediaType || "IMAGE";
  const title = isAr ? moment?.titleAr || fallbackTitleAr || "شاهد ميداني من مواقع التنفيذ" : moment?.titleEn || fallbackTitleEn || "Executed Project Landmark";
  const statement = isAr
    ? moment?.statementAr || "توثيق حي للدقة الهندسية وجودة المواد ومطابقة المعايير في الموقع الفعلي."
    : moment?.statementEn || "Real-world engineering tolerances, certified materials, and verified crowd execution on-site.";
  const projectTag = isAr ? moment?.projectTagAr || "تنفيذ معتمد في قطر" : moment?.projectTagEn || "Verified Delivery in Qatar";

  return (
    <section id="moment-section" className="relative min-h-[50vh] lg:min-h-[60vh] flex items-center justify-center overflow-hidden border-y border-[var(--border-level-1)] bg-zinc-950 text-white">
      {/* Background Visual Layer */}
      <div className="absolute inset-0 z-0">
        {mediaUrl ? (
          <UniversalMediaRenderer
            type={mediaType as any}
            src={mediaUrl}
            poster={moment?.posterUrl || undefined}
            alt={title}
            className="w-full h-full object-cover filter brightness-[0.5] contrast-[1.1] scale-105 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-transparent to-zinc-950/85" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-8 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-6 backdrop-blur-md">
            <Trophy className="w-3.5 h-3.5" />
            <span>{projectTag}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-syne text-white tracking-tight leading-tight mb-6 drop-shadow-xl">
            {title}
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-zinc-300 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-md">
            {statement}
          </p>
        </div>
      </div>
    </section>
  );
}
