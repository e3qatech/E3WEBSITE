"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, Search, Edit2, Trash2, Globe, Sparkles, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { useRouter } from "next/navigation"

interface CaseStudy {
  id: string
  slug: string
  title: any // JSON { en: string, ar: string }
  clientName: string
  category: any // JSON string[]
  year: number
  isPublished: boolean
  isFeatured: boolean
}

interface CasesListProps {
  initialCases: CaseStudy[]
}

export function CasesList({ initialCases }: CasesListProps) {
  const [cases, setCases] = useState<CaseStudy[]>(initialCases)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleToggle = async (id: string, field: "isPublished" | "isFeatured", currentValue: boolean) => {
    // Optimistic Update
    setCases(prev => prev.map(c => c.id === id ? { ...c, [field]: !currentValue } : c))

    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue })
      })

      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      // Revert if error
      setCases(prev => prev.map(c => c.id === id ? { ...c, [field]: currentValue } : c))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this case study?")) return

    setIsDeletingId(id)
    try {
      const res = await fetch(`/api/cases/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setCases(prev => prev.filter(c => c.id !== id))
      router.refresh()
    } catch {
      alert("Failed to delete case study")
    } finally {
      setIsDeletingId(null)
    }
  }

  const filteredCases = cases.filter(c => {
    const titleEn = c.title?.en || ""
    const titleAr = c.title?.ar || ""
    const tags = Array.isArray(c.category) ? c.category.join(" ") : ""
    const matchString = `${titleEn} ${titleAr} ${c.clientName} ${tags} ${c.year}`.toLowerCase()
    return matchString.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Case Studies & Portfolios</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage E3's corporate credibility proofs and event engineering portfolio.</p>
        </div>
        <Link href="/dashboard/b2b/cases/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Create Case Study
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex gap-4 items-center bg-[var(--surface-default)] p-4 rounded-xl border border-[var(--border-default)]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search by title, client, tags, or execution year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg py-2 pl-10 pr-4 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* Case Studies Grid/List */}
      {filteredCases.length === 0 ? (
        <div className="border border-dashed border-[var(--border-default)] rounded-xl p-12 text-center bg-[var(--surface-default)]">
          <FolderKanban className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-4" />
          <p className="text-sm font-bold text-[var(--text-primary)] mb-1">No case studies found</p>
          <p className="text-xs text-[var(--text-secondary)]">Get started by building E3's first activation showcase.</p>
        </div>
      ) : (
        <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--surface-subtle)] text-[var(--text-secondary)] text-xs font-bold uppercase">
                  <th className="px-6 py-4">Showcase Info</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)] text-sm text-[var(--text-primary)]">
                {filteredCases.map(c => {
                  const titleEn = c.title?.en || "Untitled Showcase"
                  const titleAr = c.title?.ar || ""
                  const tags = Array.isArray(c.category) ? c.category : []

                  return (
                    <tr key={c.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold">{titleEn}</div>
                        {titleAr && <div className="text-xs text-[var(--text-tertiary)] text-right font-medium" dir="rtl">{titleAr}</div>}
                        <div className="text-xs text-[var(--text-secondary)] font-mono">/{c.slug}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-[var(--text-secondary)]">
                        {c.clientName}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold">
                        {c.year}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="default" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {tags.length > 3 && <span className="text-xs text-[var(--text-tertiary)]">+{tags.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggle(c.id, "isPublished", c.isPublished)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all
                            ${c.isPublished
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : "bg-[var(--border-default)] text-[var(--text-tertiary)] border border-transparent"
                            }
                          `}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          {c.isPublished ? "Live" : "Draft"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggle(c.id, "isFeatured", c.isFeatured)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all
                            ${c.isFeatured
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-[var(--border-default)] text-[var(--text-tertiary)] border border-transparent"
                            }
                          `}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {c.isFeatured ? "Featured" : "Standard"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/b2b/cases/${c.id}/edit`}>
                            <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors rounded-lg hover:bg-[var(--surface-hover)]">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={isDeletingId === c.id}
                            className="p-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
