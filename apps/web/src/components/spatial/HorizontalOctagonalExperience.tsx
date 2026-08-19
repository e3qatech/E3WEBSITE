"use client";

import React, { useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SpatialSection } from './spatial-experience.types';
import { DEFAULT_SPATIAL_SECTIONS } from './spatial-experience.config';
import { useWebGLSupport } from './useWebGLSupport';
import { useSpatialScroll } from './useSpatialScroll';
import { SpatialDOMLayer } from './SpatialDOMLayer';
import { SpatialProgress } from './SpatialProgress';
import { SpatialNavigation } from './SpatialNavigation';
import { SpatialExperienceFallback } from './SpatialExperienceFallback';
import { cn } from '@/lib/utils';

// Dynamically import Three.js Scene with SSR disabled to prevent hydration mismatch
const OctagonalBarrelScene = dynamic(
  () => import('./OctagonalBarrelScene').then((m) => m.OctagonalBarrelScene),
  { ssr: false }
);

export interface HorizontalOctagonalExperienceProps {
  sections?: SpatialSection[];
  customSections?: SpatialSection[];
  locale?: string;
  className?: string;
}

export function HorizontalOctagonalExperience({
  sections = DEFAULT_SPATIAL_SECTIONS,
  customSections,
  locale = 'en',
  className = '',
}: HorizontalOctagonalExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const rawSections = (Array.isArray(customSections) && customSections.length > 0)
    ? customSections
    : (Array.isArray(sections) && sections.length > 0 ? sections : DEFAULT_SPATIAL_SECTIONS);

  // 1. Filter visible sections ONCE at the root and assign canonical continuous numbering
  const visibleSections: SpatialSection[] = useMemo(() => {
    return rawSections
      .filter((s) => s && s.visibility !== false)
      .map((s, idx) => ({
        ...s,
        sectionNumber: String(idx + 1).padStart(2, '0'),
        sortOrder: idx,
      }));
  }, [rawSections]);

  const { isSupported, isReducedMotion, tier, reason, isMounted } = useWebGLSupport();
  
  // Single section or zero section boundary condition
  const isZeroSection = visibleSections.length === 0;
  const isSingleSection = visibleSections.length === 1;
  const isFallback = isMounted && (!isSupported || isReducedMotion || tier === 'minimal' || isZeroSection);

  const { scrollState, scrollToIndex, skipExperience } = useSpatialScroll({
    sections: visibleSections,
    containerRef,
    trackRef,
    isReducedMotion: isFallback || isSingleSection,
  });

  const activeIndex = Math.min(scrollState.activeIndex, Math.max(0, visibleSections.length - 1));
  const activeSection = visibleSections[activeIndex] || visibleSections[0] || rawSections[0];

  // 0 Visible Sections: Empty/Fallback render without 3D scene or scroll interception
  if (isZeroSection) {
    return (
      <section
        id="e3-spatial-barrel-experience"
        aria-label={locale === 'ar' ? 'الأسطوانة التفاعلية' : 'E3 Spatial Barrel Experience'}
        className={cn("relative w-full min-h-screen bg-[#070a12] text-white flex items-center justify-center p-8", className)}
      >
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold">{locale === 'ar' ? 'لا توجد أقسام متاحة حالياً' : 'No Sections Available'}</h2>
          <p className="text-zinc-400 text-sm">
            {locale === 'ar'
              ? 'يرجى تفعيل أقسام العرض التفاعلي من خلال لوحة التحكم.'
              : 'Please enable spatial sections in the CMS dashboard.'}
          </p>
        </div>
      </section>
    );
  }

  // 1 Visible Section: Render statically without 3D rotation, pinning, or artificial scroll height
  if (isSingleSection) {
    return (
      <section
        id="e3-spatial-barrel-experience"
        aria-label={locale === 'ar' ? 'الأسطوانة التفاعلية' : 'E3 Spatial Barrel Experience'}
        className={cn("relative w-full min-h-screen bg-[#050811] text-white overflow-hidden", className)}
      >
        <SpatialNavigation
          activeSection={activeSection}
          locale={locale}
          onSkip={skipExperience}
        />
        <SpatialDOMLayer
          sections={visibleSections}
          activeIndex={0}
          locale={locale}
        />
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      id="e3-spatial-barrel-experience"
      aria-label={locale === 'ar' ? 'الأسطوانة التفاعلية' : 'E3 Horizontal Octagonal Experience'}
      className={cn(
        "relative w-full text-white select-none",
        isFallback ? "min-h-screen bg-[#070a12]" : "h-screen bg-[#050811] overflow-hidden",
        className
      )}
    >
      {isFallback ? (
        <SpatialExperienceFallback
          sections={visibleSections}
          locale={locale}
          reason={reason}
        />
      ) : (
        <>
          {/* 1. Floating Header Navigation (Back & Skip) */}
          <SpatialNavigation
            activeSection={activeSection}
            locale={locale}
            onSkip={skipExperience}
          />

          {/* 2. Three.js R3F WebGL Virtualized Recycled Octagonal Cylinder Scene */}
          <div ref={trackRef} className="absolute inset-0 w-full h-full">
            <OctagonalBarrelScene
              sections={visibleSections}
              targetRotationX={scrollState.targetRotationX}
              activeIndex={activeIndex}
              scrollVelocity={scrollState.scrollVelocity}
              isMobile={tier !== 'full'}
              tier={tier}
            />
          </div>

          {/* 3. Synchronized Semantic HTML DOM Layer */}
          <SpatialDOMLayer
            sections={visibleSections}
            activeIndex={activeIndex}
            locale={locale}
          />

          {/* 4. Navigation Dots, Dynamic 01/NN Counter, and Scroll Direction Cues */}
          <SpatialProgress
            sections={visibleSections}
            activeIndex={activeIndex}
            progress={scrollState.progress}
            locale={locale}
            onSelectIndex={scrollToIndex}
          />
        </>
      )}
    </section>
  );
}

export default HorizontalOctagonalExperience;
