"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface SlideOverProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"
  hideHeader?: boolean
}

export function SlideOver({ isOpen, onClose, title = "Details", children, size = "3xl", hideHeader = false }: SlideOverProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const sizeClass = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  }[size] || "max-w-3xl"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md z-50"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed inset-y-0 end-0 w-full ${sizeClass} bg-zinc-950/95 backdrop-blur-3xl shadow-2xl border-s border-zinc-800/60 z-50 flex flex-col`}
          >
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            {!hideHeader && (
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60 relative z-10 shrink-0 bg-zinc-950/60 backdrop-blur-md">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close panel"
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
