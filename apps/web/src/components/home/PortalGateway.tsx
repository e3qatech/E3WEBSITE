"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Globe, Moon, Sun, Sparkles, Building2, Home } from "lucide-react";
import Link from "next/link";

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

interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
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
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // Ripple Trail State (Max 8 active ripples, ~55ms throttle)
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const lastRippleTimeRef = useRef<number>(0);
  const rippleIdCounterRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Capability Tier Resolution
  const effectiveTier = simulation?.reducedMotion
    ? "minimal"
    : simulation?.useFallbackMedia
    ? "balanced"
    : systemTier;
  const isReducedMotion = simulation?.reducedMotion || initialCmsData.visual?.reducedMotionDefault || effectiveTier === "minimal";
  const isFullTier = effectiveTier === "full" && !isReducedMotion && isWebGLSupported();

  // Viewport Detection
  useEffect(() => {
    const checkViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);

    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const isSimulatedMobile = previewMode && simulation?.viewport === "mobile-390";
  const isSimulatedDesktop = previewMode && simulation?.viewport === "desktop-1440";

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

  // Content bindings
  const en = activeCmsData.english || DEFAULT_GATEWAY_CMS_PAYLOAD.english;
  const ar = activeCmsData.arabic || DEFAULT_GATEWAY_CMS_PAYLOAD.arabic;
  const logo = activeCmsData.logo || DEFAULT_GATEWAY_CMS_PAYLOAD.logo;
  const visual = activeCmsData.visual || DEFAULT_GATEWAY_CMS_PAYLOAD.visual;
  const seo = activeCmsData.seoAccess || DEFAULT_GATEWAY_CMS_PAYLOAD.seoAccess;

  const headline = isAr ? (ar.headlineAr || "جانبان. E3 واحدة.") : (en.headlineEn || "TWO SIDES. ONE E3.");

  // B2C Content
  const b2cNumberTag = isAr ? (ar.b2cNumberTagAr || "01") : (en.b2cNumberTagEn || "01");
  const b2cLabel = isAr ? (ar.b2cLabelAr || "التجارب والوجهات") : (en.b2cLabelEn || "EXPERIENCES & ATTRACTIONS");
  const b2cTitle = isAr ? (ar.b2cTitleAr || "عِش التجربة") : (en.b2cTitleEn || "EXPERIENCE");
  const b2cTagline = isAr ? (ar.b2cTaglineAr || ar.b2cDescAr || "الفعاليات والوجهات والتذاكر") : (en.b2cTaglineEn || en.b2cDescEn || "Events, attractions & tickets");
  const b2cDesc = isAr ? (ar.b2cDescAr || "اكتشف الفعاليات الحية والوجهات العائلية وتجارب الترفيه الاستثنائية في مختلف أنحاء قطر.") : (en.b2cDescEn || "Discover live events, family attractions and unforgettable entertainment experiences across Qatar.");
  const b2cCta = isAr ? (ar.b2cCtaLabelAr || "استكشف التجارب") : (en.b2cCtaLabelEn || "Explore Experiences");
  const b2cStat = isAr ? (ar.b2cStatLabelAr ?? "+١.٢ مليون زائر سنوياً") : (en.b2cStatLabelEn ?? "1.2M+ Annual Visitors");
  const rawB2cDest = isAr ? (ar.b2cDestinationUrl || "/ar/b2c") : (en.b2cDestinationUrl || "/en/b2c");
  const b2cDest = localizeHref(rawB2cDest, activeLocale);
  const b2cAria = isAr ? (ar.b2cAriaLabelAr || "بوابة تجارب الأفراد والجمهور") : (en.b2cAriaLabelEn || "E3 B2C Experiences Portal");

  // B2B Content
  const b2bNumberTag = isAr ? (ar.b2bNumberTagAr || "02") : (en.b2bNumberTagEn || "02");
  const b2bLabel = isAr ? (ar.b2bLabelAr || "للعلامات التجارية والمؤسسات") : (en.b2bLabelEn || "FOR BRANDS & ORGANIZATIONS");
  const b2bTitle = isAr ? (ar.b2bTitleAr || "اصنع الفارق") : (en.b2bTitleEn || "CREATE");
  const b2bTagline = isAr ? (ar.b2bTaglineAr || ar.b2bDescAr || "الإنتاج والشراكات المؤسسية") : (en.b2bTaglineEn || en.b2bDescEn || "Production, brands & partnerships");
  const b2bDesc = isAr ? (ar.b2bDescAr || "تعاون مع E3 لتصميم وإنتاج وتشغيل فعاليات ووجهات وتجارب غامرة تترك أثراً استثنائياً.") : (en.b2bDescEn || "Partner with E3 to design, produce and operate remarkable events, destinations and immersive brand experiences.");
  const b2bCta = isAr ? (ar.b2bCtaLabelAr || "تعاون مع E3") : (en.b2bCtaLabelEn || "Work With E3");
  const b2bStat = isAr ? (ar.b2bStatLabelAr ?? "+٤٥٠ مشروع مؤسسي") : (en.b2bStatLabelEn ?? "450+ Corporate Activations");
  const rawB2bDest = isAr ? (ar.b2bDestinationUrl || "/ar/b2b") : (en.b2bDestinationUrl || "/en/b2b");
  const b2bDest = localizeHref(rawB2bDest, activeLocale);
  const b2bAria = isAr ? (ar.b2bAriaLabelAr || "بوابة حلول الشركات والمؤسسات") : (en.b2bAriaLabelEn || "E3 B2B Enterprise Solutions Portal");

  // Media resolution
  const activeB2cDesktopMedia = activeCmsData.b2cDesktopMedia;
  const activeB2cMobileMedia = activeCmsData.b2cMobileMedia?.mediaUrl ? activeCmsData.b2cMobileMedia : activeCmsData.b2cDesktopMedia;

  const activeB2bDesktopMedia = activeCmsData.b2bDesktopMedia;
  const activeB2bMobileMedia = activeCmsData.b2bMobileMedia?.mediaUrl ? activeCmsData.b2bMobileMedia : activeCmsData.b2bDesktopMedia;

  // Active Selected / Focus State
  const activeFocus = previewMode && simulation?.portalFocus && simulation.portalFocus !== "none"
    ? simulation.portalFocus
    : navigatingPortal || hoveredPortal || focusedPortal;

  // Dynamic panel width percentages for Desktop Slanted Split
  let b2cWidthPercent = activeCmsData.visual?.initialSplitRatio || 50;
  const targetExpandWidth = activeCmsData.visual?.selectedPortalWidth || 58;

  if (activeFocus === "b2c") {
    b2cWidthPercent = targetExpandWidth;
  } else if (activeFocus === "b2b") {
    b2cWidthPercent = 100 - targetExpandWidth;
  }

  // Pointer Ripple Trail Spawner (~55ms throttle, max 8 ripples)
  const handlePointerMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || isReducedMotion) return;

    const now = performance.now();
    if (now - lastRippleTimeRef.current < 55) return;
    lastRippleTimeRef.current = now;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xRatio = x / rect.width;

    // Determine color based on world
    let rippleColor = isLight ? "rgba(168, 85, 247, 0.6)" : "rgba(192, 132, 252, 0.7)";
    if (xRatio > (b2cWidthPercent / 100)) {
      rippleColor = isLight ? "rgba(37, 99, 235, 0.6)" : "rgba(56, 189, 248, 0.7)";
    }

    const newRipple: Ripple = {
      id: ++rippleIdCounterRef.current,
      x,
      y,
      color: rippleColor,
    };

    setRipples((prev) => {
      const next = [...prev, newRipple];
      return next.length > 8 ? next.slice(next.length - 8) : next;
    });

    // Auto cleanup after 620ms lifetime
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 620);
  }, [isTouchDevice, isReducedMotion, isLight, b2cWidthPercent]);

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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Syne:wght@700;800;900&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes e3RippleExpand {
          0% { width: 8px; height: 8px; opacity: 0.32; transform: translate(-50%, -50%) scale(1); }
          100% { width: 54px; height: 54px; opacity: 0; transform: translate(-50%, -50%) scale(1); }
        }

        .e3-ripple-item {
          position: absolute;
          border-radius: 9999px;
          border-width: 1px;
          border-style: solid;
          pointer-events: none;
          animation: e3RippleExpand 620ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      <div
        ref={containerRef}
        onMouseMove={handlePointerMove}
        className={cn(
          "relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between font-jakarta select-none transition-colors duration-350",
          isLight ? "bg-[#F7F3FF] text-[#171326]" : "bg-[#03000a] text-white"
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

        {/* DOM-Pooled Ripple Trail Elements */}
        {ripples.map((r) => (
          <div
            key={r.id}
            className={cn("e3-ripple-item z-40", isLight ? "mix-blend-multiply" : "mix-blend-screen")}
            style={{
              left: `${r.x}px`,
              top: `${r.y}px`,
              borderColor: r.color,
            }}
          />
        ))}

        {/* Subtle Architectural Grain Overlay */}
        <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.02] mix-blend-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <filter id="noise-gateway">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise-gateway)" />
          </svg>
        </div>

        {/* ============================================================ */}
        {/* 1. TOP NAVIGATION HEADER (IN-FLOW ON MOBILE, FLOATING ON DESKTOP) */}
        {/* ============================================================ */}
        <header className="relative md:absolute md:top-0 inset-x-0 z-50 w-full shrink-0 px-3 py-2 md:px-10 md:pt-6 pointer-events-none">
          <div
            className={cn(
              "w-full flex items-center justify-between px-3 py-1.5 md:p-3.5 md:px-8 md:py-4 rounded-xl md:rounded-full border backdrop-blur-2xl shadow-xl transition-all duration-350 pointer-events-auto",
              isLight
                ? "bg-white/90 border-slate-200 text-slate-900 shadow-slate-200/50"
                : "bg-black/75 border-white/15 text-white"
            )}
          >
            {/* Logo (Top Left in LTR / Top Right in RTL) */}
            <a
              href={logo?.destinationUrl || "/"}
              onClick={(e) => { if (previewMode) e.preventDefault(); }}
              className="inline-flex items-center gap-2 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg min-w-[36px] min-h-[36px]"
              aria-label={isAr ? logo?.altAr || "شعار إي ثري قطر الرسمي" : logo?.altEn || "Official E3 Qatar Logo"}
            >
              <E3Logo
                isLight={isLight}
                lightLogoUrl={isLight ? logo?.lightLogoUrl || logo?.defaultLogoUrl : undefined}
                darkLogoUrl={!isLight ? logo?.darkLogoUrl || logo?.defaultLogoUrl : undefined}
                size="sm"
              />
            </a>

            {/* Quick Portal Homepage Tabs & Centered H1 (Desktop Only) */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href={`/${activeLocale}/b2c`}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-wider border transition-all flex items-center gap-1.5",
                  isLight
                    ? "border-purple-300 bg-purple-100/80 hover:bg-purple-600 hover:text-white text-purple-950"
                    : "border-purple-400/40 bg-purple-950/40 hover:bg-purple-600 hover:text-white text-purple-200"
                )}
                title={isAr ? "الصفحة الرئيسية (B2C)" : "B2C Experiences Home"}
              >
                <Home className="w-3 h-3" />
                <span>{isAr ? "رئيسية B2C" : "B2C Home"}</span>
              </Link>

              <h1
                className={cn(
                  "flex items-center gap-2.5 px-4 md:px-5 py-2 rounded-full border text-xs md:text-sm font-mono font-bold tracking-widest uppercase m-0 shadow-sm transition-colors duration-350",
                  isLight
                    ? "bg-slate-100/80 border-slate-200 text-slate-800"
                    : "bg-white/5 border-white/15 text-slate-200"
                )}
              >
                <span className={cn("w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400", !isReducedMotion && "animate-pulse")} aria-hidden="true" />
                <span>{headline}</span>
              </h1>

              <Link
                href={`/${activeLocale}/b2b`}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-wider border transition-all flex items-center gap-1.5",
                  isLight
                    ? "border-blue-300 bg-blue-100/80 hover:bg-blue-600 hover:text-white text-blue-950"
                    : "border-cyan-400/40 bg-cyan-950/40 hover:bg-cyan-600 hover:text-white text-cyan-200"
                )}
                title={isAr ? "الصفحة الرئيسية (B2B)" : "B2B Enterprise Home"}
              >
                <Home className="w-3 h-3" />
                <span>{isAr ? "رئيسية B2B" : "B2B Home"}</span>
              </Link>
            </div>

            {/* Controls: Language & Theme Switcher */}
            <div className="flex items-center gap-2">
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
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl border backdrop-blur-md text-[11px] md:text-sm font-bold transition-all cursor-pointer shadow-sm min-h-[34px] md:min-h-[44px] focus-visible:ring-2 focus-visible:ring-purple-400 focus:outline-none",
                    isLight
                      ? "border-slate-300 bg-white/90 hover:bg-slate-100 text-slate-900"
                      : "border-white/15 bg-white/10 hover:bg-white/20 text-white"
                  )}
                  aria-label={activeLocale === "en" ? "التبديل إلى اللغة العربية" : "Switch to English"}
                >
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
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
                  className={cn(
                    "p-1.5 md:p-3 rounded-lg md:rounded-xl border backdrop-blur-md transition-all cursor-pointer shadow-sm min-w-[34px] min-h-[34px] md:min-w-[44px] md:min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-purple-400 focus:outline-none",
                    isLight
                      ? "border-slate-300 bg-white/90 hover:bg-slate-100 text-slate-900"
                      : "border-white/15 bg-white/10 hover:bg-white/20 text-white"
                  )}
                  title={isAr ? "تبديل المظهر النهاري والليلي" : "Toggle Light/Dark Theme"}
                  aria-label={isAr ? "تبديل المظهر" : "Toggle Theme"}
                >
                  {isLight ? <Moon className="w-3.5 h-3.5 text-indigo-600" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* 2. DUAL PORTAL CANVAS & SLANTED DIAGONAL BOUNDARY */}
        {/* ============================================================ */}
        <main className="relative flex-1 min-h-0 w-full h-full overflow-hidden z-10 flex flex-col">
          
          {/* MOBILE VIEW (< 768px): CLEAN ZERO-OVERLAP 50/50 SPLIT (01 EXPERIENCE / 02 CREATE) */}
          <div className={cn(
            "flex flex-col w-full h-full flex-1 min-h-0 relative",
            isSimulatedMobile ? "flex" : isSimulatedDesktop ? "hidden" : "flex md:hidden"
          )}>
            {/* SUB-HEADER TAGLINE */}
            <div className="w-full px-4 py-1 z-30 bg-black/40 backdrop-blur-sm border-b border-white/5 shrink-0">
              <p className="text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.2em] text-neutral-300 uppercase text-center sm:text-start">
                {headline}
              </p>
            </div>

            {/* B2C EXPERIENCE (TOP HALF: EXACT 50% OF REMAINING CANVAS) */}
            <div
              onClick={() => handleSelect("b2c")}
              className={cn(
                "relative flex-1 h-1/2 min-h-0 w-full overflow-hidden flex flex-col justify-between p-4 sm:p-6 cursor-pointer group select-none",
                isLight ? "bg-[#F7F3FF]" : "bg-[#0B1020]"
              )}
              role="button"
              tabIndex={0}
              aria-label={b2cAria || b2cTitle}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelect("b2c"); }}
            >
              <UniversalMediaHolder
                config={simulation?.useFallbackMedia ? { ...activeB2cMobileMedia, mediaUrl: activeB2cMobileMedia.fallbackImageUrl, mediaType: "IMAGE" } : activeB2cMobileMedia}
                locale={activeLocale}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out",
                  !isReducedMotion && "group-hover:scale-105 group-active:scale-98"
                )}
              />
              
              {/* Magenta Ambient Gradient Overlay */}
              <div
                className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-[#0B1020]/90 via-[#E11D48]/35 to-transparent transition-opacity duration-350"
                style={{ opacity: visual?.overlayStrength ?? 0.5 }}
              />

              {/* Top: 01 Indicator Tag */}
              <div className="relative z-30 flex items-center justify-between w-full">
                <div className="flex flex-col items-start">
                  <span className="text-xs sm:text-sm font-black font-mono tracking-widest text-white drop-shadow">
                    {b2cNumberTag}
                  </span>
                  <div className="w-5 h-[2px] bg-pink-400 mt-0.5 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                </div>
              </div>

              {/* Bottom: Editorial Title + Subtitle + Corner Arrow */}
              <div className="relative z-30 w-full flex items-end justify-between gap-3">
                <div className="space-y-0.5 max-w-[78%]">
                  <span className="block text-2xl sm:text-3xl xs:text-4xl font-black font-syne uppercase tracking-tight leading-[0.95] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                    {b2cTitle}
                  </span>
                  <p className="text-[11px] sm:text-xs font-medium text-white/90 leading-tight drop-shadow line-clamp-1">
                    {b2cTagline}
                  </p>
                  <span className="sr-only">{b2cCta}</span>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0 group-hover:bg-pink-500 transition-colors shadow-lg">
                  <ArrowUpRight className={cn("w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5", isAr && "scale-x-[-1]")} />
                </div>
              </div>
            </div>

            {/* CLEAN HORIZONTAL SEAM DIVIDER (EXACT 50/50 SEAM) */}
            <div className="relative z-40 w-full h-[1.5px] bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 shadow-[0_0_15px_rgba(168,85,247,0.8)] pointer-events-none shrink-0" />

            {/* B2B CREATE (BOTTOM HALF: EXACT 50% OF REMAINING CANVAS) */}
            <div
              onClick={() => handleSelect("b2b")}
              className={cn(
                "relative flex-1 h-1/2 min-h-0 w-full overflow-hidden flex flex-col justify-between p-4 sm:p-6 cursor-pointer group select-none",
                isLight ? "bg-[#EEF4F8]" : "bg-[#070A12]"
              )}
              role="button"
              tabIndex={0}
              aria-label={b2bAria || b2bTitle}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelect("b2b"); }}
            >
              <UniversalMediaHolder
                config={simulation?.useFallbackMedia ? { ...activeB2bMobileMedia, mediaUrl: activeB2bMobileMedia.fallbackImageUrl, mediaType: "IMAGE" } : activeB2bMobileMedia}
                locale={activeLocale}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out",
                  !isReducedMotion && "group-hover:scale-105 group-active:scale-98"
                )}
              />
              
              {/* Cyan/Blue Ambient Blueprint Gradient Overlay */}
              <div
                className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#070A12]/90 via-[#0284C7]/35 to-transparent transition-opacity duration-350"
                style={{ opacity: visual?.overlayStrength ?? 0.5 }}
              />

              {/* Top: 02 Indicator Tag */}
              <div className="relative z-30 flex items-center justify-between w-full">
                <div className="flex flex-col items-start">
                  <span className="text-xs sm:text-sm font-black font-mono tracking-widest text-white drop-shadow">
                    {b2bNumberTag}
                  </span>
                  <div className="w-5 h-[2px] bg-cyan-400 mt-0.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                </div>
              </div>

              {/* Bottom: Editorial Title + Subtitle + Corner Arrow */}
              <div className="relative z-30 w-full flex items-end justify-between gap-3">
                <div className="space-y-0.5 max-w-[78%]">
                  <span className="block text-2xl sm:text-3xl xs:text-4xl font-black font-syne uppercase tracking-tight leading-[0.95] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                    {b2bTitle}
                  </span>
                  <p className="text-[11px] sm:text-xs font-medium text-white/90 leading-tight drop-shadow line-clamp-1">
                    {b2bTagline}
                  </p>
                  <span className="sr-only">{b2bCta}</span>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0 group-hover:bg-cyan-500 transition-colors shadow-lg">
                  <ArrowUpRight className={cn("w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5", isAr && "scale-x-[-1]")} />
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP VIEW (>= 768px): RESTORED ORIGINAL SLANTED DIAGONAL SPLIT WITH 50/50 -> 58/42 EXPANSION */}
          <div className={cn(
            "absolute inset-0 w-full h-full flex flex-row",
            isSimulatedMobile ? "hidden" : isSimulatedDesktop ? "flex" : "hidden md:flex"
          )}>
              
              {/* B2C PORTAL (LEFT PANEL IN LTR / RIGHT IN RTL) */}
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
                style={{ width: `${b2cWidthPercent}%` }}
                className={cn(
                  "relative h-full cursor-pointer overflow-hidden group focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 z-20 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  isLight ? "bg-[#F7F3FF]" : "bg-[#0B1020]",
                  activeFocus === "b2c"
                    ? "brightness-105 z-30"
                    : activeFocus === "b2b"
                    ? "opacity-58 blur-[2px]"
                    : "opacity-100"
                )}
              >
                <UniversalMediaHolder
                  config={simulation?.useFallbackMedia ? { ...activeB2cDesktopMedia, mediaUrl: activeB2cDesktopMedia.fallbackImageUrl, mediaType: "IMAGE" } : activeB2cDesktopMedia}
                  locale={activeLocale}
                  className={cn(
                    "h-full w-full object-cover opacity-100 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    !isReducedMotion && (activeFocus === "b2c" ? "scale-[1.04]" : "scale-100")
                  )}
                />
                
                {/* Gradient Overlay: Pearl in Light Mode, Dark Midnight in Dark Mode */}
                <div
                  className={cn(
                    "absolute inset-0 pointer-events-none transition-opacity duration-350",
                    isLight
                      ? "bg-gradient-to-t from-[#F7F3FF]/90 via-[#F7F3FF]/25 to-transparent"
                      : "bg-gradient-to-t from-black/90 via-black/20 to-transparent"
                  )}
                  style={{ opacity: visual?.overlayStrength ?? 0.4 }}
                />

                {/* B2C Architecture Card (Lower-Middle Area) */}
                <div
                  className={cn(
                    "absolute bottom-16 start-12 md:start-20 max-w-xl z-30 space-y-4 rounded-3xl p-8 md:p-10 shadow-2xl transition-all duration-500",
                    isLight
                      ? "bg-white/90 backdrop-blur-2xl border border-purple-200 text-[#171326] shadow-purple-200/50"
                      : "bg-black/50 backdrop-blur-2xl border border-purple-500/30 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)]",
                    activeFocus === "b2c" ? "border-purple-400/80 shadow-[0_25px_60px_rgba(139,92,246,0.25)]" : ""
                  )}
                >
                  <div className="w-full flex items-center justify-between gap-4 mb-2">
                    <span
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md flex items-center gap-2 shadow-sm",
                        isLight
                          ? "bg-purple-100 text-purple-900 border border-purple-300"
                          : "bg-purple-600/30 text-purple-200 border border-purple-400/40"
                      )}
                    >
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span>{b2cLabel}</span>
                    </span>
                    {b2cStat && visual.statisticsVisible !== false && (
                      <span
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-mono font-extrabold tracking-wider backdrop-blur-md shadow-sm",
                          isLight
                            ? "bg-white text-purple-950 border border-purple-300"
                            : "bg-black/80 text-purple-200 border border-purple-400/40"
                        )}
                      >
                        {b2cStat}
                      </span>
                    )}
                  </div>

                  <h2
                    className={cn(
                      "text-4xl lg:text-5xl font-black font-syne uppercase tracking-tight leading-none drop-shadow-sm",
                      isLight ? "text-[#171326]" : "text-white drop-shadow-xl"
                    )}
                  >
                    {b2cTitle}
                  </h2>
                  <p
                    className={cn(
                      "text-sm font-medium leading-relaxed",
                      isLight ? "text-[#332a48]" : "text-slate-300 drop-shadow"
                    )}
                  >
                    {b2cDesc}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <a
                      href={b2cDest}
                      onClick={(e) => {
                        if (previewMode) e.preventDefault();
                        e.stopPropagation();
                      }}
                      className={cn(
                        "inline-flex items-center gap-3 rounded-full px-7 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-extrabold uppercase tracking-widest transition-all shadow-xl cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-purple-300 focus:outline-none",
                        isLight ? "shadow-purple-400/30" : "shadow-purple-950/60"
                      )}
                    >
                      <span>{b2cCta}</span>
                      <div className={cn("w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all", !isReducedMotion && "group-hover:translate-x-1")}>
                        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </div>
                    </a>

                    <a
                      href={`/${activeLocale}/b2c`}
                      onClick={(e) => {
                        if (previewMode) e.preventDefault();
                        e.stopPropagation();
                      }}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-5 py-3.5 border font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer min-h-[44px]",
                        isLight
                          ? "border-purple-300 bg-white/80 hover:bg-purple-50 text-purple-900"
                          : "border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/50 text-purple-200"
                      )}
                      title={isAr ? "الصفحة الرئيسية (B2C)" : "B2C Experiences Homepage"}
                    >
                      <Home className="w-3.5 h-3.5 text-purple-400" />
                      <span>{isAr ? "الصفحة الرئيسية (B2C)" : "B2C Homepage"}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* B2B PORTAL (RIGHT PANEL IN LTR / LEFT IN RTL) */}
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
                style={{ width: `${100 - b2cWidthPercent}%` }}
                className={cn(
                  "relative h-full cursor-pointer overflow-hidden group focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 z-10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  isLight ? "bg-[#EEF4F8]" : "bg-[#070A12]",
                  activeFocus === "b2b"
                    ? "brightness-105 z-20"
                    : activeFocus === "b2c"
                    ? "opacity-58 blur-[2px]"
                    : "opacity-100"
                )}
              >
                <UniversalMediaHolder
                  config={simulation?.useFallbackMedia ? { ...activeB2bDesktopMedia, mediaUrl: activeB2bDesktopMedia.fallbackImageUrl, mediaType: "IMAGE" } : activeB2bDesktopMedia}
                  locale={activeLocale}
                  className={cn(
                    "h-full w-full object-cover opacity-95 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    !isReducedMotion && (activeFocus === "b2b" ? "scale-[1.04] opacity-100" : "scale-100")
                  )}
                />
                
                {/* Blueprint grid lines */}
                <div
                  className={cn(
                    "absolute inset-0 pointer-events-none",
                    isLight
                      ? "bg-[linear-gradient(to_right,#94a3b820_1px,transparent_1px),linear-gradient(to_bottom,#94a3b820_1px,transparent_1px)] bg-[size:32px_32px]"
                      : "bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:32px_32px]"
                  )}
                />

                {/* Gradient Overlay */}
                <div
                  className={cn(
                    "absolute inset-0 pointer-events-none transition-opacity duration-350",
                    isLight
                      ? "bg-gradient-to-t from-[#EEF4F8]/90 via-[#EEF4F8]/25 to-transparent"
                      : "bg-gradient-to-t from-black/90 via-black/20 to-transparent"
                  )}
                  style={{ opacity: visual?.overlayStrength ?? 0.4 }}
                />

                {/* B2B Architecture Card (Lower-Middle Area) */}
                <div
                  className={cn(
                    "absolute bottom-16 end-12 md:end-20 max-w-xl z-30 space-y-4 rounded-3xl p-8 md:p-10 shadow-2xl transition-all duration-500",
                    isLight
                      ? "bg-white/90 backdrop-blur-2xl border border-blue-200 text-[#0B1020] shadow-blue-200/50"
                      : "bg-black/50 backdrop-blur-2xl border border-indigo-500/30 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)]",
                    activeFocus === "b2b" ? "border-cyan-400/80 shadow-[0_25px_60px_rgba(34,211,238,0.25)]" : ""
                  )}
                >
                  <div className="w-full flex items-center justify-between gap-4 mb-2">
                    <span
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md flex items-center gap-2 shadow-sm",
                        isLight
                          ? "bg-blue-100 text-blue-900 border border-blue-300"
                          : "bg-indigo-600/30 text-indigo-200 border border-indigo-400/40"
                      )}
                    >
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>{b2bLabel}</span>
                    </span>
                    {b2bStat && visual.statisticsVisible !== false && (
                      <span
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-mono font-extrabold tracking-wider backdrop-blur-md shadow-sm",
                          isLight
                            ? "bg-white text-blue-950 border border-blue-300"
                            : "bg-black/80 text-indigo-200 border border-indigo-400/40"
                        )}
                      >
                        {b2bStat}
                      </span>
                    )}
                  </div>

                  <h2
                    className={cn(
                      "text-4xl lg:text-5xl font-black font-syne uppercase tracking-tight leading-none drop-shadow-sm",
                      isLight ? "text-[#0B1020]" : "text-white drop-shadow-xl"
                    )}
                  >
                    {b2bTitle}
                  </h2>
                  <p
                    className={cn(
                      "text-sm font-medium leading-relaxed",
                      isLight ? "text-[#334155]" : "text-slate-300 drop-shadow"
                    )}
                  >
                    {b2bDesc}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <a
                      href={b2bDest}
                      onClick={(e) => {
                        if (previewMode) e.preventDefault();
                        e.stopPropagation();
                      }}
                      className={cn(
                        "inline-flex items-center gap-3 rounded-full px-7 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-extrabold uppercase tracking-widest transition-all shadow-xl cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyan-300 focus:outline-none",
                        isLight ? "shadow-blue-400/30" : "shadow-cyan-950/60"
                      )}
                    >
                      <span>{b2bCta}</span>
                      <div className={cn("w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all", !isReducedMotion && "group-hover:translate-x-1")}>
                        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </div>
                    </a>

                    <a
                      href={`/${activeLocale}/b2b`}
                      onClick={(e) => {
                        if (previewMode) e.preventDefault();
                        e.stopPropagation();
                      }}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-5 py-3.5 border font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer min-h-[44px]",
                        isLight
                          ? "border-blue-300 bg-white/80 hover:bg-blue-50 text-blue-900"
                          : "border-indigo-500/40 bg-indigo-950/30 hover:bg-indigo-900/50 text-cyan-200"
                      )}
                      title={isAr ? "الصفحة الرئيسية (B2B)" : "B2B Enterprise Homepage"}
                    >
                      <Home className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isAr ? "الصفحة الرئيسية (B2B)" : "B2B Homepage"}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* RESTORED ORIGINAL SLANTED DIAGONAL DIVIDER SEAM & RESTRAINED ENERGY LINE */}
              {/* ============================================================ */}
              <div
                style={{ left: `${b2cWidthPercent}%` }}
                className={cn(
                  "absolute top-0 bottom-0 z-30 w-1.5 -skew-x-6 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  isLight
                    ? "bg-gradient-to-b from-purple-500 via-indigo-500 to-cyan-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    : "bg-gradient-to-b from-purple-400 via-indigo-400 to-cyan-400 shadow-[0_0_30px_rgba(168,85,247,1)]"
                )}
              >
                {/* Three.js Restrained Energy Seam Particles */}
                {isFullTier && (
                  <div className="absolute inset-y-0 -left-6 -right-6 pointer-events-none">
                    <GatewayPortalScene
                      isMobile={false}
                      hoveredWorld={activeFocus as any}
                      isReducedMotion={isReducedMotion}
                      isRtl={isAr}
                      isLight={isLight}
                    />
                  </div>
                )}
              </div>
            </div>
        </main>
      </div>
    </>
  );
}
