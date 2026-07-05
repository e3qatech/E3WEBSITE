"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Briefcase, Check, ArrowRight } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { cn } from "@/lib/utils";

export function PortalSwitcher() {
  const router = useRouter();
  const { t } = useLocale();
  const [isVisible, setIsVisible] = React.useState(false);
  const [rememberChoice, setRememberChoice] = React.useState(true);

  React.useEffect(() => {
    // Check if the user has already made a choice
    const hasVisited = localStorage.getItem("e3_portal_choice");
    if (!hasVisited) {
      // Small delay to ensure smooth hydration before showing overlay
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelect = (portal: "b2c" | "b2b") => {
    if (rememberChoice) {
      localStorage.setItem("e3_portal_choice", portal);
    }
    // Also save that they've seen this overlay regardless
    localStorage.setItem("e3_has_visited", "true");
    
    setIsVisible(false);
    
    // Allow exit animation to play before routing
    setTimeout(() => {
      router.push(`/${portal}`);
    }, 400);
  };

  const handleSkip = () => {
    localStorage.setItem("e3_has_visited", "true");
    setIsVisible(false);
    setTimeout(() => {
      router.push("/b2c");
    }, 400);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[var(--bg-level-1)]/90 backdrop-blur-xl -z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 via-transparent to-[var(--color-secondary)]/10 -z-10" />
          
          <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] start-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-primary)]/5 blur-[100px] animate-pulse-glow" />
            <div className="absolute bottom-[-10%] end-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-secondary)]/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
            className="w-full max-w-4xl bg-[var(--surface-default)] rounded-3xl shadow-2xl border border-[var(--border-level-2)] overflow-hidden flex flex-col"
          >
            <div className="text-center pt-10 pb-6 px-6">
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
                Welcome to E3 Qatar
              </h1>
              <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
                Please select your destination to access the customized portal that best fits your needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8 pt-0">
              {/* B2C Option */}
              <button
                onClick={() => handleSelect("b2c")}
                className="group relative flex flex-col text-start bg-[var(--surface-active)] hover:bg-[var(--surface-hover)] border-2 border-transparent hover:border-[var(--color-primary)] rounded-2xl p-6 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 end-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 rtl:-translate-x-4 rtl:group-hover:translate-x-0">
                  <ArrowRight className="text-[var(--color-primary)] rtl:-scale-x-100" />
                </div>
                
                <div className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users size={28} />
                </div>
                
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Public Portal</h2>
                <p className="text-[var(--text-secondary)] text-sm mb-6 flex-1">
                  Discover upcoming events, book tickets, and explore entertainment options for you and your family.
                </p>
                
                <ul className="space-y-3 mt-auto">
                  {["Guinness-certified 1,055-meter inflatable", "BookingQube ticket processing", "Family entertainment & live events"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                      <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                        <Check size={12} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
              </button>

              {/* B2B Option */}
              <button
                onClick={() => handleSelect("b2b")}
                className="group relative flex flex-col text-start bg-[var(--surface-active)] hover:bg-[var(--surface-hover)] border-2 border-transparent hover:border-[var(--color-secondary)] rounded-2xl p-6 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 end-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 rtl:-translate-x-4 rtl:group-hover:translate-x-0">
                  <ArrowRight className="text-[var(--color-secondary)] rtl:-scale-x-100" />
                </div>
                
                <div className="w-14 h-14 rounded-xl bg-[var(--color-secondary)]/10 flex items-center justify-center text-[var(--color-secondary)] mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase size={28} />
                </div>
                
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Business Portal</h2>
                <p className="text-[var(--text-secondary)] text-sm mb-6 flex-1">
                  Access vendor services, partner programs, corporate bookings, and B2B specific resources.
                </p>
                
                <ul className="space-y-3 mt-auto">
                  {["WebXR placement controls", "End-to-end event engineering", "Vendor registration & partnerships"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                      <div className="w-5 h-5 rounded-full bg-[var(--color-secondary)]/10 flex items-center justify-center text-[var(--color-secondary)] shrink-0">
                        <Check size={12} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
              </button>
            </div>

            <div className="bg-[var(--surface-active)] p-4 md:px-8 border-t border-[var(--border-level-2)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-[var(--border-level-3)] bg-[var(--surface-default)] group-hover:border-[var(--color-primary)] transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberChoice}
                    onChange={(e) => setRememberChoice(e.target.checked)}
                    className="sr-only"
                  />
                  {rememberChoice && <Check size={14} className="text-[var(--color-primary)]" />}
                </div>
                <span className="text-sm text-[var(--text-secondary)] select-none group-hover:text-[var(--text-primary)] transition-colors">
                  Remember my choice
                </span>
              </label>
              
              <button
                onClick={handleSkip}
                className="text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
