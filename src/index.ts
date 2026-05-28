import { Hono } from "hono"
import { cors } from "hono/cors"
import type { Env } from "./config/env"
import { registerRoutes } from "./routes"

const app = new Hono<{ Bindings: Env }>()

app.use("/*", cors())

app.get("/", (c) => c.json({ message: "TutaSnack API", version: "1.0.0" }))

registerRoutes(app)

export default app
