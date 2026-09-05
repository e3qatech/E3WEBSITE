"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  FileText,
  UserCheck,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Eye,
  Award,
  Filter,
  Columns,
  List,
  Sparkles,
  Briefcase,
  Clock,
  Mail,
  Phone,
  Calendar,
  Copy,
  Check,
  LayoutGrid,
  ArrowUpDown,
  ChevronRight,
  ExternalLink,
  Tag,
  Building,
} from "lucide-react";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";
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
  {
    id: "NEW",
    labelEn: "New Submissions",
    labelAr: "طلبات جديدة",
    dotColor: "bg-blue-500",
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    borderActive: "border-blue-500",
  },
  {
    id: "SCREENING",
    labelEn: "Screening",
    labelAr: "قيد الفرز والتقييم",
    dotColor: "bg-amber-500",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    borderActive: "border-amber-500",
  },
  {
    id: "INTERVIEW",
    labelEn: "Interview",
    labelAr: "مرحلة المقابلة",
    dotColor: "bg-purple-500",
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    borderActive: "border-purple-500",
  },
  {
    id: "OFFERED",
    labelEn: "Offer Stage",
    labelAr: "تقديم العرض",
    dotColor: "bg-indigo-500",
    badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    borderActive: "border-indigo-500",
  },
  {
    id: "HIRED",
    labelEn: "Hired",
    labelAr: "تم التعيين",
    dotColor: "bg-emerald-500",
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    borderActive: "border-emerald-500",
  },
  {
    id: "REJECTED",
    labelEn: "Archived",
    labelAr: "مستبعد / محفوظ",
    dotColor: "bg-zinc-400 dark:bg-zinc-500",
    badgeBg: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
    borderActive: "border-zinc-500",
  },
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
  const [activeView, setActiveView] = useState<"DIRECTORY" | "LEADERBOARD" | "INGEST">("DIRECTORY");
  const [layoutMode, setLayoutMode] = useState<"GRID" | "TABLE">("GRID");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [jobFilter, setJobFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"MATCH" | "NEWEST" | "NAME">("MATCH");
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null);
  const [previewCandidate, setPreviewCandidate] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
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

  // Filtered and sorted talent items
  const filtered = useMemo(() => {
    const list = talent.filter((t) => {
      const targetRole = t.position || t.job?.title || "";
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase()) ||
        targetRole.toLowerCase().includes(search.toLowerCase()) ||
        (Array.isArray(t.skills) && t.skills.some((s: string) => s.toLowerCase().includes(search.toLowerCase())));

      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
      const matchesJob = jobFilter === "ALL" || targetRole === jobFilter;

      return matchesSearch && matchesStatus && matchesJob;
    });

    return list.sort((a, b) => {
      if (sortBy === "MATCH") {
        const scoreA = rankingsMap.get(a.id)?.matchScore || 0;
        const scoreB = rankingsMap.get(b.id)?.matchScore || 0;
        return scoreB - scoreA;
      }
      if (sortBy === "NEWEST") {
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      }
      if (sortBy === "NAME") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [talent, search, statusFilter, jobFilter, sortBy, rankingsMap]);

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
      setActiveView("DIRECTORY");
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 mt-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-3">
            {isAr ? "مركز التوظيف:" : "Recruitment Suite:"}
          </span>

          <Link
            href={`/${locale}/dashboard/crm/talent`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "استقطاب المواهب و AI" : "Talent Acquisition & AI Hub"}</span>
          </Link>

          <Link
            href={`/${locale}/dashboard/careers/applications`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-purple-500" />
            <span>{isAr ? "طلبات التوظيف ومعاينة CV" : "Job Applications & CVs"}</span>
          </Link>

          <Link
            href={`/${locale}/dashboard/careers`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all"
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
            <span>{isAr ? "شواغر الوظائف" : "Careers & Openings"}</span>
          </Link>

          <Link
            href={`/${locale}/dashboard/team`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isAr ? "دليل فريق العمل (A4 PDF)" : "Team Directory (A4 PDF)"}</span>
          </Link>
        </div>
      </div>

      {/* Recruiter KPI Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isAr ? "إجمالي بنك المواهب" : "Talent Pool Size"}
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{totalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isAr ? "في مرحلة الفرز والمقابلة" : "Active In Pipeline"}
            </div>
            <div className="text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">{inPipelineCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isAr ? "نخبة التطابق الذكي (+80%)" : "Top AI Matches"}
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{topMatchCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isAr ? "تم التعيين بنجاح" : "Hired & Onboarded"}
            </div>
            <div className="text-2xl font-black text-emerald-500 dark:text-emerald-400 mt-1">{hiredCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main View Navigation Tabs */}
      <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 mt-6 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-white/10 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveView("DIRECTORY")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === "DIRECTORY"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-700"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{isAr ? "دليل ومسار المرشحين" : "Talent Directory & Pipeline"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("LEADERBOARD")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === "LEADERBOARD"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-700"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{isAr ? "المتصدرون حسب التخصص" : "Category Leaderboard"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("INGEST")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === "INGEST"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-700"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{isAr ? "استوديو الاستيعاب الذكي" : "AI Ingest Studio"}</span>
          </button>
        </div>

        {/* Global Search & Filters in Directory mode */}
        {activeView === "DIRECTORY" && (
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-60">
              <Search className="w-3.5 h-3.5 absolute start-3 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder={isAr ? "بحث بالاسم، التخصص، أو المهارات..." : "Search name, role, skills..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl ps-8 pe-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">{isAr ? "كل التخصصات والوظائف" : "All Positions"}</option>
              {allRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none focus:border-purple-500"
            >
              <option value="MATCH">{isAr ? "ترتيب: أعلى تطابق AI" : "Sort: Top AI Match"}</option>
              <option value="NEWEST">{isAr ? "ترتيب: الأحدث تقديماً" : "Sort: Newest Applied"}</option>
              <option value="NAME">{isAr ? "ترتيب: أبجدياً بالاسم" : "Sort: Candidate Name"}</option>
            </select>

            {/* Layout Toggle: Grid vs Table */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-white/10">
              <button
                type="button"
                onClick={() => setLayoutMode("GRID")}
                title="Executive Cards View"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  layoutMode === "GRID"
                    ? "bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("TABLE")}
                title="Recruiter Table View"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  layoutMode === "TABLE"
                    ? "bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: TALENT DIRECTORY & PRACTICAL PIPELINE */}
      {activeView === "DIRECTORY" && (
        <div className="mt-6 space-y-6">
          {/* Practical Horizontal Stage Filter Ribbon */}
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 shadow-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{isAr ? "جميع المترشحين" : "All Candidates"}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[11px] font-black ${
                  statusFilter === "ALL"
                    ? "bg-white/20 dark:bg-black/20 text-white dark:text-zinc-900"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {talent.length}
              </span>
            </button>

            {PIPELINE_STAGES.map((stage) => {
              const count = talent.filter((t) => t.status === stage.id).length;
              const isSelected = statusFilter === stage.id;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setStatusFilter(stage.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? `bg-white dark:bg-zinc-800 border-2 ${stage.borderActive} shadow-xs text-zinc-900 dark:text-white`
                      : "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                  <span>{isAr ? stage.labelAr : stage.labelEn}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[11px] font-black ${
                      count > 0
                        ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Practical Roster Content */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                {isAr ? "لم يتم العثور على مترشحين في هذه المرحلة" : "No candidates found in this stage"}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                {isAr
                  ? "جرب إزالة عوامل التصفية أو التبديل إلى عرض جميع المترشحين، أو استيعاب ملف سيرة ذاتية جديد."
                  : "Try clearing your filters or switching to 'All Candidates', or ingest a new candidate resume."}
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setJobFilter("ALL");
                    setSearch("");
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  {isAr ? "إعادة ضبط التصفية" : "Clear Filters"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("INGEST")}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  {isAr ? "استيعاب مرشح جديد" : "Ingest New Candidate"}
                </button>
              </div>
            </div>
          ) : layoutMode === "GRID" ? (
            /* EXECUTIVE CANDIDATE CARDS (SPACIOUS 3-COLUMN LAYOUT) */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((cand) => {
                const rankInfo = rankingsMap.get(cand.id);
                const roleName = cand.position || cand.job?.title || "Professional";
                const department = cand.department || "Operations";
                const initials = getInitials(cand.name);
                const currentStageObj = PIPELINE_STAGES.find((s) => s.id === cand.status) || PIPELINE_STAGES[0];

                return (
                  <div
                    key={cand.id}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 hover:border-purple-500/40 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
                  >
                    {/* Top Row: Avatar + Name + AI Match Chip */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm ring-2 ring-purple-500/20">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h4
                              onClick={() => setSelectedTalentId(cand.id)}
                              className="font-bold text-sm text-zinc-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer truncate transition-colors"
                              title={cand.name}
                            >
                              {cand.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                              <Briefcase className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                              <span className="truncate font-medium">{roleName}</span>
                            </div>
                          </div>
                        </div>

                        {/* AI Category Rank Badge */}
                        {rankInfo && (
                          <div
                            className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 shrink-0 shadow-2xs ${
                              rankInfo.rank === 1
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                            }`}
                          >
                            <Award className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs font-black">
                              #{rankInfo.rank} · {rankInfo.matchScore}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Department & Experience Pills */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-white/5">
                          <Building className="w-3 h-3 text-zinc-400" />
                          <span>{department}</span>
                        </span>

                        {cand.experienceLevel && (
                          <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-semibold border border-purple-500/20">
                            {cand.experienceLevel}
                          </span>
                        )}

                        {rankInfo?.tierLabel && (
                          <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold">
                            {rankInfo.tierLabel}
                          </span>
                        )}
                      </div>

                      {/* Contact Coordinates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                        <div
                          onClick={() => copyToClipboard(cand.email, `email-${cand.id}`)}
                          className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors group/c"
                          title={cand.email}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate text-[11px] font-medium">{cand.email}</span>
                          </div>
                          {copiedKey === `email-${cand.id}` ? (
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-0 group-hover/c:opacity-100 text-zinc-400 shrink-0 transition-opacity" />
                          )}
                        </div>

                        {cand.phone ? (
                          <div
                            onClick={() => copyToClipboard(cand.phone || "", `phone-${cand.id}`)}
                            className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors group/p"
                            title={cand.phone}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span className="truncate text-[11px] font-medium font-mono">{cand.phone}</span>
                            </div>
                            {copiedKey === `phone-${cand.id}` ? (
                              <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                            ) : (
                              <Copy className="w-3 h-3 opacity-0 group-hover/p:opacity-100 text-zinc-400 shrink-0 transition-opacity" />
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 text-[11px]">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{isAr ? "بدون هاتف" : "No phone"}</span>
                          </div>
                        )}
                      </div>

                      {/* Key Skills Cloud (Comfortably Visible) */}
                      {cand.skills && Array.isArray(cand.skills) && cand.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-1">
                          {cand.skills.slice(0, 4).map((sk: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30 font-medium"
                            >
                              {sk}
                            </span>
                          ))}
                          {cand.skills.length > 4 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold">
                              +{cand.skills.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Candidate Notes / AI Summary Snippet */}
                      {(cand.notes || (cand.cvParsedData as any)?.summary) && (
                        <div className="mt-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-white/5 text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 italic">
                          &ldquo;{cand.notes || (cand.cvParsedData as any)?.summary}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Suite & Stage Selector */}
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                      {/* Pipeline Stage Control Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          {isAr ? "مرحلة التوظيف:" : "Pipeline Stage:"}
                        </span>

                        <select
                          value={cand.status}
                          onChange={(e) => updateStatus(cand.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${currentStageObj.badgeBg}`}
                        >
                          {PIPELINE_STAGES.map((s) => (
                            <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                              {isAr ? s.labelAr : s.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
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
                            className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isAr ? "معاينة الملف & AI" : "Preview CV & AI"}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="flex-1 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-not-allowed"
                          >
                            <span>{isAr ? "بدون سيرة ذاتية" : "No Resume Attached"}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedTalentId(cand.id)}
                          className="py-2 px-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          {isAr ? "الملف الكامل" : "Profile"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* HIGH-DENSITY RECRUITER TABLE ROSTER */
            <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 text-start">{isAr ? "المترشح" : "Candidate"}</th>
                      <th className="p-3.5 text-start">{isAr ? "الوظيفة والقسم" : "Role & Dept"}</th>
                      <th className="p-3.5 text-start">{isAr ? "تطابق AI والترتيب" : "AI Fit & Rank"}</th>
                      <th className="p-3.5 text-start">{isAr ? "أبرز المهارات" : "Key Skills"}</th>
                      <th className="p-3.5 text-start">{isAr ? "مرحلة التوظيف" : "Stage"}</th>
                      <th className="p-3.5 text-start">{isAr ? "تاريخ التقديم" : "Applied Date"}</th>
                      <th className="p-3.5 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-white/5">
                    {filtered.map((cand) => {
                      const rankInfo = rankingsMap.get(cand.id);
                      const roleName = cand.position || cand.job?.title || "Professional";
                      const initials = getInitials(cand.name);
                      const currentStageObj = PIPELINE_STAGES.find((s) => s.id === cand.status) || PIPELINE_STAGES[0];

                      return (
                        <tr key={cand.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                                {initials}
                              </div>
                              <div>
                                <div
                                  onClick={() => setSelectedTalentId(cand.id)}
                                  className="font-bold text-zinc-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer"
                                >
                                  {cand.name}
                                </div>
                                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                  <span>{cand.email}</span>
                                  {cand.phone && <span>· {cand.phone}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-semibold text-zinc-900 dark:text-white">{roleName}</div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{cand.department || "Operations"}</div>
                          </td>

                          <td className="p-3.5">
                            {rankInfo ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 font-bold text-xs">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                                      rankInfo.rank === 1 ? "bg-amber-500/20 text-amber-500 font-black" : "bg-purple-500/20 text-purple-400"
                                    }`}
                                  >
                                    #{rankInfo.rank}
                                  </span>
                                  <span className="text-zinc-900 dark:text-white">{rankInfo.matchScore}%</span>
                                </div>
                                <div className="w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-purple-600 dark:bg-purple-400 h-full rounded-full"
                                    style={{ width: `${rankInfo.matchScore}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-zinc-400 text-xs">-</span>
                            )}
                          </td>

                          <td className="p-3.5">
                            {cand.skills && Array.isArray(cand.skills) && cand.skills.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {cand.skills.slice(0, 3).map((sk: string, i: number) => (
                                  <span
                                    key={i}
                                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
                                  >
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-zinc-400 text-xs">-</span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <select
                              value={cand.status}
                              onChange={(e) => updateStatus(cand.id, e.target.value)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${currentStageObj.badgeBg}`}
                            >
                              {PIPELINE_STAGES.map((s) => (
                                <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                                  {isAr ? s.labelAr : s.labelEn}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-3.5 text-zinc-500 dark:text-zinc-400 text-[11px] font-mono">
                            {new Date(cand.appliedDate).toLocaleDateString(isAr ? "ar-QA" : "en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>

                          <td className="p-3.5 text-end">
                            <div className="inline-flex items-center gap-1.5">
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
                                  className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>{isAr ? "معاينة" : "Preview"}</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedTalentId(cand.id)}
                                className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
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
          )}
        </div>
      )}

      {/* VIEW 2: CATEGORY LEADERBOARD & COMPARATIVE RANKING */}
      {activeView === "LEADERBOARD" && (
        <div className="mt-6 space-y-6">
          {allRoles.map((roleName) => {
            const roleCandidates = filtered.filter(
              (t) => (t.position || t.job?.title) === roleName
            );
            if (roleCandidates.length === 0) return null;

            const sorted = [...roleCandidates].sort((a, b) => {
              const scoreA = rankingsMap.get(a.id)?.matchScore || 0;
              const scoreB = rankingsMap.get(b.id)?.matchScore || 0;
              return scoreB - scoreA;
            });

            return (
              <div
                key={roleName}
                className="bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs"
              >
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200/80 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{roleName}</h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {sorted.length} {isAr ? "مترشحين قيد المقارنة" : "Candidates in Category"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs whitespace-nowrap">
                    <thead className="bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400 font-bold">
                      <tr>
                        <th className="p-3 text-start">{isAr ? "الترتيب" : "Rank"}</th>
                        <th className="p-3 text-start">{isAr ? "اسم المترشح" : "Candidate"}</th>
                        <th className="p-3 text-start">{isAr ? "التطابق الذكي" : "AI Match"}</th>
                        <th className="p-3 text-start">{isAr ? "تصنيف الفئة" : "Tier"}</th>
                        <th className="p-3 text-start">{isAr ? "مرحلة التوظيف" : "Stage"}</th>
                        <th className="p-3 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/60 dark:divide-white/5">
                      {sorted.map((cand, idx) => {
                        const rankInfo = rankingsMap.get(cand.id);

                        return (
                          <tr key={cand.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="p-3 font-black">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                                  idx === 0
                                    ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                }`}
                              >
                                #{idx + 1}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-zinc-900 dark:text-white">{cand.name}</div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{cand.email}</div>
                            </td>
                            <td className="p-3 font-bold text-emerald-500 dark:text-emerald-400">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full"
                                    style={{ width: `${rankInfo?.matchScore || 65}%` }}
                                  />
                                </div>
                                <span>{rankInfo?.matchScore || 65}%</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                {rankInfo?.tierLabel || "Strong Fit"}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
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
                                    className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Eye className="w-3 h-3 text-purple-500" />
                                    <span>{isAr ? "معاينة" : "Preview"}</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSelectedTalentId(cand.id)}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer transition-colors"
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
        <div className="mt-6 max-w-3xl mx-auto bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-200/80 dark:border-white/10">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {isAr ? "استوديو استيعاب المترشحين وتحليل السير الذاتية بالذكاء الاصطناعي" : "AI Candidate Ingestion Studio"}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isAr
                  ? "إضافة مرشح جديد مباشرة أو استيعاب ملف سيرة ذاتية خارجي وربطه بمسار التوظيف مع التقييم الفوري."
                  : "Add external candidate CVs directly, run immediate domain AI analysis, and score against target job openings."}
              </p>
            </div>
          </div>

          <form onSubmit={handleRunIngestion} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {isAr ? "اسم المرشح الكامل *" : "Candidate Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={ingestForm.name}
                  onChange={(e) => setIngestForm({ ...ingestForm, name: e.target.value })}
                  placeholder="e.g. Tariq Al-Mansoori"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                </label>
                <input
                  type="email"
                  required
                  value={ingestForm.email}
                  onChange={(e) => setIngestForm({ ...ingestForm, email: e.target.value })}
                  placeholder="candidate@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {isAr ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  value={ingestForm.phone}
                  onChange={(e) => setIngestForm({ ...ingestForm, phone: e.target.value })}
                  placeholder="+974 5555 1234"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 text-sm"
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
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {isAr ? "رابط السيرة الذاتية (URL / PDF)" : "Resume / CV Document URL"}
              </label>
              <input
                type="url"
                value={ingestForm.resumeUrl}
                onChange={(e) => setIngestForm({ ...ingestForm, resumeUrl: e.target.value })}
                placeholder="https://.../resume.pdf"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>

            <div className="pt-4 border-t border-zinc-200/80 dark:border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveView("DIRECTORY")}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isIngesting}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all text-xs font-bold flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-purple-200" />
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
