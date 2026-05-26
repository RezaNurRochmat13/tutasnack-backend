import type { Context } from "hono"
import type { Env } from "../config/env"
import { getPrisma } from "../db/prisma"
import { ExpenseRepository } from "../repositories"
import { ExpenseService } from "../services"

function createService(c: Context<{ Bindings: Env }>) {
  const prisma = getPrisma(c.env.DATABASE_URL)
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

export async function list(c: Context<{ Bindings: Env }>) {
  const expenses = await createService(c).list()
  return c.json(expenses)
}

export async function get(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({ error: "Missing id" }, 400)
  try {
    const expense = await createService(c).get(id)
    return c.json(expense)
  } catch (e) {
    if (e instanceof Error && e.message === "Expense not found") {
      return c.json({ error: "Expense not found" }, 404)
    }
    throw e
  }
}

export async function create(c: Context<{ Bindings: Env }>) {
  const body = getJsonBody<{ name: string; expenseDate: string; amount: number }>(c)
  const expense = await createService(c).create({
    name: body.name,
    expenseDate: new Date(body.expenseDate),
    amount: body.amount,
  })
  return c.json(expense, 201)
}

export async function update(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({ error: "Missing id" }, 400)
  try {
    const body = getJsonBody<{
      name?: string
      expenseDate?: string
      amount?: number
    }>(c)
    const expense = await createService(c).update(id, {
      ...body,
      expenseDate: body.expenseDate ? new Date(body.expenseDate) : undefined,
    })
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
  if (!id) return c.json({ error: "Missing id" }, 400)
  try {
    const expense = await createService(c).remove(id)
    return c.json(expense)
  } catch (e) {
    if (e instanceof Error && e.message === "Expense not found") {
      return c.json({ error: "Expense not found" }, 404)
    }
    throw e
  }
}
