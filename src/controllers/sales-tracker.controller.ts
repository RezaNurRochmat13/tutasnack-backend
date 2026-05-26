import type { Context } from "hono"
import type { Env } from "../config/env"
import { getPrisma } from "../db/prisma"
import { SalesTrackerRepository, StoreRepository } from "../repositories"
import { SalesTrackerService } from "../services"

function createService(c: Context<{ Bindings: Env }>) {
  const prisma = getPrisma(c.env.DATABASE_URL)
  return new SalesTrackerService(
    new SalesTrackerRepository(prisma),
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

export async function list(c: Context<{ Bindings: Env }>) {
  const storeId = c.req.query("store_id") || c.req.query("storeId")
  const records = await createService(c).list(storeId)
  return c.json(records)
}

export async function get(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({ error: "Missing id" }, 400)
  try {
    const record = await createService(c).get(id)
    return c.json(record)
  } catch (e) {
    if (e instanceof Error && e.message === "Sales tracker not found") {
      return c.json({ error: "Sales tracker not found" }, 404)
    }
    throw e
  }
}

export async function create(c: Context<{ Bindings: Env }>) {
  try {
    const body = getJsonBody<{
      storeId: string
      salesDate: string
      saleCount: number
      soldCount: number
    }>(c)
    const record = await createService(c).create({
      storeId: body.storeId,
      salesDate: new Date(body.salesDate),
      saleCount: body.saleCount,
      soldCount: body.soldCount,
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
  if (!id) return c.json({ error: "Missing id" }, 400)
  try {
    const body = getJsonBody<{
      storeId?: string
      salesDate?: string
      saleCount?: number
      soldCount?: number
    }>(c)
    const record = await createService(c).update(id, {
      ...body,
      salesDate: body.salesDate ? new Date(body.salesDate) : undefined,
    })
    return c.json(record)
  } catch (e) {
    if (e instanceof Error && e.message === "Sales tracker not found") {
      return c.json({ error: "Sales tracker not found" }, 404)
    }
    throw e
  }
}

export async function remove(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({ error: "Missing id" }, 400)
  try {
    const record = await createService(c).remove(id)
    return c.json(record)
  } catch (e) {
    if (e instanceof Error && e.message === "Sales tracker not found") {
      return c.json({ error: "Sales tracker not found" }, 404)
    }
    throw e
  }
}
