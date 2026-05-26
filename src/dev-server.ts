import { serve } from "@hono/node-server"
import { Hono } from "hono"
import type { Env } from "./config/env"
import { registerRoutes } from "./routes"

const app = new Hono<{ Bindings: Env }>()

registerRoutes(app)

const handler = (request: Request) => {
  const env: Env = {
    DATABASE_URL: process.env.DATABASE_URL || "",
    DIRECT_URL: process.env.DIRECT_URL,
    JWT_SECRET: process.env.JWT_SECRET || "",
    NODE_ENV: process.env.NODE_ENV || "development",
  }
  return app.fetch(request, env)
}

const port = Number(process.env.PORT) || 3000

serve({ fetch: handler, port })

console.log(`Dev server running on http://localhost:${port}`)
