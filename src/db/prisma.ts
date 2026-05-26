import type { PrismaClient } from "@prisma/client"

type AnyPrismaClient = PrismaClient & Record<string, any>

let prisma: AnyPrismaClient | null = null

export async function getPrisma(databaseUrl: string, useNeonAdapter = false): Promise<AnyPrismaClient> {
  if (!prisma) {
    if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
      const { PrismaClient: TestClient } = await import("../__generated__/test-client")
      prisma = new TestClient({ datasourceUrl: databaseUrl }) as unknown as AnyPrismaClient
    } else if (useNeonAdapter) {
      const [{ PrismaNeon }, { Pool, neonConfig }] = await Promise.all([
        import("@prisma/adapter-neon") as any,
        import("@neondatabase/serverless") as any,
      ])
      neonConfig.poolQueryViaFetch = true
      const pool = new Pool({ connectionString: databaseUrl })
      const adapter = new PrismaNeon(pool)
      const { PrismaClient } = await import("@prisma/client")
      prisma = new PrismaClient({ adapter }) as unknown as AnyPrismaClient
    } else {
      const { PrismaClient } = await import("@prisma/client")
      prisma = new PrismaClient({ datasourceUrl: databaseUrl }) as unknown as AnyPrismaClient
    }
  }
  return prisma
}
