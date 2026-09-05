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
} from "lucide-react";

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
  } | null;
  rankingInfo?: {
    matchScore: number;
    rank: number;
    total: number;
    tier: string;
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const isAr = locale === "ar";

  if (!isOpen || !candidate) return null;

  const fullName = `${candidate.firstName} ${candidate.lastName}`.trim();
  const cvUrl = candidate.cvUrl || "";
  const isPdf = cvUrl.toLowerCase().endsWith(".pdf") || cvUrl.includes("application/pdf") || cvUrl.startsWith("http");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isFullscreen ? "fixed inset-2 w-auto h-auto max-w-none" : "max-w-5xl h-[90vh]"
        }`}
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Header Bar */}
        <div className="p-4 border-b border-[var(--border-level-1)] bg-[var(--surface-hover)]/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[var(--text-primary)] truncate">
                  {fullName}
                </h3>
                {rankingInfo && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 shrink-0">
                    <Award className="w-3 h-3 text-purple-400" />
                    <span>
                      {isAr
                        ? `المرتبة #${rankingInfo.rank} من ${rankingInfo.total} (${rankingInfo.matchScore}%)`
                        : `Rank #${rankingInfo.rank} of ${rankingInfo.total} (${rankingInfo.matchScore}%)`}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                {candidate.jobTitle} {candidate.department ? `· ${candidate.department}` : ""}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Download Button */}
            <a
              href={candidate.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)]/80 transition-colors"
              title={isAr ? "تحميل ملف السيرة الذاتية" : "Download CV File"}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? "تحميل" : "Download"}</span>
            </a>

            {/* External Open Button */}
            <a
              href={candidate.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] transition-colors"
              title={isAr ? "فتح في تبويب خارجي" : "Open in new tab"}
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] transition-colors"
              title={isFullscreen ? (isAr ? "تصغير" : "Exit Fullscreen") : (isAr ? "ملء الشاشة" : "Fullscreen")}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Candidate Quick AI Context Strip */}
        {candidate.cvParsedData && (
          <div className="px-5 py-2.5 bg-purple-950/20 border-b border-purple-900/30 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 text-purple-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {isAr ? "الخبرة المقدرة:" : "Experience:"}{" "}
                <strong className="text-white">
                  {candidate.cvParsedData.experienceYears || 3} {isAr ? "سنوات" : "Years"}
                </strong>
              </span>
              <span className="text-purple-700">|</span>
              <span className="truncate max-w-xs">
                {candidate.cvParsedData.education || "Bachelor Degree"}
              </span>
            </div>

            {Array.isArray(candidate.cvParsedData.skills) && candidate.cvParsedData.skills.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-md">
                {candidate.cvParsedData.skills.slice(0, 4).map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-medium whitespace-nowrap"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CV Document Viewer Body */}
        <div className="flex-1 bg-zinc-950 relative overflow-hidden flex items-center justify-center">
          {cvUrl && !iframeError ? (
            <iframe
              src={`${cvUrl}#toolbar=1&navpanes=0`}
              title={`CV of ${fullName}`}
              className="w-full h-full border-0 bg-zinc-900"
              onError={() => setIframeError(true)}
            />
          ) : (
            /* Fallback formatted resume view if browser blocked iframe or file is a dummy URL */
            <div className="max-w-2xl w-full p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">
                  {fullName} - {candidate.jobTitle}
                </h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  {candidate.email} · {candidate.phone || "No phone provided"}
                </p>
              </div>

              {candidate.cvParsedData?.summary && (
                <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-start text-xs text-[var(--text-secondary)] leading-relaxed">
                  <div className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? "الملخص المهني للمترشح" : "Candidate Executive Profile"}</span>
                  </div>
                  {candidate.cvParsedData.summary}
                </div>
              )}

              <div className="pt-4 flex justify-center gap-3">
                <a
                  href={candidate.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  <span>{isAr ? "تحميل الملف الأصلي" : "Open Original Document"}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
