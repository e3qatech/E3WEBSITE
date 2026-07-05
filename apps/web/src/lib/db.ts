import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
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
          } catch (error) {
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
