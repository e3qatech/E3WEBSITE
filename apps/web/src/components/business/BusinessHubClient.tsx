"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  Users,
  ArrowRight,
  ArrowLeft,
  PlusCircle,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  Sparkles,
  Download,
  UserPlus,
  FileSpreadsheet,
  FileCode,
  File,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";
import { NewRfpModal } from "./NewRfpModal";
import { InviteMemberModal } from "./InviteMemberModal";

interface OrganizationData {
  id: string;
  company: string;
  type?: string;
  industry?: string | null;
  website?: string | null;
}

interface MemberData {
  id: string;
  role: string;
  user: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
  };
}

interface RfpDocument {
  id: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  pathname: string;
  createdAt: string | Date;
}

interface SanitizedRfp {
  id: string;
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  status: string;
  value?: number | null;
  interestServices?: any;
  createdAt: string | Date;
  updatedAt: string | Date;
  inquiries?: Array<{
    id: string;
    type: string;
    subject?: string | null;
    message: string;
    status: string;
    createdAt: string | Date;
  }>;
  activities?: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string | Date;
  }>;
  uploads?: RfpDocument[];
}

interface BusinessHubClientProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
  membershipRole?: string;
  organization: OrganizationData;
  members: MemberData[];
  rfps: SanitizedRfp[];
  locale: string;
}

