"use client";

import React, { useState } from "react";
import { Save, Globe, Users2 } from "lucide-react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { MediaUploader } from "@/components/shared/MediaUploader";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionCard,
  DashboardBilingualField,
  DashboardLanguageSwitch,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
  LanguageEditMode,
} from "@/components/dashboard/ui";

export function B2BPartnersEditor({ initialData }: { initialData: any }) {
  const { toast } = useToast();
  const [languageMode, setLanguageMode] = useState<LanguageEditMode>("both");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [data, setData] = useState({
    hero: {
      titleEn: initialData?.hero?.titleEn || "Trusted by the Best.",
      titleAr: initialData?.hero?.titleAr || "يحظى بثقة الأفضل.",
      subtitleEn: initialData?.hero?.subtitleEn || "We partner with ambitious government entities, global brands, and premier destinations to deliver experiences that matter.",
      subtitleAr: initialData?.hero?.subtitleAr || "نحن نتشارك مع هيئات حكومية طموحة، وعلامات تجارية عالمية، ووجهات رائدة لتقديم تجارب تهم.",
      mediaType: initialData?.hero?.mediaType || "IMAGE",
      mediaUrl: initialData?.hero?.mediaUrl || "",
    },
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/pages/b2b-partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsDirty(false);
      setLastSaved(new Date());
      toast("B2B Partners page updated successfully.", "success");
    } catch (e) {
      toast("Failed to save B2B Partners page.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: keyof typeof data, field: string, value: any) => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      {/* Header */}
      <DashboardPageHeader
        title="B2B Clients & Partners Editor"
        description="Manage the hero narrative and media assets on the corporate clients index (/b2b/clients)."
        breadcrumbs={[
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "Clients & Partners Editor" },
        ]}
        badge={{ label: "B2B Public", variant: "warning" }}
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

      {/* Hero Section */}
      <DashboardSectionCard
        title="Clients Hero Narrative"
        description="Opening headlines and mission statement celebrating E3's partnership with Qatar's government entities and enterprise brands."
        icon={<Users2 className="w-5 h-5 text-purple-400" />}
      >
        <DashboardBilingualField
          label="Headline"
          valueEn={data.hero.titleEn}
          valueAr={data.hero.titleAr}
          onChangeEn={(val) => handleChange("hero", "titleEn", val)}
          onChangeAr={(val) => handleChange("hero", "titleAr", val)}
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
          onChangeEn={(val) => handleChange("hero", "subtitleEn", val)}
          onChangeAr={(val) => handleChange("hero", "subtitleAr", val)}
          placeholderEn="Enter description..."
          placeholderAr="أدخل النص الوصفي..."
          mode={languageMode}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[var(--border-level-1)]">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Media Type
            </label>
            <select
              value={data.hero.mediaType}
              onChange={(e) => handleChange("hero", "mediaType", e.target.value)}
              className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="SPLINE">Spline / 3D Scene</option>
              <option value="IFRAME">iFrame Embed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Media Source
            </label>
            {["IFRAME", "SPLINE"].includes(data.hero.mediaType) ? (
              <input
                type="text"
                value={data.hero.mediaUrl}
                onChange={(e) => handleChange("hero", "mediaUrl", e.target.value)}
                placeholder="https://..."
                className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            ) : (
              <MediaUploader
                value={data.hero.mediaUrl}
                onChange={(url) => handleChange("hero", "mediaUrl", url)}
                accept={data.hero.mediaType === "VIDEO" ? "video/*" : "image/*"}
              />
            )}
          </div>
        </div>
      </DashboardSectionCard>

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
