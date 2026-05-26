import { Hono } from "hono"
import type { Env } from "../config/env"
import { userRoute } from "./user.route"

export function registerRoutes(app: Hono<{ Bindings: Env }>) {
  app.route("/users", userRoute)
}
