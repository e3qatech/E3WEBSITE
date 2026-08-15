"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Globe, Moon, Sun, Sparkles, Building2, Ticket } from "lucide-react";

import { useLocale } from "@/components/layout/LocaleProvider";
import { useTheme } from "@/components/layout/ThemeProvider";
import { E3Logo } from "@/components/shared/E3Logo";
import { UniversalMediaHolder } from "@/components/shared/UniversalMediaHolder";
import { playSpatialHoverSound } from "@/components/b2c/nav/PulseOrbitNav";
import { WebGLBoundary } from "@/components/motion/WebGLBoundary";
import { useCapabilityTier } from "@/lib/motion/capability-context";
import { isWebGLSupported } from "@/lib/webgl-capability";
import { cn } from "@/lib/utils";
import { localizeHref } from "@/lib/url-helper";
import {
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  GatewayCustomizationPayload,
  GatewayPreviewSimulationState,
} from "@/types/gateway-cms";

// Dynamic 3D Scene Components
const WireframeBackground = dynamic(
  () => import("./WireframeBackground").then((mod) => mod.WireframeBackground),
  { ssr: false }
);

const GatewayPortalScene = dynamic(
  () => import("./GatewayPortalScene").then((mod) => mod.GatewayPortalScene),
  { ssr: false }
);

export interface PortalGatewayProps {
  cmsData?: GatewayCustomizationPayload;
  previewMode?: boolean;
  previewConfig?: GatewayCustomizationPayload;
  simulation?: Partial<GatewayPreviewSimulationState>;
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
  const systemTier = useCapabilityTier();

