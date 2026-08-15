import { execSync } from 'child_process';

function run(cmd: string) {
  console.log(`Running: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (_err) {
    console.error(`Command failed: ${cmd}`);
    return false;
  }
}

async function deploy() {
  console.log('--- Prisma Deployment Script ---');
  
  // Try standard deploy first
  console.log('Attempting standard prisma migrate deploy...');
  try {
    execSync('npx prisma migrate deploy --schema=prisma/schema.prisma', { stdio: 'pipe' });
    console.log('Deploy succeeded.');
    return;
  } catch (err: any) {
    const errorOutput = err.stderr ? err.stderr.toString() : (err.stdout ? err.stdout.toString() : err.message);
    console.log('Deploy encountered an error:');
    console.log(errorOutput);

    // Check if it's the P3005 error (Database schema not empty)
    if (errorOutput.includes('P3005') || errorOutput.includes('schema is not empty')) {
      console.log('Detected P3005: Database is not empty. Resolving baseline migration...');
      
      // Resolve the baseline migration
      const baselineRes = run('npx prisma migrate resolve --applied 20260805000000_add_rbac_portals_and_memberships');
      
      if (baselineRes) {
        console.log('Baseline resolved. Re-running prisma migrate deploy...');
        const retryRes = run('npx prisma migrate deploy --schema=prisma/schema.prisma');
        if (!retryRes) {
            process.exit(1);
        }
      } else {
        console.error('Failed to resolve baseline. Exiting.');
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
}

deploy();
