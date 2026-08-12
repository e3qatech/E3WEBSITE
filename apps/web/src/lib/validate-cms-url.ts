/**
 * validate-cms-url.ts
 *
 * Typed URL validation for CMS content fields.
 * Distinguishes internal routes, external URLs, media IDs, iframe sources,
 * and anchors, and blocks all disallowed schemes.
 *
 * This must be applied to known URL fields before persisting to the database.
 */

/** Approved iframe embed origins. Extend as needed after security review. */
export const APPROVED_IFRAME_ORIGINS: readonly string[] = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "spline.design",
  "app.spline.design",
  "player.vimeo.com",
  "www.youtube.com",
] as const;

export type CmsUrlType =
  | "internal-route"
  | "external-url"
  | "media-id"
  | "iframe-url"
  | "anchor"
  | "any-url"; // accepts both internal and external https

export interface CmsUrlValidationResult {
  valid: boolean;
  reason?: string;
}

/** UUID v4 pattern (Prisma-generated IDs) */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Localized internal route, e.g. /en/b2c/discover */
const INTERNAL_ROUTE_PATTERN = /^\/[a-z]{2}(\/|$)/i;

/** Disallowed scheme prefixes — must be checked before type-specific checks */
const DISALLOWED_SCHEMES = /^(javascript:|data:text\/html|data:application\/|vbscript:)/i;

/** Temporary blob URLs — not persistable */
const BLOB_SCHEME = /^blob:/i;

/**
 * Validates a CMS URL field.
 *
 * Rules that always apply regardless of type:
 * - Empty string is valid (field is unset — omit from rendered output)
 * - javascript:, data:text/html, vbscript: → REJECTED
 * - blob: → REJECTED (not persistable across requests)
 *
 * Type-specific rules:
 * - internal-route  : must start with /xx/ (locale prefix) OR be a #anchor
 * - external-url    : must start with https://
 * - media-id        : must be a UUID v4 string
 * - iframe-url      : must be https:// AND from APPROVED_IFRAME_ORIGINS
 * - anchor          : must start with #
 * - any-url         : internal-route OR external-url (union)
 */
export function validateCmsUrl(value: string, type: CmsUrlType): CmsUrlValidationResult {
  // Empty is always valid (treated as "not set")
  if (!value || value.trim() === "") return { valid: true };

  const trimmed = value.trim();

  // Always reject disallowed schemes
  if (DISALLOWED_SCHEMES.test(trimmed)) {
    return { valid: false, reason: `Disallowed URL scheme in value: "${trimmed.slice(0, 30)}"` };
  }

  // Always reject blob: URIs (not persistable)
  if (BLOB_SCHEME.test(trimmed)) {
    return { valid: false, reason: "blob: URLs are not persistable and cannot be stored in CMS" };
  }

  switch (type) {
    case "internal-route":
      if (INTERNAL_ROUTE_PATTERN.test(trimmed) || /^#/.test(trimmed)) {
        return { valid: true };
      }
      return {
        valid: false,
        reason: `Internal route must start with a locale prefix (/en/, /ar/) or be an anchor (#). Got: "${trimmed.slice(0, 60)}"`,
      };

    case "external-url":
      if (/^https:\/\//i.test(trimmed)) return { valid: true };
      return {
        valid: false,
        reason: `External URL must start with https://. Got: "${trimmed.slice(0, 60)}"`,
      };

    case "media-id":
      if (UUID_PATTERN.test(trimmed)) return { valid: true };
      return {
        valid: false,
        reason: `Media ID must be a UUID v4. Got: "${trimmed.slice(0, 40)}"`,
      };

    case "iframe-url": {
      if (!/^https:\/\//i.test(trimmed)) {
        return { valid: false, reason: "Iframe URL must be https://" };
      }
      const isApproved = APPROVED_IFRAME_ORIGINS.some(origin => trimmed.includes(origin));
      if (!isApproved) {
        return {
          valid: false,
          reason: `Iframe origin not in approved list. Approved: ${APPROVED_IFRAME_ORIGINS.join(", ")}`,
        };
      }
      return { valid: true };
    }

    case "anchor":
      if (/^#/.test(trimmed)) return { valid: true };
      return { valid: false, reason: `Anchor must start with #. Got: "${trimmed.slice(0, 40)}"` };

    case "any-url":
      if (INTERNAL_ROUTE_PATTERN.test(trimmed) || /^#/.test(trimmed)) return { valid: true };
      if (/^https:\/\//i.test(trimmed)) return { valid: true };
      return {
        valid: false,
        reason: `URL must be an internal route (/locale/...), an anchor (#), or https://. Got: "${trimmed.slice(0, 60)}"`,
      };

    default:
      return { valid: true };
  }
}

/**
 * Validate a map of field paths to their URL values and types.
 * Returns an array of error messages (empty = all valid).
 */
export function validateCmsUrlMap(
  fields: Array<{ path: string; value: string; type: CmsUrlType }>
): string[] {
  const errors: string[] = [];
  for (const { path, value, type } of fields) {
    const result = validateCmsUrl(value, type);
    if (!result.valid) {
      errors.push(`[${path}] ${result.reason}`);
    }
  }
  return errors;
}
