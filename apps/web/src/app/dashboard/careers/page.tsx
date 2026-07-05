import { Metadata } from "next"
import db from "@/lib/db"
import { Briefcase, Users, Plus, Edit, ToggleRight, ToggleLeft } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Careers | E3 Admin",
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
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Careers Manager</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage job openings and track applicant pipelines.</p>
        </div>
        
        <Button asChild className="gap-2">
          <Link href="/dashboard/careers/new">
            <Plus className="w-4 h-4" /> Post New Job
          </Link>
        </Button>
      </div>

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-hover)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-4 font-bold">Job Title</th>
                <th className="p-4 font-bold">Department & Type</th>
                <th className="p-4 font-bold">Applicants</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Posted Date</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {jobs.map(job => (
                <tr key={job.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[var(--text-primary)] mb-1">{job.title}</div>
                    <div className="text-xs text-[var(--text-secondary)] flex items-center">
                      <Briefcase className="w-3 h-3 me-1" /> {job.location || "Any"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[var(--text-secondary)]">{job.department || "General"}</div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--surface-active)] text-[var(--text-secondary)] mt-1">
                      {job.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--text-primary)] font-bold flex items-center mt-2">
                    <Users className="w-4 h-4 me-2 text-blue-500" />
                    {job._count.applications}
                  </td>
                  <td className="p-4">
                    {job.isPublished ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-green-500/10 text-green-500">
                        PUBLISHED
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500">
                        DRAFT
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-[var(--text-tertiary)] text-xs">
                    {format(new Date(job.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4 text-right">
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
                  <td colSpan={6} className="p-8 text-center text-[var(--text-tertiary)]">
                    No jobs posted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
