"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Check, X as XIcon, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmployeeFormModal } from "./EmployeeFormModal";
import { useRouter } from "next/navigation";

export function TeamManagerClient({ initialEmployees }: { initialEmployees: any[] }) {
  const router = useRouter();
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  const filteredEmployees = employees.filter(emp => 
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
        setEmployees(prev => prev.filter(e => e.id !== id));
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Team Management</h1>
          <p className="text-[var(--text-secondary)]">Manage employee profiles and microsites.</p>
        </div>
        <Button onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }} className="gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-bold">
          <Plus className="w-4 h-4" /> Add Team Member
        </Button>
      </div>

      <div className="glass rounded-2xl border-gradient overflow-hidden">
        <div className="p-4 border-b border-[var(--border-level-2)] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--surface-default)]/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <Input 
              placeholder="Search team..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--surface-hover)]/50 text-[var(--text-secondary)] uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Profile</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-center">Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-tertiary)]">
                    No team members found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp.id} className="border-b border-[var(--border-level-2)] hover:bg-[var(--surface-hover)]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--surface-hover)] flex items-center justify-center">
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
                      <span className="px-2 py-1 bg-[var(--surface-hover)] rounded-md text-xs font-bold">{emp.department}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {emp.isActive ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <XIcon className="w-4 h-4 text-red-500 mx-auto" />}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" className="p-2" onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }}>
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </Button>
                      <Button variant="ghost" className="p-2" onClick={() => handleDelete(emp.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
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
          // To update local state without full reload we could fetch again, or just rely on router.refresh() if page is server component.
          // Since we passed initialEmployees, router.refresh() will fetch new data and pass it as props, updating the state.
          // Wait, router.refresh() doesn't update the local useState immediately, so we could just reload.
          window.location.reload();
        }}
      />
    </div>
  );
}
