"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Mail } from "lucide-react"

export interface TeamMember {
  id: string
  slug: string
  name: Record<string, string>
  designation: Record<string, string>
  department: string
  profilePhoto: string
  bioExcerpt: Record<string, string>
  socialLinks?: {
    linkedin?: string
    twitter?: string
    email?: string
  }
}

interface TeamGridProps {
  members: TeamMember[]
  locale: string
}

const DEPARTMENTS = ["All", "Management", "Creative", "Technical", "Operations", "Sales"]

export function TeamGrid({ members, locale }: TeamGridProps) {
  const [activeDept, setActiveDept] = useState("All")

  const filteredMembers = activeDept === "All" 
    ? members 
    : members.filter(m => m.department === activeDept)

  return (
    <div className="w-full">
      {/* Department Filters */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept}
            onClick={() => setActiveDept(dept)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
              activeDept === dept
                ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20 scale-105'
                : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--surface-default)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
            }`}
          >
            {dept === "All" && locale === "ar" ? "الكل" : dept}
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
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-[var(--surface-default)] shadow-xl relative z-10">
                    <img 
                      src={member.profilePhoto} 
                      alt={member.name.en} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full uppercase tracking-wider mb-4">
                    {member.department}
                  </span>
                  <h3 className="text-2xl font-black text-[var(--text-primary)] mb-1">
                    {member.name[locale] || member.name.en}
                  </h3>
                  <p className="text-sm font-bold text-[var(--text-secondary)]">
                    {member.designation[locale] || member.designation.en}
                  </p>
                </div>

                {/* BACK */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[var(--color-primary)] text-white rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
                  <h3 className="text-xl font-black mb-1">
                    {member.name[locale] || member.name.en}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-6">
                    {member.designation[locale] || member.designation.en}
                  </p>
                  
                  <p className="text-sm text-white/90 leading-relaxed mb-8 line-clamp-4">
                    {member.bioExcerpt[locale] || member.bioExcerpt.en}
                  </p>
                  
                  <div className="flex gap-4 mb-8">
                    {member.socialLinks?.linkedin && (
                      <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-[var(--color-primary)] rounded-full text-white transition-colors" aria-label="LinkedIn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                      </a>
                    )}
                    {member.socialLinks?.twitter && (
                      <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-[var(--color-primary)] rounded-full text-white transition-colors" aria-label="Twitter">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                      </a>
                    )}
                    {member.socialLinks?.email && (
                      <a href={`mailto:${member.socialLinks.email}`} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-[var(--color-primary)] transition-colors">
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                  </div>

                  <Link 
                    href={`/${locale}/b2b/team/${member.slug}`}
                    className="px-6 py-2 bg-white text-[var(--color-primary)] rounded-full font-bold text-sm hover:scale-105 transition-transform"
                  >
                    {locale === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}
                  </Link>
                </div>

              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
