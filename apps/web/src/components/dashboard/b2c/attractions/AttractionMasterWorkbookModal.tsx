"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  X,
  RefreshCw,
  Eye,
  ShieldCheck,
  Image as ImageIcon,
  Sparkles,
  Info,
  Check,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ValidationReport, ValidationRecordDiff } from "@/lib/attraction-master-workbook"

interface AttractionMasterWorkbookModalProps {
  isOpen: boolean
  onClose: () => void
  attractionSlug?: string
  attractionName?: string
  onImportComplete?: () => void
}

export function AttractionMasterWorkbookModal({
  isOpen,
  onClose,
  attractionSlug,
  attractionName,
  onImportComplete
}: AttractionMasterWorkbookModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [report, setReport] = useState<ValidationReport | null>(null)
  const [applied, setApplied] = useState(false)
  const [appliedCount, setAppliedCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>("ALL")

  if (!isOpen) return null

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0])
      setReport(null)
      setApplied(false)
      setErrorMessage(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setReport(null)
      setApplied(false)
      setErrorMessage(null)
    }
  }

  const runValidation = async (dryRun: boolean) => {
    if (!file) return
    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("dryRun", dryRun ? "true" : "false")
      formData.append("saveAsDraft", "true")

      const res = await fetch("/api/b2c/attractions/master-workbook/import", {
        method: "POST",
        body: formData
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || "Failed to process Master Workbook")
      }

      setReport(json.validationReport)

      if (!dryRun && json.applyResult) {
        setApplied(true)
        setAppliedCount(json.applyResult.appliedCount)
        if (onImportComplete) onImportComplete()
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during validation.")
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredDiffs = report?.diffs.filter(d => {
    if (activeFilter === "ALL") return true
    if (activeFilter === "CREATE") return d.action === "CREATE"
    if (activeFilter === "UPDATE") return d.action === "UPDATE"
    if (activeFilter === "WARNING") return d.action === "WARNING"
    if (activeFilter === "ERROR") return d.action === "ERROR"
    if (activeFilter === "MEDIA_MISSING") return d.mediaStatus === "MISSING" || d.mediaStatus === "PARTIALLY_COMPLETE"
    return true
  }) || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Attraction Master Workbook</span>
                {attractionName && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                    {attractionName}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Simple 3-Tab Architecture: Attraction • What’s Inside • Pricing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/api/b2c/attractions/master-workbook/export${attractionSlug ? `?slug=${attractionSlug}` : ""}`}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Download Current (.xlsx)</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* File Dropzone */}
          {!applied && (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById("masterWorkbookFileInput")?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3",
                file
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-slate-800 hover:border-purple-500/50 bg-[#0f172a]/40"
              )}
            >
              <input
                id="masterWorkbookFileInput"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {file ? (
                <div className="space-y-1">
                  <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="text-sm font-bold text-white">{file.name}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    {(file.size / 1024).toFixed(1)} KB • Ready for Safe Validation
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <UploadCloud className="w-10 h-10 text-purple-400 mx-auto opacity-80" />
                  <div className="text-sm font-bold text-white">
                    Upload Master Workbook (.xlsx / .csv)
                  </div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Blank cells will never erase existing content. Stable IDs and slugs ensure zero duplicates.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Applied Banner */}
          {applied && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Master Workbook Applied Successfully!</h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto">
                {appliedCount} records have been created or safely deep-merged as Drafts. Activities and their Media Queue requirements have been synchronized.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Return to Attraction Studio
                </button>
              </div>
            </div>
          )}

          {/* Validation Report */}
          {report && !applied && (
            <div className="space-y-6">
              
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Rows</div>
                  <div className="text-xl font-bold text-white">{report.totalRows}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <div className="text-[11px] text-emerald-400 uppercase font-semibold">To Create</div>
                  <div className="text-xl font-bold text-emerald-400">{report.createdCount}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                  <div className="text-[11px] text-blue-400 uppercase font-semibold">To Deep-Merge</div>
                  <div className="text-xl font-bold text-blue-400">{report.updatedCount}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <div className="text-[11px] text-amber-400 uppercase font-semibold">Warnings / Errors</div>
                  <div className="text-xl font-bold text-amber-400">{report.warningCount + report.errorCount}</div>
                </div>
              </div>

              {/* Media Queue Progress Targets */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span>Media Queue Targets:</span>
                  </span>
                  <span className="text-slate-400">
                    Attraction Gallery: 10 images min • Activity: 1 cover + 3 supporting
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] flex justify-between">
                    <span className="text-slate-400">Ready Media:</span>
                    <span className="font-bold text-emerald-400">{report.mediaQueueSummary.readyMediaCount}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] flex justify-between">
                    <span className="text-slate-400">Partial Media:</span>
                    <span className="font-bold text-amber-400">{report.mediaQueueSummary.partialMediaCount}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] flex justify-between">
                    <span className="text-slate-400">Missing Media:</span>
                    <span className="font-bold text-red-400">{report.mediaQueueSummary.missingMediaCount}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] flex justify-between">
                    <span className="text-slate-400">Gallery Target Met:</span>
                    <span className="font-bold text-purple-300">{report.mediaQueueSummary.attractionsMeetingGalleryTarget}/{report.mediaQueueSummary.totalAttractions}</span>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
                {[
                  { id: "ALL", label: `All (${report.diffs.length})` },
                  { id: "CREATE", label: `New (${report.createdCount})` },
                  { id: "UPDATE", label: `Updates (${report.updatedCount})` },
                  { id: "MEDIA_MISSING", label: "Media Pending" },
                  { id: "ERROR", label: `Errors (${report.errorCount})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                      activeFilter === tab.id
                        ? "bg-purple-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Diffs Preview List */}
              <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                {filteredDiffs.map((diff, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                          {diff.sheet} : Row {diff.rowNumber}
                        </span>
                        <span className="font-bold text-white">{diff.titleEn}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 space-y-0.5">
                        {diff.messages.map((msg, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-slate-500" />
                            <span>{msg}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        diff.action === 'CREATE' && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                        diff.action === 'UPDATE' && "bg-blue-500/20 text-blue-300 border border-blue-500/30",
                        diff.action === 'UNCHANGED' && "bg-slate-800 text-slate-400",
                        diff.action === 'WARNING' && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                        diff.action === 'ERROR' && "bg-red-500/20 text-red-300 border border-red-500/30"
                      )}>
                        {diff.action}
                      </span>
                      {diff.mediaStatus && (
                        <span className={cn(
                          "text-[9px] font-mono",
                          diff.mediaStatus === "READY" ? "text-emerald-400" : diff.mediaStatus === "PARTIALLY_COMPLETE" ? "text-amber-400" : "text-red-400"
                        )}>
                          Media: {diff.mediaStatus}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        {!applied && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#0f172a]/70">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safe Merge: Existing content is strictly preserved.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
              >
                Cancel
              </button>

              {file && !report && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => runValidation(true)}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isProcessing ? "Validating..." : "1. Validate Workbook"}</span>
                </button>
              )}

              {report && (
                <button
                  type="button"
                  disabled={isProcessing || !report.isValid}
                  onClick={() => runValidation(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isProcessing ? "Applying..." : "2. Apply as Draft"}</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
