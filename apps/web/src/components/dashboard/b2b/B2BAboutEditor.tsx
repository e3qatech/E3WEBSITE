"use client"

import { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminMediaPicker } from "../ui/AdminMediaPicker"
import { AdminButton } from "../ui/AdminButton"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/components/dashboard/ui/ToastProvider"

export function B2BAboutEditor({ initialData }: { initialData: any }) {
  const [data, setData] = useState({
    header: {
      titleEn: initialData?.header?.titleEn || "",
      titleAr: initialData?.header?.titleAr || "",
      subtitleEn: initialData?.header?.subtitleEn || "",
      subtitleAr: initialData?.header?.subtitleAr || "",
    },
    story: {
      titleEn: initialData?.story?.titleEn || "",
      titleAr: initialData?.story?.titleAr || "",
      contentEn: initialData?.story?.contentEn || "",
      contentAr: initialData?.story?.contentAr || "",
      mediaType: initialData?.story?.mediaType || "IMAGE",
      mediaUrl: initialData?.story?.mediaUrl || "",
      imageMediaId: initialData?.story?.imageMediaId || null,
    },
    values: initialData?.values || []
  })

  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2b-about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data })
      })
      if (!res.ok) throw new Error("Failed to save")
      toast("B2B About Us page updated successfully.", "success")
    } catch (e) {
      console.error(e)
      toast("Failed to save B2B About Us page.", "error")
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

  const addValue = () => {
    setData(prev => ({
      ...prev,
      values: [...prev.values, { titleEn: "", titleAr: "", descEn: "", descAr: "" }]
    }))
  }

  const removeValue = (index: number) => {
    setData(prev => ({
      ...prev,
      values: prev.values.filter((_val: any, i: number) => i !== index)
    }))
  }

  const updateValue = (index: number, field: string, value: string) => {
    setData(prev => {
      const newValues = [...prev.values]
      newValues[index] = { ...newValues[index], [field]: value }
      return { ...prev, values: newValues }
    })
  }

  return (
    <div className="flex flex-col gap-6 h-full p-6">
      <AdminPageHeader 
        title="B2B About Us"
        description="Manage the content for the Corporate About page."
        action={
          <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </AdminButton>
        }
      />

      <AdminFormLayout>
        {/* Header Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Header Section</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (En)</label>
              <input 
                type="text" 
                value={data.header.titleEn}
                onChange={e => handleChange('header', 'titleEn', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
              <input 
                type="text" 
                dir="rtl"
                value={data.header.titleAr}
                onChange={e => handleChange('header', 'titleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (En)</label>
              <textarea 
                value={data.header.subtitleEn}
                onChange={e => handleChange('header', 'subtitleEn', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (Ar)</label>
              <textarea 
                dir="rtl"
                value={data.header.subtitleAr}
                onChange={e => handleChange('header', 'subtitleAr', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Our Story</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Title (En)</label>
                <input 
                  type="text" 
                  value={data.story.titleEn}
                  onChange={e => handleChange('story', 'titleEn', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Title (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.story.titleAr}
                  onChange={e => handleChange('story', 'titleAr', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Content (En)</label>
                <textarea 
                  value={data.story.contentEn}
                  onChange={e => handleChange('story', 'contentEn', e.target.value)}
                  className="w-full h-48 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Content (Ar)</label>
                <textarea 
                  dir="rtl"
                  value={data.story.contentAr}
                  onChange={e => handleChange('story', 'contentAr', e.target.value)}
                  className="w-full h-48 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Media Type</label>
                <select 
                  value={data.story.mediaType}
                  onChange={e => handleChange('story', 'mediaType', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                  <option value="SPLINE">3D Model (Spline)</option>
                  <option value="IFRAME">Iframe (YouTube/Embed)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  {['IMAGE', 'VIDEO'].includes(data.story.mediaType) ? 'Media Asset' : 'Media URL'}
                </label>
                {['IMAGE', 'VIDEO'].includes(data.story.mediaType) ? (
                  <AdminMediaPicker 
                    value={data.story.imageMediaId}
                    onChange={id => handleChange('story', 'imageMediaId', id)}
                  />
                ) : (
                  <input 
                    type="url" 
                    value={data.story.mediaUrl}
                    onChange={e => handleChange('story', 'mediaUrl', e.target.value)}
                    placeholder={data.story.mediaType === 'IFRAME' ? "https://..." : "https://prod.spline.design/..."}
                    className="w-full h-[42px] bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-primary">Core Values</h2>
            <button 
              onClick={addValue}
              className="px-4 py-2 bg-surface-hover border border-border-default text-text-primary rounded-lg text-sm font-bold flex items-center hover:bg-surface-active"
            >
              <Plus size={16} className="me-2" />
              Add Value
            </button>
          </div>
          
          <div className="space-y-4">
            {data.values.map((val: any, idx: number) => (
              <div key={idx} className="p-4 bg-surface-hover border border-border-default rounded-lg relative">
                <button 
                  onClick={() => removeValue(idx)}
                  className="absolute top-4 end-4 p-2 text-text-tertiary hover:text-error hover:bg-error/10 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-2 gap-4 pe-12">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Title (En)</label>
                    <input 
                      type="text" 
                      value={val.titleEn}
                      onChange={e => updateValue(idx, 'titleEn', e.target.value)}
                      className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
                    <input 
                      type="text" 
                      dir="rtl"
                      value={val.titleAr}
                      onChange={e => updateValue(idx, 'titleAr', e.target.value)}
                      className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Description (En)</label>
                    <textarea 
                      value={val.descEn}
                      onChange={e => updateValue(idx, 'descEn', e.target.value)}
                      className="w-full h-20 bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Description (Ar)</label>
                    <textarea 
                      dir="rtl"
                      value={val.descAr}
                      onChange={e => updateValue(idx, 'descAr', e.target.value)}
                      className="w-full h-20 bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
            {data.values.length === 0 && (
              <div className="text-center py-8 text-text-tertiary text-sm">
                No values added.
              </div>
            )}
          </div>
        </div>

      </AdminFormLayout>
    </div>
  )
}
