"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PartyPopper, Users, Building2, Gift, Check, ShieldCheck, Sparkles, Send, Award } from "lucide-react";
import { useB2CTheme } from "@/components/ui/B2CThemeComponents";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { B2CGrid } from "@/components/ui/B2CGrid";
import { MagneticButton } from "@/components/ui/MagneticButton";

const DEFAULT_PACKAGES = [
  {
    id: "birthday-silver",
    titleEn: "Silver Birthday Party",
    titleAr: "باقة أعياد الميلاد الفضية",
    badgeEn: "Kids & Teens",
    badgeAr: "الأطفال واليافعين",
    icon: Gift,
    descriptionEn: "Perfect choice for intimate celebrations. Includes 2 hours of park access, private party room, and dedicated host.",
    descriptionAr: "الخيار الأمثل للاحتفالات الخاصة. يشمل ساعتين من الألعاب، غرفة حفلات خاصة، ومضيف مخصص.",
    priceEn: "From QAR 1,800",
    priceAr: "ابتداءً من 1,800 ر.ق",
    perksEn: [
      "Up to 10 Participating Guests",
      "2 Hours Full Attraction Access",
      "Private Decorated Party Room (1 Hr)",
      "Dedicated Event Host",
      "Custom Digital Invitations",
      "Signature Birthday Cake"
    ],
    perksAr: [
      "حتى 10 ضيوف مشاركين",
      "ساعتان دخول شامل لجميع الألعاب",
      "غرفة حفلات خاصة ومزينة (ساعة واحدة)",
      "مضيف فعاليات مخصص للحفلة",
      "دعوات إلكترونية مخصصة",
      "كعكة عيد ميلاد خاصة"
    ],
    accentColor: "#10b981",
  },
  {
    id: "birthday-gold-vip",
    titleEn: "Gold VIP Birthday World",
    titleAr: "باقة أعياد الميلاد الذهبية الـ VIP",
    badgeEn: "Most Popular",
    badgeAr: "الأكثر طلباً",
    icon: PartyPopper,
    popular: true,
    descriptionEn: "The ultimate birthday extravaganza with full park access, VIP lounge, gourmet catering, and arcade credits for everyone.",
    descriptionAr: "التجربة المتكاملة الأكثر روعة لأعياد الميلاد مع صالة VIP، وجبات فاخرة، ورصيد ألعاب إضافي للجميع.",
    priceEn: "From QAR 3,500",
    priceAr: "ابتداءً من 3,500 ر.ق",
    perksEn: [
      "Up to 20 Participating Guests",
      "3 Hours Unlimited Attraction Access",
      "VIP Private Lounge & Party Zone",
      "Gourmet Meal & Drinks Package",
      "QAR 100 Arcade Credit per Guest",
      "Professional Photographer (1 Hr)",
      "Custom Theme Styling & Balloon Arch"
    ],
    perksAr: [
      "حتى 20 ضيفاً مشاركاً",
      "3 ساعات دخول غير محدود للألعاب",
      "صالة VIP خاصة وحصرية",
      "وجبات ومشروبات فاخرة للجميع",
      "رصيد ألعاب بقيمة 100 ر.ق لكل ضيف",
      "مصور محترف (ساعة واحدة)",
      "تنسيق بالونات وديكور حسب الثيمة"
    ],
    accentColor: "#b013b8",
  },
  {
    id: "corporate-outing",
    titleEn: "Corporate Team Building & Outing",
    titleAr: "باقة الشركات وبناء فرق العمل",
    badgeEn: "Corporate B2B",
    badgeAr: "مخصص للشركات",
    icon: Building2,
    descriptionEn: "Energize your team with tailored competitions, privatized arenas, customized leaderboards, and executive catering.",
    descriptionAr: "حفّز فريق عملك بمسابقات حصرية، حلبات خاصة، لوحة نتائج تفاعلية، وخدمات ضيافة رفيعة المستوى.",
    priceEn: "From QAR 6,000",
    priceAr: "ابتداءً من 6,000 ر.ق",
    perksEn: [
      "Up to 50 Team Members (Expandable)",
      "Exclusive Arena Competition Access",
      "Custom Team Leaderboard & Trophies",
      "Executive Buffet Catering & Coffee Station",
      "Dedicated Corporate Event Planner",
      "Branded Digital Welcome Screen"
    ],
    perksAr: [
      "حتى 50 موظفاً (قابل للزيادة)",
      "دخول حصري لحلبات التنافس",
      "لوحة نتائج مخصصة للشركة وكؤوس",
      "بوفيه فاخر ومحطة قهوة مختصة",
      "منسق فعاليات شركات مخصص",
      "شاشات ترحيبية بهوية الشركة"
    ],
    accentColor: "#3b82f6",
  },
  {
    id: "private-buyout",
    titleEn: "Exclusive 100% Venue Buyout",
    titleAr: "حجز المرفق بالكامل (Exclusive Buyout)",
    badgeEn: "VIP Privatization",
    badgeAr: "خصوصية تامة 100%",
    icon: Users,
    descriptionEn: "Complete privatization of our flagship entertainment centers for product launches, VIP galas, and large family days.",
    descriptionAr: "إغلاق حصير للمرفق بالكامل لصالح مبيعاتك، إطلاق المنتجات، أو اليوم العائلي الخاص لشركتك.",
    priceEn: "Custom Quote",
    priceAr: "حسب الطلب والعدد",
    perksEn: [
      "Unlimited Guests (Up to Venue Capacity)",
      "100% Private Venue Access (Closed to Public)",
      "Full Stage, Audio & Kinetic Light Systems",
      "Bespoke Catering & VIP Red Carpet Service",
      "Full Security, Technical & Operations Staff",
      "Complete Custom Branding Integration"
    ],
    perksAr: [
      "عدد غير محدود من الضيوف (حسب الطاقة الاستيعابية)",
      "دخول خاص 100% (مغلق أمام الجمهور)",
      "أنظمة صوت وإضاءة ومسرح كاملة",
      "ضيافة مخصصة وسجاد أحمر كبار الشخصيات",
      "طاقم أمني وفني وتشغيلي كامل",
      "دمج كامل لهوية فعاليتك في المرفق"
    ],
    accentColor: "#f59e0b",
  }
];

