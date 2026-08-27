"use client";

import { useState } from "react";
import { AdminFormLayout } from "../ui/AdminFormLayout";
import { AdminButton } from "../ui/AdminButton";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { MediaUploader } from "@/components/shared/MediaUploader";
import { AdminSeoCustomizer } from "../ui/AdminSeoCustomizer";
import { Plus, Trash2, Layers, Video, Sparkles, Trophy, Users, Flame, BarChart3, CheckSquare, Save } from "lucide-react";
import { E3LivingHeroEditor } from "@/components/dashboard/b2c/E3LivingHeroEditor";
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
  { id: "showreel", label: "2. Master Showreel", labelAr: "2. فيديو العرض الرئيسي (Showreel)" },
  { id: "factStream", label: "3. Fact Stream", labelAr: "3. شريط الحقائق والمؤشرات" },
  { id: "featuredCases", label: "4. Featured Cases", labelAr: "4. المشاريع المميزة" },
  { id: "teamStories", label: "5. Team Stories", labelAr: "5. قصص الكوادر وفريق العمل" },
  { id: "transformations", label: "6. Transformations", labelAr: "6. قصص التحول والإنجاز" },
  { id: "impactOverview", label: "7. ROI & Impact", labelAr: "7. العائد على الاستثمار والأثر" },
  { id: "cta", label: "8. Commercial CTA", labelAr: "8. دعوة طلب العروض (CTA)" },
  { id: "seo", label: "9. SEO Settings", labelAr: "9. بيانات محركات البحث (SEO)" },
];

