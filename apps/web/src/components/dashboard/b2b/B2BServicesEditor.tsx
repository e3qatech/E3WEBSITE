"use client";

import React, { useState } from "react";
import { AdminFormLayout } from "../ui/AdminFormLayout";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { MediaUploader } from "@/components/shared/MediaUploader";
import { Plus, Trash2, ArrowUp, ArrowDown, Save } from "lucide-react";
import { E3LivingHeroEditor } from "@/components/dashboard/b2c/E3LivingHeroEditor";
import { AdminSeoCustomizer } from "../ui/AdminSeoCustomizer";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
  DashboardLanguageSwitch,
  LanguageEditMode,
  EditorSectionItem,
} from "@/components/dashboard/ui";

const SECTIONS: EditorSectionItem[] = [
  { id: "hero", label: "1. Hero Section", labelAr: "1. قسم البداية والواجهة" },
  { id: "capabilityCount", label: "2. Capability Metrics", labelAr: "2. مؤشرات القدرات التشغيلية" },
  { id: "philosophy", label: "3. WOW & HOW", labelAr: "3. فلسفة الإبهار والتنفيذ" },
  { id: "navigator", label: "4. Bento Navigator", labelAr: "4. متصفح الخدمات (Bento)" },
  { id: "spotlights", label: "5. Spotlights", labelAr: "5. الخدمات المميزة والمسلط عليها الضوء" },
  { id: "methodology", label: "6. Methodology", labelAr: "6. منهجية وسير العمل" },
  { id: "caseStudies", label: "7. Case Studies", labelAr: "7. المشاريع ودراسات الحالة" },
  { id: "cta", label: "8. RFP Gateway", labelAr: "8. بوابة طلب العروض والشراكة" },
  { id: "seo", label: "9. SEO Metadata", labelAr: "9. بيانات محركات البحث (SEO)" },
];

