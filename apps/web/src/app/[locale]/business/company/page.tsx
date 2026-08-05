import React from 'react';
import { requirePortalAccess } from '@/lib/server-auth';
import { Building2 } from 'lucide-react';

export default async function BusinessCompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  await requirePortalAccess('business');

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-white/10 pb-6">
          <h1 className="text-3xl font-extrabold font-display">{isAr ? 'بيانات الشركة' : 'Company Profile'}</h1>
          <p className="text-zinc-400 text-sm mt-1">{isAr ? 'سجل الشركة المعتمد وتفاصيل العضوية' : 'Enterprise Entity Details & Membership'}</p>
        </div>

        <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <Building2 className="w-6 h-6" />
            <span className="font-bold">{isAr ? 'معلومات الشركة' : 'Company Credentials'}</span>
          </div>
          <p className="text-xs text-zinc-400">
            {isAr ? 'عضوية معتمدة في بوابة اتيليه للشركات.' : 'Verified enterprise membership in E3 Atelier Portal.'}
          </p>
        </div>
      </div>
    </div>
  );
}
