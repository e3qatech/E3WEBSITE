import db from '../lib/db';

export interface RepairReport {
  dryRun: boolean;
  repairedFeatures: Array<{ id: string; field: string; before: string; after: string }>;
  repairedPricing: Array<{ id: string; field: string; before: string; after: string }>;
  repairedStoryTypes: Array<{ id: string; field: string; before: string; after: string }>;
}

export async function runContentRepair({ dryRun = true }: { dryRun?: boolean } = {}): Promise<RepairReport> {
  const report: RepairReport = {
    dryRun,
    repairedFeatures: [],
    repairedPricing: [],
    repairedStoryTypes: []
  };

  // 1. Audit & Repair Features (Corrupted text & Bazooka Ball translation)
  const features = await db.attractionFeature.findMany();
  for (const f of features) {
    let newDescEn = f.descriptionEn || '';
    let newTitleAr = f.titleAr || '';

    // Fix [object Object...] in descriptionEn
    if (newDescEn.includes('[object Object')) {
      const cleaned = newDescEn
        .replace(/^\[object\s*Object/i, '')
        .replace(/\]$/, '')
        .trim();

      report.repairedFeatures.push({
        id: f.id,
        field: 'descriptionEn',
        before: f.descriptionEn || '',
        after: cleaned
      });
      newDescEn = cleaned;
    }

    // Fix Bazooka Ball Arabic title
    if (f.titleEn.toLowerCase().trim() === 'bazooka ball' && (!f.titleAr || f.titleAr.toLowerCase().trim() === 'bazooka ball')) {
      const correctAr = 'بازوكا بول';
      report.repairedFeatures.push({
        id: f.id,
        field: 'titleAr',
        before: f.titleAr || '',
        after: correctAr
      });
      newTitleAr = correctAr;
    }

    if (!dryRun && (newDescEn !== (f.descriptionEn || '') || newTitleAr !== (f.titleAr || ''))) {
      await db.attractionFeature.update({
        where: { id: f.id },
        data: {
          descriptionEn: newDescEn,
          titleAr: newTitleAr
        }
      });
    }
  }

  // 2. Audit & Repair Pricing Tiers (Rookie Pass & Pro Pass Arabic titles)
  const pricing = await db.attractionPricing.findMany();
  for (const p of pricing) {
    let updatedTitleAr: string | null = null;

    if (p.titleEn.includes('Rookie Pass') && p.titleAr === 'باقة تحديات المجموعات') {
      updatedTitleAr = 'تذكرة المبتدئين – 45 دقيقة';
    } else if (p.titleEn.includes('Pro Pass') && p.titleAr === 'تذكرة القفز لمدة ساعة') {
      updatedTitleAr = 'تذكرة المحترفين – 90 دقيقة';
    }

    if (updatedTitleAr) {
      report.repairedPricing.push({
        id: p.id,
        field: 'titleAr',
        before: p.titleAr,
        after: updatedTitleAr
      });

      if (!dryRun) {
        await db.attractionPricing.update({
          where: { id: p.id },
          data: { titleAr: updatedTitleAr }
        });
      }
    }
  }

  // 3. Audit & Repair Story Types (Normalize title casing & provide rich descriptions)
  const storyTypes = await db.storyType.findMany();
  const storyTypeMeta: Record<string, { titleEn: string; descEn: string; descAr: string }> = {
    explore: {
      titleEn: 'Explore',
      descEn: 'Immersive discovery zones and thematic exploration journeys.',
      descAr: 'مناطق استكشافية غامرة ورحلات استكشاف مشوقة.'
    },
    celebrate: {
      titleEn: 'Celebrate',
      descEn: 'Event spaces, party rooms, and celebratory milestones.',
      descAr: 'مساحات للفعاليات، غرف للحفلات والاحتال بأجمل اللحظات.'
    },
    compete: {
      titleEn: 'Compete',
      descEn: 'High-energy tournaments, skill challenges, and leaderboards.',
      descAr: 'تحديات وبطولات حماسية واختبارات المهارة والتنافس.'
    },
    bounce: {
      titleEn: 'Bounce',
      descEn: 'Dynamic inflatable arenas, trampolines, and active play zones.',
      descAr: 'ساحات قفز هوائية ديناميكية، ترامبولين ومناطق لعب تفاعلية.'
    },
    drive: {
      titleEn: 'Drive',
      descEn: 'Realistic driving tracks, junior license courses, and racing circuits.',
      descAr: 'حلبات قيادة واقعية، برامج تدريب الصغار على القيادة وسباقات ممتعة.'
    },
    learn: {
      titleEn: 'Learn',
      descEn: 'Interactive educational and hands-on skill-building adventures.',
      descAr: 'مغامرات تعليمية تفاعلية وتجارب لبناء المهارات العملية.'
    },
    achieve: {
      titleEn: 'Achieve',
      descEn: 'Milestone badges, skill certifications, and achievement quests.',
      descAr: 'أوسمة إنجاز، شهادات مهارة ومهام حماسية لتجاوز التحديات.'
    },
    enjoy: {
      titleEn: 'Enjoy',
      descEn: 'Casual fun, family entertainment, and leisure activities.',
      descAr: 'ألعاب ممتعة، ترفيه عائلي وأنشطة لقضاء أمتع الأوقات.'
    },
    'family-time': {
      titleEn: 'Family Time',
      descEn: 'Shared bonding experiences suitable for all family generations.',
      descAr: 'تجارب عائلية مشتركة مناسبة لجميع الأجيال والأعمار.'
    }
  };

  for (const st of storyTypes) {
    const meta = storyTypeMeta[st.slug];
    if (meta) {
      const needsTitle = st.titleEn !== meta.titleEn;
      const needsDescEn = !st.descriptionEn || st.descriptionEn.trim() === '';
      const needsDescAr = !st.descriptionAr || st.descriptionAr.trim() === '';

      if (needsTitle || needsDescEn || needsDescAr) {
        if (needsTitle) {
          report.repairedStoryTypes.push({
            id: st.id,
            field: 'titleEn',
            before: st.titleEn,
            after: meta.titleEn
          });
        }
        if (needsDescEn) {
          report.repairedStoryTypes.push({
            id: st.id,
            field: 'descriptionEn',
            before: st.descriptionEn || '',
            after: meta.descEn
          });
        }
        if (needsDescAr) {
          report.repairedStoryTypes.push({
            id: st.id,
            field: 'descriptionAr',
            before: st.descriptionAr || '',
            after: meta.descAr
          });
        }

        if (!dryRun) {
          await db.storyType.update({
            where: { id: st.id },
            data: {
              titleEn: meta.titleEn,
              descriptionEn: st.descriptionEn && st.descriptionEn.trim() !== '' ? st.descriptionEn : meta.descEn,
              descriptionAr: st.descriptionAr && st.descriptionAr.trim() !== '' ? st.descriptionAr : meta.descAr
            }
          });
        }
      }
    }
  }

  return report;
}

