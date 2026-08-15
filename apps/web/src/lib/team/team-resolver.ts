/**
 * QF-24: Canonical Team Member Public Resolver, Safety Engine & Data Quality Analyzer
 *
 * Requirements:
 * 1. Single canonical resolver for all public Team consumers (B2B team list, detail, About, home, sitemap).
 * 2. Strict filtering of `isActive: true` and deterministic ordering (order asc, name asc, slug asc).
 * 3. Exact slug resolution — NO hardcoded fallbacks to other profiles (e.g. Tariq Mansour).
 * 4. Legacy CUID resolution helper for 301 redirects to canonical slugs.
 * 5. Public Privacy: Strips personal email and phone numbers from public DTOs; permits validated HTTPS social links.
 * 6. Arabic Localization: Complete Arabic mapping for designations, departments, bios, and names without English residue.
 * 7. Non-destructive staff data quality & review analyzer:
 *    - Flags Mohasin identities for human review.
 *    - Flags abdulla-alkuwari and sarah-haddad with REVIEW_REQUIRED without destructive mutation.
 *    - Flags missing Arabic, duplicate slugs/names, placeholders, and unsafe links.
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
  yearsOfExperience?: number | null;
  tagline?: string | null;
  aboutSummary?: string | null;
  aboutSummaryAr?: string | null;
  careerJourney?: string | null;
  keyStrengths?: string | null;
  expertiseTags?: any;
  coreCompetencies?: any;
  experience?: any;
  projects?: any;
  certifications?: any;
  education?: any;
  awards?: any;
  skillsMatrix?: any;
  mediaGallery?: any;
  testimonials?: any;
  contactEmail?: string | null;
  linkedinUrl?: string | null;
  profileImage?: string | null;
  isActive?: boolean | null;
  order?: number | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  [key: string]: any;
}

export interface SafePublicTeamMember {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  nameAr: string;
  designation: string;
  department: string;
  departmentKey: string;
  yearsOfExperience: number;
  tagline: string;
  aboutSummary: string;
  profileImage: string | null;
  initials: string;
  linkedinUrl: string | null;
  hasLinkedin: boolean;
  order: number;
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
    | 'MISSING_ARABIC_BIO'
    | 'MISSING_PORTRAIT'
    | 'UNSAFE_PORTRAIT'
    | 'UNSAFE_SOCIAL_URL'
    | 'PERSONAL_CONTACT_EXPOSED'
    | 'PLACEHOLDER_CONTENT'
    | 'DUPLICATE_SLUG'
    | 'DUPLICATE_NAME'
    | 'INACTIVE_RECORD';
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
}

/**
 * Standard department localization dictionary for Arabic parity across all 22 active roster roles.
 */
export const TEAM_DEPARTMENT_LOCALIZATION: Record<string, { en: string; ar: string }> = {
  events: { en: 'Events', ar: 'الفعاليات والترفيه' },
  'events & entertainment': { en: 'Events & Entertainment', ar: 'الفعاليات والترفيه' },
  marketing: { en: 'Marketing', ar: 'التسويق' },
  'marketing & sales': { en: 'Marketing & Sales', ar: 'التسويق والمبيعات' },
  'branding, design & marketing': { en: 'Branding, Design & Marketing', ar: 'التصميم والهوية والتسويق' },
  sales: { en: 'Sales', ar: 'المبيعات' },
  executive: { en: 'Executive Management', ar: 'الإدارة التنفيذية' },
  'executive management': { en: 'Executive Management', ar: 'الإدارة التنفيذية' },
  management: { en: 'Management', ar: 'الإدارة العامة' },
  design: { en: 'Design & Creative', ar: 'التصميم والإبداع' },
  'design & creative': { en: 'Design & Creative', ar: 'التصميم والإبداع' },
  creative: { en: 'Creative', ar: 'الإبداع الفني' },
  logistics: { en: 'Logistics', ar: 'الخدمات اللوجستية' },
  'logistics & production': { en: 'Logistics & Production', ar: 'اللوجستيات والإنتاج' },
  operations: { en: 'Operations', ar: 'العمليات التشغيلية' },
  'operations & staging': { en: 'Operations & Staging', ar: 'العمليات والتجهيز' },
  'operations & guest experience': { en: 'Operations & Guest Experience', ar: 'العمليات وتجربة الزوار' },
  'operations / it': { en: 'Operations & IT', ar: 'العمليات وتقنية المعلومات' },
  it: { en: 'Information Technology', ar: 'تقنية المعلومات' },
  'information technology': { en: 'Information Technology', ar: 'تقنية المعلومات' },
  technical: { en: 'Technical Engineering', ar: 'الهندسة والتقنية' },
  engineering: { en: 'Engineering', ar: 'الهندسة الإنشائية' },
  'food & beverage': { en: 'Food & Beverage', ar: 'الأغذية والمشروبات' },
  general: { en: 'General Operations', ar: 'العمليات العامة' },
};

