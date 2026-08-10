"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Ticket, Sparkles, ArrowRight, Compass, Calendar, MapPin } from 'lucide-react'

interface Act7TactileTicketSceneProps {
  content: any
  locale: string
}

export function Act7TactileTicketScene({ content, locale }: Act7TactileTicketSceneProps) {
  const isAr = locale === 'ar'
  const ticketData = content?.act7Ticket || {}
  const secondaryActions = ticketData.secondaryActions || []

  return (
    <section className="relative py-32 bg-gradient-to-b from-[#090318] via-[#0f0624] to-[#04010a] text-white overflow-hidden">
      {/* Background Foil Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(16,185,129,0.18),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        {/* Header */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/50 text-emerald-400 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-lg shadow-emerald-950/50">
            <Ticket className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{isAr ? "الفصل السابع — اصنع قصتك اليوم" : "ACT VII — MAKE TODAY THE STORY"}</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {isAr ? (ticketData.headlineAr || "حكايتك القادمة بانتظارك.") : (ticketData.headlineEn || "Your next story is waiting.")}
          </h2>
          <p className="text-base sm:text-xl text-slate-300 font-light max-w-xl mx-auto leading-relaxed">
            {isAr
              ? (ticketData.subtextAr || "اختر تجربتك، احجز مكانك، واجعل من اليوم ذكرى لا تُنسى.")
              : (ticketData.subtextEn || "Choose an experience, book your place and turn today into a memory.")}
          </p>
        </div>

        {/* Tactile Digital Ticket Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-3xl mx-auto rounded-3xl border border-emerald-500/40 bg-slate-900/80 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl shadow-emerald-950/80 overflow-hidden text-start space-y-8 group"
        >
          {/* Hologram Foil Edge Effect */}
          <div className="absolute top-0 start-0 end-0 h-2 bg-gradient-to-r from-purple-500 via-emerald-400 to-sky-400" />

          {/* Ticket Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-xl border border-emerald-500/30">
                E3
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                  {isAr ? "تذكرة الشرف الرقمية" : "OFFICIAL DIGITAL PASS"}
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {isAr ? "تجارب إي ثري الترفيهية بقطر" : "E3 Qatar All-Access Pass"}
                </h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
              NO: QTR-2026-E3
            </span>
          </div>

          {/* Ticket Info & Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-medium block">
                {isAr ? "تشمل كافة الوجهات المغلقة والعروض الحية" : "Includes all flagship Qatar attractions & live shows"}
              </span>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? "حجز مباشر فورية ودخول سريع" : "Instant Digital Check-in Guaranteed"}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/b2c/tickets"
                className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
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
              href={action.url}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {idx === 0 ? <Compass className="w-3.5 h-3.5 text-emerald-400" /> : idx === 1 ? <Calendar className="w-3.5 h-3.5 text-sky-400" /> : <MapPin className="w-3.5 h-3.5 text-purple-400" />}
              <span>{isAr ? action.labelAr : action.labelEn}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
