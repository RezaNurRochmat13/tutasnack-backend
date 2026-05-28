import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "../config/env"
import * as ExpenseController from "../controllers/expense.controller"

const createSchema = z.object({
  name: z.string().min(1),
  expenseDate: z.string().datetime({ offset: true }).or(z.string().date()),
  amount: z.number().positive(),
})

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  expenseDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  amount: z.number().positive().optional(),
})

export const expenseRoute = new Hono<{ Bindings: Env }>()

expenseRoute.get("/", ExpenseController.index)
expenseRoute.get("/:id", ExpenseController.show)
expenseRoute.post("/", zValidator("json", createSchema), ExpenseController.create)
expenseRoute.put("/:id", zValidator("json", updateSchema), ExpenseController.update)
expenseRoute.delete("/:id", ExpenseController.destroy)
