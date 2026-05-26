import { getPrisma } from "../../src/db/prisma"

export function createDbHelper(dbUrl: string) {
  const prisma = getPrisma(dbUrl)

  async function cleanAll() {
    await prisma.salesTracker.deleteMany()
    await prisma.salesIncome.deleteMany()
    await prisma.expense.deleteMany()
    await prisma.store.deleteMany()
    await prisma.user.deleteMany()
  }

  return { prisma, cleanAll }
}
