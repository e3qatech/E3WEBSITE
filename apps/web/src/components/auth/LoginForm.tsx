"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PortalConfig } from './PortalConfigs';
import { PortalSelector, AdminWorkspaceKey } from './PortalSelector';
import { PasswordField } from './PasswordField';
import { PortalError } from './PortalError';
import { Mail, ArrowRight, ArrowLeft, KeyRound, Sparkles, ExternalLink } from 'lucide-react';

interface LoginFormProps {
  config: PortalConfig;
  locale: 'en' | 'ar';
}

export function LoginForm({ config, locale }: LoginFormProps) {
  const searchParams = useSearchParams();
  const rawCallback = searchParams?.get('callbackUrl');

  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const urlError = searchParams?.get('error');
  const getInitialError = () => {
    if (urlError === 'unauthorized') {
      return isAr ? 'هذا الحساب غير مخوّل للدخول إلى هذه البوابة.' : 'This account is not authorized for this portal.';
    }
    if (urlError === 'inactive') {
      return isAr ? 'هذا الحساب غير مفعل.' : 'This account is inactive.';
    }
    if (urlError === 'session_revoked') {
      return isAr ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.' : 'Session expired or revoked. Please log in again.';
    }
    return '';
  };

  const queryEmail = searchParams?.get('email') || '';
  const queryWorkspace = searchParams?.get('workspace') as AdminWorkspaceKey | null;

  const [email, setEmail] = useState(queryEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(getInitialError);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoLogins, setShowDemoLogins] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<AdminWorkspaceKey>(
    queryWorkspace && ['super', 'b2b', 'b2c', 'hr'].includes(queryWorkspace) ? queryWorkspace : 'super'
  );

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (error) setError('');
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (error) setError('');
  };

  const handleWorkspaceChange = (ws: AdminWorkspaceKey) => {
    setActiveWorkspace(ws);
    if (error) setError('');
  };

  const applyQuickLogin = (quickEmail: string, quickWorkspace?: AdminWorkspaceKey) => {
    setEmail(quickEmail);
    setPassword('Password123!');
    if (quickWorkspace) {
      setActiveWorkspace(quickWorkspace);
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      // 1. Submit credentials to NextAuth
      const result = await signIn('credentials', {
        redirect: false,
        email: cleanEmail,
        password: cleanPassword,
      });

      if (result?.error) {
        // Generic invalid credentials error to prevent enumeration
        setError(
          isAr
            ? 'اسم المستخدم أو كلمة المرور غير صحيحة، أو الحساب غير مفعل.'
            : 'Invalid email or password, or account is deactivated.'
        );
        setIsLoading(false);
        return;
      }

      // 2. Build server-authoritative landing resolver URL
      const queryParams = new URLSearchParams();
      queryParams.set('portal', config.portalKey);
      queryParams.set('locale', locale);
      if (config.portalKey === 'admin' && activeWorkspace) {
        queryParams.set('workspace', activeWorkspace);
      }
      if (rawCallback) {
        queryParams.set('callbackUrl', rawCallback);
      }

      // 3. Immediately hand off to server-authoritative landing resolver API
      window.location.href = `/api/auth/landing?${queryParams.toString()}`;
    } catch (_err) {
      setError(
        isAr
          ? 'حدث خطأ غير متوقع أثناء تسجيل الدخول. يرجى المحاولة لاحقاً.'
          : 'An unexpected error occurred. Please try again.'
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" dir={dir}>
      {/* Optional Admin Workspace Selector */}
      {config.showWorkspaceSelector && (
        <PortalSelector
          activeWorkspace={activeWorkspace}
          onChange={handleWorkspaceChange}
          isAr={isAr}
        />
      )}

      {/* Email Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
          {isAr ? 'البريد الإلكتروني الرسمي' : 'Official Email Address'}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-zinc-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            disabled={isLoading}
            placeholder="name@e3.qa"
            className="w-full bg-zinc-950 border border-white/15 rounded-xl ps-10 pe-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* Password Input Component */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            {isAr ? 'كلمة المرور' : 'Password'}
          </label>
          <Link
            href={`/${locale}/forgot-password?portal=${config.portalKey}`}
            data-testid="forgot-password-link"
            className="text-xs text-zinc-400 hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
          </Link>
        </div>
        <PasswordField
          value={password}
          onChange={handlePasswordChange}
          disabled={isLoading}
          isAr={isAr}
        />
      </div>

      {/* Error Alert Box */}
      <PortalError message={error} />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        style={{ backgroundColor: config.accentColor }}
        className="w-full py-3.5 px-5 rounded-xl text-white font-extrabold text-sm tracking-wider uppercase transition-all duration-300 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg"
      >
        <span>{isLoading ? (isAr ? 'جاري التحقق...' : 'Authenticating...') : isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
      </button>

      {/* Quick Demo Credentials & Login Details Helper Drawer */}
      <div className="pt-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDemoLogins(!showDemoLogins)}
              className="flex items-center gap-2 font-bold text-zinc-300 hover:text-emerald-400 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'بيانات الدخول السريعة للاختبار' : 'Quick System Credentials'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                {showDemoLogins ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'عرض' : 'Auto-fill')}
              </span>
            </button>

            <Link
              href={`/${locale}/login/details`}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white underline-offset-4 hover:underline"
            >
              <span>{isAr ? 'دليل الحسابات الكامل' : 'All Login Details'}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {showDemoLogins && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-2 animate-in fade-in duration-200">
              <p className="text-[11px] text-zinc-400">
                {isAr
                  ? 'انقر على أي دور لتعبئة الحساب وكلمة المرور تلقائياً:'
                  : 'Click any role to populate credentials instantly:'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyQuickLogin('hr@eeeqa.com', 'hr')}
                  className="p-2 rounded-lg bg-zinc-900 border border-emerald-500/30 hover:border-emerald-500 hover:bg-zinc-800 text-start transition-all"
                >
                  <div className="font-bold text-emerald-400 text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>HR Admin</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">hr@eeeqa.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyQuickLogin('superadmin@eeeqa.com', 'super')}
                  className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-emerald-500 hover:bg-zinc-800 text-start transition-all"
                >
                  <div className="font-bold text-zinc-200 text-[11px]">Super Admin</div>
                  <div className="text-[10px] text-zinc-400 truncate">superadmin@eeeqa.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyQuickLogin('sales@e3qatar.com', 'b2b')}
                  className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-emerald-500 hover:bg-zinc-800 text-start transition-all"
                >
                  <div className="font-bold text-amber-400 text-[11px]">B2B Enterprise</div>
                  <div className="text-[10px] text-zinc-400 truncate">sales@e3qatar.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyQuickLogin('events@e3qatar.com', 'b2c')}
                  className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-emerald-500 hover:bg-zinc-800 text-start transition-all"
                >
                  <div className="font-bold text-purple-400 text-[11px]">Events / B2C</div>
                  <div className="text-[10px] text-zinc-400 truncate">events@e3qatar.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyQuickLogin('staff@e3qatar.com', 'hr')}
                  className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-emerald-500 hover:bg-zinc-800 text-start transition-all"
                >
                  <div className="font-bold text-zinc-300 text-[11px]">Operations Staff</div>
                  <div className="text-[10px] text-zinc-400 truncate">staff@e3qatar.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyQuickLogin('admin@e3.qa', 'super')}
                  className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-emerald-500 hover:bg-zinc-800 text-start transition-all"
                >
                  <div className="font-bold text-zinc-300 text-[11px]">Corporate Admin</div>
                  <div className="text-[10px] text-zinc-400 truncate">admin@e3.qa</div>
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                <span>Default Test Password: Password123!</span>
                <span className="text-emerald-400/80">Neon Live Verified</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
