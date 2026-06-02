import { PrismaClient } from "@prisma/client"

export interface IDashboardRepository {
  getTotalExpense(): Promise<number>
  getTotalIncome(): Promise<number>
  getMonthlyIncome(year?: number): Promise<{ month: string; year: number; total: number }[]>
  getYearlyIncome(year?: number): Promise<{ year: number; total: number }[]>
  getSalesTrackerByStore(storeId?: string): Promise<{ storeId: string; storeName: string; totalSaleCount: number; totalSoldCount: number }[]>
}

export class DashboardRepository implements IDashboardRepository {
  constructor(private prisma: PrismaClient) {}

  async getTotalExpense(): Promise<number> {
    const result = await this.prisma.expense.aggregate({
      _sum: { amount: true },
    })
    return result._sum.amount ?? 0
  }

  async getTotalIncome(): Promise<number> {
    const result = await this.prisma.salesIncome.aggregate({
      _sum: { amount: true },
    })
    return result._sum.amount ?? 0
  }

  async getMonthlyIncome(year?: number): Promise<{ month: string; year: number; total: number }[]> {
    const records = await this.prisma.salesIncome.findMany({
      select: { amount: true, salesDate: true },
      where: year ? {
        salesDate: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      } : undefined,
    })

    const monthlyMap = new Map<string, number>()
    for (const r of records) {
      const d = new Date(r.salesDate)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + r.amount)
    }

    return Array.from(monthlyMap.entries())
      .map(([key, total]) => {
        const [yearStr, month] = key.split("-")
        return { year: parseInt(yearStr), month, total }
      })
      .sort((a, b) => a.year - b.year || a.month.localeCompare(b.month))
  }

  async getYearlyIncome(year?: number): Promise<{ year: number; total: number }[]> {
    const records = await this.prisma.salesIncome.findMany({
      select: { amount: true, salesDate: true },
      where: year ? {
        salesDate: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      } : undefined,
    })

    const yearlyMap = new Map<number, number>()
    for (const r of records) {
      const y = r.salesDate.getFullYear()
      yearlyMap.set(y, (yearlyMap.get(y) ?? 0) + r.amount)
    }

    return Array.from(yearlyMap.entries())
      .map(([year, total]) => ({ year, total }))
      .sort((a, b) => a.year - b.year)
  }

  async getSalesTrackerByStore(storeId?: string): Promise<{ storeId: string; storeName: string; totalSaleCount: number; totalSoldCount: number }[]> {
    const records = await this.prisma.salesTracker.groupBy({
      by: ["storeId"],
      _sum: { saleCount: true, soldCount: true },
      where: storeId ? { storeId } : undefined,
    })

    const storeIds = records.map((r) => r.storeId)
    const stores = await this.prisma.store.findMany({
      where: { id: { in: storeIds } },
      select: { id: true, name: true },
    })
    const storeMap = new Map(stores.map((s) => [s.id, s.name]))

    return records.map((r) => ({
      storeId: r.storeId,
      storeName: storeMap.get(r.storeId) ?? "",
      totalSaleCount: r._sum.saleCount ?? 0,
      totalSoldCount: r._sum.soldCount ?? 0,
    }))
  }
}
