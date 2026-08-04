import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/e3_qatar?schema=public'
  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'info' },
      { emit: 'stdout', level: 'warn' },
    ],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }: any) {
          const start = performance.now()
          const TIMEOUT_MS = 5000 // 5 seconds max per query
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`[DB TIMEOUT] ${model}.${operation} exceeded ${TIMEOUT_MS}ms`)), TIMEOUT_MS)
          })

          try {
            const result = await Promise.race([query(args), timeoutPromise])
            const end = performance.now()
            const duration = end - start

            // Log warning if query exceeds 100ms budget
            if (duration > 100) {
              console.warn(`[PRISMA PERFORMANCE BREACH] ${model}.${operation} took ${Math.round(duration)}ms`)
            }

            return result
          } catch (error: any) {
            // Handle build-time static generation when DB is unreachable or missing
            if (!process.env.DATABASE_URL || error?.code === 'P1001' || error?.name === 'PrismaClientInitializationError') {
              console.warn(`[DB WARN] Database unavailable for ${model}.${operation} during build/prerender.`)
              if (operation === 'findMany') return []
              if (operation === 'findFirst' || operation === 'findUnique') return null
              if (operation === 'count') return 0
            }
            console.error(`[DB ERROR] ${model}.${operation} failed:`, error)
            throw error
          }
        }
      }
    }
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const db = globalThis.prismaGlobal ?? prismaClientSingleton()

export { db }
export default db

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db
