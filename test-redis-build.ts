import assert from 'node:assert';

let redisConstructorCalls = 0;
let redisConnectCalls = 0;
let redisDuplicateCalls = 0;
let socketAdapterCalls = 0;

// Mock ioredis before importing our lib
const mockRedis = class {
  constructor() {
    redisConstructorCalls++;
  }
  connect() {
    redisConnectCalls++;
  }
  duplicate() {
    redisDuplicateCalls++;
    return new mockRedis();
  }
  on() {}
  disconnect() {}
};

// Also mock Socket.IO redis adapter
const mockSocketAdapter = {
  createAdapter: () => {
    socketAdapterCalls++;
    return () => {};
  }
};

// Override require cache for ioredis and @socket.io/redis-adapter
require.cache[require.resolve('ioredis')] = {
  id: 'ioredis',
  filename: 'ioredis',
  loaded: true,
  exports: mockRedis,
  exports_default: mockRedis,
} as any;
require.cache[require.resolve('ioredis')].exports.default = mockRedis;

require.cache[require.resolve('@socket.io/redis-adapter')] = {
  id: '@socket.io/redis-adapter',
  filename: '@socket.io/redis-adapter',
  loaded: true,
  exports: mockSocketAdapter,
} as any;

// Set build env
process.env.NEXT_PHASE = 'phase-production-build';

async function runTest() {
  console.log('Testing Redis isolation during build...');
  
  // Import our libs
  const { getRedisClient, getRedisAdapterClients } = await import('./apps/web/src/lib/redis.ts');
  const { initSocket } = await import('./apps/web/src/lib/socket.ts');
  const { checkRateLimit } = await import('./apps/web/src/lib/rate-limit.ts');

  // Verify zero calls just from importing
  assert.strictEqual(redisConstructorCalls, 0, 'Redis constructor should not be called on import');

  // Verify zero calls when attempting to get client
  const client = getRedisClient('optional');
  assert.strictEqual(client, null, 'Client should be null during build');
  assert.strictEqual(redisConstructorCalls, 0, 'Redis constructor should not be called during build');

  // Verify Socket.IO adapter
  const adapterClients = getRedisAdapterClients();
  assert.strictEqual(adapterClients, null, 'Socket.IO adapter clients should be null during build');
  assert.strictEqual(socketAdapterCalls, 0, 'Socket.IO adapter should not be initialized during build');

  console.log('SUCCESS: Zero Redis clients created during build mode!');
}

runTest().catch(console.error);
