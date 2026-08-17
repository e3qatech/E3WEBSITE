/**
 * QF-23 & QF-23-B: Canonical Partner Public Resolver & Safety Engine
 *
 * Requirements:
 * 1. Single canonical resolver for all public Partner consumers.
 * 2. Strict filtering of `isVisible: true` and deterministic ordering (orderIndex -> name -> id).
 * 3. Public Editorial Redaction: Redacts internal editorial instructions (e.g., "Confirm that this is the exact entity and logo before publishing.") from public descriptions.
 * 4. HTTPS-Only Public Websites: Stored `http:`, `javascript:`, `data:`, or unsafe schemes return `website: null` and `hasWebsite: false` publicly. Original stored values and warnings preserved for authorized staff.
 * 5. Public Logo Restriction: Restricts public logos to valid HTTPS URLs or strictly validated Base64 PNG/JPEG/WebP images. Rejects SVG, HTML/script-bearing data, malformed Base64, and HTTP protocols.
 * 6. Safe missing logo fallback handling (monogram initials).
 * 7. Non-destructive staff data-quality warning analyzer.
 * 8. Server-side RBAC verification helper for B2B management.
 */

export interface CanonicalPartnerInput {
  id: string;
  name: string;
  website?: string | null;
  category?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  isVisible?: boolean | null;
  orderIndex?: number | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  [key: string]: any;
}

export interface SafePublicPartner {
  id: string;
  name: string;
  category: string;
  description: string;
  logoUrl: string | null;
  website: string | null;
  hasLogo: boolean;
  hasWebsite: boolean;
  orderIndex: number;
  initials: string;
}

export interface PartnerDataQualityIssue {
  code:
    | 'MISSING_LOGO'
    | 'UNSAFE_LOGO'
    | 'HTTP_WEBSITE'
    | 'UNSAFE_WEBSITE'
    | 'INVALID_WEBSITE'
    | 'MISSING_DESCRIPTION'
    | 'EDITORIAL_INSTRUCTION'
    | 'DUPLICATE_NAME'
    | 'DUPLICATE_DOMAIN'
    | 'MISSING_REQUIRED_NAME'
    | 'HIDDEN_RECORD';
  messageEn: string;
  messageAr: string;
  severity: 'WARNING' | 'ERROR' | 'INFO';
}

export interface PartnerDataQualityReport {
  partnerId: string;
  isClean: boolean;
  issues: PartnerDataQualityIssue[];
  warningCount: number;
}

/**
 * Common editorial action verbs and instructions.
 */
export const EDITORIAL_ACTIONS = [
  'confirm',
  'verify',
  'validate',
  'test',
  'check',
  'review',
  'replace',
  'update',
  'approve',
  'ensure',
  'double-check',
  'double check',
  'inspect',
  'fix',
  'audit',
];

/**
 * Explicit editorial/publishing contexts that qualify an action as internal/staff-only.
 */
export const EDITORIAL_CONTEXTS = [
  'before publishing',
  'prior to publishing',
  'before publication',
  'before publish',
  'prior to publish',
  'before going live',
  'before launch',
  'for publishing',
  'when publishing',
  'to be published',
  'exact entity',
  'confirm entity',
  'check entity',
  'verify entity',
  'validate entity',
  'exact logo',
  'confirm logo',
  'check logo',
  'verify logo',
  'replace logo',
  'update logo',
  'entity and logo',
  'entity & logo',
  'test the url',
  'check the url',
  'verify the url',
  'test the link',
  'check the link',
  'verify the link',
  'test the website',
  'check the website',
  'verify website',
  'availability may vary',
  'url availability',
  'link availability',
  'broken link',
  'needs logo',
  'needs url',
  'needs website',
  'needs image',
  'needs description',
  'official logo',
  'correct logo',
  'correct entity',
  'staff review',
  'internal review',
  'internal note',
  'staff note',
  'admin note',
  'draft note',
  'draft only',
  'placeholder',
  'lorem ipsum',
  'todo',
  'tbd',
];

/**
 * Safely splits a text block into individual sentences across punctuation and line breaks.
 */
