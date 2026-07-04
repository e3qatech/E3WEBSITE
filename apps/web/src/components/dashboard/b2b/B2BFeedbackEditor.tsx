"use client"

import { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminButton } from "../ui/AdminButton"
import { useToast } from "@/components/dashboard/ui/ToastProvider"

export function B2BFeedbackEditor({ initialData }: { initialData: any }) {
  const [data, setData] = useState({
    header: {
      titleEn: initialData?.header?.titleEn || "Suggestions & Feedback",
      titleAr: initialData?.header?.titleAr || "الاقتراحات والملاحظات",
      subtitleEn: initialData?.header?.subtitleEn || "We value your feedback. Please share your thoughts with us.",
      subtitleAr: initialData?.header?.subtitleAr || "نحن نقدر ملاحظاتك. يرجى مشاركة أفكارك معنا.",
    },
    success: {
      titleEn: initialData?.success?.titleEn || "Thank you for your feedback!",
      titleAr: initialData?.success?.titleAr || "شكراً لملاحظاتك!",
      messageEn: initialData?.success?.messageEn || "Your submission has been received and will be reviewed by our team.",
      messageAr: initialData?.success?.messageAr || "تم استلام رسالتك وسيتم مراجعتها من قبل فريقنا.",
    }
  })

  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2b-feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data })
      })
      if (!res.ok) throw new Error("Failed to save")
      toast("B2B Feedback page updated successfully.", "success")
    } catch (e) {
      console.error(e)
      toast("Failed to save B2B Feedback page.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (section: 'header' | 'success', field: string, value: string) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }))
  }

  return (
    <div className="flex flex-col gap-6 h-full p-6">
      <AdminPageHeader 
        title="B2B Feedback CMS"
        description="Manage the content for the Suggestions & Feedback page."
        action={
          <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </AdminButton>
        }
      />

      <AdminFormLayout>
        {/* Header Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Header Content</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (En)</label>
                <input type="text" value={data.header.titleEn} onChange={e => handleChange('header', 'titleEn', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
                <input type="text" dir="rtl" value={data.header.titleAr} onChange={e => handleChange('header', 'titleAr', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (En)</label>
                <textarea value={data.header.subtitleEn} onChange={e => handleChange('header', 'subtitleEn', e.target.value)} className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (Ar)</label>
                <textarea dir="rtl" value={data.header.subtitleAr} onChange={e => handleChange('header', 'subtitleAr', e.target.value)} className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Success Message Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Success Message (Post-Submission)</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Success Title (En)</label>
                <input type="text" value={data.success.titleEn} onChange={e => handleChange('success', 'titleEn', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Success Title (Ar)</label>
                <input type="text" dir="rtl" value={data.success.titleAr} onChange={e => handleChange('success', 'titleAr', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Success Message (En)</label>
                <textarea value={data.success.messageEn} onChange={e => handleChange('success', 'messageEn', e.target.value)} className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Success Message (Ar)</label>
                <textarea dir="rtl" value={data.success.messageAr} onChange={e => handleChange('success', 'messageAr', e.target.value)} className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none" />
              </div>
            </div>
          </div>
        </div>

      </AdminFormLayout>
    </div>
  )
}
