"use client";

import { useState } from "react";
import {
  Save,
  CheckCircle2,
  Building,
  Mail,
  Share2,
  Key,
  Image as ImageIcon,
  LayoutTemplate,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Phone,
  Clock,
  MapPin,
  Send,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PackageMediaUploader } from "@/components/dashboard/b2c/PackageMediaUploader";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
  EditorSectionItem,
} from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/layout/LocaleProvider";

const SECTIONS: EditorSectionItem[] = [
  { id: "identity", label: "Site Identity", labelAr: "هوية المنصة" },
  { id: "branding", label: "Logos & Favicon", labelAr: "الشعارات والأيقونة" },
  { id: "contact", label: "Contact Details", labelAr: "بيانات التواصل" },
  { id: "social", label: "Social Channels", labelAr: "قنوات التواصل" },
  { id: "tickets", label: "Ticket CTA Bar", labelAr: "شريط حجز التذاكر" },
  { id: "integrations", label: "API Gateways", labelAr: "بوابات الربط البرمجي" },
  { id: "gateway", label: "Gateway Customization", labelAr: "تخصيص بوابة الدخول" },
  { id: "emails", label: "Email Templates", labelAr: "قوالب البريد التلقائية" },
];

export function GeneralSettingsView({ initialSettings }: { initialSettings: Record<string, any> }) {
  const router = useRouter();
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("identity");
  const [toast, setToast] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailMsg, setTestEmailMsg] = useState<{ success: boolean; text: string } | null>(null);

  const [data, setData] = useState({
    siteNameEn: initialSettings.siteNameEn || "Events & Entertainment Enterprises",
    siteNameAr: initialSettings.siteNameAr || "مؤسسات الفعاليات والترفيه",
    contactEmail: initialSettings.contactEmail || "info@eeeqa.com",
    contactPhone: initialSettings.contactPhone || "+974 3048 9955",
    contactWhatsapp: initialSettings.contactWhatsapp || "+974 5113 8418",
    addressEn: initialSettings.addressEn || "Doha, State of Qatar",
    addressAr: initialSettings.addressAr || "الدوحة، دولة قطر",
    workingHours: initialSettings.workingHours || "Sun - Thu: 9:00 AM - 6:00 PM",
    socialInstagram: initialSettings.socialInstagram || "https://www.instagram.com/e3qatar/?hl=en",
    socialTwitter: initialSettings.socialTwitter || "https://x.com/e3QatarOfficial",
    socialLinkedin: initialSettings.socialLinkedin || "https://www.linkedin.com/company/e3qatar",
    socialYoutube: initialSettings.socialYoutube || "https://www.youtube.com/@e3qatar",
    socialSnapchat: initialSettings.socialSnapchat || "https://snapchat.com/e3qatar",
    socialFacebook: initialSettings.socialFacebook || "",
    bookingqubeWebsite: initialSettings.bookingqubeWebsite || "",
    bookingQubeApiKey: initialSettings.bookingQubeApiKey || "",
    mapsApiKey: initialSettings.mapsApiKey || "",
    emailGatewayKey: initialSettings.emailGatewayKey || "",
    lightLogoUrl: initialSettings.lightLogoUrl || "",
    darkLogoUrl: initialSettings.darkLogoUrl || "",
    faviconUrl: initialSettings.faviconUrl || "",
    bookTicketsUrl: initialSettings.bookTicketsUrl || "/b2c/tickets",
    bookTicketsLabelEn: initialSettings.bookTicketsLabelEn || "BOOK TICKETS",
    bookTicketsLabelAr: initialSettings.bookTicketsLabelAr || "احجز التذاكر",
    bookTicketsEnabled: initialSettings.bookTicketsEnabled ?? "true",
    bookTicketsExternal: initialSettings.bookTicketsExternal ?? "false",
    emailSupportGreetingEn:
      initialSettings.emailSupportGreetingEn ||
      "Thank you for reaching out to E3 Qatar Support. Your inquiry has been securely registered in our operations queue and assigned to our guest relations team.",
    emailSupportGreetingAr:
      initialSettings.emailSupportGreetingAr ||
      "شكراً لتواصلك مع فريق الدعم في إي ثري قطر. تم تسجيل طلبك بأمان وتوجيهه إلى فريق خدمة الضيوف.",
    emailResponseTimeEn: initialSettings.emailResponseTimeEn || "Within 24 Business Hours",
    emailResponseTimeAr: initialSettings.emailResponseTimeAr || "خلال 24 ساعة عمل",
    emailB2BMessageEn:
      initialSettings.emailB2BMessageEn ||
      "Thank you for engaging with E3 Qatar. We have received your project inquiry and our Business Development & Event Engineering leadership is reviewing your specifications.",
    emailB2BMessageAr:
      initialSettings.emailB2BMessageAr ||
      "شكراً لاهتمامكم بالتعاون مع إي ثري قطر. لقد استلمنا تفاصيل مشروعكم ويقوم فريق هندسة الفعاليات وتطوير الأعمال بمراجعتها.",
  });

  const handleChange = (field: string, value: string) => {
    setIsDirty(true);
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises = Object.entries(data).map(([key, value]) =>
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value, type: "GENERAL" }),
        })
      );
      await Promise.all(promises);
      setIsDirty(false);
      setLastSaved(new Date());
      setToast(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("e3_general_settings_updated", { detail: data }));
      }
      setTimeout(() => setToast(false), 3000);
      router.refresh();
    } catch (error) {
      console.error("Failed to save settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    setTestEmailMsg(null);
    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setTestEmailMsg({
          success: true,
          text: isAr
            ? `تم إرسال البريد الاختباري بنجاح عبر ${json.provider || "Resend"}.`
            : `Test email dispatched via ${json.provider || "Resend"}.`,
        });
      } else {
        setTestEmailMsg({
          success: false,
          text: json.error || (isAr ? "فشل إرسال البريد الاختباري." : "Failed to dispatch test email."),
        });
      }
    } catch {
      setTestEmailMsg({
        success: false,
        text: isAr ? "خطأ في الاتصال بالخادم." : "Network error connecting to test endpoint.",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      {/* Standard Header */}
      <DashboardPageHeader
        title={isAr ? "الإعدادات العامة للمنصة" : "General Platform Settings"}
        description={
          isAr
            ? "إدارة هوية المنصة العامة، وشعارات العلامة التجارية، وبيانات التواصل، وروابط التواصل الاجتماعي، وبوابات الربط البرمجي."
            : "Manage global site identity, brand logos, contact information, social links, and external API gateways."
        }
        breadcrumbs={[
          { label: isAr ? "الإعدادات" : "Settings", href: "/dashboard/settings/general" },
          { label: isAr ? "الإعدادات العامة" : "General Settings" },
        ]}
        badge={{ label: isAr ? "إعدادات شاملة" : "Platform Global", variant: "cyan" }}
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: isSaving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ الإعدادات" : "Save Settings"),
          onClick: handleSave,
          isLoading: isSaving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      {/* Section Navigator */}
      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      {toast && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center font-bold text-xs shadow-xs">
          <CheckCircle2 className="w-4 h-4 me-2 shrink-0" />
          {isAr ? "تم حفظ كافة الإعدادات العامة بنجاح." : "All platform settings saved successfully."}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column */}
        <div className="space-y-6">
          {/* 1. Site Identity */}
          <div id="identity" className="bg-[var(--surface-default)] rounded-3xl border border-[var(--border-default)] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center border-b border-[var(--border-default)] pb-3">
              <Building className="w-4 h-4 me-2 text-blue-500" />
              <span>{isAr ? "١. هوية المنصة والمسميات" : "1. Site Identity"}</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {isAr ? "اسم الموقع (الإنجليزية)" : "Site Name (English)"}
                </label>
                <input
                  type="text"
                  value={data.siteNameEn}
                  onChange={(e) => handleChange("siteNameEn", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {isAr ? "اسم الموقع (العربية)" : "Site Name (Arabic)"}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.siteNameAr}
                  onChange={(e) => handleChange("siteNameAr", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right"
                />
              </div>
            </div>
          </div>

          {/* 2. Logos & Favicon */}
          <div id="branding" className="bg-[var(--surface-default)] rounded-3xl border border-[var(--border-default)] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center border-b border-[var(--border-default)] pb-3">
              <ImageIcon className="w-4 h-4 me-2 text-purple-500" />
              <span>{isAr ? "٢. الشعارات والأيقونة" : "2. Brand Logos & Favicon"}</span>
            </h3>
            <div className="space-y-4">
              <PackageMediaUploader
                label={isAr ? "شعار النمط الفاتح (Light Mode Logo)" : "Light Mode Logo (Dark Vector/PNG for Light BG)"}
                value={data.lightLogoUrl}
                onChange={(val) => handleChange("lightLogoUrl", val)}
                context="settings/logos"
                recommendedSize="SVG, PNG, or WebP (Recommended height: 60-80px)"
                isAr={isAr}
              />
              <PackageMediaUploader
                label={isAr ? "شعار النمط الداكن (Dark Mode Logo)" : "Dark Mode Logo (White Vector/PNG for Dark BG)"}
                value={data.darkLogoUrl}
                onChange={(val) => handleChange("darkLogoUrl", val)}
                context="settings/logos"
                recommendedSize="SVG, PNG, or WebP (Recommended height: 60-80px)"
                isAr={isAr}
              />
              <PackageMediaUploader
                label={isAr ? "أيقونة المتصفح (Favicon)" : "Browser Favicon"}
                value={data.faviconUrl}
                onChange={(val) => handleChange("faviconUrl", val)}
                context="settings/favicon"
                recommendedSize="ICO, PNG, or SVG (32x32px or 64x64px)"
                isAr={isAr}
              />
            </div>
          </div>

          {/* 3. Contact Details */}
          <div id="contact" className="bg-[var(--surface-default)] rounded-3xl border border-[var(--border-default)] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center border-b border-[var(--border-default)] pb-3">
              <Mail className="w-4 h-4 me-2 text-amber-500" />
              <span>{isAr ? "٣. بيانات التواصل والمقر" : "3. Contact Details"}</span>
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {isAr ? "البريد الإلكتروني العام" : "Public Email"}
                  </label>
                  <input
                    type="email"
                    value={data.contactEmail}
                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {isAr ? "رقم الهاتف العام" : "Public Phone"}
                  </label>
                  <input
                    type="text"
                    value={data.contactPhone}
                    onChange={(e) => handleChange("contactPhone", e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {isAr ? "رقم الواتساب للاستفسارات" : "WhatsApp Inquiries Number"}
                </label>
                <input
                  type="text"
                  value={data.contactWhatsapp}
                  onChange={(e) => handleChange("contactWhatsapp", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  placeholder="+974..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {isAr ? "عنوان المكتب (الإنجليزية)" : "Office Address (English)"}
                </label>
                <textarea
                  rows={2}
                  value={data.addressEn}
                  onChange={(e) => handleChange("addressEn", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {isAr ? "عنوان المكتب (العربية)" : "Office Address (Arabic)"}
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={data.addressAr}
                  onChange={(e) => handleChange("addressAr", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none font-arabic text-right"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {isAr ? "ساعات العمل الرسمية" : "Working Hours"}
                </label>
                <input
                  type="text"
                  value={data.workingHours}
                  onChange={(e) => handleChange("workingHours", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* 4. Social Channels */}
          <div id="social" className="bg-[var(--surface-default)] rounded-3xl border border-[var(--border-default)] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center border-b border-[var(--border-default)] pb-3">
              <Share2 className="w-4 h-4 me-2 text-pink-500" />
              <span>{isAr ? "٤. قنوات التواصل الاجتماعي" : "4. Social Media Links"}</span>
            </h2>
            <div className="space-y-3">
              {[
                { field: "socialInstagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
                { field: "socialTwitter", label: "Twitter / X URL", placeholder: "https://x.com/..." },
                { field: "socialLinkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/company/..." },
                { field: "socialYoutube", label: "YouTube URL", placeholder: "https://youtube.com/@..." },
                { field: "socialSnapchat", label: "Snapchat URL", placeholder: "https://snapchat.com/..." },
                { field: "socialFacebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
                { field: "bookingqubeWebsite", label: "BookingQube Website URL", placeholder: "https://bookingqube.com/..." },
              ].map((item) => (
                <div key={item.field}>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">{item.label}</label>
                  <input
                    type="url"
                    value={(data as any)[item.field]}
                    onChange={(e) => handleChange(item.field, e.target.value)}
                    placeholder={item.placeholder}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 5. Ticket CTA Bar */}
          <div id="tickets" className="bg-[var(--surface-default)] rounded-3xl border border-[var(--border-default)] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center border-b border-[var(--border-default)] pb-3">
              <LayoutTemplate className="w-4 h-4 me-2 text-emerald-500" />
              <span>{isAr ? "٥. شريط زر حجز التذاكر في الهيدر" : "5. Header 'Book Tickets' CTA"}</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr
                ? "تخصيص مسار الرابط، ونص الزر باللغتين، وخيار فتح الرابط في نافذة جديدة لشريط حجز التذاكر العلوي."
                : "Configure the target hyperlink URL, custom button label, and window target for the top header 'Book Tickets' CTA tab."}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {isAr ? "رابط التوجيه (Target Hyperlink URL)" : "Target Hyperlink URL"}
                </label>
                <input
                  type="text"
                  value={data.bookTicketsUrl}
                  onChange={(e) => handleChange("bookTicketsUrl", e.target.value)}
                  placeholder="e.g. /b2c/tickets or https://tickets.e3.qa"
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {isAr ? "نص الزر (الإنجليزية)" : "Label (English)"}
                  </label>
                  <input
                    type="text"
                    value={data.bookTicketsLabelEn}
                    onChange={(e) => handleChange("bookTicketsLabelEn", e.target.value)}
                    placeholder="BOOK TICKETS"
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {isAr ? "نص الزر (العربية)" : "Label (Arabic)"}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={data.bookTicketsLabelAr}
                    onChange={(e) => handleChange("bookTicketsLabelAr", e.target.value)}
                    placeholder="احجز التذاكر"
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={data.bookTicketsEnabled === "true"}
                    onChange={(e) => handleChange("bookTicketsEnabled", e.target.checked ? "true" : "false")}
                    className="rounded border-[var(--border-default)] text-[var(--color-primary)] w-4 h-4 cursor-pointer"
                  />
                  <span>{isAr ? "إظهار زر الحجز في الهيدر" : "Show CTA Button in Header"}</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={data.bookTicketsExternal === "true"}
                    onChange={(e) => handleChange("bookTicketsExternal", e.target.checked ? "true" : "false")}
                    className="rounded border-[var(--border-default)] text-[var(--color-primary)] w-4 h-4 cursor-pointer"
                  />
                  <span>{isAr ? "فتح في علامة تبويب جديدة (_blank)" : "Open in New Tab (_blank)"}</span>
                </label>
              </div>
            </div>
          </div>

          {/* 6. API Gateways */}
          <div id="integrations" className="bg-[var(--surface-default)] rounded-3xl border border-[var(--border-default)] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center border-b border-[var(--border-default)] pb-3">
              <Key className="w-4 h-4 me-2 text-cyan-500" />
              <span>{isAr ? "٦. بوابات الربط والمفاتيح البرمجية" : "6. API Integrations & Gateways"}</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {isAr
                ? "إدارة المفاتيح السرية للبوابات والربط البرمجي. يتم إخفاء القيم السرية الحالية لحمايتها."
                : "Manage server integration API credentials. Stored secrets are write-only and masked for security."}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">BookingQube API Key</label>
                <input
                  type="password"
                  value={data.bookingQubeApiKey}
                  onChange={(e) => handleChange("bookingQubeApiKey", e.target.value)}
                  placeholder={data.bookingQubeApiKey ? "•••••••••••••••• (Leave unchanged to preserve)" : "Enter new API key"}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Maps API Key</label>
                <input
                  type="password"
                  value={data.mapsApiKey}
                  onChange={(e) => handleChange("mapsApiKey", e.target.value)}
                  placeholder={data.mapsApiKey ? "•••••••••••••••• (Leave unchanged to preserve)" : "Enter new API key"}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[var(--text-secondary)]">
                    {isAr ? "مفتاح الربط البرمجي لـ Resend Email" : "Resend Outbound Email API Key"}
                  </label>
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={isTestingEmail}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1"
                  >
                    {isTestingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    <span>{isTestingEmail ? (isAr ? "جارٍ الفحص..." : "Testing...") : (isAr ? "اختبار الإرسال" : "Send Test Email")}</span>
                  </button>
                </div>
                <input
                  type="password"
                  value={data.emailGatewayKey}
                  onChange={(e) => handleChange("emailGatewayKey", e.target.value)}
                  placeholder={data.emailGatewayKey ? "•••••••••••••••• (Leave unchanged to preserve)" : "re_... (Resend API Key)"}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
                {testEmailMsg && (
                  <p className={cn("text-xs mt-1.5 font-medium", testEmailMsg.success ? "text-emerald-500" : "text-rose-500")}>
                    {testEmailMsg.text}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 7. Gateway Customization */}
          <div id="gateway" className="bg-[var(--surface-default)] rounded-3xl border border-[var(--border-default)] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center border-b border-[var(--border-default)] pb-3">
              <LayoutTemplate className="w-4 h-4 me-2 text-indigo-500" />
              <span>{isAr ? "٧. تخصيص بوابة الدخول 50/50" : "7. 50/50 Portal Gateway Customization"}</span>
            </h3>
            <div className="space-y-4">
              <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[var(--text-primary)]">
                      {isAr ? "المحرر المتخصص لبوابة الدخول المركزية" : "Dedicated Gateway Customization CMS"}
                    </p>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {isAr
                        ? "تتم إدارة نصوص البوابة، والوسائط المتعددة 3D/فيديو، والشعارات بحسب النمط (فاتح/داكن)، وتأثيرات التقسيم 50/50 في المحرر المخصص."
                        : "Bilingual portal copy, universal 3D/video/image media holders, theme-specific logos, and 50/50 interactive split physics are managed in the specialized Gateway CMS."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  {isAr ? "الانتقال إلى مدير بوابة الدخول:" : "Access Canonical Gateway Editor:"}
                </span>
                <Link
                  href={`/${locale}/dashboard/settings/gateway`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all"
                >
                  <span>{isAr ? "فتح محرر بوابة الدخول" : "Open Gateway Editor"}</span>
                  <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
                </Link>
              </div>
            </div>
          </div>

          {/* 8. Automated Email Templates */}
          <div id="emails" className="bg-[var(--surface-default)] rounded-3xl border border-[var(--border-default)] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center border-b border-[var(--border-default)] pb-3">
              <Mail className="w-4 h-4 me-2 text-emerald-500" />
              <span>{isAr ? "٨. قوالب البريد ورسائل المتابعة التلقائية" : "8. Automated Email Templates & Messaging"}</span>
            </h3>
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isAr
                  ? "تخصيص نصوص رسائل التأكيد التلقائية المرسلة للعملاء والضيوف عند تقديم طلبات الدعم واستفسارات B2B."
                  : "Customize the automated confirmation copy delivered to guests and corporate clients when submitting support tickets or B2B project briefs."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {isAr ? "رسالة تأكيد الدعم (EN)" : "B2C Support Greeting (EN)"}
                  </label>
                  <textarea
                    rows={3}
                    value={data.emailSupportGreetingEn}
                    onChange={(e) => handleChange("emailSupportGreetingEn", e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] leading-relaxed resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {isAr ? "رسالة تأكيد الدعم (AR)" : "B2C Support Greeting (AR)"}
                  </label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={data.emailSupportGreetingAr}
                    onChange={(e) => handleChange("emailSupportGreetingAr", e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] leading-relaxed resize-none font-arabic text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {isAr ? "وقت الاستجابة المتوقع (EN)" : "Response Target Window (EN)"}
                  </label>
                  <input
                    type="text"
                    value={data.emailResponseTimeEn}
                    onChange={(e) => handleChange("emailResponseTimeEn", e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {isAr ? "وقت الاستجابة المتوقع (AR)" : "Response Target Window (AR)"}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={data.emailResponseTimeAr}
                    onChange={(e) => handleChange("emailResponseTimeAr", e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {isAr ? "رسالة تأكيد مشاريع B2B (EN)" : "B2B Project Brief Confirmation (EN)"}
                  </label>
                  <textarea
                    rows={3}
                    value={data.emailB2BMessageEn}
                    onChange={(e) => handleChange("emailB2BMessageEn", e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] leading-relaxed resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {isAr ? "رسالة تأكيد مشاريع B2B (AR)" : "B2B Project Brief Confirmation (AR)"}
                  </label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={data.emailB2BMessageAr}
                    onChange={(e) => handleChange("emailB2BMessageAr", e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] leading-relaxed resize-none font-arabic text-right"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardStickyActions
        onSave={handleSave}
        isSaving={isSaving}
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