export function B2BCasesEditor({
  initialData,
  caseStudies = [],
  services: _services = [],
  employeeProfiles = [],
}: {
  initialData: any;
  caseStudies?: any[];
  services?: any[];
  employeeProfiles?: any[];
}) {
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

  // Team Stories repeatable actions
  const addTeamStory = () => {
    const newStory = {
      id: `ts_${Date.now()}`,
      roleEn: "Project Lead",
      roleAr: "قائد المشروع",
      storyTitleEn: "Behind the Build Story",
      storyTitleAr: "قصة الكواليس والتنفيذ",
      storyEn: "Engineering story details.",
      storyAr: "تفاصيل قصة التنفيذ والهندسة.",
      teamMemberName: "",
      employeeProfileId: "",
      quoteEn: "Execution is key.",
      quoteAr: "التنفيذ الدقيق هو الجوهر.",
      caseStudyId: "",
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
    setData((prev: any) => ({
      ...prev,
      teamStories: {
        ...prev.teamStories,
        stories: (prev.teamStories?.stories || []).filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const updateTeamStory = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const stories = [...(prev.teamStories?.stories || [])];
      stories[index] = { ...stories[index], [field]: value };
      return {
        ...prev,
        teamStories: { ...prev.teamStories, stories },
      };
    });
  };

  // Impact Statistics repeatable actions
  const addImpactStat = () => {
    const newStat = {
      id: `stat_${Date.now()}`,
      value: "100%",
      prefix: "",
      suffix: "",
      labelEn: "Verified Standard",
      labelAr: "معيار موثق",
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
    setData((prev: any) => ({
      ...prev,
      impactOverview: {
        ...prev.impactOverview,
        stats: (prev.impactOverview?.stats || []).filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const updateImpactStat = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const stats = [...(prev.impactOverview?.stats || [])];
      stats[index] = { ...stats[index], [field]: value };
      return {
        ...prev,
        impactOverview: { ...prev.impactOverview, stats },
      };
    });
  };

  // Transformations repeatable actions
  const addTransformation = () => {
    const newItem = {
      id: `tr_${Date.now()}`,
      titleEn: "Landmark Transformation",
      titleAr: "إنجاز وتحول استثنائي",
      clientEn: "Strategic Client",
      clientAr: "عميل استراتيجي",
      challengeEn: "Brief of the complex engineering challenge.",
      challengeAr: "ملخص التحدي الهندسي المعقد.",
      solutionEn: "E3 turnkey operational solution.",
      solutionAr: "الحل التشغيلي والهندسي المتكامل من إي ثري.",
      beforeMediaUrl: "",
      afterMediaUrl: "",
      caseStudyId: "",
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
    setData((prev: any) => ({
      ...prev,
      transformations: {
        ...prev.transformations,
        items: (prev.transformations?.items || []).filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const updateTransformation = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const items = [...(prev.transformations?.items || [])];
      items[index] = { ...items[index], [field]: value };
      return {
        ...prev,
        transformations: { ...prev.transformations, items },
      };
    });
  };

  const toggleFeaturedCaseSelection = (caseStudyId: string) => {
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
          // Ensure the spotlight resolver honours explicit dashboard selections
          selectionMode: newIds.length > 0 ? "MANUAL" : "FEATURED_FLAG",
        },
      };
    });
  };

  const moveFeaturedCaseOrder = (index: number, direction: "up" | "down") => {
    setData((prev: any) => {
      const currentIds: string[] = Array.isArray(prev.featuredCases?.selectedCaseStudyIds)
        ? [...prev.featuredCases.selectedCaseStudyIds.map(String)]
        : [];

      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= currentIds.length) return prev;

      const temp = currentIds[index];
      currentIds[index] = currentIds[targetIdx];
      currentIds[targetIdx] = temp;

      return {
        ...prev,
        featuredCases: {
          ...prev.featuredCases,
          selectedCaseStudyIds: currentIds,
        },
      };
    });
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      <DashboardPageHeader
        title="B2B Case Studies Page Editor"
        description="Manage hero, showreel, fact stream, featured landmarks, team stories, transformations, impact, and SEO (/b2b/case-studies)."
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
                <h2 className="text-lg font-bold text-text-primary">3. Fact Stream & Impact Ticker</h2>
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Headline (En)</label>
                <input
                  type="text"
                  value={data.factStream?.titleEn || ""}
                  onChange={(e) => handleChange("factStream", "titleEn", e.target.value)}
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
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
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

        {/* 5. TEAM STORIES */}
        {activeSectionId === "teamStories" && (
          <div id="teamStories" className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-text-primary">5. Behind the Build (Team Stories)</h2>
              </div>
              <AdminButton variant="secondary" onClick={addTeamStory} className="flex items-center gap-1.5 text-xs">
                <Plus className="w-4 h-4" />
                <span>Add Story</span>
              </AdminButton>
            </div>

            <div className="space-y-4">
              {(data.teamStories?.stories || []).map((story: any, index: number) => (
                <div key={story.id || index} className="p-4 bg-surface-hover border border-border-default rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-400 uppercase">Story #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeTeamStory(index)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={story.storyTitleEn || ""}
                      onChange={(e) => updateTeamStory(index, "storyTitleEn", e.target.value)}
                      placeholder="Story Headline (En)..."
                      className="bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      value={story.storyTitleAr || ""}
                      onChange={(e) => updateTeamStory(index, "storyTitleAr", e.target.value)}
                      placeholder="عنوان القصة (عربي)..."
                      className="bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. TRANSFORMATIONS */}
        {activeSectionId === "transformations" && (
          <div id="transformations" className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-bold text-text-primary">6. Spatial Transformations (Before/After)</h2>
              </div>
              <AdminButton variant="secondary" onClick={addTransformation} className="flex items-center gap-1.5 text-xs">
                <Plus className="w-4 h-4" />
                <span>Add Transformation</span>
              </AdminButton>
            </div>

            <div className="space-y-4">
              {(data.transformations?.items || []).map((item: any, index: number) => (
                <div key={item.id || index} className="p-4 bg-surface-hover border border-border-default rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-orange-400 uppercase">Transformation #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeTransformation(index)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={item.titleEn || ""}
                      onChange={(e) => updateTransformation(index, "titleEn", e.target.value)}
                      placeholder="Transformation Title (En)..."
                      className="bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      value={item.titleAr || ""}
                      onChange={(e) => updateTransformation(index, "titleAr", e.target.value)}
                      placeholder="عنوان التحول (عربي)..."
                      className="bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. ROI & IMPACT */}
        {activeSectionId === "impactOverview" && (
          <div id="impactOverview" className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-text-primary">7. Verified ROI & Operational Impact</h2>
              </div>
              <AdminButton variant="secondary" onClick={addImpactStat} className="flex items-center gap-1.5 text-xs">
                <Plus className="w-4 h-4" />
                <span>Add Impact Stat</span>
              </AdminButton>
            </div>

            <div className="space-y-4">
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
                    <input
                      type="text"
                      value={stat.value || ""}
                      onChange={(e) => updateImpactStat(index, "value", e.target.value)}
                      placeholder="e.g. 1.2M+"
                      className="bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary font-bold"
                    />
                    <input
                      type="text"
                      value={stat.labelEn || ""}
                      onChange={(e) => updateImpactStat(index, "labelEn", e.target.value)}
                      placeholder="Label (En)..."
                      className="bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      value={stat.labelAr || ""}
                      onChange={(e) => updateImpactStat(index, "labelAr", e.target.value)}
                      placeholder="الوصف (عربي)..."
                      className="bg-surface-default border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. COMMERCIAL CTA */}
        {activeSectionId === "cta" && (
          <div id="cta" className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <h2 className="text-lg font-bold text-text-primary">8. Commercial RFP / Final Call to Action</h2>
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
          </div>
        )}

        {/* 9. SEO */}
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
