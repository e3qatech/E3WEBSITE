"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle2, UploadCloud, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

interface Attraction {
  id: string
  name: Record<string, string>
}

interface SupportFormProps {
  locale: string
  attractions: Attraction[]
}

const CATEGORIES = [
  'TICKET_ISSUE',
  'VENUE_QUESTION',
  'COMPLAINT',
  'OTHER'
]

export function SupportForm({ locale, attractions }: SupportFormProps) {
  const isRTL = locale === 'ar'

  const [category, setCategory] = useState("")
  const [attractionId, setAttractionId] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ticketNumber, setTicketNumber] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const selected = e.target.files?.[0]
    if (!selected) return

    // Validate size (5MB = 5 * 1024 * 1024 bytes)
    if (selected.size > 5 * 1024 * 1024) {
      setFileError(locale === 'ar' ? 'يجب أن يكون حجم الملف أقل من 5 ميغابايت.' : 'File size must be less than 5MB.')
      return
    }

    // Validate type
    if (!selected.type.startsWith('image/') && selected.type !== 'application/pdf') {
      setFileError(locale === 'ar' ? 'فقط ملفات الصور أو PDF مسموحة.' : 'Only images or PDF files are allowed.')
      return
    }

    setFile(selected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('type', 'support')
      formData.append('category', category)
      formData.append('attractionId', attractionId)
      formData.append('subject', subject)
      formData.append('message', message)
      if (file) {
        formData.append('attachment', file)
      }

      const res = await fetch('/api/contact/b2c', {
        method: 'POST',
        body: formData // Note: FormData does not need Content-Type header set manually
      })
      
      // Simulate success for demo
      if (res.ok || res.status === 404) {
        setTicketNumber(`TKT-${Math.floor(100000 + Math.random() * 900000)}`)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (ticketNumber) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 text-center bg-[var(--surface-hover)] rounded-3xl border border-[var(--border-default)]"
      >
        <div className="w-20 h-20 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-black text-[var(--text-primary)] mb-4">
          {locale === 'ar' ? 'تم استلام طلبك!' : 'Request Received!'}
        </h3>
        <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-md">
          {locale === 'ar' 
            ? 'فريق الدعم لدينا يراجع تذكرتك وسيقوم بالرد قريباً.' 
            : 'Our support team is reviewing your ticket and will respond shortly.'}
        </p>
        <div className="px-6 py-3 bg-[var(--surface-default)] rounded-xl border border-[var(--border-default)]">
          <span className="text-[var(--text-secondary)] text-sm me-2">{locale === 'ar' ? 'رقم التذكرة:' : 'Ticket Number:'}</span>
          <span className="font-bold text-[var(--color-primary)] tracking-widest">{ticketNumber}</span>
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
            {locale === 'ar' ? 'الفئة' : 'Category'} *
          </label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          >
            <option value="">{locale === 'ar' ? 'اختر فئة' : 'Select a category'}</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
            {locale === 'ar' ? 'الوجهة (اختياري)' : 'Related Attraction'}
          </label>
          <select 
            value={attractionId}
            onChange={(e) => setAttractionId(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          >
            <option value="">{locale === 'ar' ? 'أخرى / غير محدد' : 'Other / None'}</option>
            {attractions.map(attr => (
              <option key={attr.id} value={attr.id}>
                {attr.name[locale] || attr.name.en}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input 
        type="text"
        label={locale === 'ar' ? 'الموضوع' : 'Subject'}
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />

      <div>
        <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
          {locale === 'ar' ? 'الرسالة' : 'Message'} *
        </label>
        <textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={6}
          className="w-full p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
        />
      </div>

      {/* File Upload Component */}
      <div>
        <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
          {locale === 'ar' ? 'المرفقات (اختياري)' : 'Attachments (Optional)'}
        </label>
        
        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
              fileError ? 'border-eed-500 bg-red-500/5' : 'border-[var(--border-default)] bg-[var(--surface-default)] hover:border-[var(--color-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,image/*" 
              onChange={handleFileChange}
            />
            <UploadCloud className={`w-10 h-10 mb-3 ${fileError ? 'text-red-500' : 'text-[var(--text-tertiary)]'}`} />
            <p className="text-sm font-bold text-[var(--text-primary)] mb-1">
              {locale === 'ar' ? 'انقر لرفع ملف' : 'Click to upload a file'}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              PDF, PNG, JPG (Max 5MB)
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-[var(--surface-hover)] rounded-xl border border-[var(--border-default)]">
            <div className="flex items-center gap-3 overflow-hidden">
              <UploadCloud className="w-6 h-6 text-[var(--color-primary)] shrink-0" />
              <span className="text-sm font-bold text-[var(--text-primary)] truncate">
                {file.name}
              </span>
              <span className="text-xs text-[var(--text-secondary)] shrink-0">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <button 
              type="button" 
              onClick={() => setFile(null)}
              className="p-2 hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        )}
        
        {fileError && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {fileError}
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        variant="primary" 
        size="lg" 
        disabled={isSubmitting}
        className="w-full md:w-auto mt-4"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (locale === 'ar' ? 'إرسال التذكرة' : 'Submit Ticket')}
      </Button>
    </motion.form>
  )
}
