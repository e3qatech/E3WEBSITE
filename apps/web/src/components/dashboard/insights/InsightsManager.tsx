"use client"

import { useState, useEffect } from "react"
import { 
  Plus, Search, Edit2, Trash2, Globe, Sparkles, FileText, Newspaper, 
  Megaphone, Calendar, Tag, User, Check, X, ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MediaUploader } from "@/components/ui/MediaUploader"
import { cn } from "@/lib/utils"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"

export function InsightsManager() {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/insights")
      const json = await res.json()
      setInsights(Array.isArray(json.data) ? json.data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  const filtered = insights.filter(item => {
    const matchesSearch = 
      (item.titleEn || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.titleAr || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.slugEn || "").toLowerCase().includes(search.toLowerCase())
    
    const matchesType = typeFilter === "ALL" || item.contentType === typeFilter
    return matchesSearch && matchesType
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Insight/News record?")) return
    try {
      await fetch(`/api/insights/${id}`, { method: "DELETE" })
      fetchInsights()
    } catch (e) {
      alert("Failed to delete record")
    }
  }

  if (editingItem || isCreating) {
    return (
      <InsightEditor 
        initialData={editingItem} 
        onClose={() => { setEditingItem(null); setIsCreating(false); }} 
        onSave={() => { setEditingItem(null); setIsCreating(false); fetchInsights(); }} 
      />
    )
  }

  return (
    <DashboardPageShell variant="wide">
      {/* Header */}
      <DashboardPageHeader
        title="Insights, News & Press Portal"
        description="Central backend portal for managing articles, press releases, event recaps, and announcements across the site."
        breadcrumbs={[
          { label: "Content", href: "/dashboard/insights" },
          { label: "Insights & Press" },
        ]}
        badge={{ label: `${insights.length} Records`, variant: "purple" }}
        primaryAction={{
          label: "Create New Record",
          onClick: () => setIsCreating(true),
          icon: <Plus className="w-4 h-4" />
        }}
      />

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-default)] overflow-x-auto">
          {["ALL", "ARTICLE", "NEWS", "PRESS_RELEASE", "EVENT_RECAP", "TECHNICAL_INSIGHT", "ANNOUNCEMENT"].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer",
                typeFilter === t ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {t.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input 
            type="text" 
            placeholder="Search titles or slugs..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] text-[var(--text-tertiary)] animate-pulse">
          Loading Insights & News Records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] space-y-3">
          <Sparkles className="w-10 h-10 mx-auto text-[var(--text-tertiary)] opacity-40" />
          <p className="text-base font-bold text-[var(--text-primary)]">No insights found</p>
          <p className="text-xs text-[var(--text-secondary)]">Create a new article or adjust your search filter above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div key={item.id} className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-5 hover:border-[var(--color-primary)] transition-all shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider bg-purple-500/10 text-purple-600 border border-purple-500/20">
                    {item.contentType}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider",
                    item.publishStatus === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-600" :
                    item.publishStatus === "SCHEDULED" ? "bg-amber-500/10 text-amber-600" : "bg-gray-500/10 text-gray-500"
                  )}>
                    {item.publishStatus}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-[var(--text-primary)] line-clamp-2">
                  {item.titleEn}
                </h3>
                {item.titleAr && (
                  <p className="text-xs text-[var(--text-secondary)] font-arabic text-right mt-0.5 line-clamp-1">
                    {item.titleAr}
                  </p>
                )}

                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-2">
                  {item.excerptEn || item.bodyEn?.slice(0, 100) || "No excerpt..."}
                </p>

                {item.author && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-default)]/60 text-xs text-[var(--text-secondary)]">
                    <User className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>{item.author.firstName} {item.author.lastName}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)] text-xs">
                <Button size="sm" variant="outline" onClick={() => setEditingItem(item)} className="gap-1 rounded-xl text-xs">
                  <Edit2 className="w-3.5 h-3.5" /> Edit Record
                </Button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardPageShell>
  )
}

