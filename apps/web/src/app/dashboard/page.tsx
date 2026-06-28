import { Plus, Calendar, ArrowRight } from "lucide-react"
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

  // Fetch Real Data with proper pluralized schema calls
  let projectsCount = 0;
  let leads: any[] = [];
  let events: any[] = [];
  let feedbacks: any[] = [];
  let systemLogs: any[] = [];

  try {
    const results = await Promise.all([
      db.caseStudies.count({ where: { isPublished: true } }).catch(() => 0),
      db.leads.findMany({ orderBy: { updatedAt: 'desc' } }).catch(() => []),
      db.calendarEvents.findMany({
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        take: 5,
        include: { attraction: true }
      }).catch(() => []),
      db.feedback.findMany({
        where: { rating: { gte: 1 } }
      }).catch(() => []),
      db.systemLogs.findMany({
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

  // Aggregate Stats
  const thisMonthLeads = leads.filter(l => l.createdAt?.getMonth() === new Date().getMonth()).length;
  
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

  // Map Leads
  const mappedLeads: Lead[] = leads.map(l => ({
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
    <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* 2. WELCOME BAR */}
      <div className="relative overflow-hidden glass border-gradient rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 group">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-accent)]/5 z-0 pointer-events-none group-hover:scale-105 transition-transform duration-1000" />
        <div className="absolute -top-24 -end-24 w-64 h-64 bg-[var(--color-primary)]/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-2">
            {greeting}, <span className="text-gradient">{userName}</span> 👋
          </h1>
          <p className="text-lg text-[var(--text-secondary)] font-medium max-w-xl">
            Welcome to the E3 Ecosystem control center. All systems operational.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-wrap items-center gap-4">
          <Button variant="outline" className="gap-2 bg-[var(--surface-default)]/80 backdrop-blur-md border-[var(--border-level-2)] hover:border-[var(--color-primary)]/50 transition-all shadow-sm rounded-xl py-6">
            <Calendar className="w-5 h-5" /> <span className="font-bold">View Calendar</span>
          </Button>
          <Button className="gap-2 shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] transition-all rounded-xl py-6">
            <Plus className="w-5 h-5" /> <span className="font-bold">New Lead</span>
          </Button>
        </div>
      </div>

      {/* 3. STATS GRID */}
      <StatsGrid stats={mockStats} />

      {/* 4. MAIN CONTENT (Kanban + Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Kanban Board */}
        <div className="lg:col-span-8 xl:col-span-9 glass border-gradient rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--surface-active)]/30 z-0 pointer-events-none" />
          <div className="relative z-10 mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Live Lead Funnel</h3>
              <p className="text-sm font-medium text-[var(--text-tertiary)] mt-1">Real-time pipeline overview</p>
            </div>
            <Button variant="ghost" className="hover:bg-[var(--surface-hover)] rounded-xl font-bold gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative z-10">
            <KanbanBoard initialLeads={mappedLeads} />
          </div>
        </div>

        {/* RIGHT: Sidebar (Events, Subscribers, Feed) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-8 flex flex-col">
          
          {/* Upcoming Events */}
          <div className="glass border-gradient rounded-[2rem] p-6 shadow-xl relative overflow-hidden group hover:border-[var(--color-primary)]/30 transition-all duration-300">
            <div className="absolute top-0 end-0 w-32 h-32 bg-[var(--color-accent)]/10 blur-[50px] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Upcoming Events</h3>
              <div className="p-2 bg-[var(--surface-active)] rounded-lg text-[var(--text-secondary)]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            
            <div className="space-y-4 relative z-10">
              {upcomingEvents.length === 0 ? (
                <div className="text-center p-6 bg-[var(--surface-active)]/50 rounded-2xl border border-[var(--border-level-1)]">
                  <p className="text-sm font-medium text-[var(--text-tertiary)]">No upcoming events.</p>
                </div>
              ) : upcomingEvents.map(event => (
                <div key={event.id} className="p-4 bg-[var(--surface-active)]/60 backdrop-blur-sm rounded-2xl border border-[var(--border-level-1)] hover:bg-[var(--surface-hover)] transition-colors group/event cursor-pointer">
                  <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1 line-clamp-1 group-hover/event:text-[var(--color-primary)] transition-colors">{event.name}</h4>
                  <p className="text-xs font-medium text-[var(--text-tertiary)] mb-4">{event.date}</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-[var(--bg-level-1)] rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${event.capacity > 90 ? 'bg-gradient-to-r from-[var(--color-warning)] to-[var(--color-error)]' : 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]'}`}
                        style={{ width: `${Math.min(event.capacity, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-[var(--text-secondary)] w-8 text-right">{event.capacity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscribers Count */}
          <div className="glass border-gradient rounded-[2rem] p-6 shadow-xl relative overflow-hidden group hover:border-[var(--color-primary)]/30 transition-all duration-300">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
            <div className="relative z-10 text-center">
              <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight mb-1">Audience</h3>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mb-6">Total Active Subscribers</p>
              
              <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 drop-shadow-xl">
                  <path
                    className="text-[var(--surface-active)]"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)] transition-all duration-1000"
                    strokeDasharray="82, 100"
                    strokeWidth="3"
                    stroke="currentColor"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-gradient">12.4k</span>
                </div>
              </div>

              <div className="flex justify-center gap-6 text-xs font-bold text-[var(--text-secondary)] mt-4">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]"></span> Email
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--surface-active)] border border-[var(--border-level-2)]"></span> SMS
                </span>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="flex-1 min-h-[400px]">
            <LiveFeed initialItems={feedItems} />
          </div>

        </div>
      </div>

    </div>
  )
}
