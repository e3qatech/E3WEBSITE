"use client";

import React, { useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MediaUploader } from "@/components/shared/MediaUploader";
import { Send, CheckCircle2, FileText, ArrowLeft, ArrowRight, UserCheck, Lock } from "lucide-react";
import Link from "next/link";

function ApplicationForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale === "ar" ? "ar" : "en") as "en" | "ar";
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";

  const jobTitle = searchParams.get("jobTitle") || (isAr ? "فرصة وظيفية متاحة" : "Open Position");
  const department = searchParams.get("department") || "";
  const portal = searchParams.get("portal") || "SHARED";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
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

    setSubmitting(true);
    try {
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          jobTitle,
          department,
          portal,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409 || json.code === "ACCOUNT_EXISTS" || (json.error && json.error.includes("already exists"))) {
          setAccountExists(true);
          setError(
            isAr
              ? "يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل. يُرجى تسجيل الدخول لمتابعة أو تقديم طلبك."
              : "An account with this email already exists. Please sign in to submit or track your application."
          );
          return;
        }
        throw new Error(json.error || (isAr ? "تعذر تقديم طلب التوظيف." : "Failed to submit application"));
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || (isAr ? "حدث خطأ أثناء تقديم الطلب." : "An error occurred while submitting your application."));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center space-y-6 max-w-lg mx-auto bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 p-8 rounded-2xl shadow-2xl"
        dir={dir}
      >
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">
          {isAr ? "تم استلام طلبك بنجاح!" : "Application Received!"}
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          {isAr ? (
            <>
              شكراً لتقديمك على وظيفة <strong>{jobTitle}</strong>. تم إنشاء حساب ملف المترشح الخاص بك لتتمكن من متابعة حالة طلبك بشكل فوري.
            </>
          ) : (
            <>
              Thank you for applying for <strong>{jobTitle}</strong>. We&apos;ve created your candidate account so you can track your application status anytime.
            </>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
          <Link href={`/${locale}/candidate`} className="flex-1">
            <Button className="w-full bg-white text-zinc-950 hover:bg-zinc-200 py-6 rounded-xl font-bold">
              {isAr ? "الانتقال إلى لوحة المترشح" : "Go to Candidate Portal"}
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 border-zinc-700 text-white hover:bg-zinc-800 py-6 rounded-xl"
          >
            {isAr ? "العودة إلى الوظائف" : "Back to Careers"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-3xl mx-auto bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 p-8 md:p-12 rounded-2xl shadow-2xl"
      dir={dir}
    >
      {/* 1. Header & Navigation */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-zinc-400 hover:text-white flex items-center text-sm mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
          <span>{isAr ? "العودة إلى الوظائف" : "Back to Careers"}</span>
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-display mb-2">
              {isAr ? `التقديم على: ${jobTitle}` : `Apply for ${jobTitle}`}
            </h1>
            {department && (
              <p className="text-emerald-400 font-medium text-sm">
                {isAr ? `قسم ${department}` : `${department} Department`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Clear Localized Returning-User Action Banner (QF-06) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950/80 border border-emerald-500/20 mb-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {isAr ? "هل سبق أن تقدمت بطلب سابق؟" : "Already applied to E3?"}
            </p>
            <p className="text-xs text-zinc-400">
              {isAr
                ? "سجّل الدخول لمتابعة حالة طلباتك ومستنداتك."
                : "Sign in to track your submitted application status and credentials."}
            </p>
          </div>
        </div>
        <Link
          href={`/${locale}/login/careers?callbackUrl=/${locale}/candidate`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono font-bold text-emerald-400 hover:text-zinc-950 bg-emerald-500/10 hover:bg-emerald-400 border border-emerald-500/30 rounded-lg transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400"
          id="returning-applicant-signin-btn"
        >
          <span>{isAr ? "هل سبق أن تقدمت؟ سجّل الدخول" : "Already applied? Sign in"}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </Link>
      </div>

      {/* 3. Existing Account Conflict Callout */}
      {accountExists && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">
                {isAr ? "حسابك موجود بالفعل" : "Existing Account Detected"}
              </p>
              <p className="text-xs text-zinc-300 mt-1">
                {isAr
                  ? "يوجد حساب مسجل بهذا البريد الإلكتروني. يرجى تسجيل الدخول لمتابعة التقديم أو الاطلاع على حالة ملفك."
                  : "An account with this email address already exists. Please sign in to submit additional applications or track progress."}
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/login/careers?callbackUrl=/${locale}/candidate`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400 rounded-lg shrink-0 transition-colors"
          >
            <span>{isAr ? "تسجيل الدخول الآن" : "Sign In Now"}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>
      )}

      {/* 4. Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && !accountExists && (
          <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {isAr ? "الاسم الأول *" : "First Name *"}
            </label>
            <Input
              required
              value={formData.firstName}
              onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              className="bg-zinc-950/50 border-zinc-800 text-white focus:border-emerald-500"
              placeholder={isAr ? "أحمد" : "First Name"}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {isAr ? "اسم العائلة *" : "Last Name *"}
            </label>
            <Input
              required
              value={formData.lastName}
              onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
              className="bg-zinc-950/50 border-zinc-800 text-white focus:border-emerald-500"
              placeholder={isAr ? "الأنصاري" : "Last Name"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {isAr ? "البريد الإلكتروني *" : "Email Address *"}
            </label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="bg-zinc-950/50 border-zinc-800 text-white focus:border-emerald-500"
              placeholder="candidate@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {isAr ? "رقم الهاتف" : "Phone Number"}
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="bg-zinc-950/50 border-zinc-800 text-white focus:border-emerald-500"
              placeholder="+974 0000 0000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {isAr ? "تحميل السيرة الذاتية (PDF أو DOC) *" : "Upload CV (PDF or DOC) *"}
          </label>
          <div className="p-4 border border-dashed border-zinc-700 hover:border-emerald-500/50 transition-colors rounded-xl bg-zinc-950/50">
            {formData.cvUrl ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-emerald-400 font-medium">
                  <FileText className="w-5 h-5 me-3" />
                  <span>{isAr ? "تم تحميل السيرة الذاتية بنجاح" : "CV Uploaded Successfully"}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, cvUrl: "" }))}
                  className="text-zinc-400 hover:text-red-400"
                >
                  {isAr ? "إزالة" : "Remove"}
                </Button>
              </div>
            ) : (
              <MediaUploader
                value=""
                onChange={(url) => setFormData((prev) => ({ ...prev, cvUrl: url }))}
                accept=".pdf,.doc,.docx"
                context="public_resume"
              />
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800/50">
          <h3 className="text-lg font-bold text-white mb-1">
            {isAr ? "إنشاء حساب المترشح" : "Create Candidate Account"}
          </h3>
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            {isAr
              ? "عيّن كلمة مرور لمتابعة حالة طلبك عبر بوابة المترشحين في أي وقت."
              : "Set a password to securely track the status of your application anytime."}
          </p>

          <div className="space-y-2 max-w-md">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {isAr ? "كلمة المرور *" : "Password *"}
            </label>
            <Input
              type="password"
              required
              placeholder={isAr ? "8 أحرف على الأقل" : "Minimum 8 characters"}
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              className="bg-zinc-950/50 border-zinc-800 text-white focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-8 py-6 text-base rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            {submitting
              ? isAr
                ? "جاري التقديم..."
                : "Submitting..."
              : isAr
              ? "إرسال طلب التوظيف"
              : "Submit Application"}
            <Send className="w-4 h-4 ms-2 rtl:rotate-180" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 py-32 px-4 relative overflow-hidden font-sans">
      {/* Background ambient accents */}
      <div className="absolute top-[-20%] start-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] end-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto">
        <Suspense fallback={<div className="text-center text-zinc-500 py-16">Loading application form...</div>}>
          <ApplicationForm />
        </Suspense>
      </div>
    </div>
  );
}
