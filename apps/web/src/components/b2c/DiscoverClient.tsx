"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Target, 
  Building, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  BarChart3, 
  Smartphone, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  ArrowRight, 
  Users, 
  Briefcase, 
  HelpCircle,
  Globe,
  Flame,
  Layers
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
  caseStudies = [],
  services = [],
  jobs = []
}: {
  locale: string;
  initialSettings: any;
  employeeProfiles?: any[];
  partners?: any[];
  clients?: any[];
  caseStudies?: any[];
  services?: any[];
  jobs?: any[];
}) {
  const isAr = locale === "ar";
  useB2CTheme();

  const [activeConnectTab, setActiveConnectTab] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
    "faqs",
    "finalGateway"
  ];

  // Helper map to match EmployeeProfiles to Leadership Messages
  const employeeProfileMap = new Map(employeeProfiles.map(e => [e.id, e]));

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
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-transparent to-[var(--bg-level-1)] pointer-events-none" />
              
              <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  {hero.eyebrowEn && (
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--e3-royal-blue)]/20 border border-[var(--e3-royal-blue)]/40 text-[var(--e3-royal-blue)] font-mono text-xs tracking-widest uppercase mb-6 font-bold">
                      {isAr ? hero.eyebrowAr : hero.eyebrowEn}
                    </span>
                  )}
                  
                  <AnimatedText 
                    as="h1" 
                    text={isAr ? hero.titleAr : hero.titleEn || "The Wow & The How"}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] via-[var(--e3-royal-blue)] to-[var(--e3-magenta)] font-display uppercase justify-center"
                  />

                  <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed font-medium mb-8">
                    {isAr ? hero.subtitleAr : hero.subtitleEn}
                  </p>

                  {hero.supportingTextEn && (
                    <p className="text-sm text-[var(--text-secondary)]/80 max-w-2xl mx-auto mb-10 font-mono">
                      {isAr ? hero.supportingTextAr : hero.supportingTextEn}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 justify-center">
                    {hero.primaryCta?.labelEn && (
                      <a 
                        href={hero.primaryCta.customUrl || "#about"} 
                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--e3-royal-blue)] to-[var(--e3-purple)] text-white font-bold text-sm tracking-wide uppercase shadow-[0_0_20px_rgba(26,31,214,0.4)] hover:scale-105 transition-all flex items-center gap-2"
                      >
                        {isAr ? hero.primaryCta.labelAr : hero.primaryCta.labelEn}
                        <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                      </a>
                    )}
                    {hero.secondaryCta?.labelEn && (
                      <a 
                        href={hero.secondaryCta.customUrl || "#leadership"} 
                        className="px-8 py-4 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)]/60 text-[var(--text-primary)] font-bold text-sm tracking-wide uppercase hover:bg-[var(--surface-hover)] transition-all"
                      >
                        {isAr ? hero.secondaryCta.labelAr : hero.secondaryCta.labelEn}
                      </a>
                    )}
                  </div>
                </motion.div>
              </div>
            </section>
          );
        }

        // 2. ABOUT E3 SECTION
        if (sectionKey === "about" && content.about?.enabled !== false) {
          const about = content.about || {};
          return (
            <section key="about" id="about" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--surface-default)]/40 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
                  <div>
                    <span className="text-xs font-bold text-[var(--e3-royal-blue)] tracking-widest uppercase font-mono mb-2 block">
                      {isAr ? about.eyebrowAr : about.eyebrowEn || "ABOUT E3"}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-6 font-display uppercase">
                      {isAr ? about.headingAr : about.headingEn || "Transforming Ideas Into Living Landmarks"}
                    </h2>
                    <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-6 font-medium">
                      {isAr ? about.summaryAr : about.summaryEn}
                    </p>
                    <p className="text-[var(--text-secondary)]/80 text-sm leading-relaxed mb-8">
                      {isAr ? about.fullStoryAr : about.fullStoryEn}
                    </p>

                    <div className="flex flex-wrap gap-6 items-center">
                      {about.establishedYear && (
                        <div className="px-4 py-2 rounded-xl bg-[var(--e3-midnight)] border border-[var(--e3-royal-blue)]/30 text-xs font-mono">
                          <span className="text-[var(--text-secondary)]">{isAr ? "سنة التأسيس: " : "Est. Year: "}</span>
                          <strong className="text-[var(--e3-royal-blue)] font-bold">{about.establishedYear}</strong>
                        </div>
                      )}
                      {about.headquartersEn && (
                        <div className="px-4 py-2 rounded-xl bg-[var(--e3-midnight)] border border-[var(--e3-purple)]/30 text-xs font-mono">
                          <span className="text-[var(--text-secondary)]">{isAr ? "المقر الرئيسي: " : "HQ: "}</span>
                          <strong className="text-[var(--e3-purple)] font-bold">{isAr ? about.headquartersAr : about.headquartersEn}</strong>
                        </div>
                      )}
                      {about.companyProfileFileUrl && (
                        <a 
                          href={about.companyProfileFileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-6 py-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] hover:border-[var(--e3-royal-blue)] transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4 text-[var(--e3-royal-blue)]" />
                          {isAr ? about.companyProfileLabelAr : about.companyProfileLabelEn || "Download Profile"}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Fact Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {Array.isArray(about.factItems) && about.factItems.map((fact: any) => (
                      <InteractiveCard key={fact.id} className="p-6 text-center" glowColor="rgba(26, 31, 214, 0.2)">
                        <div className="text-3xl md:text-4xl font-black font-display text-[var(--e3-royal-blue)] mb-2">
                          {fact.value}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
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
          const lead = content.leadership || {};
          const messages = Array.isArray(lead.messages) ? lead.messages : [];

          return (
            <section key="leadership" id="leadership" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--bg-level-1)]">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <span className="text-xs font-bold text-[var(--e3-magenta)] tracking-widest uppercase font-mono mb-2 block">
                    {isAr ? lead.eyebrowAr : lead.eyebrowEn || "LEADERSHIP PERSPECTIVES"}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4 font-display uppercase">
                    {isAr ? lead.headingAr : lead.headingEn || "Guided By Vision & Engineering Mastery"}
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm font-medium">
                    {isAr ? lead.introductionAr : lead.introductionEn}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {messages.map((msg: any) => {
                    const linkedProfile = msg.teamMemberId ? employeeProfileMap.get(msg.teamMemberId) : null;
                    const name = linkedProfile 
                      ? (isAr ? `${linkedProfile.firstNameAr || linkedProfile.firstName} ${linkedProfile.lastNameAr || linkedProfile.lastName}` : `${linkedProfile.firstName} ${linkedProfile.lastName}`)
                      : (isAr ? "قيادة إي ثري" : "E3 Leadership");
                    const role = linkedProfile 
                      ? (isAr ? linkedProfile.designationAr || linkedProfile.designation : linkedProfile.designation)
                      : (isAr ? msg.messageTitleAr : msg.messageTitleEn);

                    return (
                      <InteractiveCard key={msg.id} className="p-8 flex flex-col justify-between" glowColor="rgba(75, 0, 143, 0.3)">
                        <div>
                          <div className="flex items-center gap-4 mb-6">
                            {linkedProfile?.profileImage ? (
                              <img 
                                src={linkedProfile.profileImage} 
                                alt={name} 
                                className="w-14 h-14 rounded-full object-cover border-2 border-[var(--e3-royal-blue)]"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-[var(--e3-royal-blue)]/20 border border-[var(--e3-royal-blue)] flex items-center justify-center font-bold text-lg text-[var(--e3-royal-blue)]">
                                E3
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-bold text-[var(--text-primary)]">{name}</h3>
                              <p className="text-xs font-mono text-[var(--e3-royal-blue)] uppercase">{role}</p>
                            </div>
                          </div>

                          <blockquote className="text-base font-semibold italic text-[var(--text-primary)] mb-4 border-l-2 border-[var(--e3-royal-blue)] pl-4">
                            "{isAr ? msg.pullQuoteAr : msg.pullQuoteEn}"
                          </blockquote>

                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6 font-medium">
                            {isAr ? msg.fullMessageAr : msg.fullMessageEn}
                          </p>
                        </div>

                        {linkedProfile?.slug && (
                          <Link 
                            href={`/${locale}/b2c/team/${linkedProfile.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--e3-royal-blue)] hover:underline"
                          >
                            {isAr ? "عرض الملف الشخصي" : "View Full Profile"}
                            <ChevronRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                          </Link>
                        )}
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
          const isVerified = rec.verificationStatus === "VERIFIED";

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
                        {isVerified && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase flex items-center gap-1 border border-emerald-500/40">
                            <ShieldCheck className="w-3 h-3" /> Official Verified Record
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
                        {rec.measurementValue}
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
          const steps = Array.isArray(bq.journeySteps) ? bq.journeySteps : [];

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

                {/* Journey Flow */}
                <div className="p-8 rounded-2xl bg-[var(--surface-default)]/40 border border-[var(--border-level-2)]">
                  <h3 className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-6 text-center">
                    {isAr ? "مسار الزائر السلس" : "Seamless Guest Journey Flow"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    {steps.map((step: any) => (
                      <div key={step.id} className="space-y-2">
                        <div className="text-sm font-bold text-[var(--e3-royal-blue)] uppercase font-display">
                          {isAr ? step.titleAr : step.titleEn}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] font-medium">
                          {isAr ? step.descriptionAr : step.descriptionEn}
                        </p>
                      </div>
                    ))}
                  </div>
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

        // 11. FAQS SECTION
        if (sectionKey === "faqs" && content.faqs?.enabled !== false) {
          const faq = content.faqs || {};
          const faqsList = Array.isArray(faq.faqsList) ? faq.faqsList : [];

          return (
            <section key="faqs" id="faqs" className="relative py-24 border-t border-[var(--border-level-2)] bg-[var(--bg-level-1)]">
              <div className="max-w-4xl mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4 font-display uppercase">
                    {isAr ? faq.headingAr : faq.headingEn || "Frequently Asked Questions"}
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm font-medium">
                    {isAr ? faq.descriptionAr : faq.descriptionEn}
                  </p>
                </div>

                <div className="space-y-4">
                  {faqsList.map((item: any, index: number) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div key={item.id} className="rounded-xl bg-[var(--surface-default)]/60 border border-[var(--border-level-2)] overflow-hidden">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full p-5 text-left flex justify-between items-center gap-4 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                        >
                          <span>{isAr ? item.questionAr : item.questionEn}</span>
                          <span className="text-lg font-mono text-[var(--e3-royal-blue)]">{isOpen ? "−" : "+"}</span>
                        </button>
                        {isOpen && (
                          <div className="p-5 pt-0 text-xs text-[var(--text-secondary)] leading-relaxed font-medium border-t border-[var(--border-level-2)]/50 pt-4">
                            {isAr ? item.answerAr : item.answerEn}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        // 12. FINAL GATEWAY SECTION
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
