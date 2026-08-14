"use client";

import React, { useState } from "react";
import { Plus, Trash2, Save, Globe, BookOpen, Heart, Sparkles } from "lucide-react";
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
  AdminButton,
} from "@/components/dashboard/ui";

const SECTIONS: EditorSectionItem[] = [
  { id: "header", label: "1. Hero Header" },
  { id: "story", label: "2. Corporate Story" },
  { id: "values", label: "3. Corporate Values" },
  { id: "seo", label: "4. SEO Metadata" },
];

export function B2BAboutEditor({ initialData }: { initialData: any }) {
  const { toast } = useToast();
  const [activeSectionId, setActiveSectionId] = useState<string>("header");
  const [languageMode, setLanguageMode] = useState<LanguageEditMode>("both");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [data, setData] = useState({
    header: {
      titleEn: initialData?.header?.titleEn || "",
      titleAr: initialData?.header?.titleAr || "",
      subtitleEn: initialData?.header?.subtitleEn || "",
      subtitleAr: initialData?.header?.subtitleAr || "",
      mediaType: initialData?.header?.mediaType || "IMAGE",
      mediaUrl: initialData?.header?.mediaUrl || "",
      fallbackImageUrl: initialData?.header?.fallbackImageUrl || "",
    },
    story: {
      titleEn: initialData?.story?.titleEn || "",
      titleAr: initialData?.story?.titleAr || "",
      contentEn: initialData?.story?.contentEn || "",
      contentAr: initialData?.story?.contentAr || "",
      mediaType: initialData?.story?.mediaType || "IMAGE",
      mediaUrl: initialData?.story?.mediaUrl || initialData?.story?.imageMediaId || "",
      fallbackImageUrl: initialData?.story?.fallbackImageUrl || "",
    },
    values: initialData?.values || [],
  });

  const [seo, setSeo] = useState<any>(initialData?.seo || {});

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/pages/b2b-about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data, seo }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsDirty(false);
      setLastSaved(new Date());
      toast("B2B About Us page updated successfully.", "success");
    } catch (e) {
      toast("Failed to save B2B About Us page.", "error");
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

  const addValue = () => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      values: [...prev.values, { titleEn: "", titleAr: "", descEn: "", descAr: "" }],
    }));
  };

  const removeValue = (index: number) => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      values: prev.values.filter((_val: any, i: number) => i !== index),
    }));
  };

  const updateValue = (index: number, field: string, value: string) => {
    setIsDirty(true);
    setData((prev) => {
      const newValues = [...prev.values];
      newValues[index] = { ...newValues[index], [field]: value };
      return { ...prev, values: newValues };
    });
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      {/* Header */}
      <DashboardPageHeader
        title="B2B About Us Editor"
        description="Manage the brand narrative, vision, leadership story, and core values for the corporate portal (/b2b/about)."
        breadcrumbs={[
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "About Us Editor" },
        ]}
        badge={{ label: "B2B Public", variant: "warning" }}
        previewUrl="/b2b/about"
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

      {/* Section Navigator */}
      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      {/* 1. HERO HEADER */}
      {activeSectionId === "header" && (
        <DashboardSectionCard
          title="Hero Header Section"
          description="Main opening headline and banner media for the About Us page."
          icon={<Globe className="w-5 h-5 text-purple-400" />}
        >
          <DashboardBilingualField
            label="Page Title"
            valueEn={data.header.titleEn}
            valueAr={data.header.titleAr}
            onChangeEn={(val) => handleChange("header", "titleEn", val)}
            onChangeAr={(val) => handleChange("header", "titleAr", val)}
            placeholderEn="e.g. About E3 Qatar"
            placeholderAr="مثال: عن إي ثري قطر"
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Subtitle & Mission Statement"
            type="textarea"
            rows={3}
            valueEn={data.header.subtitleEn}
            valueAr={data.header.subtitleAr}
            onChangeEn={(val) => handleChange("header", "subtitleEn", val)}
            onChangeAr={(val) => handleChange("header", "subtitleAr", val)}
            placeholderEn="Enter mission statement..."
            placeholderAr="أدخل بيان المهمة والرؤية..."
            mode={languageMode}
          />

          <div className="space-y-2 pt-2 border-t border-[var(--border-level-1)]">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Hero Media Asset
            </label>
            <AdminMediaPicker
              value={data.header.mediaUrl}
              onChange={(url) => handleChange("header", "mediaUrl", url)}
            />
          </div>
        </DashboardSectionCard>
      )}

      {/* 2. CORPORATE STORY */}
      {activeSectionId === "story" && (
        <DashboardSectionCard
          title="Corporate Story & Heritage"
          description="Detailed brand story, event engineering philosophy, and operational scale in Qatar."
          icon={<BookOpen className="w-5 h-5 text-purple-400" />}
        >
          <DashboardBilingualField
            label="Story Section Heading"
            valueEn={data.story.titleEn}
            valueAr={data.story.titleAr}
            onChangeEn={(val) => handleChange("story", "titleEn", val)}
            onChangeAr={(val) => handleChange("story", "titleAr", val)}
            placeholderEn="e.g. Engineering Unforgettable Experiences"
            placeholderAr="مثال: هندسة تجارب لا تُنسى"
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Narrative Story Content"
            type="textarea"
            rows={5}
            valueEn={data.story.contentEn}
            valueAr={data.story.contentAr}
            onChangeEn={(val) => handleChange("story", "contentEn", val)}
            onChangeAr={(val) => handleChange("story", "contentAr", val)}
            placeholderEn="Enter narrative story content..."
            placeholderAr="أدخل النص السردي..."
            mode={languageMode}
          />

          <div className="space-y-2 pt-2 border-t border-[var(--border-level-1)]">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Story Media Asset
            </label>
            <AdminMediaPicker
              value={data.story.mediaUrl}
              onChange={(url) => handleChange("story", "mediaUrl", url)}
            />
          </div>
        </DashboardSectionCard>
      )}

      {/* 3. CORPORATE VALUES */}
      {activeSectionId === "values" && (
        <DashboardSectionCard
          title="Corporate Core Values"
          description="Foundational principles guiding E3's design, innovation, and client partnerships."
          icon={<Heart className="w-5 h-5 text-pink-400" />}
          headerAction={
            <AdminButton
              variant="outline"
              size="sm"
              onClick={addValue}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Add Value
            </AdminButton>
          }
        >
          <div className="space-y-4">
            {data.values.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">No corporate values defined yet.</p>
            ) : (
              data.values.map((val: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)]/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 uppercase">Value #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeValue(idx)}
                      className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Remove Value"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <DashboardBilingualField
                    label="Value Title"
                    valueEn={val.titleEn || ""}
                    valueAr={val.titleAr || ""}
                    onChangeEn={(v) => updateValue(idx, "titleEn", v)}
                    onChangeAr={(v) => updateValue(idx, "titleAr", v)}
                    mode={languageMode}
                  />

                  <DashboardBilingualField
                    label="Value Description"
                    type="textarea"
                    rows={2}
                    valueEn={val.descEn || ""}
                    valueAr={val.descAr || ""}
                    onChangeEn={(v) => updateValue(idx, "descEn", v)}
                    onChangeAr={(v) => updateValue(idx, "descAr", v)}
                    mode={languageMode}
                  />
                </div>
              ))
            )}
          </div>
        </DashboardSectionCard>
      )}

      {/* 4. SEO */}
      {activeSectionId === "seo" && (
        <AdminSeoCustomizer seo={seo} setSeo={setSeo} formData={null} setFormData={() => {}} />
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