function InsightEditor({ initialData, onClose, onSave }: { initialData?: any; onClose: () => void; onSave: () => void }) {
  const isEditing = !!initialData?.id
  const [isSaving, setIsSaving] = useState(false)
  const [teamMembers, setTeamMembers] = useState<any[]>([])

  const [titleEn, setTitleEn] = useState(initialData?.titleEn || "")
  const [titleAr, setTitleAr] = useState(initialData?.titleAr || "")
  const [slugEn, setSlugEn] = useState(initialData?.slugEn || "")
  const [contentType, setContentType] = useState(initialData?.contentType || "ARTICLE")
  const [publishStatus, setPublishStatus] = useState(initialData?.publishStatus || "DRAFT")
  const [excerptEn, setExcerptEn] = useState(initialData?.excerptEn || "")
  const [excerptAr, setExcerptAr] = useState(initialData?.excerptAr || "")
  const [bodyEn, setBodyEn] = useState(initialData?.bodyEn || "")
  const [bodyAr, setBodyAr] = useState(initialData?.bodyAr || "")
  const [featuredMediaId, setFeaturedMediaId] = useState(initialData?.featuredMediaId || "")
  const [authorEmployeeProfileId, setAuthorEmployeeProfileId] = useState(initialData?.authorEmployeeProfileId || "")

  useEffect(() => {
    fetch("/api/team")
      .then(res => res.json())
      .then(data => setTeamMembers(Array.isArray(data) ? data : (data.team || [])))
      .catch(console.error)
  }, [])

  const handleSave = async () => {
    if (!titleEn.trim()) {
      alert("English Title is required")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        titleEn,
        titleAr: titleAr || titleEn,
        slugEn: slugEn.trim() || titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        contentType,
        publishStatus,
        excerptEn,
        excerptAr,
        bodyEn,
        bodyAr,
        featuredMediaId,
        authorEmployeeProfileId: authorEmployeeProfileId || null
      }

      const url = isEditing ? `/api/insights/${initialData.id}` : "/api/insights"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to save")
      }

      onSave()
    } catch (err: any) {
      alert(err.message || "Save failed")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardPageShell variant="focused">
      <DashboardPageHeader
        title={isEditing ? `Edit Record: ${titleEn || "Untitled"}` : "Create Insights / News Record"}
        description="Configure press release, article, event recap, or company announcement content."
        breadcrumbs={[
          { label: "Insights Portal", href: "/dashboard/insights" },
          { label: isEditing ? (titleEn || "Edit Record") : "New Record" },
        ]}
        badge={{
          label: publishStatus,
          variant: publishStatus === "PUBLISHED" ? "success" : "warning",
        }}
        primaryAction={{
          label: isSaving ? "Saving..." : "Save Record",
          onClick: handleSave,
          isLoading: isSaving,
        }}
        secondaryAction={
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Title (English) *</label>
              <input
                type="text"
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                placeholder="e.g. E3 Expands Immersive Venues Across Qatar"
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Title (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={titleAr}
                onChange={e => setTitleAr(e.target.value)}
                placeholder="العنوان بالعربية"
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none text-right"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Excerpt (English)</label>
            <textarea
              rows={2}
              value={excerptEn}
              onChange={e => setExcerptEn(e.target.value)}
              placeholder="Short summary..."
              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Body Content (English)</label>
            <textarea
              rows={8}
              value={bodyEn}
              onChange={e => setBodyEn(e.target.value)}
              placeholder="Full article body content..."
              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none resize-none font-mono"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Content Type</label>
            <select
              value={contentType}
              onChange={e => setContentType(e.target.value)}
              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
            >
              <option value="ARTICLE">Article</option>
              <option value="NEWS">News</option>
              <option value="PRESS_RELEASE">Press Release</option>
              <option value="EVENT_RECAP">Event Recap</option>
              <option value="TECHNICAL_INSIGHT">Technical Insight</option>
              <option value="ANNOUNCEMENT">Announcement</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Publish Status</label>
            <select
              value={publishStatus}
              onChange={e => setPublishStatus(e.target.value)}
              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
            >
              <option value="DRAFT">Draft</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Author (EmployeeProfile)</label>
            <select
              value={authorEmployeeProfileId}
              onChange={e => setAuthorEmployeeProfileId(e.target.value)}
              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
            >
              <option value="">-- No Author Selected --</option>
              {teamMembers.map(tm => (
                <option key={tm.id} value={tm.id}>
                  {tm.firstName} {tm.lastName} ({tm.designation || "Team"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Featured Image Media</label>
            <MediaUploader
              value={featuredMediaId}
              onChange={setFeaturedMediaId}
              accept="image/*"
              placeholder="Upload Featured Image"
            />
          </div>
        </div>
      </div>
    </DashboardPageShell>
  )
}
