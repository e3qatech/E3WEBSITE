import { AttractionContentStudio } from "@/components/dashboard/b2c/attractions/AttractionContentStudio"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "New Attraction Studio | E3 Admin",
}

export default async function NewAttractionPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  return <AttractionContentStudio />
}
