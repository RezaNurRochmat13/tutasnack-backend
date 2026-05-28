import type { Context } from "hono"
import type { Env } from "../config/env"
import { getPrisma } from "../db/prisma"
import { StoreRepository } from "../repositories"
import { StoreService } from "../services"

async function createService(c: Context<{ Bindings: Env }>) {
  const prisma = await getPrisma(c.env.DATABASE_URL, c.env.USE_NEON_ADAPTER === "true")
  return new StoreService(new StoreRepository(prisma))
}

function getJsonBody<T>(c: Context): T {
  return (c.req as any).valid("json") as T
}

function getId(c: Context) {
  const id = c.req.param("id")
  if (!id) return null
  return id
}

export async function index(c: Context<{ Bindings: Env }>) {
  const stores = await (await createService(c)).list()
  return c.json({
    status: "success",
    data: stores,
  })
}

export async function show(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({
    status: "error",
    message: "ID is required"
  }, 400)

  try {
    const store = await (await createService(c)).get(id)
    return c.json({
      status: "success",
      data: store,
    })
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

export async function create(c: Context<{ Bindings: Env }>) {
  const body = getJsonBody<{ name: string; description?: string; address?: string }>(c)
  const store = await (await createService(c)).create(body)
  return c.json({
    status: "success",
    data: store,
  }, 201)
}

export async function update(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({
    status: "error",
    message: "ID is required"
  }, 400)

  const body = getJsonBody<{ name?: string; description?: string; address?: string }>(c)
  try {
    const store = await (await createService(c)).update(id, body)
    return c.json({
      status: "success",
      data: store,
    })
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

export async function destroy(c: Context<{ Bindings: Env }>) {
  const id = getId(c)
  if (!id) return c.json({
    status: "error",
    message: "ID is required"
  }, 400)

  try {
    const store = await (await createService(c)).remove(id)
    return c.json({
      status: "success",
      data: store,
    })
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
