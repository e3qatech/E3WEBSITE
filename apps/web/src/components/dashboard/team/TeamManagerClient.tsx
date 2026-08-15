"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  User,
  ExternalLink,
  AlertTriangle,
  GripVertical,
  Star,
  Eye,
  EyeOff,
  Globe,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { EmployeeFormModal } from "./EmployeeFormModal";
import { useRouter } from "next/navigation";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";
import { analyzeTeamMemberDataQuality } from "@/lib/team/team-resolver";

type FilterType = "all" | "visible" | "hidden" | "featured" | "missing_arabic";

export function TeamManagerClient({
  initialEmployees,
  locale = "en",
}: {
  initialEmployees: any[];
  locale?: string;
}) {
  const router = useRouter();
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderSaveStatus, setOrderSaveStatus] = useState<string | null>(null);

  // Quality reports map
  const qualityReports = useMemo(() => {
    const map = new Map<string, ReturnType<typeof analyzeTeamMemberDataQuality>>();
    employees.forEach((emp) => {
      map.set(emp.id, analyzeTeamMemberDataQuality(emp, employees));
    });
    return map;
  }, [employees]);

  // Counts for filter chips
  const counts = useMemo(() => {
    let visible = 0;
    let hidden = 0;
    let featured = 0;
    let missingArabic = 0;

    employees.forEach((emp) => {
      const q = qualityReports.get(emp.id);
      if (emp.isActive && emp.showOnTeamPage !== false) visible++;
      else hidden++;

      if (emp.isFeatured) featured++;
      if (q?.hasMissingArabic) missingArabic++;
    });

    return {
      all: employees.length,
      visible,
      hidden,
      featured,
      missingArabic,
    };
  }, [employees, qualityReports]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = qualityReports.get(emp.id);

      // Search match
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        (emp.firstName || "").toLowerCase().includes(query) ||
        (emp.lastName || "").toLowerCase().includes(query) ||
        (emp.firstNameAr || "").toLowerCase().includes(query) ||
        (emp.lastNameAr || "").toLowerCase().includes(query) ||
        (emp.designation || "").toLowerCase().includes(query) ||
        (emp.department || "").toLowerCase().includes(query) ||
        (emp.slug || "").toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Filter match
      if (activeFilter === "visible") return emp.isActive && emp.showOnTeamPage !== false;
      if (activeFilter === "hidden") return !emp.isActive || emp.showOnTeamPage === false;
      if (activeFilter === "featured") return Boolean(emp.isFeatured);
      if (activeFilter === "missing_arabic") return Boolean(q?.hasMissingArabic);

      return true;
    });
  }, [employees, searchTerm, activeFilter, qualityReports]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      handleDragEnd();
      return;
    }

    // Reorder array locally
    const reordered = [...employees];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    // Update state immediately for zero lag
    setEmployees(reordered);
    handleDragEnd();

    // Transactionally save order to backend
    setIsSavingOrder(true);
    setOrderSaveStatus("Saving order...");
    try {
      const orderedIds = reordered.map((emp) => emp.id);
      const res = await fetch("/api/team/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });

      if (res.ok) {
        setOrderSaveStatus("Order saved!");
        setTimeout(() => setOrderSaveStatus(null), 2500);
      } else {
        setOrderSaveStatus("Failed to save order");
        setTimeout(() => setOrderSaveStatus(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setOrderSaveStatus("Order save error");
      setTimeout(() => setOrderSaveStatus(null), 3000);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member? This action is irreversible.")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
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
        description="Manage employee profiles, executive bios, departments, drag-and-drop sequencing, and bilingual Arabic translations."
        breadcrumbs={[
          { label: "HR & Team", href: "/dashboard/team" },
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
        {/* Controls Bar: Filters & Search */}
        <div className="p-4 border-b border-[var(--border-level-1)] flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-[var(--surface-hover)]/30">
          
          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-level-1)]"
              }`}
            >
              All ({counts.all})
            </button>

            <button
              onClick={() => setActiveFilter("visible")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === "visible"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-[var(--surface-hover)] text-emerald-400 hover:text-emerald-300 border border-[var(--border-level-1)]"
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Visible ({counts.visible})
            </button>

            <button
              onClick={() => setActiveFilter("hidden")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === "hidden"
                  ? "bg-zinc-700 text-white shadow-sm"
                  : "bg-[var(--surface-hover)] text-zinc-400 hover:text-zinc-300 border border-[var(--border-level-1)]"
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" /> Hidden ({counts.hidden})
            </button>

            <button
              onClick={() => setActiveFilter("featured")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === "featured"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-[var(--surface-hover)] text-purple-400 hover:text-purple-300 border border-[var(--border-level-1)]"
              }`}
            >
              <Star className="w-3.5 h-3.5" /> Featured ({counts.featured})
            </button>

            <button
              onClick={() => setActiveFilter("missing_arabic")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === "missing_arabic"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-[var(--surface-hover)] text-amber-400 hover:text-amber-300 border border-[var(--border-level-1)]"
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Missing Arabic ({counts.missingArabic})
            </button>
          </div>

          {/* Search and Status Notification */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {orderSaveStatus && (
              <span className="text-xs font-bold flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--surface-hover)] text-[var(--color-primary)] border border-[var(--border-level-1)]">
                {isSavingOrder && <Loader2 className="w-3 h-3 animate-spin" />}
                {orderSaveStatus}
              </span>
            )}

            <div className="relative w-full lg:w-64">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <Input
                placeholder="Search by name, slug, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-9 w-full text-xs"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-[var(--surface-hover)]/60 text-[var(--text-secondary)] uppercase text-xs font-bold border-b border-[var(--border-level-1)]">
              <tr>
                <th className="px-4 py-4 w-12 text-center">Order</th>
                <th className="px-6 py-4 text-start">Profile</th>
                <th className="px-6 py-4 text-start">Name & Arabic</th>
                <th className="px-6 py-4 text-start">Designation & Dept</th>
                <th className="px-6 py-4 text-start">Status & Badges</th>
                <th className="px-6 py-4 text-start">Data Quality</th>
                <th className="px-6 py-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-[var(--text-tertiary)] font-mono text-xs"
                  >
                    No team members found matching the selected filter or search query.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => {
                  const quality = qualityReports.get(emp.id) || analyzeTeamMemberDataQuality(emp, employees);
                  const isPubliclyVisible = emp.isActive && emp.showOnTeamPage !== false;
                  const isBeingDragged = draggedIndex === index;
                  const isDropTarget = dragOverIndex === index;

                  return (
                    <tr
                      key={emp.id}
                      draggable={!searchTerm && activeFilter === "all"}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`border-b border-[var(--border-level-1)] transition-colors ${
                        isBeingDragged
                          ? "opacity-30 bg-[var(--surface-hover)]"
                          : isDropTarget
                          ? "border-t-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                          : "hover:bg-[var(--surface-hover)]/40"
                      }`}
                    >
                      {/* Grip / Display Order */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {!searchTerm && activeFilter === "all" ? (
                            <span
                              className="cursor-grab active:cursor-grabbing text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--surface-hover)]"
                              title="Drag to reorder"
                            >
                              <GripVertical className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="text-xs font-mono text-[var(--text-tertiary)]">
                              #{index + 1}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Portrait Avatar */}
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--surface-hover)] flex items-center justify-center border border-[var(--border-level-1)] relative">
                          {emp.profileImage ? (
                            <img
                              src={emp.profileImage}
                              alt={emp.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-[var(--text-tertiary)]" />
                          )}
                          {emp.isFeatured && (
                            <div className="absolute -top-1 -end-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm">
                              ★
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name & Arabic */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--text-primary)] whitespace-nowrap flex items-center gap-2">
                          <span>
                            {emp.firstName} {emp.lastName}
                          </span>
                          {emp.firstNameAr && (
                            <span className="text-xs font-normal text-emerald-400 font-arabic">
                              ({emp.firstNameAr} {emp.lastNameAr || ""})
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-[var(--text-tertiary)] flex items-center gap-1.5 mt-0.5">
                          <span>/{emp.slug}</span>
                          {isPubliclyVisible && (
                            <Link
                              href={`/${locale}/b2b/team/${emp.slug}`}
                              target="_blank"
                              className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-0.5"
                              title="View Public Profile"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </td>

                      {/* Designation & Department */}
                      <td className="px-6 py-4">
                        <div className="text-[var(--text-secondary)] font-medium">
                          {emp.designation}
                        </div>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 bg-[var(--surface-hover)] rounded text-[11px] font-bold border border-[var(--border-level-1)] text-[var(--text-tertiary)]">
                            {emp.department}
                          </span>
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Visible / Hidden Badge */}
                          {isPubliclyVisible ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Eye className="w-3 h-3" /> Visible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-700/40 text-zinc-400 border border-zinc-700/60">
                              <EyeOff className="w-3 h-3" /> Hidden
                            </span>
                          )}

                          {/* Featured Badge */}
                          {emp.isFeatured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              <Star className="w-3 h-3" /> Featured
                            </span>
                          )}

                          {/* Missing Arabic Badge */}
                          {quality.hasMissingArabic && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              title="Arabic fields are incomplete"
                            >
                              <Globe className="w-3 h-3" /> Missing Arabic
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Data Quality Report */}
                      <td className="px-6 py-4">
                        {quality.issues.length === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Check className="w-3 h-3" /> Clean
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {quality.issues.slice(0, 2).map((issue, idx) => (
                              <span
                                key={idx}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  issue.severity === "ERROR"
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    : issue.severity === "WARNING"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                }`}
                                title={issue.messageEn}
                              >
                                <AlertTriangle className="w-2.5 h-2.5" />
                                {issue.code.replace(/_/g, " ")}
                              </span>
                            ))}
                            {quality.issues.length > 2 && (
                              <span className="text-[10px] text-[var(--text-tertiary)] font-bold">
                                +{quality.issues.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingEmployee(emp);
                              setIsModalOpen(true);
                            }}
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
                  );
                })
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
