import type { SalesTracker, Store } from "@prisma/client"
import type { ISalesTrackerRepository, IStoreRepository, CreateSalesTrackerInput } from "../../../src/repositories"
import { SalesTrackerService } from "../../../src/services"

const mockStore: Store = {
  id: "store-1", name: "Store A", description: null, address: null,
  createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
}

const mockRecord: SalesTracker = {
  id: "st-1", storeId: "store-1",
  salesDate: new Date("2024-06-01"), saleCount: 50, soldCount: 40,
  createdAt: new Date("2024-06-01"), updatedAt: new Date("2024-06-01"),
}

function createMockRepo() {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } satisfies ISalesTrackerRepository
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

describe("SalesTrackerService", () => {
  let stRepo: ReturnType<typeof createMockRepo>
  let storeRepo: ReturnType<typeof createMockStoreRepo>
  let service: SalesTrackerService

  beforeEach(() => {
    stRepo = createMockRepo()
    storeRepo = createMockStoreRepo()
    service = new SalesTrackerService(stRepo, storeRepo)
  })

  describe("list", () => {
    it("should return paginated records", async () => {
      const paginatedResult = {
        data: [mockRecord], total: 1, page: 1, limit: 10, totalPages: 1,
      }
      stRepo.findAll.mockResolvedValue(paginatedResult)
      const result = await service.list()
      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
    })

    it("should filter by storeId", async () => {
      const paginatedResult = {
        data: [mockRecord], total: 1, page: 1, limit: 10, totalPages: 1,
      }
      stRepo.findAll.mockResolvedValue(paginatedResult)
      await service.list("store-1")
      expect(stRepo.findAll).toHaveBeenCalledWith("store-1", undefined)
    })

    it("should pass pagination params", async () => {
      const paginatedResult = {
        data: [], total: 0, page: 2, limit: 5, totalPages: 0,
      }
      stRepo.findAll.mockResolvedValue(paginatedResult)
      const result = await service.list(undefined, { page: 2, limit: 5 })
      expect(stRepo.findAll).toHaveBeenCalledWith(undefined, { page: 2, limit: 5 })
      expect(result.page).toBe(2)
      expect(result.limit).toBe(5)
    })
  })

  describe("get", () => {
    it("should return record by id", async () => {
      stRepo.findById.mockResolvedValue(mockRecord)
      const result = await service.get("st-1")
      expect(result.saleCount).toBe(50)
    })

    it("should throw if not found", async () => {
      stRepo.findById.mockResolvedValue(null)
      await expect(service.get("missing")).rejects.toThrow("Sales tracker not found")
    })
  })

  describe("create", () => {
    it("should create when store exists", async () => {
      storeRepo.findById.mockResolvedValue(mockStore)
      const input: CreateSalesTrackerInput = {
        storeId: "store-1", salesDate: new Date("2024-06-15"),
        saleCount: 100, soldCount: 80,
      }
      stRepo.create.mockResolvedValue({ ...mockRecord, ...input })
      const result = await service.create(input)
      expect(result.saleCount).toBe(100)
      expect(result.soldCount).toBe(80)
    })

    it("should throw if store not found", async () => {
      storeRepo.findById.mockResolvedValue(null)
      await expect(
        service.create({ storeId: "missing", salesDate: new Date(), saleCount: 10, soldCount: 5 }),
      ).rejects.toThrow("Store not found")
    })
  })

  describe("remove", () => {
    it("should delete existing record", async () => {
      stRepo.findById.mockResolvedValue(mockRecord)
      stRepo.delete.mockResolvedValue(mockRecord)
      await service.remove("st-1")
      expect(stRepo.delete).toHaveBeenCalledWith("st-1")
    })
  })
})
