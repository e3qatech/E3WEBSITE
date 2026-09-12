"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Mail,
  Smartphone,
  Monitor,
  Send,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Headphones,
  Building2,
  Tag,
  Copy,
  Check,
  Eye,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionCard,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
} from "@/components/dashboard/ui";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { useLocale } from "@/components/layout/LocaleProvider";
import { cn } from "@/lib/utils";
import {
  EmailTemplateConfig,
  DEFAULT_EMAIL_TEMPLATE_CONFIG,
  replacePlaceholders,
} from "@/lib/email-templates";
import {
  renderApplicantConfirmationEmail,
  renderHRApplicationNotificationEmail,
  renderUserSupportTicketConfirmationEmail,
  renderUserB2BConfirmationEmail,
} from "@/lib/email";

interface EmailTemplatesManagerViewProps {
  initialConfig: EmailTemplateConfig;
}

type TabType = "careers" | "support" | "b2b" | "branding";
type PreviewType = "applicantConfirmation" | "hrNotification" | "supportConfirmation" | "b2bInquiryConfirmation";

export function EmailTemplatesManagerView({ initialConfig }: EmailTemplatesManagerViewProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const { toast } = useToast();

  const [config, setConfig] = useState<EmailTemplateConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<TabType>("careers");
  const [previewTemplate, setPreviewTemplate] = useState<PreviewType>("applicantConfirmation");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Test email state
  const [isTestingModalOpen, setIsTestingModalOpen] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

  const handleUpdate = (section: keyof EmailTemplateConfig, key: string, value: string) => {
    setIsDirty(true);
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value,
      },
    }));
  };

  const handleResetToDefaults = () => {
    if (confirm(isAr ? "هل أنت متأكد من استعادة كافة القوالب الافتراضية للنظام؟" : "Are you sure you want to reset all email templates to standard defaults?")) {
      setConfig(DEFAULT_EMAIL_TEMPLATE_CONFIG);
      setIsDirty(true);
      toast(
        isAr ? "تم تحميل القوالب الافتراضية. انقر حفظ للتطبيق." : "Default templates loaded. Click Save to persist.",
        "info"
      );
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setIsDirty(false);
      setLastSaved(new Date());
      toast(
        isAr ? "تم تحديث كافة قوالب وردود البريد الإلكتروني بنجاح." : "All email reply templates updated successfully.",
        "success"
      );
      router.refresh();
    } catch (err: any) {
      toast(
        err.message || (isAr ? "خطأ في الحفظ" : "Save Failed"),
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes("@")) {
      alert(isAr ? "يرجى كتابة بريد إلكتروني صحيح." : "Please enter a valid recipient email.");
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await fetch("/api/settings/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testDispatch: true,
          recipientEmail: testEmailRecipient,
          templateKey: previewTemplate,
          previewConfig: config,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send test email");
      }

      toast(
        isAr ? `تم إرسال معاينة القالب إلى ${testEmailRecipient}` : `Preview sent successfully to ${testEmailRecipient}`,
        "success"
      );
      setIsTestingModalOpen(false);
    } catch (err: any) {
      toast(
        err.message || (isAr ? "فشل الإرسال" : "Dispatch Failed"),
        "error"
      );
    } finally {
      setIsSendingTest(false);
    }
  };

  const copyVariable = (token: string) => {
    navigator.clipboard?.writeText(token);
    setCopiedVariable(token);
    setTimeout(() => setCopiedVariable(null), 2000);
  };

  // Generate live preview HTML based on active previewTemplate
  const livePreviewHtml = useMemo(() => {
    switch (previewTemplate) {
      case "applicantConfirmation":
        return renderApplicantConfirmationEmail({
          name: isAr ? "ابوبكر الحاج" : "Abubaker Al-Haj",
          jobTitle: "Play Attendant (Operations)",
          applicationId: "E3-APP-2026-DEMO",
          config,
        });
      case "hrNotification":
        return renderHRApplicationNotificationEmail({
          name: isAr ? "ابوبكر الحاج" : "Abubaker Al-Haj",
          email: "abubakeralhag375@gmail.com",
          phone: "+974 5574 1543",
          jobTitle: "Play Attendant (Operations)",
          department: "Operations & Attraction Services",
          applicationId: "E3-APP-2026-DEMO",
          cvUrl: "https://e3.qa/uploads/resumes/demo_cv.pdf",
          config,
        });
      case "supportConfirmation":
        return renderUserSupportTicketConfirmationEmail({
          name: isAr ? "سارة الكواري" : "Sarah Al-Kuwari",
          ticketId: "E3-SUP-8ZGI-408W",
          config,
        });
      case "b2bInquiryConfirmation":
        return renderUserB2BConfirmationEmail({
          name: isAr ? "محمد السليطي" : "Mohammed Al-Sulaiti",
          company: isAr ? "مجموعة قطر للمشاريع الترفيهية" : "Qatar Luxury Events Corp",
          leadId: "E3-B2B-LEAD-991",
          config,
        });
      default:
        return "";
    }
  }, [previewTemplate, config, isAr]);

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      {/* Page Header */}
      <DashboardPageHeader
        title={isAr ? "إدارة قوالب وردود البريد الإلكتروني" : "Email Replies & Templates Engine"}
        description={
          isAr
            ? "تعديل وتخصيص كافة رسائل الرد التلقائية للمتقدمين للوظائف، تنبيهات الموارد البشرية، تذاكر الدعم، وعروض B2B مع المعاينة الفورية."
            : "Live editor for automated applicant confirmations, HR recruitment alerts, customer support acknowledgments, and global email footers."
        }
        breadcrumbs={[
          { label: isAr ? "لوحة التحكم" : "Dashboard", href: "/dashboard" },
          { label: isAr ? "الإعدادات" : "Settings", href: "/dashboard/settings/general" },
          { label: isAr ? "قوالب البريد" : "Email Templates" },
        ]}
        badge={{ label: isAr ? "محرك الردود الذكية" : "Auto-Reply Engine", variant: "purple" }}
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: isSaving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ التعديلات" : "Save Templates"),
          onClick: handleSave,
          isLoading: isSaving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      {/* Tab Navigation & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2 rounded-2xl bg-[var(--surface-hover)]/40 border border-[var(--border-level-1)] shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("careers");
              setPreviewTemplate("applicantConfirmation");
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "careers"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            )}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isAr ? "الوظائف والموارد البشرية" : "Careers & Job Applications"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("support");
              setPreviewTemplate("supportConfirmation");
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "support"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            )}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>{isAr ? "خدمة العملاء والدعم" : "B2C Customer Support"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("b2b");
              setPreviewTemplate("b2bInquiryConfirmation");
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "b2b"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isAr ? "مشاريع B2B والشركات" : "B2B Project Inquiries"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("branding")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "branding"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            )}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{isAr ? "الهوية والتذييل العام" : "Branding & Legal Footer"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTestingModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isAr ? "إرسال بريد تجريبي" : "Send Test Email"}</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
            title={isAr ? "استعادة الإعدادات الافتراضية" : "Reset to Defaults"}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? "الافتراضي" : "Reset"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Editor + Right Live Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
        {/* Editor Form Columns (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          {/* TAB 1: CAREERS */}
          {activeTab === "careers" && (
            <div className="space-y-6">
              {/* Variable Helper Bar */}
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs">
                <div className="flex items-center gap-2 font-bold text-[var(--text-primary)] mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>{isAr ? "المتغيرات الذكية المتاحة (انقر للنسخ):" : "Available Dynamic Tags (Click to copy):"}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["{name}", "{jobTitle}", "{department}", "{applicationId}", "{referenceCode}"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => copyVariable(tag)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-zinc-900 border border-purple-400/30 text-purple-700 dark:text-purple-300 font-mono text-[11px] font-bold hover:border-purple-500 transition-all cursor-pointer"
                    >
                      {copiedVariable === tag ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-purple-400" />}
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-section A: Candidate Auto-Acknowledgment Reply */}
              <DashboardSectionCard
                title={isAr ? "١. رسالة تأكيد استلام الطلب للمترشح (Auto-Reply)" : "1. Candidate Application Acknowledgment (Auto-Reply)"}
                description={
                  isAr
                    ? "الرسالة التي يتلقاها مقدم الطلب فور إرسال سيرته الذاتية على الموقع."
                    : "The confirmation email automatically dispatched to applicants upon form submission."
                }
                icon={<Mail className="w-5 h-5 text-purple-500" />}
              >
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                      {isAr ? "عنوان الرسالة (Email Subject)" : "Email Subject Line"}
                    </label>
                    <input
                      type="text"
                      value={config.applicantConfirmation.subject}
                      onChange={(e) => handleUpdate("applicantConfirmation", "subject", e.target.value)}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "عنوان الترويسة الرئيسية" : "Main Heading (H2)"}
                      </label>
                      <input
                        type="text"
                        value={config.applicantConfirmation.heading}
                        onChange={(e) => handleUpdate("applicantConfirmation", "heading", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "صيغة الترحيب" : "Greeting Formula"}
                      </label>
                      <input
                        type="text"
                        value={config.applicantConfirmation.greeting}
                        onChange={(e) => handleUpdate("applicantConfirmation", "greeting", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                      {isAr ? "نص رسالة التأكيد الأساسي" : "Confirmation Body Paragraph"}
                    </label>
                    <textarea
                      rows={3}
                      value={config.applicantConfirmation.body}
                      onChange={(e) => handleUpdate("applicantConfirmation", "body", e.target.value)}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "تسمية صندوق رقم المرجع" : "Reference Box Label"}
                      </label>
                      <input
                        type="text"
                        value={config.applicantConfirmation.referenceLabel}
                        onChange={(e) => handleUpdate("applicantConfirmation", "referenceLabel", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "ملاحظة توجيه رقم المرجع" : "Reference Box Instruction Hint"}
                      </label>
                      <input
                        type="text"
                        value={config.applicantConfirmation.referenceHint}
                        onChange={(e) => handleUpdate("applicantConfirmation", "referenceHint", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-3">
                    <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-500" />
                      <span>{isAr ? "بطاقة الخطوات التالية (Next Steps Card)" : "Next Steps Guidance Card"}</span>
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "عنوان البطاقة" : "Card Title"}
                      </label>
                      <input
                        type="text"
                        value={config.applicantConfirmation.nextStepsTitle}
                        onChange={(e) => handleUpdate("applicantConfirmation", "nextStepsTitle", e.target.value)}
                        className="w-full bg-[var(--surface-base)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "نص الخطوات التالية" : "Card Content / Policy"}
                      </label>
                      <textarea
                        rows={2}
                        value={config.applicantConfirmation.nextStepsBody}
                        onChange={(e) => handleUpdate("applicantConfirmation", "nextStepsBody", e.target.value)}
                        className="w-full bg-[var(--surface-base)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </DashboardSectionCard>

              {/* Sub-section B: Internal HR Alert */}
              <DashboardSectionCard
                title={isAr ? "٢. تنبيه الموارد البشرية والتوظيف الداخلي (HR Notification)" : "2. Internal HR Notification Alert"}
                description={
                  isAr
                    ? "الرسالة التي يتلقاها فريق التوظيف في E3 عند تقديم أي مرشح لسيرته الذاتية."
                    : "The internal email dispatched to the HR queue whenever a new application is submitted."
                }
                icon={<Briefcase className="w-5 h-5 text-indigo-500" />}
              >
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                      {isAr ? "عنوان رسالة HR" : "HR Alert Subject Line"}
                    </label>
                    <input
                      type="text"
                      value={config.hrNotification.subject}
                      onChange={(e) => handleUpdate("hrNotification", "subject", e.target.value)}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "ترويسة إشعار HR" : "HR Heading"}
                      </label>
                      <input
                        type="text"
                        value={config.hrNotification.heading}
                        onChange={(e) => handleUpdate("hrNotification", "heading", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "النص التوضيحي الفرعي" : "HR Subtitle"}
                      </label>
                      <input
                        type="text"
                        value={config.hrNotification.subtitle}
                        onChange={(e) => handleUpdate("hrNotification", "subtitle", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </DashboardSectionCard>
            </div>
          )}

          {/* TAB 2: SUPPORT */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <DashboardSectionCard
                title={isAr ? "تأكيد طلبات الدعم الفني B2C (Customer Support Reply)" : "B2C Customer Support Confirmation"}
                description={
                  isAr
                    ? "الرسالة التلقائية المرسلة للعملاء والضيوف عند فتح تذكرة دعم أو تقديم استفسار عام."
                    : "The automated reply delivered to guests upon submitting a customer support ticket."
                }
                icon={<Headphones className="w-5 h-5 text-blue-500" />}
              >
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                      {isAr ? "عنوان الرسالة (Subject)" : "Subject Line"}
                    </label>
                    <input
                      type="text"
                      value={config.supportConfirmation.subject}
                      onChange={(e) => handleUpdate("supportConfirmation", "subject", e.target.value)}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "الترويسة الرئيسية" : "Main Heading"}
                      </label>
                      <input
                        type="text"
                        value={config.supportConfirmation.heading}
                        onChange={(e) => handleUpdate("supportConfirmation", "heading", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "صيغة الترحيب" : "Greeting"}
                      </label>
                      <input
                        type="text"
                        value={config.supportConfirmation.greeting}
                        onChange={(e) => handleUpdate("supportConfirmation", "greeting", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                      {isAr ? "نص التأكيد" : "Body Text"}
                    </label>
                    <textarea
                      rows={3}
                      value={config.supportConfirmation.body}
                      onChange={(e) => handleUpdate("supportConfirmation", "body", e.target.value)}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "نافذة وقت الاستجابة" : "Target Response Window"}
                      </label>
                      <input
                        type="text"
                        value={config.supportConfirmation.targetWindowBadge}
                        onChange={(e) => handleUpdate("supportConfirmation", "targetWindowBadge", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "إرشادات الرد المباشر" : "Reply Guidance"}
                      </label>
                      <input
                        type="text"
                        value={config.supportConfirmation.replyGuidance}
                        onChange={(e) => handleUpdate("supportConfirmation", "replyGuidance", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </DashboardSectionCard>
            </div>
          )}

          {/* TAB 3: B2B */}
          {activeTab === "b2b" && (
            <div className="space-y-6">
              <DashboardSectionCard
                title={isAr ? "تأكيد استفسارات ومشاريع B2B (Corporate Inquiry Confirmation)" : "B2B Project Inquiry Confirmation"}
                description={
                  isAr
                    ? "الرسالة الموجهة لقيادات الشركات والعملاء التجاريين فور تقديم طلب مشروع أو كراسة شروط (RFP)."
                    : "The automated executive confirmation delivered to enterprise partners upon lead creation."
                }
                icon={<Building2 className="w-5 h-5 text-emerald-500" />}
              >
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                      {isAr ? "عنوان الرسالة (Subject)" : "Subject Line"}
                    </label>
                    <input
                      type="text"
                      value={config.b2bInquiryConfirmation.subject}
                      onChange={(e) => handleUpdate("b2bInquiryConfirmation", "subject", e.target.value)}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "الترويسة التنفيذية" : "Heading"}
                      </label>
                      <input
                        type="text"
                        value={config.b2bInquiryConfirmation.heading}
                        onChange={(e) => handleUpdate("b2bInquiryConfirmation", "heading", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "صيغة المخاطبة" : "Greeting"}
                      </label>
                      <input
                        type="text"
                        value={config.b2bInquiryConfirmation.greeting}
                        onChange={(e) => handleUpdate("b2bInquiryConfirmation", "greeting", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                      {isAr ? "نص رسالة المشروع" : "Body Text"}
                    </label>
                    <textarea
                      rows={3}
                      value={config.b2bInquiryConfirmation.body}
                      onChange={(e) => handleUpdate("b2bInquiryConfirmation", "body", e.target.value)}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "شارة متابعة الإدارة" : "Executive Follow-Up Badge"}
                      </label>
                      <input
                        type="text"
                        value={config.b2bInquiryConfirmation.followUpBadge}
                        onChange={(e) => handleUpdate("b2bInquiryConfirmation", "followUpBadge", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "تفاصيل المراجعة الهندسية" : "Follow-Up Timeline Note"}
                      </label>
                      <input
                        type="text"
                        value={config.b2bInquiryConfirmation.followUpDescription}
                        onChange={(e) => handleUpdate("b2bInquiryConfirmation", "followUpDescription", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </DashboardSectionCard>
            </div>
          )}

          {/* TAB 4: BRANDING & LEGAL FOOTER */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <DashboardSectionCard
                title={isAr ? "هوية البريد والتذييل القانوني المعتمد" : "Global Brand Identity & Legal Footer"}
                description={
                  isAr
                    ? "تحديد اسم الشركة، الموقع الرسمي المعتمد (www.e3.qa)، أرقام الهواتف، وإشعار قانون حماية البيانات الشخصية القطري."
                    : "Official company name, canonical website link (www.e3.qa), phone, and Qatar PDPL legal compliance notice."
                }
                icon={<Tag className="w-5 h-5 text-amber-500" />}
              >
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "اسم الشعار في الترويسة" : "Header Brand Logo Text"}
                      </label>
                      <input
                        type="text"
                        value={config.branding.headerLogoText}
                        onChange={(e) => handleUpdate("branding", "headerLogoText", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-bold tracking-wider"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "الشعار النصي (Tagline)" : "Header Tagline"}
                      </label>
                      <input
                        type="text"
                        value={config.branding.headerTagline}
                        onChange={(e) => handleUpdate("branding", "headerTagline", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "اسم الشركة في حقوق النشر" : "Company Legal Name"}
                      </label>
                      <input
                        type="text"
                        value={config.footer.companyName}
                        onChange={(e) => handleUpdate("footer", "companyName", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "رقم الهاتف المعتمد للتواصل" : "Telephone / Contact Phone"}
                      </label>
                      <input
                        type="text"
                        value={config.footer.phone}
                        onChange={(e) => handleUpdate("footer", "phone", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "نص رابط الموقع المعروض" : "Website Display Text"}
                      </label>
                      <input
                        type="text"
                        value={config.footer.websiteDisplay}
                        onChange={(e) => handleUpdate("footer", "websiteDisplay", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                        {isAr ? "رابط الموقع الفعلي (URL)" : "Canonical Website URL"}
                      </label>
                      <input
                        type="url"
                        value={config.footer.websiteUrl}
                        onChange={(e) => handleUpdate("footer", "websiteUrl", e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                      {isAr ? "الموقع الجغرافي / المقر" : "Location"}
                    </label>
                    <input
                      type="text"
                      value={config.footer.location}
                      onChange={(e) => handleUpdate("footer", "location", e.target.value)}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                      {isAr ? "إشعار الامتثال لقانون حماية البيانات القطري (PDPL)" : "Qatar PDPL Compliance Statement"}
                    </label>
                    <textarea
                      rows={2}
                      value={config.footer.complianceNotice}
                      onChange={(e) => handleUpdate("footer", "complianceNotice", e.target.value)}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </DashboardSectionCard>
            </div>
          )}
        </div>

        {/* Live Preview Panel (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="sticky top-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 space-y-4 shadow-sm">
            {/* Preview Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  {isAr ? "معاينة حية للقالب" : "Live Rendered Preview"}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors cursor-pointer",
                    previewDevice === "desktop"
                      ? "bg-white dark:bg-zinc-700 text-purple-600 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  )}
                  title={isAr ? "سطح المكتب" : "Desktop"}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors cursor-pointer",
                    previewDevice === "mobile"
                      ? "bg-white dark:bg-zinc-700 text-purple-600 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  )}
                  title={isAr ? "الهاتف" : "Mobile"}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Template Selector Dropdown for Preview */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                {isAr ? "اختر القالب للمعاينة:" : "Select Template to Preview:"}
              </label>
              <select
                value={previewTemplate}
                onChange={(e) => setPreviewTemplate(e.target.value as PreviewType)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="applicantConfirmation">
                  {isAr ? "تأكيد طلب التوظيف (للمترشح)" : "Job Application Confirmation (Applicant)"}
                </option>
                <option value="hrNotification">
                  {isAr ? "تنبيه طلب توظيف جديد (للموارد البشرية)" : "New Career Application Alert (HR)"}
                </option>
                <option value="supportConfirmation">
                  {isAr ? "تأكيد استلام تذكرة الدعم (B2C)" : "Support Ticket Acknowledgment (B2C)"}
                </option>
                <option value="b2bInquiryConfirmation">
                  {isAr ? "تأكيد استفسار مشروع B2B (لعميل الشركة)" : "B2B Project Inquiry Received (Client)"}
                </option>
              </select>
            </div>

            {/* Simulated Email Canvas */}
            <div className="flex justify-center bg-zinc-950/90 p-3 rounded-xl border border-zinc-800 overflow-hidden">
              <div
                className={cn(
                  "transition-all duration-300 w-full overflow-hidden rounded-xl border border-zinc-800 shadow-2xl bg-[#050608]",
                  previewDevice === "mobile" ? "max-w-[340px]" : "max-w-full"
                )}
                style={{ height: "620px" }}
              >
                <iframe
                  title="Live Email Preview"
                  srcDoc={livePreviewHtml}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
              <span>{isAr ? "البيانات في المعاينة استرشادية" : "Mock data substituted in preview"}</span>
              <button
                type="button"
                onClick={() => setIsTestingModalOpen(true)}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
              >
                {isAr ? "إرسال هذا القالب لإيميلي ←" : "Send this to my inbox →"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <DashboardStickyActions
        onSave={handleSave}
        isSaving={isSaving}
        isUnsaved={isDirty}
        onDiscard={() => {
          if (confirm(isAr ? "تجاهل التغييرات غير المحفوظة؟" : "Discard unsaved changes?")) {
            window.location.reload();
          }
        }}
      />

      {/* Test Email Modal */}
      {isTestingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {isAr ? "إرسال بريد تجريبي مباشر" : "Send Diagnostic Test Email"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTestingModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {isAr
                ? "سيتم إرسال القالب المحدد حالياً بالكامل مع كافة التعديلات المدخلة إلى العنوان المحدد للتحقق من العرض في بريدك."
                : "The currently previewed template will be dispatched with your live modifications to verify formatting in your real inbox."}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                {isAr ? "البريد الإلكتروني المستلم *" : "Recipient Email Address *"}
              </label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsTestingModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                disabled={isSendingTest}
                onClick={handleSendTestEmail}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingTest ? (isAr ? "جاري الإرسال..." : "Sending...") : (isAr ? "إرسال الآن" : "Dispatch Test")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
}