async function main() {
  const isExecute = process.argv.includes('--execute');
  const dryRun = !isExecute;

  console.log(`\n=== CONTENT INTEGRITY REPAIR (${dryRun ? 'DRY-RUN' : 'LIVE EXECUTE'}) ===\n`);

  const report = await runContentRepair({ dryRun });

  console.log(`Features repaired: ${report.repairedFeatures.length}`);
  report.repairedFeatures.forEach(r => {
    console.log(`  [FEATURE ${r.id}] ${r.field}: "${r.before.substring(0, 40)}..." -> "${r.after.substring(0, 40)}..."`);
  });

  console.log(`\nPricing tiers repaired: ${report.repairedPricing.length}`);
  report.repairedPricing.forEach(r => {
    console.log(`  [PRICING ${r.id}] ${r.field}: "${r.before}" -> "${r.after}"`);
  });

  console.log(`\nStory types repaired: ${report.repairedStoryTypes.length}`);
  report.repairedStoryTypes.forEach(r => {
    console.log(`  [STORY_TYPE ${r.id}] ${r.field}: "${r.before}" -> "${r.after}"`);
  });

  if (dryRun) {
    console.log('\n[NOTICE] Dry run completed. No changes written. Run with --execute to commit repairs to database.\n');
  } else {
    console.log('\n[SUCCESS] Content repairs committed to database successfully.\n');
  }

  await db.$disconnect();
}

if (require.main === module || process.argv[1]?.includes('repair-corrupted-content')) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
