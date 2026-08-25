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

export function invalidateGeneralLogoCache() {
  globalSettingsLogoCache = null;
  globalSettingsFetchPromise = null;
}

async function fetchGeneralLogos(force = false) {
  if (globalSettingsLogoCache && !force) return globalSettingsLogoCache;
  if (!globalSettingsFetchPromise || force) {
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
    fetchGeneralLogos().then((logos) => {
      setFetchedLogos(logos);
    });

    const handleSettingsUpdated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail && (detail.lightLogoUrl !== undefined || detail.darkLogoUrl !== undefined)) {
        const updated = {
          lightLogoUrl: detail.lightLogoUrl || undefined,
          darkLogoUrl: detail.darkLogoUrl || undefined,
        };
        globalSettingsLogoCache = updated;
        setFetchedLogos(updated);
      } else {
        invalidateGeneralLogoCache();
        fetchGeneralLogos(true).then((logos) => {
          setFetchedLogos(logos);
        });
      }
    };

    window.addEventListener("e3_general_settings_updated", handleSettingsUpdated);
    return () => {
      window.removeEventListener("e3_general_settings_updated", handleSettingsUpdated);
    };
  }, []);

  // Prefer global settings logos from en/dashboard/settings/general; fall back to props
  const lightLogoUrl = fetchedLogos.lightLogoUrl || propLightUrl;
  const darkLogoUrl = fetchedLogos.darkLogoUrl || propDarkUrl;

  // Change logo dynamically as per theme (isLight vs dark mode)
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

  return (
    <div className={cn("inline-flex items-center gap-2 select-none transition-colors duration-300 shrink-0", className)}>
      <span
        className={cn(
          "font-black font-syne tracking-tighter leading-none select-none",
          size === "sm" && "text-xl",
          size === "md" && "text-2xl",
          size === "lg" && "text-3xl",
          size === "xl" && "text-4xl",
          isLight ? "text-slate-900" : "text-white"
        )}
      >
        E3
      </span>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-black font-syne tracking-tight",
              size === "sm" && "text-sm",
              size === "md" && "text-base",
              size === "lg" && "text-xl",
              size === "xl" && "text-2xl",
              isLight ? "text-slate-900" : "text-white"
            )}
          >
            E3 QATAR
          </span>
          <span className="text-[9px] font-mono font-bold tracking-widest text-[var(--text-tertiary)] uppercase mt-0.5">
            EVENTS & ENTERTAINMENT
          </span>
        </div>
      )}
    </div>
  );
}
