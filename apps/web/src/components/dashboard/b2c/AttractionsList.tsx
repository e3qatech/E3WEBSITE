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
  Star,
  Trash2,
  Filter,
  Layers,
  ImageOff,
  ExternalLink,
  Briefcase,
  Sparkles,
  Wand2,
  Copy,
  FileSpreadsheet,
  Download
} from "lucide-react"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { Badge } from "@/components/ui/Badge"
import { useLocale } from "@/components/layout/LocaleProvider"
import { localizeHref } from "@/lib/url-helper"
import { AttractionDuplicationModal } from "./attractions/AttractionDuplicationModal"
import { ContentIntakeHub, IntakeTab } from "./attractions/ContentIntakeHub"

type Attraction = {
  id: string
  name: { en: string; ar: string }
  slug: string
  isPublished: boolean
  isFeatured: boolean
  isB2bVisible?: boolean
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

export function AttractionsList({ initialAttractions }: { initialAttractions: Attraction[] }) {
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
    // Fallback
  }

  const isAr = locale === 'ar'
  const [search, setSearch] = useState("")
  const [attractions, setAttractions] = useState(initialAttractions || [])

  // Modals
  const [isIntakeHubOpen, setIsIntakeHubOpen] = useState(false)
  const [intakeTab, setIntakeTab] = useState<IntakeTab>('smart_doc')
  const [isDuplicationModalOpen, setIsDuplicationModalOpen] = useState(false)
  const [targetDuplicateAttraction, setTargetDuplicateAttraction] = useState<any>(null)

  // Filter States
  const [publicationFilter, setPublicationFilter] = useState<string>("ALL")
  const [scopeFilter, setScopeFilter] = useState<string>("ALL") // ALL (38), CANONICAL (34), LEGACY (4)

  const filtered = useMemo(() => {
    return attractions.filter(a => {
      const q = search.toLowerCase().trim()
      const matchesSearch = !q ||
        a.name.en.toLowerCase().includes(q) ||
        a.name.ar.includes(q) ||
        a.slug.toLowerCase().includes(q)

      const matchesPublication = publicationFilter === "ALL" ||
        (publicationFilter === "PUBLISHED" && a.isPublished) ||
        (publicationFilter === "DRAFT" && !a.isPublished)

      const matchesScope = scopeFilter === "ALL" ||
        (scopeFilter === "CANONICAL" && a.isB2bVisible !== false) ||
        (scopeFilter === "LEGACY" && a.isB2bVisible === false)

      return matchesSearch && matchesPublication && matchesScope
    })
  }, [attractions, search, publicationFilter, scopeFilter])

  const canonicalCount = useMemo(() => attractions.filter(a => a.isB2bVisible !== false).length, [attractions])
  const legacyCount = useMemo(() => attractions.filter(a => a.isB2bVisible === false).length, [attractions])

  const toggleStatus = async (id: string, field: "isPublished" | "isFeatured", currentValue: boolean) => {
    try {
      const res = await fetch(`/api/b2c/attractions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue })
      })
      if (!res.ok) throw new Error()

      setAttractions(prev => prev.map(a =>
        a.id === id ? { ...a, [field]: !currentValue } : a
      ))
      router.refresh()
    } catch {
      alert(isAr ? `فشل تحديث ${field}` : `Failed to update ${field}`)
    }
  }

  const deleteAttraction = async (id: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذه الوجهة؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this attraction? This action cannot be undone.")) return

    try {
      const res = await fetch(`/api/b2c/attractions/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || (isAr ? "فشل حذف الوجهة" : "Failed to delete attraction"))
      }

      setAttractions(prev => prev.filter(a => a.id !== id))
      router.refresh()
    } catch (err: any) {
      alert(err.message || (isAr ? "فشل حذف الوجهة" : "Failed to delete attraction"))
    }
  }

  return (
    <DashboardPageShell variant="wide">
      <div dir={dir} className="space-y-6">
        <DashboardPageHeader
          title={isAr ? "إدارة الوجهات والفعاليات" : "Attractions & Events Studio"}
          description={
            isAr
              ? `إدارة استوديو محتوى الوجهات الترفيهية، الفعاليات الموسمية والتفعيلات الرياضية (${canonicalCount} وجهة أساسية)`
              : `Manage experiential content, story tracks, ticket passes, and seasonal activations (${canonicalCount} canonical records)`
          }
          breadcrumbs={[
            { label: isAr ? "لوحة التحكم" : "Dashboard", href: "/dashboard" },
            { label: isAr ? "محتوى B2C" : "B2C Content", href: "/dashboard/b2c/attractions" },
            { label: isAr ? "الوجهات" : "Attractions" },
          ]}
          badge={{ 
            label: isAr ? `${attractions.length} وجهة وفعالية` : `${attractions.length} Destinations`, 
            variant: "purple" 
          }}
          primaryAction={{
            label: isAr ? "إضافة وجهة جديدة" : "New Attraction",
            href: localizeHref("/dashboard/b2c/attractions/new", locale),
            icon: <Plus className="w-4 h-4" />,
          }}
        />

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] shadow-sm">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIntakeTab('smart_doc')
                setIsIntakeHubOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isAr ? "مركز الاستيراد الذكي (OCR/نص)" : "Smart Intake Hub"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIntakeTab('spreadsheet')
                setIsIntakeHubOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] transition-all shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isAr ? "استيراد جدول Excel" : "Spreadsheet Import"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTargetDuplicateAttraction(null)
                setIsDuplicationModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] transition-all shadow-sm cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? "بدء من قالب / تكرار" : "Start from Template"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIntakeTab('history')
                setIsIntakeHubOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm cursor-pointer"
            >
              <span>{isAr ? "سجل الاستيراد" : "Import History"}</span>
            </button>

            <Link
              href="/dashboard/b2c/attractions/workbook"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? "استوديو جداول المحتوى والوسائط" : "Master Workbook Studio"}</span>
            </Link>

            <a
              href="/api/b2c/attractions/master-workbook/export"
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>{isAr ? "تصدير جدول المحتوى (.xlsx)" : "Export Workbook (.xlsx)"}</span>
            </a>
          </div>
        </div>

        {/* Canonical Architecture Notice Banner */}
        <div
          dir={dir}
          data-testid="b2c-attraction-canonical-banner"
          className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>
                  {isAr ? 'الهوية الموحدة لوجهات ومشاريع E3' : 'Unified Canonical Attraction Architecture'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono uppercase">
                  {isAr ? 'معرّف موحد' : 'Canonical ID'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 max-w-2xl leading-relaxed">
                {isAr ? (
                  <>
                    تشترك الوجهات والمشاريع في <strong className="text-zinc-200">سجل هوية موحد داخل قاعدة البيانات</strong>.
                    لإدارة بيانات الاعتماد المؤسسية، النطاق الهندسي، وربط دراسات الحالة، يمكنك الانتقال إلى دليل مشاريع B2B.
                  </>
                ) : (
                  <>
                    Venues and projects share a <strong>single unified identity record in the database</strong>.
                    To manage enterprise client credentials, engineering scope, and case study links, navigate to the B2B Projects Directory.
                  </>
                )}
              </p>
            </div>
          </div>

          <Link
            href={localizeHref('/dashboard/b2b/attractions', locale)}
            data-testid="b2c-to-b2b-attractions-link"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-md"
          >
            <span>{isAr ? 'دليل مشاريع B2B' : 'B2B Projects Directory'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Control Bar: Search & Multi-Filters */}
        <div className="bg-surface-default p-4 rounded-2xl border border-border-default shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                placeholder={isAr ? "البحث بالاسم أو المسار..." : "Search attractions by name or slug..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="ps-9 pe-4 py-2 bg-surface-subtle border border-border-default rounded-xl text-sm focus:outline-none focus:border-primary w-full shadow-sm text-text-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Scope Filter */}
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Layers className="w-3.5 h-3.5" />
                <select
                  value={scopeFilter}
                  onChange={e => setScopeFilter(e.target.value)}
                  className="bg-surface-subtle border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                >
                  <option value="ALL">{isAr ? `كافة السجلات (${attractions.length})` : `All Records (${attractions.length})`}</option>
                  <option value="CANONICAL">{isAr ? `الوجهات الأساسية (${canonicalCount})` : `Canonical E3 (${canonicalCount})`}</option>
                  <option value="LEGACY">{isAr ? `السجلات التجريبية / السابقة (${legacyCount})` : `Legacy / Test (${legacyCount})`}</option>
                </select>
              </div>

              {/* Publication Filter */}
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Filter className="w-3.5 h-3.5" />
                <select
                  value={publicationFilter}
                  onChange={e => setPublicationFilter(e.target.value)}
                  className="bg-surface-subtle border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                >
                  <option value="ALL">{isAr ? "كافة الحالات" : "All Statuses"}</option>
                  <option value="PUBLISHED">{isAr ? "منشور (Live)" : "Published (Live)"}</option>
                  <option value="DRAFT">{isAr ? "مسودة" : "Draft"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Counter Badge Header */}
          <div className="flex items-center justify-between border-t border-border-default pt-3 text-xs text-text-secondary">
            <div>
              {isAr ? (
                <>عرض <strong className="text-text-primary">{filtered.length}</strong> من <strong className="text-text-primary">{attractions.length}</strong> وجهة</>
              ) : (
                <>Showing <strong className="text-text-primary">{filtered.length}</strong> of <strong className="text-text-primary">{attractions.length}</strong> Attractions</>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                {isAr ? `${canonicalCount} وجهة موحدة` : `${canonicalCount} Canonical E3`}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">
                {isAr ? `${legacyCount} سجلات أخرى` : `${legacyCount} Legacy/Test`}
              </span>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-surface-default rounded-2xl border border-border-default">
            <MapPin className="w-12 h-12 mx-auto text-text-tertiary opacity-40 mb-3" />
            <h3 className="text-base font-semibold text-text-primary">
              {isAr ? "لم يتم العثور على وجهات تطابق الفلاتر الحالية" : "No attractions match the current filters"}
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {isAr ? "يرجى تجربة كلمات بحث أخرى أو تعديل خيارات التصفية." : "Try adjusting your search terms or filter dropdowns."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(attraction => {
              const editB2CHref = localizeHref(`/dashboard/b2c/attractions/${attraction.id}/edit`, locale)
              const editB2BHref = localizeHref(`/dashboard/b2b/attractions/${attraction.id}/edit`, locale)

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={attraction.id}
                  data-testid={`b2c-attraction-card-${attraction.slug}`}
                  className="group flex flex-col bg-surface-default rounded-2xl border border-border-default shadow-sm hover:border-primary transition-colors overflow-hidden"
                >
                  {/* Hero Image / Media Preview */}
                  <div className="relative aspect-video bg-surface-subtle overflow-hidden">
                    {(() => {
                      const isIframe = attraction.heroMediaType === 'IFRAME'
                      const imgSrc = attraction.heroThumbnailUrl || attraction.heroFallbackUrl || (!isIframe ? attraction.heroMediaUrl : null)

                      if (imgSrc) {
                        return (
                          <img
                            src={imgSrc}
                            alt={attraction.name.en}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              if (e.currentTarget.nextElementSibling) {
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'
                              }
                            }}
                          />
                        )
                      }

                      return null
                    })()}

                    {/* Fallback Display */}
                    <div
                      className="w-full h-full flex flex-col items-center justify-center bg-surface-subtle text-text-tertiary gap-1"
                      style={{ display: attraction.heroThumbnailUrl || attraction.heroFallbackUrl || (!attraction.heroMediaType || attraction.heroMediaType !== 'IFRAME' ? attraction.heroMediaUrl : null) ? 'none' : 'flex' }}
                    >
                      <ImageOff className="w-6 h-6 opacity-40" />
                      <span className="text-[10px] font-medium opacity-60">
                        {isAr ? "لا توجد صورة رئيسية" : "No Hero Media"}
                      </span>
                    </div>

                    {/* Top Badges Overlay */}
                    <div className="absolute top-3 start-3 flex flex-col gap-1">
                      <Badge variant={attraction.isPublished ? "success" : "default"} className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-zinc-950/90">
                        {attraction.isPublished ? (isAr ? "منشور Live" : "Live") : (isAr ? "مسودة" : "Draft")}
                      </Badge>
                      {attraction.isB2bVisible === false && (
                        <Badge variant="default" className="shadow-sm backdrop-blur-md bg-amber-500/20 text-amber-400">
                          {isAr ? "تجريبي / مخفي B2B" : "Legacy / Hidden"}
                        </Badge>
                      )}
                      {attraction.isFeatured && (
                        <Badge variant="warning" className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 gap-1">
                          <Star className="w-3 h-3 fill-current" /> {isAr ? "مميز" : "Featured"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-bold text-text-primary mb-1 leading-snug">{attraction.name.en}</h3>
                      <h4 className="text-sm text-text-secondary font-arabic">{attraction.name.ar}</h4>
                      <div className="text-[11px] font-mono text-text-tertiary truncate mt-1">/{attraction.slug}</div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y border-border-default">
                      <div className="text-center">
                        <div className="text-xs text-text-tertiary mb-0.5">{isAr ? "الباقات" : "Tiers"}</div>
                        <div className="font-mono text-sm font-bold text-text-primary">{attraction._count.pricing}</div>
                      </div>
                      <div className="text-center border-x border-border-default">
                        <div className="text-xs text-text-tertiary mb-0.5">{isAr ? "العروض" : "Offers"}</div>
                        <div className="font-mono text-sm font-bold text-text-primary">{attraction._count.offers}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-text-tertiary mb-0.5">{isAr ? "الأسئلة" : "FAQs"}</div>
                        <div className="font-mono text-sm font-bold text-text-primary">{attraction._count.faqs}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Link href={editB2CHref} data-testid={`edit-b2c-btn-${attraction.slug}`} className="flex-1">
                          <AdminButton variant="outline" className="w-full text-xs font-bold" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                            {isAr ? "تعديل الوجهة" : "Edit Attraction"}
                          </AdminButton>
                        </Link>

                        <Link 
                          href={localizeHref(`/dashboard/b2c/attractions/${attraction.id}/edit?stage=media`, locale)} 
                          data-testid={`case-studies-link-${attraction.slug}`}
                          title={isAr ? "عرض دراسات الحالة وروابط B2B" : "View Case Studies & B2B Links"}
                          className="px-2.5 py-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Briefcase className="w-3 h-3" />
                          <span>{isAr ? "دراسات الحالة" : "Case Studies"}</span>
                        </Link>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex bg-surface-subtle rounded-lg p-1">
                          <button
                            title={isAr ? "تغيير حالة النشر في B2C" : "Toggle Publish Status"}
                            onClick={() => toggleStatus(attraction.id, "isPublished", attraction.isPublished)}
                            className={`p-1.5 rounded-md transition-colors ${attraction.isPublished ? 'text-emerald-400 bg-surface-default shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
                          >
                            {attraction.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            title={isAr ? "تغيير حالة التمييز" : "Toggle Featured Status"}
                            onClick={() => toggleStatus(attraction.id, "isFeatured", attraction.isFeatured)}
                            className={`p-1.5 rounded-md transition-colors ${attraction.isFeatured ? 'text-amber-400 bg-surface-default shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
                          >
                            <Star className={`w-4 h-4 ${attraction.isFeatured ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            title={isAr ? "نسخ / تكرار هذه الوجهة" : "Duplicate / Clone Attraction"}
                            onClick={() => {
                              setTargetDuplicateAttraction(attraction)
                              setIsDuplicationModalOpen(true)
                            }}
                            className="p-1.5 rounded-md transition-colors text-purple-400 hover:bg-purple-500/10"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            title={isAr ? "حذف الوجهة" : "Delete Attraction"}
                            onClick={() => deleteAttraction(attraction.id)}
                            className="p-1.5 rounded-md transition-colors text-error hover:bg-error/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Modals */}
        <AttractionDuplicationModal
          isOpen={isDuplicationModalOpen}
          onClose={() => {
            setIsDuplicationModalOpen(false)
            setTargetDuplicateAttraction(null)
          }}
          sourceAttraction={targetDuplicateAttraction}
          availableAttractions={attractions}
        />

        <ContentIntakeHub
          isOpen={isIntakeHubOpen}
          initialTab={intakeTab}
          onClose={() => setIsIntakeHubOpen(false)}
          onSuccess={() => {
            router.refresh()
          }}
        />
      </div>
    </DashboardPageShell>
  )
}
