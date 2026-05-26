import type { SalesIncome, Store } from "@prisma/client"
import type { ISalesIncomeRepository, IStoreRepository, CreateSalesIncomeInput } from "../../../src/repositories"
import { SalesIncomeService } from "../../../src/services"

const mockStore: Store = {
  id: "store-1", name: "Store A", description: null, address: null,
  createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
}

const mockRecord: SalesIncome = {
  id: "si-1", storeId: "store-1",
  salesDate: new Date("2024-06-01"), amount: 50000,
  createdAt: new Date("2024-06-01"), updatedAt: new Date("2024-06-01"),
}

function createMockRepo() {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } satisfies ISalesIncomeRepository
}

function createMockStoreRepo() {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } satisfies IStoreRepository
}

describe("SalesIncomeService", () => {
  let siRepo: ReturnType<typeof createMockRepo>
  let storeRepo: ReturnType<typeof createMockStoreRepo>
  let service: SalesIncomeService

  beforeEach(() => {
    siRepo = createMockRepo()
    storeRepo = createMockStoreRepo()
    service = new SalesIncomeService(siRepo, storeRepo)
  })

  describe("list", () => {
    it("should return all records", async () => {
      siRepo.findAll.mockResolvedValue([mockRecord])
      const result = await service.list()
      expect(result).toHaveLength(1)
    })

    it("should filter by storeId", async () => {
      siRepo.findAll.mockResolvedValue([mockRecord])
      await service.list("store-1")
      expect(siRepo.findAll).toHaveBeenCalledWith("store-1")
    })
  })

  describe("get", () => {
    it("should return record by id", async () => {
      siRepo.findById.mockResolvedValue(mockRecord)
      const result = await service.get("si-1")
      expect(result.amount).toBe(50000)
    })

    it("should throw if not found", async () => {
      siRepo.findById.mockResolvedValue(null)
      await expect(service.get("missing")).rejects.toThrow("Sales income not found")
    })
  })

  describe("create", () => {
    it("should create when store exists", async () => {
      storeRepo.findById.mockResolvedValue(mockStore)
      const input: CreateSalesIncomeInput = {
        storeId: "store-1", salesDate: new Date("2024-06-15"), amount: 75000,
      }
      siRepo.create.mockResolvedValue({ ...mockRecord, ...input })
      const result = await service.create(input)
      expect(result.amount).toBe(75000)
    })

    it("should throw if store not found", async () => {
      storeRepo.findById.mockResolvedValue(null)
      await expect(
        service.create({ storeId: "missing", salesDate: new Date(), amount: 100 }),
      ).rejects.toThrow("Store not found")
    })
  })

  describe("remove", () => {
    it("should delete existing record", async () => {
      siRepo.findById.mockResolvedValue(mockRecord)
      siRepo.delete.mockResolvedValue(mockRecord)
      await service.remove("si-1")
      expect(siRepo.delete).toHaveBeenCalledWith("si-1")
    })
  })
})
