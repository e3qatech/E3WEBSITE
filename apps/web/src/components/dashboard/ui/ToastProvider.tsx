"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      <div className="fixed bottom-6 end-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 p-4 rounded-xl shadow-xl border min-w-[300px] ${
                t.type === "success" ? "bg-[var(--surface-default)] border-[var(--color-success)]" :
                t.type === "error" ? "bg-[var(--surface-default)] border-[var(--color-error)]" :
                "bg-[var(--surface-default)] border-[var(--border-default)]"
              }`}
            >
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />}
              {t.type === "error" && <XCircle className="w-5 h-5 text-[var(--color-error)]" />}
              {t.type === "info" && <Info className="w-5 h-5 text-[var(--color-primary)]" />}
              
              <span className="text-sm font-bold text-[var(--text-primary)] flex-1">{t.message}</span>
              
              <button 
                onClick={() => setToasts((prev) => prev.filter(x => x.id !== t.id))}
                className="p-1 hover:bg-[var(--surface-hover)] rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within a ToastProvider")
  return context
}
