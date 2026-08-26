"use client";

import React, { useState } from "react";
import { Plus, Trash2, Save, HelpCircle, Globe } from "lucide-react";
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
  { id: "header", label: "1. Header Section", labelAr: "1. ترويسة الصفحة" },
  { id: "faqs", label: "2. Questions & Answers", labelAr: "2. بنك الأسئلة والأجوبة" },
  { id: "seo", label: "3. SEO Metadata", labelAr: "3. بيانات محركات البحث (SEO)" },
];

export function B2BFAQsEditor({ initialData }: { initialData: any }) {
  const { toast } = useToast();
  const [activeSectionId, setActiveSectionId] = useState<string>("header");
  const [languageMode, setLanguageMode] = useState<LanguageEditMode>("both");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [data, setData] = useState({
    header: {
      eyebrowEn: initialData?.header?.eyebrowEn || "KNOWLEDGE & PARTNER FAQ",
      eyebrowAr: initialData?.header?.eyebrowAr || "الأسئلة الشائعة والمعلومات",
      titleEn: initialData?.header?.titleEn || "Frequently Asked Questions",
      titleAr: initialData?.header?.titleAr || "الأسئلة الشائعة",
      subtitleEn: initialData?.header?.subtitleEn || "Everything you need to know about partnering with E3, procurement timelines, safety certifications, and live production scope.",
      subtitleAr: initialData?.header?.subtitleAr || "كل ما تحتاج لمعرفته حول الشراكة مع إي ثري، الجداول الزمنية لتنفيذ المشاريع، اعتمادات السلامة، ونطاق الإنتاج والتشغيل.",
      mediaType: initialData?.header?.mediaType || "IMAGE",
      mediaUrl: initialData?.header?.mediaUrl || "",
    },
    items: Array.isArray(initialData?.items) && initialData.items.length > 0
      ? initialData.items
      : [
          {
            id: "faq_1",
            questionEn: "What scale of events and destinations does E3 engineer?",
            questionAr: "ما هو حجم الفعاليات والوجهات التي تقوم إي ثري بهندستها؟",
            answerEn: "E3 engineers turnkey projects ranging from mega stadium opening ceremonies and national parades to permanent family entertainment centers and kinetic interactive pavilions across Qatar and the GCC.",
            answerAr: "تقوم إي ثري بتنفيذ مشاريع متكاملة تشمل حفلات افتتاح الاستادات والمسيرات الوطنية الكبرى، وصولاً إلى مدن الألعاب العائلية الدائمة والأجنحة التفاعلية في قطر ودول الخليج.",
          },
        ],
  });

  const [seo, setSeo] = useState<any>(initialData?.seo || {});

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/pages/b2b-faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data, seo }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsDirty(false);
      setLastSaved(new Date());
      toast("B2B FAQs page updated successfully.", "success");
    } catch (_e) {
      toast("Failed to save B2B FAQs page.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleHeaderChange = (field: string, value: any) => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      header: { ...prev.header, [field]: value },
    }));
  };

  const addFaq = () => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `faq_${Date.now()}`,
          questionEn: "",
          questionAr: "",
          answerEn: "",
          answerAr: "",
        },
      ],
    }));
  };

  const removeFaq = (index: number) => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateFaq = (index: number, field: string, value: string) => {
    setIsDirty(true);
    setData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      <DashboardPageHeader
        title="B2B FAQs Page Editor"
        description="Manage frequently asked questions, partner procurement briefs, safety certification answers, and SEO."
        breadcrumbs={[
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "FAQs Editor" },
        ]}
        badge={{ label: `${data.items.length} Questions`, variant: "purple" }}
        previewUrl="/b2b/contact"
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

      {/* 1. HEADER */}
      {activeSectionId === "header" && (
        <DashboardSectionCard
          title="Header & Introduction"
          description="Headline, eyebrow tag, and hero media asset for FAQs."
          icon={<Globe className="w-5 h-5 text-purple-400" />}
        >
          <DashboardBilingualField
            label="Eyebrow Tag"
            valueEn={data.header.eyebrowEn}
            valueAr={data.header.eyebrowAr}
            onChangeEn={(val) => handleHeaderChange("eyebrowEn", val)}
            onChangeAr={(val) => handleHeaderChange("eyebrowAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Page Title"
            valueEn={data.header.titleEn}
            valueAr={data.header.titleAr}
            onChangeEn={(val) => handleHeaderChange("titleEn", val)}
            onChangeAr={(val) => handleHeaderChange("titleAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Subtitle"
            type="textarea"
            rows={3}
            valueEn={data.header.subtitleEn}
            valueAr={data.header.subtitleAr}
            onChangeEn={(val) => handleHeaderChange("subtitleEn", val)}
            onChangeAr={(val) => handleHeaderChange("subtitleAr", val)}
            mode={languageMode}
          />
          <div className="pt-2 border-t border-[var(--border-level-1)] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Hero Media Asset
            </label>
            <AdminMediaPicker
              value={data.header.mediaUrl}
              onChange={(url) => handleHeaderChange("mediaUrl", url)}
            />
          </div>
        </DashboardSectionCard>
      )}

      {/* 2. FAQS LIST */}
      {activeSectionId === "faqs" && (
        <DashboardSectionCard
          title="Questions & Answers"
          description="Add, edit, or remove FAQ pairs with bilingual support."
          icon={<HelpCircle className="w-5 h-5 text-purple-400" />}
          headerAction={
            <AdminButton
              variant="outline"
              size="sm"
              onClick={addFaq}
              leftIcon={<Plus className="w-3.5 h-3.5 text-purple-500" />}
              className="text-xs"
            >
              Add Question
            </AdminButton>
          }
        >
          <div className="space-y-4">
            {data.items.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">No questions added yet.</p>
            ) : (
              data.items.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)]/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Question #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Remove Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <DashboardBilingualField
                    label="Question"
                    valueEn={item.questionEn}
                    valueAr={item.questionAr}
                    onChangeEn={(v) => updateFaq(idx, "questionEn", v)}
                    onChangeAr={(v) => updateFaq(idx, "questionAr", v)}
                    mode={languageMode}
                  />
                  <DashboardBilingualField
                    label="Answer"
                    type="textarea"
                    rows={3}
                    valueEn={item.answerEn}
                    valueAr={item.answerAr}
                    onChangeEn={(v) => updateFaq(idx, "answerEn", v)}
                    onChangeAr={(v) => updateFaq(idx, "answerAr", v)}
                    mode={languageMode}
                  />
                </div>
              ))
            )}
          </div>
        </DashboardSectionCard>
      )}

      {/* 3. SEO */}
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
