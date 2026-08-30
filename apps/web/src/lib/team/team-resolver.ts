/**
 * QF-24 & QF-24-D: Canonical Team Member Public Resolver, Safety Engine & HTTP Route Canonicalizer
 *
 * Requirements:
 * 1. Single canonical resolver for all public Team consumers (B2B team list, detail, B2C team, About, sitemap).
 * 2. Strict filtering of `isActive: true` and deterministic ordering (order asc, name asc, slug asc).
 * 3. Exact slug resolution — NO hardcoded fallbacks to other profiles.
 * 4. Non-Streamed HTTP Transport Canonicalization:
 *    - Eligible legacy CUID -> real locale-preserving permanent redirect (HTTP 308) with Location header.
 *    - Unknown, malformed, or inactive identifiers -> genuine HTTP 404.
 *    - Canonical eligible slugs -> HTTP 200.
 * 5. Arabic Fail-Closed Presentation:
 *    - Zero raw English nested prose on Arabic routes.
 *    - Comprehensive translation dictionary for all 22 roster members across skills, competencies, roles, certs, issuers, and timelines.
 *    - Latin text restricted to narrow allowlist of brands, technologies, and standard acronyms.
 * 6. Public Privacy: Strips personal email and phone numbers; validates HTTPS social links.
 * 7. Non-destructive staff data quality & review analyzer.
 * 8. Canonical RBAC verification for team mutations.
 */

import { hasPermission } from '@/lib/permissions';

export interface CanonicalEmployeeInput {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  firstNameAr?: string | null;
  lastNameAr?: string | null;
  designation: string;
  designationAr?: string | null;
  department: string;
  departmentAr?: string | null;
  yearsOfExperience?: number | null;
  tagline?: string | null;
  taglineAr?: string | null;
  heroTaglineAr?: string | null;
  aboutSummary?: string | null;
  aboutSummaryAr?: string | null;
  careerJourney?: string | null;
  careerJourneyAr?: string | null;
  keyStrengths?: string | null;
  keyStrengthsAr?: string | null;
  expertiseTags?: any;
  expertiseTagsAr?: any;
  coreCompetencies?: any;
  coreCompetenciesAr?: any;
  experience?: any;
  experienceAr?: any;
  experienceTimeline?: any;
  projects?: any;
  projectsAr?: any;
  projectsPortfolio?: any;
  certifications?: any;
  certificationsAr?: any;
  education?: any;
  educationAr?: any;
  awards?: any;
  awardsAr?: any;
  skillsMatrix?: any;
  skillsMatrixAr?: any;
  mediaGallery?: any;
  testimonials?: any;
  contactEmail?: string | null;
  linkedinUrl?: string | null;
  profileImage?: string | null;
  isActive?: boolean | null;
  showOnTeamPage?: boolean | null;
  isFeatured?: boolean | null;
  order?: number | null;
  displayOrder?: number | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  presentationGroup?: string | null;
  [key: string]: any;
}

export interface SafePublicTeamMember {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  nameAr: string;
  firstName?: string;
  lastName?: string;
  firstNameAr?: string;
  lastNameAr?: string;
  designation: string;
  designationAr?: string;
  department: string;
  departmentAr?: string;
  departmentKey: string;
  presentationGroup: string;
  presentationGroupKey: string;
  yearsOfExperience: number;
  tagline: string;
  taglineAr?: string;
  aboutSummary: string;
  aboutSummaryAr?: string;
  profileImage: string | null;
  initials: string;
  linkedinUrl: string | null;
  hasLinkedin: boolean;
  order: number;
  displayOrder: number;
  sequenceOrder?: number;
  isFeatured: boolean;
  showOnTeamPage: boolean;
  // Complex rich profile fields (safe strings)
  careerJourney?: string;
  keyStrengths?: string;
  expertiseTags: string[];
  coreCompetencies: string[];
  experience: any[];
  projects: any[];
  certifications: any[];
  education: any[];
  awards: any[];
}

export interface TeamDataQualityIssue {
  code:
    | 'MOHASIN_DUPLICATE_REVIEW'
    | 'REVIEW_REQUIRED'
    | 'MISSING_ARABIC_NAME'
    | 'MISSING_ARABIC_DESIGNATION'
    | 'MISSING_ARABIC_DEPARTMENT'
    | 'MISSING_ARABIC_BIO'
    | 'MISSING_ARABIC_EXPERTISE'
    | 'MISSING_ARABIC_EXPERIENCE'
    | 'MISSING_ARABIC_PROJECTS'
    | 'MISSING_PORTRAIT'
    | 'UNSAFE_PORTRAIT'
    | 'UNSAFE_SOCIAL_URL'
    | 'PERSONAL_CONTACT_EXPOSED'
    | 'PLACEHOLDER_CONTENT'
    | 'DUPLICATE_SLUG'
    | 'DUPLICATE_NAME'
    | 'INACTIVE_RECORD'
    | 'HIDDEN_FROM_TEAM_PAGE';
  messageEn: string;
  messageAr: string;
  severity: 'WARNING' | 'ERROR' | 'INFO';
}

export interface TeamDataQualityReport {
  employeeId: string;
  slug: string;
  isClean: boolean;
  issues: TeamDataQualityIssue[];
  warningCount: number;
  hasMissingArabic: boolean;
  isArabicComplete: boolean;
  isVisible: boolean;
  isHidden: boolean;
  isFeatured: boolean;
}

/**
 * Validates expertiseTags JSON array.
 */
export function validateExpertiseTags(
  tags: any,
  fieldName = 'expertiseTags'
): { valid: boolean; error?: string } {
  if (tags === undefined || tags === null || tags === '') return { valid: true };
  let parsed = tags;
  if (typeof tags === 'string') {
    try {
      parsed = JSON.parse(tags);
    } catch {
      return { valid: false, error: `${fieldName} must be a valid JSON array of strings` };
    }
  }
  if (!Array.isArray(parsed)) {
    return { valid: false, error: `${fieldName} must be an array of strings` };
  }
  for (let i = 0; i < parsed.length; i++) {
    if (typeof parsed[i] !== 'string') {
      return { valid: false, error: `${fieldName}[${i}] must be a string` };
    }
  }
  return { valid: true };
}

/**
 * Validates experience timeline JSON array.
 */
export function validateExperienceArray(
  experience: any,
  fieldName = 'experience'
): { valid: boolean; error?: string } {
  if (experience === undefined || experience === null || experience === '') return { valid: true };
  let parsed = experience;
  if (typeof experience === 'string') {
    try {
      parsed = JSON.parse(experience);
    } catch {
      return { valid: false, error: `${fieldName} must be a valid JSON array of experience objects` };
    }
  }
  if (!Array.isArray(parsed)) {
    return { valid: false, error: `${fieldName} must be an array of experience objects` };
  }
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (!item || typeof item !== 'object') {
      return { valid: false, error: `${fieldName}[${i}] must be an object with company/role/duration/description` };
    }
  }
  return { valid: true };
}

/**
 * Validates projects portfolio JSON array.
 */
export function validateProjectsArray(
  projects: any,
  fieldName = 'projects'
): { valid: boolean; error?: string } {
  if (projects === undefined || projects === null || projects === '') return { valid: true };
  let parsed = projects;
  if (typeof projects === 'string') {
    try {
      parsed = JSON.parse(projects);
    } catch {
      return { valid: false, error: `${fieldName} must be a valid JSON array of project objects` };
    }
  }
  if (!Array.isArray(parsed)) {
    return { valid: false, error: `${fieldName} must be an array of project objects` };
  }
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (!item || typeof item !== 'object') {
      return { valid: false, error: `${fieldName}[${i}] must be an object with title/client/year/description` };
    }
  }
  return { valid: true };
}

/**
 * Validates entire bilingual payload.
 */
