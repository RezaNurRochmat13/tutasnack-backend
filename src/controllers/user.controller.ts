import type { Context } from "hono"
import type { Env } from "../config/env"
import { getPrisma } from "../db/prisma"
import { UserRepository } from "../repositories"
import type { CreateUserInput } from "../repositories"
import { UserService } from "../services"

type CreateUserBody = CreateUserInput
type UpdateUserBody = Partial<CreateUserInput>

async function createUserService(c: Context<{ Bindings: Env }>) {
  const prisma = await getPrisma(c.env.DATABASE_URL, c.env.USE_NEON_ADAPTER === "true")
  const repo = new UserRepository(prisma)
  return new UserService(repo)
}

function getUserId(c: Context) {
  const id = c.req.param("id")
  if (!id) return null
  return id
}

export async function listUsers(c: Context<{ Bindings: Env }>) {
  const users = await (await createUserService(c)).list()
  return c.json(users)
}

export async function getUser(c: Context<{ Bindings: Env }>) {
  const id = getUserId(c)
  if (!id) return c.json({ error: "ID is required" }, 400)

  try {
    const user = await (await createUserService(c)).get(id)
    return c.json(user)
  } catch (e) {
    if (e instanceof Error && e.message === "User not found") {
      return c.json({ error: "User not found" }, 404)
    }
    throw e
  }
}

export async function createUser(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json() as CreateUserBody
  const user = await (await createUserService(c)).create(body)
  return c.json(user, 201)
}

export async function updateUser(c: Context<{ Bindings: Env }>) {
  const id = getUserId(c)
  if (!id) return c.json({ error: "ID is required" }, 400)

  const body = await c.req.json() as UpdateUserBody
  try {
    const user = await (await createUserService(c)).update(id, body)
    return c.json(user)
  } catch (e) {
    if (e instanceof Error && e.message === "User not found") {
      return c.json({ error: "User not found" }, 404)
    }
    throw e
  }
}

export async function deleteUser(c: Context<{ Bindings: Env }>) {
  const id = getUserId(c)
  if (!id) return c.json({ error: "ID is required" }, 400)

  try {
    const user = await (await createUserService(c)).remove(id)
    return c.json(user)
  } catch (e) {
    if (e instanceof Error && e.message === "User not found") {
      return c.json({ error: "User not found" }, 404)
    }
    throw e
  }
}
