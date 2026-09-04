"use client";

import React, { useState } from "react";
import { X, Users, UserPlus, Check, Copy, Loader2 } from "lucide-react";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  companyName: string;
}

export function InviteMemberModal({ isOpen, onClose, locale, companyName }: InviteMemberModalProps) {
  const isAr = locale === "ar";
  const [email, setEmail] = useState("");
  const [clientRole, setClientRole] = useState("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{ inviteUrl: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/business/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, clientRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create invitation");
      }

      const fullUrl = `${window.location.origin}${data.inviteUrl}`;
      setInviteResult({ inviteUrl: fullUrl, email });
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? "فشل إرسال الدعوة" : "Failed to invite member"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!inviteResult?.inviteUrl) return;
    navigator.clipboard.writeText(inviteResult.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                {isAr ? "دعوة عضو جديد للمؤسسة" : "Invite Organization Colleague"}
              </h2>
              <p className="text-xs text-zinc-400">{companyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {inviteResult ? (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>
                {isAr
                  ? `تم إنشاء رابط الدعوة بنجاح لـ ${inviteResult.email}`
                  : `Invitation link generated successfully for ${inviteResult.email}`}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                {isAr ? "رابط الانضمام للمؤسسة (صالح لمدة 7 أيام)" : "Secure Join Link (Valid for 7 days)"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteResult.inviteUrl}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-300 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? (isAr ? "تم النسخ" : "Copied!") : (isAr ? "نسخ" : "Copy")}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                {isAr ? "البريد الإلكتروني للزميل" : "Colleague Work Email"} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@yourcompany.qa"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                {isAr ? "الدور والصلاحية في المؤسسة" : "Workspace Membership Role"}
              </label>
              <select
                value={clientRole}
                onChange={(e) => setClientRole(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 transition-all font-medium"
              >
                <option value="MEMBER">{isAr ? "عضو مشاريع (Project Member)" : "Project Member (Standard)"}</option>
                <option value="ADMIN">{isAr ? "مسؤول مؤسسة (Organization Admin)" : "Organization Admin"}</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isAr ? "جاري التوليد..." : "Generating Invite..."}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{isAr ? "إنشاء رابط الدعوة" : "Generate Invite Link"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
