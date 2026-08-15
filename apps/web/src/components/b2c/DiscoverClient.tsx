"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Target, 
  Building, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Download, 
  ArrowRight, 
  FileText,
  Award,
  X
} from "lucide-react";

import { useB2CTheme } from "@/components/ui/B2CThemeComponents";
import { E3LivingHero } from "@/components/b2c/hero/E3LivingHero";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { B2CGrid } from "@/components/ui/B2CGrid";

export function DiscoverClient({
  locale,
  initialSettings,
  employeeProfiles = [],
  partners = [],
  clients = [],
  caseStudies: _caseStudies = [],
  services: _services = [],
  jobs: _jobs = [],
  insights = [],
  guinnessAllowed = false
}: {
  locale: string;
  initialSettings: any;
  employeeProfiles?: any[];
  partners?: any[];
  clients?: any[];
  caseStudies?: any[];
  services?: any[];
  jobs?: any[];
  insights?: any[];
  /** Server-evaluated 5-condition Guinness publication gate result */
  guinnessAllowed?: boolean;
}) {
  const isAr = locale === "ar";
  useB2CTheme();

  const [_activeConnectTab, _setActiveConnectTab] = useState<number>(0);
  const [activeLeaderModal, setActiveLeaderModal] = useState<any | null>(null);
  const [activeBQModal, setActiveBQModal] = useState<any | null>(null);

  const content = initialSettings || {};
  const sectionOrder: string[] = content.sectionOrder || [
    "hero",
    "about",
    "leadership",
    "visionMissionValues",
    "recordBreaking",
    "impactMilestones",
    "bookingQube",
    "connect",
    "trustedAcrossQatar",
    "latestInsights",
    "finalGateway"
  ];

  // Helper map to match EmployeeProfiles to Leadership Messages
  const employeeProfileMap = new Map(employeeProfiles.map(e => [e.id, e]));
  const partnersMap = new Map(partners.map(p => [p.id, p]));
  const clientsMap = new Map(clients.map(c => [c.id, c]));

  return (
    <div 
      className="min-h-screen text-[var(--text-primary)] font-poppins selection:bg-[rgba(26,31,214,0.3)] overflow-x-hidden relative" 
      dir={isAr ? "rtl" : "ltr"}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .font-righteous { font-family: var(--font-display), 'Righteous', sans-serif; }
        .font-poppins { font-family: var(--font-sans), 'Poppins', sans-serif; }
      `}} />

      {/* Noise Texture */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
        style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
      />

      {/* RENDER SECTIONS BASED ON CMS SECTION ORDER */}
      {sectionOrder.map((sectionKey: string) => {
        // 1. HERO SECTION (E3 Living Hero System)
        if (sectionKey === "hero" && content.hero?.enabled !== false) {
          const hero = content.hero || {};
          return (
            <div key="hero" id="hero">
              <E3LivingHero
                eyebrowEn={hero.eyebrowEn || "E3 CORPORATE STORY & ECOSYSTEM"}
                eyebrowAr={hero.eyebrowAr || "قصة إي ثري الترفيهية والتنفيذية"}
                fixedHeadlineEn={hero.fixedHeadlineEn || "CHOOSE HOW YOU WANT TO"}
                fixedHeadlineAr={hero.fixedHeadlineAr || "اختر كيف ترغب في أن"}
                rotatingWordsEn={
                  Array.isArray(hero.rotatingWordsEn) && hero.rotatingWordsEn.length > 0
                    ? hero.rotatingWordsEn
                    : ["EXPLORE", "COMPETE", "CREATE", "DISCOVER"]
                }
                rotatingWordsAr={
                  Array.isArray(hero.rotatingWordsAr) && hero.rotatingWordsAr.length > 0
                    ? hero.rotatingWordsAr
                    : ["تستكشف", "تنافس", "تبتكر", "تكتشف"]
                }
                descriptionEn={
                  hero.subtitleEn || hero.subtextEn || "Pioneering landmark entertainment, kinetic staging, and Qatar's premier spatial technology ecosystem."
                }
                descriptionAr={
                  hero.subtitleAr || hero.subtextAr || "نبتكر تجارب ترفيهية استثنائية، عروض حية، ومنظومة تكنولوجية متكاملة في قطر."
                }
                primaryCta={{
                  labelEn: hero.primaryCta?.labelEn || hero.primaryCtaLabelEn || "Explore Ecosystem",
                  labelAr: hero.primaryCta?.labelAr || hero.primaryCtaLabelAr || "استكشف المنظومة",
                  url: hero.primaryCta?.customUrl || hero.primaryCtaUrl || "#about"
                }}
                secondaryCta={{
                  labelEn: hero.secondaryCta?.labelEn || hero.secondaryCtaLabelEn || "Leadership Message",
                  labelAr: hero.secondaryCta?.labelAr || hero.secondaryCtaLabelAr || "كلمة القيادة",
                  url: hero.secondaryCta?.customUrl || hero.secondaryCtaUrl || "#leadership"
                }}
                media={{
                  mediaType: (hero.mediaType || "IMAGE").toUpperCase(),
                  mediaUrl: hero.mediaUrl,
                  posterUrl: hero.posterUrl || hero.posterMediaUrl || hero.mobileMediaUrl,
                  overlayOpacity: hero.overlayOpacity !== undefined ? hero.overlayOpacity : 0.65
                }}
                preset={hero.preset || "story-portal"}
                animationSpeed={hero.animationSpeed || 2800}
                enableRotatingWords={hero.enableRotatingWords !== false}
                locale={locale}
              />
            </div>
          );
        }

        // 2. ABOUT E3 SECTION
        if (sectionKey === "about" && content.about?.enabled !== false) {
          const abt = content.about || {};
          const profileUrl = abt.companyProfileUrl || abt.companyProfileFileUrl;
          const profileEnabled = abt.companyProfileEnabled !== false && !!profileUrl;

          return (
            <section key="about" id="about" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--bg-level-1)]">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--e3-royal-blue)]">
                      {isAr ? abt.eyebrowAr : abt.eyebrowEn || "ABOUT E3"}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight text-[var(--text-primary)]">
                      {isAr ? abt.headingAr : abt.headingEn}
                    </h2>
                    <p className="text-base text-[var(--text-secondary)] leading-relaxed font-medium">
                      {isAr ? abt.summaryAr : abt.summaryEn}
                    </p>
                    {abt.fullStoryEn && (
                      <p className="text-xs text-[var(--text-tertiary)] leading-relaxed font-medium">
                        {isAr ? abt.fullStoryAr : abt.fullStoryEn}
                      </p>
                    )}

                    {profileEnabled && (
                      <div className="pt-2">
                        <a
                          href={profileUrl}
                          target={abt.openInNewTab !== false ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] transition-all shadow-sm"
                        >
                          <FileText className="w-4 h-4 text-[var(--e3-royal-blue)]" />
                          {isAr ? (abt.companyProfileLabelAr || "تحميل الملف التعريفي للشركة") : (abt.companyProfileLabelEn || "Download Corporate Profile")}
                          <Download className="w-3.5 h-3.5 opacity-70 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {(abt.factItems || []).map((fact: any) => (
                      <InteractiveCard key={fact.id} className="p-6 text-center" glowColor="rgba(26, 31, 214, 0.3)">
                        <div className="text-3xl md:text-4xl font-black font-display text-[var(--e3-royal-blue)] mb-2">
                          {fact.value}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] font-mono">
                          {isAr ? fact.labelAr : fact.labelEn}
                        </div>
                      </InteractiveCard>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 3. LEADERSHIP PERSPECTIVES SECTION
        if (sectionKey === "leadership" && content.leadership?.enabled !== false) {
          const ldr = content.leadership || {};
          const messages = Array.isArray(ldr.messages) ? ldr.messages : [];

          return (
            <section key="leadership" id="leadership" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--bg-level-2)]">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--e3-royal-blue)] mb-2 block">
                    {isAr ? (ldr.eyebrowAr || "رؤى القيادة") : (ldr.eyebrowEn || "LEADERSHIP PERSPECTIVES")}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4 font-display uppercase">
                    {isAr ? (ldr.headingAr || "قيادة برؤية هندسية مبتكرة") : (ldr.headingEn || "Guided By Vision & Engineering Mastery")}
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {messages.map((msg: any) => {
                    const profile = msg.teamMemberId ? employeeProfileMap.get(msg.teamMemberId) : null;
                    const portrait = profile?.profileImage || msg.mediaOverrideUrl || msg.imageUrl || msg.avatarUrl;
                    const name = isAr ? (msg.nameAr || (profile ? `${profile.firstName} ${profile.lastName}` : msg.nameEn)) : (profile ? `${profile.firstName} ${profile.lastName}` : msg.nameEn);
                    const title = isAr ? (msg.messageTitleAr || msg.messageTitleEn || profile?.designation) : (msg.messageTitleEn || profile?.designation);
                    const fullMsgText = isAr ? (msg.fullMessageAr || msg.fullMessageEn) : (msg.fullMessageEn || msg.fullMessageAr);

                    return (
                      <InteractiveCard key={msg.id} className="overflow-hidden border border-[var(--border-level-2)] rounded-3xl bg-[var(--surface-default)] shadow-2xl p-6 md:p-8" glowColor="rgba(26, 31, 214, 0.3)">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-stretch w-full">
                          {/* Left Column: Leader Portrait Image (Full Height) */}
                          <div className="sm:col-span-5 relative rounded-2xl overflow-hidden border border-[var(--border-level-2)] bg-gradient-to-br from-[var(--e3-deep-blue)] via-[var(--e3-midnight)] to-black min-h-[260px] sm:min-h-[340px] shadow-lg">
                            {portrait ? (
                              <img src={portrait} alt={name || "Leader"} className="w-full h-full object-cover object-top absolute inset-0" />
                            ) : (
                              <div className="relative w-full h-full flex items-center justify-center bg-[var(--e3-deep-blue)]/80">
                                <div className="w-20 h-20 rounded-full bg-[var(--e3-royal-blue)]/30 border border-[var(--e3-royal-blue)]/60 flex items-center justify-center font-bold text-2xl text-[var(--e3-royal-blue)] shadow-2xl">
                                  {name?.charAt(0) || "E3"}
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          </div>

                          {/* Right Column: Text Content (Avatar, Title, Quote, Subtext & CTA) */}
                          <div className="sm:col-span-7 flex flex-col justify-between space-y-4 py-1">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                {portrait && (
                                  <img src={portrait} alt={name || "Leader"} className="w-10 h-10 rounded-full object-cover border border-[var(--e3-royal-blue)] shadow-md shrink-0" />
                                )}
                                <div>
                                  <h3 className="font-extrabold text-base md:text-lg text-[var(--text-primary)] font-display uppercase leading-tight">{name}</h3>
                                  <p className="text-xs text-[var(--e3-royal-blue)] font-mono font-bold uppercase tracking-wider">{title}</p>
                                </div>
                              </div>

                              {(msg.pullQuoteEn || msg.pullQuoteAr) && (
                                <blockquote className="text-xs md:text-sm font-semibold italic text-[var(--text-primary)] border-l-2 rtl:border-l-0 rtl:border-r-2 border-[var(--e3-royal-blue)] pl-3 rtl:pl-0 rtl:pr-3 py-1 bg-[var(--surface-hover)]/40 rounded-r-xl">
                                  &ldquo;{isAr ? (msg.pullQuoteAr || msg.pullQuoteEn) : (msg.pullQuoteEn || msg.pullQuoteAr)}&rdquo;
                                </blockquote>
                              )}

                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium line-clamp-4">
                                {fullMsgText}
                              </p>
                            </div>

                            {/* Read Full Perspective Button */}
                            <button
                              onClick={() => setActiveLeaderModal({ ...msg, portrait, name, title, fullMsgText })}
                              className="inline-flex items-center gap-2 self-start px-4 py-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--e3-royal-blue)] text-[var(--text-primary)] hover:text-white border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] text-[11px] font-bold uppercase tracking-wider transition-all shadow-md group cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-[var(--e3-royal-blue)] group-hover:text-white transition-colors" />
                              <span>{isAr ? "اقرأ الكلمة كاملة" : "Read Full Perspective"}</span>
                            </button>
                          </div>
                        </div>
                      </InteractiveCard>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        // 4. VISION, MISSION & VALUES SECTION
        if (sectionKey === "visionMissionValues" && content.visionMissionValues?.enabled !== false) {
          const vmv = content.visionMissionValues || {};
          const values = Array.isArray(vmv.values) ? vmv.values : [];

          return (
            <section key="visionMissionValues" id="visionMissionValues" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--surface-default)]/60">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4 font-display uppercase">
                    {isAr ? (vmv.sectionTitleAr || "رؤيتنا ورسالتنا") : (vmv.sectionTitleEn || "Our Core Spine")}
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm font-medium">
                    {isAr ? vmv.sectionDescriptionAr : vmv.sectionDescriptionEn}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {vmv.vision?.enabled !== false && (
                    <InteractiveCard className="p-8" glowColor="rgba(26, 31, 214, 0.3)">
                      <Target className="w-10 h-10 text-[var(--e3-royal-blue)] mb-4" />
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 font-display uppercase">
                        {isAr ? vmv.vision.titleAr : vmv.vision.titleEn || "Vision"}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                        {isAr ? vmv.vision.descriptionAr : vmv.vision.descriptionEn}
                      </p>
                    </InteractiveCard>
                  )}

                  {vmv.mission?.enabled !== false && (
                    <InteractiveCard className="p-8" glowColor="rgba(75, 0, 143, 0.3)">
                      <Building className="w-10 h-10 text-[var(--e3-purple)] mb-4" />
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 font-display uppercase">
                        {isAr ? vmv.mission.titleAr : vmv.mission.titleEn || "Mission"}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                        {isAr ? vmv.mission.descriptionAr : vmv.mission.descriptionEn}
                      </p>
                    </InteractiveCard>
                  )}
                </div>

                <B2CGrid columns={3} gap="lg">
                  {values.map((val: any) => (
                    <InteractiveCard key={val.id} className="p-6" glowColor="rgba(26, 31, 214, 0.2)">
                      <Sparkles className="w-8 h-8 text-[var(--e3-royal-blue)] mb-3" />
                      <h4 className="text-base font-bold text-[var(--text-primary)] mb-2 font-display uppercase">
                        {isAr ? val.titleAr : val.titleEn}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {isAr ? val.descriptionAr : val.descriptionEn}
                      </p>
                    </InteractiveCard>
                  ))}
                </B2CGrid>
              </div>
            </section>
          );
        }

        // 5. RECORD BREAKING GUINNESS SECTION
        if (sectionKey === "recordBreaking" && content.recordBreaking?.enabled !== false) {
          const rec = content.recordBreaking || {};
          const isGuinnessApproved = guinnessAllowed;
          const recImg = rec.recordImageUrl || rec.certificateUrl || rec.approvedBadgeMediaId || rec.mediaUrl;

          return (
            <section key="recordBreaking" id="recordBreaking" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--e3-midnight)]">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="p-8 md:p-12 rounded-3xl border border-[var(--e3-royal-blue)]/40 bg-gradient-to-br from-[var(--e3-deep-blue)]/80 to-[var(--e3-midnight)] shadow-[0_0_50px_rgba(26,31,214,0.2)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--e3-royal-blue)]">
                          {isAr ? rec.eyebrowAr : rec.eyebrowEn}
                        </span>
                        {isGuinnessApproved && (
                          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase flex items-center gap-1 border border-purple-500/40">
                            <ShieldCheck className="w-3 h-3" /> Official Guinness World Records™ Verified
                          </span>
                        )}
                      </div>

                      <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight text-[var(--text-primary)] mb-4">
                        {isAr ? rec.titleAr : rec.titleEn}
                      </h2>

                      <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-6 font-medium">
                        {isAr ? rec.summaryAr : rec.summaryEn}
                      </p>

                      {rec.ctaDestination && (
                        <a 
                          href={rec.ctaDestination}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--e3-royal-blue)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--e3-royal-blue)]/80 transition-colors shadow-lg"
                        >
                          {isAr ? rec.ctaLabelAr : rec.ctaLabelEn || "View Case Study"}
                          <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                        </a>
                      )}
                    </div>

                    <div className="text-center p-8 rounded-2xl bg-[var(--surface-default)]/40 border border-[var(--border-level-2)] relative overflow-hidden flex flex-col items-center justify-center">
                      {recImg ? (
                        <div className="w-full h-48 mb-6 rounded-xl overflow-hidden relative border border-[var(--border-level-2)] shadow-xl">
                          <img src={recImg} alt="Guinness World Record Certificate" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full h-24 mb-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 flex items-center justify-center gap-2 shadow-inner">
                          <Award className="w-8 h-8 text-purple-400" />
                          <span className="text-xs font-mono font-extrabold text-purple-300 uppercase tracking-widest">Guinness World Record™ Certificate</span>
                        </div>
                      )}

                      <div className="text-6xl md:text-8xl font-black font-display text-[var(--e3-royal-blue)] mb-2 tracking-tighter drop-shadow-md">
                        {rec.measurementValue || "1,055"}
                      </div>
                      <div className="text-lg font-bold uppercase tracking-widest text-[var(--text-primary)] mb-2 font-mono">
                        {isAr ? rec.measurementUnitAr : rec.measurementUnitEn}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] font-mono">
                        {isAr ? rec.officialRecordTitleAr : rec.officialRecordTitleEn}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 7. BOOKINGQUBE SPOTLIGHT SECTION
        if (sectionKey === "bookingQube" && content.bookingQube?.enabled !== false) {
          const bq = content.bookingQube || {};
          const features = Array.isArray(bq.featureItems) ? bq.featureItems : [];

          return (
            <section key="bookingQube" id="bookingQube" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--bg-level-1)]">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                  {bq.logoUrl && (
                    <div className="flex justify-center mb-4">
                      <img src={bq.logoUrl} alt="BookingQube Logo" className="h-16 object-contain" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-[var(--e3-royal-blue)] tracking-widest uppercase font-mono block">
                    {isAr ? (bq.eyebrowAr || "منظومة التقنية الحصرية") : (bq.eyebrowEn || "PROPRIETARY ECOSYSTEM TECH")}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] font-display uppercase">
                    {isAr ? (bq.headingAr || "بوكينج كيوب™") : (bq.headingEn || "POWERED BY BOOKINGQUBE™")}
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed">
                    {isAr ? (bq.summaryAr || "منظومة إي ثري الذكية لإدارة التذاكر والتسجيل والتحكم بالبوابات وتحليلات الحشود") : (bq.summaryEn || "BookingQube is E3's intelligent ticketing, registration, gate access, and crowd analytics platform.")}
                  </p>
                </div>

                {/* Single Row 3-Column Grid for BookingQube Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {features.map((item: any) => {
                    const itemImg = item.imageUrl || item.mediaUrl;
                    return (
                      <InteractiveCard key={item.id} className="overflow-hidden p-6 flex flex-col justify-between h-full border border-[var(--border-level-2)] rounded-3xl bg-[var(--surface-default)] shadow-2xl space-y-4" glowColor="rgba(26, 31, 214, 0.3)">
                        <div className="space-y-4">
                          {/* Image Frame */}
                          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--border-level-2)] bg-gradient-to-br from-[var(--e3-deep-blue)] to-[var(--e3-midnight)] shrink-0 shadow-lg flex items-center justify-center">
                            {itemImg ? (
                              <img src={itemImg} alt={item.titleEn} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[var(--e3-royal-blue)]/10">
                                <Smartphone className="w-12 h-12 text-[var(--e3-royal-blue)]" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 font-display uppercase">
                              {isAr ? item.titleAr : item.titleEn}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium line-clamp-3">
                              {isAr ? item.descriptionAr : item.descriptionEn}
                            </p>
                          </div>
                        </div>

                        {/* Technical Details Popup Trigger Button */}
                        <button
                          onClick={() => setActiveBQModal(item)}
                          className="w-full py-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--e3-royal-blue)] text-[var(--text-primary)] hover:text-white border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] text-[11px] font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group mt-2"
                        >
                          <FileText className="w-3.5 h-3.5 text-[var(--e3-royal-blue)] group-hover:text-white transition-colors" />
                          <span>{isAr ? "تفاصيل التقنية" : "Technical Specifications"}</span>
                        </button>
                      </InteractiveCard>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        // 8. CONNECT GATEWAYS SECTION
        if (sectionKey === "connect" && content.connect?.enabled !== false) {
          const conn = content.connect || {};
          const items = Array.isArray(conn.items) ? conn.items : [];

          return (
            <section key="connect" id="connect" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--surface-default)]/40">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <span className="text-xs font-bold text-[var(--e3-magenta)] tracking-widest uppercase font-mono mb-2 block">
                    {isAr ? (conn.eyebrowAr || "فرص التعاون والشراكة") : (conn.eyebrowEn || "OPPORTUNITIES & COLLABORATION")}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4 font-display uppercase">
                    {isAr ? (conn.headingAr || "تواصل مع منظومة إي ثري") : (conn.headingEn || "CONNECT WITH THE E3 ECOSYSTEM")}
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm font-medium">
                    {isAr ? conn.descriptionAr : conn.descriptionEn}
                  </p>
                </div>

                {/* Single Row 3-Column Grid for Connect Gateways */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {items.map((item: any) => {
                    const cardImg = item.imageUrl || item.mediaUrl;
                    return (
                      <InteractiveCard key={item.id} className="overflow-hidden p-6 flex flex-col justify-between h-full border border-[var(--border-level-2)] rounded-3xl bg-[var(--surface-default)] shadow-2xl space-y-4" glowColor="rgba(26, 31, 214, 0.3)">
                        <div className="space-y-4">
                          {/* Image Frame Area */}
                          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--border-level-2)] bg-gradient-to-br from-[var(--e3-deep-blue)] to-[var(--e3-midnight)] shrink-0 shadow-lg flex items-center justify-center">
                            {cardImg ? (
                              <img src={cardImg} alt={item.titleEn} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[var(--e3-purple)]/20">
                                <Sparkles className="w-10 h-10 text-[var(--e3-purple)]" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                          </div>

                          <div>
                            <span className="text-[11px] font-mono font-bold text-[var(--e3-royal-blue)] uppercase block mb-1">
                              {isAr ? item.tabLabelAr : item.tabLabelEn}
                            </span>
                            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 font-display uppercase">
                              {isAr ? item.titleAr : item.titleEn}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium line-clamp-3">
                              {isAr ? item.descriptionAr : item.descriptionEn}
                            </p>
                          </div>
                        </div>

                        <a 
                          href={item.customUrl || "#"} 
                          className="w-full py-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] hover:border-[var(--e3-royal-blue)] hover:bg-[var(--e3-royal-blue)] hover:text-white transition-all text-center flex items-center justify-center gap-2 shadow-md group mt-2"
                        >
                          {isAr ? item.ctaLabelAr : item.ctaLabelEn}
                          <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                        </a>
                      </InteractiveCard>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        // 9. TRUSTED ACROSS QATAR
        if (sectionKey === "trustedAcrossQatar" && content.trustedAcrossQatar?.enabled !== false) {
          const taq = content.trustedAcrossQatar || {};
          const selPartners = (taq.selectedPartnerIds || []).map((id: string) => partnersMap.get(id)).filter(Boolean);
          const selClients = (taq.selectedClientIds || []).map((id: string) => clientsMap.get(id)).filter(Boolean);
          
          let displayLogos = [...selPartners, ...selClients];
          if (displayLogos.length === 0) {
            displayLogos = [...partners, ...clients];
          }

          const fallbackBrands = [
            "Visit Qatar", 
            "Qatar Airways", 
            "beIN Media Group", 
            "Katara Cultural Village", 
            "Ministry of Culture Qatar", 
            "Msheireb Properties", 
            "Lusail Real Estate",
            "Place Vendôme Mall",
            "Ezdan Mall",
            "Vodafone Qatar",
            "Qatar National Convention Centre"
          ];

          const itemsToDisplay = displayLogos.length > 0 ? displayLogos : fallbackBrands;

          return (
            <section key="trustedAcrossQatar" id="trustedAcrossQatar" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--bg-level-1)] overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 md:px-8 text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-black font-display uppercase tracking-tight text-[var(--text-primary)] mb-3">
                  {isAr ? (taq.headingAr || "شركاء النجاح في قطر") : (taq.headingEn || "TRUSTED ACROSS QATAR")}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] font-mono uppercase tracking-widest">
                  {isAr ? "الجهات الحكومية والعلامات التجارية الرائدة" : "Leading government entities & global brands across Qatar."}
                </p>
              </div>

              {/* Infinite Logo Marquee Ticker Reel */}
              <div className="relative w-full overflow-hidden py-4">
                {/* Edge gradient mask overlays */}
                <div className="absolute top-0 bottom-0 left-0 w-24 md:w-44 bg-gradient-to-r from-[var(--bg-level-1)] to-transparent z-20 pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-24 md:w-44 bg-gradient-to-l from-[var(--bg-level-1)] to-transparent z-20 pointer-events-none" />

                <div className="flex w-max overflow-hidden">
                  <motion.div
                    className="flex items-center gap-6 md:gap-8 shrink-0 pr-6 md:pr-8"
                    animate={{ x: isAr ? ["0%", "33.333%"] : ["0%", "-33.333%"] }}
                    transition={{
                      ease: "linear",
                      duration: 35,
                      repeat: Infinity,
                    }}
                  >
                    {[...itemsToDisplay, ...itemsToDisplay, ...itemsToDisplay].map((item: any, idx: number) => {
                      const logoUrl = typeof item === "object" ? (item.logoUrl || item.logo || item.imageUrl || item.mediaUrl) : null;
                      const brandName = typeof item === "string" ? item : (item.name || item.company || item.title);

                      return (
                        <div 
                          key={`${idx}-${brandName}`}
                          className="flex items-center justify-center px-6 py-4 rounded-2xl bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] shadow-xl hover:border-[var(--e3-royal-blue)] hover:bg-[var(--surface-hover)] transition-all duration-300 group shrink-0 min-w-[150px] md:min-w-[190px] h-16 md:h-20"
                        >
                          {logoUrl ? (
                            <img 
                              src={logoUrl} 
                              alt={brandName} 
                              className="h-8 md:h-10 w-auto max-w-[130px] md:max-w-[160px] object-contain grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300 filter drop-shadow" 
                            />
                          ) : (
                            <span className="font-mono font-extrabold text-xs md:text-sm text-[var(--text-primary)] group-hover:text-[var(--e3-royal-blue)] transition-colors whitespace-nowrap uppercase tracking-wider">
                              {brandName}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>
            </section>
          );
        }

        // 10. LATEST INSIGHTS & NEWS
        if (sectionKey === "latestInsights" && content.latestInsights?.enabled !== false) {
          const li = content.latestInsights || {};
          const displayList = insights.length > 0 ? insights.slice(0, li.maximumPosts || 3) : [
            {
              id: "ins-1",
              contentType: "PRESS RELEASE",
              titleEn: "E3 Unveils Record-Breaking Spatial Infrastructure in Lusail",
              titleAr: "إي ثري تدشن بنية تحتية مكانية قياسية في لوسيل",
              excerptEn: "Engineered for high-throughput guest flow with integrated BookingQube ticketing.",
              excerptAr: "صممت لاستيعاب التدفقات الجماهيرية مع ربط كامل بنظام بوكينج كيوب.",
              mediaUrl: ""
            },
            {
              id: "ins-2",
              contentType: "CASE STUDY",
              titleEn: "Guinness World Record Verification Case Study",
              titleAr: "دراسة حالة توثيق موسوعة جينيس للأرقام القياسية",
              excerptEn: "1,055 Metres obstacle engineering audited by international verifiers.",
              excerptAr: "تدقيق هندسي لمسار 1,055 متر بواسطة موثقي جينيس الدوليين.",
              mediaUrl: ""
            },
            {
              id: "ins-3",
              contentType: "TECH SPOTLIGHT",
              titleEn: "BookingQube: Sub-Second NFC & QR Gate Turnstiles",
              titleAr: "بوكينج كيوب: بوابات دخول ذكية وفحص فائقة السرعة",
              excerptEn: "Real-time crowd analytics and heatmaps for major events in Qatar.",
              excerptAr: "تحليلات الحشود والخرائط الحرارية الفورية للفعاليات الكبرى.",
              mediaUrl: ""
            }
          ];

          return (
            <section key="latestInsights" id="latestInsights" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--bg-level-2)]">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--e3-royal-blue)] mb-2 block">
                      {isAr ? (li.eyebrowAr || "الأخبار والرؤى") : (li.eyebrowEn || "E3 INSIGHTS & PRESS")}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] font-display uppercase">
                      {isAr ? (li.headingAr || "أحدث أخبار إي ثري") : (li.headingEn || "LATEST FROM E3")}
                    </h2>
                  </div>
                  <Link href={`/${locale}/b2c/insights`} className="text-xs font-bold uppercase text-[var(--e3-royal-blue)] flex items-center gap-1 hover:underline">
                    {isAr ? (li.ctaLabelAr || "استكشف كل الأخبار") : (li.ctaLabelEn || "Explore All Insights")}
                    <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {displayList.map((ins: any) => {
                    const postImg = ins.mediaUrl || ins.imageUrl || ins.coverImage;
                    return (
                      <InteractiveCard key={ins.id} className="overflow-hidden p-6 flex flex-col justify-between h-full border border-[var(--border-level-2)] rounded-3xl bg-[var(--surface-default)] shadow-2xl space-y-4" glowColor="rgba(26, 31, 214, 0.3)">
                        <div className="space-y-4">
                          {/* Image Frame Area */}
                          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--border-level-2)] bg-gradient-to-br from-[var(--e3-deep-blue)] to-[var(--e3-midnight)] shrink-0 shadow-lg flex items-center justify-center">
                            {postImg ? (
                              <img src={postImg} alt={ins.titleEn} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[var(--e3-royal-blue)]/20">
                                <Sparkles className="w-8 h-8 text-[var(--e3-royal-blue)]" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                          </div>

                          <div>
                            <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider mb-3 inline-block font-mono">
                              {ins.contentType}
                            </span>
                            <h3 className="font-extrabold text-base text-[var(--text-primary)] mb-2 line-clamp-2 uppercase font-display">
                              {isAr ? (ins.titleAr || ins.titleEn) : ins.titleEn}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed font-medium">
                              {isAr ? (ins.excerptAr || ins.excerptEn || ins.bodyEn?.slice(0, 120)) : (ins.excerptEn || ins.bodyEn?.slice(0, 120))}
                            </p>
                          </div>
                        </div>
                      </InteractiveCard>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        // 11. FINAL GATEWAY SECTION
        if (sectionKey === "finalGateway" && content.finalGateway?.enabled !== false) {
          const fg = content.finalGateway || {};
          const items = Array.isArray(fg.gatewayItems) ? fg.gatewayItems : [];

          return (
            <section key="finalGateway" id="finalGateway" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--e3-midnight)] text-center">
              <div className="max-w-5xl mx-auto px-4 md:px-8">
                <h2 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tight text-[var(--text-primary)] mb-6">
                  {isAr ? fg.headingAr : fg.headingEn || "Ready To Bring Your Experience To Life?"}
                </h2>
                <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto mb-12 font-medium">
                  {isAr ? fg.descriptionAr : fg.descriptionEn}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map((item: any) => (
                    <InteractiveCard key={item.id} className="p-8 text-center" glowColor="rgba(26, 31, 214, 0.4)">
                      <h3 className="text-xl font-bold font-display uppercase text-[var(--text-primary)] mb-3">
                        {isAr ? item.titleAr : item.titleEn}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] mb-6 font-medium">
                        {isAr ? item.descriptionAr : item.descriptionEn}
                      </p>
                      <a 
                        href={item.customUrl || "#"}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--e3-royal-blue)] to-[var(--e3-purple)] text-white font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform"
                      >
                        {isAr ? item.ctaLabelAr : item.ctaLabelEn}
                        <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                      </a>
                    </InteractiveCard>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}

      {/* Leadership Full Message Popup Modal */}
      {activeLeaderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn" onClick={() => setActiveLeaderModal(null)}>
          <div className="relative w-full max-w-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden text-left rtl:text-right space-y-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setActiveLeaderModal(null)}
              className="absolute top-6 right-6 rtl:left-6 rtl:right-auto p-2 rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-level-2)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-[var(--border-level-2)]">
              {activeLeaderModal.portrait ? (
                <img src={activeLeaderModal.portrait} alt={activeLeaderModal.name} className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-[var(--e3-royal-blue)] shadow-xl shrink-0" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-[var(--e3-royal-blue)]/20 border border-[var(--e3-royal-blue)] flex items-center justify-center font-bold text-3xl text-[var(--e3-royal-blue)] shrink-0">
                  {activeLeaderModal.name?.charAt(0) || "E3"}
                </div>
              )}
              <div className="space-y-1 text-center md:text-left rtl:md:text-right">
                <h3 className="text-2xl font-black text-[var(--text-primary)] font-display uppercase">{activeLeaderModal.name}</h3>
                <p className="text-sm font-mono font-bold text-[var(--e3-royal-blue)] uppercase tracking-wider">{activeLeaderModal.title}</p>
              </div>
            </div>

            {(activeLeaderModal.pullQuoteEn || activeLeaderModal.pullQuoteAr) && (
              <blockquote className="text-sm md:text-base font-semibold italic text-[var(--e3-royal-blue)] border-l-4 rtl:border-l-0 rtl:border-r-4 border-[var(--e3-royal-blue)] pl-4 rtl:pl-0 rtl:pr-4 py-2 bg-[var(--surface-hover)]/40 rounded-r-xl rtl:rounded-r-none rtl:rounded-l-xl">
                &ldquo;{isAr ? (activeLeaderModal.pullQuoteAr || activeLeaderModal.pullQuoteEn) : (activeLeaderModal.pullQuoteEn || activeLeaderModal.pullQuoteAr)}&rdquo;
              </blockquote>
            )}

            <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed font-medium whitespace-pre-line">
              {activeLeaderModal.fullMsgText}
            </div>

            <div className="pt-6 border-t border-[var(--border-level-2)] flex justify-end">
              <button
                onClick={() => setActiveLeaderModal(null)}
                className="px-6 py-2.5 rounded-xl bg-[var(--e3-royal-blue)] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BookingQube Technical Specifications Popup Modal */}
      {activeBQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn" onClick={() => setActiveBQModal(null)}>
          <div className="relative w-full max-w-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden text-left rtl:text-right space-y-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setActiveBQModal(null)}
              className="absolute top-6 right-6 rtl:left-6 rtl:right-auto p-2 rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-level-2)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 pb-4 border-b border-[var(--border-level-2)]">
              <div className="p-3 rounded-2xl bg-[var(--e3-royal-blue)]/20 border border-[var(--e3-royal-blue)]/40 text-[var(--e3-royal-blue)] shrink-0">
                <Smartphone className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[var(--e3-royal-blue)] uppercase tracking-wider block">BOOKINGQUBE™ ARCHITECTURE</span>
                <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)] font-display uppercase">
                  {isAr ? activeBQModal.titleAr : activeBQModal.titleEn}
                </h3>
              </div>
            </div>

            {(activeBQModal.imageUrl || activeBQModal.mediaUrl) && (
              <div className="relative w-full aspect-[16/9] max-h-[260px] rounded-2xl overflow-hidden border border-[var(--border-level-2)] shadow-xl">
                <img src={activeBQModal.imageUrl || activeBQModal.mediaUrl} alt={activeBQModal.titleEn} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                {isAr ? "نظرة عامة على المواصفات والقدرات" : "Platform Overview & Technical Capabilities"}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                {isAr ? (activeBQModal.detailedTextAr || activeBQModal.descriptionAr) : (activeBQModal.detailedTextEn || activeBQModal.descriptionEn)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--surface-hover)]/40 border border-[var(--border-level-2)]">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[var(--e3-royal-blue)] uppercase">LATENCY & VALIDATION</span>
                <p className="text-xs font-bold text-[var(--text-primary)]">Sub-200ms NFC & Offline Token Scanning</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[var(--e3-royal-blue)] uppercase">WALLET INTEGRATION</span>
                <p className="text-xs font-bold text-[var(--text-primary)]">Native Apple Wallet & Google Pass Sync</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[var(--e3-royal-blue)] uppercase">SECURITY PROTOCOL</span>
                <p className="text-xs font-bold text-[var(--text-primary)]">Dynamic Encrypted QR Code Anti-Screenshot</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[var(--e3-royal-blue)] uppercase">ANALYTICS ENGINE</span>
                <p className="text-xs font-bold text-[var(--text-primary)]">Real-Time Heatmaps & Density Telemetry</p>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-level-2)] flex justify-end">
              <button
                onClick={() => setActiveBQModal(null)}
                className="px-6 py-2.5 rounded-xl bg-[var(--e3-royal-blue)] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
