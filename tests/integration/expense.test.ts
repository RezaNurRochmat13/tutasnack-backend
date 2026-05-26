import { createTestApp } from "../helpers/app"
import { createDbHelper } from "../helpers/db"

const BASE_URL = "http://localhost"
const dbUrl = process.env.DATABASE_URL || ""
const bindings = {
  DATABASE_URL: dbUrl,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: process.env.JWT_SECRET || "",
}

describe("Expense API", () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
    await createDbHelper(dbUrl).cleanAll()
  })

  afterEach(async () => {
    await createDbHelper(dbUrl).cleanAll()
  })

  describe("POST /expenses", () => {
    it("should create an expense", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Beli bahan baku",
            expenseDate: "2024-06-15",
            amount: 50000,
          }),
        }),
        bindings,
      )
      expect(res.status).toBe(201)
      const body: any = await res.json()
      expect(body.name).toBe("Beli bahan baku")
      expect(body.amount).toBe(50000)
    })

    it("should return 400 if name is missing", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expenseDate: "2024-06-15", amount: 50000 }),
        }),
        bindings,
      )
      expect(res.status).toBe(400)
    })
  })

  describe("GET /expenses", () => {
    it("should list all expenses", async () => {
      await app.fetch(
        new Request(`${BASE_URL}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Expense 1", expenseDate: "2024-06-15", amount: 10000 }),
        }),
        bindings,
      )

      const res = await app.fetch(new Request(`${BASE_URL}/expenses`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.length).toBe(1)
    })
  })

  describe("GET /expenses/:id", () => {
    it("should return expense by id", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test", expenseDate: "2024-06-15", amount: 25000 }),
        }),
        bindings,
      )
      const { id } = await create.json()

      const res = await app.fetch(new Request(`${BASE_URL}/expenses/${id}`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.name).toBe("Test")
    })

    it("should return 404 for missing expense", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/expenses/00000000-0000-0000-0000-000000000000`),
        bindings,
      )
      expect(res.status).toBe(404)
    })
  })

  describe("PUT /expenses/:id", () => {
    it("should update an expense", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Old", expenseDate: "2024-06-15", amount: 10000 }),
        }),
        bindings,
      )
      const { id } = await create.json()

      const res = await app.fetch(
        new Request(`${BASE_URL}/expenses/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 99999 }),
        }),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.amount).toBe(99999)
    })
  })

  describe("DELETE /expenses/:id", () => {
    it("should delete an expense", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "To Delete", expenseDate: "2024-06-15", amount: 5000 }),
        }),
        bindings,
      )
      const { id } = await create.json()

      const del = await app.fetch(
        new Request(`${BASE_URL}/expenses/${id}`, { method: "DELETE" }),
        bindings,
      )
      expect(del.status).toBe(200)

      const get = await app.fetch(
        new Request(`${BASE_URL}/expenses/${id}`),
        bindings,
      )
      expect(get.status).toBe(404)
    })
  })
})
