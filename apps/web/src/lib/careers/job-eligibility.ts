/**
 * job-eligibility.ts
 *
 * Canonical Careers Public-Eligibility Contract, Data Quality Analyzer,
 * and Safe Presentation Formatter.
 *
 * All deadline calculations are strictly evaluated against Qatar timezone (Asia/Qatar, UTC+3).
 */

export const QATAR_TIMEZONE = 'Asia/Qatar';
export const QATAR_UTC_OFFSET_HOURS = 3; // Fixed UTC+3 (no DST in Qatar)

/**
 * Checks if a user role has HR / Careers administrative capabilities.
 */
export function isHRAuthorized(userRole?: string | null): boolean {
  if (!userRole) return false;
  const clean = String(userRole).trim().toUpperCase();
  return [
    'SUPER_ADMIN',
    'SUPERADMIN',
    'ADMIN',
    'HR_ADMIN',
    'HRADMIN',
    'HR',
    'STAFF',
    'EMPLOYEE'
  ].includes(clean);
}

export interface CanonicalJobInput {
  id?: string;
  title?: string;
  titleEn?: string;
  titleAr?: string;
  department?: string | null;
  location?: string | null;
  type?: string;
  description?: string;
  requirements?: string | null;
  isPublished?: boolean;
  status?: string;
  deadline?: string | Date | null;
  applicationLink?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  reasonAr?: string;
  isPublished: boolean;
  isExpired: boolean;
  isClosed: boolean;
  isDraft: boolean;
}

export interface DataQualityIssue {
  field: string;
  code: 'LOWERCASE_TEXT' | 'MISSING_ARABIC' | 'MISSING_LOCATION' | 'MISSING_DEADLINE' | 'SHORT_DESCRIPTION' | 'EXPIRED_DEADLINE';
  severity: 'warning' | 'info';
  messageEn: string;
  messageAr: string;
}

export interface DataQualityReport {
  isClean: boolean;
  score: number; // 0 - 100
  issues: DataQualityIssue[];
}

export interface FormattedPublicJob {
  id: string;
  title: string;
  titleEn: string;
  titleAr: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  deadline: string | null;
  isPublished: boolean;
  createdAt: string;
}

/**
 * Calculates current time in Qatar (Asia/Qatar, UTC+3).
 */
export function getNowInQatar(mockDate?: Date): Date {
  const now = mockDate || new Date();
  return new Date(now.getTime() + QATAR_UTC_OFFSET_HOURS * 3600 * 1000);
}

/**
 * Parses a deadline string or Date into a Qatar-localized cutoff time.
 * If given a date string like '2026-08-31', deadline is the end of that day in Qatar (23:59:59.999 UTC+3).
 */
export function parseQatarDeadline(deadlineInput?: string | Date | null): Date | null {
  if (!deadlineInput) return null;

  if (typeof deadlineInput === 'string') {
    const trimmed = deadlineInput.trim();
    if (!trimmed) return null;

    // Matches YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split('-').map(Number);
      // End of day in Qatar time: 23:59:59.999 UTC+3 -> 20:59:59.999 UTC
      return new Date(Date.UTC(year, month - 1, day, 23 - QATAR_UTC_OFFSET_HOURS, 59, 59, 999));
    }

    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return isNaN(deadlineInput.getTime()) ? null : deadlineInput;
}

/**
 * Checks if a job deadline is expired relative to current Qatar time.
 */
export function isDeadlineExpired(deadlineInput?: string | Date | null, referenceNow?: Date): boolean {
  const deadlineUtc = parseQatarDeadline(deadlineInput);
  if (!deadlineUtc) return false;

  const now = referenceNow || new Date();
  return now.getTime() > deadlineUtc.getTime();
}

/**
 * Evaluates the public eligibility of a job.
 * A job is eligible ONLY if:
 * 1. isPublished === true (or status === 'ACTIVE' | 'PUBLISHED')
 * 2. status is not 'CLOSED', 'ARCHIVED', 'DRAFT', or 'INACTIVE'
 * 3. deadline has not elapsed in Qatar time
 */
