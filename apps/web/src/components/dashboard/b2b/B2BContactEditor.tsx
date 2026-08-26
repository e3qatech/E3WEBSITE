"use client";

import React, { useState } from "react";
import { Mail, Phone, Save, Briefcase, MessageSquare } from "lucide-react";
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
  { id: "header", label: "1. Header & Inquiries", labelAr: "1. قسم العنوان والاستفسارات" },
  { id: "rfp-ctas", label: "2. CTAs & Opportunity Cards", labelAr: "2. بطاقات الفرص وطلبات العروض" },
  { id: "seo", label: "3. SEO Metadata", labelAr: "3. بيانات محركات البحث (SEO)" },
];

export function B2BContactEditor({ initialData }: { initialData: any }) {
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
    },
    inquiries: {
      business: initialData?.inquiries?.business || "rfp@e3.qa",
      careers: initialData?.inquiries?.careers || "careers@e3.qa",
      phone: initialData?.inquiries?.phone || "+974 4400 0000",
    },
    headquarters: {
      addressEn: initialData?.headquarters?.addressEn || "Doha, State of Qatar",
      addressAr: initialData?.headquarters?.addressAr || "الدوحة، دولة قطر",
    },
    careersCta: {
      titleEn: initialData?.careersCta?.titleEn || "Join Our Team",
      titleAr: initialData?.careersCta?.titleAr || "انضم لفريقنا",
      descriptionEn: initialData?.careersCta?.descriptionEn || "Discover new opportunities to build extraordinary experiences.",
      descriptionAr: initialData?.careersCta?.descriptionAr || "اكتشف فرصاً جديدة لبناء تجارب استثنائية.",
      ctaTextEn: initialData?.careersCta?.ctaTextEn || "Explore Careers",
      ctaTextAr: initialData?.careersCta?.ctaTextAr || "استكشف الوظائف",
      ctaLink: initialData?.careersCta?.ctaLink || "/careers",
      mediaUrl: initialData?.careersCta?.mediaUrl || "",
    },
    feedbackCta: {
      titleEn: initialData?.feedbackCta?.titleEn || "Suggestions & Feedback",
      titleAr: initialData?.feedbackCta?.titleAr || "اقتراحات وملاحظات",
      descriptionEn: initialData?.feedbackCta?.descriptionEn || "Help us improve by sharing your thoughts.",
      descriptionAr: initialData?.feedbackCta?.descriptionAr || "ساعدنا في التحسين من خلال مشاركة أفكارك.",
      ctaTextEn: initialData?.feedbackCta?.ctaTextEn || "Share Feedback",
      ctaTextAr: initialData?.feedbackCta?.ctaTextAr || "شارك الملاحظات",
      ctaLink: initialData?.feedbackCta?.ctaLink || "/feedback",
      mediaUrl: initialData?.feedbackCta?.mediaUrl || "",
    },
    faqCta: {
      titleEn: initialData?.faqCta?.titleEn || "B2B FAQs",
      titleAr: initialData?.faqCta?.titleAr || "الأسئلة الشائعة",
      descriptionEn: initialData?.faqCta?.descriptionEn || "Find answers to commonly asked questions about our services and processes.",
      descriptionAr: initialData?.faqCta?.descriptionAr || "ابحث عن إجابات للأسئلة الشائعة حول خدماتنا وعملياتنا.",
      ctaTextEn: initialData?.faqCta?.ctaTextEn || "View FAQs",
      ctaTextAr: initialData?.faqCta?.ctaTextAr || "عرض الأسئلة",
      ctaLink: initialData?.faqCta?.ctaLink || "/b2b/faqs",
      mediaUrl: initialData?.faqCta?.mediaUrl || "",
    },
  });

  const [seo, setSeo] = useState<any>(initialData?.seo || {});

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/pages/b2b-contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data, seo }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsDirty(false);
      setLastSaved(new Date());
      toast("B2B Contact page updated successfully.", "success");
    } catch (_e) {
      toast("Failed to save B2B Contact page.", "error");
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
        title="B2B Contact & RFP Editor"
        description="Manage corporate contact details, RFP intake parameters, and opportunity gateway cards (/b2b/contact)."
        breadcrumbs={[
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "Contact & RFP Editor" },
        ]}
        badge={{ label: "B2B Public", variant: "warning" }}
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

      {/* Section Navigator */}
      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      {/* 1. HEADER & INQUIRIES */}
      {activeSectionId === "header" && (
        <div className="space-y-6">
          <DashboardSectionCard
            title="Page Header & Narrative"
            description="Hero copy displayed at the top of the contact and RFP submission page."
            icon={<Mail className="w-5 h-5 text-purple-400" />}
          >
            <DashboardBilingualField
              label="Page Title"
              valueEn={data.header.titleEn}
              valueAr={data.header.titleAr}
              onChangeEn={(val) => handleChange("header", "titleEn", val)}
              onChangeAr={(val) => handleChange("header", "titleAr", val)}
              placeholderEn="e.g. Partner With E3 Qatar"
              placeholderAr="مثال: شارك إي ثري قطر"
              mode={languageMode}
            />

            <DashboardBilingualField
              label="Subtitle"
              type="textarea"
              rows={2}
              valueEn={data.header.subtitleEn}
              valueAr={data.header.subtitleAr}
              onChangeEn={(val) => handleChange("header", "subtitleEn", val)}
              onChangeAr={(val) => handleChange("header", "subtitleAr", val)}
              placeholderEn="Enter subtitle..."
              placeholderAr="أدخل النص الفرعي..."
              mode={languageMode}
            />

            <div className="space-y-2 pt-2 border-t border-[var(--border-level-1)]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Header Media Asset
              </label>
              <AdminMediaPicker
                value={data.header.mediaUrl}
                onChange={(url) => handleChange("header", "mediaUrl", url)}
              />
            </div>
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Direct Contact Channels"
            description="Official email channels and headquarters physical location."
            icon={<Phone className="w-5 h-5 text-purple-400" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Business RFP Email
                </label>
                <input
                  type="email"
                  value={data.inquiries.business}
                  onChange={(e) => handleChange("inquiries", "business", e.target.value)}
                  className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Careers & Talent Email
                </label>
                <input
                  type="email"
                  value={data.inquiries.careers}
                  onChange={(e) => handleChange("inquiries", "careers", e.target.value)}
                  className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Direct Phone Number
                </label>
                <input
                  type="text"
                  value={data.inquiries.phone}
                  onChange={(e) => handleChange("inquiries", "phone", e.target.value)}
                  className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-level-1)]">
              <DashboardBilingualField
                label="Headquarters Address"
                valueEn={data.headquarters.addressEn}
                valueAr={data.headquarters.addressAr}
                onChangeEn={(val) => handleChange("headquarters", "addressEn", val)}
                onChangeAr={(val) => handleChange("headquarters", "addressAr", val)}
                placeholderEn="e.g. Doha, State of Qatar"
                placeholderAr="مثال: الدوحة، دولة قطر"
                mode={languageMode}
              />
            </div>
          </DashboardSectionCard>
        </div>
      )}

      {/* 2. RFP & CTAs */}
      {activeSectionId === "rfp-ctas" && (
        <div className="space-y-6">
          {/* Careers CTA Card */}
          <DashboardSectionCard
            title="Careers Gateway Card"
            description="Callout card linking candidates to the careers and talent recruitment portal."
            icon={<Briefcase className="w-5 h-5 text-indigo-400" />}
          >
            <DashboardBilingualField
              label="Card Title"
              valueEn={data.careersCta.titleEn}
              valueAr={data.careersCta.titleAr}
              onChangeEn={(val) => handleChange("careersCta", "titleEn", val)}
              onChangeAr={(val) => handleChange("careersCta", "titleAr", val)}
              mode={languageMode}
            />

            <DashboardBilingualField
              label="Card Description"
              type="textarea"
              rows={2}
              valueEn={data.careersCta.descriptionEn}
              valueAr={data.careersCta.descriptionAr}
              onChangeEn={(val) => handleChange("careersCta", "descriptionEn", val)}
              onChangeAr={(val) => handleChange("careersCta", "descriptionAr", val)}
              mode={languageMode}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DashboardBilingualField
                label="Button Label"
                valueEn={data.careersCta.ctaTextEn}
                valueAr={data.careersCta.ctaTextAr}
                onChangeEn={(val) => handleChange("careersCta", "ctaTextEn", val)}
                onChangeAr={(val) => handleChange("careersCta", "ctaTextAr", val)}
                mode={languageMode}
              />
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={data.careersCta.ctaLink}
                  onChange={(e) => handleChange("careersCta", "ctaLink", e.target.value)}
                  className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          </DashboardSectionCard>

          {/* Feedback CTA Card */}
          <DashboardSectionCard
            title="Client Feedback Gateway Card"
            description="Callout card inviting partners to share feedback or inquiries."
            icon={<MessageSquare className="w-5 h-5 text-purple-400" />}
          >
            <DashboardBilingualField
              label="Card Title"
              valueEn={data.feedbackCta.titleEn}
              valueAr={data.feedbackCta.titleAr}
              onChangeEn={(val) => handleChange("feedbackCta", "titleEn", val)}
              onChangeAr={(val) => handleChange("feedbackCta", "titleAr", val)}
              mode={languageMode}
            />

            <DashboardBilingualField
              label="Card Description"
              type="textarea"
              rows={2}
              valueEn={data.feedbackCta.descriptionEn}
              valueAr={data.feedbackCta.descriptionAr}
              onChangeEn={(val) => handleChange("feedbackCta", "descriptionEn", val)}
              onChangeAr={(val) => handleChange("feedbackCta", "descriptionAr", val)}
              mode={languageMode}
            />
          </DashboardSectionCard>
        </div>
      )}

      {/* 3. SEO */}
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
