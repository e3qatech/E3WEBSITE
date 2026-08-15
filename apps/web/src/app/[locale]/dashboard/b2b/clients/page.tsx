import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PartnersClient } from "@/components/dashboard/b2b/PartnersClient";
import { isB2BAuthorized } from "@/lib/partners/partner-resolver";

export const metadata: Metadata = {
  title: "B2B Partners & Clients Showcase | E3 Admin",
};

export const dynamic = 'force-dynamic';

export default async function PartnersPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  if (!session || !session.user || !isB2BAuthorized(userRole)) {
    redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/b2b/clients`);
  }

  const partners = await db.partner.findMany({
    orderBy: [
      { orderIndex: 'asc' },
      { name: 'asc' },
      { id: 'asc' }
    ]
  });

  return <PartnersClient initialData={partners} />;
}
