import assert from 'node:assert';
import { getRedisClient, RedisUnavailableError } from './apps/web/src/lib/redis.ts';

async function runTests() {
  console.log('Testing Redis Policy...');
  
  // Test 1: Optional in Build
  process.env.NEXT_PHASE = 'phase-production-build';
  const optClient = getRedisClient('optional');
  assert.strictEqual(optClient, null, 'Optional client should be null in build');
  
  // Test 2: Required in Build
  try {
    getRedisClient('required');
    assert.fail('Should have thrown RedisUnavailableError');
  } catch (error) {
    assert.ok(error instanceof RedisUnavailableError, 'Throws RedisUnavailableError');
  }
  
  // Test 3: Optional in runtime
  process.env.NEXT_PHASE = '';
  process.env.REDIS_URL = 'redis://invalid.local:6379';
  
  const rtOptClient = getRedisClient('optional');
  assert.ok(rtOptClient !== null, 'Should return a disconnected client in optional runtime');
  
  // Test 4: Required in runtime
  const rtReqClient = getRedisClient('required');
  assert.ok(rtReqClient !== null, 'Should return a disconnected client in required runtime (it will fail on usage)');
  
  console.log('SUCCESS: Redis Policy tests passed!');
  process.exit(0);
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
