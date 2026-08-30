"use client";

import { useState } from "react";
import { AdminFormLayout } from "../ui/AdminFormLayout";
import { AdminButton } from "../ui/AdminButton";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { AdminSeoCustomizer } from "../ui/AdminSeoCustomizer";
import {
  Plus,
  Trash2,
  Layers,
  Video,
  Sparkles,
  Trophy,
  Users,
  Flame,
  BarChart3,
  Save,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { E3LivingHeroEditor } from "@/components/dashboard/b2c/E3LivingHeroEditor";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardStickyActions,
  DashboardLanguageSwitch,
  LanguageEditMode,
  EditorSectionItem,
} from "@/components/dashboard/ui";

const SECTIONS: EditorSectionItem[] = [
  { id: "hero", label: "1. Hero Section", labelAr: "1. قسم البداية والواجهة" },
  { id: "showreel", label: "2. Master Showreel", labelAr: "2. فيديو العرض الرئيسي (Showreel)" },
  { id: "factStream", label: "3. Fact Stream", labelAr: "3. شريط الحقائق والمؤشرات" },
  { id: "featuredCases", label: "4. Featured Cases", labelAr: "4. المشاريع المميزة" },
  { id: "archive", label: "5. Archive & Filters", labelAr: "5. أرشيف المشاريع وفلاتر الإنجاز" },
  { id: "teamStories", label: "6. Team Stories", labelAr: "6. قصص الكوادر وفريق العمل" },
  { id: "transformations", label: "7. Transformations", labelAr: "7. قصص التحول والإنجاز" },
  { id: "impactOverview", label: "8. ROI & Impact", labelAr: "8. العائد على الاستثمار والأثر" },
  { id: "cta", label: "9. Commercial CTA", labelAr: "9. دعوة طلب العروض (CTA)" },
  { id: "seo", label: "10. SEO Settings", labelAr: "10. بيانات محركات البحث (SEO)" },
];

export interface B2BCasesEditorProps {
  initialData: any;
  caseStudies?: any[];
  services?: any[];
  employeeProfiles?: any[];
}