export function splitIntoSentences(text?: string | null): string[] {
  if (!text || typeof text !== 'string') return [];
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Match sentences ending in ., !, ?, ;, or linebreaks, preserving sentence boundaries
  const rawSentences = trimmed
    .split(/(?<=[.!?;\n\r])\s+|\n+/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return rawSentences;
}

/**
 * Unified sentence-level classifier for internal editorial, verification, and placeholder instructions.
 * Immune to ordinary marketing prose containing 'test', 'review', 'available', or 'verified'.
 */
export function isEditorialSentence(sentence?: string | null): boolean {
  if (!sentence || typeof sentence !== 'string') return false;
  const clean = sentence.trim();
  if (!clean) return false;

  const lower = clean.toLowerCase();

  // 1. Direct standalone placeholder / task keywords
  if (
    /^(todo|tbd|draft|placeholder|internal note|admin note|note for staff)\b/i.test(lower) ||
    lower.startsWith('lorem ipsum') ||
    lower.includes('todo:') ||
    lower.includes('tbd:')
  ) {
    return true;
  }

  // 2. Direct exact editorial instruction matches
  if (
    lower.includes('test the url before publishing') ||
    lower.includes('availability may vary') ||
    lower.includes('confirm that this is the exact entity') ||
    lower.includes('exact entity and logo') ||
    lower.includes('confirm entity and logo') ||
    lower.includes('confirm logo before publishing') ||
    lower.includes('needs logo') ||
    lower.includes('pending review') ||
    lower.includes('draft only')
  ) {
    return true;
  }

  // 3. Action + Context combination
  const hasAction = EDITORIAL_ACTIONS.some((action) => {
    const regex = new RegExp(`\\b${action}\\b`, 'i');
    return regex.test(lower);
  });

  if (hasAction) {
    const hasContext = EDITORIAL_CONTEXTS.some((ctx) => lower.includes(ctx));
    if (hasContext) {
      return true;
    }
  }

  return false;
}

/**
 * Redacts internal editorial instructions from public description strings using the sentence-level classifier.
 * Returns clean meaningful description or empty string if only instructions were present.
 */
export function redactPublicDescription(description?: string | null): string {
  if (!description || typeof description !== 'string') return '';
  const sentences = splitIntoSentences(description);
  if (sentences.length === 0) return '';

  const cleanSentences = sentences.filter((s) => !isEditorialSentence(s));
  if (cleanSentences.length === 0) return '';

  const text = cleanSentences.join(' ').trim();
  if (text.length < 2 || /^[\s,;.-]+$/.test(text)) {
    return '';
  }

  return text;
}

/**
 * Validates and sanitizes public website URLs.
 * Strictly enforces HTTPS. HTTP, javascript:, data:, and malformed schemes return null.
 * Does NOT automatically rewrite HTTP to HTTPS.
 */
export function sanitizePublicWebsite(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  // Insecure or dangerous schemes rejected
  if (
    lower.startsWith('http://') ||
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:')
  ) {
    return null;
  }

  if (!lower.startsWith('https://')) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol.toLowerCase() === 'https:' && parsed.hostname.length > 0) {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Strict regex for validated Base64 PNG/JPEG/WEBP image data URLs.
 */
const VALID_BASE64_IMAGE_REGEX = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/i;

/**
 * Sanitizes and validates public logo URLs.
 * Restricts to:
 * 1. Valid HTTPS URLs (excluding .svg).
 * 2. Strictly validated Base64 PNG, JPEG, JPG, WEBP data URLs.
 * Rejects SVG, HTML/script-bearing data, malformed Base64, and HTTP protocols.
 */
export function sanitizePublicLogo(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  // 1. Data URLs: strictly validated PNG, JPEG, JPG, WEBP Base64 images
  if (lower.startsWith('data:')) {
    // Explicitly disallow svg, html, text, javascript
    if (
      lower.startsWith('data:image/svg') ||
      lower.startsWith('data:text/') ||
      lower.startsWith('data:application/')
    ) {
      return null;
    }

    const match = trimmed.match(VALID_BASE64_IMAGE_REGEX);
    if (!match) {
      return null;
    }

    const base64Data = match[2];
    try {
      const decoded = typeof Buffer !== 'undefined'
        ? Buffer.from(base64Data, 'base64').toString('binary')
        : atob(base64Data);

      const lowerDecoded = decoded.toLowerCase();
      if (
        lowerDecoded.includes('<script') ||
        lowerDecoded.includes('javascript:') ||
        lowerDecoded.includes('<svg') ||
        lowerDecoded.includes('onload=') ||
        lowerDecoded.includes('onerror=') ||
        lowerDecoded.includes('<html') ||
        lowerDecoded.includes('<iframe')
      ) {
        return null;
      }
    } catch {
      return null;
    }

    return trimmed;
  }

  // 2. Reject SVG files by URL path or query
  if (lower.endsWith('.svg') || lower.includes('.svg?')) {
    return null;
  }

  // 3. Absolute HTTPS URLs
  if (lower.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol.toLowerCase() === 'https:' && parsed.hostname.length > 0) {
        if (parsed.pathname.toLowerCase().endsWith('.svg')) {
          return null;
        }
        return parsed.toString();
      }
    } catch {
      return null;
    }
  }

  // 4. Safe relative image paths (e.g. /assets/logos/partner.png)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    if (lower.endsWith('.svg')) {
      return null;
    }
    return trimmed;
  }

  // Reject HTTP, javascript:, ftp:, etc.
  return null;
}

