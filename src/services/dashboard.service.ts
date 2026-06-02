import { IDashboardRepository } from "../repositories"

export interface IDashboardService {
  getTotalExpense(): Promise<number>
  getTotalRevenue(): Promise<{ gross: number; net: number }>
  getMonthlyRecap(year?: number): Promise<{ month: string; year: number; total: number }[]>
  getYearlyRecap(year?: number): Promise<{ year: number; total: number }[]>
  getSalesTrackerByStore(storeId?: string): Promise<{ storeId: string; storeName: string; totalSaleCount: number; totalSoldCount: number }[]>
}

export class DashboardService implements IDashboardService {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async getTotalExpense(): Promise<number> {
    return this.dashboardRepository.getTotalExpense()
  }

  async getTotalRevenue(): Promise<{ gross: number; net: number }> {
    const [totalIncome, totalExpense] = await Promise.all([
      this.dashboardRepository.getTotalIncome(),
      this.dashboardRepository.getTotalExpense(),
    ])
    return { gross: totalIncome, net: totalIncome - totalExpense }
  }

  async getMonthlyRecap(year?: number): Promise<{ month: string; year: number; total: number }[]> {
    return this.dashboardRepository.getMonthlyIncome(year)
  }

  async getYearlyRecap(year?: number): Promise<{ year: number; total: number }[]> {
    return this.dashboardRepository.getYearlyIncome(year)
  }

  async getSalesTrackerByStore(storeId?: string): Promise<{ storeId: string; storeName: string; totalSaleCount: number; totalSoldCount: number }[]> {
    return this.dashboardRepository.getSalesTrackerByStore(storeId)
  }
}
