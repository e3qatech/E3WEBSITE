import { Sidebar } from "@/components/layout/Sidebar"
import { ToastProvider } from "@/components/dashboard/ui/ToastProvider"
import { TopBar } from "@/components/dashboard/TopBar"
import { SystemBroadcastBanner } from "@/components/dashboard/SystemBroadcastBanner"
import db from "@/lib/db"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Fetch active broadcast (with error handling for missing tables)
  let activeBroadcast = null;
  try {
    activeBroadcast = await db.systemBroadcast.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch (e) {
    console.error("Failed to fetch system broadcast:", e);
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-zinc-950 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-primary)]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-accent)]/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:pt-0 pt-16 relative z-10">
          {/* Banner sits at the very top of the content area */}
          <SystemBroadcastBanner initialBroadcast={activeBroadcast} />
          
          <TopBar />
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

      </div>
    </ToastProvider>
  )
}
