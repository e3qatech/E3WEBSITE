import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CMSPagesClient } from "@/components/dashboard/cms/CMSPagesClient"

export const metadata = {
  title: "CMS Pages | E3 Admin",
}

export default async function CMSPagesPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN", "STAFF"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  return <CMSPagesClient />
}
