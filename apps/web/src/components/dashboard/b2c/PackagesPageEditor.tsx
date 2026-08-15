"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, SlidersHorizontal, Package, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
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
import { localizeHref } from "@/lib/url-helper";
import { E3LivingHeroEditor } from "@/components/dashboard/b2c/E3LivingHeroEditor";

const SECTIONS: EditorSectionItem[] = [
  { id: "headlines", label: "1. Hero Copy & Headlines", labelAr: "1. العناوين والنصوص الترويجية" },
  { id: "ctas", label: "2. CTAs, Pricing & Badges", labelAr: "2. أزرار الحجز والأسعار والشارات" },
  { id: "hero-media", label: "3. Hero Media Background", labelAr: "3. خلفية الوسائط الرئيسية" },
  { id: "footer-media", label: "4. Footer Media & Poster", labelAr: "4. وسائط وخلفية التذييل" },
];

export function PackagesPageEditor() {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("headlines");
  const [dirtySections, setDirtySections] = useState<Set<string>>(new Set());
  const [languageMode, setLanguageMode] = useState<LanguageEditMode>("both");

  const [pageConfig, setPageConfig] = useState({
    eyebrowEn: "E3 CELEBRATIONS & GROUP PACKAGES",
    eyebrowAr: "باقات الفعاليات والاحتفالات الاستثنائية",
    titleEn: "Big Moments Deserve Bigger Experiences",
    titleAr: "لحظاتكم الكبيرة تستحق تجارب استثنائية",
    descEn: "Discover birthday celebrations, group adventures, school experiences and corporate packages across E3's entertainment destinations.",
    descAr: "اكتشفوا باقات أعياد الميلاد والمجموعات والمدارس والشركات في وجهات E3 الترفيهية.",
    primaryCtaEn: "Find Your Package",
    primaryCtaAr: "اختر باقتك",
    secondaryCtaEn: "Plan a Custom Event",
    secondaryCtaAr: "خطط لفعاليتك الخاصة",
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
  });

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const res = await fetch("/api/cms/pages/b2c-packages-page", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load packages page settings");
        const json = await res.json();
        if (active && json?.data?.content) {
          setPageConfig((prev) => ({ ...prev, ...json.data.content }));
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
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetch("/api/cms/pages/b2c-packages-page", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.content) {
          setPageConfig((prev) => ({ ...prev, ...json.data.content }));
        }
      })
      .catch((e) => setError(e?.message || "Error loading page settings"))
      .finally(() => setLoading(false));
  };

  const updateField = (updater: (prev: typeof pageConfig) => typeof pageConfig) => {
    setPageConfig((prev) => {
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
                  fixedHeadlineEn: (pageConfig as any).fixedHeadlineEn || pageConfig.titleEn || "BUILD A DAY FILLED WITH",
                  fixedHeadlineAr: (pageConfig as any).fixedHeadlineAr || pageConfig.titleAr || "اصنع يوماً مليئاً بـ",
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
                    labelEn: pageConfig.secondaryCtaEn || "Plan a Custom Event",
                    labelAr: pageConfig.secondaryCtaAr || "خطط لفعاليتك الخاصة",
                    url: "#custom-enquiry"
                  },
                  media: pageConfig.heroMedia,
                  preset: (pageConfig as any).preset || "day-builder",
                  animationSpeed: (pageConfig as any).animationSpeed || 2800,
                  enableRotatingWords: (pageConfig as any).enableRotatingWords !== false
                }}
                onChange={(updated) => {
                  updateField((p: any) => ({
                    ...p,
                    eyebrowEn: updated.eyebrowEn,
                    eyebrowAr: updated.eyebrowAr,
                    fixedHeadlineEn: updated.fixedHeadlineEn,
                    fixedHeadlineAr: updated.fixedHeadlineAr,
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
                    enableRotatingWords: updated.enableRotatingWords
                  }))
                }}
                isAr={isAr}
                languageMode={languageMode === 'ar' ? 'AR' : languageMode === 'en' ? 'EN' : 'BOTH'}
                defaultPreset="day-builder"
              />
            </div>

            {/* 2. CTAs and Badges Card */}
            <div id="ctas" className={activeSectionId === "ctas" ? "block" : "hidden"}>
              <DashboardSectionCard
                title={isAr ? "أزرار الحجز وشارات الفعاليات" : "Call to Action Buttons & Campaign Badge"}
                description={isAr ? "تخصيص أزرار الحجز الرئيسية وشارات العروض والحملات." : "Configure action buttons and campaign promo badges."}
                icon={<SlidersHorizontal className="w-5 h-5 text-[var(--color-primary)]" />}
              >
                <DashboardBilingualField
                  label={isAr ? "زر الإجراء الرئيسي" : "Primary Action Button"}
                  valueEn={pageConfig.primaryCtaEn}
                  valueAr={pageConfig.primaryCtaAr}
                  onChangeEn={(val) => updateField((p) => ({ ...p, primaryCtaEn: val }))}
                  onChangeAr={(val) => updateField((p) => ({ ...p, primaryCtaAr: val }))}
                  mode={languageMode}
                />

                <DashboardBilingualField
                  label={isAr ? "زر الإجراء الثانوي" : "Secondary Action Button"}
                  valueEn={pageConfig.secondaryCtaEn}
                  valueAr={pageConfig.secondaryCtaAr}
                  onChangeEn={(val) => updateField((p) => ({ ...p, secondaryCtaEn: val }))}
                  onChangeAr={(val) => updateField((p) => ({ ...p, secondaryCtaAr: val }))}
                  mode={languageMode}
                />

                <DashboardBilingualField
                  label={isAr ? "نص شارة الحملة" : "Campaign Badge Label"}
                  valueEn={pageConfig.campaignBadgeEn}
                  valueAr={pageConfig.campaignBadgeAr}
                  onChangeEn={(val) => updateField((p) => ({ ...p, campaignBadgeEn: val }))}
                  onChangeAr={(val) => updateField((p) => ({ ...p, campaignBadgeAr: val }))}
                  mode={languageMode}
                />
              </DashboardSectionCard>
            </div>

            {/* 3. Universal Hero Media Section */}
            <div id="hero-media" className={activeSectionId === "hero-media" ? "block" : "hidden"}>
              <UniversalMediaSectionEditor
                title={isAr ? "وسائط وخلفية الهيدر الرئيسي" : "Packages Hero Media Banner"}
                subtitle={isAr ? "إعدادات وسائط الهيدر التفاعلية الداعمة للفيديو، الصور، والمشاهد الحركية." : "Universal hero media configuration supporting Video, Image, 3D Canvas, IFrame, and Mobile Fallbacks."}
                value={pageConfig.heroMedia}
                onChange={(heroMedia: UniversalMediaConfig) => updateField((p) => ({ ...p, heroMedia }))}
                accentColor="purple"
              />
            </div>

            {/* 4. Universal Footer Media Section */}
            <div id="footer-media" className={activeSectionId === "footer-media" ? "block" : "hidden"}>
              <UniversalMediaSectionEditor
                title={isAr ? "وسائط وخلفية التذييل" : "Packages Footer Banner Media"}
                subtitle={isAr ? "إعدادات وسائط بنر التذييل الداعمة للفيديو، الصور، والوسائط المتعددة." : "Universal footer media configuration supporting Video, Image, 3D Canvas, and Mobile Fallbacks."}
                value={pageConfig.footerMedia}
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
