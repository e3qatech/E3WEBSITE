"use client";

import { useState, useCallback, useMemo } from "react";
import { useMounted } from "@/hooks/useMounted";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowRight, Bug } from "lucide-react";
import { useLocale } from "@/components/layout/LocaleProvider";
import { useTheme } from "@/components/layout/ThemeProvider";
import { UniversalMediaHolder } from "@/components/shared/UniversalMediaHolder";
import {
  GatewayCustomizationPayload,
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  PreviewSimulationState,
  AtmosphereRendererType,
  GatewayAtmospherePreset,
  GatewayWeatherRule,
} from "@/types/gateway-cms";
import { AtmosphereEngine } from "@/components/atmosphere/AtmosphereEngine";
import { E3Logo } from "@/components/shared/E3Logo";
import { cn } from "@/lib/utils";

const WireframeBackground = dynamic(
  () => import('./WireframeBackground').then(mod => mod.WireframeBackground),
  { ssr: false }
);

export interface PortalGatewayProps {
  cmsData?: GatewayCustomizationPayload;
  previewMode?: boolean;
  previewConfig?: GatewayCustomizationPayload;
  simulation?: PreviewSimulationState;
}

export function PortalGateway({
  cmsData: initialCmsData = DEFAULT_GATEWAY_CMS_PAYLOAD,
  previewMode = false,
  previewConfig,
  simulation,
}: PortalGatewayProps) {
  const router = useRouter();
  const { locale: contextLocale } = useLocale();
  const { theme: contextTheme } = useTheme();

  const [hoveredPortal, setHoveredPortal] = useState<'b2c' | 'b2b' | null>(null);
  const [, setSelectedPortal] = useState<'b2c' | 'b2b' | null>(null);
  const [, setFocusedPortal] = useState<'b2c' | 'b2b' | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(true);
  const isMounted = useMounted();

  // In Preview Mode, prefer supplied draft config
  const activeCmsData = previewMode && previewConfig ? previewConfig : initialCmsData;

  // Resolve active locale and theme
  const activeLocale = simulation?.locale || contextLocale || 'en';
  const isAr = activeLocale === 'ar';
  const activeDir = isAr ? 'rtl' : 'ltr';

  const resolvedTheme = simulation?.theme || contextTheme || 'dark';
  const isLight = resolvedTheme === 'light';

  // LIVE WEATHER & RULE RESOLUTION ENGINE FOR PREVIEW
  const resolvedWeatherState = useMemo(() => {
    if (!simulation) {
      return {
        presetType: (activeCmsData.experienceConfig?.defaultScenePreset || 'clear-day') as AtmosphereRendererType,
        matchedRule: null as GatewayWeatherRule | null,
        matchedPreset: null as GatewayAtmospherePreset | null,
        waterHeight: activeCmsData.waterAndSandPhysics?.waterEnabled ? activeCmsData.waterAndSandPhysics.waterMaxHeightPercent : 0,
        sandHeight: activeCmsData.waterAndSandPhysics?.sandEnabled ? activeCmsData.waterAndSandPhysics.sandMaxHeightPercent : 0,
      };
    }

    if (!simulation.webglAvailable || !simulation.weatherApiAvailable || simulation.reducedMotion) {
      return {
        presetType: 'static-fallback' as AtmosphereRendererType,
        matchedRule: null,
        matchedPreset: null,
        waterHeight: 0,
        sandHeight: 0,
      };
    }

    const rules = activeCmsData.weatherRules || DEFAULT_GATEWAY_CMS_PAYLOAD.weatherRules || [];
    const presets = activeCmsData.atmospherePresets || DEFAULT_GATEWAY_CMS_PAYLOAD.atmospherePresets || [];

    let matchedRule: GatewayWeatherRule | null = null;

    // Check rules ordered by priority (1 is highest)
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (!rule.enabled) continue;

      let matches = false;

      if (simulation.heavyRainOverride && rule.presetId === 'heavy-rain') {
        matches = true;
      } else if (rule.rainMinMm !== undefined && simulation.rain >= rule.rainMinMm) {
        matches = true;
      } else if (rule.pm10Min !== undefined && simulation.pm10 >= rule.pm10Min) {
        matches = true;
      } else if (rule.apparentTempMinC !== undefined && simulation.apparentTemperature >= rule.apparentTempMinC) {
        matches = true;
      } else if (rule.tempMinC !== undefined && simulation.temperature >= rule.tempMinC) {
        matches = true;
      } else if (rule.windMinKmh !== undefined && simulation.windSpeed >= rule.windMinKmh) {
        matches = true;
      }

      if (matches) {
        matchedRule = rule;
        break;
      }
    }

    let presetType: AtmosphereRendererType = matchedRule ? matchedRule.presetId : 'clear-day';
    if (!matchedRule) {
      if (!simulation.isDay) presetType = 'night';
      else if (simulation.temperature >= 38) presetType = 'heat';
      else if (simulation.rain > 0.5) presetType = 'rain';
    }

    const matchedPreset = presets.find((p) => p.rendererType === presetType) || null;

    // Calculate water and sand heights (capped by safety ceilings: water <= 40%, sand <= 30%)
    let waterHeight = 0;
    if (presetType === 'rain' || presetType === 'heavy-rain') {
      const baseMax = activeCmsData.waterAndSandPhysics?.waterMaxHeightPercent || 15;
      waterHeight = Math.min(baseMax, simulation.viewport.includes('mobile') ? 20 : 40);
    }

    let sandHeight = 0;
    if (presetType === 'sandstorm' || presetType === 'dust') {
      const baseMax = activeCmsData.waterAndSandPhysics?.sandMaxHeightPercent || 10;
      sandHeight = Math.min(baseMax, simulation.viewport.includes('mobile') ? 15 : 30);
    }

    return {
      presetType,
      matchedRule,
      matchedPreset,
      waterHeight,
      sandHeight,
    };
  }, [simulation, activeCmsData]);

  const en = activeCmsData.english;
  const ar = activeCmsData.arabic;

  const eyebrow = isAr ? ar.eyebrowAr || en.eyebrowEn : en.eyebrowEn || ar.eyebrowAr;
  const headline = isAr ? ar.headlineAr || en.headlineEn : en.headlineEn || ar.headlineAr;

  const b2cLabel = isAr ? ar.b2cLabelAr || en.b2cLabelEn : en.b2cLabelEn || ar.b2cLabelAr;
  const b2cTitle = isAr ? ar.b2cTitleAr || en.b2cTitleEn : en.b2cTitleEn || ar.b2cTitleAr;
  const b2cDesc = isAr ? ar.b2cDescAr || en.b2cDescEn : en.b2cDescEn || ar.b2cDescAr;
  const b2cCta = isAr ? ar.b2cCtaLabelAr || en.b2cCtaLabelEn : en.b2cCtaLabelEn || ar.b2cCtaLabelAr;
  const b2cStat = isAr ? ar.b2cStatLabelAr || en.b2cStatLabelEn : en.b2cStatLabelEn || ar.b2cStatLabelAr;

  const b2bLabel = isAr ? ar.b2bLabelAr || en.b2bLabelEn : en.b2bLabelEn || ar.b2bLabelAr;
  const b2bTitle = isAr ? ar.b2bTitleAr || en.b2bTitleEn : en.b2bTitleEn || ar.b2bTitleAr;
  const b2bDesc = isAr ? ar.b2bDescAr || en.b2bDescEn : en.b2bDescEn || ar.b2bDescAr;
  const b2bCta = isAr ? ar.b2bCtaLabelAr || en.b2bCtaLabelEn : en.b2bCtaLabelEn || ar.b2bCtaLabelAr;
  const b2bStat = isAr ? ar.b2bStatLabelAr || en.b2bStatLabelEn : en.b2bStatLabelEn || ar.b2bStatLabelAr;

  const ariaLabel = isAr ? activeCmsData.seoAccess.ariaGatewayLabelAr : activeCmsData.seoAccess.ariaGatewayLabelEn;

  const handleSelect = useCallback(
    (portal: 'b2c' | 'b2b') => {
      setSelectedPortal(portal);
      if (!previewMode) {
        localStorage.setItem('e3_preferred_portal', portal);
        setTimeout(() => {
          router.push(`/${activeLocale}/${portal}`);
        }, 600);
      }
    },
    [router, activeLocale, previewMode]
  );

  // Viewport Container Dimensions for Frame Resizing
  const viewportWidthClass = useMemo(() => {
    if (!simulation) return 'w-full h-full min-h-screen';
    switch (simulation.viewport) {
      case 'small-mobile-320':
        return 'w-[320px] h-[568px] mx-auto rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden';
      case 'mobile-390':
        return 'w-[390px] h-[720px] mx-auto rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden';
      case 'tablet-768':
        return 'w-[768px] h-[780px] mx-auto rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden';
      case 'laptop-1280':
        return 'w-[1280px] h-[720px] mx-auto rounded-lg border border-slate-700 shadow-2xl overflow-hidden';
      case 'desktop-1440':
      default:
        return 'w-full h-full min-h-screen';
    }
  }, [simulation]);

  return (
    <div
      className={cn(
        "relative overflow-hidden transition-all duration-500",
        viewportWidthClass,
        isLight ? "bg-[#f8f9fa]" : "bg-[#09090b]"
      )}
      dir={activeDir}
      role="region"
      aria-label={ariaLabel || 'E3 Qatar Portal Gateway'}
    >
      {/* ATMOSPHERE ENGINE CANVAS LAYER */}
      <AtmosphereEngine
        rendererType={resolvedWeatherState.presetType}
        particleCount={resolvedWeatherState.matchedPreset?.particleCount || 60}
        particleSpeed={resolvedWeatherState.matchedPreset?.particleSpeed || 5}
        particleOpacity={resolvedWeatherState.matchedPreset?.particleOpacity || 0.5}
        waterHeightPercent={resolvedWeatherState.waterHeight}
        sandHeightPercent={resolvedWeatherState.sandHeight}
        windSpeedKmh={simulation?.windSpeed || 15}
        windDirectionDeg={simulation?.windDirection || 45}
        isNight={simulation ? !simulation.isDay : false}
        isReducedMotion={simulation?.reducedMotion || activeCmsData.visual.reducedMotionDefault}
        isWebGlAvailable={simulation ? simulation.webglAvailable : true}
      />

      {/* Wireframe Background Layer */}
      {isMounted && activeCmsData.visual.backgroundStyle === 'wireframe' && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-40">
          <WireframeBackground />
        </div>
      )}

      {/* HEADER LAYER */}
      <header className="absolute top-0 inset-x-0 z-40 px-6 py-6 md:px-12 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pointer-events-auto">
          <E3Logo isLight={isLight} size="md" />
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded-full border transition-all",
                isLight ? "bg-zinc-100 text-zinc-800 border-zinc-200" : "bg-white/5 text-white/80 border-white/10"
              )}
            >
              {eyebrow}
            </span>
            <span
              className={cn(
                "hidden lg:inline-block text-xs font-bold border-s ps-3 transition-colors",
                isLight ? "text-zinc-500 border-zinc-200" : "text-zinc-400 border-white/10"
              )}
            >
              {headline}
            </span>
          </div>
        </div>
      </header>

      {/* PORTALS DUAL HERO CARDS GRID */}
      <div className="relative z-30 min-h-screen w-full flex flex-col md:flex-row">
        {/* B2C PORTAL HERO */}
        <div
          onMouseEnter={() => setHoveredPortal('b2c')}
          onMouseLeave={() => setHoveredPortal(null)}
          onFocus={() => setFocusedPortal('b2c')}
          onBlur={() => setFocusedPortal(null)}
          onClick={() => handleSelect('b2c')}
          tabIndex={0}
          role="button"
          aria-label={b2cTitle}
          className={cn(
            "relative flex-1 flex flex-col justify-end p-8 md:p-14 cursor-pointer transition-all duration-700 ease-out border-b md:border-b-0 md:border-r border-white/10",
            hoveredPortal === 'b2c' ? "flex-[1.3] bg-sky-950/20" : "opacity-90"
          )}
        >
          <div className="absolute inset-0 z-0">
            <UniversalMediaHolder
              config={activeCmsData.b2cDesktopMedia}
              locale={activeLocale}
              className="h-full w-full object-cover opacity-40 transition-transform duration-700 hover:scale-105"
            />
          </div>

          <div className="relative z-10 space-y-4 max-w-md">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {b2cLabel}
              </span>
              {b2cStat && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white/90 border border-white/15">
                  {b2cStat}
                </span>
              )}
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">{b2cTitle}</h2>
            <p className="text-sm text-slate-300 line-clamp-3">{b2cDesc}</p>
            <div className="pt-2 flex items-center gap-3 text-sky-400 font-bold text-sm group">
              <span>{b2cCta}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>

        {/* B2B PORTAL HERO */}
        <div
          onMouseEnter={() => setHoveredPortal('b2b')}
          onMouseLeave={() => setHoveredPortal(null)}
          onFocus={() => setFocusedPortal('b2b')}
          onBlur={() => setFocusedPortal(null)}
          onClick={() => handleSelect('b2b')}
          tabIndex={0}
          role="button"
          aria-label={b2bTitle}
          className={cn(
            "relative flex-1 flex flex-col justify-end p-8 md:p-14 cursor-pointer transition-all duration-700 ease-out",
            hoveredPortal === 'b2b' ? "flex-[1.3] bg-purple-950/20" : "opacity-90"
          )}
        >
          <div className="absolute inset-0 z-0">
            <UniversalMediaHolder
              config={activeCmsData.b2bDesktopMedia}
              locale={activeLocale}
              className="h-full w-full object-cover opacity-40 transition-transform duration-700 hover:scale-105"
            />
          </div>

          <div className="relative z-10 space-y-4 max-w-md">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {b2bLabel}
              </span>
              {b2bStat && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white/90 border border-white/15">
                  {b2bStat}
                </span>
              )}
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">{b2bTitle}</h2>
            <p className="text-sm text-slate-300 line-clamp-3">{b2bDesc}</p>
            <div className="pt-2 flex items-center gap-3 text-purple-400 font-bold text-sm group">
              <span>{b2bCta}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN PREVIEW DEBUG OVERLAY PANEL */}
      {previewMode && (
        <div className="absolute bottom-4 right-4 z-50 rounded-xl border border-slate-700/80 bg-slate-950/90 p-3.5 shadow-2xl backdrop-blur-md text-[11px] font-mono text-slate-200 max-w-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Bug className="h-3.5 w-3.5" /> Gateway Debug Telemetry
            </div>
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="text-slate-400 hover:text-white"
            >
              {showDebugPanel ? 'Hide' : 'Show'}
            </button>
          </div>

          {showDebugPanel && (
            <div className="space-y-1.5 text-[10px]">
              <div>
                <span className="text-slate-500">Input Weather:</span> {simulation?.temperature || 34}°C / Apparent {simulation?.apparentTemperature || 38}°C | Rain: {simulation?.rain || 0}mm | PM10: {simulation?.pm10 || 45} | Wind: {simulation?.windSpeed || 15} km/h
              </div>
              <div>
                <span className="text-slate-500">Matched Rule:</span>{' '}
                <span className="text-amber-300 font-semibold">{resolvedWeatherState.matchedRule ? resolvedWeatherState.matchedRule.name : 'Default Rule'}</span>
                {resolvedWeatherState.matchedRule && (
                  <span> (Priority #{resolvedWeatherState.matchedRule.priority} / Blend {resolvedWeatherState.matchedRule.blendIntensity})</span>
                )}
              </div>
              <div>
                <span className="text-slate-500">Atmosphere Preset:</span>{' '}
                <span className="text-emerald-300 font-bold">{resolvedWeatherState.presetType.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-slate-500">Physics Targets:</span> Water {resolvedWeatherState.waterHeight}% (Max 40%) | Sand {resolvedWeatherState.sandHeight}% (Max 30%)
              </div>
              <div>
                <span className="text-slate-500">Capabilities:</span> Tier {simulation?.capabilityTier || 'cinematic'} | WebGL {simulation?.webglAvailable ? 'ON' : 'OFF'} | Reduced Motion {simulation?.reducedMotion ? 'ON' : 'OFF'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
