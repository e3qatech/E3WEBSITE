"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Building2,
  Ticket,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  ShieldCheck,
  Layers,
} from "lucide-react";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardSectionCard,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
  EditorSectionItem,
} from "@/components/dashboard/ui";
import { PackageMediaUploader } from "@/components/dashboard/b2c/PackageMediaUploader";
import { useLocale } from "@/components/layout/LocaleProvider";
import { cn } from "@/lib/utils";

const SECTIONS: EditorSectionItem[] = [
  { id: "b2b", label: "1. Global B2B Footer", labelAr: "١. تذييل صفحات B2B للشركات", icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: "b2c", label: "2. Global B2C Footer", labelAr: "٢. تذييل صفحات B2C للفعاليات", icon: <Ticket className="w-3.5 h-3.5" /> },
  { id: "legal", label: "3. Legal & PDPL Compliance", labelAr: "٣. البيانات القانونية والخصوصية", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
];

export function FooterSettingsView({ initialSettings }: { initialSettings: Record<string, any> }) {
  const router = useRouter();
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const [activeSectionId, setActiveSectionId] = useState("b2b");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [toast, setToast] = useState(false);

  const [data, setData] = useState({
    // B2B Global Footer Config
    b2bFooterCtaTitleEn: initialSettings.b2bFooterCtaTitleEn || "Ready to Engineer Your Next Landmark Experience?",
    b2bFooterCtaTitleAr: initialSettings.b2bFooterCtaTitleAr || "جاهز لتنفيذ مشروعك الترفيهي القادم في قطر؟",
    b2bFooterCtaSubtitleEn: initialSettings.b2bFooterCtaSubtitleEn || "Partner with Qatar's premier turnkey attraction engineering, spatial production, and kinetic staging specialists.",
    b2bFooterCtaSubtitleAr: initialSettings.b2bFooterCtaSubtitleAr || "تواصل مع خبراء إي ثري لبناء الوجهات الترفيهية الكبرى، الفعاليات الحية، والإنتاج الفني المتكامل.",
    b2bFooterCtaBtnLabelEn: initialSettings.b2bFooterCtaBtnLabelEn || "Submit Project RFP",
    b2bFooterCtaBtnLabelAr: initialSettings.b2bFooterCtaBtnLabelAr || "طلب العروض والمشاريع (RFP)",
    b2bFooterCtaBtnUrl: initialSettings.b2bFooterCtaBtnUrl || "/b2b/contact",
    b2bCrNumber: initialSettings.b2bCrNumber || "184920 / 2026",

    // B2C Global Footer Config
    b2cFooterCtaTitleEn: initialSettings.b2cFooterCtaTitleEn || "Unforgettable Immersive Entertainment in Qatar",
    b2cFooterCtaTitleAr: initialSettings.b2cFooterCtaTitleAr || "تجارب ترفيهية غامرة لا تُنسى في قطر",
    b2cFooterCtaSubtitleEn: initialSettings.b2cFooterCtaSubtitleEn || "Explore gravity-defying rides, spatial projection realms, interactive family attractions, and exclusive VIP passes.",
    b2cFooterCtaSubtitleAr: initialSettings.b2cFooterCtaSubtitleAr || "استكشف أحدث مدن الألعاب الفضائية، والعروض الترفيهية الحية، وباقات التذاكر الحصرية لك ولعائلتك.",
    bookTicketsUrl: initialSettings.bookTicketsUrl || "/b2c/tickets",
    bookTicketsLabelEn: initialSettings.bookTicketsLabelEn || "BOOK TICKETS NOW",
    bookTicketsLabelAr: initialSettings.bookTicketsLabelAr || "احجز التذاكر الآن",
    footerMediaUrl: initialSettings.footerMediaUrl || "",
    footerMediaType: initialSettings.footerMediaType || "IMAGE",
    footerPosterUrl: initialSettings.footerPosterUrl || "",

    // Shared Legal
    footerDescriptionEn: initialSettings.footerDescriptionEn || "Pioneering the future of events and entertainment in Qatar.",
    footerDescriptionAr: initialSettings.footerDescriptionAr || "ريادة مستقبل الفعاليات والترفيه في قطر.",
  });

  const handleChange = (field: string, value: any) => {
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
      console.error("Failed to save footer settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      <DashboardPageHeader
        title={isAr ? "إدارة تذييل الصفحات العام (B2B & B2C)" : "Global Footers Configuration"}
        description={
          isAr
            ? "تخصيص تذييل صفحات الشركات (B2B) وتذييل صفحات الفعاليات والزوار (B2C) بشكل منفصل ومخصص."
            : "Customize dedicated global footer sections, CTA banners, legal registrations, and links for B2B and B2C portals."
        }
        breadcrumbs={[
          { label: isAr ? "لوحة التحكم" : "Dashboard", href: "/dashboard" },
          { label: isAr ? "الإعدادات" : "Settings", href: "/dashboard/settings/general" },
          { label: isAr ? "تذييل الصفحات العام" : "Global Footers" },
        ]}
        badge={{ label: isAr ? "تذييل مزدوج" : "Dual Footers", variant: "purple" }}
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: isSaving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ التذييل" : "Save Footers"),
          onClick: handleSave,
          isLoading: isSaving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      {toast && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center font-bold text-xs shadow-xs">
          <CheckCircle2 className="w-4 h-4 me-2 shrink-0" />
          {isAr ? "تم حفظ إعدادات التذييل العام بنجاح." : "Global footer settings saved successfully."}
        </div>
      )}

      {/* 1. Global B2B Footer */}
      <div id="b2b" className={cn("space-y-6", activeSectionId === "b2b" ? "block" : "hidden")}>
        <DashboardSectionCard
          title={isAr ? "١. تخصيص تذييل صفحات B2B للشركات" : "1. Global B2B Footer Section"}
          description={
            isAr
              ? "يتم عرض هذا التذييل عبر كافة صفحات قطاع الأعمال (/b2b, /b2b/services, /b2b/cases, /b2b/about, إلخ)."
              : "Rendered globally across all corporate and enterprise routes (/b2b, /b2b/services, /b2b/cases, /b2b/about, etc.)."
          }
          icon={<Building2 className="w-5 h-5 text-purple-400" />}
        >
          <div className="space-y-6">
            {/* CTA Banner Copy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "عنوان بانر الدعوة للعمل (EN)" : "B2B CTA Banner Headline (English)"}
                </label>
                <input
                  type="text"
                  value={data.b2bFooterCtaTitleEn}
                  onChange={(e) => handleChange("b2bFooterCtaTitleEn", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "عنوان بانر الدعوة للعمل (AR)" : "B2B CTA Banner Headline (Arabic)"}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.b2bFooterCtaTitleAr}
                  onChange={(e) => handleChange("b2bFooterCtaTitleAr", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "الوصف الفرعي لبانر B2B (EN)" : "B2B CTA Banner Subtitle (English)"}
                </label>
                <textarea
                  rows={2}
                  value={data.b2bFooterCtaSubtitleEn}
                  onChange={(e) => handleChange("b2bFooterCtaSubtitleEn", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "الوصف الفرعي لبانر B2B (AR)" : "B2B CTA Banner Subtitle (Arabic)"}
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={data.b2bFooterCtaSubtitleAr}
                  onChange={(e) => handleChange("b2bFooterCtaSubtitleAr", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none font-arabic text-right leading-relaxed"
                />
              </div>
            </div>

            {/* CTA Button Link */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "نص الزر (EN)" : "Button Label (EN)"}
                </label>
                <input
                  type="text"
                  value={data.b2bFooterCtaBtnLabelEn}
                  onChange={(e) => handleChange("b2bFooterCtaBtnLabelEn", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "نص الزر (AR)" : "Button Label (AR)"}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.b2bFooterCtaBtnLabelAr}
                  onChange={(e) => handleChange("b2bFooterCtaBtnLabelAr", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "رابط التوجيه" : "Target URL"}
                </label>
                <input
                  type="text"
                  value={data.b2bFooterCtaBtnUrl}
                  onChange={(e) => handleChange("b2bFooterCtaBtnUrl", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>
            </div>

            {/* Qatar CR */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                {isAr ? "رقم السجل التجاري في قطر (CR Number)" : "Qatar Commercial Registration (CR Number)"}
              </label>
              <input
                type="text"
                value={data.b2bCrNumber}
                onChange={(e) => handleChange("b2bCrNumber", e.target.value)}
                placeholder="184920 / 2026"
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
              />
            </div>
          </div>
        </DashboardSectionCard>
      </div>

      {/* 2. Global B2C Footer */}
      <div id="b2c" className={cn("space-y-6", activeSectionId === "b2c" ? "block" : "hidden")}>
        <DashboardSectionCard
          title={isAr ? "٢. تخصيص تذييل صفحات B2C للفعاليات" : "2. Global B2C Footer Section"}
          description={
            isAr
              ? "يتم عرض هذا التذييل عبر كافة صفحات الجمهور والفعاليات (/b2c, /b2c/attractions, /b2c/calendar, /b2c/packages, إلخ)."
              : "Rendered globally across all guest and consumer routes (/b2c, /b2c/attractions, /b2c/calendar, /b2c/packages, etc.)."
          }
          icon={<Ticket className="w-5 h-5 text-pink-400" />}
        >
          <div className="space-y-6">
            {/* CTA Banner Copy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "عنوان بانر حجز التذاكر (EN)" : "B2C Ticket Banner Headline (English)"}
                </label>
                <input
                  type="text"
                  value={data.b2cFooterCtaTitleEn}
                  onChange={(e) => handleChange("b2cFooterCtaTitleEn", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "عنوان بانر حجز التذاكر (AR)" : "B2C Ticket Banner Headline (Arabic)"}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.b2cFooterCtaTitleAr}
                  onChange={(e) => handleChange("b2cFooterCtaTitleAr", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "الوصف الفرعي لبانر التذاكر (EN)" : "B2C Ticket Banner Subtitle (English)"}
                </label>
                <textarea
                  rows={2}
                  value={data.b2cFooterCtaSubtitleEn}
                  onChange={(e) => handleChange("b2cFooterCtaSubtitleEn", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "الوصف الفرعي لبانر التذاكر (AR)" : "B2C Ticket Banner Subtitle (Arabic)"}
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={data.b2cFooterCtaSubtitleAr}
                  onChange={(e) => handleChange("b2cFooterCtaSubtitleAr", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none font-arabic text-right leading-relaxed"
                />
              </div>
            </div>

            {/* Ticket CTA Button */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "نص زر التذاكر (EN)" : "Ticket CTA Label (EN)"}
                </label>
                <input
                  type="text"
                  value={data.bookTicketsLabelEn}
                  onChange={(e) => handleChange("bookTicketsLabelEn", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "نص زر التذاكر (AR)" : "Ticket CTA Label (AR)"}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.bookTicketsLabelAr}
                  onChange={(e) => handleChange("bookTicketsLabelAr", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "مسار رابط التذاكر" : "Target Ticket URL"}
                </label>
                <input
                  type="text"
                  value={data.bookTicketsUrl}
                  onChange={(e) => handleChange("bookTicketsUrl", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>
            </div>

            {/* Atmospheric Background Media */}
            <div className="pt-4 border-t border-[var(--border-default)]">
              <PackageMediaUploader
                label={isAr ? "خلفية التذييل الجوية (فيديو أو صورة غامرة)" : "Atmospheric Footer Background Media"}
                value={data.footerMediaUrl}
                onChange={(val) => handleChange("footerMediaUrl", val)}
                mediaType={data.footerMediaType as any}
                onMediaTypeChange={(type) => handleChange("footerMediaType", type)}
                context="settings/footer"
                isAr={isAr}
              />
            </div>
          </div>
        </DashboardSectionCard>
      </div>

      {/* 3. Legal & Compliance */}
      <div id="legal" className={cn("space-y-6", activeSectionId === "legal" ? "block" : "hidden")}>
        <DashboardSectionCard
          title={isAr ? "٣. البيانات القانونية وحماية البيانات (PDPL)" : "3. Legal Notices & Qatar PDPL"}
          description={
            isAr
              ? "نصوص حماية البيانات الشخصية وفقاً للقانون القطري رقم 13 لسنة 2016، وشروط الخدمة المعتمدة."
              : "Legal notices, compliance tags, and global copyright statements rendered across footers."
          }
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "نبذة التذييل الرسمية (EN)" : "Official Description (EN)"}
                </label>
                <textarea
                  rows={2}
                  value={data.footerDescriptionEn}
                  onChange={(e) => handleChange("footerDescriptionEn", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  {isAr ? "نبذة التذييل الرسمية (AR)" : "Official Description (AR)"}
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={data.footerDescriptionAr}
                  onChange={(e) => handleChange("footerDescriptionAr", e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none font-arabic text-right leading-relaxed"
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
