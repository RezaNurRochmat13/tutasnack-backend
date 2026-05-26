import { Hono } from "hono"
import { swaggerUI } from "@hono/swagger-ui"
import type { Env } from "../config/env"
import { spec } from "./spec"

export const docsRoute = new Hono<{ Bindings: Env }>()

docsRoute.get("/spec", (c) => {
  const apiSpec = {
    ...spec,
    paths: Object.fromEntries(
      Object.entries(spec.paths).map(([path, methods]) => [
        `/api${path}`,
        methods,
      ]),
    ),
  }
  return c.json(apiSpec)
})

docsRoute.get("/", swaggerUI({ url: "/docs/spec" }))