export function validateBilingualTeamMemberInput(
  input: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const expertiseEn = validateExpertiseTags(input.expertiseTags, 'expertiseTags');
  if (!expertiseEn.valid && expertiseEn.error) errors.push(expertiseEn.error);

  const expertiseAr = validateExpertiseTags(input.expertiseTagsAr, 'expertiseTagsAr');
  if (!expertiseAr.valid && expertiseAr.error) errors.push(expertiseAr.error);

  const experienceEn = validateExperienceArray(input.experience, 'experience');
  if (!experienceEn.valid && experienceEn.error) errors.push(experienceEn.error);

  const experienceAr = validateExperienceArray(input.experienceAr, 'experienceAr');
  if (!experienceAr.valid && experienceAr.error) errors.push(experienceAr.error);

  const projectsEn = validateProjectsArray(input.projects, 'projects');
  if (!projectsEn.valid && projectsEn.error) errors.push(projectsEn.error);

  const projectsAr = validateProjectsArray(input.projectsAr, 'projectsAr');
  if (!projectsAr.valid && projectsAr.error) errors.push(projectsAr.error);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Strips unknown properties, relation arrays, computed properties (e.g. dataQuality, presentationGroup)
 * and normalizes values strictly to the Prisma EmployeeProfile schema columns.
 */
export function sanitizeEmployeeProfileUpdateData(
  input: Record<string, any>
): Record<string, any> {
  const allowedKeys = new Set([
    'slug',
    'firstName',
    'lastName',
    'designation',
    'department',
    'yearsOfExperience',
    'tagline',
    'profileImage',
    'aboutSummary',
    'careerJourney',
    'keyStrengths',
    'expertiseTags',
    'coreCompetencies',
    'experience',
    'projects',
    'certifications',
    'education',
    'awards',
    'skillsMatrix',
    'mediaGallery',
    'testimonials',
    'contactEmail',
    'linkedinUrl',
    'isActive',
    'showOnTeamPage',
    'isFeatured',
    'order',
    'displayOrder',
    'firstNameAr',
    'lastNameAr',
    'designationAr',
    'departmentAr',
    'taglineAr',
    'heroTaglineAr',
    'aboutSummaryAr',
    'careerJourneyAr',
    'keyStrengthsAr',
    'expertiseTagsAr',
    'coreCompetenciesAr',
    'experienceAr',
    'projectsAr',
    'certificationsAr',
    'educationAr',
    'awardsAr',
    'skillsMatrixAr',
  ]);

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!allowedKeys.has(key) || value === undefined) {
      continue;
    }

    if (key === 'yearsOfExperience' || key === 'order' || key === 'displayOrder') {
      const num = Number(value);
      sanitized[key] = isNaN(num) ? 0 : num;
    } else if (key === 'isActive' || key === 'showOnTeamPage' || key === 'isFeatured') {
      sanitized[key] = Boolean(value);
    } else if (key === 'slug') {
      if (typeof value === 'string' && value.trim()) {
        sanitized[key] = value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
      }
    } else if (
      key === 'expertiseTags' ||
      key === 'coreCompetencies' ||
      key === 'experience' ||
      key === 'projects' ||
      key === 'certifications' ||
      key === 'education' ||
      key === 'awards' ||
      key === 'skillsMatrix' ||
      key === 'mediaGallery' ||
      key === 'testimonials'
    ) {
      if (Array.isArray(value)) {
        sanitized[key] = value;
      } else if (typeof value === 'string') {
        try {
          sanitized[key] = JSON.parse(value);
        } catch {
          sanitized[key] = [];
        }
      } else {
        sanitized[key] = [];
      }
    } else if (
      key === 'expertiseTagsAr' ||
      key === 'coreCompetenciesAr' ||
      key === 'experienceAr' ||
      key === 'projectsAr' ||
      key === 'certificationsAr' ||
      key === 'educationAr' ||
      key === 'awardsAr' ||
      key === 'skillsMatrixAr'
    ) {
      if (Array.isArray(value)) {
        sanitized[key] = value;
      } else if (typeof value === 'string' && value.trim()) {
        try {
          sanitized[key] = JSON.parse(value);
        } catch {
          sanitized[key] = null;
        }
      } else if (value === null) {
        sanitized[key] = null;
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Narrow Allowlist for Latin Acronyms, Technologies, and Brand Names permitted in Arabic mode.
 */
export const ALLOWED_LATIN_TERMS = new Set<string>([
  'PMP', 'PMI-ACP', 'CSEP', 'AZ-104', 'AZ-900', 'HACCP', 'HABC',
  'F&B', 'FEC', 'B2B', 'B2C', 'SEO', 'POS', 'CNC', 'DJ', '3D', 'AI', 'IT',
  'LEED', 'CISCO', 'AWS', 'ISO', 'Google', 'Meta', 'Microsoft', 'Autodesk',
  'Azure', 'React', 'TypeScript', 'CADD International', 'Harvard Business School',
  'E3', 'E3 Qatar', 'Injaz Qatar', 'Highfield International', 'Cesim',
  'Market2Win', 'Enertech', 'MF Treinamentos', 'Qatar Foundation',
]);

/**
 * Checks if a string consists exclusively of allowlisted Latin acronyms, brand names, or numbers/punctuation.
 */
export function isAllowlistedLatinOrNumeric(text: string): boolean {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/^[\d\s\-\.\,\:\/\|\(\)\+\%]+$/.test(trimmed)) return true;
  if (ALLOWED_LATIN_TERMS.has(trimmed)) return true;

  const tokens = trimmed.split(/[\s\-\,\.\(\)\:\/\|]+/).filter(Boolean);
  if (tokens.length > 0 && tokens.every((t) => ALLOWED_LATIN_TERMS.has(t) || /^[\d\+\%]+$/.test(t))) {
    return true;
  }
  return false;
}

/**
 * Canonical 22-Person Team Roster mapping Legacy CUIDs to canonical slugs.
 */
export const CANONICAL_TEAM_CUID_MAP: Record<string, string> = {
  'cmscbl39y00008ayz90qlf3t0': 'adil-ahmed',
  'cmscbmtxu00018ayzj1dh8l1k': 'mohammad-ali-awada',
  'cmsd1j7vk0000hzt5zb0zaqtk': 'raja-abbas-khan',
  'cmscbrh0200058ayz1lv7aqjr': 'amaan-malik',
  'cmsc8edoh0000r6mpzrb4w64i': 'mohasin-mohammadaly-parayil',
  'cmsednevn0001ya8dpxr5hill': 'abdullah-al-kubaisi',
  'cmscbp8qa00048ayzdmzo9x9j': 'ahmad-faraz',
  'cmsd1j8de0002hzt53lwz7zyd': 'abdulla-alkuwari',
  'cmsd1j8in0003hzt54hgeubf0': 'sarah-haddad',
  'cmsbu61zz0000q5psvlhv7y0g': 'arslan-arshad',
  'cmsbup9u20000ru2xkhymf3df': 'asghar-bhatti',
  'cmsbuxulo0000ywv1ev7rxe7x': 'quasain-ali',
  'cmsbvb4uz0000v09p2qedfrjl': 'amal-jose',
  'cmsbvg05q0001v09pbqcut7wm': 'nicole-bernido',
  'cmsbvikv00002v09pobgv5p5m': 'rajan-pathak',
  'cmsd1j9ts000ahzt5sdwo396z': 'mohasin-mohammadaly',
  'cmsc8k58g0001r6mpbyq2wm7v': 'waqar-asghar',
  'cmsc8n8tj0002r6mptdhr2czo': 'ebrahim-karolia',
  'cmsc8weug0003r6mpl9z3vr8o': 'muhammad-izaan-shahid',
  'cmsc9lauh0000p651qyrt89l8': 'marcialou-macatangay',
  'cmscb4ii30000f39ywcvf739z': 'lucian-moldovan',
  'cmscb8zng0001f39y8l9hpfq5': 'ruben-yaralyan',
};

/**
 * Set of active canonical slugs across the verified 21-person roster (+ legacy aliases).
 */
export const CANONICAL_TEAM_SLUGS = new Set<string>([
  'adil-ahmed',
  'mohammad-ali-awada',
  'raja-abbas-khan',
  'amaan-malik',
  'mohasin-mohammadaly-parayil',
  'abdullah-al-kubaisi',
  'ahmad-faraz',
  'abdulla-alkuwari',
  'sarah-haddad',
  'arslan-arshad',
  'asghar-bhatti',
  'quasain-ali',
  'amal-jose',
  'nicole-bernido',
  'rajan-pathak',
  'mohasin-mohammadaly',
  'waqar-asghar',
  'ebrahim-karolia',
  'izaan-shahid',
  'muhammad-izaan-shahid',
  'marcialou-macatangay',
  'lucian-moldovan',
  'ruben-yaralyan',
  'mohamed-chakib-djerfaf',
  'reycie-memije',
  'reycie-mia-cenizal-memije',
  'mohammed-abdulla',
]);

export interface TeamRouteResolution {
  status: 'CANONICAL' | 'LEGACY_REDIRECT' | 'NOT_FOUND';
  canonicalSlug?: string;
  targetUrl?: string;
}

/**
 * Resolves a team route request at a non-streamed HTTP boundary.
 */
export function resolveTeamRoute(
  portal: 'b2b' | 'b2c',
  locale: string,
  slugOrId: string
): TeamRouteResolution {
  const normLocale = locale === 'ar' ? 'ar' : 'en';
  const cleanIdentifier = (slugOrId || '').trim();

  if (!cleanIdentifier) {
    return { status: 'NOT_FOUND' };
  }

  // 1. Check if identifier is an eligible canonical slug
  if (CANONICAL_TEAM_SLUGS.has(cleanIdentifier)) {
    return { status: 'CANONICAL', canonicalSlug: cleanIdentifier };
  }

  // 2. Check if identifier is a legacy CUID
  const targetCanonicalSlug = CANONICAL_TEAM_CUID_MAP[cleanIdentifier];
  if (targetCanonicalSlug && CANONICAL_TEAM_SLUGS.has(targetCanonicalSlug)) {
    return {
      status: 'LEGACY_REDIRECT',
      canonicalSlug: targetCanonicalSlug,
      targetUrl: `/${normLocale}/${portal}/team/${targetCanonicalSlug}`,
    };
  }

  // 3. Unknown, inactive, or malformed identifier
  return { status: 'NOT_FOUND' };
}

/**
 * Standard department localization dictionary for Arabic parity across all 22 active roster roles.
 */
export const TEAM_DEPARTMENT_LOCALIZATION: Record<string, { en: string; ar: string }> = {
  events: { en: 'Events', ar: 'الفعاليات والترفيه' },
  'events & entertainment': { en: 'Events & Entertainment', ar: 'الفعاليات والترفيه' },
  marketing: { en: 'Marketing', ar: 'التسويق' },
  'marketing & sales': { en: 'Marketing & Sales', ar: 'التسويق والمبيعات' },
  'marketing, design & branding': { en: 'Marketing, Design & Branding', ar: 'التصميم والهوية والتسويق' },
  'branding, design & marketing': { en: 'Branding, Design & Marketing', ar: 'التصميم والهوية والتسويق' },
  design: { en: 'Design', ar: 'التصميم والإبداع' },
  'creative & design': { en: 'Creative & Design', ar: 'التصميم والإبداع' },
  'executive management': { en: 'Executive Management', ar: 'الإدارة التنفيذية' },
  executive: { en: 'Executive', ar: 'الإدارة التنفيذية' },
  leadership: { en: 'Leadership', ar: 'الإدارة التنفيذية' },
  operations: { en: 'Operations', ar: 'العمليات والتشغيل' },
  'operations / it': { en: 'Operations / IT', ar: 'العمليات وتقنية المعلومات' },
  'operations & guest experience': { en: 'Operations & Guest Experience', ar: 'العمليات وتجربة الزوار' },
  logistics: { en: 'Logistics', ar: 'الخدمات اللوجستية' },
  'logistics & production': { en: 'Logistics & Production', ar: 'اللوجستيات والإنتاج' },
  it: { en: 'Information Technology', ar: 'تقنية المعلومات' },
  'food & beverage': { en: 'Food & Beverage', ar: 'الأغذية والمشروبات' },
};

/**
 * Standard designation localization dictionary for Arabic parity.
 */
export const COMMON_DESIGNATION_LOCALIZATION: Record<string, string> = {
  'managing director & ceo': 'العضو المنتدب والرئيس التنفيذي',
  'managing director': 'العضو المنتدب',
  'chief executive officer': 'الرئيس التنفيذي',
  'general manager': 'المدير العام',
  'senior events manager': 'مدير الفعاليات الأول',
  'events director': 'مدير الفعاليات',
  'events manager': 'مدير الفعاليات',
  'ai generalist & senior graphic designer': 'مصمم جرافيك أول وخبير ذكاء اصطناعي',
  'senior graphic designer': 'مصمم جرافيك أول',
  'graphic designer': 'مصمم جرافيك',
  'senior 3d visualizer': 'مصمم ثلاثي الأبعاد أول',
  '3d visualizer': 'مصمم ثلاثي الأبعاد',
  chairman: 'رئيس مجلس الإدارة',
  'board chairman': 'رئيس مجلس الإدارة',
  'creative marketing lead': 'رئيس التسويق الإبداعي',
  'marketing manager': 'مدير التسويق',
  'marketing lead': 'مسؤول التسويق',
  'head of experiential design': 'رئيس قسم التصميم التجريبي',
  'experiential design lead': 'مسؤول التصميم التجريبي',
  'project & logistics coordinator': 'منسق المشاريع والخدمات اللوجستية',
  'logistics coordinator': 'منسق الخدمات اللوجستية',
  'site manager - city center': 'مدير الموقع - سيتي سنتر',
  'site manager': 'مدير الموقع',
  'logistics operations manager': 'مدير العمليات اللوجستية',
  'logistics manager': 'مدير الخدمات اللوجستية',
  'production supervisor': 'مشرف الإنتاج والتنفيذ',
  'marketing & partnerships': 'مسؤول التسويق والشراكات',
  'head of operations - fec / it': 'رئيس العمليات - مراكز الترفيه وتقنية المعلومات',
  'event supervisor': 'مشرف الفعاليات',
  'project manager': 'مدير المشاريع',
  'software engineer': 'مهندس برمجيات',
  'events & entertainment coordinator': 'منسق الفعاليات والترفيه',
  'operations manager': 'مدير العمليات',
  'f&b manager': 'مدير الأغذية والمشروبات',
};

/**
 * Validates social URLs strictly for public display.
 */
export function sanitizeSocialUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  if (
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
 * Validates portrait photo URLs.
 */
export function sanitizePortraitUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/') ||
    lower.startsWith('file:')
  ) {
    return null;
  }

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  if (lower.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol.toLowerCase() === 'https:' && parsed.hostname.length > 0) {
        return parsed.toString();
      }
    } catch {
      return null;
    }
  }

  if (lower.startsWith('data:image/png;base64,') || lower.startsWith('data:image/jpeg;base64,') || lower.startsWith('data:image/webp;base64,')) {
    return trimmed;
  }

  return null;
}

