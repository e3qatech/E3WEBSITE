"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, X, Megaphone } from "lucide-react"
import { useSocket } from "@/hooks/useSocket"

interface SystemBroadcastBannerProps {
  initialBroadcast?: {
    id: string
    titleEn: string
    messageEn: string
    type: string
  } | null
}

export function SystemBroadcastBanner({ initialBroadcast }: SystemBroadcastBannerProps) {
  const [broadcast, setBroadcast] = useState(initialBroadcast)
  const [isVisible, setIsVisible] = useState(!!initialBroadcast)
  const socket = useSocket('/dashboard')
  const [isConnected, setIsConnected] = useState(false)

  // Real-time broadcast updates
  useEffect(() => {
    if (!socket) return

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    const handleBroadcast = (data: { id: string, message: string }) => {
      setBroadcast({
        id: data.id,
        titleEn: "System Broadcast",
        messageEn: data.message,
        type: "INFO"
      })
      setIsVisible(true)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on("broadcast:active", handleBroadcast)

    if (socket.connected) handleConnect()

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off("broadcast:active", handleBroadcast)
    }
  }, [socket])

  if (!isVisible || !broadcast) return null

  // Map type to styles
  let bgColor = "bg-[var(--color-primary)]/10"
  let borderColor = "border-[var(--color-primary)]/20"
  let iconColor = "text-[var(--color-primary)]"
  
  if (broadcast.type === "WARNING") {
    bgColor = "bg-[var(--color-warning)]/10"
    borderColor = "border-[var(--color-warning)]/20"
    iconColor = "text-[var(--color-warning)]"
  } else if (broadcast.type === "CRITICAL") {
    bgColor = "bg-[var(--color-error)]/10"
    borderColor = "border-[var(--color-error)]/20"
    iconColor = "text-[var(--color-error)]"
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        className={`w-full ${bgColor} border-b ${borderColor} relative z-40 overflow-hidden`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-full bg-white/50 dark:bg-zinc-950/20 ${iconColor} animate-pulse`}>
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {broadcast.titleEn}
              </p>
              <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
                {broadcast.messageEn}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 rounded-full hover:bg-zinc-950/5 dark:hover:bg-white/5 text-[var(--text-tertiary)] transition-colors shrink-0"
            aria-label="Dismiss broadcast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
