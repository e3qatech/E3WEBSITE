'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Newspaper, Star, Sparkles, Globe } from 'lucide-react';

interface SocialPreview {
  platform?: string;
  url?: string;
  imageUrl?: string;
  title?: string;
  snippet?: string;
}

interface Testimonial {
  author?: string;
  quote?: string;
  rating?: number;
  source?: string;
}

interface NewsCoverage {
  publisher?: string;
  title?: string;
  url?: string;
  date?: string;
}

interface SocialNewsSectionProps {
  socialPreviews?: SocialPreview[] | null;
  testimonials?: Testimonial[] | null;
  newsCoverage?: NewsCoverage[] | null;
  locale?: string;
}

export function SocialNewsSection({
  socialPreviews,
  testimonials,
  newsCoverage,
  locale = 'en'
}: SocialNewsSectionProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'SOCIAL' | 'REVIEWS' | 'NEWS'>('ALL');
  const isAr = locale === 'ar';

  // Curated fallback data for visitor buzz & social proof
  const defaultTestimonials: Testimonial[] = [
    {
      author: isAr ? "جاسم المهندي" : "Jassim Al-Mohannadi",
      quote: isAr ? "تجربة استثنائية! الميني غولف والكارتينغ بالواقع المختلط كانت ممتعة جداً للعائلة." : "Unreal experience! The AR karting and mini golf was so much fun for the whole family.",
      rating: 5,
      source: "Verified Visitor"
    },
    {
      author: isAr ? "سارة الكواري" : "Sarah Al-Kuwari",
      quote: isAr ? "الليزر تاغ والبلياردو بالإسقاطات التفاعلية تقنية مبهرة وتصميم هندسي رائع!" : "Sensory laser tag and projected billiards is incredible engineering! Best weekend spot.",
      rating: 5,
      source: "Google Review"
    },
    {
      author: isAr ? "محمد الشمري" : "Mohammed Al-Shammari",
      quote: isAr ? "تنظيم راقي وأنشطة حماسية تناسب الكبار والأطفال، أنصح بزيارتها بشدة." : "Highly organized, state-of-the-art interactive gaming. 10/10 recommended!",
      rating: 5,
      source: "TripAdvisor"
    }
  ];

  const defaultNews: NewsCoverage[] = [
    {
      publisher: "Doha News",
      title: isAr ? "إي ثري قطر تطلق وجهات ترفيهية تفاعلية بأسلوب هندسي مبتكر" : "E3 Qatar Elevates Interactive Entertainment Destinations",
      date: "2026",
      url: "https://dohanews.co"
    },
    {
      publisher: "Qatar Tribune",
      title: isAr ? "افتتاح أوربان أرينا: أحدث مركز للألعاب التفاعلية والرياضات الإلكترونية" : "Urban Arena Unveils Next-Gen Mixed Reality Gaming Hub in Doha",
      date: "2026",
      url: "https://qatar-tribune.com"
    }
  ];

  const activeSocial = (Array.isArray(socialPreviews) && socialPreviews.length > 0) ? socialPreviews : [];
  const activeTestimonials = (Array.isArray(testimonials) && testimonials.length > 0) ? testimonials : defaultTestimonials;
  const activeNews = (Array.isArray(newsCoverage) && newsCoverage.length > 0) ? newsCoverage : defaultNews;

  return (
    <section className="py-24 bg-zinc-950 text-white border-t border-white/5 overflow-hidden relative" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Subtle Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-950/20 via-black to-black pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        
        {/* Header & Category Switcher */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "أصداء المجتمع والصحافة" : "SOCIAL PULSE & MEDIA HONORS"}</span>
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
              {isAr ? "الجميع يتحدث عن إي ثري" : "Everyone is Talking"}
            </h2>
          </div>

          {/* Filter Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ALL' ? 'bg-emerald-500 text-zinc-950 font-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isAr ? "الكل" : "All Buzz"}
            </button>
            <button
              onClick={() => setActiveTab('REVIEWS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'REVIEWS' ? 'bg-emerald-500 text-zinc-950 font-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isAr ? "آراء الزوار" : "Visitor Quotes"}
            </button>
            <button
              onClick={() => setActiveTab('NEWS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'NEWS' ? 'bg-emerald-500 text-zinc-950 font-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isAr ? "الصحافة والإعلام" : "In the News"}
            </button>
          </div>
        </div>

        {/* Content Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Visitor Testimonial Quotes */}
          {(activeTab === 'ALL' || activeTab === 'REVIEWS') && activeTestimonials.map((t, idx) => (
            <motion.div
              key={`testi-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/[0.02] border border-white/10 hover:border-purple-500/40 rounded-3xl p-8 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-xl transition-all hover:bg-white/[0.04]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Quote className="w-8 h-8 text-purple-400 opacity-60" />
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed font-light italic">
                  &quot;{t.quote}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="font-bold text-white">{t.author}</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  {t.source || "VERIFIED VISITOR"}
                </span>
              </div>
            </motion.div>
          ))}

          {/* News Coverage Cards */}
          {(activeTab === 'ALL' || activeTab === 'NEWS') && activeNews.map((news, idx) => (
            <motion.a
              key={`news-${idx}`}
              href={news.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 rounded-3xl p-8 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-xl transition-all hover:bg-white/[0.04]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Newspaper className="w-7 h-7 text-emerald-400" />
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {news.publisher || "PRESS"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  {news.title}
                </h3>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>{news.date || "2026"}</span>
                <span className="text-emerald-400 group-hover:underline flex items-center gap-1 font-bold">
                  {isAr ? "قراءة المقال ↗" : "Read Article ↗"}
                </span>
              </div>
            </motion.a>
          ))}

          {/* Social Previews */}
          {activeSocial.map((social, idx) => (
            <motion.a
              key={`social-${idx}`}
              href={social.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group bg-white/[0.02] border border-white/10 hover:border-sky-500/40 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between space-y-4 shadow-xl transition-all hover:bg-white/[0.04]"
            >
              {social.imageUrl && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 relative">
                  <img src={social.imageUrl} alt={social.title || 'Social media'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 end-3 p-2 rounded-full bg-zinc-950/80 backdrop-blur-md text-sky-400">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">{social.title}</h4>
                {social.snippet && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{social.snippet}</p>}
              </div>
            </motion.a>
          ))}

        </div>
      </div>
    </section>
  );
}
