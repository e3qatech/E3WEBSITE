"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, ArrowUpRight, Play, Sparkles } from 'lucide-react'
import { DEFAULT_CORE_TEAM, CoreTeamRecord } from '@/lib/cms-team'
import { E3ArrowHeroDevice } from './E3ArrowHeroDevice'

interface CoreTeamPeopleSectionProps {
  content?: any
  locale?: string
}

export function CoreTeamPeopleSection({ content, locale = 'en' }: CoreTeamPeopleSectionProps) {
  const isAr = locale === 'ar'
  const teamSectionData = content?.coreTeam || {}

  const heading = isAr
    ? (teamSectionData.headlineAr || "الفريق الذي يصنع التجربة")
    : (teamSectionData.headlineEn || "The people behind the experience")

  const subtext = isAr
    ? (teamSectionData.subtextAr || "المبدعون والمهندسون والمصممون القائمون على ابتكار وتشغيل وجهات إي ثري الترفيهية.")
    : (teamSectionData.subtextEn || "The visionary directors, spatial designers, and operational leaders bringing E3 experiences to life.")

  const teamMembers: CoreTeamRecord[] = teamSectionData.members && teamSectionData.members.length > 0
    ? teamSectionData.members
    : DEFAULT_CORE_TEAM

  const [activeMemberId, setActiveMemberId] = useState(teamMembers[0]?.id || DEFAULT_CORE_TEAM[0].id)
  const activeMember = teamMembers.find(m => m.id === activeMemberId) || teamMembers[0] || DEFAULT_CORE_TEAM[0]

  return (
    <section id="core-team" className="relative py-28 bg-[#060111] text-white border-b border-purple-950/40 overflow-hidden">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {teamMembers.map((member, idx) => {
            const isActive = member.id === activeMemberId
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
                    alt={member.nameEn}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isActive ? 'scale-105' : 'group-hover:scale-105 opacity-80'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>

                {/* Member Details */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
                    {isAr ? member.roleAr : member.roleEn}
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    {isAr ? member.nameAr : member.nameEn}
                  </h3>
                  <p className="text-xs text-slate-300 font-light line-clamp-3 leading-relaxed">
                    {isAr ? member.bioAr : member.bioEn}
                  </p>

                  {member.showProfileLink && (
                    <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-sky-400 group-hover:text-sky-300">
                      <span>{isAr ? (member.profileCtaLabelAr || "عرض الملف التفصيلي") : (member.profileCtaLabelEn || "View Profile")}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
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
