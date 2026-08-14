"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, Calendar, Sparkles, Tag, Globe, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
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

const SECTIONS: EditorSectionItem[] = [
  { id: "HERO", label: "1. Hero Titles & Copy" },
  { id: "MEDIA", label: "2. Hero Media" },
  { id: "DISCOUNTS", label: "3. Promo Discounts" },
  { id: "SEO", label: "4. SEO Metadata" },
];

export function CalendarPageManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("HERO");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [pageSettings, setPageSettings] = useState<PageSettings>({
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
  });

  const [discounts, setDiscounts] = useState<DiscountOffer[]>([]);
  const [attractions, setAttractions] = useState<{ id: string; nameEn: string }[]>([]);
  const [newDiscount, setNewDiscount] = useState({ attractionId: "", code: "", discount: "" });
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);

  useEffect(() => {
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
  }, []);

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
        toast("Calendar Page settings saved successfully!", "success");
      } else {
        toast("Failed to save Calendar settings", "error");
      }
    } catch (error) {
      toast("Error saving settings", "error");
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
        toast("Discount offer created successfully!", "success");
      } else {
        toast("Failed to create discount offer", "error");
      }
    } catch (e) {
      toast("Error creating discount offer", "error");
    } finally {
      setLoadingDiscounts(false);
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotional offer?")) return;
    try {
      const res = await fetch(`/api/b2c/offers?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDiscounts(discounts.filter((d) => d.id !== id));
        toast("Discount deleted", "success");
      }
    } catch (error) {
      toast("Failed to delete discount", "error");
    }
  };

  if (loading) {
    return <DashboardLoadingState title="Loading Calendar Page Editor..." type="skeleton" />;
  }

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      {/* Header */}
      <DashboardPageHeader
        title="Events & Calendar Page Editor"
        description="Configure events schedule, hero banner media, seasonal promo discounts, and calendar metadata (/b2c/calendar)."
        breadcrumbs={[
          { label: "B2C Pages", href: "/dashboard/b2c/landing" },
          { label: "Calendar Page Editor" },
        ]}
        badge={{ label: "B2C Public", variant: "purple" }}
        previewUrl="/b2c/calendar"
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: saving ? "Saving..." : "Save Calendar Settings",
          onClick: handleSaveSettings,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      {/* Section Navigator */}
      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeTab}
        onSectionChange={setActiveTab}
      />

      {/* 1. HERO TITLES */}
      {activeTab === "HERO" && (
        <DashboardSectionCard
          title="Hero Titles & Copy"
          description="Opening headlines displayed on the live events and calendar directory banner."
          icon={<Calendar className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          <DashboardBilingualField
            label="Calendar Page Title"
            valueEn={pageSettings.titleEn || ""}
            valueAr={pageSettings.titleAr || ""}
            onChangeEn={(val) => updateSettings((p) => ({ ...p, titleEn: val }))}
            onChangeAr={(val) => updateSettings((p) => ({ ...p, titleAr: val }))}
            placeholderEn="e.g. Events & Entertainment Calendar"
            placeholderAr="مثال: جدول الفعاليات والتجارب"
          />

          <DashboardBilingualField
            label="Tagline & Narrative Description"
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
          title="Calendar Hero Media Banner"
          subtitle="Universal media configuration supporting Video, Image, 3D Canvas, IFrame, and Mobile Fallbacks."
          value={pageSettings.heroMedia || DEFAULT_UNIVERSAL_MEDIA}
          onChange={(heroMedia) => updateSettings((p) => ({ ...p, heroMedia }))}
          accentColor="purple"
        />
      )}

      {/* 3. PROMO DISCOUNTS */}
      {activeTab === "DISCOUNTS" && (
        <DashboardSectionCard
          title="Active Promotional Offers & Discount Codes"
          description="Manage promotional coupon codes redeemable at specific entertainment attractions."
          icon={<Tag className="w-5 h-5 text-[var(--color-primary)]" />}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {discounts.length} Active Offers
            </span>
          }
        >
          {/* Create Discount Form */}
          <div className="p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)]/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Create New Discount Offer
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Target Attraction</label>
                <select
                  value={newDiscount.attractionId}
                  onChange={(e) => setNewDiscount({ ...newDiscount, attractionId: e.target.value })}
                  className="w-full h-10 px-3 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  {attractions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Promo Code</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER25"
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                  className="w-full h-10 px-3 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Discount %</label>
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
                    Add
                  </AdminButton>
                </div>
              </div>
            </div>
          </div>

          {/* Discounts Roster */}
          <div className="space-y-2">
            {discounts.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">No promo codes created yet.</p>
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
                      <span className="text-xs font-bold text-[var(--text-primary)]">{d.attraction?.nameEn || "All Attractions"}</span>
                      <span className="text-[11px] text-emerald-400 font-bold ms-2">{d.discount}% OFF</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDiscount(d.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Delete Promo"
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
          title="SEO Metadata"
          description="Search engine metadata and OpenGraph social preview tags."
          icon={<Globe className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                SEO Meta Title
              </label>
              <input
                type="text"
                value={pageSettings.seo?.title || ""}
                onChange={(e) => updateSettings((p) => ({ ...p, seo: { ...(p.seo || {}), title: e.target.value } }))}
                placeholder="Events & Calendar | E3 Qatar"
                className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                SEO Meta Description
              </label>
              <textarea
                rows={2}
                value={pageSettings.seo?.description || ""}
                onChange={(e) => updateSettings((p) => ({ ...p, seo: { ...(p.seo || {}), description: e.target.value } }))}
                placeholder="Browse upcoming events and entertainment festivals in Qatar."
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
          if (confirm("Discard unsaved changes?")) {
            window.location.reload();
          }
        }}
      />
    </DashboardPageShell>
  );
}
