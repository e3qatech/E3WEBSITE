import React from 'react';
import { requireCandidateApplication } from '@/lib/server-auth';
import { notFound } from 'next/navigation';
import { FileText, CheckCircle } from 'lucide-react';

export default async function CandidateApplicationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === 'ar';

  const { user: _user, application } = await requireCandidateApplication(id);

  if (!application) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-white/10 pb-6">
          <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full text-xs font-bold uppercase tracking-wider">
            {isAr ? 'تفاصيل الطلب الوظيفي' : 'Job Application Detail'}
          </span>
          <h1 className="text-3xl font-extrabold font-display mt-2">{application.jobTitle || 'Job Application'}</h1>
          <p className="text-zinc-400 text-sm mt-1">{isAr ? 'متابعة حالة الطلب والبيانات المقدمة' : 'Application Status & Submitted Profile'}</p>
        </div>

        <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-rose-400" />
            <div>
              <h3 className="text-lg font-bold text-white">{application.firstName} {application.lastName}</h3>
              <p className="text-xs text-zinc-400">{application.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-white/10">
            <div>
              <span className="text-zinc-400 block">{isAr ? 'حالة الطلب' : 'Status'}</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {application.status}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">{isAr ? 'تاريخ التقديم' : 'Applied On'}</span>
              <span className="font-semibold text-white mt-1 block">
                {new Date(application.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
