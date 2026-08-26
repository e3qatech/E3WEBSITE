"use client";

import React, { useState } from "react";
import { Save, MessageSquare, CheckCircle2, Globe } from "lucide-react";
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
  { id: "header", label: "1. Header & Context", labelAr: "1. ترويسة ونموذج الملاحظات" },
  { id: "success", label: "2. Success State", labelAr: "2. رسالة نجاح الإرسال" },
  { id: "seo", label: "3. SEO Metadata", labelAr: "3. بيانات محركات البحث (SEO)" },
];

export function B2BFeedbackEditor({ initialData }: { initialData: any }) {
  const { toast } = useToast();
  const [activeSectionId, setActiveSectionId] = useState<string>("header");
  const [languageMode, setLanguageMode] = useState<LanguageEditMode>("both");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [data, setData] = useState({
    header: {
      eyebrowEn: initialData?.header?.eyebrowEn || "PARTNER SATISFACTION & AUDIT",
      eyebrowAr: initialData?.header?.eyebrowAr || "تقييم الشركاء وجودة الخدمة",
      titleEn: initialData?.header?.titleEn || "Partner Suggestions & Feedback",
      titleAr: initialData?.header?.titleAr || "الاقتراحات وملاحظات الشركاء",
      subtitleEn: initialData?.header?.subtitleEn || "We value our enterprise collaborations. Your feedback empowers us to continuously elevate operational benchmarks.",
      subtitleAr: initialData?.header?.subtitleAr || "نحن نعتز بشراكاتنا المؤسسية. تساهم ملاحظاتكم في الارتقاء المستمر بمعاييرنا التشغيلية وجودة مشاريعنا.",
      mediaType: initialData?.header?.mediaType || "IMAGE",
      mediaUrl: initialData?.header?.mediaUrl || "",
    },
    success: {
      titleEn: initialData?.success?.titleEn || "Thank you for your feedback!",
      titleAr: initialData?.success?.titleAr || "شكراً لملاحظاتك القيمة!",
      messageEn: initialData?.success?.messageEn || "Your feedback has been logged securely and forwarded directly to our Executive Quality & Operations board.",
      messageAr: initialData?.success?.messageAr || "تم تسجيل ملاحظاتك بأمان وتحويلها مباشرة إلى مجلس الجودة والعمليات التنفيذية لدينا.",
    },
  });

  const [seo, setSeo] = useState<any>(initialData?.seo || {});

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/pages/b2b-feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data, seo }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsDirty(false);
      setLastSaved(new Date());
      toast("B2B Feedback page updated successfully.", "success");
    } catch (_e) {
      toast("Failed to save B2B Feedback page.", "error");
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

  const handleSuccessChange = (field: string, value: any) => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      success: { ...prev.success, [field]: value },
    }));
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      <DashboardPageHeader
        title="B2B Feedback Page Editor"
        description="Manage the partner satisfaction feedback form, introduction narrative, confirmation prompts, and SEO."
        breadcrumbs={[
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "Feedback Editor" },
        ]}
        badge={{ label: "B2B Forms", variant: "purple" }}
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
          description="Headline, eyebrow tag, and hero media asset for the partner feedback form."
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

      {/* 2. SUCCESS CONFIRMATION */}
      {activeSectionId === "success" && (
        <DashboardSectionCard
          title="Success Submission State"
          description="Confirmation message displayed to partners after submitting their feedback."
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        >
          <DashboardBilingualField
            label="Success Title"
            valueEn={data.success.titleEn}
            valueAr={data.success.titleAr}
            onChangeEn={(val) => handleSuccessChange("titleEn", val)}
            onChangeAr={(val) => handleSuccessChange("titleAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Success Description Message"
            type="textarea"
            rows={3}
            valueEn={data.success.messageEn}
            valueAr={data.success.messageAr}
            onChangeEn={(val) => handleSuccessChange("messageEn", val)}
            onChangeAr={(val) => handleSuccessChange("messageAr", val)}
            mode={languageMode}
          />
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