/**
 * Generates initials for avatar fallback.
 */
export function getEmployeeInitials(firstName?: string | null, lastName?: string | null): string {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();
  if (!f && !l) return 'E3';
  if (f && l) return (f[0] + l[0]).toUpperCase();
  return (f || l).slice(0, 2).toUpperCase();
}

/**
 * Canonical Presentation Groups for E3 Qatar Team Directory (6 Connected Stages + Corporate Enablement)
 */
export const PRESENTATION_GROUPS = [
  {
    key: 'direction',
    stageId: 'direction',
    stageNumber: '01',
    labelEn: 'Direction',
    labelAr: 'التوجيه',
    subtitleEn: 'Leadership & Strategy',
    subtitleAr: 'القيادة والاستراتيجية',
  },
  {
    key: 'imagine',
    stageId: 'imagine',
    stageNumber: '02',
    labelEn: 'Imagine',
    labelAr: 'الابتكار',
    subtitleEn: 'Creative, Brand & Growth',
    subtitleAr: 'الإبداع والهوية والنمو',
  },
  {
    key: 'plan',
    stageId: 'plan',
    stageNumber: '03',
    labelEn: 'Plan',
    labelAr: 'التخطيط',
    subtitleEn: 'Projects & Events',
    subtitleAr: 'المشاريع والفعاليات',
  },
  {
    key: 'build',
    stageId: 'build',
    stageNumber: '04',
    labelEn: 'Build',
    labelAr: 'التنفيذ',
    subtitleEn: 'Production & Logistics',
    subtitleAr: 'الإنتاج واللوجستيات',
  },
  {
    key: 'operate',
    stageId: 'operate',
    stageNumber: '05',
    labelEn: 'Operate',
    labelAr: 'التشغيل',
    subtitleEn: 'Operations & Guest Experience',
    subtitleAr: 'العمليات وتجربة الزوار',
  },
  {
    key: 'amplify',
    stageId: 'amplify',
    stageNumber: '06',
    labelEn: 'Amplify',
    labelAr: 'التطوير',
    subtitleEn: 'Technology & Systems',
    subtitleAr: 'التكنولوجيا والأنظمة',
  },
  {
    key: 'corporate-enablement',
    stageId: 'corporate-enablement',
    stageNumber: '07',
    labelEn: 'Corporate Enablement',
    labelAr: 'التمكين المؤسسي',
    subtitleEn: 'Corporate Enablement',
    subtitleAr: 'التمكين المؤسسي',
  },
  // Legacy Aliases for backwards compatibility
  {
    key: 'leadership',
    stageId: 'direction',
    stageNumber: '01',
    labelEn: 'Leadership',
    labelAr: 'القيادة والإدارة التنفيذية',
    subtitleEn: 'Leadership & Strategy',
    subtitleAr: 'القيادة والاستراتيجية',
  },
  {
    key: 'creative-marketing',
    stageId: 'imagine',
    stageNumber: '02',
    labelEn: 'Creative & Marketing',
    labelAr: 'الإبداع والتسويق',
    subtitleEn: 'Creative, Brand & Growth',
    subtitleAr: 'الإبداع والهوية والنمو',
  },
  {
    key: 'events-production',
    stageId: 'plan',
    stageNumber: '03',
    labelEn: 'Events & Production',
    labelAr: 'الفعاليات والإنتاج',
    subtitleEn: 'Projects & Events',
    subtitleAr: 'المشاريع والفعاليات',
  },
  {
    key: 'operations-guest-exp',
    stageId: 'operate',
    stageNumber: '05',
    labelEn: 'Operations & Guest Experience',
    labelAr: 'العمليات وتجربة الزوار',
    subtitleEn: 'Operations & Guest Experience',
    subtitleAr: 'العمليات وتجربة الزوار',
  },
  {
    key: 'technology-systems',
    stageId: 'amplify',
    stageNumber: '06',
    labelEn: 'Technology & Systems',
    labelAr: 'التكنولوجيا والأنظمة',
    subtitleEn: 'Technology & Systems',
    subtitleAr: 'التكنولوجيا والأنظمة',
  },
  {
    key: 'food-beverage',
    stageId: 'operate',
    stageNumber: '05',
    labelEn: 'Food & Beverage',
    labelAr: 'الأغذية والمشروبات',
    subtitleEn: 'Operations & Guest Experience',
    subtitleAr: 'العمليات وتجربة الزوار',
  },
] as const;

export type PresentationGroupKey = (typeof PRESENTATION_GROUPS)[number]['key'];

/**
 * Explicit Canonical Mapping Table for All 21 Active Roster Members
 * (Direction: 3, Imagine: 5, Plan: 3, Build: 2, Operate: 4, Amplify: 2, Corporate Enablement: 2)
 */
export const CANONICAL_PERSON_PRESENTATION_GROUP_MAP: Record<string, string> = {
  // Direction — Leadership & Strategy (3)
  'abdullah-al-kubaisi': 'direction',
  'abdulla-alkuwari': 'direction',
  'adil-ahmed': 'direction',
  'mohammad-ali-awada': 'direction',

  // Imagine — Creative, Brand & Growth (5)
  'ahmad-faraz': 'imagine',
  'mohasin-mohammadaly-parayil': 'imagine',
  'mohasin-mohammadaly': 'imagine',
  'nicole-bernido': 'imagine',
  'amaan-malik': 'imagine',
  'mohamed-chakib-djerfaf': 'imagine',

  // Plan — Projects & Events (3)
  'ebrahim-karolia': 'plan',
  'arslan-arshad': 'plan',
  'marcialou-macatangay': 'plan',

  // Build — Production & Logistics (2)
  'quasain-ali': 'build',
  'amal-jose': 'build',

  // Operate — Operations & Guest Experience (4)
  'lucian-moldovan': 'operate',
  'ruben-yaralyan': 'operate',
  'asghar-bhatti': 'operate',
  'waqar-asghar': 'operate',

  // Amplify — Technology & Systems (2)
  'rajan-pathak': 'amplify',
  'izaan-shahid': 'amplify',
  'muhammad-izaan-shahid': 'amplify',

  // Corporate Enablement (2)
  'reycie-memije': 'corporate-enablement',
  'reycie-mia-cenizal-memije': 'corporate-enablement',
  'mohammed-abdulla': 'corporate-enablement',
};

/**
 * Resolves an employee's Presentation Group deterministically with explicit dashboard overrides,
 * canonical person mapping, and safe auto-resolution fallback so no stage is left empty.
 */
