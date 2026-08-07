"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locomotiveRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Never activate smooth scroll on dashboard or mobile screens
    const isDashboard = pathname?.includes("/dashboard");
    const isMobile = window.innerWidth < 1024;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isDashboard || isMobile || prefersReducedMotion) {
      if (locomotiveRef.current) {
        try {
          locomotiveRef.current.destroy();
          locomotiveRef.current = null;
        } catch (_e) {}
      }
      return;
    }

    let isSubscribed = true;

    // Dynamic import Locomotive Scroll v5
    import("locomotive-scroll").then((module) => {
      if (!isSubscribed) return;
      const LocomotiveScroll = module.default;
      try {
        locomotiveRef.current = new LocomotiveScroll({
          lenisOptions: {
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
          },
        });
      } catch (err) {
        console.warn("[LOCOMOTIVE_SCROLL_INIT_NOTICE]", err);
      }
    }).catch(() => {});

    return () => {
      isSubscribed = false;
      if (locomotiveRef.current) {
        try {
          locomotiveRef.current.destroy();
          locomotiveRef.current = null;
        } catch (_e) {}
      }
    };
  }, [pathname]);

  return <>{children}</>;
}
