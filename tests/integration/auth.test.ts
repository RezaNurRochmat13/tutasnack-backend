import { createTestApp } from "../helpers/app"
import { getPrisma } from "../../src/db/prisma"

const BASE_URL = "http://localhost"
const dbUrl = process.env.DATABASE_URL || ""
const jwtSecret = process.env.JWT_SECRET || ""

const bindings = {
  DATABASE_URL: dbUrl,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: jwtSecret,
}

async function cleanDb() {
  const prisma = getPrisma(dbUrl)
  await prisma.user.deleteMany()
}

describe("Auth API", () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
    await cleanDb()
  })

  afterEach(async () => {
    await cleanDb()
  })

  describe("POST /auth/register", () => {
    it("should return 201 and token for valid input", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@test.com",
            password: "password123",
            name: "Test",
          }),
        }),
        bindings,
      )

      expect(res.status).toBe(201)
      const body: any = await res.json()
      expect(body.token).toEqual(expect.any(String))
      expect(body.user.email).toBe("test@test.com")
      expect(body.user.name).toBe("Test")
    })

    it("should return 409 for duplicate email", async () => {
      await app.fetch(
        new Request(`${BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "dup@test.com",
            password: "password123",
          }),
        }),
        bindings,
      )

      const res = await app.fetch(
        new Request(`${BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "dup@test.com",
            password: "password123",
          }),
        }),
        bindings,
      )

      expect(res.status).toBe(409)
      const body: any = await res.json()
      expect(body.error).toBe("Email already registered")
    })

    it("should return 400 for invalid input", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "not-an-email",
            password: "12",
          }),
        }),
        bindings,
      )

      expect(res.status).toBe(400)
    })
  })

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      await app.fetch(
        new Request(`${BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "login@test.com",
            password: "password123",
            name: "Login User",
          }),
        }),
        bindings,
      )
    })

    it("should return 200 and token for valid credentials", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "login@test.com",
            password: "password123",
          }),
        }),
        bindings,
      )

      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.token).toEqual(expect.any(String))
      expect(body.user.email).toBe("login@test.com")
      expect(body.user.name).toBe("Login User")
    })

    it("should return 401 for wrong password", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "login@test.com",
            password: "wrong-password",
          }),
        }),
        bindings,
      )

      expect(res.status).toBe(401)
      const body: any = await res.json()
      expect(body.error).toBe("Invalid email or password")
    })

    it("should return 401 for non-existent email", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "nobody@test.com",
            password: "password123",
          }),
        }),
        bindings,
      )

      expect(res.status).toBe(401)
      const body: any = await res.json()
      expect(body.error).toBe("Invalid email or password")
    })
  })
})
