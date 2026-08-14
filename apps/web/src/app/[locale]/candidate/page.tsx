import React from 'react';
import { requirePortalAccess, requireCandidateProfile } from '@/lib/server-auth';
import db from '@/lib/db';
import Link from 'next/link';
import { 
  FileText, 
  UploadCloud, 
  Award, 
  ArrowRight, 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ExternalLink
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';

export const dynamic = 'force-dynamic';

function getStatusBadge(status: string, isAr: boolean) {
  const s = (status || 'NEW').toUpperCase();
  switch (s) {
    case 'NEW':
    case 'SUBMITTED':
      return {
        label: isAr ? 'تم استلام الطلب' : 'Application Received',
        className: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      };
    case 'UNDER_REVIEW':
    case 'REVIEWING':
      return {
        label: isAr ? 'قيد المراجعة' : 'Under Review',
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      };
    case 'SHORTLISTED':
    case 'INTERVIEW':
      return {
        label: isAr ? 'مرحلة المقابلة' : 'Interview Stage',
        className: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      };
    case 'HIRED':
    case 'ACCEPTED':
      return {
        label: isAr ? 'تم القبول' : 'Accepted',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      };
    case 'REJECTED':
      return {
        label: isAr ? 'مكتمل (غير مستوفٍ)' : 'Not Selected',
        className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
      };
    default:
      return {
        label: status,
        className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
      };
  }
}

export default async function CandidateDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const { user } = await requireCandidateProfile();
  await requirePortalAccess('careers');

  // Fetch real submitted applications owned by this candidate (QF-06)
  let applications: any[] = [];
  try {
    applications = await db.jobApplication.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(user.email ? [{ email: user.email }] : [])
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Error fetching candidate applications:', error);
  }

  const latestCvUrl = applications.find(a => Boolean(a.cvUrl))?.cvUrl || '';
  const inReviewCount = applications.filter(a => ['NEW', 'REVIEWING', 'UNDER_REVIEW', 'INTERVIEW', 'SHORTLISTED'].includes((a.status || '').toUpperCase())).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 1. Header & Welcome Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isAr ? 'بوابة التوظيف والمترشحين' : 'E3 Candidate Portal'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight font-display">
              {isAr ? 'ملف المترشح ومتابعة الطلبات' : 'Candidate Profile & Applications'}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              {isAr
                ? `مرحباً، ${user.name || user.email}. يمكنك الاطلاع على طلباتك الوظيفية وسيرتك الذاتية المرفوعة.`
                : `Welcome back, ${user.name || user.email}. Track your submitted applications and verified credentials.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/careers`}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-200 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isAr ? 'استعراض الشواغر' : 'Browse Jobs'}</span>
            </Link>
            <LogoutButton locale={locale} />
          </div>
        </div>

        {/* 2. Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-2 backdrop-blur-md">
            <div className="p-3 bg-emerald-500/10 rounded-xl w-fit text-emerald-400 mb-2">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
              {isAr ? 'إجمالي الطلبات المقدمة' : 'Total Applications'}
            </h3>
            <div className="text-3xl font-black text-white font-display">
              {applications.length}
            </div>
            <p className="text-xs text-zinc-500">
              {isAr ? 'طلبات مسجلة في النظام' : 'Tracked submissions'}
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-2 backdrop-blur-md">
            <div className="p-3 bg-amber-500/10 rounded-xl w-fit text-amber-400 mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
              {isAr ? 'الطلبات قيد المتابعة' : 'Active In Review'}
            </h3>
            <div className="text-3xl font-black text-amber-300 font-display">
              {inReviewCount}
            </div>
            <p className="text-xs text-zinc-500">
              {isAr ? 'قيد التقييم من فريق التوظيف' : 'Under recruiter evaluation'}
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-2 backdrop-blur-md">
            <div className="p-3 bg-blue-500/10 rounded-xl w-fit text-blue-400 mb-2">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
              {isAr ? 'السيرة الذاتية المعتمدة' : 'Verified CV Document'}
            </h3>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              {latestCvUrl ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {isAr ? 'مرفقة ومحدثة' : 'Uploaded & Active'}
                </span>
              ) : (
                <span className="text-zinc-500">{isAr ? 'لم تُرفع بعد' : 'Not uploaded'}</span>
              )}
            </div>
            {latestCvUrl && (
              <a
                href={latestCvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline font-mono pt-1"
              >
                <span>{isAr ? 'معاينة المستند' : 'View Document'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* 3. Submitted Applications List */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                {isAr ? 'سجل الطلبات الوظيفية' : 'Application History'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isAr ? 'متابعة الحالة الرسمية لكل وظيفة تم التقديم عليها' : 'Official status updates for each job application'}
              </p>
            </div>
            <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-mono text-zinc-300">
              {applications.length} {isAr ? 'طلب' : 'Records'}
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-800/80 rounded-2xl flex items-center justify-center mx-auto text-zinc-500">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isAr ? 'لا توجد طلبات توظيف مسجلة حتى الآن' : 'No Applications Submitted Yet'}
              </h3>
              <p className="text-zinc-400 text-sm max-w-md mx-auto">
                {isAr
                  ? 'لم تقم بتقديم أي طلب توظيف حتى الآن. يمكنك استعراض كافة الشواغر المتاحة في قطر والتقديم مباشرة.'
                  : 'You haven\'t applied for any positions yet. Explore our open entertainment engineering roles and submit your application.'}
              </p>
              <div className="pt-2">
                <Link
                  href={`/${locale}/careers`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <span>{isAr ? 'استعراض الفرص الوظيفية' : 'Explore Open Roles'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const badge = getStatusBadge(app.status, isAr);
                const submissionDate = new Date(app.createdAt).toLocaleDateString(
                  isAr ? 'ar-QA' : 'en-US',
                  { year: 'numeric', month: 'short', day: 'numeric' }
                );

                return (
                  <div
                    key={app.id}
                    className="p-5 bg-zinc-950/60 border border-zinc-800/80 hover:border-emerald-500/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-base md:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {app.jobTitle || 'Open Position'}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                        {app.department && (
                          <span className="flex items-center gap-1 text-zinc-300">
                            <Award className="w-3.5 h-3.5 text-emerald-400" />
                            {app.department}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          {isAr ? `تاريخ التقديم: ${submissionDate}` : `Submitted: ${submissionDate}`}
                        </span>
                        <span className="font-mono text-zinc-500 text-[11px]">
                          REF: {app.id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={`/${locale}/candidate/applications/${app.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-emerald-500 hover:text-zinc-950 text-xs font-bold text-zinc-200 border border-zinc-800 hover:border-emerald-500 transition-all group/btn"
                      >
                        <span>{isAr ? 'عرض التفاصيل' : 'View Application'}</span>
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