  // Interaction State
  const [hoveredPortal, setHoveredPortal] = useState<"b2c" | "b2b" | null>(null);
  const [focusedPortal, setFocusedPortal] = useState<"b2c" | "b2b" | null>(null);
  const [navigatingPortal, setNavigatingPortal] = useState<"b2c" | "b2b" | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; normalizedX: number; normalizedY: number }>({
    x: -100,
    y: -100,
    normalizedX: 0,
    normalizedY: 0,
  });
  const [isPointerInside, setIsPointerInside] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport & Touch Detection
  useEffect(() => {
    setIsMounted(true);
    const checkViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Mobile Viewport detection (real window OR simulated mobile in preview mode)
  const isSimulatedMobile = previewMode && simulation?.viewport === "mobile-390";
  const effectiveIsMobile = isSimulatedMobile || isMobileViewport;

  // Active CMS Configuration
  const activeCmsData = previewMode && previewConfig ? previewConfig : initialCmsData;
  const [localPreviewSim, setLocalPreviewSim] = useState<{ locale?: "en" | "ar"; theme?: "dark" | "light" }>({});

  // Locale & Direction Resolution
  const activeLocale = previewMode
    ? localPreviewSim.locale || simulation?.locale || "en"
    : simulation?.locale || contextLocale || "en";
  const isAr = activeLocale === "ar";
  const activeDir = isAr ? "rtl" : "ltr";

  // Theme Resolution
  const resolvedTheme = previewMode
    ? localPreviewSim.theme || simulation?.theme || activeCmsData.visual?.themeMode || "dark"
    : simulation?.theme || contextTheme || activeCmsData.visual?.themeMode || "dark";
  const isLight = resolvedTheme === "light";

  // Capability Tier Resolution
  // Prioritize simulation override if provided, else system tier
  const effectiveTier = simulation?.reducedMotion
    ? "minimal"
    : simulation?.useFallbackMedia
    ? "balanced"
    : systemTier;
  const isReducedMotion = simulation?.reducedMotion || activeCmsData.visual?.reducedMotionDefault || effectiveTier === "minimal";
  const isFullTier = effectiveTier === "full" && !isReducedMotion && isWebGLSupported();
  const _isBalancedTier = effectiveTier === "balanced" && !isReducedMotion;

  // Content bindings
  const en = activeCmsData.english || DEFAULT_GATEWAY_CMS_PAYLOAD.english;
  const ar = activeCmsData.arabic || DEFAULT_GATEWAY_CMS_PAYLOAD.arabic;
  const logo = activeCmsData.logo || DEFAULT_GATEWAY_CMS_PAYLOAD.logo;
  const visual = activeCmsData.visual || DEFAULT_GATEWAY_CMS_PAYLOAD.visual;
  const seo = activeCmsData.seoAccess || DEFAULT_GATEWAY_CMS_PAYLOAD.seoAccess;

  const headline = isAr ? (ar.headlineAr || "عالمان. وجهة واحدة: E3") : (en.headlineEn || "TWO WORLDS. ONE E3.");

  // B2C Content
  const b2cLabel = isAr ? (ar.b2cLabelAr || "التجارب والوجهات") : (en.b2cLabelEn || "EXPERIENCES & ATTRACTIONS");
  const b2cTitle = isAr ? (ar.b2cTitleAr || "عِش التجربة القادمة") : (en.b2cTitleEn || "EXPERIENCE WHAT’S NEXT");
  const b2cDesc = isAr ? (ar.b2cDescAr || "اكتشف الفعاليات الحية والوجهات العائلية وتجارب الترفيه الاستثنائية في مختلف أنحاء قطر.") : (en.b2cDescEn || "Discover live events, family attractions and unforgettable entertainment experiences across Qatar.");
  const b2cCta = isAr ? (ar.b2cCtaLabelAr || "استكشف التجارب") : (en.b2cCtaLabelEn || "Explore Experiences");
  const b2cStat = isAr ? (ar.b2cStatLabelAr ?? "+١.٢ مليون زائر سنوياً") : (en.b2cStatLabelEn ?? "1.2M+ Annual Visitors");
  const rawB2cDest = isAr ? (ar.b2cDestinationUrl || "/ar/b2c") : (en.b2cDestinationUrl || "/en/b2c");
  const b2cDest = localizeHref(rawB2cDest, activeLocale);
  const b2cAria = isAr ? (ar.b2cAriaLabelAr || "بوابة تجارب الأفراد والجمهور") : (en.b2cAriaLabelEn || "E3 B2C Experiences Portal");

  // B2B Content
  const b2bLabel = isAr ? (ar.b2bLabelAr || "للعلامات التجارية والمؤسسات") : (en.b2bLabelEn || "FOR BRANDS & ORGANIZATIONS");
  const b2bTitle = isAr ? (ar.b2bTitleAr || "لنصنع القادم") : (en.b2bTitleEn || "BUILD WHAT’S NEXT");
  const b2bDesc = isAr ? (ar.b2bDescAr || "تعاون مع E3 لتصميم وإنتاج وتشغيل فعاليات ووجهات وتجارب غامرة تترك أثراً استثنائياً.") : (en.b2bDescEn || "Partner with E3 to design, produce and operate remarkable events, destinations and immersive brand experiences.");
  const b2bCta = isAr ? (ar.b2bCtaLabelAr || "تعاون مع E3") : (en.b2bCtaLabelEn || "Work With E3");
  const b2bStat = isAr ? (ar.b2bStatLabelAr ?? "+٤٥٠ مشروع مؤسسي") : (en.b2bStatLabelEn ?? "450+ Corporate Activations");
  const rawB2bDest = isAr ? (ar.b2bDestinationUrl || "/ar/b2b") : (en.b2bDestinationUrl || "/en/b2b");
  const b2bDest = localizeHref(rawB2bDest, activeLocale);
  const b2bAria = isAr ? (ar.b2bAriaLabelAr || "بوابة حلول الشركات والمؤسسات") : (en.b2bAriaLabelEn || "E3 B2B Enterprise Solutions Portal");

  // Media resolution
  const activeB2cDesktopMedia = activeCmsData.b2cDesktopMedia;
  const activeB2cMobileMedia = activeCmsData.b2cMobileMedia || activeCmsData.b2cDesktopMedia;
  const activeB2cMedia = effectiveIsMobile && activeB2cMobileMedia?.mediaUrl ? activeB2cMobileMedia : activeB2cDesktopMedia;

  const activeB2bDesktopMedia = activeCmsData.b2bDesktopMedia;
  const activeB2bMobileMedia = activeCmsData.b2bMobileMedia || activeCmsData.b2bDesktopMedia;
  const activeB2bMedia = effectiveIsMobile && activeB2bMobileMedia?.mediaUrl ? activeB2bMobileMedia : activeB2bDesktopMedia;

  // Active Selected / Focus State
  const activeFocus = previewMode && simulation?.portalFocus && simulation.portalFocus !== "none"
    ? simulation.portalFocus
    : navigatingPortal || hoveredPortal || focusedPortal;

  // Desktop Split Percentages: Default 50/50 -> Selected 58/42
  const splitRatio = useMemo(() => {
    if (navigatingPortal === "b2c") return { b2c: 100, b2b: 0 };
    if (navigatingPortal === "b2b") return { b2c: 0, b2b: 100 };

    const selectedWidth = 58;
    const oppositeWidth = 42;

    if (activeFocus === "b2c") {
      return { b2c: selectedWidth, b2b: oppositeWidth };
    }
    if (activeFocus === "b2b") {
      return { b2c: oppositeWidth, b2b: selectedWidth };
    }
    return { b2c: 50, b2b: 50 };
  }, [activeFocus, navigatingPortal]);

  // Pointer Movement Inside Panel Area
  const handlePointerMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || isReducedMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normalizedX = (x / rect.width - 0.5) * 2;
    const normalizedY = (y / rect.height - 0.5) * 2;

    setMousePos({ x, y, normalizedX, normalizedY });
    setIsPointerInside(true);
  }, [isTouchDevice, isReducedMotion]);

  const handlePointerLeave = useCallback(() => {
    setIsPointerInside(false);
  }, []);

  // Click / Selection Handler with 500ms transition
  const handleSelect = useCallback(
    (portal: "b2c" | "b2b") => {
      if (previewMode) return;
      const targetUrl = portal === "b2c" ? b2cDest : b2bDest;

      if (isReducedMotion) {
        router.push(targetUrl);
        return;
      }

      setNavigatingPortal(portal);
      setTimeout(() => {
        router.push(targetUrl);
      }, 500);
    },
    [previewMode, b2cDest, b2bDest, isReducedMotion, router]
  );

  // Perspective calculation (max 2 degrees, max 12px shift)
  const b2cPerspectiveStyle = useMemo(() => {
    if (isReducedMotion || effectiveIsMobile || !isPointerInside) return {};
    const shiftX = mousePos.normalizedX * 12;
    const shiftY = mousePos.normalizedY * 12;
    const rotY = mousePos.normalizedX * 2;
    const rotX = -mousePos.normalizedY * 2;
    return {
      transform: `translate3d(${shiftX}px, ${shiftY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
      transformOrigin: isAr ? "right center" : "left center",
    };
  }, [isReducedMotion, effectiveIsMobile, isPointerInside, mousePos, isAr]);

  const b2bPerspectiveStyle = useMemo(() => {
    if (isReducedMotion || effectiveIsMobile || !isPointerInside) return {};
    const shiftX = mousePos.normalizedX * 12;
    const shiftY = mousePos.normalizedY * 12;
    const rotY = mousePos.normalizedX * 2;
    const rotX = -mousePos.normalizedY * 2;
    return {
      transform: `translate3d(${shiftX}px, ${shiftY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
      transformOrigin: isAr ? "left center" : "right center",
    };
  }, [isReducedMotion, effectiveIsMobile, isPointerInside, mousePos, isAr]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Syne:wght@700;800;900&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        /* 0-1150ms Entrance Keyframes */
        @keyframes e3FadeInMedia {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes e3CenterPulse {
          0% { opacity: 0; transform: scaleY(0); }
          50% { opacity: 1; transform: scaleY(1.05); }
          100% { opacity: 0.8; transform: scaleY(1); }
        }
        @keyframes e3PortalRingReveal {
          0% { opacity: 0; transform: scale(0.85); filter: blur(6px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes e3H1Reveal {
          0% { opacity: 0; transform: translateY(-16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes e3ContentRise {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes e3ControlsAppear {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .anim-media-in { animation: e3FadeInMedia 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .anim-pulse-in { animation: e3CenterPulse 500ms 150ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        .anim-portal-in { animation: e3PortalRingReveal 650ms 250ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        .anim-h1-in { animation: e3H1Reveal 500ms 450ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        .anim-content-in { animation: e3ContentRise 450ms 650ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        .anim-controls-in { animation: e3ControlsAppear 300ms 850ms cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}} />

      <div
        ref={containerRef}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        className={cn(
          "relative w-full min-h-[100svh] h-screen overflow-hidden flex flex-col justify-between font-jakarta select-none transition-colors duration-500",
          isLight ? "bg-[#f4f4f6] text-slate-900" : "bg-[#070A12] text-white"
        )}
        dir={activeDir}
        role="region"
        aria-label={isAr ? (seo.ariaGatewayLabelAr || "بوابة الاختيار الرئيسية لمنصة إي ثري قطر") : (seo.ariaGatewayLabelEn || "E3 Qatar main gateway portal selection")}
      >
        {/* Optional 3D Wireframe Background for Full Tier */}
        {isFullTier && visual.backgroundStyle === "wireframe" && (
          <WebGLBoundary fallback={null} minHeight="100%">
            <WireframeBackground />
          </WebGLBoundary>
        )}

        {/* 36px Luminous Pointer Halo (Active only in cinematic area on non-touch desktop) */}
        {!isReducedMotion && !isTouchDevice && !effectiveIsMobile && isPointerInside && isMounted && (
          <div
            className="pointer-events-none fixed z-50 w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen opacity-70 blur-md transition-opacity duration-300"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              background: activeFocus === "b2b"
                ? "radial-gradient(circle, #22D3EE 0%, #3B82F6 60%, transparent 100%)"
                : "radial-gradient(circle, #EC4899 0%, #8B5CF6 60%, transparent 100%)",
            }}
          />
        )}

        {/* Subtle Architectural Grain Overlay */}
        <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.025] mix-blend-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <filter id="noise-gateway">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise-gateway)" />
          </svg>
        </div>

        {/* ============================================================ */}
        {/* 1. TOP HEADER & CENTRED E3 LOGO & CONTROLS */}
        {/* ============================================================ */}
        <header className={cn("relative z-50 w-full px-4 pt-4 md:px-10 md:pt-6 pointer-events-auto", !isReducedMotion && "anim-controls-in")}>
          <div className="w-full flex items-center justify-between p-3.5 md:px-8 md:py-4 rounded-2xl md:rounded-full bg-black/60 border border-white/15 backdrop-blur-2xl shadow-2xl">
            
            {/* E3 Logo: Top Left in LTR / Top Right in RTL */}
            <a
              href={logo?.destinationUrl || "/"}
              onClick={(e) => { if (previewMode) e.preventDefault(); }}
              className="inline-flex items-center gap-3 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg min-w-[44px] min-h-[44px]"
              aria-label={isAr ? logo?.altAr || "شعار إي ثري قطر الرسمي" : logo?.altEn || "Official E3 Qatar Logo"}
            >
              <E3Logo
                isLight={isLight}
                lightLogoUrl={isLight ? logo?.lightLogoUrl || logo?.defaultLogoUrl : undefined}
                darkLogoUrl={!isLight ? logo?.darkLogoUrl || logo?.defaultLogoUrl : undefined}
                size={effectiveIsMobile ? "sm" : "md"}
              />
            </a>

            {/* Centered H1 (Visible on large screens, semantic everywhere) */}
            <div className="flex-1 flex justify-center px-4">
              <h1 className="flex items-center gap-2.5 px-4 md:px-6 py-2 rounded-full bg-white/5 border border-white/15 text-xs md:text-sm font-mono font-bold tracking-widest text-slate-200 uppercase m-0 shadow-lg">
                <span className={cn("w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400", !isReducedMotion && "animate-pulse")} aria-hidden="true" />
                <span>{headline}</span>
              </h1>
            </div>

            {/* Language & Theme Controls: Top Right in LTR / Top Left in RTL */}
            <div className="flex items-center gap-2.5 md:gap-4">
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
                  className="flex items-center gap-2 px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs md:text-sm font-bold text-white transition-all cursor-pointer shadow-md min-w-[44px] min-h-[44px] focus-visible:ring-2 focus-visible:ring-purple-400 focus:outline-none"
                  aria-label={activeLocale === "en" ? "التبديل إلى اللغة العربية" : "Switch to English"}
                >
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>{activeLocale === "en" ? "العربية" : "ENGLISH"}</span>
                </button>
              )}

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
                  className="p-2.5 md:p-3 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all cursor-pointer shadow-md min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-purple-400 focus:outline-none"
                  title={isAr ? "تبديل المظهر النهاري والليلي" : "Toggle Light/Dark Theme"}
                  aria-label={isAr ? "تبديل المظهر" : "Toggle Theme"}
                >
                  {isLight ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* 2. DUAL PORTAL CANVAS & CENTRAL DIMENSIONAL APERTURE */}
        {/* ============================================================ */}
        <main className="relative flex-1 w-full h-full overflow-hidden z-10">
          
          {/* MOBILE VIEW (< 768px): 50/50 HORIZONTAL TOP/BOTTOM STACK */}
          {effectiveIsMobile ? (
            <div className="flex flex-col w-full relative h-[calc(100vh-85px)]">
              
              {/* B2C WONDER IN MOTION (TOP HALF) */}
              <div
                onClick={() => handleSelect("b2c")}
                className="relative h-1/2 w-full overflow-hidden flex flex-col justify-end p-5 cursor-pointer group bg-[#0B1020]"
                role="button"
                tabIndex={0}
                aria-label={b2cAria || b2cTitle}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelect("b2c"); }}
              >
                <UniversalMediaHolder
                  config={simulation?.useFallbackMedia ? { ...activeB2cMedia, mediaUrl: activeB2cMedia.fallbackImageUrl, mediaType: "IMAGE" } : activeB2cMedia}
                  locale={activeLocale}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover opacity-100 transition-transform duration-500",
                    !isReducedMotion && "group-hover:scale-105"
                  )}
                />
                
                {/* B2C Atmospheric Gradient Overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#0B1020]/95 via-[#0B1020]/40 to-transparent pointer-events-none"
                  style={{ opacity: visual?.overlayStrength ?? 0.45 }}
                />

                {/* B2C Mobile Overlay Content */}
                <div className="relative z-30 space-y-2 max-w-md w-full">
                  <div className="w-full flex items-center justify-between gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-purple-600/40 text-purple-200 border border-purple-400/50 backdrop-blur-md flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-purple-300" />
                      <span>{b2cLabel}</span>
                    </span>
                    {b2cStat && visual.statisticsVisible !== false && (
                      <span className="text-xs font-mono text-purple-200 font-extrabold bg-black/80 px-2.5 py-0.5 rounded-full border border-purple-400/40 backdrop-blur-md">
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
                    <a
                      href={b2cDest}
                      onClick={(e) => {
                        if (previewMode) e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg flex items-center justify-between min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-300 focus:outline-none"
                    >
                      <span>{b2cCta}</span>
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                        {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* HORIZONTAL DIMENSIONAL APERTURE SEAM FOR MOBILE */}
              <div className="relative z-40 w-full h-8 -my-4 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-6 rounded-full border border-cyan-400/60 bg-gradient-to-r from-purple-600/40 via-cyan-400/40 to-blue-600/40 shadow-[0_0_20px_rgba(34,211,238,0.8)] backdrop-blur-md flex items-center justify-center">
                  <div className="w-32 h-0.5 bg-gradient-to-r from-pink-400 via-white to-cyan-400 animate-pulse" />
                </div>
              </div>

              {/* B2B ENGINEERED SPECTACLE (BOTTOM HALF) */}
              <div
                onClick={() => handleSelect("b2b")}
                className="relative h-1/2 w-full overflow-hidden flex flex-col justify-end p-5 cursor-pointer group bg-[#070A12]"
                role="button"
                tabIndex={0}
                aria-label={b2bAria || b2bTitle}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelect("b2b"); }}
              >
                <UniversalMediaHolder
                  config={simulation?.useFallbackMedia ? { ...activeB2bMedia, mediaUrl: activeB2bMedia.fallbackImageUrl, mediaType: "IMAGE" } : activeB2bMedia}
                  locale={activeLocale}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover opacity-95 transition-transform duration-500",
                    !isReducedMotion && "group-hover:scale-105"
                  )}
                />
                
                {/* B2B Architectural Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* B2B Atmospheric Gradient Overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#070A12]/95 via-[#070A12]/40 to-transparent pointer-events-none"
                  style={{ opacity: visual?.overlayStrength ?? 0.45 }}
                />

                {/* B2B Mobile Overlay Content */}
                <div className="relative z-30 space-y-2 max-w-md w-full">
                  <div className="w-full flex items-center justify-between gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-blue-600/40 text-cyan-200 border border-cyan-400/50 backdrop-blur-md flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-cyan-300" />
                      <span>{b2bLabel}</span>
                    </span>
                    {b2bStat && visual.statisticsVisible !== false && (
                      <span className="text-xs font-mono text-cyan-200 font-extrabold bg-black/80 px-2.5 py-0.5 rounded-full border border-cyan-400/40 backdrop-blur-md">
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
                    <a
                      href={b2bDest}
                      onClick={(e) => {
                        if (previewMode) e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg flex items-center justify-between min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-300 focus:outline-none"
                    >
                      <span>{b2bCta}</span>
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                        {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DESKTOP VIEW (>= 768px): 50/50 -> 58/42 DIMENSIONAL SPLIT */
            <div className="absolute inset-0 w-full h-full flex flex-row">
              
              {/* ============================================================ */}
              {/* B2C PANEL: Wonder in Motion */}
              {/* English: Left Panel | Arabic: Right Panel (natural flex-row with dir="rtl") */}
              {/* ============================================================ */}
              <div
                onMouseEnter={() => { setHoveredPortal("b2c"); playSpatialHoverSound(isAr ? 0.5 : -0.5); }}
                onMouseLeave={() => setHoveredPortal(null)}
                onFocus={() => setFocusedPortal("b2c")}
                onBlur={() => setFocusedPortal(null)}
                onClick={() => handleSelect("b2c")}
                tabIndex={0}
                role="button"
                aria-label={b2cAria || b2cTitle}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelect("b2c"); }}
                style={{
                  width: `${splitRatio.b2c}%`,
                  transition: isReducedMotion ? "none" : "width 500ms cubic-bezier(0.32, 0.72, 0, 1), opacity 500ms ease, filter 500ms ease",
                }}
                className={cn(
                  "relative h-full cursor-pointer overflow-hidden group bg-[#0B1020] focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 z-20",
                  !isReducedMotion && "anim-media-in",
                  activeFocus === "b2c"
                    ? "brightness-105 z-30"
                    : activeFocus === "b2b"
                    ? "opacity-58 blur-[2px]"
                    : "opacity-100"
                )}
              >
                {/* Media Container with 1.00 -> 1.04 Scale & 12px Light Shift */}
                <div
                  style={b2cPerspectiveStyle}
                  className="w-full h-full relative transition-transform duration-500 ease-out"
                >
                  <UniversalMediaHolder
                    config={simulation?.useFallbackMedia ? { ...activeB2cMedia, mediaUrl: activeB2cMedia.fallbackImageUrl, mediaType: "IMAGE" } : activeB2cMedia}
                    locale={activeLocale}
                    className={cn(
                      "h-full w-full object-cover opacity-100 transition-all duration-500 ease-out",
                      !isReducedMotion && (activeFocus === "b2c" ? "scale-[1.04]" : "scale-100")
                    )}
                  />
                  
                  {/* B2C Luminous Atmospheric Glow (#8B5CF6 / #EC4899 / #22D3EE / #F59E0B) */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#0B1020]/95 via-[#0B1020]/40 to-transparent pointer-events-none"
                    style={{ opacity: visual?.overlayStrength ?? 0.45 }}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.25)_0%,rgba(236,72,153,0.15)_35%,rgba(245,158,11,0.05)_70%,transparent_100%)] pointer-events-none transition-opacity duration-500",
                      activeFocus === "b2c" ? "opacity-100" : "opacity-60"
                    )}
                  />
                </div>

                {/* B2C Double-Bezel Card (Lower-Middle Area) */}
                <div
                  className={cn(
                    "absolute bottom-12 start-8 md:start-16 max-w-xl z-30 space-y-4 rounded-3xl bg-black/60 backdrop-blur-2xl p-8 md:p-10 border border-purple-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500",
                    !isReducedMotion && "anim-content-in",
                    activeFocus === "b2c" ? "border-purple-400/60 shadow-[0_25px_60px_rgba(139,92,246,0.3)]" : ""
                  )}
                >
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

                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-syne uppercase tracking-tight text-white leading-none drop-shadow-xl">
                    {b2cTitle}
                  </h2>
                  <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed drop-shadow">
                    {b2cDesc}
                  </p>

                  <div className="pt-2">
                    <a
                      href={b2cDest}
                      onClick={(e) => {
                        if (previewMode) e.preventDefault();
                        e.stopPropagation();
                      }}
                      className={cn(
                        "inline-flex items-center gap-3 rounded-full px-7 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs md:text-sm font-extrabold uppercase tracking-widest transition-all shadow-xl shadow-purple-950/60 cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-purple-300 focus:outline-none",
                        navigatingPortal === "b2c" && "scale-95 duration-100"
                      )}
                    >
                      <span>{b2cCta}</span>
                      <div className={cn("w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all", !isReducedMotion && "group-hover:translate-x-1")}>
                        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* B2B PANEL: Engineered Spectacle */}
              {/* English: Right Panel | Arabic: Left Panel */}
              {/* ============================================================ */}
              <div
                onMouseEnter={() => { setHoveredPortal("b2b"); playSpatialHoverSound(isAr ? -0.5 : 0.5); }}
                onMouseLeave={() => setHoveredPortal(null)}
                onFocus={() => setFocusedPortal("b2b")}
                onBlur={() => setFocusedPortal(null)}
                onClick={() => handleSelect("b2b")}
                tabIndex={0}
                role="button"
                aria-label={b2bAria || b2bTitle}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelect("b2b"); }}
                style={{
                  width: `${splitRatio.b2b}%`,
                  transition: isReducedMotion ? "none" : "width 500ms cubic-bezier(0.32, 0.72, 0, 1), opacity 500ms ease, filter 500ms ease",
                }}
                className={cn(
                  "relative h-full cursor-pointer overflow-hidden group bg-[#070A12] focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 z-20",
                  !isReducedMotion && "anim-media-in",
                  activeFocus === "b2b"
                    ? "brightness-105 z-30"
                    : activeFocus === "b2c"
                    ? "opacity-58 blur-[2px]"
                    : "opacity-100"
                )}
              >
                {/* Media Container with 1.00 -> 1.04 Scale & Architectural Grid Lines */}
                <div
                  style={b2bPerspectiveStyle}
                  className="w-full h-full relative transition-transform duration-500 ease-out"
                >
                  <UniversalMediaHolder
                    config={simulation?.useFallbackMedia ? { ...activeB2bMedia, mediaUrl: activeB2bMedia.fallbackImageUrl, mediaType: "IMAGE" } : activeB2bMedia}
                    locale={activeLocale}
                    className={cn(
                      "h-full w-full object-cover opacity-95 transition-all duration-500 ease-out",
                      !isReducedMotion && (activeFocus === "b2b" ? "scale-[1.04] opacity-100" : "scale-100")
                    )}
                  />
                  
                  {/* B2B Architectural Coordinate Grid Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f612_1px,transparent_1px),linear-gradient(to_bottom,#3b82f612_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                  {/* B2B Gradient Overlay (#070A12 / #0B1020 / #3B82F6 / #22D3EE / #7C3AED) */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#070A12]/95 via-[#070A12]/40 to-transparent pointer-events-none"
                    style={{ opacity: visual?.overlayStrength ?? 0.45 }}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.25)_0%,rgba(34,211,238,0.15)_40%,rgba(124,58,237,0.1)_70%,transparent_100%)] pointer-events-none transition-opacity duration-500",
                      activeFocus === "b2b" ? "opacity-100" : "opacity-60"
                    )}
                  />
                </div>

                {/* B2B Double-Bezel Card (Lower-Middle Area) */}
                <div
                  className={cn(
                    "absolute bottom-12 end-8 md:end-16 max-w-xl z-30 space-y-4 rounded-3xl bg-black/60 backdrop-blur-2xl p-8 md:p-10 border border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500",
                    !isReducedMotion && "anim-content-in",
                    activeFocus === "b2b" ? "border-cyan-400/60 shadow-[0_25px_60px_rgba(34,211,238,0.3)]" : ""
                  )}
                >
                  <div className="w-full flex items-center justify-between gap-4 mb-2">
                    <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-blue-600/30 text-cyan-200 border border-cyan-400/40 backdrop-blur-md flex items-center gap-2 shadow-sm">
                      <Building2 className="w-4 h-4 text-cyan-300" />
                      <span>{b2bLabel}</span>
                    </span>
                    {b2bStat && visual.statisticsVisible !== false && (
                      <span className="px-4 py-1.5 rounded-full text-xs font-mono font-extrabold tracking-wider bg-black/80 text-cyan-200 border border-cyan-400/40 backdrop-blur-md shadow-sm">
                        {b2bStat}
                      </span>
                    )}
                  </div>

                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-syne uppercase tracking-tight text-white leading-none drop-shadow-xl">
                    {b2bTitle}
                  </h2>
                  <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed drop-shadow">
                    {b2bDesc}
                  </p>

                  <div className="pt-2">
                    <a
                      href={b2bDest}
                      onClick={(e) => {
                        if (previewMode) e.preventDefault();
                        e.stopPropagation();
                      }}
                      className={cn(
                        "inline-flex items-center gap-3 rounded-full px-7 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs md:text-sm font-extrabold uppercase tracking-widest transition-all shadow-xl shadow-cyan-950/60 cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyan-300 focus:outline-none",
                        navigatingPortal === "b2b" && "scale-95 duration-100"
                      )}
                    >
                      <span>{b2bCta}</span>
                      <div className={cn("w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all", !isReducedMotion && "group-hover:translate-x-1")}>
                        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* 3. CENTRAL DIMENSIONAL PORTAL APERTURE */}
              {/* ============================================================ */}
              <div
                style={{
                  left: `${isAr ? 100 - splitRatio.b2c : splitRatio.b2c}%`,
                  transition: isReducedMotion ? "none" : "left 500ms cubic-bezier(0.32, 0.72, 0, 1)",
                }}
                className={cn(
                  "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center justify-center",
                  !isReducedMotion && "anim-portal-in",
                  navigatingPortal && "scale-150 opacity-0 duration-500"
                )}
              >
                {/* Thin Center Pulse Line */}
                <div
                  className={cn(
                    "absolute top-[-100vh] bottom-[-100vh] w-[1.5px] pointer-events-none bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.9)]",
                    !isReducedMotion && "anim-pulse-in"
                  )}
                />

                {/* Central Elliptical Aperture: clamp(150px, 16vw, 250px) by clamp(420px, 68vh, 760px) */}
                <div className="relative w-[clamp(150px,16vw,250px)] h-[clamp(420px,68vh,760px)] flex items-center justify-center">
                  {isFullTier ? (
                    <GatewayPortalScene
                      isMobile={false}
                      hoveredWorld={activeFocus as any}
                      isReducedMotion={isReducedMotion}
                      isRtl={isAr}
                    />
                  ) : (
                    /* Balanced / Minimal Tier SVG Fallback */
                    <GatewayPortalScene
                      isMobile={false}
                      hoveredWorld={activeFocus as any}
                      isReducedMotion={isReducedMotion}
                      isRtl={isAr}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
