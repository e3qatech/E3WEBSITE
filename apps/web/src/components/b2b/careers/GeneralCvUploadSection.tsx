"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  CheckCircle2,
  Lock,
  User,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { MediaUploader } from "@/components/shared/MediaUploader";
import { cn } from "@/lib/utils";

interface GeneralCvUploadSectionProps {
  locale?: string;
}

export function GeneralCvUploadSection({
  locale = "en",
}: GeneralCvUploadSectionProps) {
  const isAr = locale === "ar";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    department: "",
    cvUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [accountExists, setAccountExists] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAccountExists(false);

    if (!formData.cvUrl) {
      setError(
        isAr
          ? "يرجى تحميل السيرة الذاتية (ملف PDF أو مستند) قبل المتابعة."
          : "Please upload your CV (PDF or Document) before submitting."
      );
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setError(
        isAr
          ? "يجب ألا تقل كلمة المرور الخاصة بحساب المترشح عن 8 أحرف."
          : "Password must be at least 8 characters to create your candidate account."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || undefined,
          password: formData.password,
          jobTitle: isAr ? "طلب توظيف عام" : "General Application",
          department: formData.department.trim() || undefined,
          cvUrl: formData.cvUrl,
          portal: "B2B",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (
          res.status === 409 ||
          json.code === "ACCOUNT_EXISTS" ||
          (json.error && json.error.includes("already exists"))
        ) {
          setAccountExists(true);
          setError(
            isAr
              ? "يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل. يُرجى تسجيل الدخول لمتابعة أو تقديم طلبك."
              : "An account with this email already exists. Please sign in to track or submit your application."
          );
          return;
        }

        throw new Error(
          json.error ||
            (isAr ? "تعذر تقديم طلب التوظيف." : "Failed to submit application.")
        );
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(
        err.message ||
          (isAr
            ? "حدث خطأ أثناء تقديم الطلب. يُرجى المحاولة مرة أخرى."
            : "An error occurred while submitting your application.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="upload-cv"
      data-testid="general-cv-upload-section"
      aria-label={isAr ? "تقديم السيرة الذاتية والطلب العام" : "Upload CV & General Application"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full bg-[var(--surface-default)] py-16 sm:py-24 border-y border-[var(--border-level-1)]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{isAr ? "الطلب العام وقاعدة الكفاءات" : "TALENT POOL & GENERAL APPLICATION"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            {isAr ? "لم تجد شاغراً مطابقاً؟ أرسل سيرتك الذاتية" : "Don't See a Direct Match? Upload Your CV"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 font-medium">
            {isAr
              ? "نستقبل طلبات المبدعين والمهندسين بشكل مستمر. قدم سيرتك الذاتية لنقوم بإنشاء حساب المترشح الخاص بك ومطابقة خبراتك فور توفر الفرصة المناسبة."
              : "We continuously scout exceptional specialists. Upload your CV to create your verified candidate profile for future roster openings."}
          </p>
        </div>

        {/* Form Container or Success Confirmation */}
        {submitted ? (
          <div
            data-testid="cv-upload-success"
            className="p-8 sm:p-12 rounded-3xl bg-[var(--surface-hover)] border border-emerald-500/40 text-center max-w-xl mx-auto space-y-5 shadow-2xl"
          >
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {isAr ? "تم استلام سيرتك الذاتية بنجاح!" : "Application & CV Received!"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {isAr
                ? "شكراً لاهتمامك بالانضمام إلى فريق إي ثري. تم إنشاء حساب ملف المترشح الخاص بك لتتمكن من متابعة حالة طلبك بشكل مباشر."
                : "Thank you for sharing your credentials. Your candidate account has been created so you can track your submission status anytime."}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/${locale}/candidate`}
                data-testid="go-to-candidate-portal-btn"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs sm:text-sm transition-all shadow-md"
              >
                <span>{isAr ? "الانتقال إلى بوابة المترشح" : "Go to Candidate Portal"}</span>
                <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            data-testid="general-cv-upload-form"
            className="p-6 sm:p-10 rounded-3xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] shadow-xl space-y-6"
          >
            {error && (
              <div
                data-testid="cv-upload-error"
                className={cn(
                  "p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 border",
                  accountExists
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                    : "bg-red-500/10 border-red-500/30 text-red-200"
                )}
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-grow">
                  <p>{error}</p>
                  {accountExists && (
                    <div className="mt-2">
                      <Link
                        href={`/${locale}/login/careers?callbackUrl=/${locale}/candidate`}
                        className="inline-flex items-center gap-1 font-bold underline hover:opacity-80 text-cyan-400"
                      >
                        <span>{isAr ? "اضغط هنا لتسجيل الدخول إلى حسابك ←" : "Sign In to your Candidate Account →"}</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  {isAr ? "الاسم الأول *" : "First Name *"}
                </label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    required
                    data-testid="cv-first-name-input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder={isAr ? "مثال: طارق" : "e.g. Tariq"}
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  {isAr ? "اسم العائلة *" : "Last Name *"}
                </label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    required
                    data-testid="cv-last-name-input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder={isAr ? "مثال: المنصور" : "e.g. Al-Mansoor"}
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                </label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    type="email"
                    required
                    data-testid="cv-email-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={isAr ? "name@example.com" : "name@example.com"}
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  {isAr ? "رقم الهاتف" : "Phone Number"}
                </label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    type="tel"
                    data-testid="cv-phone-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+974 ..."
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Department Preference & Candidate Account Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  {isAr ? "القسم أو التخصص المفضل" : "Preferred Department / Specialty"}
                </label>
                <div className="relative">
                  <Briefcase className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    data-testid="cv-department-input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder={isAr ? "مثال: الإنتاج التقني، التصميم المكاني..." : "e.g. Technical AV, Spatial Design..."}
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  {isAr ? "كلمة مرور حساب المترشح (8+ أحرف) *" : "Candidate Account Password (8+ chars) *"}
                </label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    data-testid="cv-password-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* CV Document Upload Component */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                {isAr ? "السيرة الذاتية أو الملف التعريفي (PDF / Word) *" : "Upload CV / Portfolio (PDF / Word) *"}
              </label>
              <div
                data-testid="cv-media-uploader"
                className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-4"
              >
                <MediaUploader
                  value={formData.cvUrl}
                  onChange={(url) => setFormData({ ...formData, cvUrl: url })}
                  accept=".pdf,.doc,.docx,application/pdf,application/msword"
                />
              </div>
            </div>

            {/* Privacy & Submit */}
            <div className="pt-4 border-t border-[var(--border-level-1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {isAr
                    ? "بياناتك وسيرتك الذاتية مشفرة ومحمية وفق معايير خصوصية التوظيف."
                    : "Your data and CV credentials are encrypted and stored securely."}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                data-testid="submit-general-application-btn"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
              >
                {submitting ? (
                  <span>{isAr ? "جاري الإرسال..." : "Submitting Application..."}</span>
                ) : (
                  <>
                    <span>{isAr ? "إرسال السيرة الذاتية وإنشاء الحساب" : "Submit CV & Create Account"}</span>
                    <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
