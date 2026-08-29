"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Save,
  ExternalLink,
  Sliders,
  ShieldCheck,
  Info,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Video,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { MediaUploader } from "@/components/shared/MediaUploader";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardUnsavedChangesGuard,
  DashboardLanguageSwitch,
  LanguageEditMode,
  EditorSectionItem,
} from "@/components/dashboard/ui";
import {
  ServiceCmsPayload,
  CANONICAL_SERVICE_SLUGS,
  SpecialistModuleType,
  DeliverablesLayoutVariant,
  ServiceGalleryItemPayload,
} from "@/lib/services/canonical-services";
import { cn } from "@/lib/utils";

const SECTIONS: EditorSectionItem[] = [
  { id: "overview", label: "1. Overview & Status", labelAr: "١. نظرة عامة والحالة" },
  { id: "presentation", label: "2. Presentation & Personality", labelAr: "٢. النمط البصري والهوية" },
  { id: "general", label: "3. General Info", labelAr: "٣. المعلومات الأساسية" },
  { id: "hero", label: "4. Hero & Structured Media", labelAr: "٤. الواجهة والوسائط المنظمة" },
  { id: "wowHow", label: "5. WOW & HOW", labelAr: "٥. فلسفة الإبهار والتنفيذ" },
  { id: "objectives", label: "6. Objectives", labelAr: "٦. أهداف المشروع" },
  { id: "capabilities", label: "7. Capabilities Bento", labelAr: "٧. مصفوفة القدرات" },
  { id: "projectMoment", label: "8. Project Moment", labelAr: "٨. الشاهد الميداني الكامل" },
  { id: "engagementModels", label: "9. Engagement Models", labelAr: "٩. نماذج التعاقد" },
  { id: "deliverables", label: "10. Deliverables", labelAr: "١٠. المخرجات الرسمية" },
  { id: "lifecycle", label: "11. Delivery Lifecycle", labelAr: "١١. دورة حياة المشروع" },
  { id: "gallery", label: "12. Production Gallery", labelAr: "١٢. المعرض البصري" },
  { id: "specialistModule", label: "13. Specialist Tool", labelAr: "١٣. الأداة التخصصية" },
  { id: "caseStudies", label: "14. Case Studies", labelAr: "١٤. دراسات الحالة المرتبطة" },
  { id: "claims", label: "15. Proof & Readiness", labelAr: "١٥. الجاهزية والاعتمادات" },
  { id: "relatedServices", label: "16. Related Services", labelAr: "١٦. الخدمات المتكاملة" },
  { id: "briefConfig", label: "17. Brief Configuration", labelAr: "١٧. إعدادات موجز المشروع" },
  { id: "sectionSettings", label: "18. Visibility & Order", labelAr: "١٨. ترتيب وإظهار الأقسام" },
  { id: "seo", label: "19. SEO & Social", labelAr: "١٩. محركات البحث والنشر" },
];

const DEFAULT_SECTIONS_ORDER = [
  "hero",
  "wowHow",
  "objectives",
  "capabilities",
  "projectMoment",
  "engagementModels",
  "deliverables",
  "specialistModule",
  "lifecycle",
  "gallery",
  "caseStudies",
  "enterpriseReadiness",
  "relatedSolutions",
];

const SPECIALIST_MODULE_TYPES: { id: SpecialistModuleType; labelEn: string; labelAr: string }[] = [
  { id: "scale-explorer", labelEn: "Mega Events Scale & Complexity Explorer", labelAr: "مستكشف حجم الفعالية وتعقيد الموقع" },
  { id: "fec-lifecycle", labelEn: "FEC Development Governance Framework", labelAr: "إطار حوكمة وتطوير المراكز الترفيهية" },
  { id: "kids-age-matrix", labelEn: "Age-Segmented Play Matrix & Standards", labelAr: "مصفوفة فئات اللعب والمعايير المعتمدة" },
  { id: "activation-mapper", labelEn: "Experiential Campaign Architecture", labelAr: "بنية التفعيلات والحملات التفاعلية" },
  { id: "performance-catalogue", labelEn: "Turnkey Performance Production Portfolio", labelAr: "ملف العروض والإنتاج المسرحي المتكامل" },
  { id: "av-venue-selector", labelEn: "Venue Audio-Visual & Staging Integration", labelAr: "تكامل الأنظمة الصوتية والمرئية والمسارح" },
  { id: "operations-sop-model", labelEn: "Operational Governance & SOP Hierarchy", labelAr: "الهيكل التشغيلي وإجراءات العمل القياسية" },
  { id: "ticketing-flow", labelEn: "BookingQube Ticketing & Access Architecture", labelAr: "بنية منصة بوكينج كيوب للتذاكر وإدارة الدخول" },
  { id: "fabrication-materials", labelEn: "Material Engineering & Scenic Fabrication", labelAr: "هندسة المواد والتصنيع الديكوري" },
  { id: "research-study-gates", labelEn: "4-Gate Strategic Investment Appraisal", labelAr: "منهجية تقييم الاستثمار ودراسات الجدوى" },
];

