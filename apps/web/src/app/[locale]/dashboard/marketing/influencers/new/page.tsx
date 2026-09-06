"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/components/layout/LocaleProvider";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Sparkles,
  User,
  Share2,
  ShieldCheck,
  Building,
  CheckCircle2,
  Copy,
} from "lucide-react";

export default function NewInfluencerPage() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTokenLink, setCreatedTokenLink] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    displayName: "",
    legalName: "",
    email: "",
    phone: "",
    whatsapp: "",
    location: "Doha, Qatar",
    nationality: "Qatari",
    isQatarBased: true,
    preferredLocale: locale,
    creatorTier: "MICRO",
    status: "PROSPECT",
    categories: ["LIFESTYLE"],
    languages: ["ar", "en"],
    website: "",
    contentSuitability: "FAMILY_FRIENDLY",
    brandSafetyStatus: "VERIFIED_SAFE",
    brandSafetyNotes: "",
    agencyName: "",
    agencyContactName: "",
    agencyEmail: "",
    agencyPhone: "",
    generateInviteLink: true,
    inviteDurationHours: 24,
    // Platform
    initialPlatform: "INSTAGRAM",
    initialHandle: "",
    initialFollowers: 0,
  });

  const availableCategories = [
    { value: "LIFESTYLE", labelEn: "Lifestyle", labelAr: "أسلوب حياة" },
    { value: "ENTERTAINMENT", labelEn: "Entertainment", labelAr: "ترفيه" },
    { value: "FAMILY", labelEn: "Family & Parenting", labelAr: "عائلة وأطفال" },
    { value: "FOOD_DINING", labelEn: "Food & Dining", labelAr: "مطاعم وضيافة" },
    { value: "TRAVEL_TOURISM", labelEn: "Travel & Tourism", labelAr: "سياحة وسفر" },
    { value: "TECH_GAMING", labelEn: "Tech & Gaming", labelAr: "تقنية وألعاب" },
    { value: "SPORTS_FITNESS", labelEn: "Sports & Fitness", labelAr: "رياضة ولياقة" },
    { value: "FASHION_BEAUTY", labelEn: "Fashion & Beauty", labelAr: "أزياء وجمال" },
    { value: "CULTURE_HERITAGE", labelEn: "Culture & Heritage", labelAr: "ثقافة وتراث" },
  ];

  const handleCategoryToggle = (cat: string) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(cat);
      if (exists) {
        if (prev.categories.length === 1) return prev; // keep at least one
        return { ...prev, categories: prev.categories.filter((c) => c !== cat) };
      }
      return { ...prev, categories: [...prev.categories, cat] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName || !formData.email) {
      toast(isAr ? "يرجى تعبئة الاسم والبريد الإلكتروني" : "Display name and email are required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/influencer/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          platforms: formData.initialHandle
            ? [
                {
                  platform: formData.initialPlatform,
                  handle: formData.initialHandle,
                  profileUrl: `https://${formData.initialPlatform.toLowerCase()}.com/${formData.initialHandle.replace(/^@/, "")}`,
                  followerCount: Number(formData.initialFollowers) || 0,
                },
              ]
            : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create creator");
      }

      toast(isAr ? "تم إنشاء سجل المؤثر بنجاح" : "Creator record created successfully", "success");

      // Generate invitation token if requested
      if (formData.generateInviteLink && data.data?.id) {
        try {
          const tokenRes = await fetch(`/api/influencer/creators/${data.data.id}/tokens`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              scope: "COMPLETE_PROFILE",
              durationHours: formData.inviteDurationHours,
            }),
          });
          const tokenData = await tokenRes.json();
          if (tokenRes.ok && tokenData.data?.token) {
            const portalUrl = `${window.location.origin}/${locale}/creator-portal/${tokenData.data.token}`;
            setCreatedTokenLink(portalUrl);
            return;
          }
        } catch (tokErr) {
          console.error("Token generation failed:", tokErr);
        }
      }

      router.push(`/${locale}/dashboard/marketing/influencers/${data.data.id}`);
    } catch (err: any) {
      toast(err.message || "An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${locale}/dashboard/marketing/influencers/directory`}
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
        >
          {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          <span>{isAr ? "العودة إلى الدليل" : "Back to Directory"}</span>
        </Link>
        <span className="text-xs text-[var(--text-muted)]">
          {isAr ? "إدخال داخلي آمن ومحمي" : "Secure internal onboarding"}
        </span>
      </div>

      {/* Success Modal / Banner if invitation token was generated */}
      {createdTokenLink && (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[var(--text-primary)] space-y-4">
          <div className="flex items-center gap-3 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {isAr
                ? "تم إنشاء المؤثر وتوليد رابط البوابة الآمن بنجاح!"
                : "Creator created & secure portal invitation link generated!"}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {isAr
              ? `صالح لمدة ${formData.inviteDurationHours} ساعة. شارك هذا الرابط مع المؤثر لاستكمال ملفه الشخصي:`
              : `Valid for ${formData.inviteDurationHours} hours. Share this secure onboarding link with the creator:`}
          </p>
          <div className="flex items-center gap-2 bg-[var(--bg-level-1)] p-2 rounded-lg border border-[var(--border-level-2)]">
            <input
              type="text"
              readOnly
              value={createdTokenLink}
              className="flex-1 bg-transparent text-xs text-[var(--text-primary)] font-mono outline-none px-2"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(createdTokenLink);
                toast(isAr ? "تم نسخ الرابط" : "Link copied to clipboard", "success");
              }}
              className="p-2 rounded bg-[var(--bg-level-2)] hover:bg-[var(--bg-level-3)] text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isAr ? "نسخ" : "Copy"}</span>
            </button>
          </div>
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/dashboard/marketing/influencers/directory`)}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 transition"
            >
              {isAr ? "الانتقال إلى الدليل" : "Go to Directory"}
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      {!createdTokenLink && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-level-1)] pb-3">
              <User className="w-4 h-4 text-[var(--color-accent)]" />
              <span>{isAr ? "المعلومات الأساسية" : "Basic Information"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  {isAr ? "الاسم التجاري / المعروض *" : "Display / Stage Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. Dana Al-Ali"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  {isAr ? "الاسم القانوني (للعقود)" : "Legal Name (Contracts)"}
                </label>
                <input
                  type="text"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  placeholder="e.g. Dana Ahmed Al-Ali"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="creator@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  {isAr ? "رقم الهاتف / الواتساب" : "Phone / WhatsApp"}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsapp: e.target.value })}
                  placeholder="+974 5500 0000"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  {isAr ? "الموقع / الإقامة" : "Location"}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Doha, Qatar"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  {isAr ? "الجنسية" : "Nationality"}
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="Qatari"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isQatarBased}
                  onChange={(e) => setFormData({ ...formData, isQatarBased: e.target.checked })}
                  className="rounded border-[var(--border-level-2)] text-[var(--color-accent)] focus:ring-0"
                />
                <span>{isAr ? "مقيم في دولة قطر" : "Based in Qatar"}</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">
                  {isAr ? "الفئة الحجمية:" : "Creator Tier:"}
                </span>
                <select
                  value={formData.creatorTier}
                  onChange={(e) => setFormData({ ...formData, creatorTier: e.target.value })}
                  className="px-2.5 py-1 rounded bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
                >
                  <option value="NANO">Nano (&lt;10k)</option>
                  <option value="MICRO">Micro (10k-50k)</option>
                  <option value="MID_TIER">Mid-Tier (50k-500k)</option>
                  <option value="MACRO">Macro (500k-1M)</option>
                  <option value="MEGA">Mega (1M+)</option>
                  <option value="CELEBRITY">Celebrity</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">{isAr ? "الحالة:" : "Status:"}</span>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="px-2.5 py-1 rounded bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
                >
                  <option value="PROSPECT">{isAr ? "مرشح" : "Prospect"}</option>
                  <option value="APPROVED">{isAr ? "معتمد" : "Approved"}</option>
                  <option value="ACTIVE">{isAr ? "نشط" : "Active"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Categories & Niches */}
          <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-level-1)] pb-3">
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              <span>{isAr ? "مجالات المحتوى والاهتمام" : "Content Categories"}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => {
                const isSelected = formData.categories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategoryToggle(cat.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-accent)] font-semibold"
                        : "bg-[var(--bg-level-1)] border-[var(--border-level-2)] text-[var(--text-muted)] hover:border-[var(--border-level-1)]"
                    }`}
                  >
                    {isAr ? cat.labelAr : cat.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Initial Social Media Platform */}
          <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-level-1)] pb-3">
              <Share2 className="w-4 h-4 text-[var(--color-accent)]" />
              <span>{isAr ? "الحساب الرئيسي على وسائل التواصل" : "Primary Social Account"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  {isAr ? "المنصة" : "Platform"}
                </label>
                <select
                  value={formData.initialPlatform}
                  onChange={(e) => setFormData({ ...formData, initialPlatform: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
                >
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="SNAPCHAT">Snapchat</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="X">X (Twitter)</option>
                  <option value="LINKEDIN">LinkedIn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  {isAr ? "اسم الحساب (Handle)" : "Handle / Username"}
                </label>
                <input
                  type="text"
                  value={formData.initialHandle}
                  onChange={(e) => setFormData({ ...formData, initialHandle: e.target.value })}
                  placeholder="@username"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  {isAr ? "عدد المتابعين التقديري" : "Follower Count"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.initialFollowers}
                  onChange={(e) => setFormData({ ...formData, initialFollowers: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Brand Safety & Representation */}
          <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-level-1)] pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "سلامة العلامة التجارية والوكالة" : "Brand Safety & Representation"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  {isAr ? "ملائمة المحتوى" : "Content Suitability"}
                </label>
                <select
                  value={formData.contentSuitability}
                  onChange={(e) => setFormData({ ...formData, contentSuitability: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
                >
                  <option value="FAMILY_FRIENDLY">Family Friendly (G)</option>
                  <option value="GENERAL_AUDIENCE">General Audience (PG)</option>
                  <option value="MATURE_CAUTION">Mature / Discretion Advised</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  {isAr ? "حالة سلامة العلامة" : "Brand Safety Status"}
                </label>
                <select
                  value={formData.brandSafetyStatus}
                  onChange={(e) => setFormData({ ...formData, brandSafetyStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
                >
                  <option value="VERIFIED_SAFE">Verified Safe</option>
                  <option value="UNDER_OBSERVATION">Under Observation</option>
                  <option value="RESTRICTED">Restricted</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  {isAr ? "اسم الوكالة أو شركة التمثيل (إن وجد)" : "Agency / Representation Name (Optional)"}
                </label>
                <input
                  type="text"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  placeholder="e.g. Qatar Talent Hub"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Portal Onboarding Link Generation */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--bg-level-2)] to-[var(--bg-level-1)] border border-[var(--border-level-1)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  {isAr ? "توليد رابط استكمال الملف فوراً" : "Instant Profile Onboarding Link"}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {isAr
                    ? "توليد رابط آمن مشفر يرسل للمؤثر لاستكمال بياناته ورفع وسائطه بدون حساب دائم"
                    : "Generate a secure 32-byte hashed token for the creator to complete their profile without password setup"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.generateInviteLink}
                  onChange={(e) => setFormData({ ...formData, generateInviteLink: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--bg-level-3)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
              </label>
            </div>

            {formData.generateInviteLink && (
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-[var(--text-muted)]">
                  {isAr ? "مدة صلاحية الرابط:" : "Token Validity Duration:"}
                </span>
                <select
                  value={formData.inviteDurationHours}
                  onChange={(e) => setFormData({ ...formData, inviteDurationHours: Number(e.target.value) })}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
                >
                  <option value={24}>{isAr ? "24 ساعة (افتراضي)" : "24 Hours (Default)"}</option>
                  <option value={48}>{isAr ? "48 ساعة" : "48 Hours"}</option>
                  <option value={72}>{isAr ? "72 ساعة" : "72 Hours"}</option>
                </select>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-level-1)]">
            <Link
              href={`/${locale}/dashboard/marketing/influencers/directory`}
              className="px-4 py-2 rounded-lg bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ المؤثر" : "Create Creator"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
