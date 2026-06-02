import type { IDashboardRepository } from "../../../src/repositories"
import { DashboardService } from "../../../src/services"

function createMockRepo(): IDashboardRepository {
  return {
    getTotalExpense: vi.fn(),
    getTotalIncome: vi.fn(),
    getMonthlyIncome: vi.fn(),
    getYearlyIncome: vi.fn(),
    getSalesTrackerByStore: vi.fn(),
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

  describe("getYearlyRecap", () => {
    it("should return yearly income recap", async () => {
      repo.getYearlyIncome.mockResolvedValue([
        { year: 2024, total: 300000 },
        { year: 2025, total: 500000 },
      ])
      const result = await service.getYearlyRecap()
      expect(result).toHaveLength(2)
      expect(result[0].year).toBe(2024)
      expect(result[0].total).toBe(300000)
      expect(result[1].year).toBe(2025)
      expect(result[1].total).toBe(500000)
    })

    it("should pass year filter to repository", async () => {
      repo.getYearlyIncome.mockResolvedValue([])
      await service.getYearlyRecap(2025)
      expect(repo.getYearlyIncome).toHaveBeenCalledWith(2025)
    })
  })

  describe("getSalesTrackerByStore", () => {
    it("should return sales tracker grouped by store", async () => {
      repo.getSalesTrackerByStore.mockResolvedValue([
        { storeId: "store-1", storeName: "Toko A", totalSaleCount: 100, totalSoldCount: 75 },
        { storeId: "store-2", storeName: "Toko B", totalSaleCount: 50, totalSoldCount: 40 },
      ])
      const result = await service.getSalesTrackerByStore()
      expect(result).toHaveLength(2)
      expect(result[0].storeName).toBe("Toko A")
      expect(result[0].totalSaleCount).toBe(100)
      expect(result[0].totalSoldCount).toBe(75)
    })

    it("should pass storeId filter to repository", async () => {
      repo.getSalesTrackerByStore.mockResolvedValue([])
      await service.getSalesTrackerByStore("store-1")
      expect(repo.getSalesTrackerByStore).toHaveBeenCalledWith("store-1")
    })
  })
})
