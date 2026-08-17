"use client";

import { useEffect, useState } from 'react';

export interface WebGLSupportStatus {
  isSupported: boolean;
  isWebGL2: boolean;
  isReducedMotion: boolean;
  isLowPower: boolean;
  tier: 'full' | 'balanced' | 'minimal';
  reason?: string;
  isMounted: boolean;
}

export function useWebGLSupport(): WebGLSupportStatus {
  const [status, setStatus] = useState<WebGLSupportStatus>({
    isSupported: true,
    isWebGL2: true,
    isReducedMotion: false,
    isLowPower: false,
    tier: 'balanced',
    isMounted: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // URL query overrides strictly permitted only in development or for authorized admin/staff preview sessions
    const isDev = process.env.NODE_ENV !== 'production';
    const isLocalhost = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('.local')
    );
    const hasAdminCookie = typeof document !== 'undefined' && (
      document.cookie.includes('next-auth.session-token') ||
      document.cookie.includes('__Secure-next-auth.session-token') ||
      document.cookie.includes('e3_admin_preview')
    );
    const allowTestOverrides = isDev || isLocalhost || hasAdminCookie;

    const urlParams = new URLSearchParams(window.location.search);
    const forceReducedMotion = allowTestOverrides && (urlParams.get('reducedMotion') === 'true' || urlParams.get('motion') === 'false');
    const forceNoWebGL = allowTestOverrides && (urlParams.get('webgl') === 'false' || urlParams.get('nowebgl') === 'true');

    // 1. Reduced Motion Detection
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = forceReducedMotion || motionQuery.matches;

    // 2. Data Saver / Low Power Detection
    const nav = navigator as any;
    const isDataSaver = Boolean(nav?.connection?.saveData);
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // 3. WebGL Support Detection
    let isSupported = false;
    let isWebGL2 = false;
    let failureReason: string | undefined;

    if (forceNoWebGL) {
      isSupported = false;
      failureReason = 'WebGL manually disabled via URL test parameter';
    } else {
      try {
        const canvas = document.createElement('canvas');
        const gl2 = canvas.getContext('webgl2');
        if (gl2) {
          isSupported = true;
          isWebGL2 = true;
        } else {
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (gl) {
            isSupported = true;
            isWebGL2 = false;
          } else {
            isSupported = false;
            failureReason = 'WebGL context not available on this device/browser';
          }
        }
      } catch (e: any) {
        isSupported = false;
        failureReason = e?.message || 'WebGL initialization error';
      }
    }

    let tier: 'full' | 'balanced' | 'minimal' = 'balanced';
    if (prefersReducedMotion || isDataSaver || !isSupported) {
      tier = 'minimal';
    } else if (isWebGL2 && !isMobileDevice && window.innerWidth >= 1024) {
      tier = 'full';
    } else {
      tier = 'balanced';
    }

    setStatus({
      isSupported,
      isWebGL2,
      isReducedMotion: prefersReducedMotion,
      isLowPower: isDataSaver,
      tier,
      reason: failureReason,
      isMounted: true,
    });

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setStatus(prev => ({
        ...prev,
        isReducedMotion: e.matches,
        tier: e.matches ? 'minimal' : prev.tier,
      }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  return status;
}
