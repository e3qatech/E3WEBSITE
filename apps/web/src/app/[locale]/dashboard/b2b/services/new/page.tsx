import { ServicesEditor } from "@/components/dashboard/b2b/ServicesEditor";
import { db } from "@/lib/db";
import { getAllCanonicalServices } from "@/lib/services/canonical-services";

export const metadata = {
  title: "New Service | E3 B2B Management",
  description: "Create a new engineering service.",
};

export default async function NewServicePage() {
  const [attractions, caseStudies] = await Promise.all([
    db.attraction.findMany({
      select: { id: true, nameEn: true, nameAr: true }
    }),
    db.caseStudy.findMany({
      select: { id: true, slug: true, titleEn: true, titleAr: true, clientName: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const canonicalServices = getAllCanonicalServices();

  return (
    <div className="w-full">
      <ServicesEditor
        attractions={attractions}
        caseStudies={caseStudies}
        canonicalServices={canonicalServices}
      />
    </div>
  );
}
