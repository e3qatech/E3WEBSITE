import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MicrositeEditor } from "@/components/dashboard/b2c/MicrositeEditor"

export const metadata = {
  title: 'New Project Microsite | B2C Dashboard',
}

export default async function NewMicrositePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Fetch all attractions so we can link to them
  const attractions = await db.attraction.findMany({
    select: { id: true, nameEn: true },
    orderBy: { nameEn: 'asc' }
  });

  return (
    <div className="flex-1 w-full relative">
      <MicrositeEditor initialData={{}} attractions={attractions} />
    </div>
  )
}
