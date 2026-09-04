"use client";

import React, { useState } from "react";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";
import { AdminButton } from "../ui/AdminButton";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  FileText,
  Download,
  Cpu,
  Search,
  Filter,
  Sparkles,
  AlertTriangle,
  Calendar,
  Video,
  MapPin,
  Clock,
  X,
  Plus,
  Building,
  CheckCircle2,
} from "lucide-react";
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

  // Recruiter Interview Scheduling Dialog State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleRoundName, setScheduleRoundName] = useState("Executive & Domain Assessment");
  const [scheduleFormat, setScheduleFormat] = useState<"VIRTUAL" | "IN_PERSON">("VIRTUAL");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleDuration, setScheduleDuration] = useState(45);
  const [scheduleMeetingUrl, setScheduleMeetingUrl] = useState("https://meet.google.com/e3q-hr-interview");
  const [scheduleLocation, setScheduleLocation] = useState("E3 Qatar HQ - Level 24, Lusail Marina, Doha");
  const [scheduleInterviewers, setScheduleInterviewers] = useState("E3 Qatar Talent Board, Production Director");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

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

  const handleOpenScheduleModal = () => {
    // Default scheduled date to 2 days ahead at 10:00 AM
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    nextDate.setHours(10, 0, 0, 0);
    const localIso = new Date(nextDate.getTime() - nextDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setScheduleDate(localIso);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (!scheduleDate) {
      toast(isAr ? "يرجى تحديد موعد المقابلة" : "Please select interview date and time", "error");
      return;
    }

    setIsScheduling(true);
    try {
      const res = await fetch(`/api/careers/${selectedApp.id}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundName: scheduleRoundName.trim(),
          format: scheduleFormat,
          scheduledAt: new Date(scheduleDate).toISOString(),
          durationMinutes: Number(scheduleDuration) || 45,
          meetingUrl: scheduleFormat === "VIRTUAL" ? scheduleMeetingUrl.trim() : undefined,
          location: scheduleFormat === "IN_PERSON" ? scheduleLocation.trim() : undefined,
          interviewers: scheduleInterviewers.split(",").map((s) => s.trim()).filter(Boolean),
          notes: scheduleNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to schedule interview");
      }

      // Update local state with the new interview and updated status
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id === selectedApp.id) {
            const currentParsed = (app.cvParsedData as any) || {};
            const existingInterviews = Array.isArray(currentParsed.interviews) ? currentParsed.interviews : [];
            return {
              ...app,
              status: "INTERVIEW",
              cvParsedData: {
                ...currentParsed,
                interviews: [data.interview, ...existingInterviews],
              },
            };
          }
          return app;
        })
      );

      toast(
        isAr
          ? "تم جدولة المقابلة بنجاح وتحديث حالة الطلب إلى (مقابلة)."
          : "Interview scheduled successfully! Application advanced to Interview stage.",
        "success"
      );
      setIsScheduleModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast(err.message || (isAr ? "فشل جدولة المقابلة" : "Failed to schedule interview"), "error");
    } finally {
      setIsScheduling(false);
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

  const selectedAppInterviews = Array.isArray(selectedApp?.cvParsedData?.interviews)
    ? selectedApp.cvParsedData.interviews
    : [];

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
          label: `${applications.length} ${isAr ? "طلبات" : "Applications"}`,
          variant: "purple",
        }}
      />

      <div className="flex flex-col lg:flex-row gap-6 mt-6 min-h-[650px]">
        {/* List View */}
        <div className="w-full lg:w-1/3 bg-surface-default border border-border-default rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border-default flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute start-3 top-3 text-text-secondary" />
              <input
                type="text"
                placeholder={isAr ? "بحث بالاسم أو التخصص..." : "Search applicant, role..."}
                className="w-full bg-surface-hover border border-border-default rounded-lg ps-9 pe-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
            <button className="p-2 bg-surface-hover border border-border-default rounded-lg text-text-secondary hover:text-white">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border-default">
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedApp.firstName} {selectedApp.lastName}</h2>
                  <p className="text-primary font-medium">{selectedApp.jobTitle} {selectedApp.department ? `· ${selectedApp.department}` : ''}</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
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

                  <button
                    type="button"
                    onClick={handleOpenScheduleModal}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{isAr ? "جدولة مقابلة" : "Schedule Interview"}</span>
                  </button>

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

              {/* Scheduled Interviews Drawer Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-default/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <h3 className="text-base font-bold text-white">
                      {isAr ? "جدول المقابلات المسجلة" : "Scheduled Candidate Interviews"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenScheduleModal}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? "إضافة جولة مقابلة" : "Add Interview Round"}</span>
                  </button>
                </div>

                {selectedAppInterviews.length > 0 ? (
                  <div className="space-y-3">
                    {selectedAppInterviews.map((item: any, idx: number) => (
                      <div
                        key={item.id || idx}
                        className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{item.roundName || "Interview Round"}</span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                              {item.format}
                            </span>
                            {item.status === "RESCHEDULE_REQUESTED" && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                {isAr ? "طلب إعادة جدولة من المترشح" : "Reschedule Requested by Candidate"}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-400 font-mono">
                            {new Date(item.scheduledAt).toLocaleString(isAr ? "ar-QA" : "en-US", { dateStyle: "short", timeStyle: "short" })}
                          </span>
                        </div>

                        {item.rescheduleReason && (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                            <span className="font-bold">{isAr ? "مبرر طلب التأجيل: " : "Candidate Reschedule Note: "}</span>
                            {item.rescheduleReason}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                          <div className="flex items-center gap-2">
                            {item.meetingUrl && (
                              <a
                                href={item.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 underline font-mono flex items-center gap-1"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>{item.meetingUrl}</span>
                              </a>
                            )}
                            {item.location && <span>📍 {item.location}</span>}
                          </div>
                          <span>Duration: {item.durationMinutes || 45} mins</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-surface-hover/50 border border-dashed border-border-default text-center text-xs text-zinc-400">
                    {isAr ? "لم يتم جدولة مقابلات بعد. اضغط 'جدولة مقابلة' لإرسال موعد للمترشح." : "No interviews scheduled yet. Click 'Schedule Interview' to book a slot with the candidate."}
                  </div>
                )}
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

      {/* Recruiter Schedule Interview Modal Dialog */}
      {isScheduleModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isAr ? "جدولة مقابلة للمترشح" : "Schedule Candidate Interview"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {selectedApp.firstName} {selectedApp.lastName} • {selectedApp.jobTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold block">
                  {isAr ? "مسمى الجولة / التقييم *" : "Round Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={scheduleRoundName}
                  onChange={(e) => setScheduleRoundName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">
                    {isAr ? "طبيعة المقابلة" : "Format"}
                  </label>
                  <select
                    value={scheduleFormat}
                    onChange={(e) => setScheduleFormat(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="VIRTUAL">{isAr ? "افتراضية (مكالمة مرئية)" : "Virtual Video Call"}</option>
                    <option value="IN_PERSON">{isAr ? "حضور شخصي في المقر" : "In-Person (HQ)"}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">
                    {isAr ? "المدة المقدرة (بالدقائق)" : "Duration (Minutes)"}
                  </label>
                  <select
                    value={scheduleDuration}
                    onChange={(e) => setScheduleDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold block">
                  {isAr ? "التاريخ والوقت بتوقيت الدوحة *" : "Date & Time (Doha AST) *"}
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {scheduleFormat === "VIRTUAL" ? (
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">
                    {isAr ? "رابط المقابلة المرئية (Google Meet / Teams) *" : "Video Meeting URL *"}
                  </label>
                  <input
                    type="url"
                    required
                    value={scheduleMeetingUrl}
                    onChange={(e) => setScheduleMeetingUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">
                    {isAr ? "عنوان المقر أو القاعة *" : "Physical Location / Room *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleLocation}
                    onChange={(e) => setScheduleLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold block">
                  {isAr ? "لجنة المقابلة (مفصولة بفواصل)" : "Interviewers (Comma-separated)"}
                </label>
                <input
                  type="text"
                  value={scheduleInterviewers}
                  onChange={(e) => setScheduleInterviewers(e.target.value)}
                  placeholder="e.g., Jane Doe, John Smith"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold block">
                  {isAr ? "ملاحظات إضافية للمترشح (اختياري)" : "Instructions / Notes for Candidate (Optional)"}
                </label>
                <textarea
                  rows={2}
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="e.g. Please bring your portfolio reel..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={isScheduling}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isScheduling ? (isAr ? "جاري الحفظ..." : "Scheduling...") : (isAr ? "تأكيد وإرسال الموعد" : "Confirm & Dispatch")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
}
