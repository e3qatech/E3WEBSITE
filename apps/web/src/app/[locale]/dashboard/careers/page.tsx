import { Metadata } from "next";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Briefcase, Users, Plus, Edit, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";
import {
  isHRAuthorized,
  analyzeJobDataQuality,
  toTitleCase,
} from "@/lib/careers/job-eligibility";

export const metadata: Metadata = {
  title: "Careers & Jobs | E3 Admin",
};

export const dynamic = 'force-dynamic';

export default async function CareersPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const isAr = locale === 'ar';

  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const userPermissions = (session?.user as any)?.permissions;

  if (!session || !session.user || !isHRAuthorized(userRole, userPermissions)) {
    redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/careers`);
  }

  const jobs = await db.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { applications: true }
      }
    }
  });

  return (
    <DashboardPageShell variant="wide">
      {/* Standard Header */}
      <DashboardPageHeader
        title={isAr ? "الوظائف والشواغر المتاحة" : "Careers & Job Openings"}
        description={
          isAr
            ? "إدارة الشواغر الوظيفية، مسار المترشحين، نوع التوظيف، وتفاصيل المتطلبات."
            : "Manage job listings, applicant pipelines, employment types, and requirements."
        }
        breadcrumbs={[
          { label: isAr ? "الموارد البشرية والوظائف" : "HR & Careers", href: `/${locale}/dashboard/careers` },
          { label: isAr ? "قائمة الوظائف" : "Job Listings" },
        ]}
        badge={{
          label: isAr ? `${jobs.length} وظيفة` : `${jobs.length} Positions`,
          variant: "indigo",
        }}
        primaryAction={{
          label: isAr ? "إضافة وظيفة جديدة" : "Post New Job",
          href: `/${locale}/dashboard/careers/new`,
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-hover)]/60 border-b border-[var(--border-level-1)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-4 text-start font-bold">{isAr ? "عنوان الوظيفة" : "Job Title"}</th>
                <th className="p-4 text-start font-bold">{isAr ? "القسم والنوع" : "Department & Type"}</th>
                <th className="p-4 text-start font-bold">{isAr ? "المتقدمون" : "Applicants"}</th>
                <th className="p-4 text-start font-bold">{isAr ? "جودة البيانات" : "Data Quality"}</th>
                <th className="p-4 text-start font-bold">{isAr ? "الحالة" : "Status"}</th>
                <th className="p-4 text-start font-bold">{isAr ? "تاريخ النشر" : "Posted Date"}</th>
                <th className="p-4 text-end font-bold">{isAr ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-level-1)]">
              {jobs.map((job: any) => {
                const dq = analyzeJobDataQuality(job);

                return (
                  <tr key={job.id} className="hover:bg-[var(--surface-hover)]/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[var(--text-primary)] mb-1">
                        {toTitleCase(job.title)}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] flex items-center">
                        <Briefcase className="w-3 h-3 me-1" /> {toTitleCase(job.location) || (isAr ? "أي موقع" : "Any")}
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
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>{job._count?.applications || 0}</span>
                      </div>
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
                          {isAr ? `${dq.issues.length} ملاحظات` : `${dq.issues.length} Quality Warnings`}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {job.isPublished ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {isAr ? "منشورة" : "PUBLISHED"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {isAr ? "مسودة" : "DRAFT"}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-[var(--text-tertiary)] text-xs">
                      {format(new Date(job.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4 text-end">
                      <Button variant="outline" size="sm" asChild className="gap-2">
                        <Link href={`/${locale}/dashboard/careers/${job.id}`}>
                          <Edit className="w-3 h-3" /> {isAr ? "تعديل ومراجعة" : "Edit & Review"}
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[var(--text-tertiary)] font-mono text-xs">
                    {isAr ? "لا توجد وظائف معلنة حتى الآن." : "No jobs posted yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardPageShell>
  );
}
