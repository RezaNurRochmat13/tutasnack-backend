import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "../config/env"
import * as SalesTrackerController from "../controllers/sales-tracker.controller"

const createSchema = z.object({
  storeId: z.string().uuid(),
  salesDate: z.string().datetime({ offset: true }).or(z.string().date()),
  saleCount: z.number().int().min(0),
  soldCount: z.number().int().min(0),
})

const updateSchema = z.object({
  storeId: z.string().uuid().optional(),
  salesDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  saleCount: z.number().int().min(0).optional(),
  soldCount: z.number().int().min(0).optional(),
})

export const salesTrackerRoute = new Hono<{ Bindings: Env }>()

salesTrackerRoute.get("/", SalesTrackerController.list)
salesTrackerRoute.get("/:id", SalesTrackerController.get)
salesTrackerRoute.post("/", zValidator("json", createSchema), SalesTrackerController.create)
salesTrackerRoute.put("/:id", zValidator("json", updateSchema), SalesTrackerController.update)
salesTrackerRoute.delete("/:id", SalesTrackerController.remove)