export function B2BServicesEditor({
  initialData,
  services = [],
  caseStudies = [],
}: {
  initialData: any;
  services?: any[];
  caseStudies?: any[];
}) {
  const [langMode, setLangMode] = useState<LanguageEditMode>("en");
  const activeLang = langMode === "ar" ? "ar" : "en";
  const [activeSectionId, setActiveSectionId] = useState("hero");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [data, setData] = useState<any>({
    hero: initialData?.hero || {},
    capabilityCount: initialData?.capabilityCount || {},
    philosophy: initialData?.philosophy || {},
    navigator: initialData?.navigator || {},
    featuredSpotlights: initialData?.featuredSpotlights || {},
    deliveryMethodology: initialData?.deliveryMethodology || {},
    caseStudies: initialData?.caseStudies || {},
    partnerRibbon: initialData?.partnerRibbon || {},
    cta: initialData?.cta || {},
    seo: initialData?.seo || {},
  });

  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/pages/b2b-services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data, seo: data.seo }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsDirty(false);
      setLastSaved(new Date());
      toast("B2B Services CMS configuration saved successfully.", "success");
    } catch (_e) {
      toast("Failed to save B2B Services configuration.", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section: string, field: string, value: any) => {
    setIsDirty(true);
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value,
      },
    }));
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      <DashboardPageHeader
        title="B2B Services Page Editor"
        description="Manage hero, capability count, WOW & HOW philosophy, bento navigator, spotlights, methodology pipeline, proof & case studies, RFP CTA, and SEO (/b2b/services)."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "Services Page Editor" },
        ]}
        badge={{ label: "B2B Public", variant: "warning" }}
        previewUrl="/b2b/services"
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: saving ? "Saving..." : "Save Changes",
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
        secondaryAction={
          <DashboardLanguageSwitch mode={langMode} onModeChange={setLangMode} />
        }
      />

      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      <AdminFormLayout>
        {/* 1. HERO SECTION & TWO-LINE LIVING HEADLINE COMPOSER */}
        {activeSectionId === "hero" && (
          <div id="hero" className="space-y-6">
            <E3LivingHeroEditor
              title="Living Hero Headline & Media"
              description="Configure the dynamic headline with kinetic {{animated}} token, rotating capabilities, background media, and CTAs."
              value={{
                eyebrowEn: data.hero?.eyebrowEn || "E3 ENTERPRISE CAPABILITIES",
                eyebrowAr: data.hero?.eyebrowAr || "قدرات إي ثري لقطاع الأعمال",
                fixedHeadlineEn: data.hero?.titleEn || data.hero?.title || "Services That Build Living Experience Landmarks.",
                fixedHeadlineAr: data.hero?.titleAr || "خدمات متكاملة تصنع معالم ترفيهية حية.",
                headlineTemplateEn: data.hero?.headlineTemplateEn || data.hero?.titleEn || data.hero?.title || "Specialised Capabilities for {{animated}}",
                headlineTemplateAr: data.hero?.headlineTemplateAr || data.hero?.titleAr || "قدرات تخصصية لصناعة {{animated}}",
                rotatingWordsEn: data.hero?.rotatingWordsEn || ["Living Landmarks", "Dynamic Environments", "Flawless Operations", "Extraordinary Impact"],
                rotatingWordsAr: data.hero?.rotatingWordsAr || ["معالم حية", "بيئات ديناميكية", "عمليات سلسة", "أثر استثنائي"],
                descriptionEn: data.hero?.descriptionEn || data.hero?.subtitleEn || data.hero?.subtitle,
                descriptionAr: data.hero?.descriptionAr || data.hero?.subtitleAr,
                primaryCta: {
                  labelEn: data.hero?.primaryCtaEn || "Explore Capabilities",
                  labelAr: data.hero?.primaryCtaAr || "استكشف القدرات",
                  url: data.hero?.primaryLink || "#capability-navigator",
                },
                secondaryCta: {
                  labelEn: data.hero?.secondaryCtaEn || "Initiate RFP",
                  labelAr: data.hero?.secondaryCtaAr || "تقديم طلب مشروع",
                  url: data.hero?.secondaryLink || "/b2b/contact",
                },
                preset: (data.hero?.preset as any) || "memory-engine",
                animationSpeed: data.hero?.animationSpeed || 2800,
                animationDuration: data.hero?.animationDuration || 600,
                animationType: data.hero?.animationType || "blur-morph",
                wordStyle: data.hero?.wordStyle || "static-gradient",
                enableRotatingWords: data.hero?.enableRotatingWords !== false,
                media: data.hero?.media || {
                  mediaType: (data.hero?.mediaType as any) || "IMAGE",
                  mediaUrl: data.hero?.mediaUrl || "/hero-bg.png",
                },
              }}
              onChange={(updatedHero) => {
                setIsDirty(true);
                setData((prev: any) => ({
                  ...prev,
                  hero: {
                    ...(prev.hero || {}),
                    ...updatedHero,
                    titleEn: updatedHero.fixedHeadlineEn || prev.hero?.titleEn,
                    titleAr: updatedHero.fixedHeadlineAr || prev.hero?.titleAr,
                    headlineTemplateEn: updatedHero.headlineTemplateEn,
                    headlineTemplateAr: updatedHero.headlineTemplateAr,
                    rotatingWordsEn: updatedHero.rotatingWordsEn,
                    rotatingWordsAr: updatedHero.rotatingWordsAr,
                    subtitleEn: updatedHero.descriptionEn || prev.hero?.subtitleEn,
                    subtitleAr: updatedHero.descriptionAr || prev.hero?.subtitleAr,
                    descriptionEn: updatedHero.descriptionEn || prev.hero?.descriptionEn,
                    descriptionAr: updatedHero.descriptionAr || prev.hero?.descriptionAr,
                    mediaType: updatedHero.media?.mediaType || prev.hero?.mediaType || "IMAGE",
                    mediaUrl: updatedHero.media?.mediaUrl || prev.hero?.mediaUrl,
                    primaryCtaEn: updatedHero.primaryCta?.labelEn || prev.hero?.primaryCtaEn,
                    primaryCtaAr: updatedHero.primaryCta?.labelAr || prev.hero?.primaryCtaAr,
                    primaryLink: updatedHero.primaryCta?.url || prev.hero?.primaryLink,
                    secondaryCtaEn: updatedHero.secondaryCta?.labelEn || prev.hero?.secondaryCtaEn,
                    secondaryCtaAr: updatedHero.secondaryCta?.labelAr || prev.hero?.secondaryCtaAr,
                    secondaryLink: updatedHero.secondaryCta?.url || prev.hero?.secondaryLink,
                  },
                }));
              }}
            />
          </div>
        )}

        {/* 2. CAPABILITY COUNT STATEMENT */}
        {activeSectionId === "capabilityCount" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <h2 className="text-lg font-bold text-text-primary">2. Capability Count Statement</h2>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.capabilityCount?.enabled !== false}
                  onChange={(e) => updateSection("capabilityCount", "enabled", e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer"
                />
                <span>Section Enabled</span>
              </label>
            </div>

            <p className="text-xs text-text-secondary">
              Use the token <code className="bg-surface-hover px-1.5 py-0.5 rounded text-primary font-mono font-bold">&#123;&#123;count&#125;&#125;</code> to dynamically display the number of active, published services fetched from the database.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Template (EN)</label>
                <input
                  type="text"
                  value={data.capabilityCount?.templateEn || "{{count}} Specialised Capabilities. One Integrated Partner."}
                  onChange={(e) => updateSection("capabilityCount", "templateEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none font-semibold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Template (AR)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.capabilityCount?.templateAr || "{{count}} تخصصات متكاملة. شريك واحد للتنفيذ."}
                  onChange={(e) => updateSection("capabilityCount", "templateAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. WOW & HOW PHILOSOPHY */}
        {activeSectionId === "philosophy" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <h2 className="text-lg font-bold text-text-primary">3. WOW & HOW Philosophy</h2>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.philosophy?.enabled !== false}
                  onChange={(e) => updateSection("philosophy", "enabled", e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer"
                />
                <span>Section Enabled</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  value={activeLang === "en" ? (data.philosophy?.titleEn || "") : (data.philosophy?.titleAr || "")}
                  onChange={(e) => updateSection("philosophy", activeLang === "en" ? "titleEn" : "titleAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description ({activeLang.toUpperCase()})</label>
                <textarea
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  value={activeLang === "en" ? (data.philosophy?.descriptionEn || "") : (data.philosophy?.descriptionAr || "")}
                  onChange={(e) => updateSection("philosophy", activeLang === "en" ? "descriptionEn" : "descriptionAr", e.target.value)}
                  className="w-full h-20 bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-default">
              <div className="space-y-4 p-4 border border-border-default rounded-xl bg-surface-hover">
                <h3 className="text-sm font-bold text-primary">WOW Pillar (Creative & Narrative)</h3>
                <input
                  type="text"
                  placeholder="WOW Title..."
                  value={activeLang === "en" ? (data.philosophy?.wowTitleEn || "") : (data.philosophy?.wowTitleAr || "")}
                  onChange={(e) => updateSection("philosophy", activeLang === "en" ? "wowTitleEn" : "wowTitleAr", e.target.value)}
                  className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                />
                <textarea
                  placeholder="WOW Description..."
                  rows={2}
                  value={activeLang === "en" ? (data.philosophy?.wowDescEn || "") : (data.philosophy?.wowDescAr || "")}
                  onChange={(e) => updateSection("philosophy", activeLang === "en" ? "wowDescEn" : "wowDescAr", e.target.value)}
                  className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                />
              </div>

              <div className="space-y-4 p-4 border border-border-default rounded-xl bg-surface-hover">
                <h3 className="text-sm font-bold text-success">HOW Pillar (Operational & Engineering)</h3>
                <input
                  type="text"
                  placeholder="HOW Title..."
                  value={activeLang === "en" ? (data.philosophy?.howTitleEn || "") : (data.philosophy?.howTitleAr || "")}
                  onChange={(e) => updateSection("philosophy", activeLang === "en" ? "howTitleEn" : "howTitleAr", e.target.value)}
                  className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                />
                <textarea
                  placeholder="HOW Description..."
                  rows={2}
                  value={activeLang === "en" ? (data.philosophy?.howDescEn || "") : (data.philosophy?.howDescAr || "")}
                  onChange={(e) => updateSection("philosophy", activeLang === "en" ? "howDescEn" : "howDescAr", e.target.value)}
                  className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. BENTO NAVIGATOR */}
        {activeSectionId === "navigator" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <h2 className="text-lg font-bold text-text-primary">4. Bento Grid Capability Navigator</h2>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.navigator?.enabled !== false}
                  onChange={(e) => updateSection("navigator", "enabled", e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer"
                />
                <span>Section Enabled</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  value={activeLang === "en" ? (data.navigator?.titleEn || "") : (data.navigator?.titleAr || "")}
                  onChange={(e) => updateSection("navigator", activeLang === "en" ? "titleEn" : "titleAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  value={activeLang === "en" ? (data.navigator?.subtitleEn || "") : (data.navigator?.subtitleAr || "")}
                  onChange={(e) => updateSection("navigator", activeLang === "en" ? "subtitleEn" : "subtitleAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. SPOTLIGHTS */}
        {activeSectionId === "spotlights" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <h2 className="text-lg font-bold text-text-primary">5. Curated Spotlight Disciplines</h2>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.featuredSpotlights?.enabled !== false}
                  onChange={(e) => updateSection("featuredSpotlights", "enabled", e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer"
                />
                <span>Section Enabled</span>
              </label>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select Featured Spotlights (Max 3 Recommended)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-border-default rounded-xl bg-surface-hover max-h-60 overflow-y-auto">
                {services.map((s) => {
                  const isChecked = (data.featuredSpotlights?.selectedServiceIds || []).includes(s.id);
                  return (
                    <label key={s.id} className="flex items-center gap-2 p-2 rounded-xl bg-surface-default border border-border-default cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const current = data.featuredSpotlights?.selectedServiceIds || [];
                          if (e.target.checked) {
                            updateSection("featuredSpotlights", "selectedServiceIds", [...current, s.id]);
                          } else {
                            updateSection("featuredSpotlights", "selectedServiceIds", current.filter((id: string) => id !== s.id));
                          }
                        }}
                        className="w-4 h-4 rounded text-primary cursor-pointer"
                      />
                      <span className="text-xs font-bold truncate">{s.titleEn || s.slug}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 6. METHODOLOGY */}
        {activeSectionId === "methodology" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <h2 className="text-lg font-bold text-text-primary">6. 5-Step Delivery Methodology Pipeline</h2>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.deliveryMethodology?.enabled !== false}
                  onChange={(e) => updateSection("deliveryMethodology", "enabled", e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer"
                />
                <span>Section Enabled</span>
              </label>
            </div>

            <div className="space-y-4">
              {(data.deliveryMethodology?.steps || []).map((step: any, idx: number) => (
                <div key={idx} className="p-4 border border-border-default rounded-xl bg-surface-hover space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary font-mono">Step #{step.stepNumber || idx + 1}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      dir={activeLang === "ar" ? "rtl" : "ltr"}
                      value={activeLang === "en" ? (step.nameEn || "") : (step.nameAr || "")}
                      onChange={(e) => {
                        const steps = [...(data.deliveryMethodology?.steps || [])];
                        steps[idx][activeLang === "en" ? "nameEn" : "nameAr"] = e.target.value;
                        updateSection("deliveryMethodology", "steps", steps);
                      }}
                      placeholder={`Step Title (${activeLang.toUpperCase()})...`}
                      className="bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none"
                    />
                    <input
                      type="text"
                      dir={activeLang === "ar" ? "rtl" : "ltr"}
                      value={activeLang === "en" ? (step.descEn || "") : (step.descAr || "")}
                      onChange={(e) => {
                        const steps = [...(data.deliveryMethodology?.steps || [])];
                        steps[idx][activeLang === "en" ? "descEn" : "descAr"] = e.target.value;
                        updateSection("deliveryMethodology", "steps", steps);
                      }}
                      placeholder={`Step Description (${activeLang.toUpperCase()})...`}
                      className="bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. CASE STUDIES */}
        {activeSectionId === "caseStudies" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <h2 className="text-lg font-bold text-text-primary">7. Related Case Studies & Proof</h2>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.caseStudies?.enabled !== false}
                  onChange={(e) => updateSection("caseStudies", "enabled", e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer"
                />
                <span>Section Enabled</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Title ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  value={activeLang === "en" ? (data.caseStudies?.titleEn || "") : (data.caseStudies?.titleAr || "")}
                  onChange={(e) => updateSection("caseStudies", activeLang === "en" ? "titleEn" : "titleAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Selection Mode</label>
                <select
                  value={data.caseStudies?.selectionMode || "LATEST"}
                  onChange={(e) => updateSection("caseStudies", "selectionMode", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="LATEST">Latest Published Case Studies</option>
                  <option value="MANUAL">Manual Case Study Selection</option>
                </select>
              </div>
            </div>

            {data.caseStudies?.selectionMode === "MANUAL" && (
              <div className="space-y-3 pt-4 border-t border-border-default">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select Case Studies</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 border border-border-default rounded-xl bg-surface-hover">
                  {caseStudies.map((cs) => {
                    const isChecked = (data.caseStudies?.selectedCaseStudyIds || []).includes(cs.id);
                    return (
                      <label key={cs.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-default cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = data.caseStudies?.selectedCaseStudyIds || [];
                            if (e.target.checked) {
                              updateSection("caseStudies", "selectedCaseStudyIds", [...current, cs.id]);
                            } else {
                              updateSection("caseStudies", "selectedCaseStudyIds", current.filter((id: string) => id !== cs.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-primary cursor-pointer"
                        />
                        <span className="text-sm font-semibold">{cs.titleEn || cs.slug}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. COMMERCIAL RFP / FINAL CTA */}
        {activeSectionId === "cta" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <h2 className="text-lg font-bold text-text-primary">8. Commercial RFP / Final Call to Action</h2>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.cta?.enabled !== false}
                  onChange={(e) => updateSection("cta", "enabled", e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer"
                />
                <span>Section Enabled</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">CTA Title ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  value={activeLang === "en" ? (data.cta?.titleEn || data.cta?.title || "") : (data.cta?.titleAr || "")}
                  onChange={(e) => updateSection("cta", activeLang === "en" ? "titleEn" : "titleAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">CTA Description ({activeLang.toUpperCase()})</label>
                <textarea
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  value={activeLang === "en" ? (data.cta?.descriptionEn || data.cta?.description || "") : (data.cta?.descriptionAr || "")}
                  onChange={(e) => updateSection("cta", activeLang === "en" ? "descriptionEn" : "descriptionAr", e.target.value)}
                  className="w-full h-20 bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-default">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Button Label ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  value={activeLang === "en" ? (data.cta?.primaryCtaEn || "") : (data.cta?.primaryCtaAr || "")}
                  onChange={(e) => updateSection("cta", activeLang === "en" ? "primaryCtaEn" : "primaryCtaAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Button Link</label>
                <input
                  type="text"
                  value={data.cta?.primaryLink || "/b2b/contact"}
                  onChange={(e) => updateSection("cta", "primaryLink", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 9. SEO */}
        {activeSectionId === "seo" && (
          <AdminSeoCustomizer
            seo={data.seo}
            setSeo={(val: any) => setData((prev: any) => ({ ...prev, seo: val }))}
            formData={null}
            setFormData={() => {}}
          />
        )}
      </AdminFormLayout>

      <DashboardStickyActions
        onSave={handleSave}
        isSaving={saving}
        isUnsaved={isDirty}
        onDiscard={() => {
          if (confirm("Discard unsaved changes?")) {
            window.location.reload();
          }
        }}
      />
    </DashboardPageShell>
  );
}