export function isJobPubliclyEligible(job: CanonicalJobInput, referenceNow?: Date): EligibilityResult {
  const normalizedStatus = (job.status || '').trim().toUpperCase();
  const isExplicitlyDraft = normalizedStatus === 'DRAFT' || (!job.isPublished && !normalizedStatus);
  const isExplicitlyClosed = normalizedStatus === 'CLOSED' || normalizedStatus === 'INACTIVE';
  const isExplicitlyArchived = normalizedStatus === 'ARCHIVED';

  const published = Boolean(
    job.isPublished || normalizedStatus === 'ACTIVE' || normalizedStatus === 'PUBLISHED'
  );

  const expired = isDeadlineExpired(job.deadline, referenceNow);

  if (isExplicitlyArchived) {
    return {
      eligible: false,
      reason: 'Job has been archived',
      reasonAr: 'تمت أرشفة هذه الوظيفة',
      isPublished: published,
      isExpired: expired,
      isClosed: true,
      isDraft: false,
    };
  }

  if (isExplicitlyClosed) {
    return {
      eligible: false,
      reason: 'Job listing is closed',
      reasonAr: 'باب التقديم لهذه الوظيفة مغلق',
      isPublished: published,
      isExpired: expired,
      isClosed: true,
      isDraft: false,
    };
  }

  if (!published || isExplicitlyDraft) {
    return {
      eligible: false,
      reason: 'Job is not published (Draft)',
      reasonAr: 'الوظيفة في مسودة ولم تُنشر بعد',
      isPublished: false,
      isExpired: expired,
      isClosed: false,
      isDraft: true,
    };
  }

  if (expired) {
    return {
      eligible: false,
      reason: 'Application deadline has passed (Qatar Time)',
      reasonAr: 'انتهى الموعد النهائي للتقديم (بتوقيت قطر)',
      isPublished: published,
      isExpired: true,
      isClosed: true,
      isDraft: false,
    };
  }

  return {
    eligible: true,
    isPublished: true,
    isExpired: false,
    isClosed: false,
    isDraft: false,
  };
}

/**
 * Filters a list of jobs returning only publicly eligible ones.
 */
export function filterPubliclyEligibleJobs<T extends CanonicalJobInput>(jobs: T[], referenceNow?: Date): T[] {
  if (!Array.isArray(jobs)) return [];
  return jobs.filter((job) => isJobPubliclyEligible(job, referenceNow).eligible);
}

/**
 * Capitalizes words in a string cleanly for presentation without mutating DB records.
 */
