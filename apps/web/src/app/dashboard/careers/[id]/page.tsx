"use client"
import React, { useState } from "react"
import { ArrowLeft, Save, Briefcase, Eye } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { Tabs, TabsContent } from "@/components/dashboard/ui/Tabs"
import { RichTextEditor } from "@/components/dashboard/ui/RichTextEditor"
import { DataTable } from "@/components/dashboard/ui/DataTable"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

const MOCK_APPS = [
  { id: "A1", name: "John Smith", date: "Oct 24, 2026", status: "New" },
  { id: "A2", name: "Sara Ali", date: "Oct 22, 2026", status: "Interview" },
]

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { toast } = useToast()
  const isEdit = id !== "new"
  const [activeTab, setActiveTab] = useState("details")
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: isEdit ? "Senior AV Engineer" : "",
    department: isEdit ? "Operations" : "Sales",
    location: isEdit ? "Doha (On-site)" : "Doha (On-site)",
    type: isEdit ? "Full Time" : "Full Time",
    status: isEdit ? "Active" : "Draft",
    description: isEdit ? "<p>We are looking for a Senior AV Engineer...</p>" : ""
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 800))
    toast("Job listing saved successfully.", "success")
    setIsSaving(false)
  }

  const columns: ColumnDef<typeof MOCK_APPS[0]>[] = [
    { accessorKey: "name", header: "Applicant Name", cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
    { accessorKey: "date", header: "Applied Date" },
    { accessorKey: "status", header: "Status" },
    { id: "actions", cell: () => <Button variant="ghost" size="sm">Review</Button> }
  ]

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="p-2 -ms-2">
            <Link href="/dashboard/careers">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">{isEdit ? 'Edit Job Listing' : 'New Job Listing'}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isEdit && (
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" /> View Public
            </Button>
          )}
          <Button onClick={handleSave} isLoading={isSaving} className="gap-2">
            <Save className="w-4 h-4" /> Save Job
          </Button>
        </div>
      </div>

      <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] overflow-hidden">
        {isEdit ? (
          <Tabs tabs={[
            { id: "details", label: "Job Details", icon: <Briefcase className="w-4 h-4" /> },
            { id: "applicants", label: `Applicants (${MOCK_APPS.length})` }
          ]} activeTab={activeTab} onChange={setActiveTab} />
        ) : (
          <div className="p-4 border-b border-[var(--border-default)] font-bold text-[var(--text-primary)]">Job Details</div>
        )}

        <TabsContent value="details" activeTab={activeTab}>
          <div className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">Job Title</label>
                <input 
                  type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">Department</label>
                <select 
                  value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Creative">Creative</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">Location</label>
                <select 
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="Doha (On-site)">Doha (On-site)</option>
                  <option value="Doha (Hybrid)">Doha (Hybrid)</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">Employment Type</label>
                <select 
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">Status</label>
                <select 
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="Active">Active (Public)</option>
                  <option value="Draft">Draft</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-[var(--text-secondary)]">Job Description</label>
              <RichTextEditor value={formData.description} onChange={v => setFormData({...formData, description: v})} />
            </div>

          </div>
        </TabsContent>
        
        {isEdit && (
          <TabsContent value="applicants" activeTab={activeTab}>
            <div className="p-6">
              <DataTable columns={columns} data={MOCK_APPS} />
            </div>
          </TabsContent>
        )}
      </div>

    </div>
  )
}
