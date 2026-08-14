"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Star, Send, MessageSquare, CheckCircle, Mail, Phone, MapPin, Sparkles } from "lucide-react"
import Link from "next/link"
import { localizeHref } from "@/lib/url-helper"

interface AttractionFeedbackContactSectionProps {
  attractionId: string
  attractionName: string
  locale?: string
}

export function AttractionFeedbackContactSection({
  attractionId,
  attractionName,
  locale = "en"
}: AttractionFeedbackContactSectionProps) {
  const isAr = locale === "ar"

  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [authorName, setAuthorName] = useState("")
  const [authorEmail, setAuthorEmail] = useState("")
  const [feedbackMsg, setFeedbackMsg] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorName.trim() || !feedbackMsg.trim()) return

    setIsSubmitting(true)

    try {
      // Submit feedback to API endpoint
      const res = await fetch("/api/b2c/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attractionId,
          attractionName,
          authorName,
          authorEmail,
          rating,
          comment: feedbackMsg,
          locale
        })
      }).catch(() => null)

      setSubmitted(true)
    } catch (err) {
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-24 bg-zinc-950 text-white relative border-t border-white/10 overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Accent Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-950/20 via-black to-black pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isAr ? "آراء الزوار والتواصل المباشر" : "FEEDBACK & INQUIRIES"}</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
            {isAr ? `تواصل معنا وشارك رأيك في ${attractionName}` : `Visitor Feedback & Contact`}
          </h2>
          <p className="text-sm md:text-base text-zinc-400 font-light">
            {isAr
              ? "ملاحظاتكم تطوّر تجاربنا. يسعدنا استقبال استفساراتكم وتقييماتكم المباشرة."
              : "Your experience drives our engineering. Share your thoughts or contact our support team."}
          </p>
        </div>

        {/* 2-Column Form & Quick Contact Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Feedback & Review Form (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-3xl p-8 sm:p-10 backdrop-blur-xl shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>{isAr ? "شارك تقييمك وتجربتك" : "Leave Your Review & Feedback"}</span>
              </h3>
              <span className="text-xs font-mono text-zinc-400">E3 VERIFIED</span>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in duration-500">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-2xl font-bold text-white">
                  {isAr ? "شكراً لمشاركتك!" : "Thank You for Your Feedback!"}
                </h4>
                <p className="text-sm text-zinc-400 font-light max-w-md mx-auto">
                  {isAr
                    ? "تم استلام تقييمك بنجاح وسيتم إدراجه ضمن تحسينات الوجهة التفاعلية."
                    : "Your review has been received. We appreciate your feedback to keep elevating our experiences."}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setFeedbackMsg("")
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white uppercase tracking-wider transition-all"
                >
                  {isAr ? "إرسال تقييم آخر" : "Submit Another Review"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Interactive Star Rating */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                    {isAr ? "تقييمك للتجربة" : "Your Experience Rating"}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                              : "text-zinc-600"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ms-3 text-xs font-mono font-bold text-amber-400">
                      {rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      {isAr ? "الاسم الكامل *" : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder={isAr ? "أدخل اسمك" : "e.g. Rashid Al-Kuwari"}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                    </label>
                    <input
                      type="email"
                      required
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder={isAr ? "البريد الإلكتروني" : "name@domain.qa"}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Feedback Comment Box */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    {isAr ? "تعليقك وانطباعك عن الوجهة *" : "Your Review & Comments *"}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={feedbackMsg}
                    onChange={(e) => setFeedbackMsg(e.target.value)}
                    placeholder={
                      isAr
                        ? "اكتب تفاصيل تجربتك وانطباعك المباشر..."
                        : "Describe what you enjoyed most about your visit..."
                    }
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-sm uppercase tracking-wider transition-all shadow-xl hover:scale-[1.01] cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isAr ? "إرسال التقييم" : "Submit Feedback"}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Right: Contact Us Direct Info (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-xl space-y-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight border-b border-white/10 pb-4">
                {isAr ? "معلومات التواصل المباشر" : "Direct Contact Info"}
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/80 border border-white/5">
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-zinc-400 block uppercase">
                      {isAr ? "الدعم والاستفسارات" : "Support Email"}
                    </span>
                    <a href="mailto:support@e3.qa" className="text-sm font-bold text-white hover:text-emerald-400 transition-colors">
                      support@e3.qa
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/80 border border-white/5">
                  <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-zinc-400 block uppercase">
                      {isAr ? "هاتف خدمة الزوار" : "Visitor Care Line"}
                    </span>
                    <a href="tel:+97444000000" className="text-sm font-bold text-white hover:text-sky-400 transition-colors font-mono">
                      +974 4400 0000
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/80 border border-white/5">
                  <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-zinc-400 block uppercase">
                      {isAr ? "المقر الرئيسي" : "Headquarters"}
                    </span>
                    <span className="text-xs font-bold text-white block">
                      {isAr ? "برج إي ثري، الدوحة، قطر" : "E3 Tower, West Bay, Doha, Qatar"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={localizeHref('/b2c/contact', locale)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-xs font-extrabold uppercase tracking-wider text-white transition-all cursor-pointer"
                >
                  <span>{isAr ? "صفحة التواصل الكاملة ↗" : "Full Contact Page ↗"}</span>
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
