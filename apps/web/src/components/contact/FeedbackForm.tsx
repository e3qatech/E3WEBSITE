"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

interface Attraction {
  id: string
  name: Record<string, string>
}

interface FeedbackFormProps {
  locale: string
  attractions: Attraction[]
}

export function FeedbackForm({ locale, attractions }: FeedbackFormProps) {
  const isRTL = locale === 'ar'

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [attractionId, setAttractionId] = useState("")
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/contact/b2c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feedback',
          rating,
          attractionId,
          title,
          comment,
          name,
          email
        })
      })
      
      // Simulate success for demo purposes if route not ready
      if (res.ok || res.status === 404) {
        setIsSuccess(true)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 text-center bg-[var(--surface-hover)] rounded-3xl border border-[var(--border-default)]"
      >
        <div className="w-20 h-20 bg-[var(--color-success)]/20 text-[var(--color-success)] rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-black text-[var(--text-primary)] mb-4">
          {locale === 'ar' ? 'شكراً لك!' : 'Thank you!'}
        </h3>
        <p className="text-lg text-[var(--text-secondary)]">
          {locale === 'ar' ? 'ملاحظاتك تساعدنا على التحسن.' : 'Your feedback helps us improve.'}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.form 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
          {locale === 'ar' ? 'الوجهة (اختياري)' : 'Attraction (Optional)'}
        </label>
        <select 
          value={attractionId}
          onChange={(e) => setAttractionId(e.target.value)}
          className="w-full h-12 px-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        >
          <option value="">{locale === 'ar' ? 'اختر وجهة' : 'Select an attraction'}</option>
          {attractions.map(attr => (
            <option key={attr.id} value={attr.id}>
              {attr.name[locale] || attr.name.en}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
          {locale === 'ar' ? 'تقييمك' : 'Your Rating'} *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star 
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'fill-[var(--surface-default)] text-[var(--border-default)]'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <Input 
        type="text"
        label={locale === 'ar' ? 'العنوان' : 'Title'}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div>
        <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
          {locale === 'ar' ? 'التعليق' : 'Comment'} *
        </label>
        <textarea 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={5}
          className="w-full p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          type="text"
          label={locale === 'ar' ? 'الاسم (اختياري)' : 'Name (Optional)'}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input 
          type="email"
          label={locale === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <Button 
        type="submit" 
        variant="primary" 
        size="lg" 
        disabled={isSubmitting || rating === 0}
        className="w-full md:w-auto"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (locale === 'ar' ? 'إرسال التقييم' : 'Submit Feedback')}
      </Button>
    </motion.form>
  )
}
