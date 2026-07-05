"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Mail, Phone, Briefcase, FileText, Download, CheckCircle, XCircle } from "lucide-react"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { AdminInput } from "@/components/dashboard/ui/AdminInput"
import { AdminSelect } from "@/components/dashboard/ui/AdminSelect"
import { AdminTextarea } from "@/components/dashboard/ui/AdminTextarea"

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
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    status: talent.status,
    rating: talent.rating?.toString() || "",
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
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch {
      alert("Failed to update candidate")
    } finally {
      setIsSaving(false)
    }
  }

  // Helper to parse JSON arrays safely
  const renderList = (data: any) => {
    if (!data) return <p className="text-text-tertiary text-sm">Not provided</p>
    let list: string[] = []
    if (typeof data === "string") {
      try { list = JSON.parse(data) } catch { list = [] }
    } else if (Array.isArray(data)) {
      list = data
    }
    
    if (list.length === 0) return <p className="text-text-tertiary text-sm">Not provided</p>
    
    return (
      <div className="flex flex-wrap gap-2">
        {list.map((item, i) => (
          <span key={i} className="px-3 py-1 bg-surface-hover border border-border-default rounded-md text-xs font-medium text-text-secondary">
            {item}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex items-center justify-between px-8 py-6 border-b border-border-default bg-surface-default shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose ? onClose : () => router.push("/dashboard/crm/talent")}
            className="p-2 bg-surface-hover hover:bg-surface-active rounded-lg transition-colors text-text-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{talent.name}</h1>
            <p className="text-xs text-text-secondary mt-1">Applied: {new Date(talent.appliedDate).toLocaleDateString()}</p>
          </div>
        </div>
        <AdminButton onClick={handleSave} isLoading={isSaving} variant={success ? "outline" : "primary"}>
          {success ? (
            <span className="flex items-center text-emerald-500 gap-2"><CheckCircle className="w-4 h-4" /> Saved Successfully</span>
          ) : (
            <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Evaluation</span>
          )}
        </AdminButton>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Applicant Overview */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-default p-8 rounded-2xl border border-border-default shadow-sm space-y-6">
              <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider border-b border-border-default pb-4">Applicant Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                <div>
                  <span className="text-text-tertiary block mb-1">Email</span>
                  <a href={`mailto:${talent.email}`} className="font-medium text-accent hover:underline flex items-center gap-2">
                    <Mail className="w-4 h-4 text-text-tertiary" /> {talent.email}
                  </a>
                </div>
                <div>
                  <span className="text-text-tertiary block mb-1">Phone</span>
                  <span className="font-medium text-text-primary flex items-center gap-2">
                    <Phone className="w-4 h-4 text-text-tertiary" /> {talent.phone || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-text-tertiary block mb-1">Position Applied</span>
                  <span className="font-medium text-text-primary flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-text-tertiary" /> {talent.position || talent.job?.title || "General Application"}
                  </span>
                </div>
                <div>
                  <span className="text-text-tertiary block mb-1">Experience Level</span>
                  <span className="font-medium text-text-primary">{talent.experienceLevel || "N/A"}</span>
                </div>
                <div>
                  <span className="text-text-tertiary block mb-1">Resume</span>
                  {talent.resumeUrl ? (
                    <AdminButton variant="outline" size="sm" className="mt-1 w-full sm:w-auto" onClick={() => window.open(talent.resumeUrl!, "_blank")}>
                      <Download className="w-4 h-4 me-2" /> Download CV
                    </AdminButton>
                  ) : (
                    <span className="text-text-secondary italic">No resume uploaded</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-surface-default p-8 rounded-2xl border border-border-default shadow-sm space-y-8">
              <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider border-b border-border-default pb-4">Parsed CV Data</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-bold text-text-secondary uppercase mb-3">Skills</h3>
                  {renderList(talent.skills)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-secondary uppercase mb-3">Languages</h3>
                  {renderList(talent.languages)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-secondary uppercase mb-3">Education</h3>
                  {renderList(talent.education)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-secondary uppercase mb-3">Certifications</h3>
                  {renderList(talent.certifications)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status & Internal Notes */}
          <div className="space-y-8">
            <div className="bg-surface-default p-8 rounded-2xl border border-border-default shadow-sm space-y-6 sticky top-0">
              <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider border-b border-border-default pb-4">Evaluation</h2>
              
              <div className="space-y-6">
                <AdminSelect
                  label="Application Status"
                  value={form.status}
                  onChange={(e) => setForm({...form, status: e.target.value})}
                >
                  <option value="NEW">New Application</option>
                  <option value="SCREENING">Screening</option>
                  <option value="INTERVIEW">Interviewing</option>
                  <option value="OFFERED">Offer Extended</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Rejected</option>
                </AdminSelect>

                <AdminInput
                  label="Rating (1-5)"
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm({...form, rating: e.target.value})}
                  placeholder="e.g. 4"
                />

                <AdminTextarea
                  label="Internal Notes"
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="Add interview feedback or internal notes here..."
                  rows={8}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
