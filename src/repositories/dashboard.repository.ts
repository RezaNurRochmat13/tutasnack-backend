import { PrismaClient } from "@prisma/client"

export interface IDashboardRepository {
  getTotalExpense(): Promise<number>
  getTotalIncome(): Promise<number>
  getMonthlyIncome(year?: number): Promise<{ month: string; year: number; total: number }[]>
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
}
