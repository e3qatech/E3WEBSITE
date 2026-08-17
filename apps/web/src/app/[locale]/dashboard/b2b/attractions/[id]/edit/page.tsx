import { db } from "@/lib/db"
import { B2BAttractionEditor } from "@/components/dashboard/b2b/B2BAttractionEditor"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Edit B2B Project & Attraction | E3 Admin",
}

export default async function EditB2BAttractionPage({
  params
}: {
  params: Promise<{ locale?: string; id: string }>
}) {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const { id, locale = "en" } = await params

  // Canonical redirection to Attraction Content Studio (Stage 4: Media, Case Studies & Trust)
  redirect(`/${locale}/dashboard/b2c/attractions/${id}/edit?stage=media`)
}
