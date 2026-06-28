import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CalendarPageManager } from "@/components/dashboard/b2c/CalendarPageManager"

export const metadata = {
  title: "Calendar Page Settings | E3 Admin",
}

export default async function CalendarSettingsPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  return <CalendarPageManager />
}
