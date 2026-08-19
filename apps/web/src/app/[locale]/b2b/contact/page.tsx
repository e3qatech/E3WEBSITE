"use client"

import React, { useState, useEffect, useRef } from 'react'
import { CheckCircle2, ArrowRight, UploadCloud, FileText, X, AlertCircle, Loader2 } from 'lucide-react'
import { useB2BRFP } from '@/store/b2b-store'
import { useParams } from 'next/navigation'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { localizeHref } from '@/lib/url-helper'

import { upload } from '@vercel/blob/client'

export default function ContactRFPPage() {
  const { inquiryType, setInquiryType } = useB2BRFP()
  const [submitted, setSubmitted] = useState(false)
  const [cmsData, setCmsData] = useState<any>({})
  
  // Real RFP file upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedDoc, setUploadedDoc] = useState<{ uploadId: string; url: string; fileName: string; fileSize?: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const params = useParams()
  const locale = params?.locale as string || 'en'
  const isAr = locale === 'ar'

  useEffect(() => {
    fetch('/api/cms/pages/b2b-contact')
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

  const handleFileSelect = async (file: File) => {
    setUploadError(null)
    const allowedExtensions = ['pdf', 'docx']
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    
    if (!allowedExtensions.includes(ext)) {
      setUploadError(isAr ? 'نوع الملف غير مدعوم. يرجى اختيار ملف PDF أو DOCX.' : 'Unsupported file type. Please choose a PDF or DOCX document.')
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError(isAr ? 'حجم الملف يتجاوز الحد المسموح به (25 ميجابايت كحد أقصى).' : 'File size exceeds the 25MB limit.')
      return
    }

    setSelectedFile(file)
    setUploadStatus('uploading')
    setUploadProgress(15)

    try {
      // 1. Direct Browser-to-Blob upload via @vercel/blob/client (bypasses 4.5MB serverless body limit)
      const newBlob = await upload(file.name, file, {
        access: 'private',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({
          context: 'b2b_rfp',
          originalName: file.name,
        }),
        onUploadProgress: (progressEvent) => {
          setUploadProgress(Math.round(15 + progressEvent.percentage * 0.65))
        },
      })

      setUploadProgress(85)

      // 2. Server finalization and deep security validation
      const finalizeRes = await fetch('/api/upload/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId: (newBlob as any).uploadId || newBlob.pathname.split('/').pop()?.split('.')[0],
          pathname: newBlob.pathname,
        }),
      })

      const finalizeJson = await finalizeRes.json()

      if (finalizeRes.ok && finalizeJson.success) {
        setUploadProgress(100)
        setUploadStatus('success')
        setUploadedDoc({
          uploadId: finalizeJson.uploadId,
          url: newBlob.pathname,
          fileName: finalizeJson.fileName || file.name,
          fileSize: finalizeJson.fileSize || file.size,
        })
      } else {
        setUploadStatus('error')
        setUploadError(finalizeJson.error || (isAr ? 'فشل التحقق من الملف.' : 'File validation failed.'))
      }
    } catch (err: any) {
      console.error('Direct RFP upload error:', err)
      setUploadStatus('error')
      setUploadError(err?.message || (isAr ? 'خطأ في الاتصال أثناء التحميل.' : 'Network error during upload.'))
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadedDoc(null)
    setUploadStatus('idle')
    setUploadProgress(0)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (uploadStatus === 'uploading') {
      alert(isAr ? 'يرجى الانتظار حتى يكتمل تحميل المرفق.' : 'Please wait until file upload completes.')
      return
    }

    const formData = new FormData(e.currentTarget)
    const rawNotes = formData.get("notes")?.toString() || ""
    const attachmentsNote = uploadedDoc 
      ? `\n\n[RFP Attachment: ${uploadedDoc.fileName} (${Math.round((uploadedDoc.fileSize || 0) / 1024)} KB) | Ref ID: ${uploadedDoc.uploadId} | URL: ${uploadedDoc.url}]` 
      : ""

    const data = {
      name: formData.get("name"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      interestServices: [
        inquiryType,
        ...(uploadedDoc ? [`RFP_UPLOAD:${uploadedDoc.uploadId}`] : [])
      ],
      notes: `${rawNotes}${attachmentsNote}`,
      uploadId: uploadedDoc?.uploadId,
    }

    try {
      const res = await fetch("/api/crm/leads/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        alert(isAr ? 'عذرًا، حدث خطأ أثناء إرسال طلبك. يرجى المحاولة لاحقًا.' : 'Sorry, there was an error submitting your request. Please try again later.')
      }
    } catch (err) {
      console.error(err)
      alert(isAr ? 'خطأ في الاتصال بالخادم.' : 'Error connecting to the server.')
    }
  }

  const headerTitle = isAr 
    ? (cmsData?.header?.titleAr || cmsData?.header?.titleEn || 'تواصل معنا / تقديم طلب عروض') 
    : (cmsData?.header?.titleEn || 'Contact Us / Submit RFP');
  const headerSubtitle = isAr 
    ? (cmsData?.header?.subtitleAr || cmsData?.header?.subtitleEn || 'هل لديك مشروع أو فعاليات كبرى تخطط لها؟ دعنا نساعدك في بناء خطة تنفيذ ناجحة.') 
    : (cmsData?.header?.subtitleEn || 'Planning a major event, venue, or activation? Let us help you engineer a successful delivery plan.');
  
  const businessEmail = cmsData?.inquiries?.business;
  const careersEmail = cmsData?.inquiries?.careers;
  const phone = cmsData?.inquiries?.phone;

  const hqAddress = isAr ? cmsData?.headquarters?.addressAr : cmsData?.headquarters?.addressEn;

  const careersCtaTitle = isAr ? (cmsData?.careersCta?.titleAr || "انضم لفريقنا") : (cmsData?.careersCta?.titleEn || "Join Our Team");
  const careersCtaDesc = isAr ? (cmsData?.careersCta?.descriptionAr || "اكتشف فرصاً جديدة لبناء تجارب استثنائية.") : (cmsData?.careersCta?.descriptionEn || "Discover new opportunities to build extraordinary experiences.");
  const careersCtaText = isAr ? (cmsData?.careersCta?.ctaTextAr || "استكشف الوظائف") : (cmsData?.careersCta?.ctaTextEn || "Explore Careers");

  const feedbackCtaTitle = isAr ? (cmsData?.feedbackCta?.titleAr || "اقتراحات وملاحظات") : (cmsData?.feedbackCta?.titleEn || "Suggestions & Feedback");
  const feedbackCtaDesc = isAr ? (cmsData?.feedbackCta?.descriptionAr || "ساعدنا في التحسين من خلال مشاركة أفكارك.") : (cmsData?.feedbackCta?.descriptionEn || "Help us improve by sharing your thoughts.");
  const feedbackCtaText = isAr ? (cmsData?.feedbackCta?.ctaTextAr || "شارك الملاحظات") : (cmsData?.feedbackCta?.ctaTextEn || "Share Feedback");

  const faqCtaTitle = isAr ? (cmsData?.faqCta?.titleAr || "الأسئلة الشائعة") : (cmsData?.faqCta?.titleEn || "B2B FAQs");
  const faqCtaDesc = isAr ? (cmsData?.faqCta?.descriptionAr || "ابحث عن إجابات للأسئلة الشائعة حول خدماتنا وعملياتنا.") : (cmsData?.faqCta?.descriptionEn || "Find answers to commonly asked questions about our services and processes.");
  const faqCtaText = isAr ? (cmsData?.faqCta?.ctaTextAr || "عرض الأسئلة") : (cmsData?.faqCta?.ctaTextEn || "View FAQs");

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <section className="relative py-32 border-b border-zinc-900 overflow-hidden">
        {cmsData?.header?.mediaUrl && (
          <div className="absolute inset-0 z-0">
            <UniversalMediaRenderer 
              src={cmsData.header.mediaUrl}
              type={cmsData.header.mediaType || "IMAGE"}
              alt="B2B Contact Header"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          </div>
        )}
        <div className="container mx-auto px-4 md:px-8 relative z-10">
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
              {(businessEmail || careersEmail || phone) && (
                <div>
                  <h3 className="text-2xl font-bold text-zinc-100 mb-6 tracking-tight">{isAr ? 'استفسارات مباشرة' : 'Direct Inquiries'}</h3>
                  <ul className="space-y-6">
                    {businessEmail && (
                      <li>
                        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">{isAr ? 'تطوير الأعمال' : 'Business Development'}</div>
                        <a href={`mailto:${businessEmail}`} className="text-xl font-medium text-emerald-400 hover:text-emerald-300 transition-colors">{businessEmail}</a>
                      </li>
                    )}
                    {careersEmail && (
                      <li>
                        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">{isAr ? 'الوظائف والمواهب' : 'Careers & Talent'}</div>
                        <a href={`mailto:${careersEmail}`} className="text-xl font-medium text-zinc-300 hover:text-zinc-100 transition-colors">{careersEmail}</a>
                      </li>
                    )}
                    {phone && (
                      <li>
                        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">{isAr ? 'الهاتف' : 'Phone'}</div>
                        <a href={`tel:${phone}`} className="text-xl font-medium text-zinc-300 hover:text-zinc-100 transition-colors">{phone}</a>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {hqAddress && (
                <div>
                  <h3 className="text-2xl font-bold text-zinc-100 mb-6 tracking-tight">{isAr ? 'المقر الرئيسي' : 'Headquarters'}</h3>
                  <div className="text-lg text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {hqAddress}
                  </div>
                </div>
              )}
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
                        name="name"
                        type="text" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder={isAr ? 'فلان الفلاني' : 'Jane Doe'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400">{isAr ? 'الشركة' : 'Company'}</label>
                      <input 
                        required
                        name="company"
                        type="text" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder={isAr ? 'اسم المنظمة' : 'Organization Name'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                      <input 
                        required
                        name="email"
                        type="email" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder={isAr ? 'name@company.com' : 'jane@company.com'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400">{isAr ? 'رقم الهاتف' : 'Phone Number'}</label>
                      <input 
                        type="tel" 
                        name="phone"
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
                      name="notes"
                      rows={5}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                      placeholder={isAr ? 'أخبرنا عن متطلباتك والجدول الزمني والنطاق...' : 'Tell us about your requirements, timeline, and scale...'}
                    />
                  </div>

                  {/* Real Accessible RFP File Upload */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="rfp-file-input" className="text-sm font-bold text-zinc-400">
                        {isAr ? 'المرفقات ووثائق العطاء (اختياري)' : 'RFP Documents & Attachments (Optional)'}
                      </label>
                      <span className="text-xs text-zinc-500 font-mono">PDF, DOC, DOCX (Max 25MB)</span>
                    </div>

                    <input
                      ref={fileInputRef}
                      id="rfp-file-input"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />

                    {!selectedFile ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={isAr ? "انقر لتحميل ملف العطاء أو اسحب وأفلت الملف هنا" : "Click to upload RFP document or drag and drop file here"}
                        className={cn(
                          "w-full border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500",
                          isDragging
                            ? "border-emerald-500 bg-emerald-950/20"
                            : "border-zinc-800 hover:border-zinc-600"
                        )}
                      >
                        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                          <UploadCloud className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-sm text-zinc-300 font-medium">
                          {isAr ? 'انقر لتصفح الملفات أو اسحب وأفلت مستند العطاء هنا' : 'Click to browse or drag and drop RFP documents here'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1.5 font-mono">
                          PDF, DOC, DOCX • {isAr ? 'حتى 25 ميجابايت' : 'up to 25MB'}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                              {uploadStatus === 'uploading' ? (
                                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                              ) : uploadStatus === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : uploadStatus === 'error' ? (
                                <AlertCircle className="w-4 h-4 text-rose-400" />
                              ) : (
                                <FileText className="w-4 h-4 text-emerald-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-200 truncate">{selectedFile.name}</p>
                              <p className="text-xs text-zinc-500 font-mono">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadStatus === 'uploading' ? (isAr ? 'جاري الرفع...' : 'Uploading...') : uploadStatus === 'success' ? (isAr ? 'تم الرفع بأمان' : 'Uploaded securely') : (isAr ? 'فشل الرفع' : 'Upload failed')}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            aria-label={isAr ? "إزالة الملف" : "Remove file"}
                            className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {uploadStatus === 'uploading' && (
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}

                        {uploadStatus === 'error' && uploadError && (
                          <div className="flex items-center gap-2 text-xs text-rose-400 pt-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{uploadError}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {uploadError && !selectedFile && (
                      <div className="flex items-center gap-2 text-xs text-rose-400 pt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <button 
                    type="submit"
                    disabled={uploadStatus === 'uploading'}
                    className={cn(
                      "w-full py-4 bg-emerald-500 text-zinc-950 font-bold text-lg rounded-sm transition-colors flex items-center justify-center gap-2",
                      uploadStatus === 'uploading' ? "opacity-60 cursor-not-allowed bg-emerald-600" : "hover:bg-emerald-400"
                    )}
                  >
                    {uploadStatus === 'uploading' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{isAr ? 'جاري رفع المرفق...' : 'Uploading attachment...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isAr ? 'إرسال الاستفسار' : 'Submit Inquiry'}</span>
                        <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                      </>
                    )}
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

      {/* CTA Bento Grid */}
      {(careersCtaTitle || feedbackCtaTitle || faqCtaTitle) && (
        <section className="py-24 border-t border-zinc-900 bg-zinc-950">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Careers CTA */}
              {careersCtaTitle && (
                <div className="relative group overflow-hidden rounded-2xl aspect-square md:aspect-auto md:h-[400px] flex flex-col justify-end p-8 border border-zinc-800/50">
                  {cmsData?.careersCta?.mediaUrl && (
                    <div className="absolute inset-0 z-0">
                      <UniversalMediaRenderer 
                        src={cmsData.careersCta.mediaUrl}
                        type={cmsData.careersCta.mediaType || "IMAGE"}
                        alt="Careers Background"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  {/* Glassmorphism overlay */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 z-10 bg-zinc-950/20 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all duration-500 pointer-events-none" />
                  
                  <div className="relative z-20 mt-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl font-black text-white mb-2">{careersCtaTitle}</h3>
                    <p className="text-zinc-300 font-medium mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {careersCtaDesc}
                    </p>
                    <Link 
                      href={`/${locale}/b2b/careers`} 
                      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md transition-colors"
                    >
                      {careersCtaText} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Feedback CTA */}
              {feedbackCtaTitle && (
                <div className="relative group overflow-hidden rounded-2xl aspect-square md:aspect-auto md:h-[400px] flex flex-col justify-end p-8 border border-zinc-800/50">
                  {cmsData?.feedbackCta?.mediaUrl && (
                    <div className="absolute inset-0 z-0">
                      <UniversalMediaRenderer 
                        src={cmsData.feedbackCta.mediaUrl}
                        type={cmsData.feedbackCta.mediaType || "IMAGE"}
                        alt="Feedback Background"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  {/* Glassmorphism overlay */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 z-10 bg-zinc-950/20 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all duration-500 pointer-events-none" />
                  
                  <div className="relative z-20 mt-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl font-black text-white mb-2">{feedbackCtaTitle}</h3>
                    <p className="text-zinc-300 font-medium mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {feedbackCtaDesc}
                    </p>
                    <Link 
                      href={`/${locale}/b2b/feedback`} 
                      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md transition-colors"
                    >
                      {feedbackCtaText} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </Link>
                  </div>
                </div>
              )}

              {/* FAQ CTA */}
              {faqCtaTitle && (
                <div className="relative group overflow-hidden rounded-2xl aspect-square md:aspect-auto md:h-[400px] flex flex-col justify-end p-8 border border-zinc-800/50">
                  {cmsData?.faqCta?.mediaUrl && (
                    <div className="absolute inset-0 z-0">
                      <UniversalMediaRenderer 
                        src={cmsData.faqCta.mediaUrl}
                        type={cmsData.faqCta.mediaType || "IMAGE"}
                        alt="FAQ Background"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  {/* Glassmorphism overlay */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 z-10 bg-zinc-950/20 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all duration-500 pointer-events-none" />
                  
                  <div className="relative z-20 mt-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl font-black text-white mb-2">{faqCtaTitle}</h3>
                    <p className="text-zinc-300 font-medium mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {faqCtaDesc}
                    </p>
                    <Link 
                      href={localizeHref(cmsData?.faqCta?.ctaLink || '/b2b/faqs', locale)} 
                      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md transition-colors"
                    >
                      {faqCtaText} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

    </div>
  )
}
