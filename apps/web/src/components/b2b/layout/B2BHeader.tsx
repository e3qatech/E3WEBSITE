"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, Globe, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

export function B2BHeader({ settings = {} }: { settings?: Record<string, string> }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname() || ""
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const isAr = pathname.startsWith('/ar') || (typeof document !== 'undefined' && document.cookie.includes('NEXT_LOCALE=ar'))
  const currentLocale = isAr ? 'ar' : 'en'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      className={cn(
        "fixed top-0 start-0 end-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-zinc-950/80 backdrop-blur-md border-zinc-800/50 py-4 shadow-sm"
          : "bg-transparent border-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${currentLocale}/b2b`} className="flex items-center gap-2 z-50">
          {(lightLogoUrl || darkLogoUrl) ? (
            <img 
              src={theme === "dark" ? (darkLogoUrl || lightLogoUrl) : (lightLogoUrl || darkLogoUrl)} 
              alt={`${siteName} Logo`}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <div className="w-10 h-10 bg-emerald-500 rounded-sm flex items-center justify-center font-bold text-white tracking-tighter">
              E3
            </div>
          )}
          <span className="font-bold text-xl tracking-tight hidden sm:block text-zinc-100">
            {!(lightLogoUrl || darkLogoUrl) ? (isAr ? "للشركات" : "Corporate") : ""}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {b2bNavLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.endsWith('/b2b') && link.href.endsWith('/b2b'))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-emerald-400 relative",
                  isActive ? "text-emerald-500 font-bold" : "text-zinc-400"
                )}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="b2b-nav-indicator"
                    className="absolute -bottom-2 start-0 end-0 h-0.5 bg-emerald-500"
                    initial={false}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <button className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          
          <button 
            className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-all cursor-pointer"
            title={isAr ? "Switch to English" : "التغيير إلى العربية"}
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase">{isAr ? "English" : "العربية"}</span>
          </button>
          
          <div className="w-px h-6 bg-zinc-800 mx-2" />
          
          <Link href="/b2b/client-login" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
            {isAr ? "دخول العملاء" : "Client Login"}
          </Link>
          
          <Link
            href={`/${currentLocale}/b2b/contact`}
            className="px-5 py-2.5 bg-zinc-100 text-zinc-950 text-sm font-bold rounded-sm hover:bg-emerald-500 hover:text-zinc-950 transition-colors"
          >
            {isAr ? "ابدأ مشروعك" : "Start a Project"}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-zinc-100 z-50"
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
            className="fixed inset-0 z-40 bg-zinc-950 pt-24 px-6 pb-6 overflow-y-auto lg:hidden flex flex-col"
          >
            <nav className="flex flex-col gap-6 mb-8">
              {b2bNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-bold text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="mt-auto pt-8 border-t border-zinc-800 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-zinc-300 hover:text-emerald-400"
                >
                  <Globe className="w-6 h-6 text-emerald-500" />
                  <span className="font-bold">{isAr ? "English" : "العربية"}</span>
                </button>
                <button 
                  className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  <span className="font-bold">Theme</span>
                </button>
              </div>
              
              <Link
                href="/b2b/client-login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-3 border border-zinc-800 text-zinc-400 font-bold rounded-sm"
              >
                {isAr ? "دخول العملاء" : "Client Login"}
              </Link>
              
              <Link
                href={`/${currentLocale}/b2b/contact`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-3 bg-emerald-500 text-zinc-950 font-bold rounded-sm"
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
