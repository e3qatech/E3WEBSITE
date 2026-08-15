"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Save,
  Building2,
  Layers,
  Ticket
} from "lucide-react"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"

export function B2BAttractionEditor({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"shared" | "b2b" | "consumer">("shared")
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    // Shared Core Fields
    nameEn: initialData.nameEn || "",
    nameAr: initialData.nameAr || "",
    slug: initialData.slug || "",
    taglineEn: initialData.taglineEn || "",
    taglineAr: initialData.taglineAr || "",
    descriptionEn: initialData.descriptionEn || "",
    descriptionAr: initialData.descriptionAr || "",
    heroMediaUrl: initialData.heroMediaUrl || "",
    heroFallbackUrl: initialData.heroFallbackUrl || "",
    heroThumbnailUrl: initialData.heroThumbnailUrl || "",
    logoUrl: initialData.logoUrl || "",
    mapUrl: initialData.mapUrl || "",
    ticketingUrl: initialData.ticketingUrl || "",

    // B2B Portfolio & Case Study Metadata
    isB2bVisible: initialData.isB2bVisible !== false,
    b2bCategory: initialData.b2bCategory || "",
    projectType: initialData.projectType || "",
    clientName: initialData.clientName || "",
    year: initialData.year ? initialData.year.toString() : "",
    attendance: initialData.attendance || "",
    areaSize: initialData.areaSize || "",
    operationalScope: initialData.operationalScope || "",
    challengeEn: initialData.challengeEn || "",
    challengeAr: initialData.challengeAr || "",
    solutionEn: initialData.solutionEn || "",
    solutionAr: initialData.solutionAr || "",
    resultEn: initialData.resultEn || "",
    resultAr: initialData.resultAr || "",
    downloadableProfile: initialData.downloadableProfile || "",

    // Status Flags
    isPublished: initialData.isPublished || false,
    isFeatured: initialData.isFeatured || false,
    isHidden: initialData.isHidden || false,

    // JSON fields
    venueName: initialData.operations?.venueName || initialData.operations?.venue || "",
    temporalStatus: initialData.temporalStatus?.status || "ACTIVE"
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)

    try {
      // Build update payload
      const payload: any = {
        nameEn: formData.nameEn,
        nameAr: formData.nameAr,
        slug: formData.slug,
        taglineEn: formData.taglineEn,
        taglineAr: formData.taglineAr,
        descriptionEn: formData.descriptionEn,
        descriptionAr: formData.descriptionAr,
        heroMediaUrl: formData.heroMediaUrl || null,
        heroFallbackUrl: formData.heroFallbackUrl || null,
        heroThumbnailUrl: formData.heroThumbnailUrl || null,
        logoUrl: formData.logoUrl || null,
        mapUrl: formData.mapUrl || null,
        ticketingUrl: formData.ticketingUrl || null,

        isB2bVisible: formData.isB2bVisible,
        b2bCategory: formData.b2bCategory || null,
        projectType: formData.projectType || null,
        clientName: formData.clientName || null,
        year: formData.year ? parseInt(formData.year, 10) : null,
        attendance: formData.attendance || null,
        areaSize: formData.areaSize || null,
        operationalScope: formData.operationalScope || null,
        challengeEn: formData.challengeEn || null,
        challengeAr: formData.challengeAr || null,
        solutionEn: formData.solutionEn || null,
        solutionAr: formData.solutionAr || null,
        resultEn: formData.resultEn || null,
        resultAr: formData.resultAr || null,
        downloadableProfile: formData.downloadableProfile || null,

        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
        isHidden: formData.isHidden,

        operations: {
          ...(initialData.operations || {}),
          venueName: formData.venueName
        },
        temporalStatus: {
          ...(initialData.temporalStatus || {}),
          status: formData.temporalStatus
        }
      }

      const res = await fetch(`/api/b2b/attractions/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update attraction record")
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      router.refresh()
    } catch (err: any) {
      alert(err.message || "Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardPageShell variant="wide">
      <DashboardPageHeader
        title={`Edit Project: ${initialData.nameEn}`}
        description={`Updating single source of truth Attraction record (ID: ${initialData.id})`}
        breadcrumbs={[
          { label: "B2B Attractions", href: "/dashboard/b2b/attractions" },
          { label: initialData.nameEn || "Edit Record" }
        ]}
        badge={{
          label: formData.isB2bVisible ? "B2B VISIBLE" : "B2B HIDDEN",
          variant: formData.isB2bVisible ? "success" : "warning",
        }}
        previewUrl={`/b2c/attractions/${formData.slug}`}
        primaryAction={{
          label: saving ? "Saving..." : saveSuccess ? "Saved Successfully!" : "Save Changes",
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      {/* Editor Tabs Navigation */}
      <div className="flex border-b border-[var(--border-default)] gap-2 bg-[var(--surface-default)] p-2 rounded-xl shadow-sm">
        <button
          onClick={() => setActiveTab("shared")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === "shared" ? "bg-[var(--color-primary)] text-white shadow-md" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]"}`}
        >
          <Layers className="w-4 h-4" />
          1. Shared Core Data
        </button>

        <button
          onClick={() => setActiveTab("b2b")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === "b2b" ? "bg-[var(--color-primary)] text-white shadow-md" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]"}`}
        >
          <Building2 className="w-4 h-4" />
          2. B2B Portfolio & Case Study
        </button>

        <button
          onClick={() => setActiveTab("consumer")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === "consumer" ? "bg-[var(--color-primary)] text-white shadow-md" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]"}`}
        >
          <Ticket className="w-4 h-4" />
          3. Consumer & Status Flags
        </button>
      </div>

      {/* Tab 1: Shared Core Data */}
      {activeTab === "shared" && (
        <div className="bg-[var(--surface-default)] p-6 rounded-2xl border border-[var(--border-default)] shadow-sm space-y-6">
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--color-primary)]" />
              Shared Attraction Core Fields
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">Edits made here update the single source of truth Attraction record used across B2B and B2C portals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Name (English) *</label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={e => handleChange("nameEn", e.target.value)}
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Name (Arabic) *</label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={e => handleChange("nameAr", e.target.value)}
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] font-arabic text-[var(--text-primary)]"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={e => handleChange("slug", e.target.value)}
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Venue Name / Location</label>
              <input
                type="text"
                value={formData.venueName}
                onChange={e => handleChange("venueName", e.target.value)}
                placeholder="e.g. QNCC Halls 8 & 9, Doha Mall, etc."
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Tagline (English)</label>
              <input
                type="text"
                value={formData.taglineEn}
                onChange={e => handleChange("taglineEn", e.target.value)}
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Tagline (Arabic)</label>
              <input
                type="text"
                value={formData.taglineAr}
                onChange={e => handleChange("taglineAr", e.target.value)}
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] font-arabic text-[var(--text-primary)]"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Description (English)</label>
              <textarea
                rows={4}
                value={formData.descriptionEn}
                onChange={e => handleChange("descriptionEn", e.target.value)}
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Description (Arabic)</label>
              <textarea
                rows={4}
                value={formData.descriptionAr}
                onChange={e => handleChange("descriptionAr", e.target.value)}
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] font-arabic text-[var(--text-primary)]"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Hero Image / Media URL</label>
              <input
                type="text"
                value={formData.heroMediaUrl}
                onChange={e => handleChange("heroMediaUrl", e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Hero Thumbnail URL</label>
              <input
                type="text"
                value={formData.heroThumbnailUrl}
                onChange={e => handleChange("heroThumbnailUrl", e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Logo Image URL</label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={e => handleChange("logoUrl", e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: B2B Portfolio & Case Study Metadata */}
      {activeTab === "b2b" && (
        <div className="bg-[var(--surface-default)] p-6 rounded-2xl border border-[var(--border-default)] shadow-sm space-y-6">
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
              B2B Project Portfolio & Corporate Case Study Details
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">Manage corporate metrics, project scope, clients, and B2B portal display configuration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">B2B Portal Visibility</label>
              <select
                value={formData.isB2bVisible ? "true" : "false"}
                onChange={e => handleChange("isB2bVisible", e.target.value === "true")}
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              >
                <option value="true">Visible on B2B Portal</option>
                <option value="false">Hidden from B2B Portal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">B2B Category</label>
              <input
                type="text"
                value={formData.b2bCategory}
                onChange={e => handleChange("b2bCategory", e.target.value)}
                placeholder="e.g. Mega Event / FEC / Brand Activation"
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Project Type</label>
              <input
                type="text"
                value={formData.projectType}
                onChange={e => handleChange("projectType", e.target.value)}
                placeholder="e.g. Turnkey Operation / Design & Build"
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Client Name / Partner</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={e => handleChange("clientName", e.target.value)}
                placeholder="e.g. Visit Qatar / QNCC"
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Edition Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={e => handleChange("year", e.target.value)}
                placeholder="2024"
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Total Attendance / Footfall</label>
              <input
                type="text"
                value={formData.attendance}
                onChange={e => handleChange("attendance", e.target.value)}
                placeholder="e.g. 150,000+ Visitors"
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Footprint / Area Size</label>
              <input
                type="text"
                value={formData.areaSize}
                onChange={e => handleChange("areaSize", e.target.value)}
                placeholder="e.g. 10,000 sqm"
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Operational Scope & Delivered Services Summary</label>
            <input
              type="text"
              value={formData.operationalScope}
              onChange={e => handleChange("operationalScope", e.target.value)}
              placeholder="e.g. Turnkey venue operations, crowd safety, ticketing, stage management, marketing."
              className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
            />
          </div>

          {/* Case Study Deep-Dive Fields */}
          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Case Study Narrative & Results</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Challenge (English)</label>
                <textarea
                  rows={3}
                  value={formData.challengeEn}
                  onChange={e => handleChange("challengeEn", e.target.value)}
                  className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Challenge (Arabic)</label>
                <textarea
                  rows={3}
                  value={formData.challengeAr}
                  onChange={e => handleChange("challengeAr", e.target.value)}
                  className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] font-arabic text-[var(--text-primary)]"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Solution (English)</label>
                <textarea
                  rows={3}
                  value={formData.solutionEn}
                  onChange={e => handleChange("solutionEn", e.target.value)}
                  className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Solution (Arabic)</label>
                <textarea
                  rows={3}
                  value={formData.solutionAr}
                  onChange={e => handleChange("solutionAr", e.target.value)}
                  className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] font-arabic text-[var(--text-primary)]"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Result (English)</label>
                <textarea
                  rows={3}
                  value={formData.resultEn}
                  onChange={e => handleChange("resultEn", e.target.value)}
                  className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Result (Arabic)</label>
                <textarea
                  rows={3}
                  value={formData.resultAr}
                  onChange={e => handleChange("resultAr", e.target.value)}
                  className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] font-arabic text-[var(--text-primary)]"
                  dir="rtl"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Consumer Settings & Status Flags */}
      {activeTab === "consumer" && (
        <div className="bg-[var(--surface-default)] p-6 rounded-2xl border border-[var(--border-default)] shadow-sm space-y-6">
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[var(--color-primary)]" />
              Consumer Microsite & Publication Settings
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">Manage publication status, ticketing URLs, map links, and temporal status.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Temporal Status</label>
              <select
                value={formData.temporalStatus}
                onChange={e => handleChange("temporalStatus", e.target.value)}
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              >
                <option value="ACTIVE">ACTIVE (Ongoing)</option>
                <option value="UPCOMING">UPCOMING</option>
                <option value="PAST">PAST (Historical Edition)</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Is Published (Live Website)</label>
              <select
                value={formData.isPublished ? "true" : "false"}
                onChange={e => handleChange("isPublished", e.target.value === "true")}
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              >
                <option value="true">Published (Live)</option>
                <option value="false">Draft (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Is Featured</label>
              <select
                value={formData.isFeatured ? "true" : "false"}
                onChange={e => handleChange("isFeatured", e.target.value === "true")}
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              >
                <option value="true">Featured Attraction</option>
                <option value="false">Standard Listing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Ticketing URL</label>
              <input
                type="text"
                value={formData.ticketingUrl}
                onChange={e => handleChange("ticketingUrl", e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Google Maps / Location URL</label>
              <input
                type="text"
                value={formData.mapUrl}
                onChange={e => handleChange("mapUrl", e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full p-2.5 text-sm bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
              />
            </div>
          </div>
        </div>
      )}
    </DashboardPageShell>
  )
}
