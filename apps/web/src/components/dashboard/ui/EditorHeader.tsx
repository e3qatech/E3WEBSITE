"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Eye,
  Save,
  AlertTriangle,
  X,
  Layers
} from "lucide-react"
import { cn } from "@/lib/utils"
import { localizeHref } from "@/lib/url-helper"

export interface EditorHeaderBreadcrumb {
  label: string
  labelAr?: string
  href?: string
}

export interface EditorHeaderProps {
  title: string
  titleAr?: string
  subtitle?: string
  statusBadge?: {
    label: string
    labelAr?: string
    variant?: "published" | "draft" | "warning" | "purple" | "blue"
  }
  backHref: string
  backLabel: string
  backLabelAr?: string
  breadcrumbs?: EditorHeaderBreadcrumb[]
  stages?: Array<{ id: string; labelEn: string; labelAr: string }>
  currentStageIndex?: number
  onPrevStage?: () => void
  onNextStage?: () => void
  isDirty?: boolean
  onSave?: () => void
  isSaving?: boolean
  saveLabel?: string
  saveLabelAr?: string
  previewUrl?: string
  locale?: string
  extraActions?: React.ReactNode
  className?: string
  focusModeToggle?: {
    isFocusMode: boolean
    onToggle: () => void
    label?: string
    labelAr?: string
  }
}

export function EditorHeader({
  title,
  titleAr,
  subtitle,
  statusBadge,
  backHref,
  backLabel,
  backLabelAr,
  breadcrumbs = [],
  stages,
  currentStageIndex = 0,
  onPrevStage,
  onNextStage,
  isDirty = false,
  onSave,
  isSaving = false,
  saveLabel = "Save Changes",
  saveLabelAr = "حفظ التغييرات",
  previewUrl,
  locale = "en",
  extraActions,
  className,
  focusModeToggle
}: EditorHeaderProps) {
  const router = useRouter()
  const isAr = locale === "ar"
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [targetNavigationHref, setTargetNavigationHref] = useState<string | null>(null)

  // Warn on page unload/refresh if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isDirty) {
      setTargetNavigationHref(backHref)
      setShowUnsavedModal(true)
      return
    }
    executeBackNavigation(backHref)
  }

  const executeBackNavigation = (href: string) => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push(localizeHref(href, locale))
    }
  }

  const confirmLeave = () => {
    setShowUnsavedModal(false)
    if (targetNavigationHref) {
      executeBackNavigation(targetNavigationHref)
    }
  }

  const badgeVariants: Record<string, string> = {
    published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    draft: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    warning: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
  }

  return (
    <>
      <header
        dir={isAr ? "rtl" : "ltr"}
        className={cn(
          "sticky top-0 z-40 bg-[var(--surface-default)]/95 backdrop-blur-xl border-b border-[var(--border-level-1)] px-4 py-3 sm:px-6 shadow-sm",
          className
        )}
      >
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left Cluster: Back Navigation & Identity */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Labeled Back Button with proper RTL Arrow */}
            <button
              type="button"
              onClick={handleBackClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0 shadow-xs cursor-pointer"
              title={isAr ? (backLabelAr || backLabel) : backLabel}
            >
              {isAr ? (
                <ArrowRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowLeft className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {isAr ? (backLabelAr || backLabel) : backLabel}
              </span>
              <span className="sm:hidden">
                {isAr ? "رجوع" : "Back"}
              </span>
            </button>

            {/* Breadcrumbs & Title */}
            <div className="min-w-0 flex-1">
              {breadcrumbs.length > 0 && (
                <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)] mb-0.5">
                  {breadcrumbs.map((b, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && (
                        <span className="opacity-40">/</span>
                      )}
                      {b.href ? (
                        <Link
                          href={localizeHref(b.href, locale)}
                          className="hover:text-[var(--text-secondary)] transition-colors"
                        >
                          {isAr ? (b.labelAr || b.label) : b.label}
                        </Link>
                      ) : (
                        <span>{isAr ? (b.labelAr || b.label) : b.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight truncate max-w-[220px] sm:max-w-md">
                  {isAr ? (titleAr || title) : title}
                </h1>
                {statusBadge && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0",
                      badgeVariants[statusBadge.variant || "draft"]
                    )}
                  >
                    {isAr ? (statusBadge.labelAr || statusBadge.label) : statusBadge.label}
                  </span>
                )}
                {isDirty && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {isAr ? "تغييرات غير محفوظة" : "Unsaved changes"}
                  </span>
                )}
              </div>

              {subtitle && (
                <p className="text-[11px] text-[var(--text-secondary)] truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Cluster: Stage Navigation & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Stage Prev / Next Buttons */}
            {stages && stages.length > 1 && (
              <div className="hidden sm:inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)]">
                <button
                  type="button"
                  disabled={currentStageIndex <= 0}
                  onClick={onPrevStage}
                  className="px-2 py-1 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title={isAr ? "المرحلة السابقة" : "Previous Stage"}
                >
                  {isAr ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
                <span className="text-[11px] font-semibold text-[var(--text-tertiary)] px-1">
                  {currentStageIndex + 1} / {stages.length}
                </span>
                <button
                  type="button"
                  disabled={currentStageIndex >= stages.length - 1}
                  onClick={onNextStage}
                  className="px-2 py-1 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title={isAr ? "المرحلة التالية" : "Next Stage"}
                >
                  {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Focus Mode Toggle */}
            {focusModeToggle && (
              <button
                type="button"
                onClick={focusModeToggle.onToggle}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs",
                  focusModeToggle.isFocusMode
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300 ring-2 ring-purple-500/30"
                    : "bg-[var(--surface-subtle)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                )}
                title="Toggle Focus Mode (Esc to exit)"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">
                  {focusModeToggle.isFocusMode
                    ? (isAr ? "إنهاء وضع التركيز (Esc)" : "Exit Focus Mode (Esc)")
                    : (isAr ? (focusModeToggle.labelAr || "وضع التركيز الكامل") : (focusModeToggle.label || "Focus Mode"))
                  }
                </span>
              </button>
            )}

            {/* Public Live Preview */}
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden sm:inline">{isAr ? "معاينة مباشرة" : "Preview"}</span>
              </a>
            )}

            {/* Extra Custom Actions */}
            {extraActions}

            {/* Primary Save Button */}
            {onSave && (
              <button
                type="button"
                disabled={isSaving}
                onClick={onSave}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>
                  {isSaving
                    ? (isAr ? "جاري الحفظ..." : "Saving...")
                    : (isAr ? saveLabelAr : saveLabel)
                  }
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            dir={isAr ? "rtl" : "ltr"}
            className="w-full max-w-md bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {isAr ? "تغييرات غير محفوظة" : "Unsaved Changes"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isAr
                    ? "لديك تعديلات لم يتم حفظها بعد. هل أنت متأكد من مغادرة هذه الصفحة؟"
                    : "You have unsaved changes in this editor. Are you sure you want to leave?"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-level-1)]">
              <button
                type="button"
                onClick={() => setShowUnsavedModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                {isAr ? "البقاء والمتابعة" : "Stay & Keep Editing"}
              </button>
              <button
                type="button"
                onClick={confirmLeave}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition-colors"
              >
                {isAr ? "مغادرة دون حفظ" : "Discard & Leave"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
