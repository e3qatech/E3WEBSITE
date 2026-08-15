"use client"

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Sparkles, Pause, Play, ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react'
import { DEFAULT_SOCIAL_CHANNELS, DEFAULT_SOCIAL_POSTS, SocialChannelRecord, SocialPostRecord } from '@/lib/cms-social'

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

interface SocialFeedSectionProps {
  content?: any
  locale?: string
}

export function SocialFeedSection({ content, locale = 'en' }: SocialFeedSectionProps) {
  const isAr = locale === 'ar'
  const socialData = content?.socialFeed || {}

  const heading = isAr
    ? (socialData.headlineAr || "إي ثري الآن — جدار الذكريات الحي")
    : (socialData.headlineEn || "E3 Happening Now — Layered Memory Wall")

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
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const carouselContainerRef = useRef<HTMLDivElement>(null)

  const filteredPosts = activePlatform === 'ALL'
    ? posts.filter(p => p.isApproved && p.isVisible)
    : posts.filter(p => p.isApproved && p.isVisible && p.platform === activePlatform)

  // Scroll step navigation
  const scrollStep = (direction: 'left' | 'right') => {
    if (!carouselContainerRef.current) return
    const stepAmount = direction === 'left' ? -350 : 350
    carouselContainerRef.current.scrollBy({ left: isAr ? -stepAmount : stepAmount, behavior: 'smooth' })
  }

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollStep(isAr ? 'right' : 'left')
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollStep(isAr ? 'left' : 'right')
    } else if (e.key === ' ') {
      e.preventDefault()
      setIsPaused(prev => !prev)
    }
  }

  // Auto slow scroll when not paused
  useEffect(() => {
    if (isPaused || !carouselContainerRef.current) return

    const interval = setInterval(() => {
      if (!carouselContainerRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = carouselContainerRef.current
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        carouselContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        carouselContainerRef.current.scrollBy({ left: isAr ? -1 : 1, behavior: 'auto' })
      }
    }, 40)

    return () => clearInterval(interval)
  }, [isPaused, isAr])

  return (
    <section
      id="social-feed"
      className="relative py-28 bg-[var(--bg-level-1)] text-[var(--text-primary)] border-b border-[var(--border-level-2)] overflow-hidden transition-colors duration-300"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,72,153,0.08),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-[var(--border-level-2)] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-pink-500/30 bg-[var(--surface-default)] text-pink-600 dark:text-pink-400 text-xs font-bold uppercase tracking-widest mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>{isAr ? "جدار الذكريات التفاعلي — LIVE MEMORY WALL" : "LIVE MEMORY WALL — HAPPENING NOW"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {heading}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-light max-w-xl mt-2">
              {subtext}
            </p>
          </div>

          {/* Controls: Platform filter + Pause + Arrow Navigation */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter buttons */}
            <button
              onClick={() => setActivePlatform('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePlatform === 'ALL'
                  ? 'bg-pink-500 text-white font-extrabold shadow-md'
                  : 'bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isAr ? "الكل" : "All"}
            </button>
            {channels.map((ch) => (
              <a
                key={ch.id}
                href={ch.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-pink-500/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold transition-all shadow-sm"
              >
                {ch.platform === 'INSTAGRAM' ? <InstagramIcon className="w-3.5 h-3.5 text-pink-500" /> : <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />}
                <span>{ch.handle}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            ))}

            {/* Pause / Play Toggle & Manual Stepping Controls */}
            <div className="flex items-center gap-1 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl p-1 shadow-sm">
              <button
                onClick={() => scrollStep('left')}
                className="p-1.5 rounded-lg bg-[var(--surface-hover)] hover:bg-pink-500 hover:text-white text-[var(--text-secondary)] transition-colors cursor-pointer"
                title={isAr ? "السابق (مفتاح سهم اليسار)" : "Scroll Left (Left Arrow)"}
                aria-label="Scroll Left"
              >
                <ChevronLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={() => setIsPaused(p => !p)}
                className="p-1.5 rounded-lg bg-[var(--surface-hover)] hover:opacity-80 text-[var(--text-secondary)] transition-colors cursor-pointer"
                title={isPaused ? (isAr ? "تشغيل الحركة التلقائية (مسافة)" : "Resume Auto Scroll (Space)") : (isAr ? "إيقاف مؤقت (مسافة)" : "Pause Auto Scroll (Space)")}
                aria-label={isPaused ? "Resume auto scroll" : "Pause auto scroll"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> : <Pause className="w-3.5 h-3.5 text-[var(--text-secondary)]" />}
              </button>
              <button
                onClick={() => scrollStep('right')}
                className="p-1.5 rounded-lg bg-[var(--surface-hover)] hover:bg-pink-500 hover:text-white text-[var(--text-secondary)] transition-colors cursor-pointer"
                title={isAr ? "التالي (مفتاح سهم اليمين)" : "Scroll Right (Right Arrow)"}
                aria-label="Scroll Right"
              >
                <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Drag Hint Bar */}
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
          <MoveHorizontal className="w-4 h-4 text-pink-500 animate-pulse" />
          <span>{isAr ? "اسحب للتصفح أو استخدم مفاتيح الأسهم للتحكم في جدار الذكريات" : "Drag or use arrow keys to navigate the layered memory wall"}</span>
        </div>

        {/* Draggable Layered Memory Wall */}
        <div
          ref={carouselContainerRef}
          tabIndex={0}
          role="region"
          aria-label={isAr ? "جدار الذكريات الحي التفاعلي" : "Interactive live memory wall"}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 rounded-3xl"
        >
          {filteredPosts.map((post, idx) => (
            <motion.div
              key={post.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="flex-shrink-0 w-[300px] sm:w-[340px] rounded-3xl border border-[var(--border-level-2)] bg-[var(--surface-default)] overflow-hidden shadow-xl hover:border-pink-500/60 transition-all duration-300 group flex flex-col justify-between snap-center hover:-translate-y-1.5"
            >
              {/* Media Preview Container */}
              <div className="relative aspect-video bg-[var(--surface-hover)] overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)]/90 via-transparent to-transparent" />

                <div className="absolute top-3.5 start-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] text-[10px] font-mono font-bold text-pink-500 backdrop-blur-md shadow-sm">
                  {post.platform === 'INSTAGRAM' ? <InstagramIcon className="w-3 h-3" /> : <YoutubeIcon className="w-3 h-3 text-red-500" />}
                  <span>{post.platform}</span>
                </div>
              </div>

              {/* Caption & Profile Action */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed line-clamp-3">
                  {isAr ? post.captionAr : post.captionEn}
                </p>

                <div className="pt-3 border-t border-[var(--border-level-2)] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                    {new Date(post.postDate).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                  </span>
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline transition-colors"
                  >
                    <span>{isAr ? "مشاهدة المنشور" : "View Post"}</span>
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
