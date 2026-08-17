"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SpatialSection, SpatialScrollState } from './spatial-experience.types';
import { SPATIAL_OCTAGON_CONFIG } from './spatial-experience.config';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface UseSpatialScrollOptions {
  sections: SpatialSection[];
  containerRef: React.RefObject<HTMLElement | null>;
  trackRef: React.RefObject<HTMLElement | null>;
  isReducedMotion?: boolean;
  onFaceChange?: (index: number, section: SpatialSection) => void;
}

export function useSpatialScroll({
  sections,
  containerRef,
  trackRef,
  isReducedMotion = false,
  onFaceChange,
}: UseSpatialScrollOptions) {
  const [scrollState, setScrollState] = useState<SpatialScrollState>({
    progress: 0,
    activeIndex: 0,
    targetRotationX: 0,
    currentRotationX: 0,
    scrollVelocity: 0,
    isPinned: false,
    isSettled: true,
    isReducedMotion,
  });

  const activeIndexRef = useRef<number>(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const lastProgressRef = useRef<number>(0);
  const hashUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);

  const faceCount = sections.length || SPATIAL_OCTAGON_CONFIG.faceCount;
  const maxStep = Math.max(1, faceCount - 1);
  const angleStep = SPATIAL_OCTAGON_CONFIG.angleStep;

  // Programmatic smooth scroll to specific face index (0..7)
  const scrollToIndex = useCallback((index: number) => {
    if (!scrollTriggerRef.current || isReducedMotion || typeof window === 'undefined') return;
    const clamped = Math.max(0, Math.min(index, faceCount - 1));
    const targetProgress = clamped / maxStep;
    const trigger = scrollTriggerRef.current;
    const targetScroll = trigger.start + targetProgress * (trigger.end - trigger.start);

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  }, [faceCount, maxStep, isReducedMotion]);

  // Skip the pinned spatial experience completely and release to lower page
  const skipExperience = useCallback(() => {
    if (!scrollTriggerRef.current || typeof window === 'undefined') return;
    const trigger = scrollTriggerRef.current;
    window.scrollTo({
      top: trigger.end + 60,
      behavior: 'smooth',
    });
  }, []);

  // Update URL hash with replaceState without polluting history stack
  const updateHashDebounced = useCallback((slug: string) => {
    if (typeof window === 'undefined' || !slug) return;
    if (hashUpdateTimerRef.current) clearTimeout(hashUpdateTimerRef.current);

    hashUpdateTimerRef.current = setTimeout(() => {
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash !== slug) {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}#${slug}`
        );
      }
    }, 150);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || isReducedMotion) return;

    const container = containerRef.current;
    const totalSteps = maxStep;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: () => `+=${totalSteps * window.innerHeight * 1.0}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.8,
      snap: {
        snapTo: (progress: number) => {
          // Snap strictly to nearest 1/7th step
          const raw = Math.round(progress * totalSteps) / totalSteps;
          return Math.max(0, Math.min(raw, 1));
        },
        duration: { min: 0.25, max: 0.6 },
        delay: 0.15,
        ease: 'power1.inOut',
      },
      onUpdate: (self) => {
        const p = Math.max(0, Math.min(self.progress, 1));
        const now = Date.now();
        const dt = Math.max(16, now - lastTimeRef.current);
        const dp = p - lastProgressRef.current;
        const velocity = (dp / (dt / 1000));

        lastTimeRef.current = now;
        lastProgressRef.current = p;

        // Continuous target rotation (scrolling down rotates barrel backwards around X so face rolls upward)
        const targetRotX = -p * totalSteps * angleStep;

        // Discrete active face calculation
        const calculatedIndex = Math.max(0, Math.min(Math.round(p * totalSteps), faceCount - 1));

        if (calculatedIndex !== activeIndexRef.current) {
          activeIndexRef.current = calculatedIndex;
          const activeSection = sections[calculatedIndex];
          if (activeSection) {
            updateHashDebounced(activeSection.slug);
            onFaceChange?.(calculatedIndex, activeSection);
          }
        }

        setScrollState((prev) => ({
          ...prev,
          progress: p,
          activeIndex: calculatedIndex,
          targetRotationX: targetRotX,
          scrollVelocity: velocity,
          isPinned: self.isActive,
          isSettled: Math.abs(velocity) < 0.05,
        }));
      },
      onToggle: (self) => {
        setScrollState((prev) => ({
          ...prev,
          isPinned: self.isActive,
        }));
      },
    });

    scrollTriggerRef.current = trigger;

    // Check initial hash on load if visitor landed directly on #attractions, etc.
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      const matchIdx = sections.findIndex((s) => s.slug === initialHash);
      if (matchIdx >= 0) {
        setTimeout(() => {
          scrollToIndex(matchIdx);
        }, 300);
      }
    }

    return () => {
      if (hashUpdateTimerRef.current) clearTimeout(hashUpdateTimerRef.current);
      if (trigger) {
        trigger.kill(true);
      }
      scrollTriggerRef.current = null;
    };
  }, [sections, containerRef, isReducedMotion, faceCount, maxStep, angleStep, scrollToIndex, updateHashDebounced, onFaceChange]);

  // Keyboard navigation
  useEffect(() => {
    if (typeof window === 'undefined' || isReducedMotion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation if spatial section is pinned or in viewport
      if (!scrollTriggerRef.current?.isActive) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToIndex(activeIndexRef.current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToIndex(activeIndexRef.current - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollToIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToIndex(faceCount - 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        skipExperience();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [faceCount, isReducedMotion, scrollToIndex, skipExperience]);

  return {
    scrollState,
    scrollToIndex,
    skipExperience,
  };
}
