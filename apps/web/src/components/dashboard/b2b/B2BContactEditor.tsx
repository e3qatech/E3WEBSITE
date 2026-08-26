"use client";

import React, { useState } from "react";
import { Mail, Phone, Save, Briefcase, MessageSquare, HelpCircle, FileText, Plus, Trash2, Globe, Clock, MapPin, CheckCircle2 } from "lucide-react";
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
  { id: "header", label: "1. Header & Direct Channels", labelAr: "1. العنوان وقنوات التواصل" },
  { id: "form", label: "2. Inquiry Form & Options", labelAr: "2. نموذج الاستفسار وخيارات الطلب" },
  { id: "gateway-ctas", label: "3. Opportunity Gateway Cards", labelAr: "3. بطاقات الفرص وبوابات الاستكشاف" },
  { id: "seo", label: "4. SEO & Metadata", labelAr: "4. بيانات محركات البحث (SEO)" },
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
      eyebrowEn: initialData?.header?.eyebrowEn || "DIRECT ENGAGEMENT & RFP INTAKE",
      eyebrowAr: initialData?.header?.eyebrowAr || "التواصل المباشر وتقديم طلبات العروض",
      titleEn: initialData?.header?.titleEn || "Contact Us / Submit RFP",
      titleAr: initialData?.header?.titleAr || "تواصل معنا / تقديم طلب عروض",
      subtitleEn: initialData?.header?.subtitleEn || "Planning a major event, venue, or activation? Let us help you engineer a successful delivery plan.",
      subtitleAr: initialData?.header?.subtitleAr || "هل لديك مشروع أو فعاليات كبرى تخطط لها؟ دعنا نساعدك في بناء خطة تنفيذ ناجحة.",
      mediaType: initialData?.header?.mediaType || "IMAGE",
      mediaUrl: initialData?.header?.mediaUrl || "",
    },
    inquiries: {
      business: initialData?.inquiries?.business || "info@eeeqa.com",
      careers: initialData?.inquiries?.careers || "info@eeeqa.com",
      press: initialData?.inquiries?.press || "",
      phone: initialData?.inquiries?.phone || "+974 3048 9955",
      whatsapp: initialData?.inquiries?.whatsapp || "+974 3048 9955",
      workingHoursEn: initialData?.inquiries?.workingHoursEn || "Sunday - Thursday: 8:00 AM - 5:00 PM AST",
      workingHoursAr: initialData?.inquiries?.workingHoursAr || "الأحد - الخميس: 8:00 صباحاً - 5:00 مساءً بتوقيت الدوحة",
    },
    headquarters: {
      addressEn: initialData?.headquarters?.addressEn || "Doha, State of Qatar",
      addressAr: initialData?.headquarters?.addressAr || "الدوحة، دولة قطر",
      mapLink: initialData?.headquarters?.mapLink || "https://maps.google.com",
    },
    formConfig: {
      inquiryTypes: Array.isArray(initialData?.formConfig?.inquiryTypes) && initialData.formConfig.inquiryTypes.length > 0
        ? initialData.formConfig.inquiryTypes
        : [
            { id: "rfp", value: "RFP Submission", labelEn: "RFP Submission", labelAr: "تقديم طلب عروض" },
            { id: "business", value: "General Business", labelEn: "General Business", labelAr: "أعمال عامة" },
            { id: "partnership", value: "Partnership", labelEn: "Partnership", labelAr: "شراكة" },
            { id: "other", value: "Other", labelEn: "Other", labelAr: "أخرى" },
          ],
      labels: {
        inquiryTypeEn: initialData?.formConfig?.labels?.inquiryTypeEn || "Inquiry Type",
        inquiryTypeAr: initialData?.formConfig?.labels?.inquiryTypeAr || "نوع الاستفسار",
        fullNameEn: initialData?.formConfig?.labels?.fullNameEn || "Full Name",
        fullNameAr: initialData?.formConfig?.labels?.fullNameAr || "الاسم الكامل",
        fullNamePlaceholderEn: initialData?.formConfig?.labels?.fullNamePlaceholderEn || "Jane Doe",
        fullNamePlaceholderAr: initialData?.formConfig?.labels?.fullNamePlaceholderAr || "فلان الفلاني",
        companyEn: initialData?.formConfig?.labels?.companyEn || "Company / Organization",
        companyAr: initialData?.formConfig?.labels?.companyAr || "الشركة / المنظمة",
        companyPlaceholderEn: initialData?.formConfig?.labels?.companyPlaceholderEn || "Organization Name",
        companyPlaceholderAr: initialData?.formConfig?.labels?.companyPlaceholderAr || "اسم المنظمة",
        emailEn: initialData?.formConfig?.labels?.emailEn || "Corporate Email Address",
        emailAr: initialData?.formConfig?.labels?.emailAr || "البريد الإلكتروني للعمل",
        emailPlaceholderEn: initialData?.formConfig?.labels?.emailPlaceholderEn || "name@company.com",
        emailPlaceholderAr: initialData?.formConfig?.labels?.emailPlaceholderAr || "name@company.com",
        phoneEn: initialData?.formConfig?.labels?.phoneEn || "Phone / WhatsApp Number",
        phoneAr: initialData?.formConfig?.labels?.phoneAr || "رقم الهاتف / الواتساب",
        phonePlaceholderEn: initialData?.formConfig?.labels?.phonePlaceholderEn || "+974 XXXX XXXX",
        phonePlaceholderAr: initialData?.formConfig?.labels?.phonePlaceholderAr || "+974 XXXX XXXX",
        messageEn: initialData?.formConfig?.labels?.messageEn || "Project Details or Scope Brief",
        messageAr: initialData?.formConfig?.labels?.messageAr || "تفاصيل المشروع أو نطاق العمل",
        messagePlaceholderEn: initialData?.formConfig?.labels?.messagePlaceholderEn || "Tell us about your requirements, timeline, and scale...",
        messagePlaceholderAr: initialData?.formConfig?.labels?.messagePlaceholderAr || "أخبرنا عن متطلباتك والجدول الزمني والنطاق...",
        uploadTitleEn: initialData?.formConfig?.labels?.uploadTitleEn || "RFP Document / Brief (Optional)",
        uploadTitleAr: initialData?.formConfig?.labels?.uploadTitleAr || "وثيقة طلب العروض / المرفقات (اختياري)",
        uploadHelpEn: initialData?.formConfig?.labels?.uploadHelpEn || "PDF, DOCX up to 25MB (Encrypted & Qatar PDPL Compliant)",
        uploadHelpAr: initialData?.formConfig?.labels?.uploadHelpAr || "ملفات PDF, DOCX حتى 25 ميجابايت (مشفرة ومتوافقة مع قانون حماية البيانات القطري)",
        privacyNoticeEn: initialData?.formConfig?.labels?.privacyNoticeEn || "By submitting this form, you agree to our Privacy Policy and consent to us storing your data to process this inquiry.",
        privacyNoticeAr: initialData?.formConfig?.labels?.privacyNoticeAr || "من خلال إرسال هذا النموذج، فإنك توافق على سياسة الخصوصية الخاصة بنا وتوافق على تخزين بياناتك لمعالجة هذا الاستفسار.",
        submitButtonEn: initialData?.formConfig?.labels?.submitButtonEn || "Submit Inquiry / RFP",
        submitButtonAr: initialData?.formConfig?.labels?.submitButtonAr || "إرسال الاستفسار / طلب العروض",
        submittingButtonEn: initialData?.formConfig?.labels?.submittingButtonEn || "Submitting Request...",
        submittingButtonAr: initialData?.formConfig?.labels?.submittingButtonAr || "جاري إرسال الطلب...",
      },
      successState: {
        titleEn: initialData?.formConfig?.successState?.titleEn || "Request Received",
        titleAr: initialData?.formConfig?.successState?.titleAr || "تم استلام الطلب بنجاح",
        messageEn: initialData?.formConfig?.successState?.messageEn || "Our executive enterprise team will review your inquiry and connect with you within 24 hours.",
        messageAr: initialData?.formConfig?.successState?.messageAr || "سيقوم فريقنا التنفيذي بمراجعة استفسارك والتواصل معك خلال 24 ساعة.",
        buttonEn: initialData?.formConfig?.successState?.buttonEn || "Submit Another Inquiry",
        buttonAr: initialData?.formConfig?.successState?.buttonAr || "إرسال استفسار آخر",
      },
    },
    careersCta: {
      enabled: initialData?.careersCta?.enabled !== false,
      titleEn: initialData?.careersCta?.titleEn || "Join Our Team",
      titleAr: initialData?.careersCta?.titleAr || "انضم لفريقنا",
      descriptionEn: initialData?.careersCta?.descriptionEn || "Discover new opportunities to build extraordinary entertainment and attraction experiences.",
      descriptionAr: initialData?.careersCta?.descriptionAr || "اكتشف فرصاً جديدة لبناء تجارب ترفيهية ووجهات جذب استثنائية.",
      ctaTextEn: initialData?.careersCta?.ctaTextEn || "Explore Careers",
      ctaTextAr: initialData?.careersCta?.ctaTextAr || "استكشف الوظائف",
      ctaLink: initialData?.careersCta?.ctaLink || "/b2b/careers",
      mediaType: initialData?.careersCta?.mediaType || "IMAGE",
      mediaUrl: initialData?.careersCta?.mediaUrl || "",
    },
    feedbackCta: {
      enabled: initialData?.feedbackCta?.enabled !== false,
      titleEn: initialData?.feedbackCta?.titleEn || "Suggestions & Feedback",
      titleAr: initialData?.feedbackCta?.titleAr || "اقتراحات وملاحظات",
      descriptionEn: initialData?.feedbackCta?.descriptionEn || "Help us refine our operations and elevate visitor standards by sharing your thoughts.",
      descriptionAr: initialData?.feedbackCta?.descriptionAr || "ساعدنا في الارتقاء بمعايير التشغيل وتجارب الزوار من خلال مشاركة أفكارك.",
      ctaTextEn: initialData?.feedbackCta?.ctaTextEn || "Share Feedback",
      ctaTextAr: initialData?.feedbackCta?.ctaTextAr || "شارك الملاحظات",
      ctaLink: initialData?.feedbackCta?.ctaLink || "/b2b/feedback",
      mediaType: initialData?.feedbackCta?.mediaType || "IMAGE",
      mediaUrl: initialData?.feedbackCta?.mediaUrl || "",
    },
    faqCta: {
      enabled: initialData?.faqCta?.enabled !== false,
      titleEn: initialData?.faqCta?.titleEn || "B2B FAQs",
      titleAr: initialData?.faqCta?.titleAr || "الأسئلة الشائعة",
      descriptionEn: initialData?.faqCta?.descriptionEn || "Find comprehensive answers to commonly asked questions about our engineering, procurement, and turnkey delivery.",
      descriptionAr: initialData?.faqCta?.descriptionAr || "ابحث عن إجابات وافية للأسئلة الشائعة حول خدماتنا وعملياتنا الهندسية والتوريد والإدارة المتكاملة.",
      ctaTextEn: initialData?.faqCta?.ctaTextEn || "View FAQs",
      ctaTextAr: initialData?.faqCta?.ctaTextAr || "عرض الأسئلة",
      ctaLink: initialData?.faqCta?.ctaLink || "/b2b/faqs",
      mediaType: initialData?.faqCta?.mediaType || "IMAGE",
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

  const handleChange = (section: string, field: string, value: any) => {
    setIsDirty(true);
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const handleFormLabelChange = (field: string, value: any) => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        labels: {
          ...prev.formConfig.labels,
          [field]: value,
        },
      },
    }));
  };

  const handleSuccessStateChange = (field: string, value: any) => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        successState: {
          ...prev.formConfig.successState,
          [field]: value,
        },
      },
    }));
  };

  // Inquiry Types Handlers
  const addInquiryType = () => {
    setIsDirty(true);
    const newId = `inquiry_${Date.now()}`;
    setData((prev) => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        inquiryTypes: [
          ...prev.formConfig.inquiryTypes,
          { id: newId, value: "New Inquiry Option", labelEn: "New Inquiry Option", labelAr: "خيار استفسار جديد" },
        ],
      },
    }));
  };

  const updateInquiryType = (index: number, field: string, value: string) => {
    setIsDirty(true);
    setData((prev) => {
      const updated = [...prev.formConfig.inquiryTypes];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        formConfig: {
          ...prev.formConfig,
          inquiryTypes: updated,
        },
      };
    });
  };

  const removeInquiryType = (index: number) => {
    if (data.formConfig.inquiryTypes.length <= 1) {
      toast("Must retain at least one inquiry type option.", "info");
      return;
    }
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        inquiryTypes: prev.formConfig.inquiryTypes.filter((_: any, i: number) => i !== index),
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

      {/* 1. HEADER & DIRECT CHANNELS */}
      {activeSectionId === "header" && (
        <div className="space-y-6">
          <DashboardSectionCard
            title="Page Header & Narrative"
            description="Hero copy displayed at the top of the contact and RFP submission page."
            icon={<Mail className="w-5 h-5 text-emerald-400" />}
          >
            <DashboardBilingualField
              label="Eyebrow Tag"
              valueEn={data.header.eyebrowEn}
              valueAr={data.header.eyebrowAr}
              onChangeEn={(val) => handleChange("header", "eyebrowEn", val)}
              onChangeAr={(val) => handleChange("header", "eyebrowAr", val)}
              placeholderEn="e.g. DIRECT ENGAGEMENT & RFP INTAKE"
              placeholderAr="مثال: التواصل المباشر وتقديم طلبات العروض"
              mode={languageMode}
            />

            <DashboardBilingualField
              label="Page Title"
              valueEn={data.header.titleEn}
              valueAr={data.header.titleAr}
              onChangeEn={(val) => handleChange("header", "titleEn", val)}
              onChangeAr={(val) => handleChange("header", "titleAr", val)}
              placeholderEn="e.g. Contact Us / Submit RFP"
              placeholderAr="مثال: تواصل معنا / تقديم طلب عروض"
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
              placeholderEn="Enter narrative subtitle..."
              placeholderAr="أدخل النص الفرعي..."
              mode={languageMode}
            />

            <div className="space-y-2 pt-2 border-t border-[var(--border-level-1)]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Header Background Media Asset
              </label>
              <AdminMediaPicker
                value={data.header.mediaUrl}
                onChange={(url) => handleChange("header", "mediaUrl", url)}
              />
            </div>
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Direct Corporate Channels & Working Hours"
            description="Official email channels, phone numbers, and operational schedule."
            icon={<Phone className="w-5 h-5 text-emerald-400" />}
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
                  className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
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
                  className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Media & Press Email
                </label>
                <input
                  type="email"
                  value={data.inquiries.press}
                  onChange={(e) => handleChange("inquiries", "press", e.target.value)}
                  placeholder="press@e3.qa"
                  className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Direct Phone Line
                </label>
                <input
                  type="text"
                  value={data.inquiries.phone}
                  onChange={(e) => handleChange("inquiries", "phone", e.target.value)}
                  className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  WhatsApp Business Number
                </label>
                <input
                  type="text"
                  value={data.inquiries.whatsapp}
                  onChange={(e) => handleChange("inquiries", "whatsapp", e.target.value)}
                  className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-level-1)]">
              <DashboardBilingualField
                label="Official Working Hours"
                valueEn={data.inquiries.workingHoursEn}
                valueAr={data.inquiries.workingHoursAr}
                onChangeEn={(val) => handleChange("inquiries", "workingHoursEn", val)}
                onChangeAr={(val) => handleChange("inquiries", "workingHoursAr", val)}
                placeholderEn="e.g. Sunday - Thursday: 8:00 AM - 5:00 PM AST"
                placeholderAr="مثال: الأحد - الخميس: 8:00 صباحاً - 5:00 مساءً"
                mode={languageMode}
              />
            </div>

            <div className="pt-2 border-t border-[var(--border-level-1)] space-y-4">
              <DashboardBilingualField
                label="Headquarters Physical Address"
                valueEn={data.headquarters.addressEn}
                valueAr={data.headquarters.addressAr}
                onChangeEn={(val) => handleChange("headquarters", "addressEn", val)}
                onChangeAr={(val) => handleChange("headquarters", "addressAr", val)}
                placeholderEn="e.g. Doha, State of Qatar"
                placeholderAr="مثال: الدوحة، دولة قطر"
                mode={languageMode}
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={data.headquarters.mapLink}
                  onChange={(e) => handleChange("headquarters", "mapLink", e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </DashboardSectionCard>
        </div>
      )}

      {/* 2. INQUIRY FORM & OPTIONS */}
      {activeSectionId === "form" && (
        <div className="space-y-6">
          {/* Inquiry Types Manager */}
          <DashboardSectionCard
            title="Inquiry Types & Intent Options"
            description="Manage the selectable radio cards shown at the top of the intake form."
            icon={<FileText className="w-5 h-5 text-emerald-400" />}
          >
            <div className="space-y-3">
              {data.formConfig.inquiryTypes.map((type: any, idx: number) => (
                <div
                  key={type.id || idx}
                  className="p-4 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] flex flex-col md:flex-row items-start md:items-center gap-4"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[var(--text-tertiary)] mb-1">
                        Form Value ID
                      </label>
                      <input
                        type="text"
                        value={type.value}
                        onChange={(e) => updateInquiryType(idx, "value", e.target.value)}
                        className="w-full h-9 px-3 bg-[var(--bg-level-2)] border border-[var(--border-level-1)] rounded-xl text-xs font-bold text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[var(--text-tertiary)] mb-1">
                        Label (EN)
                      </label>
                      <input
                        type="text"
                        value={type.labelEn}
                        onChange={(e) => updateInquiryType(idx, "labelEn", e.target.value)}
                        className="w-full h-9 px-3 bg-[var(--bg-level-2)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[var(--text-tertiary)] mb-1">
                        Label (AR)
                      </label>
                      <input
                        type="text"
                        value={type.labelAr}
                        onChange={(e) => updateInquiryType(idx, "labelAr", e.target.value)}
                        dir="rtl"
                        className="w-full h-9 px-3 bg-[var(--bg-level-2)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeInquiryType(idx)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors self-end md:self-center cursor-pointer"
                    title="Remove inquiry option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addInquiryType}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-[var(--border-level-2)] hover:border-emerald-500/50 text-xs font-bold text-[var(--text-secondary)] hover:text-emerald-500 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Inquiry Option</span>
              </button>
            </div>
          </DashboardSectionCard>

          {/* Form Labels & Placeholders */}
          <DashboardSectionCard
            title="Form Labels & Privacy Copy"
            description="Customize input labels, file upload requirements, and legal notice."
            icon={<FileText className="w-5 h-5 text-emerald-400" />}
          >
            <DashboardBilingualField
              label="Submit Button Label"
              valueEn={data.formConfig.labels.submitButtonEn}
              valueAr={data.formConfig.labels.submitButtonAr}
              onChangeEn={(val) => handleFormLabelChange("submitButtonEn", val)}
              onChangeAr={(val) => handleFormLabelChange("submitButtonAr", val)}
              placeholderEn="Submit Inquiry / RFP"
              placeholderAr="إرسال الاستفسار / طلب العروض"
              mode={languageMode}
            />

            <DashboardBilingualField
              label="Upload Help Notice"
              valueEn={data.formConfig.labels.uploadHelpEn}
              valueAr={data.formConfig.labels.uploadHelpAr}
              onChangeEn={(val) => handleFormLabelChange("uploadHelpEn", val)}
              onChangeAr={(val) => handleFormLabelChange("uploadHelpAr", val)}
              mode={languageMode}
            />

            <DashboardBilingualField
              label="Privacy & PDPL Consent Notice"
              type="textarea"
              rows={2}
              valueEn={data.formConfig.labels.privacyNoticeEn}
              valueAr={data.formConfig.labels.privacyNoticeAr}
              onChangeEn={(val) => handleFormLabelChange("privacyNoticeEn", val)}
              onChangeAr={(val) => handleFormLabelChange("privacyNoticeAr", val)}
              mode={languageMode}
            />
          </DashboardSectionCard>

          {/* Success Screen State */}
          <DashboardSectionCard
            title="Post-Submission Success Screen"
            description="Confirmation screen shown to client after submitting their inquiry."
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          >
            <DashboardBilingualField
              label="Success Title"
              valueEn={data.formConfig.successState.titleEn}
              valueAr={data.formConfig.successState.titleAr}
              onChangeEn={(val) => handleSuccessStateChange("titleEn", val)}
              onChangeAr={(val) => handleSuccessStateChange("titleAr", val)}
              placeholderEn="Request Received"
              placeholderAr="تم استلام الطلب بنجاح"
              mode={languageMode}
            />

            <DashboardBilingualField
              label="Success Message / SLA"
              type="textarea"
              rows={2}
              valueEn={data.formConfig.successState.messageEn}
              valueAr={data.formConfig.successState.messageAr}
              onChangeEn={(val) => handleSuccessStateChange("messageEn", val)}
              onChangeAr={(val) => handleSuccessStateChange("messageAr", val)}
              placeholderEn="Our executive enterprise team will review your inquiry..."
              placeholderAr="سيقوم فريقنا بمراجعة استفسارك..."
              mode={languageMode}
            />

            <DashboardBilingualField
              label="Reset Button Label"
              valueEn={data.formConfig.successState.buttonEn}
              valueAr={data.formConfig.successState.buttonAr}
              onChangeEn={(val) => handleSuccessStateChange("buttonEn", val)}
              onChangeAr={(val) => handleSuccessStateChange("buttonAr", val)}
              placeholderEn="Submit Another Inquiry"
              placeholderAr="إرسال استفسار آخر"
              mode={languageMode}
            />
          </DashboardSectionCard>
        </div>
      )}

      {/* 3. GATEWAY CTAS */}
      {activeSectionId === "gateway-ctas" && (
        <div className="space-y-6">
          {/* Careers CTA Card */}
          <DashboardSectionCard
            title="Careers Gateway Card"
            description="Callout card linking candidates to the careers and recruitment portal."
            icon={<Briefcase className="w-5 h-5 text-emerald-400" />}
          >
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="careersCtaEnabled"
                checked={data.careersCta.enabled}
                onChange={(e) => handleChange("careersCta", "enabled", e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
              />
              <label htmlFor="careersCtaEnabled" className="text-xs font-bold text-[var(--text-primary)]">
                Display Careers Gateway Card
              </label>
            </div>

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
                  className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border-level-1)]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Card Background Media
              </label>
              <AdminMediaPicker
                value={data.careersCta.mediaUrl}
                onChange={(url) => handleChange("careersCta", "mediaUrl", url)}
              />
            </div>
          </DashboardSectionCard>

          {/* Feedback CTA Card */}
          <DashboardSectionCard
            title="Client Feedback Gateway Card"
            description="Callout card inviting partners to share feedback or project inquiries."
            icon={<MessageSquare className="w-5 h-5 text-purple-400" />}
          >
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="feedbackCtaEnabled"
                checked={data.feedbackCta.enabled}
                onChange={(e) => handleChange("feedbackCta", "enabled", e.target.checked)}
                className="w-4 h-4 rounded text-purple-500 focus:ring-purple-400"
              />
              <label htmlFor="feedbackCtaEnabled" className="text-xs font-bold text-[var(--text-primary)]">
                Display Client Feedback Card
              </label>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DashboardBilingualField
                label="Button Label"
                valueEn={data.feedbackCta.ctaTextEn}
                valueAr={data.feedbackCta.ctaTextAr}
                onChangeEn={(val) => handleChange("feedbackCta", "ctaTextEn", val)}
                onChangeAr={(val) => handleChange("feedbackCta", "ctaTextAr", val)}
                mode={languageMode}
              />
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={data.feedbackCta.ctaLink}
                  onChange={(e) => handleChange("feedbackCta", "ctaLink", e.target.value)}
                  className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border-level-1)]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Card Background Media
              </label>
              <AdminMediaPicker
                value={data.feedbackCta.mediaUrl}
                onChange={(url) => handleChange("feedbackCta", "mediaUrl", url)}
              />
            </div>
          </DashboardSectionCard>

          {/* FAQ CTA Card */}
          <DashboardSectionCard
            title="B2B FAQs Gateway Card"
            description="Callout card linking partners to the knowledge base and common questions."
            icon={<HelpCircle className="w-5 h-5 text-blue-400" />}
          >
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="faqCtaEnabled"
                checked={data.faqCta.enabled}
                onChange={(e) => handleChange("faqCta", "enabled", e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400"
              />
              <label htmlFor="faqCtaEnabled" className="text-xs font-bold text-[var(--text-primary)]">
                Display B2B FAQs Card
              </label>
            </div>

            <DashboardBilingualField
              label="Card Title"
              valueEn={data.faqCta.titleEn}
              valueAr={data.faqCta.titleAr}
              onChangeEn={(val) => handleChange("faqCta", "titleEn", val)}
              onChangeAr={(val) => handleChange("faqCta", "titleAr", val)}
              mode={languageMode}
            />

            <DashboardBilingualField
              label="Card Description"
              type="textarea"
              rows={2}
              valueEn={data.faqCta.descriptionEn}
              valueAr={data.faqCta.descriptionAr}
              onChangeEn={(val) => handleChange("faqCta", "descriptionEn", val)}
              onChangeAr={(val) => handleChange("faqCta", "descriptionAr", val)}
              mode={languageMode}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DashboardBilingualField
                label="Button Label"
                valueEn={data.faqCta.ctaTextEn}
                valueAr={data.faqCta.ctaTextAr}
                onChangeEn={(val) => handleChange("faqCta", "ctaTextEn", val)}
                onChangeAr={(val) => handleChange("faqCta", "ctaTextAr", val)}
                mode={languageMode}
              />
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={data.faqCta.ctaLink}
                  onChange={(e) => handleChange("faqCta", "ctaLink", e.target.value)}
                  className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border-level-1)]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Card Background Media
              </label>
              <AdminMediaPicker
                value={data.faqCta.mediaUrl}
                onChange={(url) => handleChange("faqCta", "mediaUrl", url)}
              />
            </div>
          </DashboardSectionCard>
        </div>
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
