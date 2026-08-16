"use client";

import React from "react";
import Link from "next/link";
import { Trophy, ArrowRight, Sparkles, MapPin, Compass } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { cn } from "@/lib/utils";

interface LinkedAttractionFeatureProps {
  locale?: string;
  attraction?: {
    id: string;
    slug?: string | null;
    nameEn?: string | null;
    nameAr?: string | null;
    taglineEn?: string | null;
    taglineAr?: string | null;
    heroImageUrl?: string | null;
    heroMediaUrl?: string | null;
    heroFallbackUrl?: string | null;
    heroThumbnailUrl?: string | null;
    heroMediaType?: string | null;
    locationEn?: string | null;
    locationAr?: string | null;
  } | null;
}

export function LinkedAttractionFeature({
  locale = "en",
  attraction,
}: LinkedAttractionFeatureProps) {
  const isAr = locale === "ar";

  if (!attraction) {
    return null;
  }

  const name = isAr
    ? attraction.nameAr || attraction.nameEn
    : attraction.nameEn || attraction.nameAr;

  const tagline = isAr
    ? attraction.taglineAr || attraction.taglineEn
    : attraction.taglineEn || attraction.taglineAr;

  const location = isAr
    ? attraction.locationAr || attraction.locationEn
    : attraction.locationEn || attraction.locationAr;

  const mediaSource =
    attraction.heroMediaUrl ||
    attraction.heroImageUrl ||
    attraction.heroFallbackUrl ||
    attraction.heroThumbnailUrl;

  const mediaType = attraction.heroMediaType || "IMAGE";
  const attractionUrl = `/${locale}/b2c/attractions/${attraction.slug || attraction.id}`;

  return (
    <section
      id="attraction"
      data-testid="linked-attraction-feature"
      aria-label={isAr ? "الوجهة الترفيهية المرتبطة بالمشروع" : "Linked Live Attraction"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1628] via-[#111e38] to-[#0d1628] border border-emerald-500/30 p-8 sm:p-12 lg:p-14 shadow-2xl">
        {/* Glow Accent */}
        <div
          className="absolute -end-24 -top-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left / Top Details */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/20">
              <Trophy className="w-3.5 h-3.5" />
              <span>{isAr ? "من المشروع إلى تجربة حية مستمرة" : "FROM PROJECT TO LIVE EXPERIENCE"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight font-syne">
              {name}
            </h2>

            {tagline && (
              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
                {tagline}
              </p>
            )}

            {location && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium pt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{location}</span>
              </div>
            )}

            <div className="pt-4">
              <Link
                href={attractionUrl}
                data-testid="explore-experience-link"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Compass className="w-4 h-4" />
                <span>{isAr ? "استكشف الوجهة والتجربة الحية" : "Explore the Live Experience"}</span>
                <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
              </Link>
            </div>
          </div>

          {/* Right / Media Preview */}
          {mediaSource && (
            <div className="lg:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900">
              <UniversalMediaRenderer
                type={mediaType as any}
                src={mediaSource}
                className="w-full h-full object-cover filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 start-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white uppercase border border-white/15">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{isAr ? "وجهة نشطة" : "Active Destination"}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
