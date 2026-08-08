import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility function to safely format localized fields that may be plain strings,
 * JSON objects like { en: "...", ar: "..." }, or JSON-stringified objects.
 */
export function formatLocalizedText(val: any, locale: string = 'en'): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object' && parsed !== null) {
          if ('en' in parsed || 'ar' in parsed) {
            return (locale === 'ar' ? (parsed.ar || parsed.en) : (parsed.en || parsed.ar)) || '';
          }
        }
      } catch {
        // Fall through to returning the original string if not valid JSON
      }
    }
    return val;
  }
  if (typeof val === 'object') {
    if ('en' in val || 'ar' in val) {
      return (locale === 'ar' ? (val.ar || val.en) : (val.en || val.ar)) || '';
    }
    // Fallback if object has titleEn/titleAr or nameEn/nameAr
    if (locale === 'ar' && (val.titleAr || val.nameAr || val.questionAr)) {
      return val.titleAr || val.nameAr || val.questionAr;
    }
    if (val.titleEn || val.nameEn || val.questionEn) {
      return val.titleEn || val.nameEn || val.questionEn;
    }
    return '';
  }
  return String(val);
}

