"use client"

import { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminButton } from "../ui/AdminButton"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { MediaUploader } from "@/components/shared/MediaUploader"
import { Plus, Trash2 } from "lucide-react"

export function B2BFAQsEditor({ initialData }: { initialData: any }) {
  const [data, setData] = useState({
    header: {
      titleEn: initialData?.header?.titleEn || "Frequently Asked Questions",
      titleAr: initialData?.header?.titleAr || "الأسئلة الشائعة",
      subtitleEn: initialData?.header?.subtitleEn || "Find answers to commonly asked questions.",
      subtitleAr: initialData?.header?.subtitleAr || "اعثر على إجابات للأسئلة المتداولة.",
      mediaType: initialData?.header?.mediaType || "IMAGE",
      mediaUrl: initialData?.header?.mediaUrl || "",
    },
    items: Array.isArray(initialData?.items) ? initialData.items : []
  })

  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2b-faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data })
      })
      if (!res.ok) throw new Error("Failed to save")
      toast("B2B FAQs page updated successfully.", "success")
    } catch (e) {
      console.error(e)
      toast("Failed to save B2B FAQs page.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleHeaderChange = (field: string, value: any) => {
    setData(prev => ({
      ...prev,
      header: { ...prev.header, [field]: value }
    }))
  }

  const addFaq = () => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { questionEn: "", questionAr: "", answerEn: "", answerAr: "" }]
    }))
  }

  const removeFaq = (index: number) => {
    setData(prev => {
      const newItems = [...prev.items]
      newItems.splice(index, 1)
      return { ...prev, items: newItems }
    })
  }

  const updateFaq = (index: number, field: string, value: string) => {
    setData(prev => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }
      return { ...prev, items: newItems }
    })
  }

  return (
    <div className="flex flex-col gap-6 h-full p-6">
      <AdminPageHeader 
        title="B2B FAQs Editor"
        description="Manage the Frequently Asked Questions for the B2B portal."
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (En)</label>
                <input type="text" value={data.header.titleEn} onChange={e => handleHeaderChange('titleEn', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
                <input type="text" dir="rtl" value={data.header.titleAr} onChange={e => handleHeaderChange('titleAr', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (En)</label>
                <textarea value={data.header.subtitleEn} onChange={e => handleHeaderChange('subtitleEn', e.target.value)} className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (Ar)</label>
                <textarea dir="rtl" value={data.header.subtitleAr} onChange={e => handleHeaderChange('subtitleAr', e.target.value)} className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none" />
              </div>
            </div>
            
            <div className="space-y-4 border-t lg:border-t-0 lg:border-s border-border-default pt-4 lg:pt-0 lg:ps-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Background Media Type</label>
                <select value={data.header.mediaType} onChange={e => handleHeaderChange('mediaType', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none">
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Upload Background</label>
                <MediaUploader value={data.header.mediaUrl} onChange={(url) => handleHeaderChange('mediaUrl', url)} accept={data.header.mediaType === 'VIDEO' ? "video/*" : "image/*"} />
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">FAQ Items</h2>
            <AdminButton variant="outline" size="sm" onClick={addFaq}>
              <Plus className="w-4 h-4 me-2" />
              Add FAQ
            </AdminButton>
          </div>
          
          <div className="space-y-4">
            {data.items.length === 0 ? (
              <div className="text-center py-8 text-text-secondary border border-dashed border-border-default rounded-lg">
                No FAQs added yet.
              </div>
            ) : (
              data.items.map((item: any, index: number) => (
                <div key={index} className="border border-border-default rounded-lg p-4 bg-surface-hover space-y-4 relative group">
                  <button onClick={() => removeFaq(index)} className="absolute top-4 end-4 text-text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Question {index + 1}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Question (En)</label>
                      <input type="text" value={item.questionEn} onChange={e => updateFaq(index, 'questionEn', e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Question (Ar)</label>
                      <input type="text" dir="rtl" value={item.questionAr} onChange={e => updateFaq(index, 'questionAr', e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Answer (En)</label>
                      <textarea value={item.answerEn} onChange={e => updateFaq(index, 'answerEn', e.target.value)} className="w-full h-24 bg-surface-default border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Answer (Ar)</label>
                      <textarea dir="rtl" value={item.answerAr} onChange={e => updateFaq(index, 'answerAr', e.target.value)} className="w-full h-24 bg-surface-default border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </AdminFormLayout>
    </div>
  )
}
