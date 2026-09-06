"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, SlidersHorizontal, Package, ArrowRight, AlertCircle, RefreshCw, MessageSquare, ExternalLink, Copy, Check, Phone, Globe } from "lucide-react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { UniversalMediaSectionEditor, DEFAULT_UNIVERSAL_MEDIA, UniversalMediaConfig } from "@/components/dashboard/ui/UniversalMediaSectionEditor";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionCard,
  DashboardBilingualField,
  DashboardLanguageSwitch,
  DashboardStickyActions,
  DashboardLoadingState,
  DashboardUnsavedChangesGuard,
  DashboardSectionNavigator,
  EditorSectionItem,
  LanguageEditMode,
  AdminButton,
} from "@/components/dashboard/ui";

import { useLocale } from "@/components/layout/LocaleProvider";
import { localizeHref, buildWhatsappUrl } from "@/lib/url-helper";
import { E3LivingHeroEditor } from "@/components/dashboard/b2c/E3LivingHeroEditor";

const SECTIONS: EditorSectionItem[] = [
  { id: "headlines", label: "1. Hero Copy & Headlines", labelAr: "1. العناوين والنصوص الترويجية" },
  { id: "ctas", label: "2. CTAs, Badges & WhatsApp", labelAr: "2. الأزرار والشارات والواتساب" },
  { id: "hero-media", label: "3. Hero Media Background", labelAr: "3. خلفية الوسائط الرئيسية" },
  { id: "footer-media", label: "4. Footer Media & Poster", labelAr: "4. وسائط وخلفية التذييل" },
];

export interface PackagesPageConfig {
  eyebrowEn: string;
  eyebrowAr: string;
  titleEn: string;
  titleAr: string;
  fixedHeadlineEn?: string;
  fixedHeadlineAr?: string;
  headlineTemplateEn?: string;
  headlineTemplateAr?: string;
  rotatingWordsEn?: string[];
  rotatingWordsAr?: string[];
  descEn: string;
  descAr: string;
  primaryCtaEn: string;
  primaryCtaAr: string;
  secondaryCtaEn: string;
  secondaryCtaAr: string;
  whatsappNumber: string;
  whatsappUrl: string;
  whatsappMessageEn: string;
  whatsappMessageAr: string;
  campaignBadgeEn: string;
  campaignBadgeAr: string;
  heroMedia: UniversalMediaConfig;
  footerMedia: UniversalMediaConfig;
  preset?: string;
  animationSpeed?: number;
  animationDuration?: number;
  animationType?: string;
  wordStyle?: string;
  alignmentEn?: string;
  alignmentAr?: string;
  alignment?: string;
  enableRotatingWords?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  [key: string]: any;
}