/**
 * Canonical partner logo URL resolver.
 * 1. Rewrites legacy eeeqa.com/assets/partners/ URLs to relative local asset paths:
 *    - https://eeeqa.com/assets/partners/e3-logo.svg -> /assets/partners/e3-logo.svg
 *    - https://eeeqa.com/assets/partners/doha-mall-logo.svg -> /assets/partners/doha-mall-logo.svg
 * 2. Filters out broken/placeholder domains.
 * 3. Preserves authentic relative SVG paths and HTTPS remote partner URLs.
 */
export function resolvePartnerLogoUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. Direct legacy URL matching and normalization
  const legacyMatch = trimmed.match(/^https?:\/\/(?:www\.)?eeeqa\.com\/assets\/partners\/(.+)$/i);
  if (legacyMatch) {
    return `/assets/partners/${legacyMatch[1]}`;
  }

  // 2. Reject placeholders
  if (
    trimmed.includes('via.placeholder') ||
    trimmed.includes('placeholder.com') ||
    trimmed.includes('example.com')
  ) {
    return null;
  }

  // 3. Local relative paths
  if (trimmed.startsWith('/assets/partners/')) {
    return trimmed;
  }

  return sanitizeUrl(trimmed);
}

/**
 * Backward-compatible general URL sanitizer.
 */
