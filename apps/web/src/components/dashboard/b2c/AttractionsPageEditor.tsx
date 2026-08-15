"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Globe, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { UniversalMediaSectionEditor, DEFAULT_UNIVERSAL_MEDIA, UniversalMediaConfig } from "@/components/dashboard/ui/UniversalMediaSectionEditor";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardSectionCard,
  DashboardLanguageSwitch,
  DashboardStickyActions,
  DashboardLoadingState,
  DashboardUnsavedChangesGuard,
  LanguageEditMode,
  EditorSectionItem,
} from "@/components/dashboard/ui";
import { E3LivingHeroEditor } from "@/components/dashboard/b2c/E3LivingHeroEditor";

const SECTIONS: EditorSectionItem[] = [
  { id: "titles", label: "1. Hero Titles & Copy" },
  { id: "display", label: "2. Display & Search Controls" },
  { id: "hero-media", label: "3. Hero Media" },
  { id: "footer-media", label: "4. Footer Media" },
  { id: "seo", label: "5. SEO Metadata" },
];

export function AttractionsPageEditor() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>("titles");
  const [languageMode, setLanguageMode] = useState<LanguageEditMode>("both");

  const [pageConfig, setPageConfig] = useState({
    titleEn: "EXPERIENCES & ATTRACTIONS",
    titleAr: "التجارب والوجهات المميزة",
    descEn: "Explore all flagship E3 entertainment worlds across Qatar.",
    descAr: "استكشف كافة وجهات إي ثري الترفيهية في قطر.",
    showFilters: true,
    showSearchBar: true,
    heroMedia: {
      ...DEFAULT_UNIVERSAL_MEDIA,
      mediaType: "VIDEO",
      mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4",
    } as UniversalMediaConfig,
    footerMedia: {
      ...DEFAULT_UNIVERSAL_MEDIA,
      mediaType: "IMAGE",
      mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    } as UniversalMediaConfig,
    seoTitle: "Experiences & Attractions | E3 Qatar",
    seoDescription: "Discover live events, family attractions, InflataPark, and tactical arenas.",
  });

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [res1, res2] = await Promise.all([
          fetch("/api/cms/pages/b2c-attractions?t=" + Date.now()).catch(() => null),
          fetch("/api/cms/pages/b2c-attractions-page?t=" + Date.now()).catch(() => null),
        ]);

        if (active) {
          if (res1 && res1.ok) {
            const json = await res1.json();
            if (json?.data?.content) {
              setPageConfig((prev) => ({ ...prev, ...json.data.content }));
            }
          } else if (res2 && res2.ok) {
            const json = await res2.json();
            if (json?.data?.content) {
              setPageConfig((prev) => ({ ...prev, ...json.data.content }));
            }
          }
        }
      } catch (_e) {
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const updateField = (updater: (prev: typeof pageConfig) => typeof pageConfig) => {
    setPageConfig((prev) => {
      const next = updater(prev);
      setIsDirty(true);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/cms/pages/b2c-attractions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              content: pageConfig,
              title: { en: pageConfig.titleEn, ar: pageConfig.titleAr },
              published: true,
            },
          }),
        }),
        fetch("/api/cms/pages/b2c-attractions-page", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { content: pageConfig, published: true } }),
        }),
      ]);

      setIsDirty(false);
      setLastSaved(new Date());
      toast("Attractions Page Editor saved successfully!", "success");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "Error saving page settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardLoadingState title="Loading Attractions Page Editor..." type="skeleton" />;
  }

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      {/* Standard Header */}
      <DashboardPageHeader
        title="Attractions Page Editor"
        description="Manage page layout, universal hero/footer media (Image, Video, 3D, IFrame, Fallbacks), and SEO metadata (/b2c/attractions)."
        breadcrumbs={[
          { label: "B2C Pages", href: "/dashboard/b2c/landing" },
          { label: "Attractions Page Editor" },
        ]}
        badge={{ label: "B2C Public", variant: "purple" }}
        previewUrl="/b2c/attractions"
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: saving ? "Saving..." : "Save Page Settings",
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
        secondaryAction={
          <DashboardLanguageSwitch mode={languageMode} onModeChange={setLanguageMode} />
        }
      />

      {/* Section Navigator */}
      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      {/* 1. HERO TITLES (E3 Living Hero System) */}
      {activeSectionId === "titles" && (
        <E3LivingHeroEditor
          value={{
            eyebrowEn: (pageConfig as any).eyebrowEn || "ALL-ACCESS ENTERTAINMENT DIRECTORY",
            eyebrowAr: (pageConfig as any).eyebrowAr || "دليل الوجهات والتجارب الترفيهية الشامل",
            fixedHeadlineEn: (pageConfig as any).fixedHeadlineEn || (pageConfig as any).headlineTemplateEn || "STEP INTO A WORLD OF {{animated}}",
            fixedHeadlineAr: (pageConfig as any).fixedHeadlineAr || (pageConfig as any).headlineTemplateAr || "ادخل إلى عالم من {{animated}}",
            headlineTemplateEn: (pageConfig as any).headlineTemplateEn || (pageConfig as any).fixedHeadlineEn,
            headlineTemplateAr: (pageConfig as any).headlineTemplateAr || (pageConfig as any).fixedHeadlineAr,
            rotatingWordsEn: (pageConfig as any).rotatingWordsEn || ["PLAY", "WONDER", "ADVENTURE", "DISCOVERY"],
            rotatingWordsAr: (pageConfig as any).rotatingWordsAr || ["اللعب", "الإبهار", "المغامرة", "الاكتشاف"],
            descriptionEn: pageConfig.descEn,
            descriptionAr: pageConfig.descAr,
            primaryCta: {
              labelEn: "Explore Attractions",
              labelAr: "استكشف الوجهات",
              url: "#attractions-grid"
            },
            secondaryCta: {
              labelEn: "View Live Calendar",
              labelAr: "عرض جدول الفعاليات",
              url: "/b2c/calendar"
            },
            media: pageConfig.heroMedia,
            preset: (pageConfig as any).preset || "e3-universe",
            animationSpeed: (pageConfig as any).animationSpeed || 2800,
            animationDuration: (pageConfig as any).animationDuration || 600,
            animationType: (pageConfig as any).animationType || "blur-morph",
            wordStyle: (pageConfig as any).wordStyle || "static-gradient",
            alignmentEn: (pageConfig as any).alignmentEn || (pageConfig as any).alignment || "center",
            alignmentAr: (pageConfig as any).alignmentAr || (pageConfig as any).alignment || "center",
            alignment: (pageConfig as any).alignment,
            enableRotatingWords: (pageConfig as any).enableRotatingWords !== false
          }}
          onChange={(updated) => {
            updateField((p: any) => ({
              ...p,
              eyebrowEn: updated.eyebrowEn,
              eyebrowAr: updated.eyebrowAr,
              fixedHeadlineEn: updated.fixedHeadlineEn,
              fixedHeadlineAr: updated.fixedHeadlineAr,
              headlineTemplateEn: updated.headlineTemplateEn,
              headlineTemplateAr: updated.headlineTemplateAr,
              titleEn: updated.fixedHeadlineEn,
              titleAr: updated.fixedHeadlineAr,
              rotatingWordsEn: updated.rotatingWordsEn,
              rotatingWordsAr: updated.rotatingWordsAr,
              descEn: updated.descriptionEn,
              descAr: updated.descriptionAr,
              heroMedia: {
                ...(p.heroMedia || {}),
                ...updated.media
              },
              preset: updated.preset,
              animationSpeed: updated.animationSpeed,
              animationDuration: updated.animationDuration,
              animationType: updated.animationType,
              wordStyle: updated.wordStyle,
              alignmentEn: updated.alignmentEn,
              alignmentAr: updated.alignmentAr,
              alignment: updated.alignment,
              enableRotatingWords: updated.enableRotatingWords
            }))
          }}
          isAr={false}
          languageMode={languageMode === 'ar' ? 'AR' : languageMode === 'en' ? 'EN' : 'BOTH'}
          defaultPreset="e3-universe"
        />
      )}

      {/* 2. DISPLAY & SEARCH */}
      {activeSectionId === "display" && (
        <DashboardSectionCard
          title="Display & Search Controls"
          description="Enable or disable the search bar and category filter controls on the attractions roster."
          icon={<SlidersHorizontal className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] cursor-pointer hover:border-[var(--color-primary)]/40 transition-all">
              <input
                type="checkbox"
                checked={pageConfig.showSearchBar}
                onChange={(e) => updateField((p) => ({ ...p, showSearchBar: e.target.checked }))}
                className="w-4 h-4 accent-purple-600 rounded"
              />
              <div>
                <span className="block text-xs font-bold text-[var(--text-primary)]">Show Live Search Bar</span>
                <span className="block text-[11px] text-[var(--text-secondary)]">Allows guests to search attractions by name or keyword</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] cursor-pointer hover:border-[var(--color-primary)]/40 transition-all">
              <input
                type="checkbox"
                checked={pageConfig.showFilters}
                onChange={(e) => updateField((p) => ({ ...p, showFilters: e.target.checked }))}
                className="w-4 h-4 accent-purple-600 rounded"
              />
              <div>
                <span className="block text-xs font-bold text-[var(--text-primary)]">Show Category Filter Pills</span>
                <span className="block text-[11px] text-[var(--text-secondary)]">Allows filtering by All, Parks, Tactical, Family, and VIP</span>
              </div>
            </label>
          </div>
        </DashboardSectionCard>
      )}

      {/* 3. HERO MEDIA */}
      {activeSectionId === "hero-media" && (
        <UniversalMediaSectionEditor
          title="Attractions Hero Banner Media"
          subtitle="Universal media configuration supporting Video, Image, 3D Canvas, IFrame, and Mobile Fallbacks."
          value={pageConfig.heroMedia}
          onChange={(heroMedia) => updateField((p) => ({ ...p, heroMedia }))}
          accentColor="purple"
        />
      )}

      {/* 4. FOOTER MEDIA */}
      {activeSectionId === "footer-media" && (
        <UniversalMediaSectionEditor
          title="Attractions Footer Banner Media"
          subtitle="Universal media configuration supporting Video, Image, 3D Canvas, and Mobile Fallbacks."
          value={pageConfig.footerMedia}
          onChange={(footerMedia) => updateField((p) => ({ ...p, footerMedia }))}
          accentColor="indigo"
        />
      )}

      {/* 5. SEO */}
      {activeSectionId === "seo" && (
        <DashboardSectionCard
          title="SEO Metadata"
          description="Search engine metadata and OpenGraph social preview tags."
          icon={<Globe className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                SEO Meta Title
              </label>
              <input
                type="text"
                value={pageConfig.seoTitle}
                onChange={(e) => updateField((p) => ({ ...p, seoTitle: e.target.value }))}
                className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                SEO Meta Description
              </label>
              <textarea
                rows={2}
                value={pageConfig.seoDescription}
                onChange={(e) => updateField((p) => ({ ...p, seoDescription: e.target.value }))}
                className="w-full p-3 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        </DashboardSectionCard>
      )}

      {/* Sticky Bottom Actions */}
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
