"use client";

import React, { useRef } from 'react';
import { useGSAPSafe } from '@/lib/motion/use-gsap-safe';
import { useMotionCapability } from '@/lib/motion/capability-context';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScrollSceneProps {
  children: React.ReactNode;
  onAnimate?: (ctx: gsap.Context, container: HTMLElement) => void;
  className?: string;
  pin?: boolean;
}

export function ScrollScene({
  children,
  onAnimate,
  className = '',
  pin = false,
}: ScrollSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { tier, isReducedMotion, isTouch } = useMotionCapability();

  useGSAPSafe(
    (ctx) => {
      if (!containerRef.current || !onAnimate) return;
      if (tier === 'minimal' || isReducedMotion) return;

      onAnimate(ctx, containerRef.current);
    },
    containerRef,
    [onAnimate, pin, tier, isReducedMotion, isTouch]
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}
    </div>
  );
}
