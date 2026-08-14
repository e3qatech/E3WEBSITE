"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  ExternalLink,
  Layers,
} from "lucide-react";
import { AdminMediaPicker } from "@/components/dashboard/ui/AdminMediaPicker";
import { AdminButton } from "@/components/dashboard/ui/AdminButton";
import { DEFAULT_B2C_LANDING_CONTENT } from "@/lib/cms-default-pages";
import { resolveMediaType } from "@/lib/media-resolver";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/layout/LocaleProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionCard,
  DashboardLanguageSwitch,
  DashboardBilingualField,
  DashboardLoadingState,
  DashboardStickyActions,
  LanguageEditMode,
} from "@/components/dashboard/ui";

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
  isStandalone?: boolean;
}

export function EverlastingMemoriesManager({
  value,
  onChange,
  mode = "all",
  languageMode: propLanguageMode,
  isStandalone = true,
}: EverlastingMemoriesManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const [languageMode, setLanguageMode] = useState<LanguageEditMode>(propLanguageMode || "both");
  const [loading, setLoading] = useState(!value);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const defaultState: Required<EverlastingMemoriesData> = useMemo(() => ({
    badgeEn: value?.badgeEn || (DEFAULT_B2C_LANDING_CONTENT.guestMemories as any)?.badgeEn || "EVERLASTING MEMORIES",
    badgeAr: value?.badgeAr || (DEFAULT_B2C_LANDING_CONTENT.guestMemories as any)?.badgeAr || "ذكريات لا تُنسى",
    headlineEn: value?.headlineEn !== undefined ? value.headlineEn : DEFAULT_B2C_LANDING_CONTENT.guestMemories.headlineEn,
    headlineAr: value?.headlineAr !== undefined ? value.headlineAr : DEFAULT_B2C_LANDING_CONTENT.guestMemories.headlineAr,
    subtextEn: value?.subtextEn !== undefined ? value.subtextEn : DEFAULT_B2C_LANDING_CONTENT.guestMemories.subtextEn,
    subtextAr: value?.subtextAr !== undefined ? value.subtextAr : DEFAULT_B2C_LANDING_CONTENT.guestMemories.subtextAr,
    moments: Array.isArray(value?.moments) ? value.moments : DEFAULT_B2C_LANDING_CONTENT.guestMemories.moments,
  }), [value]);

  const [memories, setMemories] = useState<Required<EverlastingMemoriesData>>(defaultState);

  // Fetch live CMS data when standalone
  useEffect(() => {
    if (value) return;

    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch("/api/cms/pages/b2c-landing?t=" + Date.now(), { cache: "no-store" });
        if (res.ok && isMounted) {
          const json = await res.json();
          const guestMemories = json?.data?.content?.guestMemories || DEFAULT_B2C_LANDING_CONTENT.guestMemories;
          setMemories({
            badgeEn: guestMemories.badgeEn || "EVERLASTING MEMORIES",
            badgeAr: guestMemories.badgeAr || "ذكريات لا تُنسى",
            headlineEn: guestMemories.headlineEn || DEFAULT_B2C_LANDING_CONTENT.guestMemories.headlineEn,
            headlineAr: guestMemories.headlineAr || DEFAULT_B2C_LANDING_CONTENT.guestMemories.headlineAr,
            subtextEn: guestMemories.subtextEn || DEFAULT_B2C_LANDING_CONTENT.guestMemories.subtextEn,
            subtextAr: guestMemories.subtextAr || DEFAULT_B2C_LANDING_CONTENT.guestMemories.subtextAr,
            moments: Array.isArray(guestMemories.moments) ? guestMemories.moments : DEFAULT_B2C_LANDING_CONTENT.guestMemories.moments,
          });
        }
      } catch (err) {
        console.error("Failed to load guest memories data:", err);
        if (isMounted) {
          toast(isAr ? "فشل تحميل بيانات ذكريات الزوار" : "Failed to load guest memories data", "error");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [value, isAr, toast]);

  const updateMemories = (updater: (prev: Required<EverlastingMemoriesData>) => Required<EverlastingMemoriesData>) => {
    setMemories((prev) => {
      const next = updater(prev);
      setIsDirty(true);
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
    const name = isAr ? (item?.titleAr || item?.titleEn) : (item?.titleEn || `Moment #${idx + 1}`);
    if (!window.confirm(isAr ? `هل أنت متأكد من رغبتك في حذف "${name}"؟` : `Are you sure you want to delete "${name}"?`)) return;
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
        const [moved] = copy.splice(idx, 1);
        copy.unshift(moved);
      } else if (direction === "bottom" && idx < copy.length - 1) {
        const [moved] = copy.splice(idx, 1);
        copy.push(moved);
      }
      return { ...prev, moments: copy };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        content: {
          guestMemories: memories,
        },
      };

      const res = await fetch("/api/cms/pages/b2c-landing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(isAr ? "فشل حفظ ذكريات الزوار" : "Failed to save memories content");
      }

      setIsDirty(false);
      toast(isAr ? "تم حفظ ذكريات الزوار بنجاح!" : "Everlasting Memories saved successfully!", "success");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Error saving memories", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardLoadingState title={isAr ? "جاري تحميل مدير الذكريات..." : "Loading Everlasting Memories Manager..."} type="skeleton" />;
  }

  const contentComponent = (
    <div className="space-y-6">
      {/* 1. Reciprocal Ownership Handoff Card */}
      <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              {isAr ? "محرر صفحة B2C الرئيسية" : "B2C Landing Page Editor"}
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr
                ? "إدارة ترتيب الأقسام العامة، نصوص الهيرو، بيان العلامة واختيار فريق القيادة."
                : "Manage section sequence, hero headlines, manifesto, and team selection."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`/${locale}/dashboard/b2c/landing`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-sm"
          >
            <span>{isAr ? "فتح محرر صفحة B2C" : "Open Landing Editor"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={`/${locale}/dashboard/cms/media`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-[var(--text-secondary)] transition-all"
          >
            <span>{isAr ? "مكتبة الوسائط" : "Media Library"}</span>
          </a>
        </div>
      </div>

      {/* 2. Language Switcher (when standalone) */}
      {isStandalone && (
        <div className="flex justify-end">
          <DashboardLanguageSwitch mode={languageMode} onModeChange={setLanguageMode} />
        </div>
      )}

      {/* 3. SECTION HEADINGS & BADGES */}
      {(mode === "all" || mode === "settings-only") && (
        <DashboardSectionCard
          title={isAr ? "إعدادات وعناوين قسم الذكريات" : "Everlasting Memories Headings & Framing"}
          description={
            isAr
              ? "تخصيص الشارة العلوية والعناوين الرئيسية والوصف السردي لقسم ذكريات الزوار."
              : "Customize the ribbon badge, main headline, and storytelling subtext displayed across the memories section."
          }
          icon={<Sparkles className="w-5 h-5 text-pink-500" />}
        >
          <DashboardBilingualField
            label={isAr ? "شارة القسم العلوية" : "Section Ribbon Badge"}
            valueEn={memories.badgeEn}
            valueAr={memories.badgeAr}
            onChangeEn={(val) => updateMemories((prev) => ({ ...prev, badgeEn: val }))}
            onChangeAr={(val) => updateMemories((prev) => ({ ...prev, badgeAr: val }))}
            placeholderEn="e.g. EVERLASTING MEMORIES"
            placeholderAr="مثال: ذكريات لا تُنسى"
            mode={languageMode}
          />

          <DashboardBilingualField
            label={isAr ? "العنوان الرئيسي" : "Section Headline"}
            valueEn={memories.headlineEn}
            valueAr={memories.headlineAr}
            onChangeEn={(val) => updateMemories((prev) => ({ ...prev, headlineEn: val }))}
            onChangeAr={(val) => updateMemories((prev) => ({ ...prev, headlineAr: val }))}
            placeholderEn="e.g. Real Moments. Real Smiles."
            placeholderAr="مثال: لحظات حقيقية… ابتسامات تدوم."
            mode={languageMode}
          />

          <DashboardBilingualField
            label={isAr ? "الوصف التوضيحي السردي" : "Subtext Description"}
            type="textarea"
            rows={2}
            valueEn={memories.subtextEn}
            valueAr={memories.subtextAr}
            onChangeEn={(val) => updateMemories((prev) => ({ ...prev, subtextEn: val }))}
            onChangeAr={(val) => updateMemories((prev) => ({ ...prev, subtextAr: val }))}
            placeholderEn="Enter narrative subtext description..."
            placeholderAr="أدخل الوصف السردي التوضيحي..."
            mode={languageMode}
          />
        </DashboardSectionCard>
      )}

      {/* 4. GUEST MOMENT CARDS LIST */}
      {(mode === "all" || mode === "moments-only") && (
        <DashboardSectionCard
          title={isAr ? "بطاقات لحظات وتجارب الزوار" : "Guest Moment Cards & Captions"}
          description={
            isAr
              ? "إدارة بطاقات تجارب الزوار المصورة، الشارات، النصوص، الترتيب وحالة الظهور."
              : "Add, reorder, edit media, captions, and control public visibility for visitor moment cards."
          }
          icon={<Heart className="w-5 h-5 text-pink-500" />}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
              {memories.moments.length} {isAr ? "بطاقة" : "Cards"}
            </span>
          }
        >
          {memories.moments.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[var(--border-level-1)] rounded-2xl bg-[var(--bg-level-1)] space-y-2">
              <Heart className="w-8 h-8 text-pink-400/50 mx-auto" />
              <p className="text-xs text-[var(--text-secondary)]">
                {isAr ? "لا توجد بطاقات ذكريات حالياً." : "No guest moment cards added yet."}
              </p>
            </div>
          ) : (
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
                      "rounded-2xl border transition-all overflow-hidden",
                      isExpanded
                        ? "border-pink-500/40 bg-[var(--surface-default)] shadow-sm ring-1 ring-pink-500/20"
                        : "border-[var(--border-level-1)] bg-[var(--bg-level-1)]/60 hover:border-[var(--border-level-2)]"
                    )}
                  >
                    {/* Collapsed Header Bar */}
                    <div className="p-4 flex items-center justify-between gap-3 select-none">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>

                        {/* Thumbnail preview */}
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-white/10 flex items-center justify-center">
                          {moment.mediaUrl ? (
                            moment.mediaType === "VIDEO" || moment.mediaUrl.match(/\.(mp4|webm)$/i) ? (
                              <Video className="w-4 h-4 text-purple-400" />
                            ) : (
                              <img src={moment.mediaUrl} alt={moment.titleEn} className="w-full h-full object-cover" />
                            )
                          ) : (
                            <ImageIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                            {moment.titleEn || `Moment #${idx + 1}`}
                          </h4>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">
                            {moment.captionEn || moment.tagEn || "No caption added"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          onClick={() => handleMomentChange(idx, "isVisible", !isVisible)}
                          className={cn(
                            "px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer",
                            isVisible
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                          )}
                        >
                          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isVisible ? (isAr ? "ظاهر" : "Visible") : (isAr ? "مخفي" : "Hidden")}</span>
                        </button>

                        {/* Reordering */}
                        <div className="flex items-center bg-[var(--surface-default)] rounded-xl p-0.5 border border-[var(--border-level-1)] gap-0.5">
                          <button
                            onClick={() => handleMoveMoment(idx, "top")}
                            disabled={isFirst}
                            type="button"
                            className="p-1 text-[var(--text-secondary)] hover:text-pink-400 disabled:opacity-20 rounded transition-all cursor-pointer"
                            title="Move to Top"
                          >
                            <ChevronsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveMoment(idx, "up")}
                            disabled={isFirst}
                            type="button"
                            className="p-1 text-[var(--text-secondary)] hover:text-pink-400 disabled:opacity-20 rounded transition-all cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveMoment(idx, "down")}
                            disabled={isLast}
                            type="button"
                            className="p-1 text-[var(--text-secondary)] hover:text-pink-400 disabled:opacity-20 rounded transition-all cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveMoment(idx, "bottom")}
                            disabled={isLast}
                            type="button"
                            className="p-1 text-[var(--text-secondary)] hover:text-pink-400 disabled:opacity-20 rounded transition-all cursor-pointer"
                            title="Move to Bottom"
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
                            {isAr ? "الصورة أو الفيديو الخاص باللحظة" : "Moment Photo / Video Asset"}
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
                              {isAr ? "شارة البطاقة (الإنجليزية)" : "Card Tag Badge (English)"}
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
                              {isAr ? "شارة البطاقة (العربية)" : "Card Tag Badge (Arabic)"}
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
                          label={isAr ? "عنوان اللحظة" : "Moment Title"}
                          valueEn={moment.titleEn}
                          valueAr={moment.titleAr}
                          onChangeEn={(val) => handleMomentChange(idx, "titleEn", val)}
                          onChangeAr={(val) => handleMomentChange(idx, "titleAr", val)}
                          placeholderEn="Enter moment title..."
                          placeholderAr="أدخل عنوان اللحظة..."
                          mode={languageMode}
                        />

                        <DashboardBilingualField
                          label={isAr ? "نص وقصة اللحظة" : "Moment Caption / Story"}
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
          )}

          <AdminButton
            variant="outline"
            onClick={handleAddMoment}
            fullWidth
            leftIcon={<Plus className="w-4 h-4" />}
            className="border-dashed h-11 rounded-2xl font-bold hover:border-pink-500 hover:text-pink-400 mt-4"
          >
            {isAr ? "إضافة بطاقة لحظات جديدة" : "Add New Moment Card"}
          </AdminButton>
        </DashboardSectionCard>
      )}
    </div>
  );

  if (!isStandalone) {
    return contentComponent;
  }

  return (
    <DashboardPageShell variant="wide">
      <DashboardPageHeader
        title={isAr ? "مدير ذكريات الزوار الخالدة" : "Everlasting Memories Manager"}
        description={
          isAr
            ? "إدارة بطاقات تجارب الزوار، الشارات، العناوين، نصوص القصص، والوسائط المعروضة في صفحة B2C."
            : "Manage Everlasting Memories guest moment cards, headlines, subtexts, and media assets featured on the B2C Landing Page."
        }
        breadcrumbs={[
          { label: isAr ? "محتوى B2C" : "B2C Content", href: "/dashboard/b2c/attractions" },
          { label: isAr ? "ذكريات الزوار" : "Everlasting Memories" },
        ]}
        badge={{ label: isAr ? "ذكريات B2C" : "B2C Public", variant: "purple" }}
        previewUrl="/b2c"
      />

      {contentComponent}

      {/* Sticky Bottom Actions Bar */}
      <DashboardStickyActions
        onSave={handleSave}
        isSaving={saving}
        isUnsaved={isDirty}
        onDiscard={() => {
          if (window.confirm(isAr ? "إلغاء التغييرات غير المحفوظة؟" : "Discard unsaved changes?")) {
            router.refresh();
            setIsDirty(false);
          }
        }}
      />
    </DashboardPageShell>
  );
}
