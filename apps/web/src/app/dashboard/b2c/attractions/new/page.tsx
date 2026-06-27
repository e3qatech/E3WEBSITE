"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"

export default function NewAttractionPage() {
  const router = useRouter()
  const [nameEn, setNameEn] = useState("")
  const [nameAr, setNameAr] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameEn || !nameAr) {
      setError("Please provide both English and Arabic names.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/b2c/attractions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameEn, nameAr })
      })

      if (!res.ok) {
        throw new Error("Failed to create attraction.")
      }

      const data = await res.json()
      router.push(`/dashboard/b2c/attractions/${data.id}/edit`)
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto mt-12">
      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-8 shadow-xl shadow-black/5">
        <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2">Add New Attraction</h1>
        <p className="text-[var(--text-secondary)] mb-8">Enter the primary names for this attraction. You can edit all other details on the next page.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] text-sm font-bold border border-[var(--color-error)]/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--text-primary)] block">Attraction Name (English)</label>
            <input 
              type="text" 
              value={nameEn}
              onChange={e => setNameEn(e.target.value)}
              placeholder="e.g. The Winter Wonderland"
              className="w-full px-4 py-3 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              required
            />
          </div>

          <div className="space-y-2" dir="rtl">
            <label className="text-sm font-bold text-[var(--text-primary)] block">Attraction Name (Arabic)</label>
            <input 
              type="text" 
              value={nameAr}
              onChange={e => setNameAr(e.target.value)}
              placeholder="مثال: ونتر وندرلاند"
              className="w-full px-4 py-3 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-right"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create & Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
