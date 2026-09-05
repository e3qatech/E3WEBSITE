"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "@/components/layout/LocaleProvider";
import { Search, Plus, Shield, UserCheck, KeyRound, Building, Edit, Lock, Snowflake, Trash2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type UserItem = {
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

export const ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin", labelAr: "المدير العام", variant: "error" },
  { value: "EVENTS_ADMIN", label: "Events Admin (Packages)", labelAr: "مدير باقات الفعاليات", variant: "purple" },
  { value: "EVENTS_TEAM", label: "Events Team Coordinator", labelAr: "منسق فريق الفعاليات", variant: "purple" },
  { value: "B2C_ADMIN", label: "B2C Admin", labelAr: "مدير الأفراد (B2C)", variant: "purple" },
  { value: "B2B_ADMIN", label: "B2B Admin", labelAr: "مدير الشركات (B2B)", variant: "warning" },
  { value: "HR_ADMIN", label: "HR Admin", labelAr: "مدير الموارد البشرية", variant: "info" },
  { value: "OPERATIONS_ADMIN", label: "Operations Admin", labelAr: "مدير العمليات", variant: "warning" },
  { value: "STAFF", label: "Staff", labelAr: "طاقم العمل", variant: "purple" },
  { value: "CLIENT", label: "Client / Business User", labelAr: "عميل / حساب أعمال", variant: "success" },
  { value: "CANDIDATE", label: "Candidate / Applicant", labelAr: "مرشح / متقدم للوظيفة", variant: "default" },
  { value: "SALES_ADMIN", label: "Sales Admin (B2B)", labelAr: "مدير المبيعات (B2B)", variant: "warning" },
  { value: "SUPPORT_ADMIN", label: "Support Admin (B2C)", labelAr: "مدير الدعم (B2C)", variant: "info" },
] as const;

export function UsersList({ initialUsers }: { initialUsers: UserItem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale: contextLocale } = useLocale();
  const isAr = pathname?.startsWith("/ar") || contextLocale === "ar";

  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "frozen">("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
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
      if (!res.ok) throw new Error(result.error || (isAr ? "فشل إنشاء المستخدم" : "Failed to create user"));

      setUsers((prev) => [result, ...prev]);
      setIsAdding(false);
      router.refresh();
      alert(isAr ? "تم إنشاء المستخدم بنجاح." : "User created successfully.");
    } catch (err: any) {
      alert(err.message || (isAr ? "فشل إنشاء المستخدم" : "Failed to create user"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
    };

    if (editingUser.role !== data.role) {
      const confirmRoleMsg = isAr
        ? `هل أنت متأكد من رغبتك في تغيير دور الأمان للمستخدم ${editingUser.email} من "${editingUser.role}" إلى "${data.role}"؟`
        : `Are you sure you want to change the security role for ${editingUser.email} from "${editingUser.role}" to "${data.role}"?`;
      if (!confirm(confirmRoleMsg)) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || (isAr ? "فشل تحديث بيانات المستخدم" : "Failed to update user"));

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...result } : u))
      );
      setEditingUser(null);
      alert(isAr ? "تم تحديث بيانات المستخدم وصلاحياته بنجاح." : "User credentials updated successfully.");
    } catch (err: any) {
      alert(err.message || (isAr ? "فشل تحديث بيانات المستخدم" : "Failed to update user"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser || !newPassword) return;
    const confirmPwdMsg = isAr
      ? `هل أنت متأكد من إعادة تعيين كلمة المرور لـ ${passwordUser.email}؟ سيؤدي ذلك فوراً إلى إلغاء جميع الجلسات النشطة لهذا الحساب.`
      : `Are you sure you want to reset the password for ${passwordUser.email}? This will immediately invalidate all active sessions for this account.`;
    if (!confirm(confirmPwdMsg)) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/users/${passwordUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || (isAr ? "فشل تحديث كلمة المرور" : "Failed to update password"));

      setUsers((prev) =>
        prev.map((u) => (u.id === passwordUser.id ? { ...u, sessionVersion: result.sessionVersion } : u))
      );
      setPasswordUser(null);
      setNewPassword("");
      alert(isAr ? "تم تحديث كلمة المرور بنجاح وإلغاء جميع الجلسات القديمة." : "User password updated successfully. Active sessions revoked.");
    } catch (err: any) {
      alert(err.message || (isAr ? "فشل تحديث كلمة المرور" : "Failed to update password"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFreezeStatus = async (userId: string, currentStatus: boolean) => {
    const actionName = currentStatus ? (isAr ? "تجميد" : "Freeze") : (isAr ? "إلغاء تجميد" : "Unfreeze");
    const confirmFreezeMsg = isAr
      ? `هل تريد ${actionName} هذا الحساب؟ ${currentStatus ? "سيتم إنهاء جميع الجلسات النشطة فوراً ومنعه من تسجيل الدخول." : "سيتمكن المستخدم من تسجيل الدخول مجدداً."}`
      : `${actionName} this user account? ${currentStatus ? "Their active login sessions will be immediately terminated and login will be blocked." : "The user will be able to log in again."}`;
    if (!confirm(confirmFreezeMsg)) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || (isAr ? `فشل ${actionName} الحساب` : `Failed to ${actionName.toLowerCase()} account`));

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus, sessionVersion: result.sessionVersion || u.sessionVersion } : u))
      );
    } catch (err: any) {
      alert(err.message || (isAr ? "فشل تحديث حالة الحساب" : "Failed to update account status"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRevokeSessions = async (userId: string) => {
    const confirmRevokeMsg = isAr
      ? "هل تريد إلغاء جميع الجلسات النشطة لهذا المستخدم؟ سيُطلب منه تسجيل الدخول مجدداً على جميع الأجهزة."
      : "Revoke all active sessions for this user? They will be forced to log in again on all devices.";
    if (!confirm(confirmRevokeMsg)) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revokeSessions: true }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || (isAr ? "فشل إلغاء الجلسات" : "Failed to revoke sessions"));

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, sessionVersion: result.sessionVersion } : u))
      );
      alert(isAr ? "تم إلغاء جميع جلسات المستخدم بنجاح." : "User sessions revoked successfully.");
    } catch (err: any) {
      alert(err.message || (isAr ? "فشل إلغاء الجلسات" : "Failed to revoke sessions"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || (isAr ? "فشل حذف حساب المستخدم" : "Failed to delete user account"));
      }

      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
      alert(isAr ? `تم حذف حساب ${deletingUser.email} نهائياً.` : `User account ${deletingUser.email} has been permanently deleted.`);
    } catch (err: any) {
      alert(err.message || (isAr ? "فشل حذف حساب المستخدم" : "Failed to delete user account"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "frozen" && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    const roleObj = ROLES.find((r) => r.value === role);
    const label = (isAr ? roleObj?.labelAr : roleObj?.label) || role;
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge variant="error">{label}</Badge>;
      case "EVENTS_ADMIN":
      case "EVENTS_TEAM":
      case "B2C_ADMIN":
      case "STAFF":
        return <Badge variant="gradient">{label}</Badge>;
      case "B2B_ADMIN":
      case "SALES_ADMIN":
      case "OPERATIONS_ADMIN":
        return <Badge variant="warning">{label}</Badge>;
      case "HR_ADMIN":
      case "SUPPORT_ADMIN":
        return <Badge variant="info">{label}</Badge>;
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
          <h2 className="text-base font-bold text-text-primary">
            {isAr ? "حسابات المنصة وتعيين صلاحيات الأدوار" : "Platform Accounts & Role Assignments"}
          </h2>
          <p className="text-xs text-text-secondary">
            {isAr
              ? "استعراض الحسابات النشطة، تعيين الأدوار والصلاحيات، تجميد الحسابات المشبوهة، حذف الحسابات، وإلغاء الجلسات."
              : "View active accounts, assign permissions, revoke sessions, freeze compromised credentials, or delete users."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder={isAr ? "بحث بالاسم أو البريد..." : "Search user or email..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 pe-4 py-2 bg-surface-default border border-border-default rounded-lg text-sm focus:outline-none focus:border-accent w-full md:w-60"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-surface-default border border-border-default rounded-lg text-sm"
          >
            <option value="">{isAr ? "جميع الأدوار" : "All Roles"}</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {isAr ? r.labelAr : r.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-surface-default border border-border-default rounded-lg text-sm"
          >
            <option value="">{isAr ? "جميع الحالات" : "All Statuses"}</option>
            <option value="active">{isAr ? "الحسابات النشطة فقط" : "Active Accounts Only"}</option>
            <option value="frozen">{isAr ? "الحسابات المجمدة فقط" : "Frozen Accounts Only"}</option>
          </select>

          <Button className="gap-2" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" /> {isAr ? "إضافة مستخدم جديد" : "Create User"}
          </Button>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-surface-default rounded-2xl w-full max-w-lg p-6 border border-border-default shadow-xl animate-in fade-in zoom-in duration-200 space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-text-primary">
                {isAr ? "إضافة مستخدم جديد للمنصة" : "Create Platform User"}
              </h2>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">
                {isAr ? "الاسم الكامل" : "Full Name"}
              </label>
              <input
                name="name"
                placeholder={isAr ? "محمد عبد الله" : "John Doe"}
                className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">
                {isAr ? "البريد الإلكتروني *" : "Email Address *"}
              </label>
              <input
                required
                type="email"
                name="email"
                placeholder="user@e3.qa"
                className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">
                {isAr ? "كلمة المرور الأولية (اختياري)" : "Initial Password (Optional)"}
              </label>
              <input
                type="password"
                name="password"
                placeholder={isAr ? "٨ أحرف على الأقل" : "Min. 8 chars with mixed case & number"}
                className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">
                {isAr ? "الدور الأمني (RBAC) *" : "Canonical RBAC Role *"}
              </label>
              <select
                required
                name="role"
                defaultValue="STAFF"
                className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {isAr ? r.labelAr : r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isAr
                    ? "جاري الحفظ..."
                    : "Creating..."
                  : isAr
                  ? "حفظ المستخدم"
                  : "Save User"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT USER CREDENTIALS MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleEditUser}
            className="bg-surface-default rounded-2xl w-full max-w-lg p-6 border border-border-default shadow-xl animate-in fade-in zoom-in duration-200 space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-text-primary">
                {isAr ? "تعديل بيانات المستخدم والدور" : "Edit User Credentials"}
              </h2>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">
                {isAr ? "الاسم الكامل" : "Full Name"}
              </label>
              <input
                name="name"
                defaultValue={editingUser.name || ""}
                placeholder={isAr ? "محمد عبد الله" : "John Doe"}
                className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">
                {isAr ? "البريد الإلكتروني *" : "Email Address *"}
              </label>
              <input
                required
                type="email"
                name="email"
                defaultValue={editingUser.email}
                placeholder="user@e3.qa"
                className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">
                {isAr ? "الدور الأمني (RBAC) *" : "Canonical RBAC Role *"}
              </label>
              <select
                required
                name="role"
                defaultValue={editingUser.role}
                className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {isAr ? r.labelAr : r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isAr
                    ? "جاري التحديث..."
                    : "Updating..."
                  : isAr
                  ? "تحديث البيانات"
                  : "Update Credentials"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* CHANGE USER PASSWORD MODAL */}
      {passwordUser && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAdminChangePassword}
            className="bg-surface-default rounded-2xl w-full max-w-md p-6 border border-border-default shadow-xl animate-in fade-in zoom-in duration-200 space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-bold text-text-primary">
                  {isAr ? "تعيين كلمة مرور للمستخدم" : "Set User Password"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPasswordUser(null)}
                className="text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-text-secondary">
              {isAr ? (
                <>
                  تعيين كلمة مرور جديدة للحساب <strong className="text-text-primary font-mono">{passwordUser.email}</strong>. سيؤدي هذا الإجراء تلقائياً إلى إلغاء جميع جلسات تسجيل الدخول الحالية لهذا الحساب على كافة الأجهزة.
                </>
              ) : (
                <>
                  Set a new password for <strong className="text-text-primary font-mono">{passwordUser.email}</strong>. This will automatically invalidate all existing login sessions across all devices for this account.
                </>
              )}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">
                {isAr ? "كلمة المرور الجديدة *" : "New Password *"}
              </label>
              <input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isAr ? "٨ أحرف على الأقل" : "At least 8 characters"}
                className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm font-mono"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setPasswordUser(null)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isSubmitting || !newPassword}>
                {isSubmitting
                  ? isAr
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : isAr
                  ? "تعيين كلمة المرور"
                  : "Set Password"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-default rounded-2xl w-full max-w-md p-6 border border-rose-500/30 shadow-2xl animate-in fade-in zoom-in duration-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  {isAr ? "تأكيد حذف حساب المستخدم" : "Confirm Permanent Deletion"}
                </h2>
                <p className="text-xs text-rose-400 font-medium">
                  {isAr ? "إجراء خطير ولا يمكن التراجع عنه" : "Destructive irreversible action"}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-hover border border-border-default space-y-1.5 text-xs text-text-secondary">
              <div>
                <span className="font-bold text-text-primary">{isAr ? "الاسم: " : "Name: "}</span>
                {deletingUser.name || (isAr ? "غير محدد" : "Unnamed")}
              </div>
              <div>
                <span className="font-bold text-text-primary">{isAr ? "البريد: " : "Email: "}</span>
                <span className="font-mono text-text-primary">{deletingUser.email}</span>
              </div>
              <div>
                <span className="font-bold text-text-primary">{isAr ? "الدور الأمني: " : "Role: "}</span>
                <span>{deletingUser.role}</span>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              {isAr
                ? "سيؤدي هذا الإجراء إلى حذف هذا الحساب نهائياً من قاعدة البيانات، بالإضافة إلى إنهاء جميع الجلسات النشطة وإلغاء العضويات والارتباطات. لن تتمكن من استرجاع هذا الحساب بعد الحذف."
                : "This will permanently remove this user account from the database, terminate all active sessions, and detach associated permissions. This action cannot be reversed."}
            </p>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setDeletingUser(null)}
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteUser}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {isSubmitting
                  ? (isAr ? "جاري الحذف..." : "Deleting...")
                  : (isAr ? "نعم، احذف الحساب نهائياً" : "Yes, Delete Account")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface-default border border-border-default rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-hover border-b border-border-default text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium">{isAr ? "المستخدم" : "User"}</th>
                <th className="px-6 py-4 font-medium">{isAr ? "الدور الأمني" : "Canonical Role"}</th>
                <th className="px-6 py-4 font-medium">{isAr ? "عضويات المنظمة" : "Tenant Memberships"}</th>
                <th className="px-6 py-4 font-medium">{isAr ? "حالة الحساب" : "Account Status"}</th>
                <th className="px-6 py-4 font-medium">{isAr ? "إصدار الجلسة" : "Session Version"}</th>
                <th className="px-6 py-4 font-medium text-right">{isAr ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-tertiary">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    {isAr ? "لم يتم العثور على مستخدمين يطابقون البحث." : "No users found matching query."}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary">{u.name || (isAr ? "مستخدم بدون اسم" : "Unnamed User")}</div>
                      <div className="text-xs text-text-tertiary font-mono">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(u.role)}
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
                        <span className="text-xs text-text-tertiary">{isAr ? "لا يوجد" : "None"}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400 font-medium bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                          <UserCheck className="w-3.5 h-3.5" /> {isAr ? "نشط" : "ACTIVE"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-bold bg-rose-500/15 px-2 py-1 rounded border border-rose-500/30 animate-pulse">
                          <Snowflake className="w-3.5 h-3.5" /> {isAr ? "مجمد" : "FROZEN"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-text-secondary">
                      v{u.sessionVersion || 1}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5 rtl:space-x-reverse">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updatingId === u.id}
                        onClick={() => setEditingUser(u)}
                        className="text-text-secondary hover:text-text-primary cursor-pointer"
                        title={isAr ? "تعديل البيانات والدور" : "Edit credentials (name, email, role)"}
                      >
                        <Edit className="w-3.5 h-3.5 me-1" /> {isAr ? "تعديل" : "Edit"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updatingId === u.id}
                        onClick={() => setPasswordUser(u)}
                        className="text-accent hover:bg-accent/10 cursor-pointer"
                        title={isAr ? "تعيين كلمة مرور جديدة" : "Set new password"}
                      >
                        <Lock className="w-3.5 h-3.5 me-1" /> {isAr ? "كلمة المرور" : "Password"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updatingId === u.id}
                        onClick={() => handleToggleFreezeStatus(u.id, u.isActive)}
                        className={`cursor-pointer ${u.isActive ? "text-rose-400 hover:bg-rose-400/10" : "text-emerald-400 hover:bg-emerald-400/10"}`}
                        title={u.isActive ? (isAr ? "تجميد الحساب وإلغاء الجلسات" : "Freeze account and revoke sessions") : (isAr ? "إلغاء تجميد الحساب" : "Unfreeze account")}
                      >
                        {u.isActive ? (
                          <>
                            <Snowflake className="w-3.5 h-3.5 me-1" /> {isAr ? "تجميد" : "Freeze"}
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 me-1" /> {isAr ? "إلغاء التجميد" : "Unfreeze"}
                          </>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updatingId === u.id}
                        onClick={() => handleRevokeSessions(u.id)}
                        className="text-amber-400 hover:bg-amber-400/10 cursor-pointer"
                        title={isAr ? "إلغاء الجلسات النشطة" : "Revoke active sessions"}
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updatingId === u.id}
                        onClick={() => setDeletingUser(u)}
                        className="text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                        title={isAr ? "حذف حساب المستخدم نهائياً" : "Delete user account permanently"}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
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
