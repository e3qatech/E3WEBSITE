"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Globe, LogIn } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useLocale } from "./LocaleProvider";
import { cn } from "@/lib/utils";

interface HeaderProps {
  portal: "b2c" | "b2b";
  lightLogoUrl?: string;
  darkLogoUrl?: string;
}

const navConfig = {
  b2c: [
    { label: "nav.discover", href: "/b2c/discover" },
    { label: "nav.attractions", href: "/b2c" },
    { label: "nav.events", href: "/b2c/calendar" },
    { label: "nav.contact", href: "/b2c/contact" },
  ],
  b2b: [
    { label: "nav.home", href: "/b2b" },
    { label: "nav.services", href: "/b2b/services" },
    { label: "nav.partners", href: "/b2b/partners" },
    { label: "nav.contact", href: "/contact" },
  ],
};

export function Header({ portal, lightLogoUrl, darkLogoUrl }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t, dir } = useLocale();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navItems = navConfig[portal] || navConfig.b2c;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 start-0 end-0 z-40 transition-all duration-300",
          scrolled 
            ? "bg-[var(--surface-default)]/80 backdrop-blur-md border-b border-[var(--border-level-2)] shadow-sm py-3" 
            : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-4">
            <Link href={`/${portal}`} className="relative z-50 flex items-center gap-2">
              {(lightLogoUrl || darkLogoUrl) ? (
                <img 
                  src={theme === "dark" ? (darkLogoUrl || lightLogoUrl) : (lightLogoUrl || darkLogoUrl)} 
                  alt="E3 Qatar Logo" 
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="8" fill="var(--color-primary)"/>
                  <path d="M12 20H28M12 14H28M12 26H20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              )}
            </Link>
            <Link 
              href={`/${portal === 'b2c' ? 'b2b' : 'b2c'}`}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider relative z-50 transition-colors border",
                portal === "b2c" 
                  ? "bg-transparent border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white" 
                  : "bg-transparent border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-white"
              )}
            >
              Switch to {portal === 'b2c' ? 'B2B' : 'B2C'}
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4 relative z-50">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button
              onClick={() => {
                const newLocale = locale === "en" ? "ar" : "en";
                setLocale(newLocale);
                // Also update the URL to reflect the new locale
                if (typeof window !== "undefined") {
                  const path = window.location.pathname;
                  const newPath = path.replace(`/${locale}`, `/${newLocale}`);
                  window.location.href = newPath;
                }
              }}
              className="flex items-center gap-1 p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors font-medium text-sm"
              aria-label="Toggle language"
            >
              <Globe size={18} />
              <span className="hidden sm:block">{locale === "en" ? "العربية" : "EN"}</span>
            </button>

            <Link
              href={`/auth/login?portal=${portal}`}
              className="hidden sm:flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full text-sm font-medium hover:brightness-110 transition-all"
            >
              <LogIn size={16} />
              {t("nav.login")}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-30 bg-[var(--bg-level-1)] pt-24 pb-8 px-6 flex flex-col md:hidden overflow-y-auto"
          >
            <nav className="flex flex-col gap-6 mt-8">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-bold text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {t(item.label)}
                  </Link>
                </motion.div>
              ))}
            </nav>
            
            <div className="mt-auto pt-8 border-t border-[var(--border-level-2)] flex flex-col gap-4">
              <Link
                href={`/auth/login?portal=${portal}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-4 py-3 rounded-xl text-base font-medium hover:brightness-110 transition-all w-full"
              >
                <LogIn size={18} />
                {t("nav.login")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
