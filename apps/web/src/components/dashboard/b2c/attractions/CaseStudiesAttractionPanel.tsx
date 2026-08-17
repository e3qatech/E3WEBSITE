"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Briefcase,
  ExternalLink,
  Plus,
  Unlink,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  Sparkles,
  Building,
  Calendar,
  Layers
} from "lucide-react"
import { cn } from "@/lib/utils"
import { localizeHref } from "@/lib/url-helper"

interface LinkedCaseStudy {
  id: string
  slug: string
  titleEn: string
  titleAr?: string
  clientName?: string
  year?: number
  category?: string
  thumbnailUrl?: string
  isPublished?: boolean
  attractionId?: string | null
}

interface CaseStudiesAttractionPanelProps {
  attractionId?: string
  attractionNameEn: string
  attractionNameAr: string
  attractionSlug: string
  heroMediaUrl?: string
  heroThumbnailUrl?: string
  logoUrl?: string
  descriptionEn?: string
  descriptionAr?: string
  linkedLocations?: any[]
  isB2bVisible: boolean
  onToggleB2bVisible: (val: boolean) => void
  locale?: string
}

export function CaseStudiesAttractionPanel({
  attractionId,
  attractionNameEn,
  attractionNameAr,
  attractionSlug,
  heroMediaUrl,
  heroThumbnailUrl,
  logoUrl,
  descriptionEn,
  descriptionAr,
  linkedLocations = [],
  isB2bVisible,
  onToggleB2bVisible,
  locale = "en"
}: CaseStudiesAttractionPanelProps) {
  const isAr = locale === "ar"
  const [linkedCases, setLinkedCases] = useState<LinkedCaseStudy[]>([])
  const [allCases, setAllCases] = useState<LinkedCaseStudy[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedExistingId, setSelectedExistingId] = useState("")
  const [isLinking, setIsLinking] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Resolved clean location name (prevent [object Object])
  const resolvedLocationName = React.useMemo(() => {
    if (!linkedLocations || linkedLocations.length === 0) return ""
    const primary = linkedLocations.find(l => l.isPrimary) || linkedLocations[0]
    if (typeof primary?.location === "object" && primary.location !== null) {
      return isAr ? (primary.location.nameAr || primary.location.nameEn) : (primary.location.nameEn || primary.location.nameAr)
    }
    if (typeof primary?.nameEn === "string") {
      return isAr ? (primary.nameAr || primary.nameEn) : (primary.nameEn || primary.nameAr)
    }
    return ""
  }, [linkedLocations, isAr])

  // Prefill state for create modal
  const [newCaseClient, setNewCaseClient] = useState("E3 Experiences Qatar")
  const [newCaseCategory, setNewCaseCategory] = useState("Entertainment Destination")
  const [newCaseYear, setNewCaseYear] = useState(new Date().getFullYear().toString())
  const [newCaseSlug, setNewCaseSlug] = useState(() => `${attractionSlug || "attraction"}-case-study`)

  const fetchCases = async () => {
    if (!attractionId) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/b2b/cases?all=true")
      if (res.ok) {
        const json = await res.json()
        const cases: LinkedCaseStudy[] = json.caseStudies || []
        setAllCases(cases)
        setLinkedCases(cases.filter(c => c.attractionId === attractionId))
      }
    } catch (e) {
      console.error("Failed to load case studies", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (attractionId) {
      fetchCases()
    }
  }, [attractionId])

  const handleLinkExisting = async () => {
    if (!selectedExistingId || !attractionId) return
    setIsLinking(true)
    setFeedbackMsg(null)
    try {
      const target = allCases.find(c => c.id === selectedExistingId)
      if (!target) return

      const res = await fetch(`/api/b2b/cases/${selectedExistingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...target,
          attractionId
        })
      })

      if (!res.ok) throw new Error("Failed to link case study")

      setFeedbackMsg({ type: "success", text: isAr ? "تم ربط دراسة الحالة بنجاح" : "Case study linked successfully" })
      setSelectedExistingId("")
      fetchCases()
    } catch (e: any) {
      setFeedbackMsg({ type: "error", text: e.message || "Failed to link" })
    } finally {
      setIsLinking(false)
    }
  }

  const handleUnlink = async (caseStudy: LinkedCaseStudy) => {
    if (!confirm(isAr ? "هل أنت متأكد من إلغاء ربط دراسة الحالة هذه؟" : "Unlink this case study from the attraction?")) return
    try {
      const res = await fetch(`/api/b2b/cases/${caseStudy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...caseStudy,
          attractionId: null
        })
      })
      if (res.ok) {
        fetchCases()
        setFeedbackMsg({ type: "success", text: isAr ? "تم إلغاء الربط" : "Case study unlinked" })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateCaseStudy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!attractionNameEn.trim() || !newCaseSlug.trim()) return

    setIsCreating(true)
    setFeedbackMsg(null)
    try {
      const payload = {
        titleEn: attractionNameEn,
        titleAr: attractionNameAr || attractionNameEn,
        slug: newCaseSlug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        clientName: newCaseClient,
        category: newCaseCategory,
        year: parseInt(newCaseYear) || new Date().getFullYear(),
        heroImageUrl: heroMediaUrl || null,
        thumbnailUrl: heroThumbnailUrl || heroMediaUrl || null,
        clientLogoUrl: logoUrl || null,
        challengeEn: descriptionEn || null,
        challengeAr: descriptionAr || null,
        solutionEn: `Full-scale experiential engineering and turnkey operational deployment by E3 for ${attractionNameEn}.`,
        solutionAr: `تصميم وتنفيذ وتشغيل متكامل للتجربة الترفيهية بواسطة إي ثري لـ ${attractionNameAr || attractionNameEn}.`,
        resultEn: `Operational success with world-class guest satisfaction at ${resolvedLocationName || "Qatar"}.`,
        resultAr: `نجاح تشغيلي مستدام مع أعلى معدلات رضا الزوار في ${resolvedLocationName || "قطر"}.`,
        isPublished: false,
        attractionId: attractionId || null,
        technicalSpecs: resolvedLocationName ? [{ labelEn: "Location", labelAr: "الموقع", valueEn: resolvedLocationName, valueAr: resolvedLocationName }] : []
      }

      const res = await fetch("/api/b2b/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || "Failed to create case study")
      }

      setShowCreateModal(false)
      setFeedbackMsg({
        type: "success",
        text: isAr ? "تم إنشاء دراسة الحالة وربطها بنجاح كمسودة" : "Case study created & linked as draft snapshot"
      })
      fetchCases()
    } catch (e: any) {
      setFeedbackMsg({ type: "error", text: e.message || "Failed to create case study" })
    } finally {
      setIsCreating(false)
    }
  }

  const unlinkedCases = allCases.filter(c => c.attractionId !== attractionId)

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="p-6 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-level-1)]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {isAr ? "دراسات الحالة وروابط قطاع الأعمال (B2B Case Studies)" : "B2B Portfolio & Linked Case Studies"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr
                ? "إدارة ظهور المشروع في معرض أعمال B2B وربط دراسات الحالة المتخصصة دون تكرار إدخال البيانات."
                : "Manage B2B directory visibility and link one or multiple case studies to this canonical attraction."}
            </p>
          </div>
        </div>

        {/* B2B Portfolio Visibility Toggle */}
        <div className="flex items-center gap-3 bg-[var(--surface-subtle)] p-2 rounded-2xl border border-[var(--border-level-1)]">
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            {isAr ? "الظهور في معرض B2B" : "Show in B2B Portfolio"}
          </span>
          <button
            type="button"
            onClick={() => onToggleB2bVisible(!isB2bVisible)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
              isB2bVisible ? "bg-blue-600" : "bg-slate-700"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                isB2bVisible ? (isAr ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className={cn(
          "p-3 rounded-2xl text-xs font-medium flex items-center gap-2",
          feedbackMsg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400"
        )}>
          {feedbackMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Linked Case Studies Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {isAr ? `دراسات الحالة المرتبطة (${linkedCases.length})` : `Linked Case Studies (${linkedCases.length})`}
          </span>
          <button
            type="button"
            disabled={!attractionId}
            onClick={() => {
              setNewCaseSlug(`${attractionSlug || "attraction"}-case-study`)
              setShowCreateModal(true)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? "إنشاء دراسة حالة من الوجهة" : "Create Case Study from Attraction"}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
            {isAr ? "جاري تحميل دراسات الحالة..." : "Loading case studies..."}
          </div>
        ) : linkedCases.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[var(--surface-subtle)] border border-dashed border-[var(--border-level-2)] text-center space-y-2">
            <Briefcase className="w-6 h-6 mx-auto text-[var(--text-tertiary)]" />
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr
                ? "لا توجد دراسات حالة مرتبطة بهذه الوجهة حالياً. يمكنك إنشاء دراسة حالة جديدة بنقرة واحدة أو ربط دراسة موجودة."
                : "No case studies are currently linked to this attraction. Create a new case study snapshot or link an existing one below."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {linkedCases.map(cs => (
              <div
                key={cs.id}
                className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] flex items-center justify-between gap-3 hover:border-blue-500/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {cs.thumbnailUrl ? (
                    <img src={cs.thumbnailUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-[var(--border-level-1)] shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {isAr ? (cs.titleAr || cs.titleEn) : cs.titleEn}
                      </h4>
                      <span className={cn(
                        "px-1.5 py-0.2 rounded-sm text-[9px] font-bold uppercase",
                        cs.isPublished ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {cs.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate">
                      {cs.clientName || "E3 Experiences"} • {cs.year || "2024"} • {cs.category || "Entertainment"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={localizeHref(`/dashboard/b2b/cases/${cs.id}`, locale)}
                    target="_blank"
                    className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-blue-500 hover:bg-[var(--surface-hover)] transition-colors"
                    title={isAr ? "فتح في محرر دراسات الحالة" : "Open in Case Study Studio"}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleUnlink(cs)}
                    className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title={isAr ? "إلغاء الربط" : "Unlink"}
                  >
                    <Unlink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link Existing Case Study Dropdown */}
      {unlinkedCases.length > 0 && attractionId && (
        <div className="pt-4 border-t border-[var(--border-level-1)] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
              {isAr ? "أو ربط دراسة حالة موجودة مسبقاً:" : "Or link an existing B2B Case Study:"}
            </label>
            <select
              value={selectedExistingId}
              onChange={e => setSelectedExistingId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-blue-500"
            >
              <option value="">{isAr ? "-- اختر دراسة حالة --" : "-- Select existing case study --"}</option>
              {unlinkedCases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.titleEn} ({c.clientName || 'Client'} - {c.year})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={!selectedExistingId || isLinking}
            onClick={handleLinkExisting}
            className="sm:self-end h-10 px-4 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-primary)] transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>{isLinking ? (isAr ? "جاري الربط..." : "Linking...") : (isAr ? "ربط دراسة الحالة" : "Link Selected")}</span>
          </button>
        </div>
      )}

      {/* Create Case Study Prefilled Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            dir={isAr ? "rtl" : "ltr"}
            className="w-full max-w-lg bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-level-1)]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {isAr ? "إنشاء دراسة حالة من الوجهة" : "Create Case Study Snapshot"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCaseStudy} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1">
                <p className="font-bold">
                  {isAr ? "البيانات المنسوخة تلقائياً:" : "Automatically prefilled snapshot fields:"}
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-300/80">
                  <li>{isAr ? `اسم المشروع: ${attractionNameEn}` : `Project Title: ${attractionNameEn}`}</li>
                  <li>{isAr ? `وسائط الهيرو والصور الترويجية والشعار` : `Hero & thumbnail media + brand logo`}</li>
                  <li>{isAr ? `الموقع المعتمد: ${resolvedLocationName || "قطر"}` : `Canonical GIS Location: ${resolvedLocationName || "Qatar"}`}</li>
                  <li>{isAr ? `الوصف والتفاصيل التمهيدية كمسودة غير منشورة` : `Initial overview & narrative as an unpublished draft`}</li>
                </ul>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "العميل / الشريك" : "Client / Partner Name"}
                  </label>
                  <input
                    type="text"
                    value={newCaseClient}
                    onChange={e => setNewCaseClient(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[var(--text-secondary)] block mb-1">
                      {isAr ? "فئة دراسة الحالة" : "Category"}
                    </label>
                    <input
                      type="text"
                      value={newCaseCategory}
                      onChange={e => setNewCaseCategory(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[var(--text-secondary)] block mb-1">
                      {isAr ? "سنة الإنجاز" : "Year"}
                    </label>
                    <input
                      type="number"
                      value={newCaseYear}
                      onChange={e => setNewCaseYear(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "الاسم اللطيف للرابط (Slug)" : "Case Study URL Slug"}
                  </label>
                  <input
                    type="text"
                    value={newCaseSlug}
                    onChange={e => setNewCaseSlug(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-[var(--text-primary)] font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-level-1)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isCreating ? (isAr ? "جاري الإنشاء..." : "Creating...") : (isAr ? "إنشاء دراسة الحالة" : "Create Case Study")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
