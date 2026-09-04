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
  Image as ImageIcon,
  Box,
  Globe,
  Play,
  Radio,
  Send,
  ShieldCheck,
  Plus,
  Trash2,
  Share2,
  MessageCircle,
} from "lucide-react";
import { UniversalMediaRenderer, UniversalMediaType } from "@/components/shared/UniversalMediaRenderer";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  DEFAULT_B2C_LANDING_CONTENT,
  DEFAULT_B2C_SECTION_SEQUENCE,
  B2CSectionItem,
} from "@/lib/cms-default-pages";
import {
  DEFAULT_SOCIAL_CHANNELS,
  DEFAULT_SOCIAL_POSTS,
  SocialChannelRecord,
  SocialPostRecord,
} from "@/lib/cms-social";
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
import { E3LivingHeroEditor } from "@/components/dashboard/b2c/E3LivingHeroEditor";

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
        label: isAr ? "٨. خاتمة الصفحة ووسائط الفوتر" : "8. Footer Framing & Universal Media",
        icon: <Layers className="w-3.5 h-3.5" />,
      },
      {
        id: "happening-now",
        label: isAr ? "٩. يحدث الآن — اللحظات الحية" : "9. Happening Now — Live Moments",
        icon: <Radio className="w-3.5 h-3.5" />,
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
      const name = (
        (isAr ? (member.nameAr || member.name) : (member.nameEn || member.name)) ||
        `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
        member.name ||
        ""
      ).toLowerCase();
      const title = (
        (isAr ? (member.designationAr || member.designation) : (member.designation || member.designationAr)) ||
        ""
      ).toLowerCase();
      const matchesSearch =
        !teamSearch ||
        name.includes(teamSearch.toLowerCase()) ||
        title.includes(teamSearch.toLowerCase());
      const matchesDept = teamDeptFilter === "ALL" || member.department === teamDeptFilter || member.departmentKey === teamDeptFilter;
      const isSelected = selectedTeamIds.some((id) => matchesMember(id, member));
      const matchesSelectedOnly = !showSelectedOnly || isSelected;

      return matchesSearch && matchesDept && matchesSelectedOnly;
    });
  }, [availableTeamMembers, teamSearch, teamDeptFilter, showSelectedOnly, selectedTeamIds, isAr]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentHeroMedia = content.heroMedia || {};
      const currentAct1Hero = content.act1Hero || {};
      const currentHero = content.hero || {};
      const currentCta = content.cta || {};
      const currentFooterMedia = content.footerMedia || {};
      const footerMediaUrl = currentFooterMedia.mediaUrl || currentFooterMedia.backgroundImage || currentCta.mediaUrl || currentCta.backgroundImage || content.footerMediaUrl || content.footerBackgroundMediaUrl || "";
      const footerMediaType = currentFooterMedia.mediaType || currentCta.mediaType || content.footerMediaType || "IMAGE";
      const footerPosterUrl = currentFooterMedia.posterMediaUrl || currentFooterMedia.posterUrl || currentCta.posterMediaUrl || content.footerPosterUrl || "";
      const footerDescEn = content.footerDescriptionEn || currentFooterMedia.descriptionEn || "";
      const footerDescAr = content.footerDescriptionAr || currentFooterMedia.descriptionAr || "";

      const payload = {
        content: {
          ...content,
          sectionSequence: sequence,
          sequence: sequence,
          e3LivingHero: content.e3LivingHero || {
            eyebrowEn: currentHeroMedia.badgeEn || currentHero.badgeEn || "E3 QATAR ENTERTAINMENT WORLDS",
            eyebrowAr: currentHeroMedia.badgeAr || currentHero.badgeAr || "عالم إي ثري الترفيهي بقطر",
            fixedHeadlineEn: currentAct1Hero.titleEn || currentHero.headerEn || "SOME DAYS PASS. OTHERS BECOME",
            fixedHeadlineAr: currentAct1Hero.titleAr || currentHero.headerAr || "بعض الأيام تمضي. وأخرى تصبح",
            rotatingWordsEn: ["STORIES", "ADVENTURES", "MOMENTS", "MEMORIES"],
            rotatingWordsAr: ["حكايات", "مغامرات", "لحظات", "ذكريات"],
            descriptionEn: currentAct1Hero.subtextEn || currentHero.subHeaderEn || "",
            descriptionAr: currentAct1Hero.subtextAr || currentHero.subHeaderAr || "",
            preset: "memory-engine",
            animationSpeed: 2800,
            enableRotatingWords: true
          },
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
          act2Curtain: {
            ...DEFAULT_B2C_LANDING_CONTENT.act2Curtain,
            ...(content.act2Curtain || {}),
            headingEn: content.act2Curtain?.headingEn || content.act2Curtain?.headlineEn || content.act2?.headlineEn || DEFAULT_B2C_LANDING_CONTENT.act2Curtain.headingEn,
            headingAr: content.act2Curtain?.headingAr || content.act2Curtain?.headlineAr || content.act2?.headlineAr || DEFAULT_B2C_LANDING_CONTENT.act2Curtain.headingAr,
            subtextEn: content.act2Curtain?.subtextEn || content.act2Curtain?.descriptionEn || DEFAULT_B2C_LANDING_CONTENT.act2Curtain.subtextEn,
            subtextAr: content.act2Curtain?.subtextAr || content.act2Curtain?.descriptionAr || DEFAULT_B2C_LANDING_CONTENT.act2Curtain.subtextAr,
          },
          brandManifesto: {
            ...DEFAULT_B2C_LANDING_CONTENT.brandManifesto,
            ...(content.brandManifesto || {}),
            ...(content.act2Curtain || {}),
          },
          act2: {
            ...(content.act2 || {}),
            headlineEn: content.act2Curtain?.headingEn || content.act2Curtain?.headlineEn || content.act2?.headlineEn || DEFAULT_B2C_LANDING_CONTENT.act2.headlineEn,
            headlineAr: content.act2Curtain?.headingAr || content.act2Curtain?.headlineAr || content.act2?.headlineAr || DEFAULT_B2C_LANDING_CONTENT.act2.headlineAr,
          },
          coreTeam: {
            ...(content.coreTeam || {}),
            headlineEn: content.coreTeam?.headlineEn || "The people behind the experience",
            headlineAr: content.coreTeam?.headlineAr || "الفريق الذي يصنع التجربة",
            selectedMemberIds: selectedTeamIds,
          },
          socialFeed: {
            ...(content.socialFeed || {}),
            channels: content.socialFeed?.channels || DEFAULT_SOCIAL_CHANNELS,
            posts: content.socialFeed?.posts || DEFAULT_SOCIAL_POSTS,
          },
          spatialExperience: content.spatialExperience || {},
          qatarMap: content.qatarMap || {},
          memories: content.memories || {},
          parallaxGallery: content.parallaxGallery || {},
          cta: {
            ...currentCta,
            titleEn: currentCta.titleEn || "",
            titleAr: currentCta.titleAr || "",
            subtitleEn: currentCta.subtitleEn || "",
            subtitleAr: currentCta.subtitleAr || "",
            buttonLabelEn: currentCta.buttonLabelEn || "",
            buttonLabelAr: currentCta.buttonLabelAr || "",
            buttonUrl: currentCta.buttonUrl || "",
            backgroundImage: footerMediaUrl,
            mediaUrl: footerMediaUrl,
            mediaType: footerMediaType,
            posterMediaUrl: footerPosterUrl,
          },
          footerMedia: {
            ...currentFooterMedia,
            backgroundImage: footerMediaUrl,
            mediaUrl: footerMediaUrl,
            mediaType: footerMediaType,
            posterMediaUrl: footerPosterUrl,
            posterUrl: footerPosterUrl,
            descriptionEn: footerDescEn,
            descriptionAr: footerDescAr,
          },
          footerMediaUrl: footerMediaUrl,
          footerMediaType: footerMediaType,
          footerPosterUrl: footerPosterUrl,
          footerBackgroundMediaUrl: footerMediaUrl,
          footerBackgroundMediaType: footerMediaType,
          footerBackgroundPosterUrl: footerPosterUrl,
          footerDescriptionEn: footerDescEn,
          footerDescriptionAr: footerDescAr,
          act7Ticket: {
            ...(content.act7Ticket || {}),
            headlineEn: currentCta.titleEn || content.act7Ticket?.headlineEn || "",
            headlineAr: currentCta.titleAr || content.act7Ticket?.headlineAr || "",
            subtextEn: currentCta.subtitleEn || content.act7Ticket?.subtextEn || "",
            subtextAr: currentCta.subtitleAr || content.act7Ticket?.subtextAr || "",
            backgroundImage: footerMediaUrl || content.act7Ticket?.backgroundImage || "",
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
  const footerMedia = content.footerMedia || {};
  const footerBgMedia = footerMedia.mediaUrl || footerMedia.backgroundImage || ctaData.mediaUrl || ctaData.backgroundImage || content.footerMediaUrl || content.footerBackgroundMediaUrl || "";
  const footerMediaType = (footerMedia.mediaType || ctaData.mediaType || content.footerMediaType || "IMAGE").toUpperCase();
  const footerPosterMedia = footerMedia.posterMediaUrl || footerMedia.posterUrl || ctaData.posterMediaUrl || content.footerPosterUrl || "";
  const footerDescEn = content.footerDescriptionEn || footerMedia.descriptionEn || "";
  const footerDescAr = content.footerDescriptionAr || footerMedia.descriptionAr || "";

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

      {/* Language Switcher Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="text-xs font-medium text-[var(--text-tertiary)] flex items-center gap-1.5">
          <span>{isAr ? "أقسام الصفحة:" : "Page Sections:"}</span>
          <span className="font-mono font-bold text-[var(--color-primary)]">{sectionsConfig.length}</span>
        </div>
        <DashboardLanguageSwitch mode={languageMode} onModeChange={setLanguageMode} />
      </div>

      {/* Section Navigator */}
      <DashboardSectionNavigator
        sections={sectionsConfig}
        activeSectionId={activeSectionId}
        onSelectSection={setActiveSectionId}
      />

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

      {/* 2. HERO COPY & HEADLINES (E3 Living Hero System) */}
      {activeSectionId === "hero-content" && (
        <E3LivingHeroEditor
          value={content.e3LivingHero || {
            eyebrowEn: content.heroMedia?.badgeEn || content.hero?.badgeEn || "E3 QATAR ENTERTAINMENT WORLDS",
            eyebrowAr: content.heroMedia?.badgeAr || content.hero?.badgeAr || "عالم إي ثري الترفيهي بقطر",
            fixedHeadlineEn: content.act1Hero?.titleEn || content.hero?.headerEn || "SOME DAYS PASS. OTHERS BECOME",
            fixedHeadlineAr: content.act1Hero?.titleAr || content.hero?.headerAr || "بعض الأيام تمضي. وأخرى تصبح",
            rotatingWordsEn: ["STORIES", "ADVENTURES", "MOMENTS", "MEMORIES"],
            rotatingWordsAr: ["حكايات", "مغامرات", "لحظات", "ذكريات"],
            descriptionEn: content.act1Hero?.subtextEn || content.hero?.subHeaderEn || "",
            descriptionAr: content.act1Hero?.subtextAr || content.hero?.subHeaderAr || "",
            primaryCta: {
              labelEn: content.act1Hero?.tab1LabelEn || content.hero?.tab1LabelEn || "Begin Your Story",
              labelAr: content.act1Hero?.tab1LabelAr || content.hero?.tab1LabelAr || "ابدأ حكايتك",
              url: content.act1Hero?.tab1Url || content.hero?.tab1Url || "#bring-it-to-life"
            },
            secondaryCta: {
              labelEn: content.act1Hero?.tab2LabelEn || content.hero?.tab2LabelEn || "See What's On Today",
              labelAr: content.act1Hero?.tab2LabelAr || content.hero?.tab2LabelAr || "اكتشف فعاليات اليوم",
              url: content.act1Hero?.tab2Url || content.hero?.tab2Url || "#living-day"
            },
            media: {
              mediaType: content.heroMedia?.mediaType || "IMAGE",
              mediaUrl: content.heroMedia?.mediaUrl || content.hero?.mediaUrl || "",
              posterUrl: content.heroMedia?.posterUrl || content.hero?.posterUrl || ""
            },
            preset: "memory-engine",
            animationSpeed: 2800,
            enableRotatingWords: true
          }}
          onChange={(updated) => {
            updateContent((p) => ({
              ...p,
              e3LivingHero: updated,
              heroMedia: {
                ...p.heroMedia,
                mediaType: updated.media?.mediaType || "IMAGE",
                mediaUrl: updated.media?.mediaUrl || "",
                posterUrl: updated.media?.posterUrl || "",
                badgeEn: updated.eyebrowEn || "",
                badgeAr: updated.eyebrowAr || "",
              },
              hero: {
                ...p.hero,
                badgeEn: updated.eyebrowEn || "",
                badgeAr: updated.eyebrowAr || "",
                headerEn: updated.fixedHeadlineEn || "",
                headerAr: updated.fixedHeadlineAr || "",
                headlineTemplateEn: updated.headlineTemplateEn || "",
                headlineTemplateAr: updated.headlineTemplateAr || "",
                subHeaderEn: updated.descriptionEn || "",
                subHeaderAr: updated.descriptionAr || "",
                tab1LabelEn: updated.primaryCta?.labelEn || "",
                tab1LabelAr: updated.primaryCta?.labelAr || "",
                tab1Url: updated.primaryCta?.url || "",
                tab2LabelEn: updated.secondaryCta?.labelEn || "",
                tab2LabelAr: updated.secondaryCta?.labelAr || "",
                tab2Url: updated.secondaryCta?.url || "",
                mediaType: updated.media?.mediaType || "IMAGE",
                mediaUrl: updated.media?.mediaUrl || "",
                posterUrl: updated.media?.posterUrl || "",
                animationType: updated.animationType || "blur-morph",
                wordStyle: updated.wordStyle || "static-gradient",
                alignmentEn: updated.alignmentEn || "center",
                alignmentAr: updated.alignmentAr || "center",
                alignment: updated.alignment || "center",
                animationDuration: updated.animationDuration || 600,
                animationSpeed: updated.animationSpeed || 2800,
              },
              act1Hero: {
                ...p.act1Hero,
                titleEn: updated.fixedHeadlineEn || "",
                titleAr: updated.fixedHeadlineAr || "",
                headlineTemplateEn: updated.headlineTemplateEn || "",
                headlineTemplateAr: updated.headlineTemplateAr || "",
                animationType: updated.animationType || "blur-morph",
                wordStyle: updated.wordStyle || "static-gradient",
                alignmentEn: updated.alignmentEn || "center",
                alignmentAr: updated.alignmentAr || "center",
                alignment: updated.alignment || "center",
                animationDuration: updated.animationDuration || 600,
                animationSpeed: updated.animationSpeed || 2800,
                subtextEn: updated.descriptionEn || "",
                subtextAr: updated.descriptionAr || "",
                tab1LabelEn: updated.primaryCta?.labelEn || "",
                tab1LabelAr: updated.primaryCta?.labelAr || "",
                tab1Url: updated.primaryCta?.url || "",
                tab2LabelEn: updated.secondaryCta?.labelEn || "",
                tab2LabelAr: updated.secondaryCta?.labelAr || "",
                tab2Url: updated.secondaryCta?.url || "",
                mediaType: updated.media?.mediaType || "IMAGE",
                mediaUrl: updated.media?.mediaUrl || "",
                desktopVideoUrl: updated.media?.mediaUrl || "",
                posterUrl: updated.media?.posterUrl || ""
              }
            }));
          }}
          isAr={isAr}
          languageMode={languageMode === 'ar' ? 'AR' : languageMode === 'en' ? 'EN' : 'BOTH'}
          defaultPreset="memory-engine"
        />
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
              ? "إدارة بيان رؤية وفلسفة إي ثري قطر، العنوان الرئيسي، السرد الفلسفي الموسّع، الوسائط البصرية الخلفية، والدعوة للاستكشاف."
              : "Manage E3 Qatar brand philosophy statement, curtain headline, expanded narrative subtext, background visual media, and conversion actions."
          }
          icon={<Quote className="w-5 h-5 text-[var(--color-primary)]" />}
          headerAction={
            <button
              type="button"
              onClick={() => {
                updateContent((p) => ({
                  ...p,
                  act2Curtain: {
                    ...DEFAULT_B2C_LANDING_CONTENT.act2Curtain,
                    ...(p.act2Curtain || {}),
                    badgeEn: DEFAULT_B2C_LANDING_CONTENT.act2Curtain.badgeEn,
                    badgeAr: DEFAULT_B2C_LANDING_CONTENT.act2Curtain.badgeAr,
                    headingEn: DEFAULT_B2C_LANDING_CONTENT.act2Curtain.headingEn,
                    headingAr: DEFAULT_B2C_LANDING_CONTENT.act2Curtain.headingAr,
                    subtextEn: DEFAULT_B2C_LANDING_CONTENT.act2Curtain.subtextEn,
                    subtextAr: DEFAULT_B2C_LANDING_CONTENT.act2Curtain.subtextAr,
                    quoteEn: DEFAULT_B2C_LANDING_CONTENT.act2Curtain.quoteEn,
                    quoteAr: DEFAULT_B2C_LANDING_CONTENT.act2Curtain.quoteAr,
                    quoteAuthorEn: DEFAULT_B2C_LANDING_CONTENT.act2Curtain.quoteAuthorEn,
                    quoteAuthorAr: DEFAULT_B2C_LANDING_CONTENT.act2Curtain.quoteAuthorAr,
                  },
                }));
                toast(
                  isAr ? "تم تحميل نصوص بيان العلامة الافتراضية بنجاح" : "Loaded official E3 brand manifesto defaults",
                  "success"
                );
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? "استعادة النصوص المعتمدة" : "Load Official Manifesto"}</span>
            </button>
          }
        >
          {/* 1. Category Eyebrow / Badge */}
          <DashboardBilingualField
            label={isAr ? "شارة / وسام الفلسفة" : "Philosophy Eyebrow / Badge"}
            valueEn={content.act2Curtain?.badgeEn ?? DEFAULT_B2C_LANDING_CONTENT.act2Curtain.badgeEn}
            valueAr={content.act2Curtain?.badgeAr ?? DEFAULT_B2C_LANDING_CONTENT.act2Curtain.badgeAr}
            onChangeEn={(val) =>
              updateContent((p) => ({
                ...p,
                act2Curtain: { ...p.act2Curtain, badgeEn: val },
              }))
            }
            onChangeAr={(val) =>
              updateContent((p) => ({
                ...p,
                act2Curtain: { ...p.act2Curtain, badgeAr: val },
              }))
            }
            placeholderEn="e.g. E3 BRAND PHILOSOPHY & MANIFESTO"
            placeholderAr="مثال: بيان وفلسفة العلامة التجارية"
            mode={languageMode}
          />

          {/* 2. Primary Manifesto Headline */}
          <DashboardBilingualField
            label={isAr ? "عنوان بيان العلامة الرئيسي" : "Manifesto Headline"}
            type="textarea"
            rows={3}
            valueEn={content.act2Curtain?.headingEn ?? (content.act2?.headlineEn || DEFAULT_B2C_LANDING_CONTENT.act2Curtain.headingEn)}
            valueAr={content.act2Curtain?.headingAr ?? (content.act2?.headlineAr || DEFAULT_B2C_LANDING_CONTENT.act2Curtain.headingAr)}
            onChangeEn={(val) =>
              updateContent((p) => ({
                ...p,
                act2Curtain: { ...p.act2Curtain, headingEn: val, headlineEn: val },
                act2: { ...(p.act2 || {}), headlineEn: val },
              }))
            }
            onChangeAr={(val) =>
              updateContent((p) => ({
                ...p,
                act2Curtain: { ...p.act2Curtain, headingAr: val, headlineAr: val },
                act2: { ...(p.act2 || {}), headlineAr: val },
              }))
            }
            placeholderEn="Enter English brand manifesto text..."
            placeholderAr="أدخل نص بيان العلامة التجارية..."
            mode={languageMode}
          />

          {/* 3. Detailed Narrative Subtext */}
          <DashboardBilingualField
            label={isAr ? "السرد الفلسفي والبيان الموسّع" : "Expanded Narrative Subtext & Philosophy Statement"}
            type="textarea"
            rows={4}
            valueEn={content.act2Curtain?.subtextEn ?? DEFAULT_B2C_LANDING_CONTENT.act2Curtain.subtextEn}
            valueAr={content.act2Curtain?.subtextAr ?? DEFAULT_B2C_LANDING_CONTENT.act2Curtain.subtextAr}
            onChangeEn={(val) =>
              updateContent((p) => ({
                ...p,
                act2Curtain: { ...p.act2Curtain, subtextEn: val, descriptionEn: val },
              }))
            }
            onChangeAr={(val) =>
              updateContent((p) => ({
                ...p,
                act2Curtain: { ...p.act2Curtain, subtextAr: val, descriptionAr: val },
              }))
            }
            placeholderEn="Enter expanded brand narrative and philosophy statement..."
            placeholderAr="أدخل السرد الموسع وبيان رؤية وفلسفة العلامة..."
            mode={languageMode}
          />

          {/* 4. Signature Quote & Attribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-level-1)]">
            <DashboardBilingualField
              label={isAr ? "اقتباس مميز أو عبارة توقيع" : "Accent Quote / Signature Motto"}
              valueEn={content.act2Curtain?.quoteEn ?? DEFAULT_B2C_LANDING_CONTENT.act2Curtain.quoteEn}
              valueAr={content.act2Curtain?.quoteAr ?? DEFAULT_B2C_LANDING_CONTENT.act2Curtain.quoteAr}
              onChangeEn={(val) =>
                updateContent((p) => ({
                  ...p,
                  act2Curtain: { ...p.act2Curtain, quoteEn: val },
                }))
              }
              onChangeAr={(val) =>
                updateContent((p) => ({
                  ...p,
                  act2Curtain: { ...p.act2Curtain, quoteAr: val },
                }))
              }
              placeholderEn="e.g. Some days pass. Others become stories."
              placeholderAr="مثال: أيام تمرّ… وأيام تتحول إلى حكايات."
              mode={languageMode}
            />

            <DashboardBilingualField
              label={isAr ? "الجهة المنسوبة أو التوقيع" : "Quote Attribution / Signoff"}
              valueEn={content.act2Curtain?.quoteAuthorEn ?? DEFAULT_B2C_LANDING_CONTENT.act2Curtain.quoteAuthorEn}
              valueAr={content.act2Curtain?.quoteAuthorAr ?? DEFAULT_B2C_LANDING_CONTENT.act2Curtain.quoteAuthorAr}
              onChangeEn={(val) =>
                updateContent((p) => ({
                  ...p,
                  act2Curtain: { ...p.act2Curtain, quoteAuthorEn: val },
                }))
              }
              onChangeAr={(val) =>
                updateContent((p) => ({
                  ...p,
                  act2Curtain: { ...p.act2Curtain, quoteAuthorAr: val },
                }))
              }
              placeholderEn="e.g. E3 Creative & Engineering Atelier"
              placeholderAr="مثال: استوديو إي ثري للإبداع والهندسة"
              mode={languageMode}
            />
          </div>

          {/* 5. Direct Media Upload Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-level-1)]">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  {isAr ? "وسائط خلفية ستارة بيان العلامة" : "Manifesto Backdrop Media (Video / Image)"}
                </label>
                <p className="text-[11px] text-[var(--text-tertiary)] mb-3">
                  {isAr
                    ? "فيديو أو صورة سينمائية تظهر في خلفية ستارة بيان العلامة."
                    : "Cinematic video loop or high-resolution backdrop image behind the manifesto."}
                </p>
              </div>

              <MediaUploader
                value={content.act2Curtain?.mediaUrl || ""}
                onChange={(url) =>
                  updateContent((p) => ({
                    ...p,
                    act2Curtain: { ...p.act2Curtain, mediaUrl: url },
                  }))
                }
                accept="video/*,image/*"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  {isAr ? "صورة البوستر / البديل" : "Manifesto Poster / Fallback Image"}
                </label>
                <p className="text-[11px] text-[var(--text-tertiary)] mb-3">
                  {isAr
                    ? "صورة ثابتة تظهر قبل تحميل الفيديو وعلى الأجهزة المحمولة."
                    : "Static poster displayed prior to video buffering and on mobile devices."}
                </p>
              </div>

              <MediaUploader
                value={content.act2Curtain?.posterUrl || ""}
                onChange={(url) =>
                  updateContent((p) => ({
                    ...p,
                    act2Curtain: { ...p.act2Curtain, posterUrl: url },
                  }))
                }
                accept="image/*"
              />
            </div>
          </div>

          {/* 6. Live Manifesto Visual Preview Card */}
          <div className="p-5 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Quote className="w-4 h-4 text-purple-400" />
                <span>{isAr ? "معاينة ستارة بيان العلامة" : "Manifesto Curtain Preview"}</span>
              </span>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                {content.act2Curtain?.mediaUrl ? "Custom Media Set" : "Ambient Scrim"}
              </span>
            </div>

            <div className="relative w-full rounded-2xl overflow-hidden bg-[#090e1a] border border-white/10 p-6 sm:p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
              {content.act2Curtain?.mediaUrl && (
                <div className="absolute inset-0 z-0 opacity-25">
                  {content.act2Curtain.mediaUrl.endsWith(".mp4") || content.act2Curtain.mediaType === "VIDEO" ? (
                    <video src={content.act2Curtain.mediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img src={content.act2Curtain.mediaUrl} alt="Manifesto Background" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090e1a] via-[#090e1a]/80 to-[#090e1a]/40" />
                </div>
              )}

              <div className="relative z-10 max-w-2xl mx-auto space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold tracking-widest uppercase">
                  {isAr
                    ? content.act2Curtain?.badgeAr || DEFAULT_B2C_LANDING_CONTENT.act2Curtain.badgeAr
                    : content.act2Curtain?.badgeEn || DEFAULT_B2C_LANDING_CONTENT.act2Curtain.badgeEn}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-syne tracking-tight">
                  {isAr
                    ? content.act2Curtain?.headingAr || DEFAULT_B2C_LANDING_CONTENT.act2Curtain.headingAr
                    : content.act2Curtain?.headingEn || DEFAULT_B2C_LANDING_CONTENT.act2Curtain.headingEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {isAr
                    ? content.act2Curtain?.subtextAr || DEFAULT_B2C_LANDING_CONTENT.act2Curtain.subtextAr
                    : content.act2Curtain?.subtextEn || DEFAULT_B2C_LANDING_CONTENT.act2Curtain.subtextEn}
                </p>
              </div>
            </div>
          </div>

          {/* 7. Quick link to Ideas to Life 6-Step Evolution Manager */}
          <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-[var(--text-primary)]">
                  {isAr ? "مدير رحلة تحويل الأفكار إلى واقع (Ideas to Life)" : "Ideas to Life 6-Step Evolution Manager"}
                </h5>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {isAr
                    ? "إدارة المراحل الست التفاعلية التي تلي ستارة بيان العلامة في صفحة التجارب."
                    : "Manage the interactive 6-step evolution stages following the brand manifesto."}
                </p>
              </div>
            </div>
            <a
              href={`/${locale}/dashboard/b2c/content/ideas`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-xs shrink-0"
            >
              <span>{isAr ? "فتح مدير الأفكار" : "Open Ideas Manager"}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
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
                    (isAr ? (member.nameAr || member.name) : (member.nameEn || member.name)) ||
                    `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
                    member.name ||
                    "Team Member";
                  const designation =
                    (isAr ? (member.designationAr || member.designation) : (member.designation || member.designationAr)) ||
                    member.department ||
                    "Executive";

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
                            {member.initials || member.name?.[0] || member.firstName?.[0] || "E"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                          {fullName}
                        </h4>
                        <p className="text-[11px] text-purple-400 truncate">
                          {designation}
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

      {/* 8. E3 HAPPENING NOW — LIVE MOMENTS / SOCIAL MEDIA PULSE */}
      {activeSectionId === "happening-now" && (
        <DashboardSectionCard
          title={isAr ? "يحدث الآن — جدار اللحظات الحية وشبكات التواصل" : "E3 Happening Now — Live Moments & Social Media Wall"}
          description={
            isAr
              ? "تحكم بنصوص جدار الذكريات الحي، الحسابات الرسمية المربوطة (إنستغرام، يوتيوب، تيك توك)، وبطاقات اللحظات والتغطيات المباشرة للفعاليات."
              : "Configure the live social pulse, official connected accounts (Instagram, YouTube, TikTok), and live moment cards streamed to guests."
          }
          icon={<Radio className="w-5 h-5 text-emerald-400" />}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {(content.socialFeed?.posts || DEFAULT_SOCIAL_POSTS).filter((p: any) => p.isVisible !== false).length} {isAr ? "لحظة نشطة" : "Active Moments"}
            </span>
          }
        >
          {/* Sub-section 1: Section Eyebrow & Headlines */}
          <div className="space-y-4 pb-6 border-b border-[var(--border-level-1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {isAr ? "١. العناوين والنصوص التعريفية" : "1. Section Headlines & Subtitles"}
                </h4>
              </div>
              <a
                href={`/${locale}/b2c#social-feed`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-purple-400 hover:underline"
              >
                <span>{isAr ? "معاينة القسم المباشر" : "View Live Section"}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <DashboardBilingualField
              label={isAr ? "شارة القسم العلوية (Eyebrow)" : "Section Eyebrow Badge"}
              valueEn={content.socialFeed?.eyebrowEn || "LIVE MEMORY WALL — HAPPENING NOW"}
              valueAr={content.socialFeed?.eyebrowAr || "جدار الذكريات التفاعلي — LIVE MEMORY WALL"}
              onChangeEn={(val) =>
                updateContent((p) => ({
                  ...p,
                  socialFeed: { ...(p.socialFeed || {}), eyebrowEn: val },
                }))
              }
              onChangeAr={(val) =>
                updateContent((p) => ({
                  ...p,
                  socialFeed: { ...(p.socialFeed || {}), eyebrowAr: val },
                }))
              }
              mode={languageMode}
            />

            <DashboardBilingualField
              label={isAr ? "العنوان الرئيسي" : "Main Headline"}
              valueEn={content.socialFeed?.headlineEn || "E3 Happening Now — Live Moments"}
              valueAr={content.socialFeed?.headlineAr || "إي ثري الآن — لحظات حية مباشرة"}
              onChangeEn={(val) =>
                updateContent((p) => ({
                  ...p,
                  socialFeed: { ...(p.socialFeed || {}), headlineEn: val },
                }))
              }
              onChangeAr={(val) =>
                updateContent((p) => ({
                  ...p,
                  socialFeed: { ...(p.socialFeed || {}), headlineAr: val },
                }))
              }
              mode={languageMode}
            />

            <DashboardBilingualField
              label={isAr ? "النص الوصفي الفرعي" : "Subtext / Description"}
              valueEn={
                content.socialFeed?.subtextEn ||
                "Real-time moments, live event highlights, and guest stories streaming across official E3 channels."
              }
              valueAr={
                content.socialFeed?.subtextAr ||
                "تابع أحدث الفعاليات واللحظات الترفيهية الحية عبر حساباتنا الرسمية."
              }
              onChangeEn={(val) =>
                updateContent((p) => ({
                  ...p,
                  socialFeed: { ...(p.socialFeed || {}), subtextEn: val },
                }))
              }
              onChangeAr={(val) =>
                updateContent((p) => ({
                  ...p,
                  socialFeed: { ...(p.socialFeed || {}), subtextAr: val },
                }))
              }
              mode={languageMode}
            />
          </div>

          {/* Sub-section 2: Official Connected Social Channels */}
          <div className="space-y-4 pb-6 border-b border-[var(--border-level-1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {isAr ? "٢. الحسابات والقنوات الرسمية المتصلة" : "2. Official Connected Social Channels"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  const currentChannels = content.socialFeed?.channels || DEFAULT_SOCIAL_CHANNELS;
                  const newChan: SocialChannelRecord = {
                    id: `channel-${Date.now()}`,
                    platform: "INSTAGRAM",
                    channelName: "E3 Qatar New Channel",
                    handle: "@e3qatar",
                    profileUrl: "https://instagram.com/e3qatar",
                    feedMode: "CURATED_CMS",
                    syncEnabled: true,
                    isVisible: true,
                    sortPriority: currentChannels.length + 1,
                    ctaLabelEn: "Follow on Instagram",
                    ctaLabelAr: "تابعنا على إنستغرام",
                    status: "CONNECTED",
                  };
                  updateContent((p) => ({
                    ...p,
                    socialFeed: {
                      ...(p.socialFeed || {}),
                      channels: [...currentChannels, newChan],
                    },
                  }));
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-bold transition-colors cursor-pointer border border-blue-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة قناة رسمية" : "+ Add Channel"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(content.socialFeed?.channels || DEFAULT_SOCIAL_CHANNELS).map((chan: SocialChannelRecord, idx: number) => (
                <div
                  key={chan.id || idx}
                  className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {chan.platform}
                      </span>
                      <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                        {chan.handle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const currentChannels = [...(content.socialFeed?.channels || DEFAULT_SOCIAL_CHANNELS)];
                          currentChannels[idx] = { ...currentChannels[idx], isVisible: !currentChannels[idx].isVisible };
                          updateContent((p) => ({
                            ...p,
                            socialFeed: { ...(p.socialFeed || {}), channels: currentChannels },
                          }));
                        }}
                        className={cn(
                          "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                          chan.isVisible !== false
                            ? "text-emerald-400 hover:bg-emerald-500/10"
                            : "text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)]"
                        )}
                        title={chan.isVisible !== false ? "Visible" : "Hidden"}
                      >
                        {chan.isVisible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const currentChannels = (content.socialFeed?.channels || DEFAULT_SOCIAL_CHANNELS).filter(
                            (_: any, i: number) => i !== idx
                          );
                          updateContent((p) => ({
                            ...p,
                            socialFeed: { ...(p.socialFeed || {}), channels: currentChannels },
                          }));
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Channel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[var(--text-tertiary)]">Platform</label>
                      <select
                        value={chan.platform}
                        onChange={(e) => {
                          const currentChannels = [...(content.socialFeed?.channels || DEFAULT_SOCIAL_CHANNELS)];
                          currentChannels[idx] = { ...currentChannels[idx], platform: e.target.value as any };
                          updateContent((p) => ({
                            ...p,
                            socialFeed: { ...(p.socialFeed || {}), channels: currentChannels },
                          }));
                        }}
                        className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none"
                      >
                        <option value="INSTAGRAM">Instagram</option>
                        <option value="YOUTUBE">YouTube</option>
                        <option value="TIKTOK">TikTok</option>
                        <option value="FACEBOOK">Facebook</option>
                        <option value="LINKEDIN">LinkedIn</option>
                        <option value="X">X (Twitter)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-[var(--text-tertiary)]">Handle</label>
                      <input
                        type="text"
                        value={chan.handle}
                        onChange={(e) => {
                          const currentChannels = [...(content.socialFeed?.channels || DEFAULT_SOCIAL_CHANNELS)];
                          currentChannels[idx] = { ...currentChannels[idx], handle: e.target.value };
                          updateContent((p) => ({
                            ...p,
                            socialFeed: { ...(p.socialFeed || {}), channels: currentChannels },
                          }));
                        }}
                        className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] font-mono focus:outline-none"
                        placeholder="@handle"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-[var(--text-tertiary)]">Profile URL</label>
                    <input
                      type="url"
                      value={chan.profileUrl}
                      onChange={(e) => {
                        const currentChannels = [...(content.socialFeed?.channels || DEFAULT_SOCIAL_CHANNELS)];
                        currentChannels[idx] = { ...currentChannels[idx], profileUrl: e.target.value };
                        updateContent((p) => ({
                          ...p,
                          socialFeed: { ...(p.socialFeed || {}), channels: currentChannels },
                        }));
                      }}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] font-mono focus:outline-none"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-section 3: Live Moments & Social Posts Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-pink-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {isAr ? "٣. بطاقات وتغطيات اللحظات الحية (Moments Cards)" : "3. Live Moment & Social Cards Feed"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  const currentPosts = content.socialFeed?.posts || DEFAULT_SOCIAL_POSTS;
                  const newPost: SocialPostRecord = {
                    id: `post-${Date.now()}`,
                    platform: "INSTAGRAM",
                    postUrl: "https://instagram.com/e3qatar",
                    mediaType: "IMAGE",
                    mediaUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop",
                    posterUrl: "",
                    captionEn: "Exciting live energy streaming from E3 Entertainment Qatar!",
                    captionAr: "طاقة وحماس لا ينتهي في فعاليات إي ثري الترفيهية في قطر!",
                    platformPostId: `post_${Date.now()}`,
                    postDate: new Date().toISOString(),
                    isApproved: true,
                    isFeatured: false,
                    isVisible: true,
                    relatedAttractionSlug: "urban-arena",
                  };
                  updateContent((p) => ({
                    ...p,
                    socialFeed: {
                      ...(p.socialFeed || {}),
                      posts: [newPost, ...currentPosts],
                    },
                  }));
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة لحظة حية جديدة" : "+ Add Live Moment"}</span>
              </button>
            </div>

            <div className="space-y-4">
              {(content.socialFeed?.posts || DEFAULT_SOCIAL_POSTS).map((post: SocialPostRecord, idx: number) => (
                <div
                  key={post.id || idx}
                  className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] flex flex-col md:flex-row gap-5 items-start"
                >
                  {/* Media Preview Thumbnail */}
                  <div className="w-full md:w-44 h-32 rounded-xl overflow-hidden bg-black border border-[var(--border-level-2)] shrink-0 relative flex items-center justify-center">
                    {post.mediaType === "VIDEO" && post.mediaUrl ? (
                      <video
                        src={post.mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        autoPlay
                      />
                    ) : post.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.mediaUrl}
                        alt="Moment Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2 text-xs text-[var(--text-tertiary)]">
                        No Media URL
                      </div>
                    )}
                    <span className="absolute top-2 start-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-black/70 text-white backdrop-blur-md">
                      {post.platform}
                    </span>
                  </div>

                  {/* Form Controls */}
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={post.platform}
                          onChange={(e) => {
                            const currentPosts = [...(content.socialFeed?.posts || DEFAULT_SOCIAL_POSTS)];
                            currentPosts[idx] = { ...currentPosts[idx], platform: e.target.value as any };
                            updateContent((p) => ({
                              ...p,
                              socialFeed: { ...(p.socialFeed || {}), posts: currentPosts },
                            }));
                          }}
                          className="bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-lg px-2.5 py-1 text-xs font-bold text-[var(--text-primary)] focus:outline-none"
                        >
                          <option value="INSTAGRAM">Instagram</option>
                          <option value="YOUTUBE">YouTube</option>
                          <option value="TIKTOK">TikTok</option>
                          <option value="X">X (Twitter)</option>
                          <option value="FACEBOOK">Facebook</option>
                        </select>

                        <select
                          value={post.mediaType || "IMAGE"}
                          onChange={(e) => {
                            const currentPosts = [...(content.socialFeed?.posts || DEFAULT_SOCIAL_POSTS)];
                            currentPosts[idx] = { ...currentPosts[idx], mediaType: e.target.value as any };
                            updateContent((p) => ({
                              ...p,
                              socialFeed: { ...(p.socialFeed || {}), posts: currentPosts },
                            }));
                          }}
                          className="bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-lg px-2.5 py-1 text-xs font-bold text-[var(--text-secondary)] focus:outline-none"
                        >
                          <option value="IMAGE">Image</option>
                          <option value="VIDEO">Video</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={post.isVisible !== false}
                            onChange={(e) => {
                              const currentPosts = [...(content.socialFeed?.posts || DEFAULT_SOCIAL_POSTS)];
                              currentPosts[idx] = { ...currentPosts[idx], isVisible: e.target.checked };
                              updateContent((p) => ({
                                ...p,
                                socialFeed: { ...(p.socialFeed || {}), posts: currentPosts },
                              }));
                            }}
                            className="rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span>{isAr ? "مرئي" : "Visible"}</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            const currentPosts = (content.socialFeed?.posts || DEFAULT_SOCIAL_POSTS).filter(
                              (_: any, i: number) => i !== idx
                            );
                            updateContent((p) => ({
                              ...p,
                              socialFeed: { ...(p.socialFeed || {}), posts: currentPosts },
                            }));
                          }}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Moment Card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[var(--text-tertiary)]">Media Asset URL *</label>
                        <input
                          type="url"
                          value={post.mediaUrl}
                          onChange={(e) => {
                            const currentPosts = [...(content.socialFeed?.posts || DEFAULT_SOCIAL_POSTS)];
                            currentPosts[idx] = { ...currentPosts[idx], mediaUrl: e.target.value };
                            updateContent((p) => ({
                              ...p,
                              socialFeed: { ...(p.socialFeed || {}), posts: currentPosts },
                            }));
                          }}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-mono focus:outline-none"
                          placeholder="https://...image.jpg or video.mp4"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-[var(--text-tertiary)]">Original Post Link URL</label>
                        <input
                          type="url"
                          value={post.postUrl}
                          onChange={(e) => {
                            const currentPosts = [...(content.socialFeed?.posts || DEFAULT_SOCIAL_POSTS)];
                            currentPosts[idx] = { ...currentPosts[idx], postUrl: e.target.value };
                            updateContent((p) => ({
                              ...p,
                              socialFeed: { ...(p.socialFeed || {}), posts: currentPosts },
                            }));
                          }}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-mono focus:outline-none"
                          placeholder="https://instagram.com/p/..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[var(--text-tertiary)]">Caption (EN)</label>
                        <textarea
                          rows={2}
                          value={post.captionEn}
                          onChange={(e) => {
                            const currentPosts = [...(content.socialFeed?.posts || DEFAULT_SOCIAL_POSTS)];
                            currentPosts[idx] = { ...currentPosts[idx], captionEn: e.target.value };
                            updateContent((p) => ({
                              ...p,
                              socialFeed: { ...(p.socialFeed || {}), posts: currentPosts },
                            }));
                          }}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
                          placeholder="English moment caption..."
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-[var(--text-tertiary)]">Caption (AR)</label>
                        <textarea
                          dir="rtl"
                          rows={2}
                          value={post.captionAr}
                          onChange={(e) => {
                            const currentPosts = [...(content.socialFeed?.posts || DEFAULT_SOCIAL_POSTS)];
                            currentPosts[idx] = { ...currentPosts[idx], captionAr: e.target.value };
                            updateContent((p) => ({
                              ...p,
                              socialFeed: { ...(p.socialFeed || {}), posts: currentPosts },
                            }));
                          }}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] text-right focus:outline-none"
                          placeholder="نص اللحظة بالعربية..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardSectionCard>
      )}

      {/* 9. FOOTER FRAMING & UNIVERSAL MEDIA */}
      {activeSectionId === "footer-cta" && (
        <DashboardSectionCard
          title={isAr ? "خاتمة الصفحة ووسائط الفوتر الشامل" : "Footer Framing, Universal Media & Final Call to Action"}
          description={
            isAr
              ? "العنوان، نص الدعوة للحجز، وسائط خلفية الفوتر لجميع أنواع الميديا (فيديو، صور، 3D، يوتيوب)، ووصف الفوتر الشامل."
              : "Configure final booking conversion headline, universal multi-type footer backdrop media (video, 3D, image, embed), and global footer bio."
          }
          icon={<Layers className="w-5 h-5 text-[var(--color-primary)]" />}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              {footerMediaType}
            </span>
          }
        >
          {/* Sub-section 1: Booking CTA Pass */}
          <div className="space-y-4 pb-6 border-b border-[var(--border-level-1)]">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {isAr ? "١. بطاقة الحجز والدعوة للتفاعل (Digital Portal Pass)" : "1. Final Booking Call to Action (Digital Portal Pass)"}
              </h4>
            </div>

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
          </div>

          {/* Sub-section 2: Universal Brand Footer Bio */}
          <div className="space-y-4 pt-2 pb-6 border-b border-[var(--border-level-1)]">
            <div className="flex items-center gap-2">
              <Quote className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {isAr ? "٢. وصف وخلاصة العلامة في الفوتر الشامل" : "2. Universal Brand Footer Description"}
              </h4>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] -mt-2">
              {isAr
                ? "يتم عرض هذا النص في العمود الأول للفوتر عبر جميع صفحات B2C تحت شعار إي ثري قطر."
                : "Displayed under the brand logo in the first column of the universal footer across all public B2C pages."}
            </p>

            <DashboardBilingualField
              label={isAr ? "وصف الفوتر الشامل" : "Universal Footer Brand Bio"}
              type="textarea"
              rows={3}
              valueEn={footerDescEn || "Pioneering the future of events and entertainment in Qatar. Creating unforgettable moments through innovation."}
              valueAr={footerDescAr || "ريادة مستقبل الفعاليات والترفيه في قطر. صناعة لحظات لا تُنسى من خلال الابتكار."}
              onChangeEn={(val) =>
                updateContent((p) => ({
                  ...p,
                  footerDescriptionEn: val,
                  footerMedia: { ...p.footerMedia, descriptionEn: val },
                }))
              }
              onChangeAr={(val) =>
                updateContent((p) => ({
                  ...p,
                  footerDescriptionAr: val,
                  footerMedia: { ...p.footerMedia, descriptionAr: val },
                }))
              }
              placeholderEn="Enter universal footer brand statement..."
              placeholderAr="أدخل بيان وهوية العلامة في الفوتر..."
              mode={languageMode}
            />
          </div>

          {/* Sub-section 3: Universal Footer Atmospheric Media Studio */}
          <div className="space-y-5 pt-2 pb-6 border-b border-[var(--border-level-1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {isAr ? "٣. محرك وسائط خلفية الفوتر الشامل (Universal Media Studio)" : "3. Universal Footer Atmospheric Media Studio"}
                </h4>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                {isAr ? "يدعم كافة التنسيقات" : "Supports All Formats"}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] -mt-2">
              {isAr
                ? "اختر نوع الوسائط وارفع ملف الفيديو أو الصورة أو مشهد 3D التفاعلي الذي سيظهر في خلفية الفوتر الشامل عبر الموقع."
                : "Choose media format and provide stream URL, Spline 3D scene, or upload high-res video/visuals for the universal footer backdrop."}
            </p>

            {/* Media Type Selector Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {isAr ? "نوع وسائط الفوتر" : "Footer Media Format"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { id: "IMAGE", label: isAr ? "صورة ثابتة" : "Image", icon: <ImageIcon className="w-4 h-4" />, desc: "WEBP / JPG / PNG / GIF" },
                  { id: "VIDEO", label: isAr ? "فيديو مباشر" : "Video", icon: <Video className="w-4 h-4" />, desc: "MP4 / WEBM Direct" },
                  { id: "YOUTUBE", label: isAr ? "يوتيوب" : "YouTube", icon: <Play className="w-4 h-4" />, desc: "Stream Link / Embed" },
                  { id: "VIMEO", label: isAr ? "فيميو" : "Vimeo", icon: <Radio className="w-4 h-4" />, desc: "Vimeo Player Link" },
                  { id: "THREE_D", label: isAr ? "مشهد 3D" : "3D / Spline", icon: <Box className="w-4 h-4" />, desc: "Spline Scene / 3D Canvas" },
                  { id: "IFRAME", label: isAr ? "تضمين مخصص" : "Iframe Embed", icon: <Globe className="w-4 h-4" />, desc: "Interactive Frame / Code" },
                ].map((typeOption) => {
                  const isSelected = footerMediaType === typeOption.id;
                  return (
                    <button
                      key={typeOption.id}
                      type="button"
                      onClick={() =>
                        updateContent((p) => ({
                          ...p,
                          footerMediaType: typeOption.id,
                          footerBackgroundMediaType: typeOption.id,
                          footerMedia: { ...p.footerMedia, mediaType: typeOption.id },
                          cta: { ...p.cta, mediaType: typeOption.id },
                        }))
                      }
                      className={cn(
                        "p-3 rounded-xl border text-start transition-all flex flex-col justify-between gap-1.5 cursor-pointer select-none",
                        isSelected
                          ? "border-[var(--color-primary)] bg-[var(--surface-selected)] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-primary)]/30"
                          : "border-[var(--border-level-1)] bg-[var(--surface-default)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--surface-hover)]"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={isSelected ? "text-[var(--color-primary)]" : "text-[var(--text-tertiary)]"}>
                          {typeOption.icon}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">{typeOption.label}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)] leading-tight">{typeOption.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Media URL Input & Direct Uploader */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  {isAr ? "رابط / مسار وسائط الفوتر" : "Footer Media URL or Stream Source"}
                </label>
                <input
                  type="text"
                  value={footerBgMedia}
                  placeholder={
                    footerMediaType === "VIDEO"
                      ? "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-in-motion-42589-large.mp4"
                      : footerMediaType === "YOUTUBE"
                      ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      : footerMediaType === "VIMEO"
                      ? "https://vimeo.com/123456789"
                      : footerMediaType === "THREE_D"
                      ? "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
                      : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop"
                  }
                  onChange={(e) =>
                    updateContent((p) => ({
                      ...p,
                      footerMediaUrl: e.target.value,
                      footerBackgroundMediaUrl: e.target.value,
                      footerMedia: { ...p.footerMedia, mediaUrl: e.target.value, backgroundImage: e.target.value },
                      cta: { ...p.cta, mediaUrl: e.target.value, backgroundImage: e.target.value },
                      act7Ticket: { ...p.act7Ticket, backgroundImage: e.target.value },
                    }))
                  }
                  className="w-full h-10 px-3.5 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs font-mono font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              {/* Direct File Upload Component */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  {isAr ? "رفع ملف وسائط الفوتر مباشرة" : "Direct Media Upload (Image / Video)"}
                </label>
                <MediaUploader
                  value={footerBgMedia}
                  onChange={(url) =>
                    updateContent((p) => {
                      const detectedType = url.endsWith('.mp4') || url.endsWith('.webm') ? 'VIDEO' : 'IMAGE';
                      return {
                        ...p,
                        footerMediaUrl: url,
                        footerBackgroundMediaUrl: url,
                        footerMediaType: detectedType,
                        footerBackgroundMediaType: detectedType,
                        footerMedia: { ...p.footerMedia, mediaUrl: url, backgroundImage: url, mediaType: detectedType },
                        cta: { ...p.cta, mediaUrl: url, backgroundImage: url, mediaType: detectedType },
                        act7Ticket: { ...p.act7Ticket, backgroundImage: url },
                      };
                    })
                  }
                  accept="image/*,video/*"
                />
              </div>
            </div>

            {/* Mobile Fallback & Preload Poster Image */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  {isAr ? "صورة البوستر البديلة (Mobile Poster / Preload Fallback)" : "Mobile Poster / Preload Fallback Image"}
                </label>
                <p className="text-[11px] text-[var(--text-tertiary)] mb-2">
                  {isAr
                    ? "صورة عالية الجودة تُعرض كخلفية بديلة أثناء تحميل الفيديو أو على الهواتف منخفضة النطاق الترددي."
                    : "High-performance fallback poster image displayed while video/3D buffers or on low-bandwidth mobile devices."}
                </p>
                <input
                  type="text"
                  value={footerPosterMedia}
                  placeholder="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop"
                  onChange={(e) =>
                    updateContent((p) => ({
                      ...p,
                      footerPosterUrl: e.target.value,
                      footerBackgroundPosterUrl: e.target.value,
                      footerMedia: { ...p.footerMedia, posterMediaUrl: e.target.value, posterUrl: e.target.value },
                      cta: { ...p.cta, posterMediaUrl: e.target.value },
                    }))
                  }
                  className="w-full h-10 px-3.5 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs font-mono font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] mb-2"
                />
                <MediaUploader
                  value={footerPosterMedia}
                  onChange={(url) =>
                    updateContent((p) => ({
                      ...p,
                      footerPosterUrl: url,
                      footerBackgroundPosterUrl: url,
                      footerMedia: { ...p.footerMedia, posterMediaUrl: url, posterUrl: url },
                      cta: { ...p.cta, posterMediaUrl: url },
                    }))
                  }
                  accept="image/*"
                />
              </div>
            </div>

            {/* Quick Atmospheric Visual Presets */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                {isAr ? "نماذج جاهزة وسريعة للتطبيق (Atmospheric Presets)" : "Quick Atmospheric Visual Presets"}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    name: isAr ? "🌌 مهرجان ليلي متوهج" : "🌌 Ambient Night",
                    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop",
                    poster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
                    type: "IMAGE"
                  },
                  {
                    name: isAr ? "🌃 أفق الدوحة وليالي قطر" : "🌃 Qatar Skyline",
                    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=2000&auto=format&fit=crop",
                    poster: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
                    type: "IMAGE"
                  },
                  {
                    name: isAr ? "⚡ أشعة ليزر حركية" : "⚡ Kinetic Lasers",
                    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2000&auto=format&fit=crop",
                    poster: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
                    type: "IMAGE"
                  },
                  {
                    name: isAr ? "🌀 حلقة فيديو ليزرية" : "🌀 Flow Video Loop",
                    url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-in-motion-42589-large.mp4",
                    poster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
                    type: "VIDEO"
                  },
                  {
                    name: isAr ? "🪐 مشهد Spline 3D" : "🪐 Spline 3D Scene",
                    url: "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode",
                    poster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
                    type: "THREE_D"
                  }
                ].map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() =>
                      updateContent((p) => ({
                        ...p,
                        footerMediaUrl: preset.url,
                        footerBackgroundMediaUrl: preset.url,
                        footerMediaType: preset.type,
                        footerBackgroundMediaType: preset.type,
                        footerPosterUrl: preset.poster,
                        footerBackgroundPosterUrl: preset.poster,
                        footerMedia: {
                          ...p.footerMedia,
                          mediaUrl: preset.url,
                          backgroundImage: preset.url,
                          mediaType: preset.type,
                          posterMediaUrl: preset.poster,
                          posterUrl: preset.poster,
                        },
                        cta: {
                          ...p.cta,
                          mediaUrl: preset.url,
                          backgroundImage: preset.url,
                          mediaType: preset.type,
                          posterMediaUrl: preset.poster,
                        },
                        act7Ticket: { ...p.act7Ticket, backgroundImage: preset.url },
                      }))
                    }
                    className="px-3 py-1.5 rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-section 4: Live Universal Footer Interactive Preview */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? "معاينة الفوتر الشامل التفاعلي (Live Universal Footer)" : "Universal Footer Live Interactive Preview"}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {footerMediaType}
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  {isAr ? "مباشر وتفاعلي" : "Active Scrim & Layering"}
                </span>
              </div>
            </div>

            {/* Simulated Public Universal Footer Container */}
            <div className="relative rounded-2xl overflow-hidden border border-[var(--border-level-2)] bg-[var(--surface-default)] text-center shadow-lg">
              
              {/* Full-Bleed Live Media Backdrop */}
              {footerBgMedia ? (
                <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                  <UniversalMediaRenderer
                    src={footerBgMedia}
                    type={(footerMediaType as UniversalMediaType) || "IMAGE"}
                    alt="Footer Live Backdrop"
                    className="w-full h-full object-cover"
                    poster={footerPosterMedia}
                    autoPlay={true}
                    loop={true}
                    muted={true}
                  />
                  {/* Legibility Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface-default)]/90 via-[var(--surface-default)]/85 to-[var(--surface-default)]/95 z-[1] pointer-events-none" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-zinc-900/80 to-zinc-950 z-0" />
              )}

              <div className="relative z-10 p-6 sm:p-8 space-y-8">
                
                {/* Floating Digital Portal Pass Card */}
                <div className="max-w-md mx-auto p-6 rounded-2xl border border-emerald-500/30 bg-black/40 backdrop-blur-md text-center space-y-3 shadow-xl">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {isAr ? "بوابة الخيال إلى الذاكرة" : "DIGITAL PORTAL PASS"}
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {isAr ? content.cta?.titleAr || "ادخل إلى عالم الحكايات" : content.cta?.titleEn || "Step into the stories"}
                  </h4>
                  <div className="pt-2">
                    <span className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-md">
                      {isAr ? content.cta?.buttonLabelAr || "استكشف التذاكر والباقات" : content.cta?.buttonLabelEn || "EXPLORE TICKETS & PASSES"}
                    </span>
                  </div>
                </div>

                {/* Simulated 4-Column Footer Strip */}
                <div className="pt-6 border-t border-[var(--border-level-1)] grid grid-cols-1 md:grid-cols-4 gap-6 text-start text-xs">
                  {/* Col 1: Brand Logo & Bio */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xs font-mono">
                        E3
                      </div>
                      <span className="font-extrabold text-[var(--text-primary)]">
                        {isAr ? "إي ثري قطر" : "E3 Qatar"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      {isAr
                        ? footerDescAr || "ريادة مستقبل الفعاليات والترفيه في قطر. صناعة لحظات لا تُنسى من خلال الابتكار."
                        : footerDescEn || "Pioneering the future of events and entertainment in Qatar. Creating unforgettable moments through innovation."}
                    </p>
                  </div>

                  {/* Col 2: Quick Links */}
                  <div className="space-y-2">
                    <span className="font-bold text-[var(--text-primary)] uppercase text-[10px] tracking-wider">
                      {isAr ? "روابط سريعة" : "Quick Links"}
                    </span>
                    <ul className="space-y-1 text-[11px] text-[var(--text-secondary)]">
                      <li>• {isAr ? "الفعاليات" : "Events & Calendar"}</li>
                      <li>• {isAr ? "الوجهات الترفيهية" : "Attractions & Worlds"}</li>
                      <li>• {isAr ? "الباقات والأسعار" : "Packages & Passes"}</li>
                    </ul>
                  </div>

                  {/* Col 3: Contact */}
                  <div className="space-y-2">
                    <span className="font-bold text-[var(--text-primary)] uppercase text-[10px] tracking-wider">
                      {isAr ? "التواصل والمقر" : "Contact"}
                    </span>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Doha, State of Qatar<br />
                      contact@e3.qa • +974 4400 0000
                    </p>
                  </div>

                  {/* Col 4: Newsletter */}
                  <div className="space-y-2">
                    <span className="font-bold text-[var(--text-primary)] uppercase text-[10px] tracking-wider">
                      {isAr ? "النشرة البريدية" : "Newsletter"}
                    </span>
                    <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-active)] border border-[var(--border-level-2)] rounded-lg">
                      <input
                        type="text"
                        disabled
                        placeholder={isAr ? "بريدك الإلكتروني..." : "Enter your email..."}
                        className="w-full bg-transparent px-2 text-[11px] text-[var(--text-secondary)] outline-none"
                      />
                      <div className="p-1 rounded bg-[var(--color-primary)] text-white">
                        <Send className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Bottom Bar */}
                <div className="pt-4 border-t border-[var(--border-level-1)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-[var(--text-tertiary)]">
                  <span>© {new Date().getFullYear()} E3 Qatar. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{isAr ? "متوافق مع قانون حماية البيانات الشخصية القطري (PDPL)" : "Qatar PDPL Compliant"}</span>
                  </div>
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
