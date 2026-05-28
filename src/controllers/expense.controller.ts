import type { Context } from "hono"
import type { Env } from "../config/env"
import { getPrisma } from "../db/prisma"
import { paginate } from "../lib/pagination"
import { ExpenseRepository } from "../repositories"
import { ExpenseService } from "../services"

async function createService(c: Context<{ Bindings: Env }>) {
  const prisma = await getPrisma(c.env.DATABASE_URL, c.env.USE_NEON_ADAPTER === "true")
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

function getPagination(c: Context) {
  const page = parseInt(c.req.query("page") ?? "") || undefined
  const limit = parseInt(c.req.query("limit") ?? "") || undefined
  return paginate(page, limit)
}

type CreateBody = {
  name: string
  expenseDate: string
  amount: number
}

type UpdateBody = Partial<CreateBody>

export async function index(c: Context<{ Bindings: Env }>) {
  const pagination = getPagination(c)
  const result = await (await createService(c)).list(pagination)
  return c.json({
    status: "success",
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  })
}

export async function show(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({ error: "ID is required" }, 400)

  try {
    const expense = await (await createService(c)).get(id)
    return c.json({
      status: "success",
      data: expense,
    })
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
  return c.json({
    status: "success",
    data: expense,
  }, 201)
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
    return c.json({
      status: "success",
      data: expense,
    })
  } catch (e) {
    if (e instanceof Error && e.message === "Expense not found") {
      return c.json({ error: "Expense not found" }, 404)
    }
    throw e
  }
}

export async function destroy(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({ error: "ID is required" }, 400)

  try {
    const expense = await (await createService(c)).remove(id)
    return c.json({
      status: "success",
      data: expense,
    })
  } catch (e) {
    if (e instanceof Error && e.message === "Expense not found") {
      return c.json({ error: "Expense not found" }, 404)
    }
    throw e
  }
}
