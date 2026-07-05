"use client"

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { ArrowUpRight, MapPin } from 'lucide-react'

export function CareerListings({ jobs, isAr, portal = 'SHARED' }: { jobs: any[], isAr: boolean, portal?: 'B2B' | 'B2C' | 'SHARED' }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job: any, idx: number) => {
          const applyUrl = `/${isAr ? 'ar' : 'en'}/apply?jobTitle=${encodeURIComponent(isAr ? job.titleAr : job.titleEn)}&department=${encodeURIComponent(job.department || '')}&portal=${portal}`

          return (
          <Card 
            key={idx} 
            className="group relative bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 hover:border-zinc-700/80 hover:bg-zinc-800/40 transition-all duration-300 overflow-hidden flex flex-col p-6 h-full"
          >
            {/* Subtle gradient background effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/0 via-zinc-800/0 to-zinc-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex-grow space-y-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-950/50 px-3 py-1 rounded-full">
                  {job.department}
                </span>
                <span className="text-xs font-medium text-zinc-500">
                  {job.type}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white group-hover:text-zinc-100 transition-colors">
                {isAr ? job.titleAr : job.titleEn}
              </h3>
              
              <div className="flex items-center text-zinc-400 text-sm mt-4">
                <MapPin className="w-4 h-4 me-2" />
                {job.location}
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
                {isAr ? <ArrowUpRight className="w-5 h-5 rtl:-scale-x-100" /> : <ArrowUpRight className="w-5 h-5" />}
              </Link>
            </div>
          </Card>
        )})}
      </div>
    </>
  )
}