export function PackagesClient({ initialSettings }: { initialSettings?: any }) {
  const { isAr } = useB2CTheme();
  
  const hero = {
    titleEn: initialSettings?.hero?.titleEn || "Group & Birthday Packages",
    titleAr: initialSettings?.hero?.titleAr || "باقات الحفلات والشركات وأعياد الميلاد",
    subtitleEn: initialSettings?.hero?.subtitleEn || "Host unforgettable milestone birthday celebrations, team-building outings, and exclusive venue buyouts across Qatar.",
    subtitleAr: initialSettings?.hero?.subtitleAr || "احتفل بأجمل اللحظات وحفلات أعياد الميلاد والفعاليات الخاصة بشركتك في أفضل الوجهات الترفيهية في قطر.",
    badgeEn: initialSettings?.hero?.badgeEn || "VIP PACKAGES & EVENTS",
    badgeAr: initialSettings?.hero?.badgeAr || "باقات الفعاليات والاحتفالات",
  };

  const rawPackages = (initialSettings?.packages && initialSettings.packages.length > 0) ? initialSettings.packages : DEFAULT_PACKAGES;
  const packagesList = rawPackages.map((pkg: any, idx: number) => ({
    ...pkg,
    icon: DEFAULT_PACKAGES[idx % DEFAULT_PACKAGES.length]?.icon || PartyPopper,
  }));

  const inquiryForm = {
    titleEn: initialSettings?.inquiryForm?.titleEn || "Plan Your Event With E3 Experts",
    titleAr: initialSettings?.inquiryForm?.titleAr || "احجز حفلهم أو فعاليتك القادمة",
    subtitleEn: initialSettings?.inquiryForm?.subtitleEn || "Our VIP event planners will contact you within 24 hours to confirm dates, themes, and arrangements.",
    subtitleAr: initialSettings?.inquiryForm?.subtitleAr || "سيعاود فريق تنظيم الحفلات والشركات التواصل معك خلال 24 ساعة لتأكيد التفاصيل.",
  };

  const [selectedPackage, setSelectedPackage] = useState<string>(packagesList[0]?.id || "birthday-gold-vip");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    packageType: isAr ? (packagesList[0]?.titleAr || "Gold VIP Birthday World") : (packagesList[0]?.titleEn || "Gold VIP Birthday World"),
    estimatedGuests: "20",
    eventDate: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact/b2c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'PACKAGE_INQUIRY',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: `Package Inquiry: ${formData.packageType}`,
          message: `Package Type: ${formData.packageType}\nDate: ${formData.eventDate}\nGuests: ${formData.estimatedGuests}\nNotes: ${formData.notes}`
        })
      });
      if (res.ok) {
        setFormSubmitted(true);
      }
    } catch (_err) {
      // Handle gracefully
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .font-righteous { font-family: var(--font-display), 'Righteous', sans-serif; }
        .font-poppins { font-family: var(--font-sans), 'Poppins', sans-serif; }
      `}} />

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 text-[var(--text-primary)] font-poppins text-start" dir={isAr ? 'rtl' : 'ltr'}>
        
        {/* 1. HERO SECTION */}
        <div className="text-center py-16 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[rgba(176,19,184,0.1)] text-[var(--e3-magenta)] mb-6 border border-[var(--e3-magenta)]/20 shadow-[0_4px_15px_rgba(176,19,184,0.1)]"
          >
            <PartyPopper className="w-10 h-10" />
          </motion.div>
          
          <AnimatedText 
            as="h1" 
            text={isAr ? hero.titleAr : hero.titleEn}
            className="text-4xl md:text-5xl font-black mb-4 font-display uppercase tracking-wide justify-center"
          />
          
          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto font-medium leading-relaxed">
            {isAr ? hero.subtitleAr : hero.subtitleEn}
          </p>
        </div>

        {/* 2. PACKAGES GRID */}
        <div className="mb-20">
          <B2CGrid columns={2} gap="lg">
            {packagesList.map((pkg: any) => {
              const Icon = pkg.icon || PartyPopper;
              const isSelected = selectedPackage === pkg.id;

              return (
                <InteractiveCard 
                  key={pkg.id}
                  className={`flex flex-col h-full border-[rgba(75,0,143,0.3)] transition-all duration-300 ${
                    pkg.popular ? 'ring-2 ring-[var(--e3-magenta)] shadow-[0_10px_35px_rgba(176,19,184,0.25)]' : ''
                  }`}
                  glowColor={pkg.accentColor || "#b013b8"}
                  tiltStrength={5}
                >
                  <div className="p-6 md:p-8 flex flex-col h-full justify-between">
                    <div>
                      {/* Badge & Category Header */}
                      <div className="flex items-center justify-between mb-4">
                        <span 
                          className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white backdrop-blur-md"
                          style={{ backgroundColor: `${pkg.accentColor || "#b013b8"}dd` }}
                        >
                          {isAr ? pkg.badgeAr : pkg.badgeEn}
                        </span>
                        <span className="font-mono text-sm font-black text-white bg-[var(--surface-default)] px-3 py-1.5 rounded-xl border border-[var(--border-level-2)]">
                          {isAr ? pkg.priceAr : pkg.priceEn}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--e3-royal-blue)]">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black font-display uppercase tracking-wide">
                          {isAr ? pkg.titleAr : pkg.titleEn}
                        </h2>
                      </div>

                      <p className="text-sm text-[var(--text-secondary)] mb-6 font-medium leading-relaxed">
                        {isAr ? pkg.descriptionAr : pkg.descriptionEn}
                      </p>

                      {/* Inclusion Perks List */}
                      <div className="space-y-2.5 pt-4 border-t border-[var(--border-level-2)] mb-8">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
                          {isAr ? "مميزات الباقة التشمل:" : "Package Inclusions:"}
                        </p>
                        {(isAr ? (pkg.perksAr || []) : (pkg.perksEn || [])).map((perk: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3" />
                            </div>
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Book / Select Button */}
                    <MagneticButton
                      onClick={() => {
                        setSelectedPackage(pkg.id);
                        setFormData(prev => ({ ...prev, packageType: isAr ? pkg.titleAr : pkg.titleEn }));
                        const formElem = document.getElementById("inquiry-form");
                        if (formElem) formElem.scrollIntoView({ behavior: 'smooth' });
                      }}
                      variant={isSelected ? "primary" : "secondary"}
                      size="md"
                      className="w-full uppercase font-black py-3 rounded-xl justify-center"
                    >
                      {isAr ? "حجز / استفسار عن الباقة" : "Book / Inquire Package"}
                    </MagneticButton>
                  </div>
                </InteractiveCard>
              );
            })}
          </B2CGrid>
        </div>

        {/* 3. INQUIRY & BOOKING FORM SECTION */}
        <div id="inquiry-form" className="bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 end-0 w-80 h-80 bg-[var(--e3-purple)]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[rgba(26,31,214,0.1)] text-[var(--e3-royal-blue)] text-xs font-black uppercase tracking-wider mb-3 border border-[var(--e3-royal-blue)]/20">
                {isAr ? "استمارة الحجز المباشر" : "Instant Booking & Custom Inquiry"}
              </span>
              <h2 className="text-3xl font-black font-display uppercase tracking-wide mb-2">
                {isAr ? inquiryForm.titleAr : inquiryForm.titleEn}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] font-medium">
                {isAr ? inquiryForm.subtitleAr : inquiryForm.subtitleEn}
              </p>
            </div>

            {formSubmitted ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black uppercase font-display text-emerald-400">
                  {isAr ? "تم استلام طلب الحجز بنجاح!" : "Inquiry Received Successfully!"}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] font-medium max-w-md mx-auto">
                  {isAr ? "شكراً لتواصلك. سيتواصل معك مدير الفعاليات لتجهيز باقتك المفضلة." : "Thank you for reaching out. Our event concierges will reach out to finalize your package details."}
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  {isAr ? "إرسال طلب آخر" : "Submit Another Inquiry"}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                      {isAr ? "الاسم الكامل" : "Full Name"} *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Nasser Al-Kuwari"
                      className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--e3-royal-blue)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                      {isAr ? "البريد الإلكتروني" : "Email Address"} *
                    </label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@domain.com"
                      className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--e3-royal-blue)] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                      {isAr ? "رقم الهاتف" : "Phone / WhatsApp"} *
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+974 5500 0000"
                      className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--e3-royal-blue)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                      {isAr ? "نوع الباقة" : "Package Type"}
                    </label>
                    <select
                      value={formData.packageType}
                      onChange={e => setFormData({ ...formData, packageType: e.target.value })}
                      className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--e3-royal-blue)] transition-colors text-[var(--text-primary)] cursor-pointer"
                    >
                      {packagesList.map((p: any) => (
                        <option key={p.id} value={isAr ? p.titleAr : p.titleEn}>
                          {isAr ? p.titleAr : p.titleEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                      {isAr ? "تاريخ الفعالية المتوقع" : "Target Event Date"}
                    </label>
                    <input 
                      type="date" 
                      value={formData.eventDate}
                      onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--e3-royal-blue)] transition-colors text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    {isAr ? "ملاحظات إضافية / طلبات خاصة" : "Special Requests & Theme Notes"}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={isAr ? "مثال: عدد الأطفال، الثيمة المفضلة، أي متطلبات غذائية إضافية..." : "e.g. Preferred theme (Superheroes/Outer Space), food allergies, custom branding needs..."}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl p-4 text-sm focus:outline-none focus:border-[var(--e3-royal-blue)] transition-colors"
                  />
                </div>

                <MagneticButton
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  className="w-full uppercase font-black py-4 rounded-xl justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? (isAr ? "جاري إرسال الطلب..." : "Submitting Inquiry...") : (isAr ? "إرسال طلب الحجز" : "Submit Booking Inquiry")}</span>
                </MagneticButton>
              </form>
            )}
          </div>
        </div>

        {/* 4. TRUST BADGES */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 pt-12 border-t border-[var(--border-level-2)] grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[rgba(26,31,214,0.08)] border border-[var(--e3-royal-blue)]/20 rounded-2xl flex items-center justify-center text-[var(--e3-royal-blue)] mb-4">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-bold text-[var(--text-primary)] mb-2 font-display uppercase text-sm tracking-wide">
              {isAr ? "تنسيق خاص ومباشر" : "Dedicated Host"}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed max-w-xs">
              {isAr ? "مضيف مخصص يتولى كافة التفاصيل منذ اللحظة الأولى وحتى المغادرة." : "A dedicated event host supervises your party from arrival to departure."}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[rgba(176,19,184,0.08)] border border-[var(--e3-magenta)]/20 rounded-2xl flex items-center justify-center text-[var(--e3-magenta)] mb-4">
              <Sparkles size={24} />
            </div>
            <h4 className="font-bold text-[var(--text-primary)] mb-2 font-display uppercase text-sm tracking-wide">
              {isAr ? "ثيمات وديكورات مخصصة" : "Bespoke Themes"}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed max-w-xs">
              {isAr ? "تنسيق ديكور بالونات ودعوات مخصصة تناسب شغف أطفالك أو شركتك." : "Custom balloon styling, personalized cake design, and digital invitation cards."}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[rgba(75,0,143,0.08)] border border-[var(--e3-purple)]/20 rounded-2xl flex items-center justify-center text-[var(--e3-purple)] mb-4">
              <Award size={24} />
            </div>
            <h4 className="font-bold text-[var(--text-primary)] mb-2 font-display uppercase text-sm tracking-wide">
              {isAr ? "دخول سريع وتفضيل خاص" : "VIP Fast-Track"}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed max-w-xs">
              {isAr ? "دخول فوري بدون انتظار مع مواقف سيارات خاصة لكبار الشخصيات." : "Express entrance and priority parking for all your guests."}
            </p>
          </div>
        </motion.div>

      </div>
    </>
  );
}
