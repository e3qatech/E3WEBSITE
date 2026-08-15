"use client";

import React, { useState, useEffect } from "react";
import { Images, X, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { cn } from "@/lib/utils";

interface GalleryMediaItem {
  url: string;
  type?: "IMAGE" | "VIDEO" | "IFRAME" | "SPLINE" | "THREE_D" | string;
  captionEn?: string;
  captionAr?: string;
  caption?: string;
}

interface CaseGalleryJourneyProps {
  locale?: string;
  gallery?: GalleryMediaItem[] | null;
}

export function CaseGalleryJourney({
  locale = "en",
  gallery = [],
}: CaseGalleryJourneyProps) {
  const isAr = locale === "ar";
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  // Keyboard controls for modal
  useEffect(() => {
    if (activeModalIndex === null || !gallery) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModalIndex(null);
      } else if (e.key === "ArrowRight") {
        setActiveModalIndex((prev) => (prev !== null ? (prev + 1) % gallery.length : null));
      } else if (e.key === "ArrowLeft") {
        setActiveModalIndex((prev) => (prev !== null ? (prev - 1 + gallery.length) % gallery.length : null));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalIndex, gallery]);

  if (!gallery || !Array.isArray(gallery) || gallery.length === 0) {
    return null;
  }

  return (
    <section
      id="gallery"
      data-testid="case-gallery-section"
      aria-label={isAr ? "معرض صور ووسائط المشروع" : "Project Visual Gallery"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28"
    >
      <div className="max-w-3xl mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-3 border border-cyan-500/20">
          <Images className="w-3.5 h-3.5" />
          <span>{isAr ? "المعرض البصري للمشروع" : "EDITORIAL VISUAL JOURNEY"}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-syne">
          {isAr ? "كواليس ومخرجات الإنتاج الميداني" : "Field Production & Visual Gallery"}
        </h2>
      </div>

      {/* Editorial Alternating Composition Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {gallery.map((item, i) => {
          const isFullWidth = i % 3 === 0;
          const caption = isAr
            ? item.captionAr || item.captionEn || item.caption
            : item.captionEn || item.caption;

          return (
            <div
              key={i}
              data-testid={`gallery-item-${i}`}
              onClick={() => setActiveModalIndex(i)}
              className={cn(
                "group relative rounded-3xl overflow-hidden bg-[#0a0f1c] border border-white/10 hover:border-cyan-500/40 transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-end",
                isFullWidth ? "md:col-span-2 aspect-[16/9] lg:aspect-[21/9]" : "aspect-[4/3]"
              )}
            >
              <UniversalMediaRenderer
                type={(item.type as any) || "IMAGE"}
                src={item.url}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
              />

              {/* Gradient Overlay & Hover Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity pointer-events-none" />

              <div className="absolute top-4 end-4 p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/15">
                <Maximize2 className="w-4 h-4" />
              </div>

              {caption && (
                <div className="relative z-10 p-6 sm:p-8">
                  <p className="text-xs sm:text-sm font-medium text-slate-200 line-clamp-2">
                    {caption}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activeModalIndex !== null && (
        <div
          data-testid="gallery-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setActiveModalIndex(null)}
            aria-label={isAr ? "إغلاق المعرض" : "Close Gallery Lightbox"}
            data-testid="lightbox-close-btn"
            className="absolute top-6 end-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveModalIndex((prev) =>
                    prev !== null ? (prev - 1 + gallery.length) % gallery.length : 0
                  )
                }
                aria-label={isAr ? "الصورة السابقة" : "Previous Image"}
                data-testid="lightbox-prev-btn"
                className="absolute start-4 sm:start-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveModalIndex((prev) =>
                    prev !== null ? (prev + 1) % gallery.length : 0
                  )
                }
                aria-label={isAr ? "الصورة التالية" : "Next Image"}
                data-testid="lightbox-next-btn"
                className="absolute end-4 sm:end-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Modal Main Media Container */}
          <div className="relative max-w-6xl max-h-[80vh] w-full flex items-center justify-center overflow-hidden rounded-2xl">
            <UniversalMediaRenderer
              type={(gallery[activeModalIndex].type as any) || "IMAGE"}
              src={gallery[activeModalIndex].url}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
            />
          </div>

          {/* Caption & Counter */}
          <div className="mt-4 text-center max-w-2xl px-4">
            <span className="text-xs font-mono text-cyan-400 block mb-1">
              {activeModalIndex + 1} / {gallery.length}
            </span>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {isAr
                ? gallery[activeModalIndex].captionAr || gallery[activeModalIndex].captionEn || gallery[activeModalIndex].caption
                : gallery[activeModalIndex].captionEn || gallery[activeModalIndex].caption}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