export function B2BCasesEditor({
  initialData,
  caseStudies = [],
  services: _services = [],
  employeeProfiles = [],
}: B2BCasesEditorProps) {
  const [data, setData] = useState(initialData);
  const [seo, setSeo] = useState<any>(initialData?.seo || {});
  const [activeSectionId, setActiveSectionId] = useState("hero");
  const [langMode, setLangMode] = useState<LanguageEditMode>("en");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/pages/b2b-cases", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data, seo }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsDirty(false);
      setLastSaved(new Date());
      toast("B2B Case Studies landing page updated successfully.", "success");
    } catch (e) {
      console.error(e);
      toast("Failed to save B2B Case Studies landing page.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: string, field: string, value: any) => {
    setIsDirty(true);
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value,
      },
    }));
  };

  // --- 3. FACT STREAM ACTIONS ---
  const addCuratedFact = () => {
    setIsDirty(true);
    const newFact = {
      id: `fact_${Date.now()}`,
      value: "100+",
      prefix: "",
      suffix: "",
      headlineEn: "Key Achievement Metric",
      headlineAr: "مؤشر إنجاز استثنائي",
      descEn: "Live operational engineering and spatial performance milestone.",
      descAr: "إنجاز تشغيلي وهندسي مميز تم تحقيقه على أرض الواقع.",
      caseStudyId: caseStudies[0]?.id || "",
      mediaUrl: "",
    };
    setData((prev: any) => ({
      ...prev,
      factStream: {
        ...prev.factStream,
        facts: [...(prev.factStream?.facts || []), newFact],
      },
    }));
  };

  const removeCuratedFact = (index: number) => {
    setIsDirty(true);
    setData((prev: any) => ({
      ...prev,
      factStream: {
        ...prev.factStream,
        facts: (prev.factStream?.facts || []).filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const updateCuratedFact = (index: number, field: string, value: any) => {
    setIsDirty(true);
    setData((prev: any) => {
      const facts = [...(prev.factStream?.facts || [])];
      facts[index] = { ...facts[index], [field]: value };
      return {
        ...prev,
        factStream: { ...prev.factStream, facts },
      };
    });
  };

  // --- 6. TEAM STORIES ACTIONS ---
  const addTeamStory = () => {
    setIsDirty(true);
    const firstEmp = employeeProfiles[0];
    const newStory = {
      id: `ts_${Date.now()}`,
      employeeProfileId: firstEmp?.id || "",
      teamMemberName: firstEmp ? `${firstEmp.firstName || ""} ${firstEmp.lastName || ""}`.trim() : "",
      roleEn: firstEmp?.designation || "Project Lead",
      roleAr: firstEmp?.designation || "مسؤول المشروع",
      storyTitleEn: "Execution at Landmark Project",
      storyTitleAr: "إدارة العمليات في المشروع الرائد",
      quoteEn: "Precision logistics, crowd safety protocols, and technical staging orchestrated with flawless execution.",
      quoteAr: "تنسيق العمليات اللوجستية وبروتوكولات السلامة وإدارة الحشود بأعلى معايير الدقة والاحترافية.",
      caseStudyId: caseStudies[0]?.id || "",
      profileImage: firstEmp?.profileImage || "",
      department: firstEmp?.department || "",
      designation: firstEmp?.designation || "",
    };
    setData((prev: any) => ({
      ...prev,
      teamStories: {
        ...prev.teamStories,
        stories: [...(prev.teamStories?.stories || []), newStory],
      },
    }));
  };

  const removeTeamStory = (index: number) => {
    setIsDirty(true);
    setData((prev: any) => ({
      ...prev,
      teamStories: {
        ...prev.teamStories,
        stories: (prev.teamStories?.stories || []).filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const updateTeamStory = (index: number, field: string, value: any) => {
    setIsDirty(true);
    setData((prev: any) => {
      const stories = [...(prev.teamStories?.stories || [])];
      const story = { ...stories[index], [field]: value };

      // If changing employeeProfileId, auto-fill profile attributes
      if (field === "employeeProfileId") {
        const emp = employeeProfiles.find((ep) => ep.id === value);
        if (emp) {
          story.teamMemberName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
          story.profileImage = emp.profileImage || story.profileImage || "";
          story.department = emp.department || story.department || "";
          story.designation = emp.designation || story.designation || "";
          if (!story.roleEn || story.roleEn === "Project Lead") {
            story.roleEn = emp.designation || "Project Lead";
          }
        }
      }

      // If changing caseStudyId, auto-sync slug and title if needed
      if (field === "caseStudyId") {
        const cs = caseStudies.find((c) => c.id === value || c.slug === value);
        if (cs) {
          story.caseStudySlug = cs.slug;
          story.caseStudyTitleEn = cs.titleEn;
          story.caseStudyTitleAr = cs.titleAr || cs.titleEn;
        }
      }

      stories[index] = story;
      return {
        ...prev,
        teamStories: { ...prev.teamStories, stories },
      };
    });
  };

  const moveTeamStory = (index: number, direction: "up" | "down") => {
    setIsDirty(true);
    setData((prev: any) => {
      const stories = [...(prev.teamStories?.stories || [])];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= stories.length) return prev;
      const temp = stories[index];
      stories[index] = stories[targetIdx];
      stories[targetIdx] = temp;
      return {
        ...prev,
        teamStories: { ...prev.teamStories, stories },
      };
    });
  };

  // --- 7. TRANSFORMATIONS ACTIONS ---
  const addTransformation = () => {
    setIsDirty(true);
    const newItem = {
      id: `tr_${Date.now()}`,
      titleEn: "Landmark Transformation",
      titleAr: "إنجاز وتحول استثنائي",
      clientEn: "Strategic Client",
      clientAr: "عميل استراتيجي",
      beforeLabelEn: "Empty Exhibition Halls",
      beforeLabelAr: "قاعات المعرض قبل التنفيذ",
      afterLabelEn: "An Immersive World",
      afterLabelAr: "فضاء ترفيهي وتفاعلي متكامل",
      beforeUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC04842.jpg",
      afterUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/9927c4f3-ac81-4cc9-9e6b-8e944102cf38.jpg",
      captionEn: "Transformation from bare space to dynamic operational experience.",
      captionAr: "التحول من مساحة فارغة إلى تجربة تشغيلية متكاملة.",
      caseStudyId: caseStudies[0]?.id || "",
    };
    setData((prev: any) => ({
      ...prev,
      transformations: {
        ...prev.transformations,
        items: [...(prev.transformations?.items || []), newItem],
      },
    }));
  };

  const removeTransformation = (index: number) => {
    setIsDirty(true);
    setData((prev: any) => ({
      ...prev,
      transformations: {
        ...prev.transformations,
        items: (prev.transformations?.items || []).filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const updateTransformation = (index: number, field: string, value: any) => {
    setIsDirty(true);
    setData((prev: any) => {
      const items = [...(prev.transformations?.items || [])];
      items[index] = { ...items[index], [field]: value };
      return {
        ...prev,
        transformations: { ...prev.transformations, items },
      };
    });
  };

  const moveTransformation = (index: number, direction: "up" | "down") => {
    setIsDirty(true);
    setData((prev: any) => {
      const items = [...(prev.transformations?.items || [])];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIdx];
      items[targetIdx] = temp;
      return {
        ...prev,
        transformations: { ...prev.transformations, items },
      };
    });
  };

  // --- 8. IMPACT STATS ACTIONS ---
  const addImpactStat = () => {
    setIsDirty(true);
    const newStat = {
      id: `stat_${Date.now()}`,
      value: "100%",
      prefix: "",
      suffix: "",
      labelEn: "Verified Reliability Standard",
      labelAr: "معيار الجاهزية الموثق",
      descEn: "Flawless uptime across all live event operations.",
      descAr: "جاهزية تشغيلية كاملة بدون أي انقطاع في الفعاليات الحية.",
    };
    setData((prev: any) => ({
      ...prev,
      impactOverview: {
        ...prev.impactOverview,
        stats: [...(prev.impactOverview?.stats || []), newStat],
      },
    }));
  };

  const removeImpactStat = (index: number) => {
    setIsDirty(true);
    setData((prev: any) => ({
      ...prev,
      impactOverview: {
        ...prev.impactOverview,
        stats: (prev.impactOverview?.stats || []).filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const updateImpactStat = (index: number, field: string, value: any) => {
    setIsDirty(true);
    setData((prev: any) => {
      const stats = [...(prev.impactOverview?.stats || [])];
      stats[index] = { ...stats[index], [field]: value };
      return {
        ...prev,
        impactOverview: { ...prev.impactOverview, stats },
      };
    });
  };

  // Featured Cases Toggle
  const toggleFeaturedCaseSelection = (caseStudyId: string) => {
    setIsDirty(true);
    setData((prev: any) => {
      const currentIds: string[] = Array.isArray(prev.featuredCases?.selectedCaseStudyIds)
        ? prev.featuredCases.selectedCaseStudyIds.map(String)
        : [];

      const newIds = currentIds.includes(caseStudyId)
        ? currentIds.filter((id) => id !== caseStudyId)
        : [...currentIds, caseStudyId];

      return {
        ...prev,
        featuredCases: {
          ...prev.featuredCases,
          selectedCaseStudyIds: newIds,
          selectionMode: newIds.length > 0 ? "MANUAL" : "FEATURED_FLAG",
        },
      };
    });
  };

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        title="B2B Case Studies Page Editor"
        description="Manage the public portfolio page, living hero typography, Did You Know fact stream, spatial transformations, and complete Behind the Build team stories."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "Case Studies Editor" },
        ]}
        badge={{ label: "B2B Public", variant: "warning" }}
        previewUrl="/b2b/case-studies"
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
        {/* 1. HERO SECTION */}
        {activeSectionId === "hero" && (
          <div id="hero" className="space-y-6">
            <E3LivingHeroEditor
              title="Living Hero Headline & Media"
              description="Configure the landmark cases living headline with {{animated}} token interpolation, rotating words, custom atmospheric media, and interactive CTAs."
              value={{
                eyebrowEn: data.hero?.eyebrowEn || "THE VAULT",
                eyebrowAr: data.hero?.eyebrowAr || "سجل الإنجازات",
                fixedHeadlineEn: data.hero?.titleEn || data.hero?.title || "Ideas Are Powerful. Results Make Them Real.",
                fixedHeadlineAr: data.hero?.titleAr || "الأفكار تصنع الإمكانات. والنتائج تثبتها.",
                headlineTemplateEn: data.hero?.headlineTemplateEn || data.hero?.titleEn || data.hero?.title || "Ideas Are Powerful. Results Make Them {{animated}}",
                headlineTemplateAr: data.hero?.headlineTemplateAr || data.hero?.titleAr || "الأفكار تصنع الإمكانات. والنتائج تجعلها {{animated}}",
                rotatingWordsEn: data.hero?.rotatingWordsEn || ["Real", "Iconic", "Measurable", "Extraordinary"],
                rotatingWordsAr: data.hero?.rotatingWordsAr || ["حقيقية", "أيقونية", "ذات أثر ملموس", "استثنائية"],
                descriptionEn: data.hero?.descriptionEn || data.hero?.subtitleEn || data.hero?.subtitle,
                descriptionAr: data.hero?.descriptionAr || data.hero?.subtitleAr,
                primaryCta: {
                  labelEn: data.hero?.primaryCtaEn || "Explore Our Work",
                  labelAr: data.hero?.primaryCtaAr || "استكشف أعمالنا",
                  url: data.hero?.primaryLink || "#archive",
                },
                secondaryCta: {
                  labelEn: data.hero?.secondaryCtaEn || "Start a Project",
                  labelAr: data.hero?.secondaryCtaAr || "ابدأ مشروعك",
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
                  posterUrl: data.hero?.posterImage,
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
                    posterImage: updatedHero.media?.posterUrl || prev.hero?.posterImage,
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

        {/* 2. SHOWREEL SECTION */}
        {activeSectionId === "showreel" && (
          <div id="showreel" className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <div className="flex items-center gap-2.5">
                <Video className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-text-primary">2. Interactive Showreel</h2>
              </div>
              <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.showreel?.enabled !== false}
                  onChange={(e) => handleChange("showreel", "enabled", e.target.checked)}
                  className="rounded bg-surface-hover border-border-default text-indigo-500 focus:ring-0 cursor-pointer"
                />
                <span>SECTION ENABLED</span>
              </label>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Showreel Title (En)</label>
                  <input
                    type="text"
                    value={data.showreel?.titleEn || ""}
                    onChange={(e) => handleChange("showreel", "titleEn", e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Showreel Title (Ar)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={data.showreel?.titleAr || ""}
                    onChange={(e) => handleChange("showreel", "titleAr", e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Source Type</label>
                  <select
                    value={data.showreel?.mediaType || "YOUTUBE"}
                    onChange={(e) => handleChange("showreel", "mediaType", e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none cursor-pointer"
                  >
                    <option value="YOUTUBE">YouTube Video</option>
                    <option value="VIMEO">Vimeo</option>
                    <option value="MP4">Direct MP4 Video</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Video URL / Embed</label>
                  <input
                    type="text"
                    value={data.showreel?.mediaUrl || ""}
                    onChange={(e) => handleChange("showreel", "mediaUrl", e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. FACT STREAM */}
        {activeSectionId === "factStream" && (
          <div id="factStream" className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-text-primary">3. Fact Stream & Impact Ticker (Did You Know?)</h2>
              </div>
              <div className="flex items-center gap-4">
                <AdminButton variant="secondary" onClick={addCuratedFact} className="flex items-center gap-1.5 text-xs">
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Fact</span>
                </AdminButton>
                <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.factStream?.enabled !== false}
                    onChange={(e) => handleChange("factStream", "enabled", e.target.checked)}
                    className="rounded bg-surface-hover border-border-default text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>SECTION ENABLED</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Label / Badge (En)</label>
                <input
                  type="text"
                  value={data.factStream?.labelEn || ""}
                  onChange={(e) => handleChange("factStream", "labelEn", e.target.value)}
                  placeholder="Did You Know?"
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Label / Badge (Ar)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.factStream?.labelAr || ""}
                  onChange={(e) => handleChange("factStream", "labelAr", e.target.value)}
                  placeholder="هل تعلم؟"
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Rotation Duration (Seconds)</label>
                <input
                  type="number"
                  min="3"
                  max="30"
                  value={data.factStream?.rotationDuration || 5}
                  onChange={(e) => handleChange("factStream", "rotationDuration", Number(e.target.value))}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Headline (En)</label>
                <input
                  type="text"
                  value={data.factStream?.titleEn || ""}
                  onChange={(e) => handleChange("factStream", "titleEn", e.target.value)}
                  placeholder="Every Project Leaves a Bigger Story Behind."
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Headline (Ar)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.factStream?.titleAr || ""}
                  onChange={(e) => handleChange("factStream", "titleAr", e.target.value)}
                  placeholder="وراء كل مشروع قصة وإنجاز بالأرقام."
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Curated Facts List */}
            <div className="space-y-4 pt-4 border-t border-border-default">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary">Curated Facts Stream ({data.factStream?.facts?.length || 0})</h3>
                <span className="text-xs text-text-tertiary">If empty, facts are automatically derived from published case study metrics.</span>
              </div>

              {(data.factStream?.facts || []).map((fact: any, index: number) => (
                <div key={fact.id || index} className="p-4 bg-surface-hover border border-border-default rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">Fact #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCuratedFact(index)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Metric Number</label>
                      <input
                        type="text"
                        value={fact.value || ""}
                        onChange={(e) => updateCuratedFact(index, "value", e.target.value)}
                        placeholder="e.g. 100+ or 1.2M+"
                        className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-amber-400 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Suffix (Optional)</label>
                      <input
                        type="text"
                        value={fact.suffix || ""}
                        onChange={(e) => updateCuratedFact(index, "suffix", e.target.value)}
                        placeholder="e.g. SQM or Visitors"
                        className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Linked Case Study</label>
                      <select
                        value={fact.caseStudyId || ""}
                        onChange={(e) => updateCuratedFact(index, "caseStudyId", e.target.value)}
                        className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary cursor-pointer"
                      >
                        <option value="">-- Select Linked Project --</option>
                        {caseStudies.map((cs) => (
                          <option key={cs.id} value={cs.id}>
                            {cs.titleEn} ({cs.clientName || "E3"})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Headline (En)</label>
                      <input
                        type="text"
                        value={fact.headlineEn || ""}
                        onChange={(e) => updateCuratedFact(index, "headlineEn", e.target.value)}
                        placeholder="e.g. Landmark Audience Footfall"
                        className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Headline (Ar)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={fact.headlineAr || ""}
                        onChange={(e) => updateCuratedFact(index, "headlineAr", e.target.value)}
                        placeholder="مثال: سعة الإقبال الجماهيري"
                        className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Description (En)</label>
                      <textarea
                        rows={2}
                        value={fact.descEn || ""}
                        onChange={(e) => updateCuratedFact(index, "descEn", e.target.value)}
                        placeholder="Narrative explaining the metric..."
                        className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Description (Ar)</label>
                      <textarea
                        rows={2}
                        dir="rtl"
                        value={fact.descAr || ""}
                        onChange={(e) => updateCuratedFact(index, "descAr", e.target.value)}
                        placeholder="تفاصيل وإيضاح المؤشر..."
                        className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary resize-none font-arabic"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. FEATURED CASES */}
        {activeSectionId === "featuredCases" && (
          <div id="featuredCases" className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-text-primary">4. Featured Landmark Projects</h2>
              </div>
              <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.featuredCases?.enabled !== false}
                  onChange={(e) => handleChange("featuredCases", "enabled", e.target.checked)}
                  className="rounded bg-surface-hover border-border-default text-yellow-500 focus:ring-0 cursor-pointer"
                />
                <span>SECTION ENABLED</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Spotlight Eyebrow (En)</label>
                <input
                  type="text"
                  value={data.featuredCases?.eyebrowEn || ""}
                  onChange={(e) => handleChange("featuredCases", "eyebrowEn", e.target.value)}
                  placeholder="FEATURED LANDMARKS"
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Spotlight Eyebrow (Ar)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.featuredCases?.eyebrowAr || ""}
                  onChange={(e) => handleChange("featuredCases", "eyebrowAr", e.target.value)}
                  placeholder="المشاريع الرئيسية"
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select Featured Case Studies</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-border-default rounded-xl bg-surface-hover max-h-64 overflow-y-auto">
                {caseStudies.map((cs) => {
                  const isChecked = (data.featuredCases?.selectedCaseStudyIds || []).includes(cs.id);
                  return (
                    <label key={cs.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-default border border-border-default cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFeaturedCaseSelection(cs.id)}
                        className="w-4 h-4 rounded text-primary cursor-pointer"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">{cs.titleEn || cs.slug}</p>
                        <p className="text-[10px] text-text-tertiary">{cs.year || "2026"} • {cs.clientName || "Enterprise"}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5. ARCHIVE & IMPACT LENS */}
        {activeSectionId === "archive" && (
          <div id="archive" className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-text-primary">5. Project Archive & Impact Lens Filters</h2>
              </div>
              <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.archive?.enabled !== false}
                  onChange={(e) => handleChange("archive", "enabled", e.target.checked)}
                  className="rounded bg-surface-hover border-border-default text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span>SECTION ENABLED</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Archive Title (En)</label>
                <input
                  type="text"
                  value={data.archive?.titleEn || ""}
                  onChange={(e) => handleChange("archive", "titleEn", e.target.value)}
                  placeholder="e.g. Landmark Portfolio Archive"
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Archive Title (Ar)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.archive?.titleAr || ""}
                  onChange={(e) => handleChange("archive", "titleAr", e.target.value)}
                  placeholder="مثال: سجل وأرشيف المشاريع الوطنية"
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Archive Description (En)</label>
                <textarea
                  rows={3}
                  value={data.archive?.descriptionEn || ""}
                  onChange={(e) => handleChange("archive", "descriptionEn", e.target.value)}
                  placeholder="Filter and explore delivered entertainment and spatial installations across Qatar..."
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Archive Description (Ar)</label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={data.archive?.descriptionAr || ""}
                  onChange={(e) => handleChange("archive", "descriptionAr", e.target.value)}
                  placeholder="تصفح واستكشف مشاريعنا الترفيهية والتجهيزات المكانية المنفذة في قطر..."
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none font-arabic"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Archive Sorting Mode</label>
              <select
                value={data.archive?.displayOrder || "FEATURED_FIRST"}
                onChange={(e) => handleChange("archive", "displayOrder", e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="FEATURED_FIRST">Featured Projects First</option>
                <option value="NEWEST_FIRST">Newest Year First</option>
                <option value="ALPHABETICAL">Alphabetical by Title</option>
              </select>
            </div>
          </div>
        )}

        {/* 6. TEAM STORIES (BEHIND THE BUILD - FULLY COMPLETE & EDITABLE) */}
        {activeSectionId === "teamStories" && (
          <div id="teamStories" className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-text-primary">6. Behind the Build (Team Stories)</h2>
              </div>
              <div className="flex items-center gap-4">
                <AdminButton variant="secondary" onClick={addTeamStory} className="flex items-center gap-1.5 text-xs">
                  <Plus className="w-4 h-4" />
                  <span>Add Story</span>
                </AdminButton>
                <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.teamStories?.enabled !== false}
                    onChange={(e) => handleChange("teamStories", "enabled", e.target.checked)}
                    className="rounded bg-surface-hover border-border-default text-purple-500 focus:ring-0 cursor-pointer"
                  />
                  <span>SECTION ENABLED</span>
                </label>
              </div>
            </div>

            {/* Section Header Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Eyebrow (En)</label>
                <input
                  type="text"
                  value={data.teamStories?.eyebrowEn || ""}
                  onChange={(e) => handleChange("teamStories", "eyebrowEn", e.target.value)}
                  placeholder="Behind the Build"
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Eyebrow (Ar)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.teamStories?.eyebrowAr || ""}
                  onChange={(e) => handleChange("teamStories", "eyebrowAr", e.target.value)}
                  placeholder="خلف الكواليس"
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Title (En)</label>
                <input
                  type="text"
                  value={data.teamStories?.titleEn || ""}
                  onChange={(e) => handleChange("teamStories", "titleEn", e.target.value)}
                  placeholder="The Stories You Don’t See on Stage."
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Title (Ar)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.teamStories?.titleAr || ""}
                  onChange={(e) => handleChange("teamStories", "titleAr", e.target.value)}
                  placeholder="قصص لا يراها الجمهور على المسرح."
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description (En)</label>
                <textarea
                  rows={2}
                  value={data.teamStories?.descriptionEn || ""}
                  onChange={(e) => handleChange("teamStories", "descriptionEn", e.target.value)}
                  placeholder="Meet the people, decisions and defining moments behind E3’s landmark experiences..."
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description (Ar)</label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={data.teamStories?.descriptionAr || ""}
                  onChange={(e) => handleChange("teamStories", "descriptionAr", e.target.value)}
                  placeholder="تعرّف على الأشخاص والقرارات واللحظات التي تقف خلف أبرز تجارب إي ثري..."
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none font-arabic"
                />
              </div>
            </div>

            {/* Repeatable Team Stories List */}
            <div className="space-y-6 pt-4 border-t border-border-default">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary">Curated Stories Cards ({data.teamStories?.stories?.length || 0})</h3>
                <span className="text-xs text-text-tertiary">Edit individual quotes, member roles, and project links below.</span>
              </div>

              {(data.teamStories?.stories || []).length === 0 ? (
                <div className="p-8 border border-dashed border-border-default rounded-2xl text-center space-y-3 bg-surface-hover/50">
                  <Users className="w-8 h-8 text-purple-400 mx-auto opacity-70" />
                  <p className="text-sm font-bold text-text-primary">No Curated Stories Added Yet</p>
                  <p className="text-xs text-text-secondary max-w-md mx-auto">
                    When empty, stories are automatically derived from case studies. Click below to add custom, highly tailored Behind the Build quotes.
                  </p>
                  <AdminButton variant="secondary" onClick={addTeamStory} className="text-xs">
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span>Add First Team Story</span>
                  </AdminButton>
                </div>
              ) : (
                <div className="space-y-5">
                  {(data.teamStories?.stories || []).map((story: any, index: number) => {
                    return (
                      <div
                        key={story.id || index}
                        className="p-5 bg-surface-hover border border-border-default rounded-2xl space-y-5 shadow-xs"
                      >
                        {/* Header toolbar */}
                        <div className="flex items-center justify-between border-b border-border-default pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-mono font-bold">
                              {index + 1}
                            </span>
                            <span className="text-xs font-mono font-bold text-purple-400 uppercase">
                              Story #{index + 1}: {story.teamMemberName || "E3 Specialist"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => moveTeamStory(index, "up")}
                              disabled={index === 0}
                              className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-default disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveTeamStory(index, "down")}
                              disabled={index === (data.teamStories?.stories || []).length - 1}
                              className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-default disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTeamStory(index)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                              title="Remove Story"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Team Member & Case Study Bindings */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">
                              Link Employee Profile
                            </label>
                            <select
                              value={story.employeeProfileId || ""}
                              onChange={(e) => updateTeamStory(index, "employeeProfileId", e.target.value)}
                              className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary cursor-pointer"
                            >
                              <option value="">-- Custom Member / No Profile --</option>
                              {employeeProfiles.map((ep) => (
                                <option key={ep.id} value={ep.id}>
                                  {ep.firstName} {ep.lastName} — {ep.designation} ({ep.department})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">
                              Team Member Name
                            </label>
                            <input
                              type="text"
                              value={story.teamMemberName || ""}
                              onChange={(e) => updateTeamStory(index, "teamMemberName", e.target.value)}
                              placeholder="e.g. Adil Ahmed"
                              className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">
                              Linked Case Study Project
                            </label>
                            <select
                              value={story.caseStudyId || ""}
                              onChange={(e) => updateTeamStory(index, "caseStudyId", e.target.value)}
                              className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary cursor-pointer"
                            >
                              <option value="">-- Select Linked Project --</option>
                              {caseStudies.map((cs) => (
                                <option key={cs.id} value={cs.id}>
                                  {cs.titleEn} ({cs.clientName || "E3"})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Role & Headline Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">
                              Role / Designation Badge (En)
                            </label>
                            <input
                              type="text"
                              value={story.roleEn || ""}
                              onChange={(e) => updateTeamStory(index, "roleEn", e.target.value)}
                              placeholder="e.g. Managing Director & CEO"
                              className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-purple-400 font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">
                              Role / Designation Badge (Ar)
                            </label>
                            <input
                              type="text"
                              dir="rtl"
                              value={story.roleAr || ""}
                              onChange={(e) => updateTeamStory(index, "roleAr", e.target.value)}
                              placeholder="مثال: المدير التنفيذي والعضو المنتدب"
                              className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-purple-400 font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">
                              Story Headline / Title (En)
                            </label>
                            <input
                              type="text"
                              value={story.storyTitleEn || ""}
                              onChange={(e) => updateTeamStory(index, "storyTitleEn", e.target.value)}
                              placeholder="e.g. Execution at LEGO® Shows Qatar 2024"
                              className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">
                              Story Headline / Title (Ar)
                            </label>
                            <input
                              type="text"
                              dir="rtl"
                              value={story.storyTitleAr || ""}
                              onChange={(e) => updateTeamStory(index, "storyTitleAr", e.target.value)}
                              placeholder="مثال: إدارة العمليات في عروض ليغو قطر 2024"
                              className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary font-bold"
                            />
                          </div>
                        </div>

                        {/* Story Quote Textarea */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">
                              Behind the Build Quote (En)
                            </label>
                            <textarea
                              rows={3}
                              value={story.quoteEn || ""}
                              onChange={(e) => updateTeamStory(index, "quoteEn", e.target.value)}
                              placeholder="Direct quote detailing engineering decisions, crowd safety, or backstage execution..."
                              className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary resize-none italic"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">
                              Behind the Build Quote (Ar)
                            </label>
                            <textarea
                              rows={3}
                              dir="rtl"
                              value={story.quoteAr || ""}
                              onChange={(e) => updateTeamStory(index, "quoteAr", e.target.value)}
                              placeholder="اقتباس مباشر يوضح تفاصيل القرارات الهندسية وإدارة الحشود وخفايا التنفيذ..."
                              className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary resize-none italic font-arabic"
                            />
                          </div>
                        </div>

                        {/* Profile Image & Avatar */}
                        <div className="flex items-center gap-4 pt-2">
                          {story.profileImage ? (
                            <img
                              src={story.profileImage}
                              alt="Avatar"
                              className="w-10 h-10 rounded-full object-cover border border-border-default shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-surface-default border border-border-default flex items-center justify-center text-xs font-bold text-text-tertiary shrink-0">
                              IMG
                            </div>
                          )}
                          <div className="flex-1">
                            <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">
                              Avatar Photo URL (Optional Override)
                            </label>
                            <input
                              type="text"
                              value={story.profileImage || ""}
                              onChange={(e) => updateTeamStory(index, "profileImage", e.target.value)}
                              placeholder="https://..."
                              className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. TRANSFORMATIONS */}
        {activeSectionId === "transformations" && (
          <div id="transformations" className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-bold text-text-primary">7. Spatial Transformations (Before/After)</h2>
              </div>
              <div className="flex items-center gap-4">
                <AdminButton variant="secondary" onClick={addTransformation} className="flex items-center gap-1.5 text-xs">
                  <Plus className="w-4 h-4" />
                  <span>Add Transformation</span>
                </AdminButton>
                <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.transformations?.enabled !== false}
                    onChange={(e) => handleChange("transformations", "enabled", e.target.checked)}
                    className="rounded bg-surface-hover border-border-default text-orange-500 focus:ring-0 cursor-pointer"
                  />
                  <span>SECTION ENABLED</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Title (En)</label>
                <input
                  type="text"
                  value={data.transformations?.titleEn || ""}
                  onChange={(e) => handleChange("transformations", "titleEn", e.target.value)}
                  placeholder="Before & After Transformations"
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Title (Ar)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.transformations?.titleAr || ""}
                  onChange={(e) => handleChange("transformations", "titleAr", e.target.value)}
                  placeholder="التحول الفضائي قبل وبعد التنفيذ"
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Repeatable Transformations List */}
            <div className="space-y-5 pt-4 border-t border-border-default">
              {(data.transformations?.items || []).map((item: any, index: number) => (
                <div key={item.id || index} className="p-5 bg-surface-hover border border-border-default rounded-2xl space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border-default pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-mono font-bold">
                        {index + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-orange-400 uppercase">
                        Transformation: {item.titleEn || `Item #${index + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveTransformation(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-default disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTransformation(index, "down")}
                        disabled={index === (data.transformations?.items || []).length - 1}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-default disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTransformation(index)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Project Title (En)</label>
                      <input
                        type="text"
                        value={item.titleEn || ""}
                        onChange={(e) => updateTransformation(index, "titleEn", e.target.value)}
                        placeholder="e.g. LEGO® Shows Qatar"
                        className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Project Title (Ar)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={item.titleAr || ""}
                        onChange={(e) => updateTransformation(index, "titleAr", e.target.value)}
                        placeholder="مثال: عروض ليغو قطر"
                        className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Linked Case Study</label>
                      <select
                        value={item.caseStudyId || ""}
                        onChange={(e) => updateTransformation(index, "caseStudyId", e.target.value)}
                        className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary cursor-pointer"
                      >
                        <option value="">-- Select Project --</option>
                        {caseStudies.map((cs) => (
                          <option key={cs.id} value={cs.id}>
                            {cs.titleEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Before & After Media & Labels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-surface-default border border-border-default rounded-xl space-y-2">
                      <span className="text-xs font-bold text-amber-400">BEFORE (Initial State)</span>
                      <input
                        type="text"
                        value={item.beforeUrl || item.beforeMediaUrl || ""}
                        onChange={(e) => updateTransformation(index, "beforeUrl", e.target.value)}
                        placeholder="Before Image URL (https://...)"
                        className="w-full bg-surface-hover border border-border-default rounded-lg px-3 py-1.5 text-xs font-mono text-text-primary"
                      />
                      <input
                        type="text"
                        value={item.beforeLabelEn || ""}
                        onChange={(e) => updateTransformation(index, "beforeLabelEn", e.target.value)}
                        placeholder="Before Label En (e.g. Empty Exhibition Halls)"
                        className="w-full bg-surface-hover border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary"
                      />
                    </div>

                    <div className="p-3 bg-surface-default border border-border-default rounded-xl space-y-2">
                      <span className="text-xs font-bold text-emerald-400">AFTER (Delivered Transformation)</span>
                      <input
                        type="text"
                        value={item.afterUrl || item.afterMediaUrl || ""}
                        onChange={(e) => updateTransformation(index, "afterUrl", e.target.value)}
                        placeholder="After Image URL (https://...)"
                        className="w-full bg-surface-hover border border-border-default rounded-lg px-3 py-1.5 text-xs font-mono text-text-primary"
                      />
                      <input
                        type="text"
                        value={item.afterLabelEn || ""}
                        onChange={(e) => updateTransformation(index, "afterLabelEn", e.target.value)}
                        placeholder="After Label En (e.g. An Immersive LEGO® World)"
                        className="w-full bg-surface-hover border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. ROI & IMPACT */}
        {activeSectionId === "impactOverview" && (
          <div id="impactOverview" className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-text-primary">8. Verified ROI & Operational Impact</h2>
              </div>
              <div className="flex items-center gap-4">
                <AdminButton variant="secondary" onClick={addImpactStat} className="flex items-center gap-1.5 text-xs">
                  <Plus className="w-4 h-4" />
                  <span>Add Stat</span>
                </AdminButton>
                <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.impactOverview?.enabled !== false}
                    onChange={(e) => handleChange("impactOverview", "enabled", e.target.checked)}
                    className="rounded bg-surface-hover border-border-default text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span>SECTION ENABLED</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Title (En)</label>
                <input
                  type="text"
                  value={data.impactOverview?.titleEn || ""}
                  onChange={(e) => handleChange("impactOverview", "titleEn", e.target.value)}
                  placeholder="Verified ROI & Operational Standards"
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Title (Ar)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.impactOverview?.titleAr || ""}
                  onChange={(e) => handleChange("impactOverview", "titleAr", e.target.value)}
                  placeholder="العائد على الاستثمار والمعايير التشغيلية الموثقة"
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border-default">
              {(data.impactOverview?.stats || []).map((stat: any, index: number) => (
                <div key={stat.id || index} className="p-4 bg-surface-hover border border-border-default rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Stat #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeImpactStat(index)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Value</label>
                      <input
                        type="text"
                        value={stat.value || ""}
                        onChange={(e) => updateImpactStat(index, "value", e.target.value)}
                        placeholder="e.g. 100% or 1.2M+"
                        className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Label (En)</label>
                      <input
                        type="text"
                        value={stat.labelEn || ""}
                        onChange={(e) => updateImpactStat(index, "labelEn", e.target.value)}
                        placeholder="Label (En)..."
                        className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Label (Ar)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={stat.labelAr || ""}
                        onChange={(e) => updateImpactStat(index, "labelAr", e.target.value)}
                        placeholder="الوصف (عربي)..."
                        className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. COMMERCIAL CTA */}
        {activeSectionId === "cta" && (
          <div id="cta" className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <h2 className="text-lg font-bold text-text-primary">9. Commercial RFP / Final Call to Action</h2>
              <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.cta?.enabled !== false}
                  onChange={(e) => handleChange("cta", "enabled", e.target.checked)}
                  className="rounded bg-surface-hover border-border-default text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span>SECTION ENABLED</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Headline (En)</label>
                <input
                  type="text"
                  value={data.cta?.headlineEn || data.cta?.titleEn || ""}
                  onChange={(e) => handleChange("cta", "headlineEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Headline (Ar)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.cta?.headlineAr || data.cta?.titleAr || ""}
                  onChange={(e) => handleChange("cta", "headlineAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Primary Button Text (En)</label>
                <input
                  type="text"
                  value={data.cta?.primaryCtaEn || data.cta?.primaryCta?.labelEn || "Request a Proposal"}
                  onChange={(e) => handleChange("cta", "primaryCtaEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Primary Button Text (Ar)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.cta?.primaryCtaAr || data.cta?.primaryCta?.labelAr || "طلب عرض تفصيلي"}
                  onChange={(e) => handleChange("cta", "primaryCtaAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 10. SEO */}
        {activeSectionId === "seo" && (
          <AdminSeoCustomizer seo={seo} setSeo={setSeo} formData={null} setFormData={() => {}} />
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
