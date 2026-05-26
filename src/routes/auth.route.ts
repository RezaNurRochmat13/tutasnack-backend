import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "../config/env"
import * as AuthController from "../controllers/auth.controller"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authRoute = new Hono<{ Bindings: Env }>()

authRoute.post("/register", zValidator("json", registerSchema), AuthController.register)
authRoute.post("/login", zValidator("json", loginSchema), AuthController.login)
