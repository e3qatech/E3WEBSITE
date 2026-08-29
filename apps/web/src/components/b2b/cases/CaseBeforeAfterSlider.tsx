"use client";

import React, { useState, useRef, useCallback } from "react";
import { Sparkles, MoveHorizontal } from "lucide-react";
import { CaseStudyBeforeAfterPayload } from "@/lib/case-studies/case-adapters";
import { CASE_STUDY_LABELS } from "@/lib/case-studies/case-labels";

interface CaseBeforeAfterSliderProps {
  beforeAfter?: CaseStudyBeforeAfterPayload | null;
  locale: string;
}

export function CaseBeforeAfterSlider({
  beforeAfter,
  locale,
}: CaseBeforeAfterSliderProps) {
  const isAr = locale === "ar";
  const labels = CASE_STUDY_LABELS.detail;

  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(isAr ? 100 - percentage : percentage);
    },
    [isAr]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    },
    [handleMove]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    },
    [isDragging, handleMove]
  );

  if (!beforeAfter || !beforeAfter.beforeImageUrl || !beforeAfter.afterImageUrl) {
    return null;
  }

  const beforeCaption = isAr
    ? beforeAfter.beforeCaptionAr || beforeAfter.beforeCaptionEn || labels.beforeLabel.ar
    : beforeAfter.beforeCaptionEn || labels.beforeLabel.en;

  const afterCaption = isAr
    ? beforeAfter.afterCaptionAr || beforeAfter.afterCaptionEn || labels.afterLabel.ar
    : beforeAfter.afterCaptionEn || labels.afterLabel.en;

  return (
    <section
      id="before-after-section"
      className="py-20 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] transition-colors"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{labels.beforeAfterTitle[isAr ? "ar" : "en"]}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-3">
            {isAr ? "التحول المكاني والهندسي للموقع" : "Spatial & Operational Transformation"}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {isAr
              ? "اسحب المؤشر لمقارنة حالة الموقع الأصلية مع التجربة المنفذة بالكامل."
              : "Drag the slider to compare the raw site baseline against the fully delivered environment."}
          </p>
        </div>

        {/* Interactive Comparison Stage */}
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative max-w-5xl mx-auto aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden border border-[var(--border-level-2)] select-none cursor-ew-resize shadow-2xl bg-[var(--surface-default)]"
        >
          {/* After Image (Full Background) */}
          <img
            src={beforeAfter.afterImageUrl}
            alt={afterCaption}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Before Image (Clipped Overlay) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              clipPath: isAr
                ? `polygon(0 0, ${100 - sliderPosition}% 0, ${100 - sliderPosition}% 100%, 0 100%)`
                : `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
            }}
          >
            <img
              src={beforeAfter.beforeImageUrl}
              alt={beforeCaption}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
            style={{
              [isAr ? "right" : "left"]: `${sliderPosition}%`,
            }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-11 h-11 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg border-2 border-white">
              <MoveHorizontal className="w-5 h-5" />
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-4 start-4 z-10 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-md">
            {labels.beforeLabel[isAr ? "ar" : "en"]}: {beforeCaption}
          </div>
          <div className="absolute top-4 end-4 z-10 px-3.5 py-1.5 rounded-full bg-emerald-700/80 backdrop-blur-md border border-emerald-500/30 text-xs font-bold text-white shadow-md">
            {labels.afterLabel[isAr ? "ar" : "en"]}: {afterCaption}
          </div>
        </div>
      </div>
    </section>
  );
}
