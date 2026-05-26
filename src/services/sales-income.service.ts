import { SalesIncome } from "@prisma/client"
import {
  ISalesIncomeRepository,
  IStoreRepository,
  CreateSalesIncomeInput,
} from "../repositories"

export interface ISalesIncomeService {
  list(storeId?: string): Promise<SalesIncome[]>
  get(id: string): Promise<SalesIncome>
  create(input: CreateSalesIncomeInput): Promise<SalesIncome>
  update(id: string, input: Partial<CreateSalesIncomeInput>): Promise<SalesIncome>
  remove(id: string): Promise<SalesIncome>
}

export class SalesIncomeService implements ISalesIncomeService {
  constructor(
    private salesIncomeRepository: ISalesIncomeRepository,
    private storeRepository: IStoreRepository,
  ) {}

  async list(storeId?: string): Promise<SalesIncome[]> {
    return this.salesIncomeRepository.findAll(storeId)
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
