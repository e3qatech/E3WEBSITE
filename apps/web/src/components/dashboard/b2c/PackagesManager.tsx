"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Plus, Search, Edit2, Trash2, Copy, LayoutTemplate, 
  Package as PackageIcon, ArrowRight, RefreshCw,
  Tag, Users, FolderTree, FileSpreadsheet, Eye, Share2,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardLoadingState,
} from "@/components/dashboard/ui"
import { useLocale } from "@/components/layout/LocaleProvider"
import { PackageStudioEditor } from "@/components/dashboard/b2c/PackageStudioEditor"
import { PackageCategoriesManager } from "@/components/dashboard/b2c/PackageCategoriesManager"
import { PackagePromotionsManager } from "@/components/dashboard/b2c/PackagePromotionsManager"
import { PackageReferralsManager } from "@/components/dashboard/b2c/PackageReferralsManager"
import { PackageQuotationBuilder } from "@/components/dashboard/b2c/PackageQuotationBuilder"
import { PackageLeadsManager } from "@/components/dashboard/leads/PackageLeadsManager"
import { PackagePdfSettingsTab } from "@/components/dashboard/b2c/PackagePdfSettingsTab"

export function PackagesManager({ initialData = [] }: { initialData?: any[] }) {
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

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<
    "catalogue" | "templates" | "categories" | "promotions" | "referrals" | "leads" | "quotations" | "pdf"
  >("catalogue")

  const [packages, setPackages] = useState<any[]>(initialData.filter((p: any) => !p.isTemplate))
  const [templates, setTemplates] = useState<any[]>(initialData.filter((p: any) => p.isTemplate))
  const [loading, setLoading] = useState(initialData.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState<any | null>(null)

  const handleStartCreateTemplate = () => {
    setEditingItem({
      isTemplate: true,
      packageType: "CUSTOM_TEMPLATE",
      status: "DRAFT",
      isPublished: false,
      titleEn: "",
      titleAr: "",
      category: "BIRTHDAY",
      startingPrice: 0,
      minGuests: 10,
      maxGuests: 50,
      durationMinutes: 120,
    })
    setIsCreating(true)
  }

  const fetchPackages = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/b2c/packages?all=true&templates=true", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch packages")
      const json = await res.json()
      const allPkgs = Array.isArray(json.data) ? json.data : []
      if (allPkgs.length > 0) {
        setPackages(allPkgs.filter((p: any) => !p.isTemplate))
        setTemplates(allPkgs.filter((p: any) => p.isTemplate))
      }
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Failed to load packages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
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

  const handleCreateFromTemplate = async (template: any) => {
    try {
      const res = await fetch(`/api/b2c/packages/${template.id}`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to instantiate template")
      const json = await res.json()
      await fetchPackages()
      if (json.data) {
        setEditingItem(json.data)
        setActiveTab("catalogue")
      }
    } catch (_e) {
      alert("Failed to create package from template")
    }
  }

  const handleQuickToggle = async (pkg: any, field: string, value: boolean) => {
    try {
      await fetch(`/api/b2c/packages/${pkg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
      })
      fetchPackages()
    } catch {
      alert("Failed to update status")
    }
  }

  const filtered = packages.filter(item => {
    const matchesSearch = 
      (item.titleEn || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.titleAr || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.slug || "").toLowerCase().includes(search.toLowerCase())
    const matchesCat = 
      categoryFilter === "ALL" || 
      item.category === categoryFilter ||
      item.categoryId === categoryFilter ||
      item.categoryRel?.slug === categoryFilter.toLowerCase()
    return matchesSearch && matchesCat
  })

  // Full Screen Step-Based Editor View
  if (editingItem || isCreating) {
    return (
      <DashboardPageShell variant="wide">
        <PackageStudioEditor
          initialData={editingItem}
          locale={locale}
          dir={dir}
          onClose={() => { setEditingItem(null); setIsCreating(false); }}
          onSave={() => { setEditingItem(null); setIsCreating(false); fetchPackages(); }}
        />
      </DashboardPageShell>
    )
  }

  const studioTabs = [
    { id: "catalogue", labelEn: "Package Catalogue", labelAr: "دليل الباقات", icon: PackageIcon, count: packages.length },
    { id: "templates", labelEn: "Templates Library", labelAr: "مكتبة القوالب", icon: LayoutTemplate, count: templates.length },
    { id: "categories", labelEn: "Categories", labelAr: "فئات الباقات", icon: FolderTree },
    { id: "promotions", labelEn: "Discounts & Coupons", labelAr: "الخصومات والكوبونات", icon: Tag },
    { id: "referrals", labelEn: "Referrals & Partners", labelAr: "برامج الإحالة", icon: Share2 },
    { id: "leads", labelEn: "Inquiries & CRM", labelAr: "طلبات الحجز والعملاء", icon: Users },
    { id: "quotations", labelEn: "Quotations Builder", labelAr: "عروض الأسعار", icon: FileSpreadsheet },
    { id: "pdf", labelEn: "PDF Quote & Letterhead", labelAr: "ترويسة PDF وعروض الأسعار", icon: FileText }
  ]

  return (
    <DashboardPageShell variant="wide">
      <div dir={dir} className="space-y-6">
        {/* Header */}
        <DashboardPageHeader
          title={isAr ? "استوديو باقات وفعاليات إي ثري (E3 Package Studio)" : "E3 Package Studio & Marketplace Manager"}
          description={
            isAr
              ? "إدارة باقات أعياد الميلاد والشركات والرحلات المدرسية والأسعار، وإنشاء عروض الأسعار وتتبع الإحالات والكوبونات."
              : "End-to-end package engineering: create modular packages, pricing tiers, templates, quotations, promotional coupons, and track inquiries."
          }
          breadcrumbs={[
            { label: isAr ? "محتوى الأفراد" : "B2C Content", href: "/dashboard/b2c/attractions" },
            { label: isAr ? "استوديو الباقات" : "Package Studio" },
          ]}
          badge={{ label: isAr ? `${packages.length} باقة نشطة` : `${packages.length} Packages`, variant: "purple" }}
          previewUrl="/b2c/packages"
          secondaryAction={
            <Button
              onClick={() => setActiveTab("pdf")}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10 font-bold cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{isAr ? "محرر ترويسة وعروض PDF" : "PDF Quote & Letterhead Editor"}</span>
            </Button>
          }
          primaryAction={
            activeTab === "templates"
              ? {
                  label: isAr ? "إنشاء قالب جديد" : "Create New Template",
                  onClick: handleStartCreateTemplate,
                  icon: <Plus className="w-4 h-4" />
                }
              : {
                  label: isAr ? "إنشاء باقة جديدة" : "Create Package",
                  onClick: () => { setEditingItem(null); setIsCreating(true); },
                  icon: <Plus className="w-4 h-4" />
                }
          }
        />

        {/* Reciprocal Handoff Banner to Packages Page Editor */}
        <div className="p-4 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-level-2)] flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)]">
                {isAr ? "تحرير تصميم ووسائط الصفحة" : "Edit Page Layout & Media"}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                {isAr ? "تخصيص الهيرو، وسائط الخلفية، والأقسام العامة لصفحة الباقات." : "Configure hero banners, universal media, and introductory marketing copy."}
              </div>
            </div>
          </div>
          <Link
            href={`/${locale}/dashboard/b2c/packages-page`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--surface-hover)] border border-[var(--border-level-2)] hover:bg-[var(--surface-active)] text-[var(--text-primary)] transition-colors shrink-0"
          >
            <span>{isAr ? "محرر صفحة الباقات" : "Go to Page Editor"}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[var(--surface-subtle)] rounded-3xl border border-[var(--border-default)] overflow-x-auto scrollbar-none shadow-xs">
          {studioTabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                {tab.count !== undefined && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-md text-[10px] font-mono",
                    isActive ? "bg-black/20 text-white" : "bg-[var(--surface-default)] text-[var(--text-tertiary)] border border-[var(--border-default)]"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* TAB 1: CATALOGUE */}
        {activeTab === "catalogue" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="p-4 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute top-1/2 -translate-y-1/2 left-3.5 rtl:left-auto rtl:right-3.5" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={isAr ? "ابحث بالاسم أو المعرف..." : "Search packages by title or slug..."}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-2xl pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-2xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                >
                  <option value="ALL">{isAr ? "جميع الفئات" : "All Categories"}</option>
                  <option value="BIRTHDAY">Celebrate / أعياد الميلاد</option>
                  <option value="SCHOOL">Learn & Explore / المدارس</option>
                  <option value="GROUP">Play Together / المجموعات</option>
                  <option value="CORPORATE">Corporate / الشركات</option>
                  <option value="EVENTS">Events & Buyouts / الفعاليات</option>
                  <option value="SEASONAL">Seasonal / الموسمية</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchPackages}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Packages Table */}
            {loading ? (
              <DashboardLoadingState />
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-default)] space-y-3">
                <PackageIcon className="w-10 h-10 mx-auto text-[var(--text-tertiary)]" />
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {isAr ? "لا توجد باقات مطابقة" : "No package records found"}
                </p>
              </div>
            ) : (
              <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--surface-default)] overflow-hidden shadow-xs">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-mono uppercase text-[10px] bg-[var(--surface-subtle)]">
                      <th className="p-4 text-start">Package Title</th>
                      <th className="p-4 text-start">Category</th>
                      <th className="p-4 text-start">Price & Capacity</th>
                      <th className="p-4 text-start">Status & Featured</th>
                      <th className="p-4 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-default)]">
                    {filtered.map(pkg => (
                      <tr key={pkg.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-black/10 overflow-hidden border border-[var(--border-default)] shrink-0">
                              <img
                                src={pkg.coverMediaUrl || pkg.heroMediaUrl || "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=150&q=80"}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-[var(--text-primary)]">{pkg.titleEn}</div>
                              <div className="text-[11px] text-[var(--text-secondary)]">{pkg.titleAr}</div>
                              <div className="text-[10px] font-mono text-[var(--color-primary)] mt-0.5">{pkg.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {pkg.categoryRel?.nameEn || pkg.category}
                          </span>
                        </td>
                        <td className="p-4 font-mono">
                          <div className="font-bold text-emerald-600 dark:text-emerald-400">QAR {pkg.startingPrice?.toLocaleString() || 0}</div>
                          <div className="text-[11px] text-[var(--text-secondary)]">{pkg.minGuests}–{pkg.maxGuests} guests</div>
                        </td>
                        <td className="p-4 space-y-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuickToggle(pkg, "isPublished", !pkg.isPublished)}
                              className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase cursor-pointer transition-colors",
                                pkg.isPublished ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-[var(--surface-subtle)] text-[var(--text-tertiary)] border border-[var(--border-default)]"
                              )}
                            >
                              {pkg.isPublished ? "Published" : "Draft"}
                            </button>
                            <button
                              onClick={() => handleQuickToggle(pkg, "isFeatured", !pkg.isFeatured)}
                              className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase cursor-pointer transition-colors",
                                pkg.isFeatured ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30" : "bg-[var(--surface-subtle)] text-[var(--text-tertiary)] border border-[var(--border-default)]"
                              )}
                            >
                              {pkg.isFeatured ? "★ Featured" : "Standard"}
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`/${locale}/b2c/packages/${pkg.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-[var(--surface-hover)]"
                              title="Live Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDuplicate(pkg.id)}
                              className="p-1.5 text-[var(--text-tertiary)] hover:text-sky-500 transition-colors rounded-lg hover:bg-sky-500/10 cursor-pointer"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingItem(pkg)}
                              className="p-1.5 text-[var(--text-tertiary)] hover:text-emerald-500 transition-colors rounded-lg hover:bg-emerald-500/10 cursor-pointer"
                              title="Edit in Studio"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(pkg.id)}
                              className="p-1.5 text-[var(--text-tertiary)] hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TEMPLATES LIBRARY */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] shadow-xs">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-purple-500" />
                  <span>{isAr ? "مكتبة قوالب الباقات المعتمدة" : "Reusable Experience Templates Library"}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300">
                    {templates.length}
                  </span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {isAr ? "استخدم أي من هذه القوالب المعيارية لإنشاء باقة جديدة بنقرة واحدة، أو أنشئ قالباً مخصصاً جديداً للمكتبة." : "Launch customized packages in seconds by instantiating pre-structured blueprints, or build new reusable templates for your team."}
                </p>
              </div>
              <Button
                onClick={handleStartCreateTemplate}
                className="gap-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? "إنشاء قالب جديد" : "Create New Template"}</span>
              </Button>
            </div>

            {templates.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[var(--surface-default)] border border-dashed border-[var(--border-default)] text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
                  <LayoutTemplate className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    {isAr ? "لا توجد قوالب معتمدة حالياً في المكتبة" : "No Templates Found in Library"}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mt-1 leading-relaxed">
                    {isAr
                      ? "يمكنك إنشاء أول قالب مخصص الآن ليكون نموذجاً جاهزاً يتم تكراره بنقرة واحدة لجميع الوجهات والمناسبات."
                      : "Create your first reusable package blueprint to quickly launch new packages with pre-configured tiers, pricing, and itineraries."}
                  </p>
                </div>
                <Button
                  onClick={handleStartCreateTemplate}
                  className="gap-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? "إنشاء أول قالب الآن" : "Create First Template Now"}</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {templates.map(tmpl => (
                  <div key={tmpl.id} className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition-all shadow-xs">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-500/15 text-purple-600 dark:text-purple-300">
                          {tmpl.category} TEMPLATE
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                          {tmpl.packageType}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[var(--text-primary)] mt-2">{tmpl.titleEn}</h4>
                      {tmpl.titleAr && (
                        <div className="text-xs font-medium text-[var(--text-secondary)] mt-0.5" dir="rtl">{tmpl.titleAr}</div>
                      )}
                      <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{tmpl.shortDescriptionEn}</p>
                      <div className="mt-3 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        Base: QAR {tmpl.startingPrice} | {tmpl.minGuests}–{tmpl.maxGuests} guests
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[var(--border-level-1)]">
                      <Button
                        size="sm"
                        onClick={() => handleCreateFromTemplate(tmpl)}
                        className="w-full text-xs font-bold gap-1.5 bg-purple-600 hover:bg-purple-500 text-white shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {isAr ? "إنشاء باقة من هذا القالب" : "Create Package from Template"}
                      </Button>
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => {
                            setEditingItem(tmpl);
                            setIsCreating(false);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title={isAr ? "تعديل القالب" : "Edit Template"}
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{isAr ? "تعديل" : "Edit"}</span>
                        </button>
                        <button
                          onClick={() => handleDuplicate(tmpl.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title={isAr ? "تكرار القالب" : "Duplicate Template"}
                        >
                          <Copy className="w-3 h-3" />
                          <span>{isAr ? "نسخ" : "Copy"}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(tmpl.id)}
                          className="px-2 py-1 text-[11px] font-bold text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title={isAr ? "حذف القالب" : "Delete Template"}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CATEGORIES */}
        {activeTab === "categories" && (
          <PackageCategoriesManager locale={locale} dir={dir} />
        )}

        {/* TAB 4: PROMOTIONS */}
        {activeTab === "promotions" && (
          <PackagePromotionsManager locale={locale} dir={dir} />
        )}

        {/* TAB 5: REFERRALS */}
        {activeTab === "referrals" && (
          <PackageReferralsManager locale={locale} dir={dir} />
        )}

        {/* TAB 6: LEADS */}
        {activeTab === "leads" && (
          <PackageLeadsManager
            onSelectLeadForQuotation={(lead) => {
              setSelectedLeadForQuote(lead)
              setActiveTab("quotations")
            }}
            isEmbedded
          />
        )}

        {/* TAB 7: QUOTATIONS */}
        {activeTab === "quotations" && (
          <PackageQuotationBuilder
            locale={locale}
            dir={dir}
            initialLead={selectedLeadForQuote}
          />
        )}

        {/* TAB 8: PDF QUOTE & LETTERHEAD MANAGER */}
        {activeTab === "pdf" && (
          <PackagePdfSettingsTab locale={locale} />
        )}
      </div>
    </DashboardPageShell>
  )
}
