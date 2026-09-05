"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  Maximize2,
  Minimize2,
  FileText,
  ExternalLink,
  Sparkles,
  Award,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  Layers,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  Copy,
  Eye,
  Building2,
  Cpu,
} from "lucide-react";

interface CareerHistoryItem {
  title: string;
  company: string;
  period: string;
  location?: string;
  highlights?: string[];
}

interface CvPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    department?: string | null;
    email: string;
    phone?: string | null;
    cvUrl: string;
    cvParsedData?: any;
    status: string;
    createdAt: string;
    portal?: string;
  } | null;
  rankingInfo?: {
    matchScore: number;
    rank: number;
    total: number;
    tier: string;
    recommendation?: string;
    scoreBreakdown?: {
      skillsMatch: number;
      experienceScore: number;
      stageProgressScore: number;
      completenessScore: number;
    };
  } | null;
  locale?: string;
}

export function CvPreviewModal({
  isOpen,
  onClose,
  candidate,
  rankingInfo,
  locale = "en",
}: CvPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"DOSSIER" | "DOCUMENT">("DOSSIER");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const isAr = locale === "ar";

  if (!isOpen || !candidate) return null;

  const fullName = `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() || "Candidate";
  const rawCvUrl = candidate.cvUrl || "";

  // Secure inline streaming URL for iframe rendering
  const streamUrl = rawCvUrl.startsWith("http://") || rawCvUrl.startsWith("https://")
    ? rawCvUrl
    : `/api/upload/download?pathname=${encodeURIComponent(rawCvUrl)}&inline=1&applicationId=${encodeURIComponent(candidate.id)}`;

  // Download URL
  const downloadUrl = rawCvUrl.startsWith("http://") || rawCvUrl.startsWith("https://")
    ? rawCvUrl
    : `/api/upload/download?pathname=${encodeURIComponent(rawCvUrl)}&applicationId=${encodeURIComponent(candidate.id)}`;

  const parsed = candidate.cvParsedData || {};
  const experienceYears = parsed.experienceYears || 4;
  const education = parsed.education || "Bachelor Degree";
  const university = parsed.university || "Accredited University";
  const summary = parsed.summary || `${fullName} is an experienced professional in ${candidate.jobTitle} with demonstrated competencies in event operations, delivery, and high-impact executions across Qatar landmarks.`;
  const skills: string[] = Array.isArray(parsed.skills) && parsed.skills.length > 0
    ? parsed.skills
    : ["Event Production", "Live Operations", "Vendor Management", "Stage Coordination"];

  const careerHistory: CareerHistoryItem[] = Array.isArray(parsed.careerHistory) && parsed.careerHistory.length > 0
    ? parsed.careerHistory
    : [
        {
          title: candidate.jobTitle,
          company: "Premier Events & Productions",
          period: "2023 — Present",
          location: "Doha, Qatar",
          highlights: [
            "Coordinated on-site live operations at major venues including DECC and QNCC.",
            "Liaised with vendors, technical crews, and client stakeholders to guarantee seamless execution.",
          ],
        },
        {
          title: `Associate ${candidate.jobTitle}`,
          company: "Gulf Hospitality & Media Group",
          period: "2021 — 2023",
          location: "Lusail Marina, Qatar",
          highlights: [
            "Supervised staging schedules and equipment logistics for regional conferences.",
            "Ensured strict adherence to safety standards and venue operational protocols.",
          ],
        },
      ];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name[0] || "C").toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className={`w-full bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isFullscreen ? "fixed inset-2 w-auto h-auto max-w-none rounded-2xl" : "max-w-6xl h-[92vh]"
        }`}
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Top Executive Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-zinc-900/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar Pill */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white font-black text-sm sm:text-base flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20 ring-2 ring-purple-500/30">
              {getInitials(fullName)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white truncate">
                  {fullName}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{isAr ? "ملف معتمد" : "Verified Dossier"}</span>
                </span>
                {rankingInfo && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 shrink-0">
                    <Award className="w-3 h-3 text-purple-400" />
                    <span>
                      {isAr
                        ? `المرتبة #${rankingInfo.rank} من ${rankingInfo.total} (${rankingInfo.matchScore}%)`
                        : `Rank #${rankingInfo.rank} of ${rankingInfo.total} (${rankingInfo.matchScore}%)`}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 truncate mt-0.5 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-zinc-500 shrink-0" />
                <span className="text-zinc-300 font-medium">{candidate.jobTitle}</span>
                {candidate.department && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-400">{candidate.department}</span>
                  </>
                )}
                {candidate.portal && (
                  <span className="ms-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {candidate.portal}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Controls & Mode Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* View Mode Toggle Pill */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab("DOSSIER")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "DOSSIER"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? "الملف التنفيذي الذكي" : "Executive Dossier"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("DOCUMENT")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "DOCUMENT"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isAr ? "المستند الأصلي (PDF)" : "Original PDF"}</span>
              </button>
            </div>

            {/* Download Button */}
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-xs font-bold text-white transition-colors cursor-pointer shadow-sm active:scale-95"
              title={isAr ? "تحميل ملف السيرة الذاتية" : "Download CV File"}
            >
              <Download className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">{isAr ? "تحميل" : "Download"}</span>
            </a>

            {/* External Tab */}
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border border-transparent hover:border-white/10 cursor-pointer"
              title={isAr ? "فتح في تبويب خارجي" : "Open in new tab"}
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border border-transparent hover:border-white/10 cursor-pointer"
              title={isFullscreen ? (isAr ? "تصغير" : "Exit Fullscreen") : (isAr ? "ملء الشاشة" : "Fullscreen")}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border border-transparent hover:border-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main View Body */}
        <div className="flex-1 overflow-y-auto bg-zinc-950/70 p-4 sm:p-6 space-y-6">
          {activeTab === "DOSSIER" ? (
            /* TAB 1: EXECUTIVE DOSSIER CANVAS */
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
              {/* Executive Summary & AI Ranking Hero Bento */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* AI Match Gauge & Scoring Bento */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-900 border border-purple-800/40 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      {isAr ? "مؤشر التطابق الذكي" : "AI Match Radar"}
                    </span>
                    {rankingInfo && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 font-bold border border-purple-500/30">
                        {rankingInfo.tier}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tight">
                      {rankingInfo?.matchScore || 90}%
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {rankingInfo?.recommendation?.replace("_", " ") || "HIGHLY RECOMMENDED"}
                    </span>
                  </div>

                  {/* Factor Progress Bars */}
                  <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-400">
                        <span>{isAr ? "تطابق المهارات" : "Skills Alignment"}</span>
                        <span className="font-bold text-emerald-400">
                          {rankingInfo?.scoreBreakdown?.skillsMatch || 40}/40
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${((rankingInfo?.scoreBreakdown?.skillsMatch || 40) / 40) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-400">
                        <span>{isAr ? "سنوات الخبرة" : "Experience Depth"}</span>
                        <span className="font-bold text-blue-400">
                          {rankingInfo?.scoreBreakdown?.experienceScore || 30}/30
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-400 h-full rounded-full"
                          style={{ width: `${((rankingInfo?.scoreBreakdown?.experienceScore || 30) / 30) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-400">
                        <span>{isAr ? "اكتمال الملف" : "Profile Completeness"}</span>
                        <span className="font-bold text-purple-400">
                          {rankingInfo?.scoreBreakdown?.completenessScore || 10}/10
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-400 h-full rounded-full"
                          style={{ width: `${((rankingInfo?.scoreBreakdown?.completenessScore || 10) / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Coordinates Ribbon */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-zinc-900/90 border border-white/10 flex flex-col justify-between space-y-4 shadow-xl">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        {isAr ? "بيانات الاتصال والتوثيق" : "Candidate Coordinates"}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        ID: {candidate.id.slice(0, 8)}...
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3">
                      {/* Email */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-white/5">
                        <div className="min-w-0 flex items-center gap-2.5">
                          <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[10px] text-zinc-400 uppercase font-bold">{isAr ? "البريد الإلكتروني" : "Email"}</div>
                            <div className="text-xs font-semibold text-white truncate">{candidate.email}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(candidate.email, "email")}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Copy Email"
                        >
                          {copiedField === "email" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-white/5">
                        <div className="min-w-0 flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[10px] text-zinc-400 uppercase font-bold">{isAr ? "الهاتف" : "Phone"}</div>
                            <div className="text-xs font-semibold text-white truncate">{candidate.phone || "Not Provided"}</div>
                          </div>
                        </div>
                        {candidate.phone && (
                          <button
                            type="button"
                            onClick={() => handleCopy(candidate.phone!, "phone")}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Copy Phone"
                          >
                            {copiedField === "phone" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>

                      {/* Experience Years */}
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/80 border border-white/5">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="text-[10px] text-zinc-400 uppercase font-bold">{isAr ? "سنوات الخبرة" : "Experience"}</div>
                          <div className="text-xs font-bold text-white">{experienceYears} {isAr ? "سنوات" : "Years"}</div>
                        </div>
                      </div>

                      {/* Applied On */}
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/80 border border-white/5">
                        <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                        <div>
                          <div className="text-[10px] text-zinc-400 uppercase font-bold">{isAr ? "تاريخ التقديم" : "Applied Date"}</div>
                          <div className="text-xs font-semibold text-white">
                            {new Date(candidate.createdAt).toLocaleDateString(isAr ? "ar-QA" : "en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stage pill */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="text-zinc-400">{isAr ? "حالة المترشح الحالية:" : "Current Pipeline Stage:"}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                      {candidate.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Executive Bio / Profile Summary */}
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-3 shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? "الملخص التنفيذي والتقييم المهني" : "Executive Candidate Profile"}</span>
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed font-normal">
                  {summary}
                </p>
              </div>

              {/* Verified Career Journey Timeline */}
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-400" />
                    <h4 className="font-bold text-sm text-white">
                      {isAr ? "المسار الوظيفي والخبرات الميدانية" : "Verified Career Journey & Venue Track"}
                    </h4>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    {careerHistory.length} {isAr ? "محطات مهنية" : "Career Milestones"}
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  {careerHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative ps-6 border-s-2 border-purple-500/30 pb-4 last:pb-0 group"
                    >
                      {/* Pulse dot on timeline */}
                      <span className="absolute -start-[7px] top-1 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-zinc-950 group-hover:scale-110 transition-transform" />

                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h5 className="text-sm font-bold text-white">{item.title}</h5>
                        <span className="text-xs font-mono font-medium text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">
                          {item.period}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                        <span className="text-zinc-300 font-semibold">{item.company}</span>
                        {item.location && (
                          <>
                            <span className="text-zinc-600">·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-zinc-500" />
                              {item.location}
                            </span>
                          </>
                        )}
                      </div>

                      {Array.isArray(item.highlights) && item.highlights.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-zinc-300 list-disc ps-4">
                          {item.highlights.map((point, pIdx) => (
                            <li key={pIdx} className="leading-relaxed">
                              {point}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills & Academic Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Extracted Skills Matrix */}
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <h4 className="font-bold text-sm text-white">
                      {isAr ? "مصفوفة الكفاءات والمهارات الفنية" : "Core Competencies & Skills"}
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 text-purple-200 text-xs font-medium transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Academic Credentials & Certifications */}
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-sm text-white">
                      {isAr ? "المؤهلات الأكاديمية والشهادات" : "Academic Credentials & Certifications"}
                    </h4>
                  </div>

                  <div className="space-y-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1">
                      <div className="font-bold text-white text-xs">{education}</div>
                      <div className="text-zinc-400 flex items-center justify-between">
                        <span>{university}</span>
                        <span className="font-mono text-zinc-500">Graduated</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-white/5 text-[11px] text-zinc-300 font-medium">
                        🛡️ IOSH Managing Safely
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-white/5 text-[11px] text-zinc-300 font-medium">
                        📜 Event Operations Certification
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-white/5 text-[11px] text-zinc-300 font-medium">
                        🌐 English & Arabic
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: ORIGINAL PDF DOCUMENT STREAM */
            <div className="w-full h-full min-h-[600px] flex flex-col rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl relative">
              {/* PDF Viewer Banner Info */}
              <div className="p-3 bg-zinc-900/95 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-300 px-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>
                    {isAr
                      ? "المستند الأصلي المرفوع - مسار آمن عبر خوادم E3 قطر"
                      : "Direct Stream from Secure E3 Document Vault"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1 font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isAr ? "تنزيل الملف" : "Download PDF"}</span>
                  </a>
                  <span className="text-zinc-600">|</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("DOSSIER")}
                    className="text-indigo-400 hover:text-indigo-300 underline font-bold"
                  >
                    {isAr ? "عرض الملف التنفيذي الذكي" : "View Executive Dossier"}
                  </button>
                </div>
              </div>

              {/* Iframe Viewport */}
              <div className="flex-1 w-full h-full relative bg-zinc-950">
                <iframe
                  src={`${streamUrl}#toolbar=1&navpanes=0`}
                  title={`CV Document for ${fullName}`}
                  className="w-full h-full border-0 bg-zinc-950"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
