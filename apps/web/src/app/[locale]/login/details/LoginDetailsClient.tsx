"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  Building2,
  Ticket,
  Briefcase,
  UserCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Copy,
  Lock,
  ExternalLink,
  ChevronRight,
  KeyRound,
  Check,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';
import { ThemeToggle } from '@/components/auth/ThemeToggle';
import { LanguageToggle } from '@/components/auth/LanguageToggle';
import { useTheme } from '@/components/layout/ThemeProvider';
import { cn } from '@/lib/utils';

interface LoginDetailsClientProps {
  locale: 'en' | 'ar';
}

interface AccountCard {
  id: string;
  roleBadge: string;
  roleBadgeColor: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  email: string;
  password: string;
  loginUrl: string;
  workspace?: string;
  icon: any;
  scopesEn: string[];
  scopesAr: string[];
}

export function LoginDetailsClient({ locale }: LoginDetailsClientProps) {
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const accounts: AccountCard[] = [
    {
      id: 'super-admin',
      roleBadge: 'SUPER_ADMIN',
      roleBadgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      titleEn: 'Super Administrator',
      titleAr: 'المشرف العام للنظام',
      descEn: 'Root system controller with complete enterprise authority across telemetry, security, and workspaces.',
      descAr: 'المتحكم الجذري في النظام مع كامل الصلاحيات الإدارية، إعدادات الأمان ومراقبة المنصات.',
      email: 'superadmin@eeeqa.com',
      password: 'Password123!',
      loginUrl: `/${locale}/login/admin?email=superadmin@eeeqa.com&workspace=super`,
      workspace: 'super',
      icon: ShieldCheck,
      scopesEn: ['Command Center telemetry', 'User management & RBAC', 'Database migrations', 'Global settings & SEO'],
      scopesAr: ['مراقبة مركز القيادة', 'إدارة المستخدمين والأدوار', 'تحديثات قاعدة البيانات', 'الإعدادات العامة ومحركات البحث'],
    },
    {
      id: 'hr-admin',
      roleBadge: 'HR_ADMIN',
      roleBadgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      titleEn: 'HR & Talent Director',
      titleAr: 'مدير الموارد البشرية واستقطاب المواهب',
      descEn: 'Direct access to organizational team profiles, PDF batch generator, and the AI-driven Talent Acquisition Hub.',
      descAr: 'إدارة مباشرة لدليل فريق العمل، تصدير ملفات السير PDF، ومركز استقطاب الكفاءات والذكاء الاصطناعي.',
      email: 'hr@eeeqa.com',
      password: 'Password123!',
      loginUrl: `/${locale}/login/admin?email=hr@eeeqa.com&workspace=hr`,
      workspace: 'hr',
      icon: Users,
      scopesEn: ['Team Directory & PDF Profile Export', 'Talent Acquisition & AI CV Ranking', 'Job Openings Management', 'Candidate Pipeline'],
      scopesAr: ['دليل الفريق وتصدير PDF الموحد', 'مركز استقطاب الكفاءات والتقييم الذكي', 'إدارة الوظائف والشواغر', 'مسار متابعة المتقدمين'],
    },
    {
      id: 'b2b-admin',
      roleBadge: 'SALES_ADMIN / B2B_ADMIN',
      roleBadgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      titleEn: 'B2B Enterprise Director',
      titleAr: 'مدير قطاع الشركات والمبيعات',
      descEn: 'Enterprise solutions director overseeing corporate services, case studies showcase, and proposal pipelines.',
      descAr: 'إدارة حلول الشركات، دليل الخدمات الهندسية، محفظة دراسات الحالة ومسار عروض الأسعار.',
      email: 'sales@e3qatar.com',
      password: 'Password123!',
      loginUrl: `/${locale}/login/admin?email=sales@e3qatar.com&workspace=b2b`,
      workspace: 'b2b',
      icon: Building2,
      scopesEn: ['B2B Services CMS', 'Case Studies Vault', 'Client Partnerships Showcase', 'Enterprise RFP Pipeline'],
      scopesAr: ['إدارة محتوى خدمات الشركات', 'سجل دراسات الحالة والمشاريع', 'معرض الشركاء والعملاء', 'إدارة طلبات عروض الأسعار'],
    },
    {
      id: 'events-admin',
      roleBadge: 'EVENTS_ADMIN / SUPPORT_ADMIN',
      roleBadgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      titleEn: 'Events & Experiences Lead',
      titleAr: 'مسؤول الفعاليات وباقات الترفيه',
      descEn: 'Dedicated lead for B2C experiences, celebration packages, dynamic quote PDF builder, and venue schedules.',
      descAr: 'إدارة باقات الفعاليات العائلية، أعياد الميلاد، مولد عروض الأسعار PDF وجدول حجز الصالات.',
      email: 'events@e3qatar.com',
      password: 'Password123!',
      loginUrl: `/${locale}/login/events?email=events@e3qatar.com`,
      workspace: 'b2c',
      icon: Ticket,
      scopesEn: ['Celebration & Birthday Packages CMS', 'Interactive Quote Builder with PDF', 'Event Calendar & Venue Capacity', 'Customer Inquiries'],
      scopesAr: ['إدارة باقات الاحتفالات وأعياد الميلاد', 'مولد عروض الأسعار التفاعلي PDF', 'جدول الفعاليات وسعة الصالات', 'استفسارات الزوار والعملاء'],
    },
    {
      id: 'staff',
      roleBadge: 'STAFF',
      roleBadgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      titleEn: 'Operations & Field Staff',
      titleAr: 'فريق العمليات والتشغيل الميداني',
      descEn: 'On-site execution team members viewing assigned shifts, operational event duty rosters, and internal tasks.',
      descAr: 'فريق التنفيذ الميداني لمتابعة الورديات، جداول العمل التشغيلية للفعاليات، والمهام الداخلية.',
      email: 'staff@e3qatar.com',
      password: 'Password123!',
      loginUrl: `/${locale}/login/admin?email=staff@e3qatar.com&workspace=hr`,
      workspace: 'hr',
      icon: Radio,
      scopesEn: ['Internal Duty Rosters', 'Assigned Operational Tasks', 'Event Execution Schedules', 'Team Communications'],
      scopesAr: ['جداول المناوبات الداخلية', 'المهام التشغيلية المسندة', 'مواعيد تنفيذ الفعاليات', 'التواصل المؤسسي الداخلي'],
    },
    {
      id: 'client',
      roleBadge: 'CLIENT',
      roleBadgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      titleEn: 'Corporate Client / Partner',
      titleAr: 'حساب الشركاء والعملاء المؤسسيين',
      descEn: 'Dedicated external corporate client space for reviewing bespoke proposals, active RFPs, and contract milestones.',
      descAr: 'بوابة الشركات الخارجية لمراجعة المقترحات الفنية، متابعة طلبات العروض وسير المشاريع المشتركة.',
      email: 'client@e3qatar.com',
      password: 'Password123!',
      loginUrl: `/${locale}/login/business?email=client@e3qatar.com`,
      icon: Briefcase,
      scopesEn: ['Company RFP Submissions', 'Proposals & Quotations Archive', 'Project Milestone Tracking', 'Company File Vault'],
      scopesAr: ['تقديم ومتابعة طلبات العروض', 'أرشيف عروض الأسعار والعقود', 'تتبع مراحل تسليم المشاريع', 'المستندات المشتركة الآمنة'],
    },
    {
      id: 'candidate',
      roleBadge: 'CANDIDATE',
      roleBadgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      titleEn: 'Talent & Job Applicant',
      titleAr: 'مرشح / باحث عن وظيفة',
      descEn: 'Candidate career hub for tracking application statuses, interview schedules, and profile submissions.',
      descAr: 'بوابة المتقدمين للوظائف لمتابعة حالة طلبات التوظيف، مواعيد المقابلات وتحديث الملف المهني.',
      email: 'candidate@e3qatar.com',
      password: 'Password123!',
      loginUrl: `/${locale}/login/careers?email=candidate@e3qatar.com`,
      icon: UserCheck,
      scopesEn: ['Job Application Tracking', 'Interview Schedule Updates', 'Uploaded CV & Portfolio Management', 'Offer Letter Status'],
      scopesAr: ['متابعة حالة طلب التوظيف', 'مواعيد المقابلات المحددة', 'إدارة السيرة الذاتية والمرفقات', 'حالة عروض العمل'],
    },
  ];

  return (
    <div
      className={cn(
        'min-h-screen w-full p-4 sm:p-6 lg:p-12 font-sans transition-colors duration-500',
        isLight ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-950 text-white'
      )}
      dir={dir}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-extrabold text-black text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              E3
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                E3 QATAR
              </div>
              <div className="text-[11px] text-zinc-400">
                {isAr ? 'مركز قيادة وبوابات المنظومة' : 'Command Center & Ecosystem Portals'}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/login/admin`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 border border-white/15 text-white hover:bg-zinc-800 hover:border-emerald-500/50 transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'الدخول المباشر لمركز القيادة' : 'Go to Admin Login'}</span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
            <ThemeToggle />
            <LanguageToggle currentLocale={locale} />
          </div>
        </div>

        {/* Page Hero Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isAr ? 'الدليل الرسمي لبيانات الدخول والصلاحيات' : 'Official Portal Login Details'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            {isAr ? 'بيانات الدخول لحسابات وبوابات المنصة' : 'E3 Portals & Authentication Accounts'}
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            {isAr
              ? 'دليل الاعتماد الرسمي للمنظومة يوضح جميع الأدوار الإدارية، صلاحيات كل بوابة، بيانات الحسابات الجاهزة للاختبار، وإمكانية الدخول المباشر بنقرة واحدة.'
              : 'Complete directory of administrative workspaces, functional role authorities, and live verified test credentials with one-click direct sign-in.'}
          </p>

          {/* Master Password Announcement */}
          <div className="inline-flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-emerald-950/30 border border-emerald-500/30 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? 'كلمة المرور الموحدة لحسابات الاختبار:' : 'Standard Test Password:'}</span>
            </div>
            <code className="px-2.5 py-1 rounded-lg bg-black/60 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-sm tracking-wide">
              Password123!
            </code>
            <button
              type="button"
              onClick={() => handleCopy('Password123!', 'master-password')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors flex items-center gap-1.5 font-medium"
            >
              {copiedKey === 'master-password' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isAr ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isAr ? 'نسخ كلمة المرور' : 'Copy Password'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Portals & Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => {
            const Icon = acc.icon;
            const emailKey = `email-${acc.id}`;
            const pwdKey = `pwd-${acc.id}`;

            return (
              <div
                key={acc.id}
                className="group rounded-3xl border border-white/10 bg-zinc-900/80 hover:border-emerald-500/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5"
              >
                <div className="space-y-4">
                  {/* Header & Role Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500/40 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className={cn('text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wider', acc.roleBadgeColor)}>
                      {acc.roleBadge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {isAr ? acc.titleAr : acc.titleEn}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {isAr ? acc.descAr : acc.descEn}
                    </p>
                  </div>

                  {/* Credentials Box */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2.5 text-xs">
                    {/* Email Row */}
                    <div>
                      <div className="text-[10px] font-bold uppercase text-zinc-400 mb-1">
                        {isAr ? 'البريد الإلكتروني:' : 'Email Address:'}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-emerald-300 truncate text-xs select-all">
                          {acc.email}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.email, emailKey)}
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors shrink-0"
                          title={isAr ? 'نسخ البريد' : 'Copy Email'}
                        >
                          {copiedKey === emailKey ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password Row */}
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-[10px] font-bold uppercase text-zinc-400 mb-1">
                        {isAr ? 'كلمة المرور:' : 'Password:'}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-zinc-300 text-xs">
                          {acc.password}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.password, pwdKey)}
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors shrink-0"
                          title={isAr ? 'نسخ كلمة المرور' : 'Copy Password'}
                        >
                          {copiedKey === pwdKey ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Permissions & Scopes */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold uppercase text-zinc-400">
                      {isAr ? 'الصلاحيات والوصول:' : 'Permitted Workspaces & Capabilities:'}
                    </div>
                    <ul className="space-y-1">
                      {(isAr ? acc.scopesAr : acc.scopesEn).map((scope, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-[11px] text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                          <span className="truncate">{scope}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="pt-6 mt-4 border-t border-white/10">
                  <Link
                    href={acc.loginUrl}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 border border-emerald-500/30 hover:border-emerald-500"
                  >
                    <span>{isAr ? 'تسجيل الدخول المباشر' : 'Launch & Auto-fill'}</span>
                    {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Assurance Banner */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>
              {isAr
                ? 'جميع الحسابات محمية بنظام التحقق المشفر من الجلسات (Session Revocation) وصلاحيات RBAC الدقيقة وتتوافق مع معايير قانون حماية البيانات الشخصية القطري (PDPL).'
                : 'Protected by encrypted session revocation, RBAC authoritative boundaries, and strict Qatar PDPL security standards.'}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href={`/${locale}/dashboard`}
              className="text-zinc-300 hover:text-white underline-offset-4 hover:underline font-bold"
            >
              {isAr ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}
            </Link>
            <span className="text-zinc-600">|</span>
            <span>© 2026 E3 QATAR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
