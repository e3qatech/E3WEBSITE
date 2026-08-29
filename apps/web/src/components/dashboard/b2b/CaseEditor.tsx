"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MediaUploader } from "@/components/shared/MediaUploader";
import { AdminSeoCustomizer } from "@/components/dashboard/ui/AdminSeoCustomizer";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  EditorSectionItem,
} from "@/components/dashboard/ui";

const CASE_SECTIONS: EditorSectionItem[] = [
  { id: "general", label: "1. Core Details" },
  { id: "hero", label: "2. Hero Media" },
  { id: "narrative", label: "3. Narrative" },
  { id: "metrics", label: "4. Verified Metrics" },
  { id: "scope", label: "5. Scope & Timeline" },
  { id: "beforeAfter", label: "6. Before & After" },
  { id: "team", label: "7. Team & Behind Build" },
  { id: "testimonials", label: "8. Testimonials" },
  { id: "gallery", label: "9. Gallery" },
  { id: "seo", label: "10. SEO Settings" },
];

export function CaseEditor({
  initialData,
  attractions = [],
  teamMembers = [],
}: {
  initialData?: any;
  attractions?: any[];
  teamMembers?: any[];
}) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Fields
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [titleEn, setTitleEn] = useState(initialData?.titleEn || "");
  const [titleAr, setTitleAr] = useState(initialData?.titleAr || "");
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [category, setCategory] = useState(initialData?.category || "Corporate");
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());
  const [attractionId, setAttractionId] = useState(initialData?.attractionId || "");

  const [thumbnailMediaType, setThumbnailMediaType] = useState(initialData?.thumbnailMediaType || "IMAGE");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || "");

  const [heroMediaType, setHeroMediaType] = useState(initialData?.heroMediaType || "IMAGE");
  const [heroImageUrl, setHeroImageUrl] = useState(initialData?.heroImageUrl || "");

  const [clientLogoUrl, setClientLogoUrl] = useState(initialData?.clientLogoUrl || "");

  const [challengeEn, setChallengeEn] = useState(initialData?.challengeEn || "");
  const [challengeAr, setChallengeAr] = useState(initialData?.challengeAr || "");
  const [solutionEn, setSolutionEn] = useState(initialData?.solutionEn || "");
  const [solutionAr, setSolutionAr] = useState(initialData?.solutionAr || "");
  const [resultEn, setResultEn] = useState(initialData?.resultEn || "");
  const [resultAr, setResultAr] = useState(initialData?.resultAr || "");

  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [isVisible, setIsVisible] = useState(initialData?.isPublished ?? true);

  // Metrics
  const [metrics, setMetrics] = useState<any[]>(() => {
    let raw = initialData?.metrics;
    if (typeof raw === "string") {
      try { raw = JSON.parse(raw); } catch { raw = []; }
    }
    return Array.isArray(raw) ? raw : [];
  });

  // Scope & Timeline
  const rawTech = typeof initialData?.technicalSpecs === "string"
    ? (() => { try { return JSON.parse(initialData.technicalSpecs); } catch { return {}; } })()
    : (typeof initialData?.technicalSpecs === "object" && initialData?.technicalSpecs !== null ? initialData.technicalSpecs : {});

  const [durationEn, setDurationEn] = useState(rawTech?.durationEn || rawTech?.duration || "");
  const [durationAr, setDurationAr] = useState(rawTech?.durationAr || rawTech?.duration || "");
  const [scaleEn, setScaleEn] = useState(rawTech?.scaleEn || rawTech?.scale || "");
  const [scaleAr, setScaleAr] = useState(rawTech?.scaleAr || rawTech?.scale || "");
  const [locationEn, setLocationEn] = useState(rawTech?.locationEn || rawTech?.location || "");
  const [locationAr, setLocationAr] = useState(rawTech?.locationAr || rawTech?.location || "");
  const [deliverablesTextEn, setDeliverablesTextEn] = useState(
    Array.isArray(rawTech?.deliverablesEn)
      ? rawTech.deliverablesEn.join("\n")
      : typeof rawTech?.deliverablesEn === "string"
      ? rawTech.deliverablesEn
      : ""
  );
  const [deliverablesTextAr, setDeliverablesTextAr] = useState(
    Array.isArray(rawTech?.deliverablesAr)
      ? rawTech.deliverablesAr.join("\n")
      : typeof rawTech?.deliverablesAr === "string"
      ? rawTech.deliverablesAr
      : ""
  );

  // Services Used
  const [servicesUsedInput, setServicesUsedInput] = useState(() => {
    let raw = initialData?.servicesUsed;
    if (typeof raw === "string") {
      try { raw = JSON.parse(raw); } catch { return raw; }
    }
    if (Array.isArray(raw)) {
      return raw.map((s: any) => (typeof s === "string" ? s : s.slug || s.id)).join(", ");
    }
    return "";
  });

  // Before & After
  const rawBeforeAfter = typeof initialData?.beforeAfter === "string"
    ? (() => { try { return JSON.parse(initialData.beforeAfter); } catch { return {}; } })()
    : (typeof initialData?.beforeAfter === "object" && initialData?.beforeAfter !== null ? initialData.beforeAfter : {});

  const [beforeAfterEnabled, setBeforeAfterEnabled] = useState(rawBeforeAfter?.enabled ?? false);
  const [beforeImageUrl, setBeforeImageUrl] = useState(rawBeforeAfter?.beforeImageUrl || "");
  const [afterImageUrl, setAfterImageUrl] = useState(rawBeforeAfter?.afterImageUrl || "");
  const [beforeCaptionEn, setBeforeCaptionEn] = useState(rawBeforeAfter?.beforeCaptionEn || "");
  const [beforeCaptionAr, setBeforeCaptionAr] = useState(rawBeforeAfter?.beforeCaptionAr || "");
  const [afterCaptionEn, setAfterCaptionEn] = useState(rawBeforeAfter?.afterCaptionEn || "");
  const [afterCaptionAr, setAfterCaptionAr] = useState(rawBeforeAfter?.afterCaptionAr || "");

  // Testimonials, Gallery, Team, SEO
  const [testimonials, setTestimonials] = useState<any[]>(
    Array.isArray(initialData?.testimonials) ? initialData.testimonials : []
  );
  const [gallery, setGallery] = useState<any[]>(
    Array.isArray(initialData?.gallery) ? initialData.gallery : []
  );
  const [caseTeamMembers, setCaseTeamMembers] = useState<any[]>(
    Array.isArray(initialData?.teamMembers) ? initialData.teamMembers : []
  );
  const [seo, setSeo] = useState<any>(initialData?.seo || {});

  const handleSave = async () => {
    if (!slug || !titleEn || !titleAr) {
      alert("Slug and Titles are required");
      return;
    }

    setIsSaving(true);
    try {
      const technicalSpecs = {
        durationEn,
        durationAr,
        scaleEn,
        scaleAr,
        locationEn,
        locationAr,
        deliverablesEn: deliverablesTextEn.split("\n").map((s: string) => s.trim()).filter(Boolean),
        deliverablesAr: deliverablesTextAr.split("\n").map((s: string) => s.trim()).filter(Boolean),
      };

      const servicesUsed = servicesUsedInput
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

      const beforeAfter = beforeAfterEnabled
        ? {
            enabled: true,
            beforeImageUrl,
            afterImageUrl,
            beforeCaptionEn,
            beforeCaptionAr,
            afterCaptionEn,
            afterCaptionAr,
          }
        : null;

      const payload = {
        slug,
        titleEn,
        titleAr,
        clientName,
        year,
        category,
        heroMediaType,
        heroImageUrl,
        thumbnailMediaType,
        thumbnailUrl,
        clientLogoUrl,
        challengeEn,
        challengeAr,
        solutionEn,
        solutionAr,
        resultEn,
        resultAr,
        isFeatured,
        isPublished: isVisible,
        attractionId: attractionId || null,
        metrics,
        gallery,
        technicalSpecs,
        servicesUsed,
        beforeAfter,
        testimonials,
        teamMembers: caseTeamMembers,
        seo,
      };

      if (isEditing) {
        const targetId = initialData?.id || initialData?.slug || slug;
        const res = await fetch(`/api/b2b/cases/${encodeURIComponent(targetId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update");
      } else {
        const res = await fetch(`/api/b2b/cases`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, titleEn, titleAr }),
        });
        if (!res.ok) throw new Error("Failed to create. Slug might already exist.");
        const data = await res.json();

        await fetch(`/api/b2b/cases/${data.caseStudy.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      router.push("/dashboard/b2b/cases");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const updateArrayItem = (setter: any, array: any[], index: number, field: string, value: any) => {
    const newArr = [...array];
    newArr[index][field] = value;
    setter(newArr);
  };

  return (
    <DashboardPageShell variant="wide">
      {/* Header */}
      <DashboardPageHeader
        title={isEditing ? `Edit Case Study: ${titleEn || "Untitled"}` : "New Case Study"}
        description="Configure B2B client case study details, media assets, metrics, scope, testimonials, and gallery."
        breadcrumbs={[
          { label: "B2B Case Studies", href: "/dashboard/b2b/cases" },
          { label: isEditing ? titleEn || "Edit Case" : "New Case Study" },
        ]}
        badge={{
          label: isVisible ? "VISIBLE" : "HIDDEN",
          variant: isVisible ? "success" : "warning",
        }}
        previewUrl={slug ? `/b2b/case-studies/${slug}` : undefined}
        primaryAction={{
          label: isSaving ? "Saving..." : "Save Changes",
          onClick: handleSave,
          isLoading: isSaving,
          icon: <Save className="w-4 h-4" />,
        }}
        secondaryAction={
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer bg-[var(--surface-subtle)] px-3 py-2 rounded-xl border border-[var(--border-default)]">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-[var(--text-primary)]">Visible</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-[var(--surface-subtle)] px-3 py-2 rounded-xl border border-[var(--border-default)]">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-[var(--text-primary)]">Featured</span>
            </label>
          </div>
        }
      />

      <DashboardSectionNavigator
        sections={CASE_SECTIONS}
        activeSectionId={activeTab}
        onSelectSection={setActiveTab}
      />

      <div className="mt-4">
        <div className="bg-surface-default rounded-2xl border border-border-default p-6 md:p-8 min-h-[500px]">
          {/* 1. GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6 border-b border-border-default pb-4">Core Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (EN) *</label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (AR) *</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none font-arabic"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Slug URL *</label>
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary bg-surface-hover px-4 py-3 rounded-xl border border-border-default">
                    /b2b/case-studies/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    className="flex-1 bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Client Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Category / Sector</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Delivery Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Linked Attraction</label>
                <select
                  value={attractionId}
                  onChange={(e) => setAttractionId(e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none"
                >
                  <option value="">Select an Attraction (Optional)</option>
                  {attractions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Card Thumbnail</label>
                  <select
                    value={thumbnailMediaType}
                    onChange={(e) => setThumbnailMediaType(e.target.value)}
                    className="bg-surface-hover border border-border-default rounded-lg px-2 py-1 text-xs focus:outline-none"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="IFRAME">IFrame</option>
                    <option value="SPLINE">Spline 3D</option>
                  </select>
                </div>
                <MediaUploader value={thumbnailUrl} onChange={setThumbnailUrl} />
              </div>
            </div>
          )}

          {/* 2. HERO TAB */}
          {activeTab === "hero" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6 border-b border-border-default pb-4">Hero Media & Brand Assets</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Hero Media URL</label>
                  <select
                    value={heroMediaType}
                    onChange={(e) => setHeroMediaType(e.target.value)}
                    className="bg-surface-hover border border-border-default rounded-lg px-2 py-1 text-xs focus:outline-none"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="IFRAME">IFrame</option>
                  </select>
                </div>
                <MediaUploader value={heroImageUrl} onChange={setHeroImageUrl} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Client Logo URL</label>
                <MediaUploader value={clientLogoUrl} onChange={setClientLogoUrl} />
              </div>
            </div>
          )}

          {/* 3. NARRATIVE TAB */}
          {activeTab === "narrative" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6 border-b border-border-default pb-4">
                Narrative (Challenge, Solution, Result)
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border-default pb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-500 uppercase tracking-wider">The Strategic Challenge (EN)</label>
                    <textarea
                      value={challengeEn}
                      rows={4}
                      onChange={(e) => setChallengeEn(e.target.value)}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-500 uppercase tracking-wider">The Strategic Challenge (AR)</label>
                    <textarea
                      value={challengeAr}
                      dir="rtl"
                      rows={4}
                      onChange={(e) => setChallengeAr(e.target.value)}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none resize-none font-arabic"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border-default pb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider">The Engineering Solution (EN)</label>
                    <textarea
                      value={solutionEn}
                      rows={4}
                      onChange={(e) => setSolutionEn(e.target.value)}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider">The Engineering Solution (AR)</label>
                    <textarea
                      value={solutionAr}
                      dir="rtl"
                      rows={4}
                      onChange={(e) => setSolutionAr(e.target.value)}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none resize-none font-arabic"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">The Measurable Outcome (EN)</label>
                    <textarea
                      value={resultEn}
                      rows={4}
                      onChange={(e) => setResultEn(e.target.value)}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">The Measurable Outcome (AR)</label>
                    <textarea
                      value={resultAr}
                      dir="rtl"
                      rows={4}
                      onChange={(e) => setResultAr(e.target.value)}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none resize-none font-arabic"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. VERIFIED METRICS TAB */}
          {activeTab === "metrics" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-border-default pb-4">
                <div>
                  <h2 className="text-lg font-black">Verified Impact Metrics & KPIs</h2>
                  <p className="text-xs text-text-secondary">
                    Add verified metrics with optional prefix, suffix, and verification citation.
                  </p>
                </div>
                <Button
                  onClick={() =>
                    setMetrics([
                      ...metrics,
                      {
                        valueEn: "",
                        valueAr: "",
                        labelEn: "",
                        labelAr: "",
                        prefix: "",
                        suffix: "",
                        sourceEn: "",
                        sourceAr: "",
                      },
                    ])
                  }
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl"
                >
                  <Plus className="w-4 h-4" /> Add Metric
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border-default rounded-xl bg-surface-hover relative group flex flex-col gap-3"
                  >
                    <button
                      onClick={() => setMetrics(metrics.filter((_, i) => i !== index))}
                      className="absolute top-2 end-2 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-text-tertiary uppercase">Prefix</label>
                        <input
                          type="text"
                          placeholder="e.g. +"
                          value={metric.prefix || ""}
                          onChange={(e) => updateArrayItem(setMetrics, metrics, index, "prefix", e.target.value)}
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-tertiary uppercase">Value (EN) *</label>
                        <input
                          type="text"
                          placeholder="50,000"
                          value={metric.valueEn || metric.value || ""}
                          onChange={(e) => updateArrayItem(setMetrics, metrics, index, "valueEn", e.target.value)}
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm font-bold text-accent"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-tertiary uppercase">Suffix</label>
                        <input
                          type="text"
                          placeholder="e.g. % or QAR"
                          value={metric.suffix || ""}
                          onChange={(e) => updateArrayItem(setMetrics, metrics, index, "suffix", e.target.value)}
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-text-tertiary uppercase">Label (EN) *</label>
                        <input
                          type="text"
                          placeholder="Attendees"
                          value={metric.labelEn || ""}
                          onChange={(e) => updateArrayItem(setMetrics, metrics, index, "labelEn", e.target.value)}
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-tertiary uppercase">Label (AR) *</label>
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="حضور جماهيري"
                          value={metric.labelAr || ""}
                          onChange={(e) => updateArrayItem(setMetrics, metrics, index, "labelAr", e.target.value)}
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm font-arabic"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-text-tertiary uppercase">Source Citation (EN)</label>
                        <input
                          type="text"
                          placeholder="e.g. Audited by Ministry of Tourism"
                          value={metric.sourceEn || ""}
                          onChange={(e) => updateArrayItem(setMetrics, metrics, index, "sourceEn", e.target.value)}
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-secondary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-tertiary uppercase">Source Citation (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="موثق من الجهة المشرفة"
                          value={metric.sourceAr || ""}
                          onChange={(e) => updateArrayItem(setMetrics, metrics, index, "sourceAr", e.target.value)}
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs font-arabic text-text-secondary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. SCOPE & TIMELINE TAB */}
          {activeTab === "scope" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6 border-b border-border-default pb-4">
                Turnkey Scope, Scale & Disciplines
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Execution Timeline (EN)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14 Days Rapid Delivery"
                    value={durationEn}
                    onChange={(e) => setDurationEn(e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Execution Timeline (AR)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="مثال: ١٤ يوماً تسليم سريع"
                    value={durationAr}
                    onChange={(e) => setDurationAr(e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 text-sm font-arabic"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Project Scale (EN)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12,000 sqm / 45k capacity"
                    value={scaleEn}
                    onChange={(e) => setScaleEn(e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Project Scale (AR)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="مثال: ١٢ ألف متر مربع"
                    value={scaleAr}
                    onChange={(e) => setScaleAr(e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 text-sm font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Location in Qatar (EN)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lusail Boulevard, Doha"
                    value={locationEn}
                    onChange={(e) => setLocationEn(e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Location in Qatar (AR)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="مثال: درب لوسيل، الدوحة"
                    value={locationAr}
                    onChange={(e) => setLocationAr(e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 text-sm font-arabic"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Associated Services / Disciplines (Comma separated slugs)
                </label>
                <input
                  type="text"
                  placeholder="e.g. mega-events, spatial-design, experiential-marketing"
                  value={servicesUsedInput}
                  onChange={(e) => setServicesUsedInput(e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Core Turnkey Deliverables (EN, one per line)
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Custom Giant Float Fabrication&#10;DMX Synchronized Lighting Rig&#10;Crowd Safety Perimeter Management"
                    value={deliverablesTextEn}
                    onChange={(e) => setDeliverablesTextEn(e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 text-sm resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Core Turnkey Deliverables (AR, one per line)
                  </label>
                  <textarea
                    rows={5}
                    dir="rtl"
                    placeholder="تصنيع وتجهيز المجسمات الهوائية الضخمة&#10;شبكة الإضاءة المتزامنة الاحترافية&#10;إدارة مسارات الحشود والسلامة الميدانية"
                    value={deliverablesTextAr}
                    onChange={(e) => setDeliverablesTextAr(e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 text-sm resize-none font-arabic"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. BEFORE & AFTER TAB */}
          {activeTab === "beforeAfter" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-border-default pb-4">
                <div>
                  <h2 className="text-lg font-black">Spatial Transformation (Before & After)</h2>
                  <p className="text-xs text-text-secondary">
                    Configure interactive split-screen slider demonstrating spatial baseline vs delivered environment.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-surface-hover px-4 py-2 rounded-xl border border-border-default">
                  <input
                    type="checkbox"
                    checked={beforeAfterEnabled}
                    onChange={(e) => setBeforeAfterEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold">Enable Slider</span>
                </label>
              </div>

              {beforeAfterEnabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                        Before / Baseline Image URL
                      </label>
                      <MediaUploader value={beforeImageUrl} onChange={setBeforeImageUrl} />
                      <input
                        type="text"
                        placeholder="Before Caption (EN) e.g. Raw Site Baseline"
                        value={beforeCaptionEn}
                        onChange={(e) => setBeforeCaptionEn(e.target.value)}
                        className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="وصف الصورة قبل التنفيذ"
                        value={beforeCaptionAr}
                        onChange={(e) => setBeforeCaptionAr(e.target.value)}
                        className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm font-arabic"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                        After / Delivered Image URL
                      </label>
                      <MediaUploader value={afterImageUrl} onChange={setAfterImageUrl} />
                      <input
                        type="text"
                        placeholder="After Caption (EN) e.g. Live Landmark Activation"
                        value={afterCaptionEn}
                        onChange={(e) => setAfterCaptionEn(e.target.value)}
                        className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="وصف الصورة بعد التنفيذ"
                        value={afterCaptionAr}
                        onChange={(e) => setAfterCaptionAr(e.target.value)}
                        className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm font-arabic"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. TEAM TAB */}
          {activeTab === "team" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-border-default pb-4">
                <h2 className="text-lg font-black">Team Members & Behind the Build</h2>
                <Button
                  onClick={() =>
                    setCaseTeamMembers([
                      ...caseTeamMembers,
                      { employeeProfileId: "", roleEn: "", roleAr: "" },
                    ])
                  }
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl"
                >
                  <Plus className="w-4 h-4" /> Add Team Member
                </Button>
              </div>
              <div className="space-y-4">
                {caseTeamMembers.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border-default rounded-xl bg-surface-hover relative group"
                  >
                    <button
                      onClick={() => setCaseTeamMembers(caseTeamMembers.filter((_, i) => i !== index))}
                      className="absolute top-4 end-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pe-12">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-text-secondary">Select Member Profile</label>
                        <select
                          value={item.employeeProfileId}
                          onChange={(e) =>
                            updateArrayItem(setCaseTeamMembers, caseTeamMembers, index, "employeeProfileId", e.target.value)
                          }
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="">Select a Team Member</option>
                          {teamMembers.map((tm: any) => (
                            <option key={tm.id} value={tm.id}>
                              {tm.firstName} {tm.lastName} - {tm.designation}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary">Project Role (EN)</label>
                        <input
                          type="text"
                          value={item.roleEn || ""}
                          onChange={(e) =>
                            updateArrayItem(setCaseTeamMembers, caseTeamMembers, index, "roleEn", e.target.value)
                          }
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm"
                          placeholder="e.g. Lead Producer"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary">Project Role (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={item.roleAr || ""}
                          onChange={(e) =>
                            updateArrayItem(setCaseTeamMembers, caseTeamMembers, index, "roleAr", e.target.value)
                          }
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm font-arabic"
                          placeholder="مدير الإنتاج والتنفيذ"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. TESTIMONIALS TAB */}
          {activeTab === "testimonials" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-border-default pb-4">
                <h2 className="text-lg font-black">Verified Client Testimonials</h2>
                <Button
                  onClick={() =>
                    setTestimonials([
                      ...testimonials,
                      {
                        authorEn: "",
                        authorAr: "",
                        roleEn: "",
                        roleAr: "",
                        companyEn: "",
                        companyAr: "",
                        quoteEn: "",
                        quoteAr: "",
                        isVerified: true,
                      },
                    ])
                  }
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl"
                >
                  <Plus className="w-4 h-4" /> Add Testimonial
                </Button>
              </div>
              <div className="space-y-4">
                {testimonials.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border-default rounded-xl bg-surface-hover relative group"
                  >
                    <button
                      onClick={() => setTestimonials(testimonials.filter((_, i) => i !== index))}
                      className="absolute top-4 end-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pe-12">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary">Author Name (EN) *</label>
                        <input
                          type="text"
                          value={item.authorEn || item.authorName || ""}
                          onChange={(e) =>
                            updateArrayItem(setTestimonials, testimonials, index, "authorEn", e.target.value)
                          }
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary">Author Name (AR) *</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={item.authorAr || ""}
                          onChange={(e) =>
                            updateArrayItem(setTestimonials, testimonials, index, "authorAr", e.target.value)
                          }
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm font-arabic"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary">Role / Company (EN)</label>
                        <input
                          type="text"
                          value={item.roleEn || ""}
                          onChange={(e) =>
                            updateArrayItem(setTestimonials, testimonials, index, "roleEn", e.target.value)
                          }
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm"
                          placeholder="e.g. Director of Events, Tourism Authority"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary">Role / Company (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={item.roleAr || ""}
                          onChange={(e) =>
                            updateArrayItem(setTestimonials, testimonials, index, "roleAr", e.target.value)
                          }
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm font-arabic"
                          placeholder="مدير الفعاليات والشراكات"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-text-secondary">Quote (EN) *</label>
                        <textarea
                          value={item.quoteEn || ""}
                          onChange={(e) =>
                            updateArrayItem(setTestimonials, testimonials, index, "quoteEn", e.target.value)
                          }
                          rows={3}
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm resize-none"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-text-secondary">Quote (AR) *</label>
                        <textarea
                          value={item.quoteAr || ""}
                          dir="rtl"
                          onChange={(e) =>
                            updateArrayItem(setTestimonials, testimonials, index, "quoteAr", e.target.value)
                          }
                          rows={3}
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm resize-none font-arabic"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. GALLERY TAB */}
          {activeTab === "gallery" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-border-default pb-4">
                <h2 className="text-lg font-black">Visual Proof Gallery</h2>
                <Button
                  onClick={() =>
                    setGallery([...gallery, { url: "", captionEn: "", captionAr: "", mediaType: "IMAGE" }])
                  }
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl"
                >
                  <Plus className="w-4 h-4" /> Add Media
                </Button>
              </div>
              <div className="space-y-4">
                {gallery.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border-default rounded-xl bg-surface-hover relative group"
                  >
                    <button
                      onClick={() => setGallery(gallery.filter((_, i) => i !== index))}
                      className="absolute top-4 end-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-4">
                        <MediaUploader
                          value={item.url}
                          onChange={(url: string) => updateArrayItem(setGallery, gallery, index, "url", url)}
                        />
                      </div>
                      <div className="md:col-span-8 space-y-4">
                        <input
                          type="text"
                          value={item.captionEn || ""}
                          onChange={(e) => updateArrayItem(setGallery, gallery, index, "captionEn", e.target.value)}
                          className="w-full px-4 py-2 bg-surface-default border border-border-default rounded-xl text-sm outline-none"
                          placeholder="Caption (EN)"
                        />
                        <input
                          type="text"
                          dir="rtl"
                          value={item.captionAr || ""}
                          onChange={(e) => updateArrayItem(setGallery, gallery, index, "captionAr", e.target.value)}
                          className="w-full px-4 py-2 bg-surface-default border border-border-default rounded-xl text-sm outline-none font-arabic"
                          placeholder="Caption (AR)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. SEO TAB */}
          {activeTab === "seo" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <AdminSeoCustomizer seo={seo} setSeo={setSeo} formData={null} setFormData={() => {}} />
            </div>
          )}
        </div>
      </div>
    </DashboardPageShell>
  );
}
