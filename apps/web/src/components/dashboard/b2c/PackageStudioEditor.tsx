"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  Check,
  AlertCircle,
  Trash2,
  Plus,
  Building,
  Sparkles,
  DollarSign,
  Calendar,
  Users,
  Layers,
  ShieldCheck,
  Tag,
  HelpCircle,
  FileText,
  Clock,
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PackageMediaUploader } from "@/components/dashboard/b2c/PackageMediaUploader";
import { cn } from "@/lib/utils";

interface PackageStudioEditorProps {
  initialData?: any;
  locale: "en" | "ar";
  dir: "ltr" | "rtl";
  onClose: () => void;
  onSave: () => void;
}

const WORKFLOW_STEPS = [
  { id: "type", labelEn: "1. Type", labelAr: "١. النوع", icon: Layers },
  { id: "identity", labelEn: "2. Identity", labelAr: "٢. الهوية", icon: FileText },
  { id: "audience", labelEn: "3. Audience", labelAr: "٣. الفئات", icon: Users },
  { id: "venue", labelEn: "4. Venue & Attraction", labelAr: "٤. الوجهة", icon: Building },
  { id: "capacity", labelEn: "5. Capacity & Rules", labelAr: "٥. السعة والمواعيد", icon: Calendar },
  { id: "inclusions", labelEn: "6. Inclusions", labelAr: "٦. المشتملات", icon: Sparkles },
  { id: "pricing", labelEn: "7. Pricing & Tiers", labelAr: "٧. الأسعار والفئات", icon: DollarSign },
  { id: "addons", labelEn: "8. Add-ons", labelAr: "٨. الإضافات", icon: Plus },
  { id: "itinerary", labelEn: "9. Schedule Flow", labelAr: "٩. الجدول الزمني", icon: Clock },
  { id: "media", labelEn: "10. Media & Gallery", labelAr: "١٠. الوسائط", icon: ImageIcon },
  { id: "seo", labelEn: "11. SEO & Metadata", labelAr: "١١. محركات البحث", icon: Tag },
  { id: "publish", labelEn: "12. Validation & Publish", labelAr: "١٢. النشر", icon: ShieldCheck },
];

