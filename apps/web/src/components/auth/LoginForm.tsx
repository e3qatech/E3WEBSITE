"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PortalConfig } from './PortalConfigs';
import { PortalSelector } from './PortalSelector';
import { PasswordField } from './PasswordField';
import { PortalError } from './PortalError';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

interface LoginFormProps {
  config: PortalConfig;
  locale: 'en' | 'ar';
}

export function LoginForm({ config, locale }: LoginFormProps) {
  const searchParams = useSearchParams();
  const rawCallback = searchParams?.get('callbackUrl');

  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<'super' | 'b2b' | 'b2c'>('super');

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
      if (config.portalKey === 'admin' && activeWorkspace) {
        queryParams.set('workspace', activeWorkspace);
      }
      if (rawCallback) {
        queryParams.set('callbackUrl', rawCallback);
      }

      // 3. Immediately hand off to server-authoritative landing resolver
      window.location.href = `/${locale}/auth/landing?${queryParams.toString()}`;
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
          onChange={setActiveWorkspace}
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
            onChange={(e) => setEmail(e.target.value)}
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
          onChange={setPassword}
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
    </form>
  );
}
