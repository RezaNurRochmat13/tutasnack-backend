import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "../config/env"
import * as StoreController from "../controllers/store.controller"

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().optional(),
})

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
})

export const storeRoute = new Hono<{ Bindings: Env }>()

storeRoute.get("/", StoreController.index)
storeRoute.get("/:id", StoreController.show)
storeRoute.post("/", zValidator("json", createSchema), StoreController.create)
storeRoute.put("/:id", zValidator("json", updateSchema), StoreController.update)
storeRoute.delete("/:id", StoreController.destroy)
