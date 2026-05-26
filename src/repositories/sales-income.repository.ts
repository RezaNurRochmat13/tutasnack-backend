import { PrismaClient, SalesIncome } from "@prisma/client"

export type CreateSalesIncomeInput = {
  storeId: string
  salesDate: Date
  amount: number
}

export interface ISalesIncomeRepository {
  findAll(storeId?: string): Promise<SalesIncome[]>
  findById(id: string): Promise<SalesIncome | null>
  create(input: CreateSalesIncomeInput): Promise<SalesIncome>
  update(id: string, input: Partial<CreateSalesIncomeInput>): Promise<SalesIncome>
  delete(id: string): Promise<SalesIncome>
}

export class SalesIncomeRepository implements ISalesIncomeRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(storeId?: string): Promise<SalesIncome[]> {
    return this.prisma.salesIncome.findMany({
      where: storeId ? { storeId } : undefined,
      orderBy: { salesDate: "desc" },
    })
  }

  async findById(id: string): Promise<SalesIncome | null> {
    return this.prisma.salesIncome.findUnique({ where: { id } })
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
