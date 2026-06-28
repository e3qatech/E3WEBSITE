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
            <div className="p-2 rounded-full bg-blue-500/20 text-blue-400 mt-0.5">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">New Lead: <span className="font-bold">{item.data.name}</span></p>
              <p className="text-xs text-white/50">{item.data.company}</p>
            </div>
          </div>
        )
      case 'ticket':
        return (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-green-500/20 text-green-400 mt-0.5">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">Ticket Sold</p>
              <p className="text-xs text-white/50">{item.data.quantity}x {item.data.ticketType}</p>
            </div>
          </div>
        )
      case 'feedback':
        return (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-yellow-500/20 text-yellow-400 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">New Feedback ({item.data.rating}/5)</p>
              <p className="text-xs text-white/50 line-clamp-1">{item.data.comment}</p>
            </div>
          </div>
        )
      case 'broadcast':
        return (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-400 mt-0.5">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">System Broadcast</p>
              <p className="text-xs text-white/50">{item.data.message}</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-default)] flex justify-between items-center bg-zinc-950/40">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00e676] animate-pulse' : 'bg-red-500'}`} />
          <h3 className="font-bold text-sm text-white">Live Feed</h3>
        </div>
        {!autoScroll && (
          <button 
            onClick={() => setAutoScroll(true)}
            className="text-[10px] uppercase font-bold text-[var(--color-primary)] hover:text-white transition-colors"
          >
            Resume Auto-Scroll
          </button>
        )}
      </div>

      {/* Connection Loss Warning */}
      {!isConnected && (
        <div className="bg-red-500/10 border-b border-red-500/20 p-2 flex items-center justify-center gap-2">
          <WifiOff className="w-3 h-3 text-red-400" />
          <span className="text-xs font-bold text-red-400">Reconnecting to live stream...</span>
        </div>
      )}

      {/* Feed List */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {feed.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center text-white/30 text-sm mt-10"
            >
              Waiting for live events...
            </motion.div>
          ) : (
            feed.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                className="bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  {renderFeedItem(item)}
                  <span className="text-[10px] text-white/30 whitespace-nowrap ml-2">
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
