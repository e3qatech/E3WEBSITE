"use client";

import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Maximize2, X, ChevronLeft, ChevronRight, Play, Film } from "lucide-react";
import { ServiceGalleryItemPayload } from "@/lib/services/canonical-services";

interface ServiceMediaGalleryProps {
  items?: ServiceGalleryItemPayload[];
  layout?: "grid" | "filmstrip" | "featured" | "mosaic";
  locale: string;
  titleEn?: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
}

export function ServiceMediaGallery({
  items = [],
  layout: _layout = "grid",
  locale,
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
}: ServiceMediaGalleryProps) {
  const isAr = locale === "ar";
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Filter out items that are explicitly hidden or have no valid URL
  const visibleItems = items.filter((item) => item && item.url && item.isVisible !== false);

  // Lightbox keyboard navigation, focus trap & restoration
  useEffect(() => {
    if (lightboxIndex === null) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setLightboxIndex(null);
        return;
      }
      if (e.key === "ArrowRight" && visibleItems.length > 0) {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % visibleItems.length : 0));
      }
      if (e.key === "ArrowLeft" && visibleItems.length > 0) {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + visibleItems.length) % visibleItems.length : 0));
      }

      if (e.key === "Tab" && lightboxRef.current) {
        const focusable = lightboxRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Initial focus on close button
    const timer = setTimeout(() => {
      if (lightboxRef.current) {
        const closeBtn = lightboxRef.current.querySelector<HTMLElement>('button[aria-label]');
        if (closeBtn) {
          closeBtn.focus();
        } else {
          lightboxRef.current.focus();
        }
      }
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
      previouslyFocused?.focus();
    };
  }, [lightboxIndex, visibleItems.length]);

  // Empty state suppression: if no valid items, suppress the entire section cleanly
  if (visibleItems.length === 0) {
    return null;
  }

  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && visibleItems.length > 0) {
      setLightboxIndex((prev) => (prev !== null ? (prev + 1) % visibleItems.length : 0));
    }
    if (isRightSwipe && visibleItems.length > 0) {
      setLightboxIndex((prev) => (prev !== null ? (prev - 1 + visibleItems.length) % visibleItems.length : 0));
    }
  };

  const defaultTitle = isAr ? "معرض الوسائط والتنفيذ" : "Visual Media & Execution Gallery";
  const defaultSubtitle = isAr
    ? "لقطات وتوثيق مرئي لمخرجات وحلول هذه الخدمة المنفذة في قطر."
    : "Cinematic documentation and verified visual assets of our scope delivered in Qatar.";

  const sectionTitle = isAr ? (titleAr || defaultTitle) : (titleEn || defaultTitle);
  const sectionSubtitle = isAr ? (subtitleAr || defaultSubtitle) : (subtitleEn || defaultSubtitle);

  return (
    <section id="media-gallery-section" className="py-20 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <ImageIcon className="w-3.5 h-3.5" />
            {isAr ? "التوثيق المرئي" : "Visual Portfolio"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-3">
            {sectionTitle}
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((item, idx) => {
            const isVideo = item.mediaType === "VIDEO";
            const caption = isAr ? item.captionAr || item.captionEn : item.captionEn;

            return (
              <div
                key={item.id || idx}
                onClick={() => setLightboxIndex(idx)}
                className="group relative rounded-2xl overflow-hidden bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black/10">
                  {isVideo ? (
                    <div className="relative w-full h-full">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ms-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={caption || "Service Gallery Asset"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <span className="text-xs font-mono text-white/90 flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      {isAr ? "تكبير" : "View"}
                    </span>
                    {isVideo && (
                      <span className="px-2 py-0.5 rounded-full bg-black/70 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Film className="w-3.5 h-3.5" />
                        VIDEO
                      </span>
                    )}
                  </div>
                </div>

                {caption && (
                  <div className="p-4 bg-[var(--surface-default)] border-t border-[var(--border-level-2)]">
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium line-clamp-2">
                      {caption}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && visibleItems[lightboxIndex] && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? "معرض الوسائط والتنفيذ" : "Media Lightbox"}
          tabIndex={-1}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none focus:outline-none"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            className="absolute top-4 end-4 z-50 w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label={isAr ? "إغلاق المعرض" : "Close media lightbox"}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev */}
          {visibleItems.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null ? (prev - 1 + visibleItems.length) % visibleItems.length : 0));
              }}
              className="absolute start-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label={isAr ? "العنصر السابق" : "Previous media item"}
            >
              <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
            </button>
          )}

          {/* Next */}
          {visibleItems.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null ? (prev + 1) % visibleItems.length : 0));
              }}
              className="absolute end-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label={isAr ? "العنصر التالي" : "Next media item"}
            >
              <ChevronRight className="w-6 h-6 rtl:rotate-180" />
            </button>
          )}

          {/* Main Media in Lightbox */}
          <div
            className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {visibleItems[lightboxIndex].mediaType === "VIDEO" ? (
              <video
                src={visibleItems[lightboxIndex].url}
                className="max-w-full max-h-[75vh] rounded-xl shadow-2xl"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={visibleItems[lightboxIndex].url}
                alt={isAr ? visibleItems[lightboxIndex].captionAr || visibleItems[lightboxIndex].captionEn || "" : visibleItems[lightboxIndex].captionEn || ""}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
            )}

            {/* Caption in Lightbox */}
            {(visibleItems[lightboxIndex].captionEn || visibleItems[lightboxIndex].captionAr) && (
              <div className="mt-4 text-center max-w-2xl text-white/90 text-sm font-medium px-4">
                {isAr
                  ? visibleItems[lightboxIndex].captionAr || visibleItems[lightboxIndex].captionEn
                  : visibleItems[lightboxIndex].captionEn || visibleItems[lightboxIndex].captionAr}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
