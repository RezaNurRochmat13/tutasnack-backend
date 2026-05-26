import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "../config/env"
import * as UserController from "../controllers/user.controller"

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
})

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
})

export const userRoute = new Hono<{ Bindings: Env }>()

userRoute.get("/", UserController.listUsers)
userRoute.get("/:id", UserController.getUser)
userRoute.post("/", zValidator("json", createUserSchema), UserController.createUser)
userRoute.put("/:id", zValidator("json", updateUserSchema), UserController.updateUser)
userRoute.delete("/:id", UserController.deleteUser)