/**
 * Standard designation translations for common corporate roles across the 22-person roster.
 */
export const COMMON_DESIGNATION_LOCALIZATION: Record<string, string> = {
  'managing director & ceo': 'العضو المنتدب والرئيس التنفيذي',
  'general manager': 'المدير العام',
  'senior events manager': 'مدير الفعاليات الأول',
  'ai generalist & senior graphic designer': 'مصمم جرافيك أول وخبير ذكاء اصطناعي',
  'senior 3d visualizer': 'مصمم ثلاثي الأبعاد أول',
  chairman: 'رئيس مجلس الإدارة',
  'creative marketing lead': 'رئيس التسويق الإبداعي',
  'chief executive officer': 'الرئيس التنفيذي',
  'head of experiential design': 'رئيس قسم التصميم التجريبي',
  'project & logistics coordinator': 'منسق المشاريع والخدمات اللوجستية',
  'site manager - city center': 'مدير الموقع - سيتي سنتر',
  'site manager': 'مدير الموقع',
  'logistics operations manager': 'مدير العمليات اللوجستية',
  'production supervisor': 'مشرف الإنتاج',
  'marketing & partnerships': 'مسؤول التسويق والشراكات',
  'head of operations - fec / it': 'رئيس العمليات - المراكز الترفيهية وتقنية المعلومات',
  '3d visualizer': 'مصمم ثلاثي الأبعاد',
  'event supervisor': 'مشرف الفعاليات',
  'project manager': 'مدير المشاريع',
  'software engineer': 'مهندس برمجيات',
  'events & entertainment coordinator': 'منسق الفعاليات والترفيه',
  'operations manager': 'مدير العمليات',
  'f&b manager': 'مدير الأغذية والمشروبات',
  'events manager': 'مدير الفعاليات',
  'events director': 'مدير إدارة الفعاليات',
  'creative director': 'المدير الإبداعي',
  'lead structural engineer': 'كبير المهندسين الإنشائيين',
  'structural engineer': 'مهندس إنشائي',
  'operations lead': 'رئيس فريق العمليات',
  'logistics manager': 'مدير الخدمات اللوجستية',
  'marketing manager': 'مدير التسويق',
  'managing director': 'العضو المنتدب',
};

/**
 * Validates HTTPS social profile URLs (e.g. LinkedIn, Twitter).
 * Strictly requires https: protocol. Rejects http, javascript, data, file protocols.
 */
export function sanitizeSocialUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '#' || trimmed === '/') return null;

  const lower = trimmed.toLowerCase();
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
 * Validates portrait photo URLs.
 * Requires HTTPS URL or safe relative image path.
 */
export function sanitizePortraitUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  // Reject dangerous protocols
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/') ||
    lower.startsWith('file:')
  ) {
    return null;
  }

  // Safe relative paths
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Safe HTTPS URLs
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

  // Safe Base64 image
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
 * Checks if an EmployeeProfile is publicly eligible for display on public routes.
 */
export function isTeamMemberPubliclyEligible(member: CanonicalEmployeeInput): { eligible: boolean; reason?: string } {
  if (!member) {
    return { eligible: false, reason: 'Member record missing' };
  }

  if (member.isActive === false) {
    return { eligible: false, reason: 'Profile is marked inactive' };
  }

  if (!member.slug || !member.slug.trim()) {
    return { eligible: false, reason: 'Missing canonical slug' };
  }

  const hasName = Boolean((member.firstName && member.firstName.trim()) || (member.firstNameAr && member.firstNameAr.trim()));
  if (!hasName) {
    return { eligible: false, reason: 'Missing profile name' };
  }

  return { eligible: true };
}

/**
 * Resolves a single EmployeeProfile into a safe public DTO.
 * - Localizes name, designation, department, and bio cleanly for English and Arabic.
 * - Prevents English biography residue in Arabic mode.
 * - Strips personal email and phone numbers (staff privacy).
 * - Enforces HTTPS for social links.
 */
