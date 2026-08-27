"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Building2,
  Ticket,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Trash2,
  Video,
  Image as ImageIcon,
  Box,
  Globe,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardSectionCard,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
  EditorSectionItem,
} from "@/components/dashboard/ui";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { useLocale } from "@/components/layout/LocaleProvider";
import { cn } from "@/lib/utils";

interface FooterLinkItem {
  labelEn: string;
  labelAr?: string;
  href: string;
}

const SECTIONS: EditorSectionItem[] = [
  { id: "b2b", label: "1. Global B2B Footer", labelAr: "١. تذييل صفحات B2B للشركات", icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: "b2c", label: "2. Global B2C Footer", labelAr: "٢. تذييل صفحات B2C للفعاليات", icon: <Ticket className="w-3.5 h-3.5" /> },
  { id: "legal", label: "3. Legal & PDPL Compliance", labelAr: "٣. البيانات القانونية والخصوصية", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
];

function safeParseLinks(raw: any, fallback: FooterLinkItem[]): FooterLinkItem[] {
  if (!raw) return fallback;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Fallback
    }
  }
  return fallback;
}

export function FooterSettingsView({ initialSettings }: { initialSettings: Record<string, any> }) {
  const router = useRouter();
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const [activeSectionId, setActiveSectionId] = useState("b2b");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [toast, setToast] = useState(false);

  // Link lists states
  const [b2bSolutionsLinks, setB2bSolutionsLinks] = useState<FooterLinkItem[]>(() =>
    safeParseLinks(initialSettings.b2bFooterSolutionsLinks, [
      { labelEn: "Turnkey Attraction Engineering", labelAr: "هندسة الوجهات الترفيهية المتكاملة", href: "/b2b/services" },
      { labelEn: "Live Event Production & Rigging", labelAr: "إنتاج الفعاليات الكبرى والمسارح", href: "/b2b/services" },
      { labelEn: "Spatial & Kinetic Staging", labelAr: "العروض الحركية والمؤثرات البصرية", href: "/b2b/services" },
      { labelEn: "Immersive AV & Projection Mapping", labelAr: "أنظمة الصوت والضوء والخرائط الضوئية", href: "/b2b/services" },
      { labelEn: "Landmark Case Studies", labelAr: "سجل الإنجازات والمشاريع الكبرى", href: "/b2b/case-studies" },
      { labelEn: "Strategic Clients & Partners", labelAr: "شركاء النجاح والعملاء الاستراتيجيين", href: "/b2b/clients" },
    ])
  );

  const [b2bCompanyLinks, setB2bCompanyLinks] = useState<FooterLinkItem[]>(() =>
    safeParseLinks(initialSettings.b2bFooterCompanyLinks, [
      { labelEn: "About E3 Enterprise", labelAr: "عن شركة إي ثري", href: "/b2b/about" },
      { labelEn: "Executive Leadership & Founders", labelAr: "القيادة التنفيذية والمؤسسون", href: "/b2b/leadership" },
      { labelEn: "Careers & Engineering Roles", labelAr: "الوظائف والفرص الهندسية", href: "/b2b/careers" },
      { labelEn: "Vendor & Supplier Intake", labelAr: "تسجيل الموردين والمقاولين", href: "/b2b/contact" },
      { labelEn: "Feedback & Quality Assurance", labelAr: "تقييم الجودة والملاحظات", href: "/b2b/feedback" },
      { labelEn: "Frequently Asked Questions", labelAr: "الأسئلة الشائعة للشركات", href: "/b2b/faqs" },
    ])
  );

  const [b2cExploreLinks, setB2cExploreLinks] = useState<FooterLinkItem[]>(() =>
    safeParseLinks(initialSettings.b2cFooterExploreLinks, [
      { labelEn: "All Attractions & Kinetic Rides", labelAr: "كافة الوجهات والألعاب الحركية", href: "/b2c/attractions" },
      { labelEn: "Pulse Orbit Galaxy Station", labelAr: "محطة بولس أوربت الفضائية", href: "/b2c/pulse-orbit" },
      { labelEn: "Upcoming Shows & Calendar", labelAr: "جدول العروض والفعاليات", href: "/b2c/calendar" },
      { labelEn: "VIP Packages & Family Passes", labelAr: "باقات VIP والتذاكر العائلية", href: "/b2c/packages" },
      { labelEn: "Discover Experiences", labelAr: "استكشف العوالم الترفيهية", href: "/b2c/discover" },
    ])
  );

  const [b2cGuestLinks, setB2cGuestLinks] = useState<FooterLinkItem[]>(() =>
    safeParseLinks(initialSettings.b2cFooterGuestLinks, [
      { labelEn: "Guest Support & Inquiries", labelAr: "خدمة العملاء والاستفسارات", href: "/b2c/contact" },
      { labelEn: "Visitor Safety & Height Guidelines", labelAr: "إرشادات السلامة وضوابط الطول", href: "/b2c/contact" },
      { labelEn: "Location, Parking & Directions", labelAr: "الموقع ومواقف السيارات", href: "/b2c/contact" },
      { labelEn: "Visitor FAQs & Help Center", labelAr: "الأسئلة الشائعة للزوار", href: "/b2c/contact" },
    ])
  );

  const [data, setData] = useState({
    // B2B Global Footer Config
    b2bFooterCtaTitleEn: initialSettings.b2bFooterCtaTitleEn || "Ready to Engineer Your Next Landmark Experience?",
    b2bFooterCtaTitleAr: initialSettings.b2bFooterCtaTitleAr || "جاهز لتنفيذ مشروعك الترفيهي القادم في قطر؟",
    b2bFooterCtaSubtitleEn: initialSettings.b2bFooterCtaSubtitleEn || "Partner with Qatar's premier turnkey attraction engineering, spatial production, and kinetic staging specialists.",
    b2bFooterCtaSubtitleAr: initialSettings.b2bFooterCtaSubtitleAr || "تواصل مع خبراء إي ثري لبناء الوجهات الترفيهية الكبرى، الفعاليات الحية، والإنتاج الفني المتكامل.",
    b2bFooterCtaBtnLabelEn: initialSettings.b2bFooterCtaBtnLabelEn || "Submit Project RFP",
    b2bFooterCtaBtnLabelAr: initialSettings.b2bFooterCtaBtnLabelAr || "طلب العروض والمشاريع (RFP)",
    b2bFooterCtaBtnUrl: initialSettings.b2bFooterCtaBtnUrl || "/b2b/contact",
    b2bFooterSecondaryBtnLabelEn: initialSettings.b2bFooterSecondaryBtnLabelEn || "Explore Case Studies",
    b2bFooterSecondaryBtnLabelAr: initialSettings.b2bFooterSecondaryBtnLabelAr || "استكشف دراسات الحالة",
    b2bFooterSecondaryBtnUrl: initialSettings.b2bFooterSecondaryBtnUrl || "/b2b/case-studies",
    b2bCrNumber: initialSettings.b2bCrNumber || "184920 / 2026",
    b2bFooterMediaUrl: initialSettings.b2bFooterMediaUrl || "",
    b2bFooterMediaType: initialSettings.b2bFooterMediaType || "IMAGE",
    b2bFooterPosterUrl: initialSettings.b2bFooterPosterUrl || "",

    // B2C Global Footer Config
    b2cFooterCtaTitleEn: initialSettings.b2cFooterCtaTitleEn || "Unforgettable Immersive Entertainment in Qatar",
    b2cFooterCtaTitleAr: initialSettings.b2cFooterCtaTitleAr || "تجارب ترفيهية غامرة لا تُنسى في قطر",
    b2cFooterCtaSubtitleEn: initialSettings.b2cFooterCtaSubtitleEn || "Explore gravity-defying rides, spatial projection realms, interactive family attractions, and exclusive VIP passes.",
    b2cFooterCtaSubtitleAr: initialSettings.b2cFooterCtaSubtitleAr || "استكشف أحدث مدن الألعاب الفضائية، والعروض الترفيهية الحية، وباقات التذاكر الحصرية لك ولعائلتك.",
    bookTicketsUrl: initialSettings.bookTicketsUrl || "/b2c/tickets",
    bookTicketsLabelEn: initialSettings.bookTicketsLabelEn || "BOOK TICKETS NOW",
    bookTicketsLabelAr: initialSettings.bookTicketsLabelAr || "احجز التذاكر الآن",
    b2cFooterSecondaryBtnLabelEn: initialSettings.b2cFooterSecondaryBtnLabelEn || "View Show Schedule",
    b2cFooterSecondaryBtnLabelAr: initialSettings.b2cFooterSecondaryBtnLabelAr || "جدول العروض والفعاليات",
    b2cFooterSecondaryBtnUrl: initialSettings.b2cFooterSecondaryBtnUrl || "/b2c/calendar",
    footerMediaUrl: initialSettings.footerMediaUrl || initialSettings.b2cFooterMediaUrl || "",
    footerMediaType: initialSettings.footerMediaType || initialSettings.b2cFooterMediaType || "IMAGE",
    footerPosterUrl: initialSettings.footerPosterUrl || initialSettings.b2cFooterPosterUrl || "",

    // Shared Legal
    footerDescriptionEn: initialSettings.footerDescriptionEn || "Pioneering the future of events and entertainment in Qatar.",
    footerDescriptionAr: initialSettings.footerDescriptionAr || "ريادة مستقبل الفعاليات والترفيه في قطر.",
  });

  const handleChange = (field: string, value: any) => {
    setIsDirty(true);
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLinkChange = (
    listType: "b2bSolutions" | "b2bCompany" | "b2cExplore" | "b2cGuest",
    index: number,
    field: keyof FooterLinkItem,
    value: string
  ) => {
    setIsDirty(true);
    const updateList = (prev: FooterLinkItem[]) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    };

    if (listType === "b2bSolutions") setB2bSolutionsLinks(updateList);
    if (listType === "b2bCompany") setB2bCompanyLinks(updateList);
    if (listType === "b2cExplore") setB2cExploreLinks(updateList);
    if (listType === "b2cGuest") setB2cGuestLinks(updateList);
  };

  const handleAddLink = (listType: "b2bSolutions" | "b2bCompany" | "b2cExplore" | "b2cGuest") => {
    setIsDirty(true);
    const newLink: FooterLinkItem = { labelEn: "New Nav Link", labelAr: "رابط جديد", href: "/b2b" };
    if (listType === "b2bSolutions") setB2bSolutionsLinks((prev) => [...prev, newLink]);
    if (listType === "b2bCompany") setB2bCompanyLinks((prev) => [...prev, newLink]);
    if (listType === "b2cExplore") setB2cExploreLinks((prev) => [...prev, newLink]);
    if (listType === "b2cGuest") setB2cGuestLinks((prev) => [...prev, newLink]);
  };

  const handleRemoveLink = (listType: "b2bSolutions" | "b2bCompany" | "b2cExplore" | "b2cGuest", index: number) => {
    setIsDirty(true);
    if (listType === "b2bSolutions") setB2bSolutionsLinks((prev) => prev.filter((_, i) => i !== index));
    if (listType === "b2bCompany") setB2bCompanyLinks((prev) => prev.filter((_, i) => i !== index));
    if (listType === "b2cExplore") setB2cExploreLinks((prev) => prev.filter((_, i) => i !== index));
    if (listType === "b2cGuest") setB2cGuestLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, any> = {
        ...data,
        b2bFooterSolutionsLinks: JSON.stringify(b2bSolutionsLinks),
        b2bFooterCompanyLinks: JSON.stringify(b2bCompanyLinks),
        b2cFooterExploreLinks: JSON.stringify(b2cExploreLinks),
        b2cFooterGuestLinks: JSON.stringify(b2cGuestLinks),
        b2cFooterMediaUrl: data.footerMediaUrl,
        b2cFooterMediaType: data.footerMediaType,
        b2cFooterPosterUrl: data.footerPosterUrl,
      };

      const promises = Object.entries(payload).map(([key, value]) =>
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value, type: "GENERAL" }),
        })
      );
      await Promise.all(promises);
      setIsDirty(false);
      setLastSaved(new Date());
      setToast(true);
      setTimeout(() => setToast(false), 4000);
      router.refresh();
    } catch (error) {
      console.error("Failed to save footer settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderLinkEditor = (
    title: string,
    titleAr: string,
    listType: "b2bSolutions" | "b2bCompany" | "b2cExplore" | "b2cGuest",
    links: FooterLinkItem[]
  ) => (
    <div className="space-y-3 p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)]">
      <div className="flex items-center justify-between">
        <span className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-2">
          <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
          <span>{isAr ? titleAr : title}</span>
        </span>
        <button
          type="button"
          onClick={() => handleAddLink(listType)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--border-level-1)] text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-purple-400" />
          <span>{isAr ? "إضافة رابط" : "Add Link"}</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {links.map((link, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)]"
          >
            <input
              type="text"
              value={link.labelEn}
              onChange={(e) => handleLinkChange(listType, idx, "labelEn", e.target.value)}
              placeholder="English Label"
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              value={link.labelAr || ""}
              onChange={(e) => handleLinkChange(listType, idx, "labelAr", e.target.value)}
              placeholder="العنوان بالعربية"
              dir="rtl"
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              value={link.href}
              onChange={(e) => handleLinkChange(listType, idx, "href", e.target.value)}
              placeholder="/route or https://..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={() => handleRemoveLink(listType, idx)}
              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer self-end sm:self-center"
              title={isAr ? "حذف الرابط" : "Delete Link"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      <DashboardPageHeader
        title={isAr ? "إدارة تذييل الصفحات العام (B2B & B2C)" : "Global Footers Configuration"}
        description={
          isAr
            ? "تخصيص تذييل صفحات الشركات (B2B) وتذييل صفحات الفعاليات (B2C) بالروابط الديناميكية وخلفيات الوسائط ثلاثية الأبعاد والفيديو والصور."
            : "Customize dedicated footer sections, dynamic links, CTA banners, and 3D Spline / Video / Image atmospheric media for B2B and B2C portals."
        }
        breadcrumbs={[
          { label: isAr ? "لوحة التحكم" : "Dashboard", href: "/dashboard" },
          { label: isAr ? "الإعدادات" : "Settings", href: "/dashboard/settings/general" },
          { label: isAr ? "تذييل الصفحات العام" : "Global Footers" },
        ]}
        badge={{ label: isAr ? "تذييل ذكي ومخصص" : "Dynamic Dual Footers", variant: "purple" }}
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: isSaving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ التذييل" : "Save Footers"),
          onClick: handleSave,
          isLoading: isSaving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      {toast && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center font-bold text-xs shadow-xs">
          <CheckCircle2 className="w-4 h-4 me-2 shrink-0" />
          {isAr ? "تم حفظ إعدادات التذييل العام بنجاح." : "Global footer settings saved successfully."}
        </div>
      )}

      {/* 1. Global B2B Footer */}
      <div id="b2b" className={cn("space-y-6", activeSectionId === "b2b" ? "block" : "hidden")}>
        <DashboardSectionCard
          title={isAr ? "١. تخصيص تذييل صفحات B2B للشركات" : "1. Global B2B Footer Section"}
          description={
            isAr
              ? "يتم عرض هذا التذييل عبر كافة صفحات قطاع الأعمال (/b2b, /b2b/services, /b2b/cases, /b2b/about, إلخ)."
              : "Rendered globally across all corporate and enterprise routes (/b2b, /b2b/services, /b2b/cases, /b2b/about, etc.)."
          }
          icon={<Building2 className="w-5 h-5 text-purple-400" />}
        >
          {/* B2B Media Studio (3D, Spline, Video, Iframe, Image) */}
          <div className="space-y-4 p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)]">
            <span className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? "خلفية التذييل (3D / Spline / فيديو / صور / إطار)" : "B2B Footer Media (3D Spline / Video / Image / Iframe)"}</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  {isAr ? "نوع الوسائط" : "Media Type"}
                </label>
                <select
                  value={data.b2bFooterMediaType}
                  onChange={(e) => handleChange("b2bFooterMediaType", e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                >
                  <option value="IMAGE">Image (صورة)</option>
                  <option value="VIDEO">Direct Video MP4 (فيديو مباشر)</option>
                  <option value="SPLINE">Spline 3D Scene (مشهد ثلاثي الأبعاد)</option>
                  <option value="IFRAME">Iframe / 3D Embed (تضمين تفاعلي)</option>
                  <option value="YOUTUBE">YouTube Video</option>
                  <option value="VIMEO">Vimeo Video</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  {isAr ? "رابط الوسائط (URL / Spline URL)" : "Media URL / Spline URL"}
                </label>
                <input
                  type="text"
                  value={data.b2bFooterMediaUrl}
                  onChange={(e) => handleChange("b2bFooterMediaUrl", e.target.value)}
                  placeholder="https://... (.jpg, .mp4, https://my.spline.design/...)"
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                {isAr ? "صورة البوستر الاحتياطية (Poster Image Fallback)" : "Fallback Poster Image URL"}
              </label>
              <input
                type="text"
                value={data.b2bFooterPosterUrl}
                onChange={(e) => handleChange("b2bFooterPosterUrl", e.target.value)}
                placeholder="/hero-bg.png or https://..."
                className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Media Live Preview */}
            {data.b2bFooterMediaUrl && (
              <div className="h-32 w-full rounded-xl overflow-hidden border border-[var(--border-level-1)] relative bg-black/50">
                <UniversalMediaRenderer
                  src={data.b2bFooterMediaUrl}
                  type={data.b2bFooterMediaType as any}
                  alt="B2B Footer Media Preview"
                  className="w-full h-full object-cover"
                  poster={data.b2bFooterPosterUrl}
                />
                <span className="absolute top-2 start-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-mono">
                  LIVE PREVIEW
                </span>
              </div>
            )}
          </div>

          {/* B2B Top CTA Banner Content */}
          <div className="space-y-4 p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)]">
            <span className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? "بانر طلب العروض (RFP CTA Banner)" : "Top Enterprise RFP CTA Banner"}</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  Title (English)
                </label>
                <input
                  type="text"
                  value={data.b2bFooterCtaTitleEn}
                  onChange={(e) => handleChange("b2bFooterCtaTitleEn", e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1 text-right">
                  العنوان (بالعربية)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.b2bFooterCtaTitleAr}
                  onChange={(e) => handleChange("b2bFooterCtaTitleAr", e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  Subtitle (English)
                </label>
                <textarea
                  rows={2}
                  value={data.b2bFooterCtaSubtitleEn}
                  onChange={(e) => handleChange("b2bFooterCtaSubtitleEn", e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1 text-right">
                  الوصف الفرعي (بالعربية)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={data.b2bFooterCtaSubtitleAr}
                  onChange={(e) => handleChange("b2bFooterCtaSubtitleAr", e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  Primary Button Label (EN / AR)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={data.b2bFooterCtaBtnLabelEn}
                    onChange={(e) => handleChange("b2bFooterCtaBtnLabelEn", e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={data.b2bFooterCtaBtnLabelAr}
                    onChange={(e) => handleChange("b2bFooterCtaBtnLabelAr", e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  Primary Button Target URL
                </label>
                <input
                  type="text"
                  value={data.b2bFooterCtaBtnUrl}
                  onChange={(e) => handleChange("b2bFooterCtaBtnUrl", e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Link Managers for B2B */}
          {renderLinkEditor("B2B Engineering Solutions Links", "روابط الخدمات والحلول الهندسية", "b2bSolutions", b2bSolutionsLinks)}
          {renderLinkEditor("B2B Enterprise Directory Links", "روابط دليل الشركة والشفافية", "b2bCompany", b2bCompanyLinks)}
        </DashboardSectionCard>
      </div>

      {/* 2. Global B2C Footer */}
      <div id="b2c" className={cn("space-y-6", activeSectionId === "b2c" ? "block" : "hidden")}>
        <DashboardSectionCard
          title={isAr ? "٢. تخصيص تذييل صفحات B2C للفعاليات" : "2. Global B2C Footer Section"}
          description={
            isAr
              ? "يتم عرض هذا التذييل عبر كافة صفحات الزوار والفعاليات (/b2c, /b2c/attractions, /b2c/discover, /b2c/tickets, إلخ)."
              : "Rendered globally across all visitor and experience routes (/b2c, /b2c/attractions, /b2c/discover, /b2c/tickets, etc.)."
          }
          icon={<Ticket className="w-5 h-5 text-pink-400" />}
        >
          {/* B2C Media Studio (3D, Spline, Video, Iframe, Image) */}
          <div className="space-y-4 p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)]">
            <span className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-pink-400" />
              <span>{isAr ? "خلفية التذييل (3D / Spline / فيديو / صور / إطار)" : "B2C Footer Media (3D Spline / Video / Image / Iframe)"}</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  {isAr ? "نوع الوسائط" : "Media Type"}
                </label>
                <select
                  value={data.footerMediaType}
                  onChange={(e) => handleChange("footerMediaType", e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
                >
                  <option value="IMAGE">Image (صورة)</option>
                  <option value="VIDEO">Direct Video MP4 (فيديو مباشر)</option>
                  <option value="SPLINE">Spline 3D Scene (مشهد ثلاثي الأبعاد)</option>
                  <option value="IFRAME">Iframe / 3D Embed (تضمين تفاعلي)</option>
                  <option value="YOUTUBE">YouTube Video</option>
                  <option value="VIMEO">Vimeo Video</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  {isAr ? "رابط الوسائط (URL / Spline URL)" : "Media URL / Spline URL"}
                </label>
                <input
                  type="text"
                  value={data.footerMediaUrl}
                  onChange={(e) => handleChange("footerMediaUrl", e.target.value)}
                  placeholder="https://... (.jpg, .mp4, https://my.spline.design/...)"
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                {isAr ? "صورة البوستر الاحتياطية (Poster Image Fallback)" : "Fallback Poster Image URL"}
              </label>
              <input
                type="text"
                value={data.footerPosterUrl}
                onChange={(e) => handleChange("footerPosterUrl", e.target.value)}
                placeholder="/hero-bg.png or https://..."
                className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Media Live Preview */}
            {data.footerMediaUrl && (
              <div className="h-32 w-full rounded-xl overflow-hidden border border-[var(--border-level-1)] relative bg-black/50">
                <UniversalMediaRenderer
                  src={data.footerMediaUrl}
                  type={data.footerMediaType as any}
                  alt="B2C Footer Media Preview"
                  className="w-full h-full object-cover"
                  poster={data.footerPosterUrl}
                />
                <span className="absolute top-2 start-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-mono">
                  LIVE PREVIEW
                </span>
              </div>
            )}
          </div>

          {/* B2C Top CTA Banner Content */}
          <div className="space-y-4 p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)]">
            <span className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>{isAr ? "بانر حجز التذاكر (B2C Booking CTA Banner)" : "Top Entertainment Booking CTA Banner"}</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  Title (English)
                </label>
                <input
                  type="text"
                  value={data.b2cFooterCtaTitleEn}
                  onChange={(e) => handleChange("b2cFooterCtaTitleEn", e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1 text-right">
                  العنوان (بالعربية)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={data.b2cFooterCtaTitleAr}
                  onChange={(e) => handleChange("b2cFooterCtaTitleAr", e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  Subtitle (English)
                </label>
                <textarea
                  rows={2}
                  value={data.b2cFooterCtaSubtitleEn}
                  onChange={(e) => handleChange("b2cFooterCtaSubtitleEn", e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1 text-right">
                  الوصف الفرعي (بالعربية)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={data.b2cFooterCtaSubtitleAr}
                  onChange={(e) => handleChange("b2cFooterCtaSubtitleAr", e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  Primary Action Button (EN / AR)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={data.bookTicketsLabelEn}
                    onChange={(e) => handleChange("bookTicketsLabelEn", e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={data.bookTicketsLabelAr}
                    onChange={(e) => handleChange("bookTicketsLabelAr", e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  Book Tickets Target URL
                </label>
                <input
                  type="text"
                  value={data.bookTicketsUrl}
                  onChange={(e) => handleChange("bookTicketsUrl", e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Link Managers for B2C */}
          {renderLinkEditor("B2C Discover Attractions Links", "روابط استكشاف الوجهات والفعاليات", "b2cExplore", b2cExploreLinks)}
          {renderLinkEditor("B2C Guest Services Links", "روابط خدمة وإرشاد الزوار", "b2cGuest", b2cGuestLinks)}
        </DashboardSectionCard>
      </div>

      {/* 3. Legal & Compliance */}
      <div id="legal" className={cn("space-y-6", activeSectionId === "legal" ? "block" : "hidden")}>
        <DashboardSectionCard
          title={isAr ? "٣. البيانات القانونية وتوثيق وزارة التجارة" : "3. Legal & Compliance Settings"}
          description={
            isAr
              ? "إدارة رقم السجل التجاري (CR) في دولة قطر ونصوص الامتثال لقوانين حماية البيانات."
              : "Manage Qatar Commercial Registration (CR) and PDPL compliance statements."
          }
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                {isAr ? "رقم السجل التجاري في قطر (CR Number)" : "Qatar CR Number"}
              </label>
              <input
                type="text"
                value={data.b2bCrNumber}
                onChange={(e) => handleChange("b2bCrNumber", e.target.value)}
                placeholder="184920 / 2026"
                className="w-full h-10 px-3.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  Footer Description (English)
                </label>
                <textarea
                  rows={3}
                  value={data.footerDescriptionEn}
                  onChange={(e) => handleChange("footerDescriptionEn", e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 text-right">
                  وصف التذييل المختصر (بالعربية)
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={data.footerDescriptionAr}
                  onChange={(e) => handleChange("footerDescriptionAr", e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>
        </DashboardSectionCard>
      </div>

      <DashboardStickyActions
        isUnsaved={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        saveLabel={isSaving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ التذييل" : "Save Footers")}
      />
    </DashboardPageShell>
  );
}
