import { Plus, Calendar, Activity, CheckCircle2, MapPin } from "lucide-react"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { StatsGrid, StatItem } from "@/components/dashboard/StatsGrid"
import { KanbanBoard, Lead } from "@/components/dashboard/KanbanBoard"
import { LiveFeed, FeedItem } from "@/components/dashboard/LiveFeed"
import db from "@/lib/db"
import { auth } from "@/lib/auth"
import { format } from "date-fns"
import Link from "next/link"
import { LiveOccupancy } from "@/components/shared/LiveOccupancy"
import { LiveWebsiteChangesWidget } from "@/components/dashboard/ui/LiveWebsiteChangesWidget"
import { requirePortalAccess } from "@/lib/server-auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Command Center | E3 Admin"
}

export default async function DashboardOverviewPage({
  params
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const { locale } = (await params) || {};
  const isAr = locale === 'ar';

  let adminUser: any = null;
  try {
    adminUser = await requirePortalAccess('admin');
  } catch (_e) {
    redirect(`/${locale || 'en'}/login/admin?callbackUrl=/${locale || 'en'}/dashboard`);
  }

  const userName = adminUser?.name || adminUser?.email?.split('@')[0] || (isAr ? "المسؤول" : "Admin");

  const hour = new Date().getHours();
  const greetingEn = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const greetingAr = hour < 12 ? "صباح الخير" : "مساء الخير";
  const greeting = isAr ? greetingAr : greetingEn;

  // Fetch Real Data
  let projectsCount = 0;
  let leads: any[] = [];
  let events: any[] = [];
  let feedbacks: any[] = [];
  let systemLogs: any[] = [];

  try {
    const results = await Promise.all([
      db.caseStudy.count({ where: { isPublished: true } }).catch(() => 0),
      db.lead.findMany({ orderBy: { updatedAt: 'desc' } }).catch(() => []),
      db.calendarEvent.findMany({
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        take: 5,
        include: { attraction: true }
      }).catch(() => []),
      db.feedback.findMany({
        where: { rating: { gte: 1 } }
      }).catch(() => []),
      db.systemLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
      }).catch(() => [])
    ]);
    projectsCount = results[0] as number;
    leads = results[1] as any[];
    events = results[2] as any[];
    feedbacks = results[3] as any[];
    systemLogs = results[4] as any[];
  } catch (e) {
    console.error("Dashboard data fetch error:", e);
  }

  // Compute Real Metrics & Trends
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Leads
  const thisMonthLeads = leads.filter(l => new Date(l.createdAt) >= startOfThisMonth);
  const lastMonthLeads = leads.filter(l => new Date(l.createdAt) >= lastMonth && new Date(l.createdAt) < startOfThisMonth);
  
  const leadsTrend = lastMonthLeads.length > 0 
    ? Math.round(((thisMonthLeads.length - lastMonthLeads.length) / lastMonthLeads.length) * 100) 
    : (thisMonthLeads.length > 0 ? 100 : 0);

  // Feedbacks
  const thisMonthFeedbacks = feedbacks.filter(f => new Date(f.createdAt) >= startOfThisMonth);
  let avgFeedback = 5.0;
  if (feedbacks.length > 0) {
    avgFeedback = feedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / feedbacks.length;
  }
  let lastMonthAvgFeedback = 5.0;
  if (thisMonthFeedbacks.length > 0) {
    lastMonthAvgFeedback = thisMonthFeedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / thisMonthFeedbacks.length;
  }

  const feedbackTrend = lastMonthAvgFeedback > 0 
    ? ((avgFeedback - lastMonthAvgFeedback) / lastMonthAvgFeedback) * 100
    : 0;

  // We only show a simple trend value now, no fake history
  const realStats: StatItem[] = [
    { id: "active-projects", label: "Published Case Studies", value: projectsCount.toString(), trend: 0, trendLabel: "total published", history: [projectsCount] },
    { id: "new-leads", label: "New Leads (This Month)", value: thisMonthLeads.length.toString(), trend: leadsTrend, trendLabel: "vs last month", history: [lastMonthLeads.length, thisMonthLeads.length] },
    { id: "upcoming-events", label: "Upcoming Events", value: events.length.toString(), trend: 0, trendLabel: "scheduled", history: [events.length] },
    { id: "feedback-score", label: "Avg Feedback Score", value: avgFeedback.toFixed(1), trend: feedbackTrend, trendLabel: "vs last month", history: [lastMonthAvgFeedback, avgFeedback] },
  ]

  // Map Leads
  const mappedLeads: Lead[] = leads.slice(0, 10).map(l => ({
    id: l.id,
    name: l.firstName ? `${l.firstName} ${l.lastName}` : l.name || "Unknown",
    company: l.company || "Individual",
    value: "TBD",
    status: l.status as any,
  }))

  // Map Events
  const upcomingEvents = events.map(e => {
    const nameData = e.attraction?.name as any;
    return {
      id: e.id,
      name: nameData?.en || "Event",
      date: format(e.startDate, "MMM dd, h:mm a"),
      capacity: Math.round((e.currentBookings / (e.maxCapacity || 1)) * 100),
      status: e.startDate <= new Date() ? "live" : "upcoming"
    }
  })

  // Map Logs
  const feedItems: FeedItem[] = systemLogs.map(log => {
    let type: FeedItem['type'] = 'broadcast'
    if (log.action?.includes("LEAD")) type = 'lead'
    else if (log.action?.includes("TICKET")) type = 'ticket'
    else if (log.action?.includes("FEEDBACK")) type = 'feedback'
    
    return {
      id: log.id,
      type,
      timestamp: log.createdAt,
      data: {
        message: `System Log: ${log.action}`,
        name: log.resourceId || 'Entity',
        company: 'N/A'
      }
    }
  })

  return (
    <div className="space-y-6 md:space-y-8 pb-24 animate-in fade-in duration-500">
      
      {/* WELCOME HERO BAR */}
      <div className="rounded-2xl border border-[var(--border-level-1)] bg-gradient-to-br from-[var(--surface-default)] via-[var(--surface-default)] to-[var(--color-primary)]/5 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
        
        {/* Subtle ambient corner light */}
        <div className="absolute top-0 end-0 w-72 h-72 bg-[var(--color-primary)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isAr ? "جميع الأنظمة تعمل بكفاءة • البوابة نشطة" : "All Systems Operational • Realtime Sync Active"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {greeting}، <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-purple-500">{userName}</span> 👋
          </h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)] font-medium max-w-2xl leading-relaxed">
            {isAr 
              ? "مرحباً بك في مركز قيادة وإدارة فعاليات E3 قطر. نظرة شاملة وفورية على المؤشرات وسير العمل." 
              : "Welcome to the E3 Command Center. Executive overview of live leads, events, real-time telemetry, and CMS operations."}
          </p>
        </div>
        
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <Link href={`/${locale || 'en'}/dashboard/b2c/locations`}>
            <AdminButton variant="outline" leftIcon={<MapPin className="w-4 h-4 text-[var(--e3-royal-blue)]" />}>
              {isAr ? "المواقع والخرائط" : "Locations GIS"}
            </AdminButton>
          </Link>
          <Link href={`/${locale || 'en'}/dashboard/b2c/calendar`}>
            <AdminButton variant="outline" leftIcon={<Calendar className="w-4 h-4" />}>
              {isAr ? "التقويم" : "Calendar"}
            </AdminButton>
          </Link>
          <Link href={`/${locale || 'en'}/dashboard/crm/leads/new`}>
            <AdminButton variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              {isAr ? "عميل جديد" : "New Lead"}
            </AdminButton>
          </Link>
        </div>
      </div>

      {/* STATS GRID */}
      <StatsGrid stats={realStats} />

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* LEFT: Kanban Board */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-5 sm:p-6 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <KanbanBoard initialLeads={mappedLeads} />
          </div>
        </div>

        {/* RIGHT: Operational Sidebar Widgets */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 space-y-6 flex flex-col">
          
          {/* Work Queues & Approvals */}
          <div className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500" strokeWidth={2.5} /> 
                {isAr ? "الموافقات المعلقة" : "Pending Approvals"}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                2 {isAr ? "معلق" : "Pending"}
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="p-3 bg-[var(--bg-level-1)] rounded-xl border border-[var(--border-level-1)] hover:border-[var(--color-primary)]/50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-[var(--text-primary)] text-xs group-hover:text-[var(--color-primary)] transition-colors">Corporate Profile Update</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">CMS</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">Submitted by Content Team</p>
              </div>
              <div className="p-3 bg-[var(--bg-level-1)] rounded-xl border border-[var(--border-level-1)] hover:border-[var(--color-primary)]/50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-[var(--text-primary)] text-xs group-hover:text-[var(--color-primary)] transition-colors">New Partner Logo</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">B2B</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">Submitted by B2B Sales</p>
              </div>
            </div>
            <Link href={`/${locale || 'en'}/dashboard/settings/approvals`} className="block mt-4">
              <AdminButton variant="outline" size="sm" fullWidth className="text-xs font-semibold">
                {isAr ? "عرض قائمة الانتظار" : "View Review Queue"}
              </AdminButton>
            </Link>
          </div>

          {/* Live Telemetry */}
          <div className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-5 shadow-sm hover:border-[var(--color-primary)]/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                {isAr ? "القياس الحي للمواقع" : "Live Venue Telemetry"}
              </h3>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] font-bold">Node #104</span>
            </div>
            <LiveOccupancy attractionId="mock-1" initialCurrent={720} initialMax={1000} />
          </div>

          {/* Upcoming Events */}
          <div className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-5 shadow-sm hover:border-[var(--color-primary)]/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-500" strokeWidth={2.2} />
                {isAr ? "الفعاليات المباشرة" : "Live Operations"}
              </h3>
              <Link href={`/${locale || 'en'}/dashboard/b2c/calendar`} className="text-[11px] font-bold text-[var(--color-primary)] hover:underline">
                {isAr ? "التقويم" : "Calendar"}
              </Link>
            </div>
            
            <div className="space-y-2.5">
              {upcomingEvents.length === 0 ? (
                <div className="text-center p-4 bg-[var(--bg-level-1)] rounded-xl border border-[var(--border-level-1)]">
                  <p className="text-xs font-medium text-[var(--text-tertiary)]">{isAr ? "لا توجد فعاليات قادمة حالياً." : "No upcoming events scheduled."}</p>
                </div>
              ) : upcomingEvents.map(event => (
                <div key={event.id} className="p-3 bg-[var(--bg-level-1)] rounded-xl border border-[var(--border-level-1)] hover:border-[var(--color-primary)]/50 transition-colors group cursor-pointer">
                  <h4 className="font-bold text-[var(--text-primary)] text-xs mb-0.5 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">{event.name}</h4>
                  <p className="text-[11px] font-medium text-[var(--text-tertiary)] mb-2.5">{event.date}</p>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[var(--surface-active)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${event.capacity > 90 ? 'bg-rose-500' : 'bg-[var(--color-primary)]'}`}
                        style={{ width: `${Math.min(event.capacity, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] font-mono w-7 text-right">{event.capacity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Website Changes Widget */}
          <LiveWebsiteChangesWidget />

          {/* System Action Feed */}
          <div className="min-h-[280px]">
            <LiveFeed initialItems={feedItems} />
          </div>

        </div>
      </div>

    </div>
  )
}

