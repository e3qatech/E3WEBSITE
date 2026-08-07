"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

export type FrameCallback = (time: number, delta: number) => void;

interface ExperienceRuntimeContextType {
  registerFrame: (id: string, callback: FrameCallback) => void;
  unregisterFrame: (id: string) => void;
  isPaused: boolean;
}

const ExperienceRuntimeContext = createContext<ExperienceRuntimeContextType>({
  registerFrame: () => {},
  unregisterFrame: () => {},
  isPaused: false,
});

export function ExperienceRuntime({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const callbacksRef = useRef<Map<string, FrameCallback>>(new Map());
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const isPausedRef = useRef<boolean>(false);

  const registerFrame = useCallback((id: string, callback: FrameCallback) => {
    callbacksRef.current.set(id, callback);
  }, []);

  const unregisterFrame = useCallback((id: string) => {
    callbacksRef.current.delete(id);
  }, []);

  // Main Single RAF Loop
  useEffect(() => {
    let active = true;

    const loop = (now: number) => {
      if (!active) return;

      const delta = Math.min((now - lastTimeRef.current) / 1000, 0.1); // Cap delta at 100ms
      lastTimeRef.current = now;

      if (!isPausedRef.current) {
        callbacksRef.current.forEach((cb) => {
          try {
            cb(now, delta);
          } catch (err) {
            console.error("[EXPERIENCE_RUNTIME_FRAME_ERROR]", err);
          }
        });
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Handle Document Visibility Changes (Pause when hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPausedRef.current = document.hidden;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Refresh GSAP ScrollTrigger on Route Changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    import("gsap/ScrollTrigger").then((mod) => {
      const ScrollTrigger = mod.default || mod.ScrollTrigger;
      if (ScrollTrigger) {
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      }
    }).catch(() => {});
  }, [pathname]);

  return (
    <ExperienceRuntimeContext.Provider
      value={{
        registerFrame,
        unregisterFrame,
        isPaused: isPausedRef.current,
      }}
    >
      {children}
    </ExperienceRuntimeContext.Provider>
  );
}

export function useExperienceRuntime() {
  return useContext(ExperienceRuntimeContext);
}
