"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Shield, UserCheck, UserX, RefreshCw, KeyRound, Building } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type UserItem = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  sessionVersion: number;
  createdAt: string;
  clientMemberships?: Array<{
    id: string;
    role: string;
    client: {
      id: string;
      company: string;
    };
  }>;
};

const ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin", variant: "danger" },
  { value: "SALES_ADMIN", label: "Sales Admin", variant: "warning" },
  { value: "SUPPORT_ADMIN", label: "Support Admin", variant: "info" },
  { value: "STAFF", label: "Staff", variant: "purple" },
  { value: "CLIENT", label: "Client B2B", variant: "success" },
  { value: "CANDIDATE", label: "Candidate", variant: "default" },
] as const;

export function UsersList({ initialUsers }: { initialUsers: UserItem[] }) {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
    };

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create user");

      setUsers((prev) => [result, ...prev]);
      setIsAdding(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update role");

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to toggle user status");

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update user status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRevokeSessions = async (userId: string) => {
    if (!confirm("Revoke all active sessions for this user? They will be forced to log in again.")) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revokeSessions: true }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to revoke sessions");

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, sessionVersion: result.sessionVersion } : u))
      );
      alert("User sessions revoked successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to revoke sessions");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const roleObj = ROLES.find((r) => r.value === role);
    const label = roleObj?.label || role;
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge variant="error">{label}</Badge>;
      case "SALES_ADMIN":
        return <Badge variant="warning">{label}</Badge>;
      case "SUPPORT_ADMIN":
        return <Badge variant="info">{label}</Badge>;
      case "STAFF":
        return <Badge variant="gradient">{label}</Badge>;
      case "CLIENT":
        return <Badge variant="success">{label}</Badge>;
      default:
        return <Badge variant="default">{label}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary">User & Role Management</h1>
          <p className="text-sm text-text-secondary">Manage platform accounts, canonical RBAC roles, and access status.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search user or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 pe-4 py-2 bg-surface-default border border-border-default rounded-lg text-sm focus:outline-none focus:border-accent w-full md:w-64"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-surface-default border border-border-default rounded-lg text-sm"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <Button className="gap-2" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" /> Create User
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-surface-default rounded-2xl w-full max-w-lg p-6 border border-border-default shadow-xl animate-in fade-in zoom-in duration-200 space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-text-primary">Create Platform User</h2>
              <button type="button" onClick={() => setIsAdding(false)} className="text-text-tertiary hover:text-text-primary">
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">Full Name</label>
              <input name="name" placeholder="John Doe" className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">Email Address *</label>
              <input required type="email" name="email" placeholder="user@e3.qa" className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">Initial Password (Optional)</label>
              <input type="password" name="password" placeholder="Leave empty for magic claim link" className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">Canonical RBAC Role *</label>
              <select required name="role" defaultValue="STAFF" className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm">
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Save User"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface-default border border-border-default rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-hover border-b border-border-default text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Canonical Role</th>
                <th className="px-6 py-4 font-medium">Tenant Memberships</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Session Version</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-tertiary">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary">{u.name || "Unnamed User"}</div>
                      <div className="text-xs text-text-tertiary">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(u.role)}
                        <select
                          value={u.role}
                          disabled={updatingId === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs bg-transparent border border-border-default rounded px-1.5 py-1 text-text-secondary"
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.clientMemberships && u.clientMemberships.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.clientMemberships.map((m) => (
                            <span key={m.id} className="inline-flex items-center gap-1 text-[11px] bg-surface-hover border border-border-default rounded px-2 py-0.5 text-text-secondary">
                              <Building className="w-3 h-3 text-accent" />
                              {m.client.company} ({m.role})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-text-tertiary">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400 font-medium">
                          <UserCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400 font-medium">
                          <UserX className="w-3.5 h-3.5" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-text-secondary">
                      v{u.sessionVersion || 1}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updatingId === u.id}
                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                        className={u.isActive ? "text-amber-400 hover:bg-amber-400/10" : "text-green-400 hover:bg-green-400/10"}
                      >
                        {u.isActive ? "Suspend" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updatingId === u.id}
                        onClick={() => handleRevokeSessions(u.id)}
                        className="text-red-400 hover:bg-red-400/10"
                        title="Revoke active sessions"
                      >
                        <KeyRound className="w-3.5 h-3.5" /> Revoke
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
