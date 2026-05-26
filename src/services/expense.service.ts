import { Expense } from "@prisma/client"
import { IExpenseRepository, CreateExpenseInput } from "../repositories"

export interface IExpenseService {
  list(): Promise<Expense[]>
  get(id: string): Promise<Expense>
  create(input: CreateExpenseInput): Promise<Expense>
  update(id: string, input: Partial<CreateExpenseInput>): Promise<Expense>
  remove(id: string): Promise<Expense>
}

export class ExpenseService implements IExpenseService {
  constructor(private expenseRepository: IExpenseRepository) {}

  async list(): Promise<Expense[]> {
    return this.expenseRepository.findAll()
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
