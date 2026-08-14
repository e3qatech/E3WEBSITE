/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useSyncExternalStore } from 'react';
import { CapabilityTier, MotionCapabilityState, ViewportCapability } from './types';
import { isWebGLSupported, isWebGL2Supported } from '@/lib/webgl-capability';

const DEFAULT_VIEWPORT: ViewportCapability = {
  width: 1280,
  height: 800,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isLandscape: true,
};

const DEFAULT_STATE: MotionCapabilityState = {
  tier: 'balanced',
  isWebGLAvailable: true,
  isWebGL2Available: true,
  isReducedMotion: false,
  isDataSaver: false,
  isTouch: false,
  isLowPower: false,
  viewport: DEFAULT_VIEWPORT,
  isHydrated: false,
  setTierOverride: () => {},
};

const MotionCapabilityContext = createContext<MotionCapabilityState>(DEFAULT_STATE);

export interface MotionCapabilityProviderProps {
  children: React.ReactNode;
  initialTier?: CapabilityTier;
}

const emptySubscribe = () => () => {};

/**
 * Calculates the operational capability tier based on active environmental signals.
 */
export function calculateTier(signals: {
  isReducedMotion: boolean;
  isDataSaver: boolean;
  isWebGLAvailable: boolean;
  isWebGL2Available: boolean;
  isTouch: boolean;
  viewport: ViewportCapability;
}): CapabilityTier {
  // Minimal tier triggers: explicit user preference, data saver, or total absence of WebGL
  if (signals.isReducedMotion || signals.isDataSaver || !signals.isWebGLAvailable) {
    return 'minimal';
  }

  // Full tier requirements: WebGL/WebGL2 available, desktop/large tablet, non-touch/fine pointer
  if (signals.viewport.isDesktop && !signals.isTouch && signals.isWebGL2Available) {
    return 'full';
  }

  // Balanced tier: mobile devices, touch laptops, or standard WebGL without WebGL2
  return 'balanced';
}

export function MotionCapabilityProvider({
  children,
  initialTier = 'balanced',
}: MotionCapabilityProviderProps) {
  const [tierOverride, setTierOverride] = useState<CapabilityTier | null>(null);
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isDataSaver, setIsDataSaver] = useState(false);
  const [isWebGLAvailable, setIsWebGLAvailable] = useState(true);
  const [isWebGL2Available, setIsWebGL2Available] = useState(true);
  const [isTouch, setIsTouch] = useState(false);
  const [viewport, setViewport] = useState<ViewportCapability>(DEFAULT_VIEWPORT);

  // Client-side detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Reduced Motion Detection
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // 2. Data Saver Detection
    const nav = navigator as any;
    if (nav.connection?.saveData) {
      setIsDataSaver(true);
    }

    // 3. WebGL Capabilities
    const glSupported = isWebGLSupported();
    const gl2Supported = isWebGL2Supported();
    setIsWebGLAvailable(glSupported);
    setIsWebGL2Available(gl2Supported);

    // 4. Pointer & Touch Detection
    const pointerQuery = window.matchMedia('(pointer: coarse)');
    setIsTouch(pointerQuery.matches || 'ontouchstart' in window);
    const handlePointerChange = (e: MediaQueryListEvent) => {
      setIsTouch(e.matches);
    };
    pointerQuery.addEventListener('change', handlePointerChange);

    // 5. Viewport Detection
    const updateViewport = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setViewport({
        width: w,
        height: h,
        isMobile: w < 768,
        isTablet: w >= 768 && w < 1024,
        isDesktop: w >= 1024,
        isLandscape: w > h,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      pointerQuery.removeEventListener('change', handlePointerChange);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  const calculatedTier = useMemo(() => {
    if (tierOverride) return tierOverride;
    if (!isHydrated) return initialTier;

    return calculateTier({
      isReducedMotion,
      isDataSaver,
      isWebGLAvailable,
      isWebGL2Available,
      isTouch,
      viewport,
    });
  }, [
    tierOverride,
    isHydrated,
    initialTier,
    isReducedMotion,
    isDataSaver,
    isWebGLAvailable,
    isWebGL2Available,
    isTouch,
    viewport,
  ]);

  const value: MotionCapabilityState = useMemo(
    () => ({
      tier: calculatedTier,
      isWebGLAvailable,
      isWebGL2Available,
      isReducedMotion,
      isDataSaver,
      isTouch,
      isLowPower: isReducedMotion || isDataSaver,
      viewport,
      isHydrated,
      setTierOverride,
    }),
    [
      calculatedTier,
      isWebGLAvailable,
      isWebGL2Available,
      isReducedMotion,
      isDataSaver,
      isTouch,
      viewport,
      isHydrated,
    ]
  );

  return (
    <MotionCapabilityContext.Provider value={value}>
      {children}
    </MotionCapabilityContext.Provider>
  );
}

export function useMotionCapability(): MotionCapabilityState {
  return useContext(MotionCapabilityContext);
}

export function useWebGLCapability(): {
  isWebGLAvailable: boolean;
  isWebGL2Available: boolean;
  tier: CapabilityTier;
} {
  const { isWebGLAvailable, isWebGL2Available, tier } = useContext(MotionCapabilityContext);
  return { isWebGLAvailable, isWebGL2Available, tier };
}

export function useReducedMotion(): boolean {
  const { isReducedMotion, tier } = useContext(MotionCapabilityContext);
  return isReducedMotion || tier === 'minimal';
}

export function useViewportCapability(): ViewportCapability {
  const { viewport } = useContext(MotionCapabilityContext);
  return viewport;
}
