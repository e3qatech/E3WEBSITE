"use client"

import { useEffect, useState } from "react"

interface Section {
  id: string
  labelEn: string
  labelAr: string
}

const SECTIONS: Section[] = [
  { id: "challenge", labelEn: "Challenge", labelAr: "التحدي" },
  { id: "solution", labelEn: "Solution", labelAr: "الحل" },
  { id: "results", labelEn: "Results", labelAr: "النتائج" },
  { id: "gallery", labelEn: "Gallery", labelAr: "المعرض" },
]

export function StickyNav({ locale }: { locale: string }) {
  const isRTL = locale === 'ar'
  const [activeSection, setActiveSection] = useState<string>("challenge")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: "-20% 0px -80% 0px" } // Trigger when section hits the upper 20% of screen
    )

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 100 // adjust for sticky header if any
      const y = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div className="sticky top-0 z-40 w-full bg-[var(--surface-default)]/80 backdrop-blur-md border-b border-[var(--border-default)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center justify-center sm:justify-start gap-4 sm:gap-8 overflow-x-auto py-4 scrollbar-hide">
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.id
            return (
              <li key={section.id} className="shrink-0">
                <button
                  onClick={() => scrollTo(section.id)}
                  className={`text-sm md:text-base font-bold uppercase tracking-wider transition-all duration-300 relative ${
                    isActive ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {isRTL ? section.labelAr : section.labelEn}
                  
                  {isActive && (
                    <span className="absolute -bottom-4 start-0 end-0 h-1 bg-[var(--color-primary)] rounded-t-full shadow-[0_0_10px_var(--color-primary)]" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
