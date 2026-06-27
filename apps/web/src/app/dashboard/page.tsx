import { Plus, X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { StatsGrid, StatItem } from "@/components/dashboard/StatsGrid"
import { KanbanBoard, Lead } from "@/components/dashboard/KanbanBoard"
import { LiveFeed, FeedItem } from "@/components/dashboard/LiveFeed"
import db from "@/lib/db"
import { auth } from "@/lib/auth"
import { format } from "date-fns"

export const metadata = {
  title: "Dashboard Overview | E3 Admin"
}

export default async function DashboardOverviewPage() {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || "Admin";

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  // 1. Fetch Real Data
  const [
    projectsCount,
    leads,
    events,
    feedbacks,
    systemLogs
  ] = await Promise.all([
    db.caseStudy.count({ where: { isPublished: true } }),
    db.lead.findMany({ orderBy: { updatedAt: 'desc' } }),
    db.eventSchedule.findMany({
      where: { startTime: { gte: new Date() } },
      orderBy: { startTime: 'asc' },
      take: 5,
      include: { attraction: true }
    }),
    db.feedback.findMany({
      where: { rating: { not: null } }
    }),
    db.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  // Aggregate Stats
  const thisMonthLeads = leads.filter(l => l.createdAt.getMonth() === new Date().getMonth()).length;
  
  let avgFeedback = 5.0;
  if (feedbacks.length > 0) {
    const total = feedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    avgFeedback = total / feedbacks.length;
  }

  const mockStats: StatItem[] = [
    { id: "active-projects", label: "Active Projects", value: projectsCount.toString(), trend: 0, trendLabel: "steady", history: [10, 15, 12, 18, 20, projectsCount] },
    { id: "new-leads", label: "New Leads", value: thisMonthLeads.toString(), trend: 5, trendLabel: "this month", history: [10, 11, 10, 13, 13, thisMonthLeads] },
    { id: "upcoming-events", label: "Upcoming Events", value: events.length.toString(), trend: 0, trendLabel: "vs last month", history: [12, 10, 11, 9, 10, events.length] },
    { id: "feedback-score", label: "Feedback Score", value: avgFeedback.toFixed(1), trend: 0, trendLabel: "steady", history: [4.7, 4.8, 4.8, 4.9, 4.9, avgFeedback] },
  ]

  // Map Leads to Kanban Format
  const mappedLeads: Lead[] = leads.map(l => ({
    id: l.id,
    name: l.name,
    company: l.company || "Individual",
    value: "TBD",
    status: l.status as any,
  }))

  // Map Events
  const upcomingEvents = events.map(e => ({
    id: e.id,
    name: e.attraction?.nameEn || "Event",
    date: format(e.startTime, "MMM dd, h:mm a"),
    capacity: Math.round((e.currentCount / (e.capacityGate || 1)) * 100),
    status: e.startTime <= new Date() ? "live" : "upcoming"
  }))

  // Map Logs to Feed
  const feedItems: FeedItem[] = systemLogs.map(log => {
    let type: FeedItem['type'] = 'broadcast'
    if (log.action.includes("LEAD")) type = 'lead'
    else if (log.action.includes("TICKET")) type = 'ticket'
    else if (log.action.includes("FEEDBACK")) type = 'feedback'
    
    return {
      id: log.id,
      type,
      timestamp: log.createdAt,
      data: {
        message: `System Log: ${log.action} on ${log.entity}`,
        name: log.entity,
        company: 'N/A'
      }
    }
  })

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      
      {/* 2. WELCOME BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">
            {greeting}, {userName} 👋
          </h1>
          <p className="text-[var(--text-secondary)]">Here is what's happening today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="gap-2 bg-[var(--surface-default)]">
            <Calendar className="w-4 h-4" /> View Calendar
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Lead
          </Button>
        </div>
      </div>

      {/* 3. STATS GRID */}
      <StatsGrid stats={mockStats} />

      {/* 4. MAIN CONTENT (Kanban + Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Kanban Board */}
        <div className="lg:col-span-8 xl:col-span-9 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black text-[var(--text-primary)]">Live Lead Funnel</h3>
          </div>
          <KanbanBoard initialLeads={mappedLeads} />
        </div>

        {/* RIGHT: Sidebar (Events, Subscribers, Feed) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-8">
          
          {/* Upcoming Events */}
          <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-6">
            <h3 className="text-lg font-black text-[var(--text-primary)] mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">No upcoming events.</p>
              ) : upcomingEvents.map(event => (
                <div key={event.id} className="p-3 bg-[var(--surface-hover)] rounded-xl border border-[var(--border-default)]">
                  <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1 line-clamp-1">{event.name}</h4>
                  <p className="text-xs text-[var(--text-secondary)] mb-3">{event.date}</p>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[var(--border-default)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${event.capacity > 90 ? 'bg-[var(--color-error)]' : 'bg-[var(--color-primary)]'}`}
                        style={{ width: `${Math.min(event.capacity, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)]">{event.capacity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscribers Count */}
          <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-6">
            <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">Subscribers</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Newsletter & Updates</p>
            
            <div className="relative w-32 h-32 mx-auto my-4 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path
                  className="text-[var(--surface-hover)]"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[var(--color-primary)]"
                  strokeDasharray="75, 100"
                  strokeWidth="4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[var(--text-primary)]">12.4k</span>
              </div>
            </div>

            <div className="flex justify-center gap-4 text-xs font-bold text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span> Email
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--surface-hover)] border border-[var(--border-default)]"></span> SMS
              </span>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="h-[400px]">
            <LiveFeed initialItems={feedItems} />
          </div>

        </div>
      </div>

    </div>
  )
}
