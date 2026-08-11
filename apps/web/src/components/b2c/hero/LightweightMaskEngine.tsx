"use client";

import React from 'react';
import { MaskEngineProps } from './StandardMaskEngine';
import { getPresetSvgPath } from './MaskPresets';
import { cn } from '@/lib/utils';

export function LightweightMaskEngine({
  portalMode: _portalMode,
  videoUrl,
  posterUrl,
  fallbackImageUrl,
  preset = 'ORGANIC_WINDOW',
  customSvgMask,
  scale = 1,
  altTextEn = 'E3 Pulse Attraction Experience Video',
  altTextAr = 'فيديو تجارب إي ثري الترفيهية',
  accentColor = '#10b981',
  isRtl = false,
  className,
}: MaskEngineProps) {
  const pathData = getPresetSvgPath(preset, customSvgMask);
  const mediaSrc = posterUrl || fallbackImageUrl || videoUrl || '';

  return (
    <div
      className={cn('relative flex items-center justify-center select-none overflow-hidden', className)}
      style={{ transform: `scale(${scale})` }}
    >
      <span className="sr-only">
        {isRtl ? altTextAr : altTextEn}
      </span>

      {/* SVG ClipPath for lightweight static rendering */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="lightweightSvgClip" clipPathUnits="objectBoundingBox">
            <path d={pathData} transform="scale(0.01, 0.01)" />
          </clipPath>
        </defs>
      </svg>

      <div
        className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-2xl overflow-hidden shadow-lg transition-all duration-300"
        style={{
          clipPath: 'url(#lightweightSvgClip)',
          WebkitClipPath: 'url(#lightweightSvgClip)',
        }}
      >
        <img
          src={mediaSrc}
          alt={isRtl ? altTextAr : altTextEn}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 80%)` }}
        />
      </div>
    </div>
  );
}
