import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireClientRfpAccess, AppAuthError } from '@/lib/server-auth';
import { RfpDetailClient } from '@/components/business/RfpDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BusinessRfpDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === 'ar';

  let rfpResult: any = null;
  try {
    rfpResult = await requireClientRfpAccess(id);
  } catch (error: any) {
    if (error instanceof AppAuthError && error.statusCode === 401) {
      redirect(`/${locale}/login/business?callbackUrl=/${locale}/business/rfps/${id}`);
    }

    // Cross-tenant IDOR denial or Not Found state
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-zinc-900 border border-red-500/30 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isAr ? 'طلب غير موجود أو غير مصرح به' : 'RFP Not Found or Access Denied'}
          </h2>
          <p className="text-xs text-zinc-400">
            {isAr
              ? 'لا يمتلك هذا الحساب صلاحية الوصول إلى بيانات طلب المشروع المطلوب.'
              : 'This account does not have authorization to view the requested RFP record.'}
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

  const { client, lead } = rfpResult;

  const organizationData = client || {
    id: 'org-default',
    company: lead.company || 'Enterprise Partner',
  };

  return (
    <RfpDetailClient
      rfp={lead}
      organization={organizationData}
      locale={locale}
    />
  );
}
