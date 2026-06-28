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
      <div className="flex h-screen bg-[var(--surface-hover)] overflow-hidden">
        
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:pt-0 pt-16 relative">
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
