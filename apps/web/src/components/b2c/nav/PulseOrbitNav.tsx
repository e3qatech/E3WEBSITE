"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useB2CExperience } from '@/components/b2c/runtime/B2CExperienceRuntime';
import { useSession } from 'next-auth/react';
import {
  Sparkles,
  Ticket,
  Calendar as CalendarIcon,
  Compass,
  Briefcase,
  PartyPopper,
  PhoneCall,
  Globe,
  Sun,
  Moon,
  X,
  Menu as MenuIcon,
  ChevronRight,
  ArrowRight,
  User as UserIcon,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PulseOrbitDropdown as _PulseOrbitDropdown } from './PulseOrbitDropdown';
import { HeaderAuthControls } from '@/components/auth/HeaderAuthControls';
import { E3Logo } from '@/components/shared/E3Logo';
import { localizeHref, isExternalUrl, normalizeExternalUrl } from '@/lib/url-helper';

interface NavDestination {
  labelEn: string;
  labelAr: string;
  href: string;
  icon: any;
  descEn: string;
  descAr: string;
  mediaUrl: string;
}

// Icon map for matching CMS destinations to icons by href pattern
const DEST_ICON_MAP: Record<string, any> = {
  '/b2c/attractions': Sparkles,
  '/b2c/calendar': CalendarIcon,
  '/b2c/discover': Compass,
  '/b2c/packages': PartyPopper,
  '/b2c/contact': PhoneCall,
  '/b2b/services': Briefcase,
  '/b2b/cases': Sparkles,
  '/b2b/team': UserIcon,
  '/b2b/careers': Briefcase,
  '/b2b/contact': PhoneCall,
};


let sharedAudioCtx: AudioContext | null = null;

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export type HapticSoundType = 'tab' | 'destination' | 'portal_switch' | 'open' | 'scroll';

export function playSpatialHoverSound(
  panOffset = 0,
  soundType: HapticSoundType = 'tab'
) {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    if (panner) {
      const pan = Math.max(-1, Math.min(1, panOffset));
      panner.pan.setValueAtTime(pan, now);
      gain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      gain.connect(ctx.destination);
    }

    if (soundType === 'portal_switch') {
      // Futuristic dual-synth portal transition sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.exponentialRampToValueAtTime(740, now + 0.12);
      osc2.frequency.setValueAtTime(480, now);
      osc2.frequency.exponentialRampToValueAtTime(960, now + 0.12);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc1.connect(gain);
      osc2.connect(gain);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.14);
      osc2.stop(now + 0.14);
    } else if (soundType === 'destination') {
      // Spatial harmonic chime for destination worlds
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08); // D6

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (soundType === 'scroll') {
      // Soft tactile micro-click on scroll
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (soundType === 'open') {
      // Immersive ascending riser
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.18);
    } else {
      // Default micro-tab hover chime
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  } catch (_e) {
    // Graceful fallback if Web Audio API is disabled
  }
}

