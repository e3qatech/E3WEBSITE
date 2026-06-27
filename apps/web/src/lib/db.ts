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
          const result = await query(args)
          const end = performance.now()
          const duration = end - start

          // Log warning if query exceeds 100ms budget
          if (duration > 100) {
            console.warn(`[PRISMA PERFORMANCE BREACH] ${model}.${operation} took ${Math.round(duration)}ms`)
          }

          return result
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
