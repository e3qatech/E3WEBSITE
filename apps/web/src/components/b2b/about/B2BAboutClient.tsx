"use client";

import React from "react";
import { ArrowRight, Sparkles, CheckCircle2, Award, Users, Building2, ShieldCheck, Compass } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import Link from "next/link";

export interface B2BAboutClientProps {
  cmsData: any;
  employeeProfiles: any[];
  locale: string;
}

export function B2BAboutClient({ cmsData, employeeProfiles, locale }: B2BAboutClientProps) {
  const isAr = locale === "ar";

  // 1. Header Section
  const header = cmsData?.header || {};
  const headerEyebrow = isAr ? (header.eyebrowAr || header.eyebrowEn) : (header.eyebrowEn || header.eyebrowAr);
  const headerTitle = isAr ? (header.titleAr || header.titleEn) : (header.titleEn || header.titleAr);
  const headerSubtitle = isAr ? (header.subtitleAr || header.subtitleEn) : (header.subtitleEn || header.subtitleAr);

  // 2. Corporate Story
  const story = cmsData?.story || {};
  const storyEyebrow = isAr ? (story.eyebrowAr || story.eyebrowEn) : (story.eyebrowEn || story.eyebrowAr);
  const storyTitle = isAr ? (story.titleAr || story.titleEn) : (story.titleEn || story.titleAr);
  const storyContent = isAr ? (story.contentAr || story.contentEn) : (story.contentEn || story.contentAr);
  const storyMediaUrl = story.mediaUrl || "";

  // 3. Stats & Scale
  const stats = cmsData?.stats || {};
  const statsEnabled = stats.enabled !== false;
  const statsEyebrow = isAr ? (stats.eyebrowAr || stats.eyebrowEn) : (stats.eyebrowEn || stats.eyebrowAr);
  const statsTitle = isAr ? (stats.titleAr || stats.titleEn) : (stats.titleEn || stats.titleAr);
  const statItems = Array.isArray(stats.items) ? stats.items : [];

  // 4. Core Values
  const rawValues = Array.isArray(cmsData?.values) ? cmsData.values : [];
  const values = rawValues.map((v: any) => ({
    title: isAr ? (v.titleAr || v.titleEn) : (v.titleEn || v.titleAr),
    desc: isAr ? (v.descAr || v.descEn) : (v.descEn || v.descAr),
  }));

  // 5. Leadership
  const leadershipConfig = cmsData?.leadership || {};
  const leadershipEnabled = leadershipConfig.enabled !== false;
  const leadershipEyebrow = isAr ? (leadershipConfig.eyebrowAr || leadershipConfig.eyebrowEn) : (leadershipConfig.eyebrowEn || leadershipConfig.eyebrowAr);
  const leadershipTitle = isAr ? (leadershipConfig.titleAr || leadershipConfig.titleEn) : (leadershipConfig.titleEn || leadershipConfig.titleAr);
  const leadershipSubtitle = isAr ? (leadershipConfig.subtitleAr || leadershipConfig.subtitleEn) : (leadershipConfig.subtitleEn || leadershipConfig.subtitleAr);

  const maxProfiles = Number(leadershipConfig.maxProfiles) || 6;
  const activeProfiles = (employeeProfiles || []).slice(0, maxProfiles);

  // 6. Bottom CTA
  const cta = cmsData?.cta || {};
  const ctaEnabled = cta.enabled !== false;
  const ctaEyebrow = isAr ? (cta.eyebrowAr || cta.eyebrowEn) : (cta.eyebrowEn || cta.eyebrowAr);
  const ctaHeadline = isAr ? (cta.headlineAr || cta.headlineEn) : (cta.headlineEn || cta.headlineAr);
  const ctaDesc = isAr ? (cta.descriptionAr || cta.descriptionEn) : (cta.descriptionEn || cta.descriptionAr);
  const primaryButtonText = isAr ? (cta.primaryCtaTextAr || cta.primaryCtaTextEn || "تقديم طلب عروض") : (cta.primaryCtaTextEn || cta.primaryCtaTextAr || "Submit RFP Inquiry");
  const secondaryButtonText = isAr ? (cta.secondaryCtaTextAr || cta.secondaryCtaTextEn || "استكشف دراسات الحالة") : (cta.secondaryCtaTextEn || cta.secondaryCtaTextAr || "Explore Case Studies");

  return (
    <div
      className="flex flex-col w-full min-h-screen bg-[var(--bg-level-1)] text-[var(--text-primary)] pt-20 transition-colors"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* 1. HERO HEADER SECTION */}
      <section className="relative min-h-[55vh] flex flex-col justify-center py-20 sm:py-28 md:py-32 border-b border-[var(--border-level-1)] overflow-hidden">
        {header.mediaUrl ? (
          <div className="absolute inset-0 z-0">
            <UniversalMediaRenderer
              type={(header.mediaType as any) || "IMAGE"}
              src={header.mediaUrl}
              alt="About Hero Background"
              poster={header.fallbackImageUrl}
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-[var(--bg-level-1)]/80 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-[var(--bg-level-2)]/40 pointer-events-none" />
        )}

        <div className="container relative z-10 mx-auto px-4 md:px-8">
          {headerEyebrow && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{headerEyebrow}</span>
            </div>
          )}

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-[var(--text-primary)] tracking-tight mb-6 max-w-4xl leading-[1.1]">
            {headerTitle}
          </h1>

          {headerSubtitle && (
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-3xl font-medium leading-relaxed">
              {headerSubtitle}
            </p>
          )}
        </div>
      </section>

      {/* 2. STATS & OPERATIONAL SCALE BAR */}
      {statsEnabled && statItems.length > 0 && (
        <section className="py-12 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)]">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {statItems.map((stat: any, idx: number) => {
                const label = isAr ? (stat.labelAr || stat.labelEn) : (stat.labelEn || stat.labelAr);
                return (
                  <div
                    key={stat.id || idx}
                    className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-center shadow-xs hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-500 font-mono tracking-tight mb-2">
                      {stat.prefix || ""}{stat.value}{stat.suffix || ""}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. THE CORPORATE STORY */}
      <section className="py-20 sm:py-28 md:py-32 border-b border-[var(--border-level-1)]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-center">
            <div className="md:col-span-7 space-y-6">
              {storyEyebrow && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest font-mono">
                  <Compass className="w-4 h-4" />
                  <span>{storyEyebrow}</span>
                </div>
              )}

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                {storyTitle}
              </h2>

              <div className="space-y-6 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-normal">
                {storyContent}
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="relative aspect-4/5 sm:aspect-square rounded-3xl overflow-hidden bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xl group">
                {storyMediaUrl ? (
                  <UniversalMediaRenderer
                    type={(story.mediaType as any) || "IMAGE"}
                    src={storyMediaUrl}
                    alt={storyTitle || "E3 Corporate Story"}
                    poster={story.fallbackImageUrl}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 p-8 text-center">
                    <Building2 className="w-16 h-16 text-emerald-500/40 mb-4" />
                    <span className="text-2xl font-black text-white font-mono tracking-widest">E3 QATAR</span>
                    <span className="text-xs text-zinc-400 mt-2 uppercase tracking-widest">Event Engineering & Entertainment</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE VALUES SECTION */}
      {values.length > 0 && (
        <section className="py-20 sm:py-28 md:py-32 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)]">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs uppercase tracking-widest mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAr ? "قيمنا ومبادئنا" : "CORE PRINCIPLES"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">
                {isAr ? "الركائز الأساسية التي تقود أعمالنا" : "Our Guiding Values & Operational DNA"}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {values.map((val: any, i: number) => (
                <div
                  key={i}
                  className="p-8 sm:p-10 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-sm hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-black text-2xl mb-8 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      0{i + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
                      {val.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. LEADERSHIP & EXECUTIVE TEAM */}
      {leadershipEnabled && activeProfiles.length > 0 && (
        <section className="py-20 sm:py-28 md:py-32 border-b border-[var(--border-level-1)]">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-3xl mb-16">
              {leadershipEyebrow && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs uppercase tracking-widest mb-4">
                  <Users className="w-3.5 h-3.5" />
                  <span>{leadershipEyebrow}</span>
                </div>
              )}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-4">
                {leadershipTitle}
              </h2>
              {leadershipSubtitle && (
                <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                  {leadershipSubtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeProfiles.map((leader, i) => {
                const fullName = isAr
                  ? `${leader.firstNameAr || leader.firstName || ""} ${leader.lastNameAr || leader.lastName || ""}`.trim()
                  : `${leader.firstName || ""} ${leader.lastName || ""}`.trim();
                const designation = isAr
                  ? leader.designationAr || leader.designation || "قيادي تنفيذي"
                  : leader.designation || "Executive Leader";

                return (
                  <div
                    key={leader.id || i}
                    className="group rounded-3xl overflow-hidden bg-[var(--surface-default)] border border-[var(--border-level-2)] p-4 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-500"
                  >
                    <div className="aspect-3/4 bg-[var(--bg-level-2)] rounded-2xl overflow-hidden mb-6 relative">
                      {leader.profileImage ? (
                        <UniversalMediaRenderer
                          type="IMAGE"
                          src={leader.profileImage}
                          alt={fullName}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600">
                          <Users className="w-16 h-16 mb-2" />
                          <span className="text-xs font-mono">E3 LEADERSHIP</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="px-2 pb-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1 group-hover:text-emerald-500 transition-colors">
                        {fullName}
                      </h3>
                      <div className="text-emerald-500 font-bold uppercase tracking-widest text-xs sm:text-sm">
                        {designation}
                      </div>
                      {leader.department && (
                        <div className="text-xs text-[var(--text-tertiary)] mt-1">
                          {leader.department}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 6. BOTTOM PARTNERSHIP CTA */}
      {ctaEnabled && (
        <section className="py-24 bg-gradient-to-b from-[var(--bg-level-1)] to-[var(--bg-level-2)] relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-8 relative z-10 text-center max-w-4xl mx-auto">
            {ctaEyebrow && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs uppercase tracking-widest mb-6">
                <span>{ctaEyebrow}</span>
              </div>
            )}

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight mb-6 leading-tight">
              {ctaHeadline}
            </h2>

            {ctaDesc && (
              <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-10 leading-relaxed max-w-2xl mx-auto">
                {ctaDesc}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={cta.primaryCtaUrl ? `/${locale}${cta.primaryCtaUrl}` : `/${locale}/b2b/contact`}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-base hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                <span>{primaryButtonText}</span>
                <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
              </Link>

              {secondaryButtonText && (
                <Link
                  href={cta.secondaryCtaUrl ? `/${locale}${cta.secondaryCtaUrl}` : `/${locale}/b2b/cases`}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)] text-[var(--text-primary)] font-bold text-base hover:bg-[var(--surface-hover)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{secondaryButtonText}</span>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
