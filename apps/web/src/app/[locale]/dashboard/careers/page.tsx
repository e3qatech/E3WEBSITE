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
import { isHRAuthorized } from "@/lib/careers/job-eligibility";
import { CareersManagerClient } from "@/components/dashboard/careers/CareersManagerClient";

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

      {/* Interactive Careers & Openings Client */}
      <CareersManagerClient initialJobs={jobs} locale={locale} />
    </DashboardPageShell>
  );
}
