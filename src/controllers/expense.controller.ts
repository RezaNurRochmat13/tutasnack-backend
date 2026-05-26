import type { Context } from "hono"
import type { Env } from "../config/env"
import { getPrisma } from "../db/prisma"
import { ExpenseRepository } from "../repositories"
import { ExpenseService } from "../services"

async function createService(c: Context<{ Bindings: Env }>) {
  const prisma = await getPrisma(c.env.DATABASE_URL)
  return new ExpenseService(new ExpenseRepository(prisma))
}

function getJsonBody<T>(c: Context): T {
  return (c.req as any).valid("json") as T
}

function getId(c: Context) {
  const id = c.req.param("id")
  if (!id) return null
  return id
}

type CreateBody = {
  name: string
  expenseDate: string
  amount: number
}

type UpdateBody = Partial<CreateBody>

export async function list(c: Context<{ Bindings: Env }>) {
  const expenses = await (await createService(c)).list()
  return c.json(expenses)
}

export async function get(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({ error: "ID is required" }, 400)

  try {
    const expense = await (await createService(c)).get(id)
    return c.json(expense)
  } catch (e) {
    if (e instanceof Error && e.message === "Expense not found") {
      return c.json({ error: "Expense not found" }, 404)
    }
    throw e
  }
}

export async function create(c: Context<{ Bindings: Env }>) {
  const body = getJsonBody<CreateBody>(c)
  const expense = await (await createService(c)).create({
    name: body.name,
    expenseDate: new Date(body.expenseDate),
    amount: body.amount,
  })
  return c.json(expense, 201)
}

export async function update(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({ error: "ID is required" }, 400)

  const body = getJsonBody<UpdateBody>(c)
  const data: any = {}
  if (body.name !== undefined) data.name = body.name
  if (body.expenseDate !== undefined) data.expenseDate = new Date(body.expenseDate)
  if (body.amount !== undefined) data.amount = body.amount

  try {
    const expense = await (await createService(c)).update(id, data)
    return c.json(expense)
  } catch (e) {
    if (e instanceof Error && e.message === "Expense not found") {
      return c.json({ error: "Expense not found" }, 404)
    }
    throw e
  }
}

export async function remove(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({ error: "ID is required" }, 400)

  try {
    const expense = await (await createService(c)).remove(id)
    return c.json(expense)
  } catch (e) {
    if (e instanceof Error && e.message === "Expense not found") {
      return c.json({ error: "Expense not found" }, 404)
    }
    throw e
  }
}
