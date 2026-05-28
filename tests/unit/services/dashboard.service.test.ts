import type { IDashboardRepository } from "../../../src/repositories"
import { DashboardService } from "../../../src/services"

function createMockRepo(): IDashboardRepository {
  return {
    getTotalExpense: vi.fn(),
    getTotalIncome: vi.fn(),
    getMonthlyIncome: vi.fn(),
  }
}

describe("DashboardService", () => {
  let repo: ReturnType<typeof createMockRepo>
  let service: DashboardService

  beforeEach(() => {
    repo = createMockRepo()
    service = new DashboardService(repo)
  })

  describe("getTotalExpense", () => {
    it("should return total expense from repository", async () => {
      repo.getTotalExpense.mockResolvedValue(50000)
      const result = await service.getTotalExpense()
      expect(result).toBe(50000)
    })
  })

  describe("getTotalRevenue", () => {
    it("should return gross and net revenue", async () => {
      repo.getTotalIncome.mockResolvedValue(100000)
      repo.getTotalExpense.mockResolvedValue(30000)
      const result = await service.getTotalRevenue()
      expect(result.gross).toBe(100000)
      expect(result.net).toBe(70000)
    })

    it("should return negative net if expenses exceed income", async () => {
      repo.getTotalIncome.mockResolvedValue(50000)
      repo.getTotalExpense.mockResolvedValue(100000)
      const result = await service.getTotalRevenue()
      expect(result.gross).toBe(50000)
      expect(result.net).toBe(-50000)
    })
  })

  describe("getMonthlyRecap", () => {
    it("should return monthly income recap", async () => {
      repo.getMonthlyIncome.mockResolvedValue([
        { year: 2025, month: "01", total: 100000 },
        { year: 2025, month: "02", total: 200000 },
      ])
      const result = await service.getMonthlyRecap()
      expect(result).toHaveLength(2)
      expect(result[0].total).toBe(100000)
    })

    it("should pass year filter to repository", async () => {
      repo.getMonthlyIncome.mockResolvedValue([])
      await service.getMonthlyRecap(2025)
      expect(repo.getMonthlyIncome).toHaveBeenCalledWith(2025)
    })
  })
})
