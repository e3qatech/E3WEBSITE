"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Loader2, CheckCircle2 } from "lucide-react"

export function ApplicationForm({ jobId, jobTitle, locale }: { jobId: string, jobTitle: string, locale: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      position: jobTitle, // Tie the application to this job title
      jobId: jobId,       // Tie the application to this specific job ID
      department: formData.get("department") || "General",
      experienceLevel: formData.get("experienceLevel")
    }

    try {
      const res = await fetch("/api/crm/talent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Submission failed")
      
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError(locale === "ar" ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center animate-in zoom-in duration-300">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-emerald-500 mb-2">
          {locale === "ar" ? "تم استلام طلبك!" : "Application Received!"}
        </h3>
        <p className="text-[var(--text-secondary)]">
          {locale === "ar" 
            ? "شكراً لاهتمامك بالانضمام إلى E3. سيقوم فريقنا بمراجعة طلبك والتواصل معك قريباً."
            : "Thank you for your interest in joining E3. Our team will review your application and get back to you soon."}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
          {locale === "ar" ? "الاسم الكامل *" : "Full Name *"}
        </label>
        <Input required name="name" className="bg-[var(--surface-subtle)] border-[var(--border-default)]" />
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
          {locale === "ar" ? "البريد الإلكتروني *" : "Email Address *"}
        </label>
        <Input required type="email" name="email" className="bg-[var(--surface-subtle)] border-[var(--border-default)]" />
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
          {locale === "ar" ? "رقم الهاتف" : "Phone Number"}
        </label>
        <Input name="phone" className="bg-[var(--surface-subtle)] border-[var(--border-default)]" />
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
          {locale === "ar" ? "مستوى الخبرة *" : "Experience Level *"}
        </label>
        <select required name="experienceLevel" className="w-full px-4 py-3 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]">
          <option value="">{locale === "ar" ? "اختر..." : "Select..."}</option>
          <option value="JUNIOR">{locale === "ar" ? "مبتدئ" : "Junior"}</option>
          <option value="MID">{locale === "ar" ? "متوسط" : "Mid-Level"}</option>
          <option value="SENIOR">{locale === "ar" ? "متقدم" : "Senior"}</option>
          <option value="LEAD">{locale === "ar" ? "مدير/قائد" : "Lead/Manager"}</option>
        </select>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={loading} className="w-full gap-2 text-lg py-6 font-bold">
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading 
            ? (locale === "ar" ? "جاري الإرسال..." : "Submitting...") 
            : (locale === "ar" ? "تقديم الطلب" : "Submit Application")}
        </Button>
      </div>
    </form>
  )
}
