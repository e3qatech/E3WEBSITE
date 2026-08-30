"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Save, Globe, Users, FileCheck, HelpCircle, Sparkles, Briefcase, ExternalLink, Edit, CheckCircle, MapPin, Clock } from "lucide-react";
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
  { id: "hero", label: "1. Hero Section", labelAr: "1. قسم البداية والواجهة" },
  { id: "activeJobs", label: "2. Active Jobs Roster", labelAr: "2. الشواغر والوظائف الحالية" },
  { id: "generalApplication", label: "3. General CV Intake", labelAr: "3. التقديم العام وبنك الكفاءات" },
  { id: "portalBanner", label: "4. Candidate Portal Banner", labelAr: "4. بوابة المترشحين والمتابعة" },
  { id: "lifeAtE3", label: "5. Life at E3 & Culture", labelAr: "5. بيئة العمل وكواليس الإنتاج" },
  { id: "hiringJourney", label: "6. 4-Step Hiring Journey", labelAr: "6. مراحل وخطوات التوظيف" },
  { id: "enquiries", label: "7. HR & Career Enquiries", labelAr: "7. استفسارات التوظيف والتواصل" },
  { id: "seo", label: "8. SEO Metadata", labelAr: "8. بيانات محركات البحث (SEO)" },
];

export function B2BCareersEditor({ initialData }: { initialData: any }) {
  const { toast } = useToast();
  const [activeSectionId, setActiveSectionId] = useState<string>("hero");
  const [languageMode, setLanguageMode] = useState<LanguageEditMode>("both");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [data, setData] = useState({
    hero: {
      eyebrowEn: initialData?.hero?.eyebrowEn || "CAREERS AT E3 QATAR",
      eyebrowAr: initialData?.hero?.eyebrowAr || "فرص العمل في إي ثري قطر",
      titleEn: initialData?.hero?.titleEn || "Build the Future of Live Experiences",
      titleAr: initialData?.hero?.titleAr || "اصنع مستقبل الفعاليات والتجارب الحية",
      subtitleEn: initialData?.hero?.subtitleEn || "Join an elite collective of spatial architects, technical directors, AV systems engineers, and live experience pioneers in Qatar.",
      subtitleAr: initialData?.hero?.subtitleAr || "انضم إلى نخبة مهندسي التجارب، مصممي المسارح الحركية، ومخرجي أضخم الفعاليات الترفيهية والثقافية في دولة قطر.",
      mediaType: initialData?.hero?.mediaType || "IMAGE",
      mediaUrl: initialData?.hero?.mediaUrl || "",
    },
    generalApplication: {
      enabled: initialData?.generalApplication?.enabled !== false,
      eyebrowEn: initialData?.generalApplication?.eyebrowEn || "GENERAL INQUIRY & TALENT POOL",
      eyebrowAr: initialData?.generalApplication?.eyebrowAr || "بنك الكفاءات والتقديم العام",
      titleEn: initialData?.generalApplication?.titleEn || "Don't See the Right Role?",
      titleAr: initialData?.generalApplication?.titleAr || "لم تجد التخصص المناسب؟",
      descriptionEn: initialData?.generalApplication?.descriptionEn || "Submit your resume to our executive talent pool for future mega projects, kinetic productions, and attraction launches.",
      descriptionAr: initialData?.generalApplication?.descriptionAr || "أرسل سيرتك الذاتية إلى قاعدة بيانات الكفاءات للمشاريع الكبرى والعروض الحركية والوجهات القادمة.",
      buttonTextEn: initialData?.generalApplication?.buttonTextEn || "Submit General CV",
      buttonTextAr: initialData?.generalApplication?.buttonTextAr || "تقديم السيرة الذاتية العامة",
    },
    portalBanner: {
      enabled: initialData?.portalBanner?.enabled !== false,
      eyebrowEn: initialData?.portalBanner?.eyebrowEn || "CANDIDATE TRACKING PORTAL",
      eyebrowAr: initialData?.portalBanner?.eyebrowAr || "بوابة المترشحين والمتابعة الفورية",
      titleEn: initialData?.portalBanner?.titleEn || "Already Applied to E3?",
      titleAr: initialData?.portalBanner?.titleAr || "هل تقدمت بطلب وظيفي مسبقاً؟",
      descriptionEn: initialData?.portalBanner?.descriptionEn || "Sign in to track your submission progress, evaluation stage, and update your uploaded credentials in real time.",
      descriptionAr: initialData?.portalBanner?.descriptionAr || "سجّل الدخول إلى بوابة المترشحين للاطلاع الفوري على حالة طلبك، مرحلة التقييم، وتحديث ملفك الشخصي.",
      signInTextEn: initialData?.portalBanner?.signInTextEn || "Already Applied? Sign In",
      signInTextAr: initialData?.portalBanner?.signInTextAr || "تسجيل الدخول لمتابعة الطلب",
    },
    lifeAtE3: {
      enabled: initialData?.lifeAtE3?.enabled !== false,
      eyebrowEn: initialData?.lifeAtE3?.eyebrowEn || "ATELIER CULTURE & PRODUCTION",
      eyebrowAr: initialData?.lifeAtE3?.eyebrowAr || "بيئة العمل وكواليس الإنجاز",
      titleEn: initialData?.lifeAtE3?.titleEn || "Life Inside the Engineering Atelier",
      titleAr: initialData?.lifeAtE3?.titleAr || "الحياة والابتكار في إي ثري",
      subtitleEn: initialData?.lifeAtE3?.subtitleEn || "Where architectural rigor meets boundless creative ambition. Experience the disciplines that power our landmark productions.",
      subtitleAr: initialData?.lifeAtE3?.subtitleAr || "نحن نجمع بين أحدث التقنيات الهندسية وأرفع معايير الإبداع الفني لنصنع ذكريات لا تُنسى في قطر والمنطقة.",
      items: Array.isArray(initialData?.lifeAtE3?.items) && initialData.lifeAtE3.items.length > 0
        ? initialData.lifeAtE3.items
        : [
            {
              id: "kinetic-production",
              titleEn: "Master Kinetic Stage Engineering",
              titleAr: "هندسة المسارح والعروض الحركية الكبرى",
              categoryEn: "Technical Production",
              categoryAr: "الإنتاج التقني والهندسي",
              descriptionEn: "Our engineers design and deploy synchronized kinetic rigs, projection mapping, and ultra-high-definition laser systems across Qatar's flagship venues.",
              descriptionAr: "يقوم مهندسونا بتصميم وتنفيذ مسارح حركية متزامنة، عروض إسقاط ضوئي متطورة، وأنظمة ليزر فائقة الدقة في أبرز وجهات قطر.",
              icon: "cpu",
              imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
            },
            {
              id: "spatial-architecture",
              titleEn: "Spatial & Multisensory Narrative Design",
              titleAr: "التصميم المكاني والتجارب متعددة الحواس",
              categoryEn: "Creative Architecture",
              categoryAr: "العمارة الإبداعية",
              descriptionEn: "Atelier teams transform raw spaces into living, breathing emotional environments connecting audiences with rich cultural stories.",
              descriptionAr: "يحول استوديو التصميم المساحات الصامتة إلى بيئات حسية غامرة تربط الجماهير بروايات ثقافية وتجارب استثنائية.",
              icon: "compass",
              imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
            },
          ],
    },
    hiringJourney: {
      enabled: initialData?.hiringJourney?.enabled !== false,
      eyebrowEn: initialData?.hiringJourney?.eyebrowEn || "TRANSPARENT PROCESS",
      eyebrowAr: initialData?.hiringJourney?.eyebrowAr || "رحلة المترشح والتقييم",
      titleEn: initialData?.hiringJourney?.titleEn || "Our Four-Step Hiring Journey",
      titleAr: initialData?.hiringJourney?.titleAr || "مراحل وخطوات الانضمام إلى إي ثري",
      subtitleEn: initialData?.hiringJourney?.subtitleEn || "From initial credential submission to your first live activation — clear milestones at every step.",
      subtitleAr: initialData?.hiringJourney?.subtitleAr || "مسار واضح وشفاف يضمن اختيار أفضل الكفاءات وتوفير تجربة انضمام سلسة ومهنية.",
      steps: Array.isArray(initialData?.hiringJourney?.steps) && initialData.hiringJourney.steps.length > 0
        ? initialData.hiringJourney.steps
        : [
            {
              number: "01",
              titleEn: "Application & CV Submission",
              titleAr: "التقديم وإرسال السيرة الذاتية",
              descEn: "Submit your resume for an active vacancy or join our general talent pool.",
              descAr: "قدّم سيرتك الذاتية لشواغرنا الحالية أو سجّل في قاعدة الكفاءات العامة.",
              icon: "file",
            },
            {
              number: "02",
              titleEn: "Technical & Creative Screening",
              titleAr: "التقييم الفني والإبداعي",
              descEn: "Our practice leads evaluate your portfolio and past project execution track record.",
              descAr: "يقوم قادة الأقسام بمراجعة سابقة أعمالك وخبراتك الهندسية والميدانية.",
              icon: "search",
            },
          ],
    },
    enquiries: {
      enabled: initialData?.enquiries?.enabled !== false,
      eyebrowEn: initialData?.enquiries?.eyebrowEn || "TALENT ACQUISITION SUPPORT",
      eyebrowAr: initialData?.enquiries?.eyebrowAr || "التواصل واستفسارات التوظيف",
      titleEn: initialData?.enquiries?.titleEn || "Have a Career Enquiry?",
      titleAr: initialData?.enquiries?.titleAr || "هل لديك استفسار لفريق التوظيف؟",
      subtitleEn: initialData?.enquiries?.subtitleEn || "Directly reach our Talent Acquisition team regarding role specifics, executive searches, or academic internships.",
      subtitleAr: initialData?.enquiries?.subtitleAr || "تواصل مباشرة مع فريق الموارد البشرية واستقطاب الكفاءات لأي استفسار يخص الشواغر، التدريب التعاوني، أو الشراكات الأكاديمية.",
    },
  });

  const [seo, setSeo] = useState<any>(initialData?.seo || {});

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/pages/b2b-careers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data, seo }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsDirty(false);
      setLastSaved(new Date());
      toast("B2B Careers page updated successfully.", "success");
    } catch (_e) {
      toast("Failed to save B2B Careers page.", "error");
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

  // Life At E3 Handlers
  const addLifeItem = () => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      lifeAtE3: {
        ...prev.lifeAtE3,
        items: [
          ...prev.lifeAtE3.items,
          {
            id: `life_${Date.now()}`,
            titleEn: "",
            titleAr: "",
            categoryEn: "",
            categoryAr: "",
            descriptionEn: "",
            descriptionAr: "",
            icon: "cpu",
            imageUrl: "",
          },
        ],
      },
    }));
  };

  const removeLifeItem = (idx: number) => {
    setIsDirty(true);
    setData((prev) => ({
      ...prev,
      lifeAtE3: {
        ...prev.lifeAtE3,
        items: prev.lifeAtE3.items.filter((_: any, i: number) => i !== idx),
      },
    }));
  };

  const updateLifeItem = (idx: number, field: string, value: any) => {
    setIsDirty(true);
    setData((prev) => {
      const newItems = [...prev.lifeAtE3.items];
      newItems[idx] = { ...newItems[idx], [field]: value };
      return {
        ...prev,
        lifeAtE3: { ...prev.lifeAtE3, items: newItems },
      };
    });
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      <DashboardPageHeader
        title="B2B Careers Page Editor"
        description="Manage the recruitment narrative, talent pool intake, culture stories, hiring process, and SEO for the careers portal (/b2b/careers)."
        breadcrumbs={[
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "Careers Page Editor" },
        ]}
        badge={{ label: "B2B Public", variant: "purple" }}
        previewUrl="/b2b/careers"
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

      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      {/* 1. HERO SECTION */}
      {activeSectionId === "hero" && (
        <DashboardSectionCard
          title="Hero Header Section"
          description="Main opening headline, mission statement, and background media banner."
          icon={<Globe className="w-5 h-5 text-cyan-400" />}
        >
          <DashboardBilingualField
            label="Hero Eyebrow Tag"
            valueEn={data.hero.eyebrowEn}
            valueAr={data.hero.eyebrowAr}
            onChangeEn={(val) => handleChange("hero", "eyebrowEn", val)}
            onChangeAr={(val) => handleChange("hero", "eyebrowAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Hero Title"
            valueEn={data.hero.titleEn}
            valueAr={data.hero.titleAr}
            onChangeEn={(val) => handleChange("hero", "titleEn", val)}
            onChangeAr={(val) => handleChange("hero", "titleAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Hero Subtitle"
            type="textarea"
            rows={3}
            valueEn={data.hero.subtitleEn}
            valueAr={data.hero.subtitleAr}
            onChangeEn={(val) => handleChange("hero", "subtitleEn", val)}
            onChangeAr={(val) => handleChange("hero", "subtitleAr", val)}
            mode={languageMode}
          />
          <div className="pt-2 border-t border-[var(--border-level-1)] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Hero Media Asset
            </label>
            <AdminMediaPicker
              value={data.hero.mediaUrl}
              onChange={(url) => handleChange("hero", "mediaUrl", url)}
            />
          </div>
        </DashboardSectionCard>
      )}

      {/* 2. ACTIVE JOBS ROSTER */}
      {activeSectionId === "activeJobs" && (
        <DashboardSectionCard
          title="Active Job Openings & Vacancies"
          description="Live database records currently published on the public careers portal (/b2b/careers)."
          icon={<Briefcase className="w-5 h-5 text-cyan-400" />}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] mb-6">
            <div className="space-y-1">
              <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>Database Postings:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold">
                  {initialData?.jobs?.length || 0} Total ({initialData?.jobs?.filter((j: any) => j.isPublished)?.length || 0} Published)
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Job vacancies and requirements are managed centrally in the HR Postings module.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/en/dashboard/careers"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-default)] hover:bg-[var(--surface-selected)] border border-[var(--border-level-1)] text-xs font-bold text-[var(--text-primary)] transition-colors"
              >
                <span>Manage All Jobs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/en/dashboard/careers/new"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post New Job</span>
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {(!initialData?.jobs || initialData.jobs.length === 0) ? (
              <div className="text-center py-10 rounded-xl border border-dashed border-[var(--border-level-1)] text-xs text-[var(--text-tertiary)]">
                No active jobs currently in database. Click &ldquo;Post New Job&rdquo; to create your first vacancy.
              </div>
            ) : (
              initialData.jobs.map((job: any) => (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] hover:border-cyan-500/40 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">
                        {job.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {job.department || "General"}
                      </span>
                      {job.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        {job.location || "Doha (On-Site)"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.type || "Full Time"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-400" />
                        {job._count?.applications || 0} Applicants
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/en/dashboard/careers/${job.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface-selected)] border border-[var(--border-level-1)] text-xs font-medium text-[var(--text-primary)] transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit Listing</span>
                    </Link>
                    <Link
                      href={`/en/careers/${job.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface-selected)] border border-[var(--border-level-1)] text-xs font-medium text-[var(--text-primary)] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Public</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardSectionCard>
      )}

      {/* 3. GENERAL CV INTAKE */}
      {activeSectionId === "generalApplication" && (
        <DashboardSectionCard
          title="General Application & Talent Pool Intake"
          description="Configuration for the open CV submission card."
          icon={<Briefcase className="w-5 h-5 text-cyan-400" />}
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="genAppEnabled"
              checked={data.generalApplication.enabled}
              onChange={(e) => handleChange("generalApplication", "enabled", e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
            />
            <label htmlFor="genAppEnabled" className="text-xs font-bold text-[var(--text-primary)]">
              Enable General Application Section
            </label>
          </div>
          <DashboardBilingualField
            label="Eyebrow"
            valueEn={data.generalApplication.eyebrowEn}
            valueAr={data.generalApplication.eyebrowAr}
            onChangeEn={(val) => handleChange("generalApplication", "eyebrowEn", val)}
            onChangeAr={(val) => handleChange("generalApplication", "eyebrowAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Title"
            valueEn={data.generalApplication.titleEn}
            valueAr={data.generalApplication.titleAr}
            onChangeEn={(val) => handleChange("generalApplication", "titleEn", val)}
            onChangeAr={(val) => handleChange("generalApplication", "titleAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Description"
            type="textarea"
            rows={2}
            valueEn={data.generalApplication.descriptionEn}
            valueAr={data.generalApplication.descriptionAr}
            onChangeEn={(val) => handleChange("generalApplication", "descriptionEn", val)}
            onChangeAr={(val) => handleChange("generalApplication", "descriptionAr", val)}
            mode={languageMode}
          />
        </DashboardSectionCard>
      )}

      {/* 3. CANDIDATE PORTAL BANNER */}
      {activeSectionId === "portalBanner" && (
        <DashboardSectionCard
          title="Candidate Portal Gateway Banner"
          description="Banner guiding candidates to check existing application statuses."
          icon={<Users className="w-5 h-5 text-cyan-400" />}
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="portalBannerEnabled"
              checked={data.portalBanner.enabled}
              onChange={(e) => handleChange("portalBanner", "enabled", e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
            />
            <label htmlFor="portalBannerEnabled" className="text-xs font-bold text-[var(--text-primary)]">
              Enable Candidate Portal Banner
            </label>
          </div>
          <DashboardBilingualField
            label="Eyebrow"
            valueEn={data.portalBanner.eyebrowEn}
            valueAr={data.portalBanner.eyebrowAr}
            onChangeEn={(val) => handleChange("portalBanner", "eyebrowEn", val)}
            onChangeAr={(val) => handleChange("portalBanner", "eyebrowAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Title"
            valueEn={data.portalBanner.titleEn}
            valueAr={data.portalBanner.titleAr}
            onChangeEn={(val) => handleChange("portalBanner", "titleEn", val)}
            onChangeAr={(val) => handleChange("portalBanner", "titleAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Description"
            type="textarea"
            rows={2}
            valueEn={data.portalBanner.descriptionEn}
            valueAr={data.portalBanner.descriptionAr}
            onChangeEn={(val) => handleChange("portalBanner", "descriptionEn", val)}
            onChangeAr={(val) => handleChange("portalBanner", "descriptionAr", val)}
            mode={languageMode}
          />
        </DashboardSectionCard>
      )}

      {/* 4. LIFE AT E3 */}
      {activeSectionId === "lifeAtE3" && (
        <DashboardSectionCard
          title="Life at E3 & Production Culture"
          description="Showcase disciplines, backstage rigor, and culture cards."
          icon={<Sparkles className="w-5 h-5 text-cyan-400" />}
          headerAction={
            <AdminButton
              variant="outline"
              size="sm"
              onClick={addLifeItem}
              leftIcon={<Plus className="w-3.5 h-3.5 text-cyan-500" />}
              className="text-xs"
            >
              Add Culture Card
            </AdminButton>
          }
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="lifeAtE3Enabled"
              checked={data.lifeAtE3.enabled}
              onChange={(e) => handleChange("lifeAtE3", "enabled", e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
            />
            <label htmlFor="lifeAtE3Enabled" className="text-xs font-bold text-[var(--text-primary)]">
              Enable Life at E3 Section
            </label>
          </div>
          <DashboardBilingualField
            label="Section Eyebrow"
            valueEn={data.lifeAtE3.eyebrowEn}
            valueAr={data.lifeAtE3.eyebrowAr}
            onChangeEn={(val) => handleChange("lifeAtE3", "eyebrowEn", val)}
            onChangeAr={(val) => handleChange("lifeAtE3", "eyebrowAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Section Title"
            valueEn={data.lifeAtE3.titleEn}
            valueAr={data.lifeAtE3.titleAr}
            onChangeEn={(val) => handleChange("lifeAtE3", "titleEn", val)}
            onChangeAr={(val) => handleChange("lifeAtE3", "titleAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Section Subtitle"
            type="textarea"
            rows={2}
            valueEn={data.lifeAtE3.subtitleEn}
            valueAr={data.lifeAtE3.subtitleAr}
            onChangeEn={(val) => handleChange("lifeAtE3", "subtitleEn", val)}
            onChangeAr={(val) => handleChange("lifeAtE3", "subtitleAr", val)}
            mode={languageMode}
          />

          <div className="space-y-4 pt-4 border-t border-[var(--border-level-1)]">
            {data.lifeAtE3.items.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)]/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Card #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeLifeItem(idx)}
                    className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <DashboardBilingualField
                  label="Title"
                  valueEn={item.titleEn}
                  valueAr={item.titleAr}
                  onChangeEn={(v) => updateLifeItem(idx, "titleEn", v)}
                  onChangeAr={(v) => updateLifeItem(idx, "titleAr", v)}
                  mode={languageMode}
                />
                <DashboardBilingualField
                  label="Category Badge"
                  valueEn={item.categoryEn}
                  valueAr={item.categoryAr}
                  onChangeEn={(v) => updateLifeItem(idx, "categoryEn", v)}
                  onChangeAr={(v) => updateLifeItem(idx, "categoryAr", v)}
                  mode={languageMode}
                />
                <DashboardBilingualField
                  label="Description"
                  type="textarea"
                  rows={2}
                  valueEn={item.descriptionEn}
                  valueAr={item.descriptionAr}
                  onChangeEn={(v) => updateLifeItem(idx, "descriptionEn", v)}
                  onChangeAr={(v) => updateLifeItem(idx, "descriptionAr", v)}
                  mode={languageMode}
                />
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Card Image Asset
                  </label>
                  <AdminMediaPicker
                    value={item.imageUrl}
                    onChange={(url) => updateLifeItem(idx, "imageUrl", url)}
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardSectionCard>
      )}

      {/* 5. HIRING JOURNEY */}
      {activeSectionId === "hiringJourney" && (
        <DashboardSectionCard
          title="4-Step Hiring Journey"
          description="Headlines and stage details explaining the recruitment workflow."
          icon={<FileCheck className="w-5 h-5 text-cyan-400" />}
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="hiringJourneyEnabled"
              checked={data.hiringJourney.enabled}
              onChange={(e) => handleChange("hiringJourney", "enabled", e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
            />
            <label htmlFor="hiringJourneyEnabled" className="text-xs font-bold text-[var(--text-primary)]">
              Enable Hiring Journey Section
            </label>
          </div>
          <DashboardBilingualField
            label="Section Eyebrow"
            valueEn={data.hiringJourney.eyebrowEn}
            valueAr={data.hiringJourney.eyebrowAr}
            onChangeEn={(val) => handleChange("hiringJourney", "eyebrowEn", val)}
            onChangeAr={(val) => handleChange("hiringJourney", "eyebrowAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Section Title"
            valueEn={data.hiringJourney.titleEn}
            valueAr={data.hiringJourney.titleAr}
            onChangeEn={(val) => handleChange("hiringJourney", "titleEn", val)}
            onChangeAr={(val) => handleChange("hiringJourney", "titleAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Section Subtitle"
            type="textarea"
            rows={2}
            valueEn={data.hiringJourney.subtitleEn}
            valueAr={data.hiringJourney.subtitleAr}
            onChangeEn={(val) => handleChange("hiringJourney", "subtitleEn", val)}
            onChangeAr={(val) => handleChange("hiringJourney", "subtitleAr", val)}
            mode={languageMode}
          />
        </DashboardSectionCard>
      )}

      {/* 6. ENQUIRIES */}
      {activeSectionId === "enquiries" && (
        <DashboardSectionCard
          title="HR & Career Enquiries"
          description="Headings for the talent acquisition support and direct question form."
          icon={<HelpCircle className="w-5 h-5 text-cyan-400" />}
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="enquiriesEnabled"
              checked={data.enquiries.enabled}
              onChange={(e) => handleChange("enquiries", "enabled", e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
            />
            <label htmlFor="enquiriesEnabled" className="text-xs font-bold text-[var(--text-primary)]">
              Enable Career Enquiries Section
            </label>
          </div>
          <DashboardBilingualField
            label="Eyebrow"
            valueEn={data.enquiries.eyebrowEn}
            valueAr={data.enquiries.eyebrowAr}
            onChangeEn={(val) => handleChange("enquiries", "eyebrowEn", val)}
            onChangeAr={(val) => handleChange("enquiries", "eyebrowAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Title"
            valueEn={data.enquiries.titleEn}
            valueAr={data.enquiries.titleAr}
            onChangeEn={(val) => handleChange("enquiries", "titleEn", val)}
            onChangeAr={(val) => handleChange("enquiries", "titleAr", val)}
            mode={languageMode}
          />
          <DashboardBilingualField
            label="Subtitle"
            type="textarea"
            rows={2}
            valueEn={data.enquiries.subtitleEn}
            valueAr={data.enquiries.subtitleAr}
            onChangeEn={(val) => handleChange("enquiries", "subtitleEn", val)}
            onChangeAr={(val) => handleChange("enquiries", "subtitleAr", val)}
            mode={languageMode}
          />
        </DashboardSectionCard>
      )}

      {/* 7. SEO */}
      {activeSectionId === "seo" && (
        <AdminSeoCustomizer seo={seo} setSeo={setSeo} formData={null} setFormData={() => {}} />
      )}

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
