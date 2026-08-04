const { execSync } = require('child_process');

console.log('🔍 Running Dependency Audit...');

try {
  const output = execSync('pnpm audit --json', { encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024 });
  const data = JSON.parse(output);
  const metadata = data.metadata || {};
  const vulns = metadata.vulnerabilities || {};

  console.log('========================================');
  console.log('      DEPENDENCY AUDIT SUMMARY          ');
  console.log('========================================');
  console.log(`Low:       ${vulns.low || 0}`);
  console.log(`Moderate:  ${vulns.moderate || 0}`);
  console.log(`High:      ${vulns.high || 0}`);
  console.log(`Critical:  ${vulns.critical || 0}`);
  console.log('========================================\n');
} catch (error) {
  if (error.stdout) {
    try {
      const data = JSON.parse(error.stdout);
      const metadata = data.metadata || {};
      const vulns = metadata.vulnerabilities || {};

      console.log('========================================');
      console.log('      DEPENDENCY AUDIT SUMMARY          ');
      console.log('========================================');
      console.log(`Low:       ${vulns.low || 0}`);
      console.log(`Moderate:  ${vulns.moderate || 0}`);
      console.log(`High:      ${vulns.high || 0}`);
      console.log(`Critical:  ${vulns.critical || 0}`);
      console.log('========================================\n');
    } catch (e) {
      console.log('⚠️ Could not parse pnpm audit JSON output.');
    }
  } else {
    console.log('⚠️ pnpm audit completed with non-zero exit code.');
  }
}

process.exit(0);
