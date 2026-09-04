"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Calendar,
  User,
  ExternalLink,
  ShieldCheck,
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationProps {
  application: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    jobTitle: string;
    department?: string | null;
    cvUrl: string;
    cvParsedData?: any;
    status: string;
    portal?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
  locale: string;
}

export function CandidateApplicationDetailClient({
  application: initialApplication,
  locale,
}: ApplicationProps) {
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";

  const [application, setApplication] = useState(initialApplication);
  const parsedData = (application.cvParsedData as any) || {};
  const [notes, setNotes] = useState<any[]>(parsedData.candidateNotes || []);

  // Note form state
  const [noteSubject, setNoteSubject] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [isSendingNote, setIsSendingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Withdraw state
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const s = (status || "NEW").toUpperCase();
    switch (s) {
      case "NEW":
      case "SUBMITTED":
        return {
          label: isAr ? "تم استلام الطلب" : "Application Received",
          className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          step: 1,
        };
      case "UNDER_REVIEW":
      case "REVIEWING":
        return {
          label: isAr ? "قيد المراجعة والتقييم" : "Under Evaluation",
          className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          step: 2,
        };
      case "SHORTLISTED":
      case "INTERVIEW":
        return {
          label: isAr ? "مرحلة المقابلات" : "Interview Scheduled",
          className: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          step: 3,
        };
      case "HIRED":
      case "ACCEPTED":
        return {
          label: isAr ? "تم القبول والتعيين" : "Application Accepted",
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          step: 4,
        };
      case "REJECTED":
        return {
          label: isAr ? "مكتمل (غير مستوفٍ)" : "Not Selected",
          className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
          step: 4,
        };
      case "WITHDRAWN":
        return {
          label: isAr ? "تم سحب الطلب" : "Withdrawn by Candidate",
          className: "bg-red-500/10 text-red-400 border-red-500/30",
          step: 4,
        };
      default:
        return {
          label: status,
          className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
          step: 1,
        };
    }
  };

  const badge = getStatusBadge(application.status);
  const submissionDate = new Date(application.createdAt).toLocaleDateString(
    isAr ? "ar-QA" : "en-US",
    { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
  );

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteMessage.trim() || noteMessage.trim().length < 3) {
      setNoteError(isAr ? "يرجى كتابة رسالة لا تقل عن 3 أحرف" : "Please enter at least 3 characters");
      return;
    }

    setIsSendingNote(true);
    setNoteError(null);
    setNoteSuccess(false);

    try {
      const res = await fetch(`/api/candidate/applications/${application.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: noteSubject.trim() || undefined,
          message: noteMessage.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit note");
      }

      if (data.note) {
        setNotes((prev) => [data.note, ...prev]);
      }
      setNoteSubject("");
      setNoteMessage("");
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 5000);
    } catch (err: any) {
      setNoteError(err.message || "Network error");
    } finally {
      setIsSendingNote(false);
    }
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    setWithdrawError(null);

    try {
      const res = await fetch(`/api/candidate/applications/${application.id}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Withdrawn via Candidate Portal" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to withdraw application");
      }

      setApplication((prev) => ({
        ...prev,
        status: "WITHDRAWN",
      }));
      setShowWithdrawConfirm(false);
      setWithdrawSuccess(true);
    } catch (err: any) {
      setWithdrawError(err.message || "Withdrawal error");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 font-sans" dir={dir}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Breadcrumb */}
        <div>
          <Link
            href={`/${locale}/candidate`}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors group mb-4"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isAr ? "العودة إلى لوحة المترشح" : "Back to Candidate Portal"}</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {application.portal || "SHARED"} PORTAL
                </span>
                <span className="text-zinc-500 text-xs font-mono">
                  REF: {application.id.slice(-8).toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-display text-white">
                {application.jobTitle}
              </h1>
              {application.department && (
                <p className="text-emerald-400 text-sm font-medium mt-1">
                  {isAr ? `قسم ${application.department}` : `${application.department} Department`}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className={cn("px-4 py-2 rounded-xl text-sm font-bold border", badge.className)}>
                {badge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Status Progression Tracker */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>{isAr ? "مراحل متابعة الطلب" : "Application Progress"}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            {[
              { num: 1, titleEn: "Submitted", titleAr: "تم الاستلام", descEn: "Application logged", descAr: "تم تسجيل الطلب" },
              { num: 2, titleEn: "Reviewing", titleAr: "قيد المراجعة", descEn: "Profile evaluation", descAr: "مراجعة المؤهلات" },
              { num: 3, titleEn: "Interview", titleAr: "المقابلة", descEn: "Technical stage", descAr: "المقابلة الفنية" },
              { num: 4, titleEn: "Decision", titleAr: "القرار النهائي", descEn: "Status concluded", descAr: "اكتمال الإجراء" },
            ].map((step) => {
              const isCompleted = badge.step >= step.num;
              const isCurrent = badge.step === step.num;

              return (
                <div
                  key={step.num}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    isCurrent
                      ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      : isCompleted
                      ? "bg-zinc-950/60 border-zinc-800 text-zinc-300"
                      : "bg-zinc-950/30 border-zinc-900 text-zinc-600"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold">0{step.num}</span>
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h4 className={cn("text-sm font-bold", isCurrent ? "text-emerald-400" : isCompleted ? "text-white" : "text-zinc-500")}>
                    {isAr ? step.titleAr : step.titleEn}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isAr ? step.descAr : step.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Applicant Details & Verified Documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <User className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "البيانات الشخصية المقدمة" : "Applicant Details"}</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-zinc-500 block">{isAr ? "الاسم الكامل" : "Full Name"}</span>
                <span className="font-semibold text-white">
                  {application.firstName} {application.lastName}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">{isAr ? "البريد الإلكتروني" : "Email Address"}</span>
                <span className="font-mono text-zinc-200">{application.email}</span>
              </div>
              {application.phone && (
                <div>
                  <span className="text-xs text-zinc-500 block">{isAr ? "رقم الهاتف" : "Phone Number"}</span>
                  <span className="font-mono text-zinc-200">{application.phone}</span>
                </div>
              )}
              <div>
                <span className="text-xs text-zinc-500 block">{isAr ? "تاريخ ووقت التقديم" : "Submission Date"}</span>
                <span className="text-zinc-300 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  {submissionDate}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "السيرة الذاتية والمستندات" : "CV & Credentials"}</span>
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                {isAr
                  ? "تم تشفير وحفظ السيرة الذاتية المقدمة بأمان لدى قسم الموارد البشرية والتوظيف في إي ثري."
                  : "Your submitted CV file has been encrypted and securely verified with the E3 People HR recruitment pipeline."}
              </p>

              {application.cvUrl ? (
                <a
                  href={application.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {isAr ? "السيرة الذاتية المرفقة" : "Attached CV Document"}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">Verified Submission</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                </a>
              ) : (
                <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl text-xs text-zinc-500 text-center">
                  {isAr ? "لم يتم العثور على ملف السيرة الذاتية" : "No CV document attached"}
                </div>
              )}

              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{isAr ? "ملف آمن وخاص بالمترشح فقط" : "Protected candidate-owned record"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Competency Extraction Display (if available) */}
        {parsedData && (parsedData.skills || parsedData.summary) && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base border-b border-white/5 pb-3">
              <Sparkles className="w-5 h-5" />
              <h2>{isAr ? "تحليل الكفاءات بالذكاء الاصطناعي (Gemini AI)" : "Gemini AI Talent Analysis"}</h2>
            </div>

            {parsedData.summary && (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-4 rounded-xl border border-white/5">
                {parsedData.summary}
              </p>
            )}

            {Array.isArray(parsedData.skills) && parsedData.skills.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 block">
                  {isAr ? "المهارات المستخلصة من المستند" : "Extracted Technical Skills"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((s: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interactive Notes & Recruiter Correspondence */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base border-b border-white/5 pb-4">
            <MessageSquare className="w-5 h-5" />
            <h2>{isAr ? "ملاحظات وتحديثات إضافية على الطلب" : "Candidate Notes & Inquiries"}</h2>
          </div>

          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((n: any, idx: number) => (
                <div key={idx} className="bg-zinc-950/60 border border-white/5 p-4 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-bold text-white">{n.subject || (isAr ? "رسالة توضيحية" : "Candidate Note")}</span>
                    <span className="font-mono text-[11px]">{new Date(n.createdAt).toLocaleDateString(isAr ? "ar-QA" : "en-US")}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500">
              {isAr ? "لم تقم بإرسال أي ملاحظات إضافية لهذا الطلب بعد." : "No additional notes or portfolio links submitted yet."}
            </p>
          )}

          {/* New Note Form */}
          {application.status !== "WITHDRAWN" && application.status !== "REJECTED" && (
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-sm font-bold text-white mb-3">
                {isAr ? "إضافة استفسار أو رابط بورتفوليو جديد لفريق التوظيف" : "Send Clarification or Updated Portfolio Link"}
              </h3>

              {noteSuccess && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{isAr ? "تم إلحاق ملاحظتك بملف التقديم بنجاح." : "Your note has been attached to your application."}</span>
                </div>
              )}

              {noteError && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{noteError}</span>
                </div>
              )}

              <form onSubmit={handleSendNote} className="space-y-3">
                <input
                  type="text"
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  placeholder={isAr ? "موضوع الملاحظة (اختياري)" : "Subject or link topic (optional)"}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
                />
                <textarea
                  required
                  rows={3}
                  value={noteMessage}
                  onChange={(e) => setNoteMessage(e.target.value)}
                  placeholder={isAr ? "اكتب تفاصيل الاستفسار أو أضف رابط الأعمال المحدث هنا..." : "Type your message, updated reel link, or inquiry for the hiring team..."}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500 resize-y"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSendingNote}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                  >
                    {isSendingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{isAr ? "إرسال الملاحظة" : "Send Note"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Self-Serve Application Withdrawal */}
        {application.status !== "WITHDRAWN" && application.status !== "REJECTED" && (
          <div className="bg-zinc-900/40 border border-red-500/20 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>{isAr ? "سحب طلب التوظيف" : "Withdraw Application"}</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  {isAr
                    ? "إذا لم تعد متاحاً لهذه الوظيفة أو تلقيت عرضاً آخر، يمكنك سحب طلبك في أي وقت."
                    : "If you are no longer available for this role, you can withdraw your application."}
                </p>
              </div>

              {!showWithdrawConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowWithdrawConfirm(true)}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {isAr ? "سحب الطلب" : "Withdraw Application"}
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isWithdrawing}
                    onClick={handleWithdraw}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg"
                  >
                    {isWithdrawing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>{isAr ? "تأكيد السحب" : "Confirm Withdraw"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWithdrawConfirm(false)}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              )}
            </div>

            {withdrawSuccess && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                {isAr ? "تم سحب طلب التوظيف بنجاح." : "Application has been withdrawn."}
              </div>
            )}

            {withdrawError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                {withdrawError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
