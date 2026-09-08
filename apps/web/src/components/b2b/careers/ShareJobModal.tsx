"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import {
  Share2,
  Copy,
  Check,
  X,
  Mail,
  ExternalLink,
  MessageCircle,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export interface ShareJobProps {
  jobId?: string;
  jobTitle?: string;
  department?: string | null;
  location?: string | null;
  type?: string | null;
  locale?: string;
  variant?: "card" | "detail" | "header" | "icon";
  isPageShare?: boolean;
  className?: string;
  /** Optional controlled open state for direct test inspection */
  defaultOpen?: boolean;
}

export function ShareJobModal({
  jobId,
  jobTitle = "Career Opportunity",
  department,
  location,
  type,
  locale = "en",
  variant = "card",
  isPageShare = false,
  className,
  defaultOpen = false,
}: ShareJobProps) {
  const isAr = locale === "ar";
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const dialogId = useId();

  // Detect navigator.share availability on client
  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setHasNativeShare(true);
    }
  }, []);

  // Compute canonical share URL
  const getShareUrl = useCallback(() => {
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://eeeqa.com";

    if (isPageShare || !jobId) {
      return `${origin}/${locale}/b2b/careers`;
    }
    return `${origin}/${locale}/careers/${jobId}`;
  }, [isPageShare, jobId, locale]);

  const shareUrl = getShareUrl();

  // Composed sharing texts
  const shareTitle = isPageShare
    ? isAr
      ? "وظائف وفرص الانضمام إلى إي ثري قطر"
      : "Careers & Opportunities at E3 Qatar"
    : isAr
      ? `فرصة وظيفية: ${jobTitle} في إي ثري قطر`
      : `Career Opportunity: ${jobTitle} at E3 Qatar`;

  const shareText = isPageShare
    ? isAr
      ? "استكشف أحدث الشواغر الوظيفية وفرص الانضمام إلى نخبة مصممي ومهندسي التجارب الحية في دولة قطر:"
      : "Explore the latest career opportunities with the live experience engineering pioneers at E3 Qatar:"
    : isAr
      ? `انضم إلى فريق إي ثري قطر كـ "${jobTitle}". استكشف المتطلبات وقدّم طلبك الآن عبر الرابط الرسمي:`
      : `Join the E3 Qatar team as "${jobTitle}". Explore the role requirements and apply directly:`;

  // Handle copy to clipboard
  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  // Handle native device share
  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (e: any) {
        // Ignore user cancellation (AbortError)
        if (e.name !== "AbortError") {
          console.warn("Native share error:", e);
        }
      }
    }
  };

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Social Share Intent URLs
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareTitle}\n${shareText}\n${shareUrl}`
  )}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareTitle
  )}&url=${encodeURIComponent(shareUrl)}&hashtags=E3Qatar,Careers,Hiring,QatarJobs`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    shareTitle
  )}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;

  // Determine button trigger layout based on variant
  const renderTrigger = () => {
    if (variant === "header") {
      return (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          data-testid="share-careers-page-btn"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs font-bold text-[var(--text-secondary)] hover:text-cyan-400 hover:border-cyan-500/40 transition-all shadow-sm active:scale-95",
            className
          )}
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isAr ? "مشاركة الشواغر" : "Share Careers"}</span>
        </button>
      );
    }

    if (variant === "detail") {
      return (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          data-testid={`share-job-btn-${jobId || "detail"}`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={cn(
            "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] hover:border-cyan-500/50 hover:bg-cyan-500/5 text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:text-cyan-400 transition-all shadow-sm active:scale-95",
            className
          )}
        >
          <Share2 className="w-4 h-4 text-cyan-400" />
          <span>{isAr ? "مشاركة هذه الوظيفة" : "Share Job"}</span>
        </button>
      );
    }

    if (variant === "icon") {
      return (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          data-testid={`share-job-btn-${jobId || "icon"}`}
          aria-label={isAr ? "مشاركة الوظيفة" : "Share Role"}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={cn(
            "p-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-[var(--text-secondary)] hover:text-cyan-400 hover:border-cyan-500/40 transition-all active:scale-95",
            className
          )}
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      );
    }

    // Default "card" variant
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        data-testid={`share-job-btn-${jobId || "card"}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-cyan-400 hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-level-1)] transition-all active:scale-95",
          className
        )}
      >
        <Share2 className="w-3.5 h-3.5 text-cyan-400" />
        <span>{isAr ? "مشاركة" : "Share"}</span>
      </button>
    );
  };

  return (
    <>
      {renderTrigger()}

      {/* Share Modal Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`share-modal-title-${dialogId}`}
          data-testid="share-job-dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          dir={isAr ? "rtl" : "ltr"}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="w-full max-w-md bg-[#0c101b] border border-cyan-500/20 rounded-3xl shadow-2xl overflow-hidden text-[var(--text-primary)] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-3 bg-white/[0.02]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id={`share-modal-title-${dialogId}`}
                    data-testid="share-dialog-title"
                    className="font-bold text-base sm:text-lg text-white leading-tight"
                  >
                    {isPageShare
                      ? isAr
                        ? "مشاركة بوابة الشواغر الوظيفية"
                        : "Share Careers Opportunities"
                      : isAr
                        ? "مشاركة الفرصة الوظيفية"
                        : "Share Job Opportunity"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300 mt-1 font-medium">
                    <span className="text-cyan-300 line-clamp-1">{jobTitle}</span>
                    {department && (
                      <>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{department}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                data-testid="share-close-btn"
                aria-label={isAr ? "إغلاق النافذة" : "Close Share Dialog"}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6">
              {/* 1-Click Social Sharing Channels */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {isAr ? "مشاركة سريعة عبر المنصات" : "Share Directly"}
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* WhatsApp */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="share-whatsapp-btn"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-400 transition-all group"
                  >
                    <MessageCircle className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-white">WhatsApp</span>
                    <span className="text-[10px] text-emerald-300/80 mt-0.5 flex items-center gap-0.5">
                      {isAr ? "إرسال" : "Send"} <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="share-linkedin-btn"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0A66C2]/10 border border-[#0A66C2]/25 hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/20 text-[#388bfd] transition-all group"
                  >
                    <LinkedinIcon className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-white">LinkedIn</span>
                    <span className="text-[10px] text-blue-300/80 mt-0.5 flex items-center gap-0.5">
                      {isAr ? "نشر" : "Share"} <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </a>

                  {/* X / Twitter */}
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="share-twitter-btn"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white transition-all group"
                  >
                    <TwitterIcon className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform text-slate-200" />
                    <span className="text-xs font-bold text-white">X</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-0.5">
                      {isAr ? "مشاركة" : "Post"} <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </a>

                  {/* Email */}
                  <a
                    href={mailtoUrl}
                    data-testid="share-email-btn"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/20 text-amber-400 transition-all group"
                  >
                    <Mail className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-white">Email</span>
                    <span className="text-[10px] text-amber-300/80 mt-0.5 flex items-center gap-0.5">
                      {isAr ? "إيميل" : "Mail"} <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </a>
                </div>
              </div>

              {/* Native Mobile / System Share Action (if supported) */}
              {hasNativeShare && (
                <div>
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    data-testid="share-device-btn"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{isAr ? "مشاركة عبر تطبيقات الجهاز..." : "Share via Device Apps..."}</span>
                  </button>
                </div>
              )}

              {/* Copy Direct Job Link */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {isAr ? "أو انسخ الرابط المباشر للوظيفة" : "Or Copy Direct Link"}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-slate-300 truncate select-all">
                    {shareUrl}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    data-testid="share-copy-link-btn"
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-md active:scale-95",
                      copied
                        ? "bg-emerald-500 text-black"
                        : "bg-cyan-500 hover:bg-cyan-400 text-black"
                    )}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>
                      {copied
                        ? isAr
                          ? "تم النسخ!"
                          : "Copied!"
                        : isAr
                          ? "نسخ الرابط"
                          : "Copy Link"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400/80 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? "إي ثري قطر للفعاليات والترفيه" : "E3 Qatar Live Experiences"}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
              >
                {isAr ? "إغلاق" : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
