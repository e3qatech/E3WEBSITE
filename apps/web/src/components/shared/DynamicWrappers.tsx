'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Common Skeleton for Dynamic Components
function DynamicSkeleton({ className = '', text = 'Loading...' }: { className?: string, text?: string }) {
  return (
    <div className={`flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg border border-zinc-200 dark:border-zinc-700 ${className}`}>
      <span className="text-zinc-500 text-sm">{text}</span>
    </div>
  );
}

/**
 * Dynamic wrapper for Three.js components (e.g. SpatialHub, ARViewer)
 * Ensures large WebGL libraries only load on the client when needed.
 */
export const DynamicSpatialHub = dynamic(
  () => import('./SpatialHub').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <DynamicSkeleton text="Loading 3D Experience..." className="w-full h-[400px]" />
  }
);

export const DynamicARViewer = dynamic(
  () => import('./ARViewer').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <DynamicSkeleton text="Loading AR..." className="w-full h-[400px]" />
  }
);

/**
 * Dynamic wrapper for Rich Text Editor (e.g. TipTap)
 * Heavy WYSIWYG editors should be split from the main bundle.
 */
export const DynamicRichTextEditor = dynamic(
  () => import('./TipTapEditor').then((mod) => mod.TipTapEditor),
  {
    ssr: false,
    loading: () => <DynamicSkeleton text="Loading Editor..." className="w-full min-h-[200px]" />
  }
);
