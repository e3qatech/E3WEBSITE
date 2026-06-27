import { Metadata } from "next"
import db from "@/lib/db"
import { Star, MessageSquare, ToggleRight, ToggleLeft } from "lucide-react"
import { format } from "date-fns"

export const metadata: Metadata = {
  title: "Feedback | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function FeedbackPage() {
  const feedback = await db.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      attraction: { select: { nameEn: true } }
    }
  })

  return (
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Visitor Feedback</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage B2C reviews and select featured testimonials.</p>
        </div>
      </div>

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-hover)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-4 font-bold">Visitor</th>
                <th className="p-4 font-bold">Attraction</th>
                <th className="p-4 font-bold">Rating & Review</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold text-center">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {feedback.map(item => (
                <tr key={item.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[var(--text-primary)]">{item.name || "Anonymous"}</div>
                    {item.email && <div className="text-xs text-[var(--text-secondary)] mt-1">{item.email}</div>}
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">
                    {item.attraction?.nameEn || "-"}
                  </td>
                  <td className="p-4 max-w-sm">
                    {item.title && <div className="font-bold text-[var(--text-primary)] mb-1 truncate">{item.title}</div>}
                    <div className="flex text-amber-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < (item.rating || 0) ? "fill-current" : "text-[var(--surface-active)]"}`} />
                      ))}
                    </div>
                    <div className="text-[var(--text-secondary)] truncate">{item.message}</div>
                  </td>
                  <td className="p-4 text-[var(--text-tertiary)] text-xs">
                    {format(new Date(item.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4 text-center">
                    <button className="p-2 rounded-full hover:bg-[var(--surface-active)] transition-colors">
                      {item.isFeatured ? (
                        <ToggleRight className="w-6 h-6 text-[var(--color-primary)]" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-[var(--text-tertiary)]" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {feedback.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-tertiary)]">
                    No feedback found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
