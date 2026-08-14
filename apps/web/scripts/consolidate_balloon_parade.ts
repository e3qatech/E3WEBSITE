import fs from 'fs';
import path from 'path';

// Auto-load env files if not set
const envFiles = ['.env.production', '.env.local', '.env'];
for (const file of envFiles) {
  const filePath = path.resolve(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

export interface ConsolidationResult {
  success: boolean;
  dryRun: boolean;
  canonicalId: string;
  canonicalSlug: string;
  duplicateId: string;
  duplicateSlug: string;
  migratedTeamMembersCount: number;
  duplicateArchived: boolean;
  backup: {
    canonicalBefore: any;
    duplicateBefore: any;
  };
}

export async function consolidateBalloonParade(dryRun = false): Promise<ConsolidationResult> {
  const { db } = await import('../src/lib/db');

  const canonical = await db.caseStudy.findUnique({
    where: { slug: 'doha-balloon-parade-2022' },
    include: { teamMembers: true }
  });

  const duplicate = await db.caseStudy.findUnique({
    where: { slug: 'doha-balloon-parade' },
    include: { teamMembers: true }
  });

  if (!canonical || !duplicate) {
    throw new Error(`Missing records: canonical=${Boolean(canonical)}, duplicate=${Boolean(duplicate)}`);
  }

  const backup = {
    canonicalBefore: JSON.parse(JSON.stringify(canonical)),
    duplicateBefore: JSON.parse(JSON.stringify(duplicate))
  };

  const canonicalAttraction = await db.attraction.findUnique({
    where: { slug: 'doha-balloon-parade-2022' },
    select: { id: true }
  });

  if (dryRun) {
    console.log('[DRY-RUN] Preflight checks passed.');
    console.log('[DRY-RUN] Canonical ID:', canonical.id, 'Duplicate ID:', duplicate.id);
    return {
      success: true,
      dryRun: true,
      canonicalId: canonical.id,
      canonicalSlug: canonical.slug,
      duplicateId: duplicate.id,
      duplicateSlug: duplicate.slug,
      migratedTeamMembersCount: 0,
      duplicateArchived: true,
      backup
    };
  }

  const result = await db.$transaction(async (tx: any) => {
    // 1. Check if duplicate has any unique team members
    let migratedCount = 0;
    for (const member of duplicate.teamMembers) {
      const existsOnCanonical = canonical.teamMembers.some(
        (m: any) => m.employeeProfileId === member.employeeProfileId
      );
      if (!existsOnCanonical) {
        await tx.caseStudyTeamMember.create({
          data: {
            caseStudyId: canonical.id,
            employeeProfileId: member.employeeProfileId,
            roleEn: member.roleEn,
            roleAr: member.roleAr,
            orderIndex: member.orderIndex
          }
        });
        migratedCount++;
      }
    }

    // 2. Ensure canonical attraction link is set if available
    if (!canonical.attractionId && canonicalAttraction) {
      await tx.caseStudy.update({
        where: { id: canonical.id },
        data: {
          attractionId: canonicalAttraction.id
        }
      });
    }

    // 3. Archive the duplicate record (never delete)
    const archivedDuplicate = await tx.caseStudy.update({
      where: { id: duplicate.id },
      data: {
        isPublished: false,
        isFeatured: false,
        seo: {
          isArchived: true,
          archivedReason: "DUPLICATE_CONSOLIDATION_QF13C",
          canonicalSlug: "doha-balloon-parade-2022",
          canonicalId: canonical.id,
          archivedAt: new Date().toISOString(),
          redirectTarget: "/b2b/cases/doha-balloon-parade-2022",
          auditNoteEn: "Archived duplicate representation consolidated into canonical 2022 project (/doha-balloon-parade-2022).",
          auditNoteAr: "تمت أرشفة السجل المكرر ودمجه في المشروع الأساسي لعام 2022 (/doha-balloon-parade-2022)."
        }
      }
    });

    return {
      success: true,
      dryRun: false,
      canonicalId: canonical.id,
      canonicalSlug: canonical.slug,
      duplicateId: archivedDuplicate.id,
      duplicateSlug: archivedDuplicate.slug,
      migratedTeamMembersCount: migratedCount,
      duplicateArchived: !archivedDuplicate.isPublished,
      backup
    };
  });

  return result;
}

if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  consolidateBalloonParade(isDryRun)
    .then((res) => {
      console.log('--- CONSOLIDATION RESULT ---');
      console.log(JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('[CONSOLIDATION ERROR]', err);
      process.exit(1);
    });
}
