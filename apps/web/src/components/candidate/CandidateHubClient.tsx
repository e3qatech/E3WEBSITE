"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  UploadCloud,
  Award,
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  User,
  Phone,
  MapPin,
  Globe,
  Edit3,
  Loader2,
  Check,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Video,
  CalendarPlus,
  X,
  Plus,
  Info,
  Building,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";
import { CandidateProfileModal } from "./CandidateProfileModal";
import {
  extractCandidateInterviews,
  InterviewRecord,
  formatInterviewCountdown,
  generateIcsCalendar,
} from "@/lib/careers/candidate-portal";

export interface CandidateProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  headline?: string;
  department?: string;
  experienceLevel?: string;
  skills?: string[];
  summary?: string;
  cvUrl?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface CandidateApplicationData {
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
}

export interface RecommendedJobData {
  id: string;
  title: string;
  department?: string | null;
  location?: string | null;
  type?: string;
  description?: string;
  requirements?: string | null;
}

interface CandidateHubClientProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
  profile: CandidateProfileData;
  applications: CandidateApplicationData[];
  recommendedJobs: RecommendedJobData[];
  locale: string;
}

export function CandidateHubClient({
  user,
  profile: initialProfile,
  applications: initialApplications,
  recommendedJobs = [],
  locale,
}: CandidateHubClientProps) {
  const isAr = locale === "ar";

  const [activeTab, setActiveTab] = useState<"applications" | "interviews" | "profile" | "resume" | "jobs">("applications");
  const [profile, setProfile] = useState<CandidateProfileData>(initialProfile);
  const [applications, setApplications] = useState<CandidateApplicationData[]>(initialApplications);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Resume Upload & AI Parsing state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);
  const [parseErrorMsg, setParseErrorMsg] = useState<string | null>(null);
  const [latestParsedData, setLatestParsedData] = useState<any>(
    applications[0]?.cvParsedData || null
  );

  // Quick Skill Add state
  const [newSkillInput, setNewSkillInput] = useState("");
  const [isSavingSkill, setIsSavingSkill] = useState(false);

  // Reschedule Modal state
  const [reschedulingInterview, setReschedulingInterview] = useState<InterviewRecord | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string | null>(null);

  // Derived interviews
  const allInterviews = extractCandidateInterviews(applications);
  const scheduledInterviews = allInterviews.filter((i) => i.status === "SCHEDULED" || i.status === "RESCHEDULE_REQUESTED");

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
          label: isAr ? "قيد المراجعة" : "Under Review",
          className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          step: 2,
        };
      case "SHORTLISTED":
      case "INTERVIEW":
        return {
          label: isAr ? "مرحلة المقابلة" : "Interview Stage",
          className: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          step: 3,
        };
      case "HIRED":
      case "ACCEPTED":
        return {
          label: isAr ? "تم القبول" : "Accepted",
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          step: 4,
        };
      case "REJECTED":
      case "WITHDRAWN":
        return {
          label: s === "WITHDRAWN" ? (isAr ? "تم السحب" : "Withdrawn") : (isAr ? "مكتمل (غير مستوفٍ)" : "Not Selected"),
          className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
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

  const inReviewCount = applications.filter((a) =>
    ["NEW", "REVIEWING", "UNDER_REVIEW", "INTERVIEW", "SHORTLISTED"].includes(
      (a.status || "").toUpperCase()
    )
  ).length;

  const handleProfileUpdated = (updated: any) => {
    setProfile((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleTriggerAiParse = async (fileToParse?: File) => {
    setIsParsing(true);
    setParseErrorMsg(null);
    setParseSuccessMsg(null);

    try {
      let res: Response;

      if (fileToParse || selectedFile) {
        const formData = new FormData();
        formData.append("resume", (fileToParse || selectedFile) as Blob);
        res = await fetch("/api/candidate/resume/parse", {
          method: "POST",
          body: formData,
        });
      } else if (profile.cvUrl) {
        res = await fetch("/api/candidate/resume/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeUrl: profile.cvUrl }),
        });
      } else {
        throw new Error(isAr ? "يرجى اختيار ملف سيرة ذاتية أولاً" : "Please select a resume file first");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      const extracted = data.extractedData;
      setLatestParsedData(extracted);

      // Auto-update profile state with AI-extracted skills & headline
      if (extracted) {
        setProfile((prev) => ({
          ...prev,
          headline: extracted.position || prev.headline,
          department: extracted.department || prev.department,
          experienceLevel: extracted.experienceLevel || prev.experienceLevel,
          skills: extracted.skills && extracted.skills.length > 0 ? extracted.skills : prev.skills,
          summary: extracted.summary || prev.summary,
        }));
      }

      setParseSuccessMsg(
        isAr
          ? "تم تحليل السيرة الذاتية بنجاح بواسطة الذكاء الاصطناعي وتحديث المهارات المهنية!"
          : "Resume analyzed successfully with Gemini AI! Your skills and headline have been updated."
      );
    } catch (err: any) {
      setParseErrorMsg(err.message || "Parsing error");
    } finally {
      setIsParsing(false);
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

  const handleOpenRescheduleModal = (interview: InterviewRecord) => {
    setReschedulingInterview(interview);
    setRescheduleReason("");
    setPreferredDate("");
    setRescheduleError(null);
    setRescheduleSuccess(null);
  };

  const handleSubmitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingInterview) return;
    if (!rescheduleReason.trim()) {
      setRescheduleError(isAr ? "يرجى ذكر سبب طلب إعادة الجدولة" : "Please provide a reason for the reschedule request");
      return;
    }

    setIsSubmittingReschedule(true);
    setRescheduleError(null);

    try {
      const res = await fetch(`/api/candidate/interviews/${reschedulingInterview.id}/reschedule`, {
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
          ? "تم إرسال طلب إعادة الجدولة بنجاح إلى فريق استقطاب المواهب في إي ثري."
          : "Reschedule request successfully submitted to the E3 Qatar recruitment team."
      );

      // Optimistically update local application state
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id === reschedulingInterview.applicationId) {
            const currentParsed = (app.cvParsedData as any) || {};
            const interviews = Array.isArray(currentParsed.interviews) ? [...currentParsed.interviews] : [];
            const idx = interviews.findIndex((i: any) => i.id === reschedulingInterview.id);
            if (idx !== -1) {
              interviews[idx] = {
                ...interviews[idx],
                status: "RESCHEDULE_REQUESTED",
                rescheduleReason: rescheduleReason.trim(),
              };
            }
            return {
              ...app,
              cvParsedData: {
                ...currentParsed,
                interviews,
              },
            };
          }
          return app;
        })
      );

      setTimeout(() => {
        setReschedulingInterview(null);
        setRescheduleSuccess(null);
      }, 2500);
    } catch (err: any) {
      setRescheduleError(err.message || "Network error");
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  const handleQuickAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;

    const currentSkills = profile.skills || [];
    if (currentSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkillInput("");
      return;
    }

    const updatedSkills = [...currentSkills, trimmed];
    setIsSavingSkill(true);

    try {
      const res = await fetch("/api/candidate/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: updatedSkills }),
      });

      if (res.ok) {
        setProfile((prev) => ({ ...prev, skills: updatedSkills }));
        setNewSkillInput("");
      }
    } catch (err) {
      console.error("Failed to add skill:", err);
    } finally {
      setIsSavingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updatedSkills = (profile.skills || []).filter((s) => s !== skillToRemove);
    try {
      setProfile((prev) => ({ ...prev, skills: updatedSkills }));
      await fetch("/api/candidate/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: updatedSkills }),
      });
    } catch (err) {
      console.error("Failed to remove skill:", err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500 selection:text-zinc-950" dir={isAr ? "rtl" : "ltr"}>
      {/* 1. Header Bar */}
      <header className="border-b border-white/10 bg-zinc-900/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/b2b/careers`}
              className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "بوابة الوظائف العامة" : "Careers Directory"}</span>
            </Link>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white font-display">
                {profile.name || user.name || user.email}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                {isAr ? "مترشح معتمد" : "Verified Candidate"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? "تعديل الملف" : "Edit Profile"}</span>
            </button>
            <LogoutButton locale={locale} />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border border-white/10 p-6 sm:p-10 rounded-3xl shadow-2xl">
          <div className="absolute top-0 end-0 -mt-8 -me-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
                  {isAr ? "بوابة التوظيف والمترشحين" : "E3 Candidate Workspace"}
                </span>
                <span className="flex items-center gap-1 text-zinc-400 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {isAr ? "حساب مشفر وآمن" : "Encrypted Talent ID"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display text-white">
                {profile.name || user.name || (isAr ? "مرحباً بك" : "Welcome Back")}
              </h1>

              <p className="text-zinc-400 text-sm leading-relaxed">
                {profile.headline ? (
                  <span className="text-emerald-300 font-bold">{profile.headline} • </span>
                ) : null}
                {isAr
                  ? "تابع طلباتك الوظيفية المسجلة، جداول المقابلات المحددة، حدّث مهاراتك المعتمدة، واستفد من محلل السير الذاتية الذكي."
                  : "Track official hiring stages, access scheduled interviews, maintain verified skills, and utilize the Gemini AI resume scanner in Qatar."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("interviews")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-purple-500/20 active:scale-95 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{isAr ? "المقابلات المجدولة" : "View Interviews"}</span>
                {scheduledInterviews.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                    {scheduledInterviews.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("resume")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? "تحليل السيرة بالذكاء الاصطناعي" : "AI Resume Scanner"}</span>
              </button>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
            <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                {isAr ? "إجمالي الطلبات" : "Total Submissions"}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                {applications.length}
              </div>
            </div>

            <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                {isAr ? "المقابلات المجدولة" : "Scheduled Interviews"}
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-purple-400">
                {scheduledInterviews.length}
              </div>
            </div>

            <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                {isAr ? "قيد التقييم النشط" : "Active In Review"}
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400">
                {inReviewCount}
              </div>
            </div>

            <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                {isAr ? "المهارات المعتمدة" : "Verified Skills"}
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400">
                {profile.skills?.length || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("applications")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeTab === "applications"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}
          >
            <Briefcase className="w-4 h-4" />
            <span>{isAr ? "سجل الطلبات والمراحل" : "Applications & Stages"}</span>
            <span className="ms-1 px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px]">{applications.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("interviews")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeTab === "interviews"
                ? "bg-purple-500/10 border border-purple-500/30 text-purple-300 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}
          >
            <Calendar className="w-4 h-4" />
            <span>{isAr ? "إدارة المقابلات" : "Interviews Hub"}</span>
            {scheduledInterviews.length > 0 && (
              <span className="ms-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
                {scheduledInterviews.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeTab === "profile"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}
          >
            <User className="w-4 h-4" />
            <span>{isAr ? "الملف المهني والمهارات" : "Profile & Skills"}</span>
          </button>

          <button
            onClick={() => setActiveTab("resume")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeTab === "resume"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? "محلل السير الذاتية (AI)" : "AI Resume Scanner"}</span>
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeTab === "jobs"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}
          >
            <Award className="w-4 h-4" />
            <span>{isAr ? "الوظائف الموصى بها" : "Matched Opportunities"}</span>
            <span className="ms-1 px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px]">{recommendedJobs.length}</span>
          </button>
        </div>

        {/* TAB 1: APPLICATIONS & TIMELINE */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            {applications.length === 0 ? (
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-10 text-center space-y-4">
                <Briefcase className="w-12 h-12 text-zinc-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    {isAr ? "لا توجد طلبات توظيف مسجلة حتى الآن" : "No Applications Submitted Yet"}
                  </h3>
                  <p className="text-zinc-400 text-xs max-w-md mx-auto">
                    {isAr
                      ? "يمكنك استعراض شواغر إي ثري في قطر والتقديم مباشرة للانضمام إلى فريق هندسة الفعاليات العالمية."
                      : "Explore our live vacancies across turnkey spatial, AV mapping, and entertainment engineering in Qatar."}
                  </p>
                </div>
                <Link
                  href={`/${locale}/b2b/careers`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-md"
                >
                  <span>{isAr ? "استعراض الفرص الوظيفية" : "Explore Open Roles"}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {applications.map((app) => {
                  const badge = getStatusBadge(app.status);
                  const submissionDate = new Date(app.createdAt).toLocaleDateString(
                    isAr ? "ar-QA" : "en-US",
                    { year: "numeric", month: "short", day: "numeric" }
                  );

                  // Check if this application has an interview
                  const appInterviews = allInterviews.filter((i) => i.applicationId === app.id);
                  const activeInterview = appInterviews[0];

                  return (
                    <div
                      key={app.id}
                      className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/40 transition-all duration-300 space-y-4 shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-zinc-400">
                              REF: {app.id.slice(-8).toUpperCase()}
                            </span>
                            <span className={cn("px-2.5 py-0.5 rounded-full border text-[10px] font-bold", badge.className)}>
                              {badge.label}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white">{app.jobTitle}</h3>
                        </div>

                        <div className="text-xs text-zinc-400 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{submissionDate}</span>
                        </div>
                      </div>

                      {/* Active Interview Notice inside card */}
                      {activeInterview && (
                        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0">
                              {activeInterview.format === "IN_PERSON" ? <Building className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-purple-200">
                                {isAr ? "مقابلة مجدولة: " : "Scheduled Interview: "}
                                <span className="text-white">{activeInterview.roundName}</span>
                              </div>
                              <div className="text-[11px] text-purple-300/80 font-mono flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(activeInterview.scheduledAt).toLocaleString(isAr ? "ar-QA" : "en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
                                <span>•</span>
                                <span>{formatInterviewCountdown(activeInterview.scheduledAt, isAr).label}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {activeInterview.meetingUrl && activeInterview.format !== "IN_PERSON" && (
                              <a
                                href={activeInterview.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>{isAr ? "الانضمام للمكالمة" : "Join Meet"}</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab("interviews");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
                            >
                              {isAr ? "التفاصيل والجدولة" : "Details"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 4-Step Visual Progress Bar */}
                      <div className="grid grid-cols-4 gap-2 pt-1 pb-2">
                        {[
                          { num: 1, labelEn: "Submitted", labelAr: "تم التقديم" },
                          { num: 2, labelEn: "Screening", labelAr: "التقييم الفني" },
                          { num: 3, labelEn: "Interview", labelAr: "المقابلة" },
                          { num: 4, labelEn: "Decision", labelAr: "القرار النهائي" },
                        ].map((step) => {
                          const isDone = badge.step >= step.num;
                          const isCurrent = badge.step === step.num;

                          return (
                            <div key={step.num} className="space-y-1">
                              <div
                                className={cn(
                                  "h-1.5 rounded-full transition-all",
                                  isCurrent
                                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                                    : isDone
                                    ? "bg-emerald-600"
                                    : "bg-zinc-800"
                                )}
                              />
                              <div className="text-[10px] font-mono text-center text-zinc-400 truncate">
                                {isAr ? step.labelAr : step.labelEn}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          {app.department && (
                            <span className="flex items-center gap-1 text-zinc-300">
                              <Award className="w-3.5 h-3.5 text-emerald-400" />
                              {app.department}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/${locale}/candidate/applications/${app.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-xs font-bold text-white transition-all group"
                        >
                          <span>{isAr ? "عرض المخطط الزمني الكامل" : "View Timeline Details"}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERVIEWS MANAGER */}
        {activeTab === "interviews" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span>{isAr ? "إدارة المقابلات والتقييمات الفنية" : "Interviews & Candidate Assessments"}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {isAr
                    ? "مواعيد الجلسات الافتراضية واللقاءات الحضورية مع قيادات مشاريع إي ثري في قطر."
                    : "Direct calendar appointments, video call links, and HQ interview details with E3 production leads."}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Doha Time (AST / UTC+3)</span>
              </div>
            </div>

            {allInterviews.length === 0 ? (
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-10 text-center space-y-4">
                <Calendar className="w-12 h-12 text-zinc-600 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">
                    {isAr ? "لا توجد مقابلات مجدولة حالياً" : "No Scheduled Interviews Yet"}
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                    {isAr
                      ? "عند انتقال طلبك إلى مرحلة المقابلة (المرحلة 3)، سيقوم فريق الموارد البشرية بتحديد موعد الجلسة الافتراضية أو الحضور لمقر لوسيل وإرسال رابط اللقاء تلقائياً."
                      : "Once your application advances to Stage 3 (Interview Round), our recruitment team will schedule your session and details will appear here with calendar invites."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {allInterviews.map((interview) => {
                  const countdown = formatInterviewCountdown(interview.scheduledAt, isAr);
                  const isVirtual = interview.format === "VIRTUAL";
                  const isRescheduleRequested = interview.status === "RESCHEDULE_REQUESTED";

                  return (
                    <div
                      key={interview.id}
                      className="bg-zinc-900/80 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-[11px] font-bold uppercase">
                              {interview.roundName}
                            </span>

                            {isRescheduleRequested ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                                {isAr ? "طلب إعادة جدولة قيد المراجعة" : "Reschedule Requested"}
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                                {isAr ? "موعد مؤكد" : "Confirmed Slot"}
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-black font-display text-white">
                            {interview.jobTitle}
                          </h3>
                        </div>

                        {/* Live Countdown Badge */}
                        <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 flex items-center gap-2.5 shrink-0">
                          <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              {isAr ? "الوقت المتبقي" : "Time Remaining"}
                            </div>
                            <div className="text-xs font-mono font-bold text-white">
                              {countdown.label}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Details Matrix */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                          <span className="text-zinc-500 block uppercase font-bold text-[10px] tracking-wider">
                            {isAr ? "التاريخ والوقت (بتوقيت الدوحة)" : "Date & Time (Doha)"}
                          </span>
                          <span className="text-sm font-bold text-white font-mono">
                            {new Date(interview.scheduledAt).toLocaleString(isAr ? "ar-QA" : "en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="text-zinc-400 block text-[11px]">
                            {interview.durationMinutes} {isAr ? "دقيقة" : "minutes"}
                          </span>
                        </div>

                        <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                          <span className="text-zinc-500 block uppercase font-bold text-[10px] tracking-wider">
                            {isAr ? "طبيعة الجلسة والمكان" : "Session Format & Location"}
                          </span>
                          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                            {isVirtual ? <Video className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                            <span>{isVirtual ? (isAr ? "مقابلة افتراضية مرئية" : "Virtual Video Call") : (isAr ? "مقابلة حضورية" : "In-Person HQ")}</span>
                          </div>
                          <span className="text-zinc-400 block text-[11px] truncate">
                            {isVirtual ? "Google Meet / Video Link" : interview.location || "E3 Qatar HQ - Lusail Marina"}
                          </span>
                        </div>

                        <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                          <span className="text-zinc-500 block uppercase font-bold text-[10px] tracking-wider">
                            {isAr ? "لجنة المقابلات" : "Interviewers Panel"}
                          </span>
                          <div className="space-y-0.5">
                            {interview.interviewers.map((panelist, pIdx) => (
                              <span key={pIdx} className="text-xs text-white block font-medium">
                                • {panelist}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Reschedule Reason if requested */}
                      {isRescheduleRequested && interview.rescheduleReason && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                          <span className="font-bold block">{isAr ? "طلبك لإعادة الجدولة: " : "Submitted Reschedule Request: "}</span>
                          <p className="text-amber-200/90">{interview.rescheduleReason}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          {isVirtual && interview.meetingUrl && (
                            <a
                              href={interview.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
                            >
                              <Video className="w-4 h-4" />
                              <span>{isAr ? "الانضمام إلى المقابلة المرئية" : "Join Video Call"}</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDownloadIcs(interview)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all cursor-pointer"
                          >
                            <CalendarPlus className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isAr ? "إضافة للتقويم (.ics)" : "Add to Calendar"}</span>
                          </button>
                        </div>

                        {!isRescheduleRequested && (
                          <button
                            type="button"
                            onClick={() => handleOpenRescheduleModal(interview)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-zinc-400 hover:text-amber-300 text-xs font-bold transition-all cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{isAr ? "طلب موعد بديل" : "Request Reschedule"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Preparation Briefing Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? "إرشادات المقابلات الفنية في إي ثري قطر" : "E3 Qatar Interview Preparation Guidelines"}</span>
              </h4>
              <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>{isAr ? "يرجى الحضور أو الانضمام للرابط قبل الموعد بـ 5 دقائق للتأكد من جودة الصوت والفيديو." : "Join the call 5 minutes early to test your audio, camera, and connection."}</li>
                <li>{isAr ? "جهّز نماذج من مشاريعك السابقة أو ملف أعمالك (Portfolio) للمشاركة أثناء النقاش." : "Have relevant event reels, AV schematics, or production case studies ready to screenshare."}</li>
                <li>{isAr ? "إذا طرأ أي عذر طارئ، استخدم زر 'طلب موعد بديل' قبل 24 ساعة على الأقل ليتمكن الفريق من إعادة التنسيق." : "If you encounter scheduling conflicts, submit a reschedule request at least 24 hours in advance."}</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE & SKILLS */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-zinc-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isAr ? "الملف المهني والشخصي" : "Professional Credentials"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {isAr ? "البيانات المسجلة لدى إدارة التوظيف والموارد البشرية" : "Verified talent profile reviewed by recruitment leads"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-zinc-950 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isAr ? "تعديل الملف" : "Edit Details"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-zinc-500 block">{isAr ? "الاسم الكامل" : "Full Name"}</span>
                  <span className="text-sm font-bold text-white">{profile.name || user.name || "—"}</span>
                </div>

                <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-zinc-500 block">{isAr ? "البريد الإلكتروني" : "Email"}</span>
                  <span className="text-sm font-bold text-white font-mono">{profile.email || user.email || "—"}</span>
                </div>

                <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-zinc-500 block">{isAr ? "رقم الهاتف" : "Phone Number"}</span>
                  <span className="text-sm font-bold text-white font-mono">{profile.phone || "—"}</span>
                </div>

                <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-zinc-500 block">{isAr ? "الموقع الجغرافي" : "Location"}</span>
                  <span className="text-sm font-bold text-white">{profile.location || "Doha, Qatar"}</span>
                </div>

                <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-zinc-500 block">{isAr ? "التخصص / القسم" : "Department"}</span>
                  <span className="text-sm font-bold text-emerald-400">{profile.department || "Operations"}</span>
                </div>

                <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-zinc-500 block">{isAr ? "مستوى الخبرة" : "Experience Level"}</span>
                  <span className="text-sm font-bold text-white">{profile.experienceLevel || "Mid-Level"}</span>
                </div>
              </div>

              {profile.summary && (
                <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-xs text-zinc-500 block font-bold uppercase tracking-wider">
                    {isAr ? "النبذة المهنية" : "Executive Bio / Summary"}
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {profile.summary}
                  </p>
                </div>
              )}

              {/* Skills Editor with Quick Add/Remove */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {isAr ? "المهارات التقنية المعتمدة" : "Verified Technical Skills"}
                  </h4>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {profile.skills?.length || 0} {isAr ? "مهارات" : "skills"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold group"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="w-3.5 h-3.5 rounded-full hover:bg-emerald-500/20 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                          title="Remove skill"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500">
                      {isAr ? "لم يتم تحديد مهارات بعد. أضف مهاراتك الفنية أدناه." : "No skills added yet. Add your skills below."}
                    </span>
                  )}
                </div>

                {/* Inline Quick Add */}
                <form onSubmit={handleQuickAddSkill} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder={isAr ? "أضف مهارة جديدة (مثال: GrandMA3, LED Walls, Q-Sys)..." : "Add skill (e.g., GrandMA3, LED Walls, Q-Sys, Vectorworks)..."}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isSavingSkill || !newSkillInput.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer transition-all"
                  >
                    {isSavingSkill ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isAr ? "إضافة" : "Add"}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Side Links & CV Card */}
            <div className="space-y-6">
              <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
                <h4 className="text-sm font-bold text-white border-b border-white/10 pb-3">
                  {isAr ? "الروابط الخارجية والملفات" : "Online Portfolios & Links"}
                </h4>

                <div className="space-y-3 text-xs">
                  {profile.linkedinUrl ? (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-white/5 hover:border-emerald-500/30 transition-all text-zinc-300 hover:text-white"
                    >
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl bg-zinc-950/40 border border-white/5 text-zinc-500">
                      {isAr ? "رابط LinkedIn غير مضاف" : "No LinkedIn link added"}
                    </div>
                  )}

                  {profile.portfolioUrl ? (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-white/5 hover:border-emerald-500/30 transition-all text-zinc-300 hover:text-white"
                    >
                      <span>Portfolio / Reel</span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl bg-zinc-950/40 border border-white/5 text-zinc-500">
                      {isAr ? "رابط البورتفوليو غير مضاف" : "No portfolio link added"}
                    </div>
                  )}
                </div>
              </div>

              {profile.cvUrl && (
                <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-3 shadow-xl">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? "السيرة الذاتية النشطة" : "Active Master CV"}</span>
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {isAr ? "السيرة الذاتية المشتركة في جميع طلباتك الحالية." : "Document attached to your current candidate profile."}
                  </p>
                  <a
                    href={profile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-xs font-bold text-zinc-200 transition-all"
                  >
                    <span>{isAr ? "معاينة المستند" : "View CV Document"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AI RESUME SCANNER */}
        {activeTab === "resume" && (
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold">
                      POWERED BY GEMINI 2.0 FLASH
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {isAr ? "الماسح الذكي للسير الذاتية وتحليل المؤهلات" : "Gemini AI Resume Scanner & Skills Extractor"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {isAr
                      ? "ارفع سيرتك الذاتية لتحليلها فورياً بالذكاء الاصطناعي واستخراج مهاراتك الفنية ونبذتك المهنية تلقائياً."
                      : "Upload or re-scan your CV to automatically extract competencies, match entertainment roles, and update your profile."}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isParsing || (!selectedFile && !profile.cvUrl)}
                  onClick={() => handleTriggerAiParse()}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shrink-0"
                >
                  {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isAr ? "تشغيل التحليل الذكي" : "Run AI Scan"}</span>
                </button>
              </div>

              {parseSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{parseSuccessMsg}</span>
                </div>
              )}

              {parseErrorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseErrorMsg}</span>
                </div>
              )}

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-8 text-center space-y-3 transition-colors bg-zinc-950/40">
                <UploadCloud className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    {isAr ? "اختر أو اسحب ملف السيرة الذاتية الجديد" : "Upload or Replace Resume File"}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {isAr ? "يدعم صيغ PDF، DOCX، TXT (الحجم الأقصى 10 ميجابايت)" : "Supports PDF, DOCX, TXT (Max 10MB)"}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white cursor-pointer transition-colors">
                    <span>{isAr ? "استعراض الملفات" : "Choose File"}</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                        }
                      }}
                    />
                  </label>

                  {selectedFile && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                      <FileCheck className="w-4 h-4" />
                      <span>{selectedFile.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Latest AI Extraction Breakdown */}
              {latestParsedData && (
                <div className="bg-zinc-950/80 border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{isAr ? "نتائج التحليل الذكي الأخيرة" : "Latest AI Competency Analysis"}</span>
                    </h4>
                    {latestParsedData.parsedAt && (
                      <span className="text-[11px] font-mono text-zinc-500">
                        {new Date(latestParsedData.parsedAt).toLocaleDateString(isAr ? "ar-QA" : "en-US")}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-zinc-500 block">{isAr ? "المسمى المستخلص" : "Extracted Role"}</span>
                      <span className="font-bold text-white">{latestParsedData.position || latestParsedData.targetRole || "—"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-500 block">{isAr ? "القسم الموصى به" : "Target Department"}</span>
                      <span className="font-bold text-emerald-400">{latestParsedData.department || "Operations"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-500 block">{isAr ? "المستوى التقديري" : "Experience Level"}</span>
                      <span className="font-bold text-white">{latestParsedData.experienceLevel || "Mid-Level"}</span>
                    </div>
                  </div>

                  {latestParsedData.summary && (
                    <div className="text-xs text-zinc-300 bg-zinc-900/60 p-3.5 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                        {isAr ? "الخلاصة المستخلصة" : "Executive Summary"}
                      </span>
                      <p className="leading-relaxed">{latestParsedData.summary}</p>
                    </div>
                  )}

                  {Array.isArray(latestParsedData.skills) && latestParsedData.skills.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-zinc-400 block">
                        {isAr ? "المهارات المكتشفة" : "Identified Skills"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {latestParsedData.skills.map((s: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: RECOMMENDED JOBS */}
        {activeTab === "jobs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isAr ? "الشواغر المتاحة في قطر" : "Open Entertainment & Engineering Roles"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isAr ? "فرص وظيفية تتطابق مع مهاراتك وخبراتك المسجلة" : "Open positions matching your verified skills in Doha"}
                </p>
              </div>

              <Link
                href={`/${locale}/b2b/careers`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>{isAr ? "عرض كل الوظائف" : "View All Careers"}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>

            {recommendedJobs.length === 0 ? (
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-10 text-center space-y-2">
                <Briefcase className="w-10 h-10 text-zinc-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">
                  {isAr ? "لا توجد شواغر جديدة متطابقة حالياً" : "No Matching Vacancies Right Now"}
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  {isAr
                    ? "يتم تحديث الشواغر دورياً للمشاريع والفعاليات الكبرى. ترقب الإعلانات القادمة."
                    : "New entertainment production roles are published regularly for major Qatar activations."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/40 transition-all space-y-4 shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                          {job.type || "FULL_TIME"}
                        </span>
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location || "Doha, Qatar"}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">{job.title}</h4>
                      {job.department && (
                        <p className="text-xs text-emerald-400 font-medium">{job.department}</p>
                      )}
                      {job.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-500">
                        {isAr ? "التقديم الفوري متاح" : "Instant Apply Ready"}
                      </span>
                      <Link
                        href={`/${locale}/b2b/careers`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-bold hover:bg-emerald-400 transition-all"
                      >
                        <span>{isAr ? "التقديم الآن" : "Apply Now"}</span>
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interactive Reschedule Modal */}
        {reschedulingInterview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-white">
                    {isAr ? "طلب إعادة جدولة موعد المقابلة" : "Request Interview Reschedule"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {reschedulingInterview.jobTitle} • {reschedulingInterview.roundName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReschedulingInterview(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {rescheduleSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? "تم إرسال الطلب بنجاح" : "Request Submitted"}</span>
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
                      placeholder={
                        isAr
                          ? "يرجى توضيح سبب الاعتذار عن الموعد الحالي (التزام مسبق، ظرف طارئ، إلخ)..."
                          : "Explain why you cannot attend the current slot (prior project engagement, emergency, etc.)..."
                      }
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

                  <div className="p-3 rounded-xl bg-zinc-950 border border-white/5 text-[11px] text-zinc-400 leading-relaxed">
                    {isAr
                      ? "سيتم إرسال إشعار فوري لمسؤول التوظيف في إي ثري قطر، وسيتواصل معك الفريق لتأكيد الموعد البديل عبر البريد الإلكتروني ولوحة المترشح."
                      : "Our recruitment lead will review your request and reach out with updated availability on your candidate dashboard."}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReschedulingInterview(null)}
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
                      <span>{isAr ? "إرسال الطلب" : "Submit Request"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        <CandidateProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          locale={locale}
          initialProfile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      </main>
    </div>
  );
}
