"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useMotionCapability } from './capability-context';

type GSAPContextCallback = (context: gsap.Context) => void;

/**
 * Safely executes GSAP animations within a managed `gsap.context()`.
 * Automatically cleans up all timelines, tweens, and ScrollTriggers on component unmount.
 * In 'minimal' mode or when reduced motion is preferred, complex scrubbers are disabled.
 */
export function useGSAPSafe(
  callback: GSAPContextCallback,
  scopeRef?: React.RefObject<HTMLElement | null>,
  dependencies: any[] = []
) {
  const { tier, isReducedMotion } = useMotionCapability();
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create a scoped GSAP context
    const ctx = gsap.context((self) => {
      // If minimal tier or reduced motion, allow basic setup but avoid intensive scrolling triggers
      if (tier === 'minimal' || isReducedMotion) {
        return;
      }

      try {
        callback(self);
      } catch (err) {
        console.warn('[E3 GSAP Safe] Error inside GSAP animation callback:', err);
      }
    }, scopeRef?.current || undefined);

    contextRef.current = ctx;

    return () => {
      ctx.revert();
      contextRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, isReducedMotion, ...dependencies]);

  return contextRef;
}
