import type { PaginationParams, PaginatedResult } from "../lib/pagination"
import type { SalesTracker } from "@prisma/client"
import type {
  ISalesTrackerRepository,
  IStoreRepository,
  CreateSalesTrackerInput,
} from "../repositories"

export interface ISalesTrackerService {
  list(storeId?: string, pagination?: PaginationParams): Promise<PaginatedResult<any>>
  get(id: string): Promise<any>
  create(input: CreateSalesTrackerInput): Promise<any>
  update(
    id: string,
    input: Partial<CreateSalesTrackerInput>,
  ): Promise<any>
  remove(id: string): Promise<any>
}

export class SalesTrackerService implements ISalesTrackerService {
  constructor(
    private salesTrackerRepository: ISalesTrackerRepository,
    private storeRepository: IStoreRepository,
  ) {}

  async list(storeId?: string, pagination?: PaginationParams): Promise<PaginatedResult<any>> {
    return this.salesTrackerRepository.findAll(storeId, pagination)
  }

  async get(id: string): Promise<SalesTracker> {
    const record = await this.salesTrackerRepository.findById(id)
    if (!record) throw new Error("Sales tracker not found")
    return record
  }

  async create(input: CreateSalesTrackerInput): Promise<SalesTracker> {
    const store = await this.storeRepository.findById(input.storeId)
    if (!store) throw new Error("Store not found")
    return this.salesTrackerRepository.create(input)
  }

  async update(
    id: string,
    input: Partial<CreateSalesTrackerInput>,
  ): Promise<SalesTracker> {
    await this.get(id)
    return this.salesTrackerRepository.update(id, input)
  }

  async remove(id: string): Promise<SalesTracker> {
    await this.get(id)
    return this.salesTrackerRepository.delete(id)
  }
}
