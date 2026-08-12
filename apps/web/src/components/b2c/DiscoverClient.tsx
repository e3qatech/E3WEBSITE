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
  FileText
} from "lucide-react";

import { useB2CTheme } from "@/components/ui/B2CThemeComponents";
import { ImmersiveCanvas } from "@/components/ui/ImmersiveCanvas";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { B2CGrid } from "@/components/ui/B2CGrid";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";

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
        // 1. HERO SECTION
        if (sectionKey === "hero" && content.hero?.enabled !== false) {
          const hero = content.hero || {};
          return (
            <section key="hero" id="hero" className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
              <ImmersiveCanvas />
              
              <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6 max-w-4xl mx-auto"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs font-mono font-extrabold uppercase tracking-widest text-[var(--e3-royal-blue)]">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isAr ? "منظومة إي ثري الترفيهية" : "The E3 Qatar Ecosystem"}
                  </span>

                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase font-display leading-[1.05]">
                    <AnimatedText text={isAr ? hero.headlineAr : hero.headlineEn || "Transforming Spatial Ideas Into Living Landmarks"} />
                  </h1>

                  <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] font-medium max-w-2xl mx-auto leading-relaxed">
                    {isAr ? hero.subtextAr : hero.subtextEn}
                  </p>

                  {(hero.primaryCtaUrl || hero.primaryCtaLabelEn) && (
                    <div className="pt-4 flex justify-center gap-4">
                      <a
                        href={hero.primaryCtaUrl || "#about"}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--e3-royal-blue)] to-[var(--e3-purple)] text-white font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform"
                      >
                        {isAr ? (hero.primaryCtaLabelAr || "استكشف المنظومة") : (hero.primaryCtaLabelEn || "Explore Ecosystem")}
                        <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                      </a>
                    </div>
                  )}

                  {hero.mediaUrl && (
                    <div className="mt-8 rounded-2xl overflow-hidden border border-[var(--border-level-2)] max-w-3xl mx-auto shadow-2xl">
                      <UniversalMediaRenderer
                        src={hero.mediaUrl}
                        type={(hero.mediaType as any) || "IMAGE"}
                        alt={isAr ? hero.headlineAr : hero.headlineEn}
                        className="w-full h-[400px] object-cover"
                      />
                    </div>
                  )}
                </motion.div>
              </div>
            </section>
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
                    {isAr ? ldr.eyebrowAr : ldr.eyebrowEn || "LEADERSHIP PERSPECTIVES"}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4 font-display uppercase">
                    {isAr ? ldr.headingAr : ldr.headingEn || "Guided By Vision & Engineering Mastery"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {messages.map((msg: any) => {
                    const profile = msg.teamMemberId ? employeeProfileMap.get(msg.teamMemberId) : null;
                    const portrait = profile?.profileImage || msg.mediaOverrideUrl;
                    const name = profile ? `${profile.firstName} ${profile.lastName}` : (isAr ? msg.nameAr : msg.nameEn);
                    const title = profile?.designation || (isAr ? msg.messageTitleAr : msg.messageTitleEn);

                    return (
                      <InteractiveCard key={msg.id} className="p-8 flex flex-col justify-between" glowColor="rgba(26, 31, 214, 0.3)">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            {portrait ? (
                              <img src={portrait} alt={name} className="w-14 h-14 rounded-full object-cover border border-[var(--border-level-2)]" />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-[var(--e3-royal-blue)]/20 border border-[var(--e3-royal-blue)]/40 flex items-center justify-center font-bold text-lg text-[var(--e3-royal-blue)]">
                                {name?.charAt(0) || "E3"}
                              </div>
                            )}
                            <div>
                              <h3 className="font-extrabold text-base text-[var(--text-primary)]">{name}</h3>
                              <p className="text-xs text-[var(--text-secondary)] font-mono">{title}</p>
                            </div>
                          </div>

                          {msg.pullQuoteEn && (
                            <blockquote className="text-sm font-semibold italic text-[var(--e3-royal-blue)] border-l-2 border-[var(--e3-royal-blue)] pl-3 py-1">
                              &ldquo;{isAr ? msg.pullQuoteAr : msg.pullQuoteEn}&rdquo;
                            </blockquote>
                          )}

                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                            {isAr ? msg.fullMessageAr : msg.fullMessageEn}
                          </p>
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
                    {isAr ? vmv.sectionTitleAr : vmv.sectionTitleEn || "Our Core Spine"}
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
          // guinnessAllowed is the server-side 5-condition gate result passed as prop.
          // The client-side rec.brandingUsageApproved alone is NOT used to render the badge.
          const isGuinnessApproved = guinnessAllowed;

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
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--e3-royal-blue)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--e3-royal-blue)]/80 transition-colors"
                        >
                          {isAr ? rec.ctaLabelAr : rec.ctaLabelEn || "View Case Study"}
                          <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                        </a>
                      )}
                    </div>

                    <div className="text-center p-8 rounded-2xl bg-[var(--surface-default)]/30 border border-[var(--border-level-2)]">
                      <div className="text-6xl md:text-8xl font-black font-display text-[var(--e3-royal-blue)] mb-2 tracking-tighter">
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
          const _steps = Array.isArray(bq.journeySteps) ? bq.journeySteps : [];

          return (
            <section key="bookingQube" id="bookingQube" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--bg-level-1)]">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <span className="text-xs font-bold text-[var(--e3-royal-blue)] tracking-widest uppercase font-mono mb-2 block">
                    {isAr ? bq.eyebrowAr : bq.eyebrowEn || "PROPRIETARY ECOSYSTEM TECH"}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4 font-display uppercase">
                    {isAr ? bq.headingAr : bq.headingEn || "Powered By BookingQube™"}
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm font-medium">
                    {isAr ? bq.summaryAr : bq.summaryEn}
                  </p>
                </div>

                <B2CGrid columns={3} gap="lg" className="mb-16">
                  {features.map((item: any) => (
                    <InteractiveCard key={item.id} className="p-6" glowColor="rgba(26, 31, 214, 0.3)">
                      <Smartphone className="w-8 h-8 text-[var(--e3-royal-blue)] mb-4" />
                      <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 font-display uppercase">
                        {isAr ? item.titleAr : item.titleEn}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {isAr ? item.descriptionAr : item.descriptionEn}
                      </p>
                    </InteractiveCard>
                  ))}
                </B2CGrid>
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
                    {isAr ? conn.eyebrowAr : conn.eyebrowEn || "OPPORTUNITIES & COLLABORATION"}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4 font-display uppercase">
                    {isAr ? conn.headingAr : conn.headingEn || "Connect With The E3 Ecosystem"}
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm font-medium">
                    {isAr ? conn.descriptionAr : conn.descriptionEn}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {items.map((item: any) => (
                    <InteractiveCard key={item.id} className="p-8 flex flex-col justify-between" glowColor="rgba(26, 31, 214, 0.3)">
                      <div>
                        <span className="text-xs font-mono font-bold text-[var(--e3-royal-blue)] uppercase block mb-2">
                          {isAr ? item.tabLabelAr : item.tabLabelEn}
                        </span>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 font-display uppercase">
                          {isAr ? item.titleAr : item.titleEn}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6 font-medium">
                          {isAr ? item.descriptionAr : item.descriptionEn}
                        </p>
                      </div>

                      <a 
                        href={item.customUrl || "#"} 
                        className="w-full py-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] hover:border-[var(--e3-royal-blue)] transition-colors text-center flex items-center justify-center gap-2"
                      >
                        {isAr ? item.ctaLabelAr : item.ctaLabelEn}
                        <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                      </a>
                    </InteractiveCard>
                  ))}
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
          const displayLogos = [...selPartners, ...selClients];

          return (
            <section key="trustedAcrossQatar" id="trustedAcrossQatar" className="relative py-20 border-t border-[var(--border-level-2)] bg-[var(--bg-level-1)]">
              <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
                <h2 className="text-2xl md:text-4xl font-black font-display uppercase tracking-tight text-[var(--text-primary)] mb-8">
                  {isAr ? taq.headingAr : taq.headingEn || "Trusted Across Qatar"}
                </h2>

                {displayLogos.length > 0 ? (
                  <div className="flex flex-wrap items-center justify-center gap-8 opacity-80">
                    {displayLogos.map((item: any, i: number) => (
                      <div key={item.id || i} className="px-4 py-2 font-bold text-sm text-[var(--text-secondary)]">
                        {item.name || item.company}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-secondary)]">Leading government entities & global brands across Qatar.</p>
                )}
              </div>
            </section>
          );
        }

        // 10. LATEST INSIGHTS & NEWS
        if (sectionKey === "latestInsights" && content.latestInsights?.enabled !== false) {
          const li = content.latestInsights || {};
          const displayList = insights.length > 0 ? insights.slice(0, li.maximumPosts || 3) : [];

          return (
            <section key="latestInsights" id="latestInsights" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--bg-level-2)]">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--e3-royal-blue)] mb-2 block">
                      {isAr ? li.eyebrowAr : li.eyebrowEn || "E3 INSIGHTS & PRESS"}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] font-display uppercase">
                      {isAr ? li.headingAr : li.headingEn || "Latest From E3"}
                    </h2>
                  </div>
                  <Link href={`/${locale}/b2c/insights`} className="text-xs font-bold uppercase text-[var(--e3-royal-blue)] flex items-center gap-1">
                    {isAr ? li.ctaLabelAr : li.ctaLabelEn || "Explore All Insights"}
                    <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {displayList.map((ins: any) => (
                    <InteractiveCard key={ins.id} className="p-6 flex flex-col justify-between" glowColor="rgba(26, 31, 214, 0.3)">
                      <div>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider mb-3 inline-block">
                          {ins.contentType}
                        </span>
                        <h3 className="font-extrabold text-base text-[var(--text-primary)] mb-2 line-clamp-2">
                          {isAr ? ins.titleAr : ins.titleEn}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-3">
                          {isAr ? ins.excerptAr : ins.excerptEn || ins.bodyEn?.slice(0, 120)}
                        </p>
                      </div>
                    </InteractiveCard>
                  ))}
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
    </div>
  );
}
