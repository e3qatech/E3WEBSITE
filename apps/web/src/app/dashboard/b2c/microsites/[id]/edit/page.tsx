import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MicrositeEditor } from "@/components/dashboard/b2c/MicrositeEditor"

export const metadata = {
  title: 'Edit Project Microsite | B2C Dashboard',
}

export default async function EditMicrositePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const { id } = await params;

  const [microsite, attractions] = await Promise.all([
    db.projectMicrosite.findUnique({
      where: { id }
    }),
    db.attraction.findMany({
      select: { id: true, nameEn: true },
      orderBy: { nameEn: 'asc' }
    })
  ]);

  if (!microsite) {
    redirect('/dashboard/b2c/microsites');
  }

  // Pass strings and basic objects instead of full dates
  const safeMicrosite = {
    ...microsite,
    createdAt: microsite.createdAt.toISOString(),
    updatedAt: microsite.updatedAt.toISOString(),
  };

  return (
    <div className="flex-1 w-full relative">
      <MicrositeEditor initialData={safeMicrosite} attractions={attractions} />
    </div>
  )
}
