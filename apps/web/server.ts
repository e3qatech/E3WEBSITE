process.env.TURBOPACK = '0';
process.env.NEXT_PRIVATE_LOCAL_WEBPACK = 'true';
import fs from 'node:fs';
import path from 'node:path';

// Auto-load local environment file if not set
if (!process.env.DATABASE_URL && !process.env.E3_DATABASE_URL && !process.env.POSTGRES_PRISMA_URL) {
  const candidateFiles = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), 'apps', 'web', '.env.local'),
    path.resolve(process.cwd(), '.env.production'),
    path.resolve(process.cwd(), 'apps', 'web', '.env.production'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps', 'web', '.env'),
    path.resolve(__dirname, '.env.local'),
    path.resolve(__dirname, '..', '.env.local'),
  ];
  for (const filePath of candidateFiles) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { initSocket } from './src/lib/socket'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port, turbo: false } as any)
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Hook up Socket.io server
  initSocket(server)

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port} (Custom Server + Socket.io)`)
    })
})
