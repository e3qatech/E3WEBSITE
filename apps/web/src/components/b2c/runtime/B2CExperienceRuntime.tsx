"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import {
  CapabilityTier,
  B2CMotionSettings,
  DEFAULT_B2C_MOTION_SETTINGS,
  TelemetryEvent,
  TelemetryEventType,
} from '@/types/b2c-experience';
import { usePathname } from 'next/navigation';

interface B2CExperienceContextType {
  capabilityTier: CapabilityTier;
  reducedMotion: boolean;
  webglAvailable: boolean;
  motionSettings: B2CMotionSettings;
  updateMotionSettings: (newSettings: Partial<B2CMotionSettings>) => void;
  trackTelemetry: (event: TelemetryEventType, payload?: Record<string, any>) => void;
  telemetryLogs: TelemetryEvent[];
}

const B2CExperienceContext = createContext<B2CExperienceContextType | undefined>(undefined);

const DEFAULT_B2C_EXPERIENCE_CONTEXT: B2CExperienceContextType = {
  capabilityTier: 'BALANCED',
  reducedMotion: false,
  webglAvailable: true,
  motionSettings: DEFAULT_B2C_MOTION_SETTINGS,
  updateMotionSettings: () => {},
  trackTelemetry: () => {},
  telemetryLogs: [],
};

export function useB2CExperience() {
  const context = useContext(B2CExperienceContext);
  return context || DEFAULT_B2C_EXPERIENCE_CONTEXT;
}

const TELEMETRY_ALLOWLIST = new Set<TelemetryEventType>([
  'menu_opened',
  'destination_selected',
  'attraction_card_viewed',
  'attraction_selected',
  'filter_used',
  'ticket_cta_visible',
  'ticket_cta_clicked',
  'download_profile_clicked',
  'event_selected',
  'motion_fallback_used',
  'capability_tier_changed',
  'reduced_motion_triggered',
  'webgl_unavailable_triggered',
  'scene_load_failure',
]);

export function B2CExperienceProvider({ children }: { children: React.ReactNode }) {
  const [capabilityTier] = useState<CapabilityTier>(() => {
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isMobile || reduced) return 'LIGHTWEIGHT';
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return 'BALANCED';
    }
    return 'CINEMATIC';
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [webglAvailable] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch (_e) {
        return false;
      }
    }
    return true;
  });

  const [motionSettings, setMotionSettings] = useState<B2CMotionSettings>(DEFAULT_B2C_MOTION_SETTINGS);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryEvent[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  const updateMotionSettings = (newSettings: Partial<B2CMotionSettings>) => {
    setMotionSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const trackTelemetry = (event: TelemetryEventType, payload?: Record<string, any>) => {
    if (!TELEMETRY_ALLOWLIST.has(event)) return;

    // Filter out private user fields (passwords, tokens, PII)
    const sanitizedPayload: Record<string, any> = {};
    if (payload) {
      for (const [key, val] of Object.entries(payload)) {
        if (!['email', 'phone', 'password', 'token', 'cv', 'card'].includes(key.toLowerCase())) {
          sanitizedPayload[key] = val;
        }
      }
    }

    const item: TelemetryEvent = {
      event,
      timestamp: new Date().toISOString(),
      payload: sanitizedPayload,
    };
    setTelemetryLogs((prev) => [...prev.slice(-49), item]);
  };

  const value = useMemo(
    () => ({
      capabilityTier,
      reducedMotion,
      webglAvailable,
      motionSettings,
      updateMotionSettings,
      trackTelemetry,
      telemetryLogs,
    }),
    [capabilityTier, reducedMotion, webglAvailable, motionSettings, telemetryLogs]
  );

  return <B2CExperienceContext.Provider value={value}>{children}</B2CExperienceContext.Provider>;
}

// Single WebGL Scene Host (No duplicate RAF loops, pauses offscreen/hidden, disposes on unmount)
export function B2CSceneHost({
  preset,
  colorAccent = '#0ea5e9',
}: {
  preset: string;
  colorAccent?: string;
}) {
  const { reducedMotion, webglAvailable, capabilityTier } = useB2CExperience();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || !webglAvailable || capabilityTier === 'LIGHTWEIGHT' || !isVisible) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    const particles: { x: number; y: number; size: number; speed: number; angle: number }[] = [];

    const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const particleCount = capabilityTier === 'CINEMATIC' ? 40 : 20;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.8 + 0.2,
        angle: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Ambient radial lighting
      const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 1.5);
      grad.addColorStop(0, `${colorAccent}15`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Controlled ambient particles
      ctx.fillStyle = `${colorAccent}60`;
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.y -= p.speed;
        p.x += Math.sin(frameCount * 0.02 + p.angle) * 0.5;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      ctx.clearRect(0, 0, width, height);
      particles.length = 0;
    };
  }, [reducedMotion, webglAvailable, capabilityTier, isVisible, colorAccent, preset]);

  if (reducedMotion || !webglAvailable) {
    return (
      <div
        className="absolute inset-0 z-0 bg-slate-950/80 backdrop-blur-sm pointer-events-none transition-opacity"
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

// B2C Route Transition Host
export function B2CRouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { reducedMotion } = useB2CExperience();

  return (
    <div key={pathname} className={reducedMotion ? '' : 'animate-fade-in transition-all duration-300'}>
      {children}
    </div>
  );
}
