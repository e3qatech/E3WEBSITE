"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Phone, Briefcase, GraduationCap, Award, Globe, Star } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { format } from "date-fns"

const STATUS_OPTIONS = [
  "NEW", "SCREENING", "INTERVIEW", "OFFERED", "HIRED", "REJECTED"
]

export function TalentDetailView({ initialData, team }: { initialData: any, team: any[] }) {
  const router = useRouter()
  const [talent, setTalent] = useState(initialData)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async (data: any) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/crm/talent/${talent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        const updated = await res.json()
        setTalent(updated)
        router.refresh()
      }
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crm/talent" className="p-2 hover:bg-[var(--surface-hover)] rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">{talent.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[var(--text-secondary)] text-sm">
              <span className="flex items-center"><Mail className="w-4 h-4 me-1" /> {talent.email}</span>
              {talent.phone && <span className="flex items-center"><Phone className="w-4 h-4 me-1" /> {talent.phone}</span>}
              <span className="flex items-center"><Briefcase className="w-4 h-4 me-1" /> {talent.experienceLevel || "Unknown"} Experience</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={talent.resumeUrl || "#"} target="_blank" rel="noreferrer" className={!talent.resumeUrl ? "opacity-50 pointer-events-none" : ""}>
              View Original CV
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[var(--text-primary)] mb-4">Application Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Status</label>
                <select 
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  value={talent.status}
                  onChange={(e) => handleUpdate({ status: e.target.value })}
                  disabled={isUpdating}
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Rating</label>
                <select 
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  value={talent.rating || 0}
                  onChange={(e) => handleUpdate({ rating: parseInt(e.target.value) })}
                  disabled={isUpdating}
                >
                  <option value="0">Unrated</option>
                  {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Assign to Team Member</label>
                <select 
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  value={talent.assignedToId || ""}
                  onChange={(e) => handleUpdate({ assignedToId: e.target.value || null })}
                  disabled={isUpdating}
                >
                  <option value="">Unassigned</option>
                  {team.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Globe className="w-5 h-5 me-2 text-blue-500" /> Languages
            </h3>
            <ul className="space-y-2">
              {(talent.languages || []).map((l: any, i: number) => (
                <li key={i} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-[var(--text-primary)]">{l.language || l}</span>
                  <span className="text-[var(--text-secondary)] text-xs bg-[var(--surface-hover)] px-2 py-1 rounded-md">{l.level || "Unknown"}</span>
                </li>
              ))}
              {(!talent.languages || talent.languages.length === 0) && (
                <li className="text-sm text-[var(--text-tertiary)] italic">No languages parsed.</li>
              )}
            </ul>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Award className="w-5 h-5 me-2 text-amber-500" /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {(talent.skills || []).map((skill: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-full text-sm font-bold text-[var(--text-primary)]">
                  {skill}
                </span>
              ))}
              {(!talent.skills || talent.skills.length === 0) && (
                <span className="text-sm text-[var(--text-tertiary)] italic">No skills parsed.</span>
              )}
            </div>
          </div>

          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center mb-4">
              <GraduationCap className="w-5 h-5 me-2 text-emerald-500" /> Education
            </h3>
            <div className="space-y-4">
              {(talent.education || []).map((edu: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--surface-hover)] flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6 text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)]">{edu.degree || edu}</h4>
                    {edu.institution && <p className="text-sm text-[var(--text-secondary)]">{edu.institution}</p>}
                    {edu.year && <p className="text-xs text-[var(--text-tertiary)]">{edu.year}</p>}
                  </div>
                </div>
              ))}
              {(!talent.education || talent.education.length === 0) && (
                <span className="text-sm text-[var(--text-tertiary)] italic">No education details parsed.</span>
              )}
            </div>
          </div>

          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Briefcase className="w-5 h-5 me-2 text-green-500" /> Certifications
            </h3>
            <ul className="list-disc ps-5 space-y-1">
              {(talent.certifications || []).map((cert: any, i: number) => (
                <li key={i} className="text-sm text-[var(--text-secondary)]">
                  <span className="font-bold text-[var(--text-primary)]">{cert.name || cert}</span>
                </li>
              ))}
              {(!talent.certifications || talent.certifications.length === 0) && (
                <li className="text-sm text-[var(--text-tertiary)] italic list-none -ms-5">No certifications parsed.</li>
              )}
            </ul>
          </div>

        </div>

      </div>
    </div>
  )
}
