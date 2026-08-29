"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Package,
  Layers,
  Image as ImageIcon,
  Grid,
  Link as LinkIcon,
  MousePointer2,
  Search,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Award,
  ListChecks,
  Sliders,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  EditorSectionItem,
} from "@/components/dashboard/ui";
import {
  CanonicalService,
  VerifiedProofPoint,
  WowHowItem,
  ServiceObjective,
  CapabilityBentoItem,
  EngagementModel,
  DeliverableCategory,
  LifecycleStage,
  EnterpriseReadinessItem,
  ServiceSpecificModuleConfig,
} from "@/lib/services/canonical-services";

const SERVICE_SECTIONS: EditorSectionItem[] = [
  { id: "basic", label: "1. Basic Identity & Category" },
  { id: "hero", label: "2. Hero Narrative & Media" },
  { id: "cta", label: "3. Primary & Secondary CTAs" },
  { id: "evidence", label: "4. Proof Points & Claims Verification" },
  { id: "wowhow", label: "5. WOW / HOW Strategic Pillars" },
  { id: "objectives", label: "6. Client Objectives & Brief Builder" },
  { id: "capabilities", label: "7. Capabilities Bento Matrix" },
  { id: "engagement", label: "8. Engagement & Appointment Models" },
  { id: "deliverables", label: "9. Procurement Deliverables" },
  { id: "lifecycle", label: "10. Delivery Lifecycle (6 Stages)" },
  { id: "specialist", label: "11. Specialist Interactive Module" },
  { id: "readiness", label: "12. Enterprise Readiness & HSE" },
  { id: "case_studies", label: "13. Related Case Studies" },
  { id: "related_services", label: "14. Related Services & Narrative" },
  { id: "gallery", label: "15. Portfolio & Media Gallery" },
  { id: "sections_ctrl", label: "16. Section Visibility & Ordering" },
  { id: "seo", label: "17. SEO & Open Graph Customizer" },
];

const TABS = [
  { id: "basic", label: "Basic Identity", icon: FileText },
  { id: "hero", label: "Hero Narrative", icon: ImageIcon },
  { id: "cta", label: "Action CTAs", icon: MousePointer2 },
  { id: "evidence", label: "Proof & Evidence", icon: CheckCircle2 },
  { id: "wowhow", label: "WOW / HOW", icon: Sparkles },
  { id: "objectives", label: "Objectives", icon: ListChecks },
  { id: "capabilities", label: "Capabilities Bento", icon: Grid },
  { id: "engagement", label: "Engagement Models", icon: Package },
  { id: "deliverables", label: "Deliverables", icon: Layers },
  { id: "lifecycle", label: "6-Stage Lifecycle", icon: Sliders },
  { id: "specialist", label: "Specialist Module", icon: Sliders },
  { id: "readiness", label: "Enterprise & HSE", icon: ShieldCheck },
  { id: "case_studies", label: "Case Studies", icon: Award },
  { id: "related_services", label: "Related Services", icon: LinkIcon },
  { id: "gallery", label: "Media Gallery", icon: Grid },
  { id: "sections_ctrl", label: "Visibility Controls", icon: Eye },
  { id: "seo", label: "SEO & Social", icon: Search },
];

