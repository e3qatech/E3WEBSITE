"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Sparkles,
  Users,
  UserCheck,
  ListOrdered,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Eye,
  EyeOff,
  Search,
  ExternalLink,
  Layers,
  Heart,
  Video,
  MousePointerClick,
  Quote,
  RotateCcw,
  Film,
  Ticket,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  DEFAULT_B2C_LANDING_CONTENT,
  DEFAULT_B2C_SECTION_SEQUENCE,
  B2CSectionItem,
} from "@/lib/cms-default-pages";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/layout/LocaleProvider";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardStickyActions,
  DashboardLanguageSwitch,
  DashboardBilingualField,
  DashboardSectionCard,
  DashboardLoadingState,
  DashboardUnsavedChangesGuard,
  LanguageEditMode,
  EditorSectionItem,
} from "@/components/dashboard/ui";
import { MediaUploader } from "@/components/shared/MediaUploader";

interface B2CLandingCMSViewProps {
  initialData?: any;
}

export function B2CLandingCMSView({ initialData }: B2CLandingCMSViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(!initialData);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>("sequence");
  const [languageMode, setLanguageMode] = useState<LanguageEditMode>("both");
  const [content, setContent] = useState<any>(initialData || DEFAULT_B2C_LANDING_CONTENT);
  const [availableTeamMembers, setAvailableTeamMembers] = useState<any[]>([]);

  // Team search and filter states
  const [teamSearch, setTeamSearch] = useState("");
  const [teamDeptFilter, setTeamDeptFilter] = useState("ALL");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  const sectionsConfig: EditorSectionItem[] = useMemo(
    () => [
      {
        id: "sequence",
        label: isAr ? "١. ترتيب الأقسام" : "1. Section Sequence",
        icon: <ListOrdered className="w-3.5 h-3.5" />,
      },
      {
        id: "hero-content",
        label: isAr ? "٢. نصوص الهيرو" : "2. Hero Copy & Headlines",
        icon: <Sparkles className="w-3.5 h-3.5" />,
      },
      {
        id: "hero-actions",
        label: isAr ? "٣. أزرار الهيرو" : "3. Hero Navigation & Actions",
        icon: <MousePointerClick className="w-3.5 h-3.5" />,
      },
      {
        id: "manifesto",
        label: isAr ? "٤. بيان العلامة" : "4. Brand Manifesto",
        icon: <Quote className="w-3.5 h-3.5" />,
      },
      {
        id: "core-team",
        label: isAr ? "٥. اختيار الفريق" : "5. Core Team Selection",
        icon: <Users className="w-3.5 h-3.5" />,
      },
      {
        id: "hero-media",
        label: isAr ? "٦. وسائط الهيرو" : "6. Presentation Media",
        icon: <Video className="w-3.5 h-3.5" />,
      },
      {
        id: "memories-handoff",
        label: isAr ? "٧. ذكريات الزوار" : "7. Everlasting Memories",
        icon: <Heart className="w-3.5 h-3.5" />,
      },
      {
        id: "footer-cta",
        label: isAr ? "٨. خاتمة الصفحة" : "8. Footer Framing",
        icon: <Layers className="w-3.5 h-3.5" />,
      },
    ],
    [isAr]
  );

  const fetchLatestData = async () => {
    try {
      const res = await fetch("/api/cms/pages/b2c-landing?t=" + Date.now(), {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.content) {
          setContent(json.data.content);
        }
      }
    } catch (_e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      if (!initialData) {
        try {
          const res = await fetch("/api/cms/pages/b2c-landing?t=" + Date.now(), {
            cache: "no-store",
          });
          if (res.ok && isMounted) {
            const json = await res.json();
            if (json?.data?.content) {
              setContent(json.data.content);
            }
          }
        } catch (_e) {
        } finally {
          if (isMounted) setLoading(false);
        }
      }

      try {
        const res = await fetch("/api/team?active=true&t=" + Date.now());
        if (res.ok && isMounted) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setAvailableTeamMembers(data);
          }
        }
      } catch (e) {
        console.error("Failed to load team members:", e);
      }
    }

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [initialData]);

  const updateContent = (updater: (prev: any) => any) => {
    setContent((prev: any) => {
      const updated = updater(prev);
      setIsDirty(true);
      return updated;
    });
  };

  // Section sequence reordering
  const sequence: B2CSectionItem[] = useMemo(() => {
    const raw = content?.sectionSequence || content?.sequence;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw;
    }
    return DEFAULT_B2C_SECTION_SEQUENCE;
  }, [content]);

  const moveSection = (index: number, direction: "up" | "down" | "top" | "bottom") => {
    const list = [...sequence];
    if (direction === "up" && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === "down" && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    } else if (direction === "top" && index > 0) {
      const [moved] = list.splice(index, 1);
      list.unshift(moved);
    } else if (direction === "bottom" && index < list.length - 1) {
      const [moved] = list.splice(index, 1);
      list.push(moved);
    }

    // Update order indices
    const normalized = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    updateContent((prev: any) => ({
      ...prev,
      sectionSequence: normalized,
      sequence: normalized,
    }));
  };

  const toggleSectionVisibility = (index: number) => {
    const list: any[] = [...sequence];
    const isCurrentlyActive = list[index].enabled !== false && list[index].isVisible !== false;
    list[index] = {
      ...list[index],
      enabled: !isCurrentlyActive,
      isVisible: !isCurrentlyActive,
    };
    updateContent((prev: any) => ({
      ...prev,
      sectionSequence: list,
      sequence: list,
    }));
  };

  const resetSequenceToDefault = () => {
    if (
      window.confirm(
        isAr
          ? "هل أنت متأكد من استعادة الترتيب الافتراضي للأقسام؟"
          : "Are you sure you want to reset the section sequence to the default order?"
      )
    ) {
      updateContent((prev: any) => ({
        ...prev,
        sectionSequence: DEFAULT_B2C_SECTION_SEQUENCE,
        sequence: DEFAULT_B2C_SECTION_SEQUENCE,
      }));
      toast(
        isAr ? "تمت استعادة الترتيب الافتراضي" : "Reset to default section sequence",
        "info"
      );
    }
  };

  // Team selection helpers
  const selectedTeamIds: string[] = useMemo(() => {
    if (Array.isArray(content?.coreTeam?.selectedMemberIds)) {
      return content.coreTeam.selectedMemberIds;
    }
    if (Array.isArray(content?.coreTeam?.members)) {
      return content.coreTeam.members.map((m: any) => m.id);
    }
    return [];
  }, [content]);

  const matchesMember = (id: string, member: any) => {
    if (!id || !member) return false;
    return (
      member.id === id ||
      member.slug === id ||
      `team-${member.slug}` === id ||
      (typeof id === "string" && (id.includes(member.id) || member.id.includes(id)))
    );
  };

  const toggleTeamMemberSelection = (member: any) => {
    const current = [...selectedTeamIds];
    const existingIndex = current.findIndex((id) => matchesMember(id, member));

    let updated: string[];
    if (existingIndex >= 0) {
      updated = current.filter((_, idx) => idx !== existingIndex);
    } else {
      updated = [...current, member.id];
    }

    updateContent((prev) => ({
      ...prev,
      coreTeam: {
        ...prev.coreTeam,
        selectedMemberIds: updated,
      },
    }));
  };

  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    availableTeamMembers.forEach((m) => {
      if (m.department) set.add(m.department);
    });
    return Array.from(set);
  }, [availableTeamMembers]);

  const filteredTeamMembers = useMemo(() => {
    return availableTeamMembers.filter((member) => {
      const name = `${member.firstName || ""} ${member.lastName || ""}`.toLowerCase();
      const title = (member.designation || "").toLowerCase();
      const matchesSearch =
        !teamSearch ||
        name.includes(teamSearch.toLowerCase()) ||
        title.includes(teamSearch.toLowerCase());
      const matchesDept = teamDeptFilter === "ALL" || member.department === teamDeptFilter;
      const isSelected = selectedTeamIds.some((id) => matchesMember(id, member));
      const matchesSelectedOnly = !showSelectedOnly || isSelected;

      return matchesSearch && matchesDept && matchesSelectedOnly;
    });
  }, [availableTeamMembers, teamSearch, teamDeptFilter, showSelectedOnly, selectedTeamIds]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentHeroMedia = content.heroMedia || {};
      const currentAct1Hero = content.act1Hero || {};
      const currentHero = content.hero || {};
      const currentCta = content.cta || {};
      const currentFooterMedia = content.footerMedia || {};

      const payload = {
        content: {
          sectionSequence: sequence,
          sequence: sequence,
          heroMedia: {
            ...currentHeroMedia,
            mediaType: currentHeroMedia.mediaType || "IMAGE",
            mediaUrl: currentHeroMedia.mediaUrl || currentHero.mediaUrl || currentAct1Hero.desktopVideoUrl || "",
            posterUrl: currentHeroMedia.posterUrl || currentHero.posterUrl || currentAct1Hero.posterUrl || "",
            fallbackImage: currentHeroMedia.fallbackImage || currentHeroMedia.posterUrl || "",
            badgeEn: currentHeroMedia.badgeEn || currentHero.badgeEn || "E3 QATAR ENTERTAINMENT WORLDS",
            badgeAr: currentHeroMedia.badgeAr || currentHero.badgeAr || "عالم إي ثري الترفيهي بقطر",
          },
          hero: {
            ...currentHero,
            mediaType: currentHeroMedia.mediaType || "IMAGE",
            mediaUrl: currentHeroMedia.mediaUrl || currentHero.mediaUrl || "",
            posterUrl: currentHeroMedia.posterUrl || currentHero.posterUrl || "",
            badgeEn: currentHeroMedia.badgeEn || currentHero.badgeEn || "",
            badgeAr: currentHeroMedia.badgeAr || currentHero.badgeAr || "",
            headerEn: currentAct1Hero.titleEn || currentHero.headerEn || "",
            headerAr: currentAct1Hero.titleAr || currentHero.headerAr || "",
            subHeaderEn: currentAct1Hero.subtextEn || currentHero.subHeaderEn || "",
            subHeaderAr: currentAct1Hero.subtextAr || currentHero.subHeaderAr || "",
            tab1LabelEn: currentAct1Hero.tab1LabelEn || currentHero.tab1LabelEn || "",
            tab1LabelAr: currentAct1Hero.tab1LabelAr || currentHero.tab1LabelAr || "",
            tab1Url: currentAct1Hero.tab1Url || currentHero.tab1Url || "",
            tab2LabelEn: currentAct1Hero.tab2LabelEn || currentHero.tab2LabelEn || "",
            tab2LabelAr: currentAct1Hero.tab2LabelAr || currentHero.tab2LabelAr || "",
            tab2Url: currentAct1Hero.tab2Url || currentHero.tab2Url || "",
          },
          act1Hero: {
            ...currentAct1Hero,
            mediaType: currentHeroMedia.mediaType || "IMAGE",
            mediaUrl: currentHeroMedia.mediaUrl || currentAct1Hero.mediaUrl || "",
            desktopVideoUrl: currentHeroMedia.mediaUrl || currentAct1Hero.desktopVideoUrl || "",
            posterUrl: currentHeroMedia.posterUrl || currentAct1Hero.posterUrl || "",
            titleEn: currentAct1Hero.titleEn || "",
            titleAr: currentAct1Hero.titleAr || "",
            subtextEn: currentAct1Hero.subtextEn || "",
            subtextAr: currentAct1Hero.subtextAr || "",
            tab1LabelEn: currentAct1Hero.tab1LabelEn || "",
            tab1LabelAr: currentAct1Hero.tab1LabelAr || "",
            tab1Url: currentAct1Hero.tab1Url || "",
            tab2LabelEn: currentAct1Hero.tab2LabelEn || "",
            tab2LabelAr: currentAct1Hero.tab2LabelAr || "",
            tab2Url: currentAct1Hero.tab2Url || "",
          },
          act2Curtain: content.act2Curtain || {},
          coreTeam: {
            ...(content.coreTeam || {}),
            headlineEn: content.coreTeam?.headlineEn || "The people behind the experience",
            headlineAr: content.coreTeam?.headlineAr || "الفريق الذي يصنع التجربة",
            selectedMemberIds: selectedTeamIds,
          },
          cta: {
            ...currentCta,
            titleEn: currentCta.titleEn || "",
            titleAr: currentCta.titleAr || "",
            subtitleEn: currentCta.subtitleEn || "",
            subtitleAr: currentCta.subtitleAr || "",
            buttonLabelEn: currentCta.buttonLabelEn || "",
            buttonLabelAr: currentCta.buttonLabelAr || "",
            buttonUrl: currentCta.buttonUrl || "",
            backgroundImage: currentCta.backgroundImage || currentFooterMedia.mediaUrl || "",
            mediaUrl: currentCta.backgroundImage || currentFooterMedia.mediaUrl || "",
          },
          footerMedia: {
            ...currentFooterMedia,
            backgroundImage: currentCta.backgroundImage || currentFooterMedia.mediaUrl || "",
            mediaUrl: currentCta.backgroundImage || currentFooterMedia.mediaUrl || "",
          },
          act7Ticket: {
            ...(content.act7Ticket || {}),
            headlineEn: currentCta.titleEn || content.act7Ticket?.headlineEn || "",
            headlineAr: currentCta.titleAr || content.act7Ticket?.headlineAr || "",
            subtextEn: currentCta.subtitleEn || content.act7Ticket?.subtextEn || "",
            subtextAr: currentCta.subtitleAr || content.act7Ticket?.subtextAr || "",
            backgroundImage: currentCta.backgroundImage || content.act7Ticket?.backgroundImage || "",
          },
        },
      };

      const res = await fetch("/api/cms/pages/b2c-landing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(isAr ? "فشل حفظ صفحة B2C" : "Failed to save B2C Landing page");
      }

      const json = await res.json();
      if (json?.data?.content) {
        setContent(json.data.content);
      }
      setIsDirty(false);

      // Broadcast sync event to live browser preview
      try {
        window.dispatchEvent(new CustomEvent("e3_cms_b2c_landing_updated"));
        const bc = new BroadcastChannel("e3_cms_sync");
        bc.postMessage({ type: "b2c_landing_updated" });
        bc.close();
      } catch (_e) {}

      toast(
        isAr ? "تم حفظ محتوى صفحة B2C بنجاح!" : "B2C Landing Page saved successfully!",
        "success"
      );
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLoadingState
        title={isAr ? "جاري تحميل محرر صفحة B2C..." : "Loading B2C Landing CMS..."}
        type="skeleton"
      />
    );
  }

  const heroMedia = content.heroMedia || content.hero || {};
  const guestMemoriesInfo = content.guestMemories || DEFAULT_B2C_LANDING_CONTENT.guestMemories;
  const momentsCount = Array.isArray(guestMemoriesInfo.moments) ? guestMemoriesInfo.moments.length : 0;
  const ctaData = content.cta || {};
  const footerBgMedia = ctaData.backgroundImage || content.footerMedia?.mediaUrl || "";

  const activeCount = sequence.filter(
    (s: any) => s.enabled !== false && s.isVisible !== false
  ).length;

  return (
    <DashboardPageShell variant="wide">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      {/* Header */}
      <DashboardPageHeader
        title={isAr ? "محرر صفحة B2C الرئيسية" : "B2C Landing Page Editor"}
        description={
          isAr
            ? "التحكم في تسلسل الأقسام، نصوص ووسائط الهيرو، بيان العلامة التجارية، واختيار فريق القيادة ووسائط الخاتمة."
            : "Manage public B2C experience landing page structure, hero video & imagery, brand manifesto, leadership roster, and footer media."
        }
        breadcrumbs={[
          { label: isAr ? "محتوى B2C" : "B2C Content", href: "/dashboard/b2c/attractions" },
          { label: isAr ? "الصفحة الرئيسية" : "Landing Layout" },
        ]}
        badge={{ label: isAr ? "تجارب B2C" : "B2C Experiences", variant: "purple" }}
        previewUrl="/b2c"
        primaryAction={{
          label: saving
            ? isAr
              ? "جاري الحفظ..."
              : "Saving Changes..."
            : isAr
            ? "حفظ التغييرات"
            : "Save Changes",
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      {/* Language Switcher and Section Navigator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <DashboardSectionNavigator
          sections={sectionsConfig}
          activeSectionId={activeSectionId}
          onSelectSection={setActiveSectionId}
        />
        <DashboardLanguageSwitch mode={languageMode} onModeChange={setLanguageMode} />
      </div>

      {/* 1. SECTION SEQUENCE & VISIBILITY */}
      {activeSectionId === "sequence" && (
        <DashboardSectionCard
          title={isAr ? "ترتيب أقسام صفحة B2C الرئيسية وتفعيلها" : "B2C Page Section Sequence & Visibility"}
          description={
            isAr
              ? "تحكم في تسلسل ظهور الأقسام الرأسية وإظهارها أو إخفائها مباشرة على الواجهة العامة."
              : "Reorder vertical storytelling sections and toggle visibility for the public B2C landing page. Changes apply immediately upon saving."
          }
          icon={<ListOrdered className="w-5 h-5 text-[var(--color-primary)]" />}
          badge={
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {activeCount} / {sequence.length} {isAr ? "أقسام مفعلة" : "Active"}
              </span>
              <button
                type="button"
                onClick={resetSequenceToDefault}
                className="px-2.5 py-0.5 rounded-lg text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] bg-[var(--surface-hover)] border border-[var(--border-level-1)] transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset to default sequence"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isAr ? "استعادة الترتيب" : "Reset Order"}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            {sequence.map((sec: any, idx: number) => {
              const isFirst = idx === 0;
              const isLast = idx === sequence.length - 1;
              const isVisible = sec.enabled !== false && sec.isVisible !== false;

              return (
                <div
                  key={sec.id || idx}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all select-none group",
                    isVisible
                      ? "bg-[var(--surface-default)] border-[var(--border-level-1)] shadow-sm hover:border-[var(--color-primary)]/40"
                      : "bg-[var(--bg-level-1)]/60 border-[var(--border-level-1)] opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 border transition-all",
                        isVisible
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-sm"
                          : "bg-[var(--surface-hover)] text-[var(--text-tertiary)] border-[var(--border-level-1)]"
                      )}
                    >
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                          {isAr
                            ? sec.nameAr || sec.nameEn || sec.labelAr || sec.labelEn
                            : sec.nameEn || sec.labelEn}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-[var(--text-tertiary)]">
                          {sec.id}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                        {isAr
                          ? sec.descriptionAr || sec.descriptionEn || "قسم رئيسي في رحلة B2C"
                          : sec.descriptionEn || "Core story section in B2C experience journey"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Visibility Switch */}
                    <button
                      type="button"
                      onClick={() => toggleSectionVisibility(idx)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs",
                        isVisible
                          ? "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-white"
                      )}
                    >
                      {isVisible ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">
                        {isVisible ? (isAr ? "مفعل" : "Visible") : (isAr ? "مخفي" : "Hidden")}
                      </span>
                    </button>

                    {/* Reordering Controls */}
                    <div className="flex items-center bg-[var(--surface-hover)] rounded-xl p-1 border border-[var(--border-level-1)] gap-0.5 shadow-xs">
                      <button
                        onClick={() => moveSection(idx, "top")}
                        disabled={isFirst}
                        type="button"
                        className="p-1.5 text-[var(--text-secondary)] hover:text-purple-400 disabled:opacity-20 rounded-lg transition-all cursor-pointer"
                        title={isAr ? "نقل إلى أعلى الصفحة" : "Move to Top"}
                      >
                        <ChevronsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(idx, "up")}
                        disabled={isFirst}
                        type="button"
                        className="p-1.5 text-[var(--text-secondary)] hover:text-purple-400 disabled:opacity-20 rounded-lg transition-all cursor-pointer"
                        title={isAr ? "تحريك لأعلى" : "Move Up"}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(idx, "down")}
                        disabled={isLast}
                        type="button"
                        className="p-1.5 text-[var(--text-secondary)] hover:text-purple-400 disabled:opacity-20 rounded-lg transition-all cursor-pointer"
                        title={isAr ? "تحريك لأسفل" : "Move Down"}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(idx, "bottom")}
                        disabled={isLast}
                        type="button"
                        className="p-1.5 text-[var(--text-secondary)] hover:text-purple-400 disabled:opacity-20 rounded-lg transition-all cursor-pointer"
                        title={isAr ? "نقل إلى أسفل الصفحة" : "Move to Bottom"}
                      >
                        <ChevronsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardSectionCard>
      )}

      {/* 2. HERO COPY & HEADLINES */}
      {activeSectionId === "hero-content" && (
        <DashboardSectionCard
          title={isAr ? "عناوين ونصوص الهيرو الافتتاحية" : "Act 1: Hero Title & Headlines"}
          description={
            isAr
              ? "العنوان الرئيسي والوصف التوضيحي الذي يظهر في شاشة البداية عند فتح الصفحة."
              : "Main opening headline and subtitle copy displayed on initial viewport entrance."
          }
          icon={<Sparkles className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          <DashboardBilingualField
            label={isAr ? "عنوان الهيرو الرئيسي" : "Main Hero Headline"}
            valueEn={content.act1Hero?.titleEn || content.hero?.headerEn || ""}
            valueAr={content.act1Hero?.titleAr || content.hero?.headerAr || ""}
            onChangeEn={(val) =>
              updateContent((p) => ({
                ...p,
                act1Hero: { ...p.act1Hero, titleEn: val },
                hero: { ...p.hero, headerEn: val },
              }))
            }
            onChangeAr={(val) =>
              updateContent((p) => ({
                ...p,
                act1Hero: { ...p.act1Hero, titleAr: val },
                hero: { ...p.hero, headerAr: val },
              }))
            }
            placeholderEn="e.g. Some days pass. Others become stories."
            placeholderAr="مثال: أيام تمرّ… وأيام تتحول إلى حكايات."
            mode={languageMode}
          />

          <DashboardBilingualField
            label={isAr ? "الوصف التوضيحي للهيرو" : "Hero Subtext Description"}
            type="textarea"
            rows={3}
            valueEn={content.act1Hero?.subtextEn || content.hero?.subHeaderEn || ""}
            valueAr={content.act1Hero?.subtextAr || content.hero?.subHeaderAr || ""}
            onChangeEn={(val) =>
              updateContent((p) => ({
                ...p,
                act1Hero: { ...p.act1Hero, subtextEn: val },
                hero: { ...p.hero, subHeaderEn: val },
              }))
            }
            onChangeAr={(val) =>
              updateContent((p) => ({
                ...p,
                act1Hero: { ...p.act1Hero, subtextAr: val },
                hero: { ...p.hero, subHeaderAr: val },
              }))
            }
            placeholderEn="Enter hero subtitle narrative description..."
            placeholderAr="أدخل الوصف السردي للهيرو..."
            mode={languageMode}
          />

          {/* Headline Preview Box */}
          <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
              {isAr ? "معاينة النص في الهيرو" : "Live Typography Preview"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              {isAr
                ? content.act1Hero?.titleAr || content.hero?.headerAr || "أيام تمرّ… وأيام تتحول إلى حكايات."
                : content.act1Hero?.titleEn || content.hero?.headerEn || "Some days pass. Others become stories."}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {isAr
                ? content.act1Hero?.subtextAr || content.hero?.subHeaderAr || "ادخل عالمًا من الوجهات الترفيهية والتجارب الحية."
                : content.act1Hero?.subtextEn || content.hero?.subHeaderEn || "Enter a world of attractions, live experiences and unforgettable moments."}
            </p>
          </div>
        </DashboardSectionCard>
      )}

      {/* 3. HERO NAVIGATION & ACTIONS */}
      {activeSectionId === "hero-actions" && (
        <DashboardSectionCard
          title={isAr ? "أزرار وإجراءات الهيرو التفاعلية" : "Hero Navigation Tabs & Call to Action Buttons"}
          description={
            isAr
              ? "إعداد أزرار الاستكشاف الرئيسية التي تقود الزوار إلى الوجهات والفعاليات أو التذاكر."
              : "Configure primary exploratory buttons linking to attractions, events, or tickets."
          }
          icon={<MousePointerClick className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          {/* Tab 1 */}
          <div className="p-5 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)]/50 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>{isAr ? "الزر الرئيسي الأول (مثال: استكشف الوجهات)" : "Primary Action Tab 1 (e.g. Attractions)"}</span>
            </h4>
            <DashboardBilingualField
              label={isAr ? "نص الزر الأول" : "Tab 1 Label"}
              valueEn={content.act1Hero?.tab1LabelEn || content.hero?.tab1LabelEn || ""}
              valueAr={content.act1Hero?.tab1LabelAr || content.hero?.tab1LabelAr || ""}
              onChangeEn={(val) =>
                updateContent((p) => ({
                  ...p,
                  act1Hero: { ...p.act1Hero, tab1LabelEn: val },
                  hero: { ...p.hero, tab1LabelEn: val },
                }))
              }
              onChangeAr={(val) =>
                updateContent((p) => ({
                  ...p,
                  act1Hero: { ...p.act1Hero, tab1LabelAr: val },
                  hero: { ...p.hero, tab1LabelAr: val },
                }))
              }
              placeholderEn="e.g. EXPLORE ENTERTAINMENT WORLDS"
              placeholderAr="مثال: استكشف الوجهات الترفيهية"
              mode={languageMode}
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                {isAr ? "رابط وجهة الزر الأول" : "Tab 1 Destination URL"}
              </label>
              <input
                type="text"
                value={content.act1Hero?.tab1Url || content.hero?.tab1Url || ""}
                onChange={(e) =>
                  updateContent((p) => ({
                    ...p,
                    act1Hero: { ...p.act1Hero, tab1Url: e.target.value },
                    hero: { ...p.hero, tab1Url: e.target.value },
                  }))
                }
                placeholder="e.g. /{locale}/b2c/attractions"
                className="w-full h-10 px-3.5 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs font-mono font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Tab 2 */}
          <div className="p-5 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)]/50 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{isAr ? "الزر الثاني (مثال: جدول الفعاليات)" : "Secondary Action Tab 2 (e.g. Live Calendar)"}</span>
            </h4>
            <DashboardBilingualField
              label={isAr ? "نص الزر الثاني" : "Tab 2 Label"}
              valueEn={content.act1Hero?.tab2LabelEn || content.hero?.tab2LabelEn || ""}
              valueAr={content.act1Hero?.tab2LabelAr || content.hero?.tab2LabelAr || ""}
              onChangeEn={(val) =>
                updateContent((p) => ({
                  ...p,
                  act1Hero: { ...p.act1Hero, tab2LabelEn: val },
                  hero: { ...p.hero, tab2LabelEn: val },
                }))
              }
              onChangeAr={(val) =>
                updateContent((p) => ({
                  ...p,
                  act1Hero: { ...p.act1Hero, tab2LabelAr: val },
                  hero: { ...p.hero, tab2LabelAr: val },
                }))
              }
              placeholderEn="e.g. LIVE EVENTS & CALENDAR"
              placeholderAr="مثال: جدول الفعاليات والتذاكر"
              mode={languageMode}
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                {isAr ? "رابط وجهة الزر الثاني" : "Tab 2 Destination URL"}
              </label>
              <input
                type="text"
                value={content.act1Hero?.tab2Url || content.hero?.tab2Url || ""}
                onChange={(e) =>
                  updateContent((p) => ({
                    ...p,
                    act1Hero: { ...p.act1Hero, tab2Url: e.target.value },
                    hero: { ...p.hero, tab2Url: e.target.value },
                  }))
                }
                placeholder="e.g. /{locale}/b2c/calendar"
                className="w-full h-10 px-3.5 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs font-mono font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        </DashboardSectionCard>
      )}

      {/* 4. HERO MEDIA UPLOAD & CONFIGURATION */}
      {activeSectionId === "hero-media" && (
        <DashboardSectionCard
          title={isAr ? "وسائط وخلفيات الهيرو السينمائي" : "Hero Media, Background & Video"}
          description={
            isAr
              ? "تحميل وضبط مقطع الفيديو الرئيسي، صورة البوستر للأجهزة الذكية، وشارة الهيرو العلوية."
              : "Upload and configure the cinematic background video, mobile poster fallback image, and glowing hero badge."
          }
          icon={<Video className="w-5 h-5 text-blue-500" />}
        >
          {/* Media Type & Badge Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                {isAr ? "نوع الوسائط الرئيسية" : "Hero Media Type"}
              </label>
              <select
                value={heroMedia.mediaType || "IMAGE"}
                onChange={(e) =>
                  updateContent((p) => ({
                    ...p,
                    heroMedia: { ...p.heroMedia, mediaType: e.target.value },
                    hero: { ...p.hero, mediaType: e.target.value },
                    act1Hero: { ...p.act1Hero, mediaType: e.target.value },
                  }))
                }
                className="w-full h-11 px-3.5 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
              >
                <option value="VIDEO">{isAr ? "فيديو سينمائي (MP4 / WEBM)" : "Cinematic Video (MP4 / WEBM)"}</option>
                <option value="IMAGE">{isAr ? "صورة ثابتة فائقة الدقة (WEBP / JPG)" : "High-Res Static Image (WEBP / JPG)"}</option>
                <option value="3D_MODEL">{isAr ? "لوحة تفاعلية ثلاثية الأبعاد (Spline 3D)" : "Interactive 3D Stage (Spline / 3D)"}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                {isAr ? "شارة الهيرو العلوية (Badge)" : "Hero Top Badge Tag"}
              </label>
              <DashboardBilingualField
                label={isAr ? "نص الشارة" : "Badge Tag Text"}
                valueEn={heroMedia.badgeEn || "E3 QATAR ENTERTAINMENT WORLDS"}
                valueAr={heroMedia.badgeAr || "عالم إي ثري الترفيهي بقطر"}
                onChangeEn={(val) =>
                  updateContent((p) => ({
                    ...p,
                    heroMedia: { ...p.heroMedia, badgeEn: val },
                    hero: { ...p.hero, badgeEn: val },
                  }))
                }
                onChangeAr={(val) =>
                  updateContent((p) => ({
                    ...p,
                    heroMedia: { ...p.heroMedia, badgeAr: val },
                    hero: { ...p.hero, badgeAr: val },
                  }))
                }
                placeholderEn="e.g. E3 QATAR ENTERTAINMENT WORLDS"
                placeholderAr="مثال: عالم إي ثري الترفيهي بقطر"
                mode={languageMode}
              />
            </div>
          </div>

          {/* Direct Media Upload Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-level-1)]">
            {/* 1. Main Background Video / Media */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  {isAr ? "فيديو أو صورة الخلفية الرئيسية" : "Main Hero Video / Background Media"}
                </label>
                <p className="text-[11px] text-[var(--text-tertiary)] mb-3">
                  {isAr
                    ? "قم برفع ملف الفيديو (.mp4 / .webm) أو الصورة بدقة 4K."
                    : "Upload high-res MP4/WEBM video or full-bleed backdrop image."}
                </p>
              </div>

              <MediaUploader
                value={heroMedia.mediaUrl || content.act1Hero?.desktopVideoUrl || ""}
                onChange={(url) =>
                  updateContent((p) => ({
                    ...p,
                    heroMedia: { ...p.heroMedia, mediaUrl: url },
                    hero: { ...p.hero, mediaUrl: url },
                    act1Hero: { ...p.act1Hero, mediaUrl: url, desktopVideoUrl: url },
                  }))
                }
                accept="video/*,image/*"
              />
            </div>

            {/* 2. Mobile Poster / Fallback Image */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  {isAr ? "صورة البوستر / البديل للأجهزة الذكية" : "Mobile Poster / Preload Poster Image"}
                </label>
                <p className="text-[11px] text-[var(--text-tertiary)] mb-3">
                  {isAr
                    ? "صورة ثابتة تظهر قبل تشغيل الفيديو وعلى شاشات الهواتف."
                    : "Static poster displayed before video streams and on low-power devices."}
                </p>
              </div>

              <MediaUploader
                value={heroMedia.posterUrl || content.act1Hero?.posterUrl || ""}
                onChange={(url) =>
                  updateContent((p) => ({
                    ...p,
                    heroMedia: { ...p.heroMedia, posterUrl: url, fallbackImage: url },
                    hero: { ...p.hero, posterUrl: url },
                    act1Hero: { ...p.act1Hero, posterUrl: url },
                  }))
                }
                accept="image/*"
              />
            </div>
          </div>

          {/* Live Hero Media Preview Box */}
          <div className="p-5 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Film className="w-4 h-4 text-blue-400" />
                <span>{isAr ? "معاينة وسائط الهيرو" : "Live Hero Media Viewport"}</span>
              </span>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                {heroMedia.mediaUrl ? "URL Configured" : "Default Fallback"}
              </span>
            </div>

            <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden bg-zinc-950 border border-white/10 flex items-center justify-center">
              {heroMedia.mediaUrl?.endsWith(".mp4") ||
              heroMedia.mediaUrl?.endsWith(".webm") ||
              heroMedia.mediaType === "VIDEO" ? (
                <video
                  src={heroMedia.mediaUrl}
                  poster={heroMedia.posterUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : heroMedia.mediaUrl ? (
                <img
                  src={heroMedia.mediaUrl}
                  alt="Hero Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 space-y-2 text-zinc-500">
                  <Video className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">{isAr ? "لم يتم تعيين وسائط مخصصة" : "No custom hero media uploaded yet"}</p>
                </div>
              )}

              {/* Overlay Badge Tag preview */}
              <div className="absolute top-4 start-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-widest uppercase">
                {isAr ? heroMedia.badgeAr || "عالم إي ثري الترفيهي بقطر" : heroMedia.badgeEn || "E3 QATAR ENTERTAINMENT WORLDS"}
              </div>
            </div>
          </div>

          {/* Quick link to Specialized B2C Media Manager */}
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-[var(--text-primary)]">
                  {isAr ? "مدير وسائط B2C المتقدم" : "Advanced B2C Media Manager"}
                </h5>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {isAr
                    ? "لإعداد أقنعة الفيديو العضوية والأبعاد المكانية."
                    : "For specialized video window masks and 3D spatial canvas layers."}
                </p>
              </div>
            </div>
            <a
              href={`/${locale}/dashboard/b2c/content/media`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xs shrink-0"
            >
              <span>{isAr ? "فتح المدير" : "Open Manager"}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </DashboardSectionCard>
      )}

      {/* 5. BRAND MANIFESTO */}
      {activeSectionId === "manifesto" && (
        <DashboardSectionCard
          title={isAr ? "بيان وفلسفة العلامة التجارية" : "Act 2: Brand Manifesto & Subtext"}
          description={
            isAr
              ? "نص بيان فلسفة إي ثري قطر الذي يظهر عند التمرير بعد ستارة الهيرو."
              : "E3 Qatar brand philosophy statement displayed upon scrolling past the hero curtain."
          }
          icon={<Quote className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          <DashboardBilingualField
            label={isAr ? "نص بيان العلامة" : "Manifesto Headline"}
            type="textarea"
            rows={4}
            valueEn={content.act2Curtain?.headingEn || ""}
            valueAr={content.act2Curtain?.headingAr || ""}
            onChangeEn={(val) =>
              updateContent((p) => ({
                ...p,
                act2Curtain: { ...p.act2Curtain, headingEn: val },
              }))
            }
            onChangeAr={(val) =>
              updateContent((p) => ({
                ...p,
                act2Curtain: { ...p.act2Curtain, headingAr: val },
              }))
            }
            placeholderEn="Enter English brand manifesto text..."
            placeholderAr="أدخل نص بيان العلامة التجارية..."
            mode={languageMode}
          />
        </DashboardSectionCard>
      )}

      {/* 6. CORE TEAM SELECTION */}
      {activeSectionId === "core-team" && (
        <DashboardSectionCard
          title={isAr ? "فريق القيادة المعروض على الصفحة" : "Core Team & Leadership Display"}
          description={
            isAr
              ? "اختيار والبحث في ملفات القيادات والتنفيذيين المعتمدين من قاعدة بيانات الفريق لعرضهم في الصفحة."
              : "Select, search, and manage executive profiles from the team database showcased on the landing page."
          }
          icon={<Users className="w-5 h-5 text-[var(--color-primary)]" />}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {selectedTeamIds.length} {isAr ? "أعضاء محددون" : "Members Selected"}
            </span>
          }
        >
          <DashboardBilingualField
            label={isAr ? "عنوان قسم الفريق" : "Team Section Title"}
            valueEn={content.coreTeam?.headlineEn || "The people behind the experience"}
            valueAr={content.coreTeam?.headlineAr || "الفريق الذي يصنع التجربة"}
            onChangeEn={(val) =>
              updateContent((p) => ({
                ...p,
                coreTeam: { ...p.coreTeam, headlineEn: val },
              }))
            }
            onChangeAr={(val) =>
              updateContent((p) => ({
                ...p,
                coreTeam: { ...p.coreTeam, headlineAr: val },
              }))
            }
            mode={languageMode}
          />

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[var(--border-level-1)]">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder={isAr ? "ابحث بالاسم أو المسمى..." : "Search team members by name or title..."}
                className="w-full ps-9 pe-3.5 h-10 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={teamDeptFilter}
                onChange={(e) => setTeamDeptFilter(e.target.value)}
                className="h-10 px-3 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="ALL">{isAr ? "جميع الأقسام" : "All Departments"}</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                className={cn(
                  "flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                  showSelectedOnly
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "bg-[var(--bg-level-1)] text-[var(--text-secondary)] border-[var(--border-level-1)] hover:bg-[var(--surface-hover)]"
                )}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>
                  {isAr
                    ? `المحددون فقط (${selectedTeamIds.length})`
                    : `Selected Only (${selectedTeamIds.length})`}
                </span>
              </button>
            </div>
          </div>

          {/* Team Cards Grid */}
          <div className="pt-2">
            {filteredTeamMembers.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[var(--border-level-1)] rounded-2xl bg-[var(--bg-level-1)] space-y-2">
                <Users className="w-8 h-8 text-[var(--text-tertiary)] mx-auto opacity-50" />
                <p className="text-xs text-[var(--text-secondary)]">
                  {isAr ? "لا توجد ملفات فريق مطابقة للبحث." : "No team profiles matching criteria."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {filteredTeamMembers.map((member) => {
                  const isSelected = selectedTeamIds.some((id) => matchesMember(id, member));
                  const fullName =
                    `${member.firstName || ""} ${member.lastName || ""}`.trim() || "Team Member";

                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleTeamMemberSelection(member)}
                      className={cn(
                        "relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 select-none",
                        isSelected
                          ? "border-[var(--color-primary)] bg-[var(--surface-selected)] shadow-sm ring-1 ring-[var(--color-primary)]/30"
                          : "border-[var(--border-level-1)] bg-[var(--bg-level-1)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--surface-hover)]"
                      )}
                    >
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-white/10">
                        {member.profileImage ? (
                          <img
                            src={member.profileImage}
                            alt={fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-purple-400">
                            {member.firstName?.[0] || "E"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                          {fullName}
                        </h4>
                        <p className="text-[11px] text-purple-400 truncate">
                          {member.designation || member.department || "Executive"}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-[var(--border-level-1)]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DashboardSectionCard>
      )}

      {/* 7. EVERLASTING MEMORIES */}
      {activeSectionId === "memories-handoff" && (
        <DashboardSectionCard
          title={isAr ? "مدير ذكريات الزوار واللحظات الخالدة" : "Everlasting Memories & Guest Moments"}
          description={
            isAr
              ? "يتم إدارة بطاقات تجارب الزوار، الشارات، النصوص، والوسائط المصورة عبر مدير الذكريات المخصص."
              : "Guest moment cards, authentic captions, reviewer tags, and photo/video assets are managed in the dedicated Everlasting Memories Manager."
          }
          icon={<Heart className="w-5 h-5 text-pink-500" />}
        >
          <div className="p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)]/50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">
              {isAr ? "ملخص ذكريات الزوار الحالية" : "Current Guest Memories Summary"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[var(--text-secondary)]">{isAr ? "العنوان الرئيسي: " : "Headline: "}</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {isAr
                    ? guestMemoriesInfo.headlineAr || guestMemoriesInfo.headlineEn
                    : guestMemoriesInfo.headlineEn}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">{isAr ? "عدد البطاقات: " : "Moments Configured: "}</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {momentsCount} {isAr ? "بطاقات" : "cards"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-pink-500/20 bg-pink-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  {isAr ? "مدير ذكريات الزوار المخصص" : "Specialized Memories Manager"}
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isAr
                    ? "انتقل إلى مدير الذكريات لإضافة بطاقات الزوار، تعديل النصوص، وإعادة الترتيب."
                    : "Open the dedicated manager to add guest moment cards, edit captions, and reorder."}
                </p>
              </div>
            </div>
            <a
              href={`/${locale}/dashboard/b2c/content/memories`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white transition-all shadow-sm shrink-0"
            >
              <span>{isAr ? "فتح مدير الذكريات" : "Open Memories Manager"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </DashboardSectionCard>
      )}

      {/* 8. FOOTER FRAMING & MEDIA */}
      {activeSectionId === "footer-cta" && (
        <DashboardSectionCard
          title={isAr ? "خاتمة الصفحة ووسائط الفوتر" : "Footer Framing, Media & Final Call to Action"}
          description={
            isAr
              ? "العنوان، نص الدعوة للحجز، صورة/فيديو الخلفية التفاعلي للفوتر، ورابط التذاكر."
              : "Final booking conversion headline, button destination, and atmospheric footer backdrop media."
          }
          icon={<Layers className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          <DashboardBilingualField
            label={isAr ? "عنوان الدعوة للتفاعل" : "CTA Headline"}
            valueEn={content.cta?.titleEn || "Step into the stories"}
            valueAr={content.cta?.titleAr || "ادخل إلى عالم الحكايات"}
            onChangeEn={(val) =>
              updateContent((p) => ({
                ...p,
                cta: { ...p.cta, titleEn: val },
                act7Ticket: { ...p.act7Ticket, headlineEn: val },
              }))
            }
            onChangeAr={(val) =>
              updateContent((p) => ({
                ...p,
                cta: { ...p.cta, titleAr: val },
                act7Ticket: { ...p.act7Ticket, headlineAr: val },
              }))
            }
            mode={languageMode}
          />

          <DashboardBilingualField
            label={isAr ? "نص الزر" : "CTA Button Label"}
            valueEn={content.cta?.buttonLabelEn || "EXPLORE TICKETS & PASSES"}
            valueAr={content.cta?.buttonLabelAr || "استكشف التذاكر والباقات"}
            onChangeEn={(val) =>
              updateContent((p) => ({
                ...p,
                cta: { ...p.cta, buttonLabelEn: val },
                act7Ticket: { ...p.act7Ticket, primaryCtaEn: val },
              }))
            }
            onChangeAr={(val) =>
              updateContent((p) => ({
                ...p,
                cta: { ...p.cta, buttonLabelAr: val },
                act7Ticket: { ...p.act7Ticket, primaryCtaAr: val },
              }))
            }
            mode={languageMode}
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {isAr ? "رابط زر الخاتمة" : "CTA Button Destination URL"}
            </label>
            <input
              type="text"
              value={content.cta?.buttonUrl || "/{locale}/b2c/tickets"}
              onChange={(e) =>
                updateContent((p) => ({
                  ...p,
                  cta: { ...p.cta, buttonUrl: e.target.value },
                }))
              }
              className="w-full h-10 px-3.5 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs font-mono font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Footer Background Media Upload (NEW FEATURE) */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-level-1)]">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                {isAr ? "صورة / وسائط خلفية الفوتر (Footer Background Media)" : "Footer Atmospheric Background Media"}
              </label>
              <p className="text-[11px] text-[var(--text-tertiary)] mb-3">
                {isAr
                  ? "ارفع صورة خلفية أو نقش جمالي يظهر خلف بطاقة التذكرة الرقمية في أسفل الصفحة."
                  : "Upload a decorative background image or event visual displayed behind the Digital Portal Pass."}
              </p>
            </div>

            <MediaUploader
              value={footerBgMedia}
              onChange={(url) =>
                updateContent((p) => ({
                  ...p,
                  cta: { ...p.cta, backgroundImage: url, mediaUrl: url },
                  footerMedia: { ...p.footerMedia, backgroundImage: url, mediaUrl: url },
                  act7Ticket: { ...p.act7Ticket, backgroundImage: url },
                }))
              }
              accept="image/*,video/*"
            />
          </div>

          {/* Footer Preview Card */}
          <div className="p-5 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "معاينة بطاقة التذكرة وخاتمة الفوتر" : "Footer Pass Live Preview"}</span>
            </span>

            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-zinc-950 p-6 text-center space-y-3">
              {footerBgMedia && (
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <img src={footerBgMedia} alt="Footer BG" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="relative z-10 space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isAr ? "بوابة الخيال إلى الذاكرة" : "DIGITAL PORTAL PASS"}
                </span>
                <h4 className="text-lg font-black text-white">
                  {isAr ? content.cta?.titleAr || "ادخل إلى عالم الحكايات" : content.cta?.titleEn || "Step into the stories"}
                </h4>
                <div className="pt-2">
                  <span className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs">
                    {isAr ? content.cta?.buttonLabelAr || "استكشف التذاكر والباقات" : content.cta?.buttonLabelEn || "EXPLORE TICKETS & PASSES"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DashboardSectionCard>
      )}

      {/* Sticky Bottom Actions Bar */}
      <DashboardStickyActions
        onSave={handleSave}
        isSaving={saving}
        isUnsaved={isDirty}
        onDiscard={() => {
          if (
            window.confirm(
              isAr
                ? "إلغاء التغييرات غير المحفوظة واستعادة البيانات؟"
                : "Discard unsaved changes and reload from server?"
            )
          ) {
            fetchLatestData();
            setIsDirty(false);
          }
        }}
      />
    </DashboardPageShell>
  );
}
