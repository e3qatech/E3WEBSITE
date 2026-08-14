"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Check, X as XIcon, User, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmployeeFormModal } from "./EmployeeFormModal";
import { useRouter } from "next/navigation";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";

export function TeamManagerClient({ initialEmployees }: { initialEmployees: any[] }) {
  const router = useRouter();
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  const filteredEmployees = employees.filter((emp) =>
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardPageShell variant="wide">
      {/* Standard Header */}
      <DashboardPageHeader
        title="Team Profiles & Directory"
        description="Manage employee profiles, executive bios, departments, and public microsites."
        breadcrumbs={[
          { label: "HR & Careers", href: "/dashboard/team" },
          { label: "Team Profiles" },
        ]}
        badge={{ label: `${employees.length} Members`, variant: "indigo" }}
        primaryAction={{
          label: "Add Team Member",
          onClick: () => {
            setEditingEmployee(null);
            setIsModalOpen(true);
          },
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      <div className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--border-level-1)] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--surface-hover)]/30">
          <div className="relative w-full sm:w-72">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <Input 
              placeholder="Search team..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-9 w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-[var(--surface-hover)]/60 text-[var(--text-secondary)] uppercase text-xs font-bold border-b border-[var(--border-level-1)]">
              <tr>
                <th className="px-6 py-4 text-start">Profile</th>
                <th className="px-6 py-4 text-start">Name</th>
                <th className="px-6 py-4 text-start">Designation</th>
                <th className="px-6 py-4 text-start">Department</th>
                <th className="px-6 py-4 text-center">Active</th>
                <th className="px-6 py-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-tertiary)] font-mono text-xs">
                    No team members found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-[var(--border-level-1)] hover:bg-[var(--surface-hover)]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--surface-hover)] flex items-center justify-center border border-[var(--border-level-1)]">
                        {emp.profileImage ? (
                          <img src={emp.profileImage} alt={emp.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-[var(--text-tertiary)]" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--text-primary)] whitespace-nowrap">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{emp.designation}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      <span className="px-2.5 py-1 bg-[var(--surface-hover)] rounded-md text-xs font-bold border border-[var(--border-level-1)]">{emp.department}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {emp.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-xs">
                          <Check className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-500 text-xs">
                          <XIcon className="w-4 h-4" /> No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }}
                          className="p-1.5 hover:bg-[var(--surface-hover)] rounded-lg text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.id)}
                          className="p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-colors cursor-pointer"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EmployeeFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={editingEmployee}
        onSuccess={() => {
          setIsModalOpen(false);
          router.refresh();
        }}
      />
    </DashboardPageShell>
  );
}
