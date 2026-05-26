import { Hono } from "hono"
import type { Env } from "../config/env"
import { userRoute } from "./user.route"
import { authRoute } from "./auth.route"

export function registerRoutes(app: Hono<{ Bindings: Env }>) {
  app.route("/users", userRoute)
  app.route("/auth", authRoute)
}