export function BusinessHubClient({
  user,
  membershipRole = "MEMBER",
  organization,
  members = [],
  rfps = [],
  locale,
}: BusinessHubClientProps) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<"rfps" | "updates" | "documents" | "team">("rfps");
  const [currentRfps, setCurrentRfps] = useState<SanitizedRfp[]>(rfps);
  const [isRfpModalOpen, setIsRfpModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "NEW":
        return {
          label: isAr ? "تم التقديم" : "Submitted",
          bg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
          icon: Clock,
        };
      case "CONTACTED":
        return {
          label: isAr ? "قيد المراجعة" : "In Review",
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          icon: AlertCircle,
        };
      case "QUALIFIED":
        return {
          label: isAr ? "مؤهل للمشروع" : "Qualified",
          bg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
          icon: Sparkles,
        };
      case "PROPOSAL":
      case "PROPOSAL_SENT":
        return {
          label: isAr ? "عرض السعر جاهز" : "Proposal Ready",
          bg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
          icon: FileText,
        };
      case "NEGOTIATING":
        return {
          label: isAr ? "قيد المناقشة والتفاوض" : "In Discussion",
          bg: "bg-amber-500/15 border-amber-500/40 text-amber-300",
          icon: Clock,
        };
      case "WON":
        return {
          label: isAr ? "معتمد / قيد التنفيذ" : "Approved & Active",
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          icon: CheckCircle2,
        };
      case "LOST":
        return {
          label: isAr ? "مغلق" : "Closed",
          bg: "bg-zinc-800 border-zinc-700 text-zinc-400",
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          bg: "bg-zinc-800 border-zinc-700 text-zinc-300",
          icon: Clock,
        };
    }
  };

  const approvedRfps = currentRfps.filter(
    (r) => r.status === "WON" || r.status === "PROPOSAL" || r.status === "PROPOSAL_SENT"
  );

  const allDocuments = currentRfps.flatMap((r) =>
    (r.uploads || []).map((u) => ({
      ...u,
      rfpName: r.name,
      rfpId: r.id,
    }))
  );

  const isManager =
    membershipRole === "OWNER" ||
    membershipRole === "ADMIN" ||
    user.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-zinc-950" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Header Bar */}
      <header className="border-b border-white/10 bg-zinc-900/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/b2b`}
              className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              {isAr ? <ArrowRight className="w-4 h-4 text-emerald-400" /> : <ArrowLeft className="w-4 h-4 text-emerald-400" />}
              <span>{isAr ? "العودة للموقع الرئيسي" : "Public Site"}</span>
            </Link>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="font-extrabold text-sm tracking-tight text-white">{organization.company}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase">
                {membershipRole}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right rtl:text-left text-xs">
              <span className="font-bold text-white">{user.name || user.email}</span>
              <span className="text-zinc-400 text-[11px]">{user.email}</span>
            </div>
            <LogoutButton locale={locale} portal="business" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Organization Banner */}
        <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border border-white/10 p-6 sm:p-10 rounded-3xl shadow-2xl">
          <div className="absolute top-0 end-0 -mt-8 -me-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  {isAr ? "بوابة العملاء والمشاريع" : "Client Enterprise Portal"}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isAr ? "حساب معتمد" : "Verified Organization"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
                {organization.company}
              </h1>

              <p className="text-zinc-400 text-sm leading-relaxed">
                {isAr
                  ? `مرحباً بك في مساحة عمل ${organization.company}. يمكنك متابعة طلبات عروض الأسعار (RFP)، المستندات الهندسية المعتمدة، وتحديثات سير المشاريع.`
                  : `Welcome to the ${organization.company} workspace. Track your organization's RFPs, RFQs, approved architectural blueprints, and client-visible milestone updates.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRfpModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isAr ? "تقديم طلب مشروع (RFP)" : "Submit New RFP"}</span>
              </button>

              <Link
                href={`/${locale}/business/company`}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs transition-all"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>{isAr ? "بيانات الشركة" : "Company Profile"}</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
            <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                {isAr ? "إجمالي الطلبات (RFP/RFQ)" : "Total RFPs & Inquiries"}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                {currentRfps.length}
              </div>
            </div>

            <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                {isAr ? "العروض المعتمدة والنشطة" : "Approved / Active Projects"}
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400">
                {approvedRfps.length}
              </div>
            </div>

            <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                {isAr ? "المستندات والمخططات" : "Project Deliverables"}
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-sky-400">
                {allDocuments.length}
              </div>
            </div>

            <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                {isAr ? "أعضاء المؤسسة المعتمدون" : "Verified Team Members"}
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400">
                {members.length}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("rfps")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer",
              activeTab === "rfps"
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}
          >
            <FolderKanban className="w-4 h-4" />
            <span>{isAr ? "طلبات المشاريع وعروض الأسعار" : "RFPs & Inquiries"}</span>
            <span className="ms-1 px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px]">{currentRfps.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("updates")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer",
              activeTab === "updates"
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}
          >
            <Clock className="w-4 h-4" />
            <span>{isAr ? "تحديثات المشاريع" : "Project Updates"}</span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer",
              activeTab === "documents"
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? "المستندات والمخططات الهندسية" : "Documents & Blueprints"}</span>
            <span className="ms-1 px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px]">{allDocuments.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer",
              activeTab === "team"
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}
          >
            <Users className="w-4 h-4" />
            <span>{isAr ? "أعضاء المؤسسة" : "Organization Members"}</span>
            <span className="ms-1 px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px]">{members.length}</span>
          </button>
        </div>

        {/* TAB 1: RFPs & INQUIRIES */}
        {activeTab === "rfps" && (
          <div className="space-y-6">
            {currentRfps.length === 0 ? (
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-10 text-center space-y-4">
                <FolderKanban className="w-12 h-12 text-zinc-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    {isAr ? "لم يتم تقديم أي طلبات مشاريع حتى الآن" : "No RFPs or Inquiries Yet"}
                  </h3>
                  <p className="text-zinc-400 text-xs max-w-md mx-auto">
                    {isAr
                      ? "يمكنك تقديم طلب جديد لبدء التصميم الفضائي أو الإنتاج أو التذاكر لفعاليات مؤسستك."
                      : "Submit your first RFP to initiate turnkey spatial design, event engineering, fabrication, or crowd ticketing for your enterprise."}
                  </p>
                </div>
                <Link
                  href={`/${locale}/b2b/contact`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isAr ? "تقديم طلب جديد" : "Submit First RFP"}</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {rfps.map((rfp) => {
                  const badge = getStatusBadge(rfp.status);
                  const BadgeIcon = badge.icon;
                  const formattedDate = new Date(rfp.createdAt).toLocaleDateString(isAr ? "ar-QA" : "en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div
                      key={rfp.id}
                      className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-300 space-y-4 shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-zinc-400">RFP-{rfp.id.slice(-6).toUpperCase()}</span>
                            <span className={cn("px-2.5 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1", badge.bg)}>
                              <BadgeIcon className="w-3 h-3" />
                              {badge.label}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white">{rfp.name}</h3>
                        </div>

                        <div className="text-xs text-zinc-400 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      {/* Inquiries / Description Snippet */}
                      {rfp.inquiries && rfp.inquiries.length > 0 && (
                        <div className="text-xs text-zinc-300 bg-zinc-950/60 p-3.5 rounded-xl border border-white/5 space-y-1">
                          <div className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                            {isAr ? "تفاصيل الطلب المسجلة:" : "Submission Scope:"}
                          </div>
                          <p className="line-clamp-2">{rfp.inquiries[0].message}</p>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                          <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                          <span>{rfp.company || organization.company}</span>
                        </div>

                        <Link
                          href={`/${locale}/business/rfps/${rfp.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-all group"
                        >
                          <span>{isAr ? "عرض التفاصيل والمستندات" : "View Details & Updates"}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLIENT-VISIBLE PROJECT UPDATES */}
        {activeTab === "updates" && (
          <div className="space-y-6">
            {rfps.flatMap((r) => r.activities || []).length === 0 ? (
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-10 text-center space-y-2">
                <Clock className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-white">
                  {isAr ? "لا توجد تحديثات مشاريع معلنة حالياً" : "No Published Updates Yet"}
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  {isAr
                    ? "ستظهر هنا المراحل المعتمدة وإشعارات سير التنفيذ بمجرد بدء العمل على المشروع."
                    : "Client-visible milestones and approved schedule updates will stream here as project execution advances."}
                </p>
              </div>
            ) : (
              <div className="relative border-s border-zinc-800 ms-4 space-y-6">
                {rfps
                  .flatMap((r) => (r.activities || []).map((act) => ({ ...act, rfpName: r.name, rfpId: r.id })))
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((activity, idx) => (
                    <div key={idx} className="ms-6 relative">
                      <div className="absolute -start-9 top-1 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/60 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      </div>
                      <div className="bg-zinc-900/60 border border-white/5 p-4 rounded-2xl space-y-1">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span className="font-mono text-amber-300 text-[11px]">{activity.rfpName}</span>
                          <span>{new Date(activity.timestamp).toLocaleString(isAr ? "ar-QA" : "en-US")}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{activity.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORGANIZATION MEMBERS */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{isAr ? "أعضاء المؤسسة المصرح لهم" : "Authorized Organization Roster"}</h3>
                  <p className="text-xs text-zinc-400">{isAr ? "المستخدمون الذين يمتلكون صلاحية الوصول إلى هذه المساحة" : "Team members authorized to collaborate in this workspace"}</p>
                </div>

                {isManager && (
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isAr ? "دعوة زميل" : "Invite Colleague"}</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-white/5">
                {members.map((member) => (
                  <div key={member.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                        {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{member.user.name || member.user.email}</div>
                        <div className="text-xs text-zinc-400">{member.user.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-mono font-bold uppercase">
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DOCUMENTS & BLUEPRINTS */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isAr ? "المستندات الهندسية والمخططات المعتمدة" : "Engineering Blueprints & Deliverables"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {isAr
                      ? "جميع المخططات الفنية، المواصفات التصميمية، والمستندات المرفقة بطلبات مشاريع مؤسستك."
                      : "Technical drawings, architectural specifications, and client-approved documents across all active projects."}
                  </p>
                </div>
              </div>

              {allDocuments.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <FileText className="w-12 h-12 text-zinc-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">
                    {isAr ? "لا توجد مستندات مرفقة حالياً" : "No Documents Attached Yet"}
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    {isAr
                      ? "سيتم إدراج المخططات ومستندات نطاق العمل فور إرفاقها ومراجعتها من قبل الفريق الهندسي."
                      : "Technical deliverables and blueprints will appear here once uploaded and reviewed with the engineering team."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allDocuments.map((doc) => {
                    const isPdf = doc.mimeType?.includes("pdf");
                    const isImage = doc.mimeType?.includes("image");
                    const formattedSize =
                      doc.fileSize > 1024 * 1024
                        ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
                        : `${Math.round(doc.fileSize / 1024)} KB`;

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/70 border border-white/5 hover:border-amber-500/30 transition-all"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                            {isPdf ? (
                              <FileText className="w-5 h-5" />
                            ) : isImage ? (
                              <Sparkles className="w-5 h-5" />
                            ) : (
                              <File className="w-5 h-5" />
                            )}
                          </div>
                          <div className="truncate">
                            <div className="text-sm font-bold text-white truncate" title={doc.originalFileName}>
                              {doc.originalFileName}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                              <span className="font-mono">{formattedSize}</span>
                              <span>•</span>
                              <span className="text-amber-300/80 truncate max-w-[150px]">{doc.rfpName}</span>
                            </div>
                          </div>
                        </div>

                        <a
                          href={doc.pathname}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-xs font-bold text-zinc-200 transition-all shrink-0 ml-2"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isAr ? "تحميل" : "Download"}</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* In-Portal RFP Submission Modal */}
        <NewRfpModal
          isOpen={isRfpModalOpen}
          onClose={() => setIsRfpModalOpen(false)}
          defaultCompany={organization.company}
          locale={locale}
          onSuccess={(newRfp: any) => {
            setCurrentRfps((prev) => [newRfp, ...prev]);
          }}
        />

        {/* Invite Colleague Modal */}
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          companyName={organization.company}
          locale={locale}
        />
      </main>
    </div>
  );
}
