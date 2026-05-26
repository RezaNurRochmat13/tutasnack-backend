import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "../config/env"
import { getPrisma } from "../db/prisma"
import { UserRepository } from "../repositories"
import { UserService } from "../services"

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
})

function createUserService(dbUrl: string) {
  const prisma = getPrisma(dbUrl)
  const repo = new UserRepository(prisma)
  return new UserService(repo)
}

export const userRoute = new Hono<{ Bindings: Env }>()

userRoute.get("/", async (c) => {
  const users = await createUserService(c.env.DATABASE_URL).list()
  return c.json(users)
})

userRoute.get("/:id", async (c) => {
  const user = await createUserService(c.env.DATABASE_URL).get(c.req.param("id"))
  return c.json(user)
})

userRoute.post("/", zValidator("json", createUserSchema), async (c) => {
  const body = c.req.valid("json")
  const user = await createUserService(c.env.DATABASE_URL).create(body)
  return c.json(user, 201)
})

userRoute.put("/:id", zValidator("json", updateUserSchema), async (c) => {
  const body = c.req.valid("json")
  const user = await createUserService(c.env.DATABASE_URL).update(c.req.param("id"), body)
  return c.json(user)
})

userRoute.delete("/:id", async (c) => {
  const user = await createUserService(c.env.DATABASE_URL).remove(c.req.param("id"))
  return c.json(user)
})
