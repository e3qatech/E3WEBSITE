"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Sparkles, ArrowRight, Compass, Calendar, MapPin, ChevronDown, Check, Users } from 'lucide-react'
import { DEFAULT_ATTRACTION_WORLDS } from './ExperienceWorldsStage'
import { localizeHref } from '@/lib/url-helper'
import { cn } from '@/lib/utils'

interface TactileDigitalTicketProps {
  content: any
  locale: string
}

export function TactileDigitalTicket({ content, locale }: TactileDigitalTicketProps) {
  const isAr = locale === 'ar'
  const ticketData = content?.act7Ticket || {}
  const secondaryActions = ticketData.secondaryActions || [
    { labelEn: "Explore Map GIS", labelAr: "تصفح الخريطة التفاعلية", url: "/b2c/attractions#interactive-attractions-map" },
    { labelEn: "View Calendar Schedule", labelAr: "جدول الفعاليات والمواعيد", url: "/b2c/calendar" },
    { labelEn: "Browse All Attractions", labelAr: "استكشف كافة الوجهات", url: "/b2c/attractions" }
  ]

  const rawWorlds = content?.act3Worlds
  const worlds = (Array.isArray(rawWorlds) && rawWorlds.length > 0) ? rawWorlds : DEFAULT_ATTRACTION_WORLDS

  const [selectedWorldId, setSelectedWorldId] = useState(worlds[0]?.id || DEFAULT_ATTRACTION_WORLDS[0].id)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close custom dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const rawActiveWorld = worlds.find((w: any) => w.id === selectedWorldId || w.slug === selectedWorldId) || worlds[0] || DEFAULT_ATTRACTION_WORLDS[0]
  const fallback = DEFAULT_ATTRACTION_WORLDS[0]

  const activeWorld = {
    ...fallback,
    ...rawActiveWorld,
    nameEn: rawActiveWorld.nameEn || fallback.nameEn,
    nameAr: rawActiveWorld.nameAr || fallback.nameAr,
    taglineEn: rawActiveWorld.taglineEn || fallback.taglineEn,
    taglineAr: rawActiveWorld.taglineAr || fallback.taglineAr,
    locationEn: rawActiveWorld.locationEn || rawActiveWorld.locationNameEn || fallback.locationEn,
    locationAr: rawActiveWorld.locationAr || rawActiveWorld.locationNameAr || fallback.locationAr,
    audienceEn: rawActiveWorld.audienceEn || fallback.audienceEn || "All Ages",
    audienceAr: rawActiveWorld.audienceAr || fallback.audienceAr || "جميع الأعمار",
    price: rawActiveWorld.price || fallback.price || 45,
    currency: rawActiveWorld.currency || "QAR",
    accentColor: rawActiveWorld.accentColor || fallback.accentColor || "#10b981",
    ticketingUrl: rawActiveWorld.ticketingUrl || '/b2c/calendar'
  };

  const footerBgUrl = (
    ticketData.backgroundImage ||
    content?.cta?.backgroundImage ||
    content?.cta?.mediaUrl ||
    content?.footerMedia?.mediaUrl ||
    content?.footerMedia?.backgroundImage ||
    ""
  ).trim();

  return (
    <section className="relative py-32 bg-[var(--bg-level-1)] text-[var(--text-primary)] border-b border-[var(--border-level-2)] overflow-hidden transition-colors duration-300" dir={isAr ? "rtl" : "ltr"}>
      {/* Optional Background Media Backdrop */}
      {footerBgUrl && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={footerBgUrl}
            alt="Footer Background"
            className="w-full h-full object-cover opacity-15 dark:opacity-25 scale-105 filter blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-[var(--bg-level-1)]/70 to-[var(--bg-level-1)]" />
        </div>
      )}

      {/* Soft B2C Dimensional Portal Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(168,85,247,0.12),rgba(16,185,129,0.08)_45%,transparent_75%)] pointer-events-none" />

      {/* Subtle Portal Ring Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-purple-500/15 pointer-events-none opacity-40 blur-sm" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-emerald-500/20 pointer-events-none opacity-50 blur-xs" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        {/* Header */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-[var(--surface-default)] text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-lg shadow-emerald-500/10">
            <Ticket className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>{isAr ? "بوابة الخيال إلى الذاكرة — DIGITAL PORTAL PASS" : "FROM IMAGINATION TO MEMORY — DIGITAL PASS"}</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            {isAr ? (ticketData.headlineAr || "حكايتك القادمة بانتظارك.") : (ticketData.headlineEn || "Your next story is waiting.")}
          </h2>
          <p className="text-base sm:text-xl text-[var(--text-secondary)] font-light max-w-xl mx-auto leading-relaxed">
            {isAr
              ? (ticketData.subtextAr || "اختر تجربتك، احجز مكانك، واجعل من اليوم ذكرى لا تُنسى.")
              : (ticketData.subtextEn || "Choose an experience, book your place and turn today into a memory.")}
          </p>
        </div>

        {/* Soft B2C Portal Pass Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-3xl mx-auto rounded-3xl border border-[var(--border-level-2)] bg-[var(--surface-default)] backdrop-blur-2xl p-6 sm:p-10 shadow-2xl overflow-visible text-start space-y-8 group"
        >
          {/* Hologram Foil Edge Effect with dynamic accent gradient */}
          <div 
            className="absolute top-0 start-0 end-0 h-2 rounded-t-3xl transition-all duration-500"
            style={{
              background: `linear-gradient(90deg, #a855f7, ${activeWorld.accentColor || '#10b981'}, #38bdf8)`
            }}
          />

          {/* Ticket Header & Redesigned Experience Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-level-2)] pb-6">
            <div className="flex items-center gap-3.5">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border transition-colors shadow-sm"
                style={{
                  backgroundColor: `${activeWorld.accentColor || '#10b981'}18`,
                  borderColor: `${activeWorld.accentColor || '#10b981'}40`,
                  color: activeWorld.accentColor || '#10b981'
                }}
              >
                E3
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest block text-emerald-600 dark:text-emerald-400">
                    {isAr ? "تذكرة الشرف الرقمية" : "OFFICIAL DIGITAL PASS"}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface-active)] text-[var(--text-tertiary)] border border-[var(--border-level-1)]">
                    {activeWorld.slug ? `#${activeWorld.slug.split('-')[0]?.toUpperCase()}-2026` : "#E3-2026"}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight mt-0.5">
                  {isAr ? activeWorld.nameAr : activeWorld.nameEn}
                </h3>
              </div>
            </div>

            {/* Custom Interactive Experience Switcher Dropdown */}
            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] text-xs font-bold text-[var(--text-primary)] transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0" 
                    style={{ backgroundColor: activeWorld.accentColor || '#10b981' }}
                  />
                  <span className="text-[var(--text-secondary)] font-normal">
                    {isAr ? "تبديل الوجهة:" : "Experience:"}
                  </span>
                  <span className="font-extrabold text-[var(--text-primary)]">
                    {isAr ? activeWorld.nameAr : activeWorld.nameEn}
                  </span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200", isDropdownOpen && "rotate-180")} />
              </button>

              {/* Animated Glassmorphic Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute z-50 end-0 mt-2 w-full sm:w-80 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)]/95 backdrop-blur-xl p-2 shadow-2xl space-y-1 overflow-hidden"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border-level-1)] mb-1 flex items-center justify-between">
                      <span>{isAr ? "اختر الوجهة الترفيهية" : "Select Attraction World"}</span>
                      <span className="font-mono text-[var(--color-primary)]">{worlds.length} {isAr ? "وجهات" : "Available"}</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar">
                      {worlds.map((w: any) => {
                        const isSelected = (w.id === selectedWorldId || w.slug === selectedWorldId);
                        return (
                          <button
                            key={w.id || w.slug}
                            type="button"
                            onClick={() => {
                              setSelectedWorldId(w.id || w.slug);
                              setIsDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-2.5 rounded-xl text-start transition-all cursor-pointer group/item",
                              isSelected
                                ? "bg-[var(--surface-selected)] text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30 font-bold"
                                : "hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border"
                                style={{
                                  backgroundColor: `${w.accentColor || '#10b981'}15`,
                                  borderColor: `${w.accentColor || '#10b981'}30`,
                                  color: w.accentColor || '#10b981'
                                }}
                              >
                                {w.nameEn ? w.nameEn.charAt(0) : "E"}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                                  {isAr ? (w.nameAr || w.nameEn) : (w.nameEn || w.nameAr)}
                                </div>
                                <div className="text-[10px] text-[var(--text-tertiary)] truncate">
                                  {isAr ? (w.locationAr || w.locationEn) : (w.locationEn || w.locationAr)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ms-2">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--surface-active)] text-[var(--text-secondary)] border border-[var(--border-level-1)]">
                                {w.price ? `${w.price} QAR` : "PASS"}
                              </span>
                              {isSelected ? (
                                <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                              ) : (
                                <div className="w-4 h-4" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Experience Switcher Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] shrink-0 me-1">
              {isAr ? "الوجهات السريعة:" : "Quick Pass:"}
            </span>
            {worlds.map((w: any) => {
              const isSelected = (w.id === selectedWorldId || w.slug === selectedWorldId);
              return (
                <button
                  key={w.id || w.slug}
                  type="button"
                  onClick={() => setSelectedWorldId(w.id || w.slug)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border select-none",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 shadow-2xs"
                      : "border-[var(--border-level-1)] bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: w.accentColor || '#10b981' }}
                  />
                  <span>{isAr ? (w.nameAr || w.nameEn) : (w.nameEn || w.nameAr)}</span>
                </button>
              );
            })}
          </div>

          {/* Ticket Info & Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center pt-2">
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                &ldquo;{isAr ? activeWorld.taglineAr : activeWorld.taglineEn}&rdquo;
              </p>

              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs">
                <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isAr ? activeWorld.locationAr : activeWorld.locationEn}</span>
                </span>
                <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>{isAr ? activeWorld.audienceAr : activeWorld.audienceEn}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{isAr ? "حجز مباشر وتأكيد رقمي فوري" : "Instant Digital Booking Guaranteed"}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-end sm:justify-start gap-2 text-xs text-[var(--text-tertiary)]">
                <span>{isAr ? "سعر التذكرة:" : "Pass starting at:"}</span>
                <span className="text-lg font-black text-[var(--text-primary)] font-mono">
                  {activeWorld.price ? `${activeWorld.price} ${activeWorld.currency || 'QAR'}` : "Free Admission"}
                </span>
              </div>

              <Link
                href={localizeHref(activeWorld.ticketingUrl || '/b2c/calendar', locale)}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-white dark:text-slate-950 font-black text-base transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Ticket className="w-5 h-5" />
                <span>{isAr ? (ticketData.primaryCtaAr || "احجز تجربتك الآن") : (ticketData.primaryCtaEn || "Book an Experience")}</span>
                <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Secondary Exploration Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          {secondaryActions.map((action: any, idx: number) => (
            <Link
              key={idx}
              href={localizeHref(action.url, locale)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-sm"
            >
              {idx === 0 ? <Compass className="w-3.5 h-3.5 text-emerald-500" /> : idx === 1 ? <Calendar className="w-3.5 h-3.5 text-sky-500" /> : <MapPin className="w-3.5 h-3.5 text-purple-500" />}
              <span>{isAr ? action.labelAr : action.labelEn}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
