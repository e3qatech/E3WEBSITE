"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormattedPublicJob, toTitleCase } from "@/lib/careers/job-eligibility";

interface ActiveJobsSectionProps {
  jobs: FormattedPublicJob[];
  locale?: string;
}

export function ActiveJobsSection({
  jobs = [],
  locale = "en",
}: ActiveJobsSectionProps) {
  const isAr = locale === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Dynamic filter lists
  const departments = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.department) set.add(j.department);
    });
    return Array.from(set);
  }, [jobs]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.location) set.add(j.location);
    });
    return Array.from(set);
  }, [jobs]);

  const types = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.type) set.add(j.type);
    });
    return Array.from(set);
  }, [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchDept = selectedDept === "all" || job.department === selectedDept;
      const matchLoc = selectedLocation === "all" || job.location === selectedLocation;
      const matchType = selectedType === "all" || job.type === selectedType;

      if (!matchDept || !matchLoc || !matchType) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const titleMatch =
        job.title?.toLowerCase().includes(q) ||
        job.titleEn?.toLowerCase().includes(q) ||
        job.titleAr?.includes(q);
      const descMatch = job.description?.toLowerCase().includes(q);
      const deptMatch = job.department?.toLowerCase().includes(q);

      return Boolean(titleMatch || descMatch || deptMatch);
    });
  }, [jobs, selectedDept, selectedLocation, selectedType, searchQuery]);

  return (
    <section
      id="open-roles"
      data-testid="active-jobs-section"
      aria-label={isAr ? "الوظائف المتاحة والشواغر" : "Active Job Opportunities"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-[var(--border-level-1)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isAr ? "الشواغر الحالية" : "ACTIVE OPPORTUNITIES"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            {isAr ? "الوظائف وفرص الانضمام المتاحة" : "Explore Open Roles & Vacancies"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium max-w-xl">
            {isAr
              ? "استعرض الشواغر الوظيفية المتاحة وقدم طلبك مباشرة للانضمام إلى نخبة مصممي ومهندسي التجارب."
              : "Discover available positions across technical production, spatial design, and operations."}
          </p>
        </div>

        {/* Vacancy Counter */}
        <div className="flex items-center gap-2">
          <span
            data-testid="vacancy-count-badge"
            className="px-4 py-2 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs font-bold text-[var(--text-primary)] shadow-sm"
          >
            {isAr ? (
              <>
                <span className="text-cyan-400 font-mono text-sm me-1.5">{filteredJobs.length}</span>
                {filteredJobs.length === 1 ? "وظيفة مطابقة" : "وظائف معروضة"}
              </>
            ) : (
              <>
                <span className="text-cyan-400 font-mono text-sm me-1.5">{filteredJobs.length}</span>
                {filteredJobs.length === 1 ? "Active Role" : "Active Roles"}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-4 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              data-testid="jobs-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "بحث بالوظيفة أو المسمى..." : "Search by job title or keyword..."}
              className="w-full ps-9 pe-4 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              data-testid="jobs-department-filter"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="all">{isAr ? "جميع الأقسام" : "All Departments"}</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {toTitleCase(dept)}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="relative">
            <select
              data-testid="jobs-location-filter"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="all">{isAr ? "جميع المواقع" : "All Locations"}</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {toTitleCase(loc)}
                </option>
              ))}
            </select>
          </div>

          {/* Employment Type Filter */}
          <div className="relative">
            <select
              data-testid="jobs-type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="all">{isAr ? "نوع التوظيف (الكل)" : "All Employment Types"}</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {toTitleCase(type.replace(/_/g, " "))}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid or Empty Fallback */}
      {filteredJobs.length === 0 ? (
        <div
          data-testid="no-jobs-fallback"
          className="text-center py-16 px-6 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-level-1)] max-w-2xl mx-auto space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
            {isAr ? "لا توجد شواغر معلنة حالياً تطابق بحثك" : "No Matching Open Positions Currently"}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            {isAr
              ? "نحن نبحث دائماً عن كفاءات استثنائية. يمكنك تقديم سيرتك الذاتية في قسم الطلب العام أدناه ليتم التواصل معك فور توفر شاغر مناسب."
              : "We are always scouting exceptional talent. Submit a General Application below to join our verified candidate talent pool."}
          </p>
          <div className="pt-2">
            <Link
              href="#upload-cv"
              data-testid="fallback-general-app-cta"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md"
            >
              <span>{isAr ? "الانتقال لتقديم السيرة الذاتية (طلب عام)" : "Submit General Application"}</span>
              <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredJobs.map((job) => {
            const rawTitle = isAr
              ? job.titleAr || job.titleEn || job.title
              : job.titleEn || job.title;
            const displayTitle = toTitleCase(rawTitle) || (isAr ? "فرصة وظيفية" : "Open Role");
            const displayDept = toTitleCase(job.department) || (isAr ? "عام" : "General");
            const displayLocation = toTitleCase(job.location) || (isAr ? "الدوحة، قطر" : "Doha, Qatar");
            const displayType = toTitleCase(job.type?.replace(/_/g, " ") || "Full Time");

            const detailUrl = `/${locale}/careers/${job.id}`;
            const applyUrl = `/${locale}/apply?jobId=${encodeURIComponent(job.id)}&jobTitle=${encodeURIComponent(displayTitle)}&department=${encodeURIComponent(job.department || "")}&portal=B2B`;

            return (
              <div
                key={job.id}
                data-testid={`job-card-${job.id}`}
                className="group relative bg-[var(--surface-default)] rounded-2xl border border-[var(--border-level-1)] hover:border-cyan-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                {/* Top Tags */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {displayDept}
                    </span>
                    <span className="text-[11px] font-medium text-[var(--text-tertiary)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{displayType}</span>
                    </span>
                  </div>

                  {/* Job Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors leading-snug mb-3">
                    {displayTitle}
                  </h3>

                  {/* Description snippet */}
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed mb-4">
                    {job.description?.replace(/<[^>]*>?/gm, "").trim() || job.description}
                  </p>
                </div>

                {/* Bottom Metadata & Actions */}
                <div className="pt-4 border-t border-[var(--border-level-1)] mt-4">
                  <div className="flex items-center text-[var(--text-tertiary)] text-xs mb-4">
                    <MapPin className="w-3.5 h-3.5 me-1 text-cyan-400 shrink-0" />
                    <span>{displayLocation}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={detailUrl}
                      data-testid={`view-job-role-${job.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--text-primary)] hover:text-cyan-400 transition-colors"
                    >
                      <span>{isAr ? "تفاصيل الوظيفة" : "View Role"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <Link
                      href={applyUrl}
                      data-testid={`apply-job-now-${job.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95"
                    >
                      <span>{isAr ? "قدّم الآن" : "Apply Now"}</span>
                      <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
