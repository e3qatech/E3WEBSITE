import test from 'node:test';
import assert from 'node:assert';
import { mock } from 'node:test';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import Module from 'node:module';

test('Redis is not instantiated upon import', async (t) => {
  let constructorCount = 0;

  // We will intercept the required 'ioredis' module to spy on the constructor
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (id) {
    if (id === 'ioredis') {
      const originalIoRedis = originalRequire.apply(this, [id]);
      
      class MockRedis extends originalIoRedis {
        constructor(...args) {
          constructorCount++;
          super(...args);
        }
      }
      return MockRedis;
    }
    return originalRequire.apply(this, [id]);
  };

  // Set the environment to mimic build if needed, but we actually want to ensure
  // that even in normal runtime, *importing* the file doesn't create the client.
  process.env.NEXT_PHASE = '';
  process.env.npm_lifecycle_event = '';

  // Now import the module dynamically to ensure it uses the intercepted require
  // wait, we are using TSX, so it compiles to CJS or uses ESM. 
  // Let's just import it dynamically using `import()` which in tsx might use the same cache or we can just require it.
  const redisModule = require('../redis.ts');
  const socketModule = require('../socket.ts');

  // Verify functions exist
  assert.strictEqual(typeof redisModule.getRedisClient, 'function');
  assert.strictEqual(typeof socketModule.getIO, 'function');

  // Assert constructor was never called
  assert.strictEqual(constructorCount, 0, 'Redis constructor should not be called on module import');

  // Restore original require
  Module.prototype.require = originalRequire;
});