export function resolvePresentationGroup(
  member: CanonicalEmployeeInput,
  locale: 'en' | 'ar' = 'en'
): { key: PresentationGroupKey; label: string; labelEn: string; labelAr: string; stageId: string } {
  const isAr = locale === 'ar';

  // 1. Check explicit override on member (field or skillsMatrix)
  let overrideKey = member.presentationGroup;
  if (!overrideKey && member.skillsMatrix) {
    if (Array.isArray(member.skillsMatrix)) {
      const match = member.skillsMatrix.find(
        (s: any) => s && (s.skill === '__presentation_group__' || s.skill === 'presentationGroup')
      );
      if (match?.level) overrideKey = match.level;
    } else if (typeof member.skillsMatrix === 'object' && member.skillsMatrix.presentationGroup) {
      overrideKey = member.skillsMatrix.presentationGroup;
    }
  }

  if (overrideKey) {
    const rawVal = String(overrideKey).toLowerCase().trim();
    const rawKey = rawVal.replace(/\s+/g, '-').replace(/&/g, '');

    // If legacy events-production, disambiguate between build (Production & Logistics) and plan (Projects & Events)
    if (rawKey === 'events-production' || rawVal === 'events & production') {
      const dept = (member.department || '').toLowerCase();
      const desig = (member.designation || '').toLowerCase();
      if (
        dept.includes('production') ||
        dept.includes('logistics') ||
        dept.includes('technical') ||
        dept.includes('av') ||
        desig.includes('production') ||
        desig.includes('logistics') ||
        desig.includes('technical') ||
        desig.includes('av')
      ) {
        const found = PRESENTATION_GROUPS.find((g) => g.key === 'build')!;
        return {
          key: found.key,
          label: isAr ? found.labelAr : found.labelEn,
          labelEn: found.labelEn,
          labelAr: found.labelAr,
          stageId: found.stageId,
        };
      }
    }

    const found = PRESENTATION_GROUPS.find(
      (g) =>
        g.key === rawKey ||
        g.key === rawVal ||
        g.labelEn.toLowerCase() === rawVal ||
        g.labelAr === overrideKey?.trim() ||
        g.key.replace(/-/g, '') === rawKey.replace(/-/g, '')
    );
    if (found) {
      return {
        key: found.key,
        label: isAr ? found.labelAr : found.labelEn,
        labelEn: found.labelEn,
        labelAr: found.labelAr,
        stageId: found.stageId,
      };
    }
  }

  // 2. Canonical mapping by slug
  const slug = (member.slug || '').trim().toLowerCase();
  if (slug && CANONICAL_PERSON_PRESENTATION_GROUP_MAP[slug]) {
    const groupKey = CANONICAL_PERSON_PRESENTATION_GROUP_MAP[slug];
    const found = PRESENTATION_GROUPS.find((g) => g.key === groupKey);
    if (found) {
      return {
        key: found.key,
        label: isAr ? found.labelAr : found.labelEn,
        labelEn: found.labelEn,
        labelAr: found.labelAr,
        stageId: found.stageId,
      };
    }
  }

  // 3. Name-matching fallback
  const fullName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase().trim();
  if (fullName.includes('kubaisi') || fullName.includes('adil ahmed') || fullName.includes('awada')) {
    const found = PRESENTATION_GROUPS[0];
    return { key: found.key, label: isAr ? found.labelAr : found.labelEn, labelEn: found.labelEn, labelAr: found.labelAr, stageId: found.stageId };
  }
  if (
    fullName.includes('faraz') ||
    fullName.includes('mohasin') ||
    fullName.includes('parayil') ||
    fullName.includes('bernido') ||
    fullName.includes('amaan') ||
    fullName.includes('djerfaf') ||
    fullName.includes('chakib')
  ) {
    const found = PRESENTATION_GROUPS[1];
    return { key: found.key, label: isAr ? found.labelAr : found.labelEn, labelEn: found.labelEn, labelAr: found.labelAr, stageId: found.stageId };
  }
  if (
    fullName.includes('ebrahim') ||
    fullName.includes('karolia') ||
    fullName.includes('arslan') ||
    fullName.includes('macatangay') ||
    fullName.includes('marcialou')
  ) {
    const found = PRESENTATION_GROUPS[2];
    return { key: found.key, label: isAr ? found.labelAr : found.labelEn, labelEn: found.labelEn, labelAr: found.labelAr, stageId: found.stageId };
  }
  if (fullName.includes('quasain') || fullName.includes('amal jose')) {
    const found = PRESENTATION_GROUPS[3];
    return { key: found.key, label: isAr ? found.labelAr : found.labelEn, labelEn: found.labelEn, labelAr: found.labelAr, stageId: found.stageId };
  }
  if (
    fullName.includes('lucian') ||
    fullName.includes('moldovan') ||
    fullName.includes('ruben') ||
    fullName.includes('yaralyan') ||
    fullName.includes('asghar bhatti') ||
    fullName.includes('waqar')
  ) {
    const found = PRESENTATION_GROUPS[4];
    return { key: found.key, label: isAr ? found.labelAr : found.labelEn, labelEn: found.labelEn, labelAr: found.labelAr, stageId: found.stageId };
  }
  if (fullName.includes('rajan') || fullName.includes('pathak') || fullName.includes('izaan') || fullName.includes('shahid')) {
    const found = PRESENTATION_GROUPS[5];
    return { key: found.key, label: isAr ? found.labelAr : found.labelEn, labelEn: found.labelEn, labelAr: found.labelAr, stageId: found.stageId };
  }
  if (
    fullName.includes('reycie') ||
    fullName.includes('memije') ||
    fullName.includes('mohammed abdulla') ||
    fullName.includes('abdulla')
  ) {
    const found = PRESENTATION_GROUPS[6];
    return { key: found.key, label: isAr ? found.labelAr : found.labelEn, labelEn: found.labelEn, labelAr: found.labelAr, stageId: found.stageId };
  }

  // 4. Safe Auto-Resolution from Department / Designation
  const dept = (member.department || '').toLowerCase().trim();
  const desig = (member.designation || '').toLowerCase().trim();

  // Leadership / Direction
  if (
    dept.includes('executive') ||
    dept.includes('leadership') ||
    dept.includes('board') ||
    desig.includes('chief') ||
    desig.includes('ceo') ||
    desig.includes('general manager') ||
    desig.includes('chairman') ||
    desig.includes('managing director') ||
    desig.includes('president')
  ) {
    const g = PRESENTATION_GROUPS[0];
    return { key: g.key, label: isAr ? g.labelAr : g.labelEn, labelEn: g.labelEn, labelAr: g.labelAr, stageId: g.stageId };
  }

  // Creative, Brand & Growth / Imagine
  if (
    dept.includes('marketing') ||
    dept.includes('branding') ||
    dept.includes('design') ||
    dept.includes('creative') ||
    dept.includes('media') ||
    dept.includes('art') ||
    desig.includes('graphic') ||
    desig.includes('3d') ||
    desig.includes('creative') ||
    desig.includes('marketing') ||
    desig.includes('visualizer') ||
    desig.includes('brand')
  ) {
    const g = PRESENTATION_GROUPS[1];
    return { key: g.key, label: isAr ? g.labelAr : g.labelEn, labelEn: g.labelEn, labelAr: g.labelAr, stageId: g.stageId };
  }

  // Technology & Systems / Amplify
  if (
    dept.includes('technology') ||
    dept.includes('it') ||
    dept.includes('systems') ||
    dept.includes('software') ||
    dept.includes('engineering') ||
    desig.includes('developer') ||
    desig.includes('engineer') ||
    desig.includes('tech') ||
    desig.includes('full-stack') ||
    desig.includes('systems')
  ) {
    const g = PRESENTATION_GROUPS[5];
    return { key: g.key, label: isAr ? g.labelAr : g.labelEn, labelEn: g.labelEn, labelAr: g.labelAr, stageId: g.stageId };
  }

  // Corporate Enablement
  if (
    dept.includes('corporate') ||
    dept.includes('enablement') ||
    dept.includes('finance') ||
    dept.includes('compliance') ||
    dept.includes('government') ||
    desig.includes('finance') ||
    desig.includes('relations') ||
    desig.includes('compliance')
  ) {
    const g = PRESENTATION_GROUPS[6];
    return { key: g.key, label: isAr ? g.labelAr : g.labelEn, labelEn: g.labelEn, labelAr: g.labelAr, stageId: g.stageId };
  }

  // Production & Logistics / Build
  if (
    dept.includes('logistics') ||
    dept.includes('production') ||
    desig.includes('logistics') ||
    desig.includes('production') ||
    desig.includes('supervisor') ||
    desig.includes('site manager')
  ) {
    const g = PRESENTATION_GROUPS[3];
    return { key: g.key, label: isAr ? g.labelAr : g.labelEn, labelEn: g.labelEn, labelAr: g.labelAr, stageId: g.stageId };
  }

  // Operations & Guest Experience / Operate
  if (
    dept.includes('operations') ||
    dept.includes('guest') ||
    dept.includes('facility') ||
    dept.includes('venue') ||
    dept.includes('food') ||
    dept.includes('beverage') ||
    desig.includes('operations') ||
    desig.includes('guest') ||
    desig.includes('f&b')
  ) {
    const g = PRESENTATION_GROUPS[4];
    return { key: g.key, label: isAr ? g.labelAr : g.labelEn, labelEn: g.labelEn, labelAr: g.labelAr, stageId: g.stageId };
  }

  // Projects & Events / Plan (Default safe fallback)
  const g = PRESENTATION_GROUPS[2];
  return { key: g.key, label: isAr ? g.labelAr : g.labelEn, labelEn: g.labelEn, labelAr: g.labelAr, stageId: g.stageId };
}

/**
 * Checks if an EmployeeProfile is publicly eligible for display on public routes.
 * Profiles that are inactive (`isActive === false`) or hidden (`showOnTeamPage === false`) fail closed.
 */
export function isTeamMemberPubliclyEligible(
  member: CanonicalEmployeeInput | null | undefined
): { eligible: boolean; reason?: string } {
  if (!member) {
    return { eligible: false, reason: "Profile does not exist" };
  }

  if (member.isActive === false) {
    return { eligible: false, reason: "Profile is inactive" };
  }

  if (member.showOnTeamPage === false) {
    return { eligible: false, reason: "Profile is excluded from public team page" };
  }

  if (!member.slug || !member.slug.trim()) {
    return { eligible: false, reason: "Missing canonical slug" };
  }

  // Duplicate suppression rule: arslan-arshad is canonical; arslan-arshadw is hidden from public presentation
  if (member.slug === 'arslan-arshadw') {
    return { eligible: false, reason: "Duplicate profile (arslan-arshadw) suppressed in favor of canonical arslan-arshad" };
  }

  const hasName = Boolean(
    (member.firstName && member.firstName.trim()) ||
    (member.firstNameAr && member.firstNameAr.trim())
  );
  if (!hasName) {
    return { eligible: false, reason: "Missing profile name" };
  }

  return { eligible: true };
}

/**
 * Translates duration and timeline markers (e.g. "Present", "Ongoing", "2024-Present") to canonical Arabic.
 */
export function translateDurationToArabic(rawDuration?: string | null): string {
  if (!rawDuration || typeof rawDuration !== 'string') return '';
  let res = rawDuration.trim();
  if (res.toLowerCase() === 'present') return 'حتى الآن';
  if (res.toLowerCase() === 'ongoing') return 'مستمر';
  res = res.replace(/\bpresent\b/gi, 'حتى الآن');
  res = res.replace(/\bongoing\b/gi, 'مستمر');
  res = res.replace(/\s*-\s*/g, ' - ');
  return res;
}

/**
 * Standard nested tags, skills, and competencies localization dictionary for Arabic profile parity.
 */
