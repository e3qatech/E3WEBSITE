import { Metadata } from "next"
import db from "@/lib/db"
import { Briefcase, Users, Plus, Edit } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"

export const metadata: Metadata = {
  title: "Careers & Jobs | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function CareersPage() {
  const jobs = await db.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { applications: true }
      }
    }
  })

  return (
    <DashboardPageShell variant="wide">
      {/* Standard Header */}
      <DashboardPageHeader
        title="Careers & Job Openings"
        description="Manage job listings, applicant pipelines, employment types, and requirements."
        breadcrumbs={[
          { label: "HR & Careers", href: "/dashboard/team" },
          { label: "Job Listings" },
        ]}
        badge={{ label: `${jobs.length} Positions`, variant: "indigo" }}
        primaryAction={{
          label: "Post New Job",
          href: "/dashboard/careers/new",
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-hover)]/60 border-b border-[var(--border-level-1)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-4 text-start font-bold">Job Title</th>
                <th className="p-4 text-start font-bold">Department & Type</th>
                <th className="p-4 text-start font-bold">Applicants</th>
                <th className="p-4 text-start font-bold">Status</th>
                <th className="p-4 text-start font-bold">Posted Date</th>
                <th className="p-4 text-end font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-level-1)]">
              {jobs.map((job: any) => (
                <tr key={job.id} className="hover:bg-[var(--surface-hover)]/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[var(--text-primary)] mb-1">{job.title}</div>
                    <div className="text-xs text-[var(--text-secondary)] flex items-center">
                      <Briefcase className="w-3 h-3 me-1" /> {job.location || "Any"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[var(--text-secondary)]">{job.department || "General"}</div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border-level-1)] mt-1">
                      {job.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--text-primary)] font-bold">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>{job._count.applications}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {job.isPublished ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        PUBLISHED
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        DRAFT
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-[var(--text-tertiary)] text-xs">
                    {format(new Date(job.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4 text-end">
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <Link href={`/dashboard/careers/${job.id}`}>
                        <Edit className="w-3 h-3" /> View Pipeline
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[var(--text-tertiary)] font-mono text-xs">
                    No jobs posted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardPageShell>
  )
}
