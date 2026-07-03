import { db } from "@/lib/db"
import { MicrositesList } from "@/components/dashboard/b2c/MicrositesList"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: 'Project Microsites | B2C Dashboard',
}

export default async function MicrositesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const microsites = await db.projectMicrosite.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      attraction: {
        select: { nameEn: true, nameAr: true }
      }
    }
  })

  // Format dates to string to avoid serialization issues from Server Component to Client Component
  const formattedMicrosites = microsites.map(m => ({
    id: m.id,
    slug: m.slug,
    titleEn: m.titleEn,
    titleAr: m.titleAr,
    status: m.status,
    attraction: m.attraction ? {
      nameEn: m.attraction.nameEn,
      nameAr: m.attraction.nameAr,
    } : null
  }));

  return (
    <div className="flex-1 w-full relative">
      <MicrositesList initialMicrosites={formattedMicrosites} />
    </div>
  )
}
