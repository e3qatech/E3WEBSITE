"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface E3LogoProps {
  isLight?: boolean;
  lightLogoUrl?: string;
  darkLogoUrl?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

// Global in-memory cache to prevent multiple /api/settings fetches across components
let globalSettingsLogoCache: { lightLogoUrl?: string; darkLogoUrl?: string } | null = null;
let globalSettingsFetchPromise: Promise<{ lightLogoUrl?: string; darkLogoUrl?: string }> | null = null;

async function fetchGeneralLogos() {
  if (globalSettingsLogoCache) return globalSettingsLogoCache;
  if (!globalSettingsFetchPromise) {
    globalSettingsFetchPromise = fetch("/api/settings?type=GENERAL")
      .then((res) => (res.ok ? res.json() : {}))
      .then((json) => {
        const data = (json as any)?.data || {};
        const logos = {
          lightLogoUrl: data.lightLogoUrl || undefined,
          darkLogoUrl: data.darkLogoUrl || undefined,
        };
        globalSettingsLogoCache = logos;
        return logos;
      })
      .catch(() => ({}));
  }
  return globalSettingsFetchPromise;
}

export function E3Logo({
  isLight = false,
  lightLogoUrl: propLightUrl,
  darkLogoUrl: propDarkUrl,
  className,
  size = "md",
  showText = false,
}: E3LogoProps) {
  const [fetchedLogos, setFetchedLogos] = useState<{ lightLogoUrl?: string; darkLogoUrl?: string }>(
    globalSettingsLogoCache || {}
  );

  useEffect(() => {
    if (!propLightUrl && !propDarkUrl && !globalSettingsLogoCache) {
      fetchGeneralLogos().then((logos) => {
        setFetchedLogos(logos);
      });
    }
  }, [propLightUrl, propDarkUrl]);

  const lightLogoUrl = propLightUrl || fetchedLogos.lightLogoUrl;
  const darkLogoUrl = propDarkUrl || fetchedLogos.darkLogoUrl;

  // If explicit image URLs are provided via CMS, props, or settings
  const activeLogoUrl = isLight ? (lightLogoUrl || darkLogoUrl) : (darkLogoUrl || lightLogoUrl);

  if (activeLogoUrl) {
    return (
      <div className={cn("inline-flex items-center gap-2.5 shrink-0", className)}>
        <img
          src={activeLogoUrl}
          alt="E3 Qatar Logo"
          className={cn(
            "object-contain w-auto",
            size === "sm" && "h-7",
            size === "md" && "h-9",
            size === "lg" && "h-11",
            size === "xl" && "h-14"
          )}
        />
        {showText && (
          <div className="flex flex-col select-none">
            <span
              className={cn(
                "font-black tracking-tight leading-none text-transparent bg-clip-text",
                size === "sm" && "text-sm",
                size === "md" && "text-base",
                size === "lg" && "text-xl",
                size === "xl" && "text-2xl",
                isLight
                  ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
                  : "bg-gradient-to-r from-white via-slate-200 to-slate-400"
              )}
            >
              E3 QATAR
            </span>
          </div>
        )}
      </div>
    );
  }

  // Built-in Dynamic Box-Free Vector Logo
  const svgWidth = size === "sm" ? 42 : size === "md" ? 54 : size === "lg" ? 68 : 84;
  const svgHeight = size === "sm" ? 20 : size === "md" ? 24 : size === "lg" ? 30 : 36;

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none transition-colors duration-300 shrink-0", className)}>
      {/* Box-Free Stylized E3 Vector Mark */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox="0 0 76 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="e3BrandGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="e3BrandGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* E Lettermark */}
          <path
            d="M4 2H30C31.6569 2 33 3.34315 33 5V6.5C33 8.15685 31.6569 9.5 30 9.5H12.5V13.5H27C28.6569 13.5 30 14.8431 30 16.5V18C30 19.6569 28.6569 21 27 21H12.5V25H30C31.6569 25 33 26.3431 33 28V29.5C33 31.1569 31.6569 32.5 30 32.5H4C2.34315 32.5 1 31.1569 1 29.5V5C1 3.34315 2.34315 2 4 2Z"
            fill={isLight ? "url(#e3BrandGradientLight)" : "url(#e3BrandGradientDark)"}
          />
          {/* 3 Lettermark */}
          <path
            d="M38 2H64C66.7614 2 69 4.23858 69 7V8.5C69 11.2614 66.7614 13.5 64 13.5H50.5V16.5H64C66.7614 16.5 69 18.7386 69 21.5V23.5C69 26.2614 66.7614 28.5 64 28.5H38C36.3431 28.5 35 27.1569 35 25.5V24C35 22.3431 36.3431 21 38 21H60.5V19.5H47C45.3431 19.5 44 18.1569 44 16.5V13.5C44 11.8431 45.3431 10.5 47 10.5H60.5V9H38C36.3431 9 35 7.65685 35 6V4.5C35 2.84315 36.3431 2 38 2Z"
            fill={isLight ? "url(#e3BrandGradientLight)" : "url(#e3BrandGradientDark)"}
          />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-black tracking-tight text-transparent bg-clip-text",
              size === "sm" && "text-sm",
              size === "md" && "text-base",
              size === "lg" && "text-xl",
              size === "xl" && "text-2xl",
              isLight
                ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
                : "bg-gradient-to-r from-white via-slate-200 to-slate-400"
            )}
          >
            E3 QATAR
          </span>
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
            EVENTS & ENTERTAINMENT
          </span>
        </div>
      )}
    </div>
  );
}
