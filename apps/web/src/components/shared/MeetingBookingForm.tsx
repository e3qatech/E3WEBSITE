"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, User, Briefcase, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

interface MeetingBookingFormProps {
  locale: string
  serviceSlug?: string
  hostId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function MeetingBookingForm({ locale, serviceSlug, hostId, onSuccess, onCancel }: MeetingBookingFormProps) {
  const isRTL = locale === 'ar'
  
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    name: '',
    email: '',
    company: '',
    description: ''
  })

  // Mock times for the date
  const availableTimes = ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "04:00 PM"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API POST to /api/contact/b2b (type: meeting)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSuccess(true)
    if (onSuccess) onSuccess()
  }

  const resetForm = () => {
    setStep(1)
    setIsSuccess(false)
    setFormData({ date: '', time: '', name: '', email: '', company: '', description: '' })
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <CheckCircle2 className="w-20 h-20 text-[var(--color-success)] mb-6" />
        </motion.div>
        <h4 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {locale === 'ar' ? 'تم تأكيد طلبك!' : 'Request Confirmed!'}
        </h4>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md">
          {locale === 'ar' 
            ? 'لقد استلمنا طلب الحجز الخاص بك. سيتواصل معك أحد المتخصصين قريباً لتأكيد الموعد.' 
            : 'We have received your booking request. A specialist will contact you shortly to confirm.'}
        </p>
        <div className="flex gap-4">
          <Button onClick={resetForm} variant="outline">
            {locale === 'ar' ? 'حجز آخر' : 'Book Another'}
          </Button>
          {onCancel && (
            <Button onClick={onCancel}>
              {locale === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full relative min-h-[350px]">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form 
            key="step1"
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 20 }}
            className="w-full"
          >
            <div className="mb-6">
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {locale === 'ar' ? 'اختر التاريخ' : 'Select Date'}
              </label>
              <Input 
                type="date" 
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full"
              />
            </div>

            {formData.date && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {locale === 'ar' ? 'الأوقات المتاحة' : 'Available Times'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setFormData({...formData, time})}
                      className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                        formData.time === time 
                          ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]' 
                          : 'bg-[var(--surface-hover)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 mt-8 border-t border-[var(--border-default)]">
              {onCancel ? (
                <Button type="button" variant="ghost" onClick={onCancel}>
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              ) : (
                <div />
              )}
              <Button 
                type="button" 
                onClick={() => setStep(2)} 
                disabled={!formData.date || !formData.time}
              >
                {locale === 'ar' ? 'التالي' : 'Next'}
              </Button>
            </div>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form 
            key="step2"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                  <User className="w-4 h-4" /> {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> {locale === 'ar' ? 'الشركة' : 'Company'}
                </label>
                <Input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <label className="text-sm font-bold text-[var(--text-secondary)]">
                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="space-y-2 mb-8">
              <label className="text-sm font-bold text-[var(--text-secondary)]">
                {locale === 'ar' ? 'ملخص المتطلبات (اختياري)' : 'Brief Description (Optional)'}
              </label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[var(--border-default)]">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                {locale === 'ar' ? 'العودة' : 'Back'}
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {locale === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
