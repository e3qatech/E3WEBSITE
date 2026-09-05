"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Briefcase,
  Users,
  Plus,
  Edit,
  AlertCircle,
  CheckCircle,
  Share2,
  Lock,
  Unlock,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { JobShareModal } from "./JobShareModal";
import { analyzeJobDataQuality, toTitleCase } from "@/lib/careers/job-eligibility";

interface CareersManagerClientProps {
  initialJobs: any[];
  locale: string;
}

export function CareersManagerClient({
  initialJobs,
  locale,
}: CareersManagerClientProps) {
  const [jobs, setJobs] = useState<any[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [shareModalJob, setShareModalJob] = useState<any | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { toast } = useToast();
  const isAr = locale === "ar";

  // Filter jobs by search and status
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.department && job.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "OPEN" && job.isPublished) ||
        (statusFilter === "CLOSED" && !job.isPublished);

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  // Toggle Application Status (Open / Closed)
  const handleToggleStatus = async (job: any) => {
    const nextPublished = !job.isPublished;
    setTogglingId(job.id);

    try {
      const res = await fetch(`/api/careers/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextPublished }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to update job status");
      }

      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, isPublished: nextPublished } : j))
      );

      toast(
        nextPublished
          ? isAr
            ? "تم فتح باب التقديم للوظيفة بنجاح."
            : "Job opened: Now accepting public applications."
          : isAr
          ? "تم إغلاق التقديم على الوظيفة بنجاح."
          : "Job closed: Public applications closed.",
        "success"
      );
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to update status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const openCount = jobs.filter((j) => j.isPublished).length;
  const closedCount = jobs.filter((j) => !j.isPublished).length;
  const totalApplicants = jobs.reduce((acc, j) => acc + (j._count?.applications || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              {isAr ? "الشواغر المفتوحة للتقديم" : "Accepting Applications"}
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {openCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Unlock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              {isAr ? "الشواغر المغلقة / المسودات" : "Closed / Draft Openings"}
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {closedCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              {isAr ? "إجمالي طلبات التوظيف" : "Total Active Submissions"}
            </div>
            <div className="text-2xl font-black text-blue-400 mt-1">
              {totalApplicants}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute start-3 top-3 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder={isAr ? "بحث بالوظيفة أو القسم..." : "Search jobs, department..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-1)] rounded-xl ps-9 pe-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-[var(--text-secondary)] font-bold flex items-center gap-1.5 shrink-0 me-1">
            <Filter className="w-3.5 h-3.5" />
            {isAr ? "الحالة:" : "Status:"}
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === "ALL"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-level-1)]"
            }`}
          >
            {isAr ? `الكل (${jobs.length})` : `All (${jobs.length})`}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("OPEN")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === "OPEN"
                ? "bg-emerald-600 text-white"
                : "bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-level-1)]"
            }`}
          >
            {isAr ? `مفتوحة (${openCount})` : `Open (${openCount})`}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("CLOSED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === "CLOSED"
                ? "bg-amber-600 text-white"
                : "bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-level-1)]"
            }`}
          >
            {isAr ? `مغلقة (${closedCount})` : `Closed (${closedCount})`}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-hover)]/60 border-b border-[var(--border-level-1)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-4 text-start font-bold">{isAr ? "عنوان الوظيفة" : "Job Title"}</th>
                <th className="p-4 text-start font-bold">{isAr ? "القسم والنوع" : "Department & Type"}</th>
                <th className="p-4 text-start font-bold">{isAr ? "المتقدمون" : "Applicants"}</th>
                <th className="p-4 text-start font-bold">{isAr ? "جودة الإعلان" : "Data Quality"}</th>
                <th className="p-4 text-start font-bold">{isAr ? "حالة التقديم" : "Intake Status"}</th>
                <th className="p-4 text-start font-bold">{isAr ? "تاريخ النشر" : "Posted Date"}</th>
                <th className="p-4 text-end font-bold">{isAr ? "الإجراءات السريعة" : "Quick Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-level-1)]">
              {filteredJobs.map((job: any) => {
                const dq = analyzeJobDataQuality(job);
                const isToggling = togglingId === job.id;

                return (
                  <tr key={job.id} className="hover:bg-[var(--surface-hover)]/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                        <span>{toTitleCase(job.title)}</span>
                        {job.isPublished && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Accepting submissions" />
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] flex items-center">
                        <Briefcase className="w-3 h-3 me-1" /> {toTitleCase(job.location) || (isAr ? "أي موقع" : "Doha (On-site)")}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[var(--text-secondary)]">
                        {toTitleCase(job.department) || (isAr ? "عام" : "General")}
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border-level-1)] mt-1">
                        {toTitleCase(job.type.replace(/_/g, " "))}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--text-primary)] font-bold">
                      <Link
                        href={`/${locale}/dashboard/careers/applications?role=${encodeURIComponent(job.title)}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all group"
                        title={isAr ? "عرض المتقدمين لهذه الوظيفة" : "View applicants for this job"}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job._count?.applications || 0}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ms-0.5" />
                      </Link>
                    </td>
                    <td className="p-4">
                      {dq.isClean ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> {isAr ? "مكتمل" : "100% Valid"}
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-help"
                          title={dq.issues.map((i) => (isAr ? i.messageAr : i.messageEn)).join(" | ")}
                        >
                          <AlertCircle className="w-3 h-3" />
                          {isAr ? `${dq.issues.length} ملاحظات` : `${dq.issues.length} Warnings`}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(job)}
                        disabled={isToggling}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
                          job.isPublished
                            ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}
                        title={
                          job.isPublished
                            ? isAr ? "انقر لإغلاق التقديم" : "Click to Close Applications"
                            : isAr ? "انقر لفتح التقديم" : "Click to Open Applications"
                        }
                      >
                        {job.isPublished ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>{isAr ? "مفتوحة للتقديم" : "Accepting Apps"}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>{isAr ? "التقديم مغلق" : "Apps Closed"}</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-[var(--text-tertiary)] text-xs">
                      {format(new Date(job.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 text-end">
                      <div className="inline-flex items-center gap-2">
                        {/* Share Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShareModalJob(job)}
                          className="gap-1.5 text-xs text-[var(--text-secondary)] hover:text-white"
                          title={isAr ? "مشاركة الرابط على لينكدإن والمنصات" : "Share on LinkedIn, WhatsApp & Socials"}
                        >
                          <Share2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>{isAr ? "مشاركة" : "Share"}</span>
                        </Button>

                        {/* Edit Button */}
                        <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
                          <Link href={`/${locale}/dashboard/careers/${job.id}`}>
                            <Edit className="w-3.5 h-3.5" />
                            <span>{isAr ? "تعديل" : "Edit"}</span>
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[var(--text-tertiary)] font-mono text-xs">
                    {searchQuery
                      ? isAr
                        ? "لم يتم العثور على أي نتائج تطابق البحث."
                        : "No job listings matched your filter criteria."
                      : isAr
                      ? "لا توجد وظائف معلنة حتى الآن."
                      : "No jobs posted yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share Modal Dialog */}
      <JobShareModal
        isOpen={Boolean(shareModalJob)}
        onClose={() => setShareModalJob(null)}
        job={shareModalJob}
        locale={locale}
      />
    </div>
  );
}
