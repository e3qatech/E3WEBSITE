"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Save, Briefcase, Users, AlertTriangle, Trash2, Share2, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { Tabs, TabsContent } from "@/components/dashboard/ui/Tabs";
import { RichTextEditor } from "@/components/dashboard/ui/RichTextEditor";
import { DataTable } from "@/components/dashboard/ui/DataTable";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/layout/LocaleProvider";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";
import {
  analyzeJobDataQuality,
  toTitleCase,
} from "@/lib/careers/job-eligibility";
import { JobShareModal } from "@/components/dashboard/careers/JobShareModal";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { toast } = useToast();
  const router = useRouter();
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const isEdit = id !== "new";

  const [activeTab, setActiveTab] = useState("details");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    department: "Operations",
    location: "Doha (On-site)",
    type: "FULL_TIME",
    isPublished: false,
    description: "",
    requirements: "",
  });

  // Derive data quality live as user edits
  const dataQuality = useMemo(() => analyzeJobDataQuality(formData), [formData]);

  // Fetch real job data if editing
  useEffect(() => {
    if (!isEdit) return;

    async function loadJob() {
      try {
        const res = await fetch(`/api/careers/jobs/${id}?all=true`);
        const json = await res.json();
        if (json.success && json.job) {
          const j = json.job;
          setFormData({
            title: j.title || "",
            department: j.department || "Operations",
            location: j.location || "Doha (On-site)",
            type: j.type || "FULL_TIME",
            isPublished: Boolean(j.isPublished),
            description: j.description || "",
            requirements: j.requirements || "",
          });
          setApplicants(j.applications || []);
        } else {
          toast(json.error || "Failed to load job details", "error");
        }
      } catch (err) {
        console.error("Error loading job:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadJob();
  }, [id, isEdit, toast]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast(isAr ? "يرجى إدخال عنوان الوظيفة" : "Please enter a job title", "error");
      return;
    }
    if (!formData.description.trim()) {
      toast(isAr ? "يرجى إدخال الوصف الوظيفي" : "Please enter a job description", "error");
      return;
    }

    setIsSaving(true);
    try {
      const url = isEdit ? `/api/careers/jobs/${id}` : "/api/careers/jobs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save job");
      }

      toast(
        isAr ? "تم حفظ بيانات الوظيفة بنجاح." : "Job listing saved successfully.",
        "success"
      );

      if (!isEdit && json.job?.id) {
        router.push(`/${locale}/dashboard/careers/${json.job.id}`);
      }
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to save job.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(isAr ? "هل أنت متأكد من رغبتك في حذف هذا الشاغر الوظيفي؟" : "Are you sure you want to delete this job listing?")) return;

    try {
      const res = await fetch(`/api/careers/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete job");
      toast(isAr ? "تم حذف الوظيفة بنجاح." : "Job deleted successfully.", "success");
      router.push(`/${locale}/dashboard/careers`);
    } catch (err: any) {
      toast(err.message || "Failed to delete job.", "error");
    }
  };

  const applicantColumns = [
    {
      key: "name",
      header: isAr ? "اسم المتقدم" : "Applicant Name",
      render: (item: any) => (
        <span className="font-bold text-[var(--text-primary)]">{item.name || `${item.firstName} ${item.lastName}`}</span>
      ),
    },
    {
      key: "date",
      header: isAr ? "تاريخ التقديم" : "Applied Date",
      render: (item: any) => new Date(item.appliedDate || item.createdAt).toLocaleDateString(),
    },
    {
      key: "status",
      header: isAr ? "الحالة" : "Status",
      render: (item: any) => (
        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {item.status}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardPageShell variant="focused">
        <div className="p-16 text-center text-[var(--text-secondary)]">
          {isAr ? "جاري تحميل تفاصيل الوظيفة..." : "Loading job details..."}
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell variant="focused">
      <DashboardPageHeader
        title={
          isEdit
            ? `${isAr ? "تعديل الشاغر:" : "Edit Job:"} ${toTitleCase(formData.title) || (isAr ? "شاغر وظيفي" : "Job Listing")}`
            : isAr
            ? "إنشاء شاغر وظيفي جديد"
            : "Create New Job Listing"
        }
        description={
          isAr
            ? "تحديد متطلبات الوظيفة، القسم، الموقع، ونشر الشاغر للعامة."
            : "Configure job position requirements, department assignment, location type, and review applications."
        }
        breadcrumbs={[
          { label: isAr ? "شواغر التوظيف" : "Careers Roster", href: `/${locale}/dashboard/careers` },
          { label: isEdit ? (toTitleCase(formData.title) || (isAr ? "تعديل الوظيفة" : "Edit Job")) : (isAr ? "وظيفة جديدة" : "New Job") },
        ]}
        badge={{
          label: formData.isPublished
            ? (isAr ? "مفتوحة للتقديم" : "ACCEPTING APPS")
            : (isAr ? "التقديم مغلق / مسودة" : "CLOSED / DRAFT"),
          variant: formData.isPublished ? "success" : "warning",
        }}
        previewUrl={isEdit ? `/careers/${id}` : undefined}
        previewLabel={isAr ? "معاينة الوظيفة للعامة" : "Preview Public Listing"}
        secondaryAction={
          isEdit ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isPublished: !prev.isPublished }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  formData.isPublished
                    ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                }`}
                title={
                  formData.isPublished
                    ? isAr
                      ? "انقر لإغلاق التقديم"
                      : "Click to Close Submissions"
                    : isAr
                    ? "انقر لفتح التقديم"
                    : "Click to Open Submissions"
                }
              >
                {formData.isPublished ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isAr ? "إغلاق التقديم" : "Mark as Closed"}</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>{isAr ? "فتح التقديم للعامة" : "Open for Applications"}</span>
                  </>
                )}
              </button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsShareOpen(true)}
                className="gap-1.5 text-xs text-[var(--text-secondary)] hover:text-white"
                title={isAr ? "مشاركة الرابط على لينكدإن والمنصات" : "Share Job Opening"}
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{isAr ? "مشاركة" : "Share"}</span>
              </Button>
            </div>
          ) : null
        }
        primaryAction={{
          label: isSaving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ الوظيفة" : "Save Job"),
          onClick: handleSave,
          isLoading: isSaving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      {/* Staff Data Quality Warnings Banner */}
      {dataQuality && !dataQuality.isClean && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {isAr
                ? `تنبيهات جودة البيانات للموظفين (${dataQuality.issues.length} ملاحظات)`
                : `Staff Data Quality Inspection (${dataQuality.issues.length} Issues Detected)`}
            </span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-zinc-300 ps-2">
            {dataQuality.issues.map((issue, idx) => (
              <li key={idx}>
                {isAr ? issue.messageAr : issue.messageEn}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] overflow-hidden">
        {isEdit ? (
          <Tabs
            tabs={[
              { id: "details", label: isAr ? "تفاصيل الوظيفة" : "Job Details", icon: <Briefcase className="w-4 h-4" /> },
              { id: "applicants", label: isAr ? `المتقدمون (${applicants.length})` : `Applicants (${applicants.length})`, icon: <Users className="w-4 h-4" /> },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        ) : (
          <div className="p-4 border-b border-[var(--border-default)] font-bold text-[var(--text-primary)]">
            {isAr ? "تفاصيل الوظيفة الجديدة" : "New Job Details"}
          </div>
        )}

        <TabsContent value="details" activeTab={activeTab}>
          <div className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">
                  {isAr ? "عنوان الوظيفة *" : "Job Title *"}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">
                  {isAr ? "القسم" : "Department"}
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="Operations">{isAr ? "العمليات التشغيلية" : "Operations"}</option>
                  <option value="Engineering">{isAr ? "الهندسة والتقنية" : "Engineering"}</option>
                  <option value="Sales">{isAr ? "المبيعات" : "Sales"}</option>
                  <option value="Creative">{isAr ? "الإبداع والتصميم" : "Creative"}</option>
                  <option value="Marketing">{isAr ? "التسويق" : "Marketing"}</option>
                  <option value="HR">{isAr ? "الموارد البشرية" : "Human Resources"}</option>
                  <option value="Management">{isAr ? "الإدارة العامة" : "Management"}</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">
                  {isAr ? "مقر العمل" : "Location"}
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="Doha (On-site)">{isAr ? "الدوحة (حضوري)" : "Doha (On-site)"}</option>
                  <option value="Doha (Hybrid)">{isAr ? "الدوحة (هجين)" : "Doha (Hybrid)"}</option>
                  <option value="Remote">{isAr ? "عن بُعد" : "Remote"}</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">
                  {isAr ? "نوع التوظيف" : "Employment Type"}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="FULL_TIME">{isAr ? "دوام كامل" : "Full Time"}</option>
                  <option value="PART_TIME">{isAr ? "دوام جزئي" : "Part Time"}</option>
                  <option value="CONTRACT">{isAr ? "عقد مؤقت" : "Contract"}</option>
                  <option value="INTERNSHIP">{isAr ? "تدريب مهني" : "Internship"}</option>
                </select>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">
                  {isAr ? "حالة النشر" : "Publication Status"}
                </label>
                <div className="flex items-center gap-6 p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isPublished"
                      checked={formData.isPublished === true}
                      onChange={() => setFormData({ ...formData, isPublished: true })}
                      className="text-[var(--color-primary)]"
                    />
                    <span className="text-sm font-bold text-emerald-400">
                      {isAr ? "منشورة للعامة (Public)" : "Published (Accepting Applications)"}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isPublished"
                      checked={formData.isPublished === false}
                      onChange={() => setFormData({ ...formData, isPublished: false })}
                      className="text-[var(--color-primary)]"
                    />
                    <span className="text-sm font-bold text-amber-400">
                      {isAr ? "مسودة غير معلنة (Draft)" : "Draft (Private / Closed)"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-[var(--text-secondary)]">
                {isAr ? "الوصف الوظيفي *" : "Job Description *"}
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(v) => setFormData({ ...formData, description: v })}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-[var(--text-secondary)]">
                {isAr ? "المتطلبات والمهارات (سطر لكل متطلب)" : "Requirements & Qualifications (One per line)"}
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={4}
                placeholder={isAr ? "- خبرة لا تقل عن ٣ سنوات\n- إتقان تقنيات الويب الحديثة" : "- 3+ years experience\n- Proficiency in modern web technologies"}
                className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            {isEdit && (
              <div className="pt-6 border-t border-[var(--border-default)] flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isAr ? "حذف هذا الشاغر" : "Delete Job"}
                </Button>
                <div className="text-xs text-[var(--text-tertiary)]">
                  ID: <span className="font-mono">{id}</span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {isEdit && (
          <TabsContent value="applicants" activeTab={activeTab}>
            <div className="p-6">
              {applicants.length > 0 ? (
                <DataTable columns={applicantColumns} data={applicants} />
              ) : (
                <div className="p-12 text-center text-[var(--text-secondary)]">
                  {isAr ? "لم يتم تقديم أي طلبات لهذا الشاغر حتى الآن." : "No applications submitted for this job yet."}
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </div>

      {/* Social & Public Share Modal */}
      <JobShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        job={isEdit ? { id, ...formData } : null}
        locale={locale}
      />
    </DashboardPageShell>
  );
}