export function PulseOrbitNav({
  locale = 'en',
  settings,
  orbitData,
  type = 'b2c',
  customerLabelEn: _customerLabelEn = 'Customer',
  customerLabelAr: _customerLabelAr = 'الزائر',
  organizerLabelEn: _organizerLabelEn = 'Organizer',
  organizerLabelAr: _organizerLabelAr = 'المنظّم',
  customerUrl: _customerUrl = '/b2c',
  organizerUrl: _organizerUrl = '/b2b',
}: {
  locale?: string;
  settings?: Record<string, string>;
  orbitData?: {
    titleEn?: string;
    titleAr?: string;
    navButtonTextEn?: string;
    navButtonTextAr?: string;
    logoUrl?: string;
    destinations?: any[];
    bookTicketsUrl?: string;
    bookTicketsLabelEn?: string;
    bookTicketsLabelAr?: string;
    bookTicketsEnabled?: boolean | string;
    bookTicketsExternal?: boolean | string;
  };
  type?: 'b2c' | 'b2b';
  customerLabelEn?: string;
  customerLabelAr?: string;
  organizerLabelEn?: string;
  organizerLabelAr?: string;
  customerUrl?: string;
  organizerUrl?: string;
}) {
  const pathname = usePathname();
  const { trackTelemetry } = useB2CExperience();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : session?.user?.email
    ? session.user.email.charAt(0).toUpperCase()
    : null;

  const isAr = locale === 'ar';
  const lightLogoUrl = settings?.lightLogoUrl;
  const darkLogoUrl = settings?.darkLogoUrl;

  const [activePortalTab, setActivePortalTab] = useState<'b2c' | 'b2b'>(type);
  const [b2cOrbitData, setB2COrbitData] = useState<any>(type === 'b2c' ? orbitData : null);
  const [b2bOrbitData, setB2BOrbitData] = useState<any>(type === 'b2b' ? orbitData : null);

  const fetchBothOrbits = useCallback(async () => {
    try {
      const [resB2C, resB2B] = await Promise.all([
        fetch('/api/cms/pages/b2c-pulse-orbit?t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/cms/pages/b2b-pulse-orbit?t=' + Date.now(), { cache: 'no-store' }),
      ]);

      if (resB2C.ok) {
        const jsonB2C = await resB2C.json();
        if (jsonB2C?.data?.content) setB2COrbitData(jsonB2C.data.content);
      }
      if (resB2B.ok) {
        const jsonB2B = await resB2B.json();
        if (jsonB2B?.data?.content) setB2BOrbitData(jsonB2B.data.content);
      }
    } catch (_e) {
      // Ignore network errors
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBothOrbits();
    const handleUpdate = () => fetchBothOrbits();
    window.addEventListener('e3_cms_pulse_orbit_updated', handleUpdate);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('e3_cms_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'pulse_orbit_updated' || event.data?.type === 'b2c_landing_updated') {
          fetchBothOrbits();
        }
      };
    } catch (_e) {}

    return () => {
      window.removeEventListener('e3_cms_pulse_orbit_updated', handleUpdate);
      if (bc) bc.close();
    };
  }, [fetchBothOrbits]);

  const currentOrbitData = activePortalTab === 'b2c' ? (b2cOrbitData || orbitData) : (b2bOrbitData || orbitData);

  const rawDestinations = (currentOrbitData?.destinations && currentOrbitData.destinations.length > 0)
    ? currentOrbitData.destinations
        .filter((d: any) => d.enabled !== false && d.id !== 'tickets' && !d.href?.includes('/tickets'))
        .map((d: any) => ({
          labelEn: d.labelEn,
          labelAr: d.labelAr,
          href: d.href,
          // Match icon by href, fall back to Sparkles — no hardcoded fallback list
          icon: DEST_ICON_MAP[d.href] || Sparkles,
          descEn: d.descEn,
          descAr: d.descAr,
          // CMS mediaUrl — no Unsplash fallback. Empty string means no image.
          mediaUrl: d.mediaUrl || '',
        }))
    : [];

  const destinationList = rawDestinations.filter((d: any) => !d.href?.includes('/tickets'));

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDestination, setActiveDestination] = useState<NavDestination | null>(
    rawDestinations.length > 0 ? rawDestinations[0] : null
  );
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');

  // Throttled scroll haptic feedback
  const lastScrollTimeRef = React.useRef<number>(0);
  const handleDestinationScrollThrottled = () => {
    const now = Date.now();
    if (now - lastScrollTimeRef.current > 80) {
      lastScrollTimeRef.current = now;
      playSpatialHoverSound(0, 'scroll');
    }
  };

  useEffect(() => {
    if (destinationList && destinationList.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveDestination(destinationList[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrbitData, activePortalTab]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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
    playSpatialHoverSound(0, nextState ? 'open' : 'tab');
    if (nextState) {
      trackTelemetry('menu_opened', { locale, type: activePortalTab });
    }
  };

  const toggleLanguage = () => {
    playSpatialHoverSound(0, 'tab');
    const targetLocale = isAr ? 'en' : 'ar';
    document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;
    let newPath = pathname || `/${locale}`;
    const basePrefix = activePortalTab === 'b2c' ? '/b2c' : '/b2b';
    if (newPath.startsWith('/ar/')) {
      newPath = newPath.replace('/ar/', `/${targetLocale}/`);
    } else if (newPath.startsWith('/en/')) {
      newPath = newPath.replace('/en/', `/${targetLocale}/`);
    } else if (newPath === '/ar' || newPath === '/en') {
      newPath = `/${targetLocale}${basePrefix}`;
    } else {
      newPath = `/${targetLocale}${newPath}`;
    }
    window.location.href = newPath;
  };

  const toggleTheme = () => {
    playSpatialHoverSound(0, 'tab');
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(nextTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
    }
  };

  const bookTicketsRawUrl = settings?.bookTicketsUrl || currentOrbitData?.bookTicketsUrl || (activePortalTab === 'b2c' ? '/b2c/calendar' : '/b2b/contact');
  const isExternalBookUrl = isExternalUrl(bookTicketsRawUrl);
  const bookTicketsHref = isExternalBookUrl
    ? normalizeExternalUrl(bookTicketsRawUrl)
    : localizeHref(bookTicketsRawUrl, locale);

  const bookTicketsLabelEn = settings?.bookTicketsLabelEn || currentOrbitData?.bookTicketsLabelEn || (activePortalTab === 'b2c' ? 'BOOK TICKETS' : 'REQUEST PROPOSAL');
  const bookTicketsLabelAr = settings?.bookTicketsLabelAr || currentOrbitData?.bookTicketsLabelAr || (activePortalTab === 'b2c' ? 'احجز التذاكر' : 'اطلب عرض سعر');
  const isBookTicketsEnabled = settings?.bookTicketsEnabled !== 'false' && currentOrbitData?.bookTicketsEnabled !== false;
  const openInNewTab = settings?.bookTicketsExternal === 'true' || currentOrbitData?.bookTicketsExternal === true || isExternalBookUrl;

  const defaultTitleEn = activePortalTab === 'b2c' ? 'PULSE ORBIT DESTINATIONS' : 'B2B ENTERPRISE ORBIT';
  const defaultTitleAr = activePortalTab === 'b2c' ? 'وجهات مدار إي ثري' : 'مدار إي ثري لقطاع الأعمال';
  
  const customNavBtnEn = currentOrbitData?.navButtonTextEn || (type === 'b2c' ? 'PULSE ORBIT' : 'B2B ORBIT');
  const customNavBtnAr = currentOrbitData?.navButtonTextAr || (type === 'b2c' ? 'القائمة' : 'قطاع الأعمال');

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
          {/* Main Navigation Bar Logo: Always uses Global General Settings Light/Dark Logo */}
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}${type === 'b2c' ? '/b2c' : '/b2b'}`}
              className="flex items-center group cursor-pointer"
              onClick={() => setMenuOpen(false)}
            >
              <E3Logo
                lightLogoUrl={lightLogoUrl}
                darkLogoUrl={darkLogoUrl}
                isLight={currentTheme === 'light'}
                showText={false}
                size="md"
              />
            </Link>
          </div>

          {/* Desktop Links (Resting State) */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full border border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
            {destinationList.slice(0, 4).map((dest: any) => {
              const isActive = pathname?.includes(dest.href);
              return (
                <Link
                  key={dest.href}
                  href={localizeHref(dest.href, locale)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pan = ((rect.left + rect.width / 2) / window.innerWidth - 0.5) * 1.5;
                    playSpatialHoverSound(pan, 'tab');
                  }}
                  className={cn(
                    'flex items-center justify-center rounded-full px-3.5 py-1 text-xs font-semibold transition-all select-none cursor-pointer',
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  {isAr ? dest.labelAr : dest.labelEn}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs & Orbit Menu Trigger */}
          <div className="flex items-center gap-2">
            {/* Language Section Tab in Main Menu Bar */}
            <button
              onClick={toggleLanguage}
              onMouseEnter={() => playSpatialHoverSound(0, 'tab')}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 text-xs font-bold text-slate-200 hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer select-none"
              title={isAr ? 'Switch to English' : 'التغيير إلى العربية'}
            >
              <Globe className="h-3.5 w-3.5 text-sky-400" />
              <span className="font-extrabold uppercase">{isAr ? 'English' : 'العربية'}</span>
            </button>

            {/* Theme Toggle Button in Main Menu Bar */}
            <button
              onClick={toggleTheme}
              onMouseEnter={() => playSpatialHoverSound(0, 'tab')}
              className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-full border border-slate-800 bg-slate-900/80 text-slate-200 hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer select-none"
              aria-label="Toggle Theme"
              title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {currentTheme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
            </button>

            {/* Quick Ticket / Proposal CTA */}
            {isBookTicketsEnabled && (
              isExternalBookUrl ? (
                <a
                  href={bookTicketsHref}
                  target={openInNewTab ? "_blank" : "_self"}
                  rel={openInNewTab ? "noopener noreferrer" : undefined}
                  onMouseEnter={() => playSpatialHoverSound(0.2, 'tab')}
                  className="hidden sm:inline-flex items-center gap-2 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 px-4 text-xs font-extrabold text-slate-950 shadow-md hover:opacity-95 transition-opacity select-none cursor-pointer"
                  onClick={() => trackTelemetry('ticket_cta_clicked', { source: 'header', url: bookTicketsHref, type: activePortalTab })}
                >
                  {activePortalTab === 'b2c' ? <Ticket className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                  <span>{isAr ? bookTicketsLabelAr : bookTicketsLabelEn}</span>
                </a>
              ) : (
                <Link
                  href={bookTicketsHref}
                  target={openInNewTab ? "_blank" : undefined}
                  onMouseEnter={() => playSpatialHoverSound(0.2, 'tab')}
                  className="hidden sm:inline-flex items-center gap-2 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 px-4 text-xs font-extrabold text-slate-950 shadow-md hover:opacity-95 transition-opacity select-none cursor-pointer"
                  onClick={() => trackTelemetry('ticket_cta_clicked', { source: 'header', url: bookTicketsHref, type: activePortalTab })}
                >
                  {activePortalTab === 'b2c' ? <Ticket className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                  <span>{isAr ? bookTicketsLabelAr : bookTicketsLabelEn}</span>
                </Link>
              )
            )}

            {/* Menu Trigger Button (Pulse Orbit Tab) with Customizable Name */}
            <button
              onClick={toggleMenu}
              onMouseEnter={() => playSpatialHoverSound(0, 'tab')}
              aria-label={menuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={menuOpen}
              className={cn(
                "inline-flex items-center gap-2 h-9 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 text-xs font-bold text-slate-200 hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer select-none",
                isAuthenticated && "border-emerald-500/40 bg-emerald-950/30 hover:border-emerald-500/60 text-emerald-300 shadow-sm"
              )}
            >
              {menuOpen ? (
                <X className="h-4 w-4 text-rose-400" />
              ) : isAuthenticated ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/40 shadow-sm">
                  {userInitial || <UserIcon className="h-3 w-3" />}
                </div>
              ) : (
                <MenuIcon className="h-4 w-4 text-emerald-400" />
              )}
              <span>{menuOpen ? (isAr ? 'إغلاق' : 'CLOSE') : (isAr ? customNavBtnAr : customNavBtnEn)}</span>
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
          {/* Top Bar inside Overlay - Managed EXCLUSIVELY by Pulse Orbit CMS Hub Logo */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="flex items-center gap-3">
              {currentOrbitData?.logoUrl ? (
                <img
                  src={currentOrbitData.logoUrl}
                  alt="Pulse Orbit Overlay Logo"
                  className="h-8 w-auto object-contain transition-transform hover:scale-105"
                />
              ) : (
                <E3Logo isLight={false} showText={false} size="sm" />
              )}
              <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest font-bold">
                {isAr ? (currentOrbitData?.titleAr || defaultTitleAr) : (currentOrbitData?.titleEn || defaultTitleEn)}
              </span>
            </div>

            {/* Visitor & Organiser Section Tab Switcher inside Pulse Orbit Overlay */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl shadow-inner">
              <button
                type="button"
                onMouseEnter={() => playSpatialHoverSound(-0.4, 'portal_switch')}
                onClick={() => {
                  playSpatialHoverSound(-0.4, 'portal_switch');
                  setActivePortalTab('b2c');
                }}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer select-none",
                  activePortalTab === 'b2c'
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>{isAr ? 'زائر (B2C)' : 'Visitor Portal'}</span>
              </button>
              <button
                type="button"
                onMouseEnter={() => playSpatialHoverSound(0.4, 'portal_switch')}
                onClick={() => {
                  playSpatialHoverSound(0.4, 'portal_switch');
                  setActivePortalTab('b2b');
                }}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer select-none",
                  activePortalTab === 'b2b'
                    ? "bg-sky-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>{isAr ? 'منظم (B2B)' : 'Organiser Portal'}</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Login / Sign Up Controls in Right-Side Pulse Orbit Overlay */}
              <HeaderAuthControls locale={locale} />

              {/* Language Switch */}
              <button
                onClick={toggleLanguage}
                onMouseEnter={() => playSpatialHoverSound(0, 'tab')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-sky-400" />
                <span>{isAr ? 'English' : 'العربية'}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                onMouseEnter={() => playSpatialHoverSound(0, 'tab')}
                className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer"
                aria-label="Toggle Theme"
              >
                {currentTheme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
              </button>

              <button
                onClick={() => {
                  playSpatialHoverSound(0, 'tab');
                  setMenuOpen(false);
                }}
                onMouseEnter={() => playSpatialHoverSound(0, 'tab')}
                className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-2.5 text-rose-300 hover:bg-rose-900/50 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Central Grid Split: Left Destinations List, Right Interactive Media Preview */}
          <div className="my-auto grid grid-cols-1 gap-8 lg:grid-cols-12 max-w-7xl mx-auto w-full py-6">
            {/* DESTINATION WORLDS LIST (7 COLS) WITH HAPTIC SCROLL & HOVER SPATIAL AUDIO */}
            <div
              onScroll={handleDestinationScrollThrottled}
              className="lg:col-span-7 space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
            >
              {destinationList.map((dest: any) => {
                const Icon = dest.icon;
                const isSelected = activeDestination?.href === dest.href;
                return (
                  <Link
                    key={dest.href}
                    href={localizeHref(dest.href, locale)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pan = ((rect.left + rect.width / 2) / window.innerWidth - 0.5) * 1.5;
                      playSpatialHoverSound(pan, 'destination');
                      setActiveDestination(dest);
                      trackTelemetry('destination_selected', { href: dest.href, type: activePortalTab });
                    }}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'group flex items-center justify-between rounded-2xl border p-4 transition-all duration-300 cursor-pointer select-none',
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
              {(() => {
                const mediaUrl = activeDestination?.mediaUrl || '';
                const isVideo = /\.(mp4|webm|mov|m4v|mkv)$/i.test(mediaUrl) || mediaUrl.includes('video') || mediaUrl.includes('/api/media/') || mediaUrl.includes('/api/upload/') || mediaUrl.startsWith('blob:');
                const isIframe = mediaUrl.includes('iframe') || mediaUrl.includes('youtube') || mediaUrl.includes('vimeo') || mediaUrl.includes('spline') || mediaUrl.includes('sketchfab');
                const iframeSrc = (isIframe && mediaUrl.includes('src=')) ? (mediaUrl.match(/src=["'](.*?)["']/)?.[1] || mediaUrl) : mediaUrl;

                if (isVideo) {
                  return (
                    <video
                      key={mediaUrl}
                      src={mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover opacity-40 transition-all duration-700 scale-105"
                    />
                  );
                }

                if (isIframe) {
                  return (
                    <iframe
                      key={mediaUrl}
                      src={iframeSrc}
                      className="absolute inset-0 w-full h-full border-none opacity-40 pointer-events-none transition-all duration-700 scale-105"
                      allow="autoplay; fullscreen; xr-spatial-tracking"
                    />
                  );
                }

                return (
                  <div
                    key={mediaUrl}
                    className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-700 scale-105"
                    style={{ backgroundImage: `url(${mediaUrl})` }}
                  />
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/30 uppercase tracking-wider mb-3">
                  {activePortalTab === 'b2c' ? 'FEATURED WORLD' : 'ENTERPRISE SOLUTION'}
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  {isAr ? activeDestination?.labelAr : activeDestination?.labelEn}
                </h3>
              </div>

              <div className="relative z-10 space-y-4 pt-12">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isAr ? activeDestination?.descAr : activeDestination?.descEn}
                </p>

                <Link
                  href={`/${locale}${activeDestination?.href || (activePortalTab === 'b2c' ? '/b2c' : '/b2b')}`}
                  onClick={() => setMenuOpen(false)}
                  onMouseEnter={() => playSpatialHoverSound(0.2, 'destination')}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer select-none"
                >
                  <span>{isAr ? 'استكشف الوجهة' : (activePortalTab === 'b2c' ? 'EXPLORE WORLD' : 'DISCOVER SOLUTION')}</span>
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
              <Link
                href={`/${locale}/b2c`}
                onMouseEnter={() => playSpatialHoverSound(-0.3, 'tab')}
                className="hover:text-emerald-400 transition-colors"
              >
                {isAr ? 'بوابة الزوار (B2C)' : 'B2C Customer Portal'}
              </Link>
              <span>•</span>
              <Link
                href={`/${locale}/b2b`}
                onMouseEnter={() => playSpatialHoverSound(0.3, 'tab')}
                className="hover:text-emerald-400 transition-colors"
              >
                {isAr ? 'بوابة الشركات (B2B)' : 'B2B Enterprise Portal'}
              </Link>
              <span>•</span>
              <Link
                href={`/${locale}/b2c/contact`}
                onMouseEnter={() => playSpatialHoverSound(0, 'tab')}
                className="hover:text-emerald-400 transition-colors"
              >
                {isAr ? 'مركز الدعم' : 'Support Center'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
