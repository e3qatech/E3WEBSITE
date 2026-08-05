import React from 'react';
import { requirePortalAccess, requireStaffProfile } from '@/lib/server-auth';
import { UserCheck } from 'lucide-react';

export default async function StaffProfilePage({
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-white/10 pb-6">
          <h1 className="text-3xl font-extrabold font-display">{isAr ? 'الملف الشخصي للموظف' : 'Staff Profile'}</h1>
          <p className="text-zinc-400 text-sm mt-1">{isAr ? 'معلومات الهوية الوظيفية والتخصص' : 'Employee Identity & Designation Details'}</p>
        </div>

        <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile ? `${profile.firstName} ${profile.lastName}` : user.name}</h2>
              <p className="text-xs text-zinc-400">{profile?.designation || 'Staff Member'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-white/10">
            <div>
              <span className="text-zinc-400 block">{isAr ? 'القسم' : 'Department'}</span>
              <span className="font-semibold text-white">{profile?.department || 'Operations'}</span>
            </div>
            <div>
              <span className="text-zinc-400 block">{isAr ? 'البريد الرسمي' : 'Official Email'}</span>
              <span className="font-semibold text-white">{user.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
