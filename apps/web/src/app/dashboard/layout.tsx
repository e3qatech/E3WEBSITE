import { AdminSidebar } from "@/components/dashboard/ui/AdminSidebar"
import { ToastProvider } from "@/components/dashboard/ui/ToastProvider"
import { AdminTopBar } from "@/components/dashboard/ui/AdminTopBar"
import { SystemBroadcastBanner } from "@/components/dashboard/SystemBroadcastBanner"
import db from "@/lib/db"
import { AdminThemeProvider } from "@/components/dashboard/ui/AdminThemeProvider"

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
    <AdminThemeProvider>
      <ToastProvider>
        <div className="flex h-screen bg-[var(--bg-level-1)] text-[var(--text-primary)] overflow-hidden relative transition-colors duration-300">
          <div className="absolute inset-0 noise-bg pointer-events-none z-0"></div>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-primary)]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-accent)]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
          
          {/* Layer 1: Sidebar */}
          <div className="relative z-10 border-e border-[var(--border-level-1)] bg-[var(--surface-default)]/50 backdrop-blur-md">
            <AdminSidebar />
          </div>

          {/* Layer 2 & 3: TopBar and Workspace */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:pt-0 pt-16 relative z-10">
            <SystemBroadcastBanner initialBroadcast={activeBroadcast} />
            
            <div className="border-b border-[var(--border-level-1)] bg-[var(--surface-default)]/50 backdrop-blur-md">
              <AdminTopBar />
            </div>
            
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </ToastProvider>
    </AdminThemeProvider>
  )
}
