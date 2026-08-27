"use client";

import React, { useState } from "react";
import { Plus, Trash2, Save, Globe, BookOpen, Heart, BarChart3, Users, Sparkles, Compass } from "lucide-react";
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
  AdminButton,
} from "@/components/dashboard/ui";

const SECTIONS: EditorSectionItem[] = [
  { id: "header", label: "1. Hero Header", labelAr: "1. قسم البداية والواجهة" },
  { id: "story", label: "2. Corporate Story", labelAr: "2. قصة الشركة والتأسيس" },
  { id: "stats", label: "3. Scale & Milestone Stats", labelAr: "3. إحصائيات وأرقام الإنجاز" },
  { id: "values", label: "4. Corporate Values", labelAr: "4. قيم ومبادئ الشركة" },
  { id: "leadership", label: "5. Leadership Section", labelAr: "5. فريق القيادة التنفيذية" },
  { id: "cta", label: "6. Partnership CTA", labelAr: "6. دعوة التعاون والشراكة" },
  { id: "seo", label: "7. SEO Metadata", labelAr: "7. بيانات محركات البحث (SEO)" },
];

export function B2BAboutEditor({ initialData }: { initialData: any }) {
  const { toast } = useToast();
  const [activeSectionId, setActiveSectionId] = useState<string>("header");
  const [languageMode, setLanguageMode] = useState<LanguageEditMode>("both");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [data, setData] = useState({
    header: {
      eyebrowEn: initialData?.header?.eyebrowEn || "WHO WE ARE & OUR HERITAGE",
      eyebrowAr: initialData?.header?.eyebrowAr || "من نحن وإرثنا الريادي",
      titleEn: initialData?.header?.titleEn || "We Are E3.",
      titleAr: initialData?.header?.titleAr || "نحن إي ثري.",
      subtitleEn: initialData?.header?.subtitleEn || "Event Engineering & Destination Experts. We turn ambitious creative visions into flawless operational reality across Qatar and the region.",
      subtitleAr: initialData?.header?.subtitleAr || "خبراء هندسة الفعاليات وتطوير الوجهات. نحول الرؤى الإبداعية الطموحة إلى واقع تشغيلي استثنائي في قطر والمنطقة.",
      mediaType: initialData?.header?.mediaType || "IMAGE",
      mediaUrl: initialData?.header?.mediaUrl || "",
      fallbackImageUrl: initialData?.header?.fallbackImageUrl || "",
    },
    story: {
      eyebrowEn: initialData?.story?.eyebrowEn || "OUR STORY & JOURNEY",
      eyebrowAr: initialData?.story?.eyebrowAr || "مسيرتنا وقصة التأسيس",
      titleEn: initialData?.story?.titleEn || "Engineering Landmark Experiences",
      titleAr: initialData?.story?.titleAr || "هندسة تجارب رائدة لا تُنسى",
      contentEn: initialData?.story?.contentEn || "",
      contentAr: initialData?.story?.contentAr || "",
      mediaType: initialData?.story?.mediaType || "IMAGE",
      mediaUrl: initialData?.story?.mediaUrl || initialData?.story?.imageMediaId || "",
      fallbackImageUrl: initialData?.story?.fallbackImageUrl || "",
    },
    stats: {
      enabled: initialData?.stats?.enabled !== false,
      eyebrowEn: initialData?.stats?.eyebrowEn || "BY THE NUMBERS",
      eyebrowAr: initialData?.stats?.eyebrowAr || "إنجازاتنا بالأرقام",
      titleEn: initialData?.stats?.titleEn || "Operational Scale & Milestone Impact",
      titleAr: initialData?.stats?.titleAr || "حجم العمليات والأثر المحقق",
      items: Array.isArray(initialData?.stats?.items) && initialData.stats.items.length > 0
        ? initialData.stats.items
        : [
            { id: "stat_1", value: "10+", labelEn: "Years in MENA", labelAr: "سنوات من الريادة في المنطقة", prefix: "", suffix: "" },
            { id: "stat_2", value: "120+", labelEn: "Industry Specialists", labelAr: "خبير ومتخصص", prefix: "", suffix: "" },
            { id: "stat_3", value: "25+", labelEn: "Mega Landmarks Delivered", labelAr: "مشروع ووجهة كبرى", prefix: "", suffix: "" },
            { id: "stat_4", value: "1M+", labelEn: "Visitors Hosted", labelAr: "زائر استمتع بتجاربنا", prefix: "", suffix: "" },
          ],
    },
    values: Array.isArray(initialData?.values) && initialData.values.length > 0
      ? initialData.values
      : [
          {
            titleEn: "Engineering Precision",
            titleAr: "الدقة الهندسية",
            descEn: "We treat creativity with the rigor of structural engineering. No detail is too small, no safety margin compromised.",
            descAr: "نتعامل مع الإبداع بصرامة الهندسة الإنشائية. لا تفاصيل صغيرة جداً، ولا مساومة على معايير الأمان والسلامة.",
          },
          {
            titleEn: "Operational Excellence",
            titleAr: "التميز التشغيلي",
            descEn: "Visionary designs create lasting impact through flawless live execution. We take complete ownership of the guest journey.",
            descAr: "التصاميم الإبداعية تكتسب قيمتها بالتنفيذ المتقن. نتحمل المسؤولية الكاملة عن سير العمليات وتجربة الضيوف.",
          },
          {
            titleEn: "Cultural Resonance",
            titleAr: "الأصالة الثقافية",
            descEn: "Rooted in Qatar, built for the world. Our experiences honor local identity while setting international industry benchmarks.",
            descAr: "جذورنا في قطر، وصنعنا للعالم. نحترم الهوية والسياق المحلي مع وضع معايير عالمية المستوى.",
          },
        ],
    leadership: {
      enabled: initialData?.leadership?.enabled !== false,
      eyebrowEn: initialData?.leadership?.eyebrowEn || "EXECUTIVE TEAM",
      eyebrowAr: initialData?.leadership?.eyebrowAr || "فريق القيادة",
      titleEn: initialData?.leadership?.titleEn || "The Visionaries Behind E3",
      titleAr: initialData?.leadership?.titleAr || "القيادة والخبرات خلف إي ثري",
      subtitleEn: initialData?.leadership?.subtitleEn || "A multidisciplinary leadership team combining global experiential knowledge with local execution precision.",
      subtitleAr: initialData?.leadership?.subtitleAr || "فريق قيادي متعدد التخصصات يجمع بين الخبرة الترفيهية العالمية والدقة التنفيذية المحلية.",
      maxProfiles: initialData?.leadership?.maxProfiles || 6,
    },
    cta: {
      enabled: initialData?.cta?.enabled !== false,
      eyebrowEn: initialData?.cta?.eyebrowEn || "COLLABORATION & PROCUREMENT",
      eyebrowAr: initialData?.cta?.eyebrowAr || "التعاون والشراكات",
      headlineEn: initialData?.cta?.headlineEn || "Ready to Engineer Your Next Landmark Project?",
      headlineAr: initialData?.cta?.headlineAr || "هل أنت مستعد لتنفيذ مشروعك الترفيهي القادم؟",
      descriptionEn: initialData?.cta?.descriptionEn || "Partner with E3 Qatar to conceptualize, engineer, and operate unforgettable entertainment destinations.",
      descriptionAr: initialData?.cta?.descriptionAr || "شارك إي ثري قطر لتصميم وهندسة وتشغيل وجهات وفعاليات ترفيهية استثنائية تلهم الجماهير.",
      primaryCtaTextEn: initialData?.cta?.primaryCtaTextEn || "Submit RFP Inquiry",
      primaryCtaTextAr: initialData?.cta?.primaryCtaTextAr || "تقديم طلب عروض",
      primaryCtaUrl: initialData?.cta?.primaryCtaUrl || "/b2b/contact",
      secondaryCtaTextEn: initialData?.cta?.secondaryCtaTextEn || "Explore Our Case Studies",
      secondaryCtaTextAr: initialData?.cta?.secondaryCtaTextAr || "استكشف دراسات الحالة",
      secondaryCtaUrl: initialData?.cta?.secondaryCtaUrl || "/b2b/case-studies",
    },
  });

  const [seo, setSeo] = useState<any>(initialData?.seo || {});

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/pages/b2b-about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data, seo }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsDirty(false);
      setLastSaved(new Date());
      toast("B2B About Us page updated successfully.", "success");
    } catch (_e) {
      toast("Failed to save B2B About Us page.", "error");
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

  // Values Handlers
  const addValue = () => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      values: [...prev.values, { titleEn: "", titleAr: "", descEn: "", descAr: "" }],
    }));
  };

  const removeValue = (index: number) => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      values: prev.values.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateValue = (index: number, field: string, value: string) => {
    setIsDirty(true);
    setData((prev) => {
      const newValues = [...prev.values];
      newValues[index] = { ...newValues[index], [field]: value };
      return { ...prev, values: newValues };
    });
  };

  // Stats Handlers
  const addStat = () => {
    setIsDirty(true);
    const newId = `stat_${Date.now()}`;
    setData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        items: [
          ...prev.stats.items,
          { id: newId, value: "100+", labelEn: "New Metric", labelAr: "مؤشر جديد", prefix: "", suffix: "" },
        ],
      },
    }));
  };

  const removeStat = (index: number) => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        items: prev.stats.items.filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const updateStat = (index: number, field: string, value: string) => {
    setIsDirty(true);
    setData((prev) => {
      const newStats = [...prev.stats.items];
      newStats[index] = { ...newStats[index], [field]: value };
      return {
        ...prev,
        stats: {
          ...prev.stats,
          items: newStats,
        },
      };
    });
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      {/* Header */}
      <DashboardPageHeader
        title="B2B About Us Editor"
        description="Manage the brand narrative, vision, leadership story, and core values for the corporate portal (/b2b/about)."
        breadcrumbs={[
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "About Us Editor" },
        ]}
        badge={{ label: "B2B Public", variant: "warning" }}
        previewUrl="/b2b/about"
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

      {/* 1. HERO HEADER */}
      {activeSectionId === "header" && (
        <DashboardSectionCard
          title="Hero Header Section"
          description="Main opening headline and banner media for the About Us page."
          icon={<Globe className="w-5 h-5 text-emerald-400" />}
        >
          <DashboardBilingualField
            label="Eyebrow Tag"
            valueEn={data.header.eyebrowEn}
            valueAr={data.header.eyebrowAr}
            onChangeEn={(val) => handleChange("header", "eyebrowEn", val)}
            onChangeAr={(val) => handleChange("header", "eyebrowAr", val)}
            placeholderEn="e.g. WHO WE ARE & OUR HERITAGE"
            placeholderAr="مثال: من نحن وإرثنا الريادي"
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Page Title"
            valueEn={data.header.titleEn}
            valueAr={data.header.titleAr}
            onChangeEn={(val) => handleChange("header", "titleEn", val)}
            onChangeAr={(val) => handleChange("header", "titleAr", val)}
            placeholderEn="e.g. We Are E3."
            placeholderAr="مثال: نحن إي ثري."
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Subtitle & Mission Statement"
            type="textarea"
            rows={3}
            valueEn={data.header.subtitleEn}
            valueAr={data.header.subtitleAr}
            onChangeEn={(val) => handleChange("header", "subtitleEn", val)}
            onChangeAr={(val) => handleChange("header", "subtitleAr", val)}
            placeholderEn="Enter mission statement..."
            placeholderAr="أدخل بيان المهمة والرؤية..."
            mode={languageMode}
          />

          <div className="space-y-2 pt-2 border-t border-[var(--border-level-1)]">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Hero Media Asset
            </label>
            <AdminMediaPicker
              value={data.header.mediaUrl}
              onChange={(url) => handleChange("header", "mediaUrl", url)}
            />
          </div>
        </DashboardSectionCard>
      )}

      {/* 2. CORPORATE STORY */}
      {activeSectionId === "story" && (
        <DashboardSectionCard
          title="Corporate Story & Heritage"
          description="Detailed brand story, event engineering philosophy, and operational scale in Qatar."
          icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
        >
          <DashboardBilingualField
            label="Eyebrow Tag"
            valueEn={data.story.eyebrowEn}
            valueAr={data.story.eyebrowAr}
            onChangeEn={(val) => handleChange("story", "eyebrowEn", val)}
            onChangeAr={(val) => handleChange("story", "eyebrowAr", val)}
            placeholderEn="e.g. OUR STORY & JOURNEY"
            placeholderAr="مثال: مسيرتنا وقصة التأسيس"
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Story Section Heading"
            valueEn={data.story.titleEn}
            valueAr={data.story.titleAr}
            onChangeEn={(val) => handleChange("story", "titleEn", val)}
            onChangeAr={(val) => handleChange("story", "titleAr", val)}
            placeholderEn="e.g. Engineering Landmark Experiences"
            placeholderAr="مثال: هندسة تجارب رائدة لا تُنسى"
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Narrative Story Content"
            type="textarea"
            rows={7}
            valueEn={data.story.contentEn}
            valueAr={data.story.contentAr}
            onChangeEn={(val) => handleChange("story", "contentEn", val)}
            onChangeAr={(val) => handleChange("story", "contentAr", val)}
            placeholderEn="Enter narrative story content..."
            placeholderAr="أدخل النص السردي..."
            mode={languageMode}
          />

          <div className="space-y-2 pt-2 border-t border-[var(--border-level-1)]">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Story Media Asset
            </label>
            <AdminMediaPicker
              value={data.story.mediaUrl}
              onChange={(url) => handleChange("story", "mediaUrl", url)}
            />
          </div>
        </DashboardSectionCard>
      )}

      {/* 3. SCALE & STATS */}
      {activeSectionId === "stats" && (
        <DashboardSectionCard
          title="Scale & Milestone Stats"
          description="Operational numbers highlighting E3's industry scale, years of experience, and visitor volume."
          icon={<BarChart3 className="w-5 h-5 text-emerald-400" />}
          headerAction={
            <AdminButton
              variant="outline"
              size="sm"
              onClick={addStat}
              leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-500" />}
              className="text-xs"
            >
              Add Stat
            </AdminButton>
          }
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="statsEnabled"
              checked={data.stats.enabled}
              onChange={(e) => handleChange("stats", "enabled", e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
            />
            <label htmlFor="statsEnabled" className="text-xs font-bold text-[var(--text-primary)]">
              Display Milestone Stats Bar
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <DashboardBilingualField
              label="Stats Eyebrow"
              valueEn={data.stats.eyebrowEn}
              valueAr={data.stats.eyebrowAr}
              onChangeEn={(val) => handleChange("stats", "eyebrowEn", val)}
              onChangeAr={(val) => handleChange("stats", "eyebrowAr", val)}
              mode={languageMode}
            />
            <DashboardBilingualField
              label="Stats Title"
              valueEn={data.stats.titleEn}
              valueAr={data.stats.titleAr}
              onChangeEn={(val) => handleChange("stats", "titleEn", val)}
              onChangeAr={(val) => handleChange("stats", "titleAr", val)}
              mode={languageMode}
            />
          </div>

          <div className="space-y-4">
            {data.stats.items.map((stat: any, idx: number) => (
              <div
                key={stat.id || idx}
                className="p-4 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)]/60 flex flex-col md:flex-row items-start md:items-center gap-4"
              >
                <div className="w-full md:w-32">
                  <label className="block text-[10px] font-bold uppercase text-[var(--text-tertiary)] mb-1">
                    Value / Number
                  </label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(idx, "value", e.target.value)}
                    placeholder="120+"
                    className="w-full h-9 px-3 bg-[var(--bg-level-2)] border border-[var(--border-level-1)] rounded-xl text-xs font-mono font-bold text-emerald-500"
                  />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--text-tertiary)] mb-1">
                      Label (EN)
                    </label>
                    <input
                      type="text"
                      value={stat.labelEn}
                      onChange={(e) => updateStat(idx, "labelEn", e.target.value)}
                      placeholder="Industry Specialists"
                      className="w-full h-9 px-3 bg-[var(--bg-level-2)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--text-tertiary)] mb-1">
                      Label (AR)
                    </label>
                    <input
                      type="text"
                      value={stat.labelAr}
                      onChange={(e) => updateStat(idx, "labelAr", e.target.value)}
                      dir="rtl"
                      placeholder="خبير ومتخصص"
                      className="w-full h-9 px-3 bg-[var(--bg-level-2)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeStat(idx)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors self-end md:self-center cursor-pointer"
                  title="Remove Stat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </DashboardSectionCard>
      )}

      {/* 4. CORPORATE VALUES */}
      {activeSectionId === "values" && (
        <DashboardSectionCard
          title="Corporate Core Values"
          description="Foundational principles guiding E3's design, innovation, and client partnerships."
          icon={<Heart className="w-5 h-5 text-emerald-400" />}
          headerAction={
            <AdminButton
              variant="outline"
              size="sm"
              onClick={addValue}
              leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-500" />}
              className="text-xs"
            >
              Add Value
            </AdminButton>
          }
        >
          <div className="space-y-4">
            {data.values.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">No corporate values defined yet.</p>
            ) : (
              data.values.map((val: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)]/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Principle #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeValue(idx)}
                      className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Remove Value"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <DashboardBilingualField
                    label="Value Title"
                    valueEn={val.titleEn || ""}
                    valueAr={val.titleAr || ""}
                    onChangeEn={(v) => updateValue(idx, "titleEn", v)}
                    onChangeAr={(v) => updateValue(idx, "titleAr", v)}
                    mode={languageMode}
                  />

                  <DashboardBilingualField
                    label="Value Description"
                    type="textarea"
                    rows={2}
                    valueEn={val.descEn || ""}
                    valueAr={val.descAr || ""}
                    onChangeEn={(v) => updateValue(idx, "descEn", v)}
                    onChangeAr={(v) => updateValue(idx, "descAr", v)}
                    mode={languageMode}
                  />
                </div>
              ))
            )}
          </div>
        </DashboardSectionCard>
      )}

      {/* 5. LEADERSHIP */}
      {activeSectionId === "leadership" && (
        <DashboardSectionCard
          title="Leadership & Executive Team"
          description="Copy and parameters for displaying key executives and operational leaders."
          icon={<Users className="w-5 h-5 text-emerald-400" />}
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="leadershipEnabled"
              checked={data.leadership.enabled}
              onChange={(e) => handleChange("leadership", "enabled", e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
            />
            <label htmlFor="leadershipEnabled" className="text-xs font-bold text-[var(--text-primary)]">
              Display Leadership Section
            </label>
          </div>

          <DashboardBilingualField
            label="Section Eyebrow"
            valueEn={data.leadership.eyebrowEn}
            valueAr={data.leadership.eyebrowAr}
            onChangeEn={(val) => handleChange("leadership", "eyebrowEn", val)}
            onChangeAr={(val) => handleChange("leadership", "eyebrowAr", val)}
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Section Title"
            valueEn={data.leadership.titleEn}
            valueAr={data.leadership.titleAr}
            onChangeEn={(val) => handleChange("leadership", "titleEn", val)}
            onChangeAr={(val) => handleChange("leadership", "titleAr", val)}
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Section Subtitle"
            type="textarea"
            rows={2}
            valueEn={data.leadership.subtitleEn}
            valueAr={data.leadership.subtitleAr}
            onChangeEn={(val) => handleChange("leadership", "subtitleEn", val)}
            onChangeAr={(val) => handleChange("leadership", "subtitleAr", val)}
            mode={languageMode}
          />

          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Maximum Profiles to Display
            </label>
            <input
              type="number"
              min={1}
              max={24}
              value={data.leadership.maxProfiles}
              onChange={(e) => handleChange("leadership", "maxProfiles", parseInt(e.target.value) || 6)}
              className="w-32 h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)]"
            />
          </div>
        </DashboardSectionCard>
      )}

      {/* 6. PARTNERSHIP CTA */}
      {activeSectionId === "cta" && (
        <DashboardSectionCard
          title="Partnership & Engagement CTA"
          description="Bottom gateway inviting enterprise clients and partners to start a project with E3."
          icon={<Sparkles className="w-5 h-5 text-emerald-400" />}
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="ctaEnabled"
              checked={data.cta.enabled}
              onChange={(e) => handleChange("cta", "enabled", e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
            />
            <label htmlFor="ctaEnabled" className="text-xs font-bold text-[var(--text-primary)]">
              Display Partnership CTA Section
            </label>
          </div>

          <DashboardBilingualField
            label="CTA Eyebrow"
            valueEn={data.cta.eyebrowEn}
            valueAr={data.cta.eyebrowAr}
            onChangeEn={(val) => handleChange("cta", "eyebrowEn", val)}
            onChangeAr={(val) => handleChange("cta", "eyebrowAr", val)}
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Headline"
            valueEn={data.cta.headlineEn}
            valueAr={data.cta.headlineAr}
            onChangeEn={(val) => handleChange("cta", "headlineEn", val)}
            onChangeAr={(val) => handleChange("cta", "headlineAr", val)}
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Description"
            type="textarea"
            rows={2}
            valueEn={data.cta.descriptionEn}
            valueAr={data.cta.descriptionAr}
            onChangeEn={(val) => handleChange("cta", "descriptionEn", val)}
            onChangeAr={(val) => handleChange("cta", "descriptionAr", val)}
            mode={languageMode}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <DashboardBilingualField
              label="Primary Button Label"
              valueEn={data.cta.primaryCtaTextEn}
              valueAr={data.cta.primaryCtaTextAr}
              onChangeEn={(val) => handleChange("cta", "primaryCtaTextEn", val)}
              onChangeAr={(val) => handleChange("cta", "primaryCtaTextAr", val)}
              mode={languageMode}
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Primary Button URL
              </label>
              <input
                type="text"
                value={data.cta.primaryCtaUrl}
                onChange={(e) => handleChange("cta", "primaryCtaUrl", e.target.value)}
                className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <DashboardBilingualField
              label="Secondary Button Label"
              valueEn={data.cta.secondaryCtaTextEn}
              valueAr={data.cta.secondaryCtaTextAr}
              onChangeEn={(val) => handleChange("cta", "secondaryCtaTextEn", val)}
              onChangeAr={(val) => handleChange("cta", "secondaryCtaTextAr", val)}
              mode={languageMode}
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Secondary Button URL
              </label>
              <input
                type="text"
                value={data.cta.secondaryCtaUrl}
                onChange={(e) => handleChange("cta", "secondaryCtaUrl", e.target.value)}
                className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)]"
              />
            </div>
          </div>
        </DashboardSectionCard>
      )}

      {/* 7. SEO */}
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
