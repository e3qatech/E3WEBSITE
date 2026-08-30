"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startLaser = useCallback(() => {
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    setVisible(true);
    setProgress(28);

    timerRef.current = setTimeout(() => {
      setProgress(68);
      timerRef.current = setTimeout(() => {
        setProgress(88);
      }, 300);
    }, 150);
  }, []);

  const finishLaser = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setProgress(100);

    finishTimerRef.current = setTimeout(() => {
      setVisible(false);
      finishTimerRef.current = setTimeout(() => {
        setProgress(0);
      }, 200);
    }, 250);
  }, []);

  // Finish laser whenever pathname or searchParams finish updating
  useEffect(() => {
    finishLaser();
  }, [pathname, searchParams, finishLaser]);

  // Click listener on all internal links for 0ms instantaneous laser response
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore hash anchors, external links, mailto, tel, downloads, or target="_blank"
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if internal domain or relative path
      const isInternal =
        href.startsWith("/") ||
        href.startsWith(window.location.origin);

      if (isInternal) {
        // If clicking current exact URL, do nothing
        const url = new URL(href, window.location.origin);
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }
        startLaser();
      }
    };

    const handlePopState = () => {
      startLaser();
    };

    window.addEventListener("click", handleDocumentClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("click", handleDocumentClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, [startLaser]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="route-laser-bar"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Top Ambient Downward Illumination Flare */}
      <div
        className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-cyan-500/20 via-emerald-500/5 to-transparent pointer-events-none transition-opacity duration-300"
        style={{
          opacity: progress > 0 && progress < 100 ? 1 : 0,
        }}
      />

      {/* Main Laser Beam Container (3px Height) */}
      <div className="relative w-full h-[3px] bg-black/40 overflow-hidden">
        {/* Kinetic Laser Gradient Bar */}
        <div
          className="h-full bg-gradient-to-r from-violet-600 via-cyan-400 to-emerald-400 shadow-[0_0_16px_rgba(6,182,212,0.9),0_0_24px_rgba(16,185,129,0.8)] transition-all duration-300 ease-out relative"
          style={{
            width: `${progress}%`,
          }}
        >
          {/* Laser Core Flare */}
          <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-white/70 to-white blur-[1px]" />
        </div>

        {/* Radiant Comet Head Point */}
        <div
          className="absolute top-0 h-[5px] -mt-[1px] w-6 bg-white rounded-full blur-[1px] shadow-[0_0_12px_#06b6d4,0_0_20px_#10b981,0_0_4px_#ffffff] transition-all duration-300 ease-out"
          style={{
            left: `calc(${progress}% - 12px)`,
            opacity: progress > 0 && progress < 100 ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
}

