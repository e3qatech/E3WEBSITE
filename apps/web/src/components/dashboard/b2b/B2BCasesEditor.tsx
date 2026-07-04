"use client"

import { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminButton } from "../ui/AdminButton"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { MediaUploader } from "@/components/shared/MediaUploader"

export function B2BCasesEditor({ initialData }: { initialData: any }) {
  const [data, setData] = useState({
    hero: {
      title: initialData?.hero?.title || "Featured Work.",
      subtitle: initialData?.hero?.subtitle || "A selection of landmark projects demonstrating our capacity to engineer, build, and operate experiences at scale.",
      mediaType: initialData?.hero?.mediaType || "IMAGE",
      mediaUrl: initialData?.hero?.mediaUrl || "",
    },
    cta: {
      title: initialData?.cta?.title || "Ready to start a project?",
      description: initialData?.cta?.description || "Let's build something extraordinary together.",
      primaryCta: initialData?.cta?.primaryCta || "Contact Us",
      primaryLink: initialData?.cta?.primaryLink || "/b2b/contact",
      mediaType: initialData?.cta?.mediaType || "IMAGE",
      mediaUrl: initialData?.cta?.mediaUrl || "",
    }
  })

  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2b-cases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data })
      })
      if (!res.ok) throw new Error("Failed to save")
      toast("B2B Case Studies page updated successfully.", "success")
    } catch (e) {
      console.error(e)
      toast("Failed to save B2B Case Studies page.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (section: keyof typeof data, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }))
  }

  return (
    <div className="flex flex-col gap-6 h-full p-6">
      <AdminPageHeader 
        title="B2B Case Studies Landing Page"
        description="Manage the main case studies index page hero and footer CTA."
        action={
          <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </AdminButton>
        }
      />

      <AdminFormLayout>
        {/* Hero Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Hero Section</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title</label>
              <input 
                type="text" 
                value={data.hero.title}
                onChange={e => handleChange('hero', 'title', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle</label>
              <textarea 
                value={data.hero.subtitle}
                onChange={e => handleChange('hero', 'subtitle', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border-default">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Background Media Type</label>
                <select 
                  value={data.hero.mediaType}
                  onChange={e => handleChange('hero', 'mediaType', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                  <option value="SPLINE">Spline / 3D Scene</option>
                  <option value="IFRAME">iFrame Embed</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Media URL / Source</label>
                {['IFRAME', 'SPLINE'].includes(data.hero.mediaType) ? (
                  <input 
                    type="text" 
                    value={data.hero.mediaUrl}
                    onChange={e => handleChange('hero', 'mediaUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                ) : (
                  <MediaUploader 
                    value={data.hero.mediaUrl} 
                    onChange={url => handleChange('hero', 'mediaUrl', url)} 
                    accept={data.hero.mediaType === 'VIDEO' ? "video/*" : "image/*"}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Footer Call to Action</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title</label>
              <input 
                type="text" 
                value={data.cta.title}
                onChange={e => handleChange('cta', 'title', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description</label>
              <textarea 
                value={data.cta.description}
                onChange={e => handleChange('cta', 'description', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Button Text</label>
                <input 
                  type="text" 
                  value={data.cta.primaryCta}
                  onChange={e => handleChange('cta', 'primaryCta', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Button Link</label>
                <input 
                  type="text" 
                  value={data.cta.primaryLink}
                  onChange={e => handleChange('cta', 'primaryLink', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border-default">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Background Media Type</label>
                <select 
                  value={data.cta.mediaType}
                  onChange={e => handleChange('cta', 'mediaType', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Background Media URL</label>
                <MediaUploader 
                  value={data.cta.mediaUrl} 
                  onChange={url => handleChange('cta', 'mediaUrl', url)} 
                  accept={data.cta.mediaType === 'VIDEO' ? "video/*" : "image/*"}
                />
              </div>
            </div>
          </div>
        </div>

      </AdminFormLayout>
    </div>
  )
}
