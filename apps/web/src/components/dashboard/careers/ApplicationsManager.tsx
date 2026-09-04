"use client";

import React, { useState } from "react";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";
import { AdminButton } from "../ui/AdminButton";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { FileText, Download, Cpu, Search, Filter, Sparkles, AlertTriangle } from "lucide-react";
import { safeFetchJson } from "@/lib/utils";
import { useLocale } from "@/components/layout/LocaleProvider";
import { isLegacySimulatedMock } from "@/lib/careers/ai-cv-parser";

export function ApplicationsManager({ initialApplications }: { initialApplications: any[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  const handleParseCV = async (id: string) => {
    setParsing(true);
    try {
      const res = await fetch(`/api/careers/${id}/parse`, { method: "POST" });
      const parsed = await safeFetchJson(res);

      if (!parsed.ok) throw new Error(parsed.error || (isAr ? "فشل تحليل السيرة الذاتية" : "Failed to parse CV"));

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? parsed.data.application : app))
      );
      toast(isAr ? "تم تحليل السيرة الذاتية بالذكاء الاصطناعي بنجاح." : "CV parsed successfully.", "success");
    } catch (e: any) {
      console.error(e);
      toast(e.message || (isAr ? "فشل تحليل السيرة الذاتية." : "Failed to parse CV."), "error");
    } finally {
      setParsing(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/careers/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const parsed = await safeFetchJson(res);

      if (!parsed.ok) throw new Error(parsed.error || (isAr ? "فشل تحديث حالة الطلب" : "Failed to update status"));

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
      toast(isAr ? "تم تحديث حالة طلب التوظيف بنجاح." : "Application status updated.", "success");
    } catch (e: any) {
      console.error(e);
      toast(e.message || (isAr ? "فشل تحديث حالة الطلب." : "Failed to update status."), "error");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "REVIEWING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "INTERVIEW":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "HIRED":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <DashboardPageShell variant="wide">
      <DashboardPageHeader
        title={isAr ? "طلبات التوظيف والمترشحين" : "Global Job Applications"}
        description={
          isAr
            ? "مراجعة جميع طلبات التوظيف الواردة، تتبع مراحل المقابلات، واستخدام الذكاء الاصطناعي لتحليل السير الذاتية."
            : "Review incoming candidate submissions across all B2B and B2C portals and use AI to parse CVs."
        }
        breadcrumbs={[
          { label: isAr ? "الموارد البشرية والوظائف" : "HR & Careers", href: `/${locale}/dashboard/careers` },
          { label: isAr ? "طلبات التوظيف" : "Job Applications" },
        ]}
        badge={{
          label: isAr ? `${applications.length} طلبات` : `${applications.length} Applicants`,
          variant: "indigo",
        }}
      />

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Applications List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 bg-surface-default border border-border-default rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border-default space-y-4">
            <div className="relative">
              <Search className="absolute start-3 top-2.5 h-4 w-4 text-text-secondary" />
              <input 
                placeholder={isAr ? "بحث في المترشحين..." : "Search candidates..."} 
                className="w-full ps-9 pe-4 py-2 bg-surface-hover border border-border-default rounded-lg text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button className="text-xs flex items-center px-3 py-1.5 bg-surface-hover rounded-md border border-border-default text-text-secondary hover:text-white transition-colors">
                <Filter className="w-3 h-3 me-1" /> {isAr ? "جميع البوابات" : "All Portals"}
              </button>
              <button className="text-xs flex items-center px-3 py-1.5 bg-surface-hover rounded-md border border-border-default text-text-secondary hover:text-white transition-colors">
                <Filter className="w-3 h-3 me-1" /> {isAr ? "الحالة" : "Status"}
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                {isAr ? "لا توجد طلبات تقديم حتى الآن." : "No applications found."}
              </div>
            ) : (
              applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`w-full text-start p-4 border-b border-border-default hover:bg-surface-hover transition-colors ${selectedAppId === app.id ? 'bg-surface-hover border-s-2 border-s-primary' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-text-primary">{app.firstName} {app.lastName}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="text-sm text-text-secondary mb-2">{app.jobTitle}</div>
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                    <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px]">{app.portal}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="w-full lg:w-2/3 bg-surface-default border border-border-default rounded-xl flex flex-col overflow-hidden">
          {selectedApp ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedApp.firstName} {selectedApp.lastName}</h2>
                  <p className="text-primary font-medium">{selectedApp.jobTitle} {selectedApp.department ? `· ${selectedApp.department}` : ''}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <select 
                    value={selectedApp.status}
                    onChange={(e) => handleUpdateStatus(selectedApp.id, e.target.value)}
                    disabled={updating}
                    className="bg-surface-hover border border-border-default rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value="NEW">{isAr ? "جديد" : "New"}</option>
                    <option value="REVIEWING">{isAr ? "قيد المراجعة" : "Reviewing"}</option>
                    <option value="INTERVIEW">{isAr ? "مقابلة" : "Interview"}</option>
                    <option value="HIRED">{isAr ? "تم التعيين" : "Hired"}</option>
                    <option value="REJECTED">{isAr ? "مرفوض" : "Rejected"}</option>
                  </select>

                  <a href={selectedApp.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-surface-hover border border-border-default rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
                    <Download className="w-4 h-4 me-2" /> {isAr ? "تحميل السيرة" : "Download CV"}
                  </a>
                  <AdminButton 
                    variant={selectedApp.cvParsedData ? "outline" : "primary"} 
                    onClick={() => handleParseCV(selectedApp.id)} 
                    disabled={parsing}
                    className="flex items-center gap-1.5"
                  >
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>
                      {parsing 
                        ? (isAr ? "جاري المعالجة..." : "Analyzing with AI...") 
                        : selectedApp.cvParsedData 
                        ? (isAr ? "إعادة التحليل الذكي" : "Re-Analyze (Gemini)") 
                        : (isAr ? "تحليل بالذكاء الاصطناعي" : "AI Parse CV")}
                    </span>
                  </AdminButton>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-surface-hover border border-border-default">
                <div>
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">{isAr ? "البريد الإلكتروني" : "Email"}</div>
                  <div className="text-sm text-white break-all">{selectedApp.email}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">{isAr ? "رقم الهاتف" : "Phone"}</div>
                  <div className="text-sm text-white">{selectedApp.phone || (isAr ? "غير متوفر" : "N/A")}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">{isAr ? "مصدر التقديم" : "Applied via"}</div>
                  <div className="text-sm text-white">{selectedApp.portal} {isAr ? "بوابة" : "Portal"}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">{isAr ? "تاريخ التقديم" : "Applied on"}</div>
                  <div className="text-sm text-white">{new Date(selectedApp.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Parsed Data / AI Analysis */}
              <div className="space-y-4">
                {(() => {
                  const isLegacy = isLegacySimulatedMock(selectedApp.cvParsedData, selectedApp.jobTitle);
                  return (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border-default/60">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-purple-400" />
                          <h3 className="text-lg font-bold text-white">
                            {isAr ? "التحليل الذكي لملف المترشح" : "AI Candidate Analysis"}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          {selectedApp.cvParsedData?.aiEngine ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800/50 flex items-center gap-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                              {selectedApp.cvParsedData.aiEngine}
                            </span>
                          ) : isLegacy ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              {isAr ? "محاكاة تجريبية قديمة" : "Legacy Simulated"}
                            </span>
                          ) : null}

                          <button
                            onClick={() => handleParseCV(selectedApp.id)}
                            disabled={parsing}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md hover:shadow-purple-500/20"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                            <span>
                              {parsing
                                ? (isAr ? "جاري المعالجة بالذكاء الاصطناعي..." : "Analyzing with AI...")
                                : selectedApp.cvParsedData
                                ? (isAr ? "إعادة التحليل (Gemini AI)" : "Re-Analyze (Gemini AI)")
                                : (isAr ? "تحليل السيرة الذاتية (Gemini)" : "Run AI Analysis (Gemini)")}
                            </span>
                          </button>
                        </div>
                      </div>

                      {isLegacy && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1 text-xs text-amber-200/90 leading-relaxed">
                            <span className="font-bold text-amber-300">
                              {isAr ? "تنبيه بيانات محاكاة قديمة: " : "Legacy Simulated Mock Detected: "}
                            </span>
                            {isAr
                              ? "هذا السجل يحتوي على بيانات برمجية عامة مسبقة. اضغط على 'إعادة التحليل (Gemini AI)' لتوليد تحليل حقيقي مخصص لمجال الفعاليات والإنتاج."
                              : "This application contains legacy generic software mock data. Click 'Re-Analyze (Gemini AI)' above to regenerate genuine domain intelligence tailored to event operations."}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
                
                {selectedApp.cvParsedData ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{isAr ? "الملخص التنفيذي" : "Executive Summary"}</h4>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        {selectedApp.cvParsedData.summary}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 bg-surface-hover border border-border-default rounded-xl">
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{isAr ? "المهارات المستخرجة" : "Extracted Skills"}</h4>
                        <div className="flex flex-wrap gap-2">
                          {(selectedApp.cvParsedData.skills || []).map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-zinc-800 text-xs rounded-md text-zinc-300 border border-zinc-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-surface-hover border border-border-default rounded-xl">
                          <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">{isAr ? "سنوات الخبرة" : "Years of Experience"}</h4>
                          <p className="text-2xl font-bold text-white">{selectedApp.cvParsedData.experienceYears} {isAr ? "سنوات" : "Years"}</p>
                        </div>
                        <div className="p-4 bg-surface-hover border border-border-default rounded-xl">
                          <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">{isAr ? "المؤهل التعليمي" : "Education"}</h4>
                          <p className="text-sm text-white">{selectedApp.cvParsedData.education}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-border-default rounded-xl bg-surface-hover/50">
                    <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h4 className="text-white font-medium mb-2">{isAr ? "لم يتم تحليل السيرة الذاتية بعد" : "CV Not Parsed Yet"}</h4>
                    <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
                      {isAr
                        ? "استخدم محلل الذكاء الاصطناعي لاستخراج المهارات وسنوات الخبرة وتوليد ملخص تنفيذي من ملف السيرة الذاتية المرفوع."
                        : "Use the AI parser to automatically extract skills, years of experience, and generate an executive summary from the uploaded CV document."}
                    </p>
                    <AdminButton variant="outline" onClick={() => handleParseCV(selectedApp.id)} disabled={parsing}>
                      <Cpu className="w-4 h-4 me-2" /> {parsing ? (isAr ? "جاري التحليل..." : "Analyzing CV...") : (isAr ? "بدء التحليل الذكي" : "Run AI Analysis")}
                    </AdminButton>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-8">
              <FileText className="w-16 h-16 text-zinc-800 mb-4" />
              <p>{isAr ? "حدد طلباً من القائمة لعرض تفاصيله الكاملة." : "Select an application to view details."}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardPageShell>
  );
}
