import React from 'react';
import { requireCandidateApplication } from '@/lib/server-auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Calendar, 
  User, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function getStatusBadge(status: string, isAr: boolean) {
  const s = (status || 'NEW').toUpperCase();
  switch (s) {
    case 'NEW':
    case 'SUBMITTED':
      return {
        label: isAr ? 'تم استلام الطلب' : 'Application Received',
        className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        step: 1
      };
    case 'UNDER_REVIEW':
    case 'REVIEWING':
      return {
        label: isAr ? 'قيد المراجعة والتقييم' : 'Under Evaluation',
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        step: 2
      };
    case 'SHORTLISTED':
    case 'INTERVIEW':
      return {
        label: isAr ? 'مرحلة المقابلات' : 'Interview Scheduled',
        className: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        step: 3
      };
    case 'HIRED':
    case 'ACCEPTED':
      return {
        label: isAr ? 'تم القبول والتعيين' : 'Application Accepted',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        step: 4
      };
    case 'REJECTED':
      return {
        label: isAr ? 'مكتمل (غير مستوفٍ)' : 'Not Selected',
        className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
        step: 4
      };
    default:
      return {
        label: status,
        className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
        step: 1
      };
  }
}

export default async function CandidateApplicationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  let result: any = null;
  try {
    result = await requireCandidateApplication(id);
  } catch (_err) {
    notFound();
  }

  const { application } = result || {};

  if (!application) {
    notFound();
  }

  const badge = getStatusBadge(application.status, isAr);
  const submissionDate = new Date(application.createdAt).toLocaleDateString(
    isAr ? 'ar-QA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 font-sans" dir={dir}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 1. Navigation & Breadcrumb */}
        <div>
          <Link
            href={`/${locale}/candidate`}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors group mb-4"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
            <span>{isAr ? 'العودة إلى لوحة المترشح' : 'Back to Candidate Portal'}</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {application.portal || 'SHARED'} PORTAL
                </span>
                <span className="text-zinc-500 text-xs font-mono">
                  REF: {application.id.slice(-8).toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-display text-white">
                {application.jobTitle || (isAr ? 'طلب توظيف' : 'Job Application')}
              </h1>
              {application.department && (
                <p className="text-emerald-400 text-sm font-medium mt-1">
                  {isAr ? `قسم ${application.department}` : `${application.department} Department`}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${badge.className}`}>
                {badge.label}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Status Progression Tracker (Candidate View) */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>{isAr ? 'مراحل متابعة الطلب' : 'Application Progress'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            {[
              { num: 1, titleEn: 'Submitted', titleAr: 'تم الاستلام', descEn: 'Application logged', descAr: 'تم تسجيل الطلب' },
              { num: 2, titleEn: 'Reviewing', titleAr: 'قيد المراجعة', descEn: 'Profile evaluation', descAr: 'مراجعة المؤهلات' },
              { num: 3, titleEn: 'Interview', titleAr: 'المقابلة', descEn: 'Technical stage', descAr: 'المقابلة الفنية' },
              { num: 4, titleEn: 'Decision', titleAr: 'القرار النهائي', descEn: 'Status concluded', descAr: 'اكتمال الإجراء' },
            ].map((step) => {
              const isCompleted = badge.step >= step.num;
              const isCurrent = badge.step === step.num;

              return (
                <div
                  key={step.num}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : isCompleted
                      ? 'bg-zinc-950/60 border-zinc-800 text-zinc-300'
                      : 'bg-zinc-950/30 border-zinc-900 text-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold">0{step.num}</span>
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h4 className={`text-sm font-bold ${isCurrent ? 'text-emerald-400' : isCompleted ? 'text-white' : 'text-zinc-500'}`}>
                    {isAr ? step.titleAr : step.titleEn}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isAr ? step.descAr : step.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Submitted Profile & CV Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <User className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'البيانات الشخصية المقدمة' : 'Applicant Details'}</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-zinc-500 block">{isAr ? 'الاسم الكامل' : 'Full Name'}</span>
                <span className="font-semibold text-white">
                  {application.firstName} {application.lastName}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</span>
                <span className="font-mono text-zinc-200">{application.email}</span>
              </div>
              {application.phone && (
                <div>
                  <span className="text-xs text-zinc-500 block">{isAr ? 'رقم الهاتف' : 'Phone Number'}</span>
                  <span className="font-mono text-zinc-200">{application.phone}</span>
                </div>
              )}
              <div>
                <span className="text-xs text-zinc-500 block">{isAr ? 'تاريخ ووقت التقديم' : 'Submission Date'}</span>
                <span className="text-zinc-300 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  {submissionDate}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'السيرة الذاتية والمستندات' : 'CV & Credentials'}</span>
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                {isAr
                  ? 'تم تشفير وحفظ السيرة الذاتية المقدمة بأمان لدى قسم الموارد البشرية والتوظيف في إي ثري.'
                  : 'Your submitted CV file has been encrypted and securely verified with the E3 People HR recruitment pipeline.'}
              </p>

              {application.cvUrl ? (
                <a
                  href={application.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {isAr ? 'السيرة الذاتية المرفقة' : 'Attached CV Document'}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">PDF / DOC Verified</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                </a>
              ) : (
                <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl text-xs text-zinc-500 text-center">
                  {isAr ? 'لم يتم العثور على ملف السيرة الذاتية' : 'No CV document attached'}
                </div>
              )}

              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{isAr ? 'ملف آمن وخاص بالمترشح فقط' : 'Protected candidate-owned record'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
