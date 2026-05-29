import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "../config/env"
import * as SalesIncomeController from "../controllers/sales-income.controller"

const createSchema = z.object({
  storeId: z.string().uuid(),
  salesDate: z.string().datetime({ offset: true }).or(z.string().date()),
  amount: z.number().positive(),
})

const updateSchema = z.object({
  storeId: z.string().uuid().optional(),
  salesDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  amount: z.number().positive().optional(),
})

const querySchema = z.object({
  storeId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
})

export const salesIncomeRoute = new Hono<{ Bindings: Env }>()

salesIncomeRoute.get("/", zValidator("query", querySchema), SalesIncomeController.index)
salesIncomeRoute.get("/:id", SalesIncomeController.show)
salesIncomeRoute.post("/", zValidator("json", createSchema), SalesIncomeController.create)
salesIncomeRoute.put("/:id", zValidator("json", updateSchema), SalesIncomeController.update)
salesIncomeRoute.delete("/:id", SalesIncomeController.destroy)