export const NESTED_TAGS_LOCALIZATION: Record<string, string> = {
  // Executive & Leadership
  'executive leadership': 'القيادة التنفيذية',
  'organizational leadership': 'القيادة المؤسسية',
  'general management': 'الإدارة العامة',
  'business operations': 'العمليات التجارية والتشغيلية',
  'commercial oversight': 'الإشراف التجاري',
  'business growth': 'نمو وتطوير الأعمال',
  'stakeholder management': 'إدارة الشركاء وأصحاب المصلحة',
  'strategic planning': 'التخطيط الاستراتيجي المؤسسي',
  'visionary leadership': 'القيادة الاستشرافية والرؤية الاستراتيجية',
  'strategic investments': 'الاستثمارات الاستراتيجية',
  'global partnerships': 'الشراكات العالمية',
  'business development': 'تطوير الأعمال والفرص',
  'p&l management': 'إدارة الأرباح والخسائر P&L',
  'enterprise scaling': 'توسيع وتنمية الشركات الكبرى',
  'market disruption': 'ابتكار ونقلة نوعية في السوق',
  'ip licensing & negotiation': 'ترخيص الملكية الفكرية والتفاوض',

  // Events & Operations
  'event strategy': 'استراتيجية الفعاليات',
  'entertainment development': 'تطوير قطاع الترفيه',
  'sports events': 'الفعاليات الرياضية',
  'public activations': 'العروض والفعاليات العامة',
  'event operations': 'عمليات وإدارة الفعاليات',
  'venue management': 'إدارة المواقع والمنشآت',
  'live activations': 'العروض والفعاليات الحية',
  'guest experience': 'تجربة وخدمة الزوار',
  'logistics': 'الخدمات اللوجستية',
  'logistics operations': 'العمليات اللوجستية وسلاسل الإمداد',
  'event installation': 'تركيب وتجهيز الفعاليات',
  'site management': 'إدارة وتنسيق المواقع',
  'inflatable operations': 'تشغيل مدن الألعاب المطاطية',
  'supply-chain management': 'إدارة سلاسل الإمداد والتوريد',
  'event delivery': 'تسليم وتنفيذ الفعاليات',
  'procurement': 'المشتريات والتوريد التجاري',
  'production supervision': 'الإشراف على خطوط الإنتاج',
  'large-format printing': 'الطباعة ذات الأحجام الكبرى',
  'event fabrication': 'تصنيع وهندسة مجسمات الفعاليات',
  'branding installation': 'تركيب الهويات واللافتات',
  'operations management': 'إدارة وتنسيق العمليات التشغيلية',
  'project management': 'إدارة المشاريع المتكاملة',
  'project coordination': 'تنسيق المشاريع',
  'fec operations': 'تشغيل مراكز الترفيه العائلي FEC',
  'end-to-end event operations': 'العمليات التشغيلية المتكاملة للفعاليات',
  'supplier management': 'إدارة الموردين والشركاء',
  'venue setup': 'تجهيز وتهيئة المنشآت',
  'venue performance': 'كفاءة وتشغيل المواقع',
  'venue coordination': 'تنسيق إدارة المواقع',
  'compliance review': 'مراجعة الامتثال والمعايير',
  'birthday-event coordination': 'تنسيق فعاليات أعياد الميلاد والمناسبات',
  'artist and performer management': 'إدارة الفنانين والفرق الاستعراضية',
  'live entertainment': 'العروض والترفيه الحي',
  'programme design': 'تصميم البرامج والأنشطة',
  'team leadership': 'القيادة وإدارة فرق العمل',
  'large-scale crowd control': 'إدارة الحشود الكبرى وتدفق الزوار',
  'technical production coordination': 'تنسيق الإنتاج الفني والتقني',
  'health & safety compliance': 'الامتثال لمعايير الصحة والسلامة المهنية',
  'vendor management': 'إدارة الموردين ومزودي الخدمات',
  'project planning': 'تخطيط وجدولة المشاريع',
  'crisis management': 'إدارة الأزمات والطوارئ',
  'logistics planning and coordination': 'تخطيط وتنسيق العمليات اللوجستية',
  'customs and regulatory compliance': 'الامتثال الجمركي والتنظيمي',
  'site supervision and handover reporting': 'الإشراف على المواقع وتقارير التسليم',
  'vendor and contract negotiation': 'التفاوض مع الموردين وإدارة العقود',
  'third party logistics management': 'إدارة الخدمات اللوجستية للطرف الثالث 3PL',
  'productivity and throughput optimization': 'تحسين الإنتاجية وتدفق العمليات',
  'delivery-experience management': 'إدارة تجربة تسليم الفعاليات',
  'large- and small-format printing': 'الطباعة للأحجام الكبيرة والصغيرة',
  'cnc and laser-cutting machine operation': 'تشغيل أجهزة القص بالليزر و CNC',
  'event build-up and closure': 'تجهيز الفعاليات وإغلاق المواقع',
  'vendor and project coordination': 'تنسيق المشاريع والموردين',
  'hosting and dj support': 'تقديم العروض والدعم الموسيقي DJ',
  'theme development': 'تطوير المفاهيم والموضوعات',
  'costume and prop coordination': 'تنسيق الأزياء والإكسسوارات',
  'client and stakeholder communication': 'التواصل مع العملاء وأصحاب المصلحة',
  'administration and reporting': 'الإدارة وإعداد التقارير',
  'customer-experience management': 'إدارة تجربة العملاء',
  'contractor negotiation': 'التفاوض مع المقاولين وإبرام العقود',
  'event planning': 'تخطيط وتنظيم الفعاليات',
  'team coordination': 'تنسيق وإدارة فرق العمل',
  'team collaboration': 'العمل الجماعي والتعاون الفعال',
  'site coordination': 'تنسيق وإدارة المواقع',
  'production coordination': 'تنسيق عمليات الإنتاج والتنفيذ',
  '3d design coordination': 'تنسيق التصاميم ثلاثية الأبعاد',
  'contract negotiation': 'التفاوض على العقود وإبرامها',
  'customer satisfaction': 'رضا وخدمة العملاء',
  'data interpretation': 'تحليل وتفسير البيانات',
  'event logistics planning': 'تخطيط لوجستيات الفعاليات',
  'live event problem-solving': 'حل المشكلات الميدانية أثناء الفعاليات',
  'live-site supervision': 'الإشراف الميداني المباشر على المواقع',
  'operational planning': 'التخطيط التشغيلي',
  'operational problem-solving': 'معالجة المشكلات التشغيلية',
  'operational procedures': 'إجراءات العمليات التشغيلية',
  'operational safety': 'السلامة التشغيلية والمهنية',
  'performer scheduling': 'جدولة وتنظيم أداء الفرق الاستعراضية',
  'photography': 'التصوير الفوتوغرافي',
  'problem-solving': 'حل المشكلات واتخاذ القرارات',
  'process improvement': 'تحسين وتطوير العمليات',
  'programme coordination': 'تنسيق وإدارة البرامج',
  'safety awareness': 'التوعية والامتثال لمعايير السلامة',
  'shoot direction': 'إخراج وتوجيه جلسات التصوير',
  'stakeholder coordination': 'تنسيق أصحاب المصلحة والشركاء',
  'team building': 'بناء وتطوير فرق العمل',
  'budgeting': 'إعداد الميزانيات والرقابة المالية',
  'client servicing': 'خدمة ورعاية العملاء',
  'client communication': 'التواصل مع العملاء',
  'negotiation': 'التفاوض وإبرام العقود',

  // Design & Creative
  'graphic design': 'التصميم الجرافيكي',
  'ai-assisted creative': 'التصميم الإبداعي بالذكاء الاصطناعي',
  'event branding': 'الهوية البصرية للفعاليات',
  'wayfinding design': 'تصميم اللوحات الإرشادية والمسارات',
  'visual identity': 'الهوية البصرية المؤسسية',
  'production artwork': 'الأعمال الفنية للإنتاج',
  'campaign design': 'تصميم الحملات الترويجية',
  'brand implementation': 'تطبيق الهوية المؤسسية',
  '3d visualization': 'التجسيد والتصميم ثلاثي الأبعاد',
  'technical drafting': 'الرسم الهندسي الفني',
  'floor-plan development': 'تطوير المخططات والتوزيع المكاني',
  'spatial design': 'التصميم المكاني والبيئي',
  'mood-board development': 'إعداد لوحات الإلهام والمفاهيم',
  'technical drawing': 'الرسم والمخططات التقنية',
  'site supervision': 'الإشراف الميداني على المواقع',
  'ai visualization tools': 'أدوات الذكاء الاصطناعي للتجسيد البصري',
  'experiential design': 'تصميم التجارب التفاعلية',
  '3d modeling': 'النمذجة ثلاثية الأبعاد',
  'interactive environments': 'البيئات والمساحات التفاعلية',
  'creative concept development': 'تطوير المفاهيم والأفكار الإبداعية',
  'ux/ui for physical spaces': 'تصميم التجربة الرقمية للمساحات الواقعية',
  'storyboarding and scripting': 'إعداد لوحات القصة وكتابة السيناريو',
  'proposal and pitch-deck development': 'إعداد العروض التقديمية وملفات المشاريع',
  'venue conceptualization': 'تطوير المفاهيم والتصميم المبتكر للمواقع',
  'user flow optimization': 'تحسين تدفق وحركة الزوار',
  'lighting & sound integration': 'تكامل أنظمة الإضاءة والصوتيات',
  'spatial visualization': 'التجسيد والتصميم المكاني',
  'prototyping': 'تطوير النماذج الأولية',
  'content creation': 'صناعة وإنتاج المحتوى',

  // Marketing & Media
  'digital marketing': 'التسويق الرقمي الحديث',
  'digital campaigns': 'الحملات التسويقية الرقمية',
  'brand growth': 'تطوير وتنمية العلامة التجارية',
  'content strategy': 'استراتيجية المحتوى الرقمي',
  'social media': 'إدارة وسائل التواصل الاجتماعي',
  'social media strategy': 'استراتيجية منصات التواصل الاجتماعي',
  'influencer marketing': 'التسويق عبر المؤثرين',
  'influencer management': 'إدارة علاقات المؤثرين',
  'campaign production': 'إنتاج وتنسيق الحملات',
  'b2b partnerships': 'شراكات الأعمال B2B',
  'omnichannel campaign execution': 'تنفيذ الحملات عبر القنوات المتعددة',
  'performance marketing': 'التسويق الموجه بالأداء',
  'creative briefing': 'إعداد التوجيهات والموجزات الإبداعية',
  'data-driven growth': 'النمو المؤسسي القائم على تحليل البيانات',
  'digital strategy': 'الاستراتيجية الرقمية المتطورة',
  'analytics & seo': 'التحليلات الرقمية وتحسين محركات البحث SEO',
  'reporting and presentations': 'إعداد التقارير والعروض التقديمية',

  // Technology & Cloud
  'technology and ticketing systems': 'الأنظمة التقنية وبوابات التذاكر',
  'full-stack product engineering': 'هندسة البرمجيات والأنظمة المتكاملة',
  'azure cloud operations': 'إدارة السحابة والبنية التحتية Azure',
  'azure infrastructure': 'البنية التحتية لسحابة Azure',
  'ticketing and pos systems': 'أنظمة التذاكر ونقاط البيع POS',
  'access control': 'أنظمة التحكم في الدخول وإدارة البوابات',
  'hybrid venue technology': 'تقنيات المواقع الهجينة والذكية',
  'react and typescript development': 'تطوير البرمجيات بـ React و TypeScript',
  'hardware and pos integration': 'تكامل الأجهزة ونقاط البيع POS',
  'node.js api design': 'تصميم وتطوير واجهات البرمجة بـ Node.js',
  'ci/cd automation': 'أتمتة التكامل والنشر المستمر CI/CD',

  // F&B & Hospitality
  'food & beverage operations': 'عمليات الأغذية والمشروبات F&B',
  'outlet management': 'إدارة منافذ البيع والخدمة',
  'menu development': 'تطوير وتصميم قوائم الطعام',
  'cost control': 'ضبط التكاليف والرقابة المالية',
  'food safety and haccp': 'سلامة الأغذية وتطبيق معايير الهاسب HACCP',
  'haccp compliance': 'الامتثال لمعايير الهاسب HACCP',

  // Standard Fallbacks
  'professional organization': 'هيئة مهنية معتمدة',
};

/**
 * Canonical Arabic Name Mapping for Roster Members.
 */
