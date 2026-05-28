import { IDashboardRepository } from "../repositories"

export interface IDashboardService {
  getTotalExpense(): Promise<number>
  getTotalRevenue(): Promise<{ gross: number; net: number }>
  getMonthlyRecap(year?: number): Promise<{ month: string; year: number; total: number }[]>
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
}
