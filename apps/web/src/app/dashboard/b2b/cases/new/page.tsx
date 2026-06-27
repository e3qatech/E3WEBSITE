import { CaseEditor } from "@/components/dashboard/b2b/CaseEditor"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "New Case Study | E3 Admin",
}

export default async function NewCasePage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  return <CaseEditor />
}