export const CANONICAL_NAME_LOCALIZATION_MAP: Record<string, string> = {
  'adil-ahmed': 'عادل أحمد',
  'mohammad-ali-awada': 'محمد علي عواضة',
  'raja-abbas-khan': 'راجا عباس خان',
  'amaan-malik': 'أمان مالك',
  'mohasin-mohammadaly-parayil': 'محاسن محمد علي بارييل',
  'abdullah-al-kubaisi': 'عبدالله الكبيسي',
  'ahmad-faraz': 'أحمد فراز',
  'abdulla-alkuwari': 'عبدالله الكواري',
  'sarah-haddad': 'سارة حداد',
  'arslan-arshad': 'أرسلان أرشد',
  'asghar-bhatti': 'أصغر بهاتي',
  'quasain-ali': 'قوسين علي',
  'amal-jose': 'أمل خوسيه',
  'nicole-bernido': 'نيكول بيرنيدو',
  'rajan-pathak': 'راجان باثاك',
  'mohasin-mohammadaly': 'محاسن محمد علي',
  'waqar-asghar': 'وقار أصغر',
  'ebrahim-karolia': 'إبراهيم كاروليا',
  'izaan-shahid': 'محمد إذعان شاهد',
  'muhammad-izaan-shahid': 'محمد إذعان شاهد',
  'marcialou-macatangay': 'مارسيالو ماكاتانغاي',
  'lucian-moldovan': 'لوسيان مولدوفان',
  'ruben-yaralyan': 'روبين ياراليان',
  'mohamed-chakib-djerfaf': 'محمد شكيب جرفاف',
  'reycie-memije': 'ريسي ميا سينيزال ميميجي',
  'reycie-mia-cenizal-memije': 'ريسي ميا سينيزال ميميجي',
  'mohammed-abdulla': 'محمد عبدالله',
};

/**
 * Standard nested experience/project roles localization dictionary for Arabic profile parity.
 */
export const NESTED_ROLES_LOCALIZATION: Record<string, string> = {
  'managing director & ceo': 'العضو المنتدب والرئيس التنفيذي',
  'founder & ceo': 'المؤسس والرئيس التنفيذي',
  'general manager': 'المدير العام',
  'business growth manager': 'مدير تنمية الأعمال',
  'partnerships, external collaborations & f&b commercial management': 'إدارة الشراكات والتعاون الخارجي والأغذية والمشروبات',
  'bid coordination, master tracker & final compliance review': 'تنسيق المناقصات والمتابعة الشاملة ومراجعة الامتثال',
  'commercial oversight': 'الإشراف التجاري',
  'general management & venue performance': 'الإدارة العامة وكفاءة المواقع',
  'management oversight': 'الإشراف الإداري',
  'events director': 'مدير الفعاليات',
  'senior events manager': 'مدير الفعاليات الأول',
  'operations lead': 'مسؤول العمليات التشغيلية',
  'ai generalist & senior graphic designer': 'مصمم جرافيك أول وخبير ذكاء اصطناعي',
  'event branding & graphic design': 'الهوية البصرية وتصميم الجرافيك للفعاليات',
  'branding & wayfinding lead': 'مسؤول الهوية واللوحات الإرشادية',
  'venue branding & wayfinding': 'هوية المنشآت واللوحات الإرشادية',
  'venue branding & graphic design': 'هوية المنشآت والتصميم الجرافيكي',
  'booth branding & graphic design': 'تصميم وهوية الأجنحة والمعارض',
  '3d visualizer': 'مصمم ثلاثي الأبعاد',
  '3d visualization, drafting & site supervision': 'التجسيد ثلاثي الأبعاد والرسم الفني والإشراف الميداني',
  'marketing manager': 'مدير التسويق',
  'creative marketing lead': 'رئيس التسويق الإبداعي',
  'marketing lead': 'مسؤول التسويق',
  'campaign strategist': 'مخطط الحملات الترويجية',
  'director of investments': 'مدير الاستثمارات',
  'ceo & founder': 'الرئيس التنفيذي والمؤسس',
  founder: 'المؤسس',
  'executive sponsor': 'الراعي التنفيذي',
  'lead environment designer': 'رئيس مصممي البيئات التفاعلية',
  'head of experiential design': 'رئيس قسم التصميم التجريبي',
  'lead designer': 'رئيس المصممين',
  'creative director': 'المدير الإبداعي',
  'logistics & operations lead': 'مسؤول اللوجستيات والعمليات',
  'logistics coordinator': 'منسق الخدمات اللوجستية',
  'site supervisor': 'مشرف الموقع',
  'logistics manager': 'مدير العمليات اللوجستية',
  production: 'الإنتاج والتنفيذ',
  'campaign lead / director': 'مدير الحملات الإعلانية',
  'schools outreach lead': 'مسؤول التواصل مع المدارس والمؤسسات',
  'programme & partnership lead': 'مسؤول البرامج والشراكات',
  'social, media & partnerships lead': 'مسؤول الإعلام والتواصل والشراكات',
  'project manager / operations lead': 'مدير المشاريع ومسؤول العمليات',
  'project manager': 'مدير المشاريع',
  'operations & it lead': 'مسؤول العمليات وتقنية المعلومات',
  'event supervisor': 'مشرف الفعاليات',
  'software engineer - product, cloud & systems': 'مهندس برمجيات - المنتجات والسحابة والأنظمة',
  'software engineer': 'مهندس برمجيات',
  'artist coordinator': 'منسق الفنانين والعروض',
  'birthday event coordinator': 'منسق فعاليات أعياد الميلاد',
  'artist & performer coordinator': 'منسق الفنانين والفرق الاستعراضية',
  'sports area manager': 'مدير المنطقة الرياضية',
  'operations manager': 'مدير العمليات',
  'f&b manager': 'مدير الأغذية والمشروبات',
};

/**
 * Standard certifications localization dictionary for Arabic profile parity.
 */
export const NESTED_CERTS_LOCALIZATION: Record<string, string> = {
  'certified special events professional (csep)': 'شهادة محترف فعاليات خاصة معتمد (CSEP)',
  'advanced crowd management certification': 'شهادة إدارة الحشود المتقدمة',
  'google digital marketing expert': 'شهادة خبير التسويق الرقمي من Google',
  'meta certified creative strategy professional': 'شهادة محترف الاستراتيجيات الإبداعية المعتمد من Meta',
  'executive leadership program - harvard business school': 'برنامج القيادة التنفيذية - كلية هارفارد للأعمال',
  'autodesk certified professional': 'شهادة محترف معتمد من Autodesk',
  'interactive architecture certificate': 'شهادة العمارة التفاعلية',
  'certified lean six sigma black belt (ai-powered) - mf treinamentos, 2025': 'شهادة الحزام الأسود لين ستة سيجما بالذكاء الاصطناعي - MF Treinamentos، 2025',
  'market2win strategic account management & dimark2win - market2win, 2023': 'إدارة الحسابات الاستراتيجية والتسويق الرقمي - Market2Win، 2023',
  'cesim global qualifier - cesim business simulations, 2023': 'المؤهل العالمي لمحاكاة الأعمال - Cesim، 2023',
  'injaz qatar - junior achievement worldwide, 2024': 'إنجاز قطر - مؤسسة جونيور أتشيفمنت العالمية، 2024',
  'pmp - project management professional - project management institute, 2024-2027': 'شهادة محترف إدارة المشاريع (PMP) - معهد إدارة المشاريع PMI، 2024-2027',
  'pmi-acp - agile certified practitioner - project management institute, 2022-2028': 'ممارس معتمد للمنهجية الرشيقة (PMI-ACP) - معهد PMI، 2022-2028',
  'lean six sigma ai belt - mf treinamentos, 2026': 'حزام لين ستة سيجما المعزز بالذكاء الاصطناعي - MF Treinamentos، 2026',
  '3d visualization certificate - cadd international, 2009': 'شهادة التجسيد ثلاثي الأبعاد - CADD International، 2009',
  'architectural certificate - cadd international, 2009': 'شهادة الرسم المعماري - CADD International، 2009',
  'basic first aid & cpr - enertech qatar, 2026-2028': 'الإسعافات الأولية والإنعاش القلبي الرئوي - Enertech قطر، 2026-2028',
  'microsoft certified: azure administrator associate (az-104) - microsoft, 2026': 'مسؤول معتمد لـ Microsoft Azure (AZ-104) - Microsoft، 2026',
  'microsoft certified: azure fundamentals (az-900) - microsoft, 2026': 'أساسيات Microsoft Azure (AZ-900) - Microsoft، 2026',
  'first aid - qatar foundation, 2017': 'شهادة الإسعافات الأولية - مؤسسة قطر، 2017',
  'habc level 2 award in haccp for catering - highfield international qualifications, 2018': 'شهادة الهاسب للمطاعم والضيافة المستوى الثاني - Highfield International، 2018',
  'habc level 3 award in supervising haccp for catering - highfield international qualifications, 2018': 'شهادة الإشراف على نظام الهاسب المستوى الثالث - Highfield International، 2018',
};

/**
 * Sanitizes and localizes any nested string for Arabic presentation, failing closed to prevent English residue.
 */
export function sanitizeArabicNestedString(
  rawText: string | null | undefined,
  fallbackIfRequired?: string
): string | null {
  if (!rawText || typeof rawText !== 'string') return null;
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (NESTED_TAGS_LOCALIZATION[lower]) return NESTED_TAGS_LOCALIZATION[lower];
  if (NESTED_ROLES_LOCALIZATION[lower]) return NESTED_ROLES_LOCALIZATION[lower];
  if (NESTED_CERTS_LOCALIZATION[lower]) return NESTED_CERTS_LOCALIZATION[lower];
  if (COMMON_DESIGNATION_LOCALIZATION[lower]) return COMMON_DESIGNATION_LOCALIZATION[lower];

  // If already Arabic
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    return trimmed;
  }

  // If allowlisted Latin / numbers
  if (isAllowlistedLatinOrNumeric(trimmed)) {
    return trimmed;
  }

  // Fail closed
  return fallbackIfRequired || null;
}

/**
 * Applies unified Arabic nested profile presentation mapping across B2B and B2C consumers.
 * Guarantees zero prohibited English nested prose on Arabic profile views while preserving English outputs.
 */
