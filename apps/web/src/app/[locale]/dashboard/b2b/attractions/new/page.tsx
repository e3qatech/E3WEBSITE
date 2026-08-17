import { AttractionEditor } from "@/components/dashboard/b2c/AttractionEditor"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "New Attraction | E3 Admin",
}

export default async function NewAttractionPage({
  params
}: {
  params: Promise<{ locale?: string }>
}) {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const { locale = "en" } = await params
  redirect(`/${locale}/dashboard/b2c/attractions/new`)
}