export function ServicesEditor({
  initialData,
  attractions = [],
  availableCaseStudies = [],
}: {
  initialData?: any;
  attractions?: { id: string; nameEn: string }[];
  availableCaseStudies?: any[];
}) {
  const router = useRouter();
  const isEditing = !!initialData?.id;
  void attractions;

  const [langMode, setLangMode] = useState<LanguageEditMode>("en");
  const activeLang = langMode === "ar" ? "ar" : "en";
  const isAr = activeLang === "ar";
  const [activeSectionId, setActiveSectionId] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [_lastSaved, setLastSaved] = useState<Date | null>(null);

  // Parse CMS Process payload
  const initialCms: ServiceCmsPayload = (() => {
    try {
      if (typeof initialData?.process === "object" && initialData?.process !== null) {
        return initialData.process;
      } else if (typeof initialData?.process === "string") {
        return JSON.parse(initialData.process);
      }
    } catch (_e) {}
    return {};
  })();

  // Core Form State
  const [formData, setFormData] = useState({
    titleEn: initialData?.titleEn || "",
    titleAr: initialData?.titleAr || "",
    slug: initialData?.slug || "",
    taglineEn: initialData?.taglineEn || "",
    taglineAr: initialData?.taglineAr || "",
    category: initialData?.category || "Enterprise Capability",
    isVisible: initialData?.isVisible !== false,
    isFeatured: initialData?.isFeatured || false,
    isPublished: initialData?.isPublished !== false,
    heroMediaType: initialData?.heroMediaType || "IMAGE",
    heroMediaUrl: initialData?.heroMediaUrl || "",
    thumbnail: initialData?.thumbnail || "",
    ctaPrimary: initialData?.ctaPrimary || "BRIEF_BUILDER",
    ctaSecondary: initialData?.ctaSecondary || "VIEW_WORK",
    attractionId: initialData?.attractionId || "",
    seo: initialData?.seo || { metaTitle: "", metaDescription: "", keywords: "", ogImage: "" },
  });

  // CMS Payload State
  const [cms, setCms] = useState<ServiceCmsPayload>({
    ...initialCms,
    sectionsOrder: initialCms.sectionsOrder && initialCms.sectionsOrder.length > 0
      ? initialCms.sectionsOrder
      : DEFAULT_SECTIONS_ORDER,
  });

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleCmsChange = (field: keyof ServiceCmsPayload, value: any) => {
    setCms((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async (overridePublished?: boolean) => {
    setIsSaving(true);
    try {
      const isPub = overridePublished !== undefined ? overridePublished : formData.isPublished;
      const payload = {
        ...formData,
        isPublished: isPub,
        process: cms,
      };

      const url = isEditing
        ? `/api/b2b/services/${initialData.id}`
        : `/api/b2b/services`;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save service");
      }

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      if (overridePublished !== undefined) {
        setFormData((prev) => ({ ...prev, isPublished: overridePublished }));
      }
      router.refresh();
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Reordering helpers for section ordering
  const moveSectionOrder = (index: number, direction: "up" | "down") => {
    const currentOrder = [...(cms.sectionsOrder || DEFAULT_SECTIONS_ORDER)];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;
    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;
    handleCmsChange("sectionsOrder", currentOrder);
  };

  // Reordering helpers for gallery
  const moveGalleryItem = (index: number, direction: "up" | "down") => {
    const items = [...(cms.galleryItems || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;
    handleCmsChange("galleryItems", items);
  };

  return (
    <DashboardPageShell>
      <DashboardUnsavedChangesGuard isDirty={hasUnsavedChanges} />

      <DashboardPageHeader
        title={formData.titleEn || (isAr ? "خدمة جديدة" : "New Service")}
        description={isAr ? "إدارة وتخصيص محتوى الخدمة التخصصية لقطاع الأعمال" : "B2B Enterprise capability configuration and specialist modules"}
      >
        <div className="flex flex-wrap items-center gap-3">
          <DashboardLanguageSwitch
            mode={langMode}
            onModeChange={setLangMode}
          />

          {isEditing && formData.slug && (
            <Link
              href={`/${activeLang}/b2b/services/${formData.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isAr ? "معاينة الصفحة الحية" : "View Public Page"}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--surface-default)] hover:bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{isAr ? "حفظ كمسودة" : "Save Draft"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-700/20 hover:shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ ونشر الخدمة" : "Save & Publish")}</span>
          </button>
        </div>
      </DashboardPageHeader>

      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSelectSection={setActiveSectionId}
      />

      <div className="p-6 md:p-8">
        {/* 1. OVERVIEW & STATUS */}
        {activeSectionId === "overview" && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                {isAr ? "حالة النشر والظهور" : "Publication & Visibility Controls"}
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => handleFieldChange("isPublished", e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold block text-[var(--text-primary)]">
                      {isAr ? "منشورة رسمياً" : "Published"}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {formData.isPublished ? (isAr ? "متاحة للعامة" : "Publicly Accessible") : (isAr ? "مسودة (404 للعامة)" : "Draft (404 for public)")}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => handleFieldChange("isVisible", e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold block text-[var(--text-primary)]">
                      {isAr ? "ظاهرة في القوائم" : "Visible in Directory"}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {isAr ? "تظهر في دليل القدرات" : "Listed in B2B navigator"}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => handleFieldChange("isFeatured", e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold block text-[var(--text-primary)]">
                      {isAr ? "خدمة مميزة" : "Featured Spotlight"}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {isAr ? "تظهر في قسم الخدمات المميزة" : "Highlighted in spotlight strip"}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Completeness & Parity Indicators */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? "اكتمال الوسائط البصرية" : "Media Completeness"}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-500">
                    {(() => {
                      let filled = 0;
                      if (formData.heroMediaUrl || cms.heroDesktopMediaUrl) filled++;
                      if (cms.heroMobileMediaUrl) filled++;
                      if (cms.directoryCardMediaUrl) filled++;
                      if (cms.navigatorFeatureMediaUrl) filled++;
                      if (cms.wowHow && cms.wowHow.length > 0) filled++;
                      if (cms.galleryItems && cms.galleryItems.length > 0) filled++;
                      return `${Math.round((filled / 6) * 100)}%`;
                    })()}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isAr ? "تحقق من وجود وسائط الواجهة لسطح المكتب والجوال، بطاقة الدليل، ومحتوى المعرض." : "Checks desktop/mobile hero media, directory card visuals, and production gallery assets."}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? "اكتمال الترجمة (عربي / إنجليزي)" : "Bilingual Parity Status"}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-500">
                    {(() => {
                      let filled = 0;
                      if (formData.titleEn && formData.titleAr) filled++;
                      if (formData.taglineEn && formData.taglineAr) filled++;
                      if (cms.heroOutcomeEn && cms.heroOutcomeAr) filled++;
                      if (cms.supportingStatementEn && cms.supportingStatementAr) filled++;
                      return `${Math.round((filled / 4) * 100)}%`;
                    })()}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isAr ? "تحقق من اكتمال النصوص المزدوجة باللغتين العربية والإنجليزية." : "Ensures all titles, outcomes, taglines, and descriptions have complete EN and AR parity."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRESENTATION & PERSONALITY */}
        {activeSectionId === "presentation" && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                  {isAr ? "تخصيص الهوية والنمط البصري (Presentation Options)" : "Visual Personality & Presentation Variants"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isAr
                    ? "اختر الألوان والأنماط المعمارية المناسبة لطبيعة هذه الخدمة."
                    : "Select controlled styling variants to give this service a distinct personality without breaking brand harmony."}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "اللون المميز (Accent Color):" : "Accent Color Theme:"}
                  </label>
                  <select
                    value={cms.presentation?.accentColor || "emerald"}
                    onChange={(e) =>
                      handleCmsChange("presentation", {
                        ...cms.presentation,
                        accentColor: e.target.value as any,
                      })
                    }
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold text-[var(--text-primary)]"
                  >
                    <option value="emerald">Emerald Green (Default / Operations)</option>
                    <option value="amber">Amber Gold (Festivals / Mega Events)</option>
                    <option value="cyan">Cyan Blue (Digital / Cloud Ticketing)</option>
                    <option value="violet">Violet Purple (Experiential / Shows)</option>
                    <option value="crimson">Crimson Red (High Energy / Attractions)</option>
                    <option value="orange">Orange Terracotta (Kids / Edutainment)</option>
                    <option value="gold">Royal Gold (Consulting & Feasibility)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "تكوين الواجهة (Hero Composition):" : "Hero Composition Layout:"}
                  </label>
                  <select
                    value={cms.presentation?.heroComposition || "fullscreen-cinematic"}
                    onChange={(e) =>
                      handleCmsChange("presentation", {
                        ...cms.presentation,
                        heroComposition: e.target.value as any,
                      })
                    }
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold text-[var(--text-primary)]"
                  >
                    <option value="fullscreen-cinematic">Fullscreen Cinematic (Full-Bleed Media with Gradients)</option>
                    <option value="split-media">Split Media (Text on Left / Large Frame on Right)</option>
                    <option value="centered">Centered Hero (Editorial Centered Focus)</option>
                    <option value="editorial-left">Editorial Left-Heavy (Minimalist Clean)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "تخطيط مصفوفة القدرات (Capabilities Layout):" : "Capabilities Bento Layout:"}
                  </label>
                  <select
                    value={cms.presentation?.capabilityLayout || "bento-grid"}
                    onChange={(e) =>
                      handleCmsChange("presentation", {
                        ...cms.presentation,
                        capabilityLayout: e.target.value as any,
                      })
                    }
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold text-[var(--text-primary)]"
                  >
                    <option value="bento-grid">Bento Grid (Asymmetric Highlight Tiles)</option>
                    <option value="asymmetric-cards">Asymmetric Cards (Staggered Dynamic Grid)</option>
                    <option value="feature-list">Feature List (Editorial Detailed Rows)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "تخطيط المخرجات (Deliverables Layout):" : "Deliverables Roster Layout:"}
                  </label>
                  <select
                    value={cms.presentation?.deliverablesLayout || "roster"}
                    onChange={(e) =>
                      handleCmsChange("presentation", {
                        ...cms.presentation,
                        deliverablesLayout: e.target.value as DeliverablesLayoutVariant,
                      })
                    }
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold text-[var(--text-primary)]"
                  >
                    <option value="roster">Standard Roster Cards</option>
                    <option value="accordion">Progressive Accordion (Expand / Collapse)</option>
                    <option value="grouped-tabs">Category Tabs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "تخطيط المعرض البصري (Gallery Layout):" : "Production Gallery Layout:"}
                  </label>
                  <select
                    value={cms.presentation?.galleryLayout || "grid"}
                    onChange={(e) =>
                      handleCmsChange("presentation", {
                        ...cms.presentation,
                        galleryLayout: e.target.value as any,
                      })
                    }
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold text-[var(--text-primary)]"
                  >
                    <option value="grid">Grid (Responsive Responsive Cards)</option>
                    <option value="filmstrip">Filmstrip (Horizontal Flow Carousel)</option>
                    <option value="featured">Featured Lead Tile</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. GENERAL INFO */}
        {activeSectionId === "general" && (
          <div className="space-y-6 max-w-4xl">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "اسم الخدمة (بالإنجليزية) *" : "Service Title (English) *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.titleEn}
                  onChange={(e) => handleFieldChange("titleEn", e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-bold text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "اسم الخدمة (بالعربية) *" : "Service Title (Arabic) *"}
                </label>
                <input
                  type="text"
                  required
                  dir="rtl"
                  value={formData.titleAr}
                  onChange={(e) => handleFieldChange("titleAr", e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-bold text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "المعرف الدائم (Slug) *" : "Canonical Slug *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => handleFieldChange("slug", e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-mono text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "التصنيف العام" : "Category Badge"}
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "الوصف المختصر (بالإنجليزية)" : "Tagline (English)"}
                </label>
                <textarea
                  rows={2}
                  value={formData.taglineEn}
                  onChange={(e) => handleFieldChange("taglineEn", e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "الوصف المختصر (بالعربية)" : "Tagline (Arabic)"}
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={formData.taglineAr}
                  onChange={(e) => handleFieldChange("taglineAr", e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm text-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. HERO & STRUCTURED MEDIA SYSTEM */}
        {activeSectionId === "hero" && (
          <div className="space-y-8 max-w-4xl">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "النتيجة الرئيسية (بالإنجليزية)" : "Hero Outcome Statement (English)"}
                </label>
                <input
                  type="text"
                  value={cms.heroOutcomeEn || ""}
                  onChange={(e) => handleCmsChange("heroOutcomeEn", e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "النتيجة الرئيسية (بالعربية)" : "Hero Outcome Statement (Arabic)"}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={cms.heroOutcomeAr || ""}
                  onChange={(e) => handleCmsChange("heroOutcomeAr", e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "النص الداعم (بالإنجليزية)" : "Supporting Narrative (English)"}
                </label>
                <textarea
                  rows={3}
                  value={cms.supportingStatementEn || ""}
                  onChange={(e) => handleCmsChange("supportingStatementEn", e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "النص الداعم (بالعربية)" : "Supporting Narrative (Arabic)"}
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={cms.supportingStatementAr || ""}
                  onChange={(e) => handleCmsChange("supportingStatementAr", e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm text-[var(--text-primary)]"
                />
              </div>
            </div>

            {/* STRUCTURED MEDIA SLOTS */}
            <div className="pt-6 border-t border-[var(--border-level-2)] space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? "الوسائط المنظمة المخصصة لهذه الخدمة" : "Structured Service Media Slots"}</span>
              </h3>

              {/* Slot 1: Desktop Hero Media */}
              <div className="p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-[var(--text-primary)] block">
                      {isAr ? "١. وسائط الواجهة لسطح المكتب (Desktop Hero Media)" : "1. Desktop Hero Background Media"}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      {isAr ? "تستخدم كخلفية رئيسية لصفحة تفاصيل الخدمة على شاشات الكمبيوتر." : "Primary visual on desktop service microsite hero banner."}
                    </span>
                  </div>
                  <select
                    value={formData.heroMediaType || "IMAGE"}
                    onChange={(e) => handleFieldChange("heroMediaType", e.target.value)}
                    className="p-2 rounded-lg bg-[var(--surface-default)] border text-xs font-bold text-[var(--text-primary)]"
                  >
                    <option value="IMAGE">IMAGE</option>
                    <option value="VIDEO">VIDEO</option>
                  </select>
                </div>

                <MediaUploader
                  value={formData.heroMediaUrl || cms.heroDesktopMediaUrl}
                  onChange={(url) => {
                    handleFieldChange("heroMediaUrl", url);
                    handleCmsChange("heroDesktopMediaUrl", url);
                  }}
                  onRemove={() => {
                    handleFieldChange("heroMediaUrl", "");
                    handleCmsChange("heroDesktopMediaUrl", "");
                  }}
                />

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Alt Text (EN)</label>
                    <input
                      type="text"
                      value={cms.heroDesktopAltEn || ""}
                      onChange={(e) => handleCmsChange("heroDesktopAltEn", e.target.value)}
                      placeholder="e.g. Turnkey mega event stage lighting in Doha"
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Alt Text (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={cms.heroDesktopAltAr || ""}
                      onChange={(e) => handleCmsChange("heroDesktopAltAr", e.target.value)}
                      placeholder="مثال: تجهيزات إضاءة المسارح للفعاليات الكبرى في الدوحة"
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Slot 2: Mobile Hero Media */}
              <div className="p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase text-[var(--text-primary)] block">
                    {isAr ? "٢. وسائط الواجهة للجوال (Mobile Hero Media)" : "2. Mobile Hero Media (Portrait / Responsive)"}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {isAr ? "تستخدم على الهواتف الذكية. إذا لم تحدد، يتم استخدام وسائط سطح المكتب لنفس الخدمة تلقائياً." : "Optimized for vertical viewports. Falls back cleanly to same service desktop media."}
                  </span>
                </div>

                <MediaUploader
                  value={cms.heroMobileMediaUrl}
                  onChange={(url) => handleCmsChange("heroMobileMediaUrl", url)}
                  onRemove={() => handleCmsChange("heroMobileMediaUrl", "")}
                />

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Alt Text (EN)</label>
                    <input
                      type="text"
                      value={cms.heroMobileAltEn || ""}
                      onChange={(e) => handleCmsChange("heroMobileAltEn", e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Alt Text (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={cms.heroMobileAltAr || ""}
                      onChange={(e) => handleCmsChange("heroMobileAltAr", e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Slot 3: Hero Video & Video Poster */}
              <div className="p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase text-[var(--text-primary)] block">
                    {isAr ? "٣. فيديو الواجهة وصورة الغلاف (Hero Video & Poster)" : "3. Hero Video URL & Video Poster Image"}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {isAr ? "رابط فيديو عالي الدقة (MP4/WebM) مع صورة الغلاف التي تظهر أثناء التحميل." : "High-resolution video stream URL with poster fallback for reduced motion & fast loading."}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Hero Video URL (.mp4)</label>
                    <input
                      type="url"
                      value={cms.heroVideoUrl || ""}
                      onChange={(e) => handleCmsChange("heroVideoUrl", e.target.value)}
                      placeholder="https://.../video.mp4"
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Video Poster Image URL</label>
                    <input
                      type="url"
                      value={cms.heroVideoPosterUrl || ""}
                      onChange={(e) => handleCmsChange("heroVideoPosterUrl", e.target.value)}
                      placeholder="https://.../poster.jpg"
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Slot 4: Directory Card & Navigator Feature Media */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-3">
                  <div>
                    <span className="text-xs font-bold uppercase text-[var(--text-primary)] block">
                      {isAr ? "٤. صورة بطاقة الدليل (Directory Card)" : "4. Directory Card Visual"}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {isAr ? "تظهر في بطاقات الخدمات بدليل قطاع الأعمال." : "Rendered on B2B directory overview cards."}
                    </span>
                  </div>
                  <MediaUploader
                    value={cms.directoryCardMediaUrl || formData.thumbnail}
                    onChange={(url) => {
                      handleFieldChange("thumbnail", url);
                      handleCmsChange("directoryCardMediaUrl", url);
                    }}
                    onRemove={() => {
                      handleFieldChange("thumbnail", "");
                      handleCmsChange("directoryCardMediaUrl", "");
                    }}
                  />
                </div>

                <div className="p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-3">
                  <div>
                    <span className="text-xs font-bold uppercase text-[var(--text-primary)] block">
                      {isAr ? "٥. صورة مستكشف الخدمات (Navigator Feature)" : "5. Navigator Feature Media"}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {isAr ? "تظهر في شاشة الاستكشاف التفاعلية بالصفحة الرئيسية." : "Rendered inside primary interactive directory navigator."}
                    </span>
                  </div>
                  <MediaUploader
                    value={cms.navigatorFeatureMediaUrl}
                    onChange={(url) => handleCmsChange("navigatorFeatureMediaUrl", url)}
                    onRemove={() => handleCmsChange("navigatorFeatureMediaUrl", "")}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. WOW & HOW */}
        {activeSectionId === "wowHow" && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  {isAr ? "فلسفة الإبهار والتنفيذ (WOW & HOW)" : "WOW & HOW Storytelling Matrix"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItems = [...(cms.wowHow || [])];
                  newItems.push({
                    id: Math.random().toString(),
                    titleEn: "New WOW & HOW Pillar",
                    titleAr: "ركيزة إبهار وتنفيذ جديدة",
                    wowEn: "Guest emotional experience description...",
                    wowAr: "وصف تجربة الجمهور الحسية...",
                    howEn: "Backend technical and operational delivery...",
                    howAr: "التنفيذ التقني والتشغيلي وراء الكواليس...",
                  });
                  handleCmsChange("wowHow", newItems);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة ركيزة" : "Add Pillar"}</span>
              </button>
            </div>

            {(cms.wowHow || []).map((wh, idx) => (
              <div key={wh.id || idx} className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-level-2)]">
                  <span className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400">
                    Pillar #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (cms.wowHow || []).filter((_, i) => i !== idx);
                      handleCmsChange("wowHow", updated);
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Pillar Title (EN)</label>
                    <input
                      type="text"
                      value={wh.titleEn}
                      onChange={(e) => {
                        const updated = [...(cms.wowHow || [])];
                        updated[idx].titleEn = e.target.value;
                        handleCmsChange("wowHow", updated);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Pillar Title (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={wh.titleAr}
                      onChange={(e) => {
                        const updated = [...(cms.wowHow || [])];
                        updated[idx].titleAr = e.target.value;
                        handleCmsChange("wowHow", updated);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 block mb-2">
                      The WOW (Guest Experience)
                    </span>
                    <textarea
                      rows={3}
                      value={wh.wowEn}
                      onChange={(e) => {
                        const updated = [...(cms.wowHow || [])];
                        updated[idx].wowEn = e.target.value;
                        handleCmsChange("wowHow", updated);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] mb-2"
                    />
                    <textarea
                      rows={3}
                      dir="rtl"
                      value={wh.wowAr}
                      onChange={(e) => {
                        const updated = [...(cms.wowHow || [])];
                        updated[idx].wowAr = e.target.value;
                        handleCmsChange("wowHow", updated);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-500/20">
                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-2">
                      The HOW (Operational Engineering)
                    </span>
                    <textarea
                      rows={3}
                      value={wh.howEn}
                      onChange={(e) => {
                        const updated = [...(cms.wowHow || [])];
                        updated[idx].howEn = e.target.value;
                        handleCmsChange("wowHow", updated);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] mb-2"
                    />
                    <textarea
                      rows={3}
                      dir="rtl"
                      value={wh.howAr}
                      onChange={(e) => {
                        const updated = [...(cms.wowHow || [])];
                        updated[idx].howAr = e.target.value;
                        handleCmsChange("wowHow", updated);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. OBJECTIVES */}
        {activeSectionId === "objectives" && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  {isAr ? "مواءمة أهداف المشروع (Strategic Objectives)" : "Strategic Objectives Selector"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  const items = [...(cms.objectives || [])];
                  items.push({
                    id: Math.random().toString(),
                    labelEn: "New Strategic Objective",
                    labelAr: "هدف استراتيجي جديد",
                    descriptionEn: "Objective description...",
                    descriptionAr: "وصف الهدف...",
                  });
                  handleCmsChange("objectives", items);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة هدف" : "Add Objective"}</span>
              </button>
            </div>

            {(cms.objectives || []).map((obj, idx) => (
              <div key={obj.id || idx} className="p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-level-2)]">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Objective #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = (cms.objectives || []).filter((_, i) => i !== idx);
                      handleCmsChange("objectives", items);
                    }}
                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Objective Title (EN)</label>
                    <input
                      type="text"
                      value={obj.labelEn}
                      onChange={(e) => {
                        const items = [...(cms.objectives || [])];
                        items[idx].labelEn = e.target.value;
                        handleCmsChange("objectives", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Objective Title (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={obj.labelAr}
                      onChange={(e) => {
                        const items = [...(cms.objectives || [])];
                        items[idx].labelAr = e.target.value;
                        handleCmsChange("objectives", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Description (EN)</label>
                    <textarea
                      rows={2}
                      value={obj.descriptionEn}
                      onChange={(e) => {
                        const items = [...(cms.objectives || [])];
                        items[idx].descriptionEn = e.target.value;
                        handleCmsChange("objectives", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Description (AR)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={obj.descriptionAr}
                      onChange={(e) => {
                        const items = [...(cms.objectives || [])];
                        items[idx].descriptionAr = e.target.value;
                        handleCmsChange("objectives", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 7. CAPABILITIES BENTO */}
        {activeSectionId === "capabilities" && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  {isAr ? "مصفوفة القدرات التخصصية (Capabilities Bento)" : "Capabilities Bento Matrix"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  const items = [...(cms.capabilities || [])];
                  items.push({
                    id: Math.random().toString(),
                    titleEn: "New Capability Tile",
                    titleAr: "قدرة تخصصية جديدة",
                    descriptionEn: "Capability scope and description...",
                    descriptionAr: "نطاق القدرة والوصف...",
                    tagEn: "TURNKEY",
                    tagAr: "شامل",
                    colSpan: 1,
                    deliverablesEn: ["Deliverable 1"],
                    deliverablesAr: ["مخرج ١"],
                    suitableForEn: ["National Celebrations", "Arenas"],
                    suitableForAr: ["الاحتفالات الوطنية", "المسارح الكبرى"],
                  });
                  handleCmsChange("capabilities", items);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة قدرة" : "Add Capability"}</span>
              </button>
            </div>

            {(cms.capabilities || []).map((cap, idx) => (
              <div key={cap.id || idx} className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-level-2)]">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Capability #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = (cms.capabilities || []).filter((_, i) => i !== idx);
                      handleCmsChange("capabilities", items);
                    }}
                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Title (EN)</label>
                    <input
                      type="text"
                      value={cap.titleEn}
                      onChange={(e) => {
                        const items = [...(cms.capabilities || [])];
                        items[idx].titleEn = e.target.value;
                        handleCmsChange("capabilities", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Title (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={cap.titleAr}
                      onChange={(e) => {
                        const items = [...(cms.capabilities || [])];
                        items[idx].titleAr = e.target.value;
                        handleCmsChange("capabilities", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-bold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Description (EN)</label>
                    <textarea
                      rows={2}
                      value={cap.descriptionEn}
                      onChange={(e) => {
                        const items = [...(cms.capabilities || [])];
                        items[idx].descriptionEn = e.target.value;
                        handleCmsChange("capabilities", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Description (AR)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={cap.descriptionAr}
                      onChange={(e) => {
                        const items = [...(cms.capabilities || [])];
                        items[idx].descriptionAr = e.target.value;
                        handleCmsChange("capabilities", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Tile Media Image (Optional)</label>
                  <MediaUploader
                    value={cap.mediaUrl}
                    onChange={(url) => {
                      const items = [...(cms.capabilities || [])];
                      items[idx].mediaUrl = url;
                      handleCmsChange("capabilities", items);
                    }}
                    onRemove={() => {
                      const items = [...(cms.capabilities || [])];
                      items[idx].mediaUrl = undefined;
                      handleCmsChange("capabilities", items);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 8. PROJECT MOMENT */}
        {activeSectionId === "projectMoment" && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                {isAr ? "الشاهد الميداني الكامل (Full-Width Landmark Moment)" : "Full-Width Landmark Project Moment"}
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Landmark Title (EN)</label>
                  <input
                    type="text"
                    value={cms.projectMoment?.titleEn || ""}
                    onChange={(e) => handleCmsChange("projectMoment", { ...cms.projectMoment, titleEn: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Landmark Title (AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={cms.projectMoment?.titleAr || ""}
                    onChange={(e) => handleCmsChange("projectMoment", { ...cms.projectMoment, titleAr: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-bold"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Execution Statement (EN)</label>
                  <textarea
                    rows={2}
                    value={cms.projectMoment?.statementEn || ""}
                    onChange={(e) => handleCmsChange("projectMoment", { ...cms.projectMoment, statementEn: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Execution Statement (AR)</label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={cms.projectMoment?.statementAr || ""}
                    onChange={(e) => handleCmsChange("projectMoment", { ...cms.projectMoment, statementAr: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">Moment Background Media</label>
                <MediaUploader
                  value={cms.projectMoment?.mediaUrl}
                  onChange={(url) => handleCmsChange("projectMoment", { ...cms.projectMoment, mediaUrl: url })}
                  onRemove={() => handleCmsChange("projectMoment", { ...cms.projectMoment, mediaUrl: "" })}
                />
              </div>
            </div>
          </div>
        )}

        {/* 9. ENGAGEMENT MODELS */}
        {activeSectionId === "engagementModels" && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  {isAr ? "نماذج التعاقد والتعيين (Engagement Models)" : "Enterprise Engagement & Procurement Models"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  const items = [...(cms.engagementModels || [])];
                  items.push({
                    id: Math.random().toString(),
                    titleEn: "Turnkey Master Contract",
                    titleAr: "عقد رئيسي متكامل",
                    subtitleEn: "Full Lifecycle",
                    subtitleAr: "دورة كاملة",
                    descriptionEn: "Complete single-point accountability from design through commissioning.",
                    descriptionAr: "مسؤولية تنفيذية موحدة من التصميم حتى التشغيل النهائي.",
                    typicalDurationEn: "3 - 12 Months",
                    typicalDurationAr: "٣ - ١٢ شهراً",
                    bestForEn: "Large institutions and government entities.",
                    bestForAr: "الجهات الحكومية والمشاريع الكبرى.",
                  });
                  handleCmsChange("engagementModels", items);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة نموذج" : "Add Model"}</span>
              </button>
            </div>

            {(cms.engagementModels || []).map((em, idx) => (
              <div key={em.id || idx} className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-level-2)]">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Model #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = (cms.engagementModels || []).filter((_, i) => i !== idx);
                      handleCmsChange("engagementModels", items);
                    }}
                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Title (EN)</label>
                    <input
                      type="text"
                      value={em.titleEn}
                      onChange={(e) => {
                        const items = [...(cms.engagementModels || [])];
                        items[idx].titleEn = e.target.value;
                        handleCmsChange("engagementModels", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Title (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={em.titleAr}
                      onChange={(e) => {
                        const items = [...(cms.engagementModels || [])];
                        items[idx].titleAr = e.target.value;
                        handleCmsChange("engagementModels", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-bold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Description (EN)</label>
                    <textarea
                      rows={2}
                      value={em.descriptionEn}
                      onChange={(e) => {
                        const items = [...(cms.engagementModels || [])];
                        items[idx].descriptionEn = e.target.value;
                        handleCmsChange("engagementModels", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Description (AR)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={em.descriptionAr}
                      onChange={(e) => {
                        const items = [...(cms.engagementModels || [])];
                        items[idx].descriptionAr = e.target.value;
                        handleCmsChange("engagementModels", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 10. DELIVERABLES */}
        {activeSectionId === "deliverables" && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  {isAr ? "المخرجات والوثائق الرسمية (Deliverables Roster)" : "Deliverables & Official Artifacts"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  const items = [...(cms.deliverables || [])];
                  items.push({
                    id: Math.random().toString(),
                    titleEn: "New Deliverable Category",
                    titleAr: "فئة مخرجات جديدة",
                    itemsEn: ["Official engineering submittal", "QA inspection report"],
                    itemsAr: ["مخطط هندسي معتمد", "تقرير فحص الجودة"],
                  });
                  handleCmsChange("deliverables", items);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة فئة مخرجات" : "Add Category"}</span>
              </button>
            </div>

            {(cms.deliverables || []).map((cat, idx) => (
              <div key={cat.id || idx} className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-level-2)]">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Category #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = (cms.deliverables || []).filter((_, i) => i !== idx);
                      handleCmsChange("deliverables", items);
                    }}
                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Category Title (EN)</label>
                    <input
                      type="text"
                      value={cat.titleEn}
                      onChange={(e) => {
                        const items = [...(cms.deliverables || [])];
                        items[idx].titleEn = e.target.value;
                        handleCmsChange("deliverables", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Category Title (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={cat.titleAr}
                      onChange={(e) => {
                        const items = [...(cms.deliverables || [])];
                        items[idx].titleAr = e.target.value;
                        handleCmsChange("deliverables", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-bold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Items (EN, One per line)</label>
                    <textarea
                      rows={4}
                      value={(cat.itemsEn || []).join("\n")}
                      onChange={(e) => {
                        const items = [...(cms.deliverables || [])];
                        items[idx].itemsEn = e.target.value.split("\n").filter(Boolean);
                        handleCmsChange("deliverables", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Items (AR, One per line)</label>
                    <textarea
                      rows={4}
                      dir="rtl"
                      value={(cat.itemsAr || []).join("\n")}
                      onChange={(e) => {
                        const items = [...(cms.deliverables || [])];
                        items[idx].itemsAr = e.target.value.split("\n").filter(Boolean);
                        handleCmsChange("deliverables", items);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 11. DELIVERY LIFECYCLE */}
        {activeSectionId === "lifecycle" && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  {isAr ? "دورة حياة المشروع ومراحل التسليم" : "Structured Project Delivery Lifecycle"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  const stages = [...(cms.lifecycleStages || [])];
                  stages.push({
                    id: Math.random().toString(),
                    stageNumber: `0${stages.length + 1}`,
                    titleEn: "New Stage",
                    titleAr: "مرحلة جديدة",
                    descriptionEn: "Stage methodology and gate requirements...",
                    descriptionAr: "منهجية المرحلة ومتطلبات الاعتماد...",
                    outputsEn: ["Milestone sign-off"],
                    outputsAr: ["اعتماد مرحلي"],
                  });
                  handleCmsChange("lifecycleStages", stages);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة مرحلة" : "Add Stage"}</span>
              </button>
            </div>

            {(cms.lifecycleStages || []).map((stage, idx) => (
              <div key={stage.id || idx} className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-level-2)]">
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">Stage {stage.stageNumber}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const stages = (cms.lifecycleStages || []).filter((_, i) => i !== idx);
                      handleCmsChange("lifecycleStages", stages);
                    }}
                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Stage Number</label>
                    <input
                      type="text"
                      value={stage.stageNumber}
                      onChange={(e) => {
                        const stages = [...(cms.lifecycleStages || [])];
                        stages[idx].stageNumber = e.target.value;
                        handleCmsChange("lifecycleStages", stages);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Title (EN)</label>
                    <input
                      type="text"
                      value={stage.titleEn}
                      onChange={(e) => {
                        const stages = [...(cms.lifecycleStages || [])];
                        stages[idx].titleEn = e.target.value;
                        handleCmsChange("lifecycleStages", stages);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Title (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={stage.titleAr}
                      onChange={(e) => {
                        const stages = [...(cms.lifecycleStages || [])];
                        stages[idx].titleAr = e.target.value;
                        handleCmsChange("lifecycleStages", stages);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 12. PRODUCTION GALLERY MANAGER */}
        {activeSectionId === "gallery" && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  {isAr ? "معرض الإنتاج البصري (Production Gallery)" : "Production Gallery Media Manager"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isAr ? "إدارة الوسائط المختلطة (صور وفيديوهات)، نسب العرض، ونقاط التركيز البصري." : "Manage mixed media items (photos & videos with posters), display formats, and focal points."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const items: ServiceGalleryItemPayload[] = [...(cms.galleryItems || [])];
                  items.push({
                    id: Math.random().toString(),
                    url: "",
                    mediaType: "IMAGE",
                    captionEn: "Execution Showcase",
                    captionAr: "شاهد تنفيذي",
                    altEn: "Production visual",
                    altAr: "صورة تنفيذية",
                    displayFormat: "16:9",
                    focalPoint: "center",
                    orderIndex: items.length + 1,
                    isVisible: true,
                  });
                  handleCmsChange("galleryItems", items);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة وسيط للمعرض" : "Add Gallery Item"}</span>
              </button>
            </div>

            {(!cms.galleryItems || cms.galleryItems.length === 0) ? (
              <div className="p-12 text-center rounded-3xl bg-[var(--surface-raised)] border border-dashed border-[var(--border-level-2)]">
                <ImageIcon className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-40" />
                <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">
                  {isAr ? "لا توجد عناصر في المعرض حالياً" : "No Gallery Items Added Yet"}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mb-4">
                  {isAr ? "أضف صور وفيديوهات لتوثيق أعمال هذه الخدمة والتنفيذ الميداني." : "Add photos and video captures to document this service's real-world execution and deliverables."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cms.galleryItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border-level-2)]">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {item.captionEn || `Gallery Item ${idx + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveGalleryItem(idx, "up")}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg hover:bg-[var(--surface-default)] disabled:opacity-30 text-[var(--text-secondary)]"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGalleryItem(idx, "down")}
                          disabled={idx === (cms.galleryItems?.length || 0) - 1}
                          className="p-1.5 rounded-lg hover:bg-[var(--surface-default)] disabled:opacity-30 text-[var(--text-secondary)]"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...(cms.galleryItems || [])];
                            updated[idx].isVisible = updated[idx].isVisible === false;
                            handleCmsChange("galleryItems", updated);
                          }}
                          className="p-1.5 rounded-lg hover:bg-[var(--surface-default)] text-[var(--text-secondary)]"
                          title={item.isVisible !== false ? "Hide item" : "Show item"}
                        >
                          {item.isVisible !== false ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-zinc-400" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (cms.galleryItems || []).filter((_, i) => i !== idx);
                            handleCmsChange("galleryItems", updated);
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-12 gap-4 items-start">
                      {/* Media Upload & Preview Column */}
                      <div className="sm:col-span-5 space-y-3">
                        <MediaUploader
                          value={item.url}
                          onChange={(url) => {
                            const updated = [...(cms.galleryItems || [])];
                            updated[idx].url = url;
                            handleCmsChange("galleryItems", updated);
                          }}
                          onRemove={() => {
                            const updated = [...(cms.galleryItems || [])];
                            updated[idx].url = "";
                            handleCmsChange("galleryItems", updated);
                          }}
                        />

                        {item.mediaType === "VIDEO" && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1">
                              Video Poster URL
                            </label>
                            <input
                              type="url"
                              value={item.posterUrl || ""}
                              onChange={(e) => {
                                const updated = [...(cms.galleryItems || [])];
                                updated[idx].posterUrl = e.target.value;
                                handleCmsChange("galleryItems", updated);
                              }}
                              placeholder="https://.../poster.jpg"
                              className="w-full p-2 rounded-lg bg-[var(--surface-default)] border text-xs font-mono text-[var(--text-primary)]"
                            />
                          </div>
                        )}
                      </div>

                      {/* Metadata & Controls Column */}
                      <div className="sm:col-span-7 space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1">Type</label>
                            <select
                              value={item.mediaType || "IMAGE"}
                              onChange={(e) => {
                                const updated = [...(cms.galleryItems || [])];
                                updated[idx].mediaType = e.target.value as any;
                                handleCmsChange("galleryItems", updated);
                              }}
                              className="w-full p-2 rounded-lg bg-[var(--surface-default)] border text-xs font-bold text-[var(--text-primary)]"
                            >
                              <option value="IMAGE">IMAGE</option>
                              <option value="VIDEO">VIDEO</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1">Format</label>
                            <select
                              value={item.displayFormat || "16:9"}
                              onChange={(e) => {
                                const updated = [...(cms.galleryItems || [])];
                                updated[idx].displayFormat = e.target.value as any;
                                handleCmsChange("galleryItems", updated);
                              }}
                              className="w-full p-2 rounded-lg bg-[var(--surface-default)] border text-xs font-bold text-[var(--text-primary)]"
                            >
                              <option value="16:9">16:9 Landscape</option>
                              <option value="4:3">4:3 Standard</option>
                              <option value="1:1">1:1 Square</option>
                              <option value="full-bleed">Full Bleed</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1">Focal Point</label>
                            <select
                              value={item.focalPoint || "center"}
                              onChange={(e) => {
                                const updated = [...(cms.galleryItems || [])];
                                updated[idx].focalPoint = e.target.value as any;
                                handleCmsChange("galleryItems", updated);
                              }}
                              className="w-full p-2 rounded-lg bg-[var(--surface-default)] border text-xs font-bold text-[var(--text-primary)]"
                            >
                              <option value="center">Center</option>
                              <option value="top">Top</option>
                              <option value="bottom">Bottom</option>
                              <option value="left">Left</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1">Caption (EN)</label>
                            <input
                              type="text"
                              value={item.captionEn || ""}
                              onChange={(e) => {
                                const updated = [...(cms.galleryItems || [])];
                                updated[idx].captionEn = e.target.value;
                                handleCmsChange("galleryItems", updated);
                              }}
                              className="w-full p-2 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1">Caption (AR)</label>
                            <input
                              type="text"
                              dir="rtl"
                              value={item.captionAr || ""}
                              onChange={(e) => {
                                const updated = [...(cms.galleryItems || [])];
                                updated[idx].captionAr = e.target.value;
                                handleCmsChange("galleryItems", updated);
                              }}
                              className="w-full p-2 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1">Alt Text (EN)</label>
                            <input
                              type="text"
                              value={item.altEn || ""}
                              onChange={(e) => {
                                const updated = [...(cms.galleryItems || [])];
                                updated[idx].altEn = e.target.value;
                                handleCmsChange("galleryItems", updated);
                              }}
                              className="w-full p-2 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1">Alt Text (AR)</label>
                            <input
                              type="text"
                              dir="rtl"
                              value={item.altAr || ""}
                              onChange={(e) => {
                                const updated = [...(cms.galleryItems || [])];
                                updated[idx].altAr = e.target.value;
                                handleCmsChange("galleryItems", updated);
                              }}
                              className="w-full p-2 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 13. SPECIALIST TOOL */}
        {activeSectionId === "specialistModule" && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                {isAr ? "الأداة التفاعلية التخصصية" : "Service Specialist Interactive Planning Module"}
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--text-primary)] mb-2">
                  {isAr ? "نوع الأداة التخصصية:" : "Specialist Module Type:"}
                </label>
                <select
                  value={cms.serviceSpecificModule?.moduleType || "scale-explorer"}
                  onChange={(e) =>
                    handleCmsChange("serviceSpecificModule", {
                      ...cms.serviceSpecificModule,
                      moduleType: e.target.value as any,
                    })
                  }
                  className="w-full p-3 rounded-xl bg-[var(--surface-default)] border text-sm font-bold text-[var(--text-primary)]"
                >
                  {SPECIALIST_MODULE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {isAr ? t.labelAr : t.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Module Title (EN)</label>
                  <input
                    type="text"
                    value={cms.serviceSpecificModule?.titleEn || ""}
                    onChange={(e) =>
                      handleCmsChange("serviceSpecificModule", {
                        ...cms.serviceSpecificModule,
                        titleEn: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Module Title (AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={cms.serviceSpecificModule?.titleAr || ""}
                    onChange={(e) =>
                      handleCmsChange("serviceSpecificModule", {
                        ...cms.serviceSpecificModule,
                        titleAr: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-[var(--surface-default)] border text-xs text-[var(--text-primary)] font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 14. CASE STUDIES SELECTION */}
        {activeSectionId === "caseStudies" && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                {isAr ? "ربط دراسات الحالة وسجل الإنجاز" : "Related Case Studies & Landmark Proof Selection"}
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] cursor-pointer">
                  <input
                    type="radio"
                    name="caseStudySelectionMode"
                    value="AUTOMATIC"
                    checked={cms.caseStudySelectionMode !== "MANUAL"}
                    onChange={() => handleCmsChange("caseStudySelectionMode", "AUTOMATIC")}
                    className="w-4 h-4 text-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold block text-[var(--text-primary)]">
                      {isAr ? "تلقائي (حسب تخصص الخدمة)" : "Automatic Matching"}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {isAr ? "يعرض تلقائياً دراسات الحالة المرتبطة بهذه الخدمة" : "Matches case studies tagged with this service"}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] cursor-pointer">
                  <input
                    type="radio"
                    name="caseStudySelectionMode"
                    value="MANUAL"
                    checked={cms.caseStudySelectionMode === "MANUAL"}
                    onChange={() => handleCmsChange("caseStudySelectionMode", "MANUAL")}
                    className="w-4 h-4 text-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold block text-[var(--text-primary)]">
                      {isAr ? "اختيار يدوي محدد" : "Manual Selection"}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {isAr ? "حدد دراسات حالة معينة لعرضها" : "Choose exact case studies from database"}
                    </span>
                  </div>
                </label>
              </div>

              {cms.caseStudySelectionMode === "MANUAL" && (
                <div className="space-y-3 pt-3 border-t border-[var(--border-level-2)]">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">
                    {isAr ? "اختر دراسات الحالة:" : "Select Case Studies to Display:"}
                  </span>
                  <div className="grid sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
                    {availableCaseStudies.map((cs: any) => {
                      const isSelected = (cms.selectedCaseStudyIds || []).includes(cs.id);
                      return (
                        <label key={cs.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const cur = [...(cms.selectedCaseStudyIds || [])];
                              if (e.target.checked) cur.push(cs.id);
                              else {
                                const idx = cur.indexOf(cs.id);
                                if (idx >= 0) cur.splice(idx, 1);
                              }
                              handleCmsChange("selectedCaseStudyIds", cur);
                            }}
                            className="rounded text-emerald-500"
                          />
                          <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                            {isAr ? cs.titleAr || cs.titleEn : cs.titleEn}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 15. CLAIMS & PROOF READINESS */}
        {activeSectionId === "claims" && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {isAr ? "معايير الجاهزية والامتثال المؤسسي" : "Enterprise Readiness & Verified Claims Governance"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const items = [...(cms.enterpriseReadiness || [])];
                    items.push({
                      id: Math.random().toString(),
                      titleEn: "Certified Execution Standard",
                      titleAr: "معيار تنفيذ معتمد",
                      descriptionEn: "Documented working practices and certified safety protocols.",
                      descriptionAr: "إجراءات عمل موثقة وبروتوكولات سلامة معتمدة.",
                      status: "APPROVED",
                      evidence: "HSE Standard 2026",
                    });
                    handleCmsChange("enterpriseReadiness", items);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? "إضافة معيار امتثال" : "Add Claim"}</span>
                </button>
              </div>

              {(cms.enterpriseReadiness || []).map((er, idx) => (
                <div key={er.id || idx} className="p-5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-level-2)]">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Claim #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const items = (cms.enterpriseReadiness || []).filter((_, i) => i !== idx);
                        handleCmsChange("enterpriseReadiness", items);
                      }}
                      className="text-rose-500 hover:bg-rose-500/10 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Title (EN)</label>
                      <input
                        type="text"
                        value={er.titleEn}
                        onChange={(e) => {
                          const items = [...(cms.enterpriseReadiness || [])];
                          items[idx].titleEn = e.target.value;
                          handleCmsChange("enterpriseReadiness", items);
                        }}
                        className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border text-xs text-[var(--text-primary)] font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Title (AR)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={er.titleAr}
                        onChange={(e) => {
                          const items = [...(cms.enterpriseReadiness || [])];
                          items[idx].titleAr = e.target.value;
                          handleCmsChange("enterpriseReadiness", items);
                        }}
                        className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border text-xs text-[var(--text-primary)] font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Description (EN)</label>
                      <textarea
                        rows={2}
                        value={er.descriptionEn || ""}
                        onChange={(e) => {
                          const items = [...(cms.enterpriseReadiness || [])];
                          items[idx].descriptionEn = e.target.value;
                          handleCmsChange("enterpriseReadiness", items);
                        }}
                        className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border text-xs text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Description (AR)</label>
                      <textarea
                        rows={2}
                        dir="rtl"
                        value={er.descriptionAr || ""}
                        onChange={(e) => {
                          const items = [...(cms.enterpriseReadiness || [])];
                          items[idx].descriptionAr = e.target.value;
                          handleCmsChange("enterpriseReadiness", items);
                        }}
                        className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Verification Status</label>
                      <select
                        value={er.status}
                        onChange={(e) => {
                          const items = [...(cms.enterpriseReadiness || [])];
                          items[idx].status = e.target.value as any;
                          handleCmsChange("enterpriseReadiness", items);
                        }}
                        className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border text-xs text-[var(--text-primary)] font-bold"
                      >
                        <option value="APPROVED">APPROVED (Publicly Rendered)</option>
                        <option value="VERIFIED">VERIFIED (Internal Only)</option>
                        <option value="DRAFT">DRAFT (Hidden)</option>
                        <option value="EXPIRED">EXPIRED (Suppressed)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Evidence Reference *</label>
                      <input
                        type="text"
                        value={er.evidence || ""}
                        onChange={(e) => {
                          const items = [...(cms.enterpriseReadiness || [])];
                          items[idx].evidence = e.target.value;
                          handleCmsChange("enterpriseReadiness", items);
                        }}
                        placeholder="e.g. E3 HSE Manual Doc-2026"
                        className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border text-xs text-[var(--text-primary)] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Approved By</label>
                      <input
                        type="text"
                        value={er.approvedBy || ""}
                        onChange={(e) => {
                          const items = [...(cms.enterpriseReadiness || [])];
                          items[idx].approvedBy = e.target.value;
                          handleCmsChange("enterpriseReadiness", items);
                        }}
                        className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 16. RELATED SERVICES */}
        {activeSectionId === "relatedServices" && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                {isAr ? "الخدمات التكميلية ذات الصلة" : "Integrated Complementary Services"}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {CANONICAL_SERVICE_SLUGS.filter((s) => s !== formData.slug).map((slug) => {
                  const isChecked = (cms.relatedServiceSlugs || []).includes(slug);
                  return (
                    <label key={slug} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const cur = [...(cms.relatedServiceSlugs || [])];
                          if (e.target.checked) {
                            cur.push(slug);
                          } else {
                            const idx = cur.indexOf(slug);
                            if (idx >= 0) cur.splice(idx, 1);
                          }
                          handleCmsChange("relatedServiceSlugs", cur);
                        }}
                        className="rounded text-emerald-500"
                      />
                      <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{slug}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 17. PROJECT BRIEF CONFIGURATION */}
        {activeSectionId === "briefConfig" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                {isAr ? "إعدادات وتخصيص موجز المشروع (Project Brief)" : "Project Brief Modal Configuration"}
              </h3>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--text-primary)] mb-2">
                  {isAr ? "خيارات المواقع المتاحة في القائمة (Venue Options):" : "Available Venue Options (Comma-separated):"}
                </label>
                <input
                  type="text"
                  value={(cms.briefConfig?.venueOptions || []).join(", ")}
                  onChange={(e) => {
                    const options = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                    handleCmsChange("briefConfig", { ...cms.briefConfig, venueOptions: options });
                  }}
                  className="w-full p-3 rounded-xl bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--text-primary)] mb-2">
                  {isAr ? "فئات الميزانية المقترحة (Budget Brackets):" : "Budget Brackets (Comma-separated):"}
                </label>
                <input
                  type="text"
                  value={(cms.briefConfig?.budgetBrackets || []).join(", ")}
                  onChange={(e) => {
                    const brackets = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                    handleCmsChange("briefConfig", { ...cms.briefConfig, budgetBrackets: brackets });
                  }}
                  className="w-full p-3 rounded-xl bg-[var(--surface-default)] border text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 18. VISIBILITY & ORDER CONTROLS */}
        {activeSectionId === "sectionSettings" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                {isAr ? "ترتيب وإظهار الأقسام (Section Order & Visibility)" : "Section Ordering & Visibility Controls"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isAr ? "تحكم في ترتيب ظهور الأقسام على صفحة الخدمة وإخفاء/إظهار أي قسم حسب الرغبة." : "Reorder public microsite sections using accessible Move Up / Move Down controls and toggle section visibility."}
              </p>
            </div>

            <div className="space-y-3">
              {(cms.sectionsOrder || DEFAULT_SECTIONS_ORDER).map((secKey, idx) => {
                const isVisible = (cms.sectionVisibility as any)?.[secKey] !== false;
                const sectionMeta: Record<string, { labelEn: string; labelAr: string }> = {
                  hero: { labelEn: "1. Overview & Hero Banner", labelAr: "١. نظرة عامة والواجهة" },
                  wowHow: { labelEn: "2. WOW & HOW Storytelling", labelAr: "٢. الإبهار والتنفيذ" },
                  objectives: { labelEn: "3. Strategic Objectives", labelAr: "٣. مواءمة الأهداف" },
                  capabilities: { labelEn: "4. Capabilities Bento Matrix", labelAr: "٤. مصفوفة القدرات" },
                  projectMoment: { labelEn: "5. Landmark Project Moment", labelAr: "٥. الشاهد الميداني الكامل" },
                  engagementModels: { labelEn: "6. Engagement & Procurement", labelAr: "٦. نماذج التعاقد" },
                  deliverables: { labelEn: "7. Deliverables Roster", labelAr: "٧. المخرجات والوثائق" },
                  specialistModule: { labelEn: "8. Specialist Planning Tool", labelAr: "٨. الأداة التخصصية" },
                  lifecycle: { labelEn: "9. Delivery Lifecycle", labelAr: "٩. دورة حياة المشروع" },
                  gallery: { labelEn: "10. Production Gallery", labelAr: "١٠. المعرض البصري" },
                  caseStudies: { labelEn: "11. Related Case Studies", labelAr: "١١. دراسات الحالة" },
                  enterpriseReadiness: { labelEn: "12. Enterprise Readiness", labelAr: "١٢. الجاهزية المؤسسية" },
                  relatedSolutions: { labelEn: "13. Connected Solutions", labelAr: "١٣. الخدمات المتكاملة" },
                };

                const meta = sectionMeta[secKey] || { labelEn: secKey, labelAr: secKey };

                return (
                  <div
                    key={secKey}
                    className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        {isAr ? meta.labelAr : meta.labelEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveSectionOrder(idx, "up")}
                        disabled={idx === 0}
                        className="p-2 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:bg-[var(--surface-hover)] disabled:opacity-30 text-[var(--text-secondary)] transition-colors cursor-pointer"
                        title={isAr ? "تحريك لأعلى" : "Move Up"}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveSectionOrder(idx, "down")}
                        disabled={idx === (cms.sectionsOrder?.length || DEFAULT_SECTIONS_ORDER.length) - 1}
                        className="p-2 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:bg-[var(--surface-hover)] disabled:opacity-30 text-[var(--text-secondary)] transition-colors cursor-pointer"
                        title={isAr ? "تحريك لأسفل" : "Move Down"}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const curVis = cms.sectionVisibility || {};
                          handleCmsChange("sectionVisibility", {
                            ...curVis,
                            [secKey]: !isVisible,
                          });
                        }}
                        className={cn(
                          "px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5",
                          isVisible
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        )}
                      >
                        {isVisible ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isAr ? "ظاهر" : "Visible"}</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>{isAr ? "مخفي" : "Hidden"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleCmsChange("sectionsOrder", DEFAULT_SECTIONS_ORDER)}
              className="px-4 py-2 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {isAr ? "إعادة الترتيب إلى الوضع الافتراضي" : "Reset to Default Sequence"}
            </button>
          </div>
        )}

        {/* 19. SEO & SOCIAL SHARE */}
        {activeSectionId === "seo" && (
          <div className="space-y-6 max-w-4xl">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo?.metaTitle || ""}
                  onChange={(e) => handleFieldChange("seo", { ...formData.seo, metaTitle: e.target.value })}
                  placeholder={`${formData.titleEn || "Service"} | E3 Qatar`}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={formData.seo?.metaDescription || ""}
                  onChange={(e) => handleFieldChange("seo", { ...formData.seo, metaDescription: e.target.value })}
                  placeholder="Compelling search engine snippet..."
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  OpenGraph Social Share Image (OG Image)
                </label>
                <MediaUploader
                  value={cms.ogImageUrl || formData.seo?.ogImage}
                  onChange={(url) => {
                    handleCmsChange("ogImageUrl", url);
                    handleFieldChange("seo", { ...formData.seo, ogImage: url });
                  }}
                  onRemove={() => {
                    handleCmsChange("ogImageUrl", "");
                    handleFieldChange("seo", { ...formData.seo, ogImage: "" });
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardPageShell>
  );
}
