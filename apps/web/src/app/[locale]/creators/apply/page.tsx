"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/layout/LocaleProvider";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  User,
  Share2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function CreatorApplicationPage() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Details
    displayName: "",
    legalName: "",
    email: "",
    phone: "",
    whatsapp: "",
    location: "Doha, Qatar",
    nationality: "Qatari",
    preferredLocale: locale,
    isAgencyRepresented: false,
    agencyName: "",
    agencyContact: "",

    // Creator Details
    bio: "",
    audienceDescription: "",
    categories: ["LIFESTYLE"],
    website: "",

    // Primary Social Account
    platform: "INSTAGRAM",
    handle: "",
    profileUrl: "",
    followerCount: 0,

    // Availability & Commercial
    eventAppearanceInterest: true,
    collaborationPreference: "PAID_OR_BARTER",
    indicativeRateRange: "QAR 3,000 - 6,000",

    // Consents
    dataProcessingConsent: false,
    communicationConsent: false,
    publicFeatureConsent: false,
    accuracyConfirmed: false,
  });

  const availableCategories = [
    { value: "LIFESTYLE", labelEn: "Lifestyle", labelAr: "أسلوب حياة" },
    { value: "ENTERTAINMENT", labelEn: "Entertainment", labelAr: "ترفيه وفعاليات" },
    { value: "FAMILY", labelEn: "Family & Kids", labelAr: "عائلة وأطفال" },
    { value: "FOOD_DINING", labelEn: "Food & Dining", labelAr: "مطاعم وضيافة" },
    { value: "TRAVEL_TOURISM", labelEn: "Travel & Tourism", labelAr: "سياحة واستكشاف" },
    { value: "SPORTS_FITNESS", labelEn: "Sports & Fitness", labelAr: "رياضة ولياقة" },
    { value: "TECH_GAMING", labelEn: "Gaming & Tech", labelAr: "ألعاب وتقنية" },
    { value: "CULTURE_HERITAGE", labelEn: "Culture & Heritage", labelAr: "ثقافة وتراث" },
  ];

  const handleCategoryToggle = (cat: string) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(cat);
      if (exists) {
        if (prev.categories.length === 1) return prev;
        return { ...prev, categories: prev.categories.filter((c) => c !== cat) };
      }
      return { ...prev, categories: [...prev.categories, cat] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName || !formData.email || !formData.handle) {
      toast(isAr ? "يرجى ملء الحقول الإلزامية المطلوبة" : "Please fill in all mandatory fields", "error");
      return;
    }

    if (!formData.dataProcessingConsent || !formData.accuracyConfirmed) {
      toast(
        isAr
          ? "يرجى الموافقة على شروط معالجة البيانات وتأكيد صحة المعلومات"
          : "Data processing consent and accuracy confirmation are mandatory",
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/influencer/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formData.displayName,
          legalName: formData.legalName,
          email: formData.email,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          location: formData.location,
          nationality: formData.nationality,
          isQatarBased: formData.location.toLowerCase().includes("qatar") || formData.location.toLowerCase().includes("doha"),
          preferredLocale: formData.preferredLocale,
          bioEn: formData.bio,
          categories: formData.categories,
          website: formData.website,
          agencyName: formData.isAgencyRepresented ? formData.agencyName : undefined,
          agencyContactName: formData.isAgencyRepresented ? formData.agencyContact : undefined,
          publicConsent: formData.publicFeatureConsent,
          dataConsent: formData.dataProcessingConsent,
          communicationConsent: formData.communicationConsent,
          platforms: [
            {
              platform: formData.platform,
              handle: formData.handle.replace(/^@/, ""),
              profileUrl: formData.profileUrl || `https://${formData.platform.toLowerCase()}.com/${formData.handle.replace(/^@/, "")}`,
              followerCount: Number(formData.followerCount) || 0,
            },
          ],
          submittedData: {
            audienceDescription: formData.audienceDescription,
            collaborationPreference: formData.collaborationPreference,
            indicativeRateRange: formData.indicativeRateRange,
            eventAppearanceInterest: formData.eventAppearanceInterest,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Application submission failed");
      }

      setIsSuccess(true);
      toast(
        isAr
          ? "تم إرسال طلبك بنجاح! سيتواصل معك فريق التسويق قريباً."
          : "Application submitted successfully! Our team will review your profile.",
        "success"
      );
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-level-1)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link
            href={`/${locale}/creators`}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent)] hover:underline mb-2"
          >
            {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{isAr ? "العودة لدليل صناع المحتوى" : "Back to Creator Collective"}</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            {isAr ? "انضم إلى صناع المحتوى في E3 قطر" : "Join E3 Creator Collective"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            {isAr
              ? "فرصتك للتعاون في أضخم الفعاليات والوجهات الترفيهية في قطر، وحضور أيام الإعلام الحصرية، وإطلاق المشاريع الإبداعية."
              : "Collaborate with Qatar's premier entertainment entity on major event launches, VIP previews, and high-impact campaigns."}
          </p>
        </div>

        {/* Success Confirmation Card */}
        {isSuccess ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-level-2)] border border-emerald-500/30 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {isAr ? "شكراً لك! تم استلام طلب الانضمام بنجاح" : "Thank You! Your Application is Received"}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
              {isAr
                ? "يقوم فريق التسويق والشراكات بمراجعة حساباتك وتطابقها مع الفعاليات القادمة. في حال القبول، ستصلك رسالة إلكترونية تحتوي على رابط آمن للتعاون."
                : "Our marketing team evaluates every application against upcoming campaigns. If selected, you will receive an invitation link via email."}
            </p>
            <div className="pt-4">
              <Link
                href={`/${locale}`}
                className="px-6 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 transition"
              >
                {isAr ? "العودة للرئيسية" : "Return to Homepage"}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Basic Information */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-level-1)] pb-3">
                <User className="w-4 h-4 text-[var(--color-accent)]" />
                <span>{isAr ? "المعلومات الشخصية وبيانات الاتصال" : "Personal & Contact Information"}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-[var(--text-muted)] mb-1">
                    {isAr ? "الاسم المعروض / اسم الشهرة *" : "Stage / Display Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="e.g. Tariq Al-Kuwari"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--text-muted)] mb-1">
                    {isAr ? "الاسم القانوني الكامل (للعقود)" : "Full Legal Name"}
                  </label>
                  <input
                    type="text"
                    value={formData.legalName}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    placeholder="e.g. Tariq Mohammed Al-Kuwari"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--text-muted)] mb-1">
                    {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="creator@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--text-muted)] mb-1">
                    {isAr ? "رقم الهاتف / الواتساب *" : "Phone / WhatsApp Number *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsapp: e.target.value })}
                    placeholder="+974 5500 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--text-muted)] mb-1">
                    {isAr ? "مكان الإقامة الحالية" : "Current Location / Residence"}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Doha, Qatar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--text-muted)] mb-1">
                    {isAr ? "الجنسية" : "Nationality"}
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="Qatari"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Creator Profile & Socials */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-level-1)] pb-3">
                <Share2 className="w-4 h-4 text-[var(--color-accent)]" />
                <span>{isAr ? "الحسابات ومجالات المحتوى" : "Platforms & Content Niches"}</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-[var(--text-muted)] mb-2">
                    {isAr ? "المجالات التي تركز عليها *" : "Content Niches *"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map((cat) => {
                      const isSelected = formData.categories.includes(cat.value);
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => handleCategoryToggle(cat.value)}
                          className={`px-3 py-1.5 rounded-xl font-medium border transition-all ${
                            isSelected
                              ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-accent)] font-semibold"
                              : "bg-[var(--bg-level-1)] border-[var(--border-level-2)] text-[var(--text-muted)]"
                          }`}
                        >
                          {isAr ? cat.labelAr : cat.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block font-medium text-[var(--text-muted)] mb-1">
                      {isAr ? "المنصة الرئيسية *" : "Primary Platform *"}
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                    >
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="TIKTOK">TikTok</option>
                      <option value="SNAPCHAT">Snapchat</option>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="X">X (Twitter)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[var(--text-muted)] mb-1">
                      {isAr ? "اسم الحساب (Handle) *" : "Account Handle *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.handle}
                      onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                      placeholder="@handle"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[var(--text-muted)] mb-1">
                      {isAr ? "عدد المتابعين" : "Followers Count"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.followerCount}
                      onChange={(e) => setFormData({ ...formData, followerCount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[var(--text-muted)] mb-1">
                    {isAr ? "نبذة تعريفية عنك وعن جمهورك" : "Short Bio & Audience Description"}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder={isAr ? "صف أسلوبك في صناعة المحتوى وما يحبه جمهورك..." : "Tell us about your content style, engagement, and who follows you..."}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Legal & Privacy Consents (Qatar PDPL) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-level-1)] pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? "الموافقات والإقرار القانوني (PDPL)" : "Legal & Data Processing Consents"}</span>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.dataProcessingConsent}
                    onChange={(e) => setFormData({ ...formData, dataProcessingConsent: e.target.checked })}
                    className="mt-0.5 rounded border-[var(--border-level-2)] text-[var(--color-accent)] focus:ring-0"
                  />
                  <span className="text-[var(--text-secondary)] leading-relaxed">
                    {isAr
                      ? "أوافق على قيام شركة E3 بمعالجة وتدقيق بياناتي وحساباتي لغايات تقييم فرص التعاون وفق قانون حماية خصوصية البيانات الشخصية في دولة قطر."
                      : "I consent to E3 processing my submitted details and social metrics for collaboration evaluation in accordance with Qatar PDPL."}
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.communicationConsent}
                    onChange={(e) => setFormData({ ...formData, communicationConsent: e.target.checked })}
                    className="mt-0.5 rounded border-[var(--border-level-2)] text-[var(--color-accent)] focus:ring-0"
                  />
                  <span className="text-[var(--text-secondary)] leading-relaxed">
                    {isAr
                      ? "أوافق على استلام دعوات الفعاليات وحملات المؤثرين عبر البريد الإلكتروني أو الواتساب."
                      : "I agree to receive campaign briefs and event invitations via email or WhatsApp."}
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.publicFeatureConsent}
                    onChange={(e) => setFormData({ ...formData, publicFeatureConsent: e.target.checked })}
                    className="mt-0.5 rounded border-[var(--border-level-2)] text-[var(--color-accent)] focus:ring-0"
                  />
                  <span className="text-[var(--text-secondary)] leading-relaxed">
                    {isAr
                      ? "أمنح E3 الإذن بعرض اسمي وحساباتي المعتمدة في دليل صناع المحتوى العام عند اعتماد حسابي (اختياري)."
                      : "I permit E3 to showcase my public handle and approved bio in the public Creator Collective directory (optional)."}
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.accuracyConfirmed}
                    onChange={(e) => setFormData({ ...formData, accuracyConfirmed: e.target.checked })}
                    className="mt-0.5 rounded border-[var(--border-level-2)] text-[var(--color-accent)] focus:ring-0"
                  />
                  <span className="text-[var(--text-secondary)] leading-relaxed font-semibold">
                    {isAr
                      ? "أقر بأن جميع البيانات وأرقام المتابعين المدخلة صحيحة ودقيقة وخالية من التزييف."
                      : "I confirm all provided metrics and platform URLs are accurate and authentic."}
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-[var(--color-accent)]/25 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? (isAr ? "جاري إرسال الطلب..." : "Submitting Application...") : isAr ? "إرسال طلب الانضمام" : "Submit Application"}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
