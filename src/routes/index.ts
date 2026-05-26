import { Hono } from "hono"
import type { Env } from "../config/env"
import { userRoute } from "./user.route"
import { authRoute } from "./auth.route"
import { storeRoute } from "./store.route"
import { salesIncomeRoute } from "./sales-income.route"
import { expenseRoute } from "./expense.route"
import { salesTrackerRoute } from "./sales-tracker.route"

export function registerRoutes(app: Hono<{ Bindings: Env }>) {
  app.route("/users", userRoute)
  app.route("/auth", authRoute)
  app.route("/stores", storeRoute)
  app.route("/sales-income", salesIncomeRoute)
  app.route("/expenses", expenseRoute)
  app.route("/sales-tracker", salesTrackerRoute)
}
