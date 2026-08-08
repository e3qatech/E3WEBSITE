"use client"

import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { MediaUploader } from "@/components/dashboard/ui/MediaUploader"
import Link from "next/link"

export default function NewPartnerPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category: "Government",
    website: "",
    description: "",
    visible: true,
    logo: ""
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 800))
    toast("Partner added successfully.", "success")
    setIsSaving(false)
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="p-2 -ms-2">
            <Link href="/dashboard/partners">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">Add New Partner</h1>
          </div>
        </div>
        
        <Button onClick={handleSave} isLoading={isSaving} className="gap-2">
          <Save className="w-4 h-4" /> Save Partner
        </Button>
      </div>

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

    </div>
  )
}
