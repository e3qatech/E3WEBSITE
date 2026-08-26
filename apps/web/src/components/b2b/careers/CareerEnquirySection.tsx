"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, MessageSquare, User, Mail, Phone, HelpCircle, AlertCircle } from "lucide-react";

interface CareerEnquirySectionProps {
  locale?: string;
  eyebrowEn?: string;
  eyebrowAr?: string;
  titleEn?: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
}

export function CareerEnquirySection({
  locale = "en",
  eyebrowEn,
  eyebrowAr,
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
}: CareerEnquirySectionProps) {
  const isAr = locale === "ar";

  const resolvedEyebrow = isAr ? (eyebrowAr || eyebrowEn || "التواصل واستفسارات التوظيف") : (eyebrowEn || eyebrowAr || "TALENT ACQUISITION SUPPORT");
  const resolvedTitle = isAr ? (titleAr || titleEn || "هل لديك استفسار لفريق التوظيف؟") : (titleEn || titleAr || "Have a Career Enquiry?");
  const resolvedSubtitle = isAr
    ? (subtitleAr || subtitleEn || "تواصل مباشرة مع فريق الموارد البشرية واستقطاب الكفاءات لأي استفسار يخص الشواغر، التدريب التعاوني، أو الشراكات الأكاديمية.")
    : (subtitleEn || subtitleAr || "Directly reach our Talent Acquisition team regarding role specifics, executive searches, or academic internships.");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    enquiryType: "General Careers Inquiry",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.message) {
      setError(
        isAr
          ? "يرجى تعبئة جميع الحقول المطلوبة (الاسم، البريد الإلكتروني، والرسالة)."
          : "Please complete all required fields (name, email, message)."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact/b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "CAREER_ENQUIRY",
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || undefined,
          enquiryType: formData.enquiryType,
          message: formData.message.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.error || (isAr ? "تعذر إرسال الاستفسار." : "Failed to submit enquiry.")
        );
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(
        err.message ||
          (isAr
            ? "حدث خطأ أثناء إرسال الاستفسار. يُرجى المحاولة لاحقاً."
            : "An error occurred while sending your enquiry.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="career-enquiry"
      data-testid="career-enquiry-section"
      aria-label={isAr ? "استفسارات التوظيف والتواصل" : "Career Enquiries"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{resolvedEyebrow}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight">
          {resolvedTitle}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 font-medium">
          {resolvedSubtitle}
        </p>
      </div>

      {submitted ? (
        <div
          data-testid="career-enquiry-success"
          className="p-8 sm:p-12 rounded-3xl bg-[var(--surface-default)] border border-emerald-500/40 text-center max-w-xl mx-auto space-y-4 shadow-xl"
        >
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {isAr ? "تم إرسال استفسارك بنجاح!" : "Enquiry Submitted Successfully!"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            {isAr
              ? "شكراً لتواصلك. سيقوم فريق استقطاب الكفاءات بمراجعة استفسارك والرد عليك عبر البريد الإلكتروني في أقرب وقت."
              : "Thank you for reaching out. Our Talent Acquisition team will review your message and reply shortly."}
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setFormData({
                name: "",
                email: "",
                phone: "",
                enquiryType: "General Careers Inquiry",
                message: "",
              });
            }}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-cyan-500 hover:text-black text-white text-xs font-bold transition-all border border-[var(--border-level-1)]"
          >
            <span>{isAr ? "إرسال استفسار آخر" : "Send Another Enquiry"}</span>
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          data-testid="career-enquiry-form"
          className="p-6 sm:p-10 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-1)] shadow-xl space-y-5"
        >
          {error && (
            <div
              data-testid="career-enquiry-error"
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs sm:text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                {isAr ? "الاسم الكامل *" : "Full Name *"}
              </label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  required
                  data-testid="enquiry-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isAr ? "مثال: طارق المنصور" : "e.g. Tariq Al-Mansoor"}
                  className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                {isAr ? "البريد الإلكتروني *" : "Email Address *"}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="email"
                  required
                  data-testid="enquiry-email-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Phone & Enquiry Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                {isAr ? "رقم الهاتف" : "Phone Number"}
              </label>
              <div className="relative">
                <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="tel"
                  data-testid="enquiry-phone-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+974 ..."
                  className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                {isAr ? "نوع الاستفسار *" : "Enquiry Type *"}
              </label>
              <div className="relative">
                <select
                  data-testid="enquiry-type-select"
                  value={formData.enquiryType}
                  onChange={(e) => setFormData({ ...formData, enquiryType: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                >
                  <option value="General Careers Inquiry">
                    {isAr ? "استفسار توظيف عام" : "General Careers Inquiry"}
                  </option>
                  <option value="Internship & University Relations">
                    {isAr ? "التدريب الميداني والجامعات" : "Internship & University Relations"}
                  </option>
                  <option value="Executive & Senior Leadership Search">
                    {isAr ? "استقطاب القيادات التنفيذية" : "Executive & Senior Leadership Search"}
                  </option>
                  <option value="Application Status Follow-up">
                    {isAr ? "متابعة حالة طلب سابق" : "Application Status Follow-up"}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              {isAr ? "الرسالة أو تفاصيل الاستفسار *" : "Message or Questions *"}
            </label>
            <div className="relative">
              <MessageSquare className="absolute start-3 top-3 w-4 h-4 text-[var(--text-tertiary)]" />
              <textarea
                required
                rows={4}
                data-testid="enquiry-message-input"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={
                  isAr
                    ? "اكتب تفاصيل استفسارك هنا..."
                    : "Describe your question or collaboration details..."
                }
                className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              data-testid="submit-career-enquiry-btn"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {submitting ? (
                <span>{isAr ? "جاري الإرسال..." : "Sending Message..."}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isAr ? "إرسال الاستفسار" : "Send Enquiry"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
