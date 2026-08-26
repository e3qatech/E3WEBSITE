"use client";

import React, { useState } from "react";
import { CheckCircle2, ArrowRight, UploadCloud, FileText, X, Mail, Phone, Clock, MapPin, MessageSquare, Briefcase, HelpCircle } from "lucide-react";
import { useB2BRFP } from "@/store/b2b-store";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import Link from "next/link";

export interface B2BContactClientProps {
  cmsData: any;
  locale: string;
}

export function B2BContactClient({ cmsData, locale }: B2BContactClientProps) {
  const { inquiryType, setInquiryType } = useB2BRFP();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rfpFile, setRfpFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAr = locale === "ar";

  // 1. Header Copy
  const header = cmsData?.header || {};
  const headerTitle = isAr ? (header.titleAr || header.titleEn) : (header.titleEn || header.titleAr);
  const headerSubtitle = isAr ? (header.subtitleAr || header.subtitleEn) : (header.subtitleEn || header.subtitleAr);
  const headerEyebrow = isAr ? (header.eyebrowAr || header.eyebrowEn) : (header.eyebrowEn || header.eyebrowAr);

  // 2. Direct Inquiries & Contact Channels
  const inquiries = cmsData?.inquiries || {};
  const businessEmail = inquiries.business || "info@eeeqa.com";
  const careersEmail = inquiries.careers || "info@eeeqa.com";
  const pressEmail = inquiries.press || "";
  const phone = inquiries.phone || "+974 3048 9955";
  const whatsapp = inquiries.whatsapp || phone;
  const workingHours = isAr ? (inquiries.workingHoursAr || inquiries.workingHoursEn) : (inquiries.workingHoursEn || inquiries.workingHoursAr);

  // 3. Headquarters
  const headquarters = cmsData?.headquarters || {};
  const hqAddress = isAr ? (headquarters.addressAr || headquarters.addressEn) : (headquarters.addressEn || headquarters.addressAr);

  // 4. Form Configuration & Copy
  const formConfig = cmsData?.formConfig || {};
  const inquiryTypes = Array.isArray(formConfig.inquiryTypes) && formConfig.inquiryTypes.length > 0
    ? formConfig.inquiryTypes
    : [
        { id: "rfp", value: "RFP Submission", labelEn: "RFP Submission", labelAr: "تقديم طلب عروض" },
        { id: "business", value: "General Business", labelEn: "General Business", labelAr: "أعمال عامة" },
        { id: "partnership", value: "Partnership", labelEn: "Partnership", labelAr: "شراكة" },
        { id: "other", value: "Other", labelEn: "Other", labelAr: "أخرى" },
      ];

  const labels = formConfig.labels || {};
  const successState = formConfig.successState || {};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    let rfpUploadId: string | undefined;
    let rfpClaimToken: string | undefined;

    if (rfpFile) {
      const uploadData = new FormData();
      uploadData.append("file", rfpFile);
      uploadData.append("context", "public_rfp");
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          rfpUploadId = uploadJson.uploadId;
          rfpClaimToken = uploadJson.claimToken;
        } else {
          const errData = await uploadRes.json().catch(() => ({}));
          setErrorMessage(errData.error || (isAr ? "فشل تحميل ملف طلب العروض." : "RFP document upload failed."));
          setIsSubmitting(false);
          return;
        }
      } catch (uploadErr) {
        console.error("[RFP Upload Error]", uploadErr);
        setErrorMessage(isAr ? "خطأ في الاتصال أثناء تحميل الملف." : "Network error uploading RFP document.");
        setIsSubmitting(false);
        return;
      }
    }

    const data = {
      name: formData.get("name"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      interestServices: [inquiryType || inquiryTypes[0]?.value || "RFP Submission"],
      notes: formData.get("notes"),
      rfpUploadId,
      rfpClaimToken,
    };

    try {
      const res = await fetch("/api/crm/leads/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setErrorMessage(
          errJson.error ||
            (isAr
              ? "عذرًا، حدث خطأ أثناء إرسال طلبك. يرجى التحقق من البيانات والمحاولة مجددًا."
              : "Sorry, there was an error submitting your request. Please verify your data and try again.")
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(isAr ? "خطأ في الاتصال بالخادم." : "Error connecting to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Opportunity / Gateway CTAs
  const careersCta = cmsData?.careersCta || {};
  const feedbackCta = cmsData?.feedbackCta || {};
  const faqCta = cmsData?.faqCta || {};

  const careersTitle = isAr ? (careersCta.titleAr || careersCta.titleEn) : (careersCta.titleEn || careersCta.titleAr);
  const careersDesc = isAr ? (careersCta.descriptionAr || careersCta.descriptionEn) : (careersCta.descriptionEn || careersCta.descriptionAr);
  const careersButton = isAr ? (careersCta.ctaTextAr || careersCta.ctaTextEn || "استكشف الوظائف") : (careersCta.ctaTextEn || careersCta.ctaTextAr || "Explore Careers");

  const feedbackTitle = isAr ? (feedbackCta.titleAr || feedbackCta.titleEn) : (feedbackCta.titleEn || feedbackCta.titleAr);
  const feedbackDesc = isAr ? (feedbackCta.descriptionAr || feedbackCta.descriptionEn) : (feedbackCta.descriptionEn || feedbackCta.descriptionAr);
  const feedbackButton = isAr ? (feedbackCta.ctaTextAr || feedbackCta.ctaTextEn || "شارك الملاحظات") : (feedbackCta.ctaTextEn || feedbackCta.ctaTextAr || "Share Feedback");

  const faqTitle = isAr ? (faqCta.titleAr || faqCta.titleEn) : (faqCta.titleEn || faqCta.titleAr);
  const faqDesc = isAr ? (faqCta.descriptionAr || faqCta.descriptionEn) : (faqCta.descriptionEn || faqCta.descriptionAr);
  const faqButton = isAr ? (faqCta.ctaTextAr || faqCta.ctaTextEn || "عرض الأسئلة") : (faqCta.ctaTextEn || faqCta.ctaTextAr || "View FAQs");

  return (
    <div
      className="flex flex-col w-full min-h-screen bg-[var(--bg-level-1)] text-[var(--text-primary)] pt-20 transition-colors"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* 1. Header Section */}
      <section className="relative py-20 sm:py-28 md:py-32 border-b border-[var(--border-level-1)] overflow-hidden">
        {header.mediaUrl && (
          <div className="absolute inset-0 z-0">
            <UniversalMediaRenderer
              src={header.mediaUrl}
              type={header.mediaType || "IMAGE"}
              alt="B2B Contact Header"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-[var(--bg-level-1)]/80 to-transparent" />
          </div>
        )}
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          {headerEyebrow && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs uppercase tracking-widest mb-4">
              <span>{headerEyebrow}</span>
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-[var(--text-primary)] tracking-tight mb-4 sm:mb-6">
            {headerTitle}
          </h1>
          {headerSubtitle && (
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-3xl font-medium leading-relaxed">
              {headerSubtitle}
            </p>
          )}
        </div>
      </section>

      {/* 2. Form & Channels Section */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16">
            {/* Left Column - Direct Contact Channels */}
            <div className="md:col-span-5 space-y-10">
              {(businessEmail || careersEmail || pressEmail || phone || whatsapp) && (
                <div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 tracking-tight flex items-center gap-2.5">
                    <Mail className="w-5 h-5 text-emerald-500" />
                    <span>{isAr ? "استفسارات مباشرة" : "Direct Inquiries"}</span>
                  </h3>
                  <ul className="space-y-6">
                    {businessEmail && (
                      <li className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs">
                        <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{isAr ? "تطوير الأعمال وطلبات العروض" : "Business Development & RFP"}</span>
                        </div>
                        <a
                          href={`mailto:${businessEmail}`}
                          className="text-base sm:text-lg font-semibold text-emerald-500 hover:text-emerald-400 transition-colors break-all"
                        >
                          {businessEmail}
                        </a>
                      </li>
                    )}

                    {careersEmail && (
                      <li className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs">
                        <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">
                          {isAr ? "الوظائف والمواهب" : "Careers & Talent"}
                        </div>
                        <a
                          href={`mailto:${careersEmail}`}
                          className="text-base sm:text-lg font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors break-all"
                        >
                          {careersEmail}
                        </a>
                      </li>
                    )}

                    {pressEmail && (
                      <li className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs">
                        <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">
                          {isAr ? "الإعلام والصحافة" : "Media & Press Inquiries"}
                        </div>
                        <a
                          href={`mailto:${pressEmail}`}
                          className="text-base sm:text-lg font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors break-all"
                        >
                          {pressEmail}
                        </a>
                      </li>
                    )}

                    {phone && (
                      <li className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs">
                        <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{isAr ? "الاتصال المباشر" : "Direct Phone Line"}</span>
                        </div>
                        <a
                          href={`tel:${phone.replace(/\s+/g, "")}`}
                          className="text-base sm:text-lg font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          {phone}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Working Hours */}
              {workingHours && (
                <div className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)]">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? "ساعات العمل الرسمية" : "Official Working Hours"}</span>
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                    {workingHours}
                  </p>
                </div>
              )}

              {/* Headquarters Address */}
              {hqAddress && (
                <div className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)]">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? "المقر الرئيسي" : "Headquarters"}</span>
                  </h4>
                  <div className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed whitespace-pre-wrap">
                    {hqAddress}
                  </div>
                  {headquarters.mapLink && (
                    <a
                      href={headquarters.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:text-emerald-400 mt-3 transition-colors"
                    >
                      <span>{isAr ? "عرض الموقع على الخريطة" : "View on Google Maps"}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Interactive RFP / Contact Form */}
            <div className="md:col-span-7">
              {submitted ? (
                <div className="p-6 sm:p-10 md:p-12 rounded-3xl bg-[var(--surface-default)] border border-emerald-500/50 text-center shadow-xl backdrop-blur-md">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight mb-4">
                    {isAr
                      ? successState.titleAr || "تم استلام الطلب بنجاح"
                      : successState.titleEn || "Request Received"}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-base sm:text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                    {isAr
                      ? successState.messageAr || "سيقوم فريقنا التنفيذي بمراجعة استفسارك والتواصل معك خلال 24 ساعة."
                      : successState.messageEn || "Our executive enterprise team will review your inquiry and connect with you within 24 hours."}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-3.5 rounded-full border border-[var(--border-level-2)] text-[var(--text-primary)] font-bold hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                  >
                    {isAr
                      ? successState.buttonAr || "إرسال استفسار آخر"
                      : successState.buttonEn || "Submit Another Inquiry"}
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-8 p-6 sm:p-8 md:p-10 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-md backdrop-blur-md"
                >
                  {/* Inquiry Type Radio Group */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                      {isAr ? labels.inquiryTypeAr || "نوع الاستفسار" : labels.inquiryTypeEn || "Inquiry Type"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {inquiryTypes.map((type: any) => {
                        const typeLabel = isAr ? type.labelAr || type.labelEn || type.value : type.labelEn || type.value;
                        const isSelected = inquiryType === type.value || (!inquiryType && type === inquiryTypes[0]);

                        return (
                          <label
                            key={type.id || type.value}
                            className={`p-3.5 rounded-2xl border cursor-pointer font-bold text-xs sm:text-sm text-center transition-all flex items-center justify-center ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                : "border-[var(--border-level-2)] bg-[var(--bg-level-2)] text-[var(--text-secondary)] hover:border-emerald-500/50 hover:text-[var(--text-primary)]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="type"
                              value={type.value}
                              className="hidden"
                              checked={isSelected}
                              onChange={() => setInquiryType(type.value)}
                            />
                            <span>{typeLabel}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Info Fields */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        {isAr ? labels.fullNameAr || "الاسم الكامل" : labels.fullNameEn || "Full Name"}
                      </label>
                      <input
                        required
                        name="name"
                        type="text"
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder={isAr ? labels.fullNamePlaceholderAr || "فلان الفلاني" : labels.fullNamePlaceholderEn || "Jane Doe"}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        {isAr ? labels.companyAr || "الشركة / المنظمة" : labels.companyEn || "Company / Organization"}
                      </label>
                      <input
                        required
                        name="company"
                        type="text"
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder={isAr ? labels.companyPlaceholderAr || "اسم المنظمة" : labels.companyPlaceholderEn || "Organization Name"}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        {isAr ? labels.emailAr || "البريد الإلكتروني للعمل" : labels.emailEn || "Corporate Email Address"}
                      </label>
                      <input
                        required
                        name="email"
                        type="email"
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder={isAr ? labels.emailPlaceholderAr || "name@company.com" : labels.emailPlaceholderEn || "name@company.com"}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        {isAr ? labels.phoneAr || "رقم الهاتف / الواتساب" : labels.phoneEn || "Phone / WhatsApp Number"}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder={isAr ? labels.phonePlaceholderAr || "+974 XXXX XXXX" : labels.phonePlaceholderEn || "+974 XXXX XXXX"}
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {isAr ? labels.messageAr || "تفاصيل المشروع أو نطاق العمل" : labels.messageEn || "Project Details or Scope Brief"}
                    </label>
                    <textarea
                      required
                      name="notes"
                      rows={5}
                      className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed"
                      placeholder={isAr ? labels.messagePlaceholderAr || "أخبرنا عن متطلباتك والجدول الزمني والنطاق..." : labels.messagePlaceholderEn || "Tell us about your requirements, timeline, and scale..."}
                    />
                  </div>

                  {/* Real RFP File Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {isAr ? labels.uploadTitleAr || "وثيقة طلب العروض / المرفقات (اختياري)" : labels.uploadTitleEn || "RFP Document / Brief (Optional)"}
                    </label>
                    <label className="block w-full border-2 border-dashed border-[var(--border-level-2)] hover:border-emerald-500/50 rounded-2xl p-6 text-center transition-all cursor-pointer bg-[var(--bg-level-1)]/50 group">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 25 * 1024 * 1024) {
                              alert(isAr ? "الحد الأقصى لحجم الملف هو 25 ميجابايت." : "File size must be under 25MB.");
                              return;
                            }
                            setRfpFile(file);
                          }
                        }}
                      />
                      {rfpFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm font-bold text-emerald-500">
                            {rfpFile.name} ({(rfpFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.preventDefault();
                              setRfpFile(null);
                            }}
                            className="p-1 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <UploadCloud className="w-8 h-8 text-[var(--text-tertiary)] group-hover:text-emerald-500 mx-auto mb-2 transition-colors" />
                          <p className="text-sm text-[var(--text-secondary)] font-medium">
                            {isAr ? "انقر لاختيار وثيقة RFP أو المخطط" : "Click to select RFP document or project brief"}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)] mt-1">
                            {isAr
                              ? labels.uploadHelpAr || "ملفات PDF, DOCX حتى 25 ميجابايت (مشفرة ومتوافقة مع قانون حماية البيانات القطري)"
                              : labels.uploadHelpEn || "PDF, DOCX up to 25MB (Encrypted & Qatar PDPL Compliant)"}
                          </p>
                        </div>
                      )}
                    </label>
                  </div>

                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-medium">
                      {errorMessage}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-emerald-500 text-slate-950 font-black text-base sm:text-lg rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                  >
                    {isSubmitting
                      ? (isAr ? labels.submittingButtonAr || "جاري إرسال الطلب..." : labels.submittingButtonEn || "Submitting Request...")
                      : (isAr ? labels.submitButtonAr || "إرسال الاستفسار / طلب العروض" : labels.submitButtonEn || "Submit Inquiry / RFP")}
                    {!isSubmitting && <ArrowRight className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />}
                  </button>

                  <p className="text-xs text-[var(--text-tertiary)] text-center max-w-md mx-auto leading-relaxed">
                    {isAr
                      ? labels.privacyNoticeAr || "من خلال إرسال هذا النموذج، فإنك توافق على سياسة الخصوصية الخاصة بنا وتوافق على تخزين بياناتك لمعالجة هذا الاستفسار."
                      : labels.privacyNoticeEn || "By submitting this form, you agree to our Privacy Policy and consent to us storing your data to process this inquiry."}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bento Gateway Cards (Careers, Feedback, FAQs) */}
      {(careersCta.enabled !== false || feedbackCta.enabled !== false || faqCta.enabled !== false) && (
        <section className="py-24 border-t border-[var(--border-level-1)] bg-[var(--bg-level-2)] transition-colors">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Careers Gateway Card */}
              {careersCta.enabled !== false && careersTitle && (
                <div className="relative group overflow-hidden rounded-3xl min-h-[300px] md:h-[400px] flex flex-col justify-end p-6 sm:p-8 border border-[var(--border-level-2)] bg-[var(--surface-default)] shadow-md">
                  {careersCta.mediaUrl && (
                    <div className="absolute inset-0 z-0">
                      <UniversalMediaRenderer
                        src={careersCta.mediaUrl}
                        type={careersCta.mediaType || "IMAGE"}
                        alt="Careers Background"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950/95 via-zinc-950/60 to-transparent pointer-events-none" />

                  <div className="relative z-20 mt-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-3">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{isAr ? "المواهب والوظائف" : "TALENT & CAREERS"}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{careersTitle}</h3>
                    {careersDesc && (
                      <p className="text-zinc-300 text-xs sm:text-sm font-medium mb-4 leading-relaxed line-clamp-3">
                        {careersDesc}
                      </p>
                    )}
                    <Link
                      href={careersCta.ctaLink || `/${locale}/b2b/careers`}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-emerald-500 hover:text-slate-950 px-5 py-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer"
                    >
                      <span>{careersButton}</span>
                      <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Feedback Gateway Card */}
              {feedbackCta.enabled !== false && feedbackTitle && (
                <div className="relative group overflow-hidden rounded-3xl min-h-[300px] md:h-[400px] flex flex-col justify-end p-6 sm:p-8 border border-[var(--border-level-2)] bg-[var(--surface-default)] shadow-md">
                  {feedbackCta.mediaUrl && (
                    <div className="absolute inset-0 z-0">
                      <UniversalMediaRenderer
                        src={feedbackCta.mediaUrl}
                        type={feedbackCta.mediaType || "IMAGE"}
                        alt="Feedback Background"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950/95 via-zinc-950/60 to-transparent pointer-events-none" />

                  <div className="relative z-20 mt-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 font-mono text-xs uppercase tracking-wider mb-3">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isAr ? "آراء الشركاء" : "CLIENT FEEDBACK"}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{feedbackTitle}</h3>
                    {feedbackDesc && (
                      <p className="text-zinc-300 text-xs sm:text-sm font-medium mb-4 leading-relaxed line-clamp-3">
                        {feedbackDesc}
                      </p>
                    )}
                    <Link
                      href={feedbackCta.ctaLink || `/${locale}/b2b/feedback`}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-emerald-500 hover:text-slate-950 px-5 py-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer"
                    >
                      <span>{feedbackButton}</span>
                      <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
                    </Link>
                  </div>
                </div>
              )}

              {/* FAQ Gateway Card */}
              {faqCta.enabled !== false && faqTitle && (
                <div className="relative group overflow-hidden rounded-3xl min-h-[300px] md:h-[400px] flex flex-col justify-end p-6 sm:p-8 border border-[var(--border-level-2)] bg-[var(--surface-default)] shadow-md">
                  {faqCta.mediaUrl && (
                    <div className="absolute inset-0 z-0">
                      <UniversalMediaRenderer
                        src={faqCta.mediaUrl}
                        type={faqCta.mediaType || "IMAGE"}
                        alt="FAQ Background"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950/95 via-zinc-950/60 to-transparent pointer-events-none" />

                  <div className="relative z-20 mt-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-mono text-xs uppercase tracking-wider mb-3">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{isAr ? "مركز المساعدة" : "KNOWLEDGE & FAQS"}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{faqTitle}</h3>
                    {faqDesc && (
                      <p className="text-zinc-300 text-xs sm:text-sm font-medium mb-4 leading-relaxed line-clamp-3">
                        {faqDesc}
                      </p>
                    )}
                    <Link
                      href={faqCta.ctaLink || `/${locale}/b2b/faqs`}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-emerald-500 hover:text-slate-950 px-5 py-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer"
                    >
                      <span>{faqButton}</span>
                      <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
