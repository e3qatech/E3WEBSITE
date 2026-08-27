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

  // Auto-load local environment file if DATABASE_URL is not yet in process.env
  if (!process.env.DATABASE_URL && !process.env.E3_DATABASE_URL && !process.env.POSTGRES_PRISMA_URL) {
    try {
      const fs = require('fs');
      const path = require('path');
      const candidateFiles = [
        path.resolve(process.cwd(), '.env.local'),
        path.resolve(process.cwd(), '.env.production'),
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '..', '..', '.env.local'),
        path.resolve(process.cwd(), '..', '..', '.env')
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
      if (parsedUrl.hostname.includes('-pooler')) {
        parsedUrl.searchParams.set('pgbouncer', 'true');
      }
      parsedUrl.searchParams.delete('channel_binding');
      finalUrl = parsedUrl.toString();
    }
  } catch (_e) {
    // Ignore URL parse errors
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url: finalUrl,
      },
    },
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'info' },
      { emit: 'stdout', level: 'warn' },
    ],
  });

  // Auto-heal missing CaseStudy columns on startup/cold-start
  let hasAutoHealed = false;
  const ensureSchema = async () => {
    if (hasAutoHealed) return;
    hasAutoHealed = true;
    const statements = [
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "resultEn" TEXT`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "resultAr" TEXT`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "challengeEn" TEXT`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "challengeAr" TEXT`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "solutionEn" TEXT`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "solutionAr" TEXT`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "metrics" JSONB`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "gallery" JSONB`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "beforeAfter" JSONB`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "servicesUsed" JSONB`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "technicalSpecs" JSONB`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "testimonials" JSONB`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "heroMediaType" TEXT DEFAULT 'IMAGE'`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "thumbnailMediaType" TEXT DEFAULT 'IMAGE'`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "seo" JSONB`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "attractionId" TEXT`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "clientLogoUrl" TEXT`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE "CaseStudy" ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "isB2bVisible" BOOLEAN NOT NULL DEFAULT true`,
    ];

    for (const sql of statements) {
      try {
        await client.$executeRawUnsafe(sql).catch(() => {});
      } catch (_stmtErr) {
        // Continue applying remaining statements
      }
    }
  };

  // Trigger non-blocking schema self-healing on initialization
  ensureSchema().catch(() => {});

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }: any) {
          const start = performance.now()
          const TIMEOUT_MS = 15000 // 15 seconds max per query (increased for cold starts)

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`[DB TIMEOUT] ${model}.${operation} exceeded ${TIMEOUT_MS}ms`)), TIMEOUT_MS)
          })

          try {
            const result = await Promise.race([query(args), timeoutPromise])
            const end = performance.now()
            const duration = end - start

            // Log warning if query exceeds 250ms budget (accounting for initial connection pool warmup)
            if (duration > 250) {
              console.warn(`[PRISMA PERFORMANCE BREACH] ${model}.${operation} took ${Math.round(duration)}ms`)
            }

            return result
          } catch (error: any) {
            const errMsg = String(error?.message || error || "");
            if (errMsg.includes("does not exist") || errMsg.includes("column") || errMsg.includes("resultEn") || errMsg.includes("resultAr")) {
              console.warn(`[DB AUTO-HEAL] Detected missing column in ${model}.${operation}. Repairing schema...`);
              hasAutoHealed = false;
              await ensureSchema();
              try {
                return await query(args);
              } catch (retryErr) {
                console.error(`[DB AUTO-HEAL FAILED] ${model}.${operation} retry failed:`, retryErr);
              }
            }
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

if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = db
}
