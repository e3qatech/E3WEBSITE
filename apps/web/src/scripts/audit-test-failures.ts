/**
 * Audit specific failing test files individually to get exact test names and failure reasons
 */
import { execSync } from 'child_process';

const FAILING_SUITES = [
  'src/tests/attraction_studio_hardening.test.ts',
  'src/tests/chat_rate_limit_preview_fix.test.ts',
  'src/tests/gate11.launch.test.ts',
  'src/tests/gate16.pulse_orbit_auth.test.ts',
  'src/tests/public_business_connections.test.ts',
  'src/tests/qf25_public_settings_credential_redaction.test.tsx',
];

console.log('=== AUDITING PRE-EXISTING FAILING SUITES ===\n');

for (const suite of FAILING_SUITES) {
  console.log(`\n======================================================`);
  console.log(`Running: ${suite}`);
  console.log(`======================================================`);
  try {
    const output = execSync(`npx vitest run ${suite} --reporter=verbose`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    console.log(output.split('\n').filter(l => l.includes('✓') || l.includes('×')).join('\n'));
  } catch (err: any) {
    const out = err.stdout || '';
    const errOut = err.stderr || '';
    console.log(out.split('\n').filter((l: string) => l.includes('✓') || l.includes('×') || l.includes('AssertionError') || l.includes('Error:')).slice(0, 30).join('\n'));
  }
}
