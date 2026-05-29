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

const querySchema = z.object({
  storeId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
})

export const salesTrackerRoute = new Hono<{ Bindings: Env }>()

salesTrackerRoute.get("/", zValidator("query", querySchema), SalesTrackerController.index)
salesTrackerRoute.get("/:id", SalesTrackerController.show)
salesTrackerRoute.post("/", zValidator("json", createSchema), SalesTrackerController.create)
salesTrackerRoute.put("/:id", zValidator("json", updateSchema), SalesTrackerController.update)
salesTrackerRoute.delete("/:id", SalesTrackerController.destroy)
