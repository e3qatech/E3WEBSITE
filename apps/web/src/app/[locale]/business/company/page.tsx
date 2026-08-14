import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireClientOrganization, AppAuthError } from '@/lib/server-auth';
import { Building2, ShieldCheck, Globe, Users, ArrowLeft, ArrowRight } from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BusinessCompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  let authResult: any = null;
  try {
    authResult = await requireClientOrganization();
  } catch (error: any) {
    if (error instanceof AppAuthError && error.statusCode === 401) {
      redirect(`/${locale}/login/business?callbackUrl=/${locale}/business/company`);
    }

    // Access denied / missing membership state for authenticated users
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-zinc-900 border border-red-500/30 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isAr ? 'غير مصرح بالدخول' : 'Access Denied'}
          </h2>
          <p className="text-xs text-zinc-400">
            {isAr
              ? 'هذا الحساب غير مرتبط بعضوية نشطة في بوابة الشركات. يرجى التواصل مع مسؤول المؤسسة.'
              : 'This account is not associated with an active enterprise membership. Please contact your organization administrator.'}
          </p>
          <Link
            href={`/${locale}/business`}
            className="inline-block px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-all"
          >
            {isAr ? 'العودة لبوابة الشركات' : 'Back to Enterprise Hub'}
          </Link>
        </div>
      </div>
    );
  }

  const { client, membership } = authResult;

  const organization = client || {
    id: 'org-default',
    company: 'Enterprise Organization',
    type: 'B2B',
    industry: 'Corporate Experience',
    website: 'https://e3.qa',
  };

  let members: any[] = [];
  if (client?.id) {
    try {
      members = await db.clientMembership.findMany({
        where: { clientId: client.id, isActive: true },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
    } catch (_e) {
      members = [];
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-zinc-950" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="border-b border-white/10 bg-zinc-900/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/business`}
              className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              {isAr ? <ArrowRight className="w-4 h-4 text-emerald-400" /> : <ArrowLeft className="w-4 h-4 text-emerald-400" />}
              <span>{isAr ? 'العودة لبوابة الشركات' : 'Back to Enterprise Hub'}</span>
            </Link>
          </div>
          <LogoutButton locale={locale} portal="business" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {isAr ? 'سجل الشركة' : 'Company Credentials'}
            </span>
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAr ? 'عضوية معتمدة' : 'Verified Entity'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-display">{organization.company}</h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            {isAr ? 'بيانات المؤسسة المعتمدة في منصة إي ثري لقطاع الأعمال' : 'Verified enterprise entity registration and active membership profile in E3 Atelier'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-2">
            <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              {isAr ? 'اسم المؤسسة' : 'Organization Legal Name'}
            </div>
            <div className="text-lg font-extrabold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>{organization.company}</span>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-2">
            <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              {isAr ? 'رتبة العضوية الحالية' : 'Membership Role'}
            </div>
            <div className="text-lg font-extrabold text-amber-300 font-mono">
              {membership?.role || 'MEMBER'}
            </div>
          </div>

          {organization.industry && (
            <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-2">
              <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                {isAr ? 'القطاع / المجال' : 'Industry Sector'}
              </div>
              <div className="text-sm font-bold text-white">
                {organization.industry}
              </div>
            </div>
          )}

          {organization.website && (
            <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-2">
              <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                {isAr ? 'الموقع الإلكتروني' : 'Official Website'}
              </div>
              <a
                href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-sky-400 hover:underline flex items-center gap-1.5"
              >
                <Globe className="w-4 h-4" />
                <span>{organization.website}</span>
              </a>
            </div>
          )}
        </div>

        {/* Member list */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-lg space-y-4 p-6">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base border-b border-white/5 pb-4">
            <Users className="w-5 h-5" />
            <h2>{isAr ? 'فريق العمل المعتمد للمؤسسة' : 'Organization Authorized Team'}</h2>
          </div>

          <div className="divide-y divide-white/5">
            {members.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white">{m.user.name || m.user.email}</div>
                  <div className="text-xs text-zinc-400">{m.user.email}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-mono font-bold uppercase">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
