"use client"

import React, { useState, useEffect } from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { useB2BRFP } from '@/store/b2b-store'
import { useParams } from 'next/navigation'

export default function ContactRFPPage() {
  const { inquiryType, setInquiryType } = useB2BRFP()
  const [submitted, setSubmitted] = useState(false)
  const [cmsData, setCmsData] = useState<any>({})
  
  const params = useParams()
  const locale = params?.locale as string || 'en'
  const isAr = locale === 'ar'

  useEffect(() => {
    fetch('/api/cms/pages/b2b-contact')
      .then(res => res.json())
      .then(data => {
        if (data && data.content) {
          setCmsData(data.content)
        }
      })
      .catch(console.error)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock submission
    setSubmitted(true)
  }

  const headerTitle = isAr ? (cmsData?.header?.titleAr || 'ابدأ مشروعاً.') : (cmsData?.header?.titleEn || 'Start a Project.');
  const headerSubtitle = isAr ? (cmsData?.header?.subtitleAr || 'سواء كان لديك طلب تقديم عروض صياغة كاملة أو مجرد مفهوم أولي، فإن فريقنا مستعد لهندسة حل.') : (cmsData?.header?.subtitleEn || 'Whether you have a fully drafted RFP or just a preliminary concept, our team is ready to engineer a solution.');
  
  const businessEmail = cmsData?.inquiries?.business || 'business@e3.qa'
  const careersEmail = cmsData?.inquiries?.careers || 'careers@e3.qa'
  const phone = cmsData?.inquiries?.phone || '+974 4444 4444'

  const hqAddress = isAr ? (cmsData?.headquarters?.addressAr || 'برج النخلة ب، الطابق 22\nالخليج الغربي، الدوحة\nدولة قطر') : (cmsData?.headquarters?.addressEn || 'Palm Tower B, Floor 22\nWest Bay, Doha\nState of Qatar');

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <section className="py-20 border-b border-zinc-900 bg-zinc-900/50">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-5xl md:text-7xl font-black text-zinc-100 tracking-tight mb-6">
            {headerTitle}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl font-medium">
            {headerSubtitle}
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-12 gap-16">
            
            {/* Left Column - Contact Info */}
            <div className="md:col-span-5 space-y-12">
              <div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-6 tracking-tight">{isAr ? 'استفسارات مباشرة' : 'Direct Inquiries'}</h3>
                <ul className="space-y-6">
                  <li>
                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">{isAr ? 'تطوير الأعمال' : 'Business Development'}</div>
                    <a href={`mailto:${businessEmail}`} className="text-xl font-medium text-emerald-400 hover:text-emerald-300 transition-colors">{businessEmail}</a>
                  </li>
                  <li>
                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">{isAr ? 'الوظائف والمواهب' : 'Careers & Talent'}</div>
                    <a href={`mailto:${careersEmail}`} className="text-xl font-medium text-zinc-300 hover:text-zinc-100 transition-colors">{careersEmail}</a>
                  </li>
                  <li>
                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">{isAr ? 'الهاتف' : 'Phone'}</div>
                    <a href={`tel:${phone}`} className="text-xl font-medium text-zinc-300 hover:text-zinc-100 transition-colors">{phone}</a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-6 tracking-tight">{isAr ? 'المقر الرئيسي' : 'Headquarters'}</h3>
                <div className="text-lg text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {hqAddress}
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="md:col-span-7">
              {submitted ? (
                <div className="p-12 rounded-xl bg-zinc-900 border border-emerald-500/50 text-center">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-black text-zinc-100 tracking-tight mb-4">{isAr ? 'تم استلام الطلب' : 'Request Received'}</h3>
                  <p className="text-zinc-400 text-lg mb-8">
                    {isAr ? 'سيقوم فريقنا بمراجعة استفسارك والتواصل معك خلال 24 ساعة.' : 'Our team will review your inquiry and connect with you within 24 hours.'}
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-3 rounded-sm border border-zinc-700 text-zinc-300 font-bold hover:bg-zinc-800 transition-colors"
                  >
                    {isAr ? 'إرسال استفسار آخر' : 'Submit Another Inquiry'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 p-10 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  
                  {/* Inquiry Type */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{isAr ? 'نوع الاستفسار' : 'Inquiry Type'}</label>
                    <div className="flex flex-wrap gap-4">
                      {(isAr ? ['تقديم طلب عروض', 'أعمال عامة', 'شراكة', 'أخرى'] : ['RFP Submission', 'General Business', 'Partnership', 'Other']).map(type => (
                        <label 
                          key={type} 
                          className={`px-5 py-3 rounded-sm border cursor-pointer font-bold text-sm transition-colors ${
                            inquiryType === type 
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                              : 'border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="type" 
                            value={type}
                            className="hidden"
                            checked={inquiryType === type}
                            onChange={(e) => setInquiryType(e.target.value)}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400">{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder={isAr ? 'فلان الفلاني' : 'Jane Doe'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400">{isAr ? 'الشركة' : 'Company'}</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder={isAr ? 'اسم المنظمة' : 'Organization Name'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                      <input 
                        required
                        type="email" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder={isAr ? 'name@company.com' : 'jane@company.com'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400">{isAr ? 'رقم الهاتف' : 'Phone Number'}</label>
                      <input 
                        type="tel" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="+974 XXXX XXXX"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400">{isAr ? 'تفاصيل المشروع أو الرسالة' : 'Project Details or Message'}</label>
                    <textarea 
                      required
                      rows={5}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                      placeholder={isAr ? 'أخبرنا عن متطلباتك والجدول الزمني والنطاق...' : 'Tell us about your requirements, timeline, and scale...'}
                    />
                  </div>

                  {/* File Upload (Mock) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400">{isAr ? 'المرفقات (اختياري)' : 'Attachments (Optional)'}</label>
                    <div className="w-full border-2 border-dashed border-zinc-800 rounded-sm p-8 text-center hover:border-zinc-600 transition-colors cursor-pointer bg-zinc-950">
                      <p className="text-sm text-zinc-500 font-medium">{isAr ? 'اسحب وأفلت مستندات هنا، أو انقر للتصفح' : 'Drag & drop RFP documents here, or click to browse'}</p>
                      <p className="text-xs text-zinc-600 mt-2">PDF, DOCX, ZIP up to 50MB</p>
                    </div>
                  </div>

                  {/* Submit */}
                  <button 
                    type="submit"
                    className="w-full py-4 bg-emerald-500 text-zinc-950 font-bold text-lg rounded-sm hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                  >
                    {isAr ? 'إرسال الاستفسار' : 'Submit Inquiry'} <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                  </button>

                  <p className="text-xs text-zinc-600 text-center max-w-sm mx-auto">
                    {isAr ? 'من خلال إرسال هذا النموذج، فإنك توافق على سياسة الخصوصية الخاصة بنا وتوافق على تخزين بياناتك لمعالجة هذا الاستفسار.' : 'By submitting this form, you agree to our Privacy Policy and consent to us storing your data to process this inquiry.'}
                  </p>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
