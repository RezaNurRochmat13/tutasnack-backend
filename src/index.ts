import { Hono } from "hono"
import type { Env } from "./config/env"
import { registerRoutes } from "./routes"

const app = new Hono<{ Bindings: Env }>()

app.get("/", (c) => c.json({ message: "TutaSnack API", version: "1.0.0" }))

registerRoutes(app)

export default app
