"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { SafePublicTeamMember } from "@/lib/team/team-resolver"

interface TeamGridProps {
  members: SafePublicTeamMember[]
  locale: string
}

export function TeamGrid({ members, locale }: TeamGridProps) {
  const isAr = locale === 'ar'
  const [activeDeptKey, setActiveDeptKey] = useState("all")

  // Extract unique departments dynamically with their localized labels
  const deptMap = new Map<string, string>()
  deptMap.set('all', isAr ? 'الكل' : 'All')

  members.forEach((m) => {
    if (m.departmentKey && m.department) {
      if (!deptMap.has(m.departmentKey)) {
        deptMap.set(m.departmentKey, m.department)
      }
    }
  })

  const departmentTabs = Array.from(deptMap.entries()).map(([key, label]) => ({
    key,
    label,
  }))

  const filteredMembers = activeDeptKey === "all"
    ? members
    : members.filter(m => m.departmentKey === activeDeptKey)

  return (
    <div className="w-full">
      {/* Department Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-16">
        {departmentTabs.map((dept) => (
          <button
            key={dept.key}
            onClick={() => setActiveDeptKey(dept.key)}
            className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold tracking-wide transition-all duration-300 ${
              activeDeptKey === dept.key
                ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20 scale-105'
                : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--surface-default)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
            }`}
          >
            {dept.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence>
          {filteredMembers.map((member) => (
            <motion.div
              layout
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="group [perspective:1000px]"
            >
              <div className="relative w-full aspect-[3/4] rounded-[2rem] [transform-style:preserve-3d] transition-transform duration-700 group-hover:[transform:rotateY(180deg)]">
                
                {/* FRONT */}
                <div className="absolute inset-0 [backface-visibility:hidden] bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-[2rem] p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-5 border-4 border-[var(--surface-default)] shadow-xl relative z-10 bg-[var(--surface-default)] flex items-center justify-center">
                    {member.profileImage ? (
                      <img 
                        src={member.profileImage} 
                        alt={member.name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-primary)] text-white flex items-center justify-center text-3xl font-black">
                        {member.initials}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full uppercase tracking-wider mb-3">
                    {member.department}
                  </span>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-1">
                    {member.name}
                  </h3>
                  <p className="text-xs md:text-sm font-bold text-[var(--text-secondary)]">
                    {member.designation}
                  </p>
                </div>

                {/* BACK */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[var(--color-primary)] text-white rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-between text-center">
                  <div>
                    <h3 className="text-lg md:text-xl font-black mb-1">
                      {member.name}
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-4">
                      {member.designation}
                    </p>
                    
                    {member.aboutSummary ? (
                      <p className="text-xs md:text-sm text-white/90 leading-relaxed line-clamp-4 mb-4">
                        {member.aboutSummary}
                      </p>
                    ) : (
                      <p className="text-xs md:text-sm text-white/80 leading-relaxed mb-4">
                        {member.department}
                      </p>
                    )}
                  </div>
                  
                  <div className="w-full flex flex-col items-center gap-3">
                    {member.linkedinUrl && (
                      <a 
                        href={member.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" 
                        aria-label="LinkedIn"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                      </a>
                    )}

                    <Link 
                      href={`/${locale}/b2b/team/${member.slug}`}
                      className="px-6 py-2 bg-white text-[var(--color-primary)] rounded-full font-bold text-xs md:text-sm hover:scale-105 transition-transform"
                    >
                      {isAr ? 'عرض الملف الشخصي' : 'View Profile'}
                    </Link>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