export function ServicesEditor({
  initialData,
  attractions = [],
  caseStudies = [],
  canonicalServices = [],
}: {
  initialData?: any;
  attractions?: { id: string; nameEn: string; nameAr?: string }[];
  caseStudies?: { id: string; slug: string; titleEn: string; titleAr?: string; clientName?: string }[];
  canonicalServices?: CanonicalService[];
}) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Unpack existing enhancement process if stored
  const proc =
    typeof initialData?.process === "object" && initialData?.process !== null && !Array.isArray(initialData?.process)
      ? initialData.process
      : {};

  // Form State
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    titleEn: initialData?.titleEn || "",
    titleAr: initialData?.titleAr || "",
    slug: initialData?.slug || "",
    taglineEn: initialData?.taglineEn || "",
    taglineAr: initialData?.taglineAr || "",
    category: initialData?.category || "Enterprise Service",
    isVisible: initialData?.isVisible !== undefined ? initialData.isVisible : true,
    isFeatured: initialData?.isFeatured || false,
    contentEn: initialData?.contentEn || "",
    contentAr: initialData?.contentAr || "",
    heroOutcomeEn: initialData?.heroOutcomeEn || proc.heroOutcomeEn || "",
    heroOutcomeAr: initialData?.heroOutcomeAr || proc.heroOutcomeAr || "",
    supportingStatementEn: initialData?.supportingStatementEn || proc.supportingStatementEn || initialData?.contentEn || "",
    supportingStatementAr: initialData?.supportingStatementAr || proc.supportingStatementAr || initialData?.contentAr || "",
    heroMediaType: initialData?.heroMediaType || proc.heroMediaType || "IMAGE",
    heroMediaUrl: initialData?.heroMediaUrl || "",
    mobileHeroMediaUrl: initialData?.mobileHeroMediaUrl || proc.mobileHeroMediaUrl || "",
    videoPosterUrl: initialData?.videoPosterUrl || proc.videoPosterUrl || "",
    thumbnail: initialData?.thumbnail || "",
    ctaPrimary: initialData?.ctaPrimary || proc.ctaPrimary || "BRIEF_BUILDER",
    ctaPrimaryTextEn: initialData?.ctaPrimaryTextEn || proc.ctaPrimaryTextEn || "Build Your Project Brief",
    ctaPrimaryTextAr: initialData?.ctaPrimaryTextAr || proc.ctaPrimaryTextAr || "بناء موجز مشروعك المخصص",
    ctaPrimaryUrl: initialData?.ctaPrimaryUrl || proc.ctaPrimaryUrl || "",
    ctaSecondary: initialData?.ctaSecondary || proc.ctaSecondary || "",
    ctaSecondaryTextEn: initialData?.ctaSecondaryTextEn || proc.ctaSecondaryTextEn || "View Relevant Work",
    ctaSecondaryTextAr: initialData?.ctaSecondaryTextAr || proc.ctaSecondaryTextAr || "استعراض المشاريع ذات الصلة",
    ctaSecondaryUrl: initialData?.ctaSecondaryUrl || proc.ctaSecondaryUrl || "#case-studies-section",
    attractionId: initialData?.attractionId || "",
    successMetricLabel: initialData?.successMetricLabel || "",
    successMetricValue: initialData?.successMetricValue || "",
    relatedServicesNarrativeEn: initialData?.relatedServicesNarrativeEn || proc.relatedServicesNarrativeEn || "",
    relatedServicesNarrativeAr: initialData?.relatedServicesNarrativeAr || proc.relatedServicesNarrativeAr || "",
    seo: initialData?.seo || {
      metaTitleEn: initialData?.titleEn || "",
      metaTitleAr: initialData?.titleAr || "",
      metaDescriptionEn: initialData?.taglineEn || "",
      metaDescriptionAr: initialData?.taglineAr || "",
      keywordsEn: "",
      keywordsAr: "",
      ogTitleEn: initialData?.titleEn || "",
      ogTitleAr: initialData?.titleAr || "",
      ogDescriptionEn: initialData?.taglineEn || "",
      ogDescriptionAr: initialData?.taglineAr || "",
      ogImage: initialData?.heroMediaUrl || initialData?.thumbnail || "",
      canonicalUrl: initialData?.slug ? `https://eeeqa.com/en/b2b/services/${initialData.slug}` : "",
    },
  });

  // Proof Points with claims verification
  const [proofPoints, setProofPoints] = useState<VerifiedProofPoint[]>(() => {
    const raw = initialData?.verifiedProofPoints || proc.verifiedProofPoints || proc.proofPoints;
    if (Array.isArray(raw)) {
      return raw.map((p) => ({
        value: p.value || "",
        labelEn: p.labelEn || "",
        labelAr: p.labelAr || "",
        sourceEn: p.sourceEn || "",
        sourceAr: p.sourceAr || "",
        isVerified: p.isVerified !== false, // Default verified true
      }));
    }
    return [
      { value: "100%", labelEn: "Turnkey Accountability", labelAr: "مسؤولية متكاملة شاملة", sourceEn: "Qatar In-House Engineering", sourceAr: "طواقم هندسية داخلية في قطر", isVerified: true },
      { value: "Civil Defence", labelEn: "Compliant & Permitted", labelAr: "معتمد ومطابق للدفاع المدني", sourceEn: "HSE Protocol Documentation", sourceAr: "توثيق بروتوكولات السلامة", isVerified: true },
    ];
  });

  // WOW / HOW Strategic Pillars
  const [wowHow, setWowHow] = useState<WowHowItem[]>(() => {
    const raw = initialData?.wowHow || proc.wowHow;
    if (Array.isArray(raw)) return raw;
    return [];
  });

  // Client Objectives & Brief Builder Mapping
  const [objectives, setObjectives] = useState<ServiceObjective[]>(() => {
    const raw = initialData?.objectives || proc.objectives;
    if (Array.isArray(raw)) return raw;
    return [];
  });

  // Capabilities Bento Matrix
  const [capabilities, setCapabilities] = useState<CapabilityBentoItem[]>(() => {
    const raw = initialData?.capabilities || proc.capabilities;
    if (Array.isArray(raw)) return raw;
    return [];
  });

  // Engagement & Procurement Models
  const [engagementModels, setEngagementModels] = useState<EngagementModel[]>(() => {
    const raw = initialData?.engagementModels || proc.engagementModels;
    if (Array.isArray(raw)) return raw;
    return [];
  });

  // Procurement Deliverables
  const [deliverables, setDeliverables] = useState<DeliverableCategory[]>(() => {
    const raw = initialData?.deliverables || proc.deliverables;
    if (Array.isArray(raw)) return raw;
    return [];
  });

  // 6-Stage Delivery Lifecycle
  const [lifecycleStages, setLifecycleStages] = useState<LifecycleStage[]>(() => {
    const raw = initialData?.lifecycleStages || proc.lifecycleStages;
    if (Array.isArray(raw)) return raw;
    return [];
  });

  // Specialist Interactive Module
  const [specialistModule, setSpecialistModule] = useState<ServiceSpecificModuleConfig>(() => {
    const raw = initialData?.serviceSpecificModule || proc.serviceSpecificModule;
    if (raw && typeof raw === "object") return raw;
    return {
      type: "scale-explorer",
      titleEn: "Scope & Specifications Explorer",
      titleAr: "مستكشف نطاق العمل والمواصفات",
      subtitleEn: "Select scale or parameter to review production requirements.",
      subtitleAr: "اختر النطاق أو المعيار لاستعراض المتطلبات الفنية.",
      data: {},
    };
  });

  // Enterprise Readiness & HSE
  const [enterpriseReadiness, setEnterpriseReadiness] = useState<EnterpriseReadinessItem[]>(() => {
    const raw = initialData?.enterpriseReadiness || proc.enterpriseReadiness;
    if (Array.isArray(raw)) return raw;
    return [];
  });

  // Related Case Studies
  const [relatedCaseStudySlugs, setRelatedCaseStudySlugs] = useState<string[]>(() => {
    const raw = initialData?.relatedCaseStudySlugs || proc.relatedCaseStudySlugs;
    if (Array.isArray(raw)) return raw;
    return [];
  });

  // Related Services
  const [relatedServiceSlugs, setRelatedServiceSlugs] = useState<string[]>(() => {
    const raw = initialData?.relatedServiceSlugs || proc.relatedServiceSlugs;
    if (Array.isArray(raw)) return raw;
    return [];
  });

  // Section Visibility
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>(() => {
    const raw = initialData?.sectionVisibility || proc.sectionVisibility;
    if (raw && typeof raw === "object") return raw;
    return {
      hero: true,
      wowHow: true,
      objectives: true,
      gallery: true,
      capabilities: true,
      engagementModels: true,
      deliverables: true,
      lifecycle: true,
      specialistModule: true,
      caseStudies: true,
      enterpriseReadiness: true,
      relatedServices: true,
    };
  });

  // Gallery
  const [gallery, setGallery] = useState<any[]>(() => {
    if (Array.isArray(initialData?.gallery)) {
      return initialData.gallery.map((g: any, idx: number) => ({
        id: g.id || `gal-${idx}`,
        url: g.url || g.mediaUrl || "",
        mediaUrl: g.mediaUrl || g.url || "",
        mediaType: g.mediaType || "IMAGE",
        captionEn: g.captionEn || g.titleEn || "",
        captionAr: g.captionAr || g.titleAr || "",
        orderIndex: g.orderIndex ?? idx,
      }));
    }
    return [];
  });

  // Projects
  const [projects] = useState<any[]>(() =>
    Array.isArray(initialData?.projects)
      ? initialData.projects.map((p: any) => ({ id: p.id || Math.random().toString(), ...p }))
      : []
  );

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSeoChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      seo: { ...prev.seo, [key]: value },
    }));
    setHasUnsavedChanges(true);
  };

  const toggleSectionVisibility = (sectionKey: string) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.titleEn || !formData.titleAr) {
      alert("Service Slug and Bilingual Titles (EN/AR) are required.");
      return;
    }

    setIsSaving(true);
    try {
      const processPayload = {
        heroOutcomeEn: formData.heroOutcomeEn,
        heroOutcomeAr: formData.heroOutcomeAr,
        supportingStatementEn: formData.supportingStatementEn,
        supportingStatementAr: formData.supportingStatementAr,
        mobileHeroMediaUrl: formData.mobileHeroMediaUrl,
        videoPosterUrl: formData.videoPosterUrl,
        ctaPrimary: formData.ctaPrimary,
        ctaPrimaryTextEn: formData.ctaPrimaryTextEn,
        ctaPrimaryTextAr: formData.ctaPrimaryTextAr,
        ctaPrimaryUrl: formData.ctaPrimaryUrl,
        ctaSecondary: formData.ctaSecondary,
        ctaSecondaryTextEn: formData.ctaSecondaryTextEn,
        ctaSecondaryTextAr: formData.ctaSecondaryTextAr,
        ctaSecondaryUrl: formData.ctaSecondaryUrl,
        verifiedProofPoints: proofPoints,
        wowHow,
        objectives,
        capabilities,
        engagementModels,
        deliverables,
        lifecycleStages,
        serviceSpecificModule: specialistModule,
        enterpriseReadiness,
        relatedCaseStudySlugs,
        relatedServiceSlugs,
        relatedServicesNarrativeEn: formData.relatedServicesNarrativeEn,
        relatedServicesNarrativeAr: formData.relatedServicesNarrativeAr,
        sectionVisibility,
      };

      const payload = {
        ...formData,
        heroMediaType: formData.heroMediaType,
        heroMediaUrl: formData.heroMediaUrl,
        process: processPayload,
        gallery,
        projects,
        seo: {
          ...formData.seo,
          metaTitleEn: formData.seo?.metaTitleEn || formData.titleEn,
          metaTitleAr: formData.seo?.metaTitleAr || formData.titleAr,
          metaDescriptionEn: formData.seo?.metaDescriptionEn || formData.taglineEn,
          metaDescriptionAr: formData.seo?.metaDescriptionAr || formData.taglineAr,
          canonicalUrl: formData.seo?.canonicalUrl || `https://eeeqa.com/en/b2b/services/${formData.slug}`,
        },
      };

      if (formData.id) {
        const res = await fetch(`/api/b2b/services/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to update service");
        }
      } else {
        const res = await fetch(`/api/b2b/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            slug: formData.slug,
            titleEn: formData.titleEn,
            titleAr: formData.titleAr,
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to create service");
        }
      }

      setHasUnsavedChanges(false);
      router.push("/dashboard/b2b/services");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to save service");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        title={isEditing ? `Edit Service: ${formData.titleEn || formData.slug}` : "Create New Engineering Service"}
        description="Manage end-to-end bilingual service microsites, capabilities, proof points, and lifecycle delivery."
        secondaryAction={
          <button
            onClick={() => router.push("/dashboard/b2b/services")}
            className="px-4 py-2 text-xs font-bold rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border-level-1)] cursor-pointer"
          >
            Cancel
          </button>
        }
        primaryAction={{
          label: isSaving ? "Saving..." : "Save Changes",
          onClick: handleSave,
          isLoading: isSaving,
          disabled: isSaving,
          icon: <Save className="w-4 h-4" />,
          variant: "primary",
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3">
          <DashboardSectionNavigator
            sections={SERVICE_SECTIONS}
            activeSectionId={activeTab}
            onSectionChange={setActiveTab}
          />
        </div>

        {/* Editor Main Content Area */}
        <div className="lg:col-span-9">
          <div className="bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-2xl p-6 sm:p-8 shadow-xs">
            {/* 1. BASIC IDENTITY */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">1. Basic Identity & Category</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Canonical URLs, bilingual service titles, category tags, and visibility status.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Title (English) *
                    </label>
                    <input
                      type="text"
                      value={formData.titleEn}
                      onChange={(e) => handleChange("titleEn", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:outline-hidden"
                      placeholder="e.g. Mega Events & End-to-End Production"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-right">
                      * (العربية) العنوان
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={formData.titleAr}
                      onChange={(e) => handleChange("titleAr", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:outline-hidden"
                      placeholder="مثال: الفعاليات الكبرى والإنتاج الشامل"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      URL Slug *
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-level-1)] px-3 py-2.5 rounded-s-xl border border-e-0 border-[var(--border-level-2)]">
                        /b2b/services/
                      </span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleChange("slug", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-e-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm font-mono focus:border-emerald-500 focus:outline-hidden"
                        placeholder="mega-events"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Category Tag
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:outline-hidden"
                      placeholder="Events & Festivals"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Tagline (English)
                    </label>
                    <input
                      type="text"
                      value={formData.taglineEn}
                      onChange={(e) => handleChange("taglineEn", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:outline-hidden"
                      placeholder="Turnkey masterplanning and spatial design."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-right">
                      الشعار الفرعي (العربية)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={formData.taglineAr}
                      onChange={(e) => handleChange("taglineAr", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:outline-hidden"
                      placeholder="تخطيط شامل وتصميم فضائي وإنتاج حي."
                    />
                  </div>
                </div>

                {attractions.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Linked Physical Attraction / Destination (Optional)
                    </label>
                    <select
                      value={formData.attractionId}
                      onChange={(e) => handleChange("attractionId", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:outline-hidden"
                    >
                      <option value="">-- No Direct Attraction Linked --</option>
                      {attractions.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nameEn} {a.nameAr ? `(${a.nameAr})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-wrap gap-8 pt-4 border-t border-[var(--border-level-1)]">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => handleChange("isVisible", e.target.checked)}
                      className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 focus:ring-2 bg-[var(--bg-level-1)] border-[var(--border-level-2)]"
                    />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      Publicly Visible on Live Website
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => handleChange("isFeatured", e.target.checked)}
                      className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 focus:ring-2 bg-[var(--bg-level-1)] border-[var(--border-level-2)]"
                    />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      Featured in Enterprise Directory Hero
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* 2. HERO NARRATIVE & MEDIA */}
            {activeTab === "hero" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">2. Hero Narrative & Media</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Hero headline statement, supporting paragraph, and desktop/mobile media assets.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Hero Outcome Statement (English)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.heroOutcomeEn}
                      onChange={(e) => handleChange("heroOutcomeEn", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:outline-hidden"
                      placeholder="Flawless Live Execution for Thousands of Guests with Zero Creative Compromise."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-right">
                      بيان القيمة والنتيجة الرئيسية (العربية)
                    </label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={formData.heroOutcomeAr}
                      onChange={(e) => handleChange("heroOutcomeAr", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:outline-hidden"
                      placeholder="تنفيذ حي استثنائي لآلاف الزوار بأعلى معايير الإبداع والانضباط التشغيلي."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Supporting Narrative (English)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.supportingStatementEn}
                      onChange={(e) => handleChange("supportingStatementEn", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:outline-hidden"
                      placeholder="Detailed paragraph explaining E3's unique delivery in Qatar..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-right">
                      السرد الداعم والمنهجية (العربية)
                    </label>
                    <textarea
                      rows={4}
                      dir="rtl"
                      value={formData.supportingStatementAr}
                      onChange={(e) => handleChange("supportingStatementAr", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:outline-hidden"
                      placeholder="فقرة تشرح تفاصيل تسليم إي ثري للمشاريع في قطر..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-level-1)]">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Desktop Hero Media URL (Image or Video)
                    </label>
                    <input
                      type="text"
                      value={formData.heroMediaUrl}
                      onChange={(e) => handleChange("heroMediaUrl", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:outline-hidden"
                      placeholder="https://... /image.jpg"
                    />
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                        <input
                          type="radio"
                          name="heroMediaType"
                          value="IMAGE"
                          checked={formData.heroMediaType === "IMAGE"}
                          onChange={() => handleChange("heroMediaType", "IMAGE")}
                        />
                        Image
                      </label>
                      <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                        <input
                          type="radio"
                          name="heroMediaType"
                          value="VIDEO"
                          checked={formData.heroMediaType === "VIDEO"}
                          onChange={() => handleChange("heroMediaType", "VIDEO")}
                        />
                        Video (MP4 / WebM)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Mobile Hero Media / Poster URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.mobileHeroMediaUrl}
                      onChange={(e) => handleChange("mobileHeroMediaUrl", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:outline-hidden"
                      placeholder="https://... /poster.jpg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. PRIMARY & SECONDARY CTAs */}
            {activeTab === "cta" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">3. Primary & Secondary CTAs</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Configure the hero interactive buttons, destination URLs, and custom bilingual labels.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-4">
                  <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Primary Call to Action</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Button Label (English)</label>
                      <input
                        type="text"
                        value={formData.ctaPrimaryTextEn}
                        onChange={(e) => handleChange("ctaPrimaryTextEn", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm"
                        placeholder="Build Your Project Brief"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">عنوان الزر (العربية)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={formData.ctaPrimaryTextAr}
                        onChange={(e) => handleChange("ctaPrimaryTextAr", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm"
                        placeholder="بناء موجز مشروعك المخصص"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Custom Link URL (Leave blank to open Brief Builder modal)</label>
                    <input
                      type="text"
                      value={formData.ctaPrimaryUrl}
                      onChange={(e) => handleChange("ctaPrimaryUrl", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-mono"
                      placeholder="/b2b/contact"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-4">
                  <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Secondary Call to Action</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Button Label (English)</label>
                      <input
                        type="text"
                        value={formData.ctaSecondaryTextEn}
                        onChange={(e) => handleChange("ctaSecondaryTextEn", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm"
                        placeholder="View Relevant Work"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">عنوان الزر (العربية)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={formData.ctaSecondaryTextAr}
                        onChange={(e) => handleChange("ctaSecondaryTextAr", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm"
                        placeholder="استعراض المشاريع ذات الصلة"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Destination URL / Anchor</label>
                    <input
                      type="text"
                      value={formData.ctaSecondaryUrl}
                      onChange={(e) => handleChange("ctaSecondaryUrl", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-mono"
                      placeholder="#case-studies-section"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. PROOF POINTS & CLAIMS VERIFICATION */}
            {activeTab === "evidence" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">4. Proof Points & Claims Verification</h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Manage factual proof points. Toggle verification status; unverified claims are automatically suppressed from public view.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setProofPoints((prev) => [
                        ...prev,
                        { value: "", labelEn: "", labelAr: "", sourceEn: "", sourceAr: "", isVerified: true },
                      ]);
                      setHasUnsavedChanges(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Metric Claim
                  </button>
                </div>

                <div className="space-y-4">
                  {proofPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        point.isVerified !== false
                          ? "bg-[var(--bg-level-1)] border-[var(--border-level-2)]"
                          : "bg-red-500/5 border-red-500/20 opacity-75"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                            Proof Point #{idx + 1}
                          </span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={point.isVerified !== false}
                              onChange={(e) => {
                                const next = [...proofPoints];
                                next[idx].isVerified = e.target.checked;
                                setProofPoints(next);
                                setHasUnsavedChanges(true);
                              }}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span
                              className={`text-xs font-bold ${
                                point.isVerified !== false ? "text-emerald-500" : "text-amber-500"
                              }`}
                            >
                              {point.isVerified !== false ? "Verified Claim (Public)" : "Unverified (Suppressed)"}
                            </span>
                          </label>
                        </div>
                        <button
                          onClick={() => {
                            setProofPoints(proofPoints.filter((_, i) => i !== idx));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-red-500 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                            Metric Value / Badge
                          </label>
                          <input
                            type="text"
                            value={point.value}
                            onChange={(e) => {
                              const next = [...proofPoints];
                              next[idx].value = e.target.value;
                              setProofPoints(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="e.g. 100% or Tier-1"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                            Label (English)
                          </label>
                          <input
                            type="text"
                            value={point.labelEn}
                            onChange={(e) => {
                              const next = [...proofPoints];
                              next[idx].labelEn = e.target.value;
                              setProofPoints(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm"
                            placeholder="Turnkey Delivery"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1 text-right">
                            الوصف (العربية)
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={point.labelAr}
                            onChange={(e) => {
                              const next = [...proofPoints];
                              next[idx].labelAr = e.target.value;
                              setProofPoints(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm"
                            placeholder="تنفيذ متكامل وشامل"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                            Source Citation / Audit Basis (EN)
                          </label>
                          <input
                            type="text"
                            value={point.sourceEn || ""}
                            onChange={(e) => {
                              const next = [...proofPoints];
                              next[idx].sourceEn = e.target.value;
                              setProofPoints(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="Verified on Qatar production inventory"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1 text-right">
                            مرجع التوثيق والتدقيق (العربية)
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={point.sourceAr || ""}
                            onChange={(e) => {
                              const next = [...proofPoints];
                              next[idx].sourceAr = e.target.value;
                              setProofPoints(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="موثق في سجلات الإنتاج بقطر"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. WOW / HOW STRATEGIC PILLARS */}
            {activeTab === "wowhow" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">5. WOW / HOW Strategic Pillars</h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Dual storytelling device pairing artistic vision (WOW) with engineering rigor (HOW).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setWowHow((prev) => [
                        ...prev,
                        {
                          id: `wh-${Date.now()}`,
                          titleEn: "",
                          titleAr: "",
                          wowEn: "",
                          wowAr: "",
                          howEn: "",
                          howAr: "",
                        },
                      ]);
                      setHasUnsavedChanges(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add WOW/HOW Pillar
                  </button>
                </div>

                <div className="space-y-4">
                  {wowHow.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                          Pillar #{idx + 1}
                        </span>
                        <button
                          onClick={() => {
                            setWowHow(wowHow.filter((_, i) => i !== idx));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-red-500 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Pillar Title (English)</label>
                          <input
                            type="text"
                            value={item.titleEn}
                            onChange={(e) => {
                              const next = [...wowHow];
                              next[idx].titleEn = e.target.value;
                              setWowHow(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="Monumental Spatial Immersion"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">عنوان الركيزة (العربية)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={item.titleAr}
                            onChange={(e) => {
                              const next = [...wowHow];
                              next[idx].titleAr = e.target.value;
                              setWowHow(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="الإبهار الفضائي والتأثير البصري"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <label className="block text-xs font-bold text-amber-500 uppercase mb-1">The WOW (English)</label>
                          <textarea
                            rows={2}
                            value={item.wowEn}
                            onChange={(e) => {
                              const next = [...wowHow];
                              next[idx].wowEn = e.target.value;
                              setWowHow(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="What the audience feels and experiences..."
                          />
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <label className="block text-xs font-bold text-amber-500 uppercase mb-1 text-right">عنصر الإبهار WOW (العربية)</label>
                          <textarea
                            rows={2}
                            dir="rtl"
                            value={item.wowAr}
                            onChange={(e) => {
                              const next = [...wowHow];
                              next[idx].wowAr = e.target.value;
                              setWowHow(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="ما يشعر به الزائر والجمهور..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <label className="block text-xs font-bold text-emerald-500 uppercase mb-1">The HOW (English)</label>
                          <textarea
                            rows={2}
                            value={item.howEn}
                            onChange={(e) => {
                              const next = [...wowHow];
                              next[idx].howEn = e.target.value;
                              setWowHow(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="The technical engineering and calculations..."
                          />
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <label className="block text-xs font-bold text-emerald-500 uppercase mb-1 text-right">المنهجية الفنية HOW (العربية)</label>
                          <textarea
                            rows={2}
                            dir="rtl"
                            value={item.howAr}
                            onChange={(e) => {
                              const next = [...wowHow];
                              next[idx].howAr = e.target.value;
                              setWowHow(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="الحسابات الهندسية والتنفيذ الدقيق..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CLIENT OBJECTIVES & BRIEF BUILDER MAPPING */}
            {activeTab === "objectives" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">6. Client Objectives & Brief Builder</h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Interactive objectives answering &quot;What are you trying to achieve?&quot; which pre-load the brief builder modal.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setObjectives((prev) => [
                        ...prev,
                        {
                          id: `obj-${Date.now()}`,
                          labelEn: "",
                          labelAr: "",
                          descriptionEn: "",
                          descriptionAr: "",
                          highlightedCapabilityIds: [],
                          recommendedDeliverableIds: [],
                        },
                      ]);
                      setHasUnsavedChanges(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Objective Card
                  </button>
                </div>

                <div className="space-y-4">
                  {objectives.map((obj, idx) => (
                    <div key={obj.id || idx} className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                          Objective #{idx + 1}
                        </span>
                        <button
                          onClick={() => {
                            setObjectives(objectives.filter((_, i) => i !== idx));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-red-500 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Objective Goal (English)</label>
                          <input
                            type="text"
                            value={obj.labelEn}
                            onChange={(e) => {
                              const next = [...objectives];
                              next[idx].labelEn = e.target.value;
                              setObjectives(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="Deliver a National Day Festival"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">الهدف الاستراتيجي (العربية)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={obj.labelAr}
                            onChange={(e) => {
                              const next = [...objectives];
                              next[idx].labelAr = e.target.value;
                              setObjectives(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="تنفيذ احتفال وطني بمواصفات عالمية"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description (English)</label>
                          <textarea
                            rows={2}
                            value={obj.descriptionEn}
                            onChange={(e) => {
                              const next = [...objectives];
                              next[idx].descriptionEn = e.target.value;
                              setObjectives(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="Detailed scenario..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">الوصف (العربية)</label>
                          <textarea
                            rows={2}
                            dir="rtl"
                            value={obj.descriptionAr}
                            onChange={(e) => {
                              const next = [...objectives];
                              next[idx].descriptionAr = e.target.value;
                              setObjectives(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="سيناريو التنفيذ المتوقع..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. CAPABILITIES BENTO MATRIX */}
            {activeTab === "capabilities" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">7. Capabilities Bento Matrix</h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Bento grid items displaying engineering specialisms, deliverables tags, and col-span layout.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCapabilities((prev) => [
                        ...prev,
                        {
                          id: `cap-${Date.now()}`,
                          titleEn: "",
                          titleAr: "",
                          descriptionEn: "",
                          descriptionAr: "",
                          deliverablesEn: [],
                          deliverablesAr: [],
                          suitableForEn: [],
                          suitableForAr: [],
                          tagEn: "Engineering",
                          tagAr: "الهندسة",
                          colSpan: 1,
                        },
                      ]);
                      setHasUnsavedChanges(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Bento Card
                  </button>
                </div>

                <div className="space-y-4">
                  {capabilities.map((cap, idx) => (
                    <div key={cap.id || idx} className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                            Capability #{idx + 1}
                          </span>
                          <select
                            value={cap.colSpan || 1}
                            onChange={(e) => {
                              const next = [...capabilities];
                              next[idx].colSpan = Number(e.target.value) as 1 | 2;
                              setCapabilities(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="text-xs px-2 py-1 rounded bg-[var(--surface-default)] border border-[var(--border-level-2)] font-semibold"
                          >
                            <option value={1}>Width: 1 Column</option>
                            <option value={2}>Width: 2 Columns (Wide)</option>
                          </select>
                        </div>
                        <button
                          onClick={() => {
                            setCapabilities(capabilities.filter((_, i) => i !== idx));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-red-500 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (English)</label>
                          <input
                            type="text"
                            value={cap.titleEn}
                            onChange={(e) => {
                              const next = [...capabilities];
                              next[idx].titleEn = e.target.value;
                              setCapabilities(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="Masterplanning & Spatial Zoning"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">العنوان (العربية)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={cap.titleAr}
                            onChange={(e) => {
                              const next = [...capabilities];
                              next[idx].titleAr = e.target.value;
                              setCapabilities(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="المخطط العام والتوزيع المكاني"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description (English)</label>
                          <textarea
                            rows={2}
                            value={cap.descriptionEn}
                            onChange={(e) => {
                              const next = [...capabilities];
                              next[idx].descriptionEn = e.target.value;
                              setCapabilities(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="Engineering scope..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">الوصف (العربية)</label>
                          <textarea
                            rows={2}
                            dir="rtl"
                            value={cap.descriptionAr}
                            onChange={(e) => {
                              const next = [...capabilities];
                              next[idx].descriptionAr = e.target.value;
                              setCapabilities(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="نطاق العمل الهندسي..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Key Deliverables (Comma separated, EN)</label>
                          <input
                            type="text"
                            value={(cap.deliverablesEn || []).join(", ")}
                            onChange={(e) => {
                              const next = [...capabilities];
                              next[idx].deliverablesEn = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                              setCapabilities(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="CAD Drawing, RAMS Dossier, Simulation"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">المخرجات الرئيسية (مفصولة بفواصل، AR)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={(cap.deliverablesAr || []).join("، ")}
                            onChange={(e) => {
                              const next = [...capabilities];
                              next[idx].deliverablesAr = e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean);
                              setCapabilities(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="مخططات CAD، ملف RAMS، المحاكاة"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. ENGAGEMENT & PROCUREMENT MODELS */}
            {activeTab === "engagement" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">8. Engagement & Appointment Models</h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Procurement structures (e.g. Turnkey Delivery, Engineering Partner, PMO Support).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEngagementModels((prev) => [
                        ...prev,
                        {
                          id: `eng-${Date.now()}`,
                          titleEn: "",
                          titleAr: "",
                          subtitleEn: "",
                          subtitleAr: "",
                          descriptionEn: "",
                          descriptionAr: "",
                          bestForEn: "",
                          bestForAr: "",
                          typicalDurationEn: "",
                          typicalDurationAr: "",
                        },
                      ]);
                      setHasUnsavedChanges(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Engagement Model
                  </button>
                </div>

                <div className="space-y-4">
                  {engagementModels.map((model, idx) => (
                    <div key={model.id || idx} className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                          Model #{idx + 1}
                        </span>
                        <button
                          onClick={() => {
                            setEngagementModels(engagementModels.filter((_, i) => i !== idx));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-red-500 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Model Title (English)</label>
                          <input
                            type="text"
                            value={model.titleEn}
                            onChange={(e) => {
                              const next = [...engagementModels];
                              next[idx].titleEn = e.target.value;
                              setEngagementModels(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="Turnkey Project Delivery"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">عنوان النموذج (العربية)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={model.titleAr}
                            onChange={(e) => {
                              const next = [...engagementModels];
                              next[idx].titleAr = e.target.value;
                              setEngagementModels(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="التنفيذ الشامل المتكامل (Turnkey)"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Best For Scope (English)</label>
                          <input
                            type="text"
                            value={model.bestForEn}
                            onChange={(e) => {
                              const next = [...engagementModels];
                              next[idx].bestForEn = e.target.value;
                              setEngagementModels(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="National festivals, government ceremonies"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">النطاق المثالي (العربية)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={model.bestForAr}
                            onChange={(e) => {
                              const next = [...engagementModels];
                              next[idx].bestForAr = e.target.value;
                              setEngagementModels(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="المهرجانات الوطنية والاحتفالات الكبرى"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. PROCUREMENT DELIVERABLES */}
            {activeTab === "deliverables" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">9. Procurement Deliverable Categories</h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Formal deliverable categories and itemized checklists for enterprise tender packs.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDeliverables((prev) => [
                        ...prev,
                        {
                          id: `del-${Date.now()}`,
                          titleEn: "",
                          titleAr: "",
                          itemsEn: [],
                          itemsAr: [],
                        },
                      ]);
                      setHasUnsavedChanges(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                </div>

                <div className="space-y-4">
                  {deliverables.map((cat, idx) => (
                    <div key={cat.id || idx} className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                          Category #{idx + 1}
                        </span>
                        <button
                          onClick={() => {
                            setDeliverables(deliverables.filter((_, i) => i !== idx));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-red-500 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category Title (English)</label>
                          <input
                            type="text"
                            value={cat.titleEn}
                            onChange={(e) => {
                              const next = [...deliverables];
                              next[idx].titleEn = e.target.value;
                              setDeliverables(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="Pre-Production & Engineering"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">عنوان الفئة (العربية)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={cat.titleAr}
                            onChange={(e) => {
                              const next = [...deliverables];
                              next[idx].titleAr = e.target.value;
                              setDeliverables(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="مرحلة ما قبل الإنتاج والهندسة"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Itemized Deliverables (Comma separated, EN)</label>
                          <textarea
                            rows={3}
                            value={(cat.itemsEn || []).join("\n")}
                            onChange={(e) => {
                              const next = [...deliverables];
                              next[idx].itemsEn = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
                              setDeliverables(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs font-mono"
                            placeholder="3D Concept Renders&#10;Structural CAD Drawings&#10;RAMS Documentation"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">قائمة المخرجات (سطر لكل مخرج، AR)</label>
                          <textarea
                            rows={3}
                            dir="rtl"
                            value={(cat.itemsAr || []).join("\n")}
                            onChange={(e) => {
                              const next = [...deliverables];
                              next[idx].itemsAr = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
                              setDeliverables(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs font-mono"
                            placeholder="تصاميم ثلاثية الأبعاد&#10;المخططات الهندسية CAD&#10;ملف السلامة RAMS"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10. DELIVERY LIFECYCLE (6 STAGES) */}
            {activeTab === "lifecycle" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">10. Delivery Lifecycle (6 Stages)</h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      End-to-end execution methodology from strategic discovery to post-event debrief.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setLifecycleStages((prev) => [
                        ...prev,
                        {
                          id: `stage-${Date.now()}` as any,
                          stageNumber: String(prev.length + 1).padStart(2, "0"),
                          titleEn: "",
                          titleAr: "",
                          descriptionEn: "",
                          descriptionAr: "",
                          outputsEn: [],
                          outputsAr: [],
                        },
                      ]);
                      setHasUnsavedChanges(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Lifecycle Stage
                  </button>
                </div>

                <div className="space-y-4">
                  {lifecycleStages.map((stage, idx) => (
                    <div key={stage.id || idx} className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                            {stage.stageNumber || idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[var(--text-primary)]">Stage #{idx + 1}</span>
                        </div>
                        <button
                          onClick={() => {
                            setLifecycleStages(lifecycleStages.filter((_, i) => i !== idx));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-red-500 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Stage Title (English)</label>
                          <input
                            type="text"
                            value={stage.titleEn}
                            onChange={(e) => {
                              const next = [...lifecycleStages];
                              next[idx].titleEn = e.target.value;
                              setLifecycleStages(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="Discovery & Strategic Alignment"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">عنوان المرحلة (العربية)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={stage.titleAr}
                            onChange={(e) => {
                              const next = [...lifecycleStages];
                              next[idx].titleAr = e.target.value;
                              setLifecycleStages(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="الاستكشاف والتوافق الاستراتيجي"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Key Outputs (Comma separated, EN)</label>
                          <input
                            type="text"
                            value={(stage.outputsEn || []).join(", ")}
                            onChange={(e) => {
                              const next = [...lifecycleStages];
                              next[idx].outputsEn = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                              setLifecycleStages(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="Initial Brief Dossier, Feasibility Note"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">المخرجات الأساسية (AR)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={(stage.outputsAr || []).join("، ")}
                            onChange={(e) => {
                              const next = [...lifecycleStages];
                              next[idx].outputsAr = e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean);
                              setLifecycleStages(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                            placeholder="ملف التوافق المبدئي، دراسة الجدوى"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 11. SPECIALIST INTERACTIVE MODULE */}
            {activeTab === "specialist" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">11. Specialist Interactive Module</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Domain-specific interactive widget embedded in this service microsite.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Module Type
                    </label>
                    <select
                      value={specialistModule.type}
                      onChange={(e) => {
                        setSpecialistModule((prev) => ({ ...prev, type: e.target.value as any }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:outline-hidden font-semibold"
                    >
                      <option value="scale-explorer">Scale & Complexity Explorer</option>
                      <option value="capacity-calc">Zone & Capacity Calculator</option>
                      <option value="curation-matrix">Talent & Show Curation Matrix</option>
                      <option value="av-selector">AV & Staging Rig Specifier</option>
                      <option value="tech-stack">Attraction & Ticketing Tech Stack</option>
                      <option value="spatial-config">Spatial Fabrication Configurator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Module Title (English)
                    </label>
                    <input
                      type="text"
                      value={specialistModule.titleEn}
                      onChange={(e) => {
                        setSpecialistModule((prev) => ({ ...prev, titleEn: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm"
                      placeholder="Scope & Specifications Explorer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-right">
                      عنوان الأداة التفاعلية (العربية)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={specialistModule.titleAr}
                      onChange={(e) => {
                        setSpecialistModule((prev) => ({ ...prev, titleAr: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm"
                      placeholder="مستكشف نطاق العمل والمواصفات"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Subtitle / Instructions (English)
                    </label>
                    <textarea
                      rows={2}
                      value={specialistModule.subtitleEn}
                      onChange={(e) => {
                        setSpecialistModule((prev) => ({ ...prev, subtitleEn: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-right">
                      التعليمات والوصف الفرعي (العربية)
                    </label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={specialistModule.subtitleAr}
                      onChange={(e) => {
                        setSpecialistModule((prev) => ({ ...prev, subtitleAr: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 12. ENTERPRISE READINESS & HSE */}
            {activeTab === "readiness" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">12. Enterprise Readiness & Accreditations</h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      HSE compliance, Qatar authority permitting, and structural engineering certifications.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEnterpriseReadiness((prev) => [
                        ...prev,
                        {
                          id: `er-${Date.now()}`,
                          titleEn: "",
                          titleAr: "",
                          descriptionEn: "",
                          descriptionAr: "",
                        },
                      ]);
                      setHasUnsavedChanges(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Readiness Item
                  </button>
                </div>

                <div className="space-y-4">
                  {enterpriseReadiness.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                          Accreditation #{idx + 1}
                        </span>
                        <button
                          onClick={() => {
                            setEnterpriseReadiness(enterpriseReadiness.filter((_, i) => i !== idx));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-red-500 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Standard / Protocol Title (English)</label>
                          <input
                            type="text"
                            value={item.titleEn}
                            onChange={(e) => {
                              const next = [...enterpriseReadiness];
                              next[idx].titleEn = e.target.value;
                              setEnterpriseReadiness(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="Direct Qatar Civil Defence Permitting"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">عنوان المعيار والترخيص (العربية)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={item.titleAr}
                            onChange={(e) => {
                              const next = [...enterpriseReadiness];
                              next[idx].titleAr = e.target.value;
                              setEnterpriseReadiness(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-sm font-bold"
                            placeholder="تراخيص الدفاع المدني والجهات الحكومية في قطر"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description (English)</label>
                          <textarea
                            rows={2}
                            value={item.descriptionEn}
                            onChange={(e) => {
                              const next = [...enterpriseReadiness];
                              next[idx].descriptionEn = e.target.value;
                              setEnterpriseReadiness(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-right">الوصف (العربية)</label>
                          <textarea
                            rows={2}
                            dir="rtl"
                            value={item.descriptionAr}
                            onChange={(e) => {
                              const next = [...enterpriseReadiness];
                              next[idx].descriptionAr = e.target.value;
                              setEnterpriseReadiness(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 13. RELATED CASE STUDIES */}
            {activeTab === "case_studies" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">13. Related Case Studies (Proof of Work)</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Select published landmark case studies to feature directly on this service page.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {caseStudies.map((cs) => {
                    const isSelected = relatedCaseStudySlugs.includes(cs.slug) || relatedCaseStudySlugs.includes(cs.id);
                    return (
                      <div
                        key={cs.id || cs.slug}
                        onClick={() => {
                          if (isSelected) {
                            setRelatedCaseStudySlugs(relatedCaseStudySlugs.filter((s) => s !== cs.slug && s !== cs.id));
                          } else {
                            setRelatedCaseStudySlugs([...relatedCaseStudySlugs, cs.slug]);
                          }
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 text-[var(--text-primary)]"
                            : "bg-[var(--bg-level-1)] border-[var(--border-level-2)] text-[var(--text-secondary)] opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest line-clamp-1">
                            {cs.clientName || "Landmark Client"}
                          </span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 rounded text-emerald-600 pointer-events-none"
                          />
                        </div>
                        <h4 className="text-sm font-bold line-clamp-1">{cs.titleEn}</h4>
                        {cs.titleAr && <h4 className="text-xs font-medium text-right text-[var(--text-tertiary)] line-clamp-1">{cs.titleAr}</h4>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 14. RELATED SERVICES & NARRATIVE */}
            {activeTab === "related_services" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">14. Related Integrated Services</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Cross-link complementary engineering disciplines and add explanatory integration narrative.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Integration Narrative (English)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.relatedServicesNarrativeEn}
                      onChange={(e) => handleChange("relatedServicesNarrativeEn", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm"
                      placeholder="E3 provides integrated delivery across complementary disciplines..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-right">
                      سردية التكامل والترابط (العربية)
                    </label>
                    <textarea
                      rows={3}
                      dir="rtl"
                      value={formData.relatedServicesNarrativeAr}
                      onChange={(e) => handleChange("relatedServicesNarrativeAr", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm"
                      placeholder="تقدم إي ثري حلولاً متكاملة بالتعاون مع التخصصات المكملة..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-[var(--border-level-1)]">
                  {canonicalServices
                    .filter((cs) => cs.slug !== formData.slug)
                    .map((cs) => {
                      const isSelected = relatedServiceSlugs.includes(cs.slug);
                      return (
                        <div
                          key={cs.slug}
                          onClick={() => {
                            if (isSelected) {
                              setRelatedServiceSlugs(relatedServiceSlugs.filter((s) => s !== cs.slug));
                            } else {
                              setRelatedServiceSlugs([...relatedServiceSlugs, cs.slug]);
                            }
                            setHasUnsavedChanges(true);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-emerald-500/10 border-emerald-500 text-[var(--text-primary)]"
                              : "bg-[var(--bg-level-1)] border-[var(--border-level-2)] text-[var(--text-secondary)] opacity-70 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest line-clamp-1">
                              {cs.categoryEn}
                            </span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="w-4 h-4 rounded text-emerald-600 pointer-events-none"
                            />
                          </div>
                          <h4 className="text-sm font-bold line-clamp-1">{cs.titleEn}</h4>
                          <h4 className="text-xs font-medium text-right text-[var(--text-tertiary)] line-clamp-1">{cs.titleAr}</h4>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 15. PORTFOLIO & MEDIA GALLERY */}
            {activeTab === "gallery" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">15. Portfolio & Media Gallery</h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      High-resolution visual execution gallery with bilingual captions and order management.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setGallery((prev) => [
                        ...prev,
                        {
                          id: `gal-${Date.now()}`,
                          url: "",
                          mediaUrl: "",
                          mediaType: "IMAGE",
                          captionEn: "",
                          captionAr: "",
                          orderIndex: prev.length,
                        },
                      ]);
                      setHasUnsavedChanges(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Gallery Media
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gallery.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                          Media #{idx + 1}
                        </span>
                        <button
                          onClick={() => {
                            setGallery(gallery.filter((_, i) => i !== idx));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-red-500 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Image / Video URL</label>
                        <input
                          type="text"
                          value={item.url || item.mediaUrl || ""}
                          onChange={(e) => {
                            const next = [...gallery];
                            next[idx].url = e.target.value;
                            next[idx].mediaUrl = e.target.value;
                            setGallery(next);
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs font-mono"
                          placeholder="https://... /photo.jpg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Caption (EN)</label>
                          <input
                            type="text"
                            value={item.captionEn || ""}
                            onChange={(e) => {
                              const next = [...gallery];
                              next[idx].captionEn = e.target.value;
                              setGallery(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-2 py-1 rounded bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1 text-right">الوصف (AR)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={item.captionAr || ""}
                            onChange={(e) => {
                              const next = [...gallery];
                              next[idx].captionAr = e.target.value;
                              setGallery(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-2 py-1 rounded bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 16. SECTION VISIBILITY & ORDERING */}
            {activeTab === "sections_ctrl" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">16. Section Visibility & Controls</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Granular toggle controls to show or hide individual sections on this microsite without losing content data.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: "hero", label: "Hero Narrative & Header", desc: "Top banner and main CTAs" },
                    { key: "wowHow", label: "WOW / HOW Strategic Pillars", desc: "Dual vision and engineering section" },
                    { key: "objectives", label: "What Are You Trying To Achieve?", desc: "Objective selector and brief mapping" },
                    { key: "gallery", label: "Visual Execution Gallery", desc: "Media portfolio grid" },
                    { key: "capabilities", label: "Capabilities Bento Matrix", desc: "Specialism cards with deliverables" },
                    { key: "engagementModels", label: "Engagement Models", desc: "Procurement appointment models" },
                    { key: "deliverables", label: "Deliverables Roster", desc: "Itemized scope checklist" },
                    { key: "lifecycle", label: "6-Stage Delivery Lifecycle", desc: "End-to-end methodology" },
                    { key: "specialistModule", label: "Specialist Interactive Module", desc: "Domain-specific widget" },
                    { key: "caseStudies", label: "Landmark Case Studies", desc: "Proof of work project cards" },
                    { key: "enterpriseReadiness", label: "Enterprise Readiness & HSE", desc: "Regulatory and safety compliance" },
                    { key: "relatedServices", label: "Related Integrated Services", desc: "Cross-service links and narrative" },
                  ].map((sec) => {
                    const isVisible = sectionVisibility[sec.key] !== false;
                    return (
                      <div
                        key={sec.key}
                        onClick={() => toggleSectionVisibility(sec.key)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isVisible
                            ? "bg-emerald-500/10 border-emerald-500/40"
                            : "bg-[var(--bg-level-1)] border-[var(--border-level-2)] opacity-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[var(--text-primary)]">{sec.label}</span>
                          <input
                            type="checkbox"
                            checked={isVisible}
                            readOnly
                            className="w-4 h-4 rounded text-emerald-600 pointer-events-none"
                          />
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">{sec.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 17. SEO & OPEN GRAPH */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">17. SEO & Open Graph Customizer</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Search engine metadata, social share previews, and canonical indexing URLs.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Meta Title (English)
                    </label>
                    <input
                      type="text"
                      value={formData.seo?.metaTitleEn || ""}
                      onChange={(e) => handleSeoChange("metaTitleEn", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-sm"
                      placeholder={formData.titleEn}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-right">
                      عنوان محركات البحث (العربية)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={formData.seo?.metaTitleAr || ""}
                      onChange={(e) => handleSeoChange("metaTitleAr", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-sm"
                      placeholder={formData.titleAr}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Meta Description (English)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.seo?.metaDescriptionEn || ""}
                      onChange={(e) => handleSeoChange("metaDescriptionEn", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-sm"
                      placeholder={formData.taglineEn}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-right">
                      وصف محركات البحث (العربية)
                    </label>
                    <textarea
                      rows={3}
                      dir="rtl"
                      value={formData.seo?.metaDescriptionAr || ""}
                      onChange={(e) => handleSeoChange("metaDescriptionAr", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-sm"
                      placeholder={formData.taglineAr}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Keywords (Comma separated, EN)
                    </label>
                    <input
                      type="text"
                      value={formData.seo?.keywordsEn || ""}
                      onChange={(e) => handleSeoChange("keywordsEn", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-sm"
                      placeholder="events, turnkey, staging, qatar"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-right">
                      الكلمات المفتاحية (العربية)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={formData.seo?.keywordsAr || ""}
                      onChange={(e) => handleSeoChange("keywordsAr", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-sm"
                      placeholder="فعاليات، إنتاج، قطر، مسارح"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-level-1)]">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Open Graph Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.seo?.ogImage || ""}
                      onChange={(e) => handleSeoChange("ogImage", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-sm font-mono"
                      placeholder="https://... /og-preview.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="text"
                      value={formData.seo?.canonicalUrl || ""}
                      onChange={(e) => handleSeoChange("canonicalUrl", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-sm font-mono"
                      placeholder="https://eeeqa.com/en/b2b/services/slug"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardPageShell>
  );
}
