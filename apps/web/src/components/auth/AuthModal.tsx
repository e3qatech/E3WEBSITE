"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Mail, Lock, User as UserIcon, Shield, Building2, UserCheck, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { getAuthorizedLandingRoute } from '@/lib/landing-route';
import { useToast } from '@/components/dashboard/ui/ToastProvider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  initialRole?: 'customer' | 'organiser' | 'admin';
  locale?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'customer',
  locale = 'en',
}: AuthModalProps) {
  const { toast } = useToast();
  const isAr = locale === 'ar';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'organiser' | 'admin'>(initialRole);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (selectedRole === 'admin') {
          setError(isAr ? 'تسجيل حسابات المدير غير متاح للجمهور.' : 'Admin registration is not publicly open.');
          setLoading(false);
          return;
        }

        const roleParam = selectedRole === 'organiser' ? 'CLIENT' : 'CANDIDATE';
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role: roleParam }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to register account');
        }

        toast(
          isAr ? 'تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...' : 'Account created successfully! Logging in...',
          'success'
        );

        // Auto login after sign up
        const loginRes = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (loginRes?.error) {
          setMode('login');
          setLoading(false);
          return;
        }
      } else {
        // Login mode
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          setError(
            isAr
              ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
              : 'Invalid email or password.'
          );
          setLoading(false);
          return;
        }
      }

      // Fetch session and redirect to authorized route
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const user = sessionData?.user;

      if (user) {
        const dest = getAuthorizedLandingRoute(user, locale);
        window.location.href = dest;
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (isAr ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in text-slate-100"
      role="dialog"
      aria-modal="true"
      aria-label="Authentication Modal"
    >
      <div
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl relative space-y-6"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'تسجيل الدخول' : 'LOGIN'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); if (selectedRole === 'admin') setSelectedRole('customer'); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'إنشاء حساب جديد' : 'SIGN UP'}
          </button>
        </div>

        {/* Header Title */}
        <div>
          <h2 className="text-xl font-black text-white">
            {mode === 'login'
              ? (isAr ? 'مرحباً بك مجدداً في إي ثري' : 'Welcome Back to E3')
              : (isAr ? 'انضم إلى مجتمع إي ثري' : 'Join E3 Experience')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? (isAr ? 'اختر نوع حسابك وقم بتسجيل الدخول للوصول إلى لوحة التحكم' : 'Select your account type to access your dashboard')
              : (isAr ? 'أنشئ حسابك للوصول إلى العروض والحجوزات الحصرية' : 'Create an account to access exclusive events and services')}
          </p>
        </div>

        {/* Role Picker Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedRole('customer')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
              selectedRole === 'customer'
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-md'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <UserCheck className="h-5 w-5 mb-1 text-emerald-400" />
            <span>{isAr ? 'زائر' : 'Customer'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('organiser')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
              selectedRole === 'organiser'
                ? 'border-sky-500 bg-sky-950/40 text-sky-300 shadow-md'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Building2 className="h-5 w-5 mb-1 text-sky-400" />
            <span>{isAr ? 'منظّم' : 'Organiser'}</span>
          </button>

          <button
            type="button"
            disabled={mode === 'signup'}
            onClick={() => setSelectedRole('admin')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-950/40 text-slate-600'
                : selectedRole === 'admin'
                  ? 'border-amber-500 bg-amber-950/40 text-amber-300 shadow-md'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
            title={mode === 'signup' ? (isAr ? 'تسجيل الإدارة محمي' : 'Admin sign-up is restricted') : undefined}
          >
            <Shield className="h-5 w-5 mb-1 text-amber-400" />
            <span>{isAr ? 'إدارة' : 'Admin'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                {isAr ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <div className="relative">
                <UserIcon className="absolute start-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'مثال: محمد أحمد' : 'e.g. John Doe'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {isAr ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute start-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {isAr ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute start-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-extrabold text-xs shadow-lg hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            <span>
              {loading
                ? (isAr ? 'جاري المعالجة...' : 'Processing...')
                : mode === 'login'
                  ? (isAr ? 'تسجيل الدخول' : 'Sign In')
                  : (isAr ? 'إنشاء الحساب' : 'Create Account')}
            </span>
            {!isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">
            {isAr ? 'محمي ببروتوكولات التشفير والأمان لـ E3 Qatar' : 'Protected by E3 Qatar Security & Session Policy'}
          </p>
        </div>
      </div>
    </div>
  );
}
