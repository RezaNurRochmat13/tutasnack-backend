import type { Context } from "hono"
import type { Env } from "../config/env"
import { getPrisma } from "../db/prisma"
import { SalesIncomeRepository, StoreRepository } from "../repositories"
import { SalesIncomeService } from "../services"

async function createService(c: Context<{ Bindings: Env }>) {
  const prisma = await getPrisma(c.env.DATABASE_URL, c.env.USE_NEON_ADAPTER === "true")
  return new SalesIncomeService(
    new SalesIncomeRepository(prisma),
    new StoreRepository(prisma),
  )
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
  storeId: string
  salesDate: string
  amount: number
}

type UpdateBody = Partial<CreateBody>

export async function list(c: Context<{ Bindings: Env }>) {
  const storeId = c.req.query("store_id") || c.req.query("storeId")
  const records = await (await createService(c)).list(storeId)
  return c.json(records)
}

export async function get(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({ error: "ID is required" }, 400)

  try {
    const record = await (await createService(c)).get(id)
    return c.json(record)
  } catch (e) {
    if (e instanceof Error && e.message === "Sales income not found") {
      return c.json({ error: "Sales income not found" }, 404)
    }
    throw e
  }
}

export async function create(c: Context<{ Bindings: Env }>) {
  const body = getJsonBody<CreateBody>(c)
  try {
    const record = await (await createService(c)).create({
      storeId: body.storeId,
      salesDate: new Date(body.salesDate),
      amount: body.amount,
    })
    return c.json(record, 201)
  } catch (e) {
    if (e instanceof Error && e.message === "Store not found") {
      return c.json({ error: "Store not found" }, 404)
    }
    throw e
  }
}

export async function update(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({ error: "ID is required" }, 400)

  const body = getJsonBody<UpdateBody>(c)
  const data: any = {}
  if (body.salesDate !== undefined) data.salesDate = new Date(body.salesDate)
  if (body.amount !== undefined) data.amount = body.amount

  try {
    const record = await (await createService(c)).update(id, data)
    return c.json(record)
  } catch (e) {
    if (e instanceof Error && e.message === "Sales income not found") {
      return c.json({ error: "Sales income not found" }, 404)
    }
    throw e
  }
}

export async function remove(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({ error: "ID is required" }, 400)

  try {
    const record = await (await createService(c)).remove(id)
    return c.json(record)
  } catch (e) {
    if (e instanceof Error && e.message === "Sales income not found") {
      return c.json({ error: "Sales income not found" }, 404)
    }
    throw e
  }
}
