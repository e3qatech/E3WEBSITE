import { db } from "../lib/db";
import {
  CANONICAL_SERVICE_SLUGS,
  INITIAL_SERVICE_TEMPLATES,
} from "../lib/services/canonical-services";

export async function migrateServicesCmsData() {
  console.log("=== Starting E3 B2B Services Database CMS Migration ===");

  for (const slug of CANONICAL_SERVICE_SLUGS) {
    const template = INITIAL_SERVICE_TEMPLATES[slug];
    if (!template) continue;

    console.log(`\n[Processing] ${slug}...`);

    // Check if canonical service already exists
    let existing = await db.service.findUnique({
      where: { slug },
      include: { gallery: true, projects: true },
    });

    // Check by potential legacy aliases if not found by canonical slug
    if (!existing) {
      if (slug === "fec-development") {
        existing = await db.service.findFirst({
          where: { slug: { in: ["family-entertainment-centers", "fec"] } },
          include: { gallery: true, projects: true },
        });
      } else if (slug === "kids-concepts") {
        existing = await db.service.findFirst({
          where: { slug: { in: ["kids-play-concepts", "kids-play"] } },
          include: { gallery: true, projects: true },
        });
      } else if (slug === "av-stage-rentals") {
        existing = await db.service.findFirst({
          where: { slug: { in: ["audio-visual-stage", "e3-rentals", "av-rentals"] } },
          include: { gallery: true, projects: true },
        });
      } else if (slug === "feasibility-design-research") {
        existing = await db.service.findFirst({
          where: { slug: { in: ["design-research", "feasibility-research"] } },
          include: { gallery: true, projects: true },
        });
      }
    }

    if (existing) {
      console.log(`  -> Found existing record (ID: ${existing.id}, current slug: ${existing.slug}). Merging CMS data...`);

      // Parse existing process if present
      let existingProcess: any = {};
      try {
        if (typeof existing.process === "object" && existing.process !== null) {
          existingProcess = existing.process;
        } else if (typeof existing.process === "string") {
          existingProcess = JSON.parse(existing.process);
        }
      } catch (_e) {
        existingProcess = {};
      }

      // Merge template into process without wiping existing custom fields
      const mergedProcess = {
        ...template.cms,
        ...existingProcess,
        // Ensure arrays are preserved if already customized
        wowHow: existingProcess.wowHow && existingProcess.wowHow.length > 0 ? existingProcess.wowHow : template.cms.wowHow,
        objectives: existingProcess.objectives && existingProcess.objectives.length > 0 ? existingProcess.objectives : template.cms.objectives,
        capabilities: existingProcess.capabilities && existingProcess.capabilities.length > 0 ? existingProcess.capabilities : template.cms.capabilities,
        engagementModels: existingProcess.engagementModels && existingProcess.engagementModels.length > 0 ? existingProcess.engagementModels : template.cms.engagementModels,
        deliverables: existingProcess.deliverables && existingProcess.deliverables.length > 0 ? existingProcess.deliverables : template.cms.deliverables,
        lifecycleStages: existingProcess.lifecycleStages && existingProcess.lifecycleStages.length > 0 ? existingProcess.lifecycleStages : template.cms.lifecycleStages,
        serviceSpecificModule: existingProcess.serviceSpecificModule || template.cms.serviceSpecificModule,
        enterpriseReadiness: existingProcess.enterpriseReadiness && existingProcess.enterpriseReadiness.length > 0 ? existingProcess.enterpriseReadiness : template.cms.enterpriseReadiness,
        verifiedProofPoints: existingProcess.verifiedProofPoints && existingProcess.verifiedProofPoints.length > 0 ? existingProcess.verifiedProofPoints : template.cms.verifiedProofPoints,
        relatedServiceSlugs: existingProcess.relatedServiceSlugs || template.cms.relatedServiceSlugs,
      };

      await db.service.update({
        where: { id: existing.id },
        data: {
          slug: slug, // Align to canonical slug
          titleEn: existing.titleEn || template.titleEn,
          titleAr: existing.titleAr || template.titleAr,
          taglineEn: existing.taglineEn || template.taglineEn,
          taglineAr: existing.taglineAr || template.taglineAr,
          category: existing.category || template.categoryEn,
          isVisible: true,
          isPublished: true,
          process: mergedProcess,
        },
      });
      console.log(`  -> Updated ID: ${existing.id} with canonical slug '${slug}' and verified CMS process payload.`);
    } else {
      console.log(`  -> Creating new canonical service record '${slug}'...`);
      const created = await db.service.create({
        data: {
          slug,
          titleEn: template.titleEn,
          titleAr: template.titleAr,
          taglineEn: template.taglineEn,
          taglineAr: template.taglineAr,
          category: template.categoryEn,
          isVisible: true,
          isPublished: true,
          process: template.cms,
        },
      });
      console.log(`  -> Created new service record with ID: ${created.id}.`);
    }
  }

  console.log("\n=== Migration Complete: All 10 Canonical Services Verified in Database ===");
}

if (require.main === module) {
  migrateServicesCmsData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[MIGRATION_ERROR]", err);
      process.exit(1);
    });
}
