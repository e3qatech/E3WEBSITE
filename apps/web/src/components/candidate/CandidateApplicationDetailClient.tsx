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
  Video,
  Building,
  CalendarPlus,
  X,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildApplicationTimeline,
  extractCandidateInterviews,
  formatInterviewCountdown,
  generateIcsCalendar,
  InterviewRecord,
} from "@/lib/careers/candidate-portal";

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

  // Reschedule state
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string | null>(null);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Milestone timeline
  const milestones = buildApplicationTimeline(application);

  // Interviews for this application
  const interviews = extractCandidateInterviews([application]);
  const activeInterview = interviews[0];

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

  const handleDownloadIcs = (interview: InterviewRecord) => {
    const icsContent = generateIcsCalendar(interview);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `e3-interview-${interview.roundName.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterview) return;
    if (!rescheduleReason.trim()) {
      setRescheduleError(isAr ? "يرجى ذكر سبب طلب التأجيل" : "Please provide a reason for the reschedule request");
      return;
    }

    setIsSubmittingReschedule(true);
    setRescheduleError(null);

    try {
      const res = await fetch(`/api/candidate/interviews/${activeInterview.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: rescheduleReason.trim(),
          preferredDate: preferredDate.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit reschedule request");
      }

      setRescheduleSuccess(
        isAr
          ? "تم إرسال طلب إعادة الجدولة بنجاح إلى فريق التوظيف."
          : "Reschedule request successfully submitted."
      );

      // Update local parsed data
      const currentParsed = (application.cvParsedData as any) || {};
      const updatedInterviews = Array.isArray(currentParsed.interviews) ? [...currentParsed.interviews] : [];
      const idx = updatedInterviews.findIndex((i: any) => i.id === activeInterview.id);
      if (idx !== -1) {
        updatedInterviews[idx] = {
          ...updatedInterviews[idx],
          status: "RESCHEDULE_REQUESTED",
          rescheduleReason: rescheduleReason.trim(),
        };
      }
      setApplication((prev) => ({
        ...prev,
        cvParsedData: {
          ...currentParsed,
          interviews: updatedInterviews,
        },
      }));

      setTimeout(() => {
        setIsRescheduleOpen(false);
        setRescheduleSuccess(null);
      }, 2000);
    } catch (err: any) {
      setRescheduleError(err.message || "Network error");
    } finally {
      setIsSubmittingReschedule(false);
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

        {/* ACTIVE SCHEDULED INTERVIEW SPOTLIGHT (If Scheduled or in Interview stage) */}
        {activeInterview && (
          <div className="bg-gradient-to-r from-purple-950/60 via-zinc-900 to-indigo-950/60 border border-purple-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 end-0 -mt-8 -me-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold uppercase">
                    {activeInterview.roundName}
                  </span>
                  {activeInterview.status === "RESCHEDULE_REQUESTED" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      {isAr ? "طلب إعادة الجدولة قيد المراجعة" : "Reschedule Requested"}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {isAr ? "موعد مؤكد" : "Confirmed Interview"}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white">
                  {isAr ? "جلسة المقابلة والتقييم الفني المباشر" : "Live Interview Session Scheduled"}
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center gap-2.5 shrink-0">
                <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase text-zinc-400">
                    {isAr ? "الوقت المتبقي" : "Countdown"}
                  </div>
                  <div className="text-xs font-mono font-bold text-white">
                    {formatInterviewCountdown(activeInterview.scheduledAt, isAr).label}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-zinc-950/70 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-zinc-500 block uppercase font-bold text-[10px]">
                  {isAr ? "التاريخ والوقت" : "Date & Time"}
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {new Date(activeInterview.scheduledAt).toLocaleString(isAr ? "ar-QA" : "en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-zinc-400 block text-[11px]">
                  {activeInterview.durationMinutes} {isAr ? "دقيقة" : "minutes"} (Doha AST)
                </span>
              </div>

              <div className="bg-zinc-950/70 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-zinc-500 block uppercase font-bold text-[10px]">
                  {isAr ? "نوع اللقاء" : "Format & Location"}
                </span>
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  {activeInterview.format === "VIRTUAL" ? <Video className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                  <span>{activeInterview.format === "VIRTUAL" ? (isAr ? "مقابلة افتراضية مرئية" : "Virtual Video Call") : (isAr ? "مقابلة حضورية" : "In-Person HQ")}</span>
                </div>
                <span className="text-zinc-400 block text-[11px] truncate">
                  {activeInterview.format === "VIRTUAL" ? "Google Meet / Teams" : activeInterview.location || "E3 Qatar HQ - Lusail Marina"}
                </span>
              </div>

              <div className="bg-zinc-950/70 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-zinc-500 block uppercase font-bold text-[10px]">
                  {isAr ? "لجنة التقييم" : "Hiring Board"}
                </span>
                <div className="space-y-0.5">
                  {activeInterview.interviewers.map((p, idx) => (
                    <span key={idx} className="text-xs text-white block">
                      • {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {activeInterview.format === "VIRTUAL" && activeInterview.meetingUrl && (
                  <a
                    href={activeInterview.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg"
                  >
                    <Video className="w-4 h-4" />
                    <span>{isAr ? "الانضمام إلى مكالمة المقابلة" : "Join Video Call"}</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleDownloadIcs(activeInterview)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? "إضافة للتقويم (.ics)" : "Add to Calendar"}</span>
                </button>
              </div>

              {activeInterview.status !== "RESCHEDULE_REQUESTED" && (
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-zinc-400 hover:text-amber-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isAr ? "طلب موعد بديل" : "Request Reschedule"}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Multi-Milestone Progression Tracker */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? "مراحل المخطط الزمني والتقييم" : "Application Timeline & Milestones"}</span>
            </h2>

            <span className="text-xs text-zinc-400 font-mono">
              {isAr ? "مدة التقييم المعتادة: 3 - 5 أيام عمل" : "Target SLA: 3-5 Business Days"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            {milestones.map((m) => (
              <div
                key={m.stage}
                className={cn(
                  "p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3",
                  m.isCurrent
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : m.isCompleted
                    ? "bg-zinc-950/60 border-zinc-800 text-zinc-300"
                    : "bg-zinc-950/30 border-zinc-900 text-zinc-600"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold">0{m.stage}</span>
                    {m.isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h4 className={cn("text-sm font-bold", m.isCurrent ? "text-emerald-400" : m.isCompleted ? "text-white" : "text-zinc-500")}>
                    {isAr ? m.titleAr : m.titleEn}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {isAr ? m.descAr : m.descEn}
                  </p>
                </div>

                {m.timestamp && (
                  <div className="text-[10px] font-mono text-zinc-500 pt-2 border-t border-white/5">
                    {new Date(m.timestamp).toLocaleDateString(isAr ? "ar-QA" : "en-US", { month: "short", day: "numeric" })}
                  </div>
                )}
              </div>
            ))}
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

        {/* AI Competency Extraction Display */}
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

        {/* Reschedule Modal */}
        {isRescheduleOpen && activeInterview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isAr ? "طلب موعد بديل للمقابلة" : "Request Alternative Interview Slot"}
                  </h3>
                  <p className="text-xs text-zinc-400">{activeInterview.roundName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {rescheduleSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? "تم إرسال طلبك بنجاح" : "Request Sent"}</span>
                  </div>
                  <p>{rescheduleSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReschedule} className="space-y-4 text-xs">
                  {rescheduleError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{rescheduleError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-bold block">
                      {isAr ? "سبب طلب التأجيل أو التغيير *" : "Reason for Reschedule *"}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      placeholder={isAr ? "اشرح سبب حاجتك لموعد بديل..." : "Explain why you need an alternative slot..."}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-y"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-bold block">
                      {isAr ? "الموعد المقترح البديل (اختياري)" : "Preferred Alternative Date & Time (Optional)"}
                    </label>
                    <input
                      type="datetime-local"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRescheduleOpen(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? "إلغاء" : "Cancel"}
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingReschedule}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {isSubmittingReschedule ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>{isAr ? "إرسال طلب التأجيل" : "Submit Reschedule"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
