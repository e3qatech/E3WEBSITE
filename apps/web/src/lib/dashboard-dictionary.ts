/**
 * Centralized dashboard localization dictionary for E3 Qatar.
 * Covers shared breadcrumbs, headers, section navigators, control labels, and theme settings.
 */

export const DASHBOARD_SEGMENT_MAP: Record<string, { en: string; ar: string }> = {
  dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  b2c: { en: "B2C Experience", ar: "الأفراد والتجارب" },
  b2b: { en: "B2B Enterprise", ar: "الأعمال والمشاريع" },
  settings: { en: "Settings", ar: "الإعدادات" },
  general: { en: "General Settings", ar: "الإعدادات العامة" },
  gateway: { en: "Portal Gateway", ar: "بوابة الدخول" },
  packages: { en: "Packages & Events", ar: "الباقات والاحتفالات" },
  "packages-page": { en: "Packages Page Editor", ar: "محرر صفحة الباقات" },
  attractions: { en: "Attractions", ar: "الوجهات والتجارب" },
  "attractions-page": { en: "Attractions Page Editor", ar: "محرر صفحة التجارب" },
  calendar: { en: "Calendar & Schedule", ar: "جدول المواعيد والفعاليات" },
  "calendar-page": { en: "Calendar Page Editor", ar: "محرر صفحة الفعاليات" },
  contact: { en: "Contact Page", ar: "صفحة التواصل" },
  landing: { en: "Landing Page Editor", ar: "محرر الصفحة الرئيسية" },
  discover: { en: "Discover Page Editor", ar: "محرر صفحة الاستكشاف" },
  locations: { en: "Locations & Map GIS", ar: "المواقع والخرائط" },
  brands: { en: "Brands Showcase", ar: "العلامات التجارية" },
  content: { en: "Content Management", ar: "إدارة المحتوى" },
  crm: { en: "CRM & Inquiries", ar: "إدارة العملاء والاستفسارات" },
  leads: { en: "Leads Pipeline", ar: "العملاء المحتملين" },
  inquiries: { en: "Inquiries Inbox", ar: "صندوق الاستفسارات" },
  clients: { en: "Clients Directory", ar: "دليل العملاء" },
  "clients-page": { en: "Clients Page Editor", ar: "محرر صفحة العملاء" },
  subscribers: { en: "Subscribers List", ar: "قائمة المشتركين" },
  talent: { en: "Talent Pool", ar: "كفاءات التوظيف" },
  careers: { en: "Careers & Jobs", ar: "وظائف E3" },
  applications: { en: "Job Applications", ar: "طلبات التوظيف" },
  operations: { en: "Operations", ar: "العمليات التشغيلية" },
  broadcast: { en: "Broadcast Alerts", ar: "البث والتنبيهات" },
  catalog: { en: "Event Catalog", ar: "دليل الفعاليات" },
  recap: { en: "Event Recaps", ar: "تقارير الفعاليات" },
  "temporal-rules": { en: "Temporal Rules", ar: "القواعد الزمنية" },
  ticketing: { en: "Ticketing & Gates", ar: "التذاكر والبوابات" },
  partners: { en: "Partners Directory", ar: "دليل الشركاء" },
  "social-media": { en: "Social Media Manager", ar: "إدارة التواصل الاجتماعي" },
  insights: { en: "Insights & Analytics", ar: "التحليلات والمؤشرات" },
  seo: { en: "SEO & Metadata", ar: "محركات البحث والبيانات الوصفية" },
  ui: { en: "UI & Themes", ar: "واجهة المستخدم والمظهر" },
  approvals: { en: "Approval Workflows", ar: "سير الموافقات" },
  "pulse-orbit": { en: "Security Pulse Orbit", ar: "أمان واستقرار المنصة" },
  users: { en: "User Management", ar: "إدارة المستخدمين" },
  cms: { en: "CMS Central", ar: "إدارة المحتوى المركزي" },
  media: { en: "Media Library", ar: "مكتبة الوسائط" },
  services: { en: "Services & Solutions", ar: "الخدمات والحلول" },
  "services-page": { en: "Services Page Editor", ar: "محرر صفحة الخدمات" },
  cases: { en: "Case Studies", ar: "دراسات الحالة" },
  "cases-page": { en: "Case Studies Page Editor", ar: "محرر صفحة دراسات الحالة" },
  team: { en: "Team Management", ar: "إدارة فريق العمل" },
  "team-page": { en: "Team Page Editor", ar: "محرر صفحة الفريق" },
  faqs: { en: "B2B FAQs Editor", ar: "محرر الأسئلة الشائعة" },
  feedback: { en: "Client Feedback", ar: "آراء وتقييمات العملاء" },
  about: { en: "About E3 Page", ar: "صفحة عن إي ثري" },
  new: { en: "Create New", ar: "إضافة جديد" },
  edit: { en: "Edit Item", ar: "تعديل" },
};

