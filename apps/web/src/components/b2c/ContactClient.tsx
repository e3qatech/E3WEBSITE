"use client";

import { useState } from "react";
import {
  Star,
  MessageSquare,
  HeadphonesIcon,
  HelpCircle,
  Phone,
  Mail,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  FileUp,
  Quote,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Share2,
  Send,
  Globe,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useB2CTheme, B2CInput } from "@/components/ui/B2CThemeComponents";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { PublicSiteSettings } from "@/lib/settings/public-settings-dto";
import { cn } from "@/lib/utils";
function normalizeExternalUrl(raw?: string): string {
  if (!raw) return "#";
  const trimmed = raw.trim();
  if (!trimmed) return "#";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TwitterXIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.99 0 1.79-.8 1.79-1.79 0-.99-.8-1.79-1.79-1.79-.99 0-1.79.8-1.79 1.79 0 .99.8 1.79 1.79 1.79m1.4 9.74v-8.37H5.06v8.37h2.8z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function SnapchatIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.03 2.05c-3.76 0-6.15 2.69-6.15 5.56 0 .84.23 1.83.67 2.66.12.22.1.37-.05.51-.31.29-.9.7-1.25.86-.39.18-.75.46-.77.89-.02.44.29.74.77.9.68.23 1.45.1 1.79.02.26-.06.46.06.57.26.31.55 1.05 1.5 2.5 1.63.47.04.83.2 1.06.44.25.26.38.64.44 1.13.06.46-.17.75-.48.97-.47.33-1.27.67-2.34.8-.46.06-.72.37-.62.77.1.41.48.56.97.47 1.01-.18 2.21-.69 2.86-1.2.22-.17.43-.19.64-.07.69.41 1.65.65 2.52.65.88 0 1.83-.24 2.52-.65.21-.12.42-.1.64.07.65.51 1.85 1.02 2.86 1.2.49.09.87-.06.97-.47.1-.4-.16-.71-.62-.77-1.07-.13-1.87-.47-2.34-.8-.31-.22-.54-.51-.48-.97.06-.49.19-.87.44-1.13.23-.24.59-.4 1.06-.44 1.45-.13 2.19-1.08 2.5-1.63.11-.2.31-.32.57-.26.34.08 1.11.21 1.79-.02.48-.16.79-.46.77-.9-.02-.43-.38-.71-.77-.89-.35-.16-.94-.57-1.25-.86-.15-.14-.17-.29-.05-.51.44-.83.67-1.82.67-2.66 0-2.87-2.39-5.56-6.15-5.56z" />
    </svg>
  );
}

