/**
 * QF-10: Canonical CMS Page Ownership Registry
 * Maps managed slugs to their canonical specialized editors and APIs.
 */

export interface ManagedPageRegistryEntry {
  slug: string;
  nameEn: string;
  nameAr: string;
  specializedEditorPath: string;
  canonicalApiEndpoint: string;
  domain: 'B2C' | 'B2B' | 'SYSTEM';
  descriptionEn: string;
  descriptionAr: string;
  isSpecialized: true;
}

export const MANAGED_CMS_PAGES: Record<string, ManagedPageRegistryEntry> = {
  'b2c-landing': {
    slug: 'b2c-landing',
    nameEn: 'B2C Landing Page (7 Acts)',
    nameAr: 'الصفحة الرئيسية لزوار إي ثري (٧ فصول)',
    specializedEditorPath: '/dashboard/b2c/landing',
    canonicalApiEndpoint: '/api/cms/pages/b2c-landing',
    domain: 'B2C',
    descriptionEn: 'Full 7-Act interactive experience, attractions constellation, living day timeline, and kinetic scenes.',
    descriptionAr: 'تجربة الفصول السبعة التفاعلية، كوكبة الوجهات، جدول الفعاليات الحي والمشاهد الحركية.',
    isSpecialized: true,
  },
  'b2c-discover': {
    slug: 'b2c-discover',
    nameEn: 'B2C Discover & Stories Explorer',
    nameAr: 'مستكشف تجارب وقصص الزوار',
    specializedEditorPath: '/dashboard/b2c/discover',
    canonicalApiEndpoint: '/api/b2c/discover-settings',
    domain: 'B2C',
    descriptionEn: 'Filter taxonomy, story discovery portals, category hubs, and search spotlight configurations.',
    descriptionAr: 'تصنيفات الاستكشاف، بوابات القصص، محاور الفئات، وإعدادات البحث التفاعلي.',
    isSpecialized: true,
  },
  'b2b-home': {
    slug: 'b2b-home',
    nameEn: 'B2B Corporate Homepage',
    nameAr: 'بوابة الشركات والأعمال الرئيسية',
    specializedEditorPath: '/dashboard/b2b/home',
    canonicalApiEndpoint: '/api/cms/pages/b2b-home',
    domain: 'B2B',
    descriptionEn: 'Enterprise capability pillars, turnkey event engineering, value propositions, and partner showcase.',
    descriptionAr: 'ركائز القدرات المؤسسية، هندسة الفعاليات المتكاملة، عروض القيمة، ومعرض الشركاء.',
    isSpecialized: true,
  },
  'b2b-services': {
    slug: 'b2b-services',
    nameEn: 'B2B Services Overview Page',
    nameAr: 'صفحة خدمات وحلول الأعمال',
    specializedEditorPath: '/dashboard/b2b/services-page',
    canonicalApiEndpoint: '/api/cms/pages/b2b-services',
    domain: 'B2B',
    descriptionEn: 'Structured service offerings header, process steps, engagement models, and enterprise consultation CTAs.',
    descriptionAr: 'واجهة عروض الخدمات، خطوات العمليات، نماذج التعاقد، ودعوات استشارات الشركات.',
    isSpecialized: true,
  },
  'b2b-cases': {
    slug: 'b2b-cases',
    nameEn: 'B2B Case Studies Landing',
    nameAr: 'صفحة دراسات الحالة والمشاريع',
    specializedEditorPath: '/dashboard/b2b/cases-page',
    canonicalApiEndpoint: '/api/cms/pages/b2b-cases',
    domain: 'B2B',
    descriptionEn: 'Portfolio showcase header, filter tags, impact metrics, and project spotlights.',
    descriptionAr: 'واجهة استعراض المشاريع، وسوم التصفية، مقاييس الأثر، وأبرز الإنجازات المؤسسية.',
    isSpecialized: true,
  },
  'pulse-orbit': {
    slug: 'pulse-orbit',
    nameEn: 'Pulse Orbit Destinations (B2C & B2B)',
    nameAr: 'وجهات مدار إي ثري',
    specializedEditorPath: '/dashboard/b2c/pulse-orbit',
    canonicalApiEndpoint: '/api/cms/pages/pulse-orbit',
    domain: 'SYSTEM',
    descriptionEn: 'Orbit destination maps, planetary nodes, and immersive constellation hubs.',
    descriptionAr: 'خرائط وجهات المدار، العقد الفضائية، والمحاور التفاعلية.',
    isSpecialized: true,
  },
  'b2c-pulse-orbit': {
    slug: 'b2c-pulse-orbit',
    nameEn: 'B2C Pulse Orbit Destinations',
    nameAr: 'نبض فعاليات الزوار (B2C)',
    specializedEditorPath: '/dashboard/b2c/pulse-orbit',
    canonicalApiEndpoint: '/api/cms/pages/b2c-pulse-orbit',
    domain: 'B2C',
    descriptionEn: 'B2C entertainment orbit destinations, 3D modal navigation, and tickets CTA.',
    descriptionAr: 'وجهات مدار الفعاليات للأفراد، القائمة التفاعلية ثلاثية الأبعاد، وزر حجز التذاكر.',
    isSpecialized: true,
  },
  'b2b-pulse-orbit': {
    slug: 'b2b-pulse-orbit',
    nameEn: 'B2B Enterprise Pulse Orbit',
    nameAr: 'نبض شركات وقطاع الأعمال (B2B)',
    specializedEditorPath: '/dashboard/b2b/pulse-orbit',
    canonicalApiEndpoint: '/api/cms/pages/b2b-pulse-orbit',
    domain: 'B2B',
    descriptionEn: 'B2B corporate orbit destinations, enterprise solutions showcase, and RFP CTA.',
    descriptionAr: 'وجهات مدار قطاع الأعمال والشركات، واستعراض الحلول، وزر طلب العروض.',
    isSpecialized: true,
  },
  'b2c-packages-page': {
    slug: 'b2c-packages-page',
    nameEn: 'B2C Packages & Celebrations Page',
    nameAr: 'صفحة باقات واحتفالات الزوار',
    specializedEditorPath: '/dashboard/b2c/packages-page',
    canonicalApiEndpoint: '/api/cms/pages/b2c-packages-page',
    domain: 'B2C',
    descriptionEn: 'Packages landing layout, universal hero/footer media, CTAs, campaign badges, and SEO metadata.',
    descriptionAr: 'تصميم صفحة الباقات، وسائط الهيدر والتذييل، أزرار الحجز وشارات الفعاليات والبيانات الوصفية.',
    isSpecialized: true,
  },
  'b2c-packages': {
    slug: 'b2c-packages',
    nameEn: 'B2C Packages Page (Alias)',
    nameAr: 'صفحة باقات الزوار (اسم بديل)',
    specializedEditorPath: '/dashboard/b2c/packages-page',
    canonicalApiEndpoint: '/api/cms/pages/b2c-packages-page',
    domain: 'B2C',
    descriptionEn: 'Alias for B2C Packages & Celebrations Page Editor.',
    descriptionAr: 'اسم بديل لمحرر صفحة باقات واحتفالات الزوار.',
    isSpecialized: true,
  },
};

/**
 * Checks whether a given slug has a canonical specialized editor.
 */
export function isManagedCMSPage(slug?: string | null): boolean {
  if (!slug) return false;
  return Boolean(MANAGED_CMS_PAGES[slug]);
}

/**
 * Retrieves the registry entry for a managed page slug.
 */
export function getManagedCMSPage(slug?: string | null): ManagedPageRegistryEntry | null {
  if (!slug) return null;
  return MANAGED_CMS_PAGES[slug] || null;
}

/**
 * Returns all managed pages for directory listings and audit checks.
 */
export function getAllManagedCMSPages(): ManagedPageRegistryEntry[] {
  return Object.values(MANAGED_CMS_PAGES);
}
