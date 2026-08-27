"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Building,
  Mail,
  Share2,
  Key,
  LayoutTemplate,
  CheckCircle2,
  Send,
  Loader2,
  ImageIcon,
  Sparkles,
  ArrowRight,
  Download,
  FileText,
} from "lucide-react";
import { AdminMediaPicker } from "@/components/dashboard/ui/AdminMediaPicker";
import { PackageMediaUploader } from "@/components/dashboard/b2c/PackageMediaUploader";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardSectionCard,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
  EditorSectionItem,
} from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/layout/LocaleProvider";

const SECTIONS: EditorSectionItem[] = [
  { id: "identity", label: "1. Site Identity", labelAr: "١. هوية المنصة" },
  { id: "branding", label: "2. Logos & Favicon", labelAr: "٢. الشعارات والأيقونة" },
  { id: "contact", label: "3. Contact Details", labelAr: "٣. بيانات التواصل" },
  { id: "social", label: "4. Social Channels", labelAr: "٤. قنوات التواصل" },
  { id: "tickets", label: "5. Header CTAs & Profile", labelAr: "٥. أشرطة الهيدر والملف التعريفي" },
  { id: "integrations", label: "6. API Gateways", labelAr: "٦. بوابات الربط البرمجي" },
  { id: "gateway", label: "7. Gateway Customization", labelAr: "٧. تخصيص بوابة الدخول" },
  { id: "emails", label: "8. Email Templates", labelAr: "٨. قوالب البريد التلقائية" },
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
    socialYoutube: initialSettings.socialYoutube || "https://youtube.com/@e3qatar",
    socialSnapchat: initialSettings.socialSnapchat || "https://snapchat.com/add/e3qatar",
    socialFacebook: initialSettings.socialFacebook || "https://facebook.com/e3qatar",
    bookingqubeWebsite: initialSettings.bookingqubeWebsite || "https://bookingqube.com",
    bookingQubeApiKey: initialSettings.bookingQubeApiKey || "",
    mapsApiKey: initialSettings.mapsApiKey || "",
    emailGatewayKey: initialSettings.emailGatewayKey || "",
    emailSupportGreetingEn: initialSettings.emailSupportGreetingEn || "Thank you for reaching out to E3 Customer Support. Your inquiry has been received.",
    emailSupportGreetingAr: initialSettings.emailSupportGreetingAr || "شكراً لتواصلكم مع خدمة عملاء إي ثري. لقد تم استلام استفساركم بنجاح.",
    emailResponseTimeEn: initialSettings.emailResponseTimeEn || "Our team typically replies within 2-4 business hours.",
    emailResponseTimeAr: initialSettings.emailResponseTimeAr || "يقوم فريقنا بالرد عادةً خلال ٢ إلى ٤ ساعات عمل.",
    emailB2BMessageEn: initialSettings.emailB2BMessageEn || "Thank you for submitting your project brief. A senior enterprise consultant will review your specifications.",
    emailB2BMessageAr: initialSettings.emailB2BMessageAr || "شكراً لتقديم تفاصيل مشروعكم. سيقوم مستشار أعمال مختص بمراجعة المتطلبات والتواصل معكم.",
    lightLogoUrl: initialSettings.lightLogoUrl || "/logo-dark.png",
    darkLogoUrl: initialSettings.darkLogoUrl || "/logo-white.png",
    faviconUrl: initialSettings.faviconUrl || "/favicon.ico",
    bookTicketsUrl: initialSettings.bookTicketsUrl || "/b2c/tickets",
    bookTicketsLabelEn: initialSettings.bookTicketsLabelEn || "BOOK TICKETS",
    bookTicketsLabelAr: initialSettings.bookTicketsLabelAr || "احجز التذاكر",
    bookTicketsEnabled: initialSettings.bookTicketsEnabled !== undefined ? String(initialSettings.bookTicketsEnabled) : "true",
    bookTicketsExternal: initialSettings.bookTicketsExternal !== undefined ? String(initialSettings.bookTicketsExternal) : "false",
    // B2B Corporate Profile Download CTA
    b2bProfileUrl: initialSettings.b2bProfileUrl || initialSettings.companyProfileUrl || "",
    b2bProfileLabelEn: initialSettings.b2bProfileLabelEn || "DOWNLOAD PROFILE",
    b2bProfileLabelAr: initialSettings.b2bProfileLabelAr || "تحميل الملف التعريفي",
    b2bProfileEnabled: initialSettings.b2bProfileEnabled !== undefined ? String(initialSettings.b2bProfileEnabled) : "true",
    b2bProfileExternal: initialSettings.b2bProfileExternal !== undefined ? String(initialSettings.b2bProfileExternal) : "true",
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
      setTimeout(() => setToast(false), 4000);
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
      const res = await fetch("/api/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: data.contactEmail,
          apiKey: data.emailGatewayKey,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to send test email.");
      }
      setTestEmailMsg({
        success: true,
        text: isAr
          ? `تم إرسال بريد الاختبار بنجاح إلى (${data.contactEmail})!`
          : `Test email sent successfully to (${data.contactEmail})!`,
      });
    } catch (err: any) {
      setTestEmailMsg({
        success: false,
        text: err.message || (isAr ? "فشل إرسال بريد الاختبار. يرجى التحقق من المفتاح." : "Failed to send test email. Verify the API Key."),
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      {/* Page Header */}
      <DashboardPageHeader
        title={isAr ? "الإعدادات العامة للمنصة" : "General Platform Settings"}
        description={
          isAr
            ? "إدارة هوية الموقع، الشعارات، بيانات التواصل، قنوات التواصل الاجتماعي، وروابط البوابات الخارجية."
            : "Manage global site identity, brand logos, contact information, social links, and external API gateways."
        }
        breadcrumbs={[
          { label: isAr ? "لوحة التحكم" : "Dashboard", href: "/dashboard" },
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

      {/* 1. Site Identity */}
      <div id="identity" className={cn("space-y-6", activeSectionId === "identity" ? "block" : "hidden")}>
        <DashboardSectionCard
          title={isAr ? "١. هوية المنصة والمسميات" : "1. Site Identity"}
          description={
            isAr
              ? "الاسم الرسمي المعتمد للمنصة باللغتين العربية والإنجليزية عبر جميع البوابات."
              : "Official approved platform name in English and Arabic rendered across all public headers and footers."
          }
          icon={<Building className="w-5 h-5 text-blue-500" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                {isAr ? "اسم الموقع (الإنجليزية)" : "Site Name (English)"}
              </label>
              <input
                type="text"
                value={data.siteNameEn}
                onChange={(e) => handleChange("siteNameEn", e.target.value)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                {isAr ? "اسم الموقع (العربية)" : "Site Name (Arabic)"}
              </label>
              <input
                type="text"
                dir="rtl"
                value={data.siteNameAr}
                onChange={(e) => handleChange("siteNameAr", e.target.value)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right"
              />
            </div>
          </div>
        </DashboardSectionCard>
      </div>

      {/* 2. Logos & Favicon */}
      <div id="branding" className={cn("space-y-6", activeSectionId === "branding" ? "block" : "hidden")}>
        <DashboardSectionCard
          title={isAr ? "٢. الشعارات والأيقونة" : "2. Brand Logos & Favicon"}
          description={
            isAr
              ? "تحميل شعارات العلامة التجارية المعتمدة للنمطين الفاتح والداكن، وأيقونة المتصفح (Favicon)."
              : "Upload approved vectors and assets for Light Mode, Dark Mode, and browser tab Favicon."
          }
          icon={<ImageIcon className="w-5 h-5 text-purple-500" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PackageMediaUploader
              label={isAr ? "شعار النمط الفاتح (Light Mode Logo)" : "Light Mode Logo"}
              value={data.lightLogoUrl}
              onChange={(val) => handleChange("lightLogoUrl", val)}
              context="settings/logos"
              recommendedSize="SVG or PNG (Recommended height: 60-80px)"
              isAr={isAr}
            />
            <PackageMediaUploader
              label={isAr ? "شعار النمط الداكن (Dark Mode Logo)" : "Dark Mode Logo"}
              value={data.darkLogoUrl}
              onChange={(val) => handleChange("darkLogoUrl", val)}
              context="settings/logos"
              recommendedSize="SVG or PNG (Recommended height: 60-80px)"
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
        </DashboardSectionCard>
      </div>

      {/* 3. Contact Details */}
      <div id="contact" className={cn("space-y-6", activeSectionId === "contact" ? "block" : "hidden")}>
        <DashboardSectionCard
          title={isAr ? "٣. بيانات التواصل والمقر" : "3. Contact Details"}
          description={
            isAr
              ? "قنوات الاتصال الرسمية، العناوين الجغرافية للمقر، وساعات العمل المعروضة على الفوتر وصفحات الاتصال."
              : "Public contact channels, office addresses, and official working hours."
          }
          icon={<Mail className="w-5 h-5 text-amber-500" />}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "البريد الإلكتروني العام" : "Public Email"}
                </label>
                <input
                  type="email"
                  value={data.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "رقم الهاتف العام" : "Public Phone"}
                </label>
                <input
                  type="text"
                  value={data.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "رقم الواتساب للاستفسارات" : "WhatsApp Number"}
                </label>
                <input
                  type="text"
                  value={data.contactWhatsapp}
                  onChange={(e) => handleChange("contactWhatsapp", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  placeholder="+974..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "عنوان المكتب (الإنجليزية)" : "Office Address (English)"}
                </label>
                <textarea
                  rows={2}
                  value={data.addressEn}
                  onChange={(e) => handleChange("addressEn", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "عنوان المكتب (العربية)" : "Office Address (Arabic)"}
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={data.addressAr}
                  onChange={(e) => handleChange("addressAr", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none font-arabic text-right"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                {isAr ? "ساعات العمل الرسمية" : "Working Hours"}
              </label>
              <input
                type="text"
                value={data.workingHours}
                onChange={(e) => handleChange("workingHours", e.target.value)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        </DashboardSectionCard>
      </div>

      {/* 4. Social Channels */}
      <div id="social" className={cn("space-y-6", activeSectionId === "social" ? "block" : "hidden")}>
        <DashboardSectionCard
          title={isAr ? "٤. قنوات التواصل الاجتماعي" : "4. Social Media Links"}
          description={
            isAr
              ? "روابط الحسابات الرسمية على شبكات التواصل الاجتماعي المعروضة في ترويسة وتذييل الموقع."
              : "Hyperlinks for verified brand social network channels in headers and footers."
          }
          icon={<Share2 className="w-5 h-5 text-pink-500" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { field: "socialInstagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
              { field: "socialTwitter", label: "X (Twitter) URL", placeholder: "https://x.com/..." },
              { field: "socialLinkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/company/..." },
              { field: "socialYoutube", label: "YouTube URL", placeholder: "https://youtube.com/@..." },
              { field: "socialSnapchat", label: "Snapchat URL", placeholder: "https://snapchat.com/..." },
              { field: "socialFacebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
              { field: "bookingqubeWebsite", label: "BookingQube Website URL", placeholder: "https://bookingqube.com/..." },
            ].map((item) => (
              <div key={item.field}>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {item.label}
                </label>
                <input
                  type="url"
                  value={(data as any)[item.field]}
                  onChange={(e) => handleChange(item.field, e.target.value)}
                  placeholder={item.placeholder}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>
            ))}
          </div>
        </DashboardSectionCard>
      </div>

      {/* 5. Header CTA & Corporate Profile */}
      <div id="tickets" className={cn("space-y-6", activeSectionId === "tickets" ? "block" : "hidden")}>
        {/* Card A: B2B Corporate Profile Download CTA */}
        <DashboardSectionCard
          title={isAr ? "٥.أ. ملف الشركة التعريفي وزر التحميل في هيدر B2B" : "5.A. B2B Corporate Profile Download & Header CTA"}
          description={
            isAr
              ? "إدارة الملف التعريفي للشركة (Corporate Profile PDF)، رفع ملف محلي أو وضع رابط، وتخصيص نص زر 'تحميل الملف التعريفي' في هيدر صفحات الشركات B2B."
              : "Upload a local PDF/document file or provide a direct link for the Corporate Profile, and configure the 'Download Profile' CTA button displayed in the B2B header."
          }
          icon={<Download className="w-5 h-5 text-sky-500" />}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <AdminMediaPicker
                  value={data.b2bProfileUrl}
                  onChange={(url) => handleChange("b2bProfileUrl", url)}
                  label={isAr ? "رفع ملف البروفايل (PDF/DOC)" : "Upload Profile Document (PDF/DOC)"}
                  accept=".pdf,application/pdf,.doc,.docx"
                />
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                    {isAr ? "رابط ملف البروفايل المباشر أو المسار" : "Corporate Profile Document URL / Asset Link"}
                  </label>
                  <input
                    type="text"
                    value={data.b2bProfileUrl}
                    onChange={(e) => handleChange("b2bProfileUrl", e.target.value)}
                    placeholder="https://.../E3-Corporate-Profile-2026.pdf or /b2b-company-profile.pdf"
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  />
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5">
                    {isAr
                      ? "يمكنك رفع ملف محلي باستخدام الزر أعلاه، أو إدخال رابط مباشر لأي ملف PDF مستضاف."
                      : "Upload a local file using the uploader, or paste a direct URL to any hosted PDF/document."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                      {isAr ? "نص الزر (الإنجليزية)" : "Button Label (English)"}
                    </label>
                    <input
                      type="text"
                      value={data.b2bProfileLabelEn}
                      onChange={(e) => handleChange("b2bProfileLabelEn", e.target.value)}
                      placeholder="DOWNLOAD PROFILE"
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                      {isAr ? "نص الزر (العربية)" : "Button Label (Arabic)"}
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={data.b2bProfileLabelAr}
                      onChange={(e) => handleChange("b2bProfileLabelAr", e.target.value)}
                      placeholder="تحميل الملف التعريفي"
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right font-semibold"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[var(--border-default)]">
                  <label className="flex items-center gap-3 text-xs font-bold text-[var(--text-primary)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.b2bProfileEnabled === "true"}
                      onChange={(e) => handleChange("b2bProfileEnabled", e.target.checked ? "true" : "false")}
                      className="rounded border-[var(--border-default)] text-[var(--color-primary)] w-4 h-4 cursor-pointer"
                    />
                    <span>{isAr ? "إظهار زر تحميل البروفايل في هيدر B2B" : "Show 'Download Profile' CTA in B2B Header"}</span>
                  </label>

                  <label className="flex items-center gap-3 text-xs font-bold text-[var(--text-primary)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.b2bProfileExternal === "true"}
                      onChange={(e) => handleChange("b2bProfileExternal", e.target.checked ? "true" : "false")}
                      className="rounded border-[var(--border-default)] text-[var(--color-primary)] w-4 h-4 cursor-pointer"
                    />
                    <span>{isAr ? "فتح في علامة تبويب جديدة / تنزيل تلقائي" : "Open in New Tab / Trigger Direct Download"}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </DashboardSectionCard>

        {/* Card B: B2C Ticket Booking CTA */}
        <DashboardSectionCard
          title={isAr ? "٥.ب. شريط زر حجز التذاكر في هيدر B2C" : "5.B. B2C Header 'Book Tickets' CTA"}
          description={
            isAr
              ? "تخصيص مسار الرابط، ونص الزر باللغتين، وخيار فتح الرابط في نافذة جديدة لشريط حجز التذاكر العلوي في بوابة الأفراد B2C."
              : "Configure the target hyperlink URL, custom button label, and window target for the top header 'Book Tickets' CTA tab on B2C visitor pages."
          }
          icon={<LayoutTemplate className="w-5 h-5 text-emerald-500" />}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                {isAr ? "رابط التوجيه (Target Hyperlink URL)" : "Target Hyperlink URL"}
              </label>
              <input
                type="text"
                value={data.bookTicketsUrl}
                onChange={(e) => handleChange("bookTicketsUrl", e.target.value)}
                placeholder="e.g. /b2c/tickets or https://tickets.e3.qa"
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "نص الزر (الإنجليزية)" : "Label (English)"}
                </label>
                <input
                  type="text"
                  value={data.bookTicketsLabelEn}
                  onChange={(e) => handleChange("bookTicketsLabelEn", e.target.value)}
                  placeholder="BOOK TICKETS"
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "نص الزر (العربية)" : "Label (Arabic)"}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.bookTicketsLabelAr}
                  onChange={(e) => handleChange("bookTicketsLabelAr", e.target.value)}
                  placeholder="احجز التذاكر"
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[var(--border-default)]">
              <label className="flex items-center gap-3 text-xs font-bold text-[var(--text-primary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={data.bookTicketsEnabled === "true"}
                  onChange={(e) => handleChange("bookTicketsEnabled", e.target.checked ? "true" : "false")}
                  className="rounded border-[var(--border-default)] text-[var(--color-primary)] w-4 h-4 cursor-pointer"
                />
                <span>{isAr ? "إظهار زر الحجز في هيدر B2C" : "Show 'Book Tickets' CTA in B2C Header"}</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-bold text-[var(--text-primary)] cursor-pointer select-none">
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
        </DashboardSectionCard>
      </div>

      {/* 6. API Gateways */}
      <div id="integrations" className={cn("space-y-6", activeSectionId === "integrations" ? "block" : "hidden")}>
        <DashboardSectionCard
          title={isAr ? "٦. بوابات الربط والمفاتيح البرمجية" : "6. API Integrations & Gateways"}
          description={
            isAr
              ? "إدارة المفاتيح السرية للبوابات والربط البرمجي. يتم إخفاء القيم السرية لحمايتها."
              : "Manage server integration API credentials and outbound email providers securely."
          }
          icon={<Key className="w-5 h-5 text-cyan-500" />}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                BookingQube API Key
              </label>
              <input
                type="password"
                value={data.bookingQubeApiKey}
                onChange={(e) => handleChange("bookingQubeApiKey", e.target.value)}
                placeholder={data.bookingQubeApiKey ? "•••••••••••••••• (Leave unchanged to preserve)" : "Enter new API key"}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                Google Maps API Key
              </label>
              <input
                type="password"
                value={data.mapsApiKey}
                onChange={(e) => handleChange("mapsApiKey", e.target.value)}
                placeholder={data.mapsApiKey ? "•••••••••••••••• (Leave unchanged to preserve)" : "Enter new API key"}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {isAr ? "مفتاح الربط البرمجي لـ Resend Email" : "Resend Outbound Email API Key"}
                </label>
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={isTestingEmail}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {isTestingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isTestingEmail ? (isAr ? "جارٍ الفحص..." : "Testing...") : (isAr ? "اختبار الإرسال" : "Send Test Email")}</span>
                </button>
              </div>
              <input
                type="password"
                value={data.emailGatewayKey}
                onChange={(e) => handleChange("emailGatewayKey", e.target.value)}
                placeholder={data.emailGatewayKey ? "•••••••••••••••• (Leave unchanged to preserve)" : "re_... (Resend API Key)"}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
              />
              {testEmailMsg && (
                <p className={cn("text-xs mt-2 font-medium", testEmailMsg.success ? "text-emerald-500" : "text-rose-500")}>
                  {testEmailMsg.text}
                </p>
              )}
            </div>
          </div>
        </DashboardSectionCard>
      </div>

      {/* 7. Gateway Customization */}
      <div id="gateway" className={cn("space-y-6", activeSectionId === "gateway" ? "block" : "hidden")}>
        <DashboardSectionCard
          title={isAr ? "٧. تخصيص بوابة الدخول 50/50" : "7. 50/50 Portal Gateway Customization"}
          description={
            isAr
              ? "تخصيص البوابة الرئيسية الثنائية الفاصلة بين عالم B2C للفعاليات وعالم B2B للشركات."
              : "Manage copy, universal media, theme-specific logos, and split physics for the landing portal."
          }
          icon={<LayoutTemplate className="w-5 h-5 text-indigo-500" />}
        >
          <div className="space-y-6">
            <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-5">
              <div className="flex items-start gap-3.5">
                <Sparkles className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1.5">
                  <p className="font-bold text-[var(--text-primary)] text-sm">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer"
              >
                <span>{isAr ? "فتح محرر بوابة الدخول" : "Open Gateway Editor"}</span>
                <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
              </Link>
            </div>
          </div>
        </DashboardSectionCard>
      </div>

      {/* 8. Automated Email Templates */}
      <div id="emails" className={cn("space-y-6", activeSectionId === "emails" ? "block" : "hidden")}>
        <DashboardSectionCard
          title={isAr ? "٨. قوالب البريد ورسائل المتابعة التلقائية" : "8. Automated Email Templates & Messaging"}
          description={
            isAr
              ? "تخصيص نصوص رسائل التأكيد التلقائية المرسلة للعملاء والضيوف عند تقديم طلبات الدعم واستفسارات B2B."
              : "Customize the automated confirmation copy delivered to guests and corporate clients upon ticket/inquiry submission."
          }
          icon={<Mail className="w-5 h-5 text-emerald-500" />}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "رسالة تأكيد الدعم (EN)" : "B2C Support Greeting (EN)"}
                </label>
                <textarea
                  rows={3}
                  value={data.emailSupportGreetingEn}
                  onChange={(e) => handleChange("emailSupportGreetingEn", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] leading-relaxed resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "رسالة تأكيد الدعم (AR)" : "B2C Support Greeting (AR)"}
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={data.emailSupportGreetingAr}
                  onChange={(e) => handleChange("emailSupportGreetingAr", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] leading-relaxed resize-none font-arabic text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "وقت الاستجابة المتوقع (EN)" : "Response Target Window (EN)"}
                </label>
                <input
                  type="text"
                  value={data.emailResponseTimeEn}
                  onChange={(e) => handleChange("emailResponseTimeEn", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "وقت الاستجابة المتوقع (AR)" : "Response Target Window (AR)"}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.emailResponseTimeAr}
                  onChange={(e) => handleChange("emailResponseTimeAr", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "رسالة تأكيد مشاريع B2B (EN)" : "B2B Project Brief Confirmation (EN)"}
                </label>
                <textarea
                  rows={3}
                  value={data.emailB2BMessageEn}
                  onChange={(e) => handleChange("emailB2BMessageEn", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] leading-relaxed resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "رسالة تأكيد مشاريع B2B (AR)" : "B2B Project Brief Confirmation (AR)"}
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={data.emailB2BMessageAr}
                  onChange={(e) => handleChange("emailB2BMessageAr", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] leading-relaxed resize-none font-arabic text-right"
                />
              </div>
            </div>
          </div>
        </DashboardSectionCard>
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
