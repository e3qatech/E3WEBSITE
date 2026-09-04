"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Save, 
  Mail, 
  Phone, 
  Briefcase, 
  Download, 
  X, 
  Sparkles, 
  CheckCircle2, 
  GraduationCap, 
  Award, 
  Languages, 
  FileText,
  Star
} from "lucide-react"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"

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

interface TalentDetailProps {
  initialTalent: Talent
  onClose?: () => void
  isDrawer?: boolean
}

export function TalentDetail({ initialTalent, onClose, isDrawer = false }: TalentDetailProps) {
  const router = useRouter()
  const [talent, setTalent] = useState(initialTalent)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    status: talent.status || "NEW",
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
      if (!res.ok) throw new Error("Failed to save")
      setSuccess(true)
      setTalent(prev => ({
        ...prev,
        status: form.status,
        rating: form.rating === "" ? null : Number(form.rating),
        notes: form.notes
      }))
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch {
      alert("Failed to update candidate")
    } finally {
      setIsSaving(false)
    }
  }

  // Parse JSON or string lists safely
  const parseItems = (data: any): string[] => {
    if (!data) return []
    if (Array.isArray(data)) return data.filter(Boolean).map(String)
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String)
      } catch {
        // Comma separated fallback
        return data.split(",").map(s => s.trim()).filter(Boolean)
      }
    }
    return []
  }

  const skillsList = parseItems(talent.skills)
  const languagesList = parseItems(talent.languages)
  const educationList = parseItems(talent.education)
  const certificationsList = parseItems(talent.certifications)

  const content = (
    <div className="space-y-6">
      {/* Header bar (Used in both full page and drawer mode) */}
      <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">{talent.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
              form.status === 'HIRED'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : form.status === 'REJECTED'
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : form.status === 'INTERVIEW'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}>
              {form.status}
            </span>
          </div>
          <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
            <span>{talent.position || talent.job?.title || "General Application"}</span>
            {talent.department && (
              <>
                <span className="text-zinc-600">•</span>
                <span>{talent.department}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : success ? "Saved Successfully!" : "Save Evaluation"}</span>
          </button>

          {isDrawer && onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Overview & Parsed CV (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Applicant Overview Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                <span>Applicant Overview</span>
              </h2>
              {talent.resumeUrl && (
                <a
                  href={talent.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>Download CV</span>
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Email Address</span>
                <a href={`mailto:${talent.email}`} className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 break-all">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="break-all">{talent.email}</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Phone Number</span>
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{talent.phone || "Not provided"}</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Position Applied</span>
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{talent.position || talent.job?.title || "General Application"}</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Experience Level</span>
                <span className="text-xs font-bold text-emerald-400">
                  {talent.experienceLevel || "Mid-Level"}
                </span>
              </div>
            </div>
          </div>

          {/* Parsed CV Data Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>AI Parsed Qualifications</span>
              </h2>
              <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-800/50">
                GEMINI 2.0
              </span>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>Extracted Skills</span>
              </h3>
              {skillsList.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-purple-950/50 text-purple-200 border border-purple-800/40 text-xs font-semibold shadow-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No skills extracted yet</p>
              )}
            </div>

            {/* Languages */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/50">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-teal-400" />
                <span>Languages</span>
              </h3>
              {languagesList.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {languagesList.map((lang, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-teal-950/50 text-teal-200 border border-teal-800/40 text-xs font-semibold"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">Not provided</p>
              )}
            </div>

            {/* Education */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/50">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Education & Qualifications</span>
              </h3>
              {educationList.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{edu}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">Not provided</p>
              )}
            </div>

            {/* Certifications */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/50">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Certifications & Accreditations</span>
              </h3>
              {certificationsList.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {certificationsList.map((cert, idx) => (
                    <div key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">Not provided</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Evaluation & Hiring Feedback (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 shadow-sm space-y-5">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider pb-3 border-b border-zinc-800/80 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>HR Evaluation</span>
            </h2>

            <div className="space-y-4">
              {/* Application Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Application Pipeline Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-semibold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="NEW">New Application</option>
                  <option value="SCREENING">Screening Phase</option>
                  <option value="INTERVIEW">Scheduled for Interview</option>
                  <option value="OFFERED">Offer Extended</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Archived / Rejected</option>
                </select>
              </div>

              {/* Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>Candidate Rating</span>
                  <span className="text-[11px] text-zinc-500 font-normal">Scale 1 to 5</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: String(star) })}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        Number(form.rating) >= star
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                          : "bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                  {form.rating && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, rating: "" })}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 ms-2 underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Internal HR Notes & Feedback</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Record interview observations, salary expectations, role suitability, or team feedback..."
                  rows={7}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 resize-y"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving Evaluation..." : "Save Evaluation"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (isDrawer) {
    return <div className="p-6">{content}</div>
  }

  return (
    <DashboardPageShell variant="wide">
      <div className="p-8">
        {content}
      </div>
    </DashboardPageShell>
  )
}
