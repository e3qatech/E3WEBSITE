"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Trash2, Save, Calendar, Tag, Globe, SlidersHorizontal, ArrowRight } from "lucide-react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { useLocale } from "@/components/layout/LocaleProvider";
import { cn } from "@/lib/utils";
import { UniversalMediaSectionEditor, DEFAULT_UNIVERSAL_MEDIA, UniversalMediaConfig } from "@/components/dashboard/ui/UniversalMediaSectionEditor";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardSectionCard,
  DashboardBilingualField,
  DashboardStickyActions,
  DashboardLoadingState,
  DashboardUnsavedChangesGuard,
  EditorSectionItem,
  AdminButton,
} from "@/components/dashboard/ui";

type PageSettings = {
  eyebrowEn?: string;
  eyebrowAr?: string;
  titleEn?: string;
  titleAr?: string;
  taglineEn?: string;
  taglineAr?: string;
  heroMedia?: UniversalMediaConfig;
  seo?: any;
};

type DiscountOffer = {
  id: string;
  code: string;
  discount: number;
  attraction: { nameEn: string };
};

export function CalendarPageManager({
  initialPageSettings,
  initialDiscounts,
  initialAttractions,
}: {
  initialPageSettings?: PageSettings;
  initialDiscounts?: DiscountOffer[];
  initialAttractions?: { id: string; nameEn: string; nameAr?: string }[];
} = {}) {
  const { toast } = useToast();
  const { locale: contextLocale } = useLocale();
  const pathname = usePathname();
  const locale = pathname?.startsWith("/ar") ? "ar" : contextLocale || "en";
  const isAr = locale === "ar";

  const [activeTab, setActiveTab] = useState<string>("HERO");
  const [loading, setLoading] = useState(initialPageSettings === undefined);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [pageSettings, setPageSettings] = useState<PageSettings>(
    initialPageSettings || {
      eyebrowEn: "EVENTS & OCCURRENCES TIMELINE",
      eyebrowAr: "جدول الفعاليات والمواعيد الحية",
      titleEn: "Events & Entertainment Calendar",
      titleAr: "جدول الفعاليات والتجارب",
      taglineEn: "Find your next experience. Browse upcoming special events, festivals, and exclusive private sessions.",
      taglineAr: "اكتشف جدول الفعاليات والمهرجانات القادمة في وجهات إي ثري الترفيهية.",
      heroMedia: {
        ...DEFAULT_UNIVERSAL_MEDIA,
        mediaType: "VIDEO",
        mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4",
      },
      seo: {},
    }
  );

  const [discounts, setDiscounts] = useState<DiscountOffer[]>(initialDiscounts || []);
  const [attractions, setAttractions] = useState<{ id: string; nameEn: string; nameAr?: string }[]>(
    initialAttractions || []
  );
  const [newDiscount, setNewDiscount] = useState({
    attractionId: initialAttractions?.[0]?.id || "",
    code: "",
    discount: "",
  });
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);

  useEffect(() => {
    if (initialPageSettings !== undefined) return;
    let active = true;
    async function fetchData() {
      try {
        const [settingsRes, discountsRes, attractionsRes] = await Promise.all([
          fetch("/api/b2c/calendar-settings?t=" + Date.now()).catch(() => null),
          fetch("/api/b2c/offers?t=" + Date.now()).catch(() => null),
          fetch("/api/b2c/attractions/simple?t=" + Date.now()).catch(() => null),
        ]);

        if (active) {
          if (settingsRes && settingsRes.ok) {
            const data = await settingsRes.json();
            if (data.pageSettings && Object.keys(data.pageSettings).length > 0) {
              setPageSettings((prev) => ({ ...prev, ...data.pageSettings }));
            }
          }

          if (discountsRes && discountsRes.ok) {
            const data = await discountsRes.json();
            if (Array.isArray(data)) setDiscounts(data);
          }

          if (attractionsRes && attractionsRes.ok) {
            const data = await attractionsRes.json();
            if (Array.isArray(data)) {
              setAttractions(data);
              if (data.length > 0) {
                setNewDiscount((prev) => ({ ...prev, attractionId: data[0].id }));
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchData();
    return () => {
      active = false;
    };
  }, [initialPageSettings]);

  const updateSettings = (updater: (prev: PageSettings) => PageSettings) => {
    setPageSettings((prev) => {
      const next = updater(prev);
      setIsDirty(true);
      return next;
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/b2c/calendar-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageSettings }),
      });
      if (res.ok) {
        setIsDirty(false);
        setLastSaved(new Date());
        toast(
          isAr ? "تم حفظ إعدادات صفحة التقويم بنجاح!" : "Calendar Page settings saved successfully!",
          "success"
        );
      } else {
        toast(
          isAr ? "فشل حفظ إعدادات صفحة التقويم" : "Failed to save Calendar settings",
          "error"
        );
      }
    } catch (_error) {
      toast(isAr ? "حدث خطأ أثناء حفظ الإعدادات" : "Error saving settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDiscount = async () => {
    if (!newDiscount.attractionId || !newDiscount.code || !newDiscount.discount) return;
    setLoadingDiscounts(true);
    try {
      const res = await fetch("/api/b2c/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDiscount),
      });
      if (res.ok) {
        const added = await res.json();
        setDiscounts([added, ...discounts]);
        setNewDiscount((prev) => ({ ...prev, code: "", discount: "" }));
        toast(
          isAr ? "تم إنشاء رمز الخصم الترويجي بنجاح!" : "Discount offer created successfully!",
          "success"
        );
      } else {
        toast(
          isAr ? "فشل إنشاء رمز الخصم الترويجي" : "Failed to create discount offer",
          "error"
        );
      }
    } catch (_e) {
      toast(isAr ? "حدث خطأ أثناء إنشاء الخصم" : "Error creating discount offer", "error");
    } finally {
      setLoadingDiscounts(false);
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    const confirmMessage = isAr
      ? "هل أنت متأكد من رغبتك في حذف هذا العرض الترويجي؟"
      : "Are you sure you want to delete this promotional offer?";
    if (!confirm(confirmMessage)) return;

    try {
      const res = await fetch(`/api/b2c/offers?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDiscounts(discounts.filter((d) => d.id !== id));
        toast(isAr ? "تم حذف العرض الترويجي" : "Discount deleted", "success");
      }
    } catch (_error) {
      toast(isAr ? "فشل حذف العرض الترويجي" : "Failed to delete discount", "error");
    }
  };

  const SECTIONS: EditorSectionItem[] = [
    { id: "HERO", label: "1. Hero Titles & Copy", labelAr: "١. عناوين ونصوص الهيرو" },
    { id: "MEDIA", label: "2. Hero Media", labelAr: "٢. وسائط الهيرو" },
    { id: "DISCOUNTS", label: "3. Promo Discounts", labelAr: "٣. العروض والخصومات" },
    { id: "SEO", label: "4. SEO Metadata", labelAr: "٤. محركات البحث والميتا" },
  ];

  if (loading) {
    return (
      <DashboardLoadingState
        title={isAr ? "جاري تحميل محرر صفحة التقويم..." : "Loading Calendar Page Editor..."}
        type="skeleton"
      />
    );
  }

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      {/* Header */}
      <DashboardPageHeader
        title={isAr ? "محرر صفحة التقويم والفعاليات" : "Events & Calendar Page Editor"}
        description={
          isAr
            ? "إدارة واجهة صفحة الفعاليات، وسائط الهيرو، العروض الترويجية، وبيانات محركات البحث (/b2c/calendar)."
            : "Configure events schedule, hero banner media, seasonal promo discounts, and calendar metadata (/b2c/calendar)."
        }
        breadcrumbs={[
          { label: isAr ? "صفحات الأفراد" : "B2C Pages", href: `/${locale}/dashboard/b2c/landing` },
          { label: isAr ? "محرر صفحة التقويم" : "Calendar Page Editor" },
        ]}
        badge={{ label: isAr ? "عام للأفراد" : "B2C Public", variant: "purple" }}
        previewUrl={`/${locale}/b2c/calendar`}
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: saving
            ? isAr
              ? "جاري الحفظ..."
              : "Saving..."
            : isAr
            ? "حفظ إعدادات التقويم"
            : "Save Calendar Settings",
          onClick: handleSaveSettings,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      {/* Reciprocal Ownership Handoff Card to Operations Event Schedules */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {isAr ? "جداول الفعاليات والمواعيد التشغيلية (إدارة العمليات)" : "Event Schedules & Operating Windows (Operations)"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr
                ? "لإدارة وتعديل الفترات الزمنية المحددة للفعاليات، وسعة الحضور، وساعات العمل التشغيلية، انتقل إلى جداول العمليات."
                : "To configure dated event blocks, capacity gates, operating hours, and live headcounts, visit Operations Schedules."}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/dashboard/operations/events`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-xs font-bold text-cyan-200 transition-all shrink-0 cursor-pointer"
        >
          <span>{isAr ? "فتح جداول العمليات" : "Open Operations Schedules"}</span>
          <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
        </Link>
      </div>

      {/* Section Navigator */}
      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeTab}
        onSectionChange={setActiveTab}
      />

      {/* 1. HERO TITLES */}
      {activeTab === "HERO" && (
        <DashboardSectionCard
          title={isAr ? "عناوين ونصوص الهيرو" : "Hero Titles & Copy"}
          description={
            isAr
              ? "العناوين الرئيسية والافتتاحية المعروضة على بانر الفعاليات والتقويم المباشر."
              : "Opening headlines displayed on the live events and calendar directory banner."
          }
          icon={<Calendar className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          <DashboardBilingualField
            label={isAr ? "العنوان التمهيدي (Eyebrow)" : "Eyebrow Badge Text"}
            valueEn={pageSettings.eyebrowEn || ""}
            valueAr={pageSettings.eyebrowAr || ""}
            onChangeEn={(val) => updateSettings((p) => ({ ...p, eyebrowEn: val }))}
            onChangeAr={(val) => updateSettings((p) => ({ ...p, eyebrowAr: val }))}
            placeholderEn="e.g. EVENTS & OCCURRENCES TIMELINE"
            placeholderAr="مثال: جدول الفعاليات والمواعيد الحية"
          />

          <DashboardBilingualField
            label={isAr ? "عنوان صفحة التقويم" : "Calendar Page Title"}
            valueEn={pageSettings.titleEn || ""}
            valueAr={pageSettings.titleAr || ""}
            onChangeEn={(val) => updateSettings((p) => ({ ...p, titleEn: val }))}
            onChangeAr={(val) => updateSettings((p) => ({ ...p, titleAr: val }))}
            placeholderEn="e.g. Events & Entertainment Calendar"
            placeholderAr="مثال: جدول الفعاليات والتجارب"
          />

          <DashboardBilingualField
            label={isAr ? "النص الوصفي والنبذة الترويجية" : "Tagline & Narrative Description"}
            type="textarea"
            rows={3}
            valueEn={pageSettings.taglineEn || ""}
            valueAr={pageSettings.taglineAr || ""}
            onChangeEn={(val) => updateSettings((p) => ({ ...p, taglineEn: val }))}
            onChangeAr={(val) => updateSettings((p) => ({ ...p, taglineAr: val }))}
            placeholderEn="Enter tagline..."
            placeholderAr="أدخل النص الوصفي..."
          />
        </DashboardSectionCard>
      )}

      {/* 2. HERO MEDIA */}
      {activeTab === "MEDIA" && (
        <UniversalMediaSectionEditor
          title={isAr ? "بانر وسائط هيرو التقويم" : "Calendar Hero Media Banner"}
          subtitle={
            isAr
              ? "تكوين وسائط متعددة شاملة تدعم الفيديو، الصور، العرض ثلاثي الأبعاد، والتضمين الخارجي."
              : "Universal media configuration supporting Video, Image, 3D Canvas, IFrame, and Mobile Fallbacks."
          }
          value={pageSettings.heroMedia || DEFAULT_UNIVERSAL_MEDIA}
          onChange={(heroMedia) => updateSettings((p) => ({ ...p, heroMedia }))}
          accentColor="purple"
        />
      )}

      {/* 3. PROMO DISCOUNTS */}
      {activeTab === "DISCOUNTS" && (
        <DashboardSectionCard
          title={isAr ? "العروض الترويجية ورموز الخصم الفعالة" : "Active Promotional Offers & Discount Codes"}
          description={
            isAr
              ? "إدارة رموز القسائم الترويجية القابلة للاسترداد في تجارب ووجهات إي ثري الترفيهية."
              : "Manage promotional coupon codes redeemable at specific entertainment attractions."
          }
          icon={<Tag className="w-5 h-5 text-[var(--color-primary)]" />}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {isAr ? `${discounts.length} عروض فعالة` : `${discounts.length} Active Offers`}
            </span>
          }
        >
          {/* Create Discount Form */}
          <div className="p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)]/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {isAr ? "إنشاء عرض خصم ترويجي جديد" : "Create New Discount Offer"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  {isAr ? "الوجهة المستهدفة" : "Target Attraction"}
                </label>
                <select
                  value={newDiscount.attractionId}
                  onChange={(e) => setNewDiscount({ ...newDiscount, attractionId: e.target.value })}
                  className="w-full h-10 px-3 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  {attractions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {isAr ? a.nameAr || a.nameEn : a.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  {isAr ? "رمز القسيمة" : "Promo Code"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER25"
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                  className="w-full h-10 px-3 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  {isAr ? "نسبة الخصم %" : "Discount %"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="25"
                    value={newDiscount.discount}
                    onChange={(e) => setNewDiscount({ ...newDiscount, discount: e.target.value })}
                    className="w-full h-10 px-3 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                  <AdminButton
                    variant="primary"
                    size="sm"
                    onClick={handleCreateDiscount}
                    disabled={loadingDiscounts || !newDiscount.code || !newDiscount.discount}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="h-10 px-4 shrink-0 font-bold"
                  >
                    {isAr ? "إضافة" : "Add"}
                  </AdminButton>
                </div>
              </div>
            </div>
          </div>

          {/* Discounts Roster */}
          <div className="space-y-2">
            {discounts.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
                {isAr ? "لا توجد رموز خصم ترويجية مضافة حالياً." : "No promo codes created yet."}
              </p>
            ) : (
              discounts.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-default)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 font-mono font-bold text-xs border border-purple-500/20">
                      {d.code}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {d.attraction?.nameEn || (isAr ? "جميع التجارب" : "All Attractions")}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-bold ms-2">
                        {d.discount}% {isAr ? "خصم" : "OFF"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDiscount(d.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title={isAr ? "حذف العرض الترويجي" : "Delete Promo"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </DashboardSectionCard>
      )}

      {/* 4. SEO */}
      {activeTab === "SEO" && (
        <DashboardSectionCard
          title={isAr ? "بيانات محركات البحث (SEO)" : "SEO Metadata"}
          description={
            isAr
              ? "البيانات الوصفية لمحركات البحث ووسوم المعاينة لشبكات التواصل الاجتماعي."
              : "Search engine metadata and OpenGraph social preview tags."
          }
          icon={<Globe className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                {isAr ? "عنوان صفحة الميتا (SEO Title)" : "SEO Meta Title"}
              </label>
              <input
                type="text"
                value={pageSettings.seo?.title || ""}
                onChange={(e) => updateSettings((p) => ({ ...p, seo: { ...(p.seo || {}), title: e.target.value } }))}
                placeholder={isAr ? "جدول الفعاليات والتجارب | إي ثري قطر" : "Events & Calendar | E3 Qatar"}
                className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                {isAr ? "الوصف الوصفي للميتا (SEO Description)" : "SEO Meta Description"}
              </label>
              <textarea
                rows={2}
                value={pageSettings.seo?.description || ""}
                onChange={(e) => updateSettings((p) => ({ ...p, seo: { ...(p.seo || {}), description: e.target.value } }))}
                placeholder={
                  isAr
                    ? "استكشف الفعاليات القادمة والمهرجانات الترفيهية في قطر."
                    : "Browse upcoming events and entertainment festivals in Qatar."
                }
                className="w-full p-3 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        </DashboardSectionCard>
      )}

      {/* Sticky Bottom Actions */}
      <DashboardStickyActions
        onSave={handleSaveSettings}
        isSaving={saving}
        isUnsaved={isDirty}
        onDiscard={() => {
          const confirmMessage = isAr ? "هل أنت متأكد من إلغاء التغييرات غير المحفوظة؟" : "Discard unsaved changes?";
          if (confirm(confirmMessage)) {
            window.location.reload();
          }
        }}
      />
    </DashboardPageShell>
  );
}
