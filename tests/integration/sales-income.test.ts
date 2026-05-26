import { createTestApp } from "../helpers/app"
import { createDbHelper } from "../helpers/db"

const BASE_URL = "http://localhost"
const dbUrl = process.env.DATABASE_URL || ""
const bindings = {
  DATABASE_URL: dbUrl,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: process.env.JWT_SECRET || "",
}

async function createStore(app: ReturnType<typeof createTestApp>): Promise<string> {
  const res = await app.fetch(
    new Request(`${BASE_URL}/stores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Store" }),
    }),
    bindings,
  )
  const { id } = await res.json()
  return id
}

describe("Sales Income API", () => {
  let app: ReturnType<typeof createTestApp>
  let storeId: string

  beforeAll(async () => {
    app = createTestApp()
    await createDbHelper(dbUrl).cleanAll()
  })

  beforeEach(async () => {
    await createDbHelper(dbUrl).cleanAll()
    storeId = await createStore(app)
  })

  describe("POST /sales-income", () => {
    it("should create a sales income record", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/sales-income`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId,
            salesDate: "2024-06-15",
            amount: 100000,
          }),
        }),
        bindings,
      )
      expect(res.status).toBe(201)
      const body: any = await res.json()
      expect(body.amount).toBe(100000)
      expect(body.storeId).toBe(storeId)
    })

    it("should return 404 for non-existent store", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/sales-income`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: "00000000-0000-0000-0000-000000000000",
            salesDate: "2024-06-15",
            amount: 50000,
          }),
        }),
        bindings,
      )
      expect(res.status).toBe(404)
    })
  })

  describe("GET /sales-income", () => {
    it("should list all records", async () => {
      await app.fetch(
        new Request(`${BASE_URL}/sales-income`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, salesDate: "2024-06-15", amount: 50000 }),
        }),
        bindings,
      )

      const res = await app.fetch(new Request(`${BASE_URL}/sales-income`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.length).toBe(1)
    })

    it("should filter by storeId", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/sales-income?storeId=${storeId}`),
        bindings,
      )
      expect(res.status).toBe(200)
    })
  })

  describe("GET /sales-income/:id", () => {
    it("should return record by id", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/sales-income`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, salesDate: "2024-06-15", amount: 75000 }),
        }),
        bindings,
      )
      const { id } = await create.json()

      const res = await app.fetch(new Request(`${BASE_URL}/sales-income/${id}`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.amount).toBe(75000)
    })

    it("should return 404 for missing record", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/sales-income/00000000-0000-0000-0000-000000000000`),
        bindings,
      )
      expect(res.status).toBe(404)
    })
  })

  describe("DELETE /sales-income/:id", () => {
    it("should delete a record", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/sales-income`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, salesDate: "2024-06-15", amount: 50000 }),
        }),
        bindings,
      )
      const { id } = await create.json()

      const del = await app.fetch(
        new Request(`${BASE_URL}/sales-income/${id}`, { method: "DELETE" }),
        bindings,
      )
      expect(del.status).toBe(200)

      const get = await app.fetch(
        new Request(`${BASE_URL}/sales-income/${id}`),
        bindings,
      )
      expect(get.status).toBe(404)
    })
  })
})
