"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Plus, Search, Edit2, Trash2, Copy, LayoutTemplate, 
  Package, ArrowRight, Save, AlertCircle, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MediaUploader } from "@/components/ui/MediaUploader"
import { cn } from "@/lib/utils"
import {
  DashboardPageShell,
  DashboardPageHeader,
  AdminButton,
  DashboardLoadingState,
} from "@/components/dashboard/ui"
import { useLocale } from "@/components/layout/LocaleProvider"
import { localizeHref } from "@/lib/url-helper"

export function PackagesManager() {
  let locale: 'en' | 'ar' = 'en'
  let dir: 'ltr' | 'rtl' = 'ltr'
  try {
    const localeCtx = useLocale()
    if (localeCtx) {
      locale = (localeCtx.locale as 'en' | 'ar') || 'en'
      dir = localeCtx.dir || (locale === 'ar' ? 'rtl' : 'ltr')
    }
  } catch {
    // Fallback
  }
  const isAr = locale === 'ar'

  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const fetchPackages = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/b2c/packages?all=true", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch packages")
      const json = await res.json()
      setPackages(Array.isArray(json.data) ? json.data : [])
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Failed to load packages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch("/api/b2c/packages?all=true", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch packages")
        const json = await res.json()
        if (active) setPackages(Array.isArray(json.data) ? json.data : [])
      } catch (e: any) {
        if (active) {
          console.error(e)
          setError(e?.message || "Failed to load packages")
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذه الباقة؟" : "Are you sure you want to delete this package?")) return
    try {
      const res = await fetch(`/api/b2c/packages/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      fetchPackages()
    } catch (_e) {
      alert(isAr ? "فشل حذف الباقة" : "Failed to delete package")
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/b2c/packages/${id}`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to duplicate")
      fetchPackages()
    } catch (_e) {
      alert(isAr ? "فشل تكرار الباقة" : "Failed to duplicate package")
    }
  }

  const filtered = packages.filter(item => {
    const matchesSearch = 
      (item.titleEn || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.titleAr || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.slug || "").toLowerCase().includes(search.toLowerCase())
    const matchesCat = categoryFilter === "ALL" || item.category === categoryFilter
    return matchesSearch && matchesCat
  })

  if (editingItem || isCreating) {
    return (
      <PackageEditor
        initialData={editingItem}
        locale={locale}
        dir={dir}
        onClose={() => { setEditingItem(null); setIsCreating(false); }}
        onSave={() => { setEditingItem(null); setIsCreating(false); fetchPackages(); }}
      />
    )
  }

  const categories = [
    { id: "ALL", labelEn: "All Categories", labelAr: "جميع الفئات" },
    { id: "BIRTHDAY", labelEn: "Birthday", labelAr: "أعياد الميلاد" },
    { id: "GROUP", labelEn: "Group", labelAr: "المجموعات" },
    { id: "SCHOOL", labelEn: "School", labelAr: "المدارس" },
    { id: "CORPORATE", labelEn: "Corporate", labelAr: "الشركات" },
    { id: "PRIVATE_EVENT", labelEn: "Private Event", labelAr: "الفعاليات الخاصة" },
  ]

  return (
    <DashboardPageShell variant="wide">
      <div dir={dir} className="space-y-6">
        {/* Header */}
        <DashboardPageHeader
          title={isAr ? "مدير الباقات وأعياد الميلاد" : "Packages & Birthdays Manager"}
          description={
            isAr
              ? "إنشاء وتعديل وإدارة باقات أعياد الميلاد والشركات والرحلات المدرسية والأسعار والمشتملات."
              : "Create, edit, duplicate, and manage bilingual package records for birthdays, groups, schools, and corporate events."
          }
          breadcrumbs={[
            { label: isAr ? "محتوى الأفراد" : "B2C Content", href: "/dashboard/b2c/attractions" },
            { label: isAr ? "الباقات وأعياد الميلاد" : "Packages & Birthdays" },
          ]}
          badge={{ label: isAr ? `${packages.length} باقة` : `${packages.length} Packages`, variant: "purple" }}
          previewUrl="/b2c/packages"
          primaryAction={{
            label: isAr ? "إضافة باقة جديدة" : "Create New Package",
            onClick: () => setIsCreating(true),
            icon: <Plus className="w-4 h-4" />,
          }}
          secondaryAction={
            <Link href={localizeHref("/dashboard/b2c/packages-page", locale)}>
              <AdminButton variant="outline" size="sm" leftIcon={<LayoutTemplate className="w-4 h-4" />}>
                {isAr ? "تحرير تصميم ووسائط الصفحة" : "Edit Page Layout & Media"}
              </AdminButton>
            </Link>
          }
        />

        {/* Reciprocal Handoff Banner */}
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutTemplate className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                {isAr ? "تصميم بنر الصفحة العامة والوسائط وبيانات SEO" : "Packages Page Layout, Hero Media & SEO"}
              </h4>
              <p className="text-xs text-text-secondary mt-0.5">
                {isAr 
                  ? "يتم تخصيص بنر هيرو الصفحة العامة والعناوين وأزرار الحجز وشارات الفعاليات في محرر صفحة الباقات."
                  : "Public landing page layout, universal hero/footer media, headlines, CTAs, and SEO metadata are configured in the Packages Page Editor."}
              </p>
            </div>
          </div>
          <Link href={localizeHref("/dashboard/b2c/packages-page", locale)}>
            <AdminButton variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />}>
              {isAr ? "محرر صفحة الباقات" : "Go to Page Editor"}
            </AdminButton>
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-surface-subtle rounded-xl border border-border-default overflow-x-auto">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer",
                  categoryFilter === c.id ? "bg-surface-default text-text-primary shadow-sm" : "text-text-secondary"
                )}
              >
                {isAr ? c.labelAr : c.labelEn}
              </button>
            ))}
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input 
              type="text" 
              placeholder={isAr ? "البحث عن باقة..." : "Search package title..."} 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full ps-9 pe-4 py-2 text-xs bg-surface-default border border-border-default rounded-xl focus:outline-none focus:border-primary text-text-primary"
            />
          </div>
        </div>

        {/* Loading / Error / Grid State */}
        {loading ? (
          <DashboardLoadingState title={isAr ? "جاري تحميل الباقات..." : "Loading Packages..."} type="skeleton" />
        ) : error ? (
          <div className="p-8 text-center bg-surface-default border border-border-default rounded-2xl space-y-4">
            <AlertCircle className="w-10 h-10 text-error mx-auto" />
            <h3 className="text-lg font-bold text-text-primary">{isAr ? "فشل تحميل الباقات" : "Failed to load packages"}</h3>
            <p className="text-sm text-text-secondary">{error}</p>
            <AdminButton onClick={fetchPackages} variant="primary" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />}>
              {isAr ? "إعادة المحاولة" : "Retry"}
            </AdminButton>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-surface-default rounded-2xl border border-border-default space-y-3">
            <Package className="w-10 h-10 mx-auto text-text-tertiary opacity-40" />
            <p className="text-base font-bold text-text-primary">{isAr ? "لم يتم العثور على باقات" : "No packages found"}</p>
            <p className="text-xs text-text-secondary">
              {isAr ? "انقر على 'إضافة باقة جديدة' لإنشاء أول باقة." : "Click 'Create New Package' to add your first package record."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <div key={item.id} className="bg-surface-default rounded-2xl border border-border-default p-5 hover:border-primary transition-all shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      {isAr ? (categories.find(c => c.id === item.category)?.labelAr || item.category) : item.category}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider",
                      item.isPublished ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500"
                    )}>
                      {item.isPublished ? (isAr ? "منشور" : "PUBLISHED") : (isAr ? "مسودة" : "DRAFT")}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-text-primary line-clamp-1">
                    {isAr && item.titleAr ? item.titleAr : item.titleEn}
                  </h3>
                  {isAr && item.titleEn && (
                    <p className="text-xs text-text-secondary font-mono mt-0.5 line-clamp-1">
                      /{item.slug}
                    </p>
                  )}

                  <p className="text-xs text-text-secondary line-clamp-2 mt-2">
                    {isAr ? (item.shortDescriptionAr || item.shortDescriptionEn || "بدون وصف...") : (item.shortDescriptionEn || "No description...")}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-default/60 text-xs font-mono font-bold">
                    <span className="text-text-secondary">{item.minGuests}-{item.maxGuests} {isAr ? "ضيوف" : "Guests"}</span>
                    <span className="text-primary">{item.startingPrice} {item.currency || 'QAR'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-default text-xs">
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setEditingItem(item)} className="gap-1 rounded-xl text-xs">
                      <Edit2 className="w-3.5 h-3.5" /> {isAr ? "تعديل" : "Edit"}
                    </Button>
                    <button onClick={() => handleDuplicate(item.id)} className="p-2 text-purple-500 hover:bg-purple-500/10 rounded-lg cursor-pointer" title={isAr ? "نسخ الباقة" : "Duplicate Package"}>
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer" title={isAr ? "حذف الباقة" : "Delete Package"}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardPageShell>
  )
}

