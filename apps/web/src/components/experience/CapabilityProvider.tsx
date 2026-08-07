"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CapabilityTier = "TIER_A" | "TIER_B" | "TIER_C";

export interface CapabilityContextType {
  tier: CapabilityTier;
  isTouch: boolean;
  prefersReducedMotion: boolean;
  dpr: number;
  maxParticles: number;
  webglSupported: boolean;
}

const defaultCapability: CapabilityContextType = {
  tier: "TIER_A",
  isTouch: false,
  prefersReducedMotion: false,
  dpr: 1,
  maxParticles: 1500,
  webglSupported: true,
};

const CapabilityContext = createContext<CapabilityContextType>(defaultCapability);

export function CapabilityProvider({ children }: { children: React.ReactNode }) {
  const [capability, setCapability] = useState<CapabilityContextType>(defaultCapability);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect touch device
    const isTouch =
      "ontouchstart" in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;

    // Detect reduced motion preference
    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Check WebGL availability
    let webglSupported = false;
    try {
      const canvas = document.createElement("canvas");
      webglSupported = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (_e) {
      webglSupported = false;
    }

    // Hardware concurrency & device memory estimation
    const concurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const isMobileViewport = window.innerWidth < 1024;

    let tier: CapabilityTier = "TIER_A";
    let maxParticles = 2000;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (prefersReducedMotion || !webglSupported || isMobileViewport || deviceMemory < 4 || concurrency < 4) {
      tier = "TIER_C";
      maxParticles = 300;
      dpr = 1;
    } else if (deviceMemory <= 6 || concurrency <= 6) {
      tier = "TIER_B";
      maxParticles = 1000;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    }

    setCapability({
      tier,
      isTouch,
      prefersReducedMotion,
      dpr,
      maxParticles,
      webglSupported,
    });
  }, []);

  return (
    <CapabilityContext.Provider value={capability}>
      {children}
    </CapabilityContext.Provider>
  );
}

export function useCapability() {
  return useContext(CapabilityContext);
}