export function sanitizeUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Normalize legacy eeeqa.com/assets/partners/ URLs
  const legacyMatch = trimmed.match(/^https?:\/\/(?:www\.)?eeeqa\.com\/assets\/partners\/(.+)$/i);
  if (legacyMatch) {
    return `/assets/partners/${legacyMatch[1]}`;
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/html') ||
    lower.startsWith('data:text/javascript') ||
    lower.startsWith('file:')
  ) {
    return null;
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  if (lower.startsWith('data:image/')) {
    return sanitizePublicLogo(trimmed);
  }

  try {
    const parsed = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    if (parsed.protocol.toLowerCase() === 'https:' || parsed.protocol.toLowerCase() === 'http:') {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Generates monogram initials for fallback rendering when logo is missing or invalid.
 */
export function getPartnerInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return 'EP';
  const clean = name.trim();
  if (!clean) return 'EP';

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Normalizes domain for duplicate detection (e.g. `https://www.visitqatar.com/` -> `visitqatar.com`).
 */
export function normalizeDomain(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return trimmed.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

/**
 * Normalizes name for duplicate detection (e.g. `Qatar Tourism` -> `qatartourism`).
 */
export function normalizePartnerName(name?: string | null): string {
  if (!name || typeof name !== 'string') return '';
  return name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
}

/**
 * Determines if a partner is publicly eligible for display on public showcases.
 */
export function isPartnerPubliclyEligible(partner: CanonicalPartnerInput): { eligible: boolean; reason?: string } {
  if (!partner) {
    return { eligible: false, reason: 'Partner object missing' };
  }

  if (partner.isVisible !== true) {
    return { eligible: false, reason: 'Partner is hidden (isVisible is false)' };
  }

  if (!partner.name || !partner.name.trim()) {
    return { eligible: false, reason: 'Partner name is missing' };
  }

  return { eligible: true };
}

/**
 * Resolves a single partner record into a safe public shape.
 * - Redacts internal editorial instructions from description.
 * - Strictly enforces HTTPS for website links.
 * - Validates logo protocols (HTTPS / valid Base64 PNG/JPEG/WEBP).
 * - Exposes NO CRM tenant information, internal notes, or private identifiers.
 */
export function resolvePublicPartner(partner: CanonicalPartnerInput): SafePublicPartner {
  const safeLogo = sanitizePublicLogo(partner.logoUrl);
  const safeWebsite = sanitizePublicWebsite(partner.website);
  const safeDescription = redactPublicDescription(partner.description);

  return {
    id: partner.id,
    name: partner.name?.trim() || 'Partner',
    category: (partner.category || 'PARTNER').toUpperCase(),
    description: safeDescription,
    logoUrl: safeLogo,
    website: safeWebsite,
    hasLogo: Boolean(safeLogo),
    hasWebsite: Boolean(safeWebsite),
    orderIndex: typeof partner.orderIndex === 'number' ? partner.orderIndex : 0,
    initials: getPartnerInitials(partner.name),
  };
}

/**
 * Filters a collection of partners to publicly eligible ones with deterministic ordering and safe fields.
 * Deterministic sort: `orderIndex asc`, then `name asc`, then `id asc`.
 */
export function filterAndResolvePublicPartners(partners: CanonicalPartnerInput[]): SafePublicPartner[] {
  if (!Array.isArray(partners)) return [];

  const eligible = partners.filter((p) => isPartnerPubliclyEligible(p).eligible);

  const sorted = [...eligible].sort((a, b) => {
    const orderA = typeof a.orderIndex === 'number' ? a.orderIndex : 0;
    const orderB = typeof b.orderIndex === 'number' ? b.orderIndex : 0;
    if (orderA !== orderB) return orderA - orderB;

    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    if (nameA !== nameB) return nameA.localeCompare(nameB);

    return (a.id || '').localeCompare(b.id || '');
  });

  return sorted.map(resolvePublicPartner);
}

/**
 * Analyzes partner data quality non-destructively for staff inspection.
 * Never mutates any stored records, never changes visibility, and never merges rows.
 */
export function analyzePartnerDataQuality(
  partner: CanonicalPartnerInput,
  allPartners?: CanonicalPartnerInput[]
): PartnerDataQualityReport {
  const issues: PartnerDataQualityIssue[] = [];

  if (!partner) {
    return {
      partnerId: '',
      isClean: false,
      issues: [
        {
          code: 'MISSING_REQUIRED_NAME',
          messageEn: 'Partner record is missing or invalid.',
          messageAr: 'سجل الشريك غير موجود أو غير صالح.',
          severity: 'ERROR',
        },
      ],
      warningCount: 1,
    };
  }

  // 1. Name check
  if (!partner.name || !partner.name.trim()) {
    issues.push({
      code: 'MISSING_REQUIRED_NAME',
      messageEn: 'Partner name is required.',
      messageAr: 'اسم الشريك مطلوب.',
      severity: 'ERROR',
    });
  }

  // 2. Logo check
  if (!partner.logoUrl || !partner.logoUrl.trim()) {
    issues.push({
      code: 'MISSING_LOGO',
      messageEn: 'Logo URL is missing. A monogram badge fallback will be rendered.',
      messageAr: 'رابط الشعار غير متوفر. سيتم عرض رمز نصي بديل.',
      severity: 'WARNING',
    });
  } else {
    const safeLogo = sanitizePublicLogo(partner.logoUrl);
    if (!safeLogo) {
      issues.push({
        code: 'UNSAFE_LOGO',
        messageEn: 'Logo URL uses an invalid, unencrypted, or unsafe protocol (e.g. SVG/HTTP) and will fallback to monogram.',
        messageAr: 'رابط الشعار يحتوي على صيغة غير مدعومة أو غير آمنة (مثل SVG أو HTTP) وسيتم استخدام الشعار النصي بدلاً عنه.',
        severity: 'ERROR',
      });
    }
  }

  // 3. Website check
  if (partner.website && partner.website.trim()) {
    const rawWeb = partner.website.trim().toLowerCase();
    if (rawWeb.startsWith('http://')) {
      issues.push({
        code: 'HTTP_WEBSITE',
        messageEn: 'Website URL uses unencrypted HTTP protocol and is hidden from public display. Upgrade to HTTPS.',
        messageAr: 'رابط الموقع الإلكتروني يستخدم بروتوكول HTTP غير المشفر وتم إخفاؤه من العرض العام. يُرجى الترقية إلى HTTPS.',
        severity: 'WARNING',
      });
    } else {
      const safeWebsite = sanitizePublicWebsite(partner.website);
      if (!safeWebsite) {
        issues.push({
          code: 'UNSAFE_WEBSITE',
          messageEn: 'Website URL uses an invalid or unsafe protocol.',
          messageAr: 'رابط الموقع الإلكتروني غير صالح أو غير آمن.',
          severity: 'WARNING',
        });
      }
    }
  }

  // 4. Description check
  if (!partner.description || !partner.description.trim()) {
    issues.push({
      code: 'MISSING_DESCRIPTION',
      messageEn: 'Description is missing.',
      messageAr: 'الوصف التعريفي غير متوفر.',
      severity: 'INFO',
    });
  }

  // 5. Editorial instructions check (using shared sentence-level classifier)
  const descriptionSentences = splitIntoSentences(partner.description);
  const nameSentences = splitIntoSentences(partner.name);
  const allSentences = [...nameSentences, ...descriptionSentences];

  const detectedEditorial = allSentences.filter((s) => isEditorialSentence(s));
  if (detectedEditorial.length > 0) {
    issues.push({
      code: 'EDITORIAL_INSTRUCTION',
      messageEn: `Editorial instruction / placeholder detected ("${detectedEditorial[0]}"). Redacted from public presentation.`,
      messageAr: `تم رصد تعليمات تحريرية أو نص مؤقت ("${detectedEditorial[0]}"). تم تنقيحه من العرض العام.`,
      severity: 'WARNING',
    });
  }

  // 6. Duplicate detection against other partners
  if (allPartners && allPartners.length > 1) {
    const currentNormName = normalizePartnerName(partner.name);
    const currentNormDomain = normalizeDomain(partner.website);

    const duplicateNames = allPartners.filter(
      (other) => other.id !== partner.id && normalizePartnerName(other.name) === currentNormName && currentNormName.length > 0
    );

    if (duplicateNames.length > 0) {
      issues.push({
        code: 'DUPLICATE_NAME',
        messageEn: `Likely duplicate partner name matching ID(s): ${duplicateNames.map((d) => d.id).join(', ')}.`,
        messageAr: `احتمال وجود تكرار في الاسم مع الشريك: ${duplicateNames.map((d) => d.id).join(', ')}.`,
        severity: 'WARNING',
      });
    }

    if (currentNormDomain) {
      const duplicateDomains = allPartners.filter(
        (other) => other.id !== partner.id && normalizeDomain(other.website) === currentNormDomain
      );

      if (duplicateDomains.length > 0) {
        issues.push({
          code: 'DUPLICATE_DOMAIN',
          messageEn: `Website domain (${currentNormDomain}) shared with ID(s): ${duplicateDomains.map((d) => d.id).join(', ')}.`,
          messageAr: `النطاق الإلكتروني (${currentNormDomain}) مكرر مع الشريك: ${duplicateDomains.map((d) => d.id).join(', ')}.`,
          severity: 'INFO',
        });
      }
    }
  }

  // 7. Hidden record notice
  if (partner.isVisible !== true) {
    issues.push({
      code: 'HIDDEN_RECORD',
      messageEn: 'Partner is currently hidden from the public showcase.',
      messageAr: 'هذا الشريك مخفي حالياً من الدليل العام.',
      severity: 'INFO',
    });
  }

  return {
    partnerId: partner.id || '',
    isClean: issues.filter((i) => i.severity === 'ERROR' || i.severity === 'WARNING').length === 0,
    issues,
    warningCount: issues.length,
  };
}

/**
 * Server-side RBAC verification helper for B2B content / partner mutation operations.
 * Permitted: SUPER_ADMIN, SALES_ADMIN, SUPPORT_ADMIN, STAFF, ADMIN, CONTENT_CREATOR, MARKETING.
 */
export function isB2BAuthorized(userRole?: string | null): boolean {
  if (!userRole || typeof userRole !== 'string') return false;

  const role = userRole.toUpperCase();
  const authorizedRoles = [
    'SUPER_ADMIN',
    'SALES_ADMIN',
    'SUPPORT_ADMIN',
    'STAFF',
    'ADMIN',
    'CONTENT_CREATOR',
    'MARKETING',
    'HR_ADMIN',
  ];

  return authorizedRoles.includes(role);
}
