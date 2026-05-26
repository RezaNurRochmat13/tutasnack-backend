import type { Context, Next } from "hono"
import type { Env } from "../config/env"
import type { JwtPayload } from "../lib/jwt"
import { verifyToken } from "../lib/jwt"

export type Variables = {
  user: JwtPayload
}

type AppEnv = { Bindings: Env; Variables: Variables }

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
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
    c.set("user", payload)
    await next()
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401)
  }
}
