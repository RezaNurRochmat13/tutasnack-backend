import type { Context } from "hono"
import type { Env } from "../config/env"
import { getPrisma } from "../db/prisma"
import { paginate } from "../lib/pagination"
import { SalesTrackerRepository, StoreRepository } from "../repositories"
import { SalesTrackerService } from "../services"

async function createService(c: Context<{ Bindings: Env }>) {
  const prisma = await getPrisma(c.env.DATABASE_URL, c.env.USE_NEON_ADAPTER === "true")
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

function getPagination(c: Context) {
  const page = parseInt(c.req.query("page") ?? "") || undefined
  const limit = parseInt(c.req.query("limit") ?? "") || undefined
  return paginate(page, limit)
}

type CreateBody = {
  storeId: string
  salesDate: string
  saleCount: number
  soldCount: number
}

type UpdateBody = Partial<CreateBody>

export async function index(c: Context<{ Bindings: Env }>) {
  const storeId = c.req.query("store_id") || c.req.query("storeId")
  const pagination = getPagination(c)
  const result = await (await createService(c)).list(storeId, pagination)
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
    const record = await (await createService(c)).get(id)
    return c.json({
      status: "success",
      data: record,
    })
  } catch (e) {
    if (e instanceof Error && e.message === "Sales tracker not found") {
      return c.json({
        status: "error",
        message: "Sales tracker not found"
      }, 404)
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
      saleCount: body.saleCount,
      soldCount: body.soldCount,
    })
    return c.json({
      status: "success",
      data: record,
    }, 201)
  } catch (e) {
    if (e instanceof Error && e.message === "Store not found") {
      return c.json({
        status: "error",
        message: "Store not found"
      }, 404)
    }
    throw e
  }
}

export async function update(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({
    status: "error",
    message: "ID is required"
  }, 400)

  const body = getJsonBody<UpdateBody>(c)
  const data: any = {}
  if (body.salesDate !== undefined) data.salesDate = new Date(body.salesDate)
  if (body.saleCount !== undefined) data.saleCount = body.saleCount
  if (body.soldCount !== undefined) data.soldCount = body.soldCount

  try {
    const record = await (await createService(c)).update(id, data)
    return c.json({
      status: "success",
      data: record,
    })
  } catch (e) {
    if (e instanceof Error && e.message === "Sales tracker not found") {
      return c.json({
        status: "error",
        message: "Sales tracker not found"
      }, 404)
    }
    throw e
  }
}

export async function destroy(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({
    status: "error",
    message: "ID is required"
  }, 400)

  try {
    const record = await (await createService(c)).remove(id)
    return c.json({
      status: "success",
      data: record,
    })
  } catch (e) {
    if (e instanceof Error && e.message === "Sales tracker not found") {
      return c.json({
        status: "error",
        message: "Sales tracker not found"
      }, 404)
    }
    throw e
  }
}
