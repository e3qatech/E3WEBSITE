"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { MediaUploader } from "@/components/dashboard/ui/MediaUploader"

import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"

export default function NewPartnerPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category: "Government",
    website: "",
    description: "",
    visible: false,
    logo: ""
  })

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast("Partner name is required", "error")
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch("/api/b2b/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          website: formData.website,
          description: formData.description,
          logoUrl: formData.logo,
          isVisible: formData.visible,
        })
      })
      if (!res.ok) throw new Error("Failed to create partner")
      toast("Partner added successfully.", "success")
    } catch (err: any) {
      toast(err.message || "Failed to create partner", "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardPageShell variant="focused">
      <DashboardPageHeader
        title="Add New Partner"
        description="Register a new strategic, corporate, or government partner entity and configure public visibility."
        breadcrumbs={[
          { label: "Partners Directory", href: "/dashboard/partners" },
          { label: "New Partner" },
        ]}
        badge={{
          label: formData.visible ? "VISIBLE" : "HIDDEN",
          variant: formData.visible ? "success" : "warning",
        }}
        primaryAction={{
          label: isSaving ? "Saving..." : "Save Partner",
          onClick: handleSave,
          isLoading: isSaving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      <div className="bg-[var(--surface-default)] p-6 md:p-8 rounded-2xl border border-[var(--border-default)] space-y-8">
        
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[var(--text-secondary)]">Partner Logo</label>
          <div className="max-w-sm">
            <MediaUploader onUploadComplete={(urls) => setFormData({...formData, logo: urls[0]})} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-[var(--text-secondary)]">Partner Name</label>
            <input 
              type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-bold text-[var(--text-secondary)]">Category</label>
            <select 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="Government">Government</option>
              <option value="Corporate">Corporate</option>
              <option value="Telecom">Telecom</option>
              <option value="Aviation">Aviation</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-[var(--text-secondary)]">Website URL</label>
          <input 
            type="url" placeholder="https://" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})}
            className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-[var(--text-secondary)]">Short Description</label>
          <textarea 
            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 min-h-[100px] text-sm focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={formData.visible} onChange={e => setFormData({...formData, visible: e.target.checked})} className="w-5 h-5 rounded border-[var(--border-default)] text-[var(--color-primary)]" />
          <span className="font-bold text-[var(--text-primary)]">Show immediately on public website</span>
        </label>

      </div>
    </DashboardPageShell>
  )
}
