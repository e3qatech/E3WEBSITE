"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboardFeed, FeedItem } from '@/hooks/useSocket'
import { UserPlus, Ticket, MessageSquare, Radio, WifiOff } from 'lucide-react'
import { format } from 'date-fns'

export type { FeedItem } from '@/hooks/useSocket'

export function LiveFeed({ initialItems = [] }: { initialItems?: FeedItem[] }) {
  const { feed, isConnected } = useDashboardFeed(initialItems)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Handle auto-scroll to top when new items arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [feed, autoScroll])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // If user scrolls down slightly, disable auto-scroll
    if (e.currentTarget.scrollTop > 50) {
      setAutoScroll(false)
    } else if (e.currentTarget.scrollTop === 0) {
      setAutoScroll(true)
    }
  }

  const renderFeedItem = (item: FeedItem) => {
    switch (item.type) {
      case 'lead':
        return (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-info)]/10 text-[var(--color-info)] mt-0.5 border border-[var(--color-info)]/20 shadow-sm">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-primary)] font-bold">New Lead: <span className="text-[var(--color-info)]">{item.data.name}</span></p>
              <p className="text-xs text-[var(--text-tertiary)] font-medium">{item.data.company}</p>
            </div>
          </div>
        )
      case 'ticket':
        return (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-success)]/10 text-[var(--color-success)] mt-0.5 border border-[var(--color-success)]/20 shadow-sm">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-primary)] font-bold">Ticket Sold</p>
              <p className="text-xs text-[var(--text-tertiary)] font-medium">{item.data.quantity}x {item.data.ticketType}</p>
            </div>
          </div>
        )
      case 'feedback':
        return (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-warning)]/10 text-[var(--color-warning)] mt-0.5 border border-[var(--color-warning)]/20 shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-primary)] font-bold">New Feedback ({item.data.rating}/5)</p>
              <p className="text-xs text-[var(--text-tertiary)] line-clamp-1 font-medium">{item.data.comment}</p>
            </div>
          </div>
        )
      case 'broadcast':
        return (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] mt-0.5 border border-[var(--color-primary)]/20 shadow-sm">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-primary)] font-bold">System Broadcast</p>
              <p className="text-xs text-[var(--text-tertiary)] font-medium">{item.data.message}</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full glass rounded-2xl border-gradient overflow-hidden relative shadow-lg">
      
      {/* Background ambient glow */}
      <div className="absolute top-0 end-0 w-64 h-64 bg-[var(--color-primary)]/5 blur-3xl rounded-full pointer-events-none" />

      {/* Header */}
      <div className="p-4 border-b border-[var(--border-level-2)] flex justify-between items-center bg-[var(--surface-default)]/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'}`}></span>
          </div>
          <h3 className="font-black text-sm text-[var(--text-primary)] uppercase tracking-wider">Live Action Feed</h3>
        </div>
        {!autoScroll && (
          <button 
            onClick={() => setAutoScroll(true)}
            className="text-[10px] uppercase font-black text-[var(--color-primary)] hover:text-gradient transition-all"
          >
            Resume Auto-Scroll
          </button>
        )}
      </div>

      {/* Connection Loss Warning */}
      {!isConnected && (
        <div className="bg-[var(--color-error)]/10 border-b border-[var(--color-error)]/20 p-2 flex items-center justify-center gap-2 relative z-10 backdrop-blur-md">
          <WifiOff className="w-3 h-3 text-[var(--color-error)]" />
          <span className="text-xs font-bold text-[var(--color-error)]">Reconnecting to live stream...</span>
        </div>
      )}

      {/* Feed List */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10"
      >
        <AnimatePresence initial={false}>
          {feed.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center text-[var(--text-tertiary)] text-sm mt-10 font-medium"
            >
              Awaiting live ecosystem events...
            </motion.div>
          ) : (
            feed.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -20, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                className="relative bg-[var(--surface-active)]/50 backdrop-blur-sm border border-[var(--border-level-1)] rounded-2xl p-4 hover:bg-[var(--surface-hover)] hover:shadow-md transition-all duration-300 group"
              >
                {/* Timeline decorative connector */}
                {index !== feed.length - 1 && (
                  <div className="absolute start-8 top-12 bottom-[-1rem] w-0.5 bg-gradient-to-b from-[var(--border-level-2)] to-transparent z-0 pointer-events-none" />
                )}
                
                <div className="relative z-10 flex justify-between items-start mb-1">
                  {renderFeedItem(item)}
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--bg-level-1)] px-2 py-1 rounded-md whitespace-nowrap ms-2 border border-[var(--border-level-1)]">
                    {format(item.timestamp, 'HH:mm:ss')}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
