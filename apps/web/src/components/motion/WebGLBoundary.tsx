"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useWebGLCapability } from '@/lib/motion/capability-context';
import { Layers, AlertTriangle } from 'lucide-react';

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
  title = "3D Interactive View",
  minHeight = "400px",
  reason = "WebGL Not Available",
}: {
  title?: string;
  minHeight?: string;
  reason?: string;
}) {
  return (
    <div
      role="region"
      aria-label={`${title} (${reason})`}
      className="relative w-full rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center p-8 text-center overflow-hidden"
      style={{ minHeight }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-md space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-emerald-400 mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-zinc-100">{title}</h4>
        <p className="text-xs text-zinc-400 leading-relaxed">
          This interactive section operates in accessible 2D display mode to ensure seamless performance and universal device compatibility.
        </p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>High-Performance Accessible Mode</span>
        </span>
      </div>
    </div>
  );
}

export interface WebGLBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
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
  minHeight = '400px',
  requireWebGL2 = false,
}: WebGLBoundaryProps) {
  const { isWebGLAvailable, isWebGL2Available, tier } = useWebGLCapability();

  const isSupported = requireWebGL2 ? isWebGL2Available : isWebGLAvailable;

  // If in minimal tier or WebGL is completely missing, immediately render safe fallback
  if (!isSupported || tier === 'minimal') {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <DefaultWebGLFallback
        title={title}
        minHeight={minHeight}
        reason={!isSupported ? "WebGL Unsupported" : "Accessibility Mode Active"}
      />
    );
  }

  return (
    <InnerWebGLCrashBoundary fallback={fallback} title={title} minHeight={minHeight}>
      {children}
    </InnerWebGLCrashBoundary>
  );
}
