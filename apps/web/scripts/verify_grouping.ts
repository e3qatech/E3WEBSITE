import db from '../src/lib/db';
import { resolvePublicTeamList } from '../src/lib/team/team-resolver';

async function main() {
  const members = await db.employeeProfile.findMany({
    where: { isActive: true, showOnTeamPage: true },
    orderBy: [
      { displayOrder: 'asc' },
      { order: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  const resolved = resolvePublicTeamList(members as any, 'en');
  console.log('TOTAL RESOLVED MEMBERS:', resolved.length);

  const groups = ['direction', 'imagine', 'plan', 'amplify', 'build', 'operate', 'corporate-enablement'];
  const counts: Record<string, number> = {};

  for (const g of groups) {
    const list = resolved.filter(m => m.presentationGroupKey === g);
    counts[g] = list.length;
    console.log(`\n${g.toUpperCase()} (${list.length}):`);
    list.forEach(m => console.log(` - ${m.nameEn} (${m.slug}) [${m.designation}]`));
  }

  console.log('\nFINAL COUNTS SUMMARY:', counts);
  const pattern = `${counts['direction']}/${counts['imagine']}/${counts['plan']}/${counts['amplify']}/${counts['build']}/${counts['operate']} + ${counts['corporate-enablement']}`;
  console.log('PATTERN:', pattern);
  console.log('EXPECTED: 3/5/2/2/3/4 + 2');
  console.log('MATCHES EXACT SPEC:', pattern === '3/5/2/2/3/4 + 2');
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
    process.exit(0);
  });
