import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { FileText, CheckCircle2, Clock, XCircle, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CandidateDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar'
  const session = await auth()

  if (!session || !session.user) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/candidate`)
  }

  const applications = await db.jobApplication.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'NEW':
        return { label: isAr ? 'جديد' : 'Submitted', icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' }
      case 'REVIEWING':
        return { label: isAr ? 'قيد المراجعة' : 'Under Review', icon: <Search className="w-5 h-5 text-yellow-500" />, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' }
      case 'INTERVIEW':
        return { label: isAr ? 'مقابلة' : 'Interviewing', icon: <Clock className="w-5 h-5 text-emerald-500" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' }
      case 'HIRED':
        return { label: isAr ? 'تم التعيين' : 'Hired', icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' }
      case 'REJECTED':
        return { label: isAr ? 'مرفوض' : 'Not Selected', icon: <XCircle className="w-5 h-5 text-red-500" />, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' }
      default:
        return { label: status, icon: <FileText className="w-5 h-5 text-zinc-500" />, color: 'text-zinc-500', bg: 'bg-zinc-500/10 border-zinc-500/20' }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-24 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto w-full">
        
        <div className="mb-12 border-b border-zinc-800 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isAr ? 'مرحباً،' : 'Welcome,'} {session.user.name}
            </h1>
            <p className="text-zinc-400">
              {isAr ? 'تتبع حالة طلبات التوظيف الخاصة بك هنا.' : 'Track the status of your job applications here.'}
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <Card className="p-12 text-center bg-zinc-900/50 backdrop-blur-md border-zinc-800/50">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isAr ? 'لا توجد طلبات' : 'No applications found'}
            </h3>
            <p className="text-zinc-400">
              {isAr ? 'لم تقم بالتقديم على أي وظائف بعد.' : "You haven't applied for any jobs yet."}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {isAr ? 'طلبات التوظيف' : 'Your Applications'}
            </h2>
            
            {applications.map(app => {
              const status = getStatusDisplay(app.status)
              
              return (
                <Card key={app.id} className="p-6 bg-zinc-900/40 backdrop-blur-md border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{app.jobTitle}</h3>
                        {app.department && (
                          <span className="text-xs font-bold px-2 py-1 bg-zinc-800 text-zinc-300 rounded-md">
                            {app.department}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500">
                        {isAr ? 'تاريخ التقديم:' : 'Applied on:'} {new Date(app.createdAt).toLocaleDateString(isAr ? 'ar-QA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${status.bg}`}>
                      {status.icon}
                      <div>
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                          {isAr ? 'الحالة' : 'Status'}
                        </div>
                        <div className={`font-bold ${status.color}`}>
                          {status.label}
                        </div>
                      </div>
                    </div>
                    
                  </div>
                  
                  {/* Status Progress Bar */}
                  <div className="mt-8 relative">
                    <div className="absolute top-1/2 start-0 w-full h-1 bg-zinc-800 -translate-y-1/2 rounded-full" />
                    
                    <div className="relative flex justify-between">
                      {['NEW', 'REVIEWING', 'INTERVIEW', 'HIRED'].map((step, idx) => {
                        const stepOrder = ['NEW', 'REVIEWING', 'INTERVIEW', 'HIRED']
                        const currentIdx = stepOrder.indexOf(app.status === 'REJECTED' ? 'NEW' : app.status)
                        const isCompleted = currentIdx >= idx
                        const isCurrent = currentIdx === idx
                        
                        let label = step
                        if (step === 'NEW') label = isAr ? 'تم التقديم' : 'Applied'
                        if (step === 'REVIEWING') label = isAr ? 'مراجعة' : 'Reviewing'
                        if (step === 'INTERVIEW') label = isAr ? 'مقابلة' : 'Interview'
                        if (step === 'HIRED') label = isAr ? 'تعيين' : 'Hired'

                        return (
                          <div key={step} className="flex flex-col items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-4 z-10 ${
                              app.status === 'REJECTED' && idx === 0 ? 'bg-red-500 border-zinc-900' :
                              isCurrent ? 'bg-primary border-zinc-900' : 
                              isCompleted ? 'bg-zinc-300 border-zinc-900' : 
                              'bg-zinc-800 border-zinc-900'
                            }`} />
                            <span className={`text-xs font-medium ${isCurrent ? 'text-primary' : isCompleted ? 'text-zinc-300' : 'text-zinc-600'}`}>
                              {label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
