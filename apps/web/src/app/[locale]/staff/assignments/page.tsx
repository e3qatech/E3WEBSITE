import React from 'react';
import { requirePortalAccess, requireStaffProfile } from '@/lib/server-auth';
import { CheckCircle2 } from 'lucide-react';

export default async function StaffAssignmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  await requireStaffProfile();
  await requirePortalAccess('staff');

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-white/10 pb-6">
          <h1 className="text-3xl font-extrabold font-display">{isAr ? 'المهام التشغيلية' : 'Operational Assignments'}</h1>
          <p className="text-zinc-400 text-sm mt-1">{isAr ? 'مهام الموقع والفعاليات الموكلة إليك' : 'Assigned Event & Venue Duties'}</p>
        </div>

        <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-bold">{isAr ? 'مهام اليوم' : 'Today Tasks'}</span>
          </div>
          <p className="text-xs text-zinc-400">
            {isAr ? 'جميع مهام اليوم موثقة وجاهزة للتنفيذ.' : 'All assigned operational tasks verified.'}
          </p>
        </div>
      </div>
    </div>
  );
}
