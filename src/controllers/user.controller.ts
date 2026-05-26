import type { Context } from "hono"
import type { Env } from "../config/env"
import { getPrisma } from "../db/prisma"
import { UserRepository } from "../repositories"
import type { CreateUserInput } from "../repositories"
import { UserService } from "../services"

type CreateUserBody = CreateUserInput
type UpdateUserBody = Partial<CreateUserInput>

function createUserService(c: Context<{ Bindings: Env }>) {
  const prisma = getPrisma(c.env.DATABASE_URL)
  const repo = new UserRepository(prisma)
  return new UserService(repo)
}

function getUserId(c: Context) {
  const id = c.req.param("id")
  if (!id) return null
  return id
}

function getJsonBody<T>(c: Context): T {
  return (c.req as any).valid("json") as T
}

export async function listUsers(c: Context<{ Bindings: Env }>) {
  const users = await createUserService(c).list()
  return c.json(users)
}

export async function getUser(c: Context<{ Bindings: Env }>) {
  const id = getUserId(c)
  if (!id) return c.json({ error: "Missing id" }, 400)

  try {
    const user = await createUserService(c).get(id)
    return c.json(user)
  } catch (e) {
    if (e instanceof Error && e.message === "User not found") {
      return c.json({ error: "User not found" }, 404)
    }
    throw e
  }
}

export async function createUser(c: Context<{ Bindings: Env }>) {
  try {
    const body = getJsonBody<CreateUserBody>(c)
    const user = await createUserService(c).create(body)
    return c.json(user, 201)
  } catch (e) {
    if (e instanceof Error && e.message === "Email already exists") {
      return c.json({ error: "Email already exists" }, 409)
    }
    throw e
  }
}

export async function updateUser(c: Context<{ Bindings: Env }>) {
  const id = getUserId(c)
  if (!id) return c.json({ error: "Missing id" }, 400)

  try {
    const body = getJsonBody<UpdateUserBody>(c)
    const user = await createUserService(c).update(id, body)
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
  if (!id) return c.json({ error: "Missing id" }, 400)

  try {
    const user = await createUserService(c).remove(id)
    return c.json(user)
  } catch (e) {
    if (e instanceof Error && e.message === "User not found") {
      return c.json({ error: "User not found" }, 404)
    }
    throw e
  }
}
