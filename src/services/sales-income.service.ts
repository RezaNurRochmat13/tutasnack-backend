import type { PaginationParams, PaginatedResult } from "../lib/pagination"
import type { SalesIncome } from "@prisma/client"
import type {
  ISalesIncomeRepository,
  IStoreRepository,
  CreateSalesIncomeInput,
} from "../repositories"

export interface ISalesIncomeService {
  list(storeId?: string, pagination?: PaginationParams): Promise<PaginatedResult<any>>
  get(id: string): Promise<any>
  create(input: CreateSalesIncomeInput): Promise<any>
  update(id: string, input: Partial<CreateSalesIncomeInput>): Promise<any>
  remove(id: string): Promise<any>
}

export class SalesIncomeService implements ISalesIncomeService {
  constructor(
    private salesIncomeRepository: ISalesIncomeRepository,
    private storeRepository: IStoreRepository,
  ) {}

  async list(storeId?: string, pagination?: PaginationParams): Promise<PaginatedResult<any>> {
    return this.salesIncomeRepository.findAll(storeId, pagination)
  }

  async get(id: string): Promise<SalesIncome> {
    const record = await this.salesIncomeRepository.findById(id)
    if (!record) throw new Error("Sales income not found")
    return record
  }

  async create(input: CreateSalesIncomeInput): Promise<SalesIncome> {
    const store = await this.storeRepository.findById(input.storeId)
    if (!store) throw new Error("Store not found")
    return this.salesIncomeRepository.create(input)
  }

  async update(
    id: string,
    input: Partial<CreateSalesIncomeInput>,
  ): Promise<SalesIncome> {
    await this.get(id)
    return this.salesIncomeRepository.update(id, input)
  }

  async remove(id: string): Promise<SalesIncome> {
    await this.get(id)
    return this.salesIncomeRepository.delete(id)
  }
}
