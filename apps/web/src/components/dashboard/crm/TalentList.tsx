"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  FileText,
  UserCheck,
  Trash2,
  XCircle,
  Star,
  Cpu,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  Award,
  Filter,
  Columns,
  List,
  Sparkles,
  Briefcase,
  Layers,
  ArrowRight,
  Clock,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";
import { AdminButton } from "@/components/dashboard/ui/AdminButton";
import { SlideOver } from "@/components/dashboard/ui/SlideOver";
import { TalentDetail, type Talent } from "./TalentDetail";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { computeCategoryFitAndRank } from "@/lib/careers/ai-cv-parser";
import { CvPreviewModal } from "@/components/dashboard/careers/CvPreviewModal";

interface TalentListProps {
  initialTalent: Talent[];
  availableJobs?: Array<{ id: string; title: string; department?: string | null; location?: string | null }>;
  locale?: string;
}

const PIPELINE_STAGES = [
  { id: "NEW", labelEn: "New Submissions", labelAr: "طلبات جديدة", color: "border-blue-500/30 bg-blue-500/5 text-blue-400" },
  { id: "SCREENING", labelEn: "Screening", labelAr: "قيد الفرز والتقييم", color: "border-amber-500/30 bg-amber-500/5 text-amber-400" },
  { id: "INTERVIEW", labelEn: "Interview", labelAr: "مرحلة المقابلة", color: "border-purple-500/30 bg-purple-500/5 text-purple-400" },
  { id: "OFFERED", labelEn: "Offer Stage", labelAr: "تقديم العرض", color: "border-indigo-500/30 bg-indigo-500/5 text-indigo-400" },
  { id: "HIRED", labelEn: "Hired", labelAr: "تم التعيين", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" },
  { id: "REJECTED", labelEn: "Archived", labelAr: "مستبعد / محفوظ", color: "border-zinc-700 bg-zinc-800/40 text-zinc-400" },
];

export function TalentList({
  initialTalent,
  availableJobs = [],
  locale = "en",
}: TalentListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isAr = locale === "ar";

  const [talent, setTalent] = useState<Talent[]>(initialTalent);
  const [activeView, setActiveView] = useState<"KANBAN" | "LEADERBOARD" | "INGEST">("KANBAN");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [jobFilter, setJobFilter] = useState("ALL");
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null);
  const [previewCandidate, setPreviewCandidate] = useState<any | null>(null);

  // Ingestion studio form state
  const [ingestForm, setIngestForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: availableJobs.length > 0 ? availableJobs[0].title : "Event Operations Specialist",
    department: availableJobs.length > 0 ? availableJobs[0].department || "Operations" : "Operations",
    notes: "",
    resumeUrl: "",
    status: "NEW",
  });
  const [isIngesting, setIsIngesting] = useState(false);

  const getInitials = (name: string) => {
    const parts = (name || "").trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return ((name || "")[0] || "C").toUpperCase();
  };

  // Precompute rankings across entire pool
  const rankingsMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const t of talent) {
      const rank = computeCategoryFitAndRank(
        { ...t, jobTitle: t.position || t.job?.title },
        talent.map((other) => ({ ...other, jobTitle: other.position || other.job?.title }))
      );
      map.set(t.id, rank);
    }
    return map;
  }, [talent]);

  // Distinct roles for filter
  const allRoles = useMemo(() => {
    const set = new Set<string>();
    talent.forEach((t) => {
      const p = t.position || t.job?.title;
      if (p) set.add(p);
    });
    return Array.from(set);
  }, [talent]);

  // Filtered talent items
  const filtered = useMemo(() => {
    return talent.filter((t) => {
      const targetRole = t.position || t.job?.title || "";
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase()) ||
        targetRole.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
      const matchesJob = jobFilter === "ALL" || targetRole === jobFilter;

      return matchesSearch && matchesStatus && matchesJob;
    });
  }, [talent, search, statusFilter, jobFilter]);

  // Fast status updater
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/crm/talent/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();

      setTalent((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
      toast(isAr ? "تم تحديث مرحلة المترشح" : "Candidate stage updated", "success");
    } catch {
      toast(isAr ? "فشل تحديث الحالة" : "Failed to update status", "error");
    }
  };

  // Instant AI Ingestion Handler
  const handleRunIngestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestForm.name.trim() || !ingestForm.email.trim()) {
      toast(isAr ? "يرجى كتابة الاسم والبريد الإلكتروني" : "Name and email are required", "error");
      return;
    }

    setIsIngesting(true);
    try {
      // 1. Post candidate to CRM talent endpoint
      const res = await fetch("/api/crm/talent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ingestForm.name.trim(),
          email: ingestForm.email.trim(),
          phone: ingestForm.phone.trim() || undefined,
          position: ingestForm.position,
          department: ingestForm.department,
          experienceLevel: "Mid-Senior",
          status: "NEW",
          notes: ingestForm.notes.trim() || undefined,
          resumeUrl: ingestForm.resumeUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to create candidate");
      }

      const newCand = await res.json();

      // Append to list with instant local state reflection
      setTalent((prev) => [
        {
          ...newCand,
          appliedDate: new Date().toISOString(),
          job: { title: ingestForm.position },
          source: "AI_INGESTION_STUDIO",
        },
        ...prev,
      ]);

      toast(
        isAr
          ? `تم تحليل واستيعاب المترشح (${ingestForm.name}) بنجاح في خط التوظيف.`
          : `Candidate ${ingestForm.name} ingested and parsed with AI!`,
        "success"
      );

      // Reset ingestion form and switch to Kanban
      setIngestForm({
        name: "",
        email: "",
        phone: "",
        position: availableJobs.length > 0 ? availableJobs[0].title : "Event Operations Specialist",
        department: availableJobs.length > 0 ? availableJobs[0].department || "Operations" : "Operations",
        notes: "",
        resumeUrl: "",
        status: "NEW",
      });
      setActiveView("KANBAN");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to ingest candidate", "error");
    } finally {
      setIsIngesting(false);
    }
  };

  // Metric computations
  const totalCount = talent.length;
  const inPipelineCount = talent.filter((t) => ["SCREENING", "INTERVIEW", "OFFERED"].includes(t.status)).length;
  const topMatchCount = Array.from(rankingsMap.values()).filter((r) => r.matchScore >= 80).length;
  const hiredCount = talent.filter((t) => t.status === "HIRED").length;

  const selectedTalent = talent.find((t) => t.id === selectedTalentId);

  return (
    <DashboardPageShell variant="wide">
      {/* Page Header */}
      <DashboardPageHeader
        title={isAr ? "مركز استقطاب المواهب والتوظيف الذكي" : "Talent Acquisition & AI Hub"}
        description={
          isAr
            ? "لوحة التوظيف الشاملة: مسار المترشحين، التقييم المقارن بالذكاء الاصطناعي، واستيعاب السير الذاتية."
            : "Unified candidate tracking pipeline, category comparative ranking, and instant AI resume ingestion."
        }
        breadcrumbs={[
          { label: isAr ? "الموارد البشرية" : "HR & Talent", href: `/${locale}/dashboard/crm/talent` },
          { label: isAr ? "استقطاب المواهب" : "Talent Acquisition" },
        ]}
        badge={{
          label: `${totalCount} ${isAr ? "مرشح" : "Candidates"}`,
          variant: "indigo",
        }}
        primaryAction={{
          label: isAr ? "إضافة / استيعاب مرشح ذكي" : "AI Candidate Intake",
          onClick: () => setActiveView("INGEST"),
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      {/* Quick Navigation Hub for HR & Recruitment Suite */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[var(--surface-hover)]/40 border border-[var(--border-level-1)] mt-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-3">
            {isAr ? "مركز التوظيف:" : "Recruitment Suite:"}
          </span>

          <Link
            href={`/${locale}/dashboard/crm/talent`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "استقطاب المواهب و AI" : "Talent Acquisition & AI Hub"}</span>
          </Link>

          <Link
            href={`/${locale}/dashboard/careers/applications`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-level-1)] transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? "طلبات التوظيف ومعاينة CV" : "Job Applications & CVs"}</span>
          </Link>

          <Link
            href={`/${locale}/dashboard/careers`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-level-1)] transition-all"
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isAr ? "شواغر الوظائف" : "Careers & Openings"}</span>
          </Link>

          <Link
            href={`/${locale}/dashboard/team`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-level-1)] transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? "دليل فريق العمل (A4 PDF)" : "Team Directory (A4 PDF)"}</span>
          </Link>
        </div>
      </div>

      {/* Recruiter KPI Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              {isAr ? "إجمالي بنك المواهب" : "Talent Pool Size"}
            </div>
            <div className="text-2xl font-black text-[var(--text-primary)] mt-1">{totalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              {isAr ? "في مرحلة الفرز والمقابلة" : "Active In Pipeline"}
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">{inPipelineCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              {isAr ? "نخبة التطابق الذكي (+80%)" : "Top AI Matches"}
            </div>
            <div className="text-2xl font-black text-purple-400 mt-1">{topMatchCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              {isAr ? "تم التعيين بنجاح" : "Hired & Onboarded"}
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{hiredCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Navigation & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] flex flex-col md:flex-row items-center justify-between gap-4 mt-6 shadow-sm">
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveView("KANBAN")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === "KANBAN"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-default)]"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{isAr ? "مراحل المسار (Kanban)" : "Pipeline Board"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("LEADERBOARD")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === "LEADERBOARD"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-default)]"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{isAr ? "المتصدرون حسب التخصص" : "Category Leaderboard"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("INGEST")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === "INGEST"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-default)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? "استوديو الاستيعاب الذكي" : "AI Ingest Studio"}</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 absolute start-3 top-3 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder={isAr ? "بحث بالاسم أو التخصص..." : "Search candidates..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-1)] rounded-xl ps-8 pe-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--surface-hover)] border border-[var(--border-level-1)] rounded-xl text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="ALL">{isAr ? "كل الوظائف" : "All Positions"}</option>
            {allRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Body Switcher */}
      <div className="mt-6">
        {/* VIEW 1: PIPELINE KANBAN */}
        {activeView === "KANBAN" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
            {PIPELINE_STAGES.map((stage) => {
              const stageCandidates = filtered.filter((t) => t.status === stage.id);

              return (
                <div
                  key={stage.id}
                  className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-3 flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-level-1)] mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full border ${stage.color}`} />
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {isAr ? stage.labelAr : stage.labelEn}
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)]">
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Candidate Cards List */}
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {stageCandidates.map((cand) => {
                      const rankInfo = rankingsMap.get(cand.id);
                      const roleName = cand.position || cand.job?.title || "Professional";
                      const initials = getInitials(cand.name);

                      return (
                        <div
                          key={cand.id}
                          className="p-3.5 rounded-2xl bg-[var(--surface-hover)]/80 border border-[var(--border-level-1)] hover:border-purple-500/40 hover:shadow-lg transition-all space-y-3 group"
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-sm ring-1 ring-white/10">
                                {initials}
                              </div>
                              <h4
                                onClick={() => setSelectedTalentId(cand.id)}
                                className="font-bold text-xs text-[var(--text-primary)] hover:text-purple-400 cursor-pointer truncate"
                              >
                                {cand.name}
                              </h4>
                            </div>

                            {rankInfo && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1 shrink-0 ${
                                  rankInfo.rank === 1
                                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                    : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                                }`}
                              >
                                <Award className="w-2.5 h-2.5" />
                                <span>#{rankInfo.rank} · {rankInfo.matchScore}%</span>
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1 truncate">
                            <Briefcase className="w-3 h-3 text-[var(--text-tertiary)] shrink-0" />
                            <span className="truncate font-medium">{roleName}</span>
                          </div>

                          {cand.skills && Array.isArray(cand.skills) && cand.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {cand.skills.slice(0, 3).map((sk: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-[9px] px-2 py-0.5 rounded-lg bg-[var(--surface-default)] text-purple-300 border border-purple-500/20 truncate max-w-[120px] font-medium"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="pt-2.5 border-t border-[var(--border-level-1)]/60 flex items-center justify-between text-[10px]">
                            {/* CV Preview Trigger */}
                            {cand.resumeUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewCandidate({
                                    id: cand.id,
                                    firstName: cand.name.split(" ")[0] || cand.name,
                                    lastName: cand.name.split(" ").slice(1).join(" ") || "",
                                    jobTitle: roleName,
                                    email: cand.email,
                                    phone: cand.phone,
                                    cvUrl: cand.resumeUrl,
                                    cvParsedData: cand.cvParsedData,
                                    status: cand.status,
                                    createdAt: cand.appliedDate,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-400 border border-indigo-500/30 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>{isAr ? "معاينة CV" : "Preview"}</span>
                              </button>
                            ) : (
                              <span className="text-[var(--text-tertiary)]">{isAr ? "بدون ملف" : "No CV"}</span>
                            )}

                            {/* Stage advance dropdown */}
                            <select
                              value={cand.status}
                              onChange={(e) => updateStatus(cand.id, e.target.value)}
                              className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-2 py-1 text-[10px] text-[var(--text-primary)] font-bold focus:outline-none cursor-pointer"
                            >
                              {PIPELINE_STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {isAr ? s.labelAr : s.labelEn}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}

                    {stageCandidates.length === 0 && (
                      <div className="py-12 text-center text-[var(--text-tertiary)] text-[11px]">
                        {isAr ? "فارغ" : "Empty"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: CATEGORY LEADERBOARD & COMPARATIVE RANKING */}
        {activeView === "LEADERBOARD" && (
          <div className="space-y-6">
            {allRoles.map((roleName) => {
              const roleCandidates = filtered.filter(
                (t) => (t.position || t.job?.title) === roleName
              );
              if (roleCandidates.length === 0) return null;

              // Sort by match score descending
              const sorted = [...roleCandidates].sort((a, b) => {
                const scoreA = rankingsMap.get(a.id)?.matchScore || 0;
                const scoreB = rankingsMap.get(b.id)?.matchScore || 0;
                return scoreB - scoreA;
              });

              return (
                <div
                  key={roleName}
                  className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="p-4 bg-[var(--surface-hover)]/60 border-b border-[var(--border-level-1)] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[var(--text-primary)]">{roleName}</h3>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          {sorted.length} {isAr ? "مترشحين قيد المقارنة" : "Candidates in Category"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-start text-xs whitespace-nowrap">
                      <thead className="bg-[var(--surface-default)] border-b border-[var(--border-level-1)] text-[var(--text-secondary)] font-bold">
                        <tr>
                          <th className="p-3 text-start">{isAr ? "الترتيب" : "Rank"}</th>
                          <th className="p-3 text-start">{isAr ? "اسم المترشح" : "Candidate"}</th>
                          <th className="p-3 text-start">{isAr ? "التطابق الذكي" : "AI Match"}</th>
                          <th className="p-3 text-start">{isAr ? "تصنيف الفئة" : "Tier"}</th>
                          <th className="p-3 text-start">{isAr ? "مرحلة التوظيف" : "Stage"}</th>
                          <th className="p-3 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-level-1)]">
                        {sorted.map((cand, idx) => {
                          const rankInfo = rankingsMap.get(cand.id);

                          return (
                            <tr key={cand.id} className="hover:bg-[var(--surface-hover)]/40 transition-colors">
                              <td className="p-3 font-black">
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                                    idx === 0
                                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                      : "bg-[var(--surface-hover)] text-[var(--text-secondary)]"
                                  }`}
                                >
                                  #{idx + 1}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-[var(--text-primary)]">{cand.name}</div>
                                <div className="text-[11px] text-[var(--text-secondary)]">{cand.email}</div>
                              </td>
                              <td className="p-3 font-bold text-emerald-400">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-[var(--surface-hover)] rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-emerald-400 h-full rounded-full"
                                      style={{ width: `${rankInfo?.matchScore || 65}%` }}
                                    />
                                  </div>
                                  <span>{rankInfo?.matchScore || 65}%</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                  {rankInfo?.tierLabel || "Strong Fit"}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                                  {cand.status}
                                </span>
                              </td>
                              <td className="p-3 text-end">
                                <div className="inline-flex items-center gap-2">
                                  {cand.resumeUrl && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewCandidate({
                                          id: cand.id,
                                          firstName: cand.name.split(" ")[0] || cand.name,
                                          lastName: cand.name.split(" ").slice(1).join(" ") || "",
                                          jobTitle: roleName,
                                          email: cand.email,
                                          phone: cand.phone,
                                          cvUrl: cand.resumeUrl,
                                          cvParsedData: cand.cvParsedData,
                                          status: cand.status,
                                          createdAt: cand.appliedDate,
                                        })
                                      }
                                      className="px-2.5 py-1 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-default)] flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <Eye className="w-3 h-3 text-indigo-400" />
                                      <span>{isAr ? "معاينة" : "Preview"}</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTalentId(cand.id)}
                                    className="px-2.5 py-1 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-default)] cursor-pointer transition-colors"
                                  >
                                    {isAr ? "تفاصيل" : "Profile"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 3: AI RESUME SCANNER & INGESTION STUDIO */}
        {activeView === "INGEST" && (
          <div className="max-w-3xl mx-auto bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-level-1)]">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {isAr ? "استوديو استيعاب المترشحين وتحليل السير الذاتية بالذكاء الاصطناعي" : "AI Candidate Ingestion Studio"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isAr
                    ? "إضافة مرشح جديد مباشرة أو استيعاب ملف سيرة ذاتية خارجي وربطه بمسار التوظيف مع التقييم الفوري."
                    : "Add external candidate CVs directly, run immediate domain AI analysis, and score against target job openings."}
                </p>
              </div>
            </div>

            <form onSubmit={handleRunIngestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">
                    {isAr ? "اسم المرشح الكامل *" : "Candidate Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={ingestForm.name}
                    onChange={(e) => setIngestForm({ ...ingestForm, name: e.target.value })}
                    placeholder="e.g. Tariq Al-Mansoori"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">
                    {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={ingestForm.email}
                    onChange={(e) => setIngestForm({ ...ingestForm, email: e.target.value })}
                    placeholder="candidate@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">
                    {isAr ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={ingestForm.phone}
                    onChange={(e) => setIngestForm({ ...ingestForm, phone: e.target.value })}
                    placeholder="+974 5555 1234"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">
                    {isAr ? "الوظيفة المستهدفة *" : "Target Position / Category *"}
                  </label>
                  <select
                    value={ingestForm.position}
                    onChange={(e) => {
                      const selJob = availableJobs.find((j) => j.title === e.target.value);
                      setIngestForm({
                        ...ingestForm,
                        position: e.target.value,
                        department: selJob?.department || ingestForm.department,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-sm"
                  >
                    {availableJobs.map((j) => (
                      <option key={j.id} value={j.title}>
                        {j.title} ({j.department || "Operations"})
                      </option>
                    ))}
                    <option value="Event Operations Lead">Event Operations Lead</option>
                    <option value="Kinetic AV Systems Engineer">Kinetic AV Systems Engineer</option>
                    <option value="Senior Spatial & 3D Designer">Senior Spatial & 3D Designer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  {isAr ? "رابط السيرة الذاتية (URL / PDF)" : "Resume / CV Document URL"}
                </label>
                <input
                  type="url"
                  value={ingestForm.resumeUrl}
                  onChange={(e) => setIngestForm({ ...ingestForm, resumeUrl: e.target.value })}
                  placeholder="https://.../resume.pdf"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  {isAr ? "ملاحظات التقييم الأولي / ملخص الخبرات" : "Candidate Background Notes & Qualifications"}
                </label>
                <textarea
                  rows={4}
                  value={ingestForm.notes}
                  onChange={(e) => setIngestForm({ ...ingestForm, notes: e.target.value })}
                  placeholder={
                    isAr
                      ? "اكتب هنا نبذة عن خبرات المترشح السابقة، المشروعات التي شارك بها، أو مؤهلاته الفنية..."
                      : "Paste candidate background highlights, notable projects delivered, or technical competencies..."
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-xs"
                />
              </div>

              <div className="pt-4 border-t border-[var(--border-level-1)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveView("KANBAN")}
                  className="px-4 py-2.5 rounded-xl bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-white text-xs font-bold"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isIngesting}
                  className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-all text-xs font-bold flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Cpu className="w-4 h-4 text-purple-300" />
                  <span>
                    {isIngesting
                      ? isAr
                        ? "جاري المعالجة والتحليل..."
                        : "Processing with AI..."
                      : isAr
                      ? "إضافة وتحليل المترشح فوراً"
                      : "Ingest & Run AI Evaluation"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Candidate SlideOver Profile */}
      <SlideOver
        isOpen={Boolean(selectedTalentId)}
        onClose={() => setSelectedTalentId(null)}
        title={selectedTalent?.name || "Candidate Profile"}
      >
        {selectedTalent && (
          <TalentDetail
            initialTalent={selectedTalent}
            isDrawer
            onClose={() => setSelectedTalentId(null)}
          />
        )}
      </SlideOver>

      {/* CV Preview Modal */}
      <CvPreviewModal
        isOpen={Boolean(previewCandidate)}
        onClose={() => setPreviewCandidate(null)}
        candidate={previewCandidate}
        rankingInfo={previewCandidate ? rankingsMap.get(previewCandidate.id) : null}
        locale={locale}
      />
    </DashboardPageShell>
  );
}
