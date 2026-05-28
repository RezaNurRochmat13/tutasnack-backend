import { IDashboardRepository } from "../repositories"

export interface IDashboardService {
  getTotalExpense(): Promise<number>
  getTotalRevenue(): Promise<number>
  getMonthlyRecap(year?: number): Promise<{ month: string; year: number; total: number }[]>
}

export class DashboardService implements IDashboardService {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async getTotalExpense(): Promise<number> {
    return this.dashboardRepository.getTotalExpense()
  }

  async getTotalRevenue(): Promise<number> {
    const [totalIncome, totalExpense] = await Promise.all([
      this.dashboardRepository.getTotalIncome(),
      this.dashboardRepository.getTotalExpense(),
    ])
    return totalIncome - totalExpense
  }

  async getMonthlyRecap(year?: number): Promise<{ month: string; year: number; total: number }[]> {
    return this.dashboardRepository.getMonthlyIncome(year)
  }
}
