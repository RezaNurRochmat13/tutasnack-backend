import { Hono } from "hono"
import type { Env } from "../config/env"
import { userRoute } from "./user.route"
import { authRoute } from "./auth.route"
import { storeRoute } from "./store.route"
import { salesIncomeRoute } from "./sales-income.route"
import { expenseRoute } from "./expense.route"
import { salesTrackerRoute } from "./sales-tracker.route"
import { dashboardRoute } from "./dashboard.route"
import { docsRoute } from "../docs"
import { authMiddleware } from "../middleware/auth"

export function registerRoutes(app: Hono<{ Bindings: Env }>) {
  app.use("/api/users/*", authMiddleware)
  app.use("/api/stores/*", authMiddleware)
  app.use("/api/sales-income/*", authMiddleware)
  app.use("/api/expenses/*", authMiddleware)
  app.use("/api/sales-tracker/*", authMiddleware)
  app.use("/api/dashboard/*", authMiddleware)

  app.route("/api/users", userRoute)
  app.route("/api/auth", authRoute)
  app.route("/api/stores", storeRoute)
  app.route("/api/sales-income", salesIncomeRoute)
  app.route("/api/expenses", expenseRoute)
  app.route("/api/sales-tracker", salesTrackerRoute)
  app.route("/api/dashboard", dashboardRoute)
  app.route("/docs", docsRoute)
}
