"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Sparkles,
  Users,
  CheckCircle,
  UserCheck,
  ListOrdered,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Eye,
  EyeOff,
  RotateCcw,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  Heart,
  ImageIcon,
  Video,
  FileText,
  MousePointerClick,
  Quote,
} from "lucide-react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { UniversalMediaConfig, UniversalMediaSectionEditor } from "@/components/dashboard/ui/UniversalMediaSectionEditor";
import { DEFAULT_B2C_LANDING_CONTENT, DEFAULT_B2C_SECTION_SEQUENCE, B2CSectionItem } from "@/lib/cms-default-pages";
import { resolveMediaType } from "@/lib/media-resolver";
import { cn } from "@/lib/utils";
import { EverlastingMemoriesManager } from "./content/EverlastingMemoriesManager";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardStickyActions,
  DashboardLanguageSwitch,
  DashboardBilingualField,
  DashboardSectionCard,
  DashboardFormGrid,
  DashboardLoadingState,
  DashboardUnsavedChangesGuard,
  LanguageEditMode,
  EditorSectionItem,
  AdminButton,
} from "@/components/dashboard/ui";

interface B2CLandingCMSViewProps {
  initialData?: any;
}

const SECTIONS_CONFIG: EditorSectionItem[] = [
  { id: "sequence", label: "1. Section Sequence", icon: <ListOrdered className="w-3.5 h-3.5" /> },
  { id: "hero-media", label: "2. Hero Media", icon: <ImageIcon className="w-3.5 h-3.5" /> },
  { id: "hero-content", label: "3. Hero Content", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: "hero-actions", label: "4. Hero Actions", icon: <MousePointerClick className="w-3.5 h-3.5" /> },
  { id: "manifesto", label: "5. Brand Manifesto", icon: <Quote className="w-3.5 h-3.5" /> },
  { id: "core-team", label: "6. Core Team", icon: <Users className="w-3.5 h-3.5" /> },
  { id: "memories-settings", label: "7. Memories Settings", icon: <Heart className="w-3.5 h-3.5" /> },
  { id: "guest-moments", label: "8. Guest Moment Cards", icon: <Layers className="w-3.5 h-3.5" /> },
  { id: "footer-media", label: "9. Footer Media", icon: <ImageIcon className="w-3.5 h-3.5" /> },
];

