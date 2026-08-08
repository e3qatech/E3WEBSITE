/**
 * MaskPresets.ts
 * SVG Path & ClipPath Definitions for all 10 CMS-selectable mask presets
 * in E3 Pulse Masked Worlds.
 */

export type MaskPresetType =
  | 'ORGANIC_WINDOW'
  | 'E3_MONOGRAM'
  | 'PORTAL_ARCH'
  | 'FLUID_RIBBON'
  | 'CIRCULAR_LENS'
  | 'SPLIT_WORLDS'
  | 'ARCHITECTURAL_FRAME'
  | 'TICKET_WINDOW'
  | 'ATTRACTION_SILHOUETTE'
  | 'CUSTOM_SVG_MASK';

export interface MaskPresetDefinition {
  id: MaskPresetType;
  nameEn: string;
  nameAr: string;
  viewBox: string;
  pathData: string;
  clipPathCss?: string;
}

export const MASK_PRESETS: Record<MaskPresetType, MaskPresetDefinition> = {
  ORGANIC_WINDOW: {
    id: 'ORGANIC_WINDOW',
    nameEn: 'Organic Window',
    nameAr: 'نافذة عضوية',
    viewBox: '0 0 100 100',
    pathData: 'M20,15 C40,5 65,10 85,25 C95,45 90,75 75,88 C55,98 30,90 12,78 C-2,60 5,28 20,15 Z',
    clipPathCss: 'path("M 20 15 C 40 5 65 10 85 25 C 95 45 90 75 75 88 C 55 98 30 90 12 78 C -2 60 5 28 20 15 Z")',
  },
  E3_MONOGRAM: {
    id: 'E3_MONOGRAM',
    nameEn: 'E3 Monogram Silhouette',
    nameAr: 'شعار إي ثري',
    viewBox: '0 0 100 100',
    pathData: 'M 10 10 H 90 V 28 H 32 V 42 H 78 V 58 H 32 V 72 H 90 V 90 H 10 Z',
    clipPathCss: 'polygon(10% 10%, 90% 10%, 90% 28%, 32% 28%, 32% 42%, 78% 42%, 78% 58%, 32% 58%, 32% 72%, 90% 72%, 90% 90%, 10% 90%)',
  },
  PORTAL_ARCH: {
    id: 'PORTAL_ARCH',
    nameEn: 'Portal Arch',
    nameAr: 'قوس البوابة',
    viewBox: '0 0 100 100',
    pathData: 'M 10 95 V 45 C 10 20, 90 20, 90 45 V 95 Z',
    clipPathCss: 'path("M 10 95 V 45 C 10 20 90 20 90 45 V 95 Z")',
  },
  FLUID_RIBBON: {
    id: 'FLUID_RIBBON',
    nameEn: 'Fluid Ribbon',
    nameAr: 'شريط انسيابي',
    viewBox: '0 0 100 100',
    pathData: 'M 5 20 C 35 5 65 35 95 15 C 85 55 95 85 65 95 C 35 85 5 95 5 60 Z',
    clipPathCss: 'path("M 5 20 C 35 5 65 35 95 15 C 85 55 95 85 65 95 C 35 85 5 95 5 60 Z")',
  },
  CIRCULAR_LENS: {
    id: 'CIRCULAR_LENS',
    nameEn: 'Circular Lens',
    nameAr: 'عدسة دائرية',
    viewBox: '0 0 100 100',
    pathData: 'M 50 5 A 45 45 0 1 0 50 95 A 45 45 0 1 0 50 5 Z',
    clipPathCss: 'circle(45% at 50% 50%)',
  },
  SPLIT_WORLDS: {
    id: 'SPLIT_WORLDS',
    nameEn: 'Split Worlds',
    nameAr: 'عالمين منفصلين',
    viewBox: '0 0 100 100',
    pathData: 'M 5 10 H 45 V 90 H 5 Z M 55 10 H 95 V 90 H 55 Z',
    clipPathCss: 'polygon(5% 10%, 45% 10%, 45% 90%, 5% 90%)',
  },
  ARCHITECTURAL_FRAME: {
    id: 'ARCHITECTURAL_FRAME',
    nameEn: 'Architectural Frame',
    nameAr: 'إطار معماري',
    viewBox: '0 0 100 100',
    pathData: 'M 15 5 H 85 L 95 15 V 85 L 85 95 H 15 L 5 85 V 15 Z',
    clipPathCss: 'polygon(15% 5%, 85% 5%, 95% 15%, 95% 85%, 85% 95%, 15% 95%, 5% 85%, 5% 15%)',
  },
  TICKET_WINDOW: {
    id: 'TICKET_WINDOW',
    nameEn: 'Ticket Window Notch',
    nameAr: 'تذكرة بفتحات',
    viewBox: '0 0 100 100',
    pathData: 'M 5 15 H 95 V 40 A 10 10 0 0 0 95 60 V 85 H 5 V 60 A 10 10 0 0 0 5 40 Z',
    clipPathCss: 'path("M 5 15 H 95 V 40 A 10 10 0 0 0 95 60 V 85 H 5 V 60 A 10 10 0 0 0 5 40 Z")',
  },
  ATTRACTION_SILHOUETTE: {
    id: 'ATTRACTION_SILHOUETTE',
    nameEn: 'Attraction Silhouette',
    nameAr: 'ظل معلم ترفيهي',
    viewBox: '0 0 100 100',
    pathData: 'M 10 90 L 30 40 L 50 15 L 70 40 L 90 90 Z',
    clipPathCss: 'polygon(10% 90%, 30% 40%, 50% 15%, 70% 40%, 90% 90%)',
  },
  CUSTOM_SVG_MASK: {
    id: 'CUSTOM_SVG_MASK',
    nameEn: 'Custom SVG Mask',
    nameAr: 'قناع SVG مخصص',
    viewBox: '0 0 100 100',
    pathData: 'M 0 0 H 100 V 100 H 0 Z',
    clipPathCss: 'inset(0% round 16px)',
  },
};

export function getPresetSvgPath(preset: MaskPresetType, customSvg?: string): string {
  if (preset === 'CUSTOM_SVG_MASK' && customSvg) {
    // Extract path 'd' if provided or return custom string
    const match = customSvg.match(/d=["'](.*?)["']/);
    if (match && match[1]) return match[1];
  }
  return MASK_PRESETS[preset]?.pathData || MASK_PRESETS.ORGANIC_WINDOW.pathData;
}
