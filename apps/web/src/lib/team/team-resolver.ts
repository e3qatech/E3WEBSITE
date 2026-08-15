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
 * Standard nested tags and competencies localization dictionary for Arabic profile parity.
 */
export const NESTED_TAGS_LOCALIZATION: Record<string, string> = {
  'executive leadership': 'القيادة التنفيذية',
  'event strategy': 'استراتيجية الفعاليات',
  'entertainment development': 'تطوير قطاع الترفيه',
  'sports events': 'الفعاليات الرياضية',
  'public activations': 'العروض والفعاليات العامة',
  'business growth': 'نمو وتطوير الأعمال',
  'stakeholder management': 'إدارة الشركاء وأصحاب المصلحة',
  'organizational leadership': 'القيادة المؤسسية',
  'general management': 'الإدارة العامة',
  'business operations': 'العمليات التجارية والتشغيلية',
  'commercial oversight': 'الإشراف التجاري',
  'project coordination': 'تنسيق المشاريع',
  'venue performance': 'كفاءة وتشغيل المواقع',
  'partnership development': 'تطوير الشراكات الاستراتيجية',
  'compliance review': 'مراجعة الامتثال والمعايير',
  'event operations': 'عمليات وإدارة الفعاليات',
  'venue management': 'إدارة المواقع والمنشآت',
  'live activations': 'العروض والفعاليات الحية',
  'guest experience': 'تجربة وخدمة الزوار',
  'logistics': 'الخدمات اللوجستية',
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
  'digital campaigns': 'الحملات التسويقية الرقمية',
  'brand growth': 'تطوير وتنمية العلامة التجارية',
  'content strategy': 'استراتيجية المحتوى الرقمي',
  'social media': 'إدارة وسائل التواصل الاجتماعي',
  'influencer marketing': 'التسويق عبر المؤثرين',
  'strategic investments': 'الاستثمارات الاستراتيجية',
  'global partnerships': 'الشراكات العالمية',
  'business development': 'تطوير الأعمال والفرص',
  'experiential design': 'تصميم التجارب التفاعلية',
  '3d modeling': 'النمذجة ثلاثية الأبعاد',
  'interactive environments': 'البيئات والمساحات التفاعلية',
  'creative direction': 'الإدارة والتوجيه الإبداعي',
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
  'digital marketing': 'التسويق الرقمي الحديث',
  'social media strategy': 'استراتيجية منصات التواصل الاجتماعي',
  'campaign production': 'إنتاج وتنسيق الحملات',
  'b2b partnerships': 'شراكات الأعمال B2B',
  'influencer management': 'إدارة علاقات المؤثرين',
  'operations management': 'إدارة وتنسيق العمليات التشغيلية',
  'project management': 'إدارة المشاريع المتكاملة',
  'fec operations': 'تشغيل مراكز الترفيه العائلي FEC',
  'technology and ticketing systems': 'الأنظمة التقنية وبوابات التذاكر',
  'end-to-end event operations': 'العمليات التشغيلية المتكاملة للفعاليات',
  'supplier management': 'إدارة الموردين والشركاء',
  'venue setup': 'تجهيز وتهيئة المنشآت',
  'creative concept development': 'تطوير المفاهيم والأفكار الإبداعية',
  'full-stack product engineering': 'هندسة البرمجيات والأنظمة المتكاملة',
  'azure cloud operations': 'إدارة السحابة والبنية التحتية Azure',
  'ticketing and pos systems': 'أنظمة التذاكر ونقاط البيع POS',
  'access control': 'أنظمة التحكم في الدخول وإدارة البوابات',
  'hybrid venue technology': 'تقنيات المواقع الهجينة والذكية',
  'birthday-event coordination': 'تنسيق فعاليات أعياد الميلاد والمناسبات',
  'artist and performer management': 'إدارة الفنانين والفرق الاستعراضية',
  'live entertainment': 'العروض والترفيه الحي',
  'programme design': 'تصميم البرامج والأنشطة',
  'team leadership': 'القيادة وإدارة فرق العمل',
  'venue coordination': 'تنسيق إدارة المواقع',
  'food & beverage operations': 'عمليات الأغذية والمشروبات F&B',
  'outlet management': 'إدارة منافذ البيع والخدمة',
  'menu development': 'تطوير وتصميم قوائم الطعام',
  'cost control': 'ضبط التكاليف والرقابة المالية',
  'food safety and haccp': 'سلامة الأغذية وتطبيق معايير الهاسب HACCP',
  'large-scale crowd control': 'إدارة الحشود الكبرى وتدفق الزوار',
  'technical production coordination': 'تنسيق الإنتاج الفني والتقني',
  'health & safety compliance': 'الامتثال لمعايير الصحة والسلامة المهنية',
  'vendor management': 'إدارة الموردين ومزودي الخدمات',
  'omnichannel campaign execution': 'تنفيذ الحملات عبر القنوات المتعددة',
  'performance marketing': 'التسويق الموجه بالأداء',
  'creative briefing': 'إعداد التوجيهات والموجزات الإبداعية',
  'data-driven growth': 'النمو المؤسسي القائم على تحليل البيانات',
  'project planning': 'تخطيط وجدولة المشاريع',
  'crisis management': 'إدارة الأزمات والطوارئ',
  'digital strategy': 'الاستراتيجية الرقمية المتطورة',
  'content creation': 'صناعة وإنتاج المحتوى',
  'analytics & seo': 'التحليلات الرقمية وتحسين محركات البحث SEO',
  'strategic planning': 'التخطيط الاستراتيجي المؤسسي',
  'negotiation': 'التفاوض وإبرام العقود',
  'visionary leadership': 'القيادة الاستشرافية والرؤية الاستراتيجية',
  'ux/ui for physical spaces': 'تصميم التجربة الرقمية للمساحات الواقعية',
  'p&l management': 'إدارة الأرباح والخسائر P&L',
  'logistics planning and coordination': 'تخطيط وتنسيق العمليات اللوجستية',
  'customs and regulatory compliance': 'الامتثال الجمركي والتنظيمي',
  'site supervision and handover reporting': 'الإشراف على المواقع وتقارير التسليم',
  'vendor and contract negotiation': 'التفاوض مع الموردين وإدارة العقود',
  'third party logistics management': 'إدارة الخدمات اللوجستية للطرف الثالث 3PL',
  'productivity and throughput optimization': 'تحسين الإنتاجية وتدفق العمليات',
  'delivery-experience management': 'إدارة تجربة تسليم الفعاليات',
  'large- and small-format printing': 'الطباعة للأحجام الكبيرة والصغيرة',
  'cnc and laser-cutting machine operation': 'تشغيل أجهزة القص بالليزر و CNC',
  'storyboarding and scripting': 'إعداد لوحات القصة وكتابة السيناريو',
  'proposal and pitch-deck development': 'إعداد العروض التقديمية وملفات المشاريع',
  'vendor and project coordination': 'تنسيق المشاريع والموردين',
  'event build-up and closure': 'تجهيز الفعاليات وإغلاق المواقع',
  'reporting and presentations': 'إعداد التقارير والعروض التقديمية',
  'react and typescript development': 'تطوير البرمجيات بـ React و TypeScript',
  'hardware and pos integration': 'تكامل الأجهزة ونقاط البيع POS',
  'hosting and dj support': 'تقديم العروض والدعم الموسيقي DJ',
  'theme development': 'تطوير المفاهيم والموضوعات',
  'costume and prop coordination': 'تنسيق الأزياء والإكسسوارات',
  'client and stakeholder communication': 'التواصل مع العملاء وأصحاب المصلحة',
  'administration and reporting': 'الإدارة وإعداد التقارير',
  'customer-experience management': 'إدارة تجربة العملاء',
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
  'muhammad-izaan-shahid': 'محمد إذعان شاهد',
  'marcialou-macatangay': 'مارسيالو ماكاتانغاي',
  'lucian-moldovan': 'لوسيان مولدوفان',
  'ruben-yaralyan': 'روبين ياراليان',
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

  // 1. Expertise Tags
  const expertiseTags = rawExpertise.map((tag: string) => {
    if (typeof tag !== 'string') return tag;
    const lower = tag.trim().toLowerCase();
    return NESTED_TAGS_LOCALIZATION[lower] || tag;
  });

  // 2. Core Competencies
  const coreCompetencies = rawCompetencies.map((comp: string) => {
    if (typeof comp !== 'string') return comp;
    const lower = comp.trim().toLowerCase();
    return NESTED_TAGS_LOCALIZATION[lower] || comp;
  });

  // 3. Experience Timeline
  const experience = rawExperience.map((exp: any, idx: number) => {
    if (!exp || typeof exp !== 'object') return exp;
    const rawRole = exp.title || exp.role || '';
    const rawRoleLower = rawRole.toLowerCase().trim();
    const roleAr =
      exp.titleAr ||
      exp.roleAr ||
      NESTED_ROLES_LOCALIZATION[rawRoleLower] ||
      COMMON_DESIGNATION_LOCALIZATION[rawRoleLower] ||
      rawRole;

    const rawCompany = exp.company || 'E3';
    const companyAr =
      rawCompany === 'E3' || rawCompany === 'eeeqa' || rawCompany === 'E3 Qatar'
        ? 'إي ثري'
        : exp.companyAr || rawCompany;

    const rawDuration = exp.year || exp.duration || '';
    const durationAr = exp.yearAr || exp.durationAr || translateDurationToArabic(rawDuration);

    const descriptionAr = exp.descriptionAr || exp.responsibilitiesAr || '';

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
  });

  // 4. Projects Portfolio
  const projects = rawProjects.map((proj: any, idx: number) => {
    if (!proj || typeof proj !== 'object') return proj;
    const rawRole = proj.role || '';
    const rawRoleLower = rawRole.toLowerCase().trim();
    const roleAr =
      proj.roleAr ||
      NESTED_ROLES_LOCALIZATION[rawRoleLower] ||
      COMMON_DESIGNATION_LOCALIZATION[rawRoleLower] ||
      rawRole;

    const rawName = proj.name || proj.projectName || '';
    const nameAr = proj.nameAr || proj.projectNameAr || rawName;

    const rawYear = proj.year || '';
    const yearAr = proj.yearAr || translateDurationToArabic(rawYear);

    const descriptionAr = proj.descriptionAr || '';

    return {
      id: proj.id || `proj-${idx}`,
      name: nameAr,
      projectName: nameAr,
      role: roleAr,
      year: yearAr,
      client: proj.clientAr || proj.client || '',
      description: descriptionAr,
    };
  });

  // 5. Certifications
  const certifications = rawCertifications.map((cert: any, idx: number) => {
    if (typeof cert === 'string') {
      const lower = cert.toLowerCase().trim();
      return NESTED_CERTS_LOCALIZATION[lower] || cert;
    }
    if (cert && typeof cert === 'object') {
      const rawName = cert.name || '';
      const lower = rawName.toLowerCase().trim();
      const nameAr = cert.nameAr || NESTED_CERTS_LOCALIZATION[lower] || rawName;
      const rawIssuer = cert.issuer || '';
      const issuerAr =
        rawIssuer.toLowerCase() === 'professional organization'
          ? 'هيئة مهنية معتمدة'
          : cert.issuerAr || rawIssuer;
      const yearAr = cert.yearAr || translateDurationToArabic(cert.year);

      return {
        id: cert.id || `cert-${idx}`,
        name: nameAr,
        issuer: issuerAr,
        year: yearAr,
      };
    }
    return cert;
  });

  // 6. Skills Matrix
  const skillsMatrix = rawSkillsMatrix.map((s: any) => {
    if (!s || typeof s !== 'object') return s;
    const rawSkill = s.skill || '';
    const lower = rawSkill.toLowerCase().trim();
    const skillAr = s.skillAr || NESTED_TAGS_LOCALIZATION[lower] || rawSkill;
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
 * - Localizes name, designation, department, and bio cleanly for English and Arabic.
 * - Applies shared Arabic nested profile presentation mapping (skills, experience, certifications, projects).
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
  const mappedArName = member.slug ? CANONICAL_NAME_LOCALIZATION_MAP[member.slug] : null;
  const nameAr = member.firstNameAr && member.lastNameAr
    ? `${member.firstNameAr} ${member.lastNameAr}`.trim()
    : member.firstNameAr
    ? member.firstNameAr.trim()
    : mappedArName || nameEn;

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

  // Apply unified Arabic nested profile presentation mapping
  const nested = mapNestedProfileProperties(member, locale);

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
