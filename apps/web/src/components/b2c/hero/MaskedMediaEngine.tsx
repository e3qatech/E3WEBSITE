"use client";

import React, { useState, useEffect } from 'react';
import { MaskEngineProps, StandardMaskEngine } from './StandardMaskEngine';
import { LightweightMaskEngine } from './LightweightMaskEngine';
import { CinematicMaskEngine } from './CinematicMaskEngine';

export interface MaskedMediaEngineConfig extends MaskEngineProps {
  rendererMode?: 'CINEMATIC' | 'STANDARD' | 'LIGHTWEIGHT';
  disableShaderOnMobile?: boolean;
}

export function MaskedMediaEngine({
  rendererMode = 'STANDARD',
  disableShaderOnMobile = true,
  ...props
}: MaskedMediaEngineConfig) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  useEffect(() => {
    // Detect mobile viewport
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);

    // Detect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', checkMobile);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Use Lightweight engine for reduced motion or mobile when shader disabled
  if (prefersReducedMotion || (isMobile && disableShaderOnMobile) || rendererMode === 'LIGHTWEIGHT') {
    return <LightweightMaskEngine {...props} />;
  }

  // Use Cinematic 3D shader engine if requested and on desktop
  if (rendererMode === 'CINEMATIC' && !isMobile) {
    return <CinematicMaskEngine {...props} />;
  }

  // Default Standard Engine (CSS/SVG mask + Framer Motion/GSAP)
  return <StandardMaskEngine {...props} />;
}
