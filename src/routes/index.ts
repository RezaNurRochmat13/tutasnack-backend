import { Hono } from "hono"
import type { Env } from "../config/env"
import { userRoute } from "./user.route"
import { authRoute } from "./auth.route"
import { storeRoute } from "./store.route"
import { salesIncomeRoute } from "./sales-income.route"
import { expenseRoute } from "./expense.route"
import { salesTrackerRoute } from "./sales-tracker.route"
import { docsRoute } from "../docs"
import { authMiddleware, type Variables } from "../middleware/auth"

type AppEnv = { Bindings: Env; Variables: Variables }

const protectedApi = new Hono<AppEnv>()
protectedApi.use("*", authMiddleware)
protectedApi.route("/users", userRoute)
protectedApi.route("/stores", storeRoute)
protectedApi.route("/sales-income", salesIncomeRoute)
protectedApi.route("/expenses", expenseRoute)
protectedApi.route("/sales-tracker", salesTrackerRoute)

export function registerRoutes(app: Hono<{ Bindings: Env }>) {
  app.route("/api/auth", authRoute)
  app.route("/api", protectedApi)
  app.route("/docs", docsRoute)
}
