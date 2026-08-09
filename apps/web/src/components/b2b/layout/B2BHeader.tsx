"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, Globe, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

import { PulseOrbitDropdown } from '@/components/b2c/nav/PulseOrbitDropdown';
import { HeaderAuthControls } from '@/components/auth/HeaderAuthControls';

export function B2BHeader({ settings = {} }: { settings?: Record<string, string> }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname() || ""
  
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark')

  const isAr = pathname.startsWith('/ar') || (typeof document !== 'undefined' && document.cookie.includes('NEXT_LOCALE=ar'))
  const currentLocale = isAr ? 'ar' : 'en'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const toggleLanguage = () => {
    const targetLocale = isAr ? 'en' : 'ar'
    document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`
    if (typeof document !== 'undefined') {
      document.documentElement.dir = targetLocale === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = targetLocale
    }
    
    let newPath = pathname
    if (pathname.startsWith('/ar/')) {
      newPath = pathname.replace('/ar/', `/${targetLocale}/`)
    } else if (pathname.startsWith('/en/')) {
      newPath = pathname.replace('/en/', `/${targetLocale}/`)
    } else if (pathname === '/ar' || pathname === '/en') {
      newPath = `/${targetLocale}/b2b`
    } else {
      newPath = `/${targetLocale}${pathname}`
    }
    window.location.href = newPath
  }

  const b2bNavLinks = [
    { label: isAr ? 'الرئيسية' : 'Home', href: `/${currentLocale}/b2b` },
    { label: isAr ? 'الخدمات' : 'Services', href: `/${currentLocale}/b2b/services` },
    { label: isAr ? 'أعمالنا' : 'Case Studies', href: `/${currentLocale}/b2b/case-studies` },
    { label: isAr ? 'العملاء والشركاء' : 'Clients', href: `/${currentLocale}/b2b/clients` },
    { label: isAr ? 'من نحن' : 'About', href: `/${currentLocale}/b2b/about` },
    { label: isAr ? 'تواصل معنا' : 'Contact', href: `/${currentLocale}/b2b/contact` }
  ]

  const lightLogoUrl = settings.lightLogoUrl;
  const darkLogoUrl = settings.darkLogoUrl;
  const siteName = isAr ? (settings.siteNameAr || "إي ثري للشركات") : (settings.siteNameEn || "E3 Corporate");

  return (
    <header
      data-portal="b2b"
      className={cn(
        "fixed top-0 start-0 end-0 z-50 transition-all duration-300 border-b h-20 flex items-center",
        isScrolled
          ? "bg-[var(--surface-default)]/90 backdrop-blur-md border-[var(--border-level-1)] shadow-sm"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo & Portal Switcher */}
        <div className="flex items-center gap-4">
          <Link href={`/${currentLocale}/b2b`} className="flex items-center gap-3 z-50">
            {(lightLogoUrl || darkLogoUrl) ? (
              <img
                src={theme === "dark" ? (darkLogoUrl || lightLogoUrl) : (lightLogoUrl || darkLogoUrl)}
                alt={`${siteName} Logo`}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center font-black text-white tracking-tighter shadow-sm">
                E3
              </div>
            )}
            <span className="font-bold text-lg tracking-tight hidden sm:block text-[var(--text-primary)]">
              {!(lightLogoUrl || darkLogoUrl) ? (isAr ? "للشركات" : "Corporate") : ""}
            </span>
          </Link>

          {/* Pulse Orbit Submenu Dropdown */}
          <PulseOrbitDropdown locale={currentLocale} />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {b2bNavLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.endsWith('/b2b') && link.href.endsWith('/b2b'))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors relative py-1",
                  isActive ? "text-[var(--color-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="b2b-nav-indicator"
                    className="absolute -bottom-1 start-0 end-0 h-0.5 bg-[var(--color-primary)] rounded-full"
                    initial={false}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <HeaderAuthControls locale={currentLocale} />

          <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" aria-label="Search">
            <Search className="w-4 h-4" />
          </button>
          
          <button 
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--color-primary)] transition-all cursor-pointer"
            title={isAr ? "Switch to English" : "التغيير إلى العربية"}
          >
            <Globe className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span className="text-xs font-bold uppercase">{isAr ? "English" : "العربية"}</span>
          </button>
          
          <Link
            href={`/${currentLocale}/b2b/contact`}
            className="px-5 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold tracking-wider uppercase rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
          >
            {isAr ? "ابدأ مشروعك" : "Start a Project"}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-[var(--text-primary)] z-50 cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed inset-0 z-40 bg-[var(--bg-level-1)] pt-24 px-6 pb-6 overflow-y-auto lg:hidden flex flex-col"
          >
            {/* Mobile Pulse Orbit Submenu Dropdown */}
            <div className="mb-6">
              <PulseOrbitDropdown locale={currentLocale} onNavigate={() => setMobileMenuOpen(false)} />
            </div>
            <nav className="flex flex-col gap-6 mb-8">
              {b2bNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="mt-auto pt-8 border-t border-[var(--border-level-1)] flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-[var(--text-primary)]"
                >
                  <Globe className="w-5 h-5 text-[var(--color-primary)]" />
                  <span className="font-bold">{isAr ? "English" : "العربية"}</span>
                </button>
                <button 
                  className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="font-bold">Theme</span>
                </button>
              </div>
              
              <Link
                href="/b2b/client-login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-3 border border-[var(--border-level-2)] text-[var(--text-primary)] font-bold rounded-xl"
              >
                {isAr ? "دخول العملاء" : "Client Login"}
              </Link>
              
              <Link
                href={`/${currentLocale}/b2b/contact`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl"
              >
                {isAr ? "ابدأ مشروعك" : "Start a Project"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