export function B2CLandingCMSView({ initialData }: B2CLandingCMSViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(!initialData);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>("sequence");
  const [languageMode, setLanguageMode] = useState<LanguageEditMode>("both");
  const [content, setContent] = useState<any>(initialData || DEFAULT_B2C_LANDING_CONTENT);
  const [availableTeamMembers, setAvailableTeamMembers] = useState<any[]>([]);

  // Team search and filter states
  const [teamSearch, setTeamSearch] = useState("");
  const [teamDeptFilter, setTeamDeptFilter] = useState("ALL");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  const fetchLatestData = async () => {
    try {
      const res = await fetch("/api/cms/pages/b2c-landing?t=" + Date.now(), { cache: "no-store" });
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

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          setAvailableTeamMembers(json);
        }
      }
    } catch (_e) {}
  };

  useEffect(() => {
    if (initialData) {
      setContent(initialData);
      setLoading(false);
    } else {
      fetchLatestData();
    }
    fetchTeamMembers();

    window.addEventListener("e3_cms_b2c_landing_updated", fetchLatestData);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("e3_cms_sync");
      bc.onmessage = (event) => {
        if (event.data?.type === "b2c_landing_updated") {
          fetchLatestData();
        }
      };
    } catch (_e) {}

    return () => {
      window.removeEventListener("e3_cms_b2c_landing_updated", fetchLatestData);
      if (bc) bc.close();
    };
  }, [initialData]);

  const updateContent = (updater: (prev: any) => any) => {
    setContent((prev: any) => {
      const next = updater(prev);
      setIsDirty(true);
      return next;
    });
  };

  // Section Sequence calculation
  const sectionSequence: B2CSectionItem[] = useMemo(() => {
    const rawSeq: any[] = Array.isArray(content?.sectionSequence) ? content.sectionSequence : [];
    if (rawSeq.length === 0) return DEFAULT_B2C_SECTION_SEQUENCE;

    const userOrdered: B2CSectionItem[] = [];
    const seenIds = new Set<string>();

    for (let i = 0; i < rawSeq.length; i++) {
      const item = rawSeq[i];
      if (item && typeof item.id === "string" && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        const defaultSec = DEFAULT_B2C_SECTION_SEQUENCE.find((d) => d.id === item.id);
        userOrdered.push({
          ...(defaultSec || {}),
          ...item,
          id: item.id,
          enabled: item.enabled !== undefined ? Boolean(item.enabled) : (defaultSec?.enabled ?? true),
          order: userOrdered.length + 1,
        });
      }
    }

    DEFAULT_B2C_SECTION_SEQUENCE.forEach((defaultSec) => {
      if (!seenIds.has(defaultSec.id)) {
        userOrdered.push({
          ...defaultSec,
          order: userOrdered.length + 1,
        });
      }
    });

    return userOrdered;
  }, [content?.sectionSequence]);

  const updateSectionSequence = (newSeq: B2CSectionItem[]) => {
    const normalized = newSeq.map((sec, index) => ({
      ...sec,
      order: index + 1,
    }));
    updateContent((prev) => ({
      ...prev,
      sectionSequence: normalized,
    }));
  };

  const moveSection = (index: number, direction: "up" | "down" | "top" | "bottom") => {
    const items = [...sectionSequence];
    if (direction === "up" && index > 0) {
      const temp = items[index];
      items[index] = items[index - 1];
      items[index - 1] = temp;
    } else if (direction === "down" && index < items.length - 1) {
      const temp = items[index];
      items[index] = items[index + 1];
      items[index + 1] = temp;
    } else if (direction === "top" && index > 0) {
      const [item] = items.splice(index, 1);
      items.unshift(item);
    } else if (direction === "bottom" && index < items.length - 1) {
      const [item] = items.splice(index, 1);
      items.push(item);
    }
    updateSectionSequence(items);
  };

  const toggleSectionEnabled = (index: number) => {
    const items = [...sectionSequence];
    items[index] = {
      ...items[index],
      enabled: !items[index].enabled,
    };
    updateSectionSequence(items);
  };

  const resetSectionSequence = () => {
    if (window.confirm("Reset B2C landing page section sequence to default order?")) {
      updateSectionSequence(DEFAULT_B2C_SECTION_SEQUENCE);
    }
  };

  // Team Selection Handling
  const selectedTeamIds: string[] = useMemo(() => {
    const currentCoreTeam = content.coreTeam || {};
    return Array.isArray(currentCoreTeam.selectedMemberIds)
      ? currentCoreTeam.selectedMemberIds
      : (Array.isArray(currentCoreTeam.members) ? currentCoreTeam.members.map((m: any) => m.id) : []);
  }, [content.coreTeam]);

  const matchesMember = (id: string, m: any) =>
    id === m.id || id === m.slug || `team-${m.slug}` === id || (typeof id === "string" && (id.includes(m.id) || m.id.includes(id)));

  const toggleTeamMemberSelection = (member: any) => {
    const isSelected = selectedTeamIds.some((id) => matchesMember(id, member));
    let newSelectedIds: string[];

    if (isSelected) {
      newSelectedIds = selectedTeamIds.filter((id) => !matchesMember(id, member));
    } else {
      newSelectedIds = [...selectedTeamIds, member.id];
    }

    const selectedObjects = availableTeamMembers
      .filter((m) => newSelectedIds.some((id) => matchesMember(id, m)))
      .map((m) => ({
        id: m.id,
        slug: m.slug || m.id,
        nameEn: `${m.firstName || ""} ${m.lastName || ""}`.trim() || "Team Member",
        nameAr: m.firstNameAr ? `${m.firstNameAr} ${m.lastNameAr || ""}`.trim() : `${m.firstName || ""} ${m.lastName || ""}`.trim(),
        roleEn: m.designation || "Executive",
        roleAr: m.designationAr || m.designation || "قيادي",
        bioEn: m.aboutSummary || m.tagline || "",
        bioAr: m.aboutSummaryAr || m.aboutSummary || m.tagline || "",
        portrait: m.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
        showProfileLink: true,
        profileCtaLabelEn: "View Profile",
        profileCtaLabelAr: "عرض الملف",
      }));

    updateContent((prev) => ({
      ...prev,
      coreTeam: {
        ...(prev.coreTeam || {}),
        selectedMemberIds: newSelectedIds,
        members: selectedObjects,
      },
    }));
  };

  // Filtered Team Members list
  const filteredTeamMembers = useMemo(() => {
    return availableTeamMembers
      .filter((member) => {
        const fullName = `${member.firstName || ""} ${member.lastName || ""} ${member.firstNameAr || ""} ${member.lastNameAr || ""}`.toLowerCase();
        const designation = (member.designation || member.department || "").toLowerCase();
        const matchesQuery = !teamSearch || fullName.includes(teamSearch.toLowerCase()) || designation.includes(teamSearch.toLowerCase());
        const matchesDept = teamDeptFilter === "ALL" || member.department === teamDeptFilter;
        const isSelected = selectedTeamIds.some((id) => matchesMember(id, member));
        const matchesSelectedOnly = !showSelectedOnly || isSelected;

        return matchesQuery && matchesDept && matchesSelectedOnly;
      })
      .sort((a, b) => {
        // Selected members shown first
        const aSelected = selectedTeamIds.some((id) => matchesMember(id, a));
        const bSelected = selectedTeamIds.some((id) => matchesMember(id, b));
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
      });
  }, [availableTeamMembers, teamSearch, teamDeptFilter, showSelectedOnly, selectedTeamIds]);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set<string>();
    availableTeamMembers.forEach((m) => {
      if (m.department) depts.add(m.department);
    });
    return Array.from(depts);
  }, [availableTeamMembers]);

  // Save handler for all 9 sections
  const handleSave = async () => {
    setSaving(true);
    try {
      const heroMedia = content.heroMedia || {};
      const act1Hero = content.act1Hero || {};

      const mediaUrlResolved = (heroMedia.mediaUrl || act1Hero.mediaUrl || act1Hero.desktopVideoUrl || "").trim();
      const mediaTypeResolved = resolveMediaType({ url: mediaUrlResolved, explicitType: heroMedia.mediaType });

      const updatedContent = {
        ...content,
        heroMedia: {
          ...heroMedia,
          mediaUrl: mediaUrlResolved,
          mediaType: mediaTypeResolved,
        },
        hero: {
          ...(content.hero || {}),
          ...heroMedia,
          ...act1Hero,
          headerEn: act1Hero.titleEn || content.hero?.headerEn,
          headerAr: act1Hero.titleAr || content.hero?.headerAr,
          subHeaderEn: act1Hero.subtextEn || content.hero?.subHeaderEn,
          subHeaderAr: act1Hero.subtextAr || content.hero?.subHeaderAr,
          mediaUrl: mediaUrlResolved,
          mediaType: mediaTypeResolved,
          posterUrl: (heroMedia.posterUrl || "").trim(),
        },
        act1Hero: {
          ...act1Hero,
          mediaUrl: mediaUrlResolved,
          mediaType: mediaTypeResolved,
        },
        sectionSequence: sectionSequence,
      };

      const res = await fetch("/api/cms/pages/b2c-landing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            content: updatedContent,
            published: true,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save landing page changes");
      }

      try {
        const bc = new BroadcastChannel("e3_cms_sync");
        bc.postMessage({ type: "b2c_landing_updated", timestamp: Date.now() });
        bc.close();
      } catch (_e) {}

      window.dispatchEvent(new Event("e3_cms_b2c_landing_updated"));

      setIsDirty(false);
      setLastSaved(new Date());
      toast("Landing Page CMS saved successfully!", "success");
      router.refresh();
    } catch (error: any) {
      toast(`Error Saving CMS Page: ${error.message || "Could not update page"}`, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardLoadingState title="Loading B2C Landing Page Editor..." type="skeleton" />;
  }

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      {/* Standard Page Header */}
      <DashboardPageHeader
        title="B2C Landing Page Editor"
        description="Configure public landing page sequences, hero storytelling, brand manifesto, core team showcase, guest moments, and media assets (/b2c)."
        breadcrumbs={[
          { label: "B2C Pages", href: "/dashboard/b2c/landing" },
          { label: "Landing Page Editor" },
        ]}
        badge={{ label: "B2C Public", variant: "purple" }}
        previewUrl="/b2c"
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: saving ? "Saving All..." : "Save All Changes",
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
        secondaryAction={
          <DashboardLanguageSwitch mode={languageMode} onModeChange={setLanguageMode} />
        }
      />

      {/* Standard Long-Editor Section Navigator */}
      <DashboardSectionNavigator
        sections={SECTIONS_CONFIG}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      {/* 1. SECTION SEQUENCE */}
      {activeSectionId === "sequence" && (
        <DashboardSectionCard
          title="Section Sequence & Display Ordering"
          description="Reorder sections, toggle visibility, and customize narrative flow for the public B2C landing page."
          icon={<ListOrdered className="w-5 h-5 text-[var(--color-primary)]" />}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {sectionSequence.filter((s) => s.enabled).length} / {sectionSequence.length} Active
            </span>
          }
          headerAction={
            <AdminButton
              variant="outline"
              size="sm"
              onClick={resetSectionSequence}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Reset Order
            </AdminButton>
          }
        >
          <div className="space-y-2.5">
            {sectionSequence.map((sec, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === sectionSequence.length - 1;

              return (
                <div
                  key={sec.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all",
                    sec.enabled
                      ? "bg-[var(--bg-level-1)] border-[var(--border-level-1)] hover:border-[var(--color-primary)]/40 shadow-sm"
                      : "bg-black/30 border-zinc-800/60 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--surface-active)] text-purple-400 font-mono font-bold text-xs shrink-0 border border-[var(--border-level-1)]">
                      #{idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                          {sec.nameEn}
                        </h4>
                        <span className="text-xs text-[var(--text-tertiary)] font-sans hidden sm:inline" dir="rtl">
                          ({sec.nameAr})
                        </span>
                        {!sec.enabled && (
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Hidden
                          </span>
                        )}
                      </div>
                      {sec.descriptionEn && (
                        <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                          {sec.descriptionEn}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {/* Visibility */}
                    <button
                      onClick={() => toggleSectionEnabled(idx)}
                      type="button"
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        sec.enabled
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                      )}
                    >
                      {sec.enabled ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    {/* Reordering */}
                    <div className="flex items-center bg-[var(--surface-default)] rounded-xl p-0.5 border border-[var(--border-level-1)] gap-0.5">
                      <button
                        onClick={() => moveSection(idx, "top")}
                        disabled={isFirst}
                        type="button"
                        className="p-1 text-[var(--text-secondary)] hover:text-purple-400 disabled:opacity-20 rounded transition-all cursor-pointer"
                        title="Move to Top"
                      >
                        <ChevronsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(idx, "up")}
                        disabled={isFirst}
                        type="button"
                        className="p-1 text-[var(--text-secondary)] hover:text-purple-400 disabled:opacity-20 rounded transition-all cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(idx, "down")}
                        disabled={isLast}
                        type="button"
                        className="p-1 text-[var(--text-secondary)] hover:text-purple-400 disabled:opacity-20 rounded transition-all cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(idx, "bottom")}
                        disabled={isLast}
                        type="button"
                        className="p-1 text-[var(--text-secondary)] hover:text-purple-400 disabled:opacity-20 rounded transition-all cursor-pointer"
                        title="Move to Bottom"
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

      {/* 2. HERO MEDIA */}
      {activeSectionId === "hero-media" && (
        <UniversalMediaSectionEditor
          title="Landing Hero Media Settings"
          subtitle="Universal hero media configuration supporting Video, Image, 3D Canvas, IFrame, and Mobile Fallbacks."
          value={
            content.heroMedia || {
              mediaType: content.act1Hero?.desktopVideoUrl?.match(/\.(mp4|webm)$/i) ? "VIDEO" : "IMAGE",
              mediaUrl: content.act1Hero?.desktopVideoUrl || content.hero?.mediaUrl || "",
              fallbackImage: content.act1Hero?.mobileVideoUrl || content.hero?.posterUrl || "",
              posterUrl: content.act1Hero?.mobileVideoUrl || content.hero?.posterUrl || "",
            }
          }
          onChange={(heroMedia: UniversalMediaConfig) =>
            updateContent((prev) => ({
              ...prev,
              heroMedia,
              act1Hero: {
                ...prev.act1Hero,
                mediaUrl: heroMedia.mediaUrl,
                desktopVideoUrl: heroMedia.mediaUrl,
                mediaType: heroMedia.mediaType,
                mobileVideoUrl: heroMedia.fallbackImage || heroMedia.posterUrl,
              },
              hero: {
                ...prev.hero,
                mediaUrl: heroMedia.mediaUrl,
                mediaType: heroMedia.mediaType,
                posterUrl: heroMedia.fallbackImage || heroMedia.posterUrl,
              },
            }))
          }
          accentColor="purple"
        />
      )}

      {/* 3. HERO CONTENT */}
      {activeSectionId === "hero-content" && (
        <DashboardSectionCard
          title="Act 1: Hero Title & Headlines"
          description="Main opening headline and subtitle copy displayed on initial viewport entrance."
          icon={<Sparkles className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          <DashboardBilingualField
            label="Main Hero Headline"
            valueEn={content.act1Hero?.titleEn || content.hero?.headerEn || ""}
            valueAr={content.act1Hero?.titleAr || content.hero?.headerAr || ""}
            onChangeEn={(val) => updateContent((p) => ({ ...p, act1Hero: { ...p.act1Hero, titleEn: val } }))}
            onChangeAr={(val) => updateContent((p) => ({ ...p, act1Hero: { ...p.act1Hero, titleAr: val } }))}
            placeholderEn="e.g. Some days pass. Others become stories."
            placeholderAr="مثال: أيام تمرّ… وأيام تتحول إلى حكايات."
            mode={languageMode}
          />

          <DashboardBilingualField
            label="Hero Subtext Description"
            type="textarea"
            rows={3}
            valueEn={content.act1Hero?.subtextEn || content.hero?.subHeaderEn || ""}
            valueAr={content.act1Hero?.subtextAr || content.hero?.subHeaderAr || ""}
            onChangeEn={(val) => updateContent((p) => ({ ...p, act1Hero: { ...p.act1Hero, subtextEn: val } }))}
            onChangeAr={(val) => updateContent((p) => ({ ...p, act1Hero: { ...p.act1Hero, subtextAr: val } }))}
            placeholderEn="Enter hero subtitle narrative description..."
            placeholderAr="أدخل الوصف السردي للهيرو..."
            mode={languageMode}
          />
        </DashboardSectionCard>
      )}

      {/* 4. HERO ACTIONS */}
      {activeSectionId === "hero-actions" && (
        <DashboardSectionCard
          title="Hero Navigation Tabs & Call to Action Buttons"
          description="Configure primary exploratory buttons linking to attractions, events, or tickets."
          icon={<MousePointerClick className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          {/* Tab 1 */}
          <div className="p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)]/50 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Primary Action Tab 1 (e.g. Attractions)
            </h4>
            <DashboardBilingualField
              label="Tab 1 Label"
              valueEn={content.act1Hero?.tab1LabelEn || content.hero?.tab1LabelEn || ""}
              valueAr={content.act1Hero?.tab1LabelAr || content.hero?.tab1LabelAr || ""}
              onChangeEn={(val) => updateContent((p) => ({ ...p, act1Hero: { ...p.act1Hero, tab1LabelEn: val } }))}
              onChangeAr={(val) => updateContent((p) => ({ ...p, act1Hero: { ...p.act1Hero, tab1LabelAr: val } }))}
              placeholderEn="e.g. EXPLORE ENTERTAINMENT WORLDS"
              placeholderAr="مثال: استكشف الوجهات الترفيهية"
              mode={languageMode}
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Tab 1 Destination URL
              </label>
              <input
                type="text"
                value={content.act1Hero?.tab1Url || content.hero?.tab1Url || ""}
                onChange={(e) => updateContent((p) => ({ ...p, act1Hero: { ...p.act1Hero, tab1Url: e.target.value } }))}
                placeholder="e.g. /{locale}/b2c/attractions"
                className="w-full h-10 px-3.5 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs font-mono font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Tab 2 */}
          <div className="p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)]/50 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Secondary Action Tab 2 (e.g. Live Calendar)
            </h4>
            <DashboardBilingualField
              label="Tab 2 Label"
              valueEn={content.act1Hero?.tab2LabelEn || content.hero?.tab2LabelEn || ""}
              valueAr={content.act1Hero?.tab2LabelAr || content.hero?.tab2LabelAr || ""}
              onChangeEn={(val) => updateContent((p) => ({ ...p, act1Hero: { ...p.act1Hero, tab2LabelEn: val } }))}
              onChangeAr={(val) => updateContent((p) => ({ ...p, act1Hero: { ...p.act1Hero, tab2LabelAr: val } }))}
              placeholderEn="e.g. LIVE EVENTS & CALENDAR"
              placeholderAr="مثال: جدول الفعاليات والتذاكر"
              mode={languageMode}
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Tab 2 Destination URL
              </label>
              <input
                type="text"
                value={content.act1Hero?.tab2Url || content.hero?.tab2Url || ""}
                onChange={(e) => updateContent((p) => ({ ...p, act1Hero: { ...p.act1Hero, tab2Url: e.target.value } }))}
                placeholder="e.g. /{locale}/b2c/calendar"
                className="w-full h-10 px-3.5 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs font-mono font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        </DashboardSectionCard>
      )}

      {/* 5. BRAND MANIFESTO */}
      {activeSectionId === "manifesto" && (
        <DashboardSectionCard
          title="Act 2: Brand Manifesto & Subtext"
          description="E3 Qatar brand philosophy statement displayed upon scrolling past the hero curtain."
          icon={<Quote className="w-5 h-5 text-[var(--color-primary)]" />}
        >
          <DashboardBilingualField
            label="Manifesto Headline"
            type="textarea"
            rows={3}
            valueEn={content.act2Curtain?.headingEn || ""}
            valueAr={content.act2Curtain?.headingAr || ""}
            onChangeEn={(val) => updateContent((p) => ({ ...p, act2Curtain: { ...p.act2Curtain, headingEn: val } }))}
            onChangeAr={(val) => updateContent((p) => ({ ...p, act2Curtain: { ...p.act2Curtain, headingAr: val } }))}
            placeholderEn="Enter English brand manifesto text..."
            placeholderAr="أدخل نص بيان العلامة التجارية..."
            mode={languageMode}
          />
        </DashboardSectionCard>
      )}

      {/* 6. CORE TEAM */}
      {activeSectionId === "core-team" && (
        <DashboardSectionCard
          title="Core Team & Leadership Display"
          description="Select, search, and reorder executive profiles from the team database showcased on the landing page."
          icon={<Users className="w-5 h-5 text-[var(--color-primary)]" />}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {selectedTeamIds.length} Members Selected
            </span>
          }
        >
          <DashboardBilingualField
            label="Team Section Title"
            valueEn={content.coreTeam?.headlineEn || "The people behind the experience"}
            valueAr={content.coreTeam?.headlineAr || "الفريق الذي يصنع التجربة"}
            onChangeEn={(val) => updateContent((p) => ({ ...p, coreTeam: { ...p.coreTeam, headlineEn: val } }))}
            onChangeAr={(val) => updateContent((p) => ({ ...p, coreTeam: { ...p.coreTeam, headlineAr: val } }))}
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
                placeholder="Search team members by name or title..."
                className="w-full ps-9 pe-3.5 h-10 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={teamDeptFilter}
                onChange={(e) => setTeamDeptFilter(e.target.value)}
                className="h-10 px-3 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="ALL">All Departments</option>
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
                <span>Selected Only ({selectedTeamIds.length})</span>
              </button>
            </div>
          </div>

          {/* Team Cards Grid */}
          <div className="pt-2">
            {filteredTeamMembers.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[var(--border-level-1)] rounded-2xl bg-[var(--bg-level-1)] space-y-2">
                <Users className="w-8 h-8 text-[var(--text-tertiary)] mx-auto opacity-50" />
                <p className="text-xs text-[var(--text-secondary)]">No team profiles matching criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {filteredTeamMembers.map((member) => {
                  const isSelected = selectedTeamIds.some((id) => matchesMember(id, member));
                  const fullName = `${member.firstName || ""} ${member.lastName || ""}`.trim() || "Team Member";

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
                          <img src={member.profileImage} alt={fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-purple-400">
                            {member.firstName?.[0] || "E"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">{fullName}</h4>
                        <p className="text-[11px] text-purple-400 truncate">{member.designation || member.department || "Executive"}</p>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <UserCheck className="w-5 h-5 text-[var(--color-primary)]" />
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

      {/* 7. MEMORIES SETTINGS */}
      {activeSectionId === "memories-settings" && (
        <EverlastingMemoriesManager
          mode="settings-only"
          languageMode={languageMode}
          value={content.guestMemories}
          onChange={(guestMemories) => updateContent((prev) => ({ ...prev, guestMemories }))}
        />
      )}

      {/* 8. GUEST MOMENT CARDS */}
      {activeSectionId === "guest-moments" && (
        <EverlastingMemoriesManager
          mode="moments-only"
          languageMode={languageMode}
          value={content.guestMemories}
          onChange={(guestMemories) => updateContent((prev) => ({ ...prev, guestMemories }))}
        />
      )}

      {/* 9. FOOTER MEDIA */}
      {activeSectionId === "footer-media" && (
        <UniversalMediaSectionEditor
          title="Landing Footer Banner Media Settings"
          subtitle="Universal footer banner media supporting Image, Video, 3D Canvas, IFrame, and Mobile Fallbacks."
          value={content.footerMedia || { mediaType: "IMAGE", mediaUrl: "" }}
          onChange={(footerMedia: UniversalMediaConfig) => updateContent((prev) => ({ ...prev, footerMedia }))}
          accentColor="indigo"
        />
      )}

      {/* Sticky Bottom Actions Bar */}
      <DashboardStickyActions
        onSave={handleSave}
        isSaving={saving}
        isUnsaved={isDirty}
        onDiscard={() => {
          if (window.confirm("Discard unsaved changes and reload from server?")) {
            fetchLatestData();
            setIsDirty(false);
          }
        }}
      />
    </DashboardPageShell>
  );
}
