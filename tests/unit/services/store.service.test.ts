import type { Store } from "@prisma/client"
import type { IStoreRepository, CreateStoreInput } from "../../../src/repositories"
import { StoreService } from "../../../src/services"

const mockStore: Store = {
  id: "store-1",
  name: "Store A",
  description: "Desc",
  address: "Addr",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
}

function createMockRepo(): IStoreRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

describe("StoreService", () => {
  let repo: ReturnType<typeof createMockRepo>
  let service: StoreService

  beforeEach(() => {
    repo = createMockRepo()
    service = new StoreService(repo)
  })

  describe("list", () => {
    it("should return all stores", async () => {
      repo.findAll.mockResolvedValue([mockStore])
      const result = await service.list()
      expect(result).toHaveLength(1)
      expect(repo.findAll).toHaveBeenCalled()
    })
  })

  describe("get", () => {
    it("should return store by id", async () => {
      repo.findById.mockResolvedValue(mockStore)
      const result = await service.get("store-1")
      expect(result.name).toBe("Store A")
    })

    it("should throw if not found", async () => {
      repo.findById.mockResolvedValue(null)
      await expect(service.get("missing")).rejects.toThrow("Store not found")
    })
  })

  describe("create", () => {
    it("should create and return store", async () => {
      const input: CreateStoreInput = {
        name: "New Store",
        description: "New Desc",
      }
      repo.create.mockResolvedValue({ ...mockStore, name: "New Store" })
      const result = await service.create(input)
      expect(result.name).toBe("New Store")
      expect(repo.create).toHaveBeenCalledWith(input)
    })
  })

  describe("update", () => {
    it("should update existing store", async () => {
      repo.findById.mockResolvedValue(mockStore)
      repo.update.mockResolvedValue({ ...mockStore, name: "Updated" })
      const result = await service.update("store-1", { name: "Updated" })
      expect(result.name).toBe("Updated")
    })
  })

  describe("remove", () => {
    it("should delete existing store", async () => {
      repo.findById.mockResolvedValue(mockStore)
      repo.delete.mockResolvedValue(mockStore)
      await service.remove("store-1")
      expect(repo.delete).toHaveBeenCalledWith("store-1")
    })
  })
})
