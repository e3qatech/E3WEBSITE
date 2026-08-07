"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useB2CExperience } from '@/components/b2c/runtime/B2CExperienceRuntime';
import {
  Sparkles,
  Ticket,
  Calendar as CalendarIcon,
  Compass,
  Briefcase,
  PhoneCall,
  Globe,
  Sun,
  Moon,
  X,
  Menu as MenuIcon,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavDestination {
  labelEn: string;
  labelAr: string;
  href: string;
  icon: any;
  descEn: string;
  descAr: string;
  mediaUrl: string;
}

const DESTINATIONS: NavDestination[] = [
  {
    labelEn: 'Attractions',
    labelAr: 'المرافق والوجهات',
    href: '/b2c/attractions',
    icon: Sparkles,
    descEn: 'Pristine Snow Park, Urban Arena, Kids City, and kinetic entertainment.',
    descAr: 'حديقة الثلج النقي، والساحة التفاعلية، وعالم الأطفال.',
    mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
  },
  {
    labelEn: 'Calendar',
    labelAr: 'جدول الفعاليات',
    href: '/b2c/calendar',
    icon: CalendarIcon,
    descEn: 'Live concerts, seasonal festivals, and exclusive entertainment shows.',
    descAr: 'الحفلات الحية والمهرجانات الموسمية والعروض الترفيهية.',
    mediaUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop',
  },
  {
    labelEn: 'Tickets',
    labelAr: 'التذاكر والحجز',
    href: '/b2c/tickets',
    icon: Ticket,
    descEn: 'Day passes, VIP experiences, family packages, and group booking.',
    descAr: 'التذاكر اليومية، التجارب الفاخرة، والباقات العائلية.',
    mediaUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop',
  },
  {
    labelEn: 'Discover',
    labelAr: 'استكشف قطر',
    href: '/b2c/discover',
    icon: Compass,
    descEn: 'Curated visitor guides, dining, and spatial technology showcases.',
    descAr: 'دليل الزوار، المطاعم، والتكنولوجيا التفاعلية.',
    mediaUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop',
  },
  {
    labelEn: 'Careers',
    labelAr: 'الوظائف والفرص',
    href: '/b2c/careers',
    icon: Briefcase,
    descEn: 'Join Qatar premier entertainment and event engineering team.',
    descAr: 'انضم إلى فريق هندسة الفعاليات والترفيه في قطر.',
    mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
  },
  {
    labelEn: 'Contact',
    labelAr: 'تواصل معنا',
    href: '/b2c/contact',
    icon: PhoneCall,
    descEn: '24/7 guest support, venue location, and concierge services.',
    descAr: 'خدمة الزوار، مواقع الفعاليات، واستفسارات الحجز.',
    mediaUrl: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=800&auto=format&fit=crop',
  },
];

export function PulseOrbitNav({
  locale = 'en',
  customerLabelEn = 'Customer',
  customerLabelAr = 'الزائر',
  organizerLabelEn = 'Organizer',
  organizerLabelAr = 'المنظّم',
  customerUrl = '/b2c',
  organizerUrl = '/b2b',
}: {
  locale?: string;
  customerLabelEn?: string;
  customerLabelAr?: string;
  organizerLabelEn?: string;
  organizerLabelAr?: string;
  customerUrl?: string;
  organizerUrl?: string;
}) {
  const pathname = usePathname();
  const { trackTelemetry } = useB2CExperience();
  const isAr = locale === 'ar';
  const isB2C = pathname?.includes('/b2c') || !pathname?.includes('/b2b');

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDestination, setActiveDestination] = useState<NavDestination>(DESTINATIONS[0]);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const toggleMenu = () => {
    const nextState = !menuOpen;
    setMenuOpen(nextState);
    if (nextState) {
      trackTelemetry('menu_opened', { locale });
    }
  };

  return (
    <>
      {/* DESKTOP & MOBILE HEADER BAR */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled
            ? 'border-b border-slate-800/80 bg-slate-950/85 py-3 backdrop-blur-md shadow-xl'
            : 'bg-gradient-to-b from-slate-950/80 to-transparent py-5'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo & Portal Branding */}
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-3 group"
              onClick={() => setMenuOpen(false)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 p-0.5 shadow-lg shadow-emerald-950 group-hover:scale-105 transition-transform">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400 text-lg">E3</span>
                </div>
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-white text-base block leading-none">
                  {isB2C ? 'E3 PULSE' : 'E3 ATELIER'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase">
                  {isAr ? (isB2C ? 'قطر للتجارب' : 'قطر للفعاليات') : (isB2C ? 'QATAR PORTAL' : 'ORGANIZER PORTAL')}
                </span>
              </div>
            </Link>

            {/* CUSTOMER / ORGANIZER PORTAL MODE SWITCHER */}
            <nav className="flex items-center gap-1 p-1 rounded-full border border-slate-800 bg-slate-900/90 backdrop-blur-md min-h-[44px]">
              <Link
                href={`/${locale}${customerUrl}`}
                aria-current={isB2C ? 'page' : undefined}
                className={cn(
                  'flex items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all min-h-[44px] cursor-pointer select-none',
                  isB2C
                    ? 'bg-gradient-to-r from-cyan-500/20 to-rose-500/20 text-cyan-400 border border-cyan-500/30 shadow-md'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {isAr ? customerLabelAr : customerLabelEn}
              </Link>
              <Link
                href={`/${locale}${organizerUrl}`}
                aria-current={!isB2C ? 'page' : undefined}
                className={cn(
                  'flex items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all min-h-[44px] cursor-pointer select-none',
                  !isB2C
                    ? 'bg-gradient-to-r from-emerald-500/20 to-amber-500/20 text-emerald-400 border border-emerald-500/30 shadow-md'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {isAr ? organizerLabelAr : organizerLabelEn}
              </Link>
            </nav>
          </div>

          {/* Desktop Links (Resting State) */}
          <nav className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-800/80 bg-slate-900/60 p-1.5 backdrop-blur-md">
            {DESTINATIONS.slice(0, 4).map((dest) => {
              const isActive = pathname?.includes(dest.href);
              return (
                <Link
                  key={dest.href}
                  href={`/${locale}${dest.href}`}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  {isAr ? dest.labelAr : dest.labelEn}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs & Orbit Menu Trigger */}
          <div className="flex items-center gap-3">
            {!isB2C && (
              <Link
                href={`/${locale}/login/business`}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-extrabold text-amber-400 hover:bg-amber-500/20 transition-all min-h-[44px]"
              >
                <span>{isAr ? 'تسجيل دخول المنظم' : 'Organizer Login'}</span>
              </Link>
            )}

            {/* Quick Ticket CTA */}
            {isB2C && (
              <Link
                href={`/${locale}/b2c/tickets`}
                className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-950 hover:opacity-95 transition-opacity min-h-[44px]"
                onClick={() => trackTelemetry('ticket_cta_clicked', { source: 'header' })}
              >
                <Ticket className="h-4 w-4" />
                <span>{isAr ? 'احجز التذاكر' : 'BOOK TICKETS'}</span>
              </Link>
            )}

            {/* Menu Trigger Button */}
            <button
              onClick={toggleMenu}
              aria-label={menuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-slate-700 hover:bg-slate-800 transition-all min-h-[44px]"
            >
              {menuOpen ? <X className="h-4 w-4 text-rose-400" /> : <MenuIcon className="h-4 w-4 text-emerald-400" />}
              <span>{menuOpen ? (isAr ? 'إغلاق' : 'CLOSE') : (isAr ? 'القائمة' : 'PULSE ORBIT')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* FULL DESKTOP IMMERSIVE MENU OVERLAY (PULSE ORBIT) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/95 backdrop-blur-xl p-6 sm:p-10 animate-fade-in text-slate-100"
          role="dialog"
          aria-modal="true"
          aria-label="Pulse Orbit Navigation"
        >
          {/* Top Bar inside Overlay */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest font-bold">
                PULSE ORBIT DESTINATIONS
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Switch */}
              <Link
                href={isAr ? `/en${pathname?.replace('/ar', '') || ''}` : `/ar${pathname?.replace('/en', '') || ''}`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                <Globe className="h-3.5 w-3.5 text-sky-400" />
                <span>{isAr ? 'English' : 'العربية'}</span>
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={() => setCurrentTheme(currentTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
                aria-label="Toggle Theme"
              >
                {currentTheme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
              </button>

              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-2.5 text-rose-300 hover:bg-rose-900/50 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Central Grid Split: Left Destinations List, Right Interactive Media Preview */}
          <div className="my-auto grid grid-cols-1 gap-8 lg:grid-cols-12 max-w-7xl mx-auto w-full py-6">
            {/* DESTINATION WORLDS LIST (7 COLS) */}
            <div className="lg:col-span-7 space-y-2">
              {DESTINATIONS.map((dest) => {
                const Icon = dest.icon;
                const isSelected = activeDestination.href === dest.href;
                return (
                  <Link
                    key={dest.href}
                    href={`/${locale}${dest.href}`}
                    onMouseEnter={() => {
                      setActiveDestination(dest);
                      trackTelemetry('destination_selected', { href: dest.href });
                    }}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'group flex items-center justify-between rounded-2xl border p-4 transition-all duration-300',
                      isSelected
                        ? 'border-emerald-500/80 bg-emerald-950/30 text-white shadow-xl shadow-emerald-950/50 translate-x-1'
                        : 'border-slate-800/60 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-xl transition-colors", isSelected ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-500")}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {isAr ? dest.labelAr : dest.labelEn}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">
                          {isAr ? dest.descAr : dest.descEn}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={cn("h-5 w-5 transition-transform", isSelected ? "text-emerald-400 translate-x-1" : "text-slate-600")} />
                  </Link>
                );
              })}
            </div>

            {/* INTERACTIVE MEDIA WORLD PREVIEW (5 COLS - DESKTOP ONLY) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl relative overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 transition-all duration-700 scale-105"
                style={{ backgroundImage: `url(${activeDestination.mediaUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              <div className="relative z-10">
                <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/30 uppercase tracking-wider mb-3">
                  FEATURED WORLD
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  {isAr ? activeDestination.labelAr : activeDestination.labelEn}
                </h3>
              </div>

              <div className="relative z-10 space-y-4 pt-12">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isAr ? activeDestination.descAr : activeDestination.descEn}
                </p>

                <Link
                  href={`/${locale}${activeDestination.href}`}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 transition-all"
                >
                  <span>{isAr ? 'استكشف الوجهة' : 'EXPLORE WORLD'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar inside Overlay */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-6 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-200">E3 Qatar Live Experiences</span> • Permanent Attractions & Event Engineering
            </div>

            <div className="flex items-center gap-4 font-semibold">
              <Link href={`/${locale}/business`} className="hover:text-emerald-400 transition-colors">
                {isAr ? 'بوابة الشركات (B2B)' : 'B2B Enterprise Portal'}
              </Link>
              <span>•</span>
              <Link href={`/${locale}/b2c/contact`} className="hover:text-emerald-400 transition-colors">
                {isAr ? 'مركز الدعم' : 'Support Center'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
