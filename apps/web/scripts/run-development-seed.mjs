import fs from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDir = path.join(__dirname, '..');
const envPath = path.join(webDir, '.env');

try {
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found in apps/web. Please pull from Vercel Development.');
    process.exit(1);
  }
  process.loadEnvFile(envPath);
} catch (e) {
  console.error('Error: Failed to load .env file.');
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
const envName = process.env.E3_DATABASE_ENV;

if (!databaseUrl) {
  console.error('Error: DATABASE_URL is not set.');
  process.exit(1);
}

if (envName !== 'development') {
  console.error(`Error: E3_DATABASE_ENV must be 'development'. Got: ${envName || 'undefined'}`);
  process.exit(1);
}

let dbUrlObj;
try {
  dbUrlObj = new URL(databaseUrl);
} catch (e) {
  console.error('Error: DATABASE_URL is not a valid URL.');
  process.exit(1);
}

const host = dbUrlObj.hostname;
const dbName = dbUrlObj.pathname.replace(/^\//, '') || 'default';

if (host === 'localhost' || host === '127.0.0.1') {
  console.error('Error: Refusing to seed localhost database.');
  process.exit(1);
}

if (!host.includes('neon.tech')) {
  console.error('Error: Refusing to seed non-Neon database.');
  process.exit(1);
}

console.log(`Environment: ${envName}`);
console.log(`Database Host: ${host}`);
console.log(`Database Name: ${dbName}`);

// Launch prisma/seed-team.ts
const child = spawn('node', ['--env-file=.env', '--import', 'tsx', 'prisma/seed-team.ts'], {
  cwd: webDir,
  stdio: 'inherit',
  shell: false
});

child.on('error', (err) => {
  console.error('Failed to start seed process:', err);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (code !== null) {
    process.exit(code);
  } else {
    process.exit(1);
  }
});
