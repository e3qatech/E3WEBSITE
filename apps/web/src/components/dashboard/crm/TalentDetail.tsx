"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Mail, Phone, Briefcase, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

export type Talent = {
  id: string
  name: string
  email: string
  phone: string | null
  position: string | null
  department: string | null
  experienceLevel: string | null
  status: string
  rating: number | null
  appliedDate: string
  resumeUrl: string | null
  skills: any | null
  languages: any | null
  education: any | null
  certifications: any | null
  notes: string | null
  job: { title: string } | null
}

export function TalentDetail({ initialTalent, onClose }: { initialTalent: Talent; onClose?: () => void }) {
  const router = useRouter()
  const [talent, setTalent] = useState(initialTalent)
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    status: talent.status,
    rating: talent.rating || "",
    notes: talent.notes || ""
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/crm/talent/${talent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: form.status,
          rating: form.rating === "" ? null : Number(form.rating),
          notes: form.notes
        })
      })
      if (!res.ok) throw new Error()
      router.refresh()
      alert("Candidate updated successfully")
    } catch {
      alert("Failed to update candidate")
    } finally {
      setIsSaving(false)
    }
  }

  // Helper to parse JSON arrays safely
  const renderList = (data: any) => {
    if (!data) return <p className="text-[var(--text-tertiary)] text-sm">Not provided</p>
    let list: string[] = []
    if (typeof data === "string") {
      try { list = JSON.parse(data) } catch { list = [] }
    } else if (Array.isArray(data)) {
      list = data
    }
    
    if (list.length === 0) return <p className="text-[var(--text-tertiary)] text-sm">Not provided</p>
    
    return (
      <div className="flex flex-wrap gap-2">
        {list.map((item, i) => (
          <Badge key={i} variant="default" className="bg-[var(--surface-default)]">{item}</Badge>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between bg-[var(--surface-default)] p-4 rounded-xl border border-[var(--border-default)] shadow-sm sticky top-6 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose ? onClose : () => router.push("/dashboard/crm/talent")}
            className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors text-[var(--text-secondary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Candidate: {talent.name}</h1>
            <p className="text-xs text-[var(--text-secondary)]">Applied: {new Date(talent.appliedDate).toLocaleDateString()}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Applicant Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] shadow-sm space-y-6">
            <h2 className="font-bold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-4">Applicant Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <span className="text-[var(--text-tertiary)] block mb-1">Email</span>
                <a href={`mailto:${talent.email}`} className="font-medium text-[var(--color-primary)] flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {talent.email}
                </a>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block mb-1">Phone</span>
                <span className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {talent.phone || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block mb-1">Position Applied</span>
                <span className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> {talent.position || talent.job?.title || "General Application"}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block mb-1">Experience Level</span>
                <span className="font-medium text-[var(--text-primary)]">{talent.experienceLevel || "N/A"}</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block mb-1">Resume</span>
                {talent.resumeUrl ? (
                  <Button variant="outline" size="sm" asChild className="mt-1">
                    <a href={talent.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 me-2" /> Download CV
                    </a>
                  </Button>
                ) : (
                  <span className="text-[var(--text-secondary)] italic">No resume uploaded</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] shadow-sm space-y-6">
            <h2 className="font-bold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-4">Parsed CV Data</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-2">Skills</h3>
                {renderList(talent.skills)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-2">Languages</h3>
                {renderList(talent.languages)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-2">Education</h3>
                {renderList(talent.education)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-2">Certifications</h3>
                {renderList(talent.certifications)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Internal Notes */}
        <div className="space-y-6">
          <div className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] shadow-sm space-y-6">
            <h2 className="font-bold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-4">Evaluation</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-primary)]">Application Status</label>
                <select 
                  value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-4 py-2.5"
                >
                  <option value="NEW">New</option>
                  <option value="SCREENING">Screening</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFERED">Offered</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-primary)]">Rating (1-5)</label>
                <input 
                  type="number" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-4 py-2.5"
                  placeholder="e.g. 4" min="1" max="5"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-primary)]">Internal Notes</label>
                <textarea 
                  value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-sm resize-y"
                  rows={8}
                  placeholder="Add interview feedback or internal notes here..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
