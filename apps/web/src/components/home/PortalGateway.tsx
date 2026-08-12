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
import { ArrowLeft, ArrowRight, Globe, Moon, Sun } from "lucide-react";
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

  // Handle mobile viewport detection
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

  // Resolve locale (local preview > simulation > context > fallback)
  const activeLocale = previewMode
    ? localPreviewSim.locale || simulation?.locale || "en"
    : simulation?.locale || contextLocale || "en";
  const isAr = activeLocale === "ar";
  const activeDir = isAr ? "rtl" : "ltr";

  // Resolve theme (local preview > simulation > context > visual setting > dark)
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
      if (previewMode) return; // Prevent navigation in CMS preview mode
      setSelectedPortal(portal);
      const targetUrl = portal === "b2c" ? b2cDest : b2bDest;
      router.push(targetUrl);
    },
    [previewMode, b2cDest, b2bDest, router]
  );

  // Dynamic viewport width class
  const viewportWidthClass = useMemo(() => {
    switch ((visual as any).containerLayoutWidth) {
      case "contained-1200": return "max-w-[1200px] mx-auto";
      case "contained-1440": return "max-w-[1440px] mx-auto";
      case "full-bleed": default: return "w-full";
    }
  }, [(visual as any).containerLayoutWidth]);

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
    <div
      className={cn(
        "relative w-full min-h-screen h-screen overflow-hidden flex flex-col justify-between transition-colors duration-500 font-sans select-none",
        viewportWidthClass,
        isLight ? "bg-[#f4f4f6] text-slate-900" : "bg-[#09090b] text-white"
      )}
      dir={activeDir}
      role="region"
      aria-label={seo.ariaGatewayLabelEn || "E3 Qatar Portal Selection Gateway"}
    >
      {/* 1. FULL-BLEED 50/50 PORTALS (MOBILE: TOP/BOTTOM 50/50 | DESKTOP: ANGLED SEAM) */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        {/* Ambient Gradient Backdrop */}
        <div
          className={cn(
            "absolute inset-0 z-0 pointer-events-none transition-opacity duration-700",
            isLight
              ? "bg-gradient-to-b from-white/70 via-purple-50/10 to-slate-100/80"
              : "bg-gradient-to-b from-black/80 via-black/50 to-black/90"
          )}
        />

        {/* ============================================================ */}
        {/* PORTAL LAYER 1: B2C (TOP HALF ON MOBILE | LEFT SLANTED ON DESKTOP) */}
        {/* ============================================================ */}
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
            clipPath: isMobileViewport
              ? 'none'
              : isAr
              ? `polygon(${b2cSeamLeft - 4}% 0, 100% 0, 100% 100%, ${b2cSeamLeft + 4}% 100%)`
              : `polygon(0 0, ${b2cSeamLeft + 4}% 0, ${b2cSeamLeft - 4}% 100%, 0 100%)`,
          }}
          className={cn(
            "absolute cursor-pointer transition-all duration-700 overflow-hidden z-20",
            isMobileViewport
              ? "top-0 left-0 right-0 h-[50vh] border-b border-purple-500/40"
              : "inset-0 w-full h-full",
            hoveredPortal === "b2c" ? "brightness-110" : hoveredPortal === "b2b" ? "opacity-80 grayscale-[15%]" : "opacity-100"
          )}
        >
          {/* Media Image / Video */}
          <UniversalMediaHolder
            config={simulation?.useFallbackMedia ? { ...activeB2cMedia, mediaUrl: activeB2cMedia.fallbackImageUrl, mediaType: 'IMAGE' } : activeB2cMedia}
            locale={activeLocale}
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 opacity-60 group-hover:opacity-85",
              hoveredPortal === "b2c" ? "scale-105" : "scale-100"
            )}
          />
          {/* Clean High-Contrast Vignette Gradient */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/95 via-black/40 to-black/30" />

          {/* B2C Content Overlay */}
          <div className={cn(
            "absolute z-30 space-y-2 p-4 md:p-6 max-w-xl",
            isMobileViewport ? "bottom-4 start-4 end-4" : "bottom-12 start-8 md:start-16"
          )}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] md:text-xs font-black uppercase tracking-widest bg-purple-600/40 text-purple-200 border border-purple-400/50 shadow-lg backdrop-blur-md">
                {b2cLabel}
              </span>
              {b2cStat && visual.statisticsVisible !== false && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold bg-white/15 text-white/90 border border-white/20 backdrop-blur-md">
                  {b2cStat}
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-xl uppercase">
              {b2cTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed drop-shadow max-w-md line-clamp-2 md:line-clamp-none">
              {b2cDesc}
            </p>
            <div className="pt-1 md:pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect("b2c");
                }}
                type="button"
                className="inline-flex items-center gap-2.5 rounded-xl px-5 py-2.5 md:px-6 md:py-3.5 text-xs md:text-sm font-black text-white bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-950/60 transition-all uppercase tracking-wider cursor-pointer"
              >
                <span>{b2cCta}</span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PORTAL LAYER 2: B2B (BOTTOM HALF ON MOBILE | RIGHT SLANTED ON DESKTOP) */}
        {/* ============================================================ */}
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
            "absolute cursor-pointer transition-all duration-700 overflow-hidden",
            isMobileViewport
              ? "top-[50vh] bottom-0 left-0 right-0 h-[50vh] z-20"
              : "inset-0 w-full h-full z-10",
            hoveredPortal === "b2b" ? "brightness-110 z-20" : hoveredPortal === "b2c" ? "opacity-80 grayscale-[15%]" : "opacity-100"
          )}
        >
          {/* Media Image / Video */}
          <UniversalMediaHolder
            config={simulation?.useFallbackMedia ? { ...activeB2bMedia, mediaUrl: activeB2bMedia.fallbackImageUrl, mediaType: 'IMAGE' } : activeB2bMedia}
            locale={activeLocale}
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 opacity-60 group-hover:opacity-85",
              hoveredPortal === "b2b" ? "scale-105" : "scale-100"
            )}
          />
          {/* Clean High-Contrast Vignette Gradient */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/95 via-black/40 to-black/30" />
          
          {/* B2B Content Overlay */}
          <div className={cn(
            "absolute z-30 space-y-2 p-4 md:p-6 max-w-xl",
            isMobileViewport ? "bottom-4 start-4 end-4" : "bottom-12 end-8 md:end-16"
          )}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] md:text-xs font-black uppercase tracking-widest bg-indigo-600/40 text-indigo-200 border border-indigo-400/50 shadow-lg backdrop-blur-md">
                {b2bLabel}
              </span>
              {b2bStat && visual.statisticsVisible !== false && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold bg-white/15 text-white/90 border border-white/20 backdrop-blur-md">
                  {b2bStat}
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-xl uppercase">
              {b2bTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed drop-shadow max-w-md line-clamp-2 md:line-clamp-none">
              {b2bDesc}
            </p>
            <div className="pt-1 md:pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect("b2b");
                }}
                type="button"
                className="inline-flex items-center gap-2.5 rounded-xl px-5 py-2.5 md:px-6 md:py-3.5 text-xs md:text-sm font-black text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-950/60 transition-all uppercase tracking-wider cursor-pointer"
              >
                <span>{b2bCta}</span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE HORIZONTAL DIVIDER SEAM LINE */}
        {isMobileViewport && (
          <div className="absolute top-[50vh] left-0 right-0 z-30 h-1 -translate-y-1/2 bg-gradient-to-r from-purple-400 via-indigo-400 to-emerald-400 shadow-[0_0_20px_rgba(168,85,247,0.9)] pointer-events-none" />
        )}

        {/* DESKTOP DYNAMIC SLANTED SEAM LINE */}
        {!isMobileViewport && (
          <div
            style={{
              left: `${b2cSeamLeft}%`,
            }}
            className="hidden md:block absolute top-0 bottom-0 z-30 w-1.5 -skew-x-6 pointer-events-none transition-all duration-700 bg-gradient-to-b from-purple-400 via-indigo-400 to-sky-400 shadow-[0_0_25px_rgba(168,85,247,0.95)]"
          />
        )}
      </div>

      {/* 2. FLOATING HEADER LAYER */}
      <header className="relative z-40 w-full px-6 py-6 md:px-12 flex items-center justify-between pointer-events-auto">
        <a
          href={logo?.destinationUrl || "/"}
          onClick={(e) => { if (previewMode) e.preventDefault(); }}
          className="inline-flex items-center gap-3 transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-1"
          aria-label={isAr ? logo?.altAr || "شعار إي ثري قطر" : logo?.altEn || "E3 Qatar Official Logo"}
        >
          <E3Logo
            isLight={isLight}
            lightLogoUrl={isLight ? logo?.lightLogoUrl || logo?.defaultLogoUrl : undefined}
            darkLogoUrl={!isLight ? logo?.darkLogoUrl || logo?.defaultLogoUrl : undefined}
            size={isMobileViewport ? "sm" : "md"}
          />
        </a>

        {/* Center Headline */}
        <div className="hidden lg:flex flex-col items-center text-center max-w-md pointer-events-none">
          <h1 className="text-xl font-black tracking-tight text-white drop-shadow-lg uppercase">
            {headline}
          </h1>
          <p className="text-xs text-slate-300 font-medium drop-shadow mt-0.5">
            {supportingText}
          </p>
        </div>

        {/* Language & Theme Controls */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-black/40 hover:bg-black/60 backdrop-blur-md text-xs font-bold text-white transition-all cursor-pointer shadow-lg"
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>{activeLocale === "en" ? "العربية" : "EN"}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              const nextTheme = isLight ? "dark" : "light";
              if (previewMode) {
                setLocalPreviewSim((prev) => ({ ...prev, theme: nextTheme }));
              } else {
                setTheme(nextTheme);
              }
            }}
            className="p-2 rounded-full border border-white/20 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all cursor-pointer shadow-lg"
            title="Toggle Light/Dark Theme"
          >
            {isLight ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* 3. CENTER BRAND TAGLINE BADGE FOR DESKTOP */}
      <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none items-center justify-center">
        <div className="px-5 py-2 rounded-full bg-black/70 border border-white/15 backdrop-blur-xl text-xs font-mono font-bold text-slate-200 shadow-2xl tracking-widest uppercase">
          {headline}
        </div>
      </div>
    </div>
  );
}
