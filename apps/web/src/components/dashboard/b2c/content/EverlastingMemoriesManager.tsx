"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { AdminMediaPicker } from "@/components/dashboard/ui/AdminMediaPicker";
import { AdminButton } from "@/components/dashboard/ui/AdminButton";
import { DEFAULT_B2C_LANDING_CONTENT } from "@/lib/cms-default-pages";
import { resolveMediaType } from "@/lib/media-resolver";
import { cn } from "@/lib/utils";
import { DashboardBilingualField, LanguageEditMode } from "@/components/dashboard/ui/DashboardBilingualEditor";

export interface MemoryMomentItem {
  id: string | number;
  titleEn: string;
  titleAr: string;
  captionEn: string;
  captionAr: string;
  tagEn?: string;
  tagAr?: string;
  mediaUrl: string;
  mediaType?: "IMAGE" | "VIDEO";
  isVisible?: boolean;
}

export interface EverlastingMemoriesData {
  badgeEn?: string;
  badgeAr?: string;
  headlineEn?: string;
  headlineAr?: string;
  subtextEn?: string;
  subtextAr?: string;
  moments?: MemoryMomentItem[];
}

interface EverlastingMemoriesManagerProps {
  value?: EverlastingMemoriesData;
  onChange?: (data: EverlastingMemoriesData) => void;
  mode?: "all" | "settings-only" | "moments-only";
  languageMode?: LanguageEditMode;
}

