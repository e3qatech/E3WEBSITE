"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const touchStartX = useRef<number | null>(null);

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

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || activeModalIndex === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // swipe left -> next
        setActiveModalIndex((prev) => (prev !== null ? (prev + 1) % gallery.length : 0));
      } else {
        // swipe right -> prev
        setActiveModalIndex((prev) => (prev !== null ? (prev - 1 + gallery.length) % gallery.length : 0));
      }
    }
    touchStartX.current = null;
  };

  return (
    <section
      id="gallery"
      data-testid="case-gallery-section"
      aria-label={isAr ? "معرض صور ووسائط المشروع" : "Project Visual Gallery"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28"
    >
      <div className="max-w-3xl mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-[var(--surface-default)] text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3 shadow-sm">
          <Images className="w-3.5 h-3.5 text-emerald-500" />
          <span>{isAr ? "المعرض البصري للمشروع" : "EDITORIAL VISUAL JOURNEY"}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-syne">
          {isAr ? "كواليس ومخرجات الإنتاج الميداني" : "Field Production & Visual Gallery"}
        </h2>
      </div>

      {/* Editorial Controlled Alternating Grid: First item full-width, others 2-column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {gallery.map((item, i) => {
          const isFullWidth = i === 0 || (i > 2 && i % 3 === 0);
          const caption = isAr
            ? item.captionAr || item.captionEn || item.caption
            : item.captionEn || item.caption;

          return (
            <div
              key={i}
              data-testid={`gallery-item-${i}`}
              onClick={() => setActiveModalIndex(i)}
              className={cn(
                "group relative rounded-3xl overflow-hidden cursor-pointer border border-zinc-800/80 bg-zinc-900/50 hover:border-emerald-500/40 transition-all duration-500 shadow-xl",
                isFullWidth ? "md:col-span-2 aspect-[21/9]" : "aspect-[16/10]"
              )}
            >
              <UniversalMediaRenderer
                type={(item.type as any) || "IMAGE"}
                src={item.url}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
              
              <div className="absolute bottom-4 start-4 end-4 flex items-center justify-between text-white">
                <span className="text-xs font-bold font-mono tracking-wider line-clamp-1">
                  {caption || `${isAr ? "شاهد اللقطة" : "View Frame"} 0${i + 1}`}
                </span>
                <span className="p-2 rounded-xl bg-zinc-950/80 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activeModalIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="gallery-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          onClick={() => setActiveModalIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setActiveModalIndex(null)}
            aria-label={isAr ? "إغلاق المعرض" : "Close Gallery Lightbox"}
            data-testid="lightbox-close-btn"
            className="absolute top-6 end-6 p-3 rounded-full bg-zinc-900/80 border border-white/20 text-white hover:bg-emerald-500 hover:text-zinc-950 transition-colors shadow-2xl cursor-pointer z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModalIndex((prev) =>
                    prev !== null ? (prev - 1 + gallery.length) % gallery.length : 0
                  );
                }}
                aria-label={isAr ? "الصورة السابقة" : "Previous Image"}
                data-testid="lightbox-prev-btn"
                className="absolute start-4 sm:start-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 border border-white/20 text-white hover:bg-emerald-500 hover:text-zinc-950 transition-colors shadow-2xl cursor-pointer z-50"
              >
                <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModalIndex((prev) =>
                    prev !== null ? (prev + 1) % gallery.length : 0
                  );
                }}
                aria-label={isAr ? "الصورة التالية" : "Next Image"}
                data-testid="lightbox-next-btn"
                className="absolute end-4 sm:end-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 border border-white/20 text-white hover:bg-emerald-500 hover:text-zinc-950 transition-colors shadow-2xl cursor-pointer z-50"
              >
                <ChevronRight className="w-6 h-6 rtl:rotate-180" />
              </button>
            </>
          )}

          {/* Modal Main Media Container */}
          <div 
            className="relative max-w-6xl max-h-[80vh] w-full flex items-center justify-center overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <UniversalMediaRenderer
              type={(gallery[activeModalIndex].type as any) || "IMAGE"}
              src={gallery[activeModalIndex].url}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
            />
          </div>

          {/* Caption & Counter */}
          <div className="mt-4 text-center max-w-2xl px-4" onClick={(e) => e.stopPropagation()}>
            <span className="inline-block text-xs font-mono font-bold text-emerald-400 mb-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              {activeModalIndex + 1} / {gallery.length}
            </span>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
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