function PackageEditor({ 
  initialData, 
  locale,
  dir,
  onClose, 
  onSave 
}: { 
  initialData?: any; 
  locale: 'en' | 'ar';
  dir: 'ltr' | 'rtl';
  onClose: () => void; 
  onSave: () => void;
}) {
  const isAr = locale === 'ar'
  const isEditing = !!initialData?.id
  const [isSaving, setIsSaving] = useState(false)

  const [titleEn, setTitleEn] = useState(initialData?.titleEn || "")
  const [titleAr, setTitleAr] = useState(initialData?.titleAr || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [category, setCategory] = useState(initialData?.category || "BIRTHDAY")
  const [startingPrice, setStartingPrice] = useState(initialData?.startingPrice || 1500)
  const [minGuests, setMinGuests] = useState(initialData?.minGuests || 10)
  const [maxGuests, setMaxGuests] = useState(initialData?.maxGuests || 40)
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes || 120)
  const [shortDescriptionEn, setShortDescriptionEn] = useState(initialData?.shortDescriptionEn || "")
  const [shortDescriptionAr, setShortDescriptionAr] = useState(initialData?.shortDescriptionAr || "")
  const [coverMediaUrl, setCoverMediaUrl] = useState(initialData?.coverMediaUrl || "")
  const [heroMediaUrl, setHeroMediaUrl] = useState(initialData?.heroMediaUrl || "")
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true)
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)

  // Tiers JSON Repeater
  const [tiers] = useState<any[]>(initialData?.tiers || [
    { id: "t1", nameEn: "Essential Tier", nameAr: "المستوى الأساسي", price: 1500, guestCount: 10, extraGuestPrice: 100, includedItems: ["Attraction Access", "Party Room"] }
  ])

  // Inclusions JSON Repeater
  const [inclusions] = useState<any[]>(initialData?.inclusions || [
    { id: "i1", titleEn: "Attraction Access", titleAr: "دخول الفعالية", icon: "Sparkles", status: "INCLUDED" }
  ])

  const handleSave = async () => {
    if (!titleEn.trim()) {
      alert(isAr ? "العنوان بالإنجليزية مطلوب" : "English Title is required")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        titleEn,
        titleAr: titleAr || titleEn,
        slug: slug.trim() || titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category,
        startingPrice: parseFloat(startingPrice.toString()) || 0,
        minGuests: parseInt(minGuests.toString()) || 10,
        maxGuests: parseInt(maxGuests.toString()) || 40,
        durationMinutes: parseInt(durationMinutes.toString()) || 120,
        shortDescriptionEn,
        shortDescriptionAr,
        coverMediaUrl,
        heroMediaUrl,
        isPublished,
        isFeatured,
        tiers,
        inclusions
      }

      const url = isEditing ? `/api/b2c/packages/${initialData.id}` : "/api/b2c/packages"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Failed to save package")
      onSave()
    } catch (err: any) {
      alert(err.message || (isAr ? "فشل حفظ الباقة" : "Failed to save"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div dir={dir} className="bg-surface-default rounded-2xl border border-border-default p-6 max-w-4xl mx-auto shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-border-default pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary">
            {isEditing ? (isAr ? `تعديل الباقة: ${titleAr || titleEn}` : `Edit Package: ${titleEn}`) : (isAr ? "إنشاء باقة جديدة" : "Create New Package")}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {isAr 
              ? "تحديد تفاصيل الباقة الفردية، المستويات، المشتملات، والأسعار." 
              : "Configure package record details, tiers, inclusions, and pricing."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
            {isSaving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ الباقة" : "Save Package")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">
                {isAr ? "العنوان (بالإنجليزية) *" : "Title (English) *"}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                className="w-full bg-surface-subtle border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">
                {isAr ? "العنوان (بالعربية)" : "Title (Arabic)"}
              </label>
              <input
                type="text"
                dir="rtl"
                value={titleAr}
                onChange={e => setTitleAr(e.target.value)}
                className="w-full bg-surface-subtle border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1">
              {isAr ? "المعرف الفريد (Slug)" : "Package Slug"}
            </label>
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="e.g. inflatarun-vip-birthday"
              className="w-full bg-surface-subtle border border-border-default rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1">
              {isAr ? "الملخص القصير (بالإنجليزية)" : "Short Summary (English)"}
            </label>
            <textarea
              rows={2}
              value={shortDescriptionEn}
              onChange={e => setShortDescriptionEn(e.target.value)}
              className="w-full bg-surface-subtle border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1">
              {isAr ? "الملخص القصير (بالعربية)" : "Short Summary (Arabic)"}
            </label>
            <textarea
              rows={2}
              dir="rtl"
              value={shortDescriptionAr}
              onChange={e => setShortDescriptionAr(e.target.value)}
              className="w-full bg-surface-subtle border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">
                {isAr ? "السعر المبدئي (ريال)" : "Starting Price (QAR)"}
              </label>
              <input
                type="number"
                value={startingPrice}
                onChange={e => setStartingPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-subtle border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">
                {isAr ? "أدنى عدد ضيوف" : "Min Guests"}
              </label>
              <input
                type="number"
                value={minGuests}
                onChange={e => setMinGuests(parseInt(e.target.value) || 10)}
                className="w-full bg-surface-subtle border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">
                {isAr ? "أقصى عدد ضيوف" : "Max Guests"}
              </label>
              <input
                type="number"
                value={maxGuests}
                onChange={e => setMaxGuests(parseInt(e.target.value) || 40)}
                className="w-full bg-surface-subtle border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1">
              {isAr ? "المدة المقدرة (بالدقائق)" : "Duration (Minutes)"}
            </label>
            <input
              type="number"
              value={durationMinutes}
              onChange={e => setDurationMinutes(parseInt(e.target.value) || 120)}
              className="w-full bg-surface-subtle border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary font-mono"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1">
              {isAr ? "فئة الباقة" : "Package Category"}
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-surface-subtle border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary"
            >
              <option value="BIRTHDAY">{isAr ? "أعياد الميلاد" : "Birthday"}</option>
              <option value="GROUP">{isAr ? "المجموعات" : "Group"}</option>
              <option value="SCHOOL">{isAr ? "المدارس والحضانات" : "School & Nursery"}</option>
              <option value="CORPORATE">{isAr ? "الشركات وبناء الفرق" : "Corporate & Team Building"}</option>
              <option value="PRIVATE_EVENT">{isAr ? "الفعاليات الخاصة" : "Private Event"}</option>
              <option value="CUSTOM">{isAr ? "تجربة مخصصة" : "Custom Experience"}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1">
              {isAr ? "رابط صورة الغلاف" : "Cover Image URL"}
            </label>
            <MediaUploader value={coverMediaUrl} onChange={setCoverMediaUrl} accept="image/*" />
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1">
              {isAr ? "رابط وسائط الهيرو للباقة" : "Package Hero Media URL"}
            </label>
            <MediaUploader value={heroMediaUrl} onChange={setHeroMediaUrl} accept="image/*" />
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="rounded text-purple-600" />
              <span className="text-xs font-bold text-text-primary">{isAr ? "منشور للعامة" : "Published Publicly"}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="rounded text-purple-600" />
              <span className="text-xs font-bold text-text-primary">{isAr ? "مميز في الصفحة الرئيسية" : "Featured on Homepage"}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
