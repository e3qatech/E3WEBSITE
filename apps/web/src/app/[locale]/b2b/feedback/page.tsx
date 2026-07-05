"use client"

import React, { useState, useEffect } from 'react'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Send, CheckCircle2 } from 'lucide-react'

export default function B2BFeedbackPage({ params }: { params: any }) {
  // We use "use client" because of the form interactivity and fetching
  const [isAr, setIsAr] = useState(false)
  const [cmsData, setCmsData] = useState<any>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '', // Reusing company/title for title
    message: '',
    rating: 0
  })

  useEffect(() => {
    // Determine locale from path since we can't await params in a client component easily without a wrapper
    setIsAr(window.location.pathname.startsWith('/ar'))
    
    fetch('/api/cms/pages/b2b-feedback')
      .then(res => res.json())
      .then(json => {
        if (json && json.data && json.data.content) {
          setCmsData(json.data.content)
        } else if (json && json.content) {
          setCmsData(json.content)
        }
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/b2b/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setSubmitted(true)
        setFormData({ name: '', email: '', title: '', message: '', rating: 0 })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const headerTitle = isAr ? (cmsData?.header?.titleAr || "الاقتراحات والملاحظات") : (cmsData?.header?.titleEn || "Suggestions & Feedback");
  const headerSubtitle = isAr ? (cmsData?.header?.subtitleAr || "نحن نقدر ملاحظاتك. يرجى مشاركة أفكارك معنا.") : (cmsData?.header?.subtitleEn || "We value your feedback. Please share your thoughts with us.");

  const successTitle = isAr ? (cmsData?.success?.titleAr || "شكراً لملاحظاتك!") : (cmsData?.success?.titleEn || "Thank you for your feedback!");
  const successMessage = isAr ? (cmsData?.success?.messageAr || "تم استلام رسالتك وسيتم مراجعتها من قبل فريقنا.") : (cmsData?.success?.messageEn || "Your submission has been received and will be reviewed by our team.");

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-32 pb-24" dir={isAr ? 'rtl' : 'ltr'}>
      
      <div className="max-w-3xl mx-auto w-full px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase mb-6">
            {headerTitle}
          </h1>
          <p className="text-lg text-zinc-400">
            {headerSubtitle}
          </p>
        </div>

        {/* Form Section */}
        <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50 p-8 md:p-12 shadow-2xl">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">{successTitle}</h2>
              <p className="text-zinc-400 max-w-md">{successMessage}</p>
              <Button 
                variant="outline" 
                onClick={() => setSubmitted(false)}
                className="mt-8 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                {isAr ? "إرسال ملاحظة أخرى" : "Submit Another"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {isAr ? "الاسم" : "Name"}
                  </label>
                  <Input name="name" value={formData.name} onChange={handleChange} required placeholder={isAr ? "أدخل اسمك" : "Enter your name"} className="bg-zinc-950/50 border-zinc-800 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {isAr ? "البريد الإلكتروني" : "Email"}
                  </label>
                  <Input name="email" value={formData.email} onChange={handleChange} type="email" required placeholder={isAr ? "أدخل بريدك الإلكتروني" : "Enter your email"} className="bg-zinc-950/50 border-zinc-800 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {isAr ? "الموضوع أو العنوان" : "Subject / Title"}
                  </label>
                  <Input name="title" value={formData.title} onChange={handleChange} required placeholder={isAr ? "عنوان الرسالة" : "Message subject"} className="bg-zinc-950/50 border-zinc-800 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {isAr ? "نوع الملاحظة" : "Feedback Type"}
                  </label>
                  <select required className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="" disabled selected>{isAr ? "اختر النوع" : "Select type"}</option>
                    <option value="suggestion">{isAr ? "اقتراح" : "Suggestion"}</option>
                    <option value="issue">{isAr ? "مشكلة" : "Report an Issue"}</option>
                    <option value="praise">{isAr ? "إشادة" : "Praise"}</option>
                    <option value="other">{isAr ? "أخرى" : "Other"}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {isAr ? "الرسالة" : "Message"}
                </label>
                <textarea 
                  required 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder={isAr ? "أخبرنا كيف يمكننا التحسين..." : "Tell us how we can improve..."}
                  className="flex w-full rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-white text-zinc-950 hover:bg-zinc-200">
                <Send className={`w-4 h-4 ${isAr ? 'ms-2' : 'me-2'}`} />
                {isSubmitting ? (isAr ? "جاري الإرسال..." : "Submitting...") : (isAr ? "إرسال الملاحظات" : "Submit Feedback")}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
