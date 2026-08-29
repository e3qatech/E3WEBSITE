import { db } from "../lib/db";
import { INITIAL_SERVICE_TEMPLATES, CANONICAL_SERVICE_SLUGS } from "../lib/services/canonical-services";

async function main() {
  console.log("=== SEEDING & MIGRATING 10 CANONICAL SERVICES WITH STRICT CLAIM GOVERNANCE ===");

  for (const slug of CANONICAL_SERVICE_SLUGS) {
    const tmpl = INITIAL_SERVICE_TEMPLATES[slug];
    if (!tmpl) {
      console.warn(`[SKIP] No template found for ${slug}`);
      continue;
    }

    const existing = await db.service.findUnique({
      where: { slug }
    });

    const updateData = {
      titleEn: tmpl.titleEn,
      titleAr: tmpl.titleAr,
      taglineEn: tmpl.taglineEn,
      taglineAr: tmpl.taglineAr,
      category: tmpl.categoryEn,
      isVisible: true,
      isPublished: true,
      process: tmpl.cms as any
    };

    if (existing) {
      await db.service.update({
        where: { id: existing.id },
        data: updateData
      });
      console.log(`[UPDATED] Service: ${slug} (ID: ${existing.id})`);
    } else {
      const created = await db.service.create({
        data: {
          slug,
          ...updateData
        }
      });
      console.log(`[CREATED] Service: ${slug} (ID: ${created.id})`);
    }
  }

  // Ensure legacy aliases remain unpublished
  const legacyAliases = ["family-entertainment-centers", "design-research", "e3-rentals"];
  for (const legacySlug of legacyAliases) {
    const leg = await db.service.findUnique({ where: { slug: legacySlug } });
    if (leg) {
      await db.service.update({
        where: { id: leg.id },
        data: { isPublished: false, isVisible: true }
      });
      console.log(`[LEGACY PROTECTED] ${legacySlug} set to isPublished: false`);
    }
  }

  console.log("=== MIGRATION COMPLETE ===");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  });
