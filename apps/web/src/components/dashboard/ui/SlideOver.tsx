"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface SlideOverProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function SlideOver({ isOpen, onClose, title, children }: SlideOverProps) {
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
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-50"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 end-0 w-full max-w-2xl bg-zinc-950/90 backdrop-blur-3xl shadow-2xl border-s border-zinc-800/50 z-50 flex flex-col"
          >
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="flex items-center justify-between p-6 border-b border-zinc-800/50 relative z-10">
              <h2 className="text-xl font-black text-[var(--text-primary)]">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-sg hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
