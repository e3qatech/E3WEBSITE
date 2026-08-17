"use client";

import React, { useState } from "react";
import {
  Box,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Layers,
  Palette,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import { SpatialSection } from "@/components/spatial/spatial-experience.types";
import { DEFAULT_SPATIAL_SECTIONS } from "@/components/spatial/spatial-experience.config";
import {
  DashboardBilingualField,
  LanguageEditMode,
} from "@/components/dashboard/ui";
import { AdminMediaPicker } from "@/components/dashboard/ui/AdminMediaPicker";
import { cn } from "@/lib/utils";

interface SpatialExperienceManagerProps {
  value?: {
    enabled?: boolean;
    faces?: SpatialSection[];
  };
  onChange: (updated: { enabled: boolean; faces: SpatialSection[] }) => void;
  languageMode?: LanguageEditMode;
  isAr?: boolean;
}

const COLOR_PRESETS = [
  { name: "Cyan / Sky", accent: "#38bdf8", halo: "#0284c7", bg: "#0a0d14" },
  { name: "Emerald", accent: "#10b981", halo: "#059669", bg: "#0c0f1d" },
  { name: "Pink / Rose", accent: "#ec4899", halo: "#db2777", bg: "#170c24" },
  { name: "Amber / Gold", accent: "#f59e0b", halo: "#d97706", bg: "#181206" },
  { name: "Teal / Aqua", accent: "#06b6d4", halo: "#0891b2", bg: "#07161b" },
  { name: "Purple / Violet", accent: "#a855f7", halo: "#9333ea", bg: "#190a1f" },
  { name: "Mint / Sage", accent: "#14b8a6", halo: "#0d9488", bg: "#0a1715" },
  { name: "Indigo / Deep", accent: "#818cf8", halo: "#6366f1", bg: "#13111c" },
];

export function SpatialExperienceManager({
  value,
  onChange,
  languageMode = "both",
  isAr = false,
}: SpatialExperienceManagerProps) {
  const isEnabled = value?.enabled ?? false;
  const faces = Array.isArray(value?.faces) && value.faces.length > 0
    ? value.faces
    : DEFAULT_SPATIAL_SECTIONS;

  const [expandedFaceIndex, setExpandedFaceIndex] = useState<number | null>(0);

  const handleToggleEnabled = (enabled: boolean) => {
    onChange({
      enabled,
      faces,
    });
  };

  const handleResetToDefaults = () => {
    if (
      window.confirm(
        isAr
          ? "هل أنت متأكد من استعادة الإعدادات الافتراضية للأسطوانة التفاعلية (٨ وجوه)؟"
          : "Are you sure you want to reset all 8 faces of the Octagonal Spatial Experience to default settings?"
      )
    ) {
      onChange({
        enabled: isEnabled,
        faces: DEFAULT_SPATIAL_SECTIONS,
      });
    }
  };

  const handleUpdateFace = (index: number, updates: Partial<SpatialSection>) => {
    const nextFaces = [...faces];
    if (nextFaces[index]) {
      nextFaces[index] = {
        ...nextFaces[index],
        ...updates,
      };
      onChange({
        enabled: isEnabled,
        faces: nextFaces,
      });
    }
  };

  const handleMoveFace = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faces.length) return;

    const nextFaces = [...faces];
    const [moved] = nextFaces.splice(index, 1);
    nextFaces.splice(targetIndex, 0, moved);

    // Reassign sectionNumber and sortOrder
    const reindexed = nextFaces.map((f, i) => ({
      ...f,
      sectionNumber: String(i + 1).padStart(2, "0"),
      sortOrder: i,
    }));

    onChange({
      enabled: isEnabled,
      faces: reindexed,
    });

    setExpandedFaceIndex(targetIndex);
  };

  return (
    <div className="space-y-6">
      {/* Master Enable & Status Banner */}
      <div className="p-5 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-active)] backdrop-blur-md shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Box className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {isAr ? "الأسطوانة التفاعلية ثلاثية الأبعاد (8 Faces)" : "Horizontal Octagonal Spatial Experience"}
              </h3>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
                  isEnabled
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                )}
              >
                {isEnabled
                  ? isAr
                    ? "مفعّل على صفحة B2C"
                    : "ACTIVE ON B2C LANDING"
                  : isAr
                  ? "معطّل (للمعاينة والمطورين فقط)"
                  : "PREVIEW / DEV ONLY"}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              {isAr
                ? "تجربة بصرية تفاعلية ثلاثية الأبعاد تدور أفقياً على محور X عبر ٨ أوجه عند التمرير بالصفحة. يمكنك تخصيص النصوص، الروابط، الألوان، والوسائط لكل وجه بشكل مستقل."
                : "A scroll-driven 3D horizontal octagonal cylinder rotating around the X-axis across 8 distinct faces. Customize copy, media, CTA links, and glow colors for each face."}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <a
              href={`/${isAr ? "ar" : "en"}/motion-lab/horizontal-cylinder`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isAr ? "معاينة في مختبر الحركة" : "Open Motion Lab Preview"}</span>
            </a>

            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border-level-1)] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? "استعادة الافتراضي" : "Reset Defaults"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleEnabled(!isEnabled)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm",
                isEnabled
                  ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                  : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
              )}
            >
              {isEnabled ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? "مفعّل (انقر للتعطيل)" : "Enabled (Click to Disable)"}</span>
                </>
              ) : (
                <>
                  <Sliders className="w-4 h-4" />
                  <span>{isAr ? "تفعيل على B2C" : "Enable on B2C"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Faces List Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--color-primary)]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {isAr ? "أوجه الأسطوانة الثمانية (8 Faces)" : "8 Octagon Faces Configuration"}
          </h4>
        </div>
        <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
          {faces.filter((f) => f.visibility !== false).length} / {faces.length}{" "}
          {isAr ? "وجوه نشطة" : "Active Faces"}
        </span>
      </div>

      {/* 8 Accordion Face Panels */}
      <div className="space-y-3">
        {faces.map((face, index) => {
          const isExpanded = expandedFaceIndex === index;
          const isFaceVisible = face.visibility !== false;

          return (
            <div
              key={face.id || `face-${index}`}
              className={cn(
                "rounded-2xl border transition-all duration-200 overflow-hidden",
                isExpanded
                  ? "border-[var(--border-level-2)] bg-[var(--surface-primary)] shadow-md"
                  : "border-[var(--border-level-1)] bg-[var(--surface-primary)]/70 hover:bg-[var(--surface-primary)] hover:border-[var(--border-level-2)]"
              )}
            >
              {/* Accordion Summary Row */}
              <div
                className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => setExpandedFaceIndex(isExpanded ? null : index)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Face Number Badge */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 border"
                    style={{
                      backgroundColor: `${face.accentColor || "#38bdf8"}15`,
                      borderColor: `${face.accentColor || "#38bdf8"}40`,
                      color: face.accentColor || "#38bdf8",
                    }}
                  >
                    {face.sectionNumber || String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Title & Eyebrow */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {isAr ? face.headingAr || face.headingEn : face.headingEn}
                      </span>
                      {!isFaceVisible && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {isAr ? "مخفي" : "HIDDEN"}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--text-tertiary)] truncate block">
                      {isAr ? face.eyebrowAr || face.eyebrowEn : face.eyebrowEn} •{" "}
                      {face.primaryCtaUrl || "/b2c/attractions"}
                    </span>
                  </div>
                </div>

                {/* Quick Actions & Accordion Arrow */}
                <div
                  className="flex items-center gap-1.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveFace(index, "up")}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title={isAr ? "تحريك لأعلى" : "Move Up"}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={index === faces.length - 1}
                    onClick={() => handleMoveFace(index, "down")}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title={isAr ? "تحريك لأسفل" : "Move Down"}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateFace(index, { visibility: !isFaceVisible })
                    }
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isFaceVisible
                        ? "text-emerald-400 hover:bg-emerald-500/10"
                        : "text-slate-400 hover:bg-slate-500/10"
                    )}
                    title={
                      isFaceVisible
                        ? isAr
                          ? "إخفاء الوجه"
                          : "Hide Face"
                        : isAr
                        ? "إظهار الوجه"
                        : "Show Face"
                    }
                  >
                    {isFaceVisible ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div
                    className="p-1.5 text-[var(--text-tertiary)]"
                    onClick={() => setExpandedFaceIndex(isExpanded ? null : index)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Accordion Expanded Content Body */}
              {isExpanded && (
                <div className="p-5 border-t border-[var(--border-level-1)] bg-[var(--surface-ground)]/50 space-y-5">
                  {/* Eyebrow & Headline */}
                  <DashboardBilingualField
                    label={isAr ? "الشريط العلوي (Eyebrow)" : "Eyebrow Tag"}
                    valueEn={face.eyebrowEn || ""}
                    valueAr={face.eyebrowAr || ""}
                    onChangeEn={(v) => handleUpdateFace(index, { eyebrowEn: v })}
                    onChangeAr={(v) => handleUpdateFace(index, { eyebrowAr: v })}
                    mode={languageMode}
                    placeholderEn="e.g. Flagship Entertainment"
                    placeholderAr="مثال: وجهات ترفيهية متكاملة"
                  />

                  <DashboardBilingualField
                    label={isAr ? "العنوان الرئيسي (Headline)" : "Main Headline"}
                    valueEn={face.headingEn || ""}
                    valueAr={face.headingAr || ""}
                    onChangeEn={(v) => handleUpdateFace(index, { headingEn: v })}
                    onChangeAr={(v) => handleUpdateFace(index, { headingAr: v })}
                    mode={languageMode}
                    placeholderEn="e.g. Next-Gen Amusement & Kinetic Worlds"
                    placeholderAr="مثال: مغامرات الجيل القادم وعوالم هوائية"
                  />

                  <DashboardBilingualField
                    label={isAr ? "الوصف والتفاصيل (Description)" : "Description & Story"}
                    valueEn={face.descriptionEn || ""}
                    valueAr={face.descriptionAr || ""}
                    onChangeEn={(v) =>
                      handleUpdateFace(index, { descriptionEn: v })
                    }
                    onChangeAr={(v) =>
                      handleUpdateFace(index, { descriptionAr: v })
                    }
                    mode={languageMode}
                    type="textarea"
                    rows={3}
                    placeholderEn="Enter engaging description for visitors..."
                    placeholderAr="أدخل وصفاً جذاباً للزوار..."
                  />

                  {/* CTAs Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-primary)]">
                    {/* Primary CTA */}
                    <div className="space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                        {isAr ? "زر الإجراء الرئيسي (Primary CTA)" : "Primary CTA Button"}
                      </span>
                      <DashboardBilingualField
                        label={isAr ? "نص الزر الرئيسي" : "Primary CTA Label"}
                        valueEn={face.primaryCtaLabelEn || ""}
                        valueAr={face.primaryCtaLabelAr || ""}
                        onChangeEn={(v) =>
                          handleUpdateFace(index, { primaryCtaLabelEn: v })
                        }
                        onChangeAr={(v) =>
                          handleUpdateFace(index, { primaryCtaLabelAr: v })
                        }
                        mode={languageMode}
                        placeholderEn="e.g. View Attractions"
                        placeholderAr="مثال: استكشف الوجهات"
                      />
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                          {isAr ? "رابط التوجيه (URL)" : "Destination URL"}
                        </label>
                        <input
                          type="text"
                          value={face.primaryCtaUrl || ""}
                          onChange={(e) =>
                            handleUpdateFace(index, { primaryCtaUrl: e.target.value })
                          }
                          placeholder="/b2c/attractions"
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--surface-ground)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none"
                        />
                      </div>
                    </div>

                    {/* Secondary CTA */}
                    <div className="space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        {isAr ? "زر الإجراء الثانوي (Secondary CTA)" : "Secondary CTA Button"}
                      </span>
                      <DashboardBilingualField
                        label={isAr ? "نص الزر الثانوي" : "Secondary CTA Label"}
                        valueEn={face.secondaryCtaLabelEn || ""}
                        valueAr={face.secondaryCtaLabelAr || ""}
                        onChangeEn={(v) =>
                          handleUpdateFace(index, { secondaryCtaLabelEn: v })
                        }
                        onChangeAr={(v) =>
                          handleUpdateFace(index, { secondaryCtaLabelAr: v })
                        }
                        mode={languageMode}
                        placeholderEn="e.g. Plan Your Visit"
                        placeholderAr="مثال: خطط لزيارتك"
                      />
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                          {isAr ? "رابط التوجيه (URL)" : "Destination URL"}
                        </label>
                        <input
                          type="text"
                          value={face.secondaryCtaUrl || ""}
                          onChange={(e) =>
                            handleUpdateFace(index, { secondaryCtaUrl: e.target.value })
                          }
                          placeholder="/b2c/calendar"
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--surface-ground)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Media Selector */}
                  <div className="p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-primary)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        {isAr ? "وسائط الوجه (Face Media)" : "Face Media Asset"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateFace(index, {
                              media: {
                                ...(face.media || { url: "" }),
                                type: "IMAGE",
                              },
                            })
                          }
                          className={cn(
                            "px-2.5 py-1 rounded text-[10px] font-bold transition-colors",
                            face.media?.type !== "VIDEO"
                              ? "bg-[var(--color-primary)] text-white"
                              : "bg-[var(--surface-ground)] text-[var(--text-secondary)]"
                          )}
                        >
                          <ImageIcon className="w-3 h-3 inline me-1" />
                          Image
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateFace(index, {
                              media: {
                                ...(face.media || { url: "" }),
                                type: "VIDEO",
                              },
                            })
                          }
                          className={cn(
                            "px-2.5 py-1 rounded text-[10px] font-bold transition-colors",
                            face.media?.type === "VIDEO"
                              ? "bg-[var(--color-primary)] text-white"
                              : "bg-[var(--surface-ground)] text-[var(--text-secondary)]"
                          )}
                        >
                          <Film className="w-3 h-3 inline me-1" />
                          Video
                        </button>
                      </div>
                    </div>

                    <AdminMediaPicker
                      label={isAr ? "اختر صورة أو فيديو الخلفية" : "Select Background Image or Video"}
                      value={face.media?.url || ""}
                      onChange={(url) =>
                        handleUpdateFace(index, {
                          media: {
                            ...(face.media || { type: "IMAGE" }),
                            url,
                            posterUrl: face.media?.posterUrl || url,
                          },
                        })
                      }
                    />
                  </div>

                  {/* Color Palette & Preset Swatches */}
                  <div className="p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-primary)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          {isAr ? "ألوان الوجه والهالة (Color Tokens)" : "Color Tokens & Halo Accent"}
                        </span>
                      </div>
                      {/* Presets */}
                      <div className="flex items-center gap-1.5">
                        {COLOR_PRESETS.map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() =>
                              handleUpdateFace(index, {
                                accentColor: preset.accent,
                                haloColor: preset.halo,
                                backgroundColor: preset.bg,
                              })
                            }
                            className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform"
                            style={{ backgroundColor: preset.accent }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1">
                          {isAr ? "لون الإبراز (Accent)" : "Accent Color"}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={face.accentColor || "#38bdf8"}
                            onChange={(e) =>
                              handleUpdateFace(index, { accentColor: e.target.value })
                            }
                            className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={face.accentColor || "#38bdf8"}
                            onChange={(e) =>
                              handleUpdateFace(index, { accentColor: e.target.value })
                            }
                            className="w-full px-2 py-1 text-[11px] font-mono rounded bg-[var(--surface-ground)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1">
                          {isAr ? "لون الهالة (Halo)" : "Halo Glow Color"}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={face.haloColor || "#0284c7"}
                            onChange={(e) =>
                              handleUpdateFace(index, { haloColor: e.target.value })
                            }
                            className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={face.haloColor || "#0284c7"}
                            onChange={(e) =>
                              handleUpdateFace(index, { haloColor: e.target.value })
                            }
                            className="w-full px-2 py-1 text-[11px] font-mono rounded bg-[var(--surface-ground)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1">
                          {isAr ? "لون الخلفية (Background)" : "Background Mesh Color"}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={face.backgroundColor || "#0a0d14"}
                            onChange={(e) =>
                              handleUpdateFace(index, {
                                backgroundColor: e.target.value,
                              })
                            }
                            className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={face.backgroundColor || "#0a0d14"}
                            onChange={(e) =>
                              handleUpdateFace(index, {
                                backgroundColor: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 text-[11px] font-mono rounded bg-[var(--surface-ground)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
