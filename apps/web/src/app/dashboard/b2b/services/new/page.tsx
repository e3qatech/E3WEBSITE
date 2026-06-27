"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"

export default function NewServicePage() {
  const router = useRouter()
  const [titleEn, setTitleEn] = useState("")
  const [titleAr, setTitleAr] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titleEn || !titleAr) {
      setError("Please provide both English and Arabic titles.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/b2b/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleEn, titleAr })
      })

      if (!res.ok) {
        throw new Error("Failed to create service.")
      }

      const data = await res.json()
      router.push(`/dashboard/b2b/services/${data.id}/edit`)
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto mt-12">
      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-8 shadow-xl shadow-black/5">
        <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2">Add New Service</h1>
        <p className="text-[var(--text-secondary)] mb-8">Enter the primary names for this service. You can edit all other details on the next page.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] text-sm font-bold border border-[var(--color-error)]/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--text-primary)] block">Service Name (English)</label>
            <input 
              type="text" 
              value={titleEn}
              onChange={e => setTitleEn(e.target.value)}
              placeholder="e.g. Event Engineering"
              className="w-full px-4 py-3 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              required
            />
          </div>

          <div className="space-y-2" dir="rtl">
            <label className="text-sm font-bold text-[var(--text-primary)] block">Service Name (Arabic)</label>
            <input 
              type="text" 
              value={titleAr}
              onChange={e => setTitleAr(e.target.value)}
              placeholder="مثال: هندسة الفعاليات"
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
