const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, 'apps/web/src/app/api');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace import
  if (content.includes("import { redis } from '@/lib/redis'") || content.includes('import { redis } from "@/lib/redis"')) {
    content = content.replace(/import \{ redis \} from ['"]@\/lib\/redis['"];?/, "import { getRedisClient } from '@/lib/redis';");
    changed = true;
  }

  if (changed) {
    // Replace usages
    content = content.replace(/await redis\.get/g, "await getRedisClient()?.get");
    content = content.replace(/await redis\.set/g, "await getRedisClient()?.set");
    content = content.replace(/await redis\.del/g, "await getRedisClient()?.del");
    
    // For keys, we need to ensure it falls back to an empty array if used in iteration or length check
    // e.g. const keys = await redis.keys(...)
    // becomes const keys = await getRedisClient()?.keys(...) || []
    content = content.replace(/await redis\.keys\((.*?)\)/g, "(await getRedisClient()?.keys($1) || [])");

    // Any other direct redis calls
    content = content.replace(/await redis\./g, "await getRedisClient()?.");

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walk(API_DIR);
