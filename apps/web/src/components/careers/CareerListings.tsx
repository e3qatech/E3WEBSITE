"use client";

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ArrowUpRight, MapPin, Briefcase } from 'lucide-react';
import { toTitleCase } from '@/lib/careers/job-eligibility';

export function CareerListings({ jobs, isAr, portal = 'SHARED' }: { jobs: any[], isAr: boolean, portal?: 'B2B' | 'B2C' | 'SHARED' }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-zinc-900/30 rounded-3xl border border-zinc-800/60 max-w-2xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 flex items-center justify-center mx-auto">
          <Briefcase className="w-6 h-6" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          {isAr ? 'لا توجد شواغر معلنة حالياً' : 'No Open Positions Currently'}
        </h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          {isAr
            ? 'نحن نبحث دائماً عن الكفاءات المتميزة. يمكنك تقديم طلب عام للانضمام إلى قاعدة بيانات الكفاءات لدينا.'
            : 'We are always looking for exceptional talent. Submit an open general application to join our talent pool.'}
        </p>
        <div className="pt-2">
          <Link
            href={`/${isAr ? 'ar' : 'en'}/apply?portal=${portal}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl transition-all text-sm shadow-md"
          >
            <span>{isAr ? 'تقديم طلب عام مفتوح' : 'Submit General Application'}</span>
            <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job: any, idx: number) => {
        const rawTitle = isAr ? (job.titleAr || job.titleEn || job.title || '') : (job.titleEn || job.title || '');
        const displayTitle = toTitleCase(rawTitle) || (isAr ? 'فرصة وظيفية' : 'Open Role');
        const displayDept = toTitleCase(job.department) || (isAr ? 'عام' : 'General');
        const displayLocation = toTitleCase(job.location) || (isAr ? 'الدوحة، قطر' : 'Doha, Qatar');
        const displayType = toTitleCase(job.type?.replace(/_/g, ' ') || 'Full Time');

        const jobIdParam = job.id ? `&jobId=${encodeURIComponent(job.id)}` : '';
        const applyUrl = `/${isAr ? 'ar' : 'en'}/apply?jobTitle=${encodeURIComponent(displayTitle)}&department=${encodeURIComponent(job.department || '')}&portal=${portal}${jobIdParam}`;

        return (
          <Card 
            key={job.id || idx} 
            className="group relative bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 hover:border-zinc-700/80 hover:bg-zinc-800/40 transition-all duration-300 overflow-hidden flex flex-col p-6 h-full"
          >
            {/* Subtle gradient background effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/0 via-zinc-800/0 to-zinc-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex-grow space-y-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-950/50 px-3 py-1 rounded-full">
                  {displayDept}
                </span>
                <span className="text-xs font-medium text-zinc-500">
                  {displayType}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white group-hover:text-zinc-100 transition-colors">
                {displayTitle}
              </h3>
              
              <div className="flex items-center text-zinc-400 text-sm mt-4">
                <MapPin className="w-4 h-4 me-2" />
                {displayLocation}
              </div>
            </div>
            
            <div className="relative z-10 mt-8 pt-6 border-t border-zinc-800/50 flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                {isAr ? "تقديم الطلب" : "Apply Now"}
              </span>
              <Link 
                href={applyUrl}
                className="w-10 h-10 bg-white text-zinc-950 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <ArrowUpRight className="w-5 h-5 rtl:-scale-x-100" />
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
