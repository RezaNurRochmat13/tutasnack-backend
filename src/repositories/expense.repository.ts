import { PrismaClient, Expense } from "@prisma/client"
import type { PaginationParams, PaginatedResult } from "../lib/pagination"

export type CreateExpenseInput = {
  name: string
  expenseDate: Date
  amount: number
}

export interface IExpenseRepository {
  findAll(pagination?: PaginationParams): Promise<PaginatedResult<Expense>>
  findById(id: string): Promise<Expense | null>
  create(input: CreateExpenseInput): Promise<Expense>
  update(id: string, input: Partial<CreateExpenseInput>): Promise<Expense>
  delete(id: string): Promise<Expense>
}

export class ExpenseRepository implements IExpenseRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(pagination?: PaginationParams): Promise<PaginatedResult<Expense>> {
    const page = pagination?.page ?? 1
    const limit = pagination?.limit ?? 10

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        orderBy: { expenseDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.expense.count(),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findById(id: string): Promise<Expense | null> {
    return this.prisma.expense.findUnique({ where: { id } })
  }

  async create(input: CreateExpenseInput): Promise<Expense> {
    return this.prisma.expense.create({ data: input })
  }

  async update(
    id: string,
    input: Partial<CreateExpenseInput>,
  ): Promise<Expense> {
    return this.prisma.expense.update({ where: { id }, data: input })
  }

  async delete(id: string): Promise<Expense> {
    return this.prisma.expense.delete({ where: { id } })
  }
}
