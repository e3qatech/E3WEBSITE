import React from 'react';
import { requirePortalAccess } from '@/lib/server-auth';
import { Building2, FolderKanban, Calendar } from 'lucide-react';

export default async function BusinessDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const user = await requirePortalAccess('business');

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {isAr ? 'بوابة اتيليه للشركات' : 'E3 Atelier Business Hub'}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2 font-display">
              {isAr ? 'لوحة تحكم الشركات' : 'Enterprise Dashboard'}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              {isAr ? `مرحباً بعودتك، ${user.name || user.email}. إدارة المشاريع والطلبات الاجتماعات.` : `Welcome back, ${user.name || user.email}. Manage company projects, files, and consultation meetings.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-3">
            <Building2 className="w-8 h-8 text-amber-400" />
            <h3 className="text-lg font-bold text-white">{isAr ? 'عضوية الشركة' : 'Company Membership'}</h3>
            <p className="text-xs text-zinc-400">{isAr ? 'حساب الشركة المعتمد' : 'Verified Enterprise Account'}</p>
            <div className="text-sm font-semibold text-amber-300">{isAr ? 'عضوية نشطة' : 'Active Membership'}</div>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-3">
            <FolderKanban className="w-8 h-8 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">{isAr ? 'المشاريع الحالية' : 'Active Projects'}</h3>
            <p className="text-xs text-zinc-400">{isAr ? 'النطاق المعماري والتقني' : 'Architectural & Tech Scope'}</p>
            <div className="text-sm font-semibold text-white">{isAr ? 'لا توجد مشاريع نشطة' : '0 Active Projects'}</div>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-3">
            <Calendar className="w-8 h-8 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">{isAr ? 'اجتماعات الاستشارة' : 'Consultation Meetings'}</h3>
            <p className="text-xs text-zinc-400">{isAr ? 'اللقاءات المجدولة' : 'Scheduled Consultations'}</p>
            <div className="text-sm font-semibold text-emerald-300">{isAr ? 'طلب اجتماع استشاري' : 'Request Consultation'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