export function EverlastingMemoriesManager({
  value,
  onChange,
  mode = "all",
  languageMode = "both",
}: EverlastingMemoriesManagerProps) {
  const defaultState: Required<EverlastingMemoriesData> = {
    badgeEn: value?.badgeEn || (DEFAULT_B2C_LANDING_CONTENT.guestMemories as any)?.badgeEn || "EVERLASTING MEMORIES",
    badgeAr: value?.badgeAr || (DEFAULT_B2C_LANDING_CONTENT.guestMemories as any)?.badgeAr || "ذكريات لا تُنسى",
    headlineEn: value?.headlineEn !== undefined ? value.headlineEn : DEFAULT_B2C_LANDING_CONTENT.guestMemories.headlineEn,
    headlineAr: value?.headlineAr !== undefined ? value.headlineAr : DEFAULT_B2C_LANDING_CONTENT.guestMemories.headlineAr,
    subtextEn: value?.subtextEn !== undefined ? value.subtextEn : DEFAULT_B2C_LANDING_CONTENT.guestMemories.subtextEn,
    subtextAr: value?.subtextAr !== undefined ? value.subtextAr : DEFAULT_B2C_LANDING_CONTENT.guestMemories.subtextAr,
    moments: Array.isArray(value?.moments) ? value.moments : DEFAULT_B2C_LANDING_CONTENT.guestMemories.moments,
  };

  const [memories, setMemories] = useState<Required<EverlastingMemoriesData>>(defaultState);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    if (value) {
      setMemories({
        badgeEn: value.badgeEn || (DEFAULT_B2C_LANDING_CONTENT.guestMemories as any)?.badgeEn || "EVERLASTING MEMORIES",
        badgeAr: value.badgeAr || (DEFAULT_B2C_LANDING_CONTENT.guestMemories as any)?.badgeAr || "ذكريات لا تُنسى",
        headlineEn: value.headlineEn !== undefined ? value.headlineEn : DEFAULT_B2C_LANDING_CONTENT.guestMemories.headlineEn,
        headlineAr: value.headlineAr !== undefined ? value.headlineAr : DEFAULT_B2C_LANDING_CONTENT.guestMemories.headlineAr,
        subtextEn: value.subtextEn !== undefined ? value.subtextEn : DEFAULT_B2C_LANDING_CONTENT.guestMemories.subtextEn,
        subtextAr: value.subtextAr !== undefined ? value.subtextAr : DEFAULT_B2C_LANDING_CONTENT.guestMemories.subtextAr,
        moments: Array.isArray(value.moments) ? value.moments : DEFAULT_B2C_LANDING_CONTENT.guestMemories.moments,
      });
    }
  }, [value]);

  const updateMemories = (updater: (prev: Required<EverlastingMemoriesData>) => Required<EverlastingMemoriesData>) => {
    setMemories((prev) => {
      const next = updater(prev);
      if (onChange) onChange(next);
      return next;
    });
  };

  const handleMomentChange = (idx: number, field: string, val: any) => {
    updateMemories((prev) => {
      const copy = [...prev.moments];
      if (copy[idx]) {
        let updatedMediaProps = {};
        if (field === "mediaUrl") {
          const detectedType = resolveMediaType({ url: val, explicitType: undefined });
          updatedMediaProps = { mediaType: detectedType === "VIDEO" ? "VIDEO" : "IMAGE" };
        }
        copy[idx] = { ...copy[idx], [field]: val, ...updatedMediaProps };
      }
      return { ...prev, moments: copy };
    });
  };

  const handleAddMoment = () => {
    const newIdx = memories.moments.length;
    updateMemories((prev) => ({
      ...prev,
      moments: [
        ...prev.moments,
        {
          id: `m-${Date.now()}`,
          titleEn: `Guest Moment ${newIdx + 1}`,
          titleAr: `لحظة زوار ${newIdx + 1}`,
          captionEn: "Capture authentic guest smiles and magic moments at E3.",
          captionAr: "لحظات وابتسامات حقيقية لزوار وجهات إي ثري.",
          tagEn: "E3 GUEST MOMENT",
          tagAr: "لحظات زوار إي ثري",
          mediaUrl: "",
          mediaType: "IMAGE",
          isVisible: true,
        },
      ],
    }));
    setExpandedIndex(newIdx);
  };

  const handleDeleteMoment = (idx: number) => {
    const item = memories.moments[idx];
    const name = item?.titleEn || `Moment #${idx + 1}`;
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    updateMemories((prev) => ({
      ...prev,
      moments: prev.moments.filter((_, i) => i !== idx),
    }));
    if (expandedIndex === idx) setExpandedIndex(null);
  };

  const handleMoveMoment = (idx: number, direction: "up" | "down" | "top" | "bottom") => {
    updateMemories((prev) => {
      const copy = [...prev.moments];
      if (direction === "up" && idx > 0) {
        const temp = copy[idx];
        copy[idx] = copy[idx - 1];
        copy[idx - 1] = temp;
      } else if (direction === "down" && idx < copy.length - 1) {
        const temp = copy[idx];
        copy[idx] = copy[idx + 1];
        copy[idx + 1] = temp;
      } else if (direction === "top" && idx > 0) {
        const [item] = copy.splice(idx, 1);
        copy.unshift(item);
      } else if (direction === "bottom" && idx < copy.length - 1) {
        const [item] = copy.splice(idx, 1);
        copy.push(item);
      }
      return { ...prev, moments: copy };
    });
  };

  const toggleVisibility = (idx: number) => {
    updateMemories((prev) => {
      const copy = [...prev.moments];
      if (copy[idx]) {
        copy[idx] = {
          ...copy[idx],
          isVisible: copy[idx].isVisible === false ? true : false,
        };
      }
      return { ...prev, moments: copy };
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Memories Settings Subview */}
      {(mode === "all" || mode === "settings-only") && (
        <div className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <span>Everlasting Memories Section Settings</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Configure the title, badge, and descriptive headlines for the Everlasting Memories guest showcase.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
              GPU Parallax
            </span>
          </div>

          <DashboardBilingualField
            label="Section Badge Eyebrow"
            valueEn={memories.badgeEn}
            valueAr={memories.badgeAr}
            onChangeEn={(val) => updateMemories((p) => ({ ...p, badgeEn: val }))}
            onChangeAr={(val) => updateMemories((p) => ({ ...p, badgeAr: val }))}
            placeholderEn="e.g. EVERLASTING MEMORIES"
            placeholderAr="مثال: ذكريات لا تُنسى"
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Main Section Headline"
            valueEn={memories.headlineEn}
            valueAr={memories.headlineAr}
            onChangeEn={(val) => updateMemories((p) => ({ ...p, headlineEn: val }))}
            onChangeAr={(val) => updateMemories((p) => ({ ...p, headlineAr: val }))}
            placeholderEn="e.g. Real Smiles. Real Moments."
            placeholderAr="مثال: ابتسامات حقيقية. لحظات خالدة."
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Supporting Description"
            type="textarea"
            rows={2}
            valueEn={memories.subtextEn}
            valueAr={memories.subtextAr}
            onChangeEn={(val) => updateMemories((p) => ({ ...p, subtextEn: val }))}
            onChangeAr={(val) => updateMemories((p) => ({ ...p, subtextAr: val }))}
            placeholderEn="Enter supporting description text..."
            placeholderAr="أدخل النص الوصفي للقسم..."
            mode={languageMode}
          />
        </div>
      )}

      {/* 2. Guest Moments Collapsible Cards Repeater */}
      {(mode === "all" || mode === "moments-only") && (
        <div className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-level-1)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <span>Guest Moment Cards Roster</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Manage individual moment tiles, media assets, localized titles, and display order.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                {memories.moments.length} Cards
              </span>
              <AdminButton
                variant="primary"
                size="sm"
                onClick={handleAddMoment}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs font-bold"
              >
                Add Moment
              </AdminButton>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {memories.moments.map((moment, idx) => {
              const isExpanded = expandedIndex === idx;
              const isFirst = idx === 0;
              const isLast = idx === memories.moments.length - 1;
              const isVisible = moment.isVisible !== false;

              return (
                <div
                  key={moment.id || idx}
                  className={cn(
                    "rounded-2xl border transition-all overflow-hidden bg-[var(--surface-default)]",
                    isExpanded
                      ? "border-pink-500/60 shadow-md ring-1 ring-pink-500/20"
                      : "border-[var(--border-level-1)] hover:border-[var(--border-level-2)]",
                    !isVisible && "opacity-60"
                  )}
                >
                  {/* Collapsed Header Bar */}
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="flex items-center justify-between gap-3 p-3.5 sm:px-4 cursor-pointer select-none bg-[var(--bg-level-1)]/60 hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Thumbnail or Icon */}
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-black/40 border border-[var(--border-level-1)] flex items-center justify-center shrink-0">
                        {moment.mediaUrl ? (
                          moment.mediaType === "VIDEO" ? (
                            <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                              <Video className="w-5 h-5 text-pink-400" />
                            </div>
                          ) : (
                            <img
                              src={moment.mediaUrl}
                              alt={moment.titleEn}
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <ImageIcon className="w-5 h-5 text-[var(--text-tertiary)]" />
                        )}
                      </div>

                      {/* Title & Tag */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-pink-400 font-bold">#{idx + 1}</span>
                          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                            {moment.titleEn || "Untitled Moment"}
                          </h4>
                          {moment.titleAr && (
                            <span className="text-xs text-[var(--text-tertiary)] font-sans hidden sm:inline" dir="rtl">
                              ({moment.titleAr})
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[var(--surface-active)] text-[var(--text-tertiary)] border border-[var(--border-level-1)]">
                            {moment.mediaType || "IMAGE"}
                          </span>
                          {!isVisible && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              Hidden
                            </span>
                          )}
                        </div>
                        {moment.captionEn && (
                          <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                            {moment.captionEn}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      className="flex items-center gap-1.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleVisibility(idx)}
                        className={cn(
                          "p-1.5 rounded-xl border transition-all cursor-pointer",
                          isVisible
                            ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                            : "text-[var(--text-tertiary)] border-[var(--border-level-1)] bg-[var(--surface-default)]"
                        )}
                        title={isVisible ? "Card is visible" : "Card is hidden"}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Reorder Buttons */}
                      <div className="flex items-center bg-[var(--surface-default)] rounded-xl border border-[var(--border-level-1)] p-0.5 gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveMoment(idx, "top")}
                          disabled={isFirst}
                          className="p-1 text-[var(--text-secondary)] hover:text-pink-400 disabled:opacity-20 transition-all cursor-pointer"
                          title="Move to top"
                        >
                          <ChevronsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveMoment(idx, "up")}
                          disabled={isFirst}
                          className="p-1 text-[var(--text-secondary)] hover:text-pink-400 disabled:opacity-20 transition-all cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveMoment(idx, "down")}
                          disabled={isLast}
                          className="p-1 text-[var(--text-secondary)] hover:text-pink-400 disabled:opacity-20 transition-all cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveMoment(idx, "bottom")}
                          disabled={isLast}
                          className="p-1 text-[var(--text-secondary)] hover:text-pink-400 disabled:opacity-20 transition-all cursor-pointer"
                          title="Move to bottom"
                        >
                          <ChevronsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteMoment(idx)}
                        className="p-1.5 rounded-xl text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Expand / Collapse */}
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all cursor-pointer ms-1"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Edit Form */}
                  {isExpanded && (
                    <div className="p-5 border-t border-[var(--border-level-1)] bg-[var(--surface-default)] space-y-4 animate-in fade-in-50 duration-200">
                      {/* Media Picker */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                          Moment Photo / Video Asset
                        </label>
                        <AdminMediaPicker
                          value={moment.mediaUrl || ""}
                          onChange={(url) => handleMomentChange(idx, "mediaUrl", url)}
                          label={`Moment #${idx + 1} Media`}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                            Card Tag Badge (English)
                          </label>
                          <input
                            type="text"
                            value={moment.tagEn || ""}
                            onChange={(e) => handleMomentChange(idx, "tagEn", e.target.value)}
                            placeholder="e.g. E3 GUEST MOMENT"
                            className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                            Card Tag Badge (Arabic)
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={moment.tagAr || ""}
                            onChange={(e) => handleMomentChange(idx, "tagAr", e.target.value)}
                            placeholder="مثال: لحظات زوار إي ثري"
                            className="w-full h-10 px-3.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-sans"
                          />
                        </div>
                      </div>

                      <DashboardBilingualField
                        label="Moment Title"
                        valueEn={moment.titleEn}
                        valueAr={moment.titleAr}
                        onChangeEn={(val) => handleMomentChange(idx, "titleEn", val)}
                        onChangeAr={(val) => handleMomentChange(idx, "titleAr", val)}
                        placeholderEn="Enter moment title..."
                        placeholderAr="أدخل عنوان اللحظة..."
                        mode={languageMode}
                      />

                      <DashboardBilingualField
                        label="Moment Caption / Story"
                        type="textarea"
                        rows={2}
                        valueEn={moment.captionEn}
                        valueAr={moment.captionAr}
                        onChangeEn={(val) => handleMomentChange(idx, "captionEn", val)}
                        onChangeAr={(val) => handleMomentChange(idx, "captionAr", val)}
                        placeholderEn="Enter caption story..."
                        placeholderAr="أدخل قصة اللحظة..."
                        mode={languageMode}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <AdminButton
            variant="outline"
            onClick={handleAddMoment}
            fullWidth
            leftIcon={<Plus className="w-4 h-4" />}
            className="border-dashed h-11 rounded-2xl font-bold hover:border-pink-500 hover:text-pink-400"
          >
            Add New Moment Card
          </AdminButton>
        </div>
      )}
    </div>
  );
}
