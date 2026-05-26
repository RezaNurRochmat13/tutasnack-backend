import { sign, verify } from "hono/jwt"
import type { User } from "@prisma/client"

export type JwtPayload = {
  sub: string
  email: string
  exp: number
}

export async function signToken(
  user: User,
  secret: string,
): Promise<string> {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  }
  return sign(payload, secret)
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<JwtPayload> {
  return verify(token, secret, "HS256") as Promise<JwtPayload>
}
