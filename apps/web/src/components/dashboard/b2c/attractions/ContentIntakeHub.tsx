"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
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
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  FileUp,
  Check,
  Film,
  FolderArchive,
  Copy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export type IntakeTab = 'smart_doc' | 'spreadsheet' | 'export_reimport' | 'bulk_media' | 'history'

interface BulkMediaItem {
  id: string
  file: File
  previewUrl: string
  name: string
  size: number
  type: string
  matchedAttractionSlug: string | null
  targetCategory: 'HERO' | 'FALLBACK' | 'GALLERY' | 'ACTIVITY' | 'LOGO' | 'BROCHURE'
  targetActivityTitle?: string
  sortOrder: number
  captionEn: string
  captionAr: string
  isDuplicate: boolean
  status: 'PENDING' | 'CONFIRMED' | 'UPLOADING' | 'DONE' | 'ERROR'
}

interface ContentIntakeHubProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  onApplyDraft?: (draftData: any) => void
  initialTab?: IntakeTab
  availableAttractions?: Array<{ id: string; slug: string; nameEn: string; nameAr: string }>
}

export function ContentIntakeHub({
  isOpen,
  onClose,
  onSuccess,
  onApplyDraft,
  initialTab = 'smart_doc',
  availableAttractions = []
}: ContentIntakeHubProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<IntakeTab>(initialTab)

  // Smart Document State
  const [docText, setDocText] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isProcessingDoc, setIsProcessingDoc] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [extractedDocData, setExtractedDocData] = useState<any | null>(null)
  const [acceptedFields, setAcceptedFields] = useState<Record<string, boolean>>({})
  const [showRawTextPreview, setShowRawTextPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Bulk Media State
  const [bulkMediaQueue, setBulkMediaQueue] = useState<BulkMediaItem[]>([])
  const [isAssigningMedia, setIsAssigningMedia] = useState(false)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const [localAttractions, setLocalAttractions] = useState(availableAttractions)

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

  // Load attractions for matching if not passed
  useEffect(() => {
    if (isOpen && localAttractions.length === 0) {
      fetch('/api/b2c/attractions')
        .then(r => r.json())
        .then(json => {
          if (Array.isArray(json.attractions || json.data)) {
            setLocalAttractions((json.attractions || json.data).map((a: any) => ({
              id: a.id,
              slug: a.slug,
              nameEn: a.nameEn || a.name?.en || a.slug,
              nameAr: a.nameAr || a.name?.ar || a.slug
            })))
          }
        })
        .catch(() => {})
    }
  }, [isOpen, localAttractions.length])

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

  // File Handlers for Smart Doc
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeDocFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Handle Smart Document Extraction
  const handleSmartDocProcess = async () => {
    if (!docText.trim() && uploadedFiles.length === 0) {
      setErrorMessage("Please enter document text or upload document files.")
      return
    }

    setIsProcessingDoc(true)
    setUploadProgress(20)
    setErrorMessage(null)
    try {
      const formData = new FormData()
      uploadedFiles.forEach(f => {
        formData.append("files", f)
      })
      formData.append("text", docText)

      setUploadProgress(50)
      const res = await fetch('/api/b2c/attractions/ai-intake', {
        method: "POST",
        body: formData
      })

      setUploadProgress(85)
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || "Failed to extract structured content")
      }

      const json = await res.json()
      setExtractedDocData(json.data)
      
      // Initialize acceptance state
      const initialAcceptance: Record<string, boolean> = {}
      if (Array.isArray(json.data?.proposalFields)) {
        json.data.proposalFields.forEach((field: any) => {
          initialAcceptance[field.key] = field.accepted !== false && !field.isFactRequiringConfirmation
        })
      }
      setAcceptedFields(initialAcceptance)
      setUploadProgress(100)
      setSuccessMessage("Content parsed and structured proposals generated successfully!")
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process document")
    } finally {
      setIsProcessingDoc(false)
      setTimeout(() => setUploadProgress(null), 1000)
    }
  }

  const toggleFieldAcceptance = (key: string) => {
    setAcceptedFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Apply as Draft to Active Studio Form
  const handleApplyAsDraft = () => {
    if (!extractedDocData) return

    const draftToApply: Record<string, any> = {}
    if (Array.isArray(extractedDocData.proposalFields)) {
      extractedDocData.proposalFields.forEach((field: any) => {
        if (acceptedFields[field.key]) {
          draftToApply[field.key] = field.proposedValue
        }
      })
    }

    // Include activities & pricing if accepted
    if (extractedDocData.features && extractedDocData.features.length > 0) {
      draftToApply.features = extractedDocData.features
    }
    if (extractedDocData.pricing && extractedDocData.pricing.length > 0) {
      draftToApply.pricing = extractedDocData.pricing
    }

    if (onApplyDraft) {
      onApplyDraft(draftToApply)
      setSuccessMessage("Applied accepted fields as draft in the studio!")
      setTimeout(() => {
        onClose()
      }, 500)
    } else {
      // Create draft via API
      fetch('/api/b2c/attractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draftToApply,
          nameEn: draftToApply.nameEn || extractedDocData.nameEn,
          slug: draftToApply.slug || extractedDocData.slug,
          isPublished: false,
          isB2bVisible: true
        })
      })
        .then(r => r.json())
        .then(res => {
          if (res.id || res.attraction?.id) {
            onClose()
            router.push(`/dashboard/b2c/attractions/${res.id || res.attraction?.id}/edit`)
            router.refresh()
          } else {
            throw new Error(res.error || "Failed to create draft")
          }
        })
        .catch(err => setErrorMessage(err.message))
    }
  }

  // ==========================================
  // BULK MEDIA INTAKE
  // ==========================================
  const handleMediaDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingMediaFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingMediaFiles(Array.from(e.target.files))
    }
  }

  const processIncomingMediaFiles = (files: File[]) => {
    const newItems: BulkMediaItem[] = files.map(file => {
      const lowerName = file.name.toLowerCase()
      
      // Auto-match attraction slug
      let matchedSlug: string | null = null
      const normFile = lowerName.replace(/[^a-z0-9]/g, '')
      for (const attr of localAttractions) {
        const normSlug = (attr.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        const normName = (attr.nameEn || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        if (
          lowerName.includes(attr.slug) ||
          (normSlug.length > 2 && normFile.includes(normSlug)) ||
          (normName.length > 2 && normFile.includes(normName))
        ) {
          matchedSlug = attr.slug
          break
        }
      }

      // Auto-match category
      let category: BulkMediaItem['targetCategory'] = 'GALLERY'
      if (lowerName.includes('hero') || lowerName.includes('cover') || lowerName.includes('main')) category = 'HERO'
      else if (lowerName.includes('fallback') || lowerName.includes('thumb')) category = 'FALLBACK'
      else if (lowerName.includes('logo') || lowerName.includes('icon') || lowerName.includes('brand')) category = 'LOGO'
      else if (lowerName.includes('activity') || lowerName.includes('feature') || lowerName.includes('ride')) category = 'ACTIVITY'
      else if (lowerName.includes('brochure') || lowerName.includes('pdf')) category = 'BROCHURE'

      return {
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        name: file.name,
        size: file.size,
        type: file.type || 'image/jpeg',
        matchedAttractionSlug: matchedSlug,
        targetCategory: category,
        sortOrder: 0,
        captionEn: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "),
        captionAr: "",
        isDuplicate: false,
        status: 'PENDING'
      }
    })

    setBulkMediaQueue(prev => [...prev, ...newItems])
  }

  const updateMediaItem = (id: string, updates: Partial<BulkMediaItem>) => {
    setBulkMediaQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  const removeMediaItem = (id: string) => {
    setBulkMediaQueue(prev => prev.filter(item => item.id !== id))
  }

  const handleConfirmAndAssignMedia = async () => {
    if (bulkMediaQueue.length === 0) return

    setIsAssigningMedia(true)
    setErrorMessage(null)
    try {
      // Upload files through CMS media endpoint / Vercel Blob
      let successCount = 0
      for (const item of bulkMediaQueue) {
        if (!item.matchedAttractionSlug) continue

        updateMediaItem(item.id, { status: 'UPLOADING' })
        const formData = new FormData()
        formData.append('file', item.file)
        formData.append('category', item.targetCategory)
        formData.append('captionEn', item.captionEn)
        formData.append('captionAr', item.captionAr)
        formData.append('attractionSlug', item.matchedAttractionSlug)

        const uploadRes = await fetch('/api/cms/media', {
          method: 'POST',
          body: formData
        })

        if (uploadRes.ok) {
          updateMediaItem(item.id, { status: 'DONE' })
          successCount++
        } else {
          updateMediaItem(item.id, { status: 'ERROR' })
        }
      }

      setSuccessMessage(`Successfully uploaded and assigned ${successCount} media assets!`)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to complete media assignment")
    } finally {
      setIsAssigningMedia(false)
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
                Smart document extraction, bulk media assignment, and 8-sheet Excel workbook sync
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
            <span>Smart Document (Files / OCR / Text)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bulk_media')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
              activeTab === 'bulk_media'
                ? "bg-purple-600 text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Bulk Media Mode</span>
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
                  Smart Document & OCR Intake
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Upload PDF, DOCX, PPTX, TXT, or scanned images. The engine extracts structured attraction proposals with source references and confidence scores without automatic publishing.
                </p>
              </div>

              {/* Drag-and-Drop Area */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--border-level-2)] hover:border-purple-500/50 rounded-3xl p-8 text-center bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.pptx,.txt,.md,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    Drag & Drop PDF, DOCX, PPTX, TXT, or Images
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Supports multiple files and scanned briefs with OCR extraction
                  </p>
                </div>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  className="px-4 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs font-bold text-[var(--text-primary)] hover:border-purple-500"
                >
                  Browse Files
                </button>
              </div>

              {/* Uploaded Files Queue */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                    <span>Uploaded Files ({uploadedFiles.length})</span>
                    <button
                      type="button"
                      onClick={() => setUploadedFiles([])}
                      className="text-red-400 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-bold text-[var(--text-primary)] truncate">{file.name}</div>
                            <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
                              {(file.size / 1024).toFixed(1)} KB • {file.name.split('.').pop()?.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocFile(idx)}
                          className="text-[var(--text-tertiary)] hover:text-red-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Text Paste Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  Or Paste Document Text / Marketing Copy
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste attraction overview, activities, session timings, and ticket details here..."
                  value={docText}
                  onChange={e => setDocText(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] font-mono resize-y focus:border-purple-500"
                />
              </div>

              {/* Progress Bar */}
              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                    <span>Extracting & Structuring Content...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--surface-subtle)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  Non-destructive: extracted proposals must be approved before applying.
                </span>
                <button
                  type="button"
                  disabled={isProcessingDoc || (!docText.trim() && uploadedFiles.length === 0)}
                  onClick={handleSmartDocProcess}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isProcessingDoc ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing Extraction...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Extract & Generate Proposal</span>
                    </>
                  )}
                </button>
              </div>

              {/* Extracted Proposal Review Pane */}
              {extractedDocData && (
                <div className="space-y-6 pt-6 border-t border-[var(--border-level-1)] animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Field-by-Field Structured Proposal</span>
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Select fields to apply as draft. Unsupported factual items remain blank for manual confirmation.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowRawTextPreview(!showRawTextPreview)}
                      className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <span>{showRawTextPreview ? "Hide" : "View"} Extracted Text</span>
                      {showRawTextPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {showRawTextPreview && extractedDocData.extractedText && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-[var(--border-level-2)] max-h-48 overflow-y-auto text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap">
                      {extractedDocData.extractedText}
                    </div>
                  )}

                  {/* Proposal Fields Table */}
                  <div className="space-y-3">
                    {Array.isArray(extractedDocData.proposalFields) && extractedDocData.proposalFields.map((field: any) => {
                      const isAccepted = Boolean(acceptedFields[field.key])
                      const isFact = Boolean(field.isFactRequiringConfirmation)

                      return (
                        <div
                          key={field.key}
                          onClick={() => toggleFieldAcceptance(field.key)}
                          className={cn(
                            "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                            isAccepted
                              ? "bg-purple-500/5 border-purple-500/30"
                              : "bg-[var(--surface-subtle)] border-[var(--border-level-2)] opacity-75"
                          )}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isAccepted}
                              onChange={() => {}} // handled by parent onClick
                              className="mt-1 rounded text-purple-600 focus:ring-0 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-[var(--text-primary)]">
                                  {field.labelEn}
                                </span>
                                <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                                  [{field.key}]
                                </span>
                                {field.confidence > 0 && (
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold font-mono",
                                    field.confidence >= 90 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                                  )}>
                                    {field.confidence}% Confidence
                                  </span>
                                )}
                                {isFact && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                    Requires Confirmation
                                  </span>
                                )}
                              </div>

                              <div className="text-xs text-[var(--text-secondary)] mt-1 truncate">
                                {String(field.proposedValue) || <span className="italic text-[var(--text-tertiary)]">Blank (Awaiting confirmation)</span>}
                              </div>

                              <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                                Source: {field.sourceRef}
                              </div>
                            </div>
                          </div>

                          <span className={cn(
                            "px-3 py-1 rounded-lg text-xs font-bold self-start sm:self-center shrink-0",
                            isAccepted ? "bg-purple-600 text-white" : "bg-[var(--surface-hover)] text-[var(--text-secondary)]"
                          )}>
                            {isAccepted ? "Accepted" : "Rejected"}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border-level-1)]">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      {Object.values(acceptedFields).filter(Boolean).length} fields accepted to be applied as draft
                    </span>

                    <button
                      type="button"
                      onClick={handleApplyAsDraft}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-lg cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Apply as Draft</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BULK MEDIA MODE */}
          {/* ========================================================================= */}
          {activeTab === 'bulk_media' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Bulk Media Intake & Auto-Assignment
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Upload multiple attraction images, videos, SVGs, or ZIP files. Filenames are automatically matched to attraction slugs and activities for review before assignment.
                </p>
              </div>

              {/* Media Upload Dropzone */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleMediaDrop}
                onClick={() => mediaInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--border-level-2)] hover:border-purple-500/50 rounded-3xl p-8 text-center bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer space-y-3"
              >
                <input
                  ref={mediaInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.svg,.zip"
                  onChange={handleMediaSelect}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    Drop Media Files or ZIP Folders Here
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Supports JPG, PNG, WEBP, SVG, MP4, WebM, and ZIP folders
                  </p>
                </div>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    mediaInputRef.current?.click()
                  }}
                  className="px-4 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs font-bold text-[var(--text-primary)] hover:border-purple-500"
                >
                  Browse Media Files
                </button>
              </div>

              {/* Staged Media List */}
              {bulkMediaQueue.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Staged Media Queue ({bulkMediaQueue.length} files)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setBulkMediaQueue([])}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Clear Queue
                    </button>
                  </div>

                  <div className="space-y-3">
                    {bulkMediaQueue.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {item.previewUrl ? (
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-[var(--border-level-2)] shrink-0">
                              <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                              {item.name.endsWith('.zip') ? <FolderArchive className="w-6 h-6" /> : <Film className="w-6 h-6" />}
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="font-bold text-xs text-[var(--text-primary)] truncate">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
                              {(item.size / 1024).toFixed(1)} KB • {item.type}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              {/* Attraction Picker */}
                              <select
                                value={item.matchedAttractionSlug || ""}
                                onChange={e => updateMediaItem(item.id, { matchedAttractionSlug: e.target.value || null })}
                                className="h-7 px-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-lg text-xs font-bold text-[var(--text-primary)] focus:outline-none"
                              >
                                <option value="">-- Unassigned Attraction --</option>
                                {localAttractions.map(a => (
                                  <option key={a.slug} value={a.slug}>
                                    {a.nameEn} ({a.slug})
                                  </option>
                                ))}
                              </select>

                              {/* Category Picker */}
                              <select
                                value={item.targetCategory}
                                onChange={e => updateMediaItem(item.id, { targetCategory: e.target.value as any })}
                                className="h-7 px-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-lg text-xs text-[var(--text-secondary)] focus:outline-none"
                              >
                                <option value="HERO">Hero Media</option>
                                <option value="FALLBACK">Hero Fallback / Thumb</option>
                                <option value="GALLERY">Gallery Image</option>
                                <option value="ACTIVITY">Activity Thumbnail</option>
                                <option value="LOGO">Brand / Venue Logo</option>
                                <option value="BROCHURE">PDF Brochure</option>
                              </select>

                              {/* Status Badge */}
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold font-mono",
                                item.matchedAttractionSlug ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                              )}>
                                {item.matchedAttractionSlug ? "Matched" : "Unmatched"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => removeMediaItem(item.id)}
                            className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Confirmation Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border-level-1)]">
                    <span className="text-xs text-[var(--text-secondary)]">
                      {bulkMediaQueue.filter(m => m.matchedAttractionSlug).length} of {bulkMediaQueue.length} files matched and ready for assignment
                    </span>

                    <button
                      type="button"
                      disabled={isAssigningMedia || bulkMediaQueue.filter(m => m.matchedAttractionSlug).length === 0}
                      onClick={handleConfirmAndAssignMedia}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-lg disabled:opacity-50"
                    >
                      {isAssigningMedia ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Uploading & Assigning...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm & Assign Media</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[var(--text-tertiary)]">
                  No media files in queue. Drag & drop files above to begin matching.
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SPREADSHEET IMPORT */}
          {/* ========================================================================= */}
          {activeTab === 'spreadsheet' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  8-Sheet Excel & CSV Workbook Import
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Import attractions, activities, pricing tiers, FAQs, temporal schedules, and social links. Dry run diff validation is enforced before committing changes.
                </p>
              </div>

              {/* File Input */}
              <div className="p-6 rounded-3xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] block">
                    Select .xlsx or .csv Workbook
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={e => setSpreadsheetFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-[var(--text-primary)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                  />
                </div>

                {/* Import Mode Selector */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-level-1)]">
                  <label className="text-xs font-bold text-[var(--text-secondary)] block">
                    Import Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'fill_missing', title: 'Fill Missing Data', desc: 'Preserves existing fields' },
                      { id: 'update_all', title: 'Update All Fields', desc: 'Overwrites changed columns' },
                      { id: 'create_only', title: 'Create New Only', desc: 'Skips existing records' }
                    ].map(mode => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setImportMode(mode.id as any)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all cursor-pointer",
                          importMode === mode.id
                            ? "bg-purple-500/10 border-purple-500 text-purple-300"
                            : "bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-secondary)]"
                        )}
                      >
                        <div className="font-bold text-xs text-[var(--text-primary)]">{mode.title}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)]">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isProcessingSpreadsheet || !spreadsheetFile}
                    onClick={() => handleSpreadsheetUpload(true)}
                    className="px-5 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] hover:border-purple-500 text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Run Dry Run Validation</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessingSpreadsheet || !spreadsheetFile}
                    onClick={() => handleSpreadsheetUpload(false)}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Commit & Apply Import</span>
                  </button>
                </div>
              </div>

              {/* Diff Report */}
              {spreadsheetReport && (
                <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Validation Report
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <div className="text-lg font-black">{spreadsheetReport.created || 0}</div>
                      <div className="text-[10px] uppercase font-bold">New Records</div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <div className="text-lg font-black">{spreadsheetReport.updated || 0}</div>
                      <div className="text-[10px] uppercase font-bold">Updated Records</div>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <div className="text-lg font-black">{spreadsheetReport.unchanged || 0}</div>
                      <div className="text-[10px] uppercase font-bold">Unchanged</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: EXPORT & RE-IMPORT */}
          {/* ========================================================================= */}
          {activeTab === 'export_reimport' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Export Production Workbook
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Download the comprehensive 8-sheet master workbook containing all live attractions, pricing categories, and bilingual fields.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">
                    E3 Master Attractions & Events Workbook
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Includes schema version, formulas, and relational identifiers
                  </p>
                </div>

                <a
                  href="/api/b2c/attractions/export"
                  download="E3_Attractions_Master.xlsx"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Master Excel (.xlsx)</span>
                </a>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: HISTORY & ROLLBACK */}
          {/* ========================================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Import Audit & Batch Rollback
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  View full history of spreadsheet imports and smart document batches with safe one-click rollback.
                </p>
              </div>

              {isLoadingJobs ? (
                <div className="text-center py-12 text-xs text-[var(--text-secondary)]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-400" />
                  <span>Loading audit log...</span>
                </div>
              ) : importJobs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[var(--border-level-2)] rounded-2xl text-xs text-[var(--text-tertiary)]">
                  No import batches recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {importJobs.map(job => (
                    <div
                      key={job.id}
                      className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[var(--text-primary)]">
                            Batch #{job.id.substring(0, 8)}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold font-mono",
                            job.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                          )}>
                            {job.status}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {job.createdRecords || 0} created • {job.updatedRecords || 0} updated • File: {job.filename || "Direct Upload"}
                        </div>
                        <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
                          {new Date(job.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={rollingBackId === job.id}
                        onClick={() => handleRollback(job.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {rollingBackId === job.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Undo2 className="w-3.5 h-3.5" />
                        )}
                        <span>Rollback Batch</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
