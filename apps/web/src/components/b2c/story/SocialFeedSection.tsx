 
"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Sparkles } from 'lucide-react'

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}
import { DEFAULT_SOCIAL_CHANNELS, DEFAULT_SOCIAL_POSTS, SocialChannelRecord, SocialPostRecord } from '@/lib/cms-social'

interface SocialFeedSectionProps {
  content?: any
  locale?: string
}

export function SocialFeedSection({ content, locale = 'en' }: SocialFeedSectionProps) {
  const isAr = locale === 'ar'
  const socialData = content?.socialFeed || {}

  const heading = isAr
    ? (socialData.headlineAr || "إي ثري الآن — لحظات حية مباشرة")
    : (socialData.headlineEn || "E3 Happening Now — Live Moments")

  const subtext = isAr
    ? (socialData.subtextAr || "تابع أحدث الفعاليات واللحظات الترفيهية الحية عبر حساباتنا الرسمية.")
    : (socialData.subtextEn || "Real-time moments, live event highlights, and guest stories streaming across official E3 channels.")

  const channels: SocialChannelRecord[] = socialData.channels && socialData.channels.length > 0
    ? socialData.channels
    : DEFAULT_SOCIAL_CHANNELS

  const posts: SocialPostRecord[] = socialData.posts && socialData.posts.length > 0
    ? socialData.posts
    : DEFAULT_SOCIAL_POSTS

  const [activePlatform, setActivePlatform] = useState<string>('ALL')

  const filteredPosts = activePlatform === 'ALL'
    ? posts.filter(p => p.isApproved && p.isVisible)
    : posts.filter(p => p.isApproved && p.isVisible && p.platform === activePlatform)

  return (
    <section id="social-feed" className="relative py-28 bg-[#050110] text-white border-b border-purple-950/40 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,72,153,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-pink-500/30 bg-pink-950/40 text-pink-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>{isAr ? "البث المباشر — E3 HAPPENING NOW" : "E3 HAPPENING NOW — LIVE FEED"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {heading}
            </h2>
            <p className="text-sm text-slate-300 font-light max-w-xl mt-2">
              {subtext}
            </p>
          </div>

          {/* Platform Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActivePlatform('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePlatform === 'ALL'
                  ? 'bg-pink-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? "الكل" : "All Feeds"}
            </button>
            {channels.map((ch) => (
              <a
                key={ch.id}
                href={ch.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/50 text-slate-300 hover:text-white text-xs font-bold transition-all"
              >
                {ch.platform === 'INSTAGRAM' ? <InstagramIcon className="w-3.5 h-3.5 text-pink-400" /> : <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />}
                <span>{ch.handle}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            ))}
          </div>
        </div>

        {/* Social Feed Editorial Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, idx) => (
            <motion.div
              key={post.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl hover:border-pink-500/50 transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Media Preview Container */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                {post.mediaType === 'VIDEO' ? (
                  <video
                    src={post.mediaUrl}
                    poster={post.posterUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={post.mediaUrl}
                    alt={post.captionEn}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                <div className="absolute top-4 start-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-[10px] font-mono font-bold text-pink-400 backdrop-blur-md">
                  {post.platform === 'INSTAGRAM' ? <InstagramIcon className="w-3 h-3" /> : <YoutubeIcon className="w-3 h-3 text-red-400" />}
                  <span>{post.platform}</span>
                </div>
              </div>

              {/* Caption & Profile Action */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-300 font-light leading-relaxed line-clamp-3">
                  {isAr ? post.captionAr : post.captionEn}
                </p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(post.postDate).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                  </span>
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    <span>{isAr ? "مشاهدة المنشور" : "View Original Post"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
