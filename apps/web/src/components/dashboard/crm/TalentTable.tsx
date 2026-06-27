"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Search,
  Upload,
  MoreVertical,
  Briefcase,
  Star,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { format } from "date-fns"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

export function TalentTable({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [globalFilter, setGlobalFilter] = useState("")
  const [isParsing, setIsParsing] = useState(false)
  const [sorting, setSorting] = useState([])

  const columns = [
    {
      accessorKey: "name",
      header: "Applicant Name",
      cell: (info: any) => (
        <div className="font-bold text-[var(--text-primary)]">{info.getValue()}</div>
      )
    },
    {
      accessorKey: "position",
      header: "Applied For",
      cell: (info: any) => (
        <div className="text-[var(--text-secondary)]">
          {info.getValue() || "-"}
          {info.row.original.department && (
            <span className="block text-xs text-[var(--text-tertiary)]">{info.row.original.department}</span>
          )}
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: any) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-[var(--surface-active)] text-[var(--text-secondary)]">
          {info.getValue()}
        </span>
      )
    },
    {
      accessorKey: "experienceLevel",
      header: "Experience",
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: (info: any) => (
        <div className="flex text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < (info.getValue() || 0) ? "fill-current" : "text-[var(--surface-active)]"}`} />
          ))}
        </div>
      )
    },
    {
      accessorKey: "appliedDate",
      header: "Date Applied",
      cell: (info: any) => format(new Date(info.getValue()), 'MMM d, yyyy')
    }
  ]

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting as any,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsParsing(true)
    const formData = new FormData()
    formData.append("resume", file)

    try {
      const res = await fetch("/api/crm/talent/parse-resume", {
        method: "POST",
        body: formData
      })
      if (res.ok) {
        const parsedData = await res.json()
        
        // Save to DB
        const saveRes = await fetch("/api/crm/talent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedData)
        })

        if (saveRes.ok) {
          router.refresh()
        }
      } else {
        alert("Failed to parse resume.")
      }
    } catch (err) {
      console.error(err)
      alert("An error occurred.")
    } finally {
      setIsParsing(false)
      if (e.target) e.target.value = ''
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Talent Pool</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage applicants and parsed CV data.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search talent..." 
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--surface-default)] border border-[var(--border-default)] focus:outline-none focus:border-[var(--color-primary)] text-sm"
            />
          </div>
          
          <div className="relative">
            <input 
              type="file" 
              accept=".pdf" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              disabled={isParsing}
            />
            <Button disabled={isParsing}>
              {isParsing ? <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {isParsing ? "Parsing AI..." : "Upload CV (PDF)"}
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-hover)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className={`p-4 font-bold ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-[var(--text-primary)]' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' ↑',
                        desc: ' ↓',
                      }[header.column.getIsSorted() as string] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className="hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/crm/talent/${(row.original as any).id}`)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-[var(--text-tertiary)]">
                    No talent found. Try uploading a CV.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-[var(--border-default)] flex items-center justify-between">
          <div className="text-sm text-[var(--text-secondary)]">
            Showing {table.getRowModel().rows.length} of {data.length} entries
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => table.previousPage()} 
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              onClick={() => table.nextPage()} 
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
