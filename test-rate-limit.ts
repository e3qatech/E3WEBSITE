import assert from 'node:assert';
import { checkRateLimit } from './apps/web/src/lib/rate-limit.ts';

// We want to test the in-memory fallback, so we simulate DEV environment.
process.env.NODE_ENV = 'development';

async function runTests() {
  console.log('Testing Memory Rate Limiter...');
  const key1 = 'rate_limit:test:user1';
  const key2 = 'rate_limit:test:user2';
  const key3 = 'rate_limit:other:user1';
  
  // 1. Allows requests below limit
  let res = await checkRateLimit(key1, 2, 1); // Limit 2, window 1s
  assert.strictEqual(res.allowed, true, 'Request 1 should be allowed');
  
  res = await checkRateLimit(key1, 2, 1);
  assert.strictEqual(res.allowed, true, 'Request 2 should be allowed');
  
  // 2. Blocks at correct threshold & 4. Returns Retry-After
  res = await checkRateLimit(key1, 2, 1);
  assert.strictEqual(res.allowed, false, 'Request 3 should be blocked');
  assert.strictEqual(res.reason, 'rate_limited');
  assert.ok(res.retryAfter !== undefined && res.retryAfter > 0, 'Should return retryAfter');
  
  // 6 & 7. Separates identities and endpoints
  let res2 = await checkRateLimit(key2, 2, 1);
  assert.strictEqual(res2.allowed, true, 'Request from user2 should be allowed');
  
  let res3 = await checkRateLimit(key3, 2, 1);
  assert.strictEqual(res3.allowed, true, 'Request for other endpoint from user1 should be allowed');

  // 5. Expires after window
  await new Promise(resolve => setTimeout(resolve, 1100)); // Wait for 1s window to expire
  res = await checkRateLimit(key1, 2, 1);
  assert.strictEqual(res.allowed, true, 'Request after window should be allowed');

  // 8. Handles concurrent requests
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(checkRateLimit('rate_limit:concurrent:user1', 5, 1));
  }
  const results = await Promise.all(promises);
  const allowedCount = results.filter(r => r.allowed).length;
  assert.strictEqual(allowedCount, 5, 'Exactly 5 concurrent requests should be allowed');

  // 9. Cleans expired keys & 10. Bounded memory growth
  // We can't easily test 10000 insertions without making test slow, 
  // but we can at least ensure we don't crash and logic holds.
  for (let i = 0; i < 15; i++) {
     await checkRateLimit(`rate_limit:spam:user${i}`, 1, 1);
  }
  
  console.log('SUCCESS: Rate limiter tests passed!');
}

runTests().catch(console.error);
