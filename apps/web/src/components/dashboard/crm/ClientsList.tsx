"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Globe, Building2, Plus, Trash2, Users, UserPlus, ExternalLink, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"
import { useLocale } from "@/components/layout/LocaleProvider"
import { localizeHref } from "@/lib/url-helper"

type Client = {
  id: string
  company: string
  type: string
  industry: string | null
  website: string | null
  assignedRepId: string | null
  createdAt: string
}

type Member = {
  id: string
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
  isActive: boolean
  user: {
    id: string
    name: string | null
    email: string
    role: string
    isActive: boolean
  }
}

export function ClientsList({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter()
  let locale: 'en' | 'ar' = 'en'
  let dir: 'ltr' | 'rtl' = 'ltr'
  try {
    const localeCtx = useLocale()
    if (localeCtx) {
      locale = (localeCtx.locale as 'en' | 'ar') || 'en'
      dir = localeCtx.dir || (locale === 'ar' ? 'rtl' : 'ltr')
    }
  } catch {
    // Fallback if rendered outside LocaleProvider
  }

  const isAr = locale === 'ar'
  const [clients, setClients] = useState(initialClients || [])
  const [search, setSearch] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Tenant Membership Modal state
  const [activeClient, setActiveClient] = useState<Client | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [memberEmail, setMemberEmail] = useState("")
  const [memberRole, setMemberRole] = useState<"OWNER" | "ADMIN" | "MEMBER" | "VIEWER">("MEMBER")
  const [isAddingMember, setIsAddingMember] = useState(false)

  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      company: formData.get("company"),
      type: formData.get("type"),
      industry: formData.get("industry"),
      website: formData.get("website")
    }

    try {
      const res = await fetch("/api/crm/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!res.ok) throw new Error()
      
      const newClient = await res.json()
      setClients(prev => [newClient, ...prev])
      setIsAdding(false)
      router.refresh()
    } catch {
      alert(isAr ? "فشل إضافة العميل" : "Failed to add client")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذا العميل من قاعدة البيانات؟" : "Are you sure you want to delete this client?")) return
    try {
      const res = await fetch(`/api/crm/clients/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()

      setClients(prev => prev.filter(c => c.id !== id))
      router.refresh()
    } catch {
      alert(isAr ? "فشل حذف العميل" : "Failed to delete client")
    }
  }

  const handleOpenMembers = async (client: Client) => {
    setActiveClient(client)
    setIsLoadingMembers(true)
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/members`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (_e) {
      alert(isAr ? "فشل تحميل أعضاء الشركة" : "Failed to load company members")
    } finally {
      setIsLoadingMembers(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeClient || !memberEmail) return
    setIsAddingMember(true)

    try {
      const res = await fetch(`/api/admin/clients/${activeClient.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: memberEmail, role: memberRole })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to add member")

      setMembers(prev => [data, ...prev.filter(m => m.id !== data.id)])
      setMemberEmail("")
    } catch (err: any) {
      alert(err.message || (isAr ? "فشل إضافة العضو إلى حساب الشركة" : "Failed to add member to client tenant"))
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleMemberRoleChange = async (memberId: string, newRole: string) => {
    if (!activeClient) return
    try {
      const res = await fetch(`/api/admin/clients/${activeClient.id}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      })
      const updated = await res.json()
      if (!res.ok) throw new Error(updated.error)

      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: updated.role } : m))
    } catch (err: any) {
      alert(err.message || (isAr ? "فشل تعديل صلاحية العضو" : "Failed to update member role"))
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!activeClient || !confirm(isAr ? "إزالة هذا العضو من حساب الشركة؟" : "Remove this member from the company tenant?")) return
    try {
      const res = await fetch(`/api/admin/clients/${activeClient.id}/members/${memberId}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error()

      setMembers(prev => prev.filter(m => m.id !== memberId))
    } catch {
      alert(isAr ? "فشل إزالة العضو" : "Failed to remove member")
    }
  }

  const filtered = clients.filter(c => 
    c.company.toLowerCase().includes(search.toLowerCase()) || 
    (c.industry?.toLowerCase().includes(search.toLowerCase()) || false)
  )

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "B2B": return <Badge variant="info">B2B</Badge>
      case "GOVERNMENT": return <Badge variant="warning">{isAr ? "جهة حكومية" : "Government"}</Badge>
      case "AGENCY": return <Badge variant="success">{isAr ? "وكالة" : "Agency"}</Badge>
      default: return <Badge variant="default">{type}</Badge>
    }
  }

  return (
    <DashboardPageShell variant="wide">
      <div dir={dir} className="space-y-6">
        <DashboardPageHeader
          title={isAr ? "منظومة الحسابات والشركات في CRM" : "Clients & Multi-Tenant Directory"}
          description={
            isAr
              ? "إدارة حسابات الشركات، المؤسسات الحكومية، الوكالات، وعضويات المستخدمين في بوابات الأعمال."
              : "Manage corporate accounts, agencies, government partners, and company tenant memberships."
          }
          breadcrumbs={[
            { label: isAr ? "المبيعات و CRM" : "CRM & Sales", href: "/dashboard/crm/clients" },
            { label: isAr ? "دليل عملاء CRM" : "Clients Directory" },
          ]}
          badge={{ 
            label: isAr ? `${clients.length} حساب مؤسسة` : `${clients.length} Clients`, 
            variant: "indigo" 
          }}
          primaryAction={{
            label: isAr ? "إضافة عميل جديد" : "Add Client",
            onClick: () => setIsAdding(true),
            icon: <Plus className="w-4 h-4" />
          }}
        />

        {/* Architectural Ownership Separation Notice */}
        <div
          dir={dir}
          data-testid="crm-clients-boundary-banner"
          className="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>
                  {isAr
                    ? 'دليل شركاء وعملاء الواجهة العامة'
                    : 'Public B2B Partners & Clients Showcase'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono uppercase">
                  {isAr ? 'حدود النظام' : 'System Boundary'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 max-w-2xl leading-relaxed">
                {isAr ? (
                  <>
                    تتحكم هذه الواجهة في{' '}
                    <strong className="text-zinc-200">حسابات المؤسسات المعتمدة، عضويات العملاء، والصلاحيات التجارية</strong>.
                    لإدارة شعارات الشركاء في الواجهة العامة، عروض الرعاة، وترتيب الظهور التسويقي، انتقل إلى دليل الشركاء العام.
                  </>
                ) : (
                  <>
                    This manager controls <strong>authenticated organization tenant accounts, client memberships, and commercial access</strong>.
                    To configure public partner logos, sponsor showcases, and marketing display rankings, use the Public Clients Directory.
                  </>
                )}
              </p>
            </div>
          </div>

          <Link
            href={localizeHref('/dashboard/b2b/clients', locale)}
            data-testid="crm-b2b-clients-link"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-md"
          >
            <span>{isAr ? 'دليل الشركاء العام' : 'Public Partners Directory'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? "البحث في حسابات العملاء والشركات..." : "Search clients..."}
            className="w-full bg-surface-default border border-border-default rounded-xl py-3 ps-10 pe-4 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>

        {isAdding && (
          <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4">
            <form 
              onSubmit={handleAddClient}
              dir={dir}
              className="bg-surface-default rounded-2xl w-full max-w-lg p-6 border border-border-default shadow-xl animate-in fade-in zoom-in duration-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text-primary">
                  {isAr ? "إضافة مؤسسة / عميل جديد" : "New Client Entity"}
                </h2>
                <button type="button" onClick={() => setIsAdding(false)} className="text-text-tertiary hover:text-text-primary">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">{isAr ? "اسم الشركة / المؤسسة *" : "Company Name *"}</label>
                  <input required name="company" className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary">{isAr ? "النوع" : "Type"}</label>
                    <select name="type" className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm">
                      <option value="B2B">B2B</option>
                      <option value="GOVERNMENT">{isAr ? "جهة حكومية" : "Government"}</option>
                      <option value="AGENCY">{isAr ? "وكالة" : "Agency"}</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary">{isAr ? "القطاع / المجال" : "Industry"}</label>
                    <input name="industry" className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">{isAr ? "الموقع الإلكتروني" : "Website"}</label>
                  <input type="url" name="website" placeholder="https://" className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm" />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "إنشاء حساب العميل" : "Create Client")}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tenant Memberships Management Modal */}
        {activeClient && (
          <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div dir={dir} className="bg-surface-default rounded-2xl w-full max-w-2xl p-6 border border-border-default shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-border-default pb-4">
                <div>
                  <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-accent" /> {activeClient.company}
                  </h2>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {isAr 
                      ? "إدارة صلاحيات دخول المستخدمين وعضويات المؤسسة في بوابة الأعمال."
                      : "Manage user tenant access and membership permissions for this company."}
                  </p>
                </div>
                <button onClick={() => setActiveClient(null)} className="text-text-tertiary hover:text-text-primary">
                  ✕
                </button>
              </div>

              {/* Add Member Form */}
              <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3 bg-surface-hover p-4 rounded-xl border border-border-default">
                <div className="flex-1">
                  <input
                    type="email"
                    required
                    placeholder={isAr ? "البريد الإلكتروني للمستخدم..." : "User email address..."}
                    value={memberEmail}
                    onChange={e => setMemberEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-default border border-border-default rounded-lg text-sm"
                  />
                </div>
                <select
                  value={memberRole}
                  onChange={e => setMemberRole(e.target.value as any)}
                  className="px-3 py-2 bg-surface-default border border-border-default rounded-lg text-sm"
                >
                  <option value="OWNER">{isAr ? "مالك المؤسسة (Owner)" : "Tenant Owner"}</option>
                  <option value="ADMIN">{isAr ? "مدير الحساب (Admin)" : "Tenant Admin"}</option>
                  <option value="MEMBER">{isAr ? "عضو (Member)" : "Member"}</option>
                  <option value="VIEWER">{isAr ? "مشاهد (Viewer)" : "Viewer"}</option>
                </select>
                <Button type="submit" disabled={isAddingMember} className="gap-1.5 shrink-0">
                  <UserPlus className="w-4 h-4" /> {isAddingMember ? (isAr ? "جاري الإضافة..." : "Adding...") : (isAr ? "إضافة عضو" : "Add Member")}
                </Button>
              </form>

              {/* Members List Table */}
              <div className="border border-border-default rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left rtl:text-right text-sm whitespace-nowrap">
                  <thead className="bg-surface-hover text-text-secondary text-xs">
                    <tr>
                      <th className="px-4 py-3 font-medium">{isAr ? "المستخدم" : "User"}</th>
                      <th className="px-4 py-3 font-medium">{isAr ? "الدور العام" : "Global Role"}</th>
                      <th className="px-4 py-3 font-medium">{isAr ? "دور المؤسسة" : "Tenant Role"}</th>
                      <th className="px-4 py-3 font-medium text-right rtl:text-left">{isAr ? "الإجراء" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {isLoadingMembers ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-text-tertiary">
                          {isAr ? "جاري تحميل أعضاء المؤسسة..." : "Loading tenant members..."}
                        </td>
                      </tr>
                    ) : members.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-text-tertiary">
                          {isAr ? "لا يوجد أعضاء مرتبطين بهذه المؤسسة بعد." : "No members assigned to this client tenant yet."}
                        </td>
                      </tr>
                    ) : (
                      members.map(m => (
                        <tr key={m.id} className="hover:bg-surface-hover">
                          <td className="px-4 py-3">
                            <div className="font-bold text-text-primary text-xs">{m.user.name || "User"}</div>
                            <div className="text-[11px] text-text-tertiary">{m.user.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-text-secondary">{m.user.role}</span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={m.role}
                              onChange={e => handleMemberRoleChange(m.id, e.target.value)}
                              className="text-xs bg-surface-default border border-border-default rounded px-2 py-1 font-semibold text-accent"
                            >
                              <option value="OWNER">OWNER</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="MEMBER">MEMBER</option>
                              <option value="VIEWER">VIEWER</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right rtl:text-left">
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(m.id)} className="text-red-400 hover:bg-red-400/10">
                              {isAr ? "إزالة" : "Remove"}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2 border-t border-border-default">
                <Button variant="outline" onClick={() => setActiveClient(null)}>
                  {isAr ? "إغلاق" : "Close"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-surface-default border border-border-default rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-sm whitespace-nowrap">
              <thead className="bg-surface-hover border-b border-border-default text-text-secondary">
                <tr>
                  <th className="px-6 py-4 font-medium">{isAr ? "الشركة / المؤسسة" : "Company"}</th>
                  <th className="px-6 py-4 font-medium">{isAr ? "النوع" : "Type"}</th>
                  <th className="px-6 py-4 font-medium">{isAr ? "القطاع" : "Industry"}</th>
                  <th className="px-6 py-4 font-medium">{isAr ? "الموقع الإلكتروني" : "Website"}</th>
                  <th className="px-6 py-4 font-medium">{isAr ? "تاريخ الإضافة" : "Added On"}</th>
                  <th className="px-6 py-4 font-medium text-right rtl:text-left">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-tertiary">
                      <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      {isAr ? "لم يتم العثور على حسابات عملاء." : "No clients found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map(c => (
                    <tr key={c.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-text-primary">{c.company}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getTypeBadge(c.type)}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {c.industry || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {c.website ? (
                          <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-accent hover:underline">
                            <Globe className="w-4 h-4" /> {c.website.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          <span className="text-text-tertiary">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {new Date(c.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-QA' : 'en-US')}
                      </td>
                      <td className="px-6 py-4 text-right rtl:text-left space-x-2 rtl:space-x-reverse">
                        <Button variant="outline" size="sm" onClick={() => handleOpenMembers(c)} className="gap-1.5 text-xs">
                          <Users className="w-3.5 h-3.5" /> {isAr ? "الأعضاء" : "Members"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
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
    </DashboardPageShell>
  )
}
