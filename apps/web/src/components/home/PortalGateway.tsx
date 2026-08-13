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
  const activeB2cMedia = isMobileViewport && activeB2cMobileMedia?.mediaUrl ? activeB2cMobileMedia : activeB2cDesktopMedia;

  const activeB2bDesktopMedia = activeCmsData.b2bDesktopMedia;
  const activeB2bMobileMedia = activeCmsData.b2bMobileMedia || activeCmsData.b2bDesktopMedia;
  const activeB2bMedia = isMobileViewport && activeB2bMobileMedia?.mediaUrl ? activeB2bMobileMedia : activeB2bDesktopMedia;

  // Dynamic slanted seam position (%) for Desktop
  let b2cSeamLeft = 50;
  if (hoveredPortal === 'b2c' || focusedPortal === 'b2c') {
    b2cSeamLeft = 62;
  } else if (hoveredPortal === 'b2b' || focusedPortal === 'b2b') {
    b2cSeamLeft = 38;
  }

  return (
    <>
      {/* High-End Agency Fonts: Syne (Headlines) & Plus Jakarta Sans (Body/CTAs) */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Syne:wght@700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}} />

      <div
        className={cn(
          "relative w-full min-h-screen h-screen overflow-hidden flex flex-col justify-between transition-colors duration-500 font-jakarta select-none",
          isLight ? "bg-[#f4f4f6] text-slate-900" : "bg-[#05020c] text-white"
        )}
        dir={activeDir}
        role="region"
        aria-label={seo.ariaGatewayLabelEn || "E3 Qatar Portal Selection Gateway"}
      >
        {/* ============================================================ */}
        {/* 1. FLOATING GLASS HEADER NAVBAR */}
        {/* ============================================================ */}
        <header className="relative z-50 w-full px-4 pt-4 md:px-8 md:pt-6 pointer-events-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-between p-3 md:px-6 md:py-3.5 rounded-2xl md:rounded-full bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl">
            
            {/* Logo */}
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
                size={isMobileViewport ? "sm" : "md"}
              />
            </a>

            {/* Center Brand Headline (Desktop) */}
            <div className="hidden lg:flex items-center gap-3 px-5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold tracking-widest text-slate-200 uppercase">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>{headline}</span>
            </div>

            {/* Controls: Language & Theme Switcher */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Language Switcher */}
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-bold text-white transition-all cursor-pointer shadow-md"
              >
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>{activeLocale === "en" ? "العربية" : "EN"}</span>
              </button>

              {/* Theme Switcher */}
              <button
                onClick={() => {
                  const nextTheme = isLight ? "dark" : "light";
                  if (previewMode) {
                    setLocalPreviewSim((prev) => ({ ...prev, theme: nextTheme }));
                  } else {
                    setTheme(nextTheme);
                  }
                }}
                className="p-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all cursor-pointer shadow-md"
                title="Toggle Light/Dark Theme"
              >
                {isLight ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* 2. DUAL PORTAL HERO CANVAS */}
        {/* MOBILE (<768px): HORIZONTAL TOP/BOTTOM SPLIT WITH SEAM LINE */}
        {/* DESKTOP (>=768px): VERTICAL LEFT/RIGHT SPLIT WITH SLANTED SEAM */}
        {/* ============================================================ */}
        <main className="relative flex-1 w-full h-full overflow-hidden">
          
          {/* MOBILE VIEW (< 768px): STACKED HORIZONTAL 50/50 SPLIT */}
          {isMobileViewport ? (
            <div className="flex flex-col h-[calc(100vh-80px)] w-full relative">
              
              {/* TOP HALF: B2C CONSUMER PORTAL */}
              <div
                onClick={() => handleSelect("b2c")}
                className="relative h-1/2 w-full overflow-hidden flex flex-col justify-end p-5 cursor-pointer group"
              >
                <UniversalMediaHolder
                  config={simulation?.useFallbackMedia ? { ...activeB2cMedia, mediaUrl: activeB2cMedia.fallbackImageUrl, mediaType: 'IMAGE' } : activeB2cMedia}
                  locale={activeLocale}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 opacity-70 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                {/* B2C Mobile Glass Card Overlay */}
                <div className="relative z-30 backdrop-blur-xl bg-black/60 border border-purple-500/30 rounded-2xl p-4 space-y-2 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-600/40 text-purple-200 border border-purple-400/50 flex items-center gap-1">
                      <Ticket className="w-3 h-3 text-purple-300" />
                      <span>{b2cLabel}</span>
                    </span>
                    {b2cStat && visual.statisticsVisible !== false && (
                      <span className="text-[10px] font-mono text-purple-300 font-bold">
                        {b2cStat}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-extrabold font-syne uppercase tracking-tight text-white leading-tight">
                    {b2cTitle}
                  </h2>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                    {b2cDesc}
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelect("b2c"); }}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/50 cursor-pointer"
                    >
                      <span>{b2cCta}</span>
                      {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* HORIZONTAL SEAM DIVIDER LINE FOR MOBILE */}
              <div className="relative z-40 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_20px_rgba(168,85,247,0.9)]" />

              {/* BOTTOM HALF: B2B CORPORATE PORTAL */}
              <div
                onClick={() => handleSelect("b2b")}
                className="relative h-1/2 w-full overflow-hidden flex flex-col justify-end p-5 cursor-pointer group"
              >
                <UniversalMediaHolder
                  config={simulation?.useFallbackMedia ? { ...activeB2bMedia, mediaUrl: activeB2bMedia.fallbackImageUrl, mediaType: 'IMAGE' } : activeB2bMedia}
                  locale={activeLocale}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 opacity-70 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                {/* B2B Mobile Glass Card Overlay */}
                <div className="relative z-30 backdrop-blur-xl bg-black/60 border border-indigo-500/30 rounded-2xl p-4 space-y-2 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-600/40 text-indigo-200 border border-indigo-400/50 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-indigo-300" />
                      <span>{b2bLabel}</span>
                    </span>
                    {b2bStat && visual.statisticsVisible !== false && (
                      <span className="text-[10px] font-mono text-indigo-300 font-bold">
                        {b2bStat}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-extrabold font-syne uppercase tracking-tight text-white leading-tight">
                    {b2bTitle}
                  </h2>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                    {b2bDesc}
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelect("b2b"); }}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50 cursor-pointer"
                    >
                      <span>{b2bCta}</span>
                      {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DESKTOP VIEW (>= 768px): VERTICAL SIDE-BY-SIDE SPLIT WITH SLANTED SEAM */
            <div className="absolute inset-0 w-full h-full">
              
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
                style={{
                  clipPath: isAr
                    ? `polygon(${b2cSeamLeft - 4}% 0, 100% 0, 100% 100%, ${b2cSeamLeft + 4}% 100%)`
                    : `polygon(0 0, ${b2cSeamLeft + 4}% 0, ${b2cSeamLeft - 4}% 100%, 0 100%)`,
                }}
                className={cn(
                  "absolute inset-0 w-full h-full cursor-pointer transition-all duration-700 overflow-hidden z-20",
                  hoveredPortal === "b2c" ? "brightness-110" : hoveredPortal === "b2b" ? "opacity-75 grayscale-[20%]" : "opacity-100"
                )}
              >
                <UniversalMediaHolder
                  config={simulation?.useFallbackMedia ? { ...activeB2cMedia, mediaUrl: activeB2cMedia.fallbackImageUrl, mediaType: 'IMAGE' } : activeB2cMedia}
                  locale={activeLocale}
                  className={cn(
                    "h-full w-full object-cover transition-transform duration-700 opacity-60",
                    hoveredPortal === "b2c" ? "scale-105 opacity-85" : "scale-100"
                  )}
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                {/* B2C Desktop Overlay Card */}
                <div className="absolute bottom-16 start-12 md:start-20 max-w-xl z-30 space-y-4 p-8 rounded-3xl backdrop-blur-2xl bg-black/40 border border-purple-500/30 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-purple-600/40 text-purple-200 border border-purple-400/50 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                      <span>{b2cLabel}</span>
                    </span>
                    {b2cStat && visual.statisticsVisible !== false && (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-slate-200 border border-white/15">
                        {b2cStat}
                      </span>
                    )}
                  </div>

                  <h2 className="text-4xl lg:text-5xl font-black font-syne uppercase tracking-tight text-white leading-none">
                    {b2cTitle}
                  </h2>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    {b2cDesc}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelect("b2c"); }}
                      className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold uppercase tracking-widest transition-all shadow-xl shadow-purple-950/60 hover:scale-105 cursor-pointer"
                    >
                      <span>{b2cCta}</span>
                      {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
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
                className={cn(
                  "absolute inset-0 w-full h-full cursor-pointer transition-all duration-700 overflow-hidden z-10",
                  hoveredPortal === "b2b" ? "brightness-110 z-20" : hoveredPortal === "b2c" ? "opacity-75 grayscale-[20%]" : "opacity-100"
                )}
              >
                <UniversalMediaHolder
                  config={simulation?.useFallbackMedia ? { ...activeB2bMedia, mediaUrl: activeB2bMedia.fallbackImageUrl, mediaType: 'IMAGE' } : activeB2bMedia}
                  locale={activeLocale}
                  className={cn(
                    "h-full w-full object-cover transition-transform duration-700 opacity-60",
                    hoveredPortal === "b2b" ? "scale-105 opacity-85" : "scale-100"
                  )}
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                {/* B2B Desktop Overlay Card */}
                <div className="absolute bottom-16 end-12 md:end-20 max-w-xl z-30 space-y-4 p-8 rounded-3xl backdrop-blur-2xl bg-black/40 border border-indigo-500/30 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-indigo-600/40 text-indigo-200 border border-indigo-400/50 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                      <span>{b2bLabel}</span>
                    </span>
                    {b2bStat && visual.statisticsVisible !== false && (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-slate-200 border border-white/15">
                        {b2bStat}
                      </span>
                    )}
                  </div>

                  <h2 className="text-4xl lg:text-5xl font-black font-syne uppercase tracking-tight text-white leading-none">
                    {b2bTitle}
                  </h2>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    {b2bDesc}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelect("b2b"); }}
                      className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold uppercase tracking-widest transition-all shadow-xl shadow-indigo-950/60 hover:scale-105 cursor-pointer"
                    >
                      <span>{b2bCta}</span>
                      {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* DESKTOP DYNAMIC VERTICAL SLANTED SEAM LINE */}
              <div
                style={{ left: `${b2cSeamLeft}%` }}
                className="absolute top-0 bottom-0 z-30 w-1.5 -skew-x-6 pointer-events-none transition-all duration-700 bg-gradient-to-b from-purple-400 via-indigo-400 to-cyan-400 shadow-[0_0_25px_rgba(168,85,247,0.95)]"
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