export function resolvePublicTeamMember(
  member: CanonicalEmployeeInput,
  locale: 'en' | 'ar' = 'en'
): SafePublicTeamMember {
  const isAr = locale === 'ar';

  const nameEn = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Team Member';
  const nameAr = member.firstNameAr && member.lastNameAr
    ? `${member.firstNameAr} ${member.lastNameAr}`.trim()
    : member.firstNameAr
    ? member.firstNameAr.trim()
    : nameEn; // Fallback to Latin name as last resort identity label

  const displayFullName = isAr ? nameAr : nameEn;

  // Department Localization
  const rawDeptKey = (member.department || 'general').trim().toLowerCase();
  const deptMatch = TEAM_DEPARTMENT_LOCALIZATION[rawDeptKey];
  const departmentDisplay = deptMatch
    ? isAr
      ? deptMatch.ar
      : deptMatch.en
    : member.department || (isAr ? 'العمليات' : 'Operations');

  // Designation Localization
  const rawDesigLower = (member.designation || '').trim().toLowerCase();
  const commonDesigAr = COMMON_DESIGNATION_LOCALIZATION[rawDesigLower];
  const designationAr = member.designationAr?.trim() || commonDesigAr || (isAr ? 'عضو الفريق' : member.designation);
  const designationDisplay = isAr ? designationAr : (member.designation || 'Team Member');

  // Tagline & Bio Localization (Strict: No English bio residue in Arabic)
  const taglineDisplay = isAr
    ? (member.taglineAr || member.designationAr || designationAr)
    : (member.tagline || member.designation || '');

  const aboutSummaryDisplay = isAr
    ? (member.aboutSummaryAr?.trim() || '')
    : (member.aboutSummary?.trim() || '');

  // Safe Social & Image links
  const safeLinkedin = sanitizeSocialUrl(member.linkedinUrl);
  const safePortrait = sanitizePortraitUrl(member.profileImage);

  // Safe Arrays
  const expertiseTags = Array.isArray(member.expertiseTags) ? member.expertiseTags : [];
  const coreCompetencies = Array.isArray(member.coreCompetencies) ? member.coreCompetencies : [];
  const experience = Array.isArray(member.experience) ? member.experience : [];
  const projects = Array.isArray(member.projects) ? member.projects : [];
  const certifications = Array.isArray(member.certifications) ? member.certifications : [];
  const education = Array.isArray(member.education) ? member.education : [];
  const awards = Array.isArray(member.awards) ? member.awards : [];

  return {
    id: member.id,
    slug: member.slug,
    name: displayFullName,
    nameEn,
    nameAr,
    designation: designationDisplay,
    department: departmentDisplay,
    departmentKey: rawDeptKey,
    yearsOfExperience: typeof member.yearsOfExperience === 'number' ? member.yearsOfExperience : 0,
    tagline: taglineDisplay,
    aboutSummary: aboutSummaryDisplay,
    profileImage: safePortrait,
    initials: getEmployeeInitials(member.firstName, member.lastName),
    linkedinUrl: safeLinkedin,
    hasLinkedin: Boolean(safeLinkedin),
    order: typeof member.order === 'number' ? member.order : 0,
    careerJourney: isAr ? (member.careerJourneyAr || '') : (member.careerJourney || ''),
    keyStrengths: isAr ? (member.keyStrengthsAr || '') : (member.keyStrengths || ''),
    expertiseTags,
    coreCompetencies,
    experience,
    projects,
    certifications,
    education,
    awards,
  };
}

/**
 * Filters a collection of team members to publicly eligible ones with deterministic ordering and safe fields.
 * Deterministic sort: `order asc`, then `lastName asc`, then `firstName asc`, then `slug asc`.
 */
export function filterAndResolvePublicTeamMembers(
  members: CanonicalEmployeeInput[],
  locale: 'en' | 'ar' = 'en'
): SafePublicTeamMember[] {
  if (!Array.isArray(members)) return [];

  const eligible = members.filter((m) => isTeamMemberPubliclyEligible(m).eligible);

  const sorted = [...eligible].sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : 0;
    const orderB = typeof b.order === 'number' ? b.order : 0;
    if (orderA !== orderB) return orderA - orderB;

    const lastA = (a.lastName || '').toLowerCase();
    const lastB = (b.lastName || '').toLowerCase();
    if (lastA !== lastB) return lastA.localeCompare(lastB);

    const firstA = (a.firstName || '').toLowerCase();
    const firstB = (b.firstName || '').toLowerCase();
    if (firstA !== firstB) return firstA.localeCompare(firstB);

    return (a.slug || '').localeCompare(b.slug || '');
  });

  return sorted.map((m) => resolvePublicTeamMember(m, locale));
}

