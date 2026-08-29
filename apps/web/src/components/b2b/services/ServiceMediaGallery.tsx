"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Image as ImageIcon, Maximize2, X, ChevronLeft, ChevronRight, Play, Film } from "lucide-react";
import { ServiceGalleryItemPayload } from "@/lib/services/canonical-services";
import { getServiceFrameworkLabels } from "@/lib/services/service-labels";
import { cn } from "@/lib/utils";

interface ServiceMediaGalleryProps {
  items?: ServiceGalleryItemPayload[];
  layout?: "grid" | "filmstrip" | "featured" | "mosaic" | "filmstrip-slider" | "masonry";
  locale: string;
  titleEn?: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
}

export function ServiceMediaGallery({
  items = [],
  layout = "grid",
  locale,
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
}: ServiceMediaGalleryProps) {
  const isAr = locale === "ar";
  const labels = getServiceFrameworkLabels(locale);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Filter out items that are explicitly hidden or have no valid URL
  const visibleItems = items.filter((item) => item && item.url && item.isVisible !== false);

  // Empty state suppression: if no valid items, suppress the entire section cleanly
  if (visibleItems.length === 0) {
    return null;
  }

  const normalizedLayout =
    layout === "filmstrip-slider" || layout === "filmstrip"
      ? "filmstrip"
      : layout === "featured"
      ? "featured"
      : "grid";

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight" && visibleItems.length > 0) {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % visibleItems.length : 0));
      }
      if (e.key === "ArrowLeft" && visibleItems.length > 0) {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + visibleItems.length) % visibleItems.length : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, visibleItems.length]);

  // Touch swipe handling for mobile lightbox
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

  const getFocalStyle = (focalPoint?: string): React.CSSProperties => {
    if (focalPoint === "top") return { objectPosition: "center top" };
    if (focalPoint === "bottom") return { objectPosition: "center bottom" };
    if (focalPoint === "left") return { objectPosition: "left center" };
    if (focalPoint === "right") return { objectPosition: "right center" };
    return { objectPosition: "center center" };
  };

  const currentLightboxItem = lightboxIndex !== null ? visibleItems[lightboxIndex] : null;

  return (
    <section id="gallery-section" className="py-24 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{isAr ? "المعرض البصري والتوثيق الميداني" : "Visual Production Gallery"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-3">
            {isAr ? titleAr || labels.galleryHeading : titleEn || labels.galleryHeading}
          </h2>
          <p className="text-base text-[var(--text-secondary)] font-medium">
            {isAr ? subtitleAr || labels.gallerySubheading : subtitleEn || labels.gallerySubheading}
          </p>
        </div>

        {/* Gallery Layout Variants */}
        {normalizedLayout === "featured" && visibleItems.length > 0 ? (
          <div className="space-y-6">
            {/* Main Featured Item */}
            <div
              onClick={() => setLightboxIndex(0)}
              className="group relative rounded-3xl overflow-hidden aspect-[16/9] max-h-[550px] w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-lg cursor-pointer"
            >
              {visibleItems[0].mediaType === "VIDEO" ? (
                <div className="relative w-full h-full">
                  <video
                    src={visibleItems[0].url}
                    poster={visibleItems[0].posterUrl}
                    className="w-full h-full object-cover"
                    style={getFocalStyle(visibleItems[0].focalPoint)}
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/90 text-zinc-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-current ms-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={visibleItems[0].url}
                  alt={isAr ? visibleItems[0].altTextAr || visibleItems[0].captionAr || "Gallery featured image" : visibleItems[0].altTextEn || visibleItems[0].captionEn || "Gallery featured image"}
                  loading="lazy"
                  style={getFocalStyle(visibleItems[0].focalPoint)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 motion-reduce:transition-none"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-8">
                {(visibleItems[0].captionEn || visibleItems[0].captionAr) && (
                  <p className="text-white text-base sm:text-lg font-bold mb-2">
                    {isAr ? visibleItems[0].captionAr || visibleItems[0].captionEn : visibleItems[0].captionEn}
                  </p>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  <Maximize2 className="w-3.5 h-3.5" />
                  {labels.viewFullscreen}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip for Remaining Items */}
            {visibleItems.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {visibleItems.slice(1).map((item, idx) => {
                  const actualIndex = idx + 1;
                  const caption = isAr ? item.captionAr || item.captionEn : item.captionEn;
                  return (
                    <div
                      key={item.id || actualIndex}
                      onClick={() => setLightboxIndex(actualIndex)}
                      className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all"
                    >
                      {item.mediaType === "VIDEO" ? (
                        <div className="relative w-full h-full bg-zinc-900">
                          {item.posterUrl ? (
                            <img src={item.posterUrl} alt={caption || "Video thumbnail"} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-6 h-6 text-zinc-500" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play className="w-6 h-6 text-white fill-current" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={isAr ? item.altTextAr || caption || "Gallery thumbnail" : item.altTextEn || caption || "Gallery thumbnail"}
                          loading="lazy"
                          style={getFocalStyle(item.focalPoint)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : normalizedLayout === "filmstrip" ? (
          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            {visibleItems.map((item, idx) => {
              const caption = isAr ? item.captionAr || item.captionEn : item.captionEn;
              return (
                <div
                  key={item.id || idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative rounded-3xl overflow-hidden aspect-[4/3] min-w-[280px] sm:min-w-[380px] md:min-w-[440px] shrink-0 bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer"
                >
                  {item.mediaType === "VIDEO" ? (
                    <div className="relative w-full h-full bg-zinc-900">
                      {item.posterUrl ? (
                        <img src={item.posterUrl} alt={caption || "Video preview"} className="w-full h-full object-cover" />
                      ) : (
                        <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 fill-current ms-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={isAr ? item.altTextAr || caption || "Gallery image" : item.altTextEn || caption || "Gallery image"}
                      loading="lazy"
                      style={getFocalStyle(item.focalPoint)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 motion-reduce:transition-none"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    {caption && <p className="text-white text-xs sm:text-sm font-semibold mb-2 line-clamp-2">{caption}</p>}
                    <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{labels.viewFullscreen}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid Layout (Default) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleItems.map((item, idx) => {
              const caption = isAr ? item.captionAr || item.captionEn : item.captionEn;
              return (
                <div
                  key={item.id || idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer"
                >
                  {item.mediaType === "VIDEO" ? (
                    <div className="relative w-full h-full bg-zinc-900">
                      {item.posterUrl ? (
                        <img src={item.posterUrl} alt={caption || "Video poster"} className="w-full h-full object-cover" />
                      ) : (
                        <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 fill-current ms-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={isAr ? item.altTextAr || caption || "Gallery image" : item.altTextEn || caption || "Gallery image"}
                      loading="lazy"
                      style={getFocalStyle(item.focalPoint)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 motion-reduce:transition-none"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    {caption && <p className="text-white text-xs sm:text-sm font-semibold mb-2 line-clamp-2">{caption}</p>}
                    <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{labels.viewFullscreen}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Accessible Lightbox Modal */}
      {lightboxIndex !== null && currentLightboxItem && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label={labels.galleryHeading}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxIndex(null)}
            aria-label={labels.closeLightbox}
            className="absolute top-6 end-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous / Next Controls */}
          {visibleItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev - 1 + visibleItems.length) % visibleItems.length : 0));
                }}
                aria-label={labels.previousImage}
                className="absolute start-4 sm:start-8 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer z-50 backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              >
                <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev + 1) % visibleItems.length : 0));
                }}
                aria-label={labels.nextImage}
                className="absolute end-4 sm:end-8 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer z-50 backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              >
                <ChevronRight className="w-6 h-6 rtl:rotate-180" />
              </button>
            </>
          )}

          {/* Lightbox Content Container */}
          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center select-none" onClick={(e) => e.stopPropagation()}>
            {currentLightboxItem.mediaType === "VIDEO" ? (
              <video
                src={currentLightboxItem.url}
                poster={currentLightboxItem.posterUrl}
                controls
                autoPlay
                className="max-w-full max-h-[72vh] rounded-2xl shadow-2xl mb-4 bg-black"
              />
            ) : (
              <img
                src={currentLightboxItem.url}
                alt={isAr ? currentLightboxItem.altTextAr || currentLightboxItem.captionAr || "Full Image" : currentLightboxItem.altTextEn || currentLightboxItem.captionEn || "Full Image"}
                className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl mb-4"
              />
            )}

            {(currentLightboxItem.captionEn || currentLightboxItem.captionAr) && (
              <p className="text-white text-sm sm:text-base font-medium text-center max-w-2xl px-4 leading-relaxed">
                {isAr ? currentLightboxItem.captionAr || currentLightboxItem.captionEn : currentLightboxItem.captionEn}
              </p>
            )}

            {visibleItems.length > 1 && (
              <span className="text-white/60 text-xs font-mono mt-2">
                {lightboxIndex + 1} / {visibleItems.length}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
