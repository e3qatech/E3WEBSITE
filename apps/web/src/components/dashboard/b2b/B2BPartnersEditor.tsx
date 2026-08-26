"use client";

import React, { useState } from "react";
import { Save, Users2, Globe } from "lucide-react";
import { AdminMediaPicker } from "../ui/AdminMediaPicker";
import { AdminSeoCustomizer } from "../ui/AdminSeoCustomizer";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardSectionCard,
  DashboardBilingualField,
  DashboardLanguageSwitch,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
  LanguageEditMode,
  EditorSectionItem,
} from "@/components/dashboard/ui";

const SECTIONS: EditorSectionItem[] = [
  { id: "hero", label: "1. Hero Narrative", labelAr: "1. ترويسة صفحة الشركاء" },
  { id: "seo", label: "2. SEO Metadata", labelAr: "2. بيانات محركات البحث (SEO)" },
];

export function B2BPartnersEditor({ initialData }: { initialData: any }) {
  const { toast } = useToast();
  const [activeSectionId, setActiveSectionId] = useState<string>("hero");
  const [languageMode, setLanguageMode] = useState<LanguageEditMode>("both");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [data, setData] = useState({
    hero: {
      eyebrowEn: initialData?.hero?.eyebrowEn || "GOVERNMENT & ENTERPRISE ALLIANCES",
      eyebrowAr: initialData?.hero?.eyebrowAr || "تحالفات حكومية ومؤسسية رائدة",
      titleEn: initialData?.hero?.titleEn || "Trusted by the Best.",
      titleAr: initialData?.hero?.titleAr || "يحظى بثقة الأفضل.",
      subtitleEn: initialData?.hero?.subtitleEn || "We partner with ambitious government entities, global brands, and premier destinations to deliver landmark experiences that matter.",
      subtitleAr: initialData?.hero?.subtitleAr || "نحن نتشارك مع هيئات حكومية طموحة، وعلامات تجارية عالمية، ووجهات رائدة لتقديم تجارب استثنائية.",
      mediaType: initialData?.hero?.mediaType || "IMAGE",
      mediaUrl: initialData?.hero?.mediaUrl || "",
    },
  });

  const [seo, setSeo] = useState<any>(initialData?.seo || {});

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/pages/b2b-partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data, seo }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsDirty(false);
      setLastSaved(new Date());
      toast("B2B Partners page updated successfully.", "success");
    } catch (_e) {
      toast("Failed to save B2B Partners page.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleHeroChange = (field: string, value: any) => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value,
      },
    }));
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      <DashboardPageHeader
        title="B2B Clients & Partners Page Editor"
        description="Manage the hero narrative, media asset, and SEO metadata on the corporate clients index (/b2b/clients)."
        breadcrumbs={[
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "Clients & Partners Editor" },
        ]}
        badge={{ label: "B2B Public", variant: "purple" }}
        previewUrl="/b2b/clients"
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: saving ? "Saving..." : "Save Changes",
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
        secondaryAction={
          <DashboardLanguageSwitch mode={languageMode} onModeChange={setLanguageMode} />
        }
      />

      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      {/* 1. HERO */}
      {activeSectionId === "hero" && (
        <DashboardSectionCard
          title="Clients Hero Narrative"
          description="Opening headlines celebrating E3's partnerships with government ministries and enterprise brands."
          icon={<Users2 className="w-5 h-5 text-purple-400" />}
        >
          <DashboardBilingualField
            label="Eyebrow Tag"
            valueEn={data.hero.eyebrowEn}
            valueAr={data.hero.eyebrowAr}
            onChangeEn={(val) => handleHeroChange("eyebrowEn", val)}
            onChangeAr={(val) => handleHeroChange("eyebrowAr", val)}
            placeholderEn="e.g. GOVERNMENT & ENTERPRISE ALLIANCES"
            placeholderAr="مثال: تحالفات حكومية ومؤسسية رائدة"
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Headline"
            valueEn={data.hero.titleEn}
            valueAr={data.hero.titleAr}
            onChangeEn={(val) => handleHeroChange("titleEn", val)}
            onChangeAr={(val) => handleHeroChange("titleAr", val)}
            placeholderEn="e.g. Trusted by the Best."
            placeholderAr="مثال: يحظى بثقة الأفضل."
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Subtitle & Description"
            type="textarea"
            rows={3}
            valueEn={data.hero.subtitleEn}
            valueAr={data.hero.subtitleAr}
            onChangeEn={(val) => handleHeroChange("subtitleEn", val)}
            onChangeAr={(val) => handleHeroChange("subtitleAr", val)}
            placeholderEn="Enter description..."
            placeholderAr="أدخل النص الوصفي..."
            mode={languageMode}
          />

          <div className="pt-3 border-t border-[var(--border-level-1)] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Hero Media Asset
            </label>
            <AdminMediaPicker
              value={data.hero.mediaUrl}
              onChange={(url) => handleHeroChange("mediaUrl", url)}
            />
          </div>
        </DashboardSectionCard>
      )}

      {/* 2. SEO */}
      {activeSectionId === "seo" && (
        <AdminSeoCustomizer seo={seo} setSeo={setSeo} formData={null} setFormData={() => {}} />
      )}

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
