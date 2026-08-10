"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Radio, Calendar, Ticket, ChevronRight } from 'lucide-react'

interface Act4LivingDayTimelineProps {
  content: any
  locale: string
}

export function Act4LivingDayTimeline({ content, locale }: Act4LivingDayTimelineProps) {
  const isAr = locale === 'ar'
  const [activeTab, setActiveTab] = useState<'NOW' | 'LATER' | 'SOON'>('NOW')

  // Real-time scheduled data
  const scheduleNow = [
    {
      id: "s1",
      titleEn: "Kids City Traffic License Exam",
      titleAr: "اختبار رخصة قيادة الأطفال",
      venueEn: "Doha Festival City",
      venueAr: "دوحة فستيفال سيتي",
      timeEn: "10:00 AM - 10:00 PM",
      timeAr: "١٠:٠٠ ص - ١٠:٠٠ م",
      statusEn: "Open Now",
      statusAr: "مفتوح الان",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      price: 65
    },
    {
      id: "s2",
      titleEn: "InflataPark Soft-Body Bounce",
      titleAr: "جلسات القفز في إنفلاتا بارك",
      venueEn: "Place Vendôme Mall",
      venueAr: "بلَاس فاندوم",
      timeEn: "12:00 PM - 11:00 PM",
      timeAr: "١٢:٠٠ م - ١١:٠٠ م",
      statusEn: "Open Now",
      statusAr: "مفتوح الان",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      price: 90
    }
  ]

  const scheduleLater = [
    {
      id: "s3",
      titleEn: "Urban Arena Paintless Laser Tournament",
      titleAr: "بطولة أوربان أرينا ليزر تاغ",
      venueEn: "West Bay Kinetic Dome",
      venueAr: "الخليج الغربي",
      timeEn: "06:00 PM - 09:00 PM",
      timeAr: "٠٦:٠٠ م - ٠٩:٠٠ م",
      statusEn: "Session at 6:00 PM",
      statusAr: "الجلسة الساعة ٠٦:٠٠ م",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      price: 110
    },
    {
      id: "s4",
      titleEn: "Doha Light & Kinetic Parade",
      titleAr: "عرض إي ثري الضوئي الاستعراضي",
      venueEn: "Al Rayyan Event Arena",
      venueAr: "ساحة الفعاليات بالريان",
      timeEn: "08:00 PM - 10:00 PM",
      timeAr: "٠٨:٠٠ م - ١٠:٠٠ م",
      statusEn: "Tonight 8 PM",
      statusAr: "الليلة الساعة ٠٨:٠٠ م",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      price: 150
    }
  ]

  const scheduleSoon = [
    {
      id: "s5",
      titleEn: "E3 International Winter Festival",
      titleAr: "مهرجان إي ثري الشتوي الدولي",
      venueEn: "Al Rayyan Grounds",
      venueAr: "ميدان الريان",
      timeEn: "Dec 15 - Jan 10",
      timeAr: "١٥ ديسمبر - ١٠ يناير",
      statusEn: "Coming Soon",
      statusAr: "قريباً",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      price: 120
    }
  ]

  const getList = () => {
    if (activeTab === 'NOW') return scheduleNow
    if (activeTab === 'LATER') return scheduleLater
    return scheduleSoon
  }

  return (
    <section id="living-day" className="relative py-24 bg-[#060212] text-white border-b border-purple-950/40 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,rgba(16,185,129,0.1),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{isAr ? "الفصل الرابع — جدول اليوم الحي" : "ACT IV — THE LIVING DAY"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {isAr ? "جدول فعاليات ووجهات اليوم" : "Today's Live Schedule & Timings"}
            </h2>
          </div>

          {/* Time Category Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('NOW')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'NOW' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? "مفتوح الآن" : "Happening Now"}
            </button>
            <button
              onClick={() => setActiveTab('LATER')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'LATER' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? "لاحقاً اليوم" : "Later Today"}
            </button>
            <button
              onClick={() => setActiveTab('SOON')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'SOON' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? "قريباً" : "Coming Soon"}
            </button>
          </div>
        </div>

        {/* Timeline Schedule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getList().map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 ${item.badgeColor}`}>
                    {isAr ? item.statusAr : item.statusEn}
                  </span>
                  <h3 className="text-xl font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                    {isAr ? item.titleAr : item.titleEn}
                  </h3>
                  <span className="text-xs text-slate-400 block mt-1">
                    📍 {isAr ? item.venueAr : item.venueEn}
                  </span>
                </div>

                <div className="text-end">
                  <span className="text-xs text-slate-400 block">{isAr ? "التذكرة" : "Ticket"}</span>
                  <span className="text-lg font-extrabold text-white">{item.price} QAR</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? item.timeAr : item.timeEn}</span>
                </div>

                <a
                  href="/b2c/tickets"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{isAr ? "احجز الآن" : "Book Ticket"}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