export function ContactClient({
  locale = "en",
  attractions = [],
  attractionFaqs = [],
  generalFaqs = [],
  pageSettings = {},
  featuredFeedbacks = [],
  siteSettings,
}: {
  locale?: string;
  attractions: any[];
  attractionFaqs: any[];
  generalFaqs: any[];
  pageSettings: any;
  featuredFeedbacks: any[];
  siteSettings?: PublicSiteSettings | Record<string, any>;
}) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState("support");
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState("");
  const [faqFilter, setFaqFilter] = useState("general");
  useB2CTheme();

  // Dynamic Contact Details sourced from Central Platform Settings (with safe defaults)
  const phone = siteSettings?.contactPhone || "+974 3048 9955";
  const email = siteSettings?.contactEmail || "info@eeeqa.com";
  const whatsapp = siteSettings?.contactWhatsapp || "+974 5113 8418";
  const workingHours =
    siteSettings?.workingHours ||
    (isAr ? "الأحد - الخميس: 9:00 ص - 6:00 م" : "Sun - Thu: 9:00 AM - 6:00 PM");
  const address = isAr
    ? siteSettings?.addressAr || "الدوحة، دولة قطر"
    : siteSettings?.addressEn || "Doha, State of Qatar";



  const socialLinks = [
    {
      key: "socialInstagram",
      url: siteSettings?.socialInstagram,
      label: "Instagram",
      icon: InstagramIcon,
      hoverClass: "hover:text-[#E4405F] hover:border-[#E4405F]/60 hover:bg-[#E4405F]/10",
    },
    {
      key: "socialTwitter",
      url: siteSettings?.socialTwitter,
      label: "X (Twitter)",
      icon: TwitterXIcon,
      hoverClass: "hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]/60 hover:bg-[var(--text-primary)]/10",
    },
    {
      key: "socialLinkedin",
      url: siteSettings?.socialLinkedin,
      label: "LinkedIn",
      icon: LinkedInIcon,
      hoverClass: "hover:text-[#0A66C2] hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/10",
    },
    {
      key: "socialYoutube",
      url: siteSettings?.socialYoutube,
      label: "YouTube",
      icon: YouTubeIcon,
      hoverClass: "hover:text-[#FF0000] hover:border-[#FF0000]/60 hover:bg-[#FF0000]/10",
    },
    {
      key: "socialFacebook",
      url: siteSettings?.socialFacebook,
      label: "Facebook",
      icon: FacebookIcon,
      hoverClass: "hover:text-[#1877F2] hover:border-[#1877F2]/60 hover:bg-[#1877F2]/10",
    },
    {
      key: "socialSnapchat",
      url: siteSettings?.socialSnapchat,
      label: "Snapchat",
      icon: SnapchatIcon,
      hoverClass: "hover:text-[#FFFC00] hover:border-[#FFFC00]/60 hover:bg-[#FFFC00]/10",
    },
  ].filter((s) => Boolean(s.url && s.url.trim().length > 0));

  const toggleFaq = (id: string) => {
    setActiveFaq((prev) => (prev === id ? null : id));
  };

  const allFaqs = [
    ...(Array.isArray(generalFaqs) ? generalFaqs : []).map((f) => ({
      ...f,
      type: "general",
      attractionId: "general",
      categoryNameEn: "General Platform",
      categoryNameAr: "أسئلة عامة",
    })),
    ...(Array.isArray(attractionFaqs) ? attractionFaqs : []).map((f) => ({
      ...f,
      type: "attraction",
      attractionId: String(f.attractionId || f.attraction?.id || ""),
      categoryNameEn: f.attraction?.nameEn || "Attraction",
      categoryNameAr: f.attraction?.nameAr || f.attraction?.nameEn || "الوجهة",
    })),
  ];

  // Filter strictly by selected category (General by default, or the specific attraction selected)
  const filteredFaqs = allFaqs.filter((faq) => {
    const qStr = isAr ? faq.questionAr || faq.questionEn || "" : faq.questionEn || "";
    const aStr = isAr ? faq.answerAr || faq.answerEn || "" : faq.answerEn || "";
    const matchesSearch =
      !faqSearch ||
      qStr.toLowerCase().includes(faqSearch.toLowerCase()) ||
      aStr.toLowerCase().includes(faqSearch.toLowerCase());

    const matchesFilter =
      faqFilter === "general"
        ? faq.type === "general" || faq.attractionId === "general"
        : faq.attractionId === faqFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .font-righteous { font-family: var(--font-display), 'Righteous', sans-serif; }
        .font-poppins { font-family: var(--font-sans), 'Poppins', sans-serif; }
      `,
        }}
      />
      <div
        className="w-full relative text-[var(--text-primary)] font-poppins selection:bg-[rgba(26,31,214,0.3)]"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* HERO SECTION */}
        <div className="relative pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden border-b border-[var(--border-level-2)] z-10">
          <div className="absolute inset-0 z-0">
            {pageSettings.heroMediaUrl ? (
              <UniversalMediaRenderer
                type={pageSettings.heroMediaType || "IMAGE"}
                src={pageSettings.heroMediaUrl}
                alt="Contact E3 Qatar"
                className="w-full h-full object-cover opacity-25 dark:opacity-35"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[var(--e3-deep-blue)]/10 via-[var(--e3-midnight)] to-[var(--e3-purple)]/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-transparent to-[var(--bg-level-1)]" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgba(26,31,214,0.1)] text-[var(--e3-royal-blue)] mb-6 border border-[var(--e3-royal-blue)]/30 shadow-xs">
              <HeadphonesIcon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight font-display uppercase leading-tight justify-center text-[var(--text-primary)]">
              {isAr
                ? pageSettings?.titleAr || pageSettings?.title || "كيف يمكننا مساعدتك؟"
                : pageSettings?.titleEn || pageSettings?.title || "How Can We Help?"}
            </h1>
            <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl font-medium leading-relaxed">
              {isAr
                ? pageSettings?.taglineAr ||
                  pageSettings?.tagline ||
                  "فريق دعم إي ثري قطر جاهز للإجابة على استفساراتك، متابعة حجوزاتك، واستقبال مقترحاتك وتجاربك."
                : pageSettings?.taglineEn ||
                  pageSettings?.tagline ||
                  "Need support with a ticket, want to leave feedback, or have a question? We're here for you."}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* MAIN FORM/TAB AREA */}
            <div className="lg:col-span-8">
              <Tabs defaultValue="support" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 bg-[var(--bg-level-1)] p-1.5 rounded-2xl mb-8 border border-[var(--border-level-2)]">
                  <TabsTrigger
                    value="support"
                    className="rounded-xl font-bold text-sm py-3 data-[state=active]:bg-[var(--surface-default)] data-[state=active]:text-[var(--e3-royal-blue)] data-[state=active]:shadow-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    <HeadphonesIcon className="w-4 h-4" />
                    <span>{isAr ? "الدعم الفني" : "Support"}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="feedback"
                    className="rounded-xl font-bold text-sm py-3 data-[state=active]:bg-[var(--surface-default)] data-[state=active]:text-[var(--e3-magenta)] data-[state=active]:shadow-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{isAr ? "التقييم والآراء" : "Feedback"}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="faq"
                    className="rounded-xl font-bold text-sm py-3 data-[state=active]:bg-[var(--surface-default)] data-[state=active]:text-[var(--e3-purple-accent)] data-[state=active]:shadow-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{isAr ? "الأسئلة الشائعة" : "FAQ"}</span>
                  </TabsTrigger>
                </TabsList>

                <div className="rounded-2xl bg-[var(--surface-default)] border border-[rgba(75,0,143,0.3)] shadow-[0_12px_30px_rgba(0,0,0,0.2)] p-6 md:p-8">
                  <TabsContent value="support">
                    <SupportForm attractions={attractions} isAr={isAr} />
                  </TabsContent>
                  <TabsContent value="feedback">
                    <FeedbackForm attractions={attractions} isAr={isAr} />
                  </TabsContent>
                  <TabsContent value="faq">
                    <FaqSection
                      faqs={filteredFaqs}
                      attractions={attractions}
                      search={faqSearch}
                      setSearch={setFaqSearch}
                      filter={faqFilter}
                      setFilter={setFaqFilter}
                      activeFaq={activeFaq}
                      toggleFaq={toggleFaq}
                      switchToSupport={() => setActiveTab("support")}
                      isAr={isAr}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* SIDEBAR DETAILS */}
            <div className="lg:col-span-4 space-y-6">
              {/* Dynamic Contact Info Card */}
              <div className="rounded-2xl bg-[var(--surface-default)] border border-[rgba(75,0,143,0.3)] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.15)] space-y-6 text-start">
                <h3 className="text-xl font-bold font-display uppercase tracking-wide border-b border-[var(--border-level-2)] pb-3">
                  {isAr ? "بيانات التواصل" : "Contact Details"}
                </h3>

                <div className="space-y-5">
                  {/* Phone */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(26,31,214,0.1)] text-[var(--e3-royal-blue)] flex items-center justify-center shrink-0 border border-[var(--e3-royal-blue)]/20">
                      <Phone size={16} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-[var(--text-tertiary)] tracking-wider">
                        {isAr ? "الهاتف المباشر" : "Direct Phone"}
                      </h4>
                      <a
                        href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                        className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--e3-royal-blue)] transition-colors mt-0.5 block font-mono"
                        dir="ltr"
                      >
                        {phone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(26,31,214,0.1)] text-[var(--e3-royal-blue)] flex items-center justify-center shrink-0 border border-[var(--e3-royal-blue)]/20">
                      <Mail size={16} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-[var(--text-tertiary)] tracking-wider">
                        {isAr ? "البريد الإلكتروني" : "Email Address"}
                      </h4>
                      <a
                        href={`mailto:${email}`}
                        className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--e3-royal-blue)] transition-colors mt-0.5 block font-mono"
                      >
                        {email}
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  {whatsapp && (
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <MessageCircle size={16} />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-[var(--text-tertiary)] tracking-wider">
                          {isAr ? "خدمة العملاء واتساب" : "WhatsApp Concierge"}
                        </h4>
                        <a
                          href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5 block font-mono"
                          dir="ltr"
                        >
                          {whatsapp}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Working Hours */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(26,31,214,0.1)] text-[var(--e3-royal-blue)] flex items-center justify-center shrink-0 border border-[var(--e3-royal-blue)]/20">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-[var(--text-tertiary)] tracking-wider">
                        {isAr ? "ساعات العمل الرسمية" : "Operating Hours"}
                      </h4>
                      <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5 leading-relaxed">
                        {workingHours}
                      </p>
                    </div>
                  </div>

                  {/* Location Address */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(26,31,214,0.1)] text-[var(--e3-royal-blue)] flex items-center justify-center shrink-0 border border-[var(--e3-royal-blue)]/20">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-[var(--text-tertiary)] tracking-wider">
                        {isAr ? "المقر والموقع" : "Location"}
                      </h4>
                      <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5 leading-relaxed">
                        {address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Channels */}
                {socialLinks.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border-level-2)]">
                    <h4 className="text-[11px] font-black uppercase text-[var(--text-tertiary)] tracking-wider mb-2.5">
                      {isAr ? "تابعنا على المنصات" : "Follow Our Channels"}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {socialLinks.map((s) => {
                        const Icon = s.icon;
                        return (
                          <a
                            key={s.key}
                            href={normalizeExternalUrl(s.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "w-8 h-8 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-[var(--text-secondary)] flex items-center justify-center transition-all duration-200 shadow-xs",
                              s.hoverClass
                            )}
                            title={s.label}
                            aria-label={s.label}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Featured Testimonials */}
              {featuredFeedbacks && featuredFeedbacks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-[var(--text-tertiary)] tracking-widest text-start px-2">
                    {isAr ? "تجارب وآراء الضيوف" : "Visitor Stories"}
                  </h3>
                  {featuredFeedbacks.map((f: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-2xl bg-[var(--surface-default)] border border-[rgba(75,0,143,0.3)] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                    >
                      <Quote className="w-8 h-8 text-[var(--e3-purple)] opacity-35 mb-2" />
                      <p className="text-xs italic text-[var(--text-secondary)] font-medium mb-4 line-clamp-3">
                        &quot;{f.comment}&quot;
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {f.visitorName || (isAr ? "ضيف معتمد" : "Verified Guest")}
                        </span>
                        <div className="flex items-center gap-0.5 text-[var(--e3-magenta)]">
                          {Array.from({ length: f.rating || 5 }).map((_, i) => (
                            <Star key={i} size={12} className="fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SupportForm({ attractions, isAr }: { attractions: any[]; isAr: boolean }) {
  const [category, setCategory] = useState("ticket_issue");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      let attachmentUrl: string | undefined;
      let attachmentFileName: string | undefined;

      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("context", "public_attachment");

        try {
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
          });
          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            if (uploadJson.url) {
              attachmentUrl = uploadJson.url;
              attachmentFileName = uploadJson.fileName || file.name;
            }
          }
        } catch {
          attachmentFileName = file.name;
        }
      }

      const res = await fetch("/api/contact/b2c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "SUPPORT_TICKET",
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          category: data.category || undefined,
          attractionId: data.attractionId || undefined,
          message: data.message,
          attachmentUrl,
          attachmentFileName: attachmentFileName || (file ? file.name : undefined),
        }),
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok && (resData.ticketId || resData.id || resData.success)) {
        setTicketNumber(resData.ticketId || resData.id || "SUBMITTED");
        setSuccess(true);
      } else {
        setErrorMessage(
          resData.error ||
            (isAr
              ? "فشل إرسال طلب الدعم. يرجى مراجعة البيانات والمحاولة مجدداً."
              : "Failed to submit support ticket. Please verify your details.")
        );
      }
    } catch (err: any) {
      console.error("[SUPPORT_FORM_ERROR]", err);
      setErrorMessage(isAr ? "خطأ في الاتصال. يرجى المحاولة لاحقاً." : "Network connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-[rgba(26,31,214,0.1)] text-[var(--e3-royal-blue)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--e3-royal-blue)]/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-display uppercase">
          {isAr ? "تم استلام طلبك بنجاح" : "Request Submitted"}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] font-medium mb-8">
          {isAr ? (
            <>
              رقم تذكرة الدعم الخاصة بك هو:{" "}
              <strong className="font-mono text-[var(--e3-royal-blue)]">#{ticketNumber}</strong>. سيتواصل معك فريق الدعم
              عبر البريد الإلكتروني.
            </>
          ) : (
            <>
              Your ticket reference is{" "}
              <strong className="font-mono text-[var(--e3-royal-blue)]">#{ticketNumber}</strong>. Our support team will
              follow up via email.
            </>
          )}
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setTicketNumber(null);
            setFile(null);
          }}
          className="rounded-xl bg-gradient-to-r from-[var(--e3-royal-blue)] to-[var(--e3-purple)] text-white font-bold px-6 py-3 text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-md"
        >
          {isAr ? "تقديم طلب آخر" : "Submit Another Request"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-start">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <B2CInput
          name="name"
          required
          label={isAr ? "الاسم الكامل *" : "Full Name *"}
          placeholder={isAr ? "أحمد محمد" : "John Doe"}
        />
        <B2CInput
          name="email"
          type="email"
          required
          label={isAr ? "البريد الإلكتروني *" : "Email Address *"}
          placeholder="user@example.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <B2CInput
          name="phone"
          type="tel"
          label={isAr ? "رقم الهاتف" : "Phone Number"}
          placeholder="+974 5555 5555"
        />
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">
            {isAr ? "فئة الاستفسار" : "Category"}
          </label>
          <div className="relative flex items-center">
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--e3-royal-blue)] appearance-none cursor-pointer"
            >
              <option value="ticket_issue">{isAr ? "استفسار عن التذاكر والحجوزات" : "Ticket Issue"}</option>
              <option value="packages_birthday">{isAr ? "باقات الفعاليات أو أعياد الميلاد" : "Packages or Birthday"}</option>
              <option value="venue_question">{isAr ? "معلومات الوجهات والفعاليات" : "Venue Question"}</option>
              <option value="complaint">{isAr ? "شكوى أو ملاحظة تشغيلية" : "Complaint / Feedback"}</option>
              <option value="other">{isAr ? "أخرى" : "Other"}</option>
            </select>
            <ChevronDown className="absolute end-3 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
          </div>
          {category === "packages_birthday" && (
            <div className="mt-1.5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs text-[var(--text-secondary)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in duration-200">
              <span>
                {isAr
                  ? "هل تخطط لحفل عيد ميلاد أو حجز باقة ترفيهية خاصة؟ يمكنك أيضاً استعراض جميع الباقات الجاهزة:"
                  : "Planning a birthday party or special group event? You can also explore all active packages directly:"}
              </span>
              <a
                href={`/${isAr ? "ar" : "en"}/b2c/packages`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-purple-400 hover:text-purple-300 underline shrink-0 inline-flex items-center gap-1"
              >
                {isAr ? "استعراض الباقات ←" : "Explore Packages →"}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">
          {isAr ? "الوجهة الترفيهية المرتبطة (اختياري)" : "Related Attraction (Optional)"}
        </label>
        <div className="relative flex items-center">
          <select
            name="attractionId"
            className="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--e3-royal-blue)] appearance-none cursor-pointer"
          >
            <option value="">{isAr ? "عام / غير محدد" : "General / Not specified"}</option>
            {attractions.map((a: any) => (
              <option key={a.id || a.attractionId} value={a.id || a.attractionId}>
                {isAr ? a.nameAr || a.attractionNameAr || a.nameEn : a.nameEn || a.attractionNameEn}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute end-3 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
        </div>
      </div>

      <B2CInput
        name="message"
        required
        textarea
        label={isAr ? "تفاصيل الرسالة *" : "Message *"}
        placeholder={isAr ? "كيف يمكننا مساعدتك؟ اكتب تفاصيل طلبك هنا..." : "How can we help you?"}
      />

      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">
          {isAr ? "مرفقات (اختياري)" : "Attachment (Optional)"}
        </label>
        <label className="flex items-center justify-center w-full h-28 border-2 border-dashed border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] rounded-xl cursor-pointer hover:bg-[var(--surface-hover)] transition-colors">
          <div className="flex flex-col items-center">
            <FileUp className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              {file ? file.name : isAr ? "انقر لتحميل ملف (الحد الأقصى 5 ميجابايت)" : "Click to upload (Max 5MB)"}
            </span>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected && selected.size <= 5 * 1024 * 1024) setFile(selected);
              else alert(isAr ? "حجم الملف يجب ألا يتجاوز 5 ميجابايت" : "File must be smaller than 5MB");
            }}
          />
        </label>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-[var(--e3-royal-blue)] to-[var(--e3-purple)] text-white font-black uppercase py-4 px-6 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? isAr
              ? "جارٍ الإرسال..."
              : "Submitting..."
            : isAr
            ? "إرسال طلب الدعم"
            : "Submit Support Request"}
        </button>
      </div>
    </form>
  );
}

function FeedbackForm({ attractions, isAr }: { attractions: any[]; isAr: boolean }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact/b2c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "FEEDBACK",
          name: data.name,
          email: data.email,
          message: data.message,
          rating: rating.toString(),
          attractionId: data.attractionId,
        }),
      });
      if (res.ok) setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-[var(--e3-magenta)]/10 text-[var(--e3-magenta)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--e3-magenta)]/20 shadow-xs">
          <Star className="w-8 h-8 fill-current" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-display uppercase">
          {isAr ? "شكراً لمشاركتنا رأيك!" : "Thank You!"}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] font-medium mb-8">
          {isAr
            ? "تقييمك وملاحظاتك تساعدنا دائماً على تطوير وتقديم أفضل التجارب الترفيهية."
            : "Your feedback helps us improve our experiences."}
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setRating(0);
          }}
          className="rounded-xl bg-gradient-to-r from-[var(--e3-magenta)] to-[var(--e3-purple)] text-white font-bold px-6 py-3 text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-md"
        >
          {isAr ? "إرسال تقييم إضافي" : "Submit More Feedback"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-start">
      <div className="text-center mb-8">
        <label className="block text-base font-black uppercase tracking-wider text-[var(--text-secondary)] mb-4">
          {isAr ? "كيف كانت تجربتك معنا؟" : "How was your experience?"}
        </label>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  (hoverRating || rating) >= star ? "fill-[var(--e3-magenta)] text-[var(--e3-magenta)]" : "text-zinc-500"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">
          {isAr ? "الوجهة الترفيهية" : "Attraction"}
        </label>
        <div className="relative flex items-center">
          <select
            name="attractionId"
            className="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--e3-royal-blue)] appearance-none cursor-pointer"
          >
            <option value="">{isAr ? "تقييم عام" : "General Feedback"}</option>
            {attractions.map((a: any) => (
              <option key={a.id || a.attractionId} value={a.id || a.attractionId}>
                {isAr ? a.nameAr || a.attractionNameAr || a.nameEn : a.nameEn || a.attractionNameEn}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute end-3 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
        </div>
      </div>

      <B2CInput
        name="message"
        required
        textarea
        label={isAr ? "أخبرنا المزيد عن انطباعك *" : "Tell us more *"}
        placeholder={isAr ? "ما الذي نال إعجابك؟ وما الذي يمكننا تحسينه؟" : "What did you love? What could be better?"}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <B2CInput
          name="name"
          label={isAr ? "الاسم (اختياري)" : "Name (Optional)"}
          placeholder={isAr ? "أحمد محمد" : "John Doe"}
        />
        <B2CInput
          name="email"
          type="email"
          label={isAr ? "البريد الإلكتروني (اختياري)" : "Email (Optional)"}
          placeholder="user@example.com"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full rounded-xl bg-gradient-to-r from-[var(--e3-magenta)] to-[var(--e3-purple)] text-white font-black uppercase py-4 px-6 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAr ? "إرسال التقييم" : "Submit Feedback"}
        </button>
      </div>
    </form>
  );
}

function FaqSection({
  faqs,
  attractions,
  search,
  setSearch,
  filter,
  setFilter,
  activeFaq,
  toggleFaq,
  switchToSupport,
  isAr,
}: any) {
  const selectedAttraction = attractions.find((a: any) => (a.id || a.attractionId) === filter);
  const currentCategoryTitle =
    filter === "general"
      ? isAr
        ? "الأسئلة العامة للمنصة"
        : "General Platform Questions"
      : isAr
      ? selectedAttraction?.nameAr || selectedAttraction?.nameEn || "أسئلة الوجهة"
      : selectedAttraction?.nameEn || "Attraction FAQs";

  return (
    <div className="space-y-6 text-start">
      {/* Category Pills Selector */}
      <div className="space-y-2">
        <label className="block text-[11px] font-black uppercase text-[var(--text-tertiary)] tracking-wider">
          {isAr ? "اختر موضوع أو وجهة الأسئلة:" : "Select FAQ Topic or Attraction:"}
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setFilter("general");
              setSearch("");
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border",
              filter === "general"
                ? "bg-[var(--e3-royal-blue)] text-white border-[var(--e3-royal-blue)] shadow-md"
                : "bg-[var(--bg-level-1)] text-[var(--text-secondary)] border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] hover:text-[var(--text-primary)]"
            )}
          >
            <span>{isAr ? "أسئلة عامة" : "General FAQs"}</span>
          </button>

          {attractions.map((a: any) => {
            const id = a.id || a.attractionId;
            const isSelected = filter === id;
            const name = isAr ? a.nameAr || a.attractionNameAr || a.nameEn : a.nameEn || a.attractionNameEn;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setFilter(id);
                  setSearch("");
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border",
                  isSelected
                    ? "bg-[var(--e3-royal-blue)] text-white border-[var(--e3-royal-blue)] shadow-md"
                    : "bg-[var(--bg-level-1)] text-[var(--text-secondary)] border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] hover:text-[var(--text-primary)]"
                )}
              >
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Dropdown Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isAr
                ? `البحث في ${currentCategoryTitle}...`
                : `Search in ${currentCategoryTitle}...`
            }
            className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl py-2.5 ps-10 pe-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--e3-royal-blue)] transition-all text-xs"
          />
        </div>
        <div className="w-full sm:w-56">
          <div className="relative flex items-center">
            <select
              value={filter}
              onChange={(e: any) => {
                setFilter(e.target.value);
                setSearch("");
              }}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--e3-royal-blue)] appearance-none cursor-pointer text-xs font-bold"
            >
              <option value="general">{isAr ? "أسئلة عامة (الافتراضي)" : "General FAQs (Default)"}</option>
              {attractions.map((a: any) => (
                <option key={a.id || a.attractionId} value={a.id || a.attractionId}>
                  {isAr ? a.nameAr || a.attractionNameAr || a.nameEn : a.nameEn || a.attractionNameEn}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute end-3 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Current Active Category Context Header */}
      <div className="flex items-center justify-between px-1 py-1 border-b border-[var(--border-level-2)]">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[var(--e3-royal-blue)]" />
          <span className="text-xs font-bold text-[var(--text-primary)]">
            {currentCategoryTitle}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[var(--text-tertiary)] font-bold">
          {faqs.length} {isAr ? "سؤال" : faqs.length === 1 ? "question" : "questions"}
        </span>
      </div>

      {/* FAQ Accordion Items */}
      <div className="space-y-3">
        {faqs.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-2">
            <p className="text-sm font-bold text-[var(--text-primary)]">
              {search
                ? isAr
                  ? "لا توجد نتائج مطابقة لبحثك في هذا القسم."
                  : "No questions found matching your search."
                : isAr
                ? "لا توجد أسئلة شائعة مضافة لهذه الوجهة حالياً."
                : "No FAQs added for this attraction yet."}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr
                ? "يمكنك الانتقال إلى الأسئلة العامة أو إرسال استفسار مباشر لفريق الدعم."
                : "You can switch to General FAQs or reach out directly via Support."}
            </p>
            {filter !== "general" && (
              <button
                type="button"
                onClick={() => {
                  setFilter("general");
                  setSearch("");
                }}
                className="mt-2 text-xs font-bold text-[var(--e3-royal-blue)] hover:underline cursor-pointer"
              >
                {isAr ? "← العودة إلى الأسئلة العامة" : "← Back to General FAQs"}
              </button>
            )}
          </div>
        ) : (
          faqs.map((faq: any) => {
            const isActive = activeFaq === faq.id;
            const question = isAr ? faq.questionAr || faq.questionEn : faq.questionEn;
            const answer = isAr ? faq.answerAr || faq.answerEn : faq.answerEn;
            return (
              <div
                key={faq.id}
                className="border border-[var(--border-level-2)] rounded-2xl overflow-hidden bg-[var(--surface-default)] transition-colors hover:border-[var(--e3-royal-blue)] shadow-2xs"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-4 text-start hover:bg-[var(--surface-hover)] transition-colors cursor-pointer gap-4"
                >
                  <span className="font-bold text-sm text-[var(--text-primary)] leading-snug">
                    {question}
                  </span>
                  {isActive ? (
                    <ChevronUp className="w-4 h-4 text-[var(--e3-royal-blue)] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                  )}
                </button>
                {isActive && (
                  <div className="p-4 pt-0 text-[var(--text-secondary)] border-t border-[var(--border-level-2)] leading-relaxed text-xs font-medium bg-[var(--bg-level-1)]/40">
                    <div className="pt-3">{answer}</div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="text-center pt-6 border-t border-[var(--border-level-2)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-secondary)] font-medium">
          {isAr ? "لم تجد إجابة لاستفسارك؟" : "Didn't find what you're looking for?"}
        </p>
        <button
          onClick={switchToSupport}
          className="rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] hover:text-[var(--e3-royal-blue)] text-[var(--text-primary)] font-bold px-5 py-2 text-xs transition-colors cursor-pointer shadow-2xs"
        >
          {isAr ? "تواصل مع فريق الدعم" : "Contact Support Team"}
        </button>
      </div>
    </div>
  );
}
