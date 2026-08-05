import React from 'react';
import { requirePortalAccess, requireCandidateProfile } from '@/lib/server-auth';
import { FileText, UploadCloud, Award } from 'lucide-react';

export default async function CandidateDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const { user, talent } = await requireCandidateProfile();
  await requirePortalAccess('careers');

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {isAr ? 'شبكة الكفاءات والوظائف' : 'E3 People Careers Portal'}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2 font-display">
              {isAr ? 'ملف المترشح والطلبات' : 'Candidate Profile & Applications'}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              {isAr ? `مرحباً، ${talent ? talent.name : user.name || user.email}. متابعة الطلبات الوظيفية.` : `Welcome, ${talent ? talent.name : user.name || user.email}. Track your job applications and CV profile.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-3">
            <FileText className="w-8 h-8 text-rose-400" />
            <h3 className="text-lg font-bold text-white">{isAr ? 'الطلبات المقدمة' : 'Job Applications'}</h3>
            <p className="text-xs text-zinc-400">{isAr ? 'سجل الطلبات الموثقة' : 'Tracked Submissions'}</p>
            <div className="text-sm font-semibold text-white">{isAr ? 'طلب واحد قيد المراجعة' : '1 Application Under Review'}</div>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-3">
            <UploadCloud className="w-8 h-8 text-amber-400" />
            <h3 className="text-lg font-bold text-white">{isAr ? 'السيرة الذاتية والمستندات' : 'CV & Documents'}</h3>
            <p className="text-xs text-zinc-400">{isAr ? 'المستندات المرفقة' : 'Verified Credentials'}</p>
            <div className="text-sm font-semibold text-emerald-400">{isAr ? 'السيرة الذاتية محدثة' : 'CV Uploaded'}</div>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-3">
            <Award className="w-8 h-8 text-amber-400" />
            <h3 className="text-lg font-bold text-white">{isAr ? 'الملف الوظيفي' : 'Talent Profile'}</h3>
            <p className="text-xs text-zinc-400">{isAr ? 'المهارات والخبرات' : 'Skills & Competencies'}</p>
            <div className="text-sm font-semibold text-amber-300">{isAr ? 'الملف اكمل بنسبة 100%' : 'Profile Complete'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
