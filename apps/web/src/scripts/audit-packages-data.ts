import { db } from "../lib/db";

async function main() {
  console.log("=== AUDITING PACKAGES SYSTEM DATA ===");
  
  const packageCount = await db.package.count();
  console.log(`Current Package Records: ${packageCount}`);
  
  const packages = await db.package.findMany({
    include: {
      attraction: true,
      brand: true,
      location: true,
      leads: true,
    }
  });
  
  packages.forEach((p: any) => {
    console.log(`- [${p.id}] slug: "${p.slug}", titleEn: "${p.titleEn}", category: "${p.category}", isPublished: ${p.isPublished}, leadsCount: ${p.leads.length}`);
  });

  const leadCount = await db.packageLead.count();
  console.log(`Current PackageLead Records: ${leadCount}`);

  const page = await db.pages.findFirst({
    where: {
      slug: { in: ["b2c-packages-page", "b2c-packages"] }
    }
  });
  console.log(`Pages config found: ${page ? page.slug : "None"}`);
  if (page) {
    console.log("Page content keys:", Object.keys((page.content as any) || {}));
  }

  console.log("=== AUDIT COMPLETE ===");
}

main().catch(console.error).finally(() => process.exit(0));
