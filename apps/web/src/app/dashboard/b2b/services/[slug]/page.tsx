import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { ServiceEditor } from "@/components/dashboard/b2b/ServiceEditor"

export const metadata = {
  title: "Service Editor | E3 Admin",
}

export default async function EditServicePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const { slug } = await params
  
  if (slug === "new") {
    return <ServiceEditor />
  }

  const service = await db.service.findUnique({
    where: { slug },
    include: {
      projects: true,
      gallery: { orderBy: { orderIndex: 'asc' } }
    }
  })

  if (!service) {
    notFound()
  }

  return <ServiceEditor initialData={service} />
}
