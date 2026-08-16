import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { normalizeRichText } from "./rich-text";

export { normalizeRichText };

/**
 * Utility function to safely format localized fields that may be plain strings,
 * rich text nodes, JSON objects like { en: "...", ar: "..." }, or JSON-stringified objects.
 * Guarantees zero "[object Object]" artifacts in output.
 */
export function formatLocalizedText(val: any, locale: string = 'en'): string {
  return normalizeRichText(val, locale);
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


