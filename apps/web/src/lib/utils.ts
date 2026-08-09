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

/**
 * Safely parses a fetch Response object, gracefully handling non-JSON responses
 * such as 413 "Request Entity Too Large", HTML 500 error pages, or proxy errors,
 * preventing 'Unexpected token R...' JSON parse crashes.
 */
export async function safeFetchJson<T = any>(response: Response): Promise<{
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}> {
  const text = await response.text().catch(() => '');
  let json: any = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      // Not valid JSON (e.g. plain text "Request Entity Too Large" or HTML error page)
    }
  }

  if (!response.ok) {
    if (response.status === 413 || text.includes('Request Entity Too Large')) {
      return {
        ok: false,
        status: response.status,
        error: 'Payload Too Large: Request or file size exceeds the server limit (413).'
      };
    }
    const errorMessage = json?.error || json?.message || (typeof text === 'string' && text.length > 0 && text.length < 200 && !text.includes('<!DOCTYPE') ? text.trim() : `Request failed with status ${response.status}`);
    return {
      ok: false,
      status: response.status,
      error: errorMessage
    };
  }

  return {
    ok: true,
    status: response.status,
    data: json !== null ? json : ({} as T)
  };
}


