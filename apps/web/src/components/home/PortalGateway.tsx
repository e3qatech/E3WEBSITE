"use client";

import { useLocale } from "@/components/layout/LocaleProvider";
import { useTheme } from "@/components/layout/ThemeProvider";
import { E3Logo } from "@/components/shared/E3Logo";
import { UniversalMediaHolder } from "@/components/shared/UniversalMediaHolder";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";
import {
    DEFAULT_GATEWAY_CMS_PAYLOAD,
    GatewayCustomizationPayload,
    GatewayPreviewSimulationState,
} from "@/types/gateway-cms";
import { ArrowLeft, ArrowRight, Globe, Moon, Sun, Sparkles, Building2, Ticket } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { playSpatialHoverSound } from "@/components/b2c/nav/PulseOrbitNav";

const WireframeBackground = dynamic(
  () => import("./WireframeBackground").then((mod) => mod.WireframeBackground),
  { ssr: false }
);

export interface PortalGatewayProps {
  cmsData?: GatewayCustomizationPayload;
  previewMode?: boolean;
  previewConfig?: GatewayCustomizationPayload;
  simulation?: GatewayPreviewSimulationState;
}

export function PortalGateway({
  cmsData: initialCmsData = DEFAULT_GATEWAY_CMS_PAYLOAD,
  previewMode = false,
  previewConfig,
  simulation,
}: PortalGatewayProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale: contextLocale, setLocale } = useLocale();
  const { theme: contextTheme, setTheme } = useTheme();

  const [hoveredPortal, setHoveredPortal] = useState<"b2c" | "b2b" | null>(null);
  const [focusedPortal, setFocusedPortal] = useState<"b2c" | "b2b" | null>(null);
  const [_selectedPortal, setSelectedPortal] = useState<"b2c" | "b2b" | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(false);
  const isMounted = useMounted();

  // Handle mobile viewport detection (< 768px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile Viewport detection (real window OR simulated mobile in preview mode)
  const isSimulatedMobile = previewMode && simulation?.viewport === 'mobile-390';
  const effectiveIsMobile = isSimulatedMobile || isMobileViewport;

  // In Preview Mode, prefer draft config
  const activeCmsData = previewMode && previewConfig ? previewConfig : initialCmsData;

  // Local Preview Overrides for previewMode state
  const [localPreviewSim, setLocalPreviewSim] = useState<{ locale?: 'en' | 'ar'; theme?: 'dark' | 'light' }>({});

  // Resolve locale
  const activeLocale = previewMode
    ? localPreviewSim.locale || simulation?.locale || "en"
    : simulation?.locale || contextLocale || "en";
  const isAr = activeLocale === "ar";
  const activeDir = isAr ? "rtl" : "ltr";

  // Resolve theme
  const resolvedTheme = previewMode
    ? localPreviewSim.theme || simulation?.theme || activeCmsData.visual?.themeMode || "dark"
    : simulation?.theme || contextTheme || activeCmsData.visual?.themeMode || "dark";
  const isLight = resolvedTheme === "light";

  // Content bindings
  const en = activeCmsData.english || DEFAULT_GATEWAY_CMS_PAYLOAD.english;
  const ar = activeCmsData.arabic || DEFAULT_GATEWAY_CMS_PAYLOAD.arabic;
  const logo = activeCmsData.logo || DEFAULT_GATEWAY_CMS_PAYLOAD.logo;
  const visual = activeCmsData.visual || DEFAULT_GATEWAY_CMS_PAYLOAD.visual;
  const seo = activeCmsData.seoAccess || DEFAULT_GATEWAY_CMS_PAYLOAD.seoAccess;

  const headline = isAr ? ar.headlineAr || en.headlineEn : en.headlineEn || ar.headlineAr;
  const supportingText = isAr ? ar.supportingTextAr || en.supportingTextEn : en.supportingTextEn || ar.supportingTextAr;

  // B2C Content
  const b2cLabel = isAr ? ar.b2cLabelAr || en.b2cLabelEn : en.b2cLabelEn || ar.b2cLabelAr;
  const b2cTitle = isAr ? ar.b2cTitleAr || en.b2cTitleEn : en.b2cTitleEn || ar.b2cLabelAr;
  const b2cDesc = isAr ? ar.b2cDescAr || en.b2cDescEn : en.b2cDescEn || ar.b2cDescAr;
  const b2cCta = isAr ? ar.b2cCtaLabelAr || en.b2cCtaLabelEn : en.b2cCtaLabelEn || ar.b2cCtaLabelAr;
  const b2cStat = isAr ? ar.b2cStatLabelAr || en.b2cStatLabelEn : en.b2cStatLabelEn || ar.b2cStatLabelAr;
  const b2cDest = isAr
    ? ar.b2cDestinationUrl || en.b2cDestinationUrl || "/ar/b2c"
    : en.b2cDestinationUrl || ar.b2cDestinationUrl || "/en/b2c";
  const b2cAria = isAr ? ar.b2cAriaLabelAr : en.b2cAriaLabelEn;

  // B2B Content
  const b2bLabel = isAr ? ar.b2bLabelAr || en.b2bLabelEn : en.b2bLabelEn || ar.b2bLabelAr;
  const b2bTitle = isAr ? ar.b2bTitleAr || en.b2bTitleEn : en.b2bTitleEn || ar.b2bLabelAr;
  const b2bDesc = isAr ? ar.b2bDescAr || en.b2bDescEn : en.b2bDescEn || ar.b2bDescAr;
  const b2bCta = isAr ? ar.b2bCtaLabelAr || en.b2bCtaLabelEn : en.b2bCtaLabelEn || ar.b2bCtaLabelAr;
  const b2bStat = isAr ? ar.b2bStatLabelAr || en.b2bStatLabelEn : en.b2bStatLabelEn || ar.b2bStatLabelAr;
  const b2bDest = isAr
    ? ar.b2bDestinationUrl || en.b2bDestinationUrl || "/ar/b2b"
    : en.b2bDestinationUrl || ar.b2bDestinationUrl || "/en/b2b";
  const b2bAria = isAr ? ar.b2bAriaLabelAr : en.b2bAriaLabelEn;

  // Portal selection handler
  const handleSelect = useCallback(
    (portal: "b2c" | "b2b") => {
      if (previewMode) return;
      setSelectedPortal(portal);
      const targetUrl = portal === "b2c" ? b2cDest : b2bDest;
      router.push(targetUrl);
    },
    [previewMode, b2cDest, b2bDest, router]
  );

  // Active Media resolution
  const activeB2cDesktopMedia = activeCmsData.b2cDesktopMedia;
  const activeB2cMobileMedia = activeCmsData.b2cMobileMedia || activeCmsData.b2cDesktopMedia;
  const activeB2cMedia = effectiveIsMobile && activeB2cMobileMedia?.mediaUrl ? activeB2cMobileMedia : activeB2cDesktopMedia;

  const activeB2bDesktopMedia = activeCmsData.b2bDesktopMedia;
  const activeB2bMobileMedia = activeCmsData.b2bMobileMedia || activeCmsData.b2bDesktopMedia;
  const activeB2bMedia = effectiveIsMobile && activeB2bMobileMedia?.mediaUrl ? activeB2bMobileMedia : activeB2bDesktopMedia;

  // Dynamic panel width percentages for Desktop & Live Simulation Focus
  const activeFocus = previewMode && simulation?.portalFocus && simulation.portalFocus !== 'none'
    ? simulation.portalFocus
    : hoveredPortal || focusedPortal;

  let b2cWidthPercent = activeCmsData.visual?.initialSplitRatio || 50;
  const targetExpandWidth = activeCmsData.visual?.selectedPortalWidth || 62;

  if (activeFocus === 'b2c') {
    b2cWidthPercent = targetExpandWidth;
  } else if (activeFocus === 'b2b') {
    b2cWidthPercent = 100 - targetExpandWidth;
  }

  // Motion Settings
  const isReducedMotion = simulation?.reducedMotion || visual?.reducedMotionDefault || false;

  // Mobile Order
  const isB2bFirst = visual?.mobilePortalOrder === 'b2b_first';

  return (
    <>
      {/* High-End Agency Google Fonts: Syne & Plus Jakarta Sans */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Syne:wght@700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}} />

      <div
        className={cn(
          "relative w-full min-h-screen h-screen overflow-hidden flex flex-col justify-between font-jakarta select-none transition-colors duration-500",
          isLight ? "bg-[#f4f4f6] text-slate-900" : "bg-[#03000a] text-white"
        )}
        dir={activeDir}
        role="region"
        aria-label={seo.ariaGatewayLabelEn || "E3 Qatar Portal Selection Gateway"}
      >
        {/* Optional 3D Wireframe Background */}
        {visual.backgroundStyle === 'wireframe' && <WireframeBackground />}

        {/* Subtle Industrial Grain Texture Overlay */}
        <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.02] mix-blend-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <filter id="noise-gateway">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise-gateway)" />
          </svg>
        </div>

        {/* ============================================================ */}
        {/* 1. FLOATING ISLAND NAVIGATION HEADER */}
        {/* ============================================================ */}
        <header className="relative z-50 w-full px-4 pt-4 md:px-10 md:pt-6 pointer-events-auto">
          <div className="w-full flex items-center justify-between p-3.5 md:px-8 md:py-4 rounded-2xl md:rounded-full bg-black/60 border border-white/15 backdrop-blur-2xl shadow-2xl">
            
            {/* Logo (Top Left in LTR / Top Right in RTL) */}
            <a
              href={logo?.destinationUrl || "/"}
              onClick={(e) => { if (previewMode) e.preventDefault(); }}
              className="inline-flex items-center gap-3 transition-transform hover:scale-105 focus:outline-none rounded-lg"
              aria-label={isAr ? logo?.altAr || "شعار إي ثري قطر" : logo?.altEn || "E3 Qatar Official Logo"}
            >
              <E3Logo
                isLight={isLight}
                lightLogoUrl={isLight ? logo?.lightLogoUrl || logo?.defaultLogoUrl : undefined}
                darkLogoUrl={!isLight ? logo?.darkLogoUrl || logo?.defaultLogoUrl : undefined}
                size={effectiveIsMobile ? "sm" : "md"}
              />
            </a>

            {/* Center Brand Badge (Desktop) */}
            <div className="hidden lg:flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 border border-white/15 text-xs md:text-sm font-mono font-bold tracking-widest text-slate-200 uppercase">
              <span className={cn("w-2.5 h-2.5 rounded-full bg-purple-400", !isReducedMotion && "animate-pulse")} />
              <span>{headline}</span>
            </div>

            {/* Controls: Language & Theme Switcher (Top Right in LTR / Top Left in RTL) */}
            <div className="flex items-center gap-2.5 md:gap-4">
              {/* Language Switcher */}
              {visual.languageSwitcherVisible !== false && (
                <button
                  onClick={() => {
                    const nextLocale = activeLocale === "en" ? "ar" : "en";
                    if (previewMode) {
                      setLocalPreviewSim((prev) => ({ ...prev, locale: nextLocale }));
                    } else {
                      setLocale(nextLocale);
                      const segments = pathname.split("/");
                      if (segments[1] === "en" || segments[1] === "ar") {
                        segments[1] = nextLocale;
                        router.push(segments.join("/"));
                      } else {
                        router.push(`/${nextLocale}`);
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs md:text-sm font-bold text-white transition-all cursor-pointer shadow-md"
                >
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>{activeLocale === "en" ? "العربية" : "ENGLISH"}</span>
                </button>
              )}

              {/* Theme Switcher */}
              {visual.themeSwitcherVisible !== false && (
                <button
                  onClick={() => {
                    const nextTheme = isLight ? "dark" : "light";
                    if (previewMode) {
                      setLocalPreviewSim((prev) => ({ ...prev, theme: nextTheme }));
                    } else {
                      setTheme(nextTheme);
                    }
                  }}
                  className="p-2.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all cursor-pointer shadow-md"
                  title="Toggle Light/Dark Theme"
                >
                  {isLight ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* 2. DUAL PORTAL CANVAS */}
        {/* MOBILE (<768px): FULL-COVER 50/50 HORIZONTAL TOP/BOTTOM SPLIT */}
        {/* DESKTOP (>=768px): FULL-BLEED 50/50 VERTICAL SPLIT WITH HOVER EXPANSION */}
        {/* ============================================================ */}
        <main className="relative flex-1 w-full h-full overflow-hidden z-10">
          
          {/* MOBILE VIEW (< 768px): STACKED HORIZONTAL 50/50 SPLIT */}
          {effectiveIsMobile ? (
            <div className={cn("flex w-full relative h-[calc(100vh-90px)]", isB2bFirst ? "flex-col-reverse" : "flex-col")}>
              
              {/* B2C CONSUMER PORTAL HALF */}
              <div
                onClick={() => handleSelect("b2c")}
                className="relative h-1/2 w-full overflow-hidden flex flex-col justify-end p-5 cursor-pointer group"
              >
                <UniversalMediaHolder
                  config={simulation?.useFallbackMedia ? { ...activeB2cMedia, mediaUrl: activeB2cMedia.fallbackImageUrl, mediaType: 'IMAGE' } : activeB2cMedia}
                  locale={activeLocale}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover opacity-95 transition-all duration-700",
                    !isReducedMotion && "group-hover:scale-105 group-hover:opacity-100"
                  )}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"
                  style={{ opacity: visual?.overlayStrength ?? 0.4 }}
                />

                {/* B2C Mobile Overlay Content */}
                <div className="relative z-30 space-y-2.5 max-w-md w-full">
                  <div className="w-full flex items-center justify-between gap-3">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-purple-600/40 text-purple-200 border border-purple-400/50 backdrop-blur-md flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5 text-purple-300" />
                      <span>{b2cLabel}</span>
                    </span>
                    {b2cStat && visual.statisticsVisible !== false && (
                      <span className="text-xs font-mono text-purple-200 font-extrabold bg-black/80 px-3 py-1 rounded-full border border-purple-400/40 backdrop-blur-md">
                        {b2cStat}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-extrabold font-syne uppercase tracking-tight text-white leading-tight drop-shadow-lg">
                    {b2cTitle}
                  </h2>
                  <p className="text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed drop-shadow">
                    {b2cDesc}
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelect("b2c"); }}
                      className="w-full py-3 px-5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-xl shadow-purple-950/60 flex items-center justify-between group/mbtn cursor-pointer"
                    >
                      <span>{b2cCta}</span>
                      <div className={cn("w-7 h-7 rounded-full bg-white/20 flex items-center justify-center transition-all", !isReducedMotion && "group-hover/mbtn:translate-x-1")}>
                        {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* GLOWING HORIZONTAL SEAM DIVIDER FOR MOBILE */}
              <div className="relative z-40 w-full h-[2px] bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 shadow-[0_0_20px_rgba(168,85,247,0.9)]" />

              {/* B2B CORPORATE PORTAL HALF */}
              <div
                onClick={() => handleSelect("b2b")}
                className="relative h-1/2 w-full overflow-hidden flex flex-col justify-end p-5 cursor-pointer group"
              >
                <UniversalMediaHolder
                  config={simulation?.useFallbackMedia ? { ...activeB2bMedia, mediaUrl: activeB2bMedia.fallbackImageUrl, mediaType: 'IMAGE' } : activeB2bMedia}
                  locale={activeLocale}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover opacity-95 transition-all duration-700",
                    !isReducedMotion && "group-hover:scale-105 group-hover:opacity-100"
                  )}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"
                  style={{ opacity: visual?.overlayStrength ?? 0.4 }}
                />

                {/* B2B Mobile Overlay Content */}
                <div className="relative z-30 space-y-2.5 max-w-md w-full">
                  <div className="w-full flex items-center justify-between gap-3">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-indigo-600/40 text-indigo-200 border border-indigo-400/50 backdrop-blur-md flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                      <span>{b2bLabel}</span>
                    </span>
                    {b2bStat && visual.statisticsVisible !== false && (
                      <span className="text-xs font-mono text-indigo-200 font-extrabold bg-black/80 px-3 py-1 rounded-full border border-indigo-400/40 backdrop-blur-md">
                        {b2bStat}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-extrabold font-syne uppercase tracking-tight text-white leading-tight drop-shadow-lg">
                    {b2bTitle}
                  </h2>
                  <p className="text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed drop-shadow">
                    {b2bDesc}
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelect("b2b"); }}
                      className="w-full py-3 px-5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-xl shadow-indigo-950/60 flex items-center justify-between group/mbtn cursor-pointer"
                    >
                      <span>{b2bCta}</span>
                      <div className={cn("w-7 h-7 rounded-full bg-white/20 flex items-center justify-center transition-all", !isReducedMotion && "group-hover/mbtn:translate-x-1")}>
                        {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DESKTOP VIEW (>= 768px): DYNAMIC FULL-BLEED VERTICAL SPLIT */
            <div className="absolute inset-0 w-full h-full flex">
              
              {/* B2C PORTAL (LEFT PANEL) */}
              <div
                onMouseEnter={() => { setHoveredPortal("b2c"); playSpatialHoverSound(-0.5); }}
                onMouseLeave={() => setHoveredPortal(null)}
                onFocus={() => setFocusedPortal("b2c")}
                onBlur={() => setFocusedPortal(null)}
                onClick={() => handleSelect("b2c")}
                tabIndex={0}
                role="button"
                aria-label={b2cAria || b2cTitle}
                style={{ width: `${b2cWidthPercent}%` }}
                className={cn(
                  "relative h-full cursor-pointer overflow-hidden group border-r border-white/10 z-20",
                  !isReducedMotion && "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  hoveredPortal === "b2c" || activeFocus === "b2c" ? "brightness-105" : hoveredPortal === "b2b" || activeFocus === "b2b" ? "opacity-80" : "opacity-100"
                )}
              >
                <UniversalMediaHolder
                  config={simulation?.useFallbackMedia ? { ...activeB2cMedia, mediaUrl: activeB2cMedia.fallbackImageUrl, mediaType: 'IMAGE' } : activeB2cMedia}
                  locale={activeLocale}
                  className={cn(
                    "h-full w-full object-cover opacity-90 transition-all duration-700",
                    !isReducedMotion && (hoveredPortal === "b2c" || activeFocus === "b2c") ? "scale-105 opacity-100" : "scale-100"
                  )}
                />
                <div
                  className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/20 to-transparent"
                  style={{ opacity: visual?.overlayStrength ?? 0.4 }}
                />

                {/* B2C Double-Bezel Architecture Card */}
                <div className="absolute bottom-16 start-12 md:start-20 max-w-xl z-30 space-y-4 ring-1 ring-purple-500/30 rounded-3xl bg-black/50 backdrop-blur-2xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                  <div className="w-full flex items-center justify-between gap-4 mb-2">
                    <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-purple-600/30 text-purple-200 border border-purple-400/40 backdrop-blur-md flex items-center gap-2 shadow-sm">
                      <Sparkles className="w-4 h-4 text-purple-300" />
                      <span>{b2cLabel}</span>
                    </span>
                    {b2cStat && visual.statisticsVisible !== false && (
                      <span className="px-4 py-1.5 rounded-full text-xs font-mono font-extrabold tracking-wider bg-black/80 text-purple-200 border border-purple-400/40 backdrop-blur-md shadow-sm">
                        {b2cStat}
                      </span>
                    )}
                  </div>

                  <h2 className="text-4xl lg:text-5xl font-black font-syne uppercase tracking-tight text-white leading-none drop-shadow-xl">
                    {b2cTitle}
                  </h2>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed drop-shadow">
                    {b2cDesc}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelect("b2c"); }}
                      className="inline-flex items-center gap-3 rounded-full px-7 py-3.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold uppercase tracking-widest transition-all shadow-xl shadow-purple-950/60 group/btn cursor-pointer"
                    >
                      <span>{b2cCta}</span>
                      <div className={cn("w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all", !isReducedMotion && "group-hover/btn:translate-x-1 group-hover/btn:scale-105")}>
                        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* B2B PORTAL (RIGHT PANEL) */}
              <div
                onMouseEnter={() => { setHoveredPortal("b2b"); playSpatialHoverSound(0.5); }}
                onMouseLeave={() => setHoveredPortal(null)}
                onFocus={() => setFocusedPortal("b2b")}
                onBlur={() => setFocusedPortal(null)}
                onClick={() => handleSelect("b2b")}
                tabIndex={0}
                role="button"
                aria-label={b2bAria || b2bTitle}
                style={{ width: `${100 - b2cWidthPercent}%` }}
                className={cn(
                  "relative h-full cursor-pointer overflow-hidden group z-10",
                  !isReducedMotion && "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  hoveredPortal === "b2b" || activeFocus === "b2b" ? "brightness-105 z-20" : hoveredPortal === "b2c" || activeFocus === "b2c" ? "opacity-80" : "opacity-100"
                )}
              >
                <UniversalMediaHolder
                  config={simulation?.useFallbackMedia ? { ...activeB2bMedia, mediaUrl: activeB2bMedia.fallbackImageUrl, mediaType: 'IMAGE' } : activeB2bMedia}
                  locale={activeLocale}
                  className={cn(
                    "h-full w-full object-cover opacity-90 transition-all duration-700",
                    !isReducedMotion && (hoveredPortal === "b2b" || activeFocus === "b2b") ? "scale-105 opacity-100" : "scale-100"
                  )}
                />
                <div
                  className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/20 to-transparent"
                  style={{ opacity: visual?.overlayStrength ?? 0.4 }}
                />

                {/* B2B Double-Bezel Architecture Card */}
                <div className="absolute bottom-16 end-12 md:end-20 max-w-xl z-30 space-y-4 ring-1 ring-indigo-500/30 rounded-3xl bg-black/50 backdrop-blur-2xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                  <div className="w-full flex items-center justify-between gap-4 mb-2">
                    <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-indigo-600/30 text-indigo-200 border border-indigo-400/40 backdrop-blur-md flex items-center gap-2 shadow-sm">
                      <Building2 className="w-4 h-4 text-indigo-300" />
                      <span>{b2bLabel}</span>
                    </span>
                    {b2bStat && visual.statisticsVisible !== false && (
                      <span className="px-4 py-1.5 rounded-full text-xs font-mono font-extrabold tracking-wider bg-black/80 text-indigo-200 border border-indigo-400/40 backdrop-blur-md shadow-sm">
                        {b2bStat}
                      </span>
                    )}
                  </div>

                  <h2 className="text-4xl lg:text-5xl font-black font-syne uppercase tracking-tight text-white leading-none drop-shadow-xl">
                    {b2bTitle}
                  </h2>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed drop-shadow">
                    {b2bDesc}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelect("b2b"); }}
                      className="inline-flex items-center gap-3 rounded-full px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold uppercase tracking-widest transition-all shadow-xl shadow-purple-950/60 group/btn cursor-pointer"
                    >
                      <span>{b2bCta}</span>
                      <div className={cn("w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all", !isReducedMotion && "group-hover/btn:translate-x-1 group-hover/btn:scale-105")}>
                        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* DESKTOP DYNAMIC VERTICAL LASER SEAM LINE */}
              <div
                style={{ left: `${b2cWidthPercent}%` }}
                className={cn(
                  "absolute top-0 bottom-0 z-30 w-1.5 -skew-x-6 pointer-events-none bg-gradient-to-b from-purple-400 via-indigo-400 to-cyan-400 shadow-[0_0_30px_rgba(168,85,247,1)]",
                  !isReducedMotion && "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                )}
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}


