import type { Expense } from "@prisma/client"
import type { IExpenseRepository, CreateExpenseInput } from "../../../src/repositories"
import { ExpenseService } from "../../../src/services"

const mockExpense: Expense = {
  id: "exp-1",
  name: "Beli bahan baku",
  expenseDate: new Date("2024-06-01"),
  amount: 25000,
  createdAt: new Date("2024-06-01"),
  updatedAt: new Date("2024-06-01"),
}

function createMockRepo(): IExpenseRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

describe("ExpenseService", () => {
  let repo: ReturnType<typeof createMockRepo>
  let service: ExpenseService

  beforeEach(() => {
    repo = createMockRepo()
    service = new ExpenseService(repo)
  })

  describe("list", () => {
    it("should return paginated expenses", async () => {
      const paginatedResult = {
        data: [mockExpense], total: 1, page: 1, limit: 10, totalPages: 1,
      }
      repo.findAll.mockResolvedValue(paginatedResult)
      const result = await service.list()
      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
    })

    it("should pass pagination params", async () => {
      const paginatedResult = {
        data: [], total: 0, page: 2, limit: 5, totalPages: 0,
      }
      repo.findAll.mockResolvedValue(paginatedResult)
      const result = await service.list({ page: 2, limit: 5 })
      expect(repo.findAll).toHaveBeenCalledWith({ page: 2, limit: 5 })
      expect(result.page).toBe(2)
      expect(result.limit).toBe(5)
    })
  })

  describe("get", () => {
    it("should return expense by id", async () => {
      repo.findById.mockResolvedValue(mockExpense)
      const result = await service.get("exp-1")
      expect(result.name).toBe("Beli bahan baku")
    })

    it("should throw if not found", async () => {
      repo.findById.mockResolvedValue(null)
      await expect(service.get("missing")).rejects.toThrow("Expense not found")
    })
  })

  describe("create", () => {
    it("should create and return expense", async () => {
      const input: CreateExpenseInput = {
        name: "Sewa tempat",
        expenseDate: new Date("2024-07-01"),
        amount: 100000,
      }
      repo.create.mockResolvedValue({ ...mockExpense, ...input })
      const result = await service.create(input)
      expect(result.name).toBe("Sewa tempat")
      expect(result.amount).toBe(100000)
    })
  })

  describe("update", () => {
    it("should update existing expense", async () => {
      repo.findById.mockResolvedValue(mockExpense)
      repo.update.mockResolvedValue({ ...mockExpense, amount: 30000 })
      const result = await service.update("exp-1", { amount: 30000 })
      expect(result.amount).toBe(30000)
    })
  })

  describe("remove", () => {
    it("should delete existing expense", async () => {
      repo.findById.mockResolvedValue(mockExpense)
      repo.delete.mockResolvedValue(mockExpense)
      await service.remove("exp-1")
      expect(repo.delete).toHaveBeenCalledWith("exp-1")
    })
  })
})
