import { PrismaClient, SalesIncome } from "@prisma/client"
import type { PaginationParams, PaginatedResult } from "../lib/pagination"

export type CreateSalesIncomeInput = {
  storeId: string
  salesDate: Date
  amount: number
}

export interface ISalesIncomeRepository {
  findAll(storeId?: string, pagination?: PaginationParams): Promise<PaginatedResult<SalesIncome>>
  findById(id: string): Promise<SalesIncome | null>
  create(input: CreateSalesIncomeInput): Promise<SalesIncome>
  update(id: string, input: Partial<CreateSalesIncomeInput>): Promise<SalesIncome>
  delete(id: string): Promise<SalesIncome>
}

export class SalesIncomeRepository implements ISalesIncomeRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(storeId?: string, pagination?: PaginationParams): Promise<PaginatedResult<SalesIncome>> {
    const where = storeId ? { storeId } : undefined
    const page = pagination?.page ?? 1
    const limit = pagination?.limit ?? 10

    const [data, total] = await Promise.all([
      this.prisma.salesIncome.findMany({
        where,
        orderBy: { salesDate: "desc" },
        include: { store: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.salesIncome.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findById(id: string): Promise<SalesIncome | null> {
    return this.prisma.salesIncome.findUnique({ where: { id }, include: { store: true } })
  }

  async create(input: CreateSalesIncomeInput): Promise<SalesIncome> {
    return this.prisma.salesIncome.create({ data: input })
  }

  async update(
    id: string,
    input: Partial<CreateSalesIncomeInput>,
  ): Promise<SalesIncome> {
    return this.prisma.salesIncome.update({ where: { id }, data: input })
  }

  async delete(id: string): Promise<SalesIncome> {
    return this.prisma.salesIncome.delete({ where: { id } })
  }
}
