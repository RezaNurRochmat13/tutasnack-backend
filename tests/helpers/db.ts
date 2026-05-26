import { getPrisma } from "../../src/db/prisma"

export async function createDbHelper(dbUrl: string) {
  const prisma = await getPrisma(dbUrl, false)

  async function cleanAll() {
    await prisma.salesTracker.deleteMany()
    await prisma.salesIncome.deleteMany()
    await prisma.expense.deleteMany()
    await prisma.store.deleteMany()
    await prisma.user.deleteMany()
  }

  return { prisma, cleanAll }
}
