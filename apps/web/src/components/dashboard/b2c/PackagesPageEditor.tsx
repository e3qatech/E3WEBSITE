"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Gift, Sparkles, SlidersHorizontal, Layers, CheckCircle2 } from "lucide-react";
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

const SECTIONS: EditorSectionItem[] = [
  { id: "headlines", label: "1. Hero Copy & Headlines" },
  { id: "ctas", label: "2. CTAs, Pricing & Badges" },
  { id: "hero-media", label: "3. Hero Media Background" },
  { id: "footer-media", label: "4. Footer Media & Poster" },
];

export function PackagesPageEditor() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("headlines");
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
        const res = await fetch("/api/cms/pages/b2c-packages-page?t=" + Date.now());
        if (res.ok && active) {
          const json = await res.json();
          if (json?.data?.content) {
            setPageConfig((prev) => ({ ...prev, ...json.data.content }));
          }
        }
      } catch (_e) {
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const updateField = (updater: (prev: typeof pageConfig) => typeof pageConfig) => {
    setPageConfig((prev) => {
      const next = updater(prev);
      setIsDirty(true);
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
      setLastSaved(new Date());
      toast("Packages Page Editor saved successfully!", "success");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "Error saving page settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardLoadingState title="Loading Packages Page Editor..." type="skeleton" />;
  }

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      {/* Standard Header */}
      <DashboardPageHeader
        title="Packages & Celebrations Page Editor"
        description="Manage packages landing page layout, universal hero and footer media assets, CTAs, VIP badges, and SEO metadata (/b2c/packages)."
        breadcrumbs={[
          { label: "B2C Pages", href: "/dashboard/b2c/landing" },
          { label: "Packages Page Editor" },
        ]}
        badge={{ label: "B2C Public", variant: "purple" }}
        previewUrl="/b2c/packages"
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: saving ? "Saving..." : "Save Page Settings",
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
        secondaryAction={
          <DashboardLanguageSwitch mode={languageMode} onModeChange={setLanguageMode} />
        }
      />

      {/* 4-Section Long-Page Navigator */}
      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSelectSection={setActiveSectionId}
        dirtySections={isDirty ? [activeSectionId] : []}
      />

      {/* 1. Hero Headlines Card */}
      <div id="headlines" className={activeSectionId === "headlines" || !activeSectionId ? "block" : "hidden"}>
        <DashboardSectionCard
          title="Hero Eyebrow & Headlines"
          description="Opening headlines displayed on the packages page header banner."
          icon={<Gift className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          <DashboardBilingualField
            label="Eyebrow Tag"
            valueEn={pageConfig.eyebrowEn}
            valueAr={pageConfig.eyebrowAr}
            onChangeEn={(val) => updateField((p) => ({ ...p, eyebrowEn: val }))}
            onChangeAr={(val) => updateField((p) => ({ ...p, eyebrowAr: val }))}
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Main Page Title"
            valueEn={pageConfig.titleEn}
            valueAr={pageConfig.titleAr}
            onChangeEn={(val) => updateField((p) => ({ ...p, titleEn: val }))}
            onChangeAr={(val) => updateField((p) => ({ ...p, titleAr: val }))}
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Page Description"
            type="textarea"
            rows={3}
            valueEn={pageConfig.descEn}
            valueAr={pageConfig.descAr}
            onChangeEn={(val) => updateField((p) => ({ ...p, descEn: val }))}
            onChangeAr={(val) => updateField((p) => ({ ...p, descAr: val }))}
            mode={languageMode}
          />
        </DashboardSectionCard>
      </div>

      {/* 2. CTAs and Badges Card */}
      <div id="ctas" className={activeSectionId === "ctas" ? "block" : "hidden"}>
        <DashboardSectionCard
          title="Call to Action Buttons & Campaign Badge"
          description="Configure action buttons and campaign promo badges."
          icon={<SlidersHorizontal className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          <DashboardBilingualField
            label="Primary Action Button"
            valueEn={pageConfig.primaryCtaEn}
            valueAr={pageConfig.primaryCtaAr}
            onChangeEn={(val) => updateField((p) => ({ ...p, primaryCtaEn: val }))}
            onChangeAr={(val) => updateField((p) => ({ ...p, primaryCtaAr: val }))}
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Secondary Action Button"
            valueEn={pageConfig.secondaryCtaEn}
            valueAr={pageConfig.secondaryCtaAr}
            onChangeEn={(val) => updateField((p) => ({ ...p, secondaryCtaEn: val }))}
            onChangeAr={(val) => updateField((p) => ({ ...p, secondaryCtaAr: val }))}
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Campaign Badge Label"
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
          title="Packages Hero Media Banner"
          subtitle="Universal hero media configuration supporting Video, Image, 3D Canvas, IFrame, and Mobile Fallbacks."
          value={pageConfig.heroMedia}
          onChange={(heroMedia: UniversalMediaConfig) => updateField((p) => ({ ...p, heroMedia }))}
          accentColor="purple"
        />
      </div>

      {/* 4. Universal Footer Media Section */}
      <div id="footer-media" className={activeSectionId === "footer-media" ? "block" : "hidden"}>
        <UniversalMediaSectionEditor
          title="Packages Footer Banner Media"
          subtitle="Universal footer media configuration supporting Video, Image, 3D Canvas, and Mobile Fallbacks."
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
          if (window.confirm("Discard changes?")) {
            window.location.reload();
          }
        }}
      />
    </DashboardPageShell>
  );
}
