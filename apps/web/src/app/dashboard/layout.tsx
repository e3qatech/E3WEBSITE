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
        <div className="flex h-screen bg-[var(--bg-level-1)] text-[var(--text-primary)] overflow-hidden transition-colors duration-300 selection:bg-[var(--color-accent)] selection:text-white">
          
          {/* Layer 1: Sidebar (Clean, unblurred solid surface) */}
          <div className="relative z-20 flex-shrink-0 bg-[var(--bg-level-2)] border-e border-[var(--border-level-1)] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]">
            <AdminSidebar />
          </div>

          {/* Layer 2 & 3: TopBar and Workspace */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:pt-0 pt-16 relative z-10 bg-[var(--bg-level-1)]">
            <SystemBroadcastBanner initialBroadcast={activeBroadcast} />
            
            <div className="border-b border-[var(--border-level-1)] bg-[var(--bg-level-1)] z-10">
              <AdminTopBar />
            </div>
            
            <main className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="mx-auto max-w-[1600px] w-full p-4 md:p-8 animate-in fade-in duration-500">
                {children}
              </div>
            </main>
          </div>
        </div>
      </ToastProvider>
    </AdminThemeProvider>
  )
}
