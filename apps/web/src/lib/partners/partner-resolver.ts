/**
 * QF-23: Canonical Partner Public Resolver & Safety Engine
 *
 * Requirements:
 * 1. Single canonical resolver for all public Partner consumers.
 * 2. Strict filtering of `isVisible: true` and deterministic ordering.
 * 3. Sanitizes URLs (rejects `javascript:`, unsafe `data:` protocols).
 * 4. Safe public field extraction (no internal or CRM tenant leakage).
 * 5. Safe missing logo fallback handling.
 * 6. Non-destructive staff data-quality warning analyzer (detects missing logos,
 *    editorial instructions like "confirm entity/logo", placeholder text, duplicate names/domains).
 * 7. Server-side RBAC verification helper for B2B management.
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
 * Allowed URL schemes for websites and external links.
 */
const SAFE_URL_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * Validates and sanitizes URLs, blocking `javascript:`, `vbscript:`, `data:text/html`, etc.
 */
export function sanitizeUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Reject explicit dangerous protocols
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

  // Allow relative URLs starting with / or #
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  // Allow safe data URLs for images (png, jpeg, webp, svg, gif)
  if (lower.startsWith('data:image/')) {
    return trimmed;
  }

  // Parse absolute URLs
  try {
    const parsed = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    if (SAFE_URL_SCHEMES.includes(parsed.protocol.toLowerCase())) {
      return parsed.toString();
    }
  } catch {
    // If not parseable as URL, reject
    return null;
  }

  return null;
}

/**
 * Generates monogram initials for fallback rendering when logo is missing.
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
 * Exposes NO CRM tenant information, internal notes, or private identifiers.
 */
export function resolvePublicPartner(partner: CanonicalPartnerInput): SafePublicPartner {
  const safeLogo = sanitizeUrl(partner.logoUrl);
  const safeWebsite = sanitizeUrl(partner.website);

  return {
    id: partner.id,
    name: partner.name?.trim() || 'Partner',
    category: (partner.category || 'PARTNER').toUpperCase(),
    description: partner.description?.trim() || '',
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
 * Editorial instruction patterns to detect in partner names or descriptions.
 */
const EDITORIAL_PATTERNS = [
  'confirm',
  'todo',
  'tbd',
  'placeholder',
  'lorem ipsum',
  'check entity',
  'confirm entity',
  'confirm logo',
  'needs logo',
  'pending review',
  'draft only',
];

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
    const safeLogo = sanitizeUrl(partner.logoUrl);
    if (!safeLogo) {
      issues.push({
        code: 'UNSAFE_LOGO',
        messageEn: 'Logo URL uses an invalid or unsafe protocol and was rejected.',
        messageAr: 'رابط الشعار يحتوي على بروتوكول غير آمن وتم استبعاده.',
        severity: 'ERROR',
      });
    }
  }

  // 3. Website check
  if (partner.website && partner.website.trim()) {
    const safeWebsite = sanitizeUrl(partner.website);
    if (!safeWebsite) {
      issues.push({
        code: 'UNSAFE_WEBSITE',
        messageEn: 'Website URL uses an invalid or unsafe protocol.',
        messageAr: 'رابط الموقع الإلكتروني غير صالح أو غير آمن.',
        severity: 'WARNING',
      });
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

  // 5. Editorial instructions check
  const textBlob = `${partner.name || ''} ${partner.description || ''}`.toLowerCase();
  for (const pattern of EDITORIAL_PATTERNS) {
    if (textBlob.includes(pattern)) {
      issues.push({
        code: 'EDITORIAL_INSTRUCTION',
        messageEn: `Editorial instruction / placeholder detected ("${pattern}"). Verify before public release.`,
        messageAr: `تم رصد تعليمات تحريرية أو نص مؤقت ("${pattern}"). يُرجى التأكد قبل النشر.`,
        severity: 'WARNING',
      });
      break;
    }
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