export function toTitleCase(str?: string | null): string {
  if (!str) return '';
  const trimmed = str.trim();
  if (!trimmed) return '';

  // Common acronyms or specific casing
  const acronyms: Record<string, string> = {
    av: 'AV',
    qa: 'QA',
    it: 'IT',
    hr: 'HR',
    b2b: 'B2B',
    b2c: 'B2C',
    seo: 'SEO',
    api: 'API',
    ui: 'UI',
    ux: 'UX',
    e3: 'E3',
  };

  return trimmed
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (acronyms[lower]) {
        return word.replace(new RegExp(lower, 'i'), acronyms[lower]);
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Standard department translation map
 */
export const DEPARTMENT_LOCALIZATION: Record<string, { en: string; ar: string }> = {
  operations: { en: 'Operations', ar: 'العمليات التشغيلية' },
  sales: { en: 'Sales', ar: 'المبيعات' },
  creative: { en: 'Creative', ar: 'الإبداع والتصميم' },
  engineering: { en: 'Engineering', ar: 'الهندسة والتقنية' },
  marketing: { en: 'Marketing', ar: 'التسويق' },
  branding: { en: 'Branding & Design', ar: 'العلامة التجارية والتصميم' },
  management: { en: 'Management', ar: 'الإدارة العامة' },
  hr: { en: 'Human Resources', ar: 'الموارد البشرية' },
  general: { en: 'General', ar: 'عام' },
};

/**
 * Formats a job record for safe public presentation.
 * Applies presentation casing without modifying stored values and exposes only safe fields.
 */
export function formatJobPresentation(job: CanonicalJobInput, locale: 'en' | 'ar' = 'en'): FormattedPublicJob {
  const isAr = locale === 'ar';

  const rawTitleEn = job.titleEn || job.title || '';
  const rawTitleAr = job.titleAr || '';

  const cleanTitleEn = toTitleCase(rawTitleEn) || (isAr ? 'فرصة وظيفية' : 'Open Position');
  const cleanTitleAr = rawTitleAr.trim() || cleanTitleEn;

  const rawDept = (job.department || '').trim().toLowerCase();
  const deptMap = DEPARTMENT_LOCALIZATION[rawDept];
  const departmentFormatted = deptMap
    ? isAr
      ? deptMap.ar
      : deptMap.en
    : toTitleCase(job.department) || (isAr ? 'عام' : 'General');

  const rawLocation = (job.location || '').trim();
  const locationFormatted = rawLocation
    ? toTitleCase(rawLocation)
    : isAr
    ? 'الدوحة، قطر'
    : 'Doha, Qatar';

  const rawType = (job.type || 'FULL_TIME').replace(/_/g, ' ');
  const typeFormatted = toTitleCase(rawType);

  const displayTitle = isAr ? cleanTitleAr : cleanTitleEn;

  return {
    id: job.id || '',
    title: displayTitle,
    titleEn: cleanTitleEn,
    titleAr: cleanTitleAr,
    department: departmentFormatted,
    location: locationFormatted,
    type: typeFormatted,
    description: job.description || '',
    requirements: job.requirements || '',
    deadline: job.deadline ? new Date(job.deadline).toISOString() : null,
    isPublished: Boolean(job.isPublished),
    createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * Analyzes the data quality of a job record for staff-only inspection warnings.
 * Does NOT mutate the stored record.
 */
export function analyzeJobDataQuality(job: CanonicalJobInput): DataQualityReport {
  const issues: DataQualityIssue[] = [];

  const rawTitle = (job.title || job.titleEn || '').trim();
  const rawTitleAr = (job.titleAr || '').trim();
  const rawDept = (job.department || '').trim();
  const rawLocation = (job.location || '').trim();
  const rawDesc = (job.description || '').trim();

  // 1. Lowercase text check
  if (rawTitle && rawTitle === rawTitle.toLowerCase() && rawTitle.length > 2) {
    issues.push({
      field: 'title',
      code: 'LOWERCASE_TEXT',
      severity: 'warning',
      messageEn: `Job title "${rawTitle}" is in all-lowercase. Formatter will display as "${toTitleCase(rawTitle)}".`,
      messageAr: `عنوان الوظيفة "${rawTitle}" مكتوب بأحرف صغيرة بالكامل. سيتم عرضه بصيغة "${toTitleCase(rawTitle)}".`,
    });
  }

  if (rawDept && rawDept === rawDept.toLowerCase() && rawDept.length > 2) {
    issues.push({
      field: 'department',
      code: 'LOWERCASE_TEXT',
      severity: 'info',
      messageEn: `Department "${rawDept}" is in lowercase. Presentation will use "${toTitleCase(rawDept)}".`,
      messageAr: `القسم "${rawDept}" مكتوب بأحرف صغيرة. سيتم عرضه بصيغة "${toTitleCase(rawDept)}".`,
    });
  }

  if (rawLocation && rawLocation === rawLocation.toLowerCase() && rawLocation.length > 2) {
    issues.push({
      field: 'location',
      code: 'LOWERCASE_TEXT',
      severity: 'info',
      messageEn: `Location "${rawLocation}" is in lowercase. Presentation will use "${toTitleCase(rawLocation)}".`,
      messageAr: `الموقع "${rawLocation}" مكتوب بأحرف صغيرة. سيتم عرضه بصيغة "${toTitleCase(rawLocation)}".`,
    });
  }

  // 2. Missing Arabic title check
  if (!rawTitleAr) {
    issues.push({
      field: 'titleAr',
      code: 'MISSING_ARABIC',
      severity: 'warning',
      messageEn: 'Arabic job title is missing. Arabic portal will display translated/fallback title.',
      messageAr: 'عنوان الوظيفة بالعربية مفقود. ستعرض البوابة العربية العنوان المترجم كبديل.',
    });
  }

  // 3. Missing Location check
  if (!rawLocation) {
    issues.push({
      field: 'location',
      code: 'MISSING_LOCATION',
      severity: 'info',
      messageEn: 'Location is not specified. Will display default "Doha, Qatar".',
      messageAr: 'لم يتم تحديد الموقع. سيتم عرض "الدوحة، قطر" بشكل افتراضي.',
    });
  }

  // 4. Missing Deadline check
  if (!job.deadline) {
    issues.push({
      field: 'deadline',
      code: 'MISSING_DEADLINE',
      severity: 'info',
      messageEn: 'No application deadline specified. Position will remain open until manually closed.',
      messageAr: 'لم يُحدد موعد نهائي للتقديم. ستظل الوظيفة متاحة حتى إغلاقها يدوياً.',
    });
  } else if (isDeadlineExpired(job.deadline)) {
    issues.push({
      field: 'deadline',
      code: 'EXPIRED_DEADLINE',
      severity: 'warning',
      messageEn: 'Application deadline has elapsed (Qatar Time). Public submissions are blocked.',
      messageAr: 'انتهى الموعد النهائي للتقديم (بتوقيت قطر). التقديم العام محظور حالياً.',
    });
  }

  // 5. Short description check
  if (rawDesc.length < 30) {
    issues.push({
      field: 'description',
      code: 'SHORT_DESCRIPTION',
      severity: 'warning',
      messageEn: 'Job description is very brief or incomplete.',
      messageAr: 'الوصف الوظيفي مقتضب جداً أو غير مكتمل.',
    });
  }

  // Calculate score
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === 'warning') score -= 20;
    if (issue.severity === 'info') score -= 10;
  }
  score = Math.max(0, score);

  return {
    isClean: issues.length === 0,
    score,
    issues,
  };
}
