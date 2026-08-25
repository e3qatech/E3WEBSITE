"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Layers, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TransformationItem {
  id?: string;
  beforeUrl: string;
  afterUrl: string;
  titleEn?: string;
  titleAr?: string;
  beforeLabelEn?: string;
  beforeLabelAr?: string;
  afterLabelEn?: string;
  afterLabelAr?: string;
  captionEn?: string;
  captionAr?: string;
}

export interface BeforeAfterTransformationStageProps {
  config: {
    enabled?: boolean;
    titleEn?: string;
    titleAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    items?: TransformationItem[];
  };
  locale: string;
}

interface SingleComparisonSliderProps {
  item: TransformationItem;
  position: number;
  onPositionChange: (newPosition: number) => void;
  locale: string;
}

function SingleComparisonSlider({
  item,
  position,
  onPositionChange,
  locale,
}: SingleComparisonSliderProps) {
  const isAr = locale === "ar";
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const beforeLabel = isAr
    ? item.beforeLabelAr || item.beforeLabelEn || "قبل التنفيذ"
    : item.beforeLabelEn || "Before Build";
  const afterLabel = isAr
    ? item.afterLabelAr || item.afterLabelEn || "التشغيل الحي"
    : item.afterLabelEn || "Live Activation";
  const caption = isAr ? item.captionAr || item.captionEn : item.captionEn;

  const updateFromClientX = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const rawX = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (rawX / rect.width) * 100));
      onPositionChange(Math.round(pct * 10) / 10);
    },
    [onPositionChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    updateFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onPositionChange(Math.max(0, position - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onPositionChange(Math.min(100, position + 5));
    } else if (e.key === "Home") {
      e.preventDefault();
      onPositionChange(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onPositionChange(100);
    }
  };

  return (
    <div className="space-y-4">
      {/* Interactive Comparison Canvas */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border border-[var(--border-level-2)] bg-[var(--surface-default)] select-none touch-none cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xl"
        tabIndex={0}
        role="slider"
        aria-label={`${item.titleEn || "Transformation"} comparison slider`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={position}
        aria-valuetext={`${Math.round(position)}% Before view`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        {/* Background Layer: AFTER (Full Width) */}
        <img
          src={item.afterUrl}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute top-4 end-4 z-10 px-3.5 py-1.5 bg-emerald-500 text-zinc-950 font-mono font-bold text-xs rounded-full uppercase tracking-wider shadow-lg backdrop-blur-md">
          {afterLabel}
        </div>

        {/* Foreground Clipped Layer: BEFORE */}
        <div
          className="absolute inset-0 overflow-hidden border-e-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.9)] z-20 pointer-events-none"
          style={{ width: `${position}%` }}
        >
          {/* Inner image locked to 100% of the parent frame width */}
          <div
            className="absolute inset-0"
            style={{
              width: containerWidth ? `${containerWidth}px` : "100%",
              height: "100%",
            }}
          >
            <img
              src={item.beforeUrl}
              alt={beforeLabel}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute top-4 start-4 px-3.5 py-1.5 bg-zinc-900/90 text-amber-400 font-mono font-bold text-xs rounded-full uppercase tracking-wider border border-amber-400/30 shadow-lg backdrop-blur-md">
            {beforeLabel}
          </div>
        </div>

        {/* Scoped Center Handle Button */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.8)] z-30 pointer-events-none transition-transform group-hover:scale-110"
          style={{ left: `calc(${position}% - 20px)` }}
          aria-hidden="true"
        >
          ↔
        </div>

        {/* Hidden Accessible Range Input for Full Assistive Device Parity */}
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(e) => onPositionChange(Number(e.target.value))}
          className="sr-only"
          aria-label={`${item.titleEn || "Transformation"} comparison percentage`}
        />
      </div>

      {/* Localized Caption */}
      {caption && (
        <div className="text-center">
          <p className="text-xs md:text-sm font-mono text-zinc-400 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>{caption}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export function BeforeAfterTransformationStage({
  config,
  locale,
}: BeforeAfterTransformationStageProps) {
  const isAr = locale === "ar";
  const items = Array.isArray(config?.items)
    ? config.items.filter((tr) => tr.beforeUrl && tr.afterUrl)
    : [];

  const [activeProjectIdx, setActiveProjectIdx] = useState<number>(0);

  // CRITICAL INDEPENDENCE: Record map storing independent position per project ID/index
  const [positionsMap, setPositionsMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    items.forEach((item, idx) => {
      const key = item.id || `tr_${idx}`;
      initial[key] = 50;
    });
    return initial;
  });

  const handlePositionChange = useCallback((key: string, newPos: number) => {
    setPositionsMap((prev) => ({
      ...prev,
      [key]: newPos,
    }));
  }, []);

  if (config?.enabled === false || items.length === 0) return null;

  const sectionTitle = isAr
    ? config.titleAr || "التحول الفضائي قبل وبعد التنفيذ"
    : config.titleEn || "Before & After Spatial Transformations";
  const sectionEyebrow = isAr ? "الهندسة والتحول الفضائي" : "SPATIAL EVOLUTION";

  const currentItem = items[activeProjectIdx] || items[0];
  const currentKey = currentItem.id || `tr_${activeProjectIdx}`;
  const currentPosition = positionsMap[currentKey] ?? 50;

  return (
    <section className="py-24 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] relative overflow-hidden transition-colors">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-[var(--surface-default)] text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>{sectionEyebrow}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight">
            {sectionTitle}
          </h2>
        </div>

        {/* Project Selector Tabs */}
        {items.length > 1 && (
          <div className="flex items-center justify-center mb-10">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[var(--surface-default)]/90 backdrop-blur-md border border-[var(--border-level-2)] shadow-md overflow-x-auto max-w-full no-scrollbar py-1.5">
              {items.map((item, idx) => {
                const tabTitle = isAr
                  ? item.titleAr || item.titleEn || `مشروع ${idx + 1}`
                  : item.titleEn || `Project ${idx + 1}`;
                const isSelected = idx === activeProjectIdx;

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveProjectIdx(idx)}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 cursor-pointer shrink-0",
                      isSelected
                        ? "font-black bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    )}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{tabTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Focused Active Transformation Canvas */}
        <div className="max-w-5xl mx-auto">
          <SingleComparisonSlider
            key={currentKey}
            item={currentItem}
            position={currentPosition}
            onPositionChange={(pos) => handlePositionChange(currentKey, pos)}
            locale={locale}
          />
        </div>
      </div>
    </section>
  );
}
