"use client";

import { useState } from "react";
import { AdminFormLayout } from "../ui/AdminFormLayout";
import { AdminPageHeader } from "../ui/AdminPageHeader";
import { AdminButton } from "../ui/AdminButton";
import { Save, Plus, Trash2, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";

export function PackagesCMSView({ initialData }: { initialData: any }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    hero: {
      titleEn: initialData?.hero?.titleEn || "Group & Birthday Packages",
      titleAr: initialData?.hero?.titleAr || "باقات الحفلات والشركات وأعياد الميلاد",
      subtitleEn: initialData?.hero?.subtitleEn || "Host unforgettable milestone birthday celebrations, team-building outings, and exclusive venue buyouts across Qatar.",
      subtitleAr: initialData?.hero?.subtitleAr || "احتفل بأجمل اللحظات وحفلات أعياد الميلاد والفعاليات الخاصة بشركتك في أفضل الوجهات الترفيهية في قطر.",
      badgeEn: initialData?.hero?.badgeEn || "VIP PACKAGES & EVENTS",
      badgeAr: initialData?.hero?.badgeAr || "باقات الفعاليات والاحتفالات",
    },
    packages: initialData?.packages || [
      {
        id: "birthday-silver",
        titleEn: "Silver Birthday Party",
        titleAr: "باقة أعياد الميلاد الفضية",
        badgeEn: "Kids & Teens",
        badgeAr: "الأطفال واليافعين",
        descriptionEn: "Perfect choice for intimate celebrations. Includes 2 hours of park access, private party room, and dedicated host.",
        descriptionAr: "الخيار الأمثل للاحتفالات الخاصة. يشمل ساعتين من الألعاب، غرفة حفلات خاصة، ومضيف مخصص.",
        priceEn: "From QAR 1,800",
        priceAr: "ابتداءً من 1,800 ر.ق",
        accentColor: "#10b981",
        popular: false,
        perksEnStr: "Up to 10 Participating Guests\n2 Hours Full Attraction Access\nPrivate Decorated Party Room (1 Hr)\nDedicated Event Host\nCustom Digital Invitations\nSignature Birthday Cake",
        perksArStr: "حتى 10 ضيوف مشاركين\nساعتان دخول شامل لجميع الألعاب\nغرفة حفلات خاصة ومزينة (ساعة واحدة)\nمضيف فعاليات مخصص للحفلة\nدعوات إلكترونية مخصصة\nكعكة عيد ميلاد خاصة"
      },
      {
        id: "birthday-gold-vip",
        titleEn: "Gold VIP Birthday World",
        titleAr: "باقة أعياد الميلاد الذهبية الـ VIP",
        badgeEn: "Most Popular",
        badgeAr: "الأكثر طلباً",
        descriptionEn: "The ultimate birthday extravaganza with full park access, VIP lounge, gourmet catering, and arcade credits for everyone.",
        descriptionAr: "التجربة المتكاملة الأكثر روعة لأعياد الميلاد مع صالة VIP، وجبات فاخرة، ورصيد ألعاب إضافي للجميع.",
        priceEn: "From QAR 3,500",
        priceAr: "ابتداءً من 3,500 ر.ق",
        accentColor: "#b013b8",
        popular: true,
        perksEnStr: "Up to 20 Participating Guests\n3 Hours Unlimited Attraction Access\nVIP Private Lounge & Party Zone\nGourmet Meal & Drinks Package\nQAR 100 Arcade Credit per Guest\nProfessional Photographer (1 Hr)\nCustom Theme Styling & Balloon Arch",
        perksArStr: "حتى 20 ضيفاً مشاركاً\n3 ساعات دخول غير محدود للألعاب\nصالة VIP خاصة وحصرية\nوجبات ومشروبات فاخرة للجميع\nرصيد ألعاب بقيمة 100 ر.ق لكل ضيف\nمصور محترف (ساعة واحدة)\nتنسيق بالونات وديكور حسب الثيمة"
      }
    ],
    inquiryForm: {
      titleEn: initialData?.inquiryForm?.titleEn || "Plan Your Event With E3 Experts",
      titleAr: initialData?.inquiryForm?.titleAr || "احجز حفلهم أو فعاليتك القادمة",
      subtitleEn: initialData?.inquiryForm?.subtitleEn || "Our VIP event planners will contact you within 24 hours to confirm dates, themes, and arrangements.",
      subtitleAr: initialData?.inquiryForm?.subtitleAr || "سيعاود فريق تنظيم الحفلات والشركات التواصل معك خلال 24 ساعة لتأكيد التفاصيل.",
    }
  });

  const handleHeroChange = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const handleInquiryChange = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      inquiryForm: { ...prev.inquiryForm, [field]: value }
    }));
  };

  const handlePackageChange = (index: number, field: string, value: any) => {
    setData((prev) => {
      const copy = [...prev.packages];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, packages: copy };
    });
  };

  const handleAddPackage = () => {
    setData((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          id: `pkg-${Date.now()}`,
          titleEn: "New Custom Package",
          titleAr: "باقة مخصصة جديدة",
          badgeEn: "Special Offer",
          badgeAr: "عرض خاص",
          descriptionEn: "Description of the custom package offering.",
          descriptionAr: "وصف تفاصيل هذه الباقة الخاصة.",
          priceEn: "Contact for Quote",
          priceAr: "تواصل لمعرفة السعر",
          accentColor: "#3b82f6",
          popular: false,
          perksEnStr: "Perk 1\nPerk 2\nPerk 3",
          perksArStr: "ميزة 1\nميزة 2\nميزة 3"
        }
      ]
    }));
  };

  const handleRemovePackage = (index: number) => {
    setData((prev) => ({
      ...prev,
      packages: prev.packages.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formattedPackages = data.packages.map((pkg: any) => ({
        ...pkg,
        perksEn: (pkg.perksEnStr ? pkg.perksEnStr.split('\n') : (pkg.perksEn || [])).filter(Boolean),
        perksAr: (pkg.perksArStr ? pkg.perksArStr.split('\n') : (pkg.perksAr || [])).filter(Boolean),
      }));

      const payload = {
        content: {
          hero: data.hero,
          packages: formattedPackages,
          inquiryForm: data.inquiryForm
        }
      };

      const res = await fetch("/api/cms/pages/b2c-packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save Packages CMS");
      toast("Packages CMS page saved successfully.", "success");
    } catch (e) {
      console.error(e);
      toast("Failed to save Packages CMS page.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminFormLayout>
      <AdminPageHeader
        title="Packages CMS Management"
        description="Configure titles, pricing, inclusions, and package cards for the public Packages page (/b2c/packages)."
        action={
          <AdminButton variant="primary" onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Packages"}
          </AdminButton>
        }
      />

      {/* 1. HERO SECTION CONFIG */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>Page Hero Titles & Header</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (English)</label>
            <input
              type="text"
              value={data.hero.titleEn}
              onChange={(e) => handleHeroChange("titleEn", e.target.value)}
              className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (Arabic)</label>
            <input
              type="text"
              value={data.hero.titleAr}
              onChange={(e) => handleHeroChange("titleAr", e.target.value)}
              className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Subtitle (English)</label>
            <textarea
              rows={2}
              value={data.hero.subtitleEn}
              onChange={(e) => handleHeroChange("subtitleEn", e.target.value)}
              className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Subtitle (Arabic)</label>
            <textarea
              rows={2}
              value={data.hero.subtitleAr}
              onChange={(e) => handleHeroChange("subtitleAr", e.target.value)}
              className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* 2. PACKAGES CARDS MANAGER */}
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-[var(--text-primary)]">Packages Offerings ({data.packages.length})</h3>
          <AdminButton variant="secondary" onClick={handleAddPackage} className="gap-2 text-xs">
            <Plus className="w-4 h-4" /> Add Package
          </AdminButton>
        </div>

        {data.packages.map((pkg: any, idx: number) => {
          const perksEnText = pkg.perksEnStr !== undefined ? pkg.perksEnStr : (pkg.perksEn || []).join('\n');
          const perksArText = pkg.perksArStr !== undefined ? pkg.perksArStr : (pkg.perksAr || []).join('\n');

          return (
            <div
              key={pkg.id || idx}
              className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-6 shadow-sm relative"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-base">{pkg.titleEn || `Package ${idx + 1}`}</h4>
                    <span className="text-xs font-mono text-slate-400">{pkg.priceEn}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(pkg.popular)}
                      onChange={(e) => handlePackageChange(idx, "popular", e.target.checked)}
                      className="rounded border-[var(--border-level-2)] text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    Most Popular Badge
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemovePackage(idx)}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove Package"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (English)</label>
                  <input
                    type="text"
                    value={pkg.titleEn}
                    onChange={(e) => handlePackageChange(idx, "titleEn", e.target.value)}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (Arabic)</label>
                  <input
                    type="text"
                    value={pkg.titleAr}
                    onChange={(e) => handlePackageChange(idx, "titleAr", e.target.value)}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Accent Glow Color (HEX)</label>
                  <input
                    type="text"
                    value={pkg.accentColor || "#10b981"}
                    onChange={(e) => handlePackageChange(idx, "accentColor", e.target.value)}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Price Tag (English)</label>
                  <input
                    type="text"
                    value={pkg.priceEn}
                    onChange={(e) => handlePackageChange(idx, "priceEn", e.target.value)}
                    placeholder="e.g. From QAR 1,800"
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Price Tag (Arabic)</label>
                  <input
                    type="text"
                    value={pkg.priceAr}
                    onChange={(e) => handlePackageChange(idx, "priceAr", e.target.value)}
                    placeholder="مثال: ابتداءً من 1,800 ر.ق"
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category Badge (English)</label>
                  <input
                    type="text"
                    value={pkg.badgeEn}
                    onChange={(e) => handlePackageChange(idx, "badgeEn", e.target.value)}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category Badge (Arabic)</label>
                  <input
                    type="text"
                    value={pkg.badgeAr}
                    onChange={(e) => handlePackageChange(idx, "badgeAr", e.target.value)}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Inclusions Perks Lines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Package Inclusions (English - 1 per line)</label>
                  <textarea
                    rows={4}
                    value={perksEnText}
                    onChange={(e) => handlePackageChange(idx, "perksEnStr", e.target.value)}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Package Inclusions (Arabic - 1 per line)</label>
                  <textarea
                    rows={4}
                    value={perksArText}
                    onChange={(e) => handlePackageChange(idx, "perksArStr", e.target.value)}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 font-mono"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. INQUIRY FORM TITLES */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-4 shadow-sm mt-6">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Booking Form Header & Titles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Form Title (English)</label>
            <input
              type="text"
              value={data.inquiryForm.titleEn}
              onChange={(e) => handleInquiryChange("titleEn", e.target.value)}
              className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Form Title (Arabic)</label>
            <input
              type="text"
              value={data.inquiryForm.titleAr}
              onChange={(e) => handleInquiryChange("titleAr", e.target.value)}
              className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
              dir="rtl"
            />
          </div>
        </div>
      </div>
    </AdminFormLayout>
  );
}
