/**
 * Utility for sanitizing and validating custom SVG masks uploaded via CMS.
 * Rejects unsafe tags (<script>, <iframe>, <object>, etc.), inline JavaScript handlers (on*),
 * external entities, and malformed SVG content.
 */

export interface SvgSanitizeResult {
  isValid: boolean;
  sanitizedSvg: string;
  error?: string;
}

export function validateAndSanitizeSvg(rawSvg: string): SvgSanitizeResult {
  if (!rawSvg || typeof rawSvg !== 'string') {
    return { isValid: false, sanitizedSvg: '', error: 'Empty or invalid SVG input' };
  }

  const trimmed = rawSvg.trim();

  // Check basic SVG tag existence
  if (!trimmed.toLowerCase().includes('<svg') || !trimmed.toLowerCase().includes('</svg>')) {
    return { isValid: false, sanitizedSvg: '', error: 'Input does not contain valid <svg> tags' };
  }

  // Reject malicious tags: <script>, <iframe>, <object>, <embed>, <foreignobject>, <link>
  const dangerousTagsRegex = /<\s*(script|iframe|object|embed|foreignobject|link|base|meta)\b/i;
  if (dangerousTagsRegex.test(trimmed)) {
    return { isValid: false, sanitizedSvg: '', error: 'Forbidden HTML/JS tags detected in SVG mask' };
  }

  // Reject inline JavaScript event handlers (onmouseover, onclick, onload, etc.)
  const eventHandlerRegex = /\son[a-z]+\s*=/i;
  if (eventHandlerRegex.test(trimmed)) {
    return { isValid: false, sanitizedSvg: '', error: 'Forbidden inline event handlers detected in SVG mask' };
  }

  // Reject javascript: URIs
  if (/javascript\s*:/i.test(trimmed)) {
    return { isValid: false, sanitizedSvg: '', error: 'Forbidden javascript: URI protocol detected' };
  }

  // Reject DOCTYPE / DTD entity expansion attacks
  if (/<!entity|<!doctype/i.test(trimmed)) {
    return { isValid: false, sanitizedSvg: '', error: 'Forbidden DOCTYPE or ENTITY declaration detected' };
  }

  // Basic sanitization: strip any remaining xml processing instructions if needed
  const cleaned = trimmed
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .trim();

  return {
    isValid: true,
    sanitizedSvg: cleaned,
  };
}
