"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useWebGLCapability } from '@/lib/motion/capability-context';
import { Layers } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  minHeight?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class InnerWebGLCrashBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[E3 WebGL Boundary] Caught 3D/Canvas rendering crash:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultWebGLFallback
          title={this.props.title}
          minHeight={this.props.minHeight}
          reason="Rendering Error"
        />
      );
    }

    return this.props.children;
  }
}

export function DefaultWebGLFallback({
  title,
  description,
  badgeText,
  minHeight = "400px",
  reason,
  locale,
}: {
  title?: string;
  description?: string;
  badgeText?: string;
  minHeight?: string;
  reason?: string;
  locale?: string;
}) {
  const isAr = locale === 'ar';

  const defaultTitle = isAr ? "عرض تفاعلي ثلاثي الأبعاد" : "3D Interactive View";
  const displayTitle = title || defaultTitle;

  const defaultDescription = isAr
    ? "يعمل هذا القسم التفاعلي في وضع العرض ثنائي الأبعاد عالي التوافق لضمان الأداء السلس والتوافق التام مع جميع الأجهزة."
    : "This interactive section operates in accessible 2D display mode to ensure seamless performance and universal device compatibility.";
  const displayDescription = description || defaultDescription;

  const defaultBadgeText = isAr ? "وضع الأداء العالي وسهولة الوصول" : "High-Performance Accessible Mode";
  const displayBadgeText = badgeText || defaultBadgeText;

  const defaultReason = isAr ? "وضع سهولة الوصول نشط" : "WebGL Not Available";
  const displayReason = reason || defaultReason;

  return (
    <div
      role="region"
      aria-label={`${displayTitle} (${displayReason})`}
      className="relative w-full rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center p-8 text-center overflow-hidden"
      style={{ minHeight }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-md space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-emerald-400 mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-zinc-100">{displayTitle}</h4>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {displayDescription}
        </p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{displayBadgeText}</span>
        </span>
      </div>
    </div>
  );
}

export interface WebGLBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  description?: string;
  badgeText?: string;
  locale?: string;
  minHeight?: string;
  requireWebGL2?: boolean;
}

/**
 * Isolates WebGL/Three.js/Spline rendering.
 * Prevents section from mounting if WebGL is unsupported and intercepts any runtime canvas crashes.
 */
export function WebGLBoundary({
  children,
  fallback,
  title,
  description,
  badgeText,
  locale,
  minHeight = '400px',
  requireWebGL2 = false,
}: WebGLBoundaryProps) {
  const { isWebGLAvailable, isWebGL2Available, tier } = useWebGLCapability();

  const isSupported = requireWebGL2 ? isWebGL2Available : isWebGLAvailable;
  const isAr = locale === 'ar';

  const defaultReason = !isSupported
    ? (isAr ? "تقنية WebGL غير متوفرة" : "WebGL Unsupported")
    : (isAr ? "وضع سهولة الوصول نشط" : "Accessibility Mode Active");

  // If in minimal tier or WebGL is completely missing, immediately render safe fallback
  if (!isSupported || tier === 'minimal') {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <DefaultWebGLFallback
        title={title}
        description={description}
        badgeText={badgeText}
        locale={locale}
        minHeight={minHeight}
        reason={defaultReason}
      />
    );
  }

  return (
    <InnerWebGLCrashBoundary
      fallback={
        fallback || (
          <DefaultWebGLFallback
            title={title}
            description={description}
            badgeText={badgeText}
            locale={locale}
            minHeight={minHeight}
            reason={isAr ? "خطأ في معالجة المشهد ثلاثي الأبعاد" : "Rendering Error"}
          />
        )
      }
      title={title}
      minHeight={minHeight}
    >
      {children}
    </InnerWebGLCrashBoundary>
  );
}
