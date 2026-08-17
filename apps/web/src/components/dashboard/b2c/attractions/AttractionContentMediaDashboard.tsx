"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from "lucide-react"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"
import { AttractionMasterWorkbookModal } from "./AttractionMasterWorkbookModal"
import { cn } from "@/lib/utils"
import { localizeHref } from "@/lib/url-helper"

export function AttractionContentMediaDashboard() {
  const params = useParams()
  const locale = (params?.locale as string) || "en"
  const isAr = locale === "ar"

  const [metrics, setMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isWorkbookModalOpen, setIsWorkbookModalOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [mediaStatusFilter, setMediaStatusFilter] = useState("ALL")
  const [showAdvancedMapping, setShowAdvancedMapping] = useState(false)

  const fetchMetrics = async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const res = await fetch("/api/b2c/attractions/master-workbook/dashboard")
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`)
      }
      const json = await res.json()
      if (json.success) {
        setMetrics(json.data)
      } else {
        throw new Error(json.error || "Failed to load dashboard metrics")
      }
    } catch (e: any) {
      console.error("Failed to load metrics", e)
      setFetchError(e.message || "Failed to load attraction metrics. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const filteredAttractions = metrics?.attractions?.filter((a: any) => {
    const q = search.toLowerCase()
    const matchesSearch = !q || a.nameEn.toLowerCase().includes(q) || (a.nameAr && a.nameAr.includes(q)) || (a.slug && a.slug.toLowerCase().includes(q))
    const matchesStatus = statusFilter === "ALL" || (statusFilter === "PUBLISHED" && a.isPublished) || (statusFilter === "DRAFT" && !a.isPublished)
    return matchesSearch && matchesStatus
  }) || []

  const filteredQueue = metrics?.missingMediaQueue?.filter((item: any) => {
    const q = search.toLowerCase()
    const matchesSearch = !q || item.attractionName.toLowerCase().includes(q) || item.activityName.toLowerCase().includes(q)
    const matchesMedia = mediaStatusFilter === "ALL" || item.status === mediaStatusFilter
    return matchesSearch && matchesMedia
  }) || []

  const BackIcon = isAr ? ArrowRight : ArrowLeft
  const ForwardIcon = isAr ? ChevronLeft : ChevronRight

  return (
    <DashboardPageShell variant="wide">
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6" dir={isAr ? "rtl" : "ltr"}>
        
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={localizeHref("/dashboard/b2c/attractions", locale)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] transition-all shadow-xs cursor-pointer"
          >
            <BackIcon className="w-4 h-4 text-purple-400" />
            <span>{isAr ? "العودة إلى قائمة الوجهات" : "Back to Attractions"}</span>
          </Link>
        </div>

        {/* Header with Direct Actions */}
        <DashboardPageHeader
          title={isAr ? "استوديو جداول المحتوى والوسائط" : "Attraction Content & Media Studio"}
          description={isAr ? "إدارة جداول العمل الموحدة ثلاثية التبويبات، تدقيق اكتمال الترجمة العربية، وتتبع إنتاج وسائط التجارب." : "Unified 3-tab Master Workbook management, bilingual completeness tracking, and media queue verification."}
          breadcrumbs={[
            { label: isAr ? "لوحة التحكم" : "Dashboard", href: "/dashboard" },
            { label: isAr ? "الوجهات الترفيهية" : "B2C Attractions", href: "/dashboard/b2c/attractions" },
            { label: isAr ? "استوديو الجداول والوسائط" : "Master Workbook & Media" }
          ]}
          primaryAction={{
            label: isAr ? "استيراد جدول العمل" : "Import Master Workbook",
            onClick: () => setIsWorkbookModalOpen(true),
            icon: <UploadCloud className="w-4 h-4" />
          }}
          secondaryAction={
            <div className="flex items-center gap-2">
              <a
                href="/api/b2c/attractions/master-workbook/export"
                download
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--e3-royal-blue)] text-[var(--text-primary)] border border-[var(--border-default)] text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>{isAr ? "تصدير جميع الوجهات (.xlsx)" : "Export Master Workbook (.xlsx)"}</span>
              </a>
              <button
                type="button"
                onClick={fetchMetrics}
                className="p-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] transition-all cursor-pointer"
                title={isAr ? "تحديث المؤشرات" : "Refresh Metrics"}
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </button>
            </div>
          }
        />

        {/* Error Notification State with Retry */}
        {fetchError && !isLoading && (
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/40 text-red-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">{isAr ? "تعذر تحميل مؤشرات الاستوديو: " : "Error loading metrics: "}</span>
                <span>{fetchError}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchMetrics}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold border border-red-500/30 transition-all cursor-pointer"
            >
              {isAr ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        )}

        {/* Overview KPI Cards */}
        {isLoading && !metrics ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-5 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-3 animate-pulse">
                <div className="h-4 bg-[var(--surface-subtle)] rounded-md w-24" />
                <div className="h-8 bg-[var(--surface-subtle)] rounded-lg w-16" />
                <div className="h-2 bg-[var(--surface-subtle)] rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
                <span>{isAr ? "اكتمال المحتوى" : "Content Complete"}</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-[var(--text-primary)]">
                {metrics?.overview?.avgContentCompleteness ?? 0}%
              </div>
              <div className="w-full bg-[var(--surface-subtle)] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics?.overview?.avgContentCompleteness ?? 0}%` }}
                />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
                <span>{isAr ? "الترجمة العربية" : "Arabic Translation"}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">AR</span>
              </div>
              <div className="text-3xl font-black text-[var(--text-primary)]">
                {metrics?.overview?.avgArabicCompleteness ?? 0}%
              </div>
              <div className="w-full bg-[var(--surface-subtle)] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics?.overview?.avgArabicCompleteness ?? 0}%` }}
                />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
                <span>{isAr ? "هدف المعرض (10 صور)" : "Gallery 10-Target"}</span>
                <ImageIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400">
                {metrics?.overview?.galleryTargetMetCount ?? 0}
                <span className="text-sm font-normal text-[var(--text-tertiary)]"> / {metrics?.overview?.totalAttractions ?? 0}</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {metrics?.overview?.totalGalleryImages ?? 0} {isAr ? "صورة تم رفعها إجمالاً" : "total photos uploaded"}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
                <span>{isAr ? "وسائط الأنشطة والتجارب" : "Activity Media"}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-[var(--text-primary)]">
                {metrics?.overview?.activityMediaCompleteness ?? 0}%
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {isAr ? "الهدف: غلاف + 3 صور مساعدة" : "Target: 1 Cover + 3 Supporting Photos"}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
                <span>{isAr ? "قائمة انتظار الوسائط" : "Missing Media Queue"}</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400">
                {metrics?.overview?.pendingMediaAssignmentsCount ?? 0}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {isAr ? "أنشطة تحتاج لتوفير الوسائط" : "Activities needing assets"}
              </p>
            </div>
          </div>
        )}

        {/* 3-Tab Architecture Quick Card */}
        <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                <span>{isAr ? "هيكل جدول العمل الموحد (3 تبويبات متزامنة)" : "Unified 3-Tab Master Workbook Structure"}</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isAr 
                  ? "تصدير المحتوى الحالي، التعديل بدون اتصال بالإنترنت بالتعاون مع فريق الإبداع والتسويق، وإعادة الاستيراد مع الدمج الآمن وتوليد قائمة الوسائط آلياً."
                  : "Export existing content, edit offline with your creative and marketing teams, and re-import with safe deep merge and automated media tracking."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdvancedMapping(!showAdvancedMapping)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showAdvancedMapping ? (isAr ? "إخفاء مواصفات الأعمدة" : "Hide Column Specs") : (isAr ? "عرض مواصفات الأعمدة" : "View Column Specs")}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAdvancedMapping && "rotate-180")} />
              </button>
            </div>
          </div>

          {showAdvancedMapping && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[var(--border-default)] animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-2">
                <div className="text-xs font-bold text-purple-400 uppercase">{isAr ? "التبويب 1: بيانات الوجهة (Attraction)" : "Tab 1: Attraction"}</div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Attraction ID, Name EN/AR, Slug, Format, Free/Paid, Tagline EN/AR, Description EN/AR, Venue, Story Discovery Intro, Hero Image, Logo, Gallery 1–10, Status.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-2">
                <div className="text-xs font-bold text-blue-400 uppercase">{isAr ? "التبويب 2: ماذا يوجد بالداخل (What's Inside)" : "Tab 2: What’s Inside"}</div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Activity ID, Activity Name EN/AR, Description EN/AR, Classification, Primary Story Track, Secondary Story Tracks, Duration, Age Range, Accessibility, Cover Image, Additional Images 2–4, Video URL, Media Status, Content Status.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase">{isAr ? "التبويب 3: الأسعار والتذاكر (Pricing)" : "Tab 3: Pricing"}</div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Pricing ID, Package Name EN/AR, Category, Price (QAR), Duration, Description EN/AR, Included Activities, Free/Paid, Active Status, Display Order.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Missing Media Assignments Queue */}
        <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <span>{isAr ? "قائمة مهام إنتاج الوسائط" : "Media Production Queue"}</span>
                {metrics && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                    {filteredQueue.length} {isAr ? "معلق" : "Pending"}
                  </span>
                )}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isAr 
                  ? "الأنشطة والتجارب التي تتطلب صور غلاف أو صور إضافية داعمة (الهدف: 1 غلاف + 3 صور مساعدة)."
                  : "Activities requiring cover photos or supporting gallery imagery (Target: 1 cover + 3 supporting)."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={mediaStatusFilter}
                onChange={e => setMediaStatusFilter(e.target.value)}
                className="bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="ALL">{isAr ? "جميع الحالات" : "All Statuses"}</option>
                <option value="MISSING">{isAr ? "مفقود بالكامل" : "Missing Cover & Supporting"}</option>
                <option value="PARTIALLY_COMPLETE">{isAr ? "مكتمل جزئياً" : "Partially Complete"}</option>
              </select>
            </div>
          </div>

          {isLoading && !metrics ? (
            <div className="p-12 text-center text-xs text-[var(--text-tertiary)] space-y-2">
              <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
              <p>{isAr ? "جاري تحميل قائمة انتظار الوسائط..." : "Loading media production queue..."}</p>
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-tertiary)] space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-[var(--text-primary)]">
                {isAr ? "جميع متطلبات وسائط الأنشطة مكتملة وجاهزة!" : "All activity media requirements are satisfied!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" dir={isAr ? "rtl" : "ltr"}>
                <thead>
                  <tr className="border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-semibold uppercase text-[10px]">
                    <th className="pb-3">{isAr ? "الوجهة" : "Attraction"}</th>
                    <th className="pb-3">{isAr ? "اسم النشاط" : "Activity Title"}</th>
                    <th className="pb-3">{isAr ? "صورة الغلاف" : "Cover Image"}</th>
                    <th className="pb-3">{isAr ? "الصور المساعدة" : "Supporting Images"}</th>
                    <th className="pb-3">{isAr ? "الحالة" : "Status"}</th>
                    <th className="pb-3 text-right">{isAr ? "الإجراء" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {filteredQueue.slice(0, 10).map((item: any, idx: number) => {
                    const editorHref = localizeHref(`/dashboard/b2c/attractions/${item.attractionId || item.attractionSlug}/edit`, locale)
                    return (
                      <tr key={idx} className="hover:bg-[var(--surface-subtle)] transition-colors">
                        <td className="py-3 font-semibold text-[var(--text-primary)]">
                          {item.attractionName}
                        </td>
                        <td className="py-3 font-medium text-[var(--text-secondary)]">
                          {item.activityName}
                        </td>
                        <td className="py-3">
                          {item.hasCover ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isAr ? "تم الرفع" : "Uploaded"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{isAr ? "مفقودة" : "Missing"}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="font-mono text-[var(--text-secondary)]">
                            {item.supportingCount} / 3 {isAr ? "صور" : "images"}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            item.status === "READY" && "bg-emerald-500/20 text-emerald-400",
                            item.status === "PARTIALLY_COMPLETE" && "bg-amber-500/20 text-amber-400",
                            item.status === "MISSING" && "bg-red-500/20 text-red-400"
                          )}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={editorHref}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--e3-royal-blue)] text-[var(--text-primary)] border border-[var(--border-default)] text-[11px] font-bold transition-all"
                          >
                            <span>{isAr ? "فتح الاستوديو" : "Open Studio"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Attractions Completeness Roster */}
        <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <span>{isAr ? "سجل اكتمال الوجهات وتدقيق المعرض" : "Attraction Roster Completeness & Gallery Audit"}</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isAr 
                  ? "مؤشرات تفصيلية لكل وجهة لاكتمال المحتوى، التكافؤ العربي، وعدد صور المعرض مقابل الحد الأدنى (10 صور)."
                  : "Per-attraction metrics for content completeness, Arabic parity, and gallery count vs 10-photo minimum."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder={isAr ? "بحث عن وجهة..." : "Search attraction..."}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none w-48"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="ALL">{isAr ? "جميع حالات النشر" : "All Publication"}</option>
                <option value="PUBLISHED">{isAr ? "منشور Live" : "Published"}</option>
                <option value="DRAFT">{isAr ? "مسودة Draft" : "Draft"}</option>
              </select>
            </div>
          </div>

          {isLoading && !metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-3 animate-pulse">
                  <div className="h-4 bg-[var(--surface-default)] rounded w-32" />
                  <div className="h-3 bg-[var(--surface-default)] rounded w-20" />
                  <div className="h-16 bg-[var(--surface-default)] rounded" />
                </div>
              ))}
            </div>
          ) : filteredAttractions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-tertiary)]">
              <p>{isAr ? "لا توجد وجهات مطابقة لمعايير البحث." : "No attractions match the current filter criteria."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAttractions.map((a: any) => {
                const editorHref = localizeHref(`/dashboard/b2c/attractions/${a.id}/edit`, locale)
                return (
                  <div
                    key={a.id}
                    className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-4 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{isAr ? (a.nameAr || a.nameEn) : a.nameEn}</h4>
                        <p className="text-xs text-[var(--text-secondary)] font-mono">{a.slug}</p>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        a.isPublished ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      )}>
                        {a.isPublished ? (isAr ? "منشور" : "PUBLISHED") : (isAr ? "مسودة" : "DRAFT")}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-secondary)]">{isAr ? "اكتمال المحتوى:" : "Content Completeness:"}</span>
                        <span className="font-bold text-[var(--text-primary)]">{a.contentCompleteness}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-secondary)]">{isAr ? "التكافؤ العربي:" : "Arabic Translation:"}</span>
                        <span className="font-bold text-[var(--text-primary)]">{a.arabicCompleteness}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-secondary)]">{isAr ? "صور المعرض:" : "Gallery Photos:"}</span>
                        <span className={cn(
                          "font-bold",
                          a.galleryCount >= 10 ? "text-emerald-400" : "text-amber-400"
                        )}>
                          {a.galleryCount} / 10 {isAr ? "هدف" : "Target"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-secondary)]">{isAr ? "عدد الأنشطة:" : "Activities:"}</span>
                        <span className="font-bold text-[var(--text-primary)]">{a.activityCount}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[var(--border-default)]">
                      <a
                        href={`/api/b2c/attractions/master-workbook/export?attractionId=${a.id}`}
                        download
                        className="text-xs text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isAr ? "تصدير الجدول" : "Export Workbook"}</span>
                      </a>

                      <Link
                        href={editorHref}
                        className="text-xs text-[var(--text-primary)] hover:text-purple-400 font-semibold inline-flex items-center gap-1"
                      >
                        <span>{isAr ? "تعديل في الاستوديو" : "Edit Studio"}</span>
                        <ForwardIcon className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Interactive Master Workbook Import & Validation Modal */}
      <AttractionMasterWorkbookModal
        isOpen={isWorkbookModalOpen}
        onClose={() => setIsWorkbookModalOpen(false)}
        onImportComplete={() => {
          fetchMetrics()
        }}
      />
    </DashboardPageShell>
  )
}
