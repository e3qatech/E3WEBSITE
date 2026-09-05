"use client";

import React, { useState, useMemo } from "react";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";
import { AdminButton } from "../ui/AdminButton";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  FileText,
  Download,
  Cpu,
  Search,
  Filter,
  Sparkles,
  AlertTriangle,
  Calendar,
  Video,
  MapPin,
  Clock,
  X,
  Plus,
  Building,
  CheckCircle2,
  Eye,
  Award,
  Trophy,
  BarChart3,
  Copy,
  Check,
  Briefcase,
  ShieldCheck,
  Layers,
  GraduationCap,
  UserCheck,
  Mail,
  Phone,
} from "lucide-react";
import { safeFetchJson } from "@/lib/utils";
import { useLocale } from "@/components/layout/LocaleProvider";
import { isLegacySimulatedMock, computeCategoryFitAndRank } from "@/lib/careers/ai-cv-parser";
import { CvPreviewModal } from "./CvPreviewModal";

export function ApplicationsManager({ initialApplications }: { initialApplications: any[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    initialApplications.length > 0 ? initialApplications[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [previewModalCandidate, setPreviewModalCandidate] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [parsing, setParsing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getInitials = (first: string, last: string) => {
    const f = (first || "").trim()[0] || "";
    const l = (last || "").trim()[0] || "";
    return `${f}${l}`.toUpperCase() || "C";
  };

  // Precompute Category Ranking & Match Score for all candidates
  const rankingsMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const app of applications) {
      const rankInfo = computeCategoryFitAndRank(app, applications);
      map.set(app.id, rankInfo);
    }
    return map;
  }, [applications]);

  // Recruiter KPI stats
  const kpis = useMemo(() => {
    const total = applications.length;
    const topMatches = Array.from(rankingsMap.values()).filter((r) => (r?.matchScore || 0) >= 80).length;
    const activePipeline = applications.filter((a) => ["REVIEWING", "INTERVIEW"].includes(a.status)).length;
    const hired = applications.filter((a) => a.status === "HIRED").length;
    return { total, topMatches, activePipeline, hired };
  }, [applications, rankingsMap]);

  // Extract distinct roles for role filter
  const uniqueRoles = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => {
      if (a.jobTitle) set.add(a.jobTitle);
    });
    return Array.from(set);
  }, [applications]);

  // Filter applications by search query, status, and role
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const fullName = `${app.firstName || ""} ${app.lastName || ""}`.toLowerCase();
      const email = (app.email || "").toLowerCase();
      const phone = (app.phone || "").toLowerCase();
      const role = (app.jobTitle || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        role.includes(q);

      const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
      const matchesRole = roleFilter === "ALL" || app.jobTitle === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [applications, searchQuery, statusFilter, roleFilter]);

  // Recruiter Interview Scheduling Dialog State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleRoundName, setScheduleRoundName] = useState("Executive & Domain Assessment");
  const [scheduleFormat, setScheduleFormat] = useState<"VIRTUAL" | "IN_PERSON">("VIRTUAL");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleDuration, setScheduleDuration] = useState(45);
  const [scheduleMeetingUrl, setScheduleMeetingUrl] = useState("https://meet.google.com/e3q-hr-interview");
  const [scheduleLocation, setScheduleLocation] = useState("E3 Qatar HQ - Level 24, Lusail Marina, Doha");
  const [scheduleInterviewers, setScheduleInterviewers] = useState("E3 Qatar Talent Board, Production Director");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const selectedApp = applications.find((a) => a.id === selectedAppId);
  const selectedAppRank = selectedApp ? rankingsMap.get(selectedApp.id) : null;

  const handleParseCV = async (id: string) => {
    setParsing(true);
    try {
      const res = await fetch(`/api/careers/${id}/parse`, { method: "POST" });
      const parsed = await safeFetchJson(res);

      if (!parsed.ok) throw new Error(parsed.error || (isAr ? "فشل تحليل السيرة الذاتية" : "Failed to parse CV"));

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? parsed.data.application : app))
      );
      toast(isAr ? "تم تحليل السيرة الذاتية بالذكاء الاصطناعي بنجاح." : "CV parsed successfully.", "success");
    } catch (e: any) {
      console.error(e);
      toast(e.message || (isAr ? "فشل تحليل السيرة الذاتية." : "Failed to parse CV."), "error");
    } finally {
      setParsing(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/careers/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const parsed = await safeFetchJson(res);

      if (!parsed.ok) throw new Error(parsed.error || (isAr ? "فشل تحديث حالة الطلب" : "Failed to update status"));

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
      toast(isAr ? "تم تحديث حالة طلب التوظيف بنجاح." : "Application status updated.", "success");
    } catch (e: any) {
      console.error(e);
      toast(e.message || (isAr ? "فشل تحديث حالة الطلب." : "Failed to update status."), "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenScheduleModal = () => {
    // Default scheduled date to 2 days ahead at 10:00 AM
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    nextDate.setHours(10, 0, 0, 0);
    const localIso = new Date(nextDate.getTime() - nextDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setScheduleDate(localIso);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (!scheduleDate) {
      toast(isAr ? "يرجى تحديد موعد المقابلة" : "Please select interview date and time", "error");
      return;
    }

    setIsScheduling(true);
    try {
      const res = await fetch(`/api/careers/${selectedApp.id}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundName: scheduleRoundName.trim(),
          format: scheduleFormat,
          scheduledAt: new Date(scheduleDate).toISOString(),
          durationMinutes: Number(scheduleDuration) || 45,
          meetingUrl: scheduleFormat === "VIRTUAL" ? scheduleMeetingUrl.trim() : undefined,
          location: scheduleFormat === "IN_PERSON" ? scheduleLocation.trim() : undefined,
          interviewers: scheduleInterviewers.split(",").map((s) => s.trim()).filter(Boolean),
          notes: scheduleNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to schedule interview");
      }

      // Update local state with the new interview and updated status
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id === selectedApp.id) {
            const currentParsed = (app.cvParsedData as any) || {};
            const existingInterviews = Array.isArray(currentParsed.interviews) ? currentParsed.interviews : [];
            return {
              ...app,
              status: "INTERVIEW",
              cvParsedData: {
                ...currentParsed,
                interviews: [data.interview, ...existingInterviews],
              },
            };
          }
          return app;
        })
      );

      toast(
        isAr
          ? "تم جدولة المقابلة بنجاح وتحديث حالة الطلب إلى (مقابلة)."
          : "Interview scheduled successfully! Application advanced to Interview stage.",
        "success"
      );
      setIsScheduleModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast(err.message || (isAr ? "فشل جدولة المقابلة" : "Failed to schedule interview"), "error");
    } finally {
      setIsScheduling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "REVIEWING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "INTERVIEW":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "HIRED":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const selectedAppInterviews = Array.isArray(selectedApp?.cvParsedData?.interviews)
    ? selectedApp.cvParsedData.interviews
    : [];

  return (
    <DashboardPageShell variant="wide">
      <DashboardPageHeader
        title={isAr ? "طلبات التوظيف والمترشحين" : "Global Job Applications"}
        description={
          isAr
            ? "مراجعة جميع طلبات التوظيف الواردة، تتبع مراحل المقابلات، واستخدام الذكاء الاصطناعي لتحليل السير الذاتية."
            : "Review incoming candidate submissions across all B2B and B2C portals and use AI to parse CVs."
        }
        breadcrumbs={[
          { label: isAr ? "الموارد البشرية والوظائف" : "HR & Careers", href: `/${locale}/dashboard/careers` },
          { label: isAr ? "طلبات التوظيف" : "Job Applications" },
        ]}
        badge={{
          label: `${applications.length} ${isAr ? "طلبات" : "Applications"}`,
          variant: "purple",
        }}
      />

      {/* Quick Navigation Hub for HR & Recruitment Suite */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[var(--surface-hover)]/40 border border-[var(--border-level-1)] mt-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-3">
            {isAr ? "مركز التوظيف:" : "Recruitment Suite:"}
          </span>

          <a
            href={`/${locale}/dashboard/crm/talent`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-level-1)] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? "استقطاب المواهب و AI" : "Talent Acquisition & AI Hub"}</span>
          </a>

          <a
            href={`/${locale}/dashboard/careers/applications`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isAr ? "طلبات التوظيف ومعاينة CV" : "Job Applications & CVs"}</span>
          </a>

          <a
            href={`/${locale}/dashboard/careers`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-level-1)] transition-all"
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isAr ? "شواغر الوظائف" : "Careers & Openings"}</span>
          </a>

          <a
            href={`/${locale}/dashboard/team`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-level-1)] transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? "دليل فريق العمل (A4 PDF)" : "Team Directory (A4 PDF)"}</span>
          </a>
        </div>
      </div>

      {/* Recruiter KPI Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
          <div>
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isAr ? "إجمالي طلبات التوظيف" : "Total Applications"}
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{kpis.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
          <div>
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isAr ? "في مرحلة المراجعة والمقابلة" : "Active In Pipeline"}
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{kpis.activePipeline}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
          <div>
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isAr ? "نخبة التطابق الذكي (+80%)" : "Top AI Matches"}
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{kpis.topMatches}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
          <div>
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isAr ? "تم التعيين بنجاح" : "Hired & Onboarded"}
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{kpis.hired}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-6 min-h-[680px]">
        {/* List View */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-200/80 dark:border-white/10 space-y-3 bg-zinc-50/70 dark:bg-zinc-900/50">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute start-3 top-3 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder={isAr ? "بحث بالاسم، الإيميل، الوظيفة..." : "Search name, email, role..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-white/10 rounded-xl ps-9 pe-8 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute end-2.5 top-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role & Status Filter Row */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-purple-500 truncate cursor-pointer"
              >
                <option value="ALL">{isAr ? "جميع الوظائف" : "All Roles"}</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="ALL">{isAr ? "جميع الحالات" : "All Status"}</option>
                <option value="NEW">{isAr ? "جديد" : "New"}</option>
                <option value="REVIEWING">{isAr ? "قيد المراجعة" : "Reviewing"}</option>
                <option value="INTERVIEW">{isAr ? "مقابلة" : "Interview"}</option>
                <option value="HIRED">{isAr ? "تم التعيين" : "Hired"}</option>
                <option value="REJECTED">{isAr ? "مرفوض" : "Rejected"}</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-white/5">
            {filteredApplications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                {searchQuery || statusFilter !== "ALL" || roleFilter !== "ALL"
                  ? isAr
                    ? "لا توجد طلبات تطابق الفلتر المحدد."
                    : "No applications match your filter."
                  : isAr
                  ? "لا توجد طلبات تقديم حتى الآن."
                  : "No applications found."}
              </div>
            ) : (
              filteredApplications.map((app) => {
                const rankInfo = rankingsMap.get(app.id);
                const isSelected = selectedAppId === app.id;
                const initials = getInitials(app.firstName, app.lastName);

                return (
                  <button
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`w-full text-start p-3.5 transition-all cursor-pointer relative group flex items-start gap-3 ${
                      isSelected
                        ? "bg-purple-50/90 dark:bg-purple-950/40 border-s-4 border-s-purple-600 dark:border-s-purple-500 shadow-2xs"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border-s-4 border-s-transparent"
                    }`}
                  >
                    {/* Initials Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-black/5 dark:ring-white/10 mt-0.5">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                          {app.firstName} {app.lastName}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border shrink-0 ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center justify-between gap-2">
                        <span className="truncate">{app.jobTitle}</span>
                        {rankInfo && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1 shrink-0 ${
                              rankInfo.rank === 1
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
                            }`}
                            title={`Score: ${rankInfo.matchScore}%`}
                          >
                            <Award className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                            <span>#{rankInfo.rank} · {rankInfo.matchScore}%</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                        <span className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 px-2 py-0.5 rounded text-[9px] text-zinc-600 dark:text-zinc-400 font-medium">
                          {app.portal}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="w-full lg:w-2/3 bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-xs">
          {selectedApp ? (
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white font-black text-base flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20 ring-2 ring-purple-500/30">
                    {getInitials(selectedApp.firstName, selectedApp.lastName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                        {selectedApp.firstName} {selectedApp.lastName}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{isAr ? "ملف معتمد" : "Verified Dossier"}</span>
                      </span>
                    </div>
                    <p className="text-purple-700 dark:text-purple-400 font-semibold text-xs sm:text-sm mt-0.5">
                      {selectedApp.jobTitle}{" "}
                      {selectedApp.department ? `· ${selectedApp.department}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={selectedApp.status}
                    onChange={(e) => handleUpdateStatus(selectedApp.id, e.target.value)}
                    disabled={updating}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 dark:text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    <option value="NEW">{isAr ? "جديد" : "New"}</option>
                    <option value="REVIEWING">{isAr ? "قيد المراجعة" : "Reviewing"}</option>
                    <option value="INTERVIEW">{isAr ? "مقابلة" : "Interview"}</option>
                    <option value="HIRED">{isAr ? "تم التعيين" : "Hired"}</option>
                    <option value="REJECTED">{isAr ? "مرفوض" : "Rejected"}</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleOpenScheduleModal}
                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isAr ? "جدولة مقابلة" : "Interview"}</span>
                  </button>

                  {/* Prominent In-browser CV & Dossier Preview Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewModalCandidate(selectedApp)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-500 dark:hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                    title={isAr ? "معاينة السيرة الذاتية والملف التنفيذي" : "Preview CV Document & Executive Dossier"}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isAr ? "معاينة CV" : "Preview CV"}</span>
                  </button>

                  {/* Download CV File */}
                  <a
                    href={
                      selectedApp.cvUrl?.startsWith("http")
                        ? selectedApp.cvUrl
                        : `/api/upload/download?pathname=${encodeURIComponent(selectedApp.cvUrl)}&applicationId=${selectedApp.id}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center px-3 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 me-1.5 text-purple-600 dark:text-purple-400" /> {isAr ? "تحميل" : "Download"}
                  </a>

                  {/* Single Clean Live Re-Analyze Action */}
                  <button
                    type="button"
                    onClick={() => handleParseCV(selectedApp.id)}
                    disabled={parsing}
                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-purple-600 dark:text-purple-400 ${parsing ? "animate-spin" : ""}`} />
                    <span>
                      {parsing
                        ? isAr ? "جاري التحليل..." : "Analyzing..."
                        : selectedApp.cvParsedData
                        ? isAr ? "إعادة التحليل" : "Re-Analyze"
                        : isAr ? "تحليل ذكي" : "AI Parse"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Candidate Category Leaderboard & AI Ranking Banner */}
              {selectedAppRank && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/50 dark:from-purple-950/40 dark:via-zinc-900 dark:to-zinc-900 border border-purple-200/80 dark:border-purple-800/40 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-black text-lg shadow-2xs ${
                          selectedAppRank.rank === 1
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 ring-2 ring-amber-500/20"
                            : "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40 ring-2 ring-purple-500/20"
                        }`}
                      >
                        #{selectedAppRank.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                            {isAr ? "تصنيف المترشحين لنفس الوظيفة" : "Category Candidate Ranking"}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200 border border-purple-500/30 font-mono">
                            {selectedAppRank.tierLabel}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                          {isAr
                            ? `المرتبة #${selectedAppRank.rank} من أصل ${selectedAppRank.totalCandidates} متقدمين لوظيفة "${selectedApp.jobTitle}"`
                            : `Rank #${selectedAppRank.rank} of ${selectedAppRank.totalCandidates} Applicants in "${selectedApp.jobTitle}"`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 bg-white/90 dark:bg-zinc-950/80 px-4 py-2.5 rounded-xl border border-zinc-200/80 dark:border-white/10 shadow-2xs">
                      <div className="text-end">
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold">
                          {isAr ? "نسبة التطابق الذكي" : "AI Match Score"}
                        </div>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {selectedAppRank.matchScore}%
                        </div>
                      </div>
                      <div className="h-8 w-px bg-zinc-200 dark:bg-white/10" />
                      <div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold">
                          {isAr ? "التوصية" : "AI Decision"}
                        </div>
                        <div className="text-xs font-bold text-purple-700 dark:text-purple-300">
                          {selectedAppRank.recommendation.replace("_", " ")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Factor Breakdown Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-zinc-200/80 dark:border-white/10 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200/70 dark:border-white/5 space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span>{isAr ? "تطابق المهارات:" : "Skills Match:"}</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedAppRank.scoreBreakdown.skillsMatch}/40</strong>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(selectedAppRank.scoreBreakdown.skillsMatch / 40) * 100}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200/70 dark:border-white/5 space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span>{isAr ? "سنوات الخبرة:" : "Experience:"}</span>
                        <strong className="text-blue-600 dark:text-blue-400 font-bold">{selectedAppRank.scoreBreakdown.experienceScore}/30</strong>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(selectedAppRank.scoreBreakdown.experienceScore / 30) * 100}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200/70 dark:border-white/5 space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span>{isAr ? "مرحلة التقييم:" : "Stage Level:"}</span>
                        <strong className="text-purple-600 dark:text-purple-400 font-bold">{selectedAppRank.scoreBreakdown.stageProgressScore}/20</strong>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(selectedAppRank.scoreBreakdown.stageProgressScore / 20) * 100}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200/70 dark:border-white/5 space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span>{isAr ? "اكتمال الملف:" : "Profile Data:"}</span>
                        <strong className="text-amber-600 dark:text-amber-400 font-bold">{selectedAppRank.scoreBreakdown.completenessScore}/10</strong>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(selectedAppRank.scoreBreakdown.completenessScore / 10) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-white/10 shadow-2xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-950/80 border border-zinc-200/60 dark:border-white/5 shadow-2xs">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{isAr ? "البريد الإلكتروني" : "Email"}</div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{selectedApp.email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedApp.email, "email")}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {copiedField === "email" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-950/80 border border-zinc-200/60 dark:border-white/5 shadow-2xs">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{isAr ? "رقم الهاتف" : "Phone"}</div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{selectedApp.phone || (isAr ? "غير متوفر" : "N/A")}</div>
                    </div>
                  </div>
                  {selectedApp.phone && (
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedApp.phone, "phone")}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {copiedField === "phone" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-zinc-950/80 border border-zinc-200/60 dark:border-white/5 shadow-2xs">
                  <Building className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{isAr ? "مصدر التقديم" : "Applied via"}</div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-white">{selectedApp.portal} {isAr ? "بوابة" : "Portal"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-zinc-950/80 border border-zinc-200/60 dark:border-white/5 shadow-2xs">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{isAr ? "تاريخ التقديم" : "Applied on"}</div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-white">{new Date(selectedApp.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Scheduled Interviews Drawer Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                      {isAr ? "جدول المقابلات المسجلة" : "Scheduled Candidate Interviews"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenScheduleModal}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? "إضافة جولة مقابلة" : "Add Interview Round"}</span>
                  </button>
                </div>

                {selectedAppInterviews.length > 0 ? (
                  <div className="space-y-3">
                    {selectedAppInterviews.map((item: any, idx: number) => (
                      <div
                        key={item.id || idx}
                        className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white">{item.roundName || "Interview Round"}</span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold">
                              {item.format}
                            </span>
                            {item.status === "RESCHEDULE_REQUESTED" && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                                {isAr ? "طلب إعادة جدولة من المترشح" : "Reschedule Requested by Candidate"}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                            {new Date(item.scheduledAt).toLocaleString(isAr ? "ar-QA" : "en-US", { dateStyle: "short", timeStyle: "short" })}
                          </span>
                        </div>

                        {item.rescheduleReason && (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300">
                            <span className="font-bold">{isAr ? "مبرر طلب التأجيل: " : "Candidate Reschedule Note: "}</span>
                            {item.rescheduleReason}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                          <div className="flex items-center gap-2">
                            {item.meetingUrl && (
                              <a
                                href={item.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 dark:text-purple-400 hover:underline font-mono flex items-center gap-1"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>{item.meetingUrl}</span>
                              </a>
                            )}
                            {item.location && <span>📍 {item.location}</span>}
                          </div>
                          <span>Duration: {item.durationMinutes || 45} mins</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-dashed border-zinc-200 dark:border-white/10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    {isAr ? "لم يتم جدولة مقابلات بعد. اضغط 'جدولة مقابلة' لإرسال موعد للمترشح." : "No interviews scheduled yet. Click 'Schedule Interview' to book a slot with the candidate."}
                  </div>
                )}
              </div>

              {/* Parsed Data / AI Analysis */}
              <div className="space-y-4">
                {(() => {
                  const engine = selectedApp.cvParsedData?.aiEngine || '';
                  const isGemini = engine.toLowerCase().includes('gemini');
                  const isLegacy = isLegacySimulatedMock(selectedApp.cvParsedData, selectedApp.jobTitle);

                  return (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200/80 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                            {isAr ? "التحليل الذكي لملف المترشح" : "AI Candidate Analysis"}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          {isGemini ? (
                            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50 flex items-center gap-1.5 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Live Gemini AI ({engine})</span>
                            </span>
                          ) : engine === 'e3-domain-engine' ? (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50 flex items-center gap-1.5 shadow-2xs" title="Synthesized domain profile fallback">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>{isAr ? "محاكاة خوارزمية (بديل)" : "Simulated (Domain Fallback)"}</span>
                            </span>
                          ) : engine ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 flex items-center gap-1.5 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                              {engine}
                            </span>
                          ) : isLegacy ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              {isAr ? "محاكاة تجريبية قديمة" : "Legacy Simulated"}
                            </span>
                          ) : null}

                          <button
                            onClick={() => handleParseCV(selectedApp.id)}
                            disabled={parsing}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                          >
                            <Sparkles className={`w-3.5 h-3.5 text-purple-200 ${parsing ? "animate-spin" : ""}`} />
                            <span>
                              {parsing
                                ? (isAr ? "جاري الاتصال بـ Gemini..." : "Calling Gemini AI...")
                                : selectedApp.cvParsedData
                                ? (isAr ? "إعادة التحليل (Gemini AI)" : "Re-Analyze (Gemini AI)")
                                : (isAr ? "بدء التحليل (Gemini AI)" : "Run Live Analysis (Gemini)")}
                            </span>
                          </button>
                        </div>
                      </div>

                      {(!isGemini || isLegacy) && (
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1 text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                            <span className="font-bold text-amber-900 dark:text-amber-300">
                              {isAr ? "ملاحظة التقرير: " : "Report Status: "}
                            </span>
                            {isAr
                              ? "هذا السجل يستخدم حالياً بيانات محاكاة أو لم يكتمل تحليله بواسطة Gemini AI المباشر. اضغط على 'إعادة التحليل (Gemini AI)' لتوليد تقرير فوري مباشر."
                              : "This application is currently using simulated domain fallback data. Click 'Re-Analyze (Gemini AI)' above to run live Gemini AI extraction on this candidate's uploaded resume."}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
                
                {selectedApp.cvParsedData ? (
                  <div className="space-y-5">
                    {/* Executive summary */}
                    <div className="p-5 bg-gradient-to-br from-purple-50/60 to-zinc-50 dark:from-purple-950/30 dark:to-zinc-900 border border-purple-200/80 dark:border-purple-800/30 rounded-2xl shadow-2xs space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{isAr ? "الملخص التنفيذي" : "Executive Summary"}</span>
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed font-normal">
                        {selectedApp.cvParsedData.summary}
                      </p>
                    </div>

                    {/* Verified Career Timeline (if available) */}
                    {Array.isArray(selectedApp.cvParsedData.careerHistory) && selectedApp.cvParsedData.careerHistory.length > 0 && (
                      <div className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-white/10 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-white/10">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                              {isAr ? "المسار المهني والمشروعات الميدانية" : "Career Track & Notable Venue Milestones"}
                            </h4>
                          </div>
                        </div>

                        <div className="space-y-3 pt-1">
                          {selectedApp.cvParsedData.careerHistory.map((item: any, hIdx: number) => (
                            <div key={hIdx} className="relative ps-5 border-s-2 border-purple-500/30 pb-3 last:pb-0">
                              <span className="absolute -start-[5px] top-1.5 w-2 h-2 rounded-full bg-purple-500" />
                              <div className="flex justify-between items-baseline gap-2">
                                <h5 className="text-xs font-bold text-zinc-900 dark:text-white">{item.title || item.role}</h5>
                                <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/40">
                                  {item.period}
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {item.company} {item.location ? `· ${item.location}` : ""}
                              </div>
                              {Array.isArray(item.highlights) && (
                                <ul className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-300 list-disc ps-4 space-y-0.5">
                                  {item.highlights.map((h: string, hi: number) => (
                                    <li key={hi}>{h}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-zinc-50/70 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-white/10 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/80 dark:border-white/10 mb-3">
                          <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">{isAr ? "المهارات المستخرجة" : "Extracted Skills"}</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedApp.cvParsedData.skills || []).map((skill: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-xs rounded-xl text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-800/30 shadow-2xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-zinc-50/70 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-white/10 rounded-2xl shadow-2xs">
                          <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{isAr ? "سنوات الخبرة" : "Years of Experience"}</h4>
                          <p className="text-2xl font-black text-zinc-900 dark:text-white">{selectedApp.cvParsedData.experienceYears} {isAr ? "سنوات" : "Years"}</p>
                        </div>
                        <div className="p-4 bg-zinc-50/70 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-white/10 rounded-2xl shadow-2xs">
                          <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{isAr ? "المؤهل التعليمي" : "Education"}</h4>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{selectedApp.cvParsedData.education}</p>
                          {selectedApp.cvParsedData.university && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{selectedApp.cvParsedData.university}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-white/10 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50">
                    <FileText className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
                    <h4 className="text-zinc-900 dark:text-white font-medium mb-2">{isAr ? "لم يتم تحليل السيرة الذاتية بعد" : "CV Not Parsed Yet"}</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                      {isAr
                        ? "استخدم محلل الذكاء الاصطناعي لاستخراج المهارات وسنوات الخبرة وتوليد ملخص تنفيذي من ملف السيرة الذاتية المرفوع."
                        : "Use the AI parser to automatically extract skills, years of experience, and generate an executive summary from the uploaded CV document."}
                    </p>
                    <AdminButton variant="outline" onClick={() => handleParseCV(selectedApp.id)} disabled={parsing}>
                      <Cpu className="w-4 h-4 me-2" /> {parsing ? (isAr ? "جاري التحليل..." : "Analyzing CV...") : (isAr ? "بدء التحليل الذكي" : "Run AI Analysis")}
                    </AdminButton>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 p-8">
              <FileText className="w-16 h-16 text-zinc-300 dark:text-zinc-800 mb-4" />
              <p>{isAr ? "حدد طلباً من القائمة لعرض تفاصيله الكاملة." : "Select an application to view details."}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recruiter Schedule Interview Modal Dialog */}
      {isScheduleModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {isAr ? "جدولة مقابلة للمترشح" : "Schedule Candidate Interview"}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {selectedApp.firstName} {selectedApp.lastName} • {selectedApp.jobTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-700 dark:text-zinc-300 font-bold block">
                  {isAr ? "مسمى الجولة / التقييم *" : "Round Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={scheduleRoundName}
                  onChange={(e) => setScheduleRoundName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-bold block">
                    {isAr ? "طبيعة المقابلة" : "Format"}
                  </label>
                  <select
                    value={scheduleFormat}
                    onChange={(e) => setScheduleFormat(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="VIRTUAL">{isAr ? "افتراضية (مكالمة مرئية)" : "Virtual Video Call"}</option>
                    <option value="IN_PERSON">{isAr ? "حضور شخصي في المقر" : "In-Person (HQ)"}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-bold block">
                    {isAr ? "المدة المقدرة (بالدقائق)" : "Duration (Minutes)"}
                  </label>
                  <select
                    value={scheduleDuration}
                    onChange={(e) => setScheduleDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-700 dark:text-zinc-300 font-bold block">
                  {isAr ? "التاريخ والوقت بتوقيت الدوحة *" : "Date & Time (Doha AST) *"}
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {scheduleFormat === "VIRTUAL" ? (
                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-bold block">
                    {isAr ? "رابط المقابلة المرئية (Google Meet / Teams) *" : "Video Meeting URL *"}
                  </label>
                  <input
                    type="url"
                    required
                    value={scheduleMeetingUrl}
                    onChange={(e) => setScheduleMeetingUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-bold block">
                    {isAr ? "عنوان المقر أو القاعة *" : "Physical Location / Room *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleLocation}
                    onChange={(e) => setScheduleLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-zinc-700 dark:text-zinc-300 font-bold block">
                  {isAr ? "لجنة المقابلة (مفصولة بفواصل)" : "Interviewers (Comma-separated)"}
                </label>
                <input
                  type="text"
                  value={scheduleInterviewers}
                  onChange={(e) => setScheduleInterviewers(e.target.value)}
                  placeholder="e.g., Jane Doe, John Smith"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-700 dark:text-zinc-300 font-bold block">
                  {isAr ? "ملاحظات إضافية للمترشح (اختياري)" : "Instructions / Notes for Candidate (Optional)"}
                </label>
                <textarea
                  rows={2}
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="e.g. Please bring your portfolio reel..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={isScheduling}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-500 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isScheduling ? (isAr ? "جاري الحفظ..." : "Scheduling...") : (isAr ? "تأكيد وإرسال الموعد" : "Confirm & Dispatch")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-browser CV Document Preview Modal */}
      <CvPreviewModal
        isOpen={Boolean(previewModalCandidate)}
        onClose={() => setPreviewModalCandidate(null)}
        candidate={previewModalCandidate}
        rankingInfo={previewModalCandidate ? rankingsMap.get(previewModalCandidate.id) : null}
        locale={locale}
      />
    </DashboardPageShell>
  );
}
