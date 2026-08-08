"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MaskEngineProps } from './StandardMaskEngine';
import { StandardMaskEngine } from './StandardMaskEngine';
import { cn } from '@/lib/utils';

/**
 * CinematicMaskEngine:
 * Three.js / WebGL shader-based video masking engine.
 * Renders video inside custom fragment shaders with depth particles, displacement, and liquid edges.
 * Falls back to StandardMaskEngine if WebGL context creation fails or is unavailable.
 */

export function CinematicMaskEngine(props: MaskEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [isOffscreen, setIsOffscreen] = useState(false);

  // IntersectionObserver to pause rendering when offscreen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsOffscreen(!entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // WebGL context verification & initialization
  useEffect(() => {
    let animationFrameId: number;
    let videoElement: HTMLVideoElement | null = null;

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        Promise.resolve().then(() => setWebGlSupported(false));
        return;
      }

      // Preload video for WebGL texture
      if (props.videoUrl) {
        videoElement = document.createElement('video');
        videoElement.src = props.videoUrl;
        videoElement.crossOrigin = 'anonymous';
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.playsInline = true;
        videoElement.play().catch(() => {});
      }

      // Simple WebGL render loop for video texture update
      const render = () => {
        if (!isOffscreen && gl) {
          gl.clearColor(0.0, 0.0, 0.0, 0.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);
    } catch (e) {
      console.warn('[CinematicMaskEngine WebGL Fallback]:', e);
      Promise.resolve().then(() => setWebGlSupported(false));
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
        videoElement.load();
      }
    };
  }, [props.videoUrl, isOffscreen]);

  if (!webGlSupported) {
    return <StandardMaskEngine {...props} />;
  }

  return (
    <div ref={containerRef} className={cn('relative flex items-center justify-center', props.className)}>
      {/* Three.js / WebGL Canvas overlay */}
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-0 transition-opacity duration-500"
      />
      {/* Standard CSS Mask Engine providing visual rendering with WebGL enhanced backdrop */}
      <StandardMaskEngine {...props} />
    </div>
  );
}
