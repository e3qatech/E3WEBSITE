"use client";

import React, { useState } from "react";
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
  Download,
  File,
  Send,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";

interface RfpDocument {
  id: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  pathname: string;
  createdAt: string | Date;
}

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
    uploads?: RfpDocument[];
  };
  organization: {
    id: string;
    company: string;
  };
  locale: string;
}

export function RfpDetailClient({ rfp, organization, locale }: RfpDetailProps) {
  const isAr = locale === "ar";
  const [inquiries, setInquiries] = useState(rfp.inquiries || []);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim() || messageBody.trim().length < 3) {
      setSendError(isAr ? "يرجى كتابة رسالة لا تقل عن 3 أحرف" : "Please enter at least 3 characters");
      return;
    }

    setIsSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      const res = await fetch(`/api/business/rfps/${rfp.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: messageSubject.trim() || undefined,
          message: messageBody.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      if (data.inquiry) {
        setInquiries((prev) => [data.inquiry, ...prev]);
      }
      setMessageSubject("");
      setMessageBody("");
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 5000);
    } catch (err: any) {
      setSendError(err.message || "Network error");
    } finally {
      setIsSending(false);
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

        {/* Attached Documents & Technical Blueprints */}
        {rfp.uploads && rfp.uploads.length > 0 && (
          <div className="bg-zinc-900/60 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-base">
                <FileText className="w-5 h-5" />
                <h2>{isAr ? "المستندات والمخططات المرفقة بهذا الطلب" : "Attached Blueprints & Deliverables"}</h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {rfp.uploads.length} {isAr ? "ملفات" : "files"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rfp.uploads.map((doc) => {
                const formattedSize =
                  doc.fileSize > 1024 * 1024
                    ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
                    : `${Math.round(doc.fileSize / 1024)} KB`;

                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/70 border border-white/5 hover:border-sky-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-400">
                        <File className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-bold text-white truncate" title={doc.originalFileName}>
                          {doc.originalFileName}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">{formattedSize}</div>
                      </div>
                    </div>

                    <a
                      href={doc.pathname}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-sky-500 hover:text-zinc-950 text-xs font-bold text-zinc-200 transition-all shrink-0 ml-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isAr ? "تحميل" : "Download"}</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inquiries & Interactive Direct Messaging */}
        <div className="bg-zinc-900/60 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base border-b border-white/5 pb-4">
            <MessageSquare className="w-5 h-5" />
            <h2>{isAr ? "نطاق العمل والمراسلات التوضيحية" : "Scope of Work & Client Inquiries"}</h2>
          </div>

          {inquiries.length > 0 ? (
            <div className="space-y-4">
              {inquiries.map((inq) => (
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
          ) : (
            <p className="text-xs text-zinc-500">{isAr ? "لا توجد مراسلات مسجلة بعد." : "No inquiries logged yet."}</p>
          )}

          {/* New Message Form */}
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-sm font-bold text-white mb-3">
              {isAr ? "إرسال استفسار أو إضافة متطلبات جديدة للطلب" : "Send Inquiry or Additional Specification"}
            </h3>

            {sendSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? "تم إرسال استفسارك بنجاح وإلحاقه بملف المشروع." : "Your inquiry has been submitted and attached to this RFP."}</span>
              </div>
            )}

            {sendError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{sendError}</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-3">
              <input
                type="text"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder={isAr ? "موضوع الاستفسار (اختياري)" : "Subject or clarification topic (optional)"}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500/60"
              />
              <textarea
                required
                rows={3}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder={isAr ? "اكتب تفاصيل الاستفسار أو التعديل المطلوب هنا..." : "Provide details, specifications, or questions for our engineering leads..."}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500/60 resize-y"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{isAr ? "إرسال الرسالة" : "Send Inquiry"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

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