export function PackageStudioEditor({
  initialData,
  locale,
  dir,
  onClose,
  onSave,
}: PackageStudioEditorProps) {
  const isAr = locale === "ar";
  const isEdit = Boolean(initialData?.id);

  const [activeStep, setActiveStep] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [attractions, setAttractions] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    titleEn: initialData?.titleEn || "",
    titleAr: initialData?.titleAr || "",
    slug: initialData?.slug || "",
    code: initialData?.code || "",
    taglineEn: initialData?.taglineEn || "",
    taglineAr: initialData?.taglineAr || "",
    shortDescriptionEn: initialData?.shortDescriptionEn || "",
    shortDescriptionAr: initialData?.shortDescriptionAr || "",
    fullDescriptionEn: initialData?.fullDescriptionEn || "",
    fullDescriptionAr: initialData?.fullDescriptionAr || "",
    packageType: initialData?.packageType || "READY_TO_BOOK",
    category: initialData?.category || "BIRTHDAY",
    categoryId: initialData?.categoryId || "",
    audienceType: initialData?.audienceType || "KIDS",
    audienceTypes: initialData?.audienceTypes || ["KIDS", "FAMILIES"],
    minAge: initialData?.minAge || 4,
    maxAge: initialData?.maxAge || 14,
    childrenAllowed: initialData?.childrenAllowed !== undefined ? initialData.childrenAllowed : true,
    adultsAllowed: initialData?.adultsAllowed !== undefined ? initialData.adultsAllowed : true,
    attractionId: initialData?.attractionId || "",
    locationId: initialData?.locationId || "",
    indoorOutdoor: initialData?.indoorOutdoor || "INDOOR",
    minGuests: initialData?.minGuests || 10,
    maxGuests: initialData?.maxGuests || 40,
    durationMinutes: initialData?.durationMinutes || 120,
    bookingNoticeHours: initialData?.bookingNoticeHours || 24,
    operatingDays: initialData?.operatingDays || ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
    startingPrice: initialData?.startingPrice || 1200,
    priceDisplayMode: initialData?.priceDisplayMode || "STARTING_FROM",
    currency: initialData?.currency || "QAR",
    badgeTextEn: initialData?.badgeTextEn || "",
    badgeTextAr: initialData?.badgeTextAr || "",
    availabilityStatus: initialData?.availabilityStatus || "AVAILABLE",
    bookingType: initialData?.bookingType || "ENQUIRY_REQUIRED",
    bookingQubeUrl: initialData?.bookingQubeUrl || "",
    coverMediaUrl: initialData?.coverMediaUrl || "",
    heroMediaUrl: initialData?.heroMediaUrl || "",
    heroMediaType: (initialData?.heroMediaType || "IMAGE") as "IMAGE" | "VIDEO",
    brochureUrl: initialData?.brochureUrl || "",
    gallery: Array.isArray(initialData?.gallery) ? initialData.gallery : [],
    isFeatured: Boolean(initialData?.isFeatured),
    isPopular: Boolean(initialData?.isPopular),
    isSeasonal: Boolean(initialData?.isSeasonal),
    isLimited: Boolean(initialData?.isLimited),
    isPublished: initialData?.isPublished !== undefined ? initialData.isPublished : true,
    status: initialData?.status || "PUBLISHED",
    isTemplate: Boolean(initialData?.isTemplate),
    internalCost: initialData?.internalCost || "",
    estimatedMargin: initialData?.estimatedMargin || "",
    internalNotes: initialData?.internalNotes || "",
    tiers: Array.isArray(initialData?.tiers) ? initialData.tiers : [],
    inclusions: Array.isArray(initialData?.inclusions) ? initialData.inclusions : [],
    addOns: Array.isArray(initialData?.addOns) ? initialData.addOns : [],
    journeySteps: Array.isArray(initialData?.journeySteps) ? initialData.journeySteps : [],
    faqs: Array.isArray(initialData?.faqs) ? initialData.faqs : [],
    termsConditions: initialData?.termsConditions || {
      venueRulesEn: "",
      venueRulesAr: "",
      cancellationPolicyEn: "",
      cancellationPolicyAr: "",
      customClauses: []
    },
    metaTitleEn: initialData?.seo?.metaTitleEn || "",
    metaTitleAr: initialData?.seo?.metaTitleAr || "",
    metaDescriptionEn: initialData?.seo?.metaDescriptionEn || "",
    metaDescriptionAr: initialData?.seo?.metaDescriptionAr || "",
  });

  // Fetch helper lists (Categories, Attractions, Locations)
  useEffect(() => {
    fetch("/api/b2c/package-categories")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json.data)) setCategories(json.data);
      })
      .catch(console.error);

    fetch("/api/b2c/attractions?all=true")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json.data)) setAttractions(json.data);
      })
      .catch(console.error);

    fetch("/api/b2c/locations")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json.data)) setLocations(json.data);
      })
      .catch(console.error);
  }, []);

  // Auto-generate slug from English title if empty
  const handleTitleEnChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      titleEn: val,
      slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    }));
  };

  // Tier Management
  const addTier = () => {
    setForm((prev) => ({
      ...prev,
      tiers: [
        ...prev.tiers,
        {
          id: `tier-${Date.now()}`,
          nameEn: "Standard Tier",
          nameAr: "الفئة القياسية",
          price: 1500,
          guestCount: 15,
          extraGuestPrice: 100,
          durationMinutes: 120,
          includedItems: ["Full Park Access", "Dedicated Host"],
        },
      ],
    }));
  };

  const removeTier = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_: any, i: number) => i !== index),
    }));
  };

  // Inclusions Management
  const addInclusion = () => {
    setForm((prev) => ({
      ...prev,
      inclusions: [
        ...prev.inclusions,
        {
          id: `inc-${Date.now()}`,
          titleEn: "Activity Access",
          titleAr: "دخول الألعاب",
          icon: "Sparkles",
          status: "INCLUDED",
        },
      ],
    }));
  };

  const removeInclusion = (index: number) => {
    setForm((prev) => ({
      ...prev,
      inclusions: prev.inclusions.filter((_: any, i: number) => i !== index),
    }));
  };

  // Add-on Management
  const addAddon = () => {
    setForm((prev) => ({
      ...prev,
      addOns: [
        ...prev.addOns,
        {
          id: `add-${Date.now()}`,
          titleEn: "Event Host Appearance",
          titleAr: "حضور مضيف حفل معتمد",
          price: 350,
          priceType: "FIXED",
          minQty: 1,
          maxQty: 1,
        },
      ],
    }));
  };

  const removeAddon = (index: number) => {
    setForm((prev) => ({
      ...prev,
      addOns: prev.addOns.filter((_: any, i: number) => i !== index),
    }));
  };

  // Gallery Item Management
  const addGalleryItem = () => {
    setForm((prev) => ({
      ...prev,
      gallery: [
        ...prev.gallery,
        {
          id: `gal-${Date.now()}`,
          url: "",
          type: "IMAGE",
          captionEn: "",
          captionAr: "",
        },
      ],
    }));
  };

  const removeGalleryItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_: any, i: number) => i !== index),
    }));
  };

  const moveGalleryItem = (index: number, direction: "up" | "down") => {
    const next = [...form.gallery];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= next.length) return;
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setForm({ ...form, gallery: next });
  };

  const importAttractionGallery = () => {
    if (!form.attractionId) {
      alert(isAr ? "يرجى تحديد الوجهة أولاً في خطوة الوجهات (Step 4)" : "Please select an attraction in Step 4 first.");
      return;
    }
    const targetAttraction = attractions.find((a: any) => a.id === form.attractionId);
    if (!targetAttraction) {
      alert(isAr ? "لم يتم العثور على الوجهة المحددة" : "Selected attraction not found.");
      return;
    }
    const incomingItems: any[] = [];
    if (Array.isArray(targetAttraction.gallery)) {
      targetAttraction.gallery.forEach((g: any, i: number) => {
        const url = typeof g === "string" ? g : g.url;
        if (url) {
          incomingItems.push({
            id: `att-gal-${Date.now()}-${i}`,
            url,
            type: (typeof g === "object" && g.type) ? g.type : (url.match(/\.(mp4|webm)$/i) ? "VIDEO" : "IMAGE"),
            captionEn: (typeof g === "object" && g.captionEn) ? g.captionEn : `${targetAttraction.nameEn || "Attraction"} Visual #${i + 1}`,
            captionAr: (typeof g === "object" && g.captionAr) ? g.captionAr : `${targetAttraction.nameAr || "الوجهة"} لقطة #${i + 1}`,
            thumbnail: (typeof g === "object" && g.thumbnail) ? g.thumbnail : undefined
          });
        }
      });
    }
    if (incomingItems.length === 0 && (targetAttraction.coverImage || targetAttraction.heroImage)) {
      incomingItems.push({
        id: `att-gal-${Date.now()}-0`,
        url: targetAttraction.coverImage || targetAttraction.heroImage,
        type: "IMAGE",
        captionEn: `${targetAttraction.nameEn || "Attraction"} Arena Highlight`,
        captionAr: `${targetAttraction.nameAr || "الوجهة"} الساحة الرئيسية`
      });
    }
    if (incomingItems.length === 0) {
      alert(isAr ? "لا توجد صور مسجلة لهذه الوجهة" : "No gallery photos found on this attraction.");
      return;
    }
    setForm(prev => ({
      ...prev,
      gallery: [...prev.gallery, ...incomingItems]
    }));
  };

  // Journey Step Management
  const addJourneyStep = () => {
    setForm((prev) => ({
      ...prev,
      journeySteps: [
        ...prev.journeySteps,
        {
          id: `step-${Date.now()}`,
          stepNumber: prev.journeySteps.length + 1,
          titleEn: "Welcome & Briefing",
          titleAr: "الترحيب والإرشادات",
          durationMinutes: 15,
          descriptionEn: "Guests arrive, check in, and meet their dedicated host.",
          descriptionAr: "وصول الضيوف وتسجيل الدخول والالتقاء بمضيف الحفل.",
        },
      ],
    }));
  };

  const removeJourneyStep = (index: number) => {
    setForm((prev) => ({
      ...prev,
      journeySteps: prev.journeySteps.filter((_: any, i: number) => i !== index),
    }));
  };

  // Venue-Specific Terms & Conditions Management
  const addCustomClause = () => {
    const prevClauses = Array.isArray(form.termsConditions?.customClauses)
      ? form.termsConditions.customClauses
      : []
    setForm((prev) => ({
      ...prev,
      termsConditions: {
        ...prev.termsConditions,
        customClauses: [
          ...prevClauses,
          {
            id: `clause-${Date.now()}`,
            titleEn: "Safety & Footwear",
            titleAr: "إرشادات السلامة والأحذية",
            ruleEn: "Grip socks are mandatory for all active attractions. Outside catering strictly restricted.",
            ruleAr: "الجوارب المانعة للانزلاق إلزامية لجميع الأنشطة الحركية. يُمنع إدخال أطعمة من الخارج."
          }
        ]
      }
    }))
  };

  const removeCustomClause = (index: number) => {
    const prevClauses = Array.isArray(form.termsConditions?.customClauses)
      ? form.termsConditions.customClauses
      : []
    setForm((prev) => ({
      ...prev,
      termsConditions: {
        ...prev.termsConditions,
        customClauses: prevClauses.filter((_: any, i: number) => i !== index)
      }
    }))
  };

  const importVenueDefaults = () => {
    const selectedAttraction = attractions.find(a => a.id === form.attractionId)
    const venueName = selectedAttraction ? selectedAttraction.nameEn : "E3 Venue"
    setForm((prev) => ({
      ...prev,
      termsConditions: {
        ...prev.termsConditions,
        venueRulesEn: `All participants at ${venueName} must adhere to on-site marshal instructions. Grip socks required in all adventure zones. Outside catering prohibited except celebration cake.`,
        venueRulesAr: `يجب على جميع المشاركين في ${selectedAttraction?.nameAr || "وجهة إي ثري"} الالتزام بتوجيهات المشرفين. ارتداء الجوارب المانعة للانزلاق إلزامي. يُمنع إدخال أطعمة خارجية باستثناء كعكة الحفل المعتمدة.`,
        cancellationPolicyEn: "100% deposit refund for cancellations received 7+ days prior to event. Rescheduling permitted within 48 hours notice for up to 6 months.",
        cancellationPolicyAr: "استرداد كامل للدفعة المقدمة عند الإلغاء قبل ٧ أيام من موعد الفعالية. يُتاح إعادة الجدولة خلال ٤٨ ساعة لمدة تصل إلى ٦ أشهر."
      }
    }))
  };

  // Completion calculation
  const calculateCompletion = () => {
    let completed = 0;
    let total = 6;
    if (form.titleEn) completed++;
    if (form.titleAr) completed++;
    if (form.startingPrice > 0) completed++;
    if (form.inclusions.length > 0) completed++;
    if (form.coverMediaUrl || form.heroMediaUrl) completed++;
    if (form.shortDescriptionEn) completed++;
    return Math.round((completed / total) * 100);
  };

  const completionPercent = calculateCompletion();

  // Save handler
  const handleSave = async () => {
    if (!form.titleEn) {
      setError(isAr ? "يرجى كتابة عنوان الباقة بالإنجليزية" : "English title is required");
      setActiveStep(1);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const {
        metaTitleEn,
        metaTitleAr,
        metaDescriptionEn,
        metaDescriptionAr,
        ...formRest
      } = form;

      const startingPriceNum = parseFloat(form.startingPrice as any) || 0;
      const internalCostNum = form.internalCost ? parseFloat(form.internalCost as any) : null;
      let calculatedMargin = form.estimatedMargin ? parseFloat(form.estimatedMargin as any) : null;
      if (calculatedMargin === null && internalCostNum !== null && startingPriceNum > 0) {
        calculatedMargin = Math.round(((startingPriceNum - internalCostNum) / startingPriceNum) * 100);
      }

      const payload = {
        ...formRest,
        categoryId: form.categoryId?.trim() ? form.categoryId.trim() : undefined,
        category: form.category || "BIRTHDAY",
        startingPrice: startingPriceNum,
        internalCost: internalCostNum,
        estimatedMargin: calculatedMargin,
        seo: {
          metaTitleEn: metaTitleEn || undefined,
          metaTitleAr: metaTitleAr || undefined,
          metaDescriptionEn: metaDescriptionEn || undefined,
          metaDescriptionAr: metaDescriptionAr || undefined,
        },
      };

      const url = isEdit ? `/api/b2c/packages/${initialData.id}` : "/api/b2c/packages";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save package");
      }

      setSuccessMsg(isAr ? "تم حفظ الباقة بنجاح!" : "Package saved successfully!");
      setTimeout(() => {
        onSave();
      }, 600);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to save package");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-2xl overflow-hidden font-poppins" dir={dir}>
      {/* Top Action Header */}
      <div className="p-6 border-b border-[var(--border-level-2)] bg-[var(--surface-hover)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
            {isAr ? "رجوع للقائمة" : "Back to Catalogue"}
          </Button>
          <div>
            <h2 className="text-lg font-black font-display text-[var(--text-primary)]">
              {isEdit
                ? (isAr ? `تعديل الباقة: ${form.titleAr || form.titleEn}` : `Edit Package: ${form.titleEn}`)
                : (isAr ? "إنشاء باقة تجربة جديدة" : "Create New Experience Package")}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {completionPercent}% {isAr ? "مكتمل" : "Complete"}
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)]">•</span>
              <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                {form.slug || "new-package-slug"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {form.slug && (
            <a
              href={`/${locale}/b2c/packages/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>{isAr ? "معاينة الصفحة" : "Live Preview"}</span>
            </a>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ الباقة" : "Save Package")}
          </Button>
        </div>
      </div>

      {/* Progress & Section Tabs (High-Contrast Clean Bar) */}
      <div className="flex items-center gap-1.5 p-2 overflow-x-auto border-b border-[var(--border-level-2)] bg-[var(--surface-subtle)] scrollbar-none">
        {WORKFLOW_STEPS.map((st, idx) => {
          const Icon = st.icon;
          const isActive = activeStep === idx;
          return (
            <button
              key={st.id}
              onClick={() => setActiveStep(idx)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                isActive
                  ? "bg-[var(--color-primary)] text-white shadow-sm font-black"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isAr ? st.labelAr : st.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="mx-6 mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="mx-6 mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Step Workspace */}
      <div className="p-6 md:p-8 min-h-[460px]">
        {/* Step 0: Type Selection */}
        {activeStep === 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                {isAr ? "اختر نمط وهيكل الباقة" : "Select Package Intent & Type"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isAr
                  ? "يحدد نمط الباقة طريقة التسعير وحقول الحجز وتدفق الاستفسارات في الموقع."
                  : "Defines the booking mechanism, pricing structure, and audience routing on the public marketplace."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: "READY_TO_BOOK", labelEn: "Ready-To-Book Package", labelAr: "باقة جاهزة للحجز المباشر", descEn: "Fixed itinerary, standard tiers & instant reservation flow" },
                { id: "REQUEST_A_QUOTE", labelEn: "Custom Quote Required", labelAr: "باقة تتطلب عرض سعر", descEn: "Tailored scope, guest count & venue sizing" },
                { id: "SEASONAL", labelEn: "Seasonal Programme / Camp", labelAr: "برنامج موسمي أو مخيم", descEn: "Holiday passes and recurring multi-day courses" },
                { id: "CORPORATE", labelEn: "Corporate Team Challenge", labelAr: "تحدي وباقة للشركات", descEn: "Team building, tournaments & company buyouts" },
                { id: "SCHOOL", labelEn: "School / Educational Trip", labelAr: "رحلة مدرسية تعليمية", descEn: "Curriculum workshops & student passes" },
                { id: "CUSTOM_TEMPLATE", labelEn: "Reusable Blank Template", labelAr: "قالب مخصص فارغ", descEn: "Save as template for future fast creation" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, packageType: t.id })}
                  className={cn(
                    "p-5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-xs",
                    form.packageType === t.id
                      ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--text-primary)] ring-2 ring-[var(--color-primary)]/20"
                      : "bg-[var(--surface-subtle)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                  )}
                >
                  <div className="text-sm font-bold text-[var(--text-primary)]">{isAr ? t.labelAr : t.labelEn}</div>
                  <div className="text-xs text-[var(--text-secondary)] leading-relaxed">{t.descEn}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Identity */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "عنوان الباقة (الإنجليزية) *" : "Package Title (English) *"}
                </label>
                <input
                  type="text"
                  required
                  value={form.titleEn}
                  onChange={(e) => handleTitleEnChange(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="e.g. InflataRUN VIP Birthday Adventure"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "عنوان الباقة (العربية)" : "Package Title (Arabic)"}
                </label>
                <input
                  type="text"
                  value={form.titleAr}
                  dir="rtl"
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right"
                  placeholder="مثال: مغامرة عيد الميلاد VIP في إنفلاتا ران"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "الاسم المستعار في الرابط (Slug) *" : "URL Slug *"}
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="inflatarun-vip-birthday"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "الفئة الرئيسية (Category) *" : "Category Taxonomy *"}
                </label>
                <select
                  value={form.categoryId || form.category}
                  onChange={(e) => {
                    const val = e.target.value;
                    const selectedCat = categories.find((c) => c.id === val || c.slug === val.toLowerCase());
                    setForm({
                      ...form,
                      categoryId: selectedCat ? selectedCat.id : "",
                      category: selectedCat ? (selectedCat.slug?.toUpperCase() || val) : val,
                    });
                  }}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                >
                  <option value="BIRTHDAY">Celebrate / أعياد الميلاد</option>
                  <option value="SCHOOL">Learn & Explore / المدارس والتعليم</option>
                  <option value="GROUP">Play Together / المجموعات</option>
                  <option value="CORPORATE">Corporate / الشركات</option>
                  <option value="EVENTS">Events & Buyouts / الفعاليات</option>
                  <option value="SEASONAL">Seasonal / الباقات الموسمية</option>
                  <option value="CUSTOM">Custom / تجارب حسب الطلب</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn} ({c.nameAr})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "الشعار الترويجي القصير (EN / AR)" : "Short Tagline (EN / AR)"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.taglineEn}
                    onChange={(e) => setForm({ ...form, taglineEn: e.target.value })}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="Bounce, race, and celebrate across Qatar's largest inflatables"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={form.taglineAr}
                    onChange={(e) => setForm({ ...form, taglineAr: e.target.value })}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right"
                    placeholder="اقفز وسابق واحتفل في أكبر مدينة ألعاب مطاطية بقطر"
                  />
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "الوصف المختصر للبطاقة (EN / AR)" : "Card Short Description (EN / AR)"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <textarea
                    rows={2}
                    value={form.shortDescriptionEn}
                    onChange={(e) => setForm({ ...form, shortDescriptionEn: e.target.value })}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                    placeholder="All-inclusive VIP inflatable birthday party with private party room, dedicated host & cake ceremony."
                  />
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={form.shortDescriptionAr}
                    onChange={(e) => setForm({ ...form, shortDescriptionAr: e.target.value })}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none font-arabic text-right"
                    placeholder="حفل عيد ميلاد VIP متكامل يشمل غرفة خاصة، مضيف حفل، وجبات، ومراسم الكعكة."
                  />
                </div>
              </div>

              {/* Cover Media Uploader with Local Upload & Live Preview */}
              <div className="col-span-1 sm:col-span-2 pt-4 border-t border-[var(--border-default)] grid grid-cols-1 sm:grid-cols-2 gap-6">
                <PackageMediaUploader
                  label={isAr ? "صورة غلاف البطاقة (Cover Media) *" : "Card Cover Media (Image/Video) *"}
                  value={form.coverMediaUrl}
                  onChange={(url) => setForm({ ...form, coverMediaUrl: url })}
                  mediaType="IMAGE"
                  context="packages/cover"
                  recommendedSize="Recommended: 1200x800px (16:10 aspect ratio)"
                  isAr={isAr}
                />

                <PackageMediaUploader
                  label={isAr ? "خلفية رأس صفحة الباقة (Hero Media)" : "Microsite Hero Media (Image/Video)"}
                  value={form.heroMediaUrl}
                  onChange={(url) => setForm({ ...form, heroMediaUrl: url })}
                  mediaType={form.heroMediaType}
                  onMediaTypeChange={(type) => setForm({ ...form, heroMediaType: type })}
                  context="packages/hero"
                  recommendedSize="Recommended: 1920x1080px (16:9 banner or MP4 video)"
                  isAr={isAr}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Audience */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                {isAr ? "الفئات المستهدفة وملاءمة الأعمار" : "Target Audience & Suitability"}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "KIDS", label: "Kids (4-12)" },
                { id: "TEENS", label: "Teens (13-17)" },
                { id: "ADULTS", label: "Adults" },
                { id: "FAMILIES", label: "Families" },
                { id: "CORPORATE", label: "Corporate" },
                { id: "SCHOOLS", label: "Schools" },
                { id: "NURSERIES", label: "Nurseries" },
                { id: "COMMUNITY", label: "Community" },
              ].map((aud) => {
                const selected = form.audienceTypes.includes(aud.id);
                return (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? form.audienceTypes.filter((a: string) => a !== aud.id)
                        : [...form.audienceTypes, aud.id];
                      setForm({ ...form, audienceTypes: next });
                    }}
                    className={cn(
                      "p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between shadow-xs",
                      selected
                        ? "bg-[var(--color-primary)]/15 border-[var(--color-primary)] text-[var(--color-primary)]"
                        : "bg-[var(--surface-subtle)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                    )}
                  >
                    <span>{aud.label}</span>
                    {selected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--border-default)]">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "الحد الأدنى للعمر" : "Minimum Age"}
                </label>
                <input
                  type="number"
                  value={form.minAge}
                  onChange={(e) => setForm({ ...form, minAge: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "الحد الأعلى للعمر" : "Maximum Age"}
                </label>
                <input
                  type="number"
                  value={form.maxAge}
                  onChange={(e) => setForm({ ...form, maxAge: parseInt(e.target.value) || 99 })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="childrenAllowed"
                  checked={form.childrenAllowed}
                  onChange={(e) => setForm({ ...form, childrenAllowed: e.target.checked })}
                  className="rounded text-[var(--color-primary)] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="childrenAllowed" className="text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
                  {isAr ? "الأطفال مسموح لهم" : "Children Allowed"}
                </label>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="adultsAllowed"
                  checked={form.adultsAllowed}
                  onChange={(e) => setForm({ ...form, adultsAllowed: e.target.checked })}
                  className="rounded text-[var(--color-primary)] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="adultsAllowed" className="text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
                  {isAr ? "الكبار مسموح لهم" : "Adults Allowed"}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Venue & Attractions */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "المعلم الترفيهي الأساسي" : "Primary Attraction"}
                </label>
                <select
                  value={form.attractionId}
                  onChange={(e) => setForm({ ...form, attractionId: e.target.value })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                >
                  <option value="">{isAr ? "غير محدد / وجهات متعددة" : "None / Multi-Attraction"}</option>
                  {attractions.map((att) => (
                    <option key={att.id} value={att.id}>
                      {att.nameEn} ({att.nameAr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "الموقع / الفرع الجغرافي" : "Venue / Location"}
                </label>
                <select
                  value={form.locationId}
                  onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                >
                  <option value="">{isAr ? "غير محدد / موقع العميل" : "None / Client Location"}</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.nameEn} ({loc.nameAr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "بيئة المكان" : "Environment Setting"}
                </label>
                <select
                  value={form.indoorOutdoor}
                  onChange={(e) => setForm({ ...form, indoorOutdoor: e.target.value })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                >
                  <option value="INDOOR">Indoor (داخلي مكيّف)</option>
                  <option value="OUTDOOR">Outdoor (خارجي)</option>
                  <option value="HYBRID">Hybrid (مدمج داخلي وخارجي)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Capacity & Schedule */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "الحد الأدنى للضيوف *" : "Min Guests *"}
                </label>
                <input
                  type="number"
                  value={form.minGuests}
                  onChange={(e) => setForm({ ...form, minGuests: parseInt(e.target.value) || 1 })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "الحد الأقصى للضيوف *" : "Max Guests *"}
                </label>
                <input
                  type="number"
                  value={form.maxGuests}
                  onChange={(e) => setForm({ ...form, maxGuests: parseInt(e.target.value) || 100 })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "مدة الفعالية (بالدقائق)" : "Duration (Minutes)"}
                </label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 60 })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            {/* Venue-Specific Terms & Conditions */}
            <div className="pt-6 border-t border-[var(--border-default)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    {isAr ? "الشروط والأحكام الخاصة بالوجهة وسياسة الإلغاء" : "Venue-Specific Terms & Cancellation Rules"}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isAr
                      ? "تحديد القواعد الخاصة بكل وجهة (مثل الجوارب المانعة للانزلاق، سياسة المأكولات، شروط الإلغاء)."
                      : "Configure per-package conditions tailored to the venue (e.g. grip socks, outside catering, refund window)."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={importVenueDefaults}
                    className="text-xs gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {isAr ? "استيراد الشروط الافتراضية" : "Import Venue Defaults"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addCustomClause}
                    className="text-xs gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAr ? "إضافة بند مخصص" : "Add Custom Clause"}
                  </Button>
                </div>
              </div>

              {/* Venue Rules EN & AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "قواعد وإرشادات الوجهة (إنجليزية)" : "Venue & Safety Rules (English)"}
                  </label>
                  <textarea
                    rows={3}
                    value={form.termsConditions?.venueRulesEn || ""}
                    onChange={(e) => setForm({
                      ...form,
                      termsConditions: { ...form.termsConditions, venueRulesEn: e.target.value }
                    })}
                    placeholder="e.g. All participants must wear venue grip socks. Outside food restricted."
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "قواعد وإرشادات الوجهة (عربية)" : "Venue & Safety Rules (Arabic)"}
                  </label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={form.termsConditions?.venueRulesAr || ""}
                    onChange={(e) => setForm({
                      ...form,
                      termsConditions: { ...form.termsConditions, venueRulesAr: e.target.value }
                    })}
                    placeholder="مثال: ارتداء الجوارب المانعة للانزلاق إلزامي. يُمنع إدخال أطعمة من الخارج."
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none font-arabic text-right"
                  />
                </div>
              </div>

              {/* Cancellation Policy EN & AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "سياسة الإلغاء والاسترداد (إنجليزية)" : "Cancellation & Refund Policy (English)"}
                  </label>
                  <textarea
                    rows={2}
                    value={form.termsConditions?.cancellationPolicyEn || ""}
                    onChange={(e) => setForm({
                      ...form,
                      termsConditions: { ...form.termsConditions, cancellationPolicyEn: e.target.value }
                    })}
                    placeholder="e.g. 100% refund for cancellations 7+ days prior to event."
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "سياسة الإلغاء والاسترداد (عربية)" : "Cancellation & Refund Policy (Arabic)"}
                  </label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={form.termsConditions?.cancellationPolicyAr || ""}
                    onChange={(e) => setForm({
                      ...form,
                      termsConditions: { ...form.termsConditions, cancellationPolicyAr: e.target.value }
                    })}
                    placeholder="مثال: استرداد كامل عند الإلغاء قبل ٧ أيام من موعد الحفل."
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none font-arabic text-right"
                  />
                </div>
              </div>

              {/* Custom Clauses List */}
              {Array.isArray(form.termsConditions?.customClauses) && form.termsConditions.customClauses.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-[var(--text-secondary)] block">
                    {isAr ? "البنود المخصصة الإضافية:" : "Custom Venue Clauses:"}
                  </span>
                  {form.termsConditions.customClauses.map((clause: any, idx: number) => (
                    <div key={clause.id || idx} className="p-3 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={clause.titleEn || ""}
                          onChange={(e) => {
                            const next = [...form.termsConditions.customClauses]
                            next[idx].titleEn = e.target.value
                            setForm({ ...form, termsConditions: { ...form.termsConditions, customClauses: next } })
                          }}
                          placeholder="Clause title (EN)"
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                        />
                      </div>
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          value={clause.ruleEn || ""}
                          onChange={(e) => {
                            const next = [...form.termsConditions.customClauses]
                            next[idx].ruleEn = e.target.value
                            setForm({ ...form, termsConditions: { ...form.termsConditions, customClauses: next } })
                          }}
                          placeholder="Specific rule requirement..."
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeCustomClause(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Inclusions */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {isAr ? "الميزات والخدمات المشمولة في الباقة" : "Package Inclusions"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isAr ? "أضف الخدمات والامتيازات الأساسية المتضمنة مع هذه الباقة." : "Specify the core items, room access, hosts, and food included."}
                </p>
              </div>
              <Button size="sm" onClick={addInclusion} className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                {isAr ? "إضافة ميزة" : "Add Inclusion"}
              </Button>
            </div>

            <div className="space-y-3">
              {form.inclusions.map((inc: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={inc.titleEn}
                      onChange={(e) => {
                        const next = [...form.inclusions];
                        next[idx].titleEn = e.target.value;
                        setForm({ ...form, inclusions: next });
                      }}
                      placeholder="Title in English"
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      dir="rtl"
                      value={inc.titleAr || ""}
                      onChange={(e) => {
                        const next = [...form.inclusions];
                        next[idx].titleAr = e.target.value;
                        setForm({ ...form, inclusions: next });
                      }}
                      placeholder="العنوان بالعربية"
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none font-arabic text-right"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeInclusion(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Pricing */}
        {activeStep === 6 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "السعر الأساسي (QAR) *" : "Starting / Base Price (QAR) *"}
                </label>
                <input
                  type="number"
                  value={form.startingPrice}
                  onChange={(e) => setForm({ ...form, startingPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "طريقة عرض السعر" : "Price Display Mode"}
                </label>
                <select
                  value={form.priceDisplayMode}
                  onChange={(e) => setForm({ ...form, priceDisplayMode: e.target.value })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                >
                  <option value="STARTING_FROM">Starting From (يبدأ من)</option>
                  <option value="PER_GUEST">Per Guest / Child (لكل ضيف)</option>
                  <option value="FIXED">Fixed Total Price (سعر ثابت)</option>
                  <option value="PRICE_ON_REQUEST">Custom Quote / عند الطلب</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "التكلفة الداخلية (سري للمشرفين)" : "Internal Cost (Admin Confidential)"}
                </label>
                <input
                  type="number"
                  value={form.internalCost}
                  onChange={(e) => setForm({ ...form, internalCost: e.target.value })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs font-mono text-[var(--text-secondary)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="Confidential cost"
                />
              </div>
            </div>

            {/* Profit Margin Indicator */}
            {form.startingPrice > 0 && form.internalCost > 0 && (() => {
              const cost = parseFloat(form.internalCost as any) || 0;
              const margin = Math.round(((form.startingPrice - cost) / form.startingPrice) * 100);
              const profit = form.startingPrice - cost;
              return (
                <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">
                      {isAr ? "هامش الربح التقديري:" : "Estimated Profit Margin:"}
                    </span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-mono font-black",
                      margin >= 40 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                      margin >= 20 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                      "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    )}>
                      {margin}% ({profit > 0 ? `+${profit}` : profit} QAR)
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--text-tertiary)] font-medium">
                    {margin >= 40 ? (isAr ? "هامش ربح تجاري ممتاز" : "Healthy Commercial Margin") :
                     margin >= 20 ? (isAr ? "هامش ربح متوسط" : "Moderate Margin") :
                     (isAr ? "تنبيه: هامش ربح منخفض" : "Warning: Low Commercial Margin")}
                  </span>
                </div>
              );
            })()}

            {/* Pricing Tiers */}
            <div className="pt-6 border-t border-[var(--border-default)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    {isAr ? "فئات الأسعار المتعددة (Pricing Tiers)" : "Modular Pricing Tiers"}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isAr ? "مثل: الباقة الأساسية، الباقة الفاخرة، الباقة الذهبية." : "e.g. Essential Tier, Premium Tier, Ultimate VIP."}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={addTier} className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  {isAr ? "إضافة فئة سعرية" : "Add Tier"}
                </Button>
              </div>

              <div className="space-y-3">
                {form.tiers.map((tier: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-[var(--text-secondary)] block mb-1">
                          {isAr ? "اسم الفئة (EN)" : "Tier Name (EN)"}
                        </label>
                        <input
                          type="text"
                          value={tier.nameEn}
                          onChange={(e) => {
                            const next = [...form.tiers];
                            next[idx].nameEn = e.target.value;
                            setForm({ ...form, tiers: next });
                          }}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                          placeholder="VIP Deluxe"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-[var(--text-secondary)] block mb-1">
                          {isAr ? "اسم الفئة (AR)" : "Tier Name (AR)"}
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          value={tier.nameAr || ""}
                          onChange={(e) => {
                            const next = [...form.tiers];
                            next[idx].nameAr = e.target.value;
                            setForm({ ...form, tiers: next });
                          }}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] font-arabic text-right"
                          placeholder="الباقة الذهبية المميزة"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-[var(--text-secondary)] block mb-1">
                          {isAr ? "السعر (QAR)" : "Price (QAR)"}
                        </label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => {
                            const next = [...form.tiers];
                            next[idx].price = parseFloat(e.target.value) || 0;
                            setForm({ ...form, tiers: next });
                          }}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => removeTier(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-[var(--border-default)]/60">
                      <div>
                        <label className="text-[10px] text-[var(--text-secondary)] block mb-1">
                          {isAr ? "عدد الضيوف المشمولين" : "Included Guests"}
                        </label>
                        <input
                          type="number"
                          value={tier.guestCount || 10}
                          onChange={(e) => {
                            const next = [...form.tiers];
                            next[idx].guestCount = parseInt(e.target.value) || 10;
                            setForm({ ...form, tiers: next });
                          }}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--text-secondary)] block mb-1">
                          {isAr ? "سعر الضيف الإضافي (QAR)" : "Extra Guest Price (QAR)"}
                        </label>
                        <input
                          type="number"
                          value={tier.extraGuestPrice || 0}
                          onChange={(e) => {
                            const next = [...form.tiers];
                            next[idx].extraGuestPrice = parseFloat(e.target.value) || 0;
                            setForm({ ...form, tiers: next });
                          }}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] font-mono"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--text-secondary)] block mb-1">
                          {isAr ? "المدة (بالدقائق)" : "Duration (Mins)"}
                        </label>
                        <input
                          type="number"
                          value={tier.durationMinutes || 120}
                          onChange={(e) => {
                            const next = [...form.tiers];
                            next[idx].durationMinutes = parseInt(e.target.value) || 60;
                            setForm({ ...form, tiers: next });
                          }}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] font-mono"
                          placeholder="120"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--text-secondary)] block mb-1">
                          {isAr ? "الميزات المشمولة (مفصولة بفاصلة)" : "Perks (Comma Separated)"}
                        </label>
                        <input
                          type="text"
                          value={Array.isArray(tier.includedItems) ? tier.includedItems.join(", ") : (tier.includedItems || "")}
                          onChange={(e) => {
                            const next = [...form.tiers];
                            next[idx].includedItems = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
                            setForm({ ...form, tiers: next });
                          }}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                          placeholder="VIP Lounge, Dedicated Host"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Add-ons */}
        {activeStep === 7 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {isAr ? "الخدمات والإضافات الاختيارية (Add-ons)" : "Optional Package Add-Ons"}
                </h3>
              </div>
              <Button size="sm" onClick={addAddon} className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                {isAr ? "إضافة خدمة" : "Add Add-On"}
              </Button>
            </div>

            <div className="space-y-3">
              {form.addOns.map((add: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Title (EN)</label>
                    <input
                      type="text"
                      value={add.titleEn}
                      onChange={(e) => {
                        const next = [...form.addOns];
                        next[idx].titleEn = e.target.value;
                        setForm({ ...form, addOns: next });
                      }}
                      placeholder="Add-on title (EN)"
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Title (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={add.titleAr || ""}
                      onChange={(e) => {
                        const next = [...form.addOns];
                        next[idx].titleAr = e.target.value;
                        setForm({ ...form, addOns: next });
                      }}
                      placeholder="عنوان الإضافة (عربي)"
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] font-arabic text-right"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Price (QAR)</label>
                    <input
                      type="number"
                      value={add.price}
                      onChange={(e) => {
                        const next = [...form.addOns];
                        next[idx].price = parseFloat(e.target.value) || 0;
                        setForm({ ...form, addOns: next });
                      }}
                      placeholder="Price"
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Price Type</label>
                    <select
                      value={add.priceType || "FIXED"}
                      onChange={(e) => {
                        const next = [...form.addOns];
                        next[idx].priceType = e.target.value;
                        setForm({ ...form, addOns: next });
                      }}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] cursor-pointer"
                    >
                      <option value="FIXED">Fixed / سعر ثابت</option>
                      <option value="PER_GUEST">Per Guest / لكل ضيف</option>
                    </select>
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Max Qty</label>
                    <input
                      type="number"
                      value={add.maxQty || 1}
                      onChange={(e) => {
                        const next = [...form.addOns];
                        next[idx].maxQty = parseInt(e.target.value) || 1;
                        setForm({ ...form, addOns: next });
                      }}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-2 py-1.5 text-xs text-[var(--text-primary)] font-mono text-center"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => removeAddon(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Itinerary / Schedule Flow */}
        {activeStep === 8 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {isAr ? "الجدول الزمني ومسار الفعالية" : "Celebration Schedule & Journey Steps"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isAr ? "أضف تسلسل فقرات الحفل أو الرحلة (مثال: الاستقبال، الألعاب، كعكة العيد)." : "Configure the sequential milestones for party celebrations."}
                </p>
              </div>
              <Button size="sm" onClick={addJourneyStep} className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                {isAr ? "إضافة فقرة" : "Add Journey Step"}
              </Button>
            </div>

            <div className="space-y-3">
              {form.journeySteps.map((step: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-primary)]">
                      {isAr ? `المرحلة ${idx + 1}` : `Milestone ${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeJourneyStep(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Title (EN)</label>
                      <input
                        type="text"
                        value={step.titleEn}
                        onChange={(e) => {
                          const next = [...form.journeySteps];
                          next[idx].titleEn = e.target.value;
                          setForm({ ...form, journeySteps: next });
                        }}
                        className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Title (AR)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={step.titleAr}
                        onChange={(e) => {
                          const next = [...form.journeySteps];
                          next[idx].titleAr = e.target.value;
                          setForm({ ...form, journeySteps: next });
                        }}
                        className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] font-arabic text-right"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Duration (Mins)</label>
                      <input
                        type="number"
                        value={step.durationMinutes || 15}
                        onChange={(e) => {
                          const next = [...form.journeySteps];
                          next[idx].durationMinutes = parseInt(e.target.value) || 15;
                          setForm({ ...form, journeySteps: next });
                        }}
                        className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 9: Media & Gallery */}
        {activeStep === 9 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <PackageMediaUploader
                label={isAr ? "صورة غلاف البطاقة (Card Cover Media) *" : "Card Cover Media (Image/Video) *"}
                value={form.coverMediaUrl}
                onChange={(url) => setForm({ ...form, coverMediaUrl: url })}
                mediaType="IMAGE"
                context="packages/cover"
                recommendedSize="Recommended: 1200x800px (16:10 aspect ratio)"
                isAr={isAr}
              />

              <PackageMediaUploader
                label={isAr ? "خلفية رأس صفحة الباقة (Microsite Hero Media)" : "Microsite Hero Media (Image/Video)"}
                value={form.heroMediaUrl}
                onChange={(url) => setForm({ ...form, heroMediaUrl: url })}
                mediaType={form.heroMediaType}
                onMediaTypeChange={(type) => setForm({ ...form, heroMediaType: type })}
                context="packages/hero"
                recommendedSize="Recommended: 1920x1080px (16:9 banner or MP4 video)"
                isAr={isAr}
              />
            </div>

            {/* Brochure URL */}
            <div className="pt-4 border-t border-[var(--border-default)]">
              <PackageMediaUploader
                label={isAr ? "ملف كتيب الباقة (PDF Brochure Upload)" : "Brochure PDF Download Attachment"}
                value={form.brochureUrl}
                onChange={(url) => setForm({ ...form, brochureUrl: url })}
                accept="application/pdf,application/msword,application/*"
                placeholder="https://.../brochure.pdf"
                recommendedSize="Upload PDF brochure for parents/schools to download"
                context="packages/brochures"
                isAr={isAr}
              />
            </div>

            {/* Gallery Media Repeater */}
            <div className="pt-6 border-t border-[var(--border-default)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    {isAr ? "معرض الصور والفيديوهات الإضافية للباقة (Media & Video Gallery)" : "Package Photo & Video Gallery"}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isAr ? "أضف لقطات وصور وفيديوهات حية من الفعاليات وقاعات الألعاب للزوار." : "Add extra high-resolution photos and video reels to showcase the experience on the microsite."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {form.attractionId && (
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={importAttractionGallery}
                      className="gap-1.5 text-xs border-[var(--color-primary)]/40 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                    >
                      <Building className="w-3.5 h-3.5" />
                      {isAr ? "استيراد من صور الوجهة" : "Import from Attraction"}
                    </Button>
                  )}
                  <Button size="sm" type="button" onClick={addGalleryItem} className="gap-1.5 text-xs bg-[var(--color-primary)] text-white">
                    <Plus className="w-3.5 h-3.5" />
                    {isAr ? "إضافة عنصر جديد" : "Add Media Item"}
                  </Button>
                </div>
              </div>

              {form.gallery.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] space-y-2">
                  <ImageIcon className="w-8 h-8 mx-auto text-[var(--text-tertiary)]" />
                  <p className="text-xs font-bold text-[var(--text-secondary)]">
                    {isAr ? "لم تتم إضافة صور أو فيديوهات للمعرض بعد" : "No gallery media items added yet"}
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)] max-w-sm mx-auto">
                    {isAr ? "انقر فوق 'إضافة عنصر جديد' أو استورد وسائط الوجهة المحددة تلقائياً." : "Click 'Add Media Item' or import photos directly from the linked attraction venue."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {form.gallery.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                            #{idx + 1}
                          </span>
                          <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase">
                            {item.type === "VIDEO" ? (isAr ? "فيديو" : "Video") : (isAr ? "صورة" : "Image")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveGalleryItem(idx, "up")}
                            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === form.gallery.length - 1}
                            onClick={() => moveGalleryItem(idx, "down")}
                            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeGalleryItem(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer ms-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Type Switcher */}
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Format:</label>
                        <div className="inline-flex rounded-xl p-0.5 bg-[var(--surface-default)] border border-[var(--border-default)]">
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...form.gallery];
                              next[idx].type = "IMAGE";
                              setForm({ ...form, gallery: next });
                            }}
                            className={cn(
                              "px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all",
                              item.type !== "VIDEO" ? "bg-[var(--color-primary)] text-white" : "text-[var(--text-secondary)]"
                            )}
                          >
                            Image
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...form.gallery];
                              next[idx].type = "VIDEO";
                              setForm({ ...form, gallery: next });
                            }}
                            className={cn(
                              "px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all",
                              item.type === "VIDEO" ? "bg-purple-600 text-white" : "text-[var(--text-secondary)]"
                            )}
                          >
                            Video
                          </button>
                        </div>
                      </div>

                      <PackageMediaUploader
                        label={item.type === "VIDEO" ? "Video URL (MP4, YouTube, Vimeo)" : "Media Image URL"}
                        value={item.url || ""}
                        mediaType={item.type === "VIDEO" ? "VIDEO" : "IMAGE"}
                        onChange={(url) => {
                          const next = [...form.gallery];
                          next[idx].url = url;
                          setForm({ ...form, gallery: next });
                        }}
                        context="packages/gallery"
                        isAr={isAr}
                      />

                      {item.type === "VIDEO" && (
                        <div>
                          <label className="text-[10px] text-[var(--text-secondary)] block mb-1">
                            {isAr ? "صورة مصغرة للفيديو (Thumbnail)" : "Video Thumbnail Cover"}
                          </label>
                          <input
                            type="text"
                            value={item.thumbnail || ""}
                            onChange={(e) => {
                              const next = [...form.gallery];
                              next[idx].thumbnail = e.target.value;
                              setForm({ ...form, gallery: next });
                            }}
                            placeholder="https://.../thumb.jpg"
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Title / Caption (EN)</label>
                          <input
                            type="text"
                            value={item.captionEn || ""}
                            onChange={(e) => {
                              const next = [...form.gallery];
                              next[idx].captionEn = e.target.value;
                              setForm({ ...form, gallery: next });
                            }}
                            placeholder="e.g. Trampoline slam dunk area"
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Title / Caption (AR)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={item.captionAr || ""}
                            onChange={(e) => {
                              const next = [...form.gallery];
                              next[idx].captionAr = e.target.value;
                              setForm({ ...form, gallery: next });
                            }}
                            placeholder="مثال: منطقة كرة السلة الحركية"
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] font-arabic text-right"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 10: SEO & Metadata */}
        {activeStep === 10 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  Meta Title (English)
                </label>
                <input
                  type="text"
                  value={form.metaTitleEn}
                  onChange={(e) => setForm({ ...form, metaTitleEn: e.target.value })}
                  placeholder={form.titleEn || "Custom SEO Title"}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  Meta Title (Arabic)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={form.metaTitleAr}
                  onChange={(e) => setForm({ ...form, metaTitleAr: e.target.value })}
                  placeholder={form.titleAr || "عنوان الميتا بالعربية"}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right"
                />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  Meta Description (English)
                </label>
                <textarea
                  rows={2}
                  value={form.metaDescriptionEn}
                  onChange={(e) => setForm({ ...form, metaDescriptionEn: e.target.value })}
                  placeholder={form.shortDescriptionEn || "150-160 character Google search description"}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 11: Validation & Publish */}
        {activeStep === 11 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                {isAr ? "جاهز لنشر وتفعيل الباقة" : "Ready to Publish Experience Package"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mt-1 leading-relaxed">
                {isAr
                  ? "تحقق من اكتمال البيانات قبل النشر لجعل الباقة مرئية وفورية في دليل الباقات العام."
                  : "Review settings before publishing to ensure seamless public discovery and instant inquiry routing."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <label className="flex items-center gap-2.5 cursor-pointer bg-[var(--surface-subtle)] border border-[var(--border-default)] px-5 py-3 rounded-2xl shadow-xs">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked, status: e.target.checked ? "PUBLISHED" : "DRAFT" })}
                  className="rounded text-[var(--color-primary)] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {isAr ? "نشر وجعل الباقة نشطة علناً" : "Publish Package Publicly"}
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer bg-[var(--surface-subtle)] border border-[var(--border-default)] px-5 py-3 rounded-2xl shadow-xs">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded text-[var(--color-primary)] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {isAr ? "تمييز في الصفحة الرئيسية" : "Featured on Marketplace"}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-6 border-t border-[var(--border-level-2)] bg-[var(--surface-hover)] flex items-center justify-between">
        {activeStep > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep((prev) => prev - 1)}
            className="text-xs gap-1.5"
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
            {isAr ? "السابق" : "Previous Step"}
          </Button>
        ) : (
          <div />
        )}

        {activeStep < WORKFLOW_STEPS.length - 1 ? (
          <Button
            size="sm"
            onClick={() => setActiveStep((prev) => prev + 1)}
            className="text-xs gap-1.5 bg-[var(--color-primary)] hover:opacity-90 text-white font-bold px-6"
          >
            {isAr ? "الخطوة التالية" : "Next Step"}
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ ونشر الباقة" : "Save & Publish")}
          </Button>
        )}
      </div>
    </div>
  );
}
