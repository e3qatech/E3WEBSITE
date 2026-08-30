"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Official verified E3 brand asset fallbacks from database
const DEFAULT_DARK_LOGO = "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/e15eb89b-a8ac-41b3-bf07-0d7dc9d06581.svg";
const DEFAULT_LIGHT_LOGO = "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/25208d6f-1e4d-4fcd-a200-112493364b3b.webp";
const DEFAULT_FAVICON = "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/4a579c50-8397-46db-9716-15d7e66b619d.png";

interface E3BrandLoaderProps {
  size?: "sm" | "md" | "lg" | "fullscreen";
  labelEn?: string;
  labelAr?: string;
  subtextEn?: string;
  subtextAr?: string;
  isArabic?: boolean;
  className?: string;
}

export function E3BrandLoader({
  size = "fullscreen",
  labelEn = "EXPERIENCE ENGINEERING",
  labelAr = "هندسة التجارب الحية",
  subtextEn = "Loading Qatar's Premier Live Activations",
  subtextAr = "جاري تهيئة الوجهات والفعاليات الاستثنائية",
  isArabic = false,
  className,
}: E3BrandLoaderProps) {
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_DARK_LOGO);
  const [faviconUrl, setFaviconUrl] = useState<string>(DEFAULT_FAVICON);
  const [imageError, setImageError] = useState(false);

  // Fetch live logos from settings with zero lag cache
  useEffect(() => {
    fetch("/api/settings?type=GENERAL")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          if (json.data.darkLogoUrl) setLogoUrl(json.data.darkLogoUrl);
          else if (json.data.lightLogoUrl) setLogoUrl(json.data.lightLogoUrl);
          if (json.data.faviconUrl) setFaviconUrl(json.data.faviconUrl);
        }
      })
      .catch(() => {});
  }, []);

  const isFullscreen = size === "fullscreen";

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      aria-live="polite"
      aria-label={isArabic ? "جاري التحميل" : "Loading E3 Experiences"}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden select-none",
        isFullscreen
          ? "fixed inset-0 z-[9990] bg-[#080b12]/95 backdrop-blur-2xl min-h-screen w-screen"
          : "w-full py-16 px-6 bg-[#080b12]/80 backdrop-blur-xl rounded-3xl border border-white/10",
        className
      )}
    >
      {/* ============================================================ */}
      {/* 1. ATMOSPHERIC AURA & KINETIC BACKGROUND PARTICLES           */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Large Central Radial Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/20 via-emerald-500/15 to-violet-600/20 rounded-full blur-3xl animate-pulse [animation-duration:3s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-cyan-400/15 rounded-full blur-2xl animate-ping opacity-40 [animation-duration:4s]" />
        
        {/* Subtle Futuristic Holographic Matrix Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Ambient Top Light Flare */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ============================================================ */}
      {/* 2. CORE EMBLEM: DUAL ORBITAL RINGS + ACTUAL E3 LOGO          */}
      {/* ============================================================ */}
      <div className="relative z-10 flex flex-col items-center gap-7">
        
        {/* Center Orbital Chamber */}
        <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32">
          
          {/* Outer Laser Orbital Ring (Cyan-Emerald Neon) */}
          <div className="absolute inset-0 rounded-[2rem] border-2 border-cyan-500/30 border-t-cyan-400 border-r-emerald-400 animate-spin [animation-duration:2.4s] shadow-[0_0_30px_rgba(6,182,212,0.35)]" />
          
          {/* Middle Hexagonal Geometric Pulse Ring */}
          <div className="absolute inset-2.5 rounded-[1.6rem] border border-violet-500/30 border-b-violet-400 border-l-cyan-400 animate-spin [animation-duration:3.6s] [animation-direction:reverse] opacity-80" />

          {/* Inner Glowing Core Frame */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#0c1222] via-[#090d18] to-[#04060a] border border-white/20 p-3 flex items-center justify-center shadow-2xl backdrop-blur-xl group overflow-hidden">
            
            {/* Holographic Laser Scanline Sweep */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent h-[40%] w-full animate-[scan_2s_ease-in-out_infinite] pointer-events-none" />

            {/* Actual E3 Logo / Favicon */}
            {!imageError ? (
              <img
                src={logoUrl}
                alt="E3 Logo"
                onError={() => {
                  if (logoUrl !== faviconUrl) {
                    setLogoUrl(faviconUrl);
                  } else {
                    setImageError(true);
                  }
                }}
                className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] transform group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-black font-syne tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-white">
                  E3
                </span>
              </div>
            )}

            {/* Subtle Corner Brackets for High-Tech Aesthetic */}
            <div className="absolute top-1 start-1 w-2 h-2 border-t-2 border-s-2 border-cyan-400/80 rounded-tl-[3px]" />
            <div className="absolute bottom-1 end-1 w-2 h-2 border-b-2 border-e-2 border-emerald-400/80 rounded-br-[3px]" />
          </div>

          {/* Satellite Orbit Particles */}
          <div className="absolute -top-1 right-3 w-2.5 h-2.5 rounded-full bg-cyan-400 blur-[1px] shadow-[0_0_12px_#06b6d4] animate-ping [animation-duration:2.5s]" />
          <div className="absolute -bottom-1 left-3 w-2 h-2 rounded-full bg-emerald-400 blur-[1px] shadow-[0_0_10px_#10b981] animate-pulse [animation-duration:1.8s]" />
        </div>

        {/* ============================================================ */}
        {/* 3. TYPOGRAPHY & MULTI-PHASE LASER PROGRESS BAR               */}
        {/* ============================================================ */}
        <div className="flex flex-col items-center text-center max-w-sm px-4 space-y-3">
          
          {/* Primary Badge / Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] sm:text-xs font-mono font-extrabold uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              {isArabic ? labelAr : labelEn}
            </span>
          </div>

          {/* Subtext */}
          <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide leading-relaxed">
            {isArabic ? subtextAr : subtextEn}
          </p>

          {/* Shimmering Segmented Laser Gauge */}
          <div className="w-52 sm:w-64 h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/15 shadow-[0_0_15px_rgba(6,182,212,0.2)] mt-2">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 animate-[laserShimmer_1.8s_infinite] relative">
              {/* Laser head glow */}
              <div className="absolute top-0 right-0 w-8 h-full bg-white blur-[2px] opacity-80" />
            </div>
          </div>

          {/* Micro Telemetry Meta */}
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-1">
            <span>SYS.OK</span>
            <span>•</span>
            <span>E3-LIVE-ENV</span>
            <span>•</span>
            <span>QATAR</span>
          </div>
        </div>

      </div>
    </div>
  );
}
