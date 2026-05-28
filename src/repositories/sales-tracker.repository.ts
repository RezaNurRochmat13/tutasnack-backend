import { PrismaClient, SalesTracker } from "@prisma/client"
import type { PaginationParams, PaginatedResult } from "../lib/pagination"

export type CreateSalesTrackerInput = {
  storeId: string
  salesDate: Date
  saleCount: number
  soldCount: number
}

export interface ISalesTrackerRepository {
  findAll(storeId?: string, pagination?: PaginationParams): Promise<PaginatedResult<SalesTracker>>
  findById(id: string): Promise<SalesTracker | null>
  create(input: CreateSalesTrackerInput): Promise<SalesTracker>
  update(
    id: string,
    input: Partial<CreateSalesTrackerInput>,
  ): Promise<SalesTracker>
  delete(id: string): Promise<SalesTracker>
}

export class SalesTrackerRepository implements ISalesTrackerRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(storeId?: string, pagination?: PaginationParams): Promise<PaginatedResult<SalesTracker>> {
    const where = storeId ? { storeId } : undefined
    const page = pagination?.page ?? 1
    const limit = pagination?.limit ?? 10

    const [data, total] = await Promise.all([
      this.prisma.salesTracker.findMany({
        where,
        include: { store: true },
        orderBy: { salesDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.salesTracker.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findById(id: string): Promise<SalesTracker | null> {
    return this.prisma.salesTracker.findUnique({ where: { id }, include: { store: true } })
  }

  async create(input: CreateSalesTrackerInput): Promise<SalesTracker> {
    return this.prisma.salesTracker.create({ data: input })
  }

  async update(
    id: string,
    input: Partial<CreateSalesTrackerInput>,
  ): Promise<SalesTracker> {
    return this.prisma.salesTracker.update({ where: { id }, data: input })
  }

  async delete(id: string): Promise<SalesTracker> {
    return this.prisma.salesTracker.delete({ where: { id } })
  }
}
