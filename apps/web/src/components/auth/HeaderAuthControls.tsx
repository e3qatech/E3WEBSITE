 
"use client";

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, LogIn, UserPlus, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { getAuthorizedLandingRoute } from '@/lib/landing-route';
import { AuthModal } from './AuthModal';
import { cn } from '@/lib/utils';

export function HeaderAuthControls({
  locale = 'en',
  className,
}: {
  locale?: string;
  className?: string;
}) {
  const { data: session, status } = useSession();
  const isAr = locale === 'ar';

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('login');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const openLogin = () => {
    setModalMode('login');
    setModalOpen(true);
  };

  const openSignUp = () => {
    setModalMode('signup');
    setModalOpen(true);
  };

  const user = session?.user;
  const isAuthenticated = status === 'authenticated' && !!user;

  const dashboardRoute = user ? getAuthorizedLandingRoute(user, locale) : `/${locale}/login/admin`;

  return (
    <>
      <div className={cn('flex items-center gap-2', className)}>
        {isAuthenticated ? (
          <div className="relative inline-block text-start">
            <button
              type="button"
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 h-9 rounded-full bg-slate-900 border border-slate-700/80 px-3 py-1 text-xs font-bold text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800 transition-all shadow-sm"
              aria-expanded={userDropdownOpen}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[11px]">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="max-w-[100px] truncate hidden sm:inline">{user.name || user.email?.split('@')[0]}</span>
              <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', userDropdownOpen && 'rotate-180 text-emerald-400')} />
            </button>

            {userDropdownOpen && (
              <div
                className={cn(
                  'absolute z-50 mt-2 w-52 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl backdrop-blur-xl animate-fade-in text-slate-100',
                  isAr ? 'start-0' : 'end-0'
                )}
              >
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <div className="text-xs font-bold text-white truncate">{user.name || 'User'}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{user.email}</div>
                  <span className="mt-1 inline-block rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/30 uppercase">
                    {user.role || 'USER'}
                  </span>
                </div>

                <Link
                  href={dashboardRoute}
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                  <span>{isAr ? 'لوحة التحكم' : 'Dashboard'}</span>
                </Link>

                <Link
                  href={dashboardRoute}
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-sky-500/10 hover:text-sky-300 transition-colors"
                >
                  <User className="h-4 w-4 text-sky-400" />
                  <span>{isAr ? 'الملف الشخصي' : 'Account / Profile'}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    openLogin();
                  }}
                  className="w-full text-start flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                >
                  <LogIn className="h-4 w-4 text-emerald-400" />
                  <span>{isAr ? 'تبديل الحساب / تسجيل الدخول' : 'Login / Switch Account'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    openSignUp();
                  }}
                  className="w-full text-start flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                >
                  <UserPlus className="h-4 w-4 text-sky-400" />
                  <span>{isAr ? 'إنشاء حساب جديد' : 'Sign Up New Account'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors mt-1 border-t border-slate-800/80 pt-2"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Login Action */}
            <button
              type="button"
              onClick={openLogin}
              className="inline-flex items-center gap-1.5 h-9 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 text-xs font-bold text-slate-200 hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer select-none"
            >
              <LogIn className="h-3.5 w-3.5 text-emerald-400" />
              <span>{isAr ? 'تسجيل الدخول' : 'Login'}</span>
            </button>

            {/* Sign Up Action */}
            <button
              type="button"
              onClick={openSignUp}
              className="inline-flex items-center gap-1.5 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 px-3.5 text-xs font-extrabold text-slate-950 hover:opacity-95 transition-opacity shadow-md cursor-pointer select-none"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{isAr ? 'حساب جديد' : 'Sign Up'}</span>
            </button>
          </>
        )}
      </div>

      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode={modalMode}
        locale={locale}
      />
    </>
  );
}
