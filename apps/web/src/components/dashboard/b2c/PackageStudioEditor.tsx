"use client"

import { useState, useEffect } from "react"
import { 
  ArrowLeft, ArrowRight, Save, Eye, Check, AlertCircle, 
  Trash2, Plus, Building, Sparkles, DollarSign, Calendar,
  Users, Layers, ShieldCheck, Tag, HelpCircle, FileText, Clock
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MediaUploader } from "@/components/ui/MediaUploader"
import { cn } from "@/lib/utils"

interface PackageStudioEditorProps {
  initialData?: any
  locale: "en" | "ar"
  dir: "ltr" | "rtl"
  onClose: () => void
  onSave: () => void
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
  { id: "media", labelEn: "10. Media & Gallery", labelAr: "١٠. الوسائط", icon: Eye },
  { id: "seo", labelEn: "11. SEO & Metadata", labelAr: "١١. محركات البحث", icon: Tag },
  { id: "publish", labelEn: "12. Validation & Publish", labelAr: "١٢. النشر", icon: ShieldCheck }
]

export function PackageStudioEditor({
  initialData,
  locale,
  dir,
  onClose,
  onSave
}: PackageStudioEditorProps) {
  const isAr = locale === "ar"
  const isEdit = Boolean(initialData?.id)

  const [activeStep, setActiveStep] = useState(0)
  const [categories, setCategories] = useState<any[]>([])
  const [attractions, setAttractions] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

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
    heroMediaType: initialData?.heroMediaType || "IMAGE",
    brochureUrl: initialData?.brochureUrl || "",
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
    metaTitleEn: initialData?.seo?.metaTitleEn || "",
    metaTitleAr: initialData?.seo?.metaTitleAr || "",
    metaDescriptionEn: initialData?.seo?.metaDescriptionEn || "",
    metaDescriptionAr: initialData?.seo?.metaDescriptionAr || ""
  })

  // Fetch helper lists (Categories, Attractions, Locations)
  useEffect(() => {
    fetch("/api/b2c/package-categories")
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json.data)) setCategories(json.data)
      })
      .catch(console.error)

    fetch("/api/b2c/attractions?all=true")
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json.data)) setAttractions(json.data)
      })
      .catch(console.error)

    fetch("/api/b2c/locations")
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json.data)) setLocations(json.data)
      })
      .catch(console.error)
  }, [])

  // Auto-generate slug from English title if empty
  const handleTitleEnChange = (val: string) => {
    setForm(prev => ({
      ...prev,
      titleEn: val,
      slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    }))
  }

  // Tier Management
  const addTier = () => {
    setForm(prev => ({
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
          includedItems: ["Full Park Access", "Dedicated Host"]
        }
      ]
    }))
  }

  const removeTier = (index: number) => {
    setForm(prev => ({
      ...prev,
      tiers: prev.tiers.filter((_: any, i: number) => i !== index)
    }))
  }

  // Inclusions Management
  const addInclusion = () => {
    setForm(prev => ({
      ...prev,
      inclusions: [
        ...prev.inclusions,
        {
          id: `inc-${Date.now()}`,
          titleEn: "Activity Access",
          titleAr: "دخول الألعاب",
          icon: "Sparkles",
          status: "INCLUDED"
        }
      ]
    }))
  }

  const removeInclusion = (index: number) => {
    setForm(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_: any, i: number) => i !== index)
    }))
  }

  // Add-on Management
  const addAddon = () => {
    setForm(prev => ({
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
          maxQty: 1
        }
      ]
    }))
  }

  const removeAddon = (index: number) => {
    setForm(prev => ({
      ...prev,
      addOns: prev.addOns.filter((_: any, i: number) => i !== index)
    }))
  }

  // Completion calculation
  const calculateCompletion = () => {
    let completed = 0
    let total = 6
    if (form.titleEn) completed++
    if (form.titleAr) completed++
    if (form.startingPrice > 0) completed++
    if (form.inclusions.length > 0) completed++
    if (form.coverMediaUrl || form.heroMediaUrl) completed++
    if (form.shortDescriptionEn) completed++
    return Math.round((completed / total) * 100)
  }

  const completionPercent = calculateCompletion()

  // Save handler
  const handleSave = async () => {
    if (!form.titleEn) {
      setError(isAr ? "يرجى كتابة عنوان الباقة بالإنجليزية" : "English title is required")
      setActiveStep(1)
      return
    }

    setSaving(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const payload = {
        ...form,
        startingPrice: parseFloat(form.startingPrice as any) || 0,
        internalCost: form.internalCost ? parseFloat(form.internalCost as any) : null,
        estimatedMargin: form.estimatedMargin ? parseFloat(form.estimatedMargin as any) : null,
        seo: {
          metaTitleEn: form.metaTitleEn,
          metaTitleAr: form.metaTitleAr,
          metaDescriptionEn: form.metaDescriptionEn,
          metaDescriptionAr: form.metaDescriptionAr
        }
      }

      const url = isEdit ? `/api/b2c/packages/${initialData.id}` : "/api/b2c/packages"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save package")
      }

      setSuccessMsg(isAr ? "تم حفظ الباقة بنجاح!" : "Package saved successfully!")
      setTimeout(() => {
        onSave()
      }, 800)
    } catch (e: any) {
      console.error(e)
      setError(e.message || "Failed to save package")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-2xl overflow-hidden" dir={dir}>
      {/* Top Action Header */}
      <div className="p-6 border-b border-[var(--border-level-2)] bg-[var(--surface-hover)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
            {isAr ? "رجوع للقائمة" : "Back to Catalogue"}
          </Button>
          <div>
            <h2 className="text-lg font-black font-display text-[var(--text-primary)]">
              {isEdit 
                ? (isAr ? `تعديل الباقة: ${form.titleAr || form.titleEn}` : `Edit Package: ${form.titleEn}`)
                : (isAr ? "إنشاء باقة جديدة" : "Create New Experience Package")
              }
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono font-bold text-emerald-400">
                {completionPercent}% {isAr ? "مكتمل" : "Complete"}
              </span>
              <span className="text-[11px] text-slate-500">•</span>
              <span className="text-[11px] font-mono text-slate-400">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300 hover:text-white"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isAr ? "معاينة الصفحة" : "Live Preview"}</span>
            </a>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            <Save className="w-4 h-4" />
            {saving ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ التغييرات" : "Save Package")}
          </Button>
        </div>
      </div>

      {/* Progress & Section Tabs */}
      <div className="flex items-center gap-1.5 p-2 overflow-x-auto border-b border-[var(--border-level-2)] bg-slate-950/50 scrollbar-none">
        {WORKFLOW_STEPS.map((st, idx) => {
          const Icon = st.icon
          const isActive = activeStep === idx
          return (
            <button
              key={st.id}
              onClick={() => setActiveStep(idx)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                isActive
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isAr ? st.labelAr : st.labelEn}</span>
            </button>
          )
        })}
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="m-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="m-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Steps Body */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Step 0: Package Type */}
        {activeStep === 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                {isAr ? "نوع الباقة والغرض الأساسي" : "Package Type & Operating Model"}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? "حدد نموذج الحجز لتهيئة الإعدادات الافتراضية المناسبة." : "Select the operating model to configure appropriate workflow defaults."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: "READY_TO_BOOK", labelEn: "Ready to Book Package", labelAr: "باقة جاهزة للحجز الفوري", descEn: "Fixed price and immediate date booking" },
                { id: "REQUEST_A_QUOTE", labelEn: "Custom Quote Required", labelAr: "باقة تتطلب عرض سعر", descEn: "Tailored scope, guest count & venue sizing" },
                { id: "SEASONAL", labelEn: "Seasonal Programme / Camp", labelAr: "برنامج موسمي أو مخيم", descEn: "Holiday passes and recurring multi-day courses" },
                { id: "CORPORATE", labelEn: "Corporate Team Challenge", labelAr: "تحدي وباقة للشركات", descEn: "Team building, tournaments & company buyouts" },
                { id: "SCHOOL", labelEn: "School / Educational Trip", labelAr: "رحلة مدرسية تعليمية", descEn: "Curriculum workshops & student passes" },
                { id: "CUSTOM_TEMPLATE", labelEn: "Reusable Blank Template", labelAr: "قالب مخصص فارغ", descEn: "Save as template for future fast creation" }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, packageType: t.id })}
                  className={cn(
                    "p-5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2",
                    form.packageType === t.id
                      ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow ring-1 ring-emerald-500/30"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800"
                  )}
                >
                  <div className="text-sm font-bold text-white">{isAr ? t.labelAr : t.labelEn}</div>
                  <div className="text-xs text-slate-400">{t.descEn}</div>
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
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "عنوان الباقة (الإنجليزية) *" : "Package Title (English) *"}
                </label>
                <input
                  type="text"
                  required
                  value={form.titleEn}
                  onChange={e => handleTitleEnChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. InflataRUN VIP Birthday Adventure"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "عنوان الباقة (العربية)" : "Package Title (Arabic)"}
                </label>
                <input
                  type="text"
                  value={form.titleAr}
                  onChange={e => setForm({ ...form, titleAr: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="مثال: مغامرة عيد الميلاد VIP في إنفلاتا ران"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "الاسم المستعار في الرابط (Slug) *" : "URL Slug *"}
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  placeholder="inflatarun-vip-birthday"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "الفئة الرئيسية (Category) *" : "Category Taxonomy *"}
                </label>
                <select
                  value={form.categoryId || form.category}
                  onChange={e => {
                    const selectedCat = categories.find(c => c.id === e.target.value || c.slug === e.target.value)
                    setForm({
                      ...form,
                      categoryId: selectedCat?.id || e.target.value,
                      category: selectedCat?.slug?.toUpperCase() || e.target.value.toUpperCase()
                    })
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="BIRTHDAY">Celebrate / أعياد الميلاد</option>
                  <option value="SCHOOL">Learn & Explore / المدارس والتعليم</option>
                  <option value="GROUP">Play Together / المجموعات</option>
                  <option value="CORPORATE">Corporate / الشركات</option>
                  <option value="EVENTS">Events & Buyouts / الفعاليات</option>
                  <option value="SEASONAL">Seasonal / الباقات الموسمية</option>
                  <option value="CUSTOM">Custom / تجارب حسب الطلب</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn} ({c.nameAr})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "الشعار الترويجي القصير (EN / AR)" : "Short Tagline (EN / AR)"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.taglineEn}
                    onChange={e => setForm({ ...form, taglineEn: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Bounce, race, and celebrate across Qatar's largest inflatables"
                  />
                  <input
                    type="text"
                    value={form.taglineAr}
                    onChange={e => setForm({ ...form, taglineAr: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="اقفز وسابق واحتفل في أكبر مدينة ألعاب مطاطية بقطر"
                  />
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "الوصف المختصر للبطاقة (EN / AR)" : "Card Short Description (EN / AR)"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <textarea
                    rows={2}
                    value={form.shortDescriptionEn}
                    onChange={e => setForm({ ...form, shortDescriptionEn: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                    placeholder="All-inclusive VIP inflatable birthday party with private party room, dedicated host & cake ceremony."
                  />
                  <textarea
                    rows={2}
                    value={form.shortDescriptionAr}
                    onChange={e => setForm({ ...form, shortDescriptionAr: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                    placeholder="حفل عيد ميلاد VIP متكامل يشمل غرفة خاصة، مضيف حفل، وجبات، ومراسم الكعكة."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Audience */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">
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
                { id: "COMMUNITY", label: "Community" }
              ].map(aud => {
                const selected = form.audienceTypes.includes(aud.id)
                return (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => {
                      const next = selected 
                        ? form.audienceTypes.filter((a: string) => a !== aud.id)
                        : [...form.audienceTypes, aud.id]
                      setForm({ ...form, audienceTypes: next })
                    }}
                    className={cn(
                      "p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between",
                      selected ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-400"
                    )}
                  >
                    <span>{aud.label}</span>
                    {selected && <Check className="w-3.5 h-3.5" />}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "الحد الأدنى للعمر" : "Minimum Age"}
                </label>
                <input
                  type="number"
                  value={form.minAge}
                  onChange={e => setForm({ ...form, minAge: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "الحد الأعلى للعمر" : "Maximum Age"}
                </label>
                <input
                  type="number"
                  value={form.maxAge}
                  onChange={e => setForm({ ...form, maxAge: parseInt(e.target.value) || 99 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="childrenAllowed"
                  checked={form.childrenAllowed}
                  onChange={e => setForm({ ...form, childrenAllowed: e.target.checked })}
                  className="rounded text-emerald-500"
                />
                <label htmlFor="childrenAllowed" className="text-xs font-semibold text-slate-300">
                  {isAr ? "الأطفال مسموح لهم" : "Children Allowed"}
                </label>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="adultsAllowed"
                  checked={form.adultsAllowed}
                  onChange={e => setForm({ ...form, adultsAllowed: e.target.checked })}
                  className="rounded text-emerald-500"
                />
                <label htmlFor="adultsAllowed" className="text-xs font-semibold text-slate-300">
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
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "المعلم الترفيهي الأساسي" : "Primary Attraction"}
                </label>
                <select
                  value={form.attractionId}
                  onChange={e => setForm({ ...form, attractionId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">{isAr ? "غير محدد / وجهات متعددة" : "None / Multi-Attraction"}</option>
                  {attractions.map(att => (
                    <option key={att.id} value={att.id}>
                      {att.nameEn} ({att.nameAr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "الموقع / الفرع الجغرافي" : "Venue / Location"}
                </label>
                <select
                  value={form.locationId}
                  onChange={e => setForm({ ...form, locationId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">{isAr ? "غير محدد / موقع العميل" : "None / Client Location"}</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.nameEn} ({loc.nameAr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "بيئة المكان" : "Environment Setting"}
                </label>
                <select
                  value={form.indoorOutdoor}
                  onChange={e => setForm({ ...form, indoorOutdoor: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "الحد الأدنى للضيوف *" : "Min Guests *"}
                </label>
                <input
                  type="number"
                  value={form.minGuests}
                  onChange={e => setForm({ ...form, minGuests: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "الحد الأقصى للضيوف *" : "Max Guests *"}
                </label>
                <input
                  type="number"
                  value={form.maxGuests}
                  onChange={e => setForm({ ...form, maxGuests: parseInt(e.target.value) || 100 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "مدة الفعالية (بالدقائق)" : "Duration (Minutes)"}
                </label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 60 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Inclusions */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? "الميزات والخدمات المشمولة في الباقة" : "Package Inclusions"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? "أضف الخدمات والامتيازات الأساسية المتضمنة مع هذه الباقة." : "Specify the core items, room access, hosts, and food included."}
                </p>
              </div>
              <Button size="sm" onClick={addInclusion} className="gap-1.5 text-xs bg-emerald-500 text-slate-950 font-bold">
                <Plus className="w-3.5 h-3.5" />
                {isAr ? "إضافة ميزة" : "Add Inclusion"}
              </Button>
            </div>

            <div className="space-y-3">
              {form.inclusions.map((inc: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={inc.titleEn}
                      onChange={e => {
                        const next = [...form.inclusions]
                        next[idx].titleEn = e.target.value
                        setForm({ ...form, inclusions: next })
                      }}
                      placeholder="Title in English"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={inc.titleAr || ""}
                      onChange={e => {
                        const next = [...form.inclusions]
                        next[idx].titleAr = e.target.value
                        setForm({ ...form, inclusions: next })
                      }}
                      placeholder="العنوان بالعربية"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeInclusion(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
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
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "السعر الأساسي (QAR) *" : "Starting / Base Price (QAR) *"}
                </label>
                <input
                  type="number"
                  value={form.startingPrice}
                  onChange={e => setForm({ ...form, startingPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "طريقة عرض السعر" : "Price Display Mode"}
                </label>
                <select
                  value={form.priceDisplayMode}
                  onChange={e => setForm({ ...form, priceDisplayMode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="STARTING_FROM">Starting From (يبدأ من)</option>
                  <option value="PER_GUEST">Per Guest / Child (لكل ضيف)</option>
                  <option value="FIXED">Fixed Total Price (سعر ثابت)</option>
                  <option value="PRICE_ON_REQUEST">Custom Quote / عند الطلب</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "التكلفة الداخلية (سري للمشرفين)" : "Internal Cost (Admin Confidential)"}
                </label>
                <input
                  type="number"
                  value={form.internalCost}
                  onChange={e => setForm({ ...form, internalCost: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Confidential cost"
                />
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isAr ? "فئات الأسعار المتعددة (Pricing Tiers)" : "Modular Pricing Tiers"}
                  </h4>
                  <p className="text-xs text-slate-400">
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
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Tier Name (EN)</label>
                      <input
                        type="text"
                        value={tier.nameEn}
                        onChange={e => {
                          const next = [...form.tiers]
                          next[idx].nameEn = e.target.value
                          setForm({ ...form, tiers: next })
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Price (QAR)</label>
                      <input
                        type="number"
                        value={tier.price}
                        onChange={e => {
                          const next = [...form.tiers]
                          next[idx].price = parseFloat(e.target.value) || 0
                          setForm({ ...form, tiers: next })
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Included Guests</label>
                      <input
                        type="number"
                        value={tier.guestCount || 10}
                        onChange={e => {
                          const next = [...form.tiers]
                          next[idx].guestCount = parseInt(e.target.value) || 10
                          setForm({ ...form, tiers: next })
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => removeTier(idx)}
                        className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                <h3 className="text-base font-bold text-white">
                  {isAr ? "الخدمات والإضافات الاختيارية (Add-ons)" : "Optional Package Add-Ons"}
                </h3>
              </div>
              <Button size="sm" onClick={addAddon} className="gap-1.5 text-xs bg-emerald-500 text-slate-950 font-bold">
                <Plus className="w-3.5 h-3.5" />
                {isAr ? "إضافة خدمة" : "Add Add-On"}
              </Button>
            </div>

            <div className="space-y-3">
              {form.addOns.map((add: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={add.titleEn}
                      onChange={e => {
                        const next = [...form.addOns]
                        next[idx].titleEn = e.target.value
                        setForm({ ...form, addOns: next })
                      }}
                      placeholder="Add-on title"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      value={add.price}
                      onChange={e => {
                        const next = [...form.addOns]
                        next[idx].price = parseFloat(e.target.value) || 0
                        setForm({ ...form, addOns: next })
                      }}
                      placeholder="Price"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-emerald-400"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={add.priceType || "FIXED"}
                      onChange={e => {
                        const next = [...form.addOns]
                        next[idx].priceType = e.target.value
                        setForm({ ...form, addOns: next })
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    >
                      <option value="FIXED">Fixed / سعر ثابت</option>
                      <option value="PER_GUEST">Per Guest / لكل ضيف</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeAddon(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 9: Media */}
        {activeStep === 9 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "صورة الغلاف للبطاقة (Cover Media URL) *" : "Card Cover Media URL *"}
                </label>
                <input
                  type="text"
                  value={form.coverMediaUrl}
                  onChange={e => setForm({ ...form, coverMediaUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? "خلفية صفحة الباقة (Hero Media URL)" : "Microsite Hero Media URL"}
                </label>
                <input
                  type="text"
                  value={form.heroMediaUrl}
                  onChange={e => setForm({ ...form, heroMediaUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 11: Validation & Publish */}
        {activeStep === 11 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                {isAr ? "جاهز لنشر وتفعيل الباقة" : "Ready to Publish Experience Package"}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                {isAr 
                  ? "تحقق من اكتمال البيانات قبل النشر لجعل الباقة مرئية وفورية في دليل الباقات العام."
                  : "Review settings before publishing to ensure seamless public discovery and instant inquiry routing."
                }
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={e => setForm({ ...form, isPublished: e.target.checked, status: e.target.checked ? "PUBLISHED" : "DRAFT" })}
                  className="rounded text-emerald-500"
                />
                <span className="text-xs font-bold text-white">
                  {isAr ? "نشر وجعل الباقة نشطة علناً" : "Publish Package Publicly"}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded text-emerald-500"
                />
                <span className="text-xs font-bold text-white">
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
            onClick={() => setActiveStep(prev => prev - 1)}
            className="text-xs gap-1.5"
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
            {isAr ? "السابق" : "Previous Step"}
          </Button>
        ) : <div />}

        {activeStep < WORKFLOW_STEPS.length - 1 ? (
          <Button
            size="sm"
            onClick={() => setActiveStep(prev => prev + 1)}
            className="text-xs gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
          >
            {isAr ? "الخطوة التالية" : "Next Step"}
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="text-xs gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6"
          >
            <Save className="w-4 h-4" />
            {saving ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ ونشر الباقة" : "Save & Publish")}
          </Button>
        )}
      </div>
    </div>
  )
}
