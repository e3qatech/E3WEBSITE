"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
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
  RefreshCw,
  Plus,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"
import { AttractionMasterWorkbookModal } from "./AttractionMasterWorkbookModal"
import { cn } from "@/lib/utils"

export function AttractionContentMediaDashboard() {
  const [metrics, setMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWorkbookModalOpen, setIsWorkbookModalOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [mediaStatusFilter, setMediaStatusFilter] = useState("ALL")
  const [showAdvancedMapping, setShowAdvancedMapping] = useState(false)

  const fetchMetrics = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/b2c/attractions/master-workbook/dashboard")
      const json = await res.json()
      if (json.success) {
        setMetrics(json.data)
      }
    } catch (e) {
      console.error("Failed to load metrics", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const filteredAttractions = metrics?.attractions?.filter((a: any) => {
    const q = search.toLowerCase()
    const matchesSearch = !q || a.nameEn.toLowerCase().includes(q) || a.nameAr.includes(q) || a.slug.toLowerCase().includes(q)
    const matchesStatus = statusFilter === "ALL" || (statusFilter === "PUBLISHED" && a.isPublished) || (statusFilter === "DRAFT" && !a.isPublished)
    return matchesSearch && matchesStatus
  }) || []

  const filteredQueue = metrics?.missingMediaQueue?.filter((item: any) => {
    const q = search.toLowerCase()
    const matchesSearch = !q || item.attractionName.toLowerCase().includes(q) || item.activityName.toLowerCase().includes(q)
    const matchesMedia = mediaStatusFilter === "ALL" || item.status === mediaStatusFilter
    return matchesSearch && matchesMedia
  }) || []

  return (
    <DashboardPageShell variant="wide">
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Header with Direct Actions */}
        <DashboardPageHeader
          title="Attraction Content & Media Studio"
          description="Unified 3-tab Master Workbook management, bilingual completeness tracking, and media queue verification."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "B2C Attractions", href: "/dashboard/b2c/attractions" },
            { label: "Master Workbook & Media" }
          ]}
          primaryAction={{
            label: "Import Master Workbook",
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
                <span>Export Master Workbook (.xlsx)</span>
              </a>
              <button
                type="button"
                onClick={fetchMetrics}
                className="p-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] transition-all cursor-pointer"
                title="Refresh Metrics"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </button>
            </div>
          }
        />

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
              <span>Content Complete</span>
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
              <span>Arabic Translation</span>
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
              <span>Gallery 10-Target</span>
              <ImageIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">
              {metrics?.overview?.galleryTargetMetCount ?? 0}
              <span className="text-sm font-normal text-[var(--text-tertiary)]"> / {metrics?.overview?.totalAttractions ?? 0}</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {metrics?.overview?.totalGalleryImages ?? 0} total photos uploaded
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
              <span>Activity Media</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-[var(--text-primary)]">
              {metrics?.overview?.activityMediaCompleteness ?? 0}%
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Target: 1 Cover + 3 Supporting Photos
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
              <span>Missing Media Queue</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">
              {metrics?.overview?.pendingMediaAssignmentsCount ?? 0}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Activities needing assets
            </p>
          </div>
        </div>

        {/* 3-Tab Architecture Quick Card */}
        <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                <span>Unified 3-Tab Master Workbook Structure</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Export existing content, edit offline with your creative and marketing teams, and re-import with safe deep merge.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdvancedMapping(!showAdvancedMapping)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] transition-all"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showAdvancedMapping ? "Hide Column Specs" : "View Column Specs"}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAdvancedMapping && "rotate-180")} />
              </button>
            </div>
          </div>

          {showAdvancedMapping && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[var(--border-default)] animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-2">
                <div className="text-xs font-bold text-purple-400 uppercase">Tab 1: Attraction</div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Attraction ID, Name EN/AR, Slug, Format, Free/Paid, Tagline EN/AR, Description EN/AR, Venue, Story Discovery Intro, Hero Image, Logo, Gallery 1–10, Status.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-2">
                <div className="text-xs font-bold text-blue-400 uppercase">Tab 2: What’s Inside</div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Activity ID, Activity Name EN/AR, Description EN/AR, Classification, Primary Story Track, Secondary Story Tracks, Duration, Age Range, Accessibility, Cover Image, Additional Images 2–4, Video URL, Media Status, Content Status.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase">Tab 3: Pricing</div>
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
                <span>Media Production Queue</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                  {filteredQueue.length} Pending
                </span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Activities requiring cover photos or supporting gallery imagery (Target: 1 cover + 3 supporting).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={mediaStatusFilter}
                onChange={e => setMediaStatusFilter(e.target.value)}
                className="bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="MISSING">Missing Cover & Supporting</option>
                <option value="PARTIALLY_COMPLETE">Partially Complete</option>
              </select>
            </div>
          </div>

          {filteredQueue.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-tertiary)] space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-[var(--text-primary)]">All activity media requirements are satisfied!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-semibold uppercase text-[10px]">
                    <th className="pb-3">Attraction</th>
                    <th className="pb-3">Activity Title</th>
                    <th className="pb-3">Cover Image</th>
                    <th className="pb-3">Supporting Images</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {filteredQueue.slice(0, 10).map((item: any, idx: number) => (
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
                            <span>Uploaded</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Missing</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-[var(--text-secondary)]">
                          {item.supportingCount} / 3 images
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
                          href={`/dashboard/b2c/attractions/${item.attractionSlug}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--e3-royal-blue)] text-[var(--text-primary)] border border-[var(--border-default)] text-[11px] font-bold transition-all"
                        >
                          <span>Open Studio</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
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
                <span>Attraction Roster Completeness & Gallery Audit</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Per-attraction metrics for content completeness, Arabic parity, and gallery count vs 10-photo minimum.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Search attraction..."
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
                <option value="ALL">All Publication</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAttractions.map((a: any) => (
              <div
                key={a.id}
                className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-4 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{a.nameEn}</h4>
                    <p className="text-xs text-[var(--text-secondary)] font-mono">{a.nameAr || a.slug}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    a.isPublished ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  )}>
                    {a.isPublished ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Content Completeness:</span>
                    <span className="font-bold text-[var(--text-primary)]">{a.contentCompleteness}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Arabic Translation:</span>
                    <span className="font-bold text-[var(--text-primary)]">{a.arabicCompleteness}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Gallery Photos:</span>
                    <span className={cn(
                      "font-bold",
                      a.galleryCount >= 10 ? "text-emerald-400" : "text-amber-400"
                    )}>
                      {a.galleryCount} / 10 Target
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Activities:</span>
                    <span className="font-bold text-[var(--text-primary)]">{a.activityCount}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[var(--border-default)]">
                  <a
                    href={`/api/b2c/attractions/master-workbook/export?slug=${a.slug}`}
                    download
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Workbook</span>
                  </a>

                  <Link
                    href={`/dashboard/b2c/attractions/${a.slug}/edit`}
                    className="text-xs text-[var(--text-primary)] hover:text-purple-400 font-semibold inline-flex items-center gap-1"
                  >
                    <span>Edit Studio</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
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
