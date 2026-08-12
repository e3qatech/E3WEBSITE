"use client"

import { CoreTeamRecord, DEFAULT_CORE_TEAM } from '@/lib/cms-team'
import { motion } from 'framer-motion'
import { ArrowUpRight, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { E3ArrowHeroDevice } from './E3ArrowHeroDevice'
import { formatLocalizedText } from '@/lib/utils'

interface CoreTeamPeopleSectionProps {
  content?: any
  locale?: string
}

export function CoreTeamPeopleSection({ content, locale = 'en' }: CoreTeamPeopleSectionProps) {
  const isAr = locale === 'ar'
  const teamSectionData = content?.coreTeam || {}

  const [dbTeamMembers, setDbTeamMembers] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/team')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDbTeamMembers(data)
        }
      })
      .catch(console.error)
  }, [])

  const heading = formatLocalizedText(
    isAr
      ? (teamSectionData.headlineAr || "الفريق الذي يصنع التجربة")
      : (teamSectionData.headlineEn || "The people behind the experience"),
    locale
  )

  const subtext = formatLocalizedText(
    isAr
      ? (teamSectionData.subtextAr || "المبدعون والمهندسون والمصممون القائمون على ابتكار وتشغيل وجهات إي ثري الترفيهية.")
      : (teamSectionData.subtextEn || "The visionary directors, spatial designers, and operational leaders bringing E3 experiences to life."),
    locale
  )

  const hasExplicitSelection = (Array.isArray(teamSectionData.selectedMemberIds) && teamSectionData.selectedMemberIds.length > 0)
    || (Array.isArray(teamSectionData.members) && teamSectionData.members.length > 0)

  const selectedIds: string[] = Array.isArray(teamSectionData.selectedMemberIds) && teamSectionData.selectedMemberIds.length > 0
    ? teamSectionData.selectedMemberIds
    : (Array.isArray(teamSectionData.members) && teamSectionData.members.length > 0
        ? teamSectionData.members.map((m: any) => m.id)
        : [])

  // 1. Live selected members from database preserving selected order
  const liveSelectedMembers = (selectedIds.length > 0 && dbTeamMembers.length > 0)
    ? selectedIds
        .map(id => dbTeamMembers.find(m => m.id === id || m.slug === id))
        .filter(Boolean)
        .map(m => ({
          id: m.id,
          slug: m.slug || m.id,
          nameEn: `${m.firstName || ''} ${m.lastName || ''}`.trim() || "Team Member",
          nameAr: m.firstNameAr ? `${m.firstNameAr} ${m.lastNameAr || ''}`.trim() : `${m.firstName || ''} ${m.lastName || ''}`.trim(),
          roleEn: m.designation || "Executive",
          roleAr: m.designationAr || m.designation || "قيادي",
          bioEn: m.aboutSummary || m.tagline || "",
          bioAr: m.aboutSummaryAr || m.aboutSummary || m.tagline || "",
          portrait: m.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
          showProfileLink: true,
          profileCtaLabelEn: "View Profile",
          profileCtaLabelAr: "عرض الملف"
        }))
    : []

  // 2. CMS-saved members object fallback (when offline or before API loads)
  const cmsSavedMembers = Array.isArray(teamSectionData.members) && teamSectionData.members.length > 0
    ? teamSectionData.members.map((m: any) => ({
        id: m.id,
        slug: m.slug || m.id,
        nameEn: m.nameEn || `${m.firstName || ''} ${m.lastName || ''}`.trim() || "Team Member",
        nameAr: m.nameAr || (m.firstNameAr ? `${m.firstNameAr} ${m.lastNameAr || ''}`.trim() : m.nameEn),
        roleEn: m.roleEn || m.designation || "Executive",
        roleAr: m.roleAr || m.designationAr || m.roleEn || "قيادي",
        bioEn: m.bioEn || m.aboutSummary || m.tagline || "",
        bioAr: m.bioAr || m.aboutSummaryAr || m.bioEn || "",
        portrait: m.portrait || m.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
        showProfileLink: true,
        profileCtaLabelEn: "View Profile",
        profileCtaLabelAr: "عرض الملف"
      }))
    : []

  // 3. Fallback to DB members ONLY if no selection configuration exists in CMS
  const allDbMembersMapped = (!hasExplicitSelection && dbTeamMembers.length > 0)
    ? dbTeamMembers.map(m => ({
        id: m.id,
        slug: m.slug || m.id,
        nameEn: `${m.firstName || ''} ${m.lastName || ''}`.trim() || "Team Member",
        nameAr: m.firstNameAr ? `${m.firstNameAr} ${m.lastNameAr || ''}`.trim() : `${m.firstName || ''} ${m.lastName || ''}`.trim(),
        roleEn: m.designation || "Executive",
        roleAr: m.designationAr || m.designation || "قيادي",
        bioEn: m.aboutSummary || m.tagline || "",
        bioAr: m.aboutSummaryAr || m.aboutSummary || m.tagline || "",
        portrait: m.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
        showProfileLink: true,
        profileCtaLabelEn: "View Profile",
        profileCtaLabelAr: "عرض الملف"
      }))
    : []

  const teamMembers: CoreTeamRecord[] = liveSelectedMembers.length > 0
    ? liveSelectedMembers
    : (cmsSavedMembers.length > 0
        ? cmsSavedMembers
        : (hasExplicitSelection
            ? []
            : (allDbMembersMapped.length > 0 ? allDbMembersMapped : DEFAULT_CORE_TEAM)))

  const [activeMemberId, setActiveMemberId] = useState(teamMembers[0]?.id || DEFAULT_CORE_TEAM[0].id)

  useEffect(() => {
    if (teamMembers.length > 0 && !teamMembers.some(m => m.id === activeMemberId)) {
      setActiveMemberId(teamMembers[0].id)
    }
  }, [teamMembers, activeMemberId])

  if (teamMembers.length === 0) return null

  const activeMember = teamMembers.find(m => m.id === activeMemberId) || teamMembers[0] || DEFAULT_CORE_TEAM[0]

  return (
    <section id="core-team" className="relative py-28 bg-[#060111] text-white border-b border-purple-950/40 overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Project Footage / Glow Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        {activeMember.backgroundFootage && (
          <video
            src={activeMember.backgroundFootage}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter blur-md"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060111] via-[#060111]/70 to-[#060111]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? "صنّاع المتعة — CORE TEAM" : "CORE TEAM — HUMAN PROOF"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {heading}
            </h2>
            <p className="text-sm text-slate-300 font-light max-w-xl mt-2">
              {subtext}
            </p>
          </div>
        </div>

        {/* Editorial Portraits Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${teamMembers.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8 items-stretch`}>
          {teamMembers.map((member, _idx) => {
            const isActive = member.id === activeMemberId
            const memberName = formatLocalizedText(isAr ? member.nameAr : member.nameEn, locale)
            const memberRole = formatLocalizedText(isAr ? member.roleAr : member.roleEn, locale)
            const memberBio = formatLocalizedText(isAr ? member.bioAr : member.bioEn, locale)
            const ctaLabel = formatLocalizedText(isAr ? (member.profileCtaLabelAr || "عرض الملف التفصيلي") : (member.profileCtaLabelEn || "View Profile"), locale)

            return (
              <motion.div
                key={member.id}
                onMouseEnter={() => setActiveMemberId(member.id)}
                onClick={() => setActiveMemberId(member.id)}
                className={`relative rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col justify-between p-6 cursor-pointer group ${
                  isActive
                    ? 'border-purple-500 bg-purple-950/50 shadow-2xl shadow-purple-950/80 scale-105 z-10'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                {/* Connecting E3 Arrow Device */}
                {isActive && (
                  <div className="absolute top-4 end-4 z-20">
                    <E3ArrowHeroDevice variant="LIGHT_BEAM" accentColor="#a855f7" className="w-6 h-6" />
                  </div>
                )}

                {/* Portrait Image Stage */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 mb-4 border border-slate-800">
                  <img
                    src={member.portrait}
                    alt={memberName}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isActive ? 'scale-105' : 'group-hover:scale-105 opacity-80'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>

                {/* Member Details */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
                    {memberRole}
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    {memberName}
                  </h3>
                  <p className="text-xs text-slate-300 font-light line-clamp-3 leading-relaxed">
                    {memberBio}
                  </p>

                  {member.showProfileLink && (
                    <a href={`/${locale}/b2c/team/${member.slug || member.id}`} className="pt-2 flex items-center gap-1.5 text-xs font-bold text-sky-400 group-hover:text-sky-300">
                      <span>{ctaLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
