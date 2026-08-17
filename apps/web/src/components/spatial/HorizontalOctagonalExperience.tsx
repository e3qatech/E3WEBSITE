"use client";

import React, { useRef } from 'react';
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

  const effectiveSections = (Array.isArray(customSections) && customSections.length > 0)
    ? customSections
    : (Array.isArray(sections) && sections.length > 0 ? sections : DEFAULT_SPATIAL_SECTIONS);

  const { isSupported, isReducedMotion, tier, reason, isMounted } = useWebGLSupport();
  const isFallback = isMounted && (!isSupported || isReducedMotion || tier === 'minimal');

  const { scrollState, scrollToIndex, skipExperience } = useSpatialScroll({
    sections: effectiveSections,
    containerRef,
    trackRef,
    isReducedMotion: isFallback,
  });

  const activeSection = effectiveSections[scrollState.activeIndex] || effectiveSections[0];

  return (
    <section
      ref={containerRef}
      id="e3-spatial-barrel-experience"
      aria-label="E3 Horizontal Octagonal Experience"
      className={cn(
        "relative w-full text-white select-none",
        isFallback ? "min-h-screen bg-[#070a12]" : "h-screen bg-[#050811] overflow-hidden",
        className
      )}
    >
      {isFallback ? (
        <SpatialExperienceFallback
          sections={effectiveSections}
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

          {/* 2. Three.js R3F WebGL Octagonal Cylinder Scene */}
          <div ref={trackRef} className="absolute inset-0 w-full h-full">
            <OctagonalBarrelScene
              sections={effectiveSections}
              targetRotationX={scrollState.targetRotationX}
              activeIndex={scrollState.activeIndex}
              scrollVelocity={scrollState.scrollVelocity}
              isMobile={tier !== 'full'}
              tier={tier}
            />
          </div>

          {/* 3. Synchronized Semantic HTML DOM Layer */}
          <SpatialDOMLayer
            sections={effectiveSections}
            activeIndex={scrollState.activeIndex}
            locale={locale}
          />

          {/* 4. Navigation Dots, 01/08 Counter, and Scroll Direction Cues */}
          <SpatialProgress
            sections={effectiveSections}
            activeIndex={scrollState.activeIndex}
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
