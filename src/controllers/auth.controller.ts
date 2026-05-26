import type { Context } from "hono"
import type { Env } from "../config/env"
import { getPrisma } from "../db/prisma"
import { UserRepository } from "../repositories"
import { AuthService } from "../services"

async function createAuthService(c: Context<{ Bindings: Env }>) {
  const prisma = await getPrisma(c.env.DATABASE_URL)
  const repo = new UserRepository(prisma)
  return new AuthService(repo, c.env.JWT_SECRET)
}

function getJsonBody<T>(c: Context): T {
  return (c.req as any).valid("json") as T
}

type RegisterBody = {
  email: string
  password: string
  name?: string
}

type LoginBody = {
  email: string
  password: string
}

export async function register(c: Context<{ Bindings: Env }>) {
  try {
    const body = getJsonBody<RegisterBody>(c)
    const result = await (await createAuthService(c)).register(body)
    return c.json(result, 201)
  } catch (e) {
    if (e instanceof Error && e.message === "Email already registered") {
      return c.json({ error: "Email already registered" }, 409)
    }
    throw e
  }
}

export async function login(c: Context<{ Bindings: Env }>) {
  try {
    const body = getJsonBody<LoginBody>(c)
    const result = await (await createAuthService(c)).login(body)
    return c.json(result)
  } catch (e) {
    if (e instanceof Error && e.message === "Invalid email or password") {
      return c.json({ error: "Invalid email or password" }, 401)
    }
    throw e
  }
}
