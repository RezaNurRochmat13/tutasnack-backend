import { Hono } from "hono"
import type { Env } from "../config/env"
import { userRoute } from "./user.route"
import { authRoute } from "./auth.route"
import { storeRoute } from "./store.route"
import { salesIncomeRoute } from "./sales-income.route"
import { expenseRoute } from "./expense.route"
import { salesTrackerRoute } from "./sales-tracker.route"
import { docsRoute } from "../docs"

export function registerRoutes(app: Hono<{ Bindings: Env }>) {
  app.route("/api/users", userRoute)
  app.route("/api/auth", authRoute)
  app.route("/api/stores", storeRoute)
  app.route("/api/sales-income", salesIncomeRoute)
  app.route("/api/expenses", expenseRoute)
  app.route("/api/sales-tracker", salesTrackerRoute)
  app.route("/docs", docsRoute)
}