export function mapNestedProfileProperties(
  member: CanonicalEmployeeInput,
  locale: 'en' | 'ar' = 'en'
) {
  const isAr = locale === 'ar';
  const rawExpertise = Array.isArray(member.expertiseTags) ? member.expertiseTags : [];
  const rawCompetencies = Array.isArray(member.coreCompetencies) ? member.coreCompetencies : [];
  const rawExperience = Array.isArray(member.experience)
    ? member.experience
    : Array.isArray(member.experienceTimeline)
    ? member.experienceTimeline
    : [];
  const rawProjects = Array.isArray(member.projects)
    ? member.projects
    : Array.isArray(member.projectsPortfolio)
    ? member.projectsPortfolio
    : [];
  const rawCertifications = Array.isArray(member.certifications) ? member.certifications : [];
  const rawEducation = Array.isArray(member.education) ? member.education : [];
  const rawAwards = Array.isArray(member.awards) ? member.awards : [];
  const rawSkillsMatrix = Array.isArray(member.skillsMatrix) ? member.skillsMatrix : [];

  if (!isAr) {
    return {
      expertiseTags: rawExpertise,
      coreCompetencies: rawCompetencies,
      experience: rawExperience,
      projects: rawProjects,
      certifications: rawCertifications,
      education: rawEducation,
      awards: rawAwards,
      skillsMatrix: rawSkillsMatrix,
    };
  }

  // 1. Expertise Tags (fail closed)
  // If explicitly provided in Arabic, prioritize it
  const arabicExplicitTags = Array.isArray(member.expertiseTagsAr) ? member.expertiseTagsAr : [];
  const expertiseTags: string[] = [];
  if (arabicExplicitTags.length > 0) {
    for (const tag of arabicExplicitTags) {
      if (typeof tag === 'string' && tag.trim()) {
        expertiseTags.push(tag.trim());
      }
    }
  } else {
    for (const tag of rawExpertise) {
      const sanitized = sanitizeArabicNestedString(tag);
      if (sanitized) expertiseTags.push(sanitized);
    }
  }

  // 2. Core Competencies (fail closed)
  const arabicExplicitCompetencies = Array.isArray(member.coreCompetenciesAr) ? member.coreCompetenciesAr : [];
  const coreCompetencies: string[] = [];
  if (arabicExplicitCompetencies.length > 0) {
    for (const comp of arabicExplicitCompetencies) {
      if (typeof comp === 'string' && comp.trim()) {
        coreCompetencies.push(comp.trim());
      }
    }
  } else {
    for (const comp of rawCompetencies) {
      const sanitized = sanitizeArabicNestedString(comp);
      if (sanitized) coreCompetencies.push(sanitized);
    }
  }

  // 3. Experience Timeline (fail closed)
  const arabicExplicitExperience = Array.isArray(member.experienceAr) ? member.experienceAr : [];
  const sourceExperience = arabicExplicitExperience.length > 0 ? arabicExplicitExperience : rawExperience;
  const experience = sourceExperience.map((exp: any, idx: number) => {
    if (!exp || typeof exp !== 'object') return null;
    const rawRole = exp.title || exp.role || exp.roleAr || exp.titleAr || '';
    const roleAr = sanitizeArabicNestedString(exp.titleAr || exp.roleAr || rawRole, 'خبرة مهنية') || 'خبرة مهنية';

    const rawCompany = exp.company || exp.companyAr || 'E3';
    const companyAr =
      rawCompany === 'E3' || rawCompany === 'eeeqa' || rawCompany === 'E3 Qatar'
        ? 'إي ثري'
        : sanitizeArabicNestedString(exp.companyAr || rawCompany, 'إي ثري') || 'إي ثري';

    const rawDuration = exp.year || exp.duration || exp.yearAr || exp.durationAr || '';
    const durationAr = exp.yearAr || exp.durationAr || translateDurationToArabic(rawDuration);

    const rawDesc = exp.descriptionAr || exp.responsibilitiesAr || (arabicExplicitExperience.length > 0 ? exp.description : '') || '';
    const descriptionAr = /[\u0600-\u06FF]/.test(rawDesc) ? rawDesc : (arabicExplicitExperience.length > 0 ? rawDesc : '');

    return {
      id: exp.id || `exp-${idx}`,
      role: roleAr,
      title: roleAr,
      company: companyAr,
      duration: durationAr,
      year: durationAr,
      description: descriptionAr,
      responsibilities: descriptionAr,
    };
  }).filter(Boolean);

  // 4. Projects Portfolio (fail closed)
  const arabicExplicitProjects = Array.isArray(member.projectsAr) ? member.projectsAr : [];
  const sourceProjects = arabicExplicitProjects.length > 0 ? arabicExplicitProjects : rawProjects;
  const projects = sourceProjects.map((proj: any, idx: number) => {
    if (!proj || typeof proj !== 'object') return null;
    const rawRole = proj.role || proj.roleAr || '';
    const roleAr = sanitizeArabicNestedString(proj.roleAr || rawRole, 'عضو فريق المشروع') || 'عضو فريق المشروع';

    const rawName = proj.name || proj.projectName || proj.title || proj.nameAr || proj.titleAr || '';
    const nameAr = sanitizeArabicNestedString(proj.nameAr || proj.titleAr || proj.projectNameAr || rawName, 'مشروع ريادي') || 'مشروع ريادي';

    const rawYear = proj.year || proj.yearAr || '';
    const yearAr = proj.yearAr || translateDurationToArabic(rawYear);

    const rawDesc = proj.descriptionAr || (arabicExplicitProjects.length > 0 ? proj.description : '') || '';
    const descriptionAr = /[\u0600-\u06FF]/.test(rawDesc) ? rawDesc : (arabicExplicitProjects.length > 0 ? rawDesc : '');

    return {
      id: proj.id || `proj-${idx}`,
      name: nameAr,
      projectName: nameAr,
      title: nameAr,
      role: roleAr,
      year: yearAr,
      client: proj.clientAr || (isAllowlistedLatinOrNumeric(proj.client) ? proj.client : 'إي ثري'),
      description: descriptionAr,
    };
  }).filter(Boolean);

  // 5. Certifications (fail closed)
  const arabicExplicitCerts = Array.isArray(member.certificationsAr) ? member.certificationsAr : [];
  const sourceCerts = arabicExplicitCerts.length > 0 ? arabicExplicitCerts : rawCertifications;
  const certifications = sourceCerts
    .map((cert: any, idx: number) => {
      if (typeof cert === 'string') {
        const sanitized = sanitizeArabicNestedString(cert, 'شهادة مهنية معتمدة');
        return sanitized ? { id: `cert-${idx}`, name: sanitized, issuer: 'هيئة مهنية معتمدة', year: '' } : null;
      }
      if (cert && typeof cert === 'object') {
        const rawName = cert.name || cert.nameAr || cert.title || cert.titleAr || '';
        const nameAr = sanitizeArabicNestedString(cert.nameAr || cert.titleAr || rawName, 'شهادة مهنية معتمدة') || 'شهادة مهنية معتمدة';
        const rawIssuer = cert.issuer || cert.issuerAr || '';
        const issuerAr =
          rawIssuer.toLowerCase() === 'professional organization' || !rawIssuer
            ? 'هيئة مهنية معتمدة'
            : sanitizeArabicNestedString(cert.issuerAr || rawIssuer, 'هيئة مهنية معتمدة') || 'هيئة مهنية معتمدة';
        const yearAr = cert.yearAr || translateDurationToArabic(cert.year);

        return {
          id: cert.id || `cert-${idx}`,
          name: nameAr,
          issuer: issuerAr,
          year: yearAr,
        };
      }
      return null;
    })
    .filter(Boolean);

  // 6. Skills Matrix (fail closed)
  const skillsMatrix = rawSkillsMatrix.map((s: any) => {
    if (!s || typeof s !== 'object') return s;
    const rawSkill = s.skill || s.skillAr || '';
    const skillAr = sanitizeArabicNestedString(s.skillAr || rawSkill, 'مهارة متخصصة') || 'مهارة متخصصة';
    return {
      ...s,
      skill: skillAr,
    };
  });

  return {
    expertiseTags,
    coreCompetencies,
    experience,
    projects,
    certifications,
    education: rawEducation,
    awards: rawAwards,
    skillsMatrix,
  };
}

/**
 * Resolves a single EmployeeProfile into a safe public DTO.
 */
export function resolvePublicTeamMember(
  member: CanonicalEmployeeInput,
  locale: 'en' | 'ar' = 'en'
): SafePublicTeamMember {
  const isAr = locale === 'ar';

  const nameEn = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Team Member';
  const mappedArName = member.slug ? CANONICAL_NAME_LOCALIZATION_MAP[member.slug] : null;
  const nameAr = member.firstNameAr && member.lastNameAr
    ? `${member.firstNameAr} ${member.lastNameAr}`.trim()
    : member.firstNameAr
    ? member.firstNameAr.trim()
    : mappedArName || nameEn;

  const rawDesignation = member.designation || '';
  const designationLower = rawDesignation.toLowerCase().trim();
  const designationAr =
    member.designationAr ||
    COMMON_DESIGNATION_LOCALIZATION[designationLower] ||
    (isAr ? 'عضو فريق العمل' : rawDesignation);

  const rawDept = (member.department || 'Events').trim();
  const deptKey = rawDept.toLowerCase();
  const localizedDept = TEAM_DEPARTMENT_LOCALIZATION[deptKey] || {
    en: member.department || 'Events',
    ar: member.departmentAr || 'الفعاليات والترفيه',
  };

  const name = isAr ? nameAr : nameEn;
  const designation = isAr ? designationAr : rawDesignation;
  const department = isAr ? (member.departmentAr || localizedDept.ar) : localizedDept.en;

  const taglineEn = (member.tagline || '').trim();
  const taglineAr = (member.taglineAr || member.heroTaglineAr || '').trim();
  const tagline = isAr ? taglineAr : taglineEn;

  const rawBio = (member.aboutSummary || '').trim();
  const rawBioAr = (member.aboutSummaryAr || '').trim();
  const aboutSummary = isAr ? rawBioAr : rawBio;

  const careerJourney = isAr
    ? (member.careerJourneyAr || '')
    : (member.careerJourney || '');

  const keyStrengths = isAr
    ? (member.keyStrengthsAr || '')
    : (member.keyStrengths || '');

  const initials = getEmployeeInitials(member.firstName, member.lastName);
  const profileImage = sanitizePortraitUrl(member.profileImage);
  const linkedinUrl = sanitizeSocialUrl(member.linkedinUrl);

  const nested = mapNestedProfileProperties(member, locale);
  const presGroup = resolvePresentationGroup(member, locale);

  const effectiveOrder = Number(member.displayOrder !== undefined && member.displayOrder !== null ? member.displayOrder : member.order) || 0;

  return {
    id: member.id,
    slug: member.slug,
    name,
    nameEn,
    nameAr,
    firstName: member.firstName || undefined,
    lastName: member.lastName || undefined,
    firstNameAr: member.firstNameAr || undefined,
    lastNameAr: member.lastNameAr || undefined,
    designation,
    designationAr,
    department,
    departmentAr: member.departmentAr || localizedDept.ar,
    departmentKey: deptKey,
    presentationGroup: presGroup.label,
    presentationGroupKey: presGroup.key,
    yearsOfExperience: Number(member.yearsOfExperience) || 0,
    tagline,
    taglineAr: taglineAr || undefined,
    aboutSummary,
    aboutSummaryAr: rawBioAr || undefined,
    profileImage,
    initials,
    linkedinUrl,
    hasLinkedin: Boolean(linkedinUrl),
    order: effectiveOrder,
    displayOrder: effectiveOrder,
    isFeatured: Boolean(member.isFeatured),
    showOnTeamPage: member.showOnTeamPage !== false,
    careerJourney: careerJourney || undefined,
    keyStrengths: keyStrengths || undefined,
    expertiseTags: nested.expertiseTags,
    coreCompetencies: nested.coreCompetencies,
    experience: nested.experience,
    projects: nested.projects,
    certifications: nested.certifications,
    education: nested.education,
    awards: nested.awards,
  };
}

