"use client"

import { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminButton } from "../ui/AdminButton"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { MediaUploader } from "@/components/shared/MediaUploader"

export function B2BPartnersEditor({ initialData }: { initialData: any }) {
  const [data, setData] = useState({
    hero: {
      titleEn: initialData?.hero?.titleEn || "Trusted by the Best.",
      titleAr: initialData?.hero?.titleAr || "يحظى بثقة الأفضل.",
      subtitleEn: initialData?.hero?.subtitleEn || "We partner with ambitious government entities, global brands, and premier destinations to deliver experiences that matter.",
      subtitleAr: initialData?.hero?.subtitleAr || "نحن نتشارك مع هيئات حكومية طموحة، وعلامات تجارية عالمية، ووجهات رائدة لتقديم تجارب تهم.",
      mediaType: initialData?.hero?.mediaType || "IMAGE",
      mediaUrl: initialData?.hero?.mediaUrl || "",
    }
  })

  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2b-partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data })
      })
      if (!res.ok) throw new Error("Failed to save")
      toast("B2B Partners page updated successfully.", "success")
    } catch (e) {
      console.error(e)
      toast("Failed to save B2B Partners page.", "error")
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
        title="Client Page Editor"
        description="Manage the main clients index page hero section."
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
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (En)</label>
                <input 
                  type="text" 
                  value={data.hero.titleEn}
                  onChange={e => handleChange('hero', 'titleEn', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.hero.titleAr}
                  onChange={e => handleChange('hero', 'titleAr', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (En)</label>
                <textarea 
                  value={data.hero.subtitleEn}
                  onChange={e => handleChange('hero', 'subtitleEn', e.target.value)}
                  className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (Ar)</label>
                <textarea 
                  dir="rtl"
                  value={data.hero.subtitleAr}
                  onChange={e => handleChange('hero', 'subtitleAr', e.target.value)}
                  className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
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
      </AdminFormLayout>
    </div>
  )
}
