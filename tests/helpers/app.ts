import { Hono } from "hono"
import type { Env } from "../../src/config/env"
import { registerRoutes } from "../../src/routes"

export function createTestApp(): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>()
  registerRoutes(app)
  return app
}
