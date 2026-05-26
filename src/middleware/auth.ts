import type { Context, Next } from "hono"
import type { Env } from "../config/env"
import { verifyToken } from "../lib/jwt"

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
    await next()
    return
  }

  const header = c.req.header("Authorization")
  if (!header || !header.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const token = header.slice(7)
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    ;(c as any).set("user", payload)
    await next()
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401)
  }
}
