import { PrismaClient, Expense } from "@prisma/client"

export type CreateExpenseInput = {
  name: string
  expenseDate: Date
  amount: number
}

export interface IExpenseRepository {
  findAll(): Promise<Expense[]>
  findById(id: string): Promise<Expense | null>
  create(input: CreateExpenseInput): Promise<Expense>
  update(id: string, input: Partial<CreateExpenseInput>): Promise<Expense>
  delete(id: string): Promise<Expense>
}

export class ExpenseRepository implements IExpenseRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Expense[]> {
    return this.prisma.expense.findMany({ orderBy: { expenseDate: "desc" } })
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
