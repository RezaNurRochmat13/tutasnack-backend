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
    it("should return all records", async () => {
      stRepo.findAll.mockResolvedValue([mockRecord])
      const result = await service.list()
      expect(result).toHaveLength(1)
    })

    it("should filter by storeId", async () => {
      stRepo.findAll.mockResolvedValue([mockRecord])
      await service.list("store-1")
      expect(stRepo.findAll).toHaveBeenCalledWith("store-1")
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