export const DASHBOARD_SHARED_CONTROLS = {
  jumpTo: { en: "Jump to", ar: "الانتقال السريع" },
  allSections: { en: "All Sections", ar: "جميع الأقسام" },
  prevSection: { en: "Previous Section", ar: "القسم السابق" },
  nextSection: { en: "Next Section", ar: "القسم التالي" },
  saveSettings: { en: "Save Settings", ar: "حفظ الإعدادات" },
  saving: { en: "Saving...", ar: "جاري الحفظ..." },
  saved: { en: "Saved", ar: "تم الحفظ" },
  unsavedChanges: { en: "Unsaved changes", ar: "تغييرات غير محفوظة" },
  previewPublicPage: { en: "Preview Public Page", ar: "معاينة الصفحة العامة" },
  publishLive: { en: "Publish Live", ar: "نشر مباشر" },
  publishing: { en: "Publishing...", ar: "جاري النشر..." },
  saveDraft: { en: "Save Draft", ar: "حفظ مسودة" },
  themePreference: { en: "Theme Preference", ar: "تفضيل المظهر" },
  themeLight: { en: "Light", ar: "فاتح" },
  themeDark: { en: "Dark", ar: "داكن" },
  themeSystem: { en: "System", ar: "تلقائي (النظام)" },
  switchLanguage: { en: "Switch to Arabic", ar: "التحويل إلى الإنجليزية" },
  searchPlaceholder: { en: "Search Command Center...", ar: "البحث في لوحة التحكم..." },
  openMenu: { en: "Open Navigation Menu", ar: "فتح قائمة التنقل" },
  selectSection: { en: "Select Section", ar: "اختر القسم" },
  containsUnsaved: { en: "Section contains unsaved edits", ar: "يحتوي هذا القسم على تعديلات غير محفوظة" },
  containsErrors: { en: "Section contains validation errors", ar: "توجد أخطاء تحقق في هذا القسم" },
};

export const GENERAL_SETTINGS_SECTIONS: Record<string, { en: string; ar: string }> = {
  identity: { en: "1. Site Identity", ar: "1. هوية المنصة" },
  branding: { en: "2. Logos & Favicon", ar: "2. الشعارات والأيقونة" },
  contact: { en: "3. Contact Info", ar: "3. بيانات التواصل" },
  social: { en: "4. Social Channels", ar: "4. قنوات التواصل الاجتماعي" },
  tickets: { en: "5. Ticket CTA Bar", ar: "5. شريط حجز التذاكر" },
  integrations: { en: "6. API Gateways", ar: "6. بوابات الربط البرمجي (API)" },
  gateway: { en: "7. Gateway Hero Split", ar: "7. واجهة تقسيم بوابة الدخول" },
};

export const PACKAGES_PAGE_SECTIONS: Record<string, { en: string; ar: string }> = {
  headlines: { en: "1. Hero Copy & Headlines", ar: "1. العناوين والنصوص الترويجية" },
  ctas: { en: "2. CTAs, Pricing & Badges", ar: "2. أزرار الحجز والأسعار والشارات" },
  "hero-media": { en: "3. Hero Media Background", ar: "3. خلفية الوسائط الرئيسية" },
  "footer-media": { en: "4. Footer Media & Poster", ar: "4. وسائط وخلفية التذييل" },
};

export const GATEWAY_PAGE_SECTIONS: Record<string, { en: string; ar: string }> = {
  english: { en: "1. English Content", ar: "1. المحتوى الإنجليزي" },
  arabic: { en: "2. Arabic Content", ar: "2. المحتوى العربي" },
  logo: { en: "3. Logo & Branding", ar: "3. الشعار والهوية البصرية" },
  b2c_media: { en: "4. B2C Media Assets", ar: "4. وسائط بوابة الأفراد (B2C)" },
  b2b_media: { en: "5. B2B Media Assets", ar: "5. وسائط بوابة الأعمال (B2B)" },
  visual: { en: "6. Visual & Behaviour", ar: "6. المظهر والتفاعل البصري" },
  seo: { en: "7. SEO & Accessibility", ar: "7. محركات البحث وإمكانية الوصول" },
  preview: { en: "8. Live Preview Simulator", ar: "8. محاكي المعاينة المباشرة" },
  versions: { en: "9. Version History", ar: "9. سجل الإصدارات والاسترجاع" },
};

/**
 * Returns localized text for a dashboard path segment.
 */
export function getBreadcrumbTranslation(segment: string, locale: string = "en"): string {
  const clean = segment.toLowerCase().trim();
  const found = DASHBOARD_SEGMENT_MAP[clean];
  if (found) {
    return locale === "ar" ? found.ar : found.en;
  }
  // Fallback: format slug cleanly
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

/**
 * Returns localized text for a shared control key.
 */
export function getDashboardControlTranslation(
  key: keyof typeof DASHBOARD_SHARED_CONTROLS,
  locale: string = "en"
): string {
  const item = DASHBOARD_SHARED_CONTROLS[key];
  if (!item) return key;
  return locale === "ar" ? item.ar : item.en;
}
