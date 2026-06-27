"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, ChevronRight, ChevronLeft, Upload, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

interface MultiStepLeadFormProps {
  locale: string
  services: { id: string, name: Record<string, string> }[]
}

const STORAGE_KEY = "e3_b2b_lead_form"

export function MultiStepLeadForm({ locale, services }: MultiStepLeadFormProps) {
  const isRTL = locale === 'ar'
  
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    selectedServices: [] as string[],
    budget: '',
    timeline: '',
    description: '',
    source: '',
  })

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setFormData(JSON.parse(saved))
      } catch (e) {
        // ignore
      }
    }
  }, [])

  // Save to LocalStorage
  useEffect(() => {
    if (!isSuccess) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
    }
  }, [formData, isSuccess])

  const toggleService = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(id)
        ? prev.selectedServices.filter(s => s !== id)
        : [...prev.selectedServices, id]
    }))
  }

  const handleNext = () => {
    // Basic validation
    if (step === 1 && (!formData.name || !formData.email || !formData.company)) return
    if (step === 2 && (formData.selectedServices.length === 0 || !formData.description)) return
    setStep(s => s + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API POST
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSuccess(true)
    localStorage.removeItem(STORAGE_KEY)
  }

  if (isSuccess) {
    return (
      <div className="bg-[var(--surface-default)] rounded-[3rem] border border-[var(--border-default)] p-12 text-center min-h-[500px] flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
          <CheckCircle2 className="w-24 h-24 text-[var(--color-success)] mb-6 mx-auto" />
        </motion.div>
        <h3 className="text-3xl font-black text-[var(--text-primary)] mb-4">
          {locale === 'ar' ? 'تم استلام طلبك بنجاح' : 'Inquiry Received Successfully'}
        </h3>
        <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
          {locale === 'ar' 
            ? 'سيتواصل معك فريقنا خلال 24 ساعة لمناقشة مشروعك الاستثنائي القادم.' 
            : 'Our engineering team will review your requirements and get back to you within 24 hours.'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface-default)] rounded-[3rem] border border-[var(--border-default)] p-8 md:p-12 overflow-hidden relative">
      
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-12 relative z-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center relative z-10 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
              step >= s 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'bg-[var(--surface-hover)] text-[var(--text-tertiary)] border border-[var(--border-default)]'
            }`}>
              {s}
            </div>
            <span className={`text-xs font-bold mt-3 uppercase tracking-wider ${step >= s ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
              {s === 1 ? (locale === 'ar' ? 'معلوماتك' : 'About You') :
               s === 2 ? (locale === 'ar' ? 'المشروع' : 'Project Details') :
               (locale === 'ar' ? 'إضافي' : 'Additional')}
            </span>
          </div>
        ))}
        {/* Progress Line */}
        <div className="absolute top-5 start-10 end-10 h-[2px] bg-[var(--surface-hover)] -z-10">
          <div 
            className="h-full bg-[var(--color-primary)] transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: ABOUT YOU */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-secondary)]">{locale === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-secondary)]">{locale === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}</label>
                  <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-secondary)]">{locale === 'ar' ? 'الشركة *' : 'Company Name *'}</label>
                  <Input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-secondary)]">{locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                  <Input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)]">{locale === 'ar' ? 'القطاع / الصناعة' : 'Industry'}</label>
                <Input value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
              </div>

              <div className="flex justify-end pt-8">
                <Button 
                  type="button" 
                  size="lg" 
                  onClick={handleNext}
                  disabled={!formData.name || !formData.email || !formData.company}
                  className="gap-2"
                >
                  {locale === 'ar' ? 'التالي' : 'Next Step'}
                  <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PROJECT DETAILS */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <label className="text-sm font-bold text-[var(--text-secondary)]">{locale === 'ar' ? 'الخدمات المطلوبة *' : 'Services Interested In *'}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {services.map(svc => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => toggleService(svc.id)}
                      className={`p-3 rounded-xl border text-sm font-bold text-start transition-all ${
                        formData.selectedServices.includes(svc.id)
                          ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]'
                          : 'bg-[var(--surface-hover)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      {svc.name[locale] || svc.name.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-secondary)]">{locale === 'ar' ? 'الميزانية التقديرية' : 'Estimated Budget'}</label>
                  <select 
                    value={formData.budget} 
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="">{locale === 'ar' ? 'اختر النطاق' : 'Select Range'}</option>
                    <option value="10k-50k">$10,000 - $50,000</option>
                    <option value="50k-200k">$50,000 - $200,000</option>
                    <option value="200k-500k">$200,000 - $500,000</option>
                    <option value="500k+">$500,000+</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-secondary)]">{locale === 'ar' ? 'الجدول الزمني' : 'Timeline'}</label>
                  <select 
                    value={formData.timeline} 
                    onChange={e => setFormData({...formData, timeline: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="">{locale === 'ar' ? 'متى تحتاج التنفيذ؟' : 'When do you need this?'}</option>
                    <option value="ASAP">ASAP (Within 1 month)</option>
                    <option value="3months">Within 3 months</option>
                    <option value="6months+">6+ months out</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)]">{locale === 'ar' ? 'تفاصيل المشروع *' : 'Project Details *'}</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                  placeholder={locale === 'ar' ? 'صِف رؤيتك ومتطلباتك...' : 'Describe your vision and requirements...'}
                />
              </div>

              <div className="flex justify-between items-center pt-8">
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="gap-2">
                  <ChevronLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  {locale === 'ar' ? 'العودة' : 'Back'}
                </Button>
                <Button 
                  type="button" 
                  size="lg" 
                  onClick={handleNext}
                  disabled={formData.selectedServices.length === 0 || !formData.description}
                  className="gap-2"
                >
                  {locale === 'ar' ? 'التالي' : 'Next Step'}
                  <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: ADDITIONAL */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)]">{locale === 'ar' ? 'كيف سمعت عنا؟' : 'How did you hear about us?'}</label>
                <Input value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)]">{locale === 'ar' ? 'المرفقات (اختياري)' : 'Attachments (Optional)'}</label>
                <div className="border-2 border-dashed border-[var(--border-default)] rounded-xl p-8 text-center hover:border-[var(--color-primary)]/50 transition-colors cursor-pointer bg-[var(--surface-hover)]">
                  <Upload className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-sm font-bold text-[var(--text-primary)] mb-1">
                    {locale === 'ar' ? 'اضغط لرفع الملفات أو اسحبها هنا' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {locale === 'ar' ? 'PDF، PPT، أو صور (الحد الأقصى 20 ميغابايت)' : 'PDF, PPT, or Images (Max 20MB)'}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-8">
                <Button type="button" variant="ghost" onClick={() => setStep(2)} className="gap-2">
                  <ChevronLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  {locale === 'ar' ? 'العودة' : 'Back'}
                </Button>
                <Button 
                  type="submit" 
                  size="xl" 
                  isLoading={isSubmitting}
                >
                  {locale === 'ar' ? 'إرسال الطلب' : 'Submit Inquiry'}
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </form>
    </div>
  )
}
