import React from 'react';
import { requirePortalAccess, requireStaffProfile } from '@/lib/server-auth';
import { Calendar, CheckCircle2, Bell } from 'lucide-react';

export default async function StaffDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const { user, profile } = await requireStaffProfile();
  await requirePortalAccess('staff');

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {isAr ? 'بوابة الموظفين' : 'Staff Portal'}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2 font-display">
              {isAr ? 'مرحباً، ' : 'Welcome, '}
              {profile ? `${profile.firstName} ${profile.lastName}` : user.name || user.email}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              {isAr ? 'جدول المهام التشغيلية وواجبات الموقع' : 'Operational Duty Roster & Assignment Workspace'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-3">
            <Calendar className="w-8 h-8 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">{isAr ? 'الوردية الحالية' : 'Active Shift'}</h3>
            <p className="text-xs text-zinc-400">{isAr ? 'الجدول التشغيلي المعين' : 'Assigned Operational Schedule'}</p>
            <div className="text-sm font-semibold text-emerald-400">{isAr ? 'على رأس العمل — البوابة الرئيسية' : 'On Duty — Main Gate 02'}</div>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-3">
            <CheckCircle2 className="w-8 h-8 text-amber-400" />
            <h3 className="text-lg font-bold text-white">{isAr ? 'المهام المعينة' : 'Assignments'}</h3>
            <p className="text-xs text-zinc-400">{isAr ? 'مهام الوجهة المعتمدة' : 'Verified Attraction Duties'}</p>
            <div className="text-sm font-semibold text-white">{isAr ? 'مهمتان نشطتان اليوم' : '2 Active Tasks Today'}</div>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-3">
            <Bell className="w-8 h-8 text-amber-400" />
            <h3 className="text-lg font-bold text-white">{isAr ? 'الإشعارات التشغيلية' : 'Notices'}</h3>
            <p className="text-xs text-zinc-400">{isAr ? 'التعميمات الإدارية' : 'Operational Broadcasts'}</p>
            <div className="text-sm font-semibold text-amber-300">{isAr ? 'إيجاز الوردية الساعة 14:00' : 'Shift Briefing at 14:00 QST'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