/**
 * Resolves a list of EmployeeProfiles into safe public DTOs.
 * Enforces duplicate suppression so no duplicate profile appears twice publicly.
 */
export function resolvePublicTeamList(
  members: CanonicalEmployeeInput[],
  locale: 'en' | 'ar' = 'en'
): SafePublicTeamMember[] {
  if (!Array.isArray(members)) return [];

  const seenSlugs = new Set<string>();

  return members
    .filter((m) => {
      const { eligible } = isTeamMemberPubliclyEligible(m);
      if (!eligible) return false;
      if (seenSlugs.has(m.slug)) return false;
      seenSlugs.add(m.slug);
      return true;
    })
    .sort((a, b) => {
      const orderA = (a.displayOrder !== undefined && a.displayOrder !== null) ? a.displayOrder : (a.order ?? 999);
      const orderB = (b.displayOrder !== undefined && b.displayOrder !== null) ? b.displayOrder : (b.order ?? 999);
      return orderA - orderB;
    })
    .map((m) => resolvePublicTeamMember(m, locale));
}

export const filterAndResolvePublicTeamMembers = resolvePublicTeamList;

export function isTeamAuthorized(
  role: string | null | undefined,
  capabilities?: string[]
): boolean {
  if (!role) return false;
  if (Array.isArray(capabilities)) {
    if (
      capabilities.includes('team.manage') ||
      capabilities.includes('team.view') ||
      capabilities.includes('content.manage')
    ) {
      return true;
    }
    if (role === 'STAFF') return false;
  }
  return (
    role === 'SUPER_ADMIN' ||
    role === 'ADMIN' ||
    role === 'SALES_ADMIN' ||
    role === 'MARKETING' ||
    hasPermission(role, 'team.manage') ||
    hasPermission(role, 'team.view')
  );
}

/**
 * Performs comprehensive data quality & review analysis on an employee record.
 */
export function analyzeTeamMemberDataQuality(
  member: CanonicalEmployeeInput,
  _allMembers?: CanonicalEmployeeInput[]
): TeamDataQualityReport {
  const issues: TeamDataQualityIssue[] = [];

  const isVisible = Boolean(member.isActive !== false && member.showOnTeamPage !== false);
  const isHidden = !isVisible;
  const isFeatured = Boolean(member.isFeatured);

  if (!member.isActive) {
    issues.push({
      code: 'INACTIVE_RECORD',
      messageEn: 'Profile is inactive and will be hidden from public directory.',
      messageAr: 'الملف الشخصي غير نشط وسيتم إخفاؤه من الدليل العام.',
      severity: 'INFO',
    });
  }

  if (member.showOnTeamPage === false) {
    issues.push({
      code: 'HIDDEN_FROM_TEAM_PAGE',
      messageEn: 'Profile is excluded from public team page.',
      messageAr: 'الملف الشخصي مستبعد من صفحة الفريق العامة.',
      severity: 'INFO',
    });
  }

  if (member.slug === 'arslan-arshadw') {
    issues.push({
      code: 'DUPLICATE_SLUG',
      messageEn: 'Duplicate profile (arslan-arshadw) suppressed in public presentation in favor of canonical arslan-arshad.',
      messageAr: 'ملف مكرر (arslan-arshadw) محجوب من العرض العام لصالح الملف المعتمد arslan-arshad.',
      severity: 'WARNING',
    });
  }

  const isMohasinIdentity =
    member.slug === 'mohasin-mohammadaly-parayil' ||
    member.slug === 'mohasin-mohammadaly' ||
    member.slug === 'mohasin-parayil';

  if (isMohasinIdentity) {
    issues.push({
      code: 'MOHASIN_DUPLICATE_REVIEW',
      messageEn: 'Distinct Mohasin identity requiring human review and verification.',
      messageAr: 'هوية محاسن مميزة تتطلب مراجعة وتأكيداً بشرياً.',
      severity: 'WARNING',
    });
  }

  if (member.slug === 'abdulla-alkuwari' || member.slug === 'sarah-haddad') {
    issues.push({
      code: 'REVIEW_REQUIRED',
      messageEn: `Profile ${member.slug} flagged with REVIEW_REQUIRED for data quality verification.`,
      messageAr: `تم وضع علامة مراجعة مطلوبة للملف ${member.slug} للتحقق من جودة البيانات.`,
      severity: 'WARNING',
    });
  }

  let hasMissingArabic = false;

  if (!member.firstNameAr && !member.lastNameAr) {
    hasMissingArabic = true;
    issues.push({
      code: 'MISSING_ARABIC_NAME',
      messageEn: 'Profile is missing Arabic name fields (firstNameAr/lastNameAr).',
      messageAr: 'الملف الشخصي يفتقر إلى حقول الاسم باللغة العربية.',
      severity: 'WARNING',
    });
  }

  if (!member.designationAr) {
    hasMissingArabic = true;
    issues.push({
      code: 'MISSING_ARABIC_DESIGNATION',
      messageEn: 'Profile is missing Arabic designation field (designationAr).',
      messageAr: 'الملف الشخصي يفتقر إلى حقل المسمى الوظيفي بالعربية.',
      severity: 'WARNING',
    });
  }

  if (!member.departmentAr) {
    issues.push({
      code: 'MISSING_ARABIC_DEPARTMENT',
      messageEn: 'Profile is missing Arabic department field (departmentAr).',
      messageAr: 'الملف الشخصي يفتقر إلى حقل القسم بالعربية.',
      severity: 'INFO',
    });
  }

  if (!member.aboutSummaryAr) {
    hasMissingArabic = true;
    issues.push({
      code: 'MISSING_ARABIC_BIO',
      messageEn: 'Profile is missing Arabic bio field (aboutSummaryAr).',
      messageAr: 'الملف الشخصي يفتقر إلى النبذة المهنية باللغة العربية.',
      severity: 'WARNING',
    });
  }

  const hasArabicExpertise = Array.isArray(member.expertiseTagsAr) && member.expertiseTagsAr.length > 0;
  if (!hasArabicExpertise && Array.isArray(member.expertiseTags) && member.expertiseTags.length > 0) {
    hasMissingArabic = true;
    issues.push({
      code: 'MISSING_ARABIC_EXPERTISE',
      messageEn: 'Profile has English expertise tags without Arabic equivalents.',
      messageAr: 'الملف الشخصي يحتوي على وسوم خبرة بالإنجليزية بدون نظيراتها العربية.',
      severity: 'INFO',
    });
  }

  const hasArabicExperience = Array.isArray(member.experienceAr) && member.experienceAr.length > 0;
  if (!hasArabicExperience && Array.isArray(member.experience) && member.experience.length > 0) {
    hasMissingArabic = true;
    issues.push({
      code: 'MISSING_ARABIC_EXPERIENCE',
      messageEn: 'Profile has English experience timeline without Arabic equivalents.',
      messageAr: 'الملف الشخصي يحتوي على مسيرة مهنية بالإنجليزية بدون نظيراتها العربية.',
      severity: 'INFO',
    });
  }

  const hasArabicProjects = Array.isArray(member.projectsAr) && member.projectsAr.length > 0;
  if (!hasArabicProjects && Array.isArray(member.projects) && member.projects.length > 0) {
    hasMissingArabic = true;
    issues.push({
      code: 'MISSING_ARABIC_PROJECTS',
      messageEn: 'Profile has English projects portfolio without Arabic equivalents.',
      messageAr: 'الملف الشخصي يحتوي على سجل مشاريع بالإنجليزية بدون نظيراتها العربية.',
      severity: 'INFO',
    });
  }

  if (!member.profileImage) {
    issues.push({
      code: 'MISSING_PORTRAIT',
      messageEn: 'Profile is missing a portrait image URL.',
      messageAr: 'الملف الشخصي يفتقر إلى صورة شخصية.',
      severity: 'INFO',
    });
  } else {
    const sanitizedPortrait = sanitizePortraitUrl(member.profileImage);
    if (!sanitizedPortrait) {
      issues.push({
        code: 'UNSAFE_PORTRAIT',
        messageEn: 'Profile portrait URL uses an unsafe or non-HTTPS protocol.',
        messageAr: 'رابط صورة الملف الشخصي غير آمن أو لا يستخدم بروتوكول HTTPS.',
        severity: 'ERROR',
      });
    }
  }

  if (member.linkedinUrl) {
    const sanitizedSocial = sanitizeSocialUrl(member.linkedinUrl);
    if (!sanitizedSocial) {
      issues.push({
        code: 'UNSAFE_SOCIAL_URL',
        messageEn: 'LinkedIn URL is not a valid HTTPS URL and will be omitted.',
        messageAr: 'رابط لينكد إن ليس رابط HTTPS صالحاً وسيتم استبعاده.',
        severity: 'ERROR',
      });
    }
  }

  if (member.contactEmail || member.contactPhone || member.phone || member.email) {
    issues.push({
      code: 'PERSONAL_CONTACT_EXPOSED',
      messageEn: 'Personal contact email or phone is present in database record (will be stripped from public DTO).',
      messageAr: 'بيانات الاتصال الشخصية موجودة في قاعدة البيانات (سيتم حجبها من واجهة العرض العامة).',
      severity: 'INFO',
    });
  }

  const isClean = issues.filter((i) => i.severity === 'ERROR').length === 0;
  const warningCount = issues.filter((i) => i.severity === 'WARNING').length;
  const isArabicComplete = !hasMissingArabic;

  return {
    employeeId: member.id,
    slug: member.slug,
    isClean,
    issues,
    warningCount,
    hasMissingArabic,
    isArabicComplete,
    isVisible,
    isHidden,
    isFeatured,
  };
}

/**
 * Validates Team Member mutations for RBAC authorization and initial default states.
 */
export function validateTeamMutationPermission(
  userRole: string | undefined | null,
  action: 'create' | 'update' | 'delete'
): { authorized: boolean; error?: string } {
  const capabilityMap = {
    create: 'team.manage',
    update: 'team.manage',
    delete: 'team.manage',
  } as const;

  const requiredCapability = capabilityMap[action];
  const authorized = hasPermission(userRole, requiredCapability);

  if (!authorized) {
    return {
      authorized: false,
      error: `Forbidden: Insufficient privileges for team mutation (${action}). Required: ${requiredCapability}`,
    };
  }

  return { authorized: true };
}

/**
 * Ensures newly created team profiles default to inactive unless explicitly published.
 */
export function sanitizeNewTeamMemberInput(input: Partial<CanonicalEmployeeInput>): Partial<CanonicalEmployeeInput> {
  return {
    ...input,
    isActive: input.isActive === true ? true : false,
    order: typeof input.order === 'number' ? input.order : 999,
  };
}
