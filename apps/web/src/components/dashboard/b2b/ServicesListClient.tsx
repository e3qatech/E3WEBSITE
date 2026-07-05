"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit2, Search, Settings } from "lucide-react"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"
import { 
  AdminTable, 
  AdminTableHeader, 
  AdminTableBody, 
  AdminTableRow, 
  AdminTableHead, 
  AdminTableCell 
} from "@/components/dashboard/ui/AdminTable"

export function ServicesListClient({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  const [services, setServices] = useState(initialData)
  const [search, setSearch] = useState("")

  const filteredServices = services.filter(s => 
    s.titleEn.toLowerCase().includes(search.toLowerCase()) || 
    s.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      const res = await fetch(`/api/b2b/services/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      
      setServices(services.filter(s => s.id !== id))
      router.refresh()
    } catch (error) {
      alert("Failed to delete service")
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-fade-in-up">
      <AdminPageHeader 
        title="B2B Services"
        description="Manage corporate services and offerings."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "B2B Portal" },
          { label: "Services" }
        ]}
        action={
          <AdminButton onClick={() => router.push("/dashboard/b2b/services/new")} variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Add Service
          </AdminButton>
        }
      />

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full bg-surface-default border border-border-default rounded-md py-2 ps-9 pe-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-tertiary shadow-sm"
          />
        </div>
      </div>

      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow>
            <AdminTableHead>Service</AdminTableHead>
            <AdminTableHead>Status</AdminTableHead>
            <AdminTableHead className="text-right">Actions</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {filteredServices.map(service => (
            <AdminTableRow key={service.id} className="group">
              <AdminTableCell>
                <div className="flex items-center gap-4">
                  {service.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={service.thumbnail} alt={service.titleEn} className="w-12 h-12 rounded-lg object-cover border border-border-default shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-surface-active border border-border-default flex items-center justify-center text-text-tertiary shadow-sm">
                      <Settings className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-text-primary line-clamp-1">{service.titleEn}</div>
                    <div className="text-xs text-text-tertiary mt-0.5">/{service.slug}</div>
                  </div>
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex flex-col gap-1.5">
                  {service.isVisible ? (
                    <span className="inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-success/10 text-success">Visible</span>
                  ) : (
                    <span className="inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-surface-hover text-text-secondary border border-border-default">Hidden</span>
                  )}
                  {service.isFeatured && (
                    <span className="inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-warning/10 text-warning">Featured</span>
                  )}
                </div>
              </AdminTableCell>
              <AdminTableCell className="text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AdminButton onClick={() => router.push(`/dashboard/b2b/services/${service.slug}`)} variant="outline" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
                    Edit
                  </AdminButton>
                  <button onClick={() => handleDelete(service.id)} className="p-2 text-text-secondary hover:text-error bg-surface-active hover:bg-error/10 border border-transparent hover:border-error/20 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
          {filteredServices.length === 0 && (
            <AdminTableRow>
              <AdminTableCell colSpan={3} className="h-32 text-center text-text-tertiary font-medium">
                No services found. Click "Add Service" to create one.
              </AdminTableCell>
            </AdminTableRow>
          )}
        </AdminTableBody>
      </AdminTable>
    </div>
  )
}