/**
 * Suspicious placeholder keywords for staff audit.
 */
const PLACEHOLDER_KEYWORDS = [
  'lorem ipsum',
  'sample bio',
  'placeholder',
  'tbd',
  'todo',
  'test user',
  'dummy',
  'fake',
];

/**
 * Analyzes team member data quality non-destructively for staff inspection.
 * Produces derived warnings without mutating any stored database records.
 */
export function analyzeTeamMemberDataQuality(
  member: CanonicalEmployeeInput,
  allMembers?: CanonicalEmployeeInput[]
): TeamDataQualityReport {
  const issues: TeamDataQualityIssue[] = [];

  if (!member) {
    return {
      employeeId: '',
      slug: '',
      isClean: false,
      issues: [],
      warningCount: 0,
    };
  }

  const slug = (member.slug || '').toLowerCase();
  const fullNameEn = `${member.firstName || ''} ${member.lastName || ''}`.trim().toLowerCase();

  // 1. Specific Roster Flags (QF-24 Requirements)
  if (slug.includes('mohasin') || fullNameEn.includes('mohasin')) {
    issues.push({
      code: 'MOHASIN_DUPLICATE_REVIEW',
      messageEn: 'Mohasin profile identity flagged for human review to confirm duplicate status.',
      messageAr: 'تم وضع علامة على هوية محاسن للمراجعة البشرية للتأكد من حالة التكرار.',
      severity: 'WARNING',
    });
  }

  if (slug === 'abdulla-alkuwari' || slug === 'sarah-haddad') {
    issues.push({
      code: 'REVIEW_REQUIRED',
      messageEn: `Profile "${slug}" requires roster review. Retain without destructive mutation until approved decision.`,
      messageAr: `الملف الشخصي "${slug}" يتطلب مراجعة السجل الوظيفي. يُحفظ دون تعديل حتى اعتماد القرار.`,
      severity: 'INFO',
    });
  }

  // 2. Arabic Content Completeness
  if (!member.firstNameAr || !member.firstNameAr.trim()) {
    issues.push({
      code: 'MISSING_ARABIC_NAME',
      messageEn: 'Arabic name is missing. Arabic portal will display transliterated/Latin label.',
      messageAr: 'الاسم باللغة العربية مفقود. ستعرض البوابة العربية الاسم باللاتينية كحل أخير.',
      severity: 'WARNING',
    });
  }

  if (!member.designationAr || !member.designationAr.trim()) {
    issues.push({
      code: 'MISSING_ARABIC_DESIGNATION',
      messageEn: 'Arabic job title is missing. Neutral localized designation will be shown.',
      messageAr: 'المسمى الوظيفي بالعربية مفقود. سيتم عرض مسمى محايد.',
      severity: 'INFO',
    });
  }

  if (!member.aboutSummaryAr || !member.aboutSummaryAr.trim()) {
    issues.push({
      code: 'MISSING_ARABIC_BIO',
      messageEn: 'Arabic biography is missing. Arabic page will suppress English text to avoid residue.',
      messageAr: 'النبذة التعريفية بالعربية مفقودة. ستخفي الصفحة العربية النص الإنجليزي لتجنب الخلط اللغوي.',
      severity: 'INFO',
    });
  }

  // 3. Portrait & Media Checks
  if (!member.profileImage || !member.profileImage.trim()) {
    issues.push({
      code: 'MISSING_PORTRAIT',
      messageEn: 'Profile portrait image is missing. An avatar monogram fallback will be rendered.',
      messageAr: 'صورة الملف الشخصي غير متوفرة. سيتم عرض رمز الأحرف البديل.',
      severity: 'WARNING',
    });
  } else {
    const safePortrait = sanitizePortraitUrl(member.profileImage);
    if (!safePortrait) {
      issues.push({
        code: 'UNSAFE_PORTRAIT',
        messageEn: 'Profile image uses an unencrypted or unsafe URL protocol.',
        messageAr: 'رابط صورة الملف الشخصي يستخدم بروتوكولاً غير مشفر أو غير آمن.',
        severity: 'ERROR',
      });
    }
  }

  // 4. Social & Contact Privacy
  if (member.linkedinUrl && !sanitizeSocialUrl(member.linkedinUrl)) {
    issues.push({
      code: 'UNSAFE_SOCIAL_URL',
      messageEn: 'LinkedIn URL uses an invalid or unencrypted protocol.',
      messageAr: 'رابط لينكد إن غير صالح أو غير مشفر بتقنية HTTPS.',
      severity: 'WARNING',
    });
  }

  if (member.contactEmail && member.contactEmail.trim()) {
    issues.push({
      code: 'PERSONAL_CONTACT_EXPOSED',
      messageEn: 'Direct contact email is present in database and suppressed from public DTO.',
      messageAr: 'البريد الإلكتروني المباشر موجود في قاعدة البيانات وتم حجبه عن العرض العام لحماية الخصوصية.',
      severity: 'INFO',
    });
  }

  // 5. Placeholder Content Inspection
  const fullText = `${member.firstName || ''} ${member.lastName || ''} ${member.designation || ''} ${member.aboutSummary || ''}`.toLowerCase();
  for (const kw of PLACEHOLDER_KEYWORDS) {
    if (fullText.includes(kw)) {
      issues.push({
        code: 'PLACEHOLDER_CONTENT',
        messageEn: `Suspicious placeholder or sample keyword ("${kw}") detected in profile.`,
        messageAr: `تم رصد نص مؤقت أو تجريبي ("${kw}") في الملف الشخصي.`,
        severity: 'WARNING',
      });
      break;
    }
  }

  // 6. Duplicate Detection across all members
  if (allMembers && allMembers.length > 1) {
    const duplicateSlugs = allMembers.filter((other) => other.id !== member.id && other.slug === member.slug);
    if (duplicateSlugs.length > 0) {
      issues.push({
        code: 'DUPLICATE_SLUG',
        messageEn: `Duplicate slug "${member.slug}" shared with member ID(s): ${duplicateSlugs.map((d) => d.id).join(', ')}.`,
        messageAr: `الاسم التعريفي (Slug) "${member.slug}" مكرر مع المعرفات: ${duplicateSlugs.map((d) => d.id).join(', ')}.`,
        severity: 'ERROR',
      });
    }

    const duplicateNames = allMembers.filter(
      (other) =>
        other.id !== member.id &&
        `${other.firstName || ''} ${other.lastName || ''}`.trim().toLowerCase() === fullNameEn &&
        fullNameEn.length > 3
    );
    if (duplicateNames.length > 0) {
      issues.push({
        code: 'DUPLICATE_NAME',
        messageEn: `Matching full name with member ID(s): ${duplicateNames.map((d) => d.id).join(', ')}.`,
        messageAr: `تطابق في الاسم الكامل مع المعرفات: ${duplicateNames.map((d) => d.id).join(', ')}.`,
        severity: 'WARNING',
      });
    }
  }

  // 7. Inactive Notice
  if (member.isActive === false) {
    issues.push({
      code: 'INACTIVE_RECORD',
      messageEn: 'Profile is marked inactive and excluded from public listings.',
      messageAr: 'الملف الشخصي غير نشط ومستبعد من الدليل العام.',
      severity: 'INFO',
    });
  }

  return {
    employeeId: member.id || '',
    slug: member.slug || '',
    isClean: issues.filter((i) => i.severity === 'ERROR' || i.severity === 'WARNING').length === 0,
    issues,
    warningCount: issues.length,
  };
}

/**
 * Canonical RBAC helper for Team management mutations.
 * Permitted: SUPER_ADMIN, SALES_ADMIN, SUPPORT_ADMIN, ADMIN, MARKETING, or accounts with 'content.manage'.
 */
export function isTeamAuthorized(
  userRole?: string | null,
  userPermissions?: string[] | null
): boolean {
  if (!userRole) return false;
  const cleanRole = String(userRole).trim().toUpperCase();

  if (Array.isArray(userPermissions)) {
    if (
      userPermissions.includes('*') ||
      userPermissions.includes('team.manage') ||
      userPermissions.includes('content.manage') ||
      userPermissions.includes('hr.team.manage')
    ) {
      return true;
    }
  }

  if (
    hasPermission(cleanRole, 'team.manage') ||
    hasPermission(cleanRole, 'content.manage') ||
    ['SUPER_ADMIN', 'SALES_ADMIN', 'SUPPORT_ADMIN', 'ADMIN', 'MARKETING', 'HR_ADMIN'].includes(cleanRole)
  ) {
    return true;
  }

  return false;
}
