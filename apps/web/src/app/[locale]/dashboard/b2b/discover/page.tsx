import { Metadata } from "next";
import db from "@/lib/db";
import { DiscoverPageManager } from "@/components/dashboard/b2c/DiscoverPageManager";

export const metadata: Metadata = {
  title: "B2B Discover Page CMS | E3 Admin",
};

export const dynamic = "force-dynamic";

export default async function B2BDiscoverDashboardPage() {
  const page = await db.pages.findFirst({
    where: {
      OR: [
        { slug: "b2b-discover" },
        { slug: "b2c-discover" },
        { slug: "discover" },
      ],
    },
  });

  const initialData = page?.content || {};

  return <DiscoverPageManager initialData={initialData as any} />;
}
