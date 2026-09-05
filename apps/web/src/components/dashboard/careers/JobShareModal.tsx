"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Share2,
  Mail,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface JobShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    department?: string | null;
    location?: string | null;
    type?: string;
  } | null;
  locale?: string;
}

export function JobShareModal({
  isOpen,
  onClose,
  job,
  locale = "en",
}: JobShareModalProps) {
  const { toast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const isAr = locale === "ar";

  if (!isOpen || !job) return null;

  // Determine the public URL for this job opening
  const origin = typeof window !== "undefined" ? window.location.origin : "https://e3qatar.qa";
  const publicUrl = `${origin}/${locale}/careers/${job.id}`;

  const cleanDept = job.department || (isAr ? "العمليات والإبداع" : "Operations & Experience");
  const cleanLoc = job.location || (isAr ? "الدوحة، قطر" : "Doha, Qatar");

  // Pre-composed LinkedIn / Social Post text
  const postDraft = isAr
    ? `🚀 نحن نوظف في E3 قطر!
يسعدنا الإعلان عن فتح باب التقديم لشغل وظيفة "${job.title}".

📍 المقر: ${cleanLoc}
🏢 القسم: ${cleanDept}
🌐 تقدم الآن عبر الرابط الرسمي:
${publicUrl}

#وظائف_قطر #E3Qatar #توظيف #قطر #Hiring #Careers`
    : `🚀 We are hiring at E3 Qatar!

We're looking for an exceptional "${job.title}" to join our visionary team in Doha.

📍 Location: ${cleanLoc}
🏢 Department: ${cleanDept}
🔗 Learn more and apply directly here:
${publicUrl}

#Hiring #QatarJobs #E3Qatar #Careers #EventEngineering #CreativityInMotion`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      toast(isAr ? "تم نسخ الرابط إلى الحافظة" : "Job link copied to clipboard!", "success");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast(isAr ? "فشل النسخ" : "Failed to copy link", "error");
    }
  };

  const handleCopyDraft = async () => {
    try {
      await navigator.clipboard.writeText(postDraft);
      setCopiedDraft(true);
      toast(isAr ? "تم نسخ مسودة المنشور" : "LinkedIn post draft copied!", "success");
      setTimeout(() => setCopiedDraft(false), 2500);
    } catch {
      toast(isAr ? "فشل النسخ" : "Failed to copy draft", "error");
    }
  };

  // Social sharing links
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${isAr ? "فرصة وظيفية في E3 قطر:" : "Job Opportunity at E3 Qatar:"} ${job.title}\n${publicUrl}`
  )}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `We are hiring: ${job.title} at E3 Qatar! Check out the details & apply: ${publicUrl} #E3Qatar #Hiring`
  )}`;
  const mailShareUrl = `mailto:?subject=${encodeURIComponent(
    `Job Opening at E3 Qatar: ${job.title}`
  )}&body=${encodeURIComponent(postDraft)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl shadow-2xl overflow-hidden text-[var(--text-primary)] animate-in zoom-in-95 duration-200"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-level-1)] flex items-center justify-between bg-[var(--surface-hover)]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isAr ? "مشاركة الشاغر الوظيفي" : "Share Job Opening"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                {job.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-white hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Copy Public Link */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              {isAr ? "الرابط العام المباشر للتقديم" : "Public Application Link"}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 bg-[var(--surface-hover)] border border-[var(--border-level-1)] rounded-xl text-xs font-mono text-[var(--text-secondary)] truncate">
                {publicUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-all font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? (isAr ? "تم النسخ" : "Copied") : (isAr ? "نسخ الرابط" : "Copy Link")}</span>
              </button>
            </div>
          </div>

          {/* 1-Click Social Channel Launchers */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              {isAr ? "نشر فوري عبر المنصات" : "1-Click Social Post & Dispatch"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* LinkedIn */}
              <a
                href={linkedinShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0A66C2]/10 border border-[#0A66C2]/30 hover:bg-[#0A66C2]/20 text-[#0A66C2] transition-all text-center group"
              >
                <LinkedinIcon className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[var(--text-primary)]">LinkedIn</span>
                <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-0.5">
                  {isAr ? "نشر" : "Share"} <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 transition-all text-center group"
              >
                <MessageCircle className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[var(--text-primary)]">WhatsApp</span>
                <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-0.5">
                  {isAr ? "إرسال" : "Send"} <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </a>

              {/* X / Twitter */}
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] hover:border-[var(--border-level-2)] text-[var(--text-primary)] transition-all text-center group"
              >
                <TwitterIcon className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform text-sky-400" />
                <span className="text-xs font-bold text-[var(--text-primary)]">X / Twitter</span>
                <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-0.5">
                  {isAr ? "تغريد" : "Tweet"} <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </a>

              {/* Email */}
              <a
                href={mailShareUrl}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] hover:border-[var(--border-level-2)] text-[var(--text-primary)] transition-all text-center group"
              >
                <Mail className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform text-amber-400" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Email</span>
                <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-0.5">
                  {isAr ? "إيميل" : "Email"} <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </a>
            </div>
          </div>

          {/* Pre-written Post Draft */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {isAr ? "مسودة المنشور الجاهزة (LinkedIn / Social)" : "Pre-composed Social Post Template"}
              </label>
              <button
                type="button"
                onClick={handleCopyDraft}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
              >
                {copiedDraft ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDraft ? (isAr ? "تم النسخ!" : "Copied!") : (isAr ? "نسخ المنشور" : "Copy Template")}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={5}
              value={postDraft}
              className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-1)] rounded-xl p-3 text-xs font-mono text-[var(--text-secondary)] focus:outline-none select-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-level-1)] bg-[var(--surface-hover)]/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)]/80 transition-colors"
          >
            {isAr ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
