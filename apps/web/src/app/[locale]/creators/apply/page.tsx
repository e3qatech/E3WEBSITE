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
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Check,
  Building,
  Info,
  ExternalLink,
} from "lucide-react";

export default function CreatorApplicationPage() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Identity & Contact
    displayName: "",
    legalName: "",
    email: "",
    phone: "",
    whatsapp: "",
    location: "Doha, Qatar",
    nationality: "Qatari",
    preferredLocale: locale,
    isQatarBased: true,
    isAgencyRepresented: false,
    agencyName: "",
    agencyContact: "",

    // Step 2: Content & Social Channels
    categories: ["LIFESTYLE"],
    platform: "INSTAGRAM",
    handle: "",
    profileUrl: "",
    followerCount: 0,
    bio: "",
    audienceDescription: "",
    website: "",

    // Step 3: Commercial & Collaboration
    collaborationPreference: "PAID_OR_BARTER",
    indicativeRateRange: "QAR 3,000 - 6,000",
    eventAppearanceInterest: true,

    // Step 4: Consents & PDPL
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
    { value: "TRAVEL_TOURISM", labelEn: "Travel & Culture", labelAr: "سياحة وثقافة" },
    { value: "SPORTS_FITNESS", labelEn: "Sports & Fitness", labelAr: "رياضة ولياقة" },
    { value: "TECH_GAMING", labelEn: "Gaming & Tech", labelAr: "ألعاب وتقنية" },
    { value: "CULTURE_HERITAGE", labelEn: "Culture & Heritage", labelAr: "تراث وهوية" },
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

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.displayName.trim()) {
        toast(isAr ? "يرجى كتابة اسم الشهرة" : "Please enter your stage/display name", "error");
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        toast(isAr ? "يرجى كتابة بريد إلكتروني صالح" : "Please enter a valid email address", "error");
        return false;
      }
      if (!formData.phone.trim()) {
        toast(isAr ? "يرجى إدخال رقم الهاتف" : "Please enter your contact phone number", "error");
        return false;
      }
    }

    if (step === 2) {
      if (!formData.handle.trim()) {
        toast(isAr ? "يرجى كتابة اسم الحساب على المنصة" : "Please enter your account handle", "error");
        return false;
      }
      if (formData.categories.length === 0) {
        toast(isAr ? "يرجى اختيار مجال واحد على الأقل" : "Please select at least one content niche", "error");
        return false;
      }
    }

    if (step === 4) {
      if (!formData.dataProcessingConsent || !formData.accuracyConfirmed) {
        toast(
          isAr
            ? "الموافقة على معالجة البيانات وتأكيد صحة المعلومات إلزامية للمتابعة"
            : "Data processing consent and accuracy confirmation are required",
          "error"
        );
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4) as any);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as any);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const cleanHandle = formData.handle.replace(/^@/, "").trim();
      const generatedProfileUrl =
        formData.profileUrl.trim() ||
        (formData.platform === "INSTAGRAM"
          ? `https://instagram.com/${cleanHandle}`
          : formData.platform === "TIKTOK"
          ? `https://tiktok.com/@${cleanHandle}`
          : formData.platform === "YOUTUBE"
          ? `https://youtube.com/@${cleanHandle}`
          : `https://${formData.platform.toLowerCase()}.com/${cleanHandle}`);

      const res = await fetch("/api/influencer/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formData.displayName,
          legalName: formData.legalName || formData.displayName,
          email: formData.email,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          location: formData.location,
          nationality: formData.nationality,
          isQatarBased: formData.isQatarBased,
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
              handle: cleanHandle,
              profileUrl: generatedProfileUrl,
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
          ? "تم استلام طلبك بنجاح! سيتواصل معك فريق التسويق قريباً."
          : "Application submitted successfully! Our team will review your profile.",
        "success"
      );
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, titleEn: "Identity", titleAr: "البيانات", icon: User },
    { num: 2, titleEn: "Channels", titleAr: "الحسابات", icon: Share2 },
    { num: 3, titleEn: "Collaboration", titleAr: "التعاون", icon: DollarSign },
    { num: 4, titleEn: "Consents", titleAr: "الموافقات", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-level-1)] py-14 px-4 sm:px-6 lg:px-8 text-[var(--text-primary)]">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Top Header */}
        <div className="text-center space-y-3">
          <Link
            href={`/${locale}/creators`}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent)] hover:underline mb-2 font-bold"
          >
            {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{isAr ? "العودة إلى دليل صناع المحتوى" : "Back to Creator Collective"}</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            {isAr ? "انضم إلى شبكة صناع المحتوى في E3 قطر" : "Join the E3 Creator Collective"}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            {isAr
              ? "فرصتك للتعاون في أضخم الفعاليات والوجهات الترفيهية في قطر، وحضور أيام الإعلام الحصرية، وإطلاق المشاريع الترويجية."
              : "Collaborate with Qatar's premier entertainment entity on major event launches, VIP previews, and exclusive brand campaigns."}
          </p>
        </div>

        {/* Success Confirmation Screen */}
        {isSuccess ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-level-2)] border border-emerald-500/30 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto shadow-inner border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[var(--text-primary)]">
                {isAr ? "تم استلام طلبك بنجاح!" : "Application Received!"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                {isAr
                  ? `شكراً لك يا ${formData.displayName}! يقوم فريق التسويق بمراجعة ملفك وتطابق محتواك مع الفعاليات القادمة. ستصلك دعوة الحملة عبر بريدك الإلكتروني في غضون 24-48 ساعة.`
                  : `Thank you, ${formData.displayName}! Our team evaluates each creator profile against upcoming Qatar event launches. If selected, an invitation will arrive at ${formData.email}.`}
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/${locale}/creators`}
                className="px-6 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs font-bold hover:text-[var(--color-accent)] transition"
              >
                {isAr ? "استعراض دليل المؤثرين" : "View Creator Showcase"}
              </Link>
              <Link
                href={`/${locale}`}
                className="px-6 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 transition shadow-lg shadow-[var(--color-accent)]/20"
              >
                {isAr ? "العودة للرئيسية" : "Return to Home"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Step Wizard Progress Bar */}
            <div className="p-4 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] shadow-sm">
              <div className="grid grid-cols-4 gap-2">
                {steps.map((s) => {
                  const isDone = currentStep > s.num;
                  const isCurrent = currentStep === s.num;
                  const Icon = s.icon;

                  return (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => {
                        if (currentStep > s.num) setCurrentStep(s.num as any);
                      }}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2 rounded-xl text-center transition ${
                        isCurrent
                          ? "bg-[var(--color-accent)] text-white font-bold shadow-md shadow-[var(--color-accent)]/20"
                          : isDone
                          ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold"
                          : "text-[var(--text-muted)] opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[11px] hidden sm:inline">
                          {isAr ? s.titleAr : s.titleEn}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* STEP 1: IDENTITY & CONTACT */}
              {currentStep === 1 && (
                <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-5 shadow-sm">
                  <div className="border-b border-[var(--border-level-1)] pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                      {isAr ? "الخطوة الأولى" : "Step 1 of 4"}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                      {isAr ? "المعلومات الشخصية وبيانات التواصل" : "Personal & Contact Information"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
                        {isAr ? "الاسم المعروض / اسم الشهرة *" : "Stage / Display Name *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="e.g. Dana Al-Ali"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
                        {isAr ? "الاسم القانوني الكامل (للعقود)" : "Full Legal Name"}
                      </label>
                      <input
                        type="text"
                        value={formData.legalName}
                        onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                        placeholder="e.g. Dana Ahmed Al-Ali"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
                        {isAr ? "البريد الإلكتروني الرسمي *" : "Email Address *"}
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
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
                        {isAr ? "رقم الهاتف / الواتساب *" : "Phone / WhatsApp Number *"}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value, whatsapp: e.target.value })
                        }
                        placeholder="+974 5500 0000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
                        {isAr ? "مكان الإقامة" : "Current Location"}
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
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
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

                  {/* Agency representation toggle */}
                  <div className="pt-2 border-t border-[var(--border-level-1)] space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-primary)]">
                      <input
                        type="checkbox"
                        checked={formData.isAgencyRepresented}
                        onChange={(e) =>
                          setFormData({ ...formData, isAgencyRepresented: e.target.checked })
                        }
                        className="rounded border-[var(--border-level-2)] text-[var(--color-accent)]"
                      />
                      <span>{isAr ? "هل تمثلك وكالة إدارة مواهب أو تسويق؟" : "Represented by a Talent Agency?"}</span>
                    </label>

                    {formData.isAgencyRepresented && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pl-6 rtl:pl-0 rtl:pr-6">
                        <input
                          type="text"
                          placeholder={isAr ? "اسم الوكالة" : "Agency Name"}
                          value={formData.agencyName}
                          onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                          className="px-3 py-2 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none"
                        />
                        <input
                          type="text"
                          placeholder={isAr ? "اسم مسؤول التواصل بالوكالة" : "Agency Contact Name & Email"}
                          value={formData.agencyContact}
                          onChange={(e) => setFormData({ ...formData, agencyContact: e.target.value })}
                          className="px-3 py-2 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: CHANNELS & AUDIENCE */}
              {currentStep === 2 && (
                <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-5 shadow-sm">
                  <div className="border-b border-[var(--border-level-1)] pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                      {isAr ? "الخطوة الثانية" : "Step 2 of 4"}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                      {isAr ? "المنصات وحجم الجمهور والمحتوى" : "Channels, Audience & Content Niches"}
                    </h3>
                  </div>

                  {/* Category Pills */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[var(--text-muted)]">
                      {isAr ? "مجالات المحتوى التي تبدع فيها (اختر ما ينطبق) *" : "Content Niches (Select all that apply) *"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map((cat) => {
                        const isSelected = formData.categories.includes(cat.value);
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => handleCategoryToggle(cat.value)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent)]/20"
                                : "bg-[var(--bg-level-1)] text-[var(--text-muted)] border border-[var(--border-level-2)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary Platform & Handle */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                    <div>
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
                        {isAr ? "المنصة الرئيسية *" : "Primary Platform *"}
                      </label>
                      <select
                        value={formData.platform}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)]"
                      >
                        <option value="INSTAGRAM">Instagram</option>
                        <option value="TIKTOK">TikTok</option>
                        <option value="SNAPCHAT">Snapchat</option>
                        <option value="YOUTUBE">YouTube</option>
                        <option value="X">X (Twitter)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
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
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
                        {isAr ? "عدد المتابعين التقديري" : "Follower Count"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.followerCount}
                        onChange={(e) =>
                          setFormData({ ...formData, followerCount: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="text-xs space-y-1">
                    <label className="block font-bold text-[var(--text-muted)]">
                      {isAr ? "نبذة عن أسلوبك في صناعة المحتوى" : "Creator Bio & Content Style"}
                    </label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder={
                        isAr
                          ? "اكتب نبذة موجزة عن نوع القصص والتجارب التي تشاركها مع متابعيك..."
                          : "Describe your storytelling format, audience demographics, and previous work..."
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: COLLABORATION PREFERENCES */}
              {currentStep === 3 && (
                <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-5 shadow-sm">
                  <div className="border-b border-[var(--border-level-1)] pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                      {isAr ? "الخطوة الثالثة" : "Step 3 of 4"}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                      {isAr ? "تفضيلات التعاون والمقابل المالي" : "Collaboration Models & Availability"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
                        {isAr ? "نموذج التعاون المفضل" : "Preferred Collaboration Model"}
                      </label>
                      <select
                        value={formData.collaborationPreference}
                        onChange={(e) =>
                          setFormData({ ...formData, collaborationPreference: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)]"
                      >
                        <option value="PAID_OR_BARTER">{isAr ? "مقابل مالي أو تبادل ترويجي (مرن)" : "Paid or Barter (Flexible)"}</option>
                        <option value="PAID">{isAr ? "عقود تجارية مدفوعة فقط" : "Paid Commercials Only"}</option>
                        <option value="COMPLIMENTARY">{isAr ? "دعوات VIP وتغطيات حصرية" : "Complimentary VIP Visits"}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
                        {isAr ? "النطاق السعري التقديري (QAR)" : "Indicative Fee Range (QAR)"}
                      </label>
                      <input
                        type="text"
                        value={formData.indicativeRateRange}
                        onChange={(e) =>
                          setFormData({ ...formData, indicativeRateRange: e.target.value })
                        }
                        placeholder="e.g. QAR 3,000 - 6,000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-primary)]">
                      <input
                        type="checkbox"
                        checked={formData.eventAppearanceInterest}
                        onChange={(e) =>
                          setFormData({ ...formData, eventAppearanceInterest: e.target.checked })
                        }
                        className="rounded border-[var(--border-level-2)] text-[var(--color-accent)]"
                      />
                      <span>
                        {isAr
                          ? "مستعد لحضور الفعاليات وأيام الإعلام وتجارب VIP في الدوحة"
                          : "Available for in-person media previews & VIP event launches in Doha"}
                      </span>
                    </label>
                    <p className="text-[11px] text-[var(--text-muted)] pl-6 rtl:pl-0 rtl:pr-6">
                      {isAr
                        ? "يتم تزويدك ببطاقات دخول VIP مع رفيق ومواقف مخصصة وتسهيلات تصويرية خاصة."
                        : "Includes complimentary VIP passes, companion access, and dedicated media creator support."}
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4: CONSENTS & LEGAL VERIFICATION */}
              {currentStep === 4 && (
                <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-5 shadow-sm">
                  <div className="border-b border-[var(--border-level-1)] pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                      {isAr ? "الخطوة الرابعة والأخيرة" : "Step 4 of 4"}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>{isAr ? "الموافقات والإقرار القانوني (PDPL)" : "Legal Consents & Data Protection (PDPL)"}</span>
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs">
                    <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={formData.dataProcessingConsent}
                        onChange={(e) =>
                          setFormData({ ...formData, dataProcessingConsent: e.target.checked })
                        }
                        className="mt-0.5 rounded border-[var(--border-level-2)] text-[var(--color-accent)]"
                      />
                      <span className="text-[var(--text-secondary)] leading-relaxed">
                        <strong className="text-[var(--text-primary)] block mb-0.5">
                          {isAr ? "الموافقة على معالجة البيانات (إلزامية) *" : "Data Processing Consent (Mandatory) *"}
                        </strong>
                        {isAr
                          ? "أوافق على قيام شركة E3 بمعالجة وتدقيق بياناتي وحساباتي لغايات تقييم فرص التعاون وفق قانون حماية خصوصية البيانات الشخصية في دولة قطر."
                          : "I consent to E3 processing my submitted details and social metrics for collaboration evaluation in accordance with Qatar PDPL Law No. 13 of 2016."}
                      </span>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={formData.accuracyConfirmed}
                        onChange={(e) =>
                          setFormData({ ...formData, accuracyConfirmed: e.target.checked })
                        }
                        className="mt-0.5 rounded border-[var(--border-level-2)] text-[var(--color-accent)]"
                      />
                      <span className="text-[var(--text-secondary)] leading-relaxed">
                        <strong className="text-[var(--text-primary)] block mb-0.5">
                          {isAr ? "إقرار صحة المعلومات (إلزامي) *" : "Confirmation of Accuracy (Mandatory) *"}
                        </strong>
                        {isAr
                          ? "أقر بأن جميع البيانات وأرقام المتابعين المدخلة صحيحة ودقيقة وخالية من أي تزييف أو حسابات وهمية."
                          : "I confirm all provided follower counts, channels, and identity information are genuine and authentic."}
                      </span>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.publicFeatureConsent}
                        onChange={(e) =>
                          setFormData({ ...formData, publicFeatureConsent: e.target.checked })
                        }
                        className="mt-0.5 rounded border-[var(--border-level-2)] text-[var(--color-accent)]"
                      />
                      <span className="text-[var(--text-secondary)] leading-relaxed">
                        <strong className="text-[var(--text-primary)] block mb-0.5">
                          {isAr ? "العرض في دليل صناع المحتوى (اختياري)" : "Public Directory Feature (Optional)"}
                        </strong>
                        {isAr
                          ? "أمنح E3 الإذن بعرض اسمي ومعرّفات حساباتي في دليل صناع المحتوى العام في حال اعتماد انضمامي."
                          : "I permit E3 to feature my public stage name and verified handle in the public Creator Collective directory once approved."}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Actions */}
              <div className="flex items-center justify-between gap-4 pt-2">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-2"
                  >
                    {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    <span>{isAr ? "الخطوة السابقة" : "Previous Step"}</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-7 py-3 rounded-2xl bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 transition shadow-lg shadow-[var(--color-accent)]/20 flex items-center gap-2"
                  >
                    <span>{isAr ? "متابعة" : "Next Step"}</span>
                    {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 rounded-2xl bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition shadow-xl shadow-[var(--color-accent)]/25 flex items-center gap-2"
                  >
                    <span>{isSubmitting ? (isAr ? "جاري الإرسال..." : "Submitting Application...") : isAr ? "إرسال طلب الانضمام" : "Submit Application"}</span>
                    {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
