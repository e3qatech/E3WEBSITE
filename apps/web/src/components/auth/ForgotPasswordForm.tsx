"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PORTAL_CONFIGS } from './PortalConfigs';
import { PortalKey } from '@/lib/auth-roles';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '@/components/layout/ThemeProvider';
import { PortalIdentityPanel } from './PortalIdentityPanel';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ForgotPasswordFormProps {
  locale: 'en' | 'ar';
}

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
  const searchParams = useSearchParams();
  const rawPortal = searchParams?.get('portal') as PortalKey | null;
  const portalKey: PortalKey = rawPortal && PORTAL_CONFIGS[rawPortal] ? rawPortal : 'staff';
  const config = PORTAL_CONFIGS[portalKey];

  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          email: cleanEmail,
          portal: portalKey,
          locale,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isAr ? 'تعذر إرسال طلب إعادة التعيين.' : 'Failed to process password reset request.'));
      }

      // Always transition to generic confirmation state regardless of account existence
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || (isAr ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : 'An unexpected error occurred. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginRoute = `/${locale}/login/${portalKey}`;

  return (
    <div
      className={cn(
        'min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-500',
        isLight ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-950 text-white'
      )}
      dir={dir}
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Branded Identity Panel (Desktop) */}
        <PortalIdentityPanel config={config} isAr={isAr} />

        {/* Right Form Container */}
        <div className="bg-zinc-900/80 border border-white/10 p-6 sm:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl flex flex-col justify-between space-y-8">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {isAr ? 'استعادة الحساب' : 'Account Recovery'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LanguageToggle currentLocale={locale} />
            </div>
          </div>

          {/* Form Header */}
          <div>
            <Link
              href={loginRoute}
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors mb-4 group"
            >
              {isAr ? (
                <>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  <span>العودة إلى تسجيل الدخول</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>Back to login</span>
                </>
              )}
            </Link>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display mb-2">
              {isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Your Password'}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm">
              {isAr
                ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمناً لإنشاء كلمة مرور جديدة.'
                : 'Enter your registered email address and we will send you a secure link to create a new password.'}
            </p>
          </div>

          {/* Success Notification State */}
          {isSuccess ? (
            <div
              data-testid="forgot-password-success-state"
              className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">
                {isAr ? 'تم إرسال التعليمات' : 'Instructions Dispatched'}
              </h2>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                {isAr ? (
                  <>
                    إذا كان البريد الإلكتروني <span className="font-semibold text-white">{email}</span> مسجلاً لدينا، فقد أرسلنا رابط إعادة التعيين. يرجى التحقق من صندوق الوارد ومجلد البريد غير الهام.
                  </>
                ) : (
                  <>
                    If an account exists for <span className="font-semibold text-white">{email}</span>, a secure password reset link has been dispatched. Please check your inbox and spam folders.
                  </>
                )}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
                >
                  {isAr ? 'إرسال لبريد آخر' : 'Try another email'}
                </button>
                <Link
                  href={loginRoute}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span>{isAr ? 'العودة لتسجيل الدخول' : 'Return to Login'}</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" dir={dir}>
              {/* Email Input */}
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5"
                >
                  {isAr ? 'البريد الإلكتروني المسجل' : 'Registered Email Address'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    placeholder={isAr ? 'name@e3.qa' : 'name@e3.qa'}
                    data-testid="forgot-password-email-input"
                    className="w-full bg-zinc-950 border border-white/15 rounded-xl ps-10 pe-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-sans disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Error Alert Box */}
              {error && (
                <div
                  role="alert"
                  data-testid="forgot-password-error"
                  className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs flex items-center gap-2"
                >
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                style={{ backgroundColor: config.accentColor }}
                data-testid="forgot-password-submit-button"
                className="w-full py-3.5 px-5 rounded-xl text-white font-extrabold text-sm tracking-wider uppercase transition-all duration-300 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg"
              >
                <span>
                  {isSubmitting
                    ? isAr
                      ? 'جاري المعالجة...'
                      : 'Sending Instructions...'
                    : isAr
                    ? 'إرسال رابط إعادة التعيين'
                    : 'Send Reset Link'}
                </span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* Security Assurance Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isAr
                  ? 'روابط إعادة التعيين مشفرة بـ SHA-256 وصالحة لمدة 60 دقيقة فقط'
                  : 'Reset tokens are SHA-256 encrypted & expire in 60 minutes'}
              </span>
            </div>
            <span>© 2026 E3 QATAR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
