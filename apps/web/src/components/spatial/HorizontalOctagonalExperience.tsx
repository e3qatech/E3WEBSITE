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

// Dynamically import Three.js Scene with SSR disabled to prevent hydration mismatch
const OctagonalBarrelScene = dynamic(
  () => import('./OctagonalBarrelScene').then((m) => m.OctagonalBarrelScene),
  { ssr: false }
);

export interface HorizontalOctagonalExperienceProps {
  sections?: SpatialSection[];
  locale?: string;
  className?: string;
}

export function HorizontalOctagonalExperience({
  sections = DEFAULT_SPATIAL_SECTIONS,
  locale = 'en',
  className = '',
}: HorizontalOctagonalExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const { isSupported, isReducedMotion, tier, reason } = useWebGLSupport();

  const { scrollState, scrollToIndex, skipExperience } = useSpatialScroll({
    sections,
    containerRef,
    trackRef,
    isReducedMotion,
  });

  const activeSection = sections[scrollState.activeIndex] || sections[0];

  // If WebGL is not supported or reduced motion is preferred, render clean accessible fallback
  if (!isSupported || isReducedMotion || tier === 'minimal') {
    return (
      <SpatialExperienceFallback
        sections={sections}
        locale={locale}
        reason={reason}
      />
    );
  }

  return (
    <section
      ref={containerRef}
      id="e3-spatial-barrel-experience"
      aria-label="E3 Horizontal Octagonal Experience"
      className={`relative w-full h-screen bg-[#050811] text-white overflow-hidden select-none ${className}`}
    >
      {/* 1. Floating Header Navigation (Back & Skip) */}
      <SpatialNavigation
        activeSection={activeSection}
        locale={locale}
        onSkip={skipExperience}
      />

      {/* 2. Three.js R3F WebGL Octagonal Cylinder Scene */}
      <div ref={trackRef} className="absolute inset-0 w-full h-full">
        <OctagonalBarrelScene
          sections={sections}
          targetRotationX={scrollState.targetRotationX}
          activeIndex={scrollState.activeIndex}
          scrollVelocity={scrollState.scrollVelocity}
          isMobile={tier !== 'full'}
          tier={tier}
        />
      </div>

      {/* 3. Synchronized Semantic HTML DOM Layer */}
      <SpatialDOMLayer
        sections={sections}
        activeIndex={scrollState.activeIndex}
        locale={locale}
      />

      {/* 4. Navigation Dots, 01/08 Counter, and Scroll Direction Cues */}
      <SpatialProgress
        sections={sections}
        activeIndex={scrollState.activeIndex}
        progress={scrollState.progress}
        locale={locale}
        onSelectIndex={scrollToIndex}
      />
    </section>
  );
}

export default HorizontalOctagonalExperience;
