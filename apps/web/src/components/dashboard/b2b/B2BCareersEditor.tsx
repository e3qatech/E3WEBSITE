"use client"

import { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminButton } from "../ui/AdminButton"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { MediaUploader } from "@/components/shared/MediaUploader"
import { Plus, Trash2 } from "lucide-react"

export function B2BCareersEditor({ initialData }: { initialData: any }) {
  const [data, setData] = useState({
    hero: {
      titleEn: initialData?.hero?.titleEn || "Join Our Team",
      titleAr: initialData?.hero?.titleAr || "انضم لفريقنا",
      subtitleEn: initialData?.hero?.subtitleEn || "Build the future of entertainment with us.",
      subtitleAr: initialData?.hero?.subtitleAr || "اصنع مستقبل الترفيه معنا.",
      mediaType: initialData?.hero?.mediaType || "IMAGE",
      mediaUrl: initialData?.hero?.mediaUrl || "",
    },
    jobs: Array.isArray(initialData?.jobs) ? initialData.jobs : []
  })

  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2b-careers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data })
      })
      if (!res.ok) throw new Error("Failed to save")
      toast("B2B Careers page updated successfully.", "success")
    } catch (e) {
      console.error(e)
      toast("Failed to save B2B Careers page.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleHeroChange = (field: string, value: any) => {
    setData(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }))
  }

  const addJob = () => {
    setData(prev => ({
      ...prev,
      jobs: [...prev.jobs, { titleEn: "", titleAr: "", department: "", location: "", type: "Full-time" }]
    }))
  }

  const removeJob = (index: number) => {
    setData(prev => {
      const newJobs = [...prev.jobs]
      newJobs.splice(index, 1)
      return { ...prev, jobs: newJobs }
    })
  }

  const updateJob = (index: number, field: string, value: string) => {
    setData(prev => {
      const newJobs = [...prev.jobs]
      newJobs[index] = { ...newJobs[index], [field]: value }
      return { ...prev, jobs: newJobs }
    })
  }

  return (
    <div className="flex flex-col gap-6 h-full p-6">
      <AdminPageHeader 
        title="B2B Careers CMS"
        description="Manage open roles and career page hero content."
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (En)</label>
                <input type="text" value={data.hero.titleEn} onChange={e => handleHeroChange('titleEn', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
                <input type="text" dir="rtl" value={data.hero.titleAr} onChange={e => handleHeroChange('titleAr', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (En)</label>
                <textarea value={data.hero.subtitleEn} onChange={e => handleHeroChange('subtitleEn', e.target.value)} className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (Ar)</label>
                <textarea dir="rtl" value={data.hero.subtitleAr} onChange={e => handleHeroChange('subtitleAr', e.target.value)} className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none" />
              </div>
            </div>
            
            <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-border-default pt-4 lg:pt-0 lg:pl-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Hero Media Type</label>
                <select value={data.hero.mediaType} onChange={e => handleHeroChange('mediaType', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none">
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Upload Hero Background</label>
                <MediaUploader value={data.hero.mediaUrl} onChange={(url) => handleHeroChange('mediaUrl', url)} accept={data.hero.mediaType === 'VIDEO' ? "video/*" : "image/*"} />
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Open Roles</h2>
            <AdminButton variant="outline" size="sm" onClick={addJob}>
              <Plus className="w-4 h-4 mr-2" />
              Add Job
            </AdminButton>
          </div>
          
          <div className="space-y-4">
            {data.jobs.length === 0 ? (
              <div className="text-center py-8 text-text-secondary border border-dashed border-border-default rounded-lg">
                No open roles added yet.
              </div>
            ) : (
              data.jobs.map((job: any, index: number) => (
                <div key={index} className="border border-border-default rounded-lg p-4 bg-surface-hover space-y-4 relative group">
                  <button onClick={() => removeJob(index)} className="absolute top-4 right-4 text-text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Job {index + 1}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Job Title (En)</label>
                      <input type="text" value={job.titleEn} onChange={e => updateJob(index, 'titleEn', e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Job Title (Ar)</label>
                      <input type="text" dir="rtl" value={job.titleAr} onChange={e => updateJob(index, 'titleAr', e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Department</label>
                      <input type="text" placeholder="e.g. Engineering, Design..." value={job.department} onChange={e => updateJob(index, 'department', e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Location</label>
                      <input type="text" placeholder="e.g. Doha, Qatar" value={job.location} onChange={e => updateJob(index, 'location', e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Job Type</label>
                      <select value={job.type} onChange={e => updateJob(index, 'type', e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none">
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
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
