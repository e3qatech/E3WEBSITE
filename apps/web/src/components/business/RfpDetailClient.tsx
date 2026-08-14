"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";

interface RfpDetailProps {
  rfp: {
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
  };
  organization: {
    id: string;
    company: string;
  };
  locale: string;
}

export function RfpDetailClient({ rfp, organization, locale }: RfpDetailProps) {
  const isAr = locale === "ar";

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

  const badge = getStatusBadge(rfp.status);
  const BadgeIcon = badge.icon;
  const formattedDate = new Date(rfp.createdAt).toLocaleDateString(isAr ? "ar-QA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-zinc-950" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="border-b border-white/10 bg-zinc-900/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/business`}
              className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              {isAr ? <ArrowRight className="w-4 h-4 text-emerald-400" /> : <ArrowLeft className="w-4 h-4 text-emerald-400" />}
              <span>{isAr ? "العودة لبوابة الشركات" : "Back to Enterprise Hub"}</span>
            </Link>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="font-extrabold text-sm text-white">{organization.company}</span>
            </div>
          </div>

          <LogoutButton locale={locale} portal="business" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        {/* Title and Status Banner */}
        <div className="bg-zinc-900/60 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                  RFP-{rfp.id.slice(-6).toUpperCase()}
                </span>
                <span className={cn("px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5", badge.bg)}>
                  <BadgeIcon className="w-3.5 h-3.5" />
                  {badge.label}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {rfp.name}
              </h1>
            </div>

            <div className="text-xs text-zinc-400 space-y-1 sm:text-right rtl:sm:text-left">
              <div>{isAr ? "تاريخ التقديم:" : "Submitted Date:"}</div>
              <div className="font-bold text-white font-mono">{formattedDate}</div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl">
              <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
                {isAr ? "المؤسسة مقدمة الطلب" : "Client Organization"}
              </div>
              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>{rfp.company || organization.company}</span>
              </div>
            </div>

            <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl">
              <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
                {isAr ? "البريد الإلكتروني المعتمد" : "Contact Email"}
              </div>
              <div className="text-sm font-extrabold text-white font-mono truncate">
                {rfp.email}
              </div>
            </div>

            <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl">
              <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
                {isAr ? "حالة المراجعة التنفيذية" : "Operational Status"}
              </div>
              <div className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{badge.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiries & Scope Details */}
        {rfp.inquiries && rfp.inquiries.length > 0 && (
          <div className="bg-zinc-900/60 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base border-b border-white/5 pb-4">
              <FileText className="w-5 h-5" />
              <h2>{isAr ? "نطاق العمل المسجل في الطلب" : "Registered Scope of Work & Inquiry"}</h2>
            </div>

            <div className="space-y-4">
              {rfp.inquiries.map((inq) => (
                <div key={inq.id} className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-mono font-bold text-emerald-400">{inq.type}</span>
                    <span>{new Date(inq.createdAt).toLocaleDateString(isAr ? "ar-QA" : "en-US")}</span>
                  </div>
                  {inq.subject && <div className="text-sm font-bold text-white">{inq.subject}</div>}
                  <p className="text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {inq.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Client-Visible Milestone Updates Timeline */}
        <div className="bg-zinc-900/60 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base border-b border-white/5 pb-4">
            <Clock className="w-5 h-5" />
            <h2>{isAr ? "سجل التحديثات والمراحل التنفيذية" : "Client-Visible Milestone Stream"}</h2>
          </div>

          {rfp.activities && rfp.activities.length > 0 ? (
            <div className="relative border-s border-zinc-800 ms-4 space-y-6">
              {rfp.activities.map((act) => (
                <div key={act.id} className="ms-6 relative">
                  <div className="absolute -start-9 top-1 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-mono text-emerald-300 text-[11px]">{act.type}</span>
                      <span>{new Date(act.timestamp).toLocaleString(isAr ? "ar-QA" : "en-US")}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-zinc-500 space-y-1">
              <Clock className="w-8 h-8 mx-auto text-zinc-700 mb-2" />
              <div>{isAr ? "سيتم إدراج مراحل المشروع فور اكتمال المراجعة الهندسية." : "Milestone logs will stream here as project engineering progresses."}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
