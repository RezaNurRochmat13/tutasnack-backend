import type { PaginationParams, PaginatedResult } from "../lib/pagination"
import type { Expense } from "@prisma/client"
import type { IExpenseRepository, CreateExpenseInput } from "../repositories"

export interface IExpenseService {
  list(pagination?: PaginationParams): Promise<PaginatedResult<any>>
  get(id: string): Promise<any>
  create(input: CreateExpenseInput): Promise<any>
  update(id: string, input: Partial<CreateExpenseInput>): Promise<any>
  remove(id: string): Promise<any>
}

export class ExpenseService implements IExpenseService {
  constructor(private expenseRepository: IExpenseRepository) {}

  async list(pagination?: PaginationParams): Promise<PaginatedResult<any>> {
    return this.expenseRepository.findAll(pagination)
  }

  async get(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findById(id)
    if (!expense) throw new Error("Expense not found")
    return expense
  }

  async create(input: CreateExpenseInput): Promise<Expense> {
    return this.expenseRepository.create(input)
  }

  async update(
    id: string,
    input: Partial<CreateExpenseInput>,
  ): Promise<Expense> {
    await this.get(id)
    return this.expenseRepository.update(id, input)
  }

  async remove(id: string): Promise<Expense> {
    await this.get(id)
    return this.expenseRepository.delete(id)
  }
}
