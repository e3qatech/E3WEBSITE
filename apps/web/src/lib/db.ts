import { PrismaClient } from '@prisma/client'

const createBrowserProxy = () => {
  return new Proxy({}, {
    get() {
      return new Proxy(() => Promise.resolve(null), {
        get() {
          return () => Promise.resolve([])
        }
      })
    }
  }) as any
}

const prismaClientSingleton = () => {
  if (typeof window !== 'undefined') {
    return createBrowserProxy()
  }

  // Auto-load local environment file in development if DATABASE_URL is not yet in process.env
  if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL && !process.env.E3_DATABASE_URL && !process.env.POSTGRES_PRISMA_URL) {
    try {
      const fs = require('fs');
      const path = require('path');
      const candidateFiles = [
        path.resolve(process.cwd(), '.env.local'),
        path.resolve(process.cwd(), 'apps', 'web', '.env.local'),
        path.resolve(process.cwd(), '.env.production'),
        path.resolve(process.cwd(), 'apps', 'web', '.env.production'),
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), 'apps', 'web', '.env'),
        path.resolve(__dirname, '.env.local'),
        path.resolve(__dirname, '..', '..', '.env.local'),
        path.resolve(__dirname, '..', '..', '.env')
      ];
      for (const f of candidateFiles) {
        if (fs.existsSync(f)) {
          const content = fs.readFileSync(f, 'utf8');
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
    } catch (_loadErr) {
      // Ignore env file reading errors
    }
  }

  const candidateUrls = [
    process.env.POSTGRES_PRISMA_URL,
    process.env.E3_DATABASE_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING
  ];

  const dbUrl = candidateUrls.find(
    (url) => typeof url === 'string' && (url.startsWith('postgres://') || url.startsWith('postgresql://'))
  );

  if (!dbUrl) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error('[DB ERROR] Database configuration missing: Set DATABASE_URL, POSTGRES_PRISMA_URL, or POSTGRES_URL.');
    }
  }

  let finalUrl = dbUrl || 'postgresql://postgres:postgres@127.0.0.1:5432/e3_qatar?schema=public';

  try {
    if (finalUrl.startsWith('postgres://') || finalUrl.startsWith('postgresql://')) {
      const parsedUrl = new URL(finalUrl);
      if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL && parsedUrl.hostname.includes('-pooler')) {
        parsedUrl.hostname = parsedUrl.hostname.replace('-pooler', '');
      } else if (parsedUrl.hostname.includes('-pooler')) {
        parsedUrl.searchParams.set('pgbouncer', 'true');
      }
      parsedUrl.searchParams.delete('channel_binding');
      finalUrl = parsedUrl.toString();
    }
  } catch (_e) {
    // Ignore URL parse errors
  }

  const isProduction = process.env.NODE_ENV === 'production';

  const client = new PrismaClient({
    datasources: {
      db: {
        url: finalUrl,
      },
    },
    // In production, only log errors. In development, log warnings/info too.
    log: isProduction
      ? [{ emit: 'stdout', level: 'error' }]
      : [
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'warn' },
          { emit: 'stdout', level: 'info' },
        ],
  });

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }: any) {
          // Only time queries in development to avoid perf overhead in production
          if (isProduction) {
            return query(args);
          }

          const start = performance.now();
          const TIMEOUT_MS = 15000;

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`[DB TIMEOUT] ${model}.${operation} exceeded ${TIMEOUT_MS}ms`)), TIMEOUT_MS);
          });

          try {
            const result = await Promise.race([query(args), timeoutPromise]);
            const duration = performance.now() - start;
            if (duration > 500) {
              console.warn(`[PRISMA SLOW QUERY] ${model}.${operation} took ${Math.round(duration)}ms`);
            }
            return result;
          } catch (error: any) {
            const errMsg = String(error?.message || error || '');
            console.error(`[DB ERROR] ${model}.${operation} failed:`, errMsg);
            throw error;
          }
        }
      }
    }
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const db = typeof window !== 'undefined' ? createBrowserProxy() : (globalThis.prismaGlobal ?? prismaClientSingleton())

export { db }
export default db

if (typeof window === 'undefined') {
  globalThis.prismaGlobal = db
}
