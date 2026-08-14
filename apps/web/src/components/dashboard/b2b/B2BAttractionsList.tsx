"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Plus,
  MapPin,
  Search,
  Edit3,
  Eye,
  EyeOff,
  Building2,
  Tag,
  Filter,
  Trash2,
  Globe,
  ExternalLink,
  Layers,
  Sparkles
} from "lucide-react"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { Badge } from "@/components/ui/Badge"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"
import { useLocale } from "@/components/layout/LocaleProvider"
import { localizeHref } from "@/lib/url-helper"

export type B2BAttractionItem = {
  id: string
  slug: string
  name: { en: string; ar: string }
  tagline: { en: string; ar: string } | null
  isPublished: boolean
  isFeatured: boolean
  isB2bVisible: boolean
  b2bCategory: string | null
  projectType: string | null
  clientName: string | null
  year: number | null
  venue: string
  temporalStatus: string
  updatedAt: string
  heroMediaUrl: string | null
  heroFallbackUrl: string | null
  heroThumbnailUrl: string | null
  heroMediaType: string | null
  _count: {
    pricing: number
    offers: number
    faqs: number
  }
}

export function B2BAttractionsList({ initialAttractions }: { initialAttractions: B2BAttractionItem[] }) {
  const router = useRouter()
  let locale: 'en' | 'ar' = 'en'
  let dir: 'ltr' | 'rtl' = 'ltr'
  try {
    const localeCtx = useLocale()
    if (localeCtx) {
      locale = (localeCtx.locale as 'en' | 'ar') || 'en'
      dir = localeCtx.dir || (locale === 'ar' ? 'rtl' : 'ltr')
    }
  } catch {
    // Fallback if outside provider
  }

  const isAr = locale === 'ar'
  const [search, setSearch] = useState("")
  const [attractions, setAttractions] = useState(initialAttractions || [])

  // Filter States
  const [temporalFilter, setTemporalFilter] = useState<string>("ALL")
  const [publicationFilter, setPublicationFilter] = useState<string>("ALL")
  const [visibilityFilter, setVisibilityFilter] = useState<string>("ALL")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [yearFilter, setYearFilter] = useState<string>("ALL")

  // Extract unique categories and years for dropdown options
  const categories = useMemo(() => {
    const set = new Set<string>()
    attractions.forEach(a => {
      if (a.b2bCategory) set.add(a.b2bCategory)
    })
    return Array.from(set).sort()
  }, [attractions])

  const years = useMemo(() => {
    const set = new Set<number>()
    attractions.forEach(a => {
      if (a.year) set.add(a.year)
    })
    return Array.from(set).sort((a, b) => b - a)
  }, [attractions])

  const filteredAttractions = useMemo(() => {
    return attractions.filter(item => {
      // Search term filter
      const q = search.toLowerCase().trim()
      const matchesSearch = !q ||
        item.name.en.toLowerCase().includes(q) ||
        item.name.ar.includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        item.venue.toLowerCase().includes(q) ||
        (item.clientName && item.clientName.toLowerCase().includes(q))

      // Temporal Status Filter
      const matchesTemporal = temporalFilter === "ALL" || item.temporalStatus.toUpperCase() === temporalFilter

      // Publication Status Filter (B2C Live)
      const matchesPublication = publicationFilter === "ALL" ||
        (publicationFilter === "PUBLISHED" && item.isPublished) ||
        (publicationFilter === "DRAFT" && !item.isPublished)

      // Visibility Filter (B2B Showcase)
      const matchesVisibility = visibilityFilter === "ALL" ||
        (visibilityFilter === "VISIBLE" && item.isB2bVisible) ||
        (visibilityFilter === "HIDDEN" && !item.isB2bVisible)

      // Category Filter
      const matchesCategory = categoryFilter === "ALL" || item.b2bCategory === categoryFilter

      // Year Filter
      const matchesYear = yearFilter === "ALL" || (item.year && item.year.toString() === yearFilter)

      return matchesSearch && matchesTemporal && matchesPublication && matchesVisibility && matchesCategory && matchesYear
    })
  }, [attractions, search, temporalFilter, publicationFilter, visibilityFilter, categoryFilter, yearFilter])

  const toggleField = async (id: string, field: "isB2bVisible" | "isPublished", currentValue: boolean) => {
    try {
      const res = await fetch(`/api/b2b/attractions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue })
      })

      if (!res.ok) throw new Error("Failed to update status")

      setAttractions(prev => prev.map(a =>
        a.id === id ? { ...a, [field]: !currentValue } : a
      ))
      router.refresh()
    } catch {
      alert(isAr ? "فشل تحديث الحالة" : "Failed to update attraction status")
    }
  }

  const deleteAttraction = async (id: string, name: string) => {
    if (!confirm(isAr ? `هل أنت متأكد من حذف ${name}؟ لا يمكن التراجع عن هذا الإجراء.` : `Are you sure you want to delete ${name}? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/b2b/attractions/${id}`, {
        method: "DELETE"
      })

      if (!res.ok) throw new Error("Failed to delete")

      setAttractions(prev => prev.filter(a => a.id !== id))
      router.refresh()
    } catch {
      alert(isAr ? "فشل حذف الوجهة" : "Failed to delete attraction")
    }
  }

  return (
    <DashboardPageShell variant="wide">
      <div dir={dir} className="space-y-6">
        <DashboardPageHeader
          title={isAr ? "دليل مشاريع وفعاليات B2B" : "B2B Attractions & Projects Directory"}
          description={
            isAr
              ? "إدارة محفظة الفعاليات، عروض الوجهات، ربط دراسات الحالة، وتفاصيل المشاريع المؤسسية."
              : "Manage corporate project portfolio, enterprise case links, engineering specs, and public credentials."
          }
          breadcrumbs={[
            { label: isAr ? "محتوى B2B" : "B2B Content", href: "/dashboard/b2b/services" },
            { label: isAr ? "المشاريع والوجهات" : "Attractions & Projects" }
          ]}
          badge={{ 
            label: isAr ? `${attractions.length} مشروع / وجهة` : `${attractions.length} Projects`, 
            variant: "indigo" 
          }}
          primaryAction={{
            label: isAr ? "إضافة مشروع جديد" : "New B2B Project",
            href: localizeHref("/dashboard/b2b/attractions/new", locale),
            icon: <Plus className="w-4 h-4" />
          }}
        />

        {/* Canonical Architecture Notice Banner */}
        <div
          dir={dir}
          data-testid="b2b-attraction-canonical-banner"
          className="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>
                  {isAr ? 'بنية الهوية الموحدة للوجهات' : 'Unified Canonical Attraction Architecture'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono uppercase">
                  {isAr ? 'معرّف موحد' : 'Canonical ID'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 max-w-2xl leading-relaxed">
                {isAr ? (
                  <>
                    تشترك الوجهات والمشاريع في <strong className="text-zinc-200">سجل هوية موحد داخل قاعدة البيانات</strong>.
                    يتم تخزين عروض B2C (الأسعار، التذاكر، العمليات) وعروض B2B (بيانات العملاء، النطاق الهندسي) باستقلالية تامة دون تكرار أو تعارض في البيانات.
                  </>
                ) : (
                  <>
                    Venues and projects share a <strong>single unified identity record in the database</strong>.
                    B2C presentation (pricing, tickets, operations) and B2B presentation (client credentials, engineering scope) are stored with independent switches on the same canonical ID.
                  </>
                )}
              </p>
            </div>
          </div>

          <Link
            href={localizeHref('/dashboard/b2c/attractions', locale)}
            data-testid="b2b-to-b2c-attractions-link"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-md"
          >
            <span>{isAr ? 'قائمة وجهات B2C' : 'B2C Attractions Roster'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter Controls */}
        <div className="bg-surface-default p-4 rounded-2xl border border-border-default shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                placeholder={isAr ? "البحث بالاسم أو المسار أو العميل..." : "Search by name, slug, venue, client..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="ps-9 pe-4 py-2 bg-surface-subtle border border-border-default rounded-xl text-sm focus:outline-none focus:border-primary w-full shadow-sm text-text-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Tag className="w-3.5 h-3.5" />
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-surface-subtle border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                >
                  <option value="ALL">{isAr ? "جميع التصنيفات" : "All Categories"}</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Filter className="w-3.5 h-3.5" />
                <select
                  value={yearFilter}
                  onChange={e => setYearFilter(e.target.value)}
                  className="bg-surface-subtle border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                >
                  <option value="ALL">{isAr ? "جميع السنوات" : "All Years"}</option>
                  {years.map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Temporal Status Filter */}
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Layers className="w-3.5 h-3.5" />
                <select
                  value={temporalFilter}
                  onChange={e => setTemporalFilter(e.target.value)}
                  className="bg-surface-subtle border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                >
                  <option value="ALL">{isAr ? "كافة الأنشطة" : "All Statuses"}</option>
                  <option value="ACTIVE">{isAr ? "نشط" : "Active"}</option>
                  <option value="UPCOMING">{isAr ? "قادم" : "Upcoming"}</option>
                  <option value="COMPLETED">{isAr ? "مكتمل" : "Completed"}</option>
                </select>
              </div>

              {/* B2C Publication Filter */}
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Filter className="w-3.5 h-3.5" />
                <select
                  value={publicationFilter}
                  onChange={e => setPublicationFilter(e.target.value)}
                  className="bg-surface-subtle border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                >
                  <option value="ALL">{isAr ? "حالة B2C" : "B2C Status"}</option>
                  <option value="PUBLISHED">{isAr ? "منشور Live" : "Published Live"}</option>
                  <option value="DRAFT">{isAr ? "مسودة Draft" : "Draft"}</option>
                </select>
              </div>

              {/* B2B Visibility Filter */}
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Globe className="w-3.5 h-3.5" />
                <select
                  value={visibilityFilter}
                  onChange={e => setVisibilityFilter(e.target.value)}
                  className="bg-surface-subtle border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                >
                  <option value="ALL">{isAr ? "كافة الحالات" : "All Showcase"}</option>
                  <option value="VISIBLE">{isAr ? "ظاهر في B2B" : "B2B Visible"}</option>
                  <option value="HIDDEN">{isAr ? "مخفي من B2B" : "B2B Hidden"}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Attractions Grid */}
        {filteredAttractions.length === 0 ? (
          <div className="text-center py-16 bg-surface-default rounded-2xl border border-border-default">
            <MapPin className="w-12 h-12 mx-auto text-text-tertiary opacity-40 mb-3" />
            <h3 className="text-base font-semibold text-text-primary">
              {isAr ? "لم يتم العثور على مشاريع تطابق الفلاتر" : "No projects match the current filters"}
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {isAr ? "يرجى تجربة كلمات بحث أخرى أو إعادة ضبط الفلاتر." : "Try adjusting your search terms or filter dropdowns."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAttractions.map(attraction => {
              const editB2BHref = localizeHref(`/dashboard/b2b/attractions/${attraction.id}/edit`, locale)
              const editB2CHref = localizeHref(`/dashboard/b2c/attractions/${attraction.id}/edit`, locale)

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={attraction.id}
                  data-testid={`b2b-attraction-card-${attraction.slug}`}
                  className="group flex flex-col bg-surface-default rounded-2xl border border-border-default shadow-sm hover:border-primary/50 transition-colors overflow-hidden"
                >
                  {/* Hero Media Preview */}
                  <div className="relative aspect-video bg-surface-subtle overflow-hidden">
                    {attraction.heroMediaUrl ? (
                      <img
                        src={attraction.heroThumbnailUrl || attraction.heroFallbackUrl || attraction.heroMediaUrl}
                        alt={attraction.name.en}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-text-tertiary gap-1">
                        <MapPin className="w-6 h-6 opacity-30" />
                        <span className="text-[10px] font-mono opacity-50">{attraction.slug}</span>
                      </div>
                    )}

                    <div className="absolute top-3 start-3 flex flex-col gap-1">
                      <Badge
                        variant={attraction.isB2bVisible ? "info" : "default"}
                        className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 text-[10px] gap-1"
                      >
                        <Globe className="w-2.5 h-2.5" />
                        {attraction.isB2bVisible ? (isAr ? "معروض في B2B" : "B2B Visible") : (isAr ? "مخفي من B2B" : "B2B Hidden")}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-text-primary leading-tight text-base">{attraction.name.en}</h3>
                        {attraction.isPublished ? (
                          <Badge variant="success" className="text-[10px] py-0 px-1.5 shrink-0">
                            {isAr ? "منشور B2C" : "B2C Live"}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-[10px] py-0 px-1.5 shrink-0">
                            {isAr ? "مسودة B2C" : "B2C Draft"}
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-xs text-text-secondary font-arabic mb-2">{attraction.name.ar}</h4>

                      {/* Venue and Details */}
                      <div className="space-y-1 mt-3 text-xs text-text-secondary">
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{attraction.venue}</span>
                        </div>

                        {attraction.b2bCategory && (
                          <div className="flex items-center gap-1.5 text-text-tertiary">
                            <Tag className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{attraction.b2bCategory}</span>
                          </div>
                        )}

                        {attraction.clientName && (
                          <div className="flex items-center gap-1.5 text-text-tertiary">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{isAr ? `العميل: ${attraction.clientName}` : `Client: ${attraction.clientName}`}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer & Dual-Editor Actions */}
                    <div className="mt-4 pt-3 border-t border-border-default space-y-2">
                      <div className="flex items-center gap-2">
                        <Link href={editB2BHref} data-testid={`edit-b2b-btn-${attraction.slug}`} className="flex-1">
                          <AdminButton variant="outline" className="w-full text-xs" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                            {isAr ? "محرر B2B" : "Edit B2B Record"}
                          </AdminButton>
                        </Link>

                        <Link 
                          href={editB2CHref} 
                          data-testid={`edit-b2c-btn-${attraction.slug}`}
                          title={isAr ? "فتح محرر B2C الجماهيري" : "Open Consumer B2C Editor"}
                          className="px-2.5 py-1.5 text-xs font-bold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Layers className="w-3 h-3" />
                          <span>{isAr ? "محرر B2C" : "B2C Editor"}</span>
                        </Link>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex bg-surface-subtle rounded-lg p-1">
                          {/* B2B Visibility Toggle */}
                          <button
                            title={attraction.isB2bVisible ? "Hide from B2B Portal" : "Show on B2B Portal"}
                            onClick={() => toggleField(attraction.id, "isB2bVisible", attraction.isB2bVisible)}
                            className={`p-1.5 rounded-md transition-colors ${attraction.isB2bVisible ? 'text-primary bg-surface-default shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
                          >
                            <Globe className="w-4 h-4" />
                          </button>

                          {/* B2C Publish Toggle */}
                          <button
                            title={attraction.isPublished ? "Unpublish from B2C" : "Publish Live on B2C"}
                            onClick={() => toggleField(attraction.id, "isPublished", attraction.isPublished)}
                            className={`p-1.5 rounded-md transition-colors ${attraction.isPublished ? 'text-emerald-400 bg-surface-default shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
                          >
                            {attraction.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Delete Action */}
                        <button
                          title={isAr ? "حذف السجل" : "Delete Record"}
                          onClick={() => deleteAttraction(attraction.id, attraction.name.en)}
                          className="p-1.5 rounded-md transition-colors text-error hover:bg-error/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardPageShell>
  )
}
