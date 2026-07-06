import { Plus, Calendar, ArrowRight, Settings2, Activity, CheckCircle2 } from "lucide-react"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { StatsGrid, StatItem } from "@/components/dashboard/StatsGrid"
import { KanbanBoard, Lead } from "@/components/dashboard/KanbanBoard"
import { LiveFeed, FeedItem } from "@/components/dashboard/LiveFeed"
import db from "@/lib/db"
import { auth } from "@/lib/auth"
import { format } from "date-fns"
import Link from "next/link"
import { LiveOccupancy } from "@/components/shared/LiveOccupancy"

export const metadata = {
  title: "Command Center | E3 Admin"
}

export default async function DashboardOverviewPage() {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || "Admin";

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

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
    <div className="space-y-8 pb-24 animate-fade-in-up">
      
      {/* WELCOME BAR */}
      <div className="bg-bg-level-2 border border-border-default rounded-xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
        
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight mb-2">
            {greeting}, <span className="text-accent">{userName}</span> 👋
          </h1>
          <p className="text-sm md:text-base text-text-secondary font-medium">
            Welcome to the E3 Command Center. All systems operational.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link href="/dashboard/b2c/calendar">
            <AdminButton variant="outline" leftIcon={<Calendar className="w-4 h-4" />}>
              Calendar
            </AdminButton>
          </Link>
          <Link href="/dashboard/crm/leads/new">
            <AdminButton variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              New Lead
            </AdminButton>
          </Link>
        </div>
      </div>

      {/* STATS GRID */}
      <StatsGrid stats={realStats} />

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Kanban Board */}
        <div className="lg:col-span-8 xl:col-span-9 bg-bg-level-2 border border-border-default rounded-xl p-6 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary tracking-tight">Active Inquiries</h3>
              <p className="text-sm text-text-tertiary mt-0.5">Real-time pipeline overview</p>
            </div>
            <Link href="/dashboard/crm/leads">
              <AdminButton variant="ghost" rightIcon={<ArrowRight className="w-4 h-4 rtl:-scale-x-100" />}>
                View All
              </AdminButton>
            </Link>
          </div>
          <div className="relative z-10">
            <KanbanBoard initialLeads={mappedLeads} />
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6 flex flex-col">
          
          {/* Work Queues & Approvals */}
          <div className="bg-bg-level-2 border border-border-default rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-text-primary tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-warning" strokeWidth={2.5} /> 
                Pending Approvals
              </h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-bg-level-1 rounded-lg border border-border-default hover:border-accent transition-colors cursor-pointer">
                <h4 className="font-semibold text-text-primary text-[13px] mb-0.5">Corporate Profile Update</h4>
                <p className="text-[11px] text-text-secondary">Submitted by Content Team</p>
              </div>
              <div className="p-3 bg-bg-level-1 rounded-lg border border-border-default hover:border-accent transition-colors cursor-pointer">
                <h4 className="font-semibold text-text-primary text-[13px] mb-0.5">New Partner Logo</h4>
                <p className="text-[11px] text-text-secondary">Submitted by B2B Sales</p>
              </div>
            </div>
            <Link href="/dashboard/settings/approvals">
              <AdminButton variant="ghost" fullWidth className="mt-4 text-xs font-medium">
                View Queue
              </AdminButton>
            </Link>
          </div>
          {/* Live Telemetry (Phase 6) */}
          <div className="bg-bg-level-2 border border-border-default rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-accent transition-colors">
            <div className="relative z-10 flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-text-primary tracking-tight">Live Telemetry</h3>
            </div>
            <LiveOccupancy attractionId="mock-1" initialCurrent={720} initialMax={1000} />
          </div>

          {/* Upcoming Events */}
          <div className="bg-bg-level-2 border border-border-default rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-accent transition-colors">
            
            <div className="relative z-10 flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-text-primary tracking-tight">Live Operations</h3>
              <div className="p-1.5 bg-bg-level-1 rounded border border-border-default text-text-secondary">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
              {upcomingEvents.length === 0 ? (
                <div className="text-center p-4 bg-bg-level-1 rounded-lg border border-border-default">
                  <p className="text-[13px] font-medium text-text-tertiary">No upcoming events.</p>
                </div>
              ) : upcomingEvents.map(event => (
                <div key={event.id} className="p-3 bg-bg-level-1 rounded-lg border border-border-default hover:border-accent transition-colors group/event cursor-pointer">
                  <h4 className="font-semibold text-text-primary text-[13px] mb-0.5 line-clamp-1 group-hover/event:text-accent transition-colors">{event.name}</h4>
                  <p className="text-[11px] font-medium text-text-tertiary mb-3">{event.date}</p>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-surface-active rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${event.capacity > 90 ? 'bg-error' : 'bg-accent'}`}
                        style={{ width: `${Math.min(event.capacity, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary w-7 text-right">{event.capacity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="flex-1 min-h-[300px] bg-bg-level-2 border border-border-default rounded-xl p-5 shadow-sm">
            <h3 className="text-[15px] font-semibold text-text-primary tracking-tight mb-4">Recent Activity</h3>
            <LiveFeed initialItems={feedItems} />
          </div>

        </div>
      </div>

    </div>
  )
}

