import { db } from "@/lib/db"
import { FeedbackInbox } from "@/components/dashboard/b2c/FeedbackInbox"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Feedback & Reviews | E3 Admin",
}

export default async function FeedbackPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const feedback = await db.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      attraction: {
        select: {
          nameEn: true
        }
      }
    }
  })

  // Format dates for client
  const formattedFeedback = feedback.map(f => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }))

  return <FeedbackInbox initialFeedback={formattedFeedback} />
}
