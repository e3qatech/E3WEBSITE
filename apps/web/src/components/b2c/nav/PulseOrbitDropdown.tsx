 
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, User, Building2, Sparkles, Calendar as CalendarIcon, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PulseOrbitDropdownProps {
  locale?: string;
  customerLabelEn?: string;
  customerLabelAr?: string;
  organizerLabelEn?: string;
  organizerLabelAr?: string;
  customerUrl?: string;
  organizerUrl?: string;
  onNavigate?: () => void;
  className?: string;
}

export function PulseOrbitDropdown({
  locale = 'en',
  customerLabelEn = 'Customer',
  customerLabelAr = 'الزائر',
  organizerLabelEn = 'Organiser',
  organizerLabelAr = 'المنظّم',
  customerUrl = '/b2c',
  organizerUrl = '/b2b',
  onNavigate,
  className,
}: PulseOrbitDropdownProps) {
  const pathname = usePathname() || '';
  const isAr = locale === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isCustomerActive = pathname.includes('/b2c');
  const isOrganiserActive = pathname.includes('/b2b');

  const b2cTarget = `/${locale}${customerUrl.startsWith('/') ? customerUrl : '/' + customerUrl}`;
  const b2bTarget = `/${locale}${organizerUrl.startsWith('/') ? organizerUrl : '/' + organizerUrl}`;

  // Safe hover handlers to prevent unexpected closing when moving mouse between trigger & dropdown
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  // Keyboard navigation & Esc key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-block text-start', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Pulse Orbit Submenu Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          'flex items-center gap-2 h-9 rounded-full px-4 text-xs font-bold transition-all select-none border backdrop-blur-md cursor-pointer shadow-sm',
          (isCustomerActive || isOrganiserActive || isOpen)
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 shadow-sm font-extrabold'
            : 'bg-[var(--surface-default)] text-[var(--text-primary)] border-[var(--border-level-2)] hover:border-emerald-500/40 hover:bg-[var(--surface-hover)]'
        )}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{isAr ? 'مدار إي ثري (Pulse Orbit)' : 'PULSE ORBIT'}</span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-180 text-emerald-500')}
        />
      </button>

      {/* Accessible Submenu Dropdown Panel */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={cn(
            'absolute z-50 mt-2 w-64 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)] p-2 shadow-2xl backdrop-blur-xl animate-fade-in text-[var(--text-primary)]',
            isAr ? 'start-0' : 'end-0 sm:start-0'
          )}
        >
          <div className="px-3 py-2 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border-b border-[var(--border-level-2)] mb-1">
            {isAr ? 'بوابات مدار إي ثري الفرعية' : 'PULSE ORBIT PORTALS'}
          </div>

          {/* Sub-navigation Option 1: Customer */}
          <Link
            href={b2cTarget}
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onNavigate?.();
            }}
            className={cn(
              'flex items-center gap-3 rounded-xl p-2.5 text-xs font-semibold transition-all group',
              isCustomerActive
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-extrabold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
            )}
          >
            <div className={cn('p-2 rounded-lg', isCustomerActive ? 'bg-emerald-500 text-slate-950' : 'bg-[var(--surface-hover)] text-[var(--text-tertiary)] group-hover:text-emerald-500')}>
              <User className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-[var(--text-primary)]">{isAr ? customerLabelAr : customerLabelEn}</div>
              <div className="text-[10px] text-[var(--text-secondary)] line-clamp-1">
                {isAr ? 'تجارب ترفيهية ووجهات عائلية' : 'B2C Experiences & Attractions'}
              </div>
            </div>
          </Link>

          {/* Sub-navigation Option 2: Organiser */}
          <Link
            href={b2bTarget}
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onNavigate?.();
            }}
            className={cn(
              'flex items-center gap-3 rounded-xl p-2.5 text-xs font-semibold transition-all group mt-1',
              isOrganiserActive
                ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/30 font-extrabold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
            )}
          >
            <div className={cn('p-2 rounded-lg', isOrganiserActive ? 'bg-sky-500 text-slate-950' : 'bg-[var(--surface-hover)] text-[var(--text-tertiary)] group-hover:text-sky-500')}>
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-[var(--text-primary)]">{isAr ? organizerLabelAr : organizerLabelEn}</div>
              <div className="text-[10px] text-[var(--text-secondary)] line-clamp-1">
                {isAr ? 'خدمات الشركات والفعاليات' : 'B2B Enterprise & Venue Buyouts'}
              </div>
            </div>
          </Link>

          {/* Quick Destination Links Section */}
          <div className="px-3 pt-3 pb-1 text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-wider border-t border-[var(--border-level-2)] mt-2">
            {isAr ? 'الوجهات السريعة' : 'QUICK DESTINATIONS'}
          </div>

          <div className="space-y-0.5">
            <Link
              href={`/${locale}/b2c/attractions`}
              onClick={() => { setIsOpen(false); onNavigate?.(); }}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-emerald-500 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>{isAr ? 'المرافق والوجهات' : 'Attractions World'}</span>
            </Link>

            <Link
              href={`/${locale}/b2c/calendar`}
              onClick={() => { setIsOpen(false); onNavigate?.(); }}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-emerald-500 transition-colors"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-sky-500" />
              <span>{isAr ? 'جدول الفعاليات' : 'Live Calendar'}</span>
            </Link>

            <Link
              href={`/${locale}/b2c/packages`}
              onClick={() => { setIsOpen(false); onNavigate?.(); }}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-emerald-500 transition-colors"
            >
              <PartyPopper className="h-3.5 w-3.5 text-purple-500" />
              <span>{isAr ? 'الباقات' : 'Packages'}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
