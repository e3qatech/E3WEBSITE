"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Eye,
  ShieldCheck,
  ChevronRight
} from "lucide-react"

import {
  DashboardPageShell,
  DashboardPageHeader
} from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

export default function BulkImportCenterPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dryRunReport, setDryRunReport] = useState<any | null>(null)
  const [executionReport, setExecutionReport] = useState<any | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0])
      setDryRunReport(null)
      setExecutionReport(null)
      setErrorMessage(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setDryRunReport(null)
      setExecutionReport(null)
      setErrorMessage(null)
    }
  }

  const runProcess = async (isDryRun: boolean) => {
    if (!file) return
    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("dryRun", isDryRun ? "true" : "false")

      const res = await fetch("/api/b2c/attractions/import", {
        method: "POST",
        body: formData
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || "Failed to process spreadsheet")
      }

      if (isDryRun) {
        setDryRunReport(json.report)
      } else {
        setExecutionReport(json.report)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during import.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <DashboardPageShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => router.push("/dashboard/b2c/attractions")}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <h1 className="text-2xl font-black text-[var(--text-primary)]">Bulk Content Import Center</h1>
            </div>
            <p className="text-xs text-[var(--text-secondary)] ps-8">
              Batch import, update, and manage attractions across 8 synchronized spreadsheet tabs with zero data loss.
            </p>
          </div>

          {/* Action Downloads */}
          <div className="flex items-center gap-3 ps-8 md:ps-0">
            <a
              href="/api/b2c/attractions/export?template=true"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Download Blank Template (.xlsx)</span>
            </a>

            <a
              href="/api/b2c/attractions/export"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>Export Current Records (.xlsx)</span>
            </a>
          </div>
        </div>

        {/* 8-Sheet Architecture Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { name: "1. Attractions", desc: "Names, slug, format & media" },
            { name: "2. Locations", desc: "Venues, coordinates & map pins" },
            { name: "3. Activities", desc: "What's inside & story tracks" },
            { name: "4. Pricing", desc: "Passes, tickets & add-ons" },
            { name: "5. Gallery", desc: "Photo URLs & captions" },
            { name: "6. FAQs", desc: "Q&A accordions (EN & AR)" },
            { name: "7. Partners", desc: "Sponsors & perks" },
            { name: "8. Social", desc: "Instagram & TikTok links" },
          ].map((sheet, i) => (
            <div key={i} className="p-3 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-1">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate">{sheet.name}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] truncate">{sheet.desc}</div>
            </div>
          ))}
        </div>

        {/* File Drop Area */}
        <div className="p-8 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-6">
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleFileDrop}
            className={cn(
              "border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4",
              file
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-[var(--border-default)] hover:border-[var(--color-primary)] bg-[var(--surface-subtle)]"
            )}
            onClick={() => document.getElementById("spreadsheetFileInput")?.click()}
          >
            <input
              id="spreadsheetFileInput"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {file ? (
              <div className="space-y-2">
                <FileSpreadsheet className="w-12 h-12 text-emerald-500 mx-auto" />
                <div className="text-base font-black text-[var(--text-primary)]">{file.name}</div>
                <div className="text-xs text-[var(--text-secondary)] font-mono">
                  {(file.size / 1024).toFixed(1)} KB • Ready for Validation
                </div>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    setFile(null)
                    setDryRunReport(null)
                  }}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Choose another file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-12 h-12 text-[var(--color-primary)] mx-auto opacity-70" />
                <div className="text-base font-black text-[var(--text-primary)]">
                  Drag & Drop Excel Spreadsheet (.xlsx / .csv)
                </div>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  Upload an 8-sheet Excel file or CSV. Existing records will be safely deep-merged; blank cells will never erase existing content.
                </p>
                <div className="pt-2">
                  <span className="px-4 py-2 rounded-xl bg-[var(--surface-default)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] shadow-sm">
                    Browse Files
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          {file && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border-default)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Dry-run verification is run first to preview all database modifications.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => runProcess(true)}
                  className="px-6 py-2.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>{isProcessing ? "Validating..." : "1. Run Dry-Run Validation"}</span>
                </button>

                {dryRunReport && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => runProcess(false)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>2. Commit & Import Changes</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dry-Run Report Summary */}
        {dryRunReport && (
          <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                  <Eye className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-[var(--text-primary)]">Dry-Run Validation Report</h3>
              </div>
              <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold">
                NO DATABASE WRITES PERFORMED
              </span>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-1">
                <div className="text-xs text-[var(--text-secondary)] uppercase font-bold">Total Rows</div>
                <div className="text-2xl font-black text-[var(--text-primary)]">{dryRunReport.totalRows}</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold">To Create</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{dryRunReport.created}</div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                <div className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold">To Deep-Merge</div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{dryRunReport.updated}</div>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-1">
                <div className="text-xs text-[var(--text-secondary)] uppercase font-bold">Skipped / Invalid</div>
                <div className="text-2xl font-black text-[var(--text-tertiary)]">{dryRunReport.skipped}</div>
              </div>
            </div>

            {/* Diffs Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-[var(--text-secondary)]">Proposed Record Diffs</h4>
              <div className="space-y-2">
                {dryRunReport.diffs.map((diff: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--text-primary)]">{diff.nameEn}</span>
                        <span className="text-xs font-mono text-[var(--text-tertiary)]">({diff.slug})</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] space-x-2">
                        {diff.details.map((d: string, i: number) => (
                          <span key={i} className="inline-block">• {d}</span>
                        ))}
                      </div>
                    </div>

                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase",
                      diff.action === 'CREATE' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                    )}>
                      {diff.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Execution Success Report */}
        {executionReport && (
          <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-base font-black">Spreadsheet Successfully Imported!</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {executionReport.created} new attractions created and {executionReport.updated} existing attractions updated.
            </p>
            <button
              type="button"
              onClick={() => router.push("/dashboard/b2c/attractions")}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
            >
              <span>View Updated Attraction Roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </DashboardPageShell>
  )
}
