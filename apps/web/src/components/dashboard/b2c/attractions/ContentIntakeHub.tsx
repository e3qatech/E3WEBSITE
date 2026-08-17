"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sliders,
  History,
  Undo2,
  Trash2,
  FileCheck,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  X,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

export type IntakeTab = 'smart_doc' | 'spreadsheet' | 'export_reimport' | 'media' | 'history'

interface ContentIntakeHubProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialTab?: IntakeTab
}

export function ContentIntakeHub({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'smart_doc'
}: ContentIntakeHubProps) {
  const [activeTab, setActiveTab] = useState<IntakeTab>(initialTab)

  // Smart Document State
  const [docText, setDocText] = useState("")
  const [docFile, setDocFile] = useState<File | null>(null)
  const [isProcessingDoc, setIsProcessingDoc] = useState(false)
  const [extractedDocData, setExtractedDocData] = useState<any | null>(null)

  // Spreadsheet State
  const [spreadsheetFile, setSpreadsheetFile] = useState<File | null>(null)
  const [isProcessingSpreadsheet, setIsProcessingSpreadsheet] = useState(false)
  const [isDryRun, setIsDryRun] = useState(true)
  const [spreadsheetReport, setSpreadsheetReport] = useState<any | null>(null)
  const [importMode, setImportMode] = useState<'fill_missing' | 'update_all' | 'create_only'>('fill_missing')

  // History State
  const [importJobs, setImportJobs] = useState<any[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [rollingBackId, setRollingBackId] = useState<string | null>(null)

  // Feedback State
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'history' && isOpen) {
      loadImportJobs()
    }
  }, [activeTab, isOpen])

  const loadImportJobs = async () => {
    setIsLoadingJobs(true)
    try {
      const res = await fetch('/api/b2c/attractions/import/jobs')
      if (res.ok) {
        const json = await res.json()
        setImportJobs(json.data || [])
      }
    } catch (err) {
      console.error("Failed to load import jobs", err)
    } finally {
      setIsLoadingJobs(false)
    }
  }

  // Handle Smart Document Extraction
  const handleSmartDocProcess = async () => {
    if (!docText.trim() && !docFile) {
      setErrorMessage("Please enter document text or upload a document file.")
      return
    }

    setIsProcessingDoc(true)
    setErrorMessage(null)
    try {
      const formData = new FormData()
      if (docFile) {
        formData.append("file", docFile)
      }
      formData.append("text", docText)

      const res = await fetch('/api/b2c/attractions/ai-intake', {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || "Failed to extract structured content")
      }

      const json = await res.json()
      setExtractedDocData(json.data)
      setSuccessMessage("Content parsed and structured successfully!")
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process document")
    } finally {
      setIsProcessingDoc(false)
    }
  }

  // Handle Spreadsheet Upload & Diff Review
  const handleSpreadsheetUpload = async (forceDryRun: boolean = true) => {
    if (!spreadsheetFile) {
      setErrorMessage("Please select an Excel or CSV file.")
      return
    }

    setIsProcessingSpreadsheet(true)
    setErrorMessage(null)
    try {
      const formData = new FormData()
      formData.append("file", spreadsheetFile)
      formData.append("dryRun", String(forceDryRun))
      formData.append("importMode", importMode)

      const res = await fetch('/api/b2c/attractions/import', {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || "Failed to process spreadsheet")
      }

      const json = await res.json()
      setSpreadsheetReport(json.report)

      if (!forceDryRun) {
        setSuccessMessage(`Successfully applied ${json.report.created} new records and updated ${json.report.updated} existing records!`)
        if (onSuccess) onSuccess()
      } else {
        setSuccessMessage("Dry run validation complete. Review proposed changes below before committing.")
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Spreadsheet processing failed")
    } finally {
      setIsProcessingSpreadsheet(false)
    }
  }

  // Rollback Import Job
  const handleRollback = async (jobId: string) => {
    if (!confirm("Are you sure you want to rollback this import batch? Newly created draft records will be unpublished.")) {
      return
    }

    setRollingBackId(jobId)
    try {
      const res = await fetch('/api/b2c/attractions/import/jobs', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ROLLBACK", jobId })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Rollback failed")
      }

      setSuccessMessage("Import batch rolled back successfully.")
      loadImportJobs()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to rollback batch")
    } finally {
      setRollingBackId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-5xl bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-level-1)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)]">
                Unified Content Intake & Import Hub
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Smart document extraction, 8-sheet Excel workbook sync, and batch rollback audit
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2 border-b border-[var(--border-level-1)] bg-[var(--surface-subtle)] flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('smart_doc')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
              activeTab === 'smart_doc'
                ? "bg-purple-600 text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Smart Document (OCR / Text)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spreadsheet')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
              activeTab === 'spreadsheet'
                ? "bg-purple-600 text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            )}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Spreadsheet Import</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export_reimport')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
              activeTab === 'export_reimport'
                ? "bg-purple-600 text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            )}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export & Re-import</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
              activeTab === 'history'
                ? "bg-purple-600 text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>Import Audit Dashboard</span>
          </button>
        </div>

        {/* Notices */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 py-2 bg-red-500/10 border-b border-red-500/20 text-xs text-red-400 font-bold flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-xs text-emerald-400 font-bold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: SMART DOCUMENT INTAKE */}
          {/* ========================================================================= */}
          {activeTab === 'smart_doc' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Smart Document Extraction
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Paste marketing copy, press releases, or briefs. The engine extracts attraction names, activities, pricing passes, and story tracks without overwriting existing production records.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  Paste Document Text / OCR Content
                </label>
                <textarea
                  rows={8}
                  placeholder="Paste attraction overview, activities, session timings, and ticket details here..."
                  value={docText}
                  onChange={e => setDocText(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] font-mono resize-y focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  Non-destructive: parsed results are proposed as a draft for your review.
                </span>
                <button
                  type="button"
                  disabled={isProcessingDoc || !docText.trim()}
                  onClick={handleSmartDocProcess}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isProcessingDoc ? "Parsing..." : "Extract Structured Content"}</span>
                </button>
              </div>

              {/* Extracted Preview Card */}
              {extractedDocData && (
                <div className="p-5 rounded-2xl bg-[var(--surface-default)] border border-purple-500/30 shadow-md space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-level-1)]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">
                        Extracted Draft: {extractedDocData.nameEn}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      Confidence: {extractedDocData.confidence || "95%"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-[var(--text-secondary)] block">URL Slug:</span>
                      <span className="font-mono text-purple-400">{extractedDocData.slug}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[var(--text-secondary)] block">Tagline:</span>
                      <span>{extractedDocData.taglineEn}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-bold text-[var(--text-secondary)] block">Overview:</span>
                      <p className="text-[var(--text-secondary)]">{extractedDocData.descriptionEn}</p>
                    </div>
                    <div>
                      <span className="font-bold text-[var(--text-secondary)] block">Activities Extracted:</span>
                      <span>{extractedDocData.features?.length || 0} activities</span>
                    </div>
                    <div>
                      <span className="font-bold text-[var(--text-secondary)] block">Pricing Passes Extracted:</span>
                      <span>{extractedDocData.pricing?.length || 0} passes</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-level-1)] flex justify-end">
                    <a
                      href={`/dashboard/b2c/attractions/create?prefill=${encodeURIComponent(JSON.stringify(extractedDocData))}`}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open in Attraction Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SPREADSHEET IMPORT */}
          {/* ========================================================================= */}
          {activeTab === 'spreadsheet' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  8-Sheet Excel Workbook Import
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Supports sheets: Attractions, Locations, Activities, Pricing, Gallery, FAQs, Partners, Social. Blank cells never erase existing values.
                </p>
              </div>

              {/* Import Mode Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setImportMode('fill_missing')}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all cursor-pointer",
                    importMode === 'fill_missing'
                      ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                      : "bg-[var(--surface-subtle)] border-[var(--border-level-2)] text-[var(--text-secondary)]"
                  )}
                >
                  <span className="text-xs font-bold block mb-0.5">Fill Missing Fields Only</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] block">Preserves all existing production data</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('update_all')}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all cursor-pointer",
                    importMode === 'update_all'
                      ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                      : "bg-[var(--surface-subtle)] border-[var(--border-level-2)] text-[var(--text-secondary)]"
                  )}
                >
                  <span className="text-xs font-bold block mb-0.5">Deep Merge & Update</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] block">Updates non-empty values from workbook</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('create_only')}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all cursor-pointer",
                    importMode === 'create_only'
                      ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                      : "bg-[var(--surface-subtle)] border-[var(--border-level-2)] text-[var(--text-secondary)]"
                  )}
                >
                  <span className="text-xs font-bold block mb-0.5">Create New Records Only</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] block">Skips any matching existing slugs</span>
                </button>
              </div>

              {/* File Input */}
              <div className="p-8 border-2 border-dashed border-[var(--border-level-2)] rounded-3xl text-center space-y-3">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-purple-400" />
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Excel Workbook (.xlsx / .csv)</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) setSpreadsheetFile(file)
                      }}
                      className="hidden"
                    />
                  </label>
                  {spreadsheetFile && (
                    <p className="text-xs font-mono text-emerald-400 mt-2 font-bold">
                      Selected: {spreadsheetFile.name} ({(spreadsheetFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isProcessingSpreadsheet || !spreadsheetFile}
                  onClick={() => handleSpreadsheetUpload(true)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-level-2)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-primary)] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dry Run (Validate Only)</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessingSpreadsheet || !spreadsheetFile}
                  onClick={() => handleSpreadsheetUpload(false)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>{isProcessingSpreadsheet ? "Processing..." : "Commit Import"}</span>
                </button>
              </div>

              {/* Diff Report View */}
              {spreadsheetReport && (
                <div className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-level-1)]">
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">
                      Import Preview Report ({spreadsheetReport.dryRun ? "Dry Run" : "Committed"})
                    </h4>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-emerald-400">+{spreadsheetReport.created} Created</span>
                      <span className="text-blue-400">~{spreadsheetReport.updated} Updated</span>
                      <span className="text-amber-400">!{spreadsheetReport.skipped} Skipped</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {spreadsheetReport.diffs?.map((d: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[var(--text-primary)]">{d.nameEn}</span>
                          <span className="text-[var(--text-tertiary)] font-mono text-[10px] ml-2">({d.slug})</span>
                          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{d.details?.join(" • ")}</p>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold font-mono",
                          d.action === 'CREATE' ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                        )}>
                          {d.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: EXPORT & RE-IMPORT */}
          {/* ========================================================================= */}
          {activeTab === 'export_reimport' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Export Current Production Catalog
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Download all attractions, story tracks, locations, and pricing passes into a pre-structured 8-sheet Excel file. Edit offline and re-import.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="/api/b2c/attractions/export"
                  download="E3_Attractions_Catalog.xlsx"
                  className="p-6 rounded-3xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] hover:border-purple-500/50 transition-all flex flex-col items-center justify-center text-center space-y-3 group cursor-pointer"
                >
                  <Download className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Download Full Catalog (.xlsx)</h4>
                    <p className="text-xs text-[var(--text-secondary)]">Includes all 34 canonical attractions + features</p>
                  </div>
                </a>

                <a
                  href="/api/b2c/attractions/export?template=true"
                  download="E3_Attractions_Template.xlsx"
                  className="p-6 rounded-3xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] hover:border-purple-500/50 transition-all flex flex-col items-center justify-center text-center space-y-3 group cursor-pointer"
                >
                  <FileSpreadsheet className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Download Blank Template (.xlsx)</h4>
                    <p className="text-xs text-[var(--text-secondary)]">8 empty formatted sheets ready for data entry</p>
                  </div>
                </a>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: IMPORT AUDIT DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-level-1)]">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Import Audit Trail & Rollback History
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Review past batch executions and revert accidental changes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadImportJobs}
                  className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <RefreshCw className={cn("w-4 h-4", isLoadingJobs && "animate-spin")} />
                </button>
              </div>

              <div className="space-y-3">
                {importJobs.map(job => (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-400">{job.batchNumber}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold",
                          job.status === 'APPLIED' ? "bg-emerald-500/10 text-emerald-400" : job.status === 'ROLLED_BACK' ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                        )}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-[var(--text-secondary)]">
                        File: {job.fileName} • By: {job.uploadedBy} • {new Date(job.createdAt).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-tertiary)]">
                        <span>+{job.recordsCreated} Created</span>
                        <span>~{job.recordsUpdated} Updated</span>
                        <span>!{job.recordsSkipped} Skipped</span>
                      </div>
                    </div>

                    {job.status === 'APPLIED' && (
                      <button
                        type="button"
                        disabled={rollingBackId === job.id}
                        onClick={() => handleRollback(job.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-center"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>{rollingBackId === job.id ? "Reverting..." : "Rollback Batch"}</span>
                      </button>
                    )}
                  </div>
                ))}

                {importJobs.length === 0 && !isLoadingJobs && (
                  <div className="p-8 text-center text-xs text-[var(--text-tertiary)] border border-dashed border-[var(--border-level-2)] rounded-2xl">
                    No import jobs recorded yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
