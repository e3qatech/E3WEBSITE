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
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, ArrowRight, ArrowLeft, ShieldCheck, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResetPasswordFormProps {
  locale: 'en' | 'ar';
}

export function ResetPasswordForm({ locale }: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  const rawPortal = searchParams?.get('portal') as PortalKey | null;
  const portalKey: PortalKey = rawPortal && PORTAL_CONFIGS[rawPortal] ? rawPortal : 'staff';
  const config = PORTAL_CONFIGS[portalKey];

  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectDestination, setRedirectDestination] = useState(`/${locale}/login/${portalKey}`);
  const [error, setError] = useState<string | null>(null);

  // Criteria validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch && Boolean(token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(isAr ? 'رمز إعادة التعيين مفقود أو غير صالح.' : 'Reset token is missing or invalid.');
      return;
    }

    if (!passwordsMatch) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      setError(
        isAr
          ? 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، وحرف كبير، وحرف صغير، ورقم.'
          : 'Password must be at least 8 characters and include uppercase, lowercase, and a number.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          token: token.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isAr ? 'تعذر إتمام إعادة تعيين كلمة المرور.' : 'Failed to reset password.'));
      }

      setIsSuccess(true);
      const targetRedirect = data.redirectUrl || `/${locale}/login/${portalKey}`;
      setRedirectDestination(targetRedirect);

      // Automatic seamless redirect
      setTimeout(() => {
        window.location.href = targetRedirect;
      }, 2500);
    } catch (err: any) {
      setError(
        err.message ||
          (isAr
            ? 'انتهت صلاحية الرابط أو تم استخدامه مسبقاً. يرجى طلب رابط جديد.'
            : 'The reset link is invalid, expired, or was already used. Please request a new link.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginRoute = `/${locale}/login/${portalKey}`;
  const forgotRoute = `/${locale}/forgot-password?portal=${portalKey}`;

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
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {isAr ? 'إنشاء كلمة مرور جديدة' : 'New Password Setup'}
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
              {isAr ? 'تعيين كلمة المرور الجديدة' : 'Set Your New Password'}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm">
              {isAr
                ? 'أنشئ كلمة مرور قوية لتأمين حسابك والوصول إلى المنصة.'
                : 'Create a strong, unique password to secure your account access.'}
            </p>
          </div>

          {/* Invalid or Missing Token State */}
          {!token && !isSuccess ? (
            <div
              data-testid="missing-token-state"
              className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-6 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">
                {isAr ? 'رابط إعادة التعيين غير صالح' : 'Invalid Reset Link'}
              </h2>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                {isAr
                  ? 'لم يتم العثور على رمز أمان صالح في الرابط. يرجى طلب رابط جديد لإعادة تعيين كلمة المرور.'
                  : 'No valid security token was found in this URL. Please request a new password reset link.'}
              </p>
              <Link
                href={forgotRoute}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors"
              >
                <span>{isAr ? 'طلب رابط جديد' : 'Request New Reset Link'}</span>
              </Link>
            </div>
          ) : isSuccess ? (
            /* Success Notification State */
            <div
              data-testid="reset-password-success-state"
              className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">
                {isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Password Reset Complete'}
              </h2>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                {isAr
                  ? 'تم تحديث كلمة المرور وإلغاء جميع الجلسات القديمة. سيتم تحويلك إلى صفحة تسجيل الدخول تلقائياً...'
                  : 'Your password has been updated and prior active sessions revoked. Redirecting to login shortly...'}
              </p>
              <div className="pt-2">
                <a
                  href={redirectDestination}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span>{isAr ? 'تسجيل الدخول الآن' : 'Sign In Now'}</span>
                  {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" dir={dir}>
              {/* New Password Input */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5"
                >
                  {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="••••••••"
                    data-testid="reset-new-password-input"
                    className="w-full bg-zinc-950 border border-white/15 rounded-xl ps-4 pe-11 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-sans disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-zinc-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5"
                >
                  {isAr ? 'تأكيد كلمة المرور' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="••••••••"
                    data-testid="reset-confirm-password-input"
                    className="w-full bg-zinc-950 border border-white/15 rounded-xl ps-4 pe-11 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-sans disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-zinc-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Real-time Password Requirements Checklist */}
              <div className="p-3.5 bg-zinc-950/60 border border-white/10 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-zinc-400 mb-1">
                  {isAr ? 'متطلبات الأمان لكلمة المرور:' : 'Password Security Requirements:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  <div className={cn('flex items-center gap-1.5', hasMinLength ? 'text-emerald-400' : 'text-zinc-400')}>
                    {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{isAr ? '8 أحرف على الأقل' : '8+ characters minimum'}</span>
                  </div>
                  <div className={cn('flex items-center gap-1.5', hasUppercase ? 'text-emerald-400' : 'text-zinc-400')}>
                    {hasUppercase ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{isAr ? 'حرف كبير واحد على الأقل (A-Z)' : 'At least 1 uppercase (A-Z)'}</span>
                  </div>
                  <div className={cn('flex items-center gap-1.5', hasLowercase ? 'text-emerald-400' : 'text-zinc-400')}>
                    {hasLowercase ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{isAr ? 'حرف صغير واحد على الأقل (a-z)' : 'At least 1 lowercase (a-z)'}</span>
                  </div>
                  <div className={cn('flex items-center gap-1.5', hasNumber ? 'text-emerald-400' : 'text-zinc-400')}>
                    {hasNumber ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{isAr ? 'رقم واحد على الأقل (0-9)' : 'At least 1 number (0-9)'}</span>
                  </div>
                </div>
                {confirmPassword && (
                  <div className={cn('pt-1 flex items-center gap-1.5 text-[11px]', passwordsMatch ? 'text-emerald-400' : 'text-red-400')}>
                    {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{passwordsMatch ? (isAr ? 'كلمتا المرور متطابقتان' : 'Passwords match') : (isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')}</span>
                  </div>
                )}
              </div>

              {/* Error Alert Box */}
              {error && (
                <div
                  role="alert"
                  data-testid="reset-password-error"
                  className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs flex items-center justify-between gap-2"
                >
                  <span>{error}</span>
                  <Link
                    href={forgotRoute}
                    className="underline text-red-300 hover:text-white shrink-0 font-semibold"
                  >
                    {isAr ? 'طلب رابط جديد' : 'Get new link'}
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                style={{ backgroundColor: config.accentColor }}
                data-testid="reset-password-submit-button"
                className="w-full py-3.5 px-5 rounded-xl text-white font-extrabold text-sm tracking-wider uppercase transition-all duration-300 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg"
              >
                <span>
                  {isSubmitting
                    ? isAr
                      ? 'جاري الحفظ...'
                      : 'Updating Password...'
                    : isAr
                    ? 'حفظ كلمة المرور الجديدة'
                    : 'Save New Password'}
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
                  ? 'تغيير كلمة المرور يبطل فورياً جميع جلسات الدخول السابقة'
                  : 'Updating password instantly invalidates all prior sessions'}
              </span>
            </div>
            <span>© 2026 E3 QATAR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
