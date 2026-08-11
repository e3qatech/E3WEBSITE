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

  // Active portal logic
  const _activeFocus = simulation?.portalFocus !== "none" ? simulation?.portalFocus || null : hoveredPortal || focusedPortal;

  // Content bindings
  const en = activeCmsData.english || DEFAULT_GATEWAY_CMS_PAYLOAD.english;
  const ar = activeCmsData.arabic || DEFAULT_GATEWAY_CMS_PAYLOAD.arabic;
  const logo = activeCmsData.logo || DEFAULT_GATEWAY_CMS_PAYLOAD.logo;
  const visual = activeCmsData.visual || DEFAULT_GATEWAY_CMS_PAYLOAD.visual;
  const seo = activeCmsData.seoAccess || DEFAULT_GATEWAY_CMS_PAYLOAD.seoAccess;

  const eyebrow = isAr ? ar.eyebrowAr || en.eyebrowEn : en.eyebrowEn || ar.eyebrowAr;
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
    : en.b2cDestinationUrl || ar.b2cDestinationUrl || "/b2c";
  const b2cAria = isAr ? ar.b2cAriaLabelAr || seo.b2cAriaLabelAr : en.b2cAriaLabelEn || seo.b2cAriaLabelEn;

  // B2B Content
  const b2bLabel = isAr ? ar.b2bLabelAr || en.b2bLabelEn : en.b2bLabelEn || ar.b2bLabelAr;
  const b2bTitle = isAr ? ar.b2bTitleAr || en.b2bTitleEn : en.b2bTitleEn || ar.b2bLabelAr;
  const b2bDesc = isAr ? ar.b2bDescAr || en.b2bDescEn : en.b2bDescEn || ar.b2bDescAr;
  const b2bCta = isAr ? ar.b2bCtaLabelAr || en.b2bCtaLabelEn : en.b2bCtaLabelEn || ar.b2bCtaLabelAr;
  const b2bStat = isAr ? ar.b2bStatLabelAr || en.b2bStatLabelEn : en.b2bStatLabelEn || ar.b2bStatLabelAr;
  const b2bDest = isAr
    ? ar.b2bDestinationUrl || en.b2bDestinationUrl || "/ar/b2b"
    : en.b2bDestinationUrl || ar.b2bDestinationUrl || "/b2b";
  const b2bAria = isAr ? ar.b2bAriaLabelAr || seo.b2bAriaLabelAr : en.b2bAriaLabelEn || seo.b2bAriaLabelEn;

  const ariaGatewayLabel = isAr ? seo.ariaGatewayLabelAr : seo.ariaGatewayLabelEn;

  // Navigation action
  const handleSelect = useCallback(
    (portal: "b2c" | "b2b") => {
      setSelectedPortal(portal);
      if (!previewMode) {
        try {
          localStorage.setItem("e3_preferred_portal", portal);
        } catch (_e) {}
        const destination = portal === "b2c" ? b2cDest : b2bDest;
        setTimeout(() => {
          router.push(destination);
        }, 350);
      }
    },
    [router, previewMode, b2cDest, b2bDest]
  );

  // Language switcher toggle
  const toggleLanguage = useCallback(() => {
    if (previewMode) {
      setLocalPreviewSim((prev) => ({
        ...prev,
        locale: activeLocale === "en" ? "ar" : "en",
      }));
      return;
    }
    const nextLocale = activeLocale === "en" ? "ar" : "en";
    if (setLocale) setLocale(nextLocale);
    if (pathname) {
      const newPath = pathname.replace(`/${activeLocale}`, `/${nextLocale}`);
      router.push(newPath.startsWith("/") ? newPath : `/${nextLocale}`);
    }
  }, [previewMode, activeLocale, setLocale, pathname, router]);

  // Theme switcher toggle
  const toggleTheme = useCallback(() => {
    if (previewMode) {
      setLocalPreviewSim((prev) => ({
        ...prev,
        theme: isLight ? "dark" : "light",
      }));
      return;
    }
    if (setTheme) {
      setTheme(isLight ? "dark" : "light");
    }
  }, [previewMode, isLight, setTheme]);

  // Viewport Container Dimensions for CMS Live Preview Frame Resizing
  const viewportWidthClass = useMemo(() => {
    if (previewMode) {
      switch (simulation?.viewport) {
        case "small-mobile-320":
          return "w-[320px] h-[568px] mx-auto rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden";
        case "mobile-390":
          return "w-[390px] h-[640px] mx-auto rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden";
        case "tablet-768":
          return "w-[768px] h-[640px] mx-auto rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden";
        case "laptop-1280":
          return "w-full max-w-[1280px] h-[640px] mx-auto rounded-lg border border-slate-700 shadow-2xl overflow-hidden";
        case "desktop-1440":
        default:
          return "w-full h-[640px] rounded-xl overflow-hidden";
      }
    }

    if (!simulation) return "w-full min-h-screen h-screen overflow-hidden";
    switch (simulation.viewport) {
      case "small-mobile-320":
        return "w-[320px] h-[568px] mx-auto rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden";
      case "mobile-390":
        return "w-[390px] h-[720px] mx-auto rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden";
      case "tablet-768":
        return "w-[768px] h-[780px] mx-auto rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden";
      case "laptop-1280":
        return "w-[1280px] h-[720px] mx-auto rounded-lg border border-slate-700 shadow-2xl overflow-hidden";
      case "desktop-1440":
      default:
        return "w-full min-h-screen h-screen overflow-hidden";
    }
  }, [simulation, previewMode]);

  const _isReducedMotion = simulation?.reducedMotion || visual.reducedMotionDefault;

  // Active Media resolution
  const activeB2cDesktopMedia = activeCmsData.b2cDesktopMedia;
  const activeB2cMobileMedia = activeCmsData.b2cMobileMedia || activeCmsData.b2cDesktopMedia;
  const activeB2cMedia = isMobileViewport && activeB2cMobileMedia?.mediaUrl ? activeB2cMobileMedia : activeB2cDesktopMedia;

  const activeB2bDesktopMedia = activeCmsData.b2bDesktopMedia;
  const activeB2bMobileMedia = activeCmsData.b2bMobileMedia || activeCmsData.b2bDesktopMedia;
  const activeB2bMedia = isMobileViewport && activeB2bMobileMedia?.mediaUrl ? activeB2bMobileMedia : activeB2bDesktopMedia;

  // Dynamic slanted seam position (%)
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
      aria-label={ariaGatewayLabel || "E3 Qatar Portal Selection Gateway"}
    >
      {/* 1. FULL-BLEED SEAMLESS CINEMATIC 50/50 PORTALS */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        {/* Wireframe background */}
        {isMounted && visual.backgroundStyle === "wireframe" && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-15 dark:opacity-30">
            <WireframeBackground />
          </div>
        )}

        {/* Ambient Gradient Overlay */}
        <div
          className={cn(
            "absolute inset-0 z-0 pointer-events-none transition-opacity duration-700",
            isLight
              ? "bg-gradient-to-b from-white/70 via-purple-50/10 to-slate-100/80"
              : "bg-gradient-to-b from-slate-950/80 via-purple-950/10 to-black/90"
          )}
        />

        {/* UNDERNEATH LAYER: B2B PORTAL (ENTERPRISE SOLUTIONS / BUILD WITH E3) */}
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
            "absolute inset-0 w-full h-full cursor-pointer transition-all duration-700 overflow-hidden",
            hoveredPortal === "b2b" ? "brightness-105 z-10" : hoveredPortal === "b2c" ? "opacity-75 grayscale-[20%]" : "opacity-100"
          )}
        >
          <UniversalMediaHolder
            config={simulation?.useFallbackMedia ? { ...activeB2bMedia, mediaUrl: activeB2bMedia.fallbackImageUrl, mediaType: 'IMAGE' } : activeB2bMedia}
            locale={activeLocale}
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 opacity-50 group-hover:opacity-70",
              hoveredPortal === "b2b" ? "scale-105" : "scale-100"
            )}
          />
          <div
            className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/95 via-indigo-950/60 to-transparent"
            style={{ opacity: visual.overlayStrength ?? 0.6 }}
          />
          
          {/* B2B Content Overlay */}
          <div className="absolute bottom-10 end-8 md:end-16 z-30 max-w-xl space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-indigo-500/30 text-indigo-200 border border-indigo-400/50 shadow-lg backdrop-blur-md">
                {b2bLabel}
              </span>
              {b2bStat && visual.statisticsVisible !== false && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white/90 border border-white/20 backdrop-blur-md">
                  {b2bStat}
                </span>
              )}
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-lg uppercase">
              {b2bTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed drop-shadow-sm max-w-md line-clamp-3 md:line-clamp-none">
              {b2bDesc}
            </p>
            <div className="pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect("b2b");
                }}
                type="button"
                className="inline-flex items-center gap-3 rounded-xl px-6 py-3.5 text-xs md:text-sm font-black text-white bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-950/60 transition-all min-h-[48px] uppercase tracking-wider cursor-pointer"
              >
                <span>{b2bCta}</span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* TOP OVERLAID LAYER: B2C PORTAL (PUBLIC EXPERIENCES / EXPERIENCE WITH E3) CLIPPED ANGLED */}
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
            "absolute inset-0 w-full h-full cursor-pointer transition-all duration-700 overflow-hidden z-20",
            hoveredPortal === "b2c" ? "brightness-105" : hoveredPortal === "b2b" ? "opacity-75 grayscale-[20%]" : "opacity-100"
          )}
        >
          <UniversalMediaHolder
            config={simulation?.useFallbackMedia ? { ...activeB2cMedia, mediaUrl: activeB2cMedia.fallbackImageUrl, mediaType: 'IMAGE' } : activeB2cMedia}
            locale={activeLocale}
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 opacity-50 group-hover:opacity-70",
              hoveredPortal === "b2c" ? "scale-105" : "scale-100"
            )}
          />
          <div
            className="absolute inset-0 pointer-events-none bg-gradient-to-t from-violet-950/95 via-purple-950/60 to-transparent"
            style={{ opacity: visual.overlayStrength ?? 0.6 }}
          />

          {/* B2C Content Overlay */}
          <div className="absolute bottom-10 start-8 md:start-16 z-30 max-w-xl space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-purple-500/30 text-purple-200 border border-purple-400/50 shadow-lg backdrop-blur-md">
                {b2cLabel}
              </span>
              {b2cStat && visual.statisticsVisible !== false && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white/90 border border-white/20 backdrop-blur-md">
                  {b2cStat}
                </span>
              )}
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-lg uppercase">
              {b2cTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed drop-shadow-sm max-w-md line-clamp-3 md:line-clamp-none">
              {b2cDesc}
            </p>
            <div className="pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect("b2c");
                }}
                type="button"
                className="inline-flex items-center gap-3 rounded-xl px-6 py-3.5 text-xs md:text-sm font-black text-white bg-purple-600 hover:bg-purple-500 shadow-2xl shadow-purple-950/60 transition-all min-h-[48px] uppercase tracking-wider cursor-pointer"
              >
                <span>{b2cCta}</span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* DYNAMIC SLANTED SEAM LINE (DESKTOP SEPARATOR) */}
        <div
          style={{
            left: `${b2cSeamLeft}%`,
          }}
          className="hidden md:block absolute top-0 bottom-0 z-30 w-1.5 -skew-x-6 pointer-events-none transition-all duration-700 bg-gradient-to-b from-purple-400 via-indigo-400 to-sky-400 shadow-[0_0_25px_rgba(168,85,247,0.95)]"
        />
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

        <div className="flex items-center gap-3">
          {visual.languageSwitcherVisible !== false && (
            <button
              onClick={toggleLanguage}
              type="button"
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black transition-all border shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer",
                isLight
                  ? "bg-white/90 text-slate-800 border-slate-300/80 hover:bg-white hover:border-purple-400"
                  : "bg-slate-900/90 text-slate-100 border-slate-700/80 hover:bg-slate-800 hover:border-purple-500/50"
              )}
              aria-label={isAr ? "Switch to English" : "التحويل إلى العربية"}
            >
              <Globe className="h-4 w-4 text-purple-400" />
              <span>{isAr ? "English" : "العربية"}</span>
            </button>
          )}

          {visual.themeSwitcherVisible !== false && (
            <button
              onClick={toggleTheme}
              type="button"
              className={cn(
                "inline-flex items-center justify-center p-2 rounded-full text-xs transition-all border shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer",
                isLight
                  ? "bg-white/90 text-slate-800 border-slate-300/80 hover:bg-white"
                  : "bg-slate-900/90 text-slate-100 border-slate-700/80 hover:bg-slate-800"
              )}
              aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {isLight ? (
                <Moon className="h-4 w-4 text-purple-600" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* 3. FLOATING BILINGUAL GATEWAY INTRODUCTION */}
      <section className="relative z-30 w-full px-6 md:px-12 pt-2 pb-2 text-center max-w-4xl mx-auto flex flex-col items-center pointer-events-none">
        {eyebrow && (
          <span
            className={cn(
              "inline-block px-3.5 py-1 mb-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full border shadow-lg backdrop-blur-md transition-all pointer-events-auto",
              isLight
                ? "bg-purple-100/90 text-purple-900 border-purple-200"
                : "bg-purple-950/80 text-purple-300 border-purple-500/30"
            )}
          >
            {eyebrow}
          </span>
        )}

        <h1
          className={cn(
            "text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none transition-colors uppercase drop-shadow-lg",
            isLight ? "text-slate-900" : "text-white"
          )}
        >
          {headline}
        </h1>

        {supportingText && (
          <p
            className={cn(
              "mt-2 text-xs md:text-sm font-semibold leading-relaxed max-w-2xl text-balance transition-colors drop-shadow-md",
              isLight ? "text-slate-700" : "text-slate-200"
            )}
          >
            {supportingText}
          </p>
        )}
      </section>

      <div className="relative z-20 pointer-events-none pb-4" />
    </div>
  );
}