export function PackagesPageEditor({ initialConfig }: { initialConfig?: Partial<PackagesPageConfig> } = {}) {
  const router = useRouter();
  let locale: 'en' | 'ar' = 'en';
  let dir: 'ltr' | 'rtl' = 'ltr';
  try {
    const localeCtx = useLocale();
    if (localeCtx) {
      locale = (localeCtx.locale as 'en' | 'ar') || 'en';
      dir = localeCtx.dir || (locale === 'ar' ? 'rtl' : 'ltr');
    }
  } catch {
    // Fallback
  }
  const isAr = locale === "ar";
  const { toast } = useToast();
  const [loading, setLoading] = useState(!initialConfig);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("headlines");
  const [dirtySections, setDirtySections] = useState<Set<string>>(new Set());
  const [languageMode, setLanguageMode] = useState<LanguageEditMode>("both");
  const [copiedLink, setCopiedLink] = useState(false);

  const [pageConfig, setPageConfig] = useState<PackagesPageConfig>({
    eyebrowEn: "E3 CELEBRATIONS & GROUP PACKAGES",
    eyebrowAr: "باقات الفعاليات والاحتفالات الاستثنائية",
    titleEn: "Big Moments Deserve Bigger Experiences",
    titleAr: "لحظاتكم الكبيرة تستحق تجارب استثنائية",
    descEn: "Discover birthday celebrations, group adventures, school experiences and corporate packages across E3's entertainment destinations.",
    descAr: "اكتشفوا باقات أعياد الميلاد والمجموعات والمدارس والشركات في وجهات E3 الترفيهية.",
    primaryCtaEn: "Find Your Package",
    primaryCtaAr: "اختر باقتك",
    secondaryCtaEn: "Inquire via WhatsApp",
    secondaryCtaAr: "استفسار عبر واتساب",
    whatsappNumber: "+974 5113 8418",
    whatsappUrl: "",
    whatsappMessageEn: "Hello E3 Qatar, I would like to inquire about package bookings and celebrations.",
    whatsappMessageAr: "مرحباً إي ثري قطر، أود الاستفسار عن باقات وفعاليات الاحتفالات.",
    campaignBadgeEn: "VIP PACKAGES & EVENTS",
    campaignBadgeAr: "باقات كبار الشخصيات",
    heroMedia: {
      ...DEFAULT_UNIVERSAL_MEDIA,
      mediaType: "IMAGE",
      mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
    } as UniversalMediaConfig,
    footerMedia: {
      ...DEFAULT_UNIVERSAL_MEDIA,
      mediaType: "VIDEO",
      mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4",
    } as UniversalMediaConfig,
    seoTitle: "Packages & Birthdays | E3 Qatar",
    seoDescription: "Book custom birthday packages, VIP party rooms, and group events.",
    ...(initialConfig || {}),
  });

  useEffect(() => {
    if (initialConfig) {
      setLoading(false);
      return;
    }
    let active = true;
    async function loadData() {
      try {
        const res = await fetch("/api/cms/pages/b2c-packages-page", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load packages page settings");
        const json = await res.json();
        if (active && json?.data?.content) {
          setPageConfig((prev: PackagesPageConfig) => ({ ...prev, ...json.data.content }));
        }
      } catch (e: any) {
        if (active) {
          console.error(e);
          setError(e?.message || "Error loading page settings");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [initialConfig]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetch("/api/cms/pages/b2c-packages-page", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.content) {
          setPageConfig((prev: PackagesPageConfig) => ({ ...prev, ...json.data.content }));
        }
      })
      .catch((e) => setError(e?.message || "Error loading page settings"))
      .finally(() => setLoading(false));
  };

  const updateField = (updater: (prev: PackagesPageConfig) => PackagesPageConfig) => {
    setPageConfig((prev: PackagesPageConfig) => {
      const next = updater(prev);
      setIsDirty(true);
      setDirtySections((s) => new Set(s).add(activeSectionId));
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/pages/b2c-packages-page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { content: pageConfig, published: true } }),
      });
      if (!res.ok) throw new Error("Failed to save Packages Page settings");
      setIsDirty(false);
      setDirtySections(new Set());
      setLastSaved(new Date());
      toast(isAr ? "تم حفظ إعدادات صفحة الباقات بنجاح!" : "Packages Page Editor saved successfully!", "success");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast(err?.message || (isAr ? "حدث خطأ أثناء حفظ الصفحة" : "Error saving page settings"), "error");
    } finally {
      setSaving(false);
    }
  };

  const previewWhatsappUrl = buildWhatsappUrl({
    phoneOrUrl: pageConfig.whatsappUrl || pageConfig.whatsappNumber || "+974 5113 8418",
    message: isAr
      ? (pageConfig.whatsappMessageAr || "مرحباً إي ثري قطر، أود الاستفسار عن باقات وفعاليات الاحتفالات.")
      : (pageConfig.whatsappMessageEn || "Hello E3 Qatar, I would like to inquire about package bookings and celebrations."),
    defaultPhone: "+974 5113 8418",
  });

  return (
    <DashboardPageShell variant="wide">
      <div dir={dir} className="space-y-6">
        <DashboardUnsavedChangesGuard isDirty={isDirty} />

        {/* Standard Header */}
        <DashboardPageHeader
          title={isAr ? "محرر صفحة الباقات والاحتفالات" : "Packages & Celebrations Page Editor"}
          description={
            isAr
              ? "إدارة تصميم صفحة الباقات، وسائط الهيدر والتذييل، أزرار الحجز وشارات الفعاليات (/b2c/packages)."
              : "Manage packages landing page layout, universal hero and footer media assets, CTAs, VIP badges, and SEO metadata (/b2c/packages)."
          }
          breadcrumbs={[
            { label: isAr ? "صفحات الأفراد" : "B2C Pages", href: "/dashboard/b2c/landing" },
            { label: isAr ? "محرر صفحة الباقات" : "Packages Page Editor" },
          ]}
          badge={{ label: isAr ? "صفحة عامة" : "B2C Public", variant: "purple" }}
          previewUrl="/b2c/packages"
          isUnsaved={isDirty}
          lastSavedAt={lastSaved || undefined}
          primaryAction={{
            label: saving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ إعدادات الصفحة" : "Save Page Settings"),
            onClick: handleSave,
            isLoading: saving,
            icon: <Save className="w-4 h-4" />,
          }}
          secondaryAction={
            <DashboardLanguageSwitch mode={languageMode} onModeChange={setLanguageMode} />
          }
        />

        {/* Reciprocal Handoff Banner */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                {isAr ? "إدارة الباقات الفردية" : "Manage Individual Packages"}
              </h4>
              <p className="text-xs text-text-secondary mt-0.5">
                {isAr 
                  ? "يتم تحديد تفاصيل الباقات الفردية والأسعار والمستويات والمشتملات في مدير الباقات وأعياد الميلاد."
                  : "Individual package pricing, tiers, inclusions, availability, and venue links are managed in the Packages Manager."}
              </p>
            </div>
          </div>
          <Link href={localizeHref("/dashboard/b2c/packages", locale)}>
            <AdminButton variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />}>
              {isAr ? "مدير الباقات وأعياد الميلاد" : "Go to Packages Manager"}
            </AdminButton>
          </Link>
        </div>

        {loading ? (
          <DashboardLoadingState title={isAr ? "جاري تحميل محرر صفحة الباقات..." : "Loading Packages Page Editor..."} type="skeleton" />
        ) : error ? (
          <div className="p-8 text-center bg-surface-default border border-border-default rounded-2xl space-y-4">
            <AlertCircle className="w-10 h-10 text-error mx-auto" />
            <h3 className="text-lg font-bold text-text-primary">{isAr ? "فشل تحميل إعدادات الصفحة" : "Failed to load page settings"}</h3>
            <p className="text-sm text-text-secondary">{error}</p>
            <AdminButton onClick={handleRetry} variant="primary" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />}>
              {isAr ? "إعادة المحاولة" : "Retry"}
            </AdminButton>
          </div>
        ) : (
          <>
            {/* 4-Section Long-Page Navigator */}
            <DashboardSectionNavigator
              sections={SECTIONS}
              activeSectionId={activeSectionId}
              onSelectSection={setActiveSectionId}
              dirtySections={Array.from(dirtySections)}
            />

            {/* 1. Hero Headlines Card (E3 Living Hero System) */}
            <div id="headlines" className={activeSectionId === "headlines" || !activeSectionId ? "block" : "hidden"}>
              <E3LivingHeroEditor
                value={{
                  eyebrowEn: pageConfig.eyebrowEn,
                  eyebrowAr: pageConfig.eyebrowAr,
                  fixedHeadlineEn: (pageConfig as any).fixedHeadlineEn || (pageConfig as any).headlineTemplateEn || pageConfig.titleEn || "BUILD A DAY FILLED WITH {{animated}}",
                  fixedHeadlineAr: (pageConfig as any).fixedHeadlineAr || (pageConfig as any).headlineTemplateAr || pageConfig.titleAr || "اصنع يوماً مليئاً بـ {{animated}}",
                  headlineTemplateEn: (pageConfig as any).headlineTemplateEn || (pageConfig as any).fixedHeadlineEn,
                  headlineTemplateAr: (pageConfig as any).headlineTemplateAr || (pageConfig as any).fixedHeadlineAr,
                  rotatingWordsEn: (pageConfig as any).rotatingWordsEn || ["PLAY", "CELEBRATION", "DISCOVERY", "MEMORIES"],
                  rotatingWordsAr: (pageConfig as any).rotatingWordsAr || ["المرح", "الاحتفال", "الاكتشاف", "الذكريات"],
                  descriptionEn: pageConfig.descEn,
                  descriptionAr: pageConfig.descAr,
                  primaryCta: {
                    labelEn: pageConfig.primaryCtaEn || "Find Your Package",
                    labelAr: pageConfig.primaryCtaAr || "اختر باقتك",
                    url: "#packages-list"
                  },
                  secondaryCta: {
                    labelEn: pageConfig.secondaryCtaEn || "Inquire via WhatsApp",
                    labelAr: pageConfig.secondaryCtaAr || "استفسار عبر واتساب",
                    url: previewWhatsappUrl
                  },
                  media: pageConfig.heroMedia,
                  preset: (pageConfig as any).preset || "day-builder",
                  animationSpeed: (pageConfig as any).animationSpeed || 2800,
                  animationDuration: (pageConfig as any).animationDuration || 600,
                  animationType: (pageConfig as any).animationType || "blur-morph",
                  wordStyle: (pageConfig as any).wordStyle || "static-gradient",
                  alignmentEn: (pageConfig as any).alignmentEn || (pageConfig as any).alignment || "center",
                  alignmentAr: (pageConfig as any).alignmentAr || (pageConfig as any).alignment || "center",
                  alignment: (pageConfig as any).alignment,
                  enableRotatingWords: (pageConfig as any).enableRotatingWords !== false
                }}
                onChange={(updated) => {
                  updateField((p: any) => ({
                    ...p,
                    eyebrowEn: updated.eyebrowEn,
                    eyebrowAr: updated.eyebrowAr,
                    fixedHeadlineEn: updated.fixedHeadlineEn,
                    fixedHeadlineAr: updated.fixedHeadlineAr,
                    headlineTemplateEn: updated.headlineTemplateEn,
                    headlineTemplateAr: updated.headlineTemplateAr,
                    titleEn: updated.fixedHeadlineEn,
                    titleAr: updated.fixedHeadlineAr,
                    rotatingWordsEn: updated.rotatingWordsEn,
                    rotatingWordsAr: updated.rotatingWordsAr,
                    descEn: updated.descriptionEn,
                    descAr: updated.descriptionAr,
                    primaryCtaEn: updated.primaryCta?.labelEn,
                    primaryCtaAr: updated.primaryCta?.labelAr,
                    secondaryCtaEn: updated.secondaryCta?.labelEn,
                    secondaryCtaAr: updated.secondaryCta?.labelAr,
                    heroMedia: {
                      ...(p.heroMedia || {}),
                      ...updated.media
                    },
                    preset: updated.preset,
                    animationSpeed: updated.animationSpeed,
                    animationDuration: updated.animationDuration,
                    animationType: updated.animationType,
                    wordStyle: updated.wordStyle,
                    alignmentEn: updated.alignmentEn,
                    alignmentAr: updated.alignmentAr,
                    alignment: updated.alignment,
                    enableRotatingWords: updated.enableRotatingWords
                  }))
                }}
                isAr={isAr}
                languageMode={languageMode === 'ar' ? 'AR' : languageMode === 'en' ? 'EN' : 'BOTH'}
                defaultPreset="day-builder"
              />
            </div>

            {/* 2. CTAs, WhatsApp and Badges Card */}
            <div id="ctas" className={activeSectionId === "ctas" ? "block" : "hidden"}>
              <div className="space-y-6">
                <DashboardSectionCard
                  title={isAr ? "أزرار الحجز وشارات الفعاليات" : "Call to Action Buttons & Campaign Badge"}
                  description={isAr ? "تخصيص أزرار الحجز الرئيسية وشارات العروض والحملات." : "Configure action buttons and campaign promo badges."}
                  icon={<SlidersHorizontal className="w-5 h-5 text-[var(--color-primary)]" />}
                >
                  <DashboardBilingualField
                    label={isAr ? "زر الإجراء الرئيسي" : "Primary Action Button"}
                    valueEn={pageConfig.primaryCtaEn || ""}
                    valueAr={pageConfig.primaryCtaAr || ""}
                    onChangeEn={(val) => updateField((p) => ({ ...p, primaryCtaEn: val }))}
                    onChangeAr={(val) => updateField((p) => ({ ...p, primaryCtaAr: val }))}
                    mode={languageMode}
                  />

                  <DashboardBilingualField
                    label={isAr ? "زر الإجراء الثانوي (واتساب)" : "Secondary Action Button (WhatsApp Tab)"}
                    valueEn={pageConfig.secondaryCtaEn || ""}
                    valueAr={pageConfig.secondaryCtaAr || ""}
                    onChangeEn={(val) => updateField((p) => ({ ...p, secondaryCtaEn: val }))}
                    onChangeAr={(val) => updateField((p) => ({ ...p, secondaryCtaAr: val }))}
                    mode={languageMode}
                  />

                  <DashboardBilingualField
                    label={isAr ? "نص شارة الحملة" : "Campaign Badge Label"}
                    valueEn={pageConfig.campaignBadgeEn || ""}
                    valueAr={pageConfig.campaignBadgeAr || ""}
                    onChangeEn={(val) => updateField((p) => ({ ...p, campaignBadgeEn: val }))}
                    onChangeAr={(val) => updateField((p) => ({ ...p, campaignBadgeAr: val }))}
                    mode={languageMode}
                  />
                </DashboardSectionCard>

                {/* WhatsApp Direct Package Inquiry Integration Card */}
                <DashboardSectionCard
                  title={isAr ? "إعدادات الربط المباشر مع واتساب للباقات" : "WhatsApp Package Inquiry Configuration"}
                  description={
                    isAr
                      ? "إدارة وتعديل رقم هاتف الواتساب أو الرابط المباشر، وتخصيص رسالة الاستفسار التلقائية."
                      : "Add or modify the WhatsApp phone number or direct link, and customize bilingual pre-filled inquiry messages."
                  }
                  icon={<MessageSquare className="w-5 h-5 text-emerald-400" />}
                >
                  <div className="space-y-4">
                    {/* Phone & Custom URL Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isAr ? "رقم هاتف واتساب (مع الرمز الدولي)" : "WhatsApp Phone Number (with Country Code)"}</span>
                        </label>
                        <input
                          type="text"
                          value={pageConfig.whatsappNumber ?? "+974 5113 8418"}
                          onChange={(e) => updateField((p) => ({ ...p, whatsappNumber: e.target.value }))}
                          placeholder="+974 5113 8418"
                          className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <p className="text-[10px] text-[var(--text-tertiary)]">
                          {isAr
                            ? "مثال: 97451138418+ (يُستخدم لإنشاء رابط https://wa.me تلقائياً)"
                            : "e.g. +974 5113 8418 (automatically converts to https://wa.me/97451138418)"}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-sky-400" />
                          <span>{isAr ? "رابط واتساب مخصص (اختياري)" : "Custom WhatsApp URL Override (Optional)"}</span>
                        </label>
                        <input
                          type="text"
                          value={pageConfig.whatsappUrl ?? ""}
                          onChange={(e) => updateField((p) => ({ ...p, whatsappUrl: e.target.value }))}
                          placeholder="https://wa.me/97451138418 or https://chat.whatsapp.com/..."
                          className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <p className="text-[10px] text-[var(--text-tertiary)]">
                          {isAr
                            ? "اتركه فارغاً لاستخدام رقم الهاتف أعلاه، أو أدخل رابط محادثة مخصص أو رابط مجموعة."
                            : "Leave blank to auto-format from phone number, or provide a custom direct link or group invite."}
                        </p>
                      </div>
                    </div>

                    {/* Bilingual Inquiry Pre-filled Messages */}
                    <DashboardBilingualField
                      label={isAr ? "رسالة الاستفسار التلقائية المسبقة" : "Pre-filled WhatsApp Inquiry Message"}
                      valueEn={pageConfig.whatsappMessageEn ?? "Hello E3 Qatar, I would like to inquire about package bookings and celebrations."}
                      valueAr={pageConfig.whatsappMessageAr ?? "مرحباً إي ثري قطر، أود الاستفسار عن باقات وفعاليات الاحتفالات."}
                      onChangeEn={(val) => updateField((p) => ({ ...p, whatsappMessageEn: val }))}
                      onChangeAr={(val) => updateField((p) => ({ ...p, whatsappMessageAr: val }))}
                      mode={languageMode}
                    />

                    {/* Live Generated WhatsApp Link Preview Box */}
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            {isAr ? "معاينة رابط واتساب الفعلي المباشر:" : "Live Generated WhatsApp Link Preview:"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(previewWhatsappUrl);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-[var(--border-level-2)] bg-[var(--surface-default)] hover:bg-[var(--surface-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedLink ? (isAr ? "تم النسخ" : "Copied!") : (isAr ? "نسخ الرابط" : "Copy Link")}</span>
                          </button>
                          <a
                            href={previewWhatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 cursor-pointer"
                          >
                            <span>{isAr ? "اختبار الرابط الآن" : "Test Link"}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-[11px] font-mono text-emerald-600 dark:text-emerald-400 break-all select-all">
                        {previewWhatsappUrl}
                      </div>
                    </div>
                  </div>
                </DashboardSectionCard>
              </div>
            </div>

            {/* 3. Universal Hero Media Section */}
            <div id="hero-media" className={activeSectionId === "hero-media" ? "block" : "hidden"}>
              <UniversalMediaSectionEditor
                title={isAr ? "وسائط وخلفية الهيدر الرئيسي" : "Packages Hero Media Banner"}
                subtitle={isAr ? "إعدادات وسائط الهيدر التفاعلية الداعمة للفيديو، الصور، والمشاهد الحركية." : "Universal hero media configuration supporting Video, Image, 3D Canvas, IFrame, and Mobile Fallbacks."}
                value={pageConfig.heroMedia || DEFAULT_UNIVERSAL_MEDIA}
                onChange={(heroMedia: UniversalMediaConfig) => updateField((p) => ({ ...p, heroMedia }))}
                accentColor="purple"
              />
            </div>

            {/* 4. Universal Footer Media Section */}
            <div id="footer-media" className={activeSectionId === "footer-media" ? "block" : "hidden"}>
              <UniversalMediaSectionEditor
                title={isAr ? "وسائط وخلفية التذييل" : "Packages Footer Banner Media"}
                subtitle={isAr ? "إعدادات وسائط بنر التذييل الداعمة للفيديو، الصور، والوسائط المتعددة." : "Universal footer media configuration supporting Video, Image, 3D Canvas, and Mobile Fallbacks."}
                value={pageConfig.footerMedia || DEFAULT_UNIVERSAL_MEDIA}
                onChange={(footerMedia: UniversalMediaConfig) => updateField((p) => ({ ...p, footerMedia }))}
                accentColor="indigo"
              />
            </div>

            {/* Sticky Action Bar */}
            <DashboardStickyActions
              onSave={handleSave}
              isSaving={saving}
              isUnsaved={isDirty}
              onDiscard={() => {
                if (window.confirm(isAr ? "هل أنت متأكد من إلغاء التغييرات؟" : "Discard changes?")) {
                  window.location.reload();
                }
              }}
            />
          </>
        )}
      </div>
    </DashboardPageShell>
  );
}
