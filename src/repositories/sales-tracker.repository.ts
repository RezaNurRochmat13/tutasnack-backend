import { PrismaClient, SalesTracker } from "@prisma/client"
import { includes } from "zod/v4";

export type CreateSalesTrackerInput = {
  storeId: string
  salesDate: Date
  saleCount: number
  soldCount: number
}

export interface ISalesTrackerRepository {
  findAll(storeId?: string): Promise<SalesTracker[]>
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

  async findAll(storeId?: string): Promise<SalesTracker[]> {
    return this.prisma.salesTracker.findMany({
      where: storeId ? { storeId } : undefined,
      include: { store: true },
      orderBy: { salesDate: "desc" },
    })
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
