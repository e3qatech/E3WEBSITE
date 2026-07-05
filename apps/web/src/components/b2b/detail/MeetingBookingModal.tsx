"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { MeetingBookingForm } from "@/components/shared/MeetingBookingForm"

interface MeetingBookingModalProps {
  isOpen: boolean
  onClose: () => void
  locale: string
  serviceSlug: string
}

export function MeetingBookingModal({ isOpen, onClose, locale, serviceSlug }: MeetingBookingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[var(--surface-default)] rounded-3xl border border-[var(--border-default)] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-default)] bg-[var(--surface-hover)] shrink-0">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                {locale === 'ar' ? 'حجز موعد استشارة' : 'Book a Consultation'}
              </h3>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[var(--surface-default)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--color-primary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 overflow-y-auto">
              <MeetingBookingForm 
                locale={locale} 
                serviceSlug={serviceSlug} 
                onCancel={onClose} 
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
